import React from 'react';
import type { Metadata } from 'next';
import { isRouteLive, getRouteMetadata } from '@/config/page-release';
import { ComingSoonPage } from '@/components/shared/ComingSoonPage';
import WebsiteTeamContent from '@/components/pages/WebsiteTeamContent';
import { JsonLd } from '@/components/shared/JsonLd';
import { generateBreadcrumbSchema } from '@/config/seo';

export const metadata: Metadata = getRouteMetadata('team/website');

export default function WebsiteTeamPage() {
  if (isRouteLive('team/website')) {
    return (
      <>
        <JsonLd
          id="breadcrumb-team-website"
          schema={generateBreadcrumbSchema([
            { name: 'Team', path: '/team' },
            { name: 'Website Team', path: '/team/website' },
          ])}
        />
        <WebsiteTeamContent />
      </>
    );
  }

  return (
    <ComingSoonPage
      pageTitle="Website Team"
      sectionSubtitle="Detailed profiles of the web engineering, design systems, and platform infrastructure leads for Qiskit Fall Fest SRMAP 2026 will be published shortly."
      categoryName="WEBSITE ENGINEERING"
    />
  );
}
