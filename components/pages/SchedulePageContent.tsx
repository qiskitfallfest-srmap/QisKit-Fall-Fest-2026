'use client';

import React, { useState } from 'react';
import { HeroSection } from '@/components/schedule/HeroSection';
import { ScheduleStats } from '@/components/schedule/ScheduleStats';
import { ExploreSchedule } from '@/components/schedule/ExploreSchedule';
import { Footer } from '@/components/shared/Footer';
import { SchedulePhase } from '@/data/schedule.types';
import { findOfflineSession } from '@/data/schedule.utils';

export default function SchedulePageContent() {
  const [currentPhase, setCurrentPhase] = useState<SchedulePhase>('offline');
  const [targetDayIndex, setTargetDayIndex] = useState<number | undefined>(undefined);

  // Restore day target from URL hash on mount or hash change.
  // Supports canonical hashes (#day-1, #day-2, #day-3, #day-4, #day-5, #offline, #qctf, #hackathon, #valedictory, etc.)
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const handleHash = (isInitialLoad = false) => {
      const hash = window.location.hash.toLowerCase().replace('#', '');
      if (!hash) {
        if (isInitialLoad) {
          window.scrollTo(0, 0);
        }
        return;
      }

      let phase: SchedulePhase = 'offline';
      let dayIdx: number | undefined = undefined;

      const linkedSession = findOfflineSession(hash);
      if (linkedSession) {
        // Reminder notifications link to /schedule#<session-id>
        dayIdx = linkedSession.dayIndex;
      } else if (hash === 'offline' || hash === 'day-1'|| hash === 'day1' || hash === 'offline-day-1') {
        dayIdx = 0;
      } else if (hash === 'day-2' || hash === 'day2' || hash === 'offline-day-2' || hash === 'qctf') {
        dayIdx = 1;
      } else if (hash === 'day-3' || hash === 'day3' || hash === 'offline-day-3' || hash === 'workshop' || hash === 'expo') {
        dayIdx = 2;
      } else if (hash === 'day-4' || hash === 'day4' || hash === 'offline-day-4' || hash === 'hackathon') {
        dayIdx = 3;
      } else if (hash === 'day-5' || hash === 'day5' || hash === 'offline-day-5' || hash === 'valedictory' || hash === 'closing') {
        dayIdx = 4;
      } else if (hash.includes('online')) {
        // Graceful redirect of legacy online hashes to the on-campus schedule
        dayIdx = 0;
      }

      setCurrentPhase('offline');
      if (dayIdx !== undefined) {
        setTargetDayIndex(dayIdx);
      }
      setTimeout(() => {
        scrollToExploreSchedule(hash);
      }, 220);
    };

    handleHash(true);

    const onHashChange = () => handleHash(false);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const scrollToExploreSchedule = (targetHash?: string) => {
    requestAnimationFrame(() => {
      const element =
        (targetHash
          ? document.getElementById(targetHash) || document.getElementById(`heading-${targetHash}`)
          : null) ||
        document.getElementById('explore-schedule-card') ||
        document.getElementById('explore-schedule');
      if (!element) return;

      const lenis = (window as any).__lenis;
      const navbarHeight =
        window.innerWidth >= 1280 ? 90 : window.innerWidth >= 640 ? 84 : 78;
      // Scroll target offset adjusted for comfortable breathing room beneath sticky navbar
      const offset = -navbarHeight - 12;
      if (lenis && typeof lenis.scrollTo === 'function') {
        lenis.scrollTo(element, { offset, duration: 1.0 });
      } else {
        const rect = element.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        window.scrollTo({ top: rect.top + scrollTop + offset, behavior: 'smooth' });
      }
    });
  };

  const handlePhaseSelect = (phase: SchedulePhase) => {
    setCurrentPhase(phase);
    setTargetDayIndex(0);
    if (typeof window !== 'undefined') {
      try {
        window.history.replaceState(null, '', `#${phase}`);
      } catch {
        // ignore
      }
    }
    scrollToExploreSchedule();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)] selection:bg-[#6C151E] selection:text-white scroll-smooth">
      <main className="flex-1 w-full overflow-x-hidden">
        {/* 2. Hero Section with Particle Drift Backdrop & Phase Selector */}
        <HeroSection currentPhase={currentPhase} onPhaseChange={handlePhaseSelect} />

        {/* 3. Dark Cinematic Statistics Strip */}
        <ScheduleStats currentPhase={currentPhase} />

        {/* 4. Primary Interactive Schedule View (Day navigation, Track filtering, Search, Session detail) */}
        <ExploreSchedule
          currentPhase={currentPhase}
          onPhaseChange={handlePhaseSelect}
          targetDayIndex={targetDayIndex}
        />
      </main>

      {/* 5. Site Footer */}
      <Footer />
    </div>
  );
}
