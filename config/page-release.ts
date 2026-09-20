/**
 * Centralized Route Release Configuration
 * Controls which pages are publicly visible vs displaying a Coming Soon card.
 *
 * Rules:
 * - Only verified, production-ready pages should be set to 'live'.
 * - Unfinished pages remain in the repository in /components/pages/ and show a polished ComingSoonPage.
 * - Sitemaps and SEO indexing dynamically respect this configuration.
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
    title: 'Qiskit Fall Fest 2026 | SRM University-AP',
    description: 'Qiskit Fall Fest 2026 — SRM University-AP × IBM. A global technology and quantum computing gathering.',
  },
  about: {
    path: '/about',
    name: 'About',
    status: 'coming-soon',
    title: 'About | Qiskit Fall Fest 2026',
    description: 'Learn about the mission, partnership, and vision behind Qiskit Fall Fest 2026 at SRM University-AP.',
  },
  experience: {
    path: '/experience',
    name: 'Experience',
    status: 'coming-soon',
    title: 'Experience | Qiskit Fall Fest 2026',
    description: 'Immersive quantum computing workshops, hackathons, and technical tracks.',
  },
  schedule: {
    path: '/schedule',
    name: 'Schedule',
    status: 'coming-soon',
    title: 'Schedule | Qiskit Fall Fest 2026',
    description: 'Detailed event timeline, speaker tracks, keynotes, and hackathon schedules.',
  },
  venues: {
    path: '/venues',
    name: 'Venues',
    status: 'live',
    title: 'Campus Atlas & Venues | Qiskit Fall Fest 2026',
    description: 'Interactive SRM University-AP campus atlas, academic blocks, research laboratories, and facilities.',
  },
  team: {
    path: '/team',
    name: 'Team',
    status: 'coming-soon',
    title: 'Team | Qiskit Fall Fest 2026',
    description: 'Meet the organizing committee and student leadership behind Qiskit Fall Fest 2026.',
  },
  'team/organizing': {
    path: '/team/organizing',
    name: 'Organizing Team',
    status: 'coming-soon',
    title: 'Organizing Team | Qiskit Fall Fest 2026',
    description: 'Organizing committee and advisory board for Qiskit Fall Fest 2026.',
  },
  'team/website': {
    path: '/team/website',
    name: 'Website Team',
    status: 'coming-soon',
    title: 'Website Team | Qiskit Fall Fest 2026',
    description: 'Design and engineering contributors for the Qiskit Fall Fest 2026 digital platform.',
  },
  faqs: {
    path: '/faqs',
    name: 'FAQs',
    status: 'coming-soon',
    title: 'Frequently Asked Questions | Qiskit Fall Fest 2026',
    description: 'Answers to registration, hardware access, prerequisites, and participation inquiries.',
  },
  privacy: {
    path: '/privacy',
    name: 'Privacy Policy',
    status: 'coming-soon',
    title: 'Privacy Policy | Qiskit Fall Fest 2026',
    description: 'Official privacy statement and data handling principles for Qiskit Fall Fest 2026.',
  },
  terms: {
    path: '/terms',
    name: 'Terms of Service',
    status: 'coming-soon',
    title: 'Terms of Service | Qiskit Fall Fest 2026',
    description: 'Event participation rules, code of conduct, and legal terms for Qiskit Fall Fest 2026.',
  },
  accessibility: {
    path: '/accessibility',
    name: 'Accessibility',
    status: 'coming-soon',
    title: 'Accessibility Statement | Qiskit Fall Fest 2026',
    description: 'Accessibility commitments, campus access information, and assistive services.',
  },
};

export function isRouteLive(routeKey: string): boolean {
  return ROUTE_RELEASE_CONFIG[routeKey]?.status === 'live';
}
