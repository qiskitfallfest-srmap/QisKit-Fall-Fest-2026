'use client';

import * as React from 'react';
import { ScrollLockedSection } from './ScrollLockedSection';
import { ExperienceEventGallery } from './ExperienceEventGallery';
import type { ExperienceHeroItem } from '@/data/experience-events';

export interface ExperienceSectionProps {
  id: string;
  sectionNumber: string;
  sectionTitle: string;
  sectionSubtitle?: string;
  items: ExperienceHeroItem[];
  prevSectionId?: string;
  nextSectionId?: string;
  prevLabel?: string;
  nextLabel?: string;
}

/**
 * ExperienceSection
 *
 * Unified, reusable category section component for Learn, Build, and Connect.
 * Separates concerns by delegating:
 * - Scroll-locking, pinning, and progression logic -> ScrollLockedSection
 * - Interactive carousel & event presentation -> ExperienceEventGallery
 */
export function ExperienceSection({
  id,
  sectionNumber,
  sectionTitle,
  items,
  prevSectionId,
  nextSectionId,
  prevLabel = 'Prev',
  nextLabel = 'Next',
}: ExperienceSectionProps) {
  return (
    <ScrollLockedSection
      id={id}
      ariaLabel={`${sectionNumber} — ${sectionTitle}`}
      itemCount={items.length}
      prevSectionId={prevSectionId}
      nextSectionId={nextSectionId}
    >
      {({ currentIndex, onSelectIndex, onBack, onNext }) => (
        <ExperienceEventGallery
          items={items}
          currentIndex={currentIndex}
          onIndexChange={onSelectIndex}
          brand={`${sectionNumber} ${sectionTitle}`}
          onBack={onBack}
          onNext={onNext}
          backLabel={currentIndex > 0 ? undefined : prevLabel}
          nextLabel={currentIndex < items.length - 1 ? undefined : nextLabel}
        />
      )}
    </ScrollLockedSection>
  );
}

export default ExperienceSection;
