export type Track = "Workshop" | "Talk" | "Networking" | "Hackathon" | "Community";

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
  posterImage?: string;
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
