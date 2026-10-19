import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { invalidatePlatformConfigCache } from '@/lib/redis';
import {
  PARTICIPANT_REQUESTS_TABLE,
  ROSTER_CHANGE_CONFIG_KEY,
  applyRosterChange,
  checkRosterChange,
  isMissingTable,
  parseRosterChanges,
} from '@/lib/participant-requests';

export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const session = await getServerSession();
  return session?.isAdmin ? session : null;
}

/**
 * GET ?status=open|closed|all
 * Open roster changes come with a live check against the current roster and the team's members.
 */
export async function GET(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    const status = new URL(request.url).searchParams.get('status') || 'open';
    let query = supabaseAdmin.from(PARTICIPANT_REQUESTS_TABLE).select('*').order('created_at', { ascending: status === 'open' }).limit(300);
    if (status === 'open') query = query.eq('status', 'open');
    else if (status === 'closed') query = query.neq('status', 'open');

    const [{ data, error }, configRes, countRes] = await Promise.all([
      query,
      supabaseAdmin.from('platform_config').select('value').eq('key', ROSTER_CHANGE_CONFIG_KEY).limit(1),
      supabaseAdmin.from(PARTICIPANT_REQUESTS_TABLE).select('kind').eq('status', 'open'),
    ]);
    if (isMissingTable(error)) {
      return NextResponse.json({ error: 'The participant_requests table does not exist yet. Run the migration.' }, { status: 503 });
    }
    if (error) throw error;

    const rows = data || [];
    const openRosterTeams = Array.from(
      new Set(rows.filter((r: any) => r.kind === 'roster_change' && r.status === 'open' && r.team_id).map((r: any) => String(r.team_id)))
    );

    const [teamsRes, membersRes] = await Promise.all([
      openRosterTeams.length
        ? supabaseAdmin.from('hackathon_teams').select('id, lead_email, lead_name').in('id', openRosterTeams)
        : Promise.resolve({ data: [] as any[] }),
      openRosterTeams.length
        ? supabaseAdmin.from('team_members').select('team_id, email, full_name, status').in('team_id', openRosterTeams).neq('status', 'declined')
        : Promise.resolve({ data: [] as any[] }),
    ]);
    const teamById = new Map((teamsRes.data || []).map((t: any) => [String(t.id), t]));

    const requests = await Promise.all(
      rows.map(async (r: any) => {
        if (r.kind !== 'roster_change' || r.status !== 'open' || !r.team_id) return r;
        const team = teamById.get(String(r.team_id));
        if (!team) return { ...r, check: { errors: ['The team no longer exists.'], warnings: [], currentSize: 0, finalSize: 0 } };
        const roster = [
          { email: String(team.lead_email).toLowerCase(), name: team.lead_name, status: 'lead' },
          ...(membersRes.data || [])
            .filter((m: any) => String(m.team_id) === String(r.team_id) && String(m.email).toLowerCase() !== String(team.lead_email).toLowerCase())
            .map((m: any) => ({ email: String(m.email).toLowerCase(), name: m.full_name, status: m.status })),
        ];
        const check = await checkRosterChange(String(r.team_id), team.lead_email, parseRosterChanges(r.changes));
        return { ...r, roster, check };
      })
    );

    const openCounts = { roster_change: 0, question: 0 };
    for (const r of countRes.data || []) openCounts[r.kind as keyof typeof openCounts] += 1;

    return NextResponse.json({
      success: true,
      requests,
      openCounts,
      config: configRes.data?.[0]?.value || { closed: false, note: '' },
    });
  } catch (err: any) {
    console.error('[Admin Requests GET Error]:', err);
    return NextResponse.json({ error: 'Failed to load requests.' }, { status: 500 });
  }
}

/**
 * POST { id, action: 'approve' | 'reject' | 'answer', response }
 * approve applies a roster change after re-checking it; reject and answer need a response
 * because the participant sees it on their profile.
 */
