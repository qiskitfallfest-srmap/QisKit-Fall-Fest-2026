import { Day, SchedulePhase, SchedulePhaseInfo, Session, Track } from './schedule.types';
import { onlineSchedule } from './onlineSchedule';
import { offlineSchedule } from './offlineSchedule';

export function getPhaseDays(phase: SchedulePhase): Day[] {
  return phase === 'online' ? onlineSchedule : offlineSchedule;
}

export function getPhaseInfo(phase: SchedulePhase): SchedulePhaseInfo {
  if (phase === 'online') {
    return {
      id: 'online',
      title: 'Online Phase',
      dateRange: '8–10 October 2026',
      shortDescription: 'Virtual foundations and advanced quantum computing masterclasses.',
      locationText: 'Online (Virtual)',
      daysCount: 3,
    };
  }
  return {
    id: 'offline',
    title: 'Offline Phase',
    dateRange: '26–30 October 2026',
    shortDescription: 'On-campus masterclass labs, QPU hardware access, and hackathon at SRM University-AP.',
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

export function computeScheduleStats(phase: SchedulePhase) {
  const days = getPhaseDays(phase);
  let totalSessionsCount = 0;
  const speakerSet = new Set<string>();

  days.forEach((day) => {
    day.sessions.forEach((s) => {
      totalSessionsCount++;
      if (s.speaker && s.speaker !== 'To be confirmed') {
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
      value: phase === 'online' ? '10+' : '12+',
      label: 'Speakers & Experts',
      icon: 'users',
    },
    {
      value: `${totalSessionsCount}`,
      label: 'Workshops & Sessions',
      icon: 'code',
    },
    {
      value: phase === 'online' ? 'Global Virtual' : 'On-Campus Hybrid',
      label: 'Experience',
      icon: 'globe',
    },
    {
      value: phase === 'online' ? '1,000+' : '500+',
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

export function getSessionAction(session: Session, phase: SchedulePhase): SessionActionInfo {
  const url = session.learningUrl;
  const sId = (session.id || '').toLowerCase();
  const title = (session.title || '').toLowerCase();

  // Session 1
  if (
    url === '/learning/session/session-1' ||
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

  // Session 1 (Quantum Material segment)
  if (
    url === '/learning/session/session-2' ||
    sId.includes('s2') ||
    title.includes('quantum material')
  ) {
    return {
      href: '/learning/session/session-1',
      cardLabel: 'Enter Session 1',
      detailLabel: 'Launch Learning Session 1',
    };
  }

  // Session 3
  if (
    url === '/learning/session/session-3' ||
    sId.includes('s3') ||
    title.includes('session 3') ||
    title.includes('connectivity') ||
    title.includes('architecture')
  ) {
    return {
      href: '/learning/session/session-3',
      cardLabel: 'Enter Session 3',
      detailLabel: 'Launch Learning Session 3',
    };
  }

  // Session 4 (4A / 4B)
  if (
    url === '/learning/session/session-4' ||
    sId.includes('s4') ||
    title.includes('session 4') ||
    title.includes('sensing') ||
    title.includes('optics')
  ) {
    const isSensing = title.includes('sensing') || sId.includes('4a');
    const isOptics = title.includes('optics') || sId.includes('4b');
    return {
      href: '/learning/session/session-4',
      cardLabel: isSensing ? 'Enter Session 4A' : isOptics ? 'Enter Session 4B' : 'Enter Session 4',
      detailLabel: isSensing ? 'Launch Session 4A (Sensing)' : isOptics ? 'Launch Session 4B (Optics)' : 'Launch Learning Session 4',
    };
  }

  // Session 5
  if (
    url === '/learning/session/session-5' ||
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

  // Session 6
  if (
    url === '/learning/session/session-6' ||
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

  // Hackathon Problem Release or Hackathon milestones
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

  // Inauguration & addresses
  if (
    title.includes('inaugur') ||
    title.includes('welcome') ||
    title.includes('keynote')
  ) {
    return {
      href: '/learning',
      cardLabel: 'Learning Hub',
      detailLabel: 'Explore Learning Hub',
    };
  }

  // Lunch Break / Networking
  if (title.includes('lunch') || session.track === 'Networking') {
    return {
      href: '/learning',
      cardLabel: 'Learning Hub',
      detailLabel: 'View Learning Hub & Lounge',
    };
  }

  // If explicit learningUrl is specified
  if (url) {
    return {
      href: url,
      cardLabel: 'Go to Session',
      detailLabel: 'Launch Learning Session',
    };
  }

  // Online phase default
  if (phase === 'online') {
    return {
      href: '/learning',
      cardLabel: 'Go to Session',
      detailLabel: 'Launch Learning Session',
    };
  }

  // Offline phase
  if (session.registrationUrl) {
    return {
      href: session.registrationUrl,
      cardLabel: 'Register',
      detailLabel: 'Complete Registration',
      isExternal: true,
    };
  }

  return {
    href: '/learning',
    cardLabel: 'Learning Hub',
    detailLabel: 'Go to Learning Hub',
  };
}

