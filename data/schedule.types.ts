export type Track =
  | "Workshop"
  | "Talk"
  | "Networking"
  | "Hackathon"
  | "Community"
  | "Ceremony"
  | "QCTF"
  | "Open Game"
  | "Expo"
  | "Break";

/**
 * Where a session sits during the on-campus phase:
 *   main      plenary programme in the X-Lab Auditorium, open to every pass holder
 *   flagship  QCTF and Hackathon Phase 2, shortlisted participants only
 *   open      open games and the expo, running in parallel for everyone else
 */
export type Lane = "main" | "flagship" | "open";

export type SessionLevel = "Beginner" | "Intermediate" | "Advanced" | "Research" | "All levels";

export type SchedulePhase = "online" | "offline";

export interface Session {
  id: string;
  time: string;
  end: string;
  title: string;
  description: string;
  track: Track;
  level: SessionLevel;
  location: string;
  speaker: string;
  speakerRole: string;
  initials: string;
  duration: string;
  timezone?: string;
  prerequisites?: string;
  learn: string[];
  deliverables?: string | string[];
  registrationUrl?: string;
  learningUrl?: string;
  posterImage?: string;
  lane?: Lane;
  /** Calendar date the session ends on when it runs past midnight (YYYY-MM-DD). */
  endDate?: string;
}

export interface Day {
  id: string;
  label: string;
  date: string;
  weekday: string;
  fullDate: string;
  theme?: string;
  sessions: Session[];
}

export interface SchedulePhaseInfo {
  id: SchedulePhase;
  title: string;
  dateRange: string;
  shortDescription: string;
  locationText: string;
  daysCount: number;
}
