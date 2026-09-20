import React from 'react';
import { Footer } from '@/components/shared/Footer';
import { AboutHero } from '@/components/about/AboutHero';
import { AboutTheMatter } from '@/components/about/AboutTheMatter';
import { AboutOurHost } from '@/components/about/AboutOurHost';
import { AboutOurPillars } from '@/components/about/AboutOurPillars';
import { AboutGlobalMovement } from '@/components/about/AboutGlobalMovement';

export default function AboutPage() {
  return (
    <div className="w-full flex flex-col">
      {/* Section 01: Hero */}
      <AboutHero />

      {/* Section 02: The Matter */}
      <AboutTheMatter />

      {/* Section 03: Our Host */}
      <AboutOurHost />

      {/* Section 04: Our Pillars */}
      <AboutOurPillars />

      {/* Section 05: A Global Movement */}
      <AboutGlobalMovement />

      {/* Global Shared Footer */}
      <Footer />
    </div>
  );
}
