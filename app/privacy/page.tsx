import React from 'react';
import type { Metadata } from 'next';
import { getRouteMetadata } from '@/config/page-release';
import { ComingSoonPage } from '@/components/shared/ComingSoonPage';

export const metadata: Metadata = getRouteMetadata('privacy');

export default function PrivacyPage() {
  return (
    <ComingSoonPage
      pageTitle="Privacy Policy"
      sectionSubtitle="The official event privacy and participant data protection policies are being finalized for publication."
      categoryName="LEGAL & POLICIES"
    />
  );
}
