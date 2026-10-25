/**
 * Accommodation planning for external participants during the on-campus days.
 * Shared by the participant API, the profile card and the admin view.
 */

export const ACCOMMODATION_TABLE = 'accommodation_requests';
// platform_config value: { closed: boolean, note?: string }
export const ACCOMMODATION_CONFIG_KEY = 'accommodation_config';

/** Stay and room coordinators, shown to external participants and on the Gate 3 scan page */
export const ACCOMMODATION_HELPLINES = [
  { display: '+91 63013 87227', tel: '+916301387227' },
  { display: '+91 90144 85414', tel: '+919014485414' },
] as const;
export const ACCOMMODATION_WHATSAPP_GROUP = 'https://chat.whatsapp.com/Bu8vcL7LMsJ4YcLY4oWNFE';

export type Gender = 'male' | 'female' | 'other';

export const GENDER_LABEL: Record<Gender, string> = {
  male: 'Male',
  female: 'Female',
  other: 'Other / prefer to discuss',
};

// Check-in opens Monday morning (26 October); departure through Saturday (31 October) at latest
export const ACCOMMODATION_DATES = [
  '2026-10-26',
  '2026-10-27',
  '2026-10-28',
  '2026-10-29',
  '2026-10-30',
  '2026-10-31',
];
export const DEFAULT_CHECK_IN = '2026-10-26';
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

export type ArrivalMode = 'train' | 'bus' | 'flight' | 'own_vehicle';

export const ARRIVAL_MODE_LABEL: Record<ArrivalMode, string> = {
  train: 'Train',
  bus: 'Bus',
  flight: 'Flight',
  own_vehicle: 'Own vehicle',
};

export const OTHER_ARRIVAL_POINT = 'Other';

export const ARRIVAL_POINTS = [
  'Vijayawada Railway Station',
  'Vijayawada Bus Stand (PNBS)',
  'Vijayawada Airport (Gannavaram)',
  'Guntur Railway Station',
  'Guntur Bus Stand',
  'Directly to campus',
];

/** "HH:MM" from a Postgres TIME value ("HH:MM:SS") */
export function arrivalTime(value: string | null): string {
  return value ? value.slice(0, 5) : '';
}

/** A room request saved before travel details were asked, or saved without them */
export function missingTravelDetails(r: AccommodationRequest | null): boolean {
  if (!r?.needs_accommodation || r.status !== 'requested') return false;
  return !(r.travelling_from && r.arrival_mode && r.arrival_point && r.arrival_time);
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
  travelling_from: string | null;
  arrival_mode: ArrivalMode | null;
  arrival_point: string | null;
  arrival_time: string | null;
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
  /** The user confirmed their mobile and emergency contact; answering is locked until then */
  contactConfirmed: boolean;
  /** False for SRM AP participants: they do not see the form */
  eligible: boolean;
  closed: boolean;
  note: string | null;
  isLead: boolean;
  teamName: string | null;
  people: AccommodationPerson[];
}
