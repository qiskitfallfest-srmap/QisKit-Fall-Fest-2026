import * as React from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { REGISTRATION_URL } from '@/lib/constants';
import { ResponsivePicture } from '@/components/shared/ResponsivePicture';

const SIDE_WORDS = [
  'PEOPLE',
  'IDEAS',
  'TECHNOLOGY',
  'A BRIGHTER',
  'TOMORROW',
];

export function ReadyToTakePartSection() {
  return (
    <section
      id="section-08-ready-to-take-part"
      aria-labelledby="ready-to-take-part-heading"
      className="
        relative isolate w-full overflow-hidden
        bg-[#F5EFEA] dark:bg-[#160608]
        min-h-[calc(100svh-var(--navbar-height,80px))]
        flex flex-col justify-center
        transition-colors duration-300
      "
    >
      {/* =========================================================
          BACKGROUND ARTWORK LAYER (Cinematic Quantum Globe/Network)
      ========================================================== */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 select-none overflow-hidden"
      >
        <ResponsivePicture
          page="home"
          index={4}
          alt="Ready to Take Part Background"
          fill
        />

        {/* Minimal Readability Gradients (preserves native background art) */}
        <div
          className="
            absolute inset-0 dark:hidden pointer-events-none
            [background:linear-gradient(90deg,rgba(247,241,237,0.16)_0%,rgba(247,241,237,0.04)_34%,transparent_52%)]
          "
        />
        <div
          className="
            absolute inset-0 hidden dark:block pointer-events-none
            [background:linear-gradient(90deg,rgba(16,4,6,0.16)_0%,rgba(16,4,6,0.04)_34%,transparent_52%)]
          "
        />
      </div>

      {/* =========================================================
          CONTENT CONTAINER
      ========================================================== */}
      <div
        className="
          relative z-10 w-full max-w-[1920px] mx-auto
          px-5 sm:px-9 md:px-12 lg:px-12 xl:px-[58px] 2xl:px-[64px] min-[1600px]:px-[72px] min-[1920px]:px-[82px]
          py-12 sm:py-16 md:py-20 lg:py-24
          min-h-[calc(100svh-var(--navbar-height,80px))]
          flex flex-col justify-center
        "
      >
        {/* Left Editorial Block */}
        <div
          className="
            relative z-10 w-full
            max-w-[320px] md:w-[43%] md:max-w-[380px]
            lg:w-[34%] xl:w-[32%] 2xl:w-[31%] xl:max-w-[470px]
          "
        >
          {/* Structural Line (Desktop) */}
          <div
            aria-hidden="true"
            className="
              hidden lg:flex flex-col items-center
              absolute -left-4 xl:-left-5 2xl:-left-6 top-1 bottom-3 w-[1px]
              bg-[rgba(143,23,35,0.68)] dark:bg-[rgba(239,116,129,0.72)]
              pointer-events-none select-none
            "
          >
            <span className="w-[5px] h-[5px] rounded-full bg-[#8F1723] dark:bg-[#EF7481] -translate-y-1/2" />
          </div>

          {/* Eyebrow */}
          <div className="flex items-center gap-[10px] mb-2 sm:mb-2.5">
            <span
              aria-hidden="true"
              className="w-[5px] h-[5px] rotate-45 shrink-0 bg-[#FFB3BA] dark:bg-[#EF7481]"
            />
            <span className="font-sans font-bold text-[11px] xl:text-[12px] tracking-[0.20em] uppercase text-[#FFB3BA] dark:text-[#EF7481]">
              BE PART OF IT
            </span>
          </div>

          {/* Heading */}
          <h2
            id="ready-to-take-part-heading"
            className="
              font-serif font-bold
              tracking-[-0.035em] leading-[0.92]
              text-[40px] md:text-[clamp(42px,3.2vw,48px)] xl:text-[clamp(46px,3.2vw,62px)]
              text-white dark:text-[#FFF2EF]
            "
          >
            <span className="block">Ready to</span>
            <span className="block">Take Part?</span>
          </h2>

          {/* Description */}
          <p
            className="
              mt-[16px] sm:mt-[18px]
              max-w-[430px]
              font-sans font-normal
              text-[13px] md:text-[13.5px] xl:text-[14px]
              leading-[1.52]
              text-white/85 dark:text-[#DED3D0]
            "
          >
            Join students, developers, researchers, and industry leaders at Qiskit Fall Fest 2026 — SRM University-AP × IBM.
          </p>

          {/* CTA Button */}
          <div className="mt-[20px] sm:mt-[22px] xl:mt-[24px]">
            <a
              href={REGISTRATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="cta"
              aria-label="Register Now on Unstop (opens in a new tab)"
              className="
                group inline-flex items-center justify-center gap-2.5
                h-[50px]
                w-full max-w-[285px] sm:w-[190px] xl:w-[205px]
                px-[24px] sm:px-[26px]
                rounded-[4px]
                bg-[#8F1723] text-[#FFF8F6]
                border border-[#8F1723]
                dark:bg-[linear-gradient(90deg,#77101B_0%,#9C1425_100%)]
                dark:border-[rgba(240,116,129,0.65)]
                font-sans font-semibold text-[13px] tracking-[0.03em]
                transition-all duration-200 ease-out
                hover:-translate-y-0.5 hover:brightness-[1.05]
                hover:shadow-[0_9px_26px_rgba(109,16,28,0.18)]
                dark:hover:shadow-[0_0_24px_rgba(208,54,72,0.18)]
              "
            >
              <span>Register Now</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 ease-out group-hover:translate-x-1" />
            </a>
          </div>
        </div>

        {/* =========================================================
            SIDE COPY (PEOPLE / IDEAS / TECHNOLOGY / A BRIGHTER / TOMORROW)
        ========================================================== */}
        <div
          aria-hidden="true"
          className="
            select-none pointer-events-none
            hidden md:flex flex-col
            absolute
            right-[26px] xl:right-[5.5%]
            top-1/2 -translate-y-1/2
            text-left
          "
        >
          <div
            className="
              font-sans font-semibold uppercase
              text-[8.5px] md:text-[9px] xl:text-[10px] 2xl:text-[10.5px]
              leading-[1.65] tracking-[0.16em]
              text-white/65 dark:text-[#D9C7C4]
            "
          >
            {SIDE_WORDS.map((word) => (
              <div key={word}>{word}</div>
            ))}
          </div>

          {/* Bottom crimson accent rule */}
          <div className="mt-[12px] w-[30px] h-[1px] bg-[#8F1723] dark:bg-[#F06B78]" />
        </div>
      </div>
    </section>
  );
}
