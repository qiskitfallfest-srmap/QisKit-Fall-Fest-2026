import React from 'react';
import type { Metadata } from 'next';
import { isRouteLive, getRouteMetadata } from '@/config/page-release';
import { ComingSoonPage } from '@/components/shared/ComingSoonPage';
import VenuesPageContent from '@/components/pages/VenuesPageContent';
import { JsonLd } from '@/components/shared/JsonLd';
import { generateBreadcrumbSchema } from '@/config/seo';

export const metadata: Metadata = getRouteMetadata('venues');

export default function VenuesPage() {
  if (isRouteLive('venues')) {
    return (
      <>
        <JsonLd
          id="breadcrumb-venues"
          schema={generateBreadcrumbSchema([{ name: 'Venues', path: '/venues' }])}
        />
        <VenuesPageContent />
      </>
    );
  }

  return (
    <ComingSoonPage
      pageTitle="Venues & Campus Map"
      sectionSubtitle="Campus auditorium coordinates, quantum laboratory locations, and transit guidelines at SRM University-AP are being prepared for release."
      categoryName="CAMPUS GEOGRAPHY"
    />
  );
}
