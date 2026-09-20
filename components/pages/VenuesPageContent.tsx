import * as React from 'react';
import { CampusHero } from '@/components/campus/CampusHero';
import { CampusAtlasSection } from '@/components/campus/CampusAtlasSection';
import { GettingAroundSection } from '@/components/campus/GettingAroundSection';
import { PlanVisitCTA } from '@/components/campus/PlanVisitCTA';
import { Footer } from '@/components/shared/Footer';

export default function VenuesPageContent() {
  return (
    <div className="w-full flex flex-col min-h-screen">
      {/* 01 Hero — Explore Our Campus */}
      <CampusHero />



      {/* 03 Campus Map — Navigate the Fest (Full-width Interactive Atlas) */}
      <CampusAtlasSection />

      {/* 04 Getting Around — Before You Arrive Logistics Cards */}
      <GettingAroundSection />

      {/* 05 Closing Banner — Plan Your Visit */}
      <PlanVisitCTA />

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
