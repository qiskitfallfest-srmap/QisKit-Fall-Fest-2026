/**
 * Accommodation planning for external participants during the on-campus days.
 * Shared by the participant API, the profile card and the admin view.
 */

export const ACCOMMODATION_TABLE = 'accommodation_requests';
// platform_config value: { closed: boolean, note?: string }
export const ACCOMMODATION_CONFIG_KEY = 'accommodation_config';

export type Gender = 'male' | 'female' | 'other';

export const GENDER_LABEL: Record<Gender, string> = {
  male: 'Male',
  female: 'Female',
  other: 'Other / prefer to discuss',
};

// Arrival from the evening before Day 1; departure the day after Day 5 at the latest
export const ACCOMMODATION_DATES = [
  '2026-10-25',
  '2026-10-26',
  '2026-10-27',
  '2026-10-28',
  '2026-10-29',
  '2026-10-30',
  '2026-10-31',
];
export const DEFAULT_CHECK_IN = '2026-10-25';
export const DEFAULT_CHECK_OUT = '2026-10-30';

export function formatStayDate(date: string): string {
  return new Date(`${date}T12:00:00+05:30`).toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

/** Nights a stay covers, identified by the date of the night (check-in inclusive, check-out exclusive). */
export function stayNights(checkIn: string | null, checkOut: string | null): string[] {
  if (!checkIn || !checkOut) return [];
  return ACCOMMODATION_DATES.filter((d) => d >= checkIn && d < checkOut);
}

export interface AccommodationRequest {
  id: string;
  email: string;
  full_name: string;
  gender: Gender | null;
  needs_accommodation: boolean;
  check_in: string | null;
  check_out: string | null;
  team_id: string | null;
  institution: string | null;
  phone: string | null;
  notes: string | null;
  submitted_by: string;
  status: 'requested' | 'allocated' | 'cancelled';
  allocation_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AccommodationPerson {
  email: string;
  name: string;
  isYou: boolean;
  isLead: boolean;
  request: AccommodationRequest | null;
}

export interface AccommodationStatus {
  success: boolean;
  /** False for SRM AP participants: they do not see the form */
  eligible: boolean;
  closed: boolean;
  note: string | null;
  isLead: boolean;
  teamName: string | null;
  people: AccommodationPerson[];
}
