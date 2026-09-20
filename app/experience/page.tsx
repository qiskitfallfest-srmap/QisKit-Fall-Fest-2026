import React from 'react';
import type { Metadata } from 'next';
import { ComingSoonPage } from '@/components/shared/ComingSoonPage';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://qffsrmap2026.com';

export const metadata: Metadata = {
  title: 'Experience | Qiskit Fall Fest 2026',
  description: 'The Qiskit Fall Fest 2026 experience is being prepared.',
  alternates: {
    canonical: `${baseUrl}/experience`,
  },
};

export default function ExperiencePage() {
  return (
    <ComingSoonPage
      pageTitle="Experience"
      sectionSubtitle="The interactive experience, quantum computing masterclasses, and hands-on tracks are being prepared for Qiskit Fall Fest 2026."
      categoryName="EVENT EXPERIENCE"
    />
  );
}
