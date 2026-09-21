import * as React from 'react';
import {
  Box,
  Infinity as InfinityIcon,
  TrendingUp,
  Users,
} from 'lucide-react';

interface ImpactItem {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number | string }>;
}

const IMPACT_ITEMS: ImpactItem[] = [
  {
    title: 'LEARN',
    description: 'Gain new skills from global experts',
    icon: TrendingUp,
  },
  {
    title: 'BUILD',
    description: 'Turn ideas into real solutions',
    icon: Box,
  },
  {
    title: 'CONNECT',
    description: 'Be part of a global community',
    icon: Users,
  },
  {
    title: 'CREATE IMPACT',
    description: 'Shape a quantum future together',
    icon: InfinityIcon,
  },
];

export function ImpactStrip() {
  return (
    <section
      id="section-02-learn-build-connect-create-impact"
      aria-label="Learn, Build, Connect and Create Impact"
      className="
        relative isolate
        w-full
        overflow-hidden
        border-y
        border-[rgba(246,224,220,0.18)]
        dark:border-[rgba(255,238,235,0.14)]
        bg-[linear-gradient(100deg,#3B0B10_0%,#56111A_38%,#691722_68%,#3B0A10_100%)]
        dark:bg-[linear-gradient(100deg,#090909_0%,#101010_38%,#151011_68%,#090909_100%)]
      "
    >
      {/* Subtle ambient lighting overlay */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0 -z-10
          bg-[radial-gradient(ellipse_65%_150%_at_52%_50%,rgba(143,28,42,0.25),transparent_72%)]
          dark:bg-[radial-gradient(ellipse_60%_160%_at_50%_50%,rgba(105,20,30,0.16),transparent_72%)]
        "
      />

      <div
        className="
          mx-auto
          w-full
          max-w-[1920px]
          px-[18px]
          sm:px-[30px]
          lg:px-[48px]
          xl:px-[56px]
          2xl:px-[72px]
        "
      >
        <div
          className="
            grid
            grid-cols-1
            min-[360px]:grid-cols-2
            lg:grid-cols-4
            lg:h-[124px]
            2xl:h-[128px]
          "
        >
          {IMPACT_ITEMS.map((item, index) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className={`
                  group
                  relative
                  flex
                  items-center
                  min-h-[104px]
                  max-[359px]:min-h-[84px]
                  sm:min-h-[104px]
                  lg:min-h-0
                  lg:h-[124px]
                  2xl:h-[128px]
                  px-[14px]
                  py-[16px]
                  max-[359px]:px-4
                  max-[359px]:py-3.5
                  sm:px-6
                  sm:py-5
                  lg:px-[26px]
                  lg:py-0
                  2xl:px-[30px]
                  transition-colors
                  duration-[180ms]
                  ease-out
                  lg:hover:bg-white/[0.035]
                  dark:lg:hover:bg-white/[0.025]
                  ${
                    index >= 2
                      ? 'min-[360px]:border-t min-[360px]:border-[rgba(245,217,214,0.20)] min-[360px]:dark:border-[rgba(255,235,231,0.18)] lg:border-t-0'
                      : ''
                  }
                  ${
                    index > 0
                      ? 'max-[359px]:border-t max-[359px]:border-[rgba(245,217,214,0.20)] max-[359px]:dark:border-[rgba(255,235,231,0.18)]'
                      : ''
                  }
                `}
              >
                {/* Desktop 1px Vertical Separator between cells */}
                {index < 3 && (
                  <div
                    aria-hidden="true"
                    className="
                      hidden
                      lg:block
                      absolute
                      right-0
                      top-1/2
                      -translate-y-1/2
                      w-[1px]
                      h-[66px]
                      bg-[rgba(245,217,214,0.26)]
                      dark:bg-[rgba(255,235,231,0.22)]
                      pointer-events-none
                    "
                  />
                )}

                {/* Mobile/Tablet 2-Column Vertical Separator between columns (index 0 and 2) */}
                {index % 2 === 0 && (
                  <div
                    aria-hidden="true"
                    className="
                      hidden
                      min-[360px]:block
                      lg:hidden
                      absolute
                      right-0
                      top-1/2
                      -translate-y-1/2
                      w-[1px]
                      h-[58px]
                      sm:h-[68px]
                      bg-[rgba(245,217,214,0.20)]
                      dark:bg-[rgba(255,235,231,0.18)]
                      pointer-events-none
                    "
                  />
                )}

                {/* Subtle 2px bottom accent indicator on hover (desktop only) */}
                <div
                  aria-hidden="true"
                  className="
                    hidden
                    lg:block
                    absolute
                    bottom-0
                    left-[26px]
                    2xl:left-[30px]
                    h-[2px]
                    w-[40px]
                    bg-[#EF7481]
                    scale-x-0
                    group-hover:scale-x-100
                    origin-left
                    transition-transform
                    duration-[180ms]
                    ease-out
                    pointer-events-none
                  "
                />

                <div
                  className="
                    flex
                    w-full
                    items-center
                    gap-[11px]
                    sm:gap-[14px]
                    lg:gap-[15px]
                    2xl:gap-[16px]
                  "
                >
                  {/* Icon */}
                  <div
                    aria-hidden="true"
                    className="
                      shrink-0
                      flex
                      items-center
                      justify-center
                      text-[#F07985]
                      dark:text-[#EF7481]
                      transition-all
                      duration-[180ms]
                      ease-out
                      group-hover:scale-[1.07]
                      group-hover:text-[#FF909A]
                      dark:group-hover:text-[#FA8792]
                    "
                  >
                    <Icon
                      className="
                        h-[28px] w-[28px]
                        sm:h-[32px] sm:w-[32px]
                        lg:h-[34px] lg:w-[34px]
                        2xl:h-[36px] 2xl:w-[36px]
                      "
                      strokeWidth={1.9}
                    />
                  </div>

                  {/* Copy */}
                  <div className="min-w-0">
                    <h2
                      className="
                        font-sans
                        text-[14px]
                        sm:text-[16px]
                        lg:text-[16px]
                        2xl:text-[17px]
                        font-[750]
                        uppercase
                        tracking-[0.025em]
                        leading-[1.05]
                        text-[#FFF5F2]
                        dark:text-[#F8F2F0]
                        transition-colors
                        duration-[180ms]
                        group-hover:text-white
                        dark:group-hover:text-white
                      "
                    >
                      {item.title}
                    </h2>

                    <p
                      className="
                        mt-[5px]
                        text-[11px]
                        sm:text-[11.5px]
                        lg:text-[11.5px]
                        2xl:text-[12px]
                        font-[450]
                        leading-[1.4]
                        tracking-normal
                        text-[#DCCECB]
                        dark:text-[#BBB1AE]
                        max-w-[215px]
                        transition-colors
                        duration-[180ms]
                        group-hover:text-[#E8DBD8]
                        dark:group-hover:text-[#CEC3C0]
                      "
                    >
                      {item.description}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
