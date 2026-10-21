import { supabaseAdmin } from '@/lib/supabase-admin';
import { ACTIVE_OFFER_STATUSES, PHASE2_OFFERS_TABLE } from '@/lib/phase2-waiting-room';

/**
 * Who is asked about accommodation and SRM bus travel:
 *   'shortlisted'   on a team with an invited, accepted or confirmed Phase 2 offer
 *   'general_pass'  not shortlisted, but holds a General Pass claim that is not rejected
 *                   (e.g. friends travelling with a shortlisted team). Callers keep only
 *                   external participants; organizers decide on rooms for this group.
 */

export type EligibilityGroup = 'shortlisted' | 'general_pass';

const LIVE_GENERAL_PASS = { tier: 'general_offline', statuses: ['claimed_provisional', 'verified'] };

export interface ShortlistPerson {
  email: string;
  name: string;
  isLead: boolean;
}

/**
 * The people this user may answer for. On a shortlisted team: themselves, plus every
 * accepted member when they lead it. Otherwise themselves if they hold a General Pass.
 * `people` is empty (group null) for everyone else.
 */
export async function resolveEligiblePeople(email: string, fullName: string) {
  const [leadRes, membershipRes] = await Promise.all([
    supabaseAdmin.from('hackathon_teams').select('id, name').ilike('lead_email', email).limit(1),
    supabaseAdmin
      .from('team_members')
      .select('team_id, hackathon_teams(name)')
      .ilike('email', email)
      .eq('status', 'accepted')
      .limit(1),
  ]);

  const lead = leadRes.data?.[0] || null;
  const teamId: string | null = lead
    ? String(lead.id)
    : membershipRes.data?.[0]?.team_id
      ? String(membershipRes.data[0].team_id)
      : null;
  const teamName: string | null = lead?.name || (membershipRes.data?.[0] as any)?.hackathon_teams?.name || null;
  const base = { isLead: Boolean(lead), teamId, teamName, group: null as EligibilityGroup | null, people: [] as ShortlistPerson[] };

  const { data: offers } = teamId
    ? await supabaseAdmin.from(PHASE2_OFFERS_TABLE).select('id').eq('team_id', teamId).in('status', ACTIVE_OFFER_STATUSES).limit(1)
    : { data: [] as any[] };
  if (!offers?.length) {
    const { data: pass } = await supabaseAdmin
      .from('festival_pass_claims')
      .select('id')
      .ilike('user_email', email)
      .eq('pass_tier', LIVE_GENERAL_PASS.tier)
      .in('status', LIVE_GENERAL_PASS.statuses)
      .limit(1);
    if (!pass?.length) return base;
    // Answers only for themselves: their team, if any, is not shortlisted
    return { ...base, isLead: false, group: 'general_pass' as const, people: [{ email, name: fullName, isLead: false }] };
  }

  const people: ShortlistPerson[] = [{ email, name: fullName, isLead: Boolean(lead) }];
  if (lead) {
    const { data: members } = await supabaseAdmin
      .from('team_members')
      .select('email, full_name')
      .eq('team_id', lead.id)
      .eq('status', 'accepted');
    for (const m of members || []) {
      const memberEmail = String(m.email).trim().toLowerCase();
      if (memberEmail === email) continue;
      people.push({ email: memberEmail, name: m.full_name || memberEmail.split('@')[0], isLead: false });
    }
  }
  return { ...base, group: 'shortlisted' as const, people };
}

export interface ShortlistMember {
  email: string;
  name: string;
  teamId: string;
  role: 'Lead' | 'Member';
}

/** One not-answered row in the admin follow-up lists */
export interface FollowUp {
  email: string;
  name: string;
  teamId: string;
  role: 'Lead' | 'Member' | 'General Pass';
  group: EligibilityGroup;
  teamName: string;
  offerStatus: string | null;
  institution: string | null;
  phone: string | null;
  phoneConfirmed: boolean;
  emergencyName: string | null;
  emergencyPhone: string | null;
}

export interface GeneralPassHolder {
  email: string;
  name: string;
  claimStatus: string;
  institution: string | null;
  phone: string | null;
}

/**
 * Admin views: everyone on a shortlisted team, the General Pass holders who are not on
 * one, and team names for the given extra team ids.
 */
export async function getShortlistRoster(extraTeamIds: string[] = []) {
  const { data: offers, error } = await supabaseAdmin
    .from(PHASE2_OFFERS_TABLE)
    .select('team_id, status, track')
    .in('status', ACTIVE_OFFER_STATUSES);
  if (error) throw error;

  const offerByTeam = new Map<string, { status: string; track: string }>();
  for (const o of offers || []) offerByTeam.set(String(o.team_id), { status: o.status, track: o.track });
  const shortlistTeamIds = Array.from(offerByTeam.keys());
  const teamIds = Array.from(new Set([...shortlistTeamIds, ...extraTeamIds.filter(Boolean).map(String)]));

  const [teamsRes, membersRes] = await Promise.all([
    teamIds.length
      ? supabaseAdmin.from('hackathon_teams').select('id, name, lead_email, lead_name').in('id', teamIds)
      : Promise.resolve({ data: [] as any[] }),
    shortlistTeamIds.length
      ? supabaseAdmin.from('team_members').select('team_id, email, full_name').in('team_id', shortlistTeamIds).eq('status', 'accepted')
      : Promise.resolve({ data: [] as any[] }),
  ]);

  const teamNames: Record<string, string> = {};
  for (const t of teamsRes.data || []) teamNames[String(t.id)] = t.name;

  // Keyed by email, lead first so the role sticks
  const members = new Map<string, ShortlistMember>();
  for (const t of teamsRes.data || []) {
    if (!offerByTeam.has(String(t.id))) continue;
    const lead = String(t.lead_email).trim().toLowerCase();
    members.set(lead, { email: lead, name: t.lead_name || lead, teamId: String(t.id), role: 'Lead' });
  }
  for (const m of membersRes.data || []) {
    const e = String(m.email).trim().toLowerCase();
    if (!members.has(e)) members.set(e, { email: e, name: m.full_name || e, teamId: String(m.team_id), role: 'Member' });
  }

  const { data: passes, error: passErr } = await supabaseAdmin
    .from('festival_pass_claims')
    .select('user_email, user_name, status, institution, contact_phone')
    .eq('pass_tier', LIVE_GENERAL_PASS.tier)
    .in('status', LIVE_GENERAL_PASS.statuses);
  if (passErr) throw passErr;
  const generalPass = new Map<string, GeneralPassHolder>();
  for (const c of passes || []) {
    const e = String(c.user_email).trim().toLowerCase();
    if (members.has(e) || generalPass.has(e)) continue;
    generalPass.set(e, {
      email: e,
      name: c.user_name || e,
      claimStatus: c.status,
      institution: c.institution || null,
      phone: c.contact_phone || null,
    });
  }

  return { offerByTeam, teamNames, members, generalPass };
}
