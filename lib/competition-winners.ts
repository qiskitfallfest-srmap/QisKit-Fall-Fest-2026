import { supabaseAdmin } from '@/lib/supabase-admin';
import { getParticipantUniversitiesMap } from '@/lib/participant-universities';
import { getResultsReveal } from '@/lib/competition-reveal';
import { DAILY_COMPETITIONS } from '@/data/learning/competitions';
import { createHash } from 'crypto';
import {
  AWARD_SITE_URL,
  COMPETITION_TYPES,
  OUTCOME_BY_STATUS,
  awardId,
  isAwardRank,
  type AwardRank,
  type CompetitionType,
  type CompetitionWinner,
  type CompetitionWinnersBoard,
  type YourCompetitionEntry,
} from '@/lib/competition-results';

const COMPETITION_BY_TYPE = new Map(Object.values(DAILY_COMPETITIONS).map((c) => [c.type, c]));

// SRM University-AP in any spelling. Stricter than the track check: SRMIST (Chennai) is not SRM AP.
const SRM_AP_INSTITUTION = /\bsrm\s*(university)?[\s-]*a\.?p\b|\bsrmap\b/i;

function displayInstitution(email: string, institution: string | null | undefined): string | null {
  const value = institution?.trim();
  if (value && SRM_AP_INSTITUTION.test(value)) return 'SRM University-AP';
  if (value) return value;
  return email.endsWith('@srmap.edu.in') ? 'SRM University-AP' : null;
}

/** Uploaded documents keep their file name as the title ("essay (1).pdf"); that is not a title worth printing. */
export function displayEntryTitle(title: string | null | undefined): string | null {
  const value = title?.trim();
  if (!value || /\.(pdf|docx?|pptx?|png|jpe?g|webp)$/i.test(value)) return null;
  return value;
}

const MEDIA_PUBLIC_PREFIX = '/storage/v1/object/public/media/';

/** Object path inside the public media bucket, or null for an external link (reels). */
export function mediaObjectPath(url: string | null | undefined): string | null {
  const i = url ? url.indexOf(MEDIA_PUBLIC_PREFIX) : -1;
  return i >= 0 ? decodeURIComponent(url!.slice(i + MEDIA_PUBLIC_PREFIX.length).split('?')[0]) : null;
}

/**
 * Neutral copy of an uploaded entry for public sharing. Uploads are named after
 * the participant's email; this name carries only the award ID and a hash of
 * the source path (so a re-assigned placement never serves an old file).
 */
export function publicEntryPath(id: string, sourcePath: string): string {
  const ext = (/\.[a-z0-9]{2,5}$/i.exec(sourcePath)?.[0] || '').toLowerCase();
  const hash = createHash('sha256').update(sourcePath).digest('hex').slice(0, 10);
  return `competition-awards/${id}-${hash}${ext}`;
}

