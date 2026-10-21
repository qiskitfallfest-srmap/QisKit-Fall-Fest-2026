import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getParticipantUniversitiesMap } from '@/lib/participant-universities';
import { currentInstitutionDetails } from '@/lib/accommodation-server';
import { getShortlistRoster, type FollowUp } from '@/lib/shortlist-server';
import { contactFields, contactStatuses } from '@/lib/contact-server';
import { getTransportConfig } from '@/lib/transport-server';
import { invalidatePlatformConfigCache } from '@/lib/redis';
import { trackForLeadEmail } from '@/lib/participant-track';
import { OTHER_BOARDING_POINT, TRANSPORT_CONFIG_KEY, TRANSPORT_TABLE } from '@/lib/transport';

export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const session = await getServerSession();
  return session?.isAdmin ? session : null;
}

/**
 * GET: every answer tagged with its group (Phase 2 shortlisted, General Pass, or neither),
 * the settings (boarding points, open/closed), and the participants who have not answered
 * (everyone on a shortlisted team, external General Pass holders), with phone and
 * institution for WhatsApp and email follow-up.
 */
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    const [rowsRes, config, universities] = await Promise.all([
      supabaseAdmin.from(TRANSPORT_TABLE).select('*').order('created_at', { ascending: true }),
      getTransportConfig(),
      getParticipantUniversitiesMap(),
    ]);
    if (rowsRes.error) {
      if (rowsRes.error.code === '42P01' || rowsRes.error.code === 'PGRST205') {
        return NextResponse.json({ error: 'The transport_requests table does not exist yet. Run the migration.' }, { status: 503 });
      }
      throw rowsRes.error;
    }

    const rows = rowsRes.data || [];
    const { offerByTeam, teamNames, members, generalPass } = await getShortlistRoster(rows.map((r: any) => r.team_id));
    const details = await currentInstitutionDetails(
      [...rows.map((r: any) => String(r.email)), ...Array.from(members.keys()), ...Array.from(generalPass.keys())],
      universities
    );
    const detail = (email: string) => details.get(email.trim().toLowerCase());
    const contacts = await contactStatuses(Array.from(details.keys()));
    const contact = (email: string) => contacts.get(email.trim().toLowerCase());

    const answered = new Set(rows.map((r: any) => String(r.email).trim().toLowerCase()));
    const unanswered: (FollowUp)[] = Array.from(members.values())
      .filter((p) => !answered.has(p.email))
      .map((p) => {
        const d = detail(p.email);
        return {
          ...p,
          group: 'shortlisted' as const,
          teamName: teamNames[p.teamId] || '',
          offerStatus: offerByTeam.get(p.teamId)?.status || null,
          institution: d?.institution || null,
          ...contactFields(contact(p.email), d?.phone),
        };
      });
    let generalPassExternal = 0;
    for (const g of generalPass.values()) {
      const d = detail(g.email);
      const institution = d?.institution || g.institution;
      if (trackForLeadEmail(g.email, institution) !== 'external') continue;
      generalPassExternal += 1;
      if (answered.has(g.email)) continue;
      unanswered.push({
        email: g.email,
        name: g.name,
        teamId: '',
        role: 'General Pass',
        group: 'general_pass',
        teamName: '',
        offerStatus: null,
        institution,
        ...contactFields(contact(g.email), d?.phone || g.phone),
      });
    }

    return NextResponse.json({
      success: true,
      config,
      shortlistedTotal: members.size,
      generalPassExternal,
      requests: rows.map((r: any) => {
        const email = String(r.email).trim().toLowerCase();
        const member = members.get(email);
        const d = detail(email);
        const c = contactFields(contact(email), r.phone || d?.phone);
        return {
          ...r,
          group: member ? 'shortlisted' : generalPass.has(email) ? 'general_pass' : null,
          team_name: member ? teamNames[member.teamId] || null : r.team_id ? teamNames[String(r.team_id)] || null : null,
          shortlisted: Boolean(member),
          offer_status: member ? offerByTeam.get(member.teamId)?.status || null : null,
          institution: d?.institution || null,
          contact_phone: c.phone,
          phone_confirmed: c.phoneConfirmed,
          emergency_name: c.emergencyName,
          emergency_phone: c.emergencyPhone,
        };
      }),
      unanswered,
    });
  } catch (err: any) {
    console.error('[Admin Transport GET Error]:', err);
    return NextResponse.json({ error: 'Failed to load bus travel answers.' }, { status: 500 });
  }
}

/** POST { closed: boolean, note?: string, boardingPoints?: string[] } updates the participant-facing settings */
export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }
  try {
    const body = await request.json();
    const points: string[] = Array.isArray(body?.boardingPoints)
      ? Array.from(
          new Set<string>(
            body.boardingPoints
              .map((p: unknown) => String(p).trim().replace(/\s+/g, ' ').slice(0, 60))
              .filter((p: string) => p && p.toLowerCase() !== OTHER_BOARDING_POINT.toLowerCase())
          )
        )
      : [];
    if (points.length === 0) {
      return NextResponse.json({ error: 'Add at least one boarding point.' }, { status: 400 });
    }
    const value = {
      closed: Boolean(body?.closed),
      note: String(body?.note || '').trim().slice(0, 1000),
      boardingPoints: points.slice(0, 20),
    };
    const { error } = await supabaseAdmin
      .from('platform_config')
      .upsert({ key: TRANSPORT_CONFIG_KEY, value, updated_at: new Date().toISOString() });
    if (error) throw error;
    await invalidatePlatformConfigCache(TRANSPORT_CONFIG_KEY);
    return NextResponse.json({ success: true, config: value });
  } catch (err: any) {
    console.error('[Admin Transport POST Error]:', err);
    return NextResponse.json({ error: 'Failed to save setting.' }, { status: 500 });
  }
}
