import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { trackForLeadEmail } from '@/lib/phase2-waiting-room';
import { getShortlistRoster, type FollowUp } from '@/lib/shortlist-server';
import { contactFields, contactStatuses } from '@/lib/contact-server';
import { getParticipantUniversitiesMap } from '@/lib/participant-universities';
import { currentInstitutionDetails } from '@/lib/accommodation-server';
import { invalidatePlatformConfigCache } from '@/lib/redis';
import { ACCOMMODATION_CONFIG_KEY, ACCOMMODATION_TABLE } from '@/lib/accommodation';

export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const session = await getServerSession();
  return session?.isAdmin ? session : null;
}

async function countRegistrations(filter?: (q: any) => any): Promise<number | null> {
  let q = supabaseAdmin.from('registrations').select('id', { count: 'exact', head: true });
  if (filter) q = filter(q);
  const { count, error } = await q;
  return error ? null : count ?? 0;
}

/**
 * GET: every request tagged with its group (Phase 2 shortlisted, General Pass, or neither),
 * the institution as it stands now (and whether the participant confirmed it), the
 * open/closed setting, the external participants in either group who have not answered
 * (with phone for WhatsApp follow-up), and institution confirmation counts.
 */
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    const [rowsRes, configRes, universities] = await Promise.all([
      supabaseAdmin.from(ACCOMMODATION_TABLE).select('*').order('created_at', { ascending: true }),
      supabaseAdmin.from('platform_config').select('value').eq('key', ACCOMMODATION_CONFIG_KEY).limit(1),
      getParticipantUniversitiesMap(),
    ]);
    if (rowsRes.error) {
      if (rowsRes.error.code === '42P01' || rowsRes.error.code === 'PGRST205') {
        return NextResponse.json({ error: 'The accommodation_requests table does not exist yet. Run the migration.' }, { status: 503 });
      }
      throw rowsRes.error;
    }

    const rows = rowsRes.data || [];
    const { offerByTeam, teamNames, members: shortlisted, generalPass } = await getShortlistRoster(rows.map((r: any) => r.team_id));

    const details = await currentInstitutionDetails(
      [...rows.map((r: any) => String(r.email)), ...Array.from(shortlisted.keys()), ...Array.from(generalPass.keys())],
      universities
    );
    const detail = (email: string) => details.get(email.trim().toLowerCase());
    const contacts = await contactStatuses(Array.from(details.keys()));
    const contact = (email: string) => contacts.get(email.trim().toLowerCase());

    const answered = new Set(rows.map((r: any) => String(r.email).trim().toLowerCase()));
    // Phase 2 is per team track; SRM AP students on any team do not need a stay
    const unanswered: (FollowUp & { institutionConfirmed: boolean })[] = Array.from(shortlisted.values())
      .filter((p) => !answered.has(p.email) && trackForLeadEmail(p.email, detail(p.email)?.institution) === 'external')
      .map((p) => {
        const d = detail(p.email);
        return {
          ...p,
          group: 'shortlisted' as const,
          teamName: teamNames[p.teamId] || '',
          offerStatus: offerByTeam.get(p.teamId)?.status || null,
          institution: d?.institution || null,
          institutionConfirmed: Boolean(d?.confirmed),
          ...contactFields(contact(p.email), d?.phone),
        };
      });
    for (const g of generalPass.values()) {
      const d = detail(g.email);
      const institution = d?.institution || g.institution;
      if (answered.has(g.email) || trackForLeadEmail(g.email, institution) !== 'external') continue;
      unanswered.push({
        email: g.email,
        name: g.name,
        teamId: '',
        role: 'General Pass',
        group: 'general_pass',
        teamName: '',
        offerStatus: null,
        institution,
        institutionConfirmed: Boolean(d?.confirmed),
        ...contactFields(contact(g.email), d?.phone || g.phone),
      });
    }

    const shortlistedExternal = Array.from(shortlisted.values()).filter(
      (p) => trackForLeadEmail(p.email, detail(p.email)?.institution) === 'external'
    );
    const [totalRegs, confirmedRegs, editedRegs] = await Promise.all([
      countRegistrations(),
      countRegistrations((q) => q.not('institution_confirmed_at', 'is', null)),
      countRegistrations((q) => q.eq('institution_confirm_source', 'edited')),
    ]);

    return NextResponse.json({
      success: true,
      config: configRes.data?.[0]?.value || { closed: false, note: '' },
      requests: rows.map((r: any) => {
        const email = String(r.email).trim().toLowerCase();
        const member = shortlisted.get(email);
        const d = detail(email);
        const c = contactFields(contact(email), r.phone || d?.phone);
        return {
          ...r,
          group: member ? 'shortlisted' : generalPass.has(email) ? 'general_pass' : null,
          team_name: member ? teamNames[member.teamId] || null : r.team_id ? teamNames[String(r.team_id)] || null : null,
          shortlisted: Boolean(member),
          offer_status: member ? offerByTeam.get(member.teamId)?.status || null : null,
          current_institution: d?.institution || r.institution || null,
          institution_confirmed: Boolean(d?.confirmed),
          institution_confirm_source: d?.confirmSource || null,
          contact_phone: c.phone,
          phone_confirmed: c.phoneConfirmed,
          emergency_name: c.emergencyName,
          emergency_phone: c.emergencyPhone,
        };
      }),
      unanswered,
      institutionConfirmation: {
        // null when migration 20261021120000 has not been applied
        registrations: totalRegs,
        confirmed: confirmedRegs,
        edited: editedRegs,
        shortlistedExternal: shortlistedExternal.length,
        shortlistedExternalConfirmed: shortlistedExternal.filter((p) => detail(p.email)?.confirmed).length,
      },
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
