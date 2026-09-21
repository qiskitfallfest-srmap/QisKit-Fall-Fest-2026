import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BriefcaseBusiness, Boxes, Atom, Users, ArrowRight } from 'lucide-react';

interface HighlightItem {
  id: string;
  title: string;
  tag: string;
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
    tag: 'WORKSHOPS',
    description: 'Learn from experts and get hands-on experience with Qiskit SDK & quantum circuits.',
    icon: BriefcaseBusiness,
    imageSrc: '/images/home/highlights/workshops.jpg',
    imageAlt: 'World-Class Quantum Workshops and hands-on laboratory sessions',
    href: '/experience',
  },
  {
    id: 'hackathons',
    title: 'Quantum Hackathons',
    tag: 'COMPETITION',
    description: 'Build real solutions to global quantum computing challenges in collaborative teams.',
    icon: Boxes,
    imageSrc: '/images/home/highlights/hackathons.jpg',
    imageAlt: 'Quantum Hackathon collaboration and software builds',
    href: '/experience',
  },
  {
    id: 'sessions',
    title: 'Inspiring Technical Sessions',
    tag: 'KEYNOTES',
    description: 'Explore state-of-the-art research, industry developments, and quantum algorithms.',
    icon: Atom,
    imageSrc: '/images/home/highlights/sessions.jpg',
    imageAlt: 'Keynotes and technical presentations on quantum computing',
    href: '/schedule',
  },
  {
    id: 'community',
    title: 'Global Community',
    tag: 'NETWORKING',
    description: 'Connect with a diverse and growing global ecosystem of quantum pioneers and researchers.',
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
          py-8 sm:py-10 lg:py-12 xl:py-14
          lg:min-h-[calc(100svh-88px)] lg:flex lg:flex-col lg:justify-between
        "
      >
        {/* =========================================================
            HEADER SECTION: Primary Title & Description Layout
        ========================================================== */}
        <div className="mb-8 lg:mb-10 xl:mb-12">
          {/* Eyebrow Label with Diamond Marker */}
          <div className="flex items-center gap-[10px] mb-3">
            <span
              aria-hidden="true"
              className="
                w-[6px] h-[6px] rotate-45 shrink-0
                bg-[#8F1723] dark:bg-[#EC7481]
              "
            />
            <span
              className="
                font-sans font-bold uppercase
                text-[11px] sm:text-[12px] lg:text-[13px]
                tracking-[0.2em] leading-none
                text-[#8F1723] dark:text-[#EC7481]
              "
            >
              EVENT HIGHLIGHTS
            </span>
          </div>

          {/* Dual Column Section Title & Description */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 pb-6 border-b border-[#8F1723]/15 dark:border-white/10">
            <h2
              id="highlights-heading"
              className="
                font-serif font-bold tracking-[-0.035em]
                text-[32px] sm:text-[40px] md:text-[46px] lg:text-[50px] 2xl:text-[56px]
                leading-[1.05] max-w-[780px]
                text-transparent bg-clip-text
                bg-[linear-gradient(90deg,#6C101A_0%,#3A090E_70%,#181313_100%)]
                dark:bg-[linear-gradient(90deg,#F5EDEB_0%,#EFB0B5_50%,#F5EDEB_100%)]
              "
            >
              Immersive Quantum Experiences & Tracks.
            </h2>

            <p
              className="
                font-sans font-normal
                text-[14px] sm:text-[15px] lg:text-[15.5px]
                leading-[1.6]
                text-[#5F5754] dark:text-[#BFB5B1]
                max-w-[440px] shrink-0
              "
            >
              From hands-on Qiskit SDK workshops and competitive hackathons to keynote sessions and global community networking at SRM University-AP.
            </p>
          </div>
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
            gap-4 sm:gap-5 xl:gap-6
          "
        >
          {HIGHLIGHTS.map((card) => {
            const IconComponent = card.icon;
            return (
              <article
                key={card.id}
                className="
                  group relative flex flex-col
                  rounded-[10px] overflow-hidden
                  bg-[#FBF7F3] dark:bg-[#121111]
                  border border-[rgba(108,21,30,0.14)] dark:border-[rgba(255,235,231,0.13)]
                  hover:border-[rgba(143,23,35,0.38)] dark:hover:border-[rgba(239,116,129,0.40)]
                  shadow-[0_8px_26px_rgba(67,30,32,0.05)] dark:shadow-[0_8px_28px_rgba(0,0,0,0.18)]
                  hover:shadow-[0_14px_36px_rgba(67,30,32,0.12)] dark:hover:shadow-[0_14px_38px_rgba(0,0,0,0.38)]
                  transition-all duration-300 ease-out
                  hover:-translate-y-1
                  min-h-[auto] sm:min-h-[290px] lg:min-h-[310px]
                "
              >
                {/* Image Top Area */}
                <div
                  className="
                    relative w-full overflow-hidden
                    h-[175px] sm:h-[135px] lg:h-[145px] 2xl:h-[160px]
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
                      transition-transform duration-500 ease-out
                      group-hover:scale-105
                    "
                    referrerPolicy="no-referrer"
                  />
                  {/* Subtle tonal wash to integrate seamlessly into dark/light surfaces */}
                  <div
                    aria-hidden="true"
                    className="
                      absolute inset-0 pointer-events-none
                      bg-gradient-to-t from-[#240609]/60 via-transparent to-transparent
                    "
                  />

                  {/* Category Tag Pill */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[9.5px] font-mono font-bold tracking-wider uppercase bg-[#181313]/80 dark:bg-black/80 backdrop-blur-md text-white border border-white/20">
                      {card.tag}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div
                  className="
                    flex flex-col flex-1
                    p-4 sm:p-5 lg:p-5
                  "
                >
                  {/* Title row with icon */}
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-1.5 rounded-md bg-[#8F1723]/10 dark:bg-[#EC7481]/15 text-[#8F1723] dark:text-[#EC7481]">
                      <IconComponent
                        aria-hidden="true"
                        strokeWidth={2}
                        className="w-4 h-4 shrink-0"
                      />
                    </div>
                    <h3
                      className="
                        font-sans font-bold
                        text-[15px] sm:text-[14.5px] xl:text-[15px]
                        leading-[1.25] tracking-[-0.01em]
                        text-[#261B1B] dark:text-[#F6F1EF]
                      "
                    >
                      {card.title}
                    </h3>
                  </div>

                  {/* Card Description */}
                  <p
                    className="
                      font-sans font-normal
                      text-[13px] sm:text-[12.5px] xl:text-[13px]
                      leading-[1.5]
                      text-[#665E5A] dark:text-[#BDB4B1]
                    "
                  >
                    {card.description}
                  </p>

                  {/* Card Action Link */}
                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-[#8F1723]/10 dark:border-white/10 mt-3">
                    <span className="text-[11.5px] font-semibold text-[#8F1723] dark:text-[#EC7481] group-hover:underline">
                      Explore Track
                    </span>
                    <Link
                      href={card.href}
                      aria-label={`View ${card.title}`}
                      className="
                        w-7 h-7 rounded-full shrink-0
                        bg-[#8F1723]/10 dark:bg-[#EC7481]/15
                        border border-[rgba(108,21,30,0.25)] dark:border-[rgba(240,116,129,0.30)]
                        flex items-center justify-center
                        text-[#8F1723] dark:text-[#EC7481]
                        transition-all duration-300
                        group-hover:translate-x-1 group-hover:bg-[#8F1723] group-hover:text-white
                        dark:group-hover:bg-[#EC7481] dark:group-hover:text-black
                      "
                    >
                      <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.2} />
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
