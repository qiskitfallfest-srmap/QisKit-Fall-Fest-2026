'use client';

import * as React from 'react';
import Image from 'next/image';
import { ArrowRight, Globe2, Gem, UsersRound, BarChart3 } from 'lucide-react';
import { NAVBAR_JOIN_HREF } from '@/components/shared/Navbar';

const GLOBAL_ASSETS = {
  light: '/ABOUT-05-GLOBAL-MOVEMENT-MOUNTAINS-LIGHT.png',
  dark: '/ABOUT-05-GLOBAL-MOVEMENT-MOUNTAINS-DARK.png',
};

interface MovementItemProps {
  icon: React.ElementType;
  line1: string;
  line2: string;
}

function MovementItem({ icon: Icon, line1, line2 }: MovementItemProps) {
  return (
    <div className="flex min-w-0 flex-col items-center px-3 text-center sm:border-r sm:border-[#8F1723]/22 sm:last:border-r-0 dark:sm:border-white/18">
      <Icon
        className="h-7 w-7 shrink-0 text-[#8F1723] dark:text-[#F07884]"
        strokeWidth={1.65}
        aria-hidden="true"
      />
      <p className="mt-2.5 text-[12px] md:text-[13px] xl:text-[13px] font-semibold leading-[1.28] text-[#261D1B] dark:text-[#FFF9F7] font-sans">
        <span className="block">{line1}</span>
        <span className="block">{line2}</span>
      </p>
    </div>
  );
}

export function AboutGlobalMovement() {
  return (
    <section
      id="section-05-global-movement"
      aria-labelledby="global-movement-title"
      className="relative isolate overflow-hidden bg-[#F7F1EC] dark:bg-[#160608] min-h-[420px] xl:min-h-[clamp(420px,23vw,480px)] scroll-mt-24 md:scroll-mt-28 transition-colors duration-300"
    >
      {/* Artwork Layer with Tuned Horizon/Mountain Focal Points */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Image
          src={GLOBAL_ASSETS.light}
          alt=""
          fill
          sizes="100vw"
          quality={88}
          referrerPolicy="no-referrer"
          className="object-cover dark:hidden object-[56%_100%] md:object-[54%_100%] xl:object-[51%_100%]"
        />
        <Image
          src={GLOBAL_ASSETS.dark}
          alt=""
          fill
          sizes="100vw"
          quality={88}
          referrerPolicy="no-referrer"
          className="hidden object-cover dark:block object-[57%_100%] md:object-[55%_100%] xl:object-[52%_100%]"
        />
      </div>

      {/* Main Readability Gradients */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[1] pointer-events-none bg-[linear-gradient(90deg,#F7F1EC_0%,rgba(247,241,236,0.99)_29%,rgba(247,241,236,0.91)_42%,rgba(247,241,236,0.46)_56%,rgba(247,241,236,0.08)_69%,transparent_82%)] dark:bg-[linear-gradient(90deg,#160608_0%,rgba(22,6,8,0.99)_29%,rgba(22,6,8,0.91)_42%,rgba(22,6,8,0.46)_56%,rgba(22,6,8,0.08)_69%,transparent_82%)]"
      />

      {/* 43/57 Desktop Macro Grid Container */}
      <div className="relative z-10 mx-auto grid w-[92%] max-w-[1600px] gap-10 py-11 md:py-12 xl:min-h-[inherit] xl:grid-cols-[minmax(0,0.43fr)_minmax(0,0.57fr)] xl:items-center">
        {/* Left Editorial Region */}
        <div className="max-w-[620px]">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 font-mono text-[10px] sm:text-[11px] font-semibold tracking-[0.20em] uppercase text-[#8F1723] dark:text-[#E89BA5] mb-3">
            <span className="w-6 h-px bg-current opacity-60" />
            <span>A GLOBAL MOVEMENT</span>
          </div>

          {/* Heading - exactly 2 lines on desktop (>=1280px) */}
          <h2
            id="global-movement-title"
            className="font-serif text-[clamp(2.8rem,3.15vw,4.15rem)] leading-[0.95] tracking-[-0.025em] text-[#141213] dark:text-[#F8F4EF]"
          >
            <span className="block">BE PART OF</span>
            <span className="block xl:whitespace-nowrap">WHAT COMES NEXT</span>
          </h2>

          {/* Body Prose */}
          <p className="mt-5 max-w-[56ch] text-[15px] md:text-[16px] xl:text-[17px] leading-[1.6] text-[#342C29] dark:text-[#E7E0DC] font-sans">
            Join a global community that believes in the power of open science,
            collaboration, and real-world impact. Let’s build a brighter quantum
            tomorrow — together.
          </p>

          {/* Join the Movement CTA linking to exact Navbar Join destination */}
          <div className="mt-7">
            <a
              href={NAVBAR_JOIN_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex min-h-11 items-center gap-3 rounded-md bg-[#8F1723] px-6 py-3 text-[14px] font-semibold text-white transition-colors duration-200 hover:bg-[#961824] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8F1723] focus-visible:ring-offset-2"
            >
              <span>Join the Movement</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </a>
          </div>
        </div>

        {/* Right Feature Column: 4 Movement Benefit Items in unified coherent group */}
        <div className="w-full xl:place-self-center">
          <div className="w-full xl:flex xl:items-center xl:justify-end">
            <div className="relative w-full max-w-[760px] xl:ml-auto">
              {/* Soft local contrast field protecting benefit readability from bright highlights */}
              <div
                aria-hidden="true"
                className="absolute -inset-x-8 -inset-y-10 -z-10 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(247,241,236,0.72)_0%,rgba(247,241,236,0.34)_42%,rgba(247,241,236,0.08)_64%,transparent_78%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(15,4,6,0.82)_0%,rgba(15,4,6,0.46)_43%,rgba(15,4,6,0.10)_66%,transparent_80%)]"
              />

              <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-4">
                <MovementItem
                  icon={Globe2}
                  line1="Global"
                  line2="Network"
                />
                <MovementItem
                  icon={Gem}
                  line1="Real"
                  line2="Opportunities"
                />
                <MovementItem
                  icon={UsersRound}
                  line1="Diverse"
                  line2="Community"
                />
                <MovementItem
                  icon={BarChart3}
                  line1="Lasting"
                  line2="Impact"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right/Bottom Microcopy */}
      <div className="hidden lg:block absolute bottom-[7%] right-[4%] z-20 text-right font-mono text-[9px] xl:text-[10px] uppercase tracking-[0.17em] leading-[1.5] text-[#6C151E]/88 dark:text-[#F1E7E3]/82">
        <span className="block">SAME IDEAS.</span>
        <span className="block">BRIGHTER HORIZONS.</span>
      </div>
    </section>
  );
}
