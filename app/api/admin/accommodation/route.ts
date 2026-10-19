import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { PHASE2_OFFERS_TABLE } from '@/lib/phase2-waiting-room';
import { invalidatePlatformConfigCache } from '@/lib/redis';
import { ACCOMMODATION_CONFIG_KEY, ACCOMMODATION_TABLE } from '@/lib/accommodation';

export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const session = await getServerSession();
  return session?.isAdmin ? session : null;
}

/**
 * GET: every request, team names, the open/closed setting, and the external Phase 2
 * members who have not answered yet (so organizers can chase them before booking).
 */
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    const [rowsRes, configRes, offersRes] = await Promise.all([
      supabaseAdmin.from(ACCOMMODATION_TABLE).select('*').order('created_at', { ascending: true }),
      supabaseAdmin.from('platform_config').select('value').eq('key', ACCOMMODATION_CONFIG_KEY).limit(1),
      supabaseAdmin
        .from(PHASE2_OFFERS_TABLE)
        .select('team_id')
        .eq('track', 'external')
        .in('status', ['invited', 'accepted', 'confirmed']),
    ]);
    if (rowsRes.error) {
      if (rowsRes.error.code === '42P01' || rowsRes.error.code === 'PGRST205') {
        return NextResponse.json({ error: 'The accommodation_requests table does not exist yet. Run the migration.' }, { status: 503 });
      }
      throw rowsRes.error;
    }

    const rows = rowsRes.data || [];
    const phase2TeamIds = (offersRes.data || []).map((o: any) => String(o.team_id));
    const teamIds = Array.from(new Set([...phase2TeamIds, ...rows.map((r: any) => r.team_id).filter(Boolean)]));

    const [teamsRes, membersRes] = await Promise.all([
      teamIds.length
        ? supabaseAdmin.from('hackathon_teams').select('id, name, lead_email, lead_name').in('id', teamIds)
        : Promise.resolve({ data: [] as any[] }),
      phase2TeamIds.length
        ? supabaseAdmin.from('team_members').select('team_id, email, full_name').in('team_id', phase2TeamIds).eq('status', 'accepted')
        : Promise.resolve({ data: [] as any[] }),
    ]);

    const teamNames: Record<string, string> = {};
    for (const t of teamsRes.data || []) teamNames[String(t.id)] = t.name;

    const answered = new Set(rows.map((r: any) => String(r.email).toLowerCase()));
    const expected = new Map<string, { email: string; name: string; teamId: string }>();
    for (const t of teamsRes.data || []) {
      if (!phase2TeamIds.includes(String(t.id))) continue;
      const lead = String(t.lead_email).toLowerCase();
      expected.set(lead, { email: lead, name: t.lead_name || lead, teamId: String(t.id) });
    }
    for (const m of membersRes.data || []) {
      const e = String(m.email).toLowerCase();
      if (!expected.has(e)) expected.set(e, { email: e, name: m.full_name || e, teamId: String(m.team_id) });
    }
    // Phase 2 is per team track; SRM AP students on an external team do not need a stay
    const unanswered = Array.from(expected.values())
      .filter((p) => !answered.has(p.email) && !p.email.endsWith('@srmap.edu.in'))
      .map((p) => ({ ...p, teamName: teamNames[p.teamId] || '' }));

    return NextResponse.json({
      success: true,
      config: configRes.data?.[0]?.value || { closed: false, note: '' },
      requests: rows.map((r: any) => ({ ...r, team_name: r.team_id ? teamNames[String(r.team_id)] || null : null })),
      unanswered,
    });
  } catch (err: any) {
    console.error('[Admin Accommodation GET Error]:', err);
    return NextResponse.json({ error: 'Failed to load accommodation requests.' }, { status: 500 });
  }
}

/** PATCH { id, status?, allocationNotes? } */
export async function PATCH(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });

  try {
    const body = await request.json();
    if (!body?.id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const patch: Record<string, any> = { updated_at: new Date().toISOString() };
    if (body.status !== undefined) {
      if (!['requested', 'allocated', 'cancelled'].includes(body.status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      patch.status = body.status;
    }
    if (body.allocationNotes !== undefined) {
      patch.allocation_notes = String(body.allocationNotes || '').trim().slice(0, 500) || null;
    }

    const { data, error } = await supabaseAdmin.from(ACCOMMODATION_TABLE).update(patch).eq('id', body.id).select('*').single();
    if (error) throw error;
    return NextResponse.json({ success: true, request: data });
  } catch (err: any) {
    console.error('[Admin Accommodation PATCH Error]:', err);
    return NextResponse.json({ error: 'Failed to update request.' }, { status: 500 });
  }
}

/** POST { closed: boolean, note?: string } updates the participant-facing setting */
export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }
  try {
    const body = await request.json();
    const value = { closed: Boolean(body?.closed), note: String(body?.note || '').trim().slice(0, 1000) };
    const { error } = await supabaseAdmin
      .from('platform_config')
      .upsert({ key: ACCOMMODATION_CONFIG_KEY, value, updated_at: new Date().toISOString() });
    if (error) throw error;
    await invalidatePlatformConfigCache(ACCOMMODATION_CONFIG_KEY);
    return NextResponse.json({ success: true, config: value });
  } catch (err: any) {
    console.error('[Admin Accommodation POST Error]:', err);
    return NextResponse.json({ error: 'Failed to save setting.' }, { status: 500 });
  }
}
