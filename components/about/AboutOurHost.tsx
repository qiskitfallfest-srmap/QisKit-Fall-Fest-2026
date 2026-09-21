'use client';

import * as React from 'react';
import { ResponsivePicture } from '@/components/shared/ResponsivePicture';
import { ArrowRight, Building2, UsersRound, MapPin } from 'lucide-react';

const HOST_ASSETS = {
  desktop: '/Assets2/desktop/about/3.png',
  laptop: '/Assets2/laptop/about/3.png',
  tablet: '/Assets2/tablet/about/3.png',
  mobile: '/Assets2/mobile/about/3.png',
};

interface HostFeatureProps {
  icon: React.ElementType;
  line1: string;
  line2: string;
}

function HostFeature({ icon: Icon, line1, line2 }: HostFeatureProps) {
  return (
    <div className="flex min-w-0 items-start gap-3 sm:border-r sm:border-[#8F1723]/20 dark:sm:border-white/15 sm:pr-4 sm:last:border-r-0">
      <Icon
        className="mt-0.5 h-6 w-6 shrink-0 text-[#8F1723] dark:text-[#E89BA5]"
        strokeWidth={1.7}
      />
      <p className="text-[12px] lg:text-[13px] leading-[1.4] text-[#332A27] dark:text-[#E4DDD9] font-sans">
        <span className="block font-medium">{line1}</span>
        <span className="block">{line2}</span>
      </p>
    </div>
  );
}

export function AboutOurHost() {
  return (
    <section
      id="section-03-our-host"
      aria-labelledby="our-host-title"
      className="relative isolate overflow-hidden min-h-[520px] lg:min-h-[clamp(520px,30vw,610px)] scroll-mt-24 md:scroll-mt-28 bg-[#F7F1EC] text-[#141213] dark:bg-[#0D0B0C] dark:text-[#F8F4EF] transition-colors duration-300"
    >
      {/* Full-Bleed Campus Artwork Layer (Responsive across all device perspectives) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        <ResponsivePicture
          page="about"
          index={3}
          desktop={HOST_ASSETS.desktop}
          laptop={HOST_ASSETS.laptop}
          tablet={HOST_ASSETS.tablet}
          mobile={HOST_ASSETS.mobile}
          alt="SRM University-AP XLab Campus"
          fill
          priority
          objectFit="cover"
          objectPosition="right center"
        />
      </div>

      {/* Calibrated Readability Gradient */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[1] pointer-events-none bg-[linear-gradient(90deg,#F7F1EC_0%,rgba(247,241,236,0.99)_31%,rgba(247,241,236,0.88)_43%,rgba(247,241,236,0.30)_55%,transparent_67%)] dark:bg-[linear-gradient(90deg,#0D0B0C_0%,rgba(13,11,12,0.99)_31%,rgba(13,11,12,0.88)_43%,rgba(13,11,12,0.30)_55%,transparent_67%)]"
      />

      {/* Desktop Grid Layout: 43% editorial content / 57% visual region */}
      <div className="relative z-10 mx-auto grid min-h-[inherit] w-[92%] max-w-[1600px] lg:grid-cols-[minmax(0,0.43fr)_minmax(0,0.57fr)]">
        <div className="flex flex-col justify-center py-[clamp(42px,4vw,64px)] pr-[clamp(20px,3vw,52px)]">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 font-mono text-[10px] sm:text-[11px] font-semibold tracking-[0.20em] uppercase text-burgundy dark:text-[#E89BA5] mb-3">
            <span className="w-6 h-px bg-current opacity-60" />
            <span>OUR HOST</span>
          </div>

          {/* Headline */}
          <h2
            id="our-host-title"
            className="font-serif text-[clamp(3.1rem,3.7vw,4.5rem)] leading-[0.92] tracking-[-0.025em] text-[#141213] dark:text-[#F8F4EF]"
          >
            <span className="block">SRM</span>
            <span className="block whitespace-nowrap">UNIVERSITY-AP</span>
          </h2>
          <p className="mt-2 text-[16px] md:text-[18px] tracking-[0.20em] font-semibold uppercase text-[#7A111B] dark:text-[#E9A6AD] font-mono">
            AMARAVATI
          </p>

          {/* Body Prose with enhanced readability */}
          <p className="mt-6 max-w-[58ch] text-[15px] md:text-[16px] xl:text-[17px] leading-[1.6] text-[#342C29] dark:text-[#E7E0DC] font-sans">
            A world-class campus, a global stage. SRM University-AP is proud to
            be a Partner Plus Host for Qiskit Fall Fest 2026, in collaboration with
            IBM, bringing together the quantum community in Amaravati.
          </p>

          {/* Explore Our Campus CTA linking to official virtual campus tour */}
          <div className="mt-7">
            <a
              href="https://www.srmap.edu.in/life-at-srmap/virtual-campus-tour/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-3 rounded-md bg-[#8F1723] px-6 py-3 text-[14px] font-semibold text-white transition-colors duration-200 hover:bg-[#961824] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8F1723] focus-visible:ring-offset-2"
            >
              <span>Explore Our Campus</span>
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          {/* Benefit Items Row with larger typography */}
          <div className="mt-9 grid max-w-[700px] grid-cols-1 gap-5 sm:grid-cols-3">
            <HostFeature
              icon={Building2}
              line1="Modern Infrastructure"
              line2="for Innovation"
            />
            <HostFeature
              icon={UsersRound}
              line1="Vibrant Student"
              line2="Community"
            />
            <HostFeature
              icon={MapPin}
              line1="Strategic Location"
              line2="in Amaravati"
            />
          </div>
        </div>

        {/* Reserved visual column for campus artwork */}
        <div aria-hidden="true" className="hidden lg:block pointer-events-none" />
      </div>

      {/* Desktop Floating Quote in Transition Zone */}
      <blockquote className="hidden lg:block absolute left-[48%] top-[19%] z-20 max-w-[210px] border-l-2 border-[#8F1723] dark:border-[#E89BA5] pl-4 font-serif italic text-[14px] xl:text-[15px] leading-[1.55] text-[#2C2422] dark:text-[#E6E0DD]">
        “A place where ideas, people and technology meet to shape tomorrow.”
        <span className="mt-4 block h-px w-8 bg-[#8F1723] dark:bg-[#E89BA5]" />
      </blockquote>

      {/* Right Editorial Microcopy */}
      <div className="hidden lg:block absolute bottom-[8%] right-[4%] z-20 text-right font-mono text-[9px] xl:text-[10px] uppercase tracking-[0.16em] leading-[1.5] text-[#6C151E]/80 dark:text-silver/80">
        <span className="block">WORLD-CLASS CAMPUS</span>
        <span className="block">GLOBAL OPPORTUNITIES</span>
        <span className="block">REAL-WORLD IMPACT</span>
      </div>
    </section>
  );
}
