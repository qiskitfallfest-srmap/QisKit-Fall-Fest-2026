/**
 * Participant notices shown on /learning/profile. Stored as one JSON document in
 * platform_config (key PARTICIPANT_NOTICES_KEY) and edited from the admin console,
 * so publishing a notice needs no deploy and no migration.
 */

export const PARTICIPANT_NOTICES_KEY = 'participant_notices';

export type NoticeAudience = 'all' | 'hackathon' | 'phase2' | 'leads';
export type NoticeSeverity = 'info' | 'action' | 'urgent';

export const NOTICE_AUDIENCE_LABEL: Record<NoticeAudience, string> = {
  all: 'Everyone',
  hackathon: 'Hackathon team members',
  phase2: 'Phase 2 teams (invited, accepted, confirmed)',
  leads: 'Hackathon team leads',
};

export const NOTICE_SEVERITY_LABEL: Record<NoticeSeverity, string> = {
  info: 'Information',
  action: 'Action needed',
  urgent: 'Urgent',
};

export interface Notice {
  id: string;
  title: string;
  body: string;
  audience: NoticeAudience;
  severity: NoticeSeverity;
  pinned?: boolean;
  linkLabel?: string;
  linkHref?: string;
  publishedAt: string;
  /** Hidden from participants after this time */
  expiresAt?: string | null;
}

export interface NoticeViewer {
  isHackathonMember: boolean;
  isLead: boolean;
  isPhase2: boolean;
}

export function parseNotices(value: unknown): Notice[] {
  const items = (value as { items?: unknown })?.items;
  if (!Array.isArray(items)) return [];
  return items.filter(
    (n): n is Notice =>
      Boolean(n) && typeof n.id === 'string' && typeof n.title === 'string' && typeof n.publishedAt === 'string'
  );
}

function matchesAudience(audience: NoticeAudience, viewer: NoticeViewer): boolean {
  switch (audience) {
    case 'hackathon':
      return viewer.isHackathonMember;
    case 'phase2':
      return viewer.isPhase2;
    case 'leads':
      return viewer.isLead;
    default:
      return true;
  }
}

/** Notices this viewer should see now: published, not expired, in audience. Pinned first, then newest. */
export function noticesForViewer(all: Notice[], viewer: NoticeViewer, now: number = Date.now()): Notice[] {
  return all
    .filter((n) => Date.parse(n.publishedAt) <= now)
    .filter((n) => !n.expiresAt || Date.parse(n.expiresAt) > now)
    .filter((n) => matchesAudience(n.audience, viewer))
    .sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) || b.publishedAt.localeCompare(a.publishedAt));
}

// Read state is a per-device convenience: it only drives the unread dot.
const SEEN_KEY = 'qff_notices_seen';

export function readSeenNoticeIds(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

export function markNoticesSeen(ids: string[]) {
  try {
    const seen = readSeenNoticeIds();
    ids.forEach((id) => seen.add(id));
    localStorage.setItem(SEEN_KEY, JSON.stringify(Array.from(seen).slice(-200)));
    window.dispatchEvent(new Event('qff_notices_seen'));
  } catch {}
}
