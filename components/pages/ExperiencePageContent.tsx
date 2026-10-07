'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ExperienceHero,
  EcosystemStrip,
  ScrollLockedSection,
  ExperienceEventGallery,
  ExperienceSectionDivider,
} from '@/components/experience';
import {
  LEARN_ITEMS,
  BUILD_ITEMS,
  CONNECT_ITEMS,
} from '@/data/experience';
import type { ExperienceHeroItem } from '@/data/experience-events';
import { Footer } from '@/components/shared/Footer';

export type ExperienceCategory = 'learn' | 'build' | 'connect';

interface TrackConfig {
  number: string;
  title: string;
  subtitle: string;
  items: ExperienceHeroItem[];
}

const TRACKS: Record<ExperienceCategory, TrackConfig> = {
  learn: {
    number: '01',
    title: 'LEARN',
    subtitle: 'Educational and knowledge-oriented quantum event experiences',
    items: LEARN_ITEMS,
  },
  build: {
    number: '02',
    title: 'BUILD',
    subtitle: 'Hands-on quantum programming, circuit labs, and development sprints',
    items: BUILD_ITEMS,
  },
  connect: {
    number: '03',
    title: 'CONNECT',
    subtitle: 'Panels, networking gala, career mentorship, and quantum summits',
    items: CONNECT_ITEMS,
  },
};

const ALL_EXPERIENCE_ITEMS = [...LEARN_ITEMS, ...BUILD_ITEMS, ...CONNECT_ITEMS];

const CATEGORY_START_INDICES: Record<ExperienceCategory, number> = {
  learn: 0,
  build: LEARN_ITEMS.length,
  connect: LEARN_ITEMS.length + BUILD_ITEMS.length,
};

/**
 * ExperiencePageContent
 *
 * Implements direct, in-place experience state navigation between 01 Learn, 02 Build,
 * and 03 Connect. Viewport remains perfectly stable without page scrolling, and
 * users can slide seamlessly through all events in one continuous gallery section.
 */
