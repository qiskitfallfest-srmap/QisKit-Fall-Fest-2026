'use client';

import * as React from 'react';
import {
  ExperienceHero,
  EcosystemStrip,
  ExperienceSection,
  ExperienceSectionDivider,
} from '@/components/experience';
import {
  LEARN_ITEMS,
  BUILD_ITEMS,
  CONNECT_ITEMS,
} from '@/data/experience';
import { Footer } from '@/components/shared/Footer';

/**
 * ExperiencePageContent
 *
 * Responsible strictly for composing the Experience page sections in the correct order:
 * 1. ExperienceHero
 * 2. EcosystemStrip
 * 3. 01 LEARN Section (Unified ExperienceSection using ScrollLockedSection & ExperienceEventGallery)
 * 4. Editorial Transition Divider (Learn -> Build)
 * 5. 02 BUILD Section (Unified ExperienceSection)
 * 6. Editorial Transition Divider (Build -> Connect)
 * 7. 03 CONNECT Section (Unified ExperienceSection)
 * 8. Shared Footer
 */
export default function ExperiencePageContent() {
  return (
    <main className="relative w-full flex flex-col min-h-screen bg-[#F5F3F0] dark:bg-[#16171B] transition-colors duration-300">
      {/* Primary Hero Section of Experience Page */}
      <ExperienceHero />

      {/* Ecosystem & Partner Strip */}
      <EcosystemStrip />

      {/* 01 — LEARN Section (Scroll-Locked Chapter) */}
      <ExperienceSection
        id="section-01-learn"
        sectionNumber="01"
        sectionTitle="LEARN"
        sectionSubtitle="Educational and knowledge-oriented quantum event experiences"
        items={LEARN_ITEMS}
        prevSectionId="experience-ecosystem-strip"
        nextSectionId="section-02-build"
        prevLabel="Ecosystem"
        nextLabel="02 Build"
      />

      {/* Chapter Gap & Transition: 01 LEARN -> 02 BUILD (Light Ivory Canvas with Human Editorial Typography) */}
      <ExperienceSectionDivider
        id="gap-learn-to-build"
        fromTrackNumber="01"
        fromTrackTitle="LEARN"
        toTrackNumber="02"
        toTrackTitle="BUILD"
        headline="From Quantum Theory to Active System Engineering"
        subtitle="Translate fundamental mathematical principles into working quantum circuits, hybrid algorithms, and physical hardware demonstrations."
      />

      {/* 02 — BUILD Section (Scroll-Locked Chapter: Card Sheet sliding over the middle divider) */}
      <ExperienceSection
        id="section-02-build"
        sectionNumber="02"
        sectionTitle="BUILD"
        sectionSubtitle="Hands-on quantum programming, circuit labs, and development sprints"
        items={BUILD_ITEMS}
        prevSectionId="section-01-learn"
        nextSectionId="section-03-connect"
        prevLabel="01 Learn"
        nextLabel="03 Connect"
      />

      {/* Chapter Gap & Transition: 02 BUILD -> 03 CONNECT (Light Ivory Canvas with Human Editorial Typography) */}
      <ExperienceSectionDivider
        id="gap-build-to-connect"
        fromTrackNumber="02"
        fromTrackTitle="BUILD"
        toTrackNumber="03"
        toTrackTitle="CONNECT"
        headline="From Individual Engineering to Global Scientific Dialogue"
        subtitle="Connect with academic researchers, global quantum leaders, and student innovators shaping the future of computation."
      />

      {/* 03 — CONNECT Section (Scroll-Locked Chapter: Card Sheet sliding over the middle divider) */}
      <ExperienceSection
        id="section-03-connect"
        sectionNumber="03"
        sectionTitle="CONNECT"
        sectionSubtitle="Panels, networking gala, career mentorship, and quantum summits"
        items={CONNECT_ITEMS}
        prevSectionId="section-02-build"
        prevLabel="02 Build"
      />

      {/* Clean boundary reserved for future Ready to Take Part / Extended content */}
      <div
        id="experience-future-content"
        className="w-full border-t border-[#6C151E]/10 dark:border-white/10"
        aria-hidden="true"
      />

      {/* Global Footer */}
      <Footer />
    </main>
  );
}
