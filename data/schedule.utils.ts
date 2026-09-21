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
      dateRange: '5–9 October 2026',
      shortDescription: 'Virtual foundations and advanced quantum computing masterclasses.',
      locationText: 'Online (Virtual)',
      daysCount: 5,
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
