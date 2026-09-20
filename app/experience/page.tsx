import React from 'react';
import type { Metadata } from 'next';
import { isRouteLive } from '@/config/page-release';
import { ComingSoonPage } from '@/components/shared/ComingSoonPage';
import ExperiencePageContent from '@/components/pages/ExperiencePageContent';
import { LEARN_ITEMS, BUILD_ITEMS, CONNECT_ITEMS } from '@/data/experience';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://qiskitfallfest2026.srmap.edu.in';

export const metadata: Metadata = {
  title: 'Interactive Quantum Tracks: Learn, Build & Connect | Qiskit Fall Fest 2026',
  description:
    'Immerse in utility-scale quantum computing at SRM University-AP with IBM Quantum. Register for hands-on Qiskit 1.0 workshops, error mitigation labs, pulse-level control masterclasses, quantum hackathons, and research mentorship.',
  keywords: [
    'Qiskit Fall Fest 2026',
    'Quantum Computing Experience',
    'IBM Quantum Workshops',
    'SRM University-AP Quantum',
    'Qiskit 1.0 Primitives',
    'Quantum Error Mitigation',
    'Quantum Hackathon',
    'Pulse-Level Control Masterclass',
    'Quantum Machine Learning Workshop',
    'Amaravati Quantum Technology',
  ],
  alternates: {
    canonical: `${baseUrl}/experience`,
  },
  openGraph: {
    type: 'website',
    url: `${baseUrl}/experience`,
    title: 'Experience Tracks: Learn, Build & Connect | Qiskit Fall Fest 2026',
    description:
      'Immerse in utility-scale quantum computing at SRM University-AP with IBM Quantum. Register for hands-on Qiskit 1.0 workshops, error mitigation labs, quantum hackathons, and research mentorship.',
    siteName: 'Qiskit Fall Fest 2026',
    images: [
      {
        url: `${baseUrl}/images/branding/srm-ap-logo-horizontal-backgroundless.png`,
        width: 1200,
        height: 630,
        alt: 'Qiskit Fall Fest 2026 Experience Tracks',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Experience Tracks: Learn, Build & Connect | Qiskit Fall Fest 2026',
    description:
      'Interactive quantum computing masterclasses, hands-on hackathons, and research gala at SRM University-AP with IBM Quantum.',
    images: [`${baseUrl}/images/branding/srm-ap-logo-horizontal-backgroundless.png`],
  },
};

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'EventSeries',
  name: 'Qiskit Fall Fest 2026: Experience Tracks',
  description:
    'Immersive quantum computing workshops, hackathons, and technical tracks hosted by SRM University-AP in collaboration with IBM Quantum.',
  startDate: '2026-10-14T09:00:00+05:30',
  endDate: '2026-10-16T18:00:00+05:30',
  eventStatus: 'https://schema.org/EventScheduled',
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  location: {
    '@type': 'Place',
    name: 'SRM University-AP Campus',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Neerukonda, Mangalagiri Mandal',
      addressLocality: 'Amaravati',
      addressRegion: 'Andhra Pradesh',
      postalCode: '522240',
      addressCountry: 'IN',
    },
  },
  organizer: [
    {
      '@type': 'EducationalOrganization',
      name: 'SRM University-AP',
      url: 'https://srmap.edu.in',
    },
    {
      '@type': 'Organization',
      name: 'IBM Quantum',
      url: 'https://ibm.com/quantum',
    },
  ],
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'INR',
    availability: 'https://schema.org/InStock',
    url: `${baseUrl}/experience`,
  },
  subEvents: [
    ...LEARN_ITEMS.map((item) => ({
      '@type': 'EducationEvent',
      name: item.title.replace(/\n/g, ' '),
      description: item.description,
      startDate: '2026-10-14T10:00:00+05:30',
      endDate: '2026-10-16T17:00:00+05:30',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: {
        '@type': 'Place',
        name: item.meta?.[2] || 'SRM University-AP Main Auditorium',
      },
      offers: {
        '@type': 'Offer',
        url: item.registrationUrl || `${baseUrl}/experience`,
        price: '0',
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
      },
    })),
    ...BUILD_ITEMS.map((item) => ({
      '@type': 'EducationEvent',
      name: item.title.replace(/\n/g, ' '),
      description: item.description,
      startDate: '2026-10-15T09:00:00+05:30',
      endDate: '2026-10-16T18:00:00+05:30',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: {
        '@type': 'Place',
        name: item.meta?.[2] || 'SRM University-AP Quantum Labs',
      },
      offers: {
        '@type': 'Offer',
        url: item.registrationUrl || `${baseUrl}/experience`,
        price: '0',
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
      },
    })),
    ...CONNECT_ITEMS.map((item) => ({
      '@type': 'EducationEvent',
      name: item.title.replace(/\n/g, ' '),
      description: item.description,
      startDate: '2026-10-16T10:00:00+05:30',
      endDate: '2026-10-16T20:00:00+05:30',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: {
        '@type': 'Place',
        name: item.meta?.[2] || 'SRM University-AP Seminar Complex',
      },
      offers: {
        '@type': 'Offer',
        url: item.registrationUrl || `${baseUrl}/experience`,
        price: '0',
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
      },
    })),
  ],
};

export default function ExperiencePage() {
  if (isRouteLive('experience')) {
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <ExperiencePageContent />
      </>
    );
  }

  return (
    <ComingSoonPage
      pageTitle="Experience"
      sectionSubtitle="The interactive experience, quantum computing masterclasses, and hands-on tracks are being prepared for Qiskit Fall Fest 2026."
      categoryName="EVENT EXPERIENCE"
    />
  );
}
