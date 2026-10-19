import { supabaseAdmin } from '@/lib/supabase-admin';
import { invalidateEmailCache, invalidateHackathonTeamCache, isEmailWhitelisted } from '@/lib/redis';
import { saveParticipantUniversities } from '@/lib/participant-universities';
import { getOfferForTeam } from '@/lib/phase2-waiting-room';

export * from './participant-requests-shared';
import {
  EMAIL_RE,
  TEAM_SIZE,
  type RosterChanges,
} from './participant-requests-shared';

export function isMissingTable(error: any) {
  return Boolean(error) && (error.code === '42P01' || error.code === 'PGRST205');
}

export interface TeamContext {
  teamId: string;
  teamName: string;
  leadEmail: string;
  isLead: boolean;
}

/** The team the user leads, or the team they are an accepted member of. */
export async function getTeamContext(email: string): Promise<TeamContext | null> {
  const normalized = email.trim().toLowerCase();
  const { data: led } = await supabaseAdmin
    .from('hackathon_teams')
    .select('id, name, lead_email')
    .ilike('lead_email', normalized)
    .limit(1);
  if (led?.[0]) {
    return { teamId: String(led[0].id), teamName: led[0].name, leadEmail: normalized, isLead: true };
  }
  const { data: membership } = await supabaseAdmin
    .from('team_members')
    .select('team_id')
    .ilike('email', normalized)
    .eq('status', 'accepted')
    .limit(1);
  const teamId = membership?.[0]?.team_id;
  if (!teamId) return null;
  const { data: team } = await supabaseAdmin.from('hackathon_teams').select('id, name, lead_email').eq('id', teamId).limit(1);
  if (!team?.[0]) return null;
  return {
    teamId: String(team[0].id),
    teamName: team[0].name,
    leadEmail: String(team[0].lead_email).toLowerCase(),
    isLead: false,
  };
}

export interface RosterCheck {
  errors: string[];
  /** Consequences the reviewer should know about; never block */
  warnings: string[];
  currentSize: number;
  finalSize: number;
}

/**
 * Validates a roster change against the live roster. Used when the request is
 * submitted and again when an admin approves it, since the roster may have moved.
 */
