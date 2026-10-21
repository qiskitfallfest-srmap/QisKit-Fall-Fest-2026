import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { contactStatus } from '@/lib/contact-server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { checkCertificateEligibility } from '@/lib/certificate';
import { getOfferForTeam } from '@/lib/phase2-waiting-room';
import { PARTICIPANT_NOTICES_KEY, noticesForViewer, parseNotices } from '@/lib/notices';
import { CURRICULUM_SESSIONS } from '@/data/learning/curriculum';
import { DAILY_COMPETITIONS } from '@/data/learning/competitions';
import { PROBLEM_STATEMENTS } from '@/data/learning/problem-statements';
import { QISKIT_CHALLENGES } from '@/data/qiskit/challenges';

export const dynamic = 'force-dynamic';

const PHASE2_STAGES = ['invited', 'accepted', 'confirmed'];

/**
 * GET /api/user/overview
 * Everything the profile page shows that /api/pass/status does not: registration details,
 * team roster, learning activity, certificate state and the notices meant for this user.
 * Hackathon results and Flagship payments stay on /api/pass/status (shared SWR cache).
 */
export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const email = session.email.trim().toLowerCase();

  try {
    const [regRes, leadRes, memberRes, invitesRes, progressRes, compRes, codingRes, certificate, certPayRes, noticesRes, confirmRes, contact] =
      await Promise.all([
        supabaseAdmin
          .from('registrations')
          .select('institution, phone, year_of_study, created_at')
          .ilike('email', email)
          .order('created_at', { ascending: true })
          .limit(1),
        supabaseAdmin.from('hackathon_teams').select('id').ilike('lead_email', email).limit(1),
        supabaseAdmin.from('team_members').select('team_id').ilike('email', email).eq('status', 'accepted').limit(1),
        supabaseAdmin
          .from('team_members')
          .select('id, invited_at, hackathon_teams(name, lead_name)')
          .ilike('email', email)
          .eq('status', 'invited'),
        supabaseAdmin
          .from('user_progress')
          .select('session_id, video_completed, quiz_passed, quiz_score, quiz_attempts, completed_at')
          .ilike('email', email),
        supabaseAdmin
          .from('competition_submissions')
          .select('competition_type, submission_url, submission_title, submitted_at')
          .ilike('email', email),
        supabaseAdmin
          .from('coding_submissions')
          .select('challenge_id, status, score, max_score, submitted_at')
          .eq('user_email', email),
        checkCertificateEligibility(email),
        supabaseAdmin
          .from('certificate_payment_submissions')
          .select('id, transaction_reference, amount_inr, status, admin_notes, delivery_mode, delivered_at, receipt_url, created_at')
          .ilike('user_email', email)
          .order('created_at', { ascending: false })
          .limit(1),
        supabaseAdmin.from('platform_config').select('value').eq('key', PARTICIPANT_NOTICES_KEY).limit(1),
        // Own query: errors (column missing before migration 20261021120000) only hide the banner state
        supabaseAdmin
          .from('registrations')
          .select('institution_confirmed_at, institution_confirmed_value')
          .ilike('email', email)
          .order('created_at', { ascending: true })
          .limit(1),
        contactStatus(email),
      ]);

    // Team: lead row first, then accepted membership (same precedence as getHackathonPassContext)
    const teamId: string | null = leadRes.data?.[0]?.id ?? memberRes.data?.[0]?.team_id ?? null;
    let team: any = null;
    let isPhase2 = false;

    if (teamId) {
      const [teamRes, rosterRes, offer] = await Promise.all([
        supabaseAdmin
          .from('hackathon_teams')
          .select('id, name, lead_email, lead_name, vertical, problem_statement_id, github_repo_url, submitted_at, created_at')
          .eq('id', teamId)
          .limit(1),
        supabaseAdmin
          .from('team_members')
          .select('email, full_name, role, status, invited_at, responded_at')
          .eq('team_id', teamId)
          .neq('status', 'declined'),
        getOfferForTeam(String(teamId)),
      ]);

      const t = teamRes.data?.[0];
      if (t) {
        const leadEmail = String(t.lead_email || '').toLowerCase();
        const members = (rosterRes.data || []).map((m: any) => {
          const memberEmail = String(m.email).toLowerCase();
          return {
            email: memberEmail,
            name: m.full_name || memberEmail.split('@')[0],
            isLead: memberEmail === leadEmail,
            status: m.status as 'invited' | 'accepted',
            isYou: memberEmail === email,
          };
        });
        if (!members.some((m) => m.isLead)) {
          members.unshift({
            email: leadEmail,
            name: t.lead_name || leadEmail.split('@')[0],
            isLead: true,
            status: 'accepted',
            isYou: leadEmail === email,
          });
        }
        members.sort((a, b) => Number(b.isLead) - Number(a.isLead) || a.name.localeCompare(b.name));

        const ps = PROBLEM_STATEMENTS.find((p) => p.id === t.problem_statement_id);
        isPhase2 = Boolean(offer && PHASE2_STAGES.includes(offer.status));
        team = {
          id: String(t.id),
          name: t.name,
          isLead: leadEmail === email,
          vertical: t.vertical || null,
          problemStatementId: t.problem_statement_id || null,
          problemStatementTitle: ps?.title || null,
          repoUrl: t.github_repo_url || null,
          submittedAt: t.submitted_at || null,
          createdAt: t.created_at || null,
          members,
        };
      }
    }

    const progressBySession = new Map((progressRes.data || []).map((p: any) => [p.session_id, p]));
    const sessions = CURRICULUM_SESSIONS.map((s) => {
      const p: any = progressBySession.get(s.id);
      return {
        id: s.id,
        day: s.day,
        title: s.title,
        videoCompleted: Boolean(p?.video_completed),
        quizPassed: Boolean(p?.quiz_passed),
        quizScore: p?.quiz_score ?? null,
        quizAttempts: p?.quiz_attempts ?? 0,
        completedAt: p?.completed_at || null,
      };
    });

    const compByType = new Map((compRes.data || []).map((c: any) => [c.competition_type, c]));
    const competitions = Object.values(DAILY_COMPETITIONS).map((c) => {
      const sub: any = compByType.get(c.type);
      return {
        type: c.type,
        title: c.title,
        submitted: Boolean(sub),
        submittedAt: sub?.submitted_at || null,
        submissionUrl: sub?.submission_url || null,
      };
    });

    // Best score per problem; the leaderboard counts the best attempt
    const bestByChallenge = new Map<string, { score: number; maxScore: number }>();
    let attempts = 0;
    for (const s of codingRes.data || []) {
      attempts += 1;
      const id = String(s.challenge_id).toUpperCase();
      const prev = bestByChallenge.get(id);
      const score = Number(s.score) || 0;
      if (!prev || score > prev.score) bestByChallenge.set(id, { score, maxScore: Number(s.max_score) || 0 });
    }
    const coding = {
      attempts,
      problemsAttempted: bestByChallenge.size,
      // Same rule as the leaderboard: solved once the best attempt reaches its max score
      problemsSolved: Array.from(bestByChallenge.values()).filter((b) => b.maxScore > 0 && b.score >= b.maxScore).length,
      totalProblems: QISKIT_CHALLENGES.length,
      points: Array.from(bestByChallenge.values()).reduce((sum, b) => sum + b.score, 0),
      maxPoints: QISKIT_CHALLENGES.reduce((sum, c) => sum + c.points, 0),
    };

    const notices = noticesForViewer(parseNotices(noticesRes.data?.[0]?.value), {
      isHackathonMember: Boolean(team),
      isLead: Boolean(team?.isLead),
      isPhase2,
    });

    const reg = regRes.data?.[0];
    return NextResponse.json(
      {
        success: true,
        profile: {
          email,
          fullName: session.fullName || email.split('@')[0],
          institution: reg?.institution || null,
          phone: reg?.phone || null,
          yearOfStudy: reg?.year_of_study || null,
          registeredAt: reg?.created_at || null,
          institutionConfirmedAt: confirmRes.error ? null : confirmRes.data?.[0]?.institution_confirmed_at || null,
          contact,
          institutionConfirmedValue: confirmRes.error ? null : confirmRes.data?.[0]?.institution_confirmed_value || null,
          isAdmin: session.isAdmin,
        },
        team,
        pendingInvitations: (invitesRes.data || []).map((i: any) => ({
          id: i.id,
          invitedAt: i.invited_at,
          teamName: i.hackathon_teams?.name || 'A team',
          leadName: i.hackathon_teams?.lead_name || null,
        })),
        activity: { sessions, competitions, coding },
        certificate: {
          eligible: certificate.eligible,
          alreadyIssued: certificate.alreadyIssued,
          issued: certificate.issuedCertificate || null,
          sessionsCompleted: certificate.sessionsCompleted,
          quizzesPassed: certificate.quizzesPassed,
          totalSessions: certificate.totalSessions,
          payment: certPayRes.data?.[0] || null,
        },
        notices,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err: any) {
    console.error('[User Overview Error]:', err);
    return NextResponse.json({ error: 'Could not load your profile.' }, { status: 500 });
  }
}