export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });

  try {
    const body = await request.json().catch(() => ({}));
    const action = body?.action;
    const response = String(body?.response || '').trim().slice(0, 3000);
    if (!body?.id || !['approve', 'reject', 'answer'].includes(action)) {
      return NextResponse.json({ error: 'id and a valid action are required.' }, { status: 400 });
    }

    const { data: rows, error: fetchErr } = await supabaseAdmin.from(PARTICIPANT_REQUESTS_TABLE).select('*').eq('id', body.id).limit(1);
    if (fetchErr) throw fetchErr;
    const req = rows?.[0];
    if (!req) return NextResponse.json({ error: 'Request not found.' }, { status: 404 });
    if (req.status !== 'open') return NextResponse.json({ error: `This request is already ${req.status}.` }, { status: 409 });

    const nowIso = new Date().toISOString();
    const review = { admin_response: response || null, reviewed_by: admin.email, reviewed_at: nowIso, updated_at: nowIso };

    if (action === 'reject' || action === 'answer') {
      if (!response) {
        return NextResponse.json(
          { error: action === 'reject' ? 'Give the reason; the participant sees it.' : 'Write the answer.' },
          { status: 400 }
        );
      }
      if (action === 'answer' && req.kind !== 'question') {
        return NextResponse.json({ error: 'Only questions can be answered.' }, { status: 400 });
      }
      const { data, error } = await supabaseAdmin
        .from(PARTICIPANT_REQUESTS_TABLE)
        .update({ ...review, status: action === 'reject' ? 'rejected' : 'answered' })
        .eq('id', req.id)
        .eq('status', 'open')
        .select('*');
      if (error) throw error;
      if (!data?.length) return NextResponse.json({ error: 'This request was just closed by someone else.' }, { status: 409 });
      return NextResponse.json({ success: true, request: data[0] });
    }

    // approve
    if (req.kind !== 'roster_change') {
      return NextResponse.json({ error: 'Answer questions instead of approving them.' }, { status: 400 });
    }
    const { data: teamRows } = await supabaseAdmin.from('hackathon_teams').select('id, lead_email').eq('id', req.team_id).limit(1);
    const team = teamRows?.[0];
    if (!team) return NextResponse.json({ error: 'The team no longer exists.' }, { status: 409 });

    const changes = parseRosterChanges(req.changes);
    const check = await checkRosterChange(String(team.id), team.lead_email, changes);
    if (check.errors.length) {
      return NextResponse.json(
        { error: `Cannot apply: ${check.errors.join(' ')} Reject the request with this reason instead.`, errors: check.errors },
        { status: 409 }
      );
    }

    // Claim the request first so two admins cannot apply it twice
    const { data: claimed, error: claimErr } = await supabaseAdmin
      .from(PARTICIPANT_REQUESTS_TABLE)
      .update({ ...review, status: 'approved' })
      .eq('id', req.id)
      .eq('status', 'open')
      .select('*');
    if (claimErr) throw claimErr;
    if (!claimed?.length) return NextResponse.json({ error: 'This request was just closed by someone else.' }, { status: 409 });

    try {
      await applyRosterChange(String(team.id), changes, admin.email);
    } catch (applyErr) {
      await supabaseAdmin
        .from(PARTICIPANT_REQUESTS_TABLE)
        .update({ status: 'open', admin_response: null, reviewed_by: null, reviewed_at: null, updated_at: new Date().toISOString() })
        .eq('id', req.id);
      throw applyErr;
    }

    const { data: applied } = await supabaseAdmin
      .from(PARTICIPANT_REQUESTS_TABLE)
      .update({ applied_at: new Date().toISOString() })
      .eq('id', req.id)
      .select('*');

    return NextResponse.json({ success: true, request: applied?.[0] || claimed[0], warnings: check.warnings });
  } catch (err: any) {
    console.error('[Admin Requests POST Error]:', err);
    return NextResponse.json({ error: err?.message || 'Failed to update the request.' }, { status: 500 });
  }
}

/** PUT { closed: boolean, note?: string } controls whether new roster change requests are accepted */
export async function PUT(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }
  try {
    const body = await request.json();
    const value = { closed: Boolean(body?.closed), note: String(body?.note || '').trim().slice(0, 1000) };
    const { error } = await supabaseAdmin
      .from('platform_config')
      .upsert({ key: ROSTER_CHANGE_CONFIG_KEY, value, updated_at: new Date().toISOString() });
    if (error) throw error;
    await invalidatePlatformConfigCache(ROSTER_CHANGE_CONFIG_KEY);
    return NextResponse.json({ success: true, config: value });
  } catch (err: any) {
    console.error('[Admin Requests PUT Error]:', err);
    return NextResponse.json({ error: 'Failed to save setting.' }, { status: 500 });
  }
}
