'use client';

import React, { useState } from 'react';
import { HeroSection } from '@/components/schedule/HeroSection';
import { ScheduleStats } from '@/components/schedule/ScheduleStats';
import { ExploreSchedule } from '@/components/schedule/ExploreSchedule';
import { Footer } from '@/components/shared/Footer';
import { SchedulePhase } from '@/data/schedule.types';

export default function SchedulePageContent() {
  const [currentPhase, setCurrentPhase] = useState<SchedulePhase>('online');
  const [targetDayIndex, setTargetDayIndex] = useState<number | undefined>(undefined);

  // Restore phase and day target from URL hash on mount or hash change.
  // Supports canonical hashes (#online, #offline, #online-day-1, #online-day-2, #technical-sessions, #offline-day-3, #hackathon, etc.)
  // Otherwise, preserves official reload behavior (keeping initial load at top in Hero section).
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

      let phase: SchedulePhase | null = null;
      let dayIdx: number | undefined = undefined;

      if (hash === 'online' || hash === 'online-day-1') {
        phase = 'online';
        dayIdx = 0;
      } else if (hash === 'online-day-2' || hash === 'technical-sessions') {
        phase = 'online';
        dayIdx = 1;
      } else if (hash === 'online-day-3') {
        phase = 'online';
        dayIdx = 2;
      } else if (hash === 'offline' || hash === 'offline-day-1') {
        phase = 'offline';
        dayIdx = 0;
      } else if (hash === 'offline-day-2') {
        phase = 'offline';
        dayIdx = 1;
      } else if (hash === 'offline-day-3' || hash === 'hackathon') {
        phase = 'offline';
        dayIdx = 2;
      } else if (hash === 'offline-day-4') {
        phase = 'offline';
        dayIdx = 3;
      } else if (hash === 'offline-day-5') {
        phase = 'offline';
        dayIdx = 4;
      }

      if (phase) {
        setCurrentPhase(phase);
        if (dayIdx !== undefined) {
          setTargetDayIndex(dayIdx);
        }
        setTimeout(() => {
          scrollToExploreSchedule(hash);
        }, 220);
      } else if (isInitialLoad) {
        window.scrollTo(0, 0);
      }
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
      // Scroll target offset adjusted slightly up (+85px) for perfect header card positioning
      if (lenis && typeof lenis.scrollTo === 'function') {
        lenis.scrollTo(element, { offset: -navbarHeight + 85, duration: 1.0 });
      } else {
        const rect = element.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        window.scrollTo({ top: rect.top + scrollTop - navbarHeight + 85, behavior: 'smooth' });
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
