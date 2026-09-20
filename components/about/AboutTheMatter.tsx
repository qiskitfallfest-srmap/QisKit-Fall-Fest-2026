import * as React from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

const MATTER_ASSETS = {
  artworkLight: '/ABOUT-02-MATTER-LIGHT.png',
  artworkDark: '/ABOUT-02-MATTER-DARK.png',
};

function ProgressStep({ title, text }: { title: string; text: string }) {
  return (
    <div className="min-w-0">
      <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-[#E89BA5]">
        {title}
      </p>
      <p className="mt-1 max-w-[150px] text-[9px] leading-[1.45] text-[#D5CEC9]/80 font-sans">
        {text}
      </p>
    </div>
  );
}

export function AboutTheMatter() {
  return (
    <section
      id="section-02-the-matter"
      aria-labelledby="the-matter-title"
      className="relative isolate overflow-hidden min-h-[560px] lg:min-h-[clamp(560px,34vw,650px)] scroll-mt-24 md:scroll-mt-28 bg-[#190305] text-[#FAF6F3] transition-colors duration-300"
    >
      {/* Full-Bleed Matter Artwork with Bounded Object-Position */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Image
          src={MATTER_ASSETS.artworkLight}
          alt=""
          fill
          sizes="100vw"
          quality={88}
          referrerPolicy="no-referrer"
          className="object-cover dark:hidden object-[53%_50%] md:object-[52%_50%] lg:object-[50%_50%]"
        />
        <Image
          src={MATTER_ASSETS.artworkDark}
          alt=""
          fill
          sizes="100vw"
          quality={88}
          referrerPolicy="no-referrer"
          className="hidden object-cover dark:block object-[53%_50%] md:object-[52%_50%] lg:object-[50%_50%]"
        />
      </div>

      {/* Readability Gradient Protecting Text Legibility */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[1] pointer-events-none bg-[linear-gradient(90deg,rgba(25,3,5,0.98)_0%,rgba(25,3,5,0.90)_25%,rgba(25,3,5,0.58)_43%,rgba(25,3,5,0.08)_62%,transparent_72%)]"
      />

      {/* 3-Row Deterministic CSS Grid Layout System */}
      <div className="relative z-10 mx-auto grid min-h-[inherit] w-[92%] max-w-[1600px] grid-rows-[auto_1fr_auto] py-[clamp(36px,4vw,60px)]">
        {/* Row 1: Upper-Right Compact Progression Row */}
        <div className="row-start-1 w-full">
          {/* Desktop 4-column Progression Row */}
          <div className="hidden lg:grid lg:grid-cols-4 lg:gap-[clamp(18px,2.5vw,48px)] lg:ml-auto lg:w-[58%]">
            <ProgressStep
              title="INDIVIDUAL IDEAS"
              text="Curiosity sparks change."
            />
            <ProgressStep title="COLLABORATION" text="Ideas find people." />
            <ProgressStep title="COMMUNITY" text="People build together." />
            <ProgressStep
              title="IMPACT"
              text="A brighter quantum tomorrow."
            />
          </div>

          {/* Mobile/Tablet Compact 2-column Progression Grid */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:hidden mb-6">
            <ProgressStep
              title="INDIVIDUAL IDEAS"
              text="Curiosity sparks change."
            />
            <ProgressStep title="COLLABORATION" text="Ideas find people." />
            <ProgressStep title="COMMUNITY" text="People build together." />
            <ProgressStep
              title="IMPACT"
              text="A brighter quantum tomorrow."
            />
          </div>
        </div>

        {/* Row 2: Main Editorial Content */}
        <div className="row-start-2 self-center my-6 max-w-[520px] lg:max-w-[580px] xl:max-w-[620px]">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 font-mono text-[10px] sm:text-[11px] font-semibold tracking-[0.24em] uppercase text-[#E89BA5] mb-4">
            <span className="w-6 h-px bg-current opacity-60" />
            <span>THE MATTER</span>
          </div>

          {/* Title with Preserved Line Breaks */}
          <h2
            id="the-matter-title"
            className="font-serif text-[clamp(3.15rem,3.7vw,4.45rem)] leading-[0.96] tracking-[-0.025em] text-[#FAF6F3]"
          >
            <span className="block">MATTER</span>
            <span className="block">IS WHERE</span>
            <span className="block lg:whitespace-nowrap">IDEAS BECOME</span>
            <span className="block">POSSIBLE.</span>
          </h2>

          {/* Bounded Paragraph Measure */}
          <p className="mt-6 max-w-[540px] text-[clamp(0.95rem,1vw,1.05rem)] leading-[1.65] text-[#D5CEC9] font-sans">
            At Qiskit Fall Fest, we believe that big breakthroughs start with
            people coming together. From curiosity to collaboration, from learning
            to building — we turn possibilities into real impact.
          </p>

          {/* CTA Button */}
          <div className="mt-7">
            <a
              href="#section-03-our-host"
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 min-h-[44px] rounded-lg sm:rounded-xl bg-[#6C151E] text-ivory hover:bg-[#851D28] border border-[#A62837]/50 text-sm font-semibold tracking-wide transition-colors duration-200 shadow-md group focus:outline-none focus:ring-2 focus:ring-gold"
            >
              <span>Our Story</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </a>
          </div>
        </div>

        {/* Row 3: Bottom Captions Anchored to Lower Edge */}
        <div className="row-start-3 pt-6 border-t border-white/15">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[8px] uppercase tracking-[0.20em] text-white/60 font-mono">
            <span>FROM PARTICLES TO POSSIBILITIES</span>
            <span className="hidden sm:block h-px w-[clamp(60px,7vw,120px)] bg-white/20" />
            <span>QUANTUM FOR A BRIGHTER TOMORROW</span>
          </div>
        </div>
      </div>
    </section>
  );
}
