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

export interface SpecialBusTrip {
  sno: number;
  route: string;
  driverName: string;
  driverPhone: string;
  driverPhoneDisplay: string;
  vehicleNo: string;
  boardingPoints: string[];
  reportingTime: string;
  returnTime: string;
  activeDates: string;
}

/** Official Special Bus Trips for external participants commuting from Vijayawada & Guntur */
export const SPECIAL_BUS_TRIPS: SpecialBusTrip[] = [
  {
    sno: 1,
    route: 'Vijayawada Route',
    driverName: 'Mr Bora Srinivas',
    driverPhone: '+919491731897',
    driverPhoneDisplay: '94917 31897',
    vehicleNo: 'AP 07 TM 1844',
    boardingPoints: ['Vijayawada Busstand', 'Varadhi', 'Mangalagiri'],
    reportingTime: '8.15 AM',
    returnTime: '5.30 PM',
    activeDates: '26.10.2026 to 30.10.2026',
  },
  {
    sno: 2,
    route: 'Guntur Route',
    driverName: 'Mr D Ramu',
    driverPhone: '+918142489486',
    driverPhoneDisplay: '81424 89486',
    vehicleNo: 'AP 39 UF 0362',
    boardingPoints: ['Guntur Busstand', 'Autonagar Reliance Petrol Bunk', 'Chillies dhaba'],
    reportingTime: '8.15 AM',
    returnTime: '5.30 PM',
    activeDates: '26.10.2026 to 30.10.2026',
  },
];

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