export default function ExperiencePageContent() {
  const [globalIndex, setGlobalIndex] = React.useState(0);
  const [lastCategoryIndices, setLastCategoryIndices] = React.useState<Record<ExperienceCategory, number>>({
    learn: 0,
    build: CATEGORY_START_INDICES.build,
    connect: CATEGORY_START_INDICES.connect,
  });

  const activeItem = ALL_EXPERIENCE_ITEMS[globalIndex] || ALL_EXPERIENCE_ITEMS[0];
  const activeCategory: ExperienceCategory = (activeItem.category as ExperienceCategory) || 'learn';

  const handleGlobalIndexChange = React.useCallback((newIndex: number) => {
    const clamped = Math.max(0, Math.min(newIndex, ALL_EXPERIENCE_ITEMS.length - 1));
    setGlobalIndex(clamped);
    const item = ALL_EXPERIENCE_ITEMS[clamped];
    const cat = (item?.category as ExperienceCategory) || 'learn';
    setLastCategoryIndices((prev) => ({
      ...prev,
      [cat]: clamped,
    }));
  }, []);

  const handleCategoryChange = React.useCallback(
    (newCategory: ExperienceCategory) => {
      const targetIndex = lastCategoryIndices[newCategory] ?? CATEGORY_START_INDICES[newCategory];
      handleGlobalIndexChange(targetIndex);
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', `#${newCategory}`);
      }
    },
    [lastCategoryIndices, handleGlobalIndexChange]
  );

  // Synchronize hash on initial direct URL visit or external navigation (e.g. from /experience#build)
  React.useEffect(() => {
    const handleHash = () => {
      if (typeof window === 'undefined') return;
      const hash = window.location.hash.toLowerCase().replace('#', '');
      if (!hash) return;

      if (hash === 'learn' || hash === 'build' || hash === 'connect') {
        const cat = hash as ExperienceCategory;
        const targetIndex = CATEGORY_START_INDICES[cat];
        handleGlobalIndexChange(targetIndex);
        const stage =
          document.getElementById('experience-stage-container') ||
          document.getElementById('experience-stage');
        if (stage) {
          const navbarHeight =
            window.innerWidth >= 1280 ? 90 : window.innerWidth >= 640 ? 84 : 78;
          const top = stage.getBoundingClientRect().top + window.scrollY - navbarHeight;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      } else if (hash === 'impact') {
        const el = document.getElementById('impact');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    };

    const timer = setTimeout(handleHash, 250);
    window.addEventListener('hashchange', handleHash);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('hashchange', handleHash);
    };
  }, [handleGlobalIndexChange]);

  const currentTrack = TRACKS[activeCategory];

  return (
    <main className="relative w-full max-w-full overflow-x-clip flex flex-col min-h-screen bg-[#F5F3F0] dark:bg-[#16171B] transition-colors duration-300">
      {/* Primary Hero Section of Experience Page */}
      <ExperienceHero />

      {/* Ecosystem & Partner Strip */}
      <EcosystemStrip />

      {/* Invisible anchor landmarks for external routing */}
      <div id="learn" />
      <div id="build" />
      <div id="connect" />

      {/* Unified In-Place Scroll-Locked Experience Stage */}
      <ScrollLockedSection
        id="experience-stage"
        ariaLabel={`${currentTrack.number} — ${currentTrack.title}`}
        itemCount={ALL_EXPERIENCE_ITEMS.length}
        controlledIndex={globalIndex}
        onIndexChange={handleGlobalIndexChange}
        activeCategory={activeCategory}
        scrollPerItemVh={42}
      >
        {({ currentIndex, onSelectIndex }) => (
          <div className="w-full h-full">
            <ExperienceEventGallery
              items={ALL_EXPERIENCE_ITEMS}
              currentIndex={currentIndex}
              onIndexChange={onSelectIndex}
              brand={`${currentTrack.number} ${currentTrack.title}`}
              activeCategory={activeCategory}
              onCategoryChange={handleCategoryChange}
              onBack={() => {
                if (activeCategory === 'build') handleCategoryChange('learn');
                else if (activeCategory === 'connect') handleCategoryChange('build');
                else {
                  const strip = document.getElementById('experience-ecosystem-strip');
                  if (strip) strip.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              backLabel={
                activeCategory === 'build'
                  ? '01 Learn'
                  : activeCategory === 'connect'
                  ? '02 Build'
                  : 'Ecosystem'
              }
            />
          </div>
        )}
      </ScrollLockedSection>

      {/* Editorial Chapter Gap & Transition (matching the active track progression) */}
      {activeCategory === 'learn' && (
        <ExperienceSectionDivider
          id="gap-learn-to-build"
          fromTrackNumber="01"
          fromTrackTitle="LEARN"
          toTrackNumber="02"
          toTrackTitle="BUILD"
          headline="From Quantum Theory to Active System Engineering"
          subtitle="Translate fundamental mathematical principles into working quantum circuits, hybrid algorithms, and physical hardware demonstrations."
          onProceed={() => {
            handleCategoryChange('build');
            const stage =
              document.getElementById('experience-stage-container') ||
              document.getElementById('experience-stage');
            if (stage) {
              const navbarHeight =
                window.innerWidth >= 1280 ? 90 : window.innerWidth >= 640 ? 84 : 78;
              const top = stage.getBoundingClientRect().top + window.scrollY - navbarHeight;
              window.scrollTo({ top, behavior: 'smooth' });
            }
          }}
        />
      )}

      {activeCategory === 'build' && (
        <ExperienceSectionDivider
          id="gap-build-to-connect"
          fromTrackNumber="02"
          fromTrackTitle="BUILD"
          toTrackNumber="03"
          toTrackTitle="CONNECT"
          headline="From Individual Engineering to Global Scientific Dialogue"
          subtitle="Connect with academic researchers, global quantum leaders, and student innovators shaping the future of computation."
          onProceed={() => {
            handleCategoryChange('connect');
            const stage =
              document.getElementById('experience-stage-container') ||
              document.getElementById('experience-stage');
            if (stage) {
              const navbarHeight =
                window.innerWidth >= 1280 ? 90 : window.innerWidth >= 640 ? 84 : 78;
              const top = stage.getBoundingClientRect().top + window.scrollY - navbarHeight;
              window.scrollTo({ top, behavior: 'smooth' });
            }
          }}
        />
      )}

      {activeCategory === 'connect' && (
        <ExperienceSectionDivider
          id="gap-connect-to-impact"
          fromTrackNumber="03"
          fromTrackTitle="CONNECT"
          toTrackNumber="04"
          toTrackTitle="COMMUNITY"
          headline="From Campus Dialogue to Long-Term Quantum Leadership"
          subtitle="Connect with academic researchers, global quantum leaders, and student innovators shaping the future of computation."
          onProceed={() => {
            const footerEl = document.getElementById('experience-future-content');
            if (footerEl) {
              footerEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }}
          proceedLabel="Explore Quantum Community"
        />
      )}

      {/* Clean boundary reserved for future Ready to Take Part / Extended content */}
      <div id="impact" />
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
