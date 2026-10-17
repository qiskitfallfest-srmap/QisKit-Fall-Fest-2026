import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session || !session.email) {
      return NextResponse.json({
        success: true,
        isAuthenticated: false,
        user: null,
        isHackathonParticipant: false,
        pass: null,
      });
    }

    const normalizedEmail = session.email.trim().toLowerCase();

    // 1. Check if user is an accepted team member or leader in Hackathon
    const [teamMemberRes, teamLeadRes, passClaimRes, regRes] = await Promise.all([
      supabaseAdmin
        .from('team_members')
        .select('team_id, role, status')
        .ilike('email', normalizedEmail)
        .eq('status', 'accepted')
        .limit(1),
      supabaseAdmin
        .from('hackathon_teams')
        .select('id, name')
        .ilike('lead_email', normalizedEmail)
        .limit(1),
      supabaseAdmin
        .from('festival_pass_claims')
        .select('*')
        .eq('user_email', normalizedEmail)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabaseAdmin
        .from('registrations')
        .select('institution, phone')
        .ilike('email', normalizedEmail)
        .limit(1),
    ]);

    const isHackathonParticipant = Boolean(teamMemberRes.data?.length || teamLeadRes.data?.length);
    const reg = regRes.data?.[0];

    return NextResponse.json({
      success: true,
      isAuthenticated: true,
      user: {
        email: normalizedEmail,
        fullName: session.fullName || normalizedEmail.split('@')[0],
        institution: reg?.institution || 'SRM University-AP',
        phone: reg?.phone || null,
      },
      isHackathonParticipant,
      pass: passClaimRes.data || null,
    });
  } catch (err: any) {
    console.error('[Pass Status API Error]:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch pass status.' },
      { status: 500 }
    );
  }
}
