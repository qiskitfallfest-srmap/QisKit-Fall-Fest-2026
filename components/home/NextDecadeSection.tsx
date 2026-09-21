import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ResponsivePicture } from '@/components/shared/ResponsivePicture';

const NEXT_DECADE_ASSETS = {
  backgroundLight: '/images/home/next-decade/HOME-03-NEXT-DECADE-BACKGROUND-LIGHT.png',
  backgroundDark: '/images/home/next-decade/HOME-03-NEXT-DECADE-BACKGROUND-DARK.png',
};

const STATS = [
  {
    value: '200+',
    label: 'Host Institutions',
  },
  {
    value: 'Global',
    label: 'Qiskit Community',
  },
  {
    value: '10 Years',
    label: 'of Quantum on Cloud',
  },
];

export function NextDecadeSection() {
  return (
    <section
      id="section-03-the-next-decade-together"
      aria-label="The Next Decade Together"
      className="
        relative isolate w-full overflow-hidden
        bg-[#F7F2EC] text-[#1A1515]
        dark:bg-[#0C0909] dark:text-[#F8F2EF]
        transition-colors duration-300
      "
    >
      {/* =========================================================
          BACKGROUND ARTWORK LAYER (Cover image with precise focal positions)
      ========================================================== */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 select-none overflow-hidden"
      >
        <ResponsivePicture
          page="home"
          index={2}
          alt="The Next Decade Together Background"
          fill
        />

        {/* Subtle theme-aware overlay on mobile to keep copy crisp against central graphics */}
        <div
          className="
            absolute inset-0
            bg-gradient-to-b from-[#F7F2EC]/90 via-[#F7F2EC]/40 to-transparent
            dark:from-[#0C0909]/92 dark:via-[#0C0909]/45 dark:to-transparent
            sm:hidden
          "
        />

        {/* Desktop Readability Gradient: Protects heading without obscuring central globe artwork */}
        <div
          className="
            absolute inset-0 hidden lg:block dark:hidden pointer-events-none
            [background:linear-gradient(90deg,rgba(247,242,236,0.94)_0%,rgba(247,242,236,0.76)_19%,rgba(247,242,236,0.12)_39%,rgba(247,242,236,0)_55%)]
          "
        />
        <div
          className="
            absolute inset-0 hidden dark:lg:block pointer-events-none
            [background:linear-gradient(90deg,rgba(7,7,7,0.82)_0%,rgba(7,7,7,0.52)_20%,rgba(7,7,7,0.08)_40%,rgba(7,7,7,0)_56%)]
          "
        />
      </div>

      {/* =========================================================
          CONTENT CANVAS
          Mobile: Document flow with 3-col stats at bottom
          Tablet / Desktop: Relative spatial canvas with controlled dimensions
      ========================================================== */}
      <div
        className="
          relative z-10 w-full max-w-[1920px] mx-auto
          px-[22px] py-[38px] pb-[34px]
          sm:px-10 sm:py-11
          md:px-10 md:py-11 md:min-h-[500px]
          lg:px-16 lg:py-[54px] lg:pb-[48px] lg:min-h-[430px] lg:h-[clamp(430px,31vw,480px)]
          xl:px-[76px] xl:min-h-[450px] xl:h-[clamp(450px,29vw,500px)]
          2xl:px-[96px] 2xl:py-[60px] 2xl:pb-[52px] 2xl:h-[510px]
          flex flex-col justify-between
          md:block
        "
      >
        {/* -----------------------------------------------------
            ZONE 1: LEFT EDITORIAL BLOCK
            Heading + Crimson Marker + Body + CTA Link
        ------------------------------------------------------ */}
        <div
          className="
            relative z-20
            w-full
            sm:max-w-[420px]
            md:w-[46%] md:max-w-[360px] md:pt-4
            lg:w-[35%] lg:max-w-[390px] lg:pt-[14px]
            xl:w-[34%] xl:max-w-[420px] xl:pt-[18px]
            2xl:w-[33%] 2xl:max-w-[440px]
            min-[1600px]:w-[32%] min-[1600px]:max-w-[455px]
          "
        >
          {/* Heading with Vertical Crimson Marker */}
          <div className="relative">
            {/* Editorial Marker (Thin Crimson line with top & bottom nodes) */}
            <div
              aria-hidden="true"
              className="
                hidden md:flex flex-col items-center justify-between
                absolute -left-6 lg:-left-[31px] top-1 bottom-1 w-[1px]
                h-[calc(100%-3px)]
                bg-[rgba(132,18,31,0.76)] dark:bg-[rgba(239,93,110,0.82)]
                pointer-events-none select-none
              "
            >
              <span className="w-[5px] h-[5px] rounded-full bg-[#84121F] dark:bg-[#EF5D6E] -translate-y-1/2" />
              <span className="w-[5px] h-[5px] rounded-full bg-[#84121F] dark:bg-[#EF5D6E] translate-y-1/2" />
            </div>

            <h2
              className="
                font-serif font-bold uppercase
                tracking-[-0.038em] leading-[0.88]
                text-[38px] sm:text-[42px] md:text-[44px]
                lg:text-[46px] xl:text-[52px] 2xl:text-[56px]
                min-[1600px]:text-[60px] min-[1920px]:text-[64px]
                text-[#1A1515] dark:text-[#F8F2EF]
              "
            >
              <span className="block">THE</span>
              <span className="block whitespace-nowrap">NEXT DECADE</span>
              <span className="block">TOGETHER</span>
            </h2>
          </div>

          {/* Body Text */}
          <p
            className="
              mt-[20px] sm:mt-[22px] lg:mt-[24px]
              max-w-[310px] sm:max-w-[340px] md:max-w-[320px]
              lg:max-w-[365px] xl:max-w-[400px] 2xl:max-w-[425px]
              font-sans font-normal
              text-[13.5px] sm:text-[14px] lg:text-[14px] xl:text-[14.5px] 2xl:text-[15px] min-[1600px]:text-[15.5px]
              leading-[1.55]
              text-[#3E3836] dark:text-[#DDD4D1]
            "
          >
            Qiskit Fall Fest 2026 brings together students, developers, researchers, and
            industry leaders to learn, build, and share the future of quantum computing.
          </p>

          {/* CTA Link */}
          <div className="mt-[18px] sm:mt-[20px]">
            <Link
              href="/about"
              aria-label="Explore the event"
              className="
                group inline-flex items-center gap-[9px]
                text-[14px] font-semibold
                text-[#9B1725] hover:text-[#9B1725]/90
                dark:text-[#F17683] dark:hover:text-[#F17683]/90
                transition-all duration-180
              "
            >
              <span>Explore the event</span>
              <ArrowRight
                className="w-4 h-4 transition-transform duration-180 group-hover:translate-x-1"
                strokeWidth={2}
              />
            </Link>
          </div>
        </div>

        {/* -----------------------------------------------------
            ZONE 2: IBM QUANTUM QUOTE (Desktop 1024px+ only)
            Positioned cleanly in the negative space corridor between globe and stats
        ------------------------------------------------------ */}
        <div
          className="
            hidden lg:block absolute z-20
            lg:left-[60%] lg:top-[38%] lg:max-w-[175px]
            xl:left-[60.5%] xl:top-[38%] xl:max-w-[185px]
            2xl:left-[61%] 2xl:top-[37%] 2xl:max-w-[195px]
            min-[1600px]:left-[61.5%] min-[1600px]:top-[37%] min-[1600px]:max-w-[210px]
            min-[1920px]:left-[62%] min-[1920px]:top-[37%] min-[1920px]:max-w-[220px]
            bg-[rgba(248,243,238,0.56)] dark:bg-[rgba(8,7,7,0.35)]
            backdrop-blur-[4px] p-[8px_10px] rounded-[4px]
          "
        >
          <p
            className="
              font-sans font-normal italic
              text-[11.5px] xl:text-[12px] 2xl:text-[12.5px] min-[1600px]:text-[13px]
              leading-[1.5]
              text-[#312B29] dark:text-[#F0E9E6]
            "
          >
            &ldquo;Quantum computing is not just a technology shift, it’s a community
            movement.&rdquo;
          </p>
          <p
            className="
              mt-[9px]
              font-sans font-medium not-italic
              text-[11px]
              text-[#514845] dark:text-[#CABFBC]
            "
          >
            — IBM Quantum
          </p>
        </div>

        {/* -----------------------------------------------------
            ZONE 3: STATISTICS STACK
            Mobile: 3-column grid at bottom with spacious margin
            Tablet: Absolute vertical stack on right
            Desktop: Absolute vertical stack on right with stronger numerical presence
        ------------------------------------------------------ */}
        <div
          className="
            relative z-20
            mt-[205px] sm:mt-0
            grid grid-cols-3 gap-2
            sm:absolute sm:right-[4%] sm:top-[19%] sm:flex sm:flex-col sm:gap-[23px] sm:w-[22%] sm:min-w-[140px]
            md:right-[4%] md:top-[19%] md:gap-[23px] md:w-[22%]
            lg:right-[4.5%] lg:top-[17%] lg:gap-[28px] lg:w-[165px]
            xl:right-[5%] xl:top-[17%] xl:gap-[30px] xl:w-[175px]
            2xl:right-[5.5%] 2xl:top-[17%] 2xl:gap-[32px] 2xl:w-[185px]
            min-[1600px]:right-[6%] min-[1600px]:top-[17%] min-[1600px]:gap-[32px] min-[1600px]:w-[205px]
          "
        >
          {STATS.map((stat, idx) => (
            <div
              key={idx}
              className="
                group relative
                pl-[8px] sm:pl-[14px] lg:pl-[16px] xl:pl-[18px]
                transition-transform duration-180
                hover:sm:translate-x-[2px]
              "
            >
              {/* Crimson Accent Rule */}
              <div
                aria-hidden="true"
                className="
                  absolute left-0 top-[2px] bottom-[2px] w-[2px]
                  bg-[#A61C2B] dark:bg-[#EE6475]
                  transition-colors duration-180
                  group-hover:bg-[#C02638] dark:group-hover:bg-[#F88B98]
                "
              />

              {/* Stat Value */}
              <div
                className="
                  font-serif font-bold
                  text-[19px] sm:text-[21px] md:text-[22px]
                  lg:text-[23px] xl:text-[25px] 2xl:text-[27px] min-[1600px]:text-[29px] min-[1920px]:text-[30px]
                  leading-none
                  text-[#841522] dark:text-[#F08F9A]
                "
              >
                {stat.value}
              </div>

              {/* Stat Label */}
              <div
                className="
                  mt-[5px]
                  font-sans font-normal
                  text-[9.5px] sm:text-[11px]
                  lg:text-[11.5px] xl:text-[12px] 2xl:text-[12.5px] min-[1600px]:text-[13px]
                  leading-[1.35]
                  text-[#423B39] dark:text-[#E4DAD7]
                "
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
