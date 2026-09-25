import React from 'react';
import type { Metadata } from 'next';
import { isRouteLive, getRouteMetadata } from '@/config/page-release';
import { ComingSoonPage } from '@/components/shared/ComingSoonPage';
import SchedulePageContent from '@/components/pages/SchedulePageContent';
import { JsonLd } from '@/components/shared/JsonLd';
import { generateBreadcrumbSchema } from '@/config/seo';

export const metadata: Metadata = getRouteMetadata('schedule');

export default function SchedulePage() {
  if (isRouteLive('schedule')) {
    return (
      <>
        <JsonLd
          id="breadcrumb-schedule"
          schema={generateBreadcrumbSchema([{ name: 'Schedule', path: '/schedule' }])}
        />
        <SchedulePageContent />
      </>
    );
  }

  return (
    <ComingSoonPage
      pageTitle="Schedule"
      sectionSubtitle="The multi-day itinerary, keynote schedule, technical workshop tracks, and hackathon milestones will be published once officially finalized."
      categoryName="EVENT TIMELINE"
    />
  );
}
