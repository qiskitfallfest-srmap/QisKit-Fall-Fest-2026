import React from 'react';
import type { Metadata } from 'next';
import { getRouteMetadata } from '@/config/page-release';
import PrivacyPolicyContent from '@/components/pages/PrivacyPolicyContent';

export const metadata: Metadata = getRouteMetadata('privacy');

export default function PrivacyPage() {
  return <PrivacyPolicyContent />;
}
