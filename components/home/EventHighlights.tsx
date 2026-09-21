import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BriefcaseBusiness, Boxes, Atom, Users, ArrowRight } from 'lucide-react';

interface HighlightItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  imageSrc: string;
  imageAlt: string;
  href: string;
}

const HIGHLIGHTS: HighlightItem[] = [
  {
    id: 'workshops',
    title: 'World-Class Workshops',
    description: 'Learn from experts and get hands-on with Qiskit.',
    icon: BriefcaseBusiness,
    imageSrc: '/images/home/highlights/workshops.jpg',
    imageAlt: 'World-Class Quantum Workshops and hands-on laboratory sessions',
    href: '/experience',
  },
  {
    id: 'hackathons',
    title: 'Quantum Hackathons',
    description: 'Build real solutions to global challenges.',
    icon: Boxes,
    imageSrc: '/images/home/highlights/hackathons.jpg',
    imageAlt: 'Quantum Hackathon collaboration and software builds',
    href: '/experience',
  },
  {
    id: 'sessions',
    title: 'Inspiring Technical Sessions',
    description: 'Explore the latest in quantum technology.',
    icon: Atom,
    imageSrc: '/images/home/highlights/sessions.jpg',
    imageAlt: 'Keynotes and technical presentations on quantum computing',
    href: '/schedule',
  },
  {
    id: 'community',
    title: 'Global Community',
    description: 'Connect with a diverse and growing quantum ecosystem.',
    icon: Users,
    imageSrc: '/images/home/highlights/community.jpg',
    imageAlt: 'Global quantum community networking and collaboration',
    href: '/team',
  },
];

