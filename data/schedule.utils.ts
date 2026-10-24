import { Day, Lane, SchedulePhase, SchedulePhaseInfo, Session, Track } from './schedule.types';
import { onlineSchedule } from './onlineSchedule';
import { offlineSchedule } from './offlineSchedule';
import { REGISTRATION_URL } from '@/lib/constants';

export function getPhaseDays(phase: SchedulePhase): Day[] {
  return phase === 'online' ? onlineSchedule : offlineSchedule;
}

export function getPhaseInfo(phase: SchedulePhase = 'offline'): SchedulePhaseInfo {
  return {
    id: 'offline',
    title: 'On-Campus Phase',
    dateRange: '26–30 October 2026',
    shortDescription: 'Official 5-day on-campus festival at SRM University-AP featuring workshops, flagship QCTF, 24-hour hackathon, and hardware expo.',
    locationText: 'SRM University-AP, Amaravati',
    daysCount: 5,
  };
}

export function filterSessions(
  sessions: Session[],
  track: string,
  searchQuery: string
): Session[] {
  const query = searchQuery.trim().toLowerCase();
  return sessions.filter((session) => {
    const matchesTrack = track === 'All' || session.track === track;
    if (!matchesTrack) return false;

    if (!query) return true;

    const searchableText = `
      ${session.title} 
      ${session.description} 
      ${session.speaker} 
      ${session.speakerRole} 
      ${session.location} 
      ${session.level} 
      ${session.track}
      ${session.learn.join(' ')}
    `.toLowerCase();

    return searchableText.includes(query);
  });
}

export function computeScheduleStats(phase: SchedulePhase = 'offline') {
  const days = offlineSchedule;
  let totalSessionsCount = 0;
  const speakerSet = new Set<string>();

  days.forEach((day) => {
    day.sessions.forEach((s) => {
      if (isBreak(s)) return;
      totalSessionsCount++;
      if (
        s.speaker &&
        s.speaker !== 'To be confirmed' &&
        s.speaker !== 'To be announced' &&
        s.speaker !== '—' &&
        !s.speaker.startsWith('Student Organizing') &&
        !s.speaker.startsWith('Organizing Team')
      ) {
        speakerSet.add(s.speaker);
      }
    });
  });

  return [
    {
      value: `${days.length}`,
      label: 'Event Days',
      icon: 'calendar',
    },
    {
      value: '15+',
      label: 'Speakers & Experts',
      icon: 'users',
    },
    {
      value: `${totalSessionsCount}`,
      label: 'Workshops & Sessions',
      icon: 'code',
    },
    {
      value: 'On-Campus',
      label: 'Experience',
      icon: 'globe',
    },
    {
      value: '500+',
      label: 'Learners & Builders',
      icon: 'award',
    },
  ];
}

export interface SessionActionInfo {
  href: string;
  cardLabel: string;
  detailLabel: string;
  isExternal?: boolean;
}

