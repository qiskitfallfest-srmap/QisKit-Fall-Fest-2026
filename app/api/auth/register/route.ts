import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { redis, invalidateEmailCache } from '@/lib/redis';
import { SUPER_ADMIN_EMAILS } from '@/lib/auth';
import { logError, logInfo, logWarn, serializeError } from '@/lib/logger';
import { notifyQffApp } from '@/lib/qff-app-sync';
import { setSessionCookie, verifySupabaseAccessToken } from '@/lib/session-cookie';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // The email is taken only from the Supabase-verified user, never from the request body.
    const verifiedUser = await verifySupabaseAccessToken(body?.accessToken);
    if (!verifiedUser) {
      return NextResponse.json(
        { error: 'Sign-in could not be verified. Please sign in with Google again.' },
        { status: 401 }
      );
    }
    const email = verifiedUser.email;
    const fullName = body.fullName?.trim() || '';
    const role = body.role?.trim() || 'Undergraduate Student';
    const institution = body.institution?.trim() || 'SRM University-AP';
    const phone = body.phone?.trim() || '';
    const yearOfStudy = body.yearOfStudy?.trim() || null;
    const interests = Array.isArray(body.interests) ? body.interests : [];

    // Validation
    if (!email || !email.includes('@') || !email.includes('.')) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
    }

    if (!fullName || fullName.length < 2) {
      return NextResponse.json({ error: 'Please enter your full name.' }, { status: 400 });
    }

    if (!institution || institution.length < 2) {
      return NextResponse.json({ error: 'Please enter your college, university, or organization.' }, { status: 400 });
    }

    if (!phone || phone.replace(/\D/g, '').length < 7) {
      return NextResponse.json({ error: 'Please enter a valid WhatsApp or contact phone number.' }, { status: 400 });
    }

    // 1. Insert or update record in public.registrations
    const { error: regError } = await supabaseAdmin
      .from('registrations')
      .insert({
        name: fullName,
        email,
        institution,
        role,
        phone,
        year_of_study: yearOfStudy,
        interests,
      });

    if (regError) {
      logWarn('auth.register.registrations_insert_failed', { email, error: serializeError(regError) });
      // Non-fatal if table write fails; continue to ensure student gets access
    }

    // 2. Safely add or update in public.allowed_emails
    const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(email);
    const assignedRole = isSuperAdmin ? 'admin' : 'participant';

    const { error: whitelistError } = await supabaseAdmin
      .from('allowed_emails')
      .upsert(
        {
          email,
          full_name: fullName,
          role: assignedRole,
          is_active: true,
          added_by: 'self_registration',
        },
        { onConflict: 'email' }
      );

    if (whitelistError) {
      await logError('auth.register.whitelist_upsert_failed', whitelistError, { email });
      return NextResponse.json(
        { error: 'Failed to complete registration. Please try again.' },
        { status: 500 }
      );
    }

    // 3. Invalidate & populate Redis cache
    await invalidateEmailCache(email);
    if (redis) {
      try {
        await redis.set(
          `whitelist:${email}`,
          { whitelisted: true, role: assignedRole, fullName },
          { ex: 3600 }
        );
      } catch (cacheErr) {
        logWarn('auth.register.cache_set_failed', { email, error: serializeError(cacheErr) });
      }
    }
    logInfo('auth.register.success', { email, institution });
    notifyQffApp([{ email, name: fullName, institution, isActive: true, role: assignedRole }]);

    // 3b. Dispatch Confirmation Pass Email via Google Apps Script Web App Relay
    const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_WEBAPP_URL;
    if (appsScriptUrl) {
      try {
        const syncSecret = process.env.GOOGLE_FORM_SYNC_SECRET || 'qff-srmap-2026-sync-secret';
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const emailRes = await fetch(appsScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'send_welcome_email',
            secretToken: syncSecret,
            name: fullName,
            email,
            institution,
            role,
            phone,
            yearOfStudy,
            interests,
            source: 'website_direct',
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        const emailResult = await emailRes.json().catch(() => null);
        logInfo('auth.register.email_relay', { email, ok: emailRes.ok, result: emailResult });
      } catch (emailErr) {
        logWarn('auth.register.email_relay_failed', { email, error: serializeError(emailErr) });
      }
    }

    // 4. Create authenticated session cookie
    const sessionData = {
      email,
      fullName,
      role: assignedRole,
      isAdmin: isSuperAdmin,
    };

    const response = NextResponse.json({
      success: true,
      message: 'Registration successful! Welcome to IBM Qiskit Fall Fest 2026.',
      session: sessionData,
    });

    await setSessionCookie(response, request, { email, fullName });

    return response;
  } catch (err: any) {
    await logError('auth.register.failed', err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error during registration.' },
      { status: 500 }
    );
  }
}
