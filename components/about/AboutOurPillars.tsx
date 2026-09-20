'use client';

import * as React from 'react';
import Image from 'next/image';
import { Box, GraduationCap, Lightbulb, UsersRound } from 'lucide-react';

const PILLARS_ASSETS = {
  artworkLight: '/ABOUT-04-PILLARS-EARTH-LIGHT.png',
  artworkDark: '/ABOUT-04-PILLARS-EARTH-DARK.png',
};

interface PillarCardProps {
  icon: React.ElementType;
  title: string;
  text: string;
}

function PillarCard({ icon: Icon, title, text }: PillarCardProps) {
  return (
    <article className="group flex min-h-[168px] flex-col rounded-[6px] border border-white/22 bg-[#101011]/78 px-5 py-5 xl:min-h-[176px] xl:px-5 xl:py-5 transition-colors duration-200 hover:border-white/35 hover:bg-[#151415]/82">
      <Icon
        className="h-7 w-7 shrink-0 text-[#F3E8E4]"
        strokeWidth={1.45}
        aria-hidden="true"
      />
      <h3 className="mt-4 text-[16px] xl:text-[17px] font-semibold leading-[1.25] text-[#FFFDFC]">
        {title}
      </h3>
      <p className="mt-2 max-w-[25ch] text-[13px] md:text-[14px] leading-[1.55] text-[#D8D0CC] font-sans">
        {text}
      </p>
    </article>
  );
}

export function AboutOurPillars() {
  return (
    <section
      id="section-04-our-pillars"
      aria-labelledby="our-pillars-title"
      className="relative isolate overflow-hidden min-h-[500px] xl:min-h-[clamp(500px,28vw,570px)] scroll-mt-24 md:scroll-mt-28 bg-[#0B0B0C] text-[#F8F4EF] transition-colors duration-300"
    >
      {/* Full-Bleed Earth Artwork Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Image
          src={PILLARS_ASSETS.artworkLight}
          alt=""
          fill
          sizes="100vw"
          quality={88}
          referrerPolicy="no-referrer"
          className="object-cover dark:hidden object-[62%_50%] lg:object-[59%_50%] xl:object-[58%_50%] 2xl:object-[57%_50%]"
        />
        <Image
          src={PILLARS_ASSETS.artworkDark}
          alt=""
          fill
          sizes="100vw"
          quality={88}
          referrerPolicy="no-referrer"
          className="hidden object-cover dark:block object-[62%_50%] lg:object-[59%_50%] xl:object-[58%_50%] 2xl:object-[57%_50%]"
        />
      </div>

      {/* Readability Gradient Protecting Content/Cards */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[1] pointer-events-none bg-[linear-gradient(90deg,rgba(7,8,9,0.995)_0%,rgba(7,8,9,0.97)_36%,rgba(7,8,9,0.80)_54%,rgba(7,8,9,0.30)_70%,rgba(7,8,9,0.05)_84%,transparent_92%)]"
      />

      {/* 2-Row Macro Grid Container */}
      <div className="relative z-10 mx-auto grid min-h-[inherit] w-[92%] max-w-[1600px] grid-rows-[auto_1fr] py-[clamp(34px,2.8vw,50px)]">
        {/* Row 1: Top Heading & Intro Split */}
        <div className="grid gap-x-10 gap-y-5 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] lg:items-start">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-[10px] sm:text-[11px] font-semibold tracking-[0.20em] uppercase text-[#E89BA5] mb-3">
              <span className="w-6 h-px bg-current opacity-60" />
              <span>OUR PILLARS</span>
            </div>
            <h2
              id="our-pillars-title"
              className="font-serif text-[clamp(2.7rem,3vw,3.9rem)] leading-[0.96] tracking-[-0.025em] text-[#FAF6F3]"
            >
              <span className="block">A STRONGER</span>
              <span className="block xl:whitespace-nowrap">
                QUANTUM TOMORROW
              </span>
            </h2>
          </div>

          <div className="max-w-[58ch] lg:justify-self-start lg:pt-6">
            <p className="text-[15px] md:text-[16px] xl:text-[17px] leading-[1.6] text-[#E7E0DC] font-sans">
              Qiskit Fall Fest is built on four core pillars that guide our mission
              and help shape a more inclusive, innovative, and globally connected
              quantum community.
            </p>
          </div>
        </div>

        {/* Row 2: Four Pillar Cards Grid (73% width on xl desktop, reserving right space for Earth) */}
        <div className="self-end mt-[clamp(24px,2.4vw,36px)]">
          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:w-[73%] xl:grid-cols-4 xl:gap-3.5">
            <PillarCard
              icon={Box}
              title="Research"
              text="Advancing quantum knowledge through open collaboration."
            />
            <PillarCard
              icon={GraduationCap}
              title="Education"
              text="Empowering the next generation with accessible learning."
            />
            <PillarCard
              icon={Lightbulb}
              title="Innovation"
              text="Turning ideas into real-world solutions."
            />
            <PillarCard
              icon={UsersRound}
              title="Community"
              text="Building an open and inclusive ecosystem for everyone."
            />
          </div>
        </div>
      </div>

      {/* Right Editorial Microcopy */}
      <div className="hidden lg:block absolute bottom-[8%] right-[4%] z-20 font-mono text-[9px] xl:text-[10px] uppercase tracking-[0.16em] leading-[1.5] text-[#F4E9E5]/85 text-right">
        <span className="block">PEOPLE</span>
        <span className="block">IDEAS</span>
        <span className="block">TECHNOLOGY</span>
        <span className="block">A BRIGHTER</span>
        <span className="block">TOMORROW</span>
        <span className="mt-3 ml-auto block h-[2px] w-8 bg-[#E6334C]" />
      </div>
    </section>
  );
}
