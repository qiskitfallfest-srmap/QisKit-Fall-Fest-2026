/**
 * Master Technical SEO & Structured Data Configuration
 * Central source of truth for Google Site Names, OpenGraph, Canonical URLs, and Schema.org JSON-LD.
 *
 * Rules:
 * - Brand Name must remain strictly consistent across JSON-LD, OpenGraph, and title prefixes.
 * - Primary domain is https://www.qffsrmap2026.com
 * - Official SRM University-AP Event Portal is https://events.srmap.edu.in/event/qiskit-fall-fest-2026/
 */

export const SITE_CONFIG = {
  brandName: 'Qiskit Fall Fest SRMAP 2026',
  shortName: 'QFF SRMAP 2026',
  alternateNames: [
    'Qiskit Fall Fest 2026',
    'QFF SRMAP 2026',
    'QFF 2026',
    'Qiskit Fall Fest',
    'Qiskit Fall Fest SRM University-AP',
  ],
  primaryDomain: 'https://www.qffsrmap2026.com',
  officialEventUrl: 'https://events.srmap.edu.in/event/qiskit-fall-fest-2026/',
  registrationUrl: 'https://unstop.com', // Launches 25 September 2026
  description:
    'Qiskit Fall Fest SRMAP 2026 — SRM University-AP × IBM Quantum. A premier 5-day technology summit and quantum hackathon celebrating a decade of quantum on cloud.',
  locale: 'en_US',
  social: {
    twitterHandle: '@Qiskit',
    twitterCreator: '@SRMUniversityAP',
  },
  dates: {
    startDate: '2026-10-05T09:00:00+05:30',
    endDate: '2026-10-30T18:00:00+05:30',
    onlinePhase: '2026-10-05 to 2026-10-13',
    campusPhase: '2026-10-26 to 2026-10-30',
  },
  location: {
    name: 'SRM University-AP Campus',
    streetAddress: 'Neerukonda, Mangalagiri Mandal',
    addressLocality: 'Amaravati',
    addressRegion: 'Andhra Pradesh',
    postalCode: '522240',
    addressCountry: 'IN',
  },
  images: {
    ogImage: '/og-image.png',
    favicon: '/favicon.ico',
    iconPng: '/icon.png',
    appleTouchIcon: '/apple-touch-icon.png',
    logoHorizontal: '/images/branding/srm-ap-logo-horizontal-backgroundless.png',
  },
} as const;

/**
 * 1. WebSite Structured Data (Google Site Names)
 * This is the exact schema required for Google Search to display the brand name above the URL.
 */
export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_CONFIG.brandName,
    alternateName: SITE_CONFIG.alternateNames,
    url: SITE_CONFIG.primaryDomain,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_CONFIG.primaryDomain}/experience?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * 2. Organization Structured Data
 * Dual-entity representation for SRM University-AP and IBM Quantum.
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'SRM University-AP',
    alternateName: ['SRMAP', 'SRM University Amaravati'],
    url: 'https://srmap.edu.in',
    sameAs: [
      SITE_CONFIG.officialEventUrl,
      'https://www.facebook.com/SRMUAP/',
      'https://twitter.com/SRMUniversityAP',
      'https://www.linkedin.com/school/srm-university-ap-amaravati/',
    ],
    logo: `${SITE_CONFIG.primaryDomain}${SITE_CONFIG.images.logoHorizontal}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE_CONFIG.location.streetAddress,
      addressLocality: SITE_CONFIG.location.addressLocality,
      addressRegion: SITE_CONFIG.location.addressRegion,
      postalCode: SITE_CONFIG.location.postalCode,
      addressCountry: SITE_CONFIG.location.addressCountry,
    },
  };
}

/**
 * 3. BreadcrumbList Structured Data
 * Helps Google render hierarchical breadcrumb navigation under search results.
 */
export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  const itemListElement = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: `${SITE_CONFIG.primaryDomain}/`,
    },
    ...items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 2,
      name: item.name,
      item: `${SITE_CONFIG.primaryDomain}${item.path.startsWith('/') ? item.path : `/${item.path}`}`,
    })),
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement,
  };
}

/**
 * 4. EventSeries Structured Data
 * Endorsed summit-level schema connected to the official university event URL.
 */
export function generateEventSeriesSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'EventSeries',
    name: SITE_CONFIG.brandName,
    alternateName: SITE_CONFIG.alternateNames,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.primaryDomain,
    sameAs: [SITE_CONFIG.officialEventUrl],
    startDate: SITE_CONFIG.dates.startDate,
    endDate: SITE_CONFIG.dates.endDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: SITE_CONFIG.location.name,
      address: {
        '@type': 'PostalAddress',
        streetAddress: SITE_CONFIG.location.streetAddress,
        addressLocality: SITE_CONFIG.location.addressLocality,
        addressRegion: SITE_CONFIG.location.addressRegion,
        postalCode: SITE_CONFIG.location.postalCode,
        addressCountry: SITE_CONFIG.location.addressCountry,
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
      url: SITE_CONFIG.officialEventUrl,
      validFrom: '2026-09-25T00:00:00+05:30',
    },
  };
}

/**
 * 5. FAQPage Structured Data
 * Schema for frequently asked questions to qualify for rich accordion snippets in SERP.
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
