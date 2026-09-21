import { HomeHero } from '@/components/home/HomeHero';
import { ImpactStrip } from '@/components/home/ImpactStrip';
import { NextDecadeSection } from '@/components/home/NextDecadeSection';
import { EventHighlights } from '@/components/home/EventHighlights';
import { CountdownSection } from '@/components/home/CountdownSection';
import { HostAndEcosystemSection } from '@/components/home/HostAndEcosystemSection';
import { HostedAtSection } from '@/components/home/HostedAtSection';
import { ReadyToTakePartSection } from '@/components/home/ReadyToTakePartSection';
import { Footer } from '@/components/shared/Footer';
import { ScrollSection } from '@/components/home/ScrollSection';
import { SectionScrollController } from '@/components/home/SectionScrollController';

export default function HomePage() {
  return (
    <div className="w-full flex flex-col relative">
      {/* Lenis-Style Smooth Scroll-Lock Transition Controller & HUD */}
      <SectionScrollController />

      {/* Slide 01: Hero Section */}
      <ScrollSection
        id="home-slide-1"
        num="01"
        title="Hero"
        tag="Festival Overview"
      >
        <HomeHero />
      </ScrollSection>

      {/* Slide 02: The Next Decade Together & Impact Strip */}
      <ScrollSection
        id="home-slide-2"
        num="02"
        title="Next Decade"
        tag="Impact & Vision"
        className="bg-[#F7F2EC] dark:bg-[#0C0909]"
      >
        <ImpactStrip />
        <NextDecadeSection />
      </ScrollSection>

      {/* Slide 03: Event Highlights (Workshops, Hackathons, Sessions, Community) */}
      <ScrollSection
        id="home-slide-3"
        num="03"
        title="Highlights"
        tag="Workshops & Hackathons"
      >
        <EventHighlights />
      </ScrollSection>

      {/* Slide 04: Host & Ecosystem (SRM University-AP, IBM Quantum, Qiskit) */}
      <ScrollSection
        id="home-slide-4"
        num="04"
        title="Ecosystem"
        tag="Host & Partners"
      >
        <HostAndEcosystemSection />
      </ScrollSection>

      {/* Slide 05: Phase Countdown Visuals */}
      <ScrollSection
        id="home-slide-5"
        num="05"
        title="Countdown"
        tag="Online Phase Countdown"
      >
        <CountdownSection />
      </ScrollSection>

      {/* Slide 06: Hosted At SRM-AP Campus Visuals */}
      <ScrollSection
        id="home-slide-6"
        num="06"
        title="Hosted At SRM-AP"
        tag="Campus & Host University"
      >
        <HostedAtSection />
      </ScrollSection>

      {/* Slide 07: Ready to Take Part Closing CTA */}
      <ScrollSection
        id="home-slide-7"
        num="07"
        title="Join In"
        tag="Ready to Take Part"
      >
        <ReadyToTakePartSection />
      </ScrollSection>

      {/* Slide 08: Global Festival Directory & Footer */}
      <ScrollSection
        id="home-slide-8"
        num="08"
        title="Directory"
        tag="Festival Information"
      >
        <Footer />
      </ScrollSection>
    </div>
  );
}