export function EventHighlights() {
  return (
    <section
      id="section-04-event-highlights"
      aria-labelledby="highlights-heading"
      className="
        relative w-full overflow-hidden
        bg-[#F7F2ED] dark:bg-[#0A0909]
        transition-colors duration-300
      "
    >
      <div
        className="
          w-full max-w-[1920px] mx-auto
          px-5 sm:px-[34px] md:px-[54px] lg:px-[72px] 2xl:px-[92px]
          py-[30px] sm:py-[34px] md:py-[38px] lg:py-[42px] 2xl:py-[46px]
          pb-[36px] sm:pb-[42px] md:pb-[48px] lg:pb-[54px] 2xl:pb-[58px]
          lg:min-h-[calc(100svh-var(--navbar-height))] lg:flex lg:flex-col lg:justify-center
        "
      >
        {/* =========================================================
            HEADER ROW: Label on left, supporting text on right
        ========================================================== */}
        <div
          className="
            flex flex-col sm:flex-row sm:items-center sm:justify-between
            gap-y-2
            mb-[18px] sm:mb-[20px] lg:mb-[24px]
          "
        >
          {/* Eyebrow Label with Diamond Marker */}
          <div className="flex items-center gap-[10px]">
            <span
              aria-hidden="true"
              className="
                w-[6px] h-[6px] rotate-45 shrink-0
                bg-[#8F1723] dark:bg-[#EC7481]
              "
            />
            <h2
              id="highlights-heading"
              className="
                font-sans font-bold uppercase
                text-[11px] sm:text-[12px] lg:text-[13px]
                tracking-[0.18em] leading-none
                text-[#211718] dark:text-[#F7F1EE]
              "
            >
              EVENT HIGHLIGHTS
            </h2>
          </div>

          {/* Supporting line */}
          <p
            className="
              font-sans font-normal
              text-[11.5px] sm:text-[12px] lg:text-[12.5px]
              leading-[1.4]
              text-[#5F5754] dark:text-[#BFB5B1]
              text-left sm:text-right
            "
          >
            More than an event — a global movement.
          </p>
        </div>

        {/* =========================================================
            HIGHLIGHT CARDS GRID
            Desktop: 4 equal columns
            Tablet: 2x2 grid
            Mobile: 1 column
        ========================================================== */}
        <div
          className="
            grid grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-4
            gap-[14px] sm:gap-[16px] 2xl:gap-[18px]
          "
        >
          {HIGHLIGHTS.map((card) => {
            const IconComponent = card.icon;
            return (
              <article
                key={card.id}
                className="
                  group relative flex flex-col
                  rounded-[6px] overflow-hidden
                  bg-[#FBF7F3] dark:bg-[#121111]
                  border border-[rgba(108,21,30,0.14)] dark:border-[rgba(255,235,231,0.13)]
                  hover:border-[rgba(143,23,35,0.28)] dark:hover:border-[rgba(239,116,129,0.28)]
                  shadow-[0_8px_26px_rgba(67,30,32,0.05)] dark:shadow-[0_8px_28px_rgba(0,0,0,0.18)]
                  hover:shadow-[0_10px_30px_rgba(67,30,32,0.09)] dark:hover:shadow-[0_10px_32px_rgba(0,0,0,0.30)]
                  transition-all duration-200 ease-out
                  hover:-translate-y-[2px]
                  min-h-[auto] sm:min-h-[250px] lg:min-h-[258px] 2xl:min-h-[276px]
                "
              >
                {/* Image Top Area */}
                <div
                  className="
                    relative w-full overflow-hidden
                    h-[168px] sm:h-[122px] lg:h-[118px] 2xl:h-[128px]
                    bg-[#E9E2DC] dark:bg-[#191717]
                  "
                >
                  <Image
                    src={card.imageSrc}
                    alt={card.imageAlt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="
                      object-cover object-center
                      transition-transform duration-[220ms] ease-out
                      group-hover:scale-[1.025]
                    "
                    referrerPolicy="no-referrer"
                  />
                  {/* Subtle tonal wash to integrate seamlessly into dark/light surfaces */}
                  <div
                    aria-hidden="true"
                    className="
                      absolute inset-0 pointer-events-none
                      bg-[#3A0B10]/[0.06] dark:bg-[#000000]/[0.22]
                    "
                  />
                </div>

                {/* Card Body */}
                <div
                  className="
                    flex flex-col flex-1
                    p-4 lg:p-[16px_16px_14px] 2xl:p-[17px_18px_16px]
                  "
                >
                  {/* Title row with icon */}
                  <div className="flex items-center gap-2">
                    <IconComponent
                      aria-hidden="true"
                      strokeWidth={1.8}
                      className="
                        w-[17px] h-[17px] 2xl:w-[18px] 2xl:h-[18px] shrink-0
                        text-[#9B1E2C] dark:text-[#EF7481]
                      "
                    />
                    <h3
                      className="
                        font-sans font-bold
                        text-[14px] sm:text-[13px] 2xl:text-[13.5px]
                        leading-[1.2] tracking-[-0.01em]
                        text-[#261B1B] dark:text-[#F6F1EF]
                      "
                    >
                      {card.title}
                    </h3>
                  </div>

                  {/* Card Description */}
                  <p
                    className="
                      mt-[9px] max-w-[260px]
                      font-sans font-normal
                      text-[12.5px] sm:text-[11.5px] 2xl:text-[12px]
                      leading-[1.45]
                      text-[#665E5A] dark:text-[#BDB4B1]
                    "
                  >
                    {card.description}
                  </p>

                  {/* Card Action Link */}
                  <div className="mt-auto pt-3 flex justify-end">
                    <Link
                      href={card.href}
                      aria-label={`View ${card.title}`}
                      className="
                        w-[26px] h-[26px] rounded-full shrink-0
                        border border-[rgba(108,21,30,0.30)] dark:border-[rgba(240,116,129,0.40)]
                        flex items-center justify-center
                        text-[#8F1723] dark:text-[#F48A95]
                        transition-all duration-200
                        group-hover:translate-x-[2px]
                        group-hover:bg-[rgba(143,23,35,0.05)] dark:group-hover:bg-[rgba(239,116,129,0.06)]
                      "
                    >
                      <ArrowRight className="w-[13px] h-[13px]" strokeWidth={2} />
                    </Link>
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
