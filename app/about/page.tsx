import React from 'react';
import type { Metadata } from 'next';
import { isRouteLive, getRouteMetadata } from '@/config/page-release';
import { ComingSoonPage } from '@/components/shared/ComingSoonPage';
import AboutPageContent from '@/components/pages/AboutPageContent';
import { JsonLd } from '@/components/shared/JsonLd';
import { generateBreadcrumbSchema } from '@/config/seo';

export const metadata: Metadata = getRouteMetadata('about');

export default function AboutPage() {
  if (isRouteLive('about')) {
    return (
      <>
        <JsonLd
          id="breadcrumb-about"
          schema={generateBreadcrumbSchema([{ name: 'About', path: '/about' }])}
        />
        <AboutPageContent />
      </>
    );
  }

  return (
    <ComingSoonPage
      pageTitle="About Page Coming Soon"
      sectionSubtitle="We're preparing the full Qiskit Fall Fest SRMAP 2026 story, host details, event vision, and community information."
      categoryName="ABOUT"
    />
  );
}