export async function checkRosterChange(teamId: string, leadEmail: string, changes: RosterChanges): Promise<RosterCheck> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const lead = leadEmail.toLowerCase();

  const { data: rows } = await supabaseAdmin
    .from('team_members')
    .select('email, status')
    .eq('team_id', teamId)
    .neq('status', 'declined');
  const active = new Map((rows || []).map((r: any) => [String(r.email).toLowerCase(), r.status as string]));
  const accepted = new Set([lead, ...Array.from(active.entries()).filter(([, s]) => s === 'accepted').map(([e]) => e)]);

  if (changes.add.length === 0 && changes.drop.length === 0) {
    errors.push('Add or remove at least one member.');
  }

  const dropEmails = new Set<string>();
  for (const d of changes.drop) {
    if (d.email === lead) {
      errors.push('The team lead cannot be removed. Ask a question instead if the lead has to change.');
    } else if (!active.has(d.email)) {
      errors.push(`${d.email} is not on this team.`);
    } else {
      dropEmails.add(d.email);
    }
  }

  const addEmails = new Set<string>();
  for (const a of changes.add) {
    if (!EMAIL_RE.test(a.email)) {
      errors.push(`${a.email} is not a valid email address.`);
      continue;
    }
    if (addEmails.has(a.email)) {
      errors.push(`${a.email} is listed twice.`);
      continue;
    }
    addEmails.add(a.email);
    if (a.name.length < 2) errors.push(`Enter the full name for ${a.email}.`);
    if (!a.institution) errors.push(`Enter the institution for ${a.email}.`);
    if (accepted.has(a.email) || active.has(a.email)) {
      errors.push(`${a.email} is already on this team.`);
      continue;
    }

    const [whitelist, otherMembership, otherLead] = await Promise.all([
      isEmailWhitelisted(a.email),
      supabaseAdmin
        .from('team_members')
        .select('team_id, hackathon_teams(name)')
        .ilike('email', a.email)
        .neq('status', 'declined')
        .neq('team_id', teamId)
        .limit(1),
      supabaseAdmin.from('hackathon_teams').select('name').ilike('lead_email', a.email).limit(1),
    ]);
    if (!whitelist.whitelisted) {
      errors.push(
        `${a.email} has not registered on the portal. They must sign in once at www.qffsrmap2026.com/learning with this email first.`
      );
    }
    const conflict = (otherMembership.data?.[0] as any)?.hackathon_teams?.name || otherLead.data?.[0]?.name;
    if (conflict) errors.push(`${a.email} is already on team "${conflict}".`);
  }

  const currentSize = accepted.size;
  const finalSize = currentSize - Array.from(dropEmails).filter((e) => accepted.has(e)).length + addEmails.size;
  if (finalSize < TEAM_SIZE.min) errors.push(`A team needs at least ${TEAM_SIZE.min} members; this change leaves ${finalSize}.`);
  if (finalSize > TEAM_SIZE.max) errors.push(`A team can have at most ${TEAM_SIZE.max} members; this change makes ${finalSize}.`);

  // Phase 2 consequences for the reviewer
  const offer = await getOfferForTeam(teamId);
  if (offer && ['invited', 'accepted', 'confirmed'].includes(offer.status)) {
    if (addEmails.size > 0) {
      warnings.push(
        `Team is in Phase 2 (${offer.status}). Each added member must also pay the Flagship Pass` +
          (offer.status === 'confirmed' ? '; the desk is already confirmed, so collect it manually.' : '.')
      );
    }
    if (dropEmails.size > 0) {
      const { data: claims } = await supabaseAdmin
        .from('festival_pass_claims')
        .select('user_email, status')
        .in('user_email', Array.from(dropEmails))
        .eq('pass_tier', 'flagship_offline')
        .neq('status', 'rejected');
      for (const c of claims || []) {
        warnings.push(`${c.user_email} already submitted a Flagship Pass payment (${c.status}). Handle the refund or transfer manually.`);
      }
    }
  }

  return { errors, warnings, currentSize, finalSize };
}

/** Applies an approved change. Caller must have re-run checkRosterChange with no errors. */
export async function applyRosterChange(teamId: string, changes: RosterChanges, approvedBy: string) {
  const nowIso = new Date().toISOString();

  for (const d of changes.drop) {
    const { error } = await supabaseAdmin
      .from('team_members')
      .update({ status: 'declined', responded_at: nowIso })
      .eq('team_id', teamId)
      .ilike('email', d.email);
    if (error) throw error;
  }

  for (const a of changes.add) {
    // team_members.email is globally unique: clear stale declined rows first (same as the invite flow)
    await supabaseAdmin.from('team_members').delete().ilike('email', a.email).eq('status', 'declined');
    const { error } = await supabaseAdmin.from('team_members').insert({
      team_id: teamId,
      email: a.email,
      full_name: a.name,
      role: 'member',
      status: 'accepted',
      invited_at: nowIso,
      responded_at: nowIso,
    });
    if (error) throw error;
  }

  if (changes.add.length) {
    await saveParticipantUniversities(changes.add.map((a) => ({ email: a.email, university: a.institution, fullName: a.name })));
  }

  const { data: members } = await supabaseAdmin.from('team_members').select('email').eq('team_id', teamId);
  const emails = new Set<string>([
    ...(members || []).map((m: any) => String(m.email).toLowerCase()),
    ...changes.drop.map((d) => d.email),
  ]);
  await Promise.all(
    Array.from(emails).flatMap((e) => [invalidateHackathonTeamCache(e), invalidateEmailCache(e)])
  );

  console.info(`[Roster Change] team ${teamId} approved by ${approvedBy}: +${changes.add.length} -${changes.drop.length}`);
}
