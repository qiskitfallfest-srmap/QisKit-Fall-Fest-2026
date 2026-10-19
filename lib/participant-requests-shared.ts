/** Types and constants for participant requests, safe to import from client components. */

export const PARTICIPANT_REQUESTS_TABLE = 'participant_requests';
// platform_config value: { closed: boolean, note?: string }; closes new roster change requests only
export const ROSTER_CHANGE_CONFIG_KEY = 'roster_change_config';

export const TEAM_SIZE = { min: 2, max: 6 };
export const MIN_REASON_LENGTH = 30;

export type RequestKind = 'roster_change' | 'question';
export type RequestStatus = 'open' | 'approved' | 'rejected' | 'answered' | 'withdrawn';

export const QUESTION_CATEGORIES = {
  hackathon: 'Hackathon and team',
  payment: 'Payments and passes',
  certificate: 'Certificate',
  accommodation: 'Accommodation and travel',
  schedule: 'Schedule and venue',
  other: 'Something else',
} as const;
export type QuestionCategory = keyof typeof QUESTION_CATEGORIES;

export interface RosterAdd {
  email: string;
  name: string;
  institution: string;
}
export interface RosterDrop {
  email: string;
  name: string;
}
export interface RosterChanges {
  add: RosterAdd[];
  drop: RosterDrop[];
}

export interface ParticipantRequest {
  id: string;
  kind: RequestKind;
  requester_email: string;
  requester_name: string;
  team_id: string | null;
  team_name: string | null;
  category: string | null;
  subject: string | null;
  message: string;
  changes: Partial<RosterChanges>;
  status: RequestStatus;
  admin_response: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  applied_at: string | null;
  created_at: string;
  updated_at: string;
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Normalizes untrusted input into a RosterChanges object; drops malformed entries. */
export function parseRosterChanges(raw: any): RosterChanges {
  const add = (Array.isArray(raw?.add) ? raw.add : [])
    .map((a: any) => ({
      email: String(a?.email || '').trim().toLowerCase(),
      name: String(a?.name || '').trim().replace(/\s+/g, ' ').slice(0, 70),
      institution: String(a?.institution || '').trim().slice(0, 120),
    }))
    .filter((a: RosterAdd) => a.email);
  const drop = (Array.isArray(raw?.drop) ? raw.drop : [])
    .map((d: any) => ({
      email: String(d?.email || '').trim().toLowerCase(),
      name: String(d?.name || '').trim().slice(0, 70),
    }))
    .filter((d: RosterDrop) => d.email);
  return { add, drop };
}
