import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { invalidateEmailCache, invalidateHackathonTeamCache } from '@/lib/redis';
import { setSessionCookie } from '@/lib/session-cookie';

export const runtime = 'edge';

/**
 * PATCH /api/user/profile
 * Allows authenticated user to update their official Full Name, Institution, and Phone.
 * Cascades:
 * 1. public.allowed_emails, team_members, hackathon_teams (for name)
 * 2. public.registrations (upserts name, institution, phone)
 * 3. public.festival_pass_claims (institution & contact_phone so pass badges stay synchronized)
 * 4. public.certificate_payment_submissions (institution & contact_phone)
 * 5. Session cookie and Redis cache
 */
export async function PATCH(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const rawFullName = body?.fullName;
    const rawInstitution = body?.institution;
    const rawPhone = body?.phone;

    if (rawFullName === undefined && rawInstitution === undefined && rawPhone === undefined) {
      return NextResponse.json({ error: 'At least one profile field must be provided to update.' }, { status: 400 });
    }

    const email = session.email.trim().toLowerCase();
    let cleanFullName: string | undefined = undefined;
    let cleanInstitution: string | undefined = undefined;
    let cleanPhone: string | undefined = undefined;

    if (typeof rawFullName === 'string') {
      cleanFullName = rawFullName.trim().replace(/\s+/g, ' ');
      if (cleanFullName.length < 2) {
        return NextResponse.json({ error: 'Name must be at least 2 characters.' }, { status: 400 });
      }
      if (cleanFullName.length > 70) {
        return NextResponse.json({ error: 'Name cannot exceed 70 characters.' }, { status: 400 });
      }
    }

    if (typeof rawInstitution === 'string') {
      cleanInstitution = rawInstitution.trim().replace(/\s+/g, ' ');
      if (cleanInstitution.length > 0 && cleanInstitution.length < 2) {
        return NextResponse.json({ error: 'Institution name must be at least 2 characters.' }, { status: 400 });
      }
      if (cleanInstitution.length > 120) {
        return NextResponse.json({ error: 'Institution cannot exceed 120 characters.' }, { status: 400 });
      }
      // If user passed empty string, treat as null
      if (cleanInstitution.length === 0) cleanInstitution = undefined;
    }

    if (typeof rawPhone === 'string') {
      cleanPhone = rawPhone.trim().replace(/\s+/g, ' ');
      if (cleanPhone.length > 25) {
        return NextResponse.json({ error: 'Phone cannot exceed 25 characters.' }, { status: 400 });
      }
      if (cleanPhone.length === 0) cleanPhone = undefined;
    }

    // 1. If full name changed, update allowed_emails, team_members, hackathon_teams
    if (cleanFullName) {
      await Promise.all([
        supabaseAdmin
          .from('allowed_emails')
          .update({ full_name: cleanFullName })
          .ilike('email', email),
        supabaseAdmin
          .from('team_members')
          .update({ full_name: cleanFullName })
          .ilike('email', email),
        supabaseAdmin
          .from('hackathon_teams')
          .update({ lead_name: cleanFullName, updated_at: new Date().toISOString() })
          .ilike('lead_email', email),
      ]);

      await invalidateEmailCache(email);
      await invalidateHackathonTeamCache(email);
    }

    // 2. Cascade institution & phone to registrations
    const effectiveName = cleanFullName || session.fullName || email.split('@')[0];

    const { data: existingRegs } = await supabaseAdmin
      .from('registrations')
      .select('id, institution, phone')
      .ilike('email', email)
      .limit(1);

    const regUpdatePayload: Record<string, any> = {};
    if (cleanFullName) regUpdatePayload.name = cleanFullName;
    if (cleanInstitution !== undefined) regUpdatePayload.institution = cleanInstitution;
    if (cleanPhone !== undefined) regUpdatePayload.phone = cleanPhone;

    if (existingRegs && existingRegs.length > 0) {
      if (Object.keys(regUpdatePayload).length > 0) {
        await supabaseAdmin
          .from('registrations')
          .update(regUpdatePayload)
          .eq('id', existingRegs[0].id);
      }
    } else if (cleanInstitution || cleanPhone || cleanFullName) {
      await supabaseAdmin.from('registrations').insert({
        email,
        name: effectiveName,
        institution: cleanInstitution || 'SRM University-AP',
        phone: cleanPhone || null,
        role: 'Undergraduate Student',
        created_at: new Date().toISOString(),
      });
    }

    // 3. Cascade institution & phone to festival_pass_claims (so entry badges update immediately)
    const passUpdatePayload: Record<string, any> = {};
    if (cleanFullName) passUpdatePayload.user_name = cleanFullName;
    if (cleanInstitution !== undefined) passUpdatePayload.institution = cleanInstitution;
    if (cleanPhone !== undefined) passUpdatePayload.contact_phone = cleanPhone;

    if (Object.keys(passUpdatePayload).length > 0) {
      passUpdatePayload.updated_at = new Date().toISOString();
      await supabaseAdmin
        .from('festival_pass_claims')
        .update(passUpdatePayload)
        .ilike('user_email', email);
    }

    // 4. Cascade institution & phone to certificate_payment_submissions
    const certUpdatePayload: Record<string, any> = {};
    if (cleanFullName) certUpdatePayload.candidate_name = cleanFullName;
    if (cleanInstitution !== undefined) certUpdatePayload.institution = cleanInstitution;
    if (cleanPhone !== undefined) certUpdatePayload.contact_phone = cleanPhone;

    if (Object.keys(certUpdatePayload).length > 0) {
      certUpdatePayload.updated_at = new Date().toISOString();
      await supabaseAdmin
        .from('certificate_payment_submissions')
        .update(certUpdatePayload)
        .ilike('user_email', email);
    }

    // 5. Refreshed session
    const updatedSession = {
      email,
      fullName: cleanFullName || session.fullName,
      role: session.role,
      isAdmin: session.isAdmin,
    };

    const response = NextResponse.json({
      success: true,
      message: 'Profile successfully updated.',
      profile: {
        email,
        fullName: cleanFullName || session.fullName,
        institution: cleanInstitution !== undefined ? cleanInstitution : existingRegs?.[0]?.institution,
        phone: cleanPhone !== undefined ? cleanPhone : existingRegs?.[0]?.phone,
      },
      session: updatedSession,
    });

    if (cleanFullName) {
      await setSessionCookie(response, request, { email, fullName: cleanFullName });
    }

    return response;
  } catch (error: any) {
    console.error('[User Profile] Failed to update profile:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update profile.' },
      { status: 500 }
    );
  }
}
