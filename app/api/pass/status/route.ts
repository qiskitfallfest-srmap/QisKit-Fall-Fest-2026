import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import {
  getHackathonPassContext,
  PHASE1_DEADLINE_ISO,
  RESULTS_EXPECTED_LABEL,
} from '@/lib/hackathon-pass';

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
        hackathon: null,
        pass: null,
      });
    }

    const normalizedEmail = session.email.trim().toLowerCase();

    // Hackathon team context, latest pass claim and registration details
    const [hackathon, passClaimRes, regRes] = await Promise.all([
      getHackathonPassContext(normalizedEmail),
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

    // Teams not shortlisted after results are treated like general attendees
    const isHackathonParticipant = Boolean(hackathon && hackathon.outcome !== 'not_shortlisted');
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
      hackathon: hackathon
        ? {
            ...hackathon,
            phase1DeadlineIso: PHASE1_DEADLINE_ISO,
            phase1DeadlinePassed: Date.now() > new Date(PHASE1_DEADLINE_ISO).getTime(),
            resultsExpectedLabel: RESULTS_EXPECTED_LABEL,
          }
        : null,
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
