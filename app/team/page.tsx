import React from 'react';
import type { Metadata } from 'next';
import { isRouteLive, getRouteMetadata } from '@/config/page-release';
import { ComingSoonPage } from '@/components/shared/ComingSoonPage';
import TeamPageContent from '@/components/pages/TeamPageContent';
import { JsonLd } from '@/components/shared/JsonLd';
import { generateBreadcrumbSchema } from '@/config/seo';

export const metadata: Metadata = getRouteMetadata('team');

export default function TeamPage() {
  if (isRouteLive('team')) {
    return (
      <>
        <JsonLd
          id="breadcrumb-team"
          schema={generateBreadcrumbSchema([{ name: 'Team', path: '/team' }])}
        />
        <TeamPageContent />
      </>
    );
  }

  return (
    <ComingSoonPage
      pageTitle="Team"
      sectionSubtitle="The student committees, technical leadership, and organizational tracks driving Qiskit Fall Fest SRMAP 2026 will be unveiled shortly."
      categoryName="EVENT LEADERSHIP"
    />
  );
}
