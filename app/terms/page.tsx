import React from 'react';
import type { Metadata } from 'next';
import { getRouteMetadata } from '@/config/page-release';
import TermsPageContent from '@/components/pages/TermsPageContent';

export const metadata: Metadata = getRouteMetadata('terms');

export default function TermsPage() {
  return <TermsPageContent />;
}
