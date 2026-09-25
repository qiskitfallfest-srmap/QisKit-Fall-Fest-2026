import React from 'react';
import type { Metadata } from 'next';
import { getRouteMetadata } from '@/config/page-release';
import { ComingSoonPage } from '@/components/shared/ComingSoonPage';

export const metadata: Metadata = getRouteMetadata('terms');

export default function TermsPage() {
  return (
    <ComingSoonPage
      pageTitle="Terms of Service"
      sectionSubtitle="Event participation regulations, hackathon intellectual property clauses, and community code of conduct are being staged."
      categoryName="LEGAL & POLICIES"
    />
  );
}
