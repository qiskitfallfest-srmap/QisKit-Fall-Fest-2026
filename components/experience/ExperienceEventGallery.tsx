'use client';

import * as React from 'react';
import { HeroCarousel } from '@/components/ui/hero-carousel';
import type { ExperienceHeroItem } from '@/data/experience-events';

export interface ExperienceEventGalleryProps {
  items: ExperienceHeroItem[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  brand: string;
  activeCategory?: 'learn' | 'build' | 'connect';
  onCategoryChange?: (category: 'learn' | 'build' | 'connect') => void;
  onBack?: () => void;
  onNext?: () => void;
  backLabel?: string;
  nextLabel?: string;
  hideTopBar?: boolean;
  hideRail?: boolean;
}

/**
 * ExperienceEventGallery
 *
 * Responsible exclusively for displaying and coordinating event gallery content.
 * Connects the generic HeroCarousel UI layer with Experience event data and
 * section-level interaction callbacks.
 */
export function ExperienceEventGallery({
  items,
  currentIndex,
  onIndexChange,
  brand,
  activeCategory,
  onCategoryChange,
  onBack,
  onNext,
  backLabel,
  nextLabel,
  hideTopBar,
  hideRail,
}: ExperienceEventGalleryProps) {
  return (
    <HeroCarousel
      items={items}
      index={currentIndex}
      onIndexChange={onIndexChange}
      brand={brand}
      activeCategory={activeCategory}
      onCategoryChange={onCategoryChange}
      onBack={onBack}
      onNext={onNext}
      backLabel={backLabel}
      nextLabel={nextLabel}
      hideTopBar={hideTopBar}
      hideRail={hideRail}
    />
  );
}

export default ExperienceEventGallery;
