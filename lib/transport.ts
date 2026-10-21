/**
 * SRM bus travel during the on-campus days, for Phase 2 shortlisted teams and external
 * General Pass holders (eligibility: lib/shortlist-server.ts).
 * Shared by the participant API, the profile card and the admin view.
 */

export const TRANSPORT_TABLE = 'transport_requests';
// platform_config value: { closed: boolean, note?: string, boardingPoints?: string[] }
export const TRANSPORT_CONFIG_KEY = 'transport_config';

export const OTHER_BOARDING_POINT = 'Other';

// Used until the organizers save their own list from the admin Transport tab
export const DEFAULT_BOARDING_POINTS = ['Vijayawada', 'Guntur', 'Mangalagiri', 'Tenali'];

// Day 1 to Day 5
export const TRAVEL_DATES = ['2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30'];

export function formatTravelDate(date: string): string {
  const day = TRAVEL_DATES.indexOf(date);
  const label = new Date(`${date}T12:00:00+05:30`).toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  return day >= 0 ? `Day ${day + 1}, ${label}` : label;
}

export function boardingLabel(r: { boarding_point: string | null; boarding_other: string | null }): string {
  if (!r.boarding_point) return '';
  return r.boarding_point === OTHER_BOARDING_POINT ? `Other: ${r.boarding_other || ''}`.trim() : r.boarding_point;
}

export interface TransportRequest {
  id: string;
  email: string;
  full_name: string;
  needs_transport: boolean;
  boarding_point: string | null;
  boarding_other: string | null;
  travel_dates: string[];
  team_id: string | null;
  phone: string | null;
  notes: string | null;
  submitted_by: string;
  created_at: string;
  updated_at: string;
}

export interface TransportPerson {
  email: string;
  name: string;
  isYou: boolean;
  isLead: boolean;
  request: TransportRequest | null;
}

export interface TransportStatus {
  success: boolean;
  /** The user confirmed their mobile and emergency contact; answering is locked until then */
  contactConfirmed: boolean;
  /** False unless the user is on a shortlisted team or is an external General Pass holder */
  eligible: boolean;
  closed: boolean;
  note: string | null;
  boardingPoints: string[];
  isLead: boolean;
  teamName: string | null;
  people: TransportPerson[];
}
