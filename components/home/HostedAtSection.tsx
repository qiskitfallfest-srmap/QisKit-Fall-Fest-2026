import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ResponsivePicture } from '@/components/shared/ResponsivePicture';

export function HostedAtSection() {
  return (
    <section
      id="section-07-hosted-at"
      aria-labelledby="hosted-at-heading"
      className="
        relative isolate w-full overflow-hidden
        bg-[#F5F0EA] dark:bg-[#0D0909]
        min-h-[calc(100svh-var(--navbar-height,80px))]
        flex flex-col justify-center
        transition-colors duration-300
      "
    >
      {/* =========================================================
          BACKGROUND ARTWORK LAYER (Embedded Campus Visuals)
      ========================================================== */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 select-none overflow-hidden"
      >
        <ResponsivePicture
          page="home"
          index={3}
          alt="SRM University-AP Campus Visual"
          fill
        />

        {/* Desktop & Tablet Soft Readability Gradient Protecting Left Editorial Region */}
        <div
          aria-hidden="true"
          className="
            hidden sm:block pointer-events-none absolute inset-0 z-[1]
            bg-[linear-gradient(90deg,rgba(245,240,234,0.92)_0%,rgba(245,240,234,0.72)_36%,rgba(245,240,234,0.20)_52%,transparent_66%)]
            dark:bg-[linear-gradient(90deg,rgba(13,9,9,0.95)_0%,rgba(13,9,9,0.82)_36%,rgba(13,9,9,0.30)_52%,transparent_66%)]
          "
        />

        {/* Mobile Readability Gradient */}
        <div
          aria-hidden="true"
          className="
            sm:hidden pointer-events-none absolute inset-0 z-[1]
            bg-gradient-to-t from-[#F5F0EA] via-[#F5F0EA]/85 to-transparent
            dark:from-[#0D0909] dark:via-[#0D0909]/85 dark:to-transparent
          "
        />
      </div>

      {/* =========================================================
          CONTENT CONTAINER (46% Editorial Grid / 54% Campus Artwork)
      ========================================================== */}
      <div
        className="
          relative z-10 w-full max-w-[1920px] mx-auto
          px-5 sm:px-8 md:px-12 lg:px-16 xl:px-[70px] 2xl:px-[82px] min-[1920px]:px-[96px]
          py-12 sm:py-16 md:py-20 lg:py-24
          min-h-[calc(100svh-var(--navbar-height,80px))]
          flex flex-col justify-center
          lg:grid lg:grid-cols-[46%_54%] lg:items-center
        "
      >
        {/* Left Editorial Block */}
        <div
          className="
            relative z-10 w-full max-w-[430px]
            lg:justify-self-start
          "
        >
          {/* Eyebrow */}
          <div className="flex items-center gap-[10px] mb-2 sm:mb-2.5">
            <span
              aria-hidden="true"
              className="w-[5px] h-[5px] rotate-45 shrink-0 bg-[#8F1723] dark:bg-[#EF7481]"
            />
            <span className="font-sans font-bold text-[11px] sm:text-[11.5px] tracking-[0.20em] uppercase text-[#8F1723] dark:text-[#EF7481]">
              HOSTED AT
            </span>
          </div>

          {/* Heading */}
          <h2
            id="hosted-at-heading"
            className="
              font-serif font-bold uppercase
              tracking-[-0.025em] leading-[0.98]
              text-[34px] sm:text-[38px] lg:text-[37px] xl:text-[41px] 2xl:text-[44px] min-[1600px]:text-[47px] min-[1920px]:text-[50px]
              text-[#67121B] dark:text-[#FFF1EE]
            "
          >
            <span className="block">SRM UNIVERSITY-AP</span>
            <span className="block mt-0.5">AMARAVATI</span>
          </h2>

          {/* Description */}
          <p
            className="
              mt-[14px] sm:mt-[16px] lg:mt-[17px]
              max-w-[390px]
              font-sans font-normal
              text-[13px] sm:text-[13.5px] lg:text-[13px] xl:text-[14px] 2xl:text-[14.5px]
              leading-[1.48]
              text-[#453D3A] dark:text-[#DDD3D0]
            "
          >
            A world-class campus, a global stage. Experience innovation, collaboration, and community at the heart of Amaravati.
          </p>

          {/* CTA Button */}
          <div className="mt-[18px] sm:mt-[20px] lg:mt-[21px]">
            <Link
              href="/venues"
              data-cursor="cta"
              aria-label="Explore Venues"
              className="
                group inline-flex items-center justify-center gap-2.5
                h-[46px] sm:h-[48px] min-w-[160px] sm:min-w-[164px]
                px-[20px] sm:px-[22px]
                rounded-[4px]
                bg-[#8F1723] text-[#FFF7F4]
                border border-[#8F1723] dark:border-[rgba(240,116,129,0.58)]
                font-sans font-semibold text-[12.5px] tracking-[0.03em]
                transition-all duration-190 ease-out
                hover:bg-[#A51D2B] hover:-translate-y-[1px]
                hover:shadow-[0_8px_22px_rgba(91,12,22,0.16)]
                dark:hover:shadow-[0_8px_22px_rgba(239,116,129,0.22)]
              "
            >
              <span>Explore Venues</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-190 ease-out group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Right Column Spacer for desktop (allows background campus visual & SRM monument to breathe) */}
        <div aria-hidden="true" className="hidden lg:block h-full w-full pointer-events-none" />
      </div>
    </section>
  );
}
