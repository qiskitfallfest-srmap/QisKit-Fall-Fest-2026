import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/config/seo';

/**
 * Centralized Route Release Configuration
 * Controls which pages are publicly visible vs displaying a Coming Soon card.
 *
 * Rules:
 * - Only verified, production-ready pages should be set to 'live'.
 * - Unfinished pages remain in the repository in /components/pages/ and show a polished ComingSoonPage.
 * - Sitemaps and SEO indexing dynamically respect this configuration.
 * - Unreleased/coming-soon pages automatically emit 'noindex, follow' so Google does not index placeholder content.
 */

export type PageStatus = 'live' | 'coming-soon';

export interface RouteConfig {
  path: string;
  name: string;
  status: PageStatus;
  title: string;
  description: string;
}

export const ROUTE_RELEASE_CONFIG: Record<string, RouteConfig> = {
  home: {
    path: '/',
    name: 'Home',
    status: 'live',
    title: `${SITE_CONFIG.brandName} | SRM University-AP`,
    description: 'Qiskit Fall Fest SRMAP 2026 — SRM University-AP × IBM Quantum. A global technology and quantum computing gathering celebrating a decade of quantum on cloud.',
  },
  about: {
    path: '/about',
    name: 'About',
    status: 'live',
    title: `About the Festival | ${SITE_CONFIG.brandName}`,
    description: 'Learn about the mission, partnership with IBM Quantum, and vision behind Qiskit Fall Fest SRMAP 2026 at SRM University-AP.',
  },
  experience: {
    path: '/experience',
    name: 'Experience',
    status: 'live',
    title: `Experience Tracks & Quantum Workshops | ${SITE_CONFIG.brandName}`,
    description: 'Immersive quantum computing workshops, error mitigation labs, pulse-level control masterclasses, and technical tracks at SRM University-AP.',
  },
  schedule: {
    path: '/schedule',
    name: 'Schedule',
    status: 'live',
    title: `Event Schedule & Itinerary | ${SITE_CONFIG.brandName}`,
    description: 'Detailed two-tier event timeline: Online Phase (Oct 5–13) masterclasses and Onsite Campus Phase (Oct 26–30) keynote and 24h hackathon.',
  },
  venues: {
    path: '/venues',
    name: 'Venues',
    status: 'live',
    title: `Campus Atlas & Venues | ${SITE_CONFIG.brandName}`,
    description: 'Interactive SRM University-AP campus atlas, academic blocks, research laboratories, and festival facilities in Amaravati.',
  },
  team: {
    path: '/team',
    name: 'Team',
    status: 'live',
    title: `Leadership & Organizing Team | ${SITE_CONFIG.brandName}`,
    description: 'Meet the organizing committee, faculty patrons, and student leadership behind Qiskit Fall Fest SRMAP 2026.',
  },
  'team/organizing': {
    path: '/team/organizing',
    name: 'Organizing Team',
    status: 'coming-soon',
    title: `Organizing Committee Hierarchy | ${SITE_CONFIG.brandName}`,
    description: 'Organizing committee, advisory board, and cell heads for Qiskit Fall Fest SRMAP 2026.',
  },
  'team/website': {
    path: '/team/website',
    name: 'Website Team',
    status: 'coming-soon',
    title: `Website & Engineering Cell | ${SITE_CONFIG.brandName}`,
    description: 'Design and engineering contributors for the Qiskit Fall Fest SRMAP 2026 digital platform.',
  },
  faqs: {
    path: '/faqs',
    name: 'FAQs',
    status: 'coming-soon',
    title: `Frequently Asked Questions | ${SITE_CONFIG.brandName}`,
    description: 'Answers to registration, hardware access quotas, prerequisites, and participation inquiries for Qiskit Fall Fest SRMAP 2026.',
  },
  privacy: {
    path: '/privacy',
    name: 'Privacy Policy',
    status: 'coming-soon',
    title: `Privacy Statement | ${SITE_CONFIG.brandName}`,
    description: 'Official privacy statement and data handling principles for Qiskit Fall Fest SRMAP 2026.',
  },
  terms: {
    path: '/terms',
    name: 'Terms of Service',
    status: 'coming-soon',
    title: `Terms & Participation Rules | ${SITE_CONFIG.brandName}`,
    description: 'Event participation rules, hackathon conduct, and legal terms for Qiskit Fall Fest SRMAP 2026.',
  },
  accessibility: {
    path: '/accessibility',
    name: 'Accessibility',
    status: 'coming-soon',
    title: `Accessibility Statement | ${SITE_CONFIG.brandName}`,
    description: 'Campus accessibility commitments, mobility access, and assistive services at SRM University-AP.',
  },
};

export function isRouteLive(routeKey: string): boolean {
  return ROUTE_RELEASE_CONFIG[routeKey]?.status === 'live';
}

/**
 * Returns complete Next.js Metadata with Google Site Name signals,
 * canonical URLs, OpenGraph, and automatic 'noindex' protection on coming-soon routes.
 */
export function getRouteMetadata(routeKey: string): Metadata {
  const config = ROUTE_RELEASE_CONFIG[routeKey];
  if (!config) {
    return {
      title: SITE_CONFIG.brandName,
    };
  }

  const isLive = config.status === 'live';
  const url = `${SITE_CONFIG.primaryDomain}${config.path === '/' ? '' : config.path}`;

  if (!isLive) {
    return {
      title: config.title,
      description: config.description,
      robots: {
        index: false,
        follow: true,
        googleBot: {
          index: false,
          follow: true,
        },
      },
    };
  }

  return {
    title: config.title,
    description: config.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: config.title,
      description: config.description,
      url,
      siteName: SITE_CONFIG.brandName,
      type: 'website',
      images: [
        {
          url: `${SITE_CONFIG.primaryDomain}/og-image.png`,
          width: 1200,
          height: 630,
          alt: `${config.title} - ${SITE_CONFIG.brandName}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: config.title,
      description: config.description,
      images: [`${SITE_CONFIG.primaryDomain}/og-image.png`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
  };
}
