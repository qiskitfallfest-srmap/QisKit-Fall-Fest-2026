import { Day, SchedulePhase, SchedulePhaseInfo, Session, Track } from './schedule.types';
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
      totalSessionsCount++;
      if (
        s.speaker &&
        s.speaker !== 'To be confirmed' &&
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

export function getSessionAction(session: Session, phase: SchedulePhase): SessionActionInfo | null {
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
    title.includes('transpilation')
  ) {
    return {
      href: '/learning/session/session-3',
      cardLabel: 'Enter Session 3',
      detailLabel: 'Launch Learning Session 3',
    };
  }

  // Masterclass Session 4
  if (
    sId.includes('session-4') ||
    sId.includes('s4') ||
    title.includes('session 4')
  ) {
    return {
      href: '/learning/session/session-4',
      cardLabel: 'Enter Session 4',
      detailLabel: 'Launch Learning Session 4',
    };
  }

  // Masterclass Session 5
  if (
    sId.includes('session-5') ||
    sId.includes('s5') ||
    title.includes('session 5') ||
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
    title.includes('session 6')
  ) {
    return {
      href: '/learning/session/session-6',
      cardLabel: 'Enter Session 6',
      detailLabel: 'Launch Learning Session 6',
    };
  }

  // LMS Quizzes
  if (sId.includes('quiz') || title.includes('quiz')) {
    return {
      href: '/learning/session/session-1/quiz',
      cardLabel: 'Take LMS Quiz',
      detailLabel: 'Start LMS Concept Quiz',
    };
  }

  // Tech Reels (Day 1 Online Game)
  if (sId.includes('reels') || title.includes('reels')) {
    return {
      href: '/learning?challenge=1',
      cardLabel: 'View Challenge',
      detailLabel: 'Submit Tech Reels Challenge',
    };
  }

  // Digital Poster (Day 2 Online Game)
  if (sId.includes('poster') || title.includes('poster')) {
    return {
      href: '/learning?challenge=2',
      cardLabel: 'View Challenge',
      detailLabel: 'Submit Digital Poster Challenge',
    };
  }

  // Essay Competition (Day 3 Online Game)
  if (sId.includes('essay') || title.includes('essay')) {
    return {
      href: '/learning?challenge=3',
      cardLabel: 'View Challenge',
      detailLabel: 'Submit Academic Essay Challenge',
    };
  }

  // Hackathon Workspace & Milestones (Phase 1 & Phase 2)
  if (
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

  // All remaining on-campus sessions direct to official Unstop registration
  return {
    href: REGISTRATION_URL,
    cardLabel: 'Register',
    detailLabel: 'Register on Unstop',
    isExternal: true,
  };
}