export function getSessionAction(session: Session, phase?: SchedulePhase): SessionActionInfo | null {
  const url = session.learningUrl;
  const sId = (session.id || '').toLowerCase();
  const title = (session.title || '').toLowerCase();

  // Explicit learningUrl provided
  if (url) {
    return {
      href: url,
      cardLabel: 'Go to Session',
      detailLabel: 'Launch Learning Session',
    };
  }

  // Explicit external registration URL
  if (session.registrationUrl) {
    return {
      href: session.registrationUrl,
      cardLabel: 'Register',
      detailLabel: 'Complete Registration',
      isExternal: true,
    };
  }

  // Masterclass Session 1
  if (
    sId.includes('session-1') ||
    sId.includes('s1') ||
    title.includes('session 1') ||
    title.includes('introduction to qiskit')
  ) {
    return {
      href: '/learning/session/session-1',
      cardLabel: 'Enter Session 1',
      detailLabel: 'Launch Learning Session 1',
    };
  }

  // Masterclass Session 3
  if (
    sId.includes('session-3') ||
    sId.includes('s3') ||
    title.includes('session 3') ||
    title.includes('connectivity') ||
    title.includes('transpilation') ||
    title.includes('architecture')
  ) {
    return {
      href: '/learning/session/session-3',
      cardLabel: 'Enter Session 3',
      detailLabel: 'Launch Learning Session 3',
    };
  }

  // Masterclass Session 4 (4A / 4B / Photonic Technologies)
  if (
    sId.includes('session-4') ||
    sId.includes('s4') ||
    title.includes('session 4') ||
    title.includes('sensing') ||
    title.includes('optics') ||
    title.includes('photonic')
  ) {
    const isSensing = title.includes('sensing') || sId.includes('4a');
    const isOptics = title.includes('optics') || sId.includes('4b') || title.includes('photonic');
    return {
      href: '/learning/session/session-4',
      cardLabel: isSensing ? 'Enter Session 4A' : isOptics ? 'Enter Session 4B' : 'Enter Session 4',
      detailLabel: isSensing ? 'Launch Session 4A (Sensing)' : isOptics ? 'Launch Session 4B (Optics)' : 'Launch Learning Session 4',
    };
  }

  // Masterclass Session 5
  if (
    sId.includes('session-5') ||
    sId.includes('s5') ||
    title.includes('session 5') ||
    title.includes('machine learning') ||
    title.includes('qml')
  ) {
    return {
      href: '/learning/session/session-5',
      cardLabel: 'Enter Session 5',
      detailLabel: 'Launch Learning Session 5',
    };
  }

  // Masterclass Session 6
  if (
    sId.includes('session-6') ||
    sId.includes('s6') ||
    title.includes('session 6') ||
    title.includes('cryptography') ||
    title.includes('cyber security')
  ) {
    return {
      href: '/learning/session/session-6',
      cardLabel: 'Enter Session 6',
      detailLabel: 'Launch Learning Session 6',
    };
  }

  // LMS Quizzes
  if (
    url?.includes('/quiz') ||
    sId.includes('quiz') ||
    title.includes('quiz')
  ) {
    return {
      href: url || '/learning/session/session-1/quiz',
      cardLabel: 'Take LMS Quiz',
      detailLabel: 'Start LMS Concept Quiz',
    };
  }

  // Tech Reels (Day 1 Online Game)
  if (
    url?.includes('challenge=1') ||
    sId.includes('reels') ||
    title.includes('reels')
  ) {
    return {
      href: '/learning?challenge=1',
      cardLabel: 'View Challenge',
      detailLabel: 'Submit Tech Reels Challenge',
    };
  }

  // Digital Poster (Day 2 Online Game)
  if (
    url?.includes('challenge=2') ||
    sId.includes('poster') ||
    title.includes('poster')
  ) {
    return {
      href: '/learning?challenge=2',
      cardLabel: 'View Challenge',
      detailLabel: 'Submit Digital Poster Challenge',
    };
  }

  // Essay Competition (Day 3 Online Game)
  if (
    url?.includes('challenge=3') ||
    sId.includes('essay') ||
    title.includes('essay')
  ) {
    return {
      href: '/learning?challenge=3',
      cardLabel: 'View Challenge',
      detailLabel: 'Submit Academic Essay Challenge',
    };
  }

  // Hackathon Workspace & Milestones (Phase 1 & Phase 2)
  if (
    url === '/learning/hackathon' ||
    sId.includes('hackathon') ||
    sId.includes('hack') ||
    title.includes('hackathon')
  ) {
    return {
      href: '/learning/hackathon',
      cardLabel: 'Hackathon Hub',
      detailLabel: 'Go to Hackathon Workspace',
    };
  }

  // Intermissions, breaks, and lunches do not have registration buttons
  if (
    title.includes('break') ||
    title.includes('lunch') ||
    sId.includes('break') ||
    sId.includes('lunch')
  ) {
    return null;
  }

  // Online phase fallback
  if (phase === 'online') {
    return {
      href: '/learning',
      cardLabel: 'Learning Hub',
      detailLabel: 'Go to Learning Hub',
    };
  }

  // All remaining on-campus sessions direct to official platform registration
  return {
    href: '/learning',
    cardLabel: 'Register Free',
    detailLabel: 'Register on Learning Portal',
    isExternal: false,
  };
}

