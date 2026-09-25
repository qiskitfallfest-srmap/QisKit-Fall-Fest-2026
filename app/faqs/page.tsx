import React from 'react';
import type { Metadata } from 'next';
import { isRouteLive, getRouteMetadata } from '@/config/page-release';
import { ComingSoonPage } from '@/components/shared/ComingSoonPage';
import FAQsPageContent from '@/components/pages/FAQsPageContent';
import { JsonLd } from '@/components/shared/JsonLd';
import { generateBreadcrumbSchema, generateFAQSchema } from '@/config/seo';
import { FAQS_DATA } from '@/data/faqs';

export const metadata: Metadata = getRouteMetadata('faqs');

export default function FAQsPage() {
  if (isRouteLive('faqs')) {
    return (
      <>
        <JsonLd
          id="breadcrumb-faqs"
          schema={generateBreadcrumbSchema([{ name: 'FAQs', path: '/faqs' }])}
        />
        <JsonLd
          id="schema-faqs"
          schema={generateFAQSchema(FAQS_DATA)}
        />
        <FAQsPageContent />
      </>
    );
  }

  return (
    <ComingSoonPage
      pageTitle="Frequently Asked Questions"
      sectionSubtitle="Detailed answers regarding eligibility, hackathon tracks, quantum hardware quotas, and campus accommodation will be made live shortly."
      categoryName="EVENT INQUIRIES"
    />
  );
}