/** Link to a winning entry that is safe to publish. */
function publicEntryUrl(id: string, rawUrl: string | null | undefined): string | null {
  if (!rawUrl || !/^https?:\/\//i.test(rawUrl)) return null;
  return mediaObjectPath(rawUrl) ? `${AWARD_SITE_URL}/awards/${id}/entry` : rawUrl;
}

/** Raw submission URL behind an award, for the /awards/[id]/entry route. */
export async function loadAwardEntrySource(
  type: CompetitionType,
  rank: AwardRank,
  { includeUnreleased = false }: { includeUnreleased?: boolean } = {}
): Promise<string | null> {
  const { data: ev } = await supabaseAdmin
    .from('submission_evaluations')
    .select('target_id, result_released_at')
    .eq('category', type)
    .eq('status', 'winner')
    .eq('award_rank', rank)
    .maybeSingle();
  if (!ev || (!includeUnreleased && !(ev.result_released_at && (await getResultsReveal()).revealed))) return null;
  const { data: sub } = await supabaseAdmin
    .from('competition_submissions')
    .select('submission_url')
    .eq('id', ev.target_id)
    .maybeSingle();
  return sub?.submission_url || null;
}

/**
 * Winners of the daily competitions, one board per competition.
 * Only released placements are included unless includeUnreleased (admin preview).
 * Used by the profile API and the public /results and /awards pages, so the
 * public pages show exactly what participants see.
 */
export async function loadWinnerBoards({
  viewerEmail = null,
  includeUnreleased = false,
}: { viewerEmail?: string | null; includeUnreleased?: boolean } = {}): Promise<CompetitionWinnersBoard[]> {
  const { data: rankedEvals, error } = await supabaseAdmin
    .from('submission_evaluations')
    .select('category, target_id, award_rank, result_released_at')
    .in('category', COMPETITION_TYPES)
    .eq('status', 'winner')
    .not('award_rank', 'is', null);
  if (error) {
    // Before the award_rank migration there is nothing to show yet
    if (String(error.message || '').includes('award_rank')) return [];
    throw error;
  }
  // A released placement is public only from the ceremony reveal time on
  const { revealed } = await getResultsReveal();
  const isPublic = (ev: any) => !!ev.result_released_at && revealed;
  const evals = (rankedEvals || []).filter((ev: any) => includeUnreleased || isPublic(ev));

  const ids = evals.map((ev: any) => String(ev.target_id));
  const { data: subs, error: subsErr } = ids.length
    ? await supabaseAdmin
        .from('competition_submissions')
        .select('id, email, competition_type, submission_url, submission_title')
        .in('id', ids)
    : { data: [], error: null };
  if (subsErr) throw subsErr;
  const subById = new Map((subs || []).map((s: any) => [String(s.id), s]));

  const emails = Array.from(new Set((subs || []).map((s: any) => String(s.email).toLowerCase())));
  const nameMap = new Map<string, string>();
  const instMap = new Map<string, string>();
  if (emails.length) {
    const [regRes, allowedRes, universities] = await Promise.all([
      supabaseAdmin.from('registrations').select('email, name, institution').in('email', emails),
      supabaseAdmin.from('allowed_emails').select('email, full_name').in('email', emails),
      getParticipantUniversitiesMap(),
    ]);
    // The profile name (Account tab, allowed_emails.full_name) wins over the registration name,
    // so a winner who corrects their name there sees it on their card and the public pages
    (regRes.data || []).forEach((r: any) => {
      const e = String(r.email || '').toLowerCase();
      if (r.name) nameMap.set(e, r.name);
      if (r.institution) instMap.set(e, r.institution);
    });
    (allowedRes.data || []).forEach((u: any) => u.full_name && nameMap.set(String(u.email).toLowerCase(), u.full_name));
    emails.forEach((e) => universities[e] && instMap.set(e, universities[e]));
  }

  const viewer = viewerEmail?.trim().toLowerCase() || null;

  return COMPETITION_TYPES.map((type: CompetitionType): CompetitionWinnersBoard => {
    const comp = COMPETITION_BY_TYPE.get(type);
    const prizePool = comp?.prizePool ?? null;
    const winners: CompetitionWinner[] = evals
      .filter((ev: any) => ev.category === type && isAwardRank(Number(ev.award_rank)))
      .flatMap((ev: any): CompetitionWinner[] => {
        const sub = subById.get(String(ev.target_id));
        if (!sub) return [];
        const email = String(sub.email).toLowerCase();
        const rank = Number(ev.award_rank) as AwardRank;
        return [
          {
            awardId: awardId(type, rank),
            rank,
            name: nameMap.get(email) || email.split('@')[0],
            institution: displayInstitution(email, instMap.get(email)),
            entryTitle: displayEntryTitle(sub.submission_title),
            // Reel links as they are; uploaded posters/essays through /awards/[id]/entry (no email in the URL)
            entryUrl: publicEntryUrl(awardId(type, rank), sub.submission_url),
            prizeInr: prizePool?.[rank - 1] ?? null,
            isYou: viewer !== null && email === viewer,
            released: isPublic(ev),
            releasedAt: isPublic(ev) ? ev.result_released_at : null,
          },
        ];
      })
      .sort((a, b) => a.rank - b.rank);
    return { type, title: comp?.title || type, prizePool, winners };
  });
}

/**
 * The viewer's own competition entries with their result. A released jury
 * decision is shown as is; otherwise, once the competition's winners are
 * announced (on the given boards), the entry reads as not among the winners.
 */
export async function loadYourEntries(email: string, boards: CompetitionWinnersBoard[]): Promise<YourCompetitionEntry[]> {
  const { revealed } = await getResultsReveal();
  const { data: subs, error } = await supabaseAdmin
    .from('competition_submissions')
    .select('id, competition_type, submission_url, submission_title, submitted_at')
    .eq('email', email.trim().toLowerCase());
  if (error) throw error;
  const mine = (subs || []).filter((s: any) => COMPETITION_TYPES.includes(s.competition_type));
  if (!mine.length) return [];

  const { data: evals } = await supabaseAdmin
    .from('submission_evaluations')
    .select('category, target_id, status, award_rank, participant_feedback, result_released_at')
    .in('category', COMPETITION_TYPES)
    .in('target_id', mine.map((s: any) => String(s.id)));
  const evalById = new Map((evals || []).map((ev: any) => [String(ev.target_id), ev]));

  return COMPETITION_TYPES.flatMap((type): YourCompetitionEntry[] => {
    const sub: any = mine.find((s: any) => s.competition_type === type);
    if (!sub) return [];
    const board = boards.find((b) => b.type === type);
    const announced = !!board?.winners.length;
    const ev: any = evalById.get(String(sub.id));
    const released = !!ev?.result_released_at && revealed;
    const outcome = released ? OUTCOME_BY_STATUS[ev.status || ''] : undefined;
    const rank = outcome === 'winner' && isAwardRank(Number(ev.award_rank)) ? (Number(ev.award_rank) as AwardRank) : null;
    return [
      {
        type,
        title: COMPETITION_BY_TYPE.get(type)?.title || type,
        entryTitle: displayEntryTitle(sub.submission_title),
        entryUrl: /^https?:\/\//i.test(sub.submission_url || '') ? sub.submission_url : null,
        submittedAt: sub.submitted_at || null,
        status: outcome ?? (announced ? 'not_selected' : 'pending'),
        awardId: rank ? awardId(type, rank) : null,
        rank,
        feedback: released ? ev.participant_feedback || null : null,
      },
    ];
  });
}
