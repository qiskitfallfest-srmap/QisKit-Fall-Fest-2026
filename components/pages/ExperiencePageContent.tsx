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

/**
 * ExperiencePageContent
 *
 * Implements direct, in-place experience state navigation between 01 Learn, 02 Build,
 * and 03 Connect. Viewport remains perfectly stable without page scrolling, and
 * independent event selection state is preserved across all category switches.
 */
export default function ExperiencePageContent() {
  const [activeCategory, setActiveCategory] = React.useState<ExperienceCategory>('learn');
  const [selectedIndices, setSelectedIndices] = React.useState<Record<ExperienceCategory, number>>({
    learn: 0,
    build: 0,
    connect: 0,
  });

  const handleCategoryChange = React.useCallback(
    (newCategory: ExperienceCategory) => {
      if (newCategory === activeCategory) return;
      setActiveCategory(newCategory);
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', `#${newCategory}`);
      }
    },
    [activeCategory]
  );

  const handleIndexChange = React.useCallback(
    (newIndex: number) => {
      setSelectedIndices((prev) => {
        if (prev[activeCategory] === newIndex) return prev;
        return {
          ...prev,
          [activeCategory]: newIndex,
        };
      });
    },
    [activeCategory]
  );

  // Synchronize hash on initial direct URL visit or external navigation (e.g. from /experience#build)
  React.useEffect(() => {
    const handleHash = () => {
      if (typeof window === 'undefined') return;
      const hash = window.location.hash.toLowerCase().replace('#', '');
      if (!hash) return;

      if (hash === 'learn' || hash === 'build' || hash === 'connect') {
        setActiveCategory(hash as ExperienceCategory);
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
  }, []);

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
        itemCount={currentTrack.items.length}
        controlledIndex={selectedIndices[activeCategory]}
        onIndexChange={handleIndexChange}
        activeCategory={activeCategory}
        scrollPerItemVh={42}
      >
        {({ currentIndex, onSelectIndex }) => (
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: 'easeInOut' }}
              className="w-full h-full"
            >
              <ExperienceEventGallery
                items={currentTrack.items}
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
            </motion.div>
          </AnimatePresence>
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
