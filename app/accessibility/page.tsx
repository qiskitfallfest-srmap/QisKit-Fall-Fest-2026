import React from 'react';
import type { Metadata } from 'next';
import { getRouteMetadata } from '@/config/page-release';
import { ComingSoonPage } from '@/components/shared/ComingSoonPage';

export const metadata: Metadata = getRouteMetadata('accessibility');

export default function AccessibilityPage() {
  return (
    <ComingSoonPage
      pageTitle="Accessibility Statement"
      sectionSubtitle="Physical campus access maps, assistive technology provisions, and inclusivity guidelines will be available here."
      categoryName="CAMPUS ACCESSIBILITY"
    />
  );
}