// ---------------------------------------------------------------------------
// On-campus timing (IST) — shared by the schedule page and the reminder cron
// ---------------------------------------------------------------------------

const IST_OFFSET_MINUTES = 330;

/** "2:15 PM" → minutes after midnight. */
export function clockToMinutes(label: string): number {
  const match = label.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return 0;
  let hours = Number(match[1]) % 12;
  if (match[3].toUpperCase() === 'PM') hours += 12;
  return hours * 60 + Number(match[2]);
}

function istToEpoch(isoDate: string, minutes: number): number {
  const [y, m, d] = isoDate.split('-').map(Number);
  return Date.UTC(y, m - 1, d) + (minutes - IST_OFFSET_MINUTES) * 60_000;
}

export interface TimedSession {
  session: Session;
  day: Day;
  dayIndex: number;
  startMs: number;
  endMs: number;
}

export function timeSession(day: Day, dayIndex: number, session: Session): TimedSession {
  const startMs = istToEpoch(day.fullDate, clockToMinutes(session.time));
  let endMs = istToEpoch(session.endDate || day.fullDate, clockToMinutes(session.end));
  if (endMs <= startMs) endMs += 24 * 60 * 60_000;
  return { session, day, dayIndex, startMs, endMs };
}

let timedCache: TimedSession[] | null = null;

/** Every on-campus session with absolute start/end times, sorted by start. */
export function getTimedOfflineSessions(): TimedSession[] {
  if (!timedCache) {
    timedCache = offlineSchedule
      .flatMap((day, dayIndex) => day.sessions.map((session) => timeSession(day, dayIndex, session)))
      .sort((a, b) => a.startMs - b.startMs);
  }
  return timedCache;
}

export function findOfflineSession(id: string): TimedSession | undefined {
  return getTimedOfflineSessions().find((t) => t.session.id === id);
}

export function isBreak(session: Session): boolean {
  return session.track === 'Break';
}

/** Index of the day to open by default: today during the fest, else the first day. */
export function defaultOfflineDayIndex(nowMs: number): number {
  const idx = offlineSchedule.findIndex((day) => {
    const start = istToEpoch(day.fullDate, 0);
    return nowMs >= start && nowMs < start + 24 * 60 * 60_000;
  });
  return idx >= 0 ? idx : 0;
}

export const LANE_LABELS: Record<Lane, string> = {
  main: 'Main stage',
  flagship: 'Shortlisted only',
  open: 'Open to all',
};

// ---------------------------------------------------------------------------
// Pass-aware call to action for on-campus sessions
// ---------------------------------------------------------------------------

export type AttendeeState = 'signed_out' | 'no_pass' | 'pass_pending' | 'pass_verified';

export interface OfflineSessionCta {
  label: string;
  href?: string;
  /** Rendered as a quiet badge instead of a button. */
  passive?: boolean;
}

export function getOfflineSessionCta(
  session: Session,
  attendee: AttendeeState,
  isFinalist: boolean
): OfflineSessionCta | null {
  if (isBreak(session)) return null;

  if (session.lane === 'flagship') {
    if (session.track === 'Hackathon' && isFinalist) return { label: 'Finalist hub', href: '/learning/hackathon' };
    return { label: 'Shortlisted teams only', passive: true };
  }

  switch (attendee) {
    case 'signed_out':
      return { label: 'Register', href: '/learning' };
    case 'no_pass':
      return { label: 'Get your pass', href: '/learning#campus-pass' };
    case 'pass_pending':
      return { label: 'Pass under review', href: '/learning#campus-pass', passive: true };
    case 'pass_verified':
      return { label: 'Included in your pass', passive: true };
  }
}
