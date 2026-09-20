'use client';

import React, { useState } from 'react';
import { HeroSection } from '@/components/schedule/HeroSection';
import { ScheduleStats } from '@/components/schedule/ScheduleStats';
import { ExploreSchedule } from '@/components/schedule/ExploreSchedule';
import { Footer } from '@/components/shared/Footer';
import { SchedulePhase } from '@/data/schedule.types';

export default function SchedulePageContent() {
  const [currentPhase, setCurrentPhase] = useState<SchedulePhase>('online');

  // Restore phase from URL hash on mount if present
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase().replace('#', '');
      if (hash === 'offline' || hash === 'online') {
        setCurrentPhase(hash as SchedulePhase);
        setTimeout(() => {
          scrollToExploreSchedule();
        }, 200);
      }
    }
  }, []);

  const scrollToExploreSchedule = () => {
    requestAnimationFrame(() => {
      const element =
        document.getElementById('explore-schedule-card') ||
        document.getElementById('explore-schedule');
      if (!element) return;

      const lenis = (window as any).__lenis;
      if (lenis && typeof lenis.scrollTo === 'function') {
        const navbarHeight =
          window.innerWidth >= 1280 ? 90 : window.innerWidth >= 640 ? 84 : 78;
        // Scroll target offset adjusted slightly up (+85px) for perfect header card positioning
        lenis.scrollTo(element, { offset: -navbarHeight + 85, duration: 1.0 });
      } else {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    });
  };

  const handlePhaseSelect = (phase: SchedulePhase) => {
    setCurrentPhase(phase);
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
        <ExploreSchedule currentPhase={currentPhase} onPhaseChange={handlePhaseSelect} />
      </main>

      {/* 5. Site Footer */}
      <Footer />
    </div>
  );
}
