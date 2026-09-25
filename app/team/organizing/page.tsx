import React from 'react';
import type { Metadata } from 'next';
import { isRouteLive, getRouteMetadata } from '@/config/page-release';
import { ComingSoonPage } from '@/components/shared/ComingSoonPage';
import OrganizingTeamContent from '@/components/pages/OrganizingTeamContent';
import { JsonLd } from '@/components/shared/JsonLd';
import { generateBreadcrumbSchema } from '@/config/seo';

export const metadata: Metadata = getRouteMetadata('team/organizing');

export default function OrganizingTeamPage() {
  if (isRouteLive('team/organizing')) {
    return (
      <>
        <JsonLd
          id="breadcrumb-team-organizing"
          schema={generateBreadcrumbSchema([
            { name: 'Team', path: '/team' },
            { name: 'Organizing Team', path: '/team/organizing' },
          ])}
        />
        <OrganizingTeamContent />
      </>
    );
  }

  return (
    <ComingSoonPage
      pageTitle="Organizing Team"
      sectionSubtitle="Detailed profiles of the organizing cells, committee leads, and faculty advisors for Qiskit Fall Fest SRMAP 2026 will be published upon official roster confirmation."
      categoryName="ORGANIZING COMMITTEE"
    />
  );
}
