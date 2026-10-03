'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CalendarDays, MapPin, Play } from 'lucide-react';
import { REGISTRATION_URL } from '@/lib/constants';
import { trackUnstopClick, trackEvent } from '@/lib/analytics';
import { ResponsivePicture } from '@/components/shared/ResponsivePicture';
import styles from './HomeHero.module.css';

const HERO_ASSETS = {
  backgroundLight: '/hero/HOME-01-HERO-BACKGROUND-LIGHT.png',
  backgroundDark: '/hero/HOME-01-HERO-BACKGROUND-DARK.png',

  // Single cryostat asset for both light and dark themes (actual dimensions: 1024 × 1535)
  cryostat: '/hero/HOME-01-HERO-CRYOSTAT-ORBITAL-LIGHT-02.png',

  // Right decorative globe assets (left globe has been completely removed)
  globeRightLight: '/hero/HOME-01-HERO-GLOBE-RIGHT-LIGHT.png',
  globeRightDark: '/hero/HOME-01-HERO-GLOBE-RIGHT-DARK.png',

  decadeLight: '/hero/HOME-01-HERO-DECADE-10-LIGHT.png',
  decadeDark: '/hero/HOME-01-HERO-DECADE-10-DARK.png',
};

interface EventMetaItem {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number | string }>;
  href?: string;
  ariaLabel?: string;
}

const EVENT_META: EventMetaItem[] = [
  {
    title: '8 – 10 OCT 2026',
    subtitle: 'Online Phase',
    icon: CalendarDays,
    href: '/schedule#online',
    ariaLabel: 'Online Phase Schedule: 8 to 10 October 2026',
  },
  {
    title: '26 – 30 OCT 2026',
    subtitle: 'On-Campus Phase',
    icon: CalendarDays,
    href: '/schedule#offline',
    ariaLabel: 'On-Campus Phase Schedule: 26 to 30 October 2026',
  },
  {
    title: 'SRM University-AP',
    subtitle: 'Amaravati, India',
    icon: MapPin,
  },
];

export function HomeHero() {
  return (
    <section
      id="section-01-hero"
      aria-labelledby="home-hero-title"
      className={`
        ${styles.heroSection}
        isolate w-full
        bg-[#F8F4EF] text-[#181313]
        dark:bg-[#100405] dark:text-[#F5F0EE]
      `}
    >
      {/* =========================================================
          LAYER 0: DEVICE-SPECIFIC THEME BACKGROUND (z-0)
          Widescreen Desktop (>=1280px), Laptop (1024-1279px),
          Tablet (768-1023px), and Mobile (<768px portrait)
      ========================================================== */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute
          inset-0 w-full h-full
          z-0 overflow-hidden
        "
      >
        {/* Light Theme Background Picture */}
        <picture className="w-full h-full block dark:hidden">
          <source
            media="(min-width: 1280px)"
            srcSet="/hero/HOME-HERO-BG-DESKTOP.png"
            type="image/png"
          />
          <source
            media="(min-width: 1024px)"
            srcSet="/hero/HOME-HERO-BG-LAPTOP.png"
            type="image/png"
          />
          <img
            src="/hero/HOME-01-HERO-BACKGROUND-LIGHT.png"
            alt="Qiskit Fall Fest 2026 Background"
            fetchPriority="high"
            className="w-full h-full object-cover object-center select-none"
          />
        </picture>

        {/* Dark Theme Background Picture */}
        <picture className="w-full h-full hidden dark:block">
          <img
            src="/hero/HOME-01-HERO-BACKGROUND-DARK.png"
            alt="Qiskit Fall Fest 2026 Background"
            fetchPriority="high"
            className="w-full h-full object-cover object-center select-none"
          />
        </picture>
      </div>

      {/* =========================================================
          HERO STAGE CONTAINER (FULL VIEWPORT COORDINATE SYSTEM)
          Mobile: Responsive flow with breathing room (px-6, pt-[34px], pb-[26px])
          Tablet & Desktop: Relative stage with absolute layered units.
      ========================================================== */}
      <div className="relative w-full h-full px-6 pt-[34px] pb-[26px] md:p-0">
        {/* =======================================================
            LAYER 4: MAIN TYPOGRAPHY AND CTAS (z-4)
            Governed by explicit height + width rules in styles.textBlock.
        ======================================================== */}
        <div className={styles.textBlock}>
          {/* Eyebrow */}
          <p
            className={`
              ${styles.eyebrow}
              font-bold
              uppercase
              tracking-[0.24em]
              leading-none
              text-[#A7192A]
              dark:text-[#F07B88]
            `}
          >
            <span className={styles.typewriterWrapper}>
              <span className={styles.typewriterText}>
                GLOBAL. OPEN. TOGETHER.
              </span>
              <span className={styles.typewriterCaret} aria-hidden="true" />
            </span>
          </p>

          {/* Headline with typography entrance and subtle luminous shimmer */}
          <h1
            id="home-hero-title"
            className={`
              ${styles.headline}
              ${styles.headlineShimmer}
              font-serif
              font-bold
              tracking-[-0.045em]
              m-0
              text-transparent
              bg-clip-text
              bg-[linear-gradient(90deg,#A7192A_0%,#851722_38%,#241617_85%)]
              dark:bg-[linear-gradient(90deg,#F07B88_0%,#F5A3AC_42%,#FDF5F2_100%)]
            `}
          >
            <span className={styles.animTitleLine1}>QISKIT</span>
            <span className={`${styles.animTitleLine2} whitespace-nowrap`}>FALL FEST</span>
            <span className={styles.animTitleLine3}>2026</span>
          </h1>

          {/* Host with continuous typewriter loop */}
          <div
            className={`
              ${styles.host}
              font-bold
              tracking-[0.01em]
              whitespace-nowrap
              text-[#211818]
              dark:text-[#F5E9E7]
            `}
          >
            {/* Accessible stable text for screen readers */}
            <span className="sr-only">SRM UNIVERSITY-AP × IBM</span>

            {/* Visual animated continuous typewriter */}
            <span className={styles.hostTypewriterContainer} aria-hidden="true">
              <span className={styles.hostGhost}>SRM UNIVERSITY-AP × IBM</span>
              <span className={styles.hostTypewriterText}>SRM UNIVERSITY-AP × IBM</span>
              <span className={styles.hostTypewriterCaret} />
            </span>
          </div>

          {/* Description */}
          <p
            className={`
              ${styles.description}
              ${styles.animDescription}
              font-normal
              text-[#4E4441]
              dark:text-[#D8CBC8]
            `}
          >
            Join a global celebration of quantum computing with workshops,
            technical sessions, hackathons and more — at SRM University-AP,
            Amaravati.
          </p>

          {/* CTAs */}
          <div
            className={`
              ${styles.ctaRow}
              ${styles.animCta}
              flex
              flex-row
              items-center
              flex-wrap
              min-[360px]:flex-nowrap
            `}
          >
            {/* Primary Register Button with Navbar Join Interaction Language */}
            <a
              href={REGISTRATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="cta"
              onClick={() => trackUnstopClick('home_hero')}
              className={`
                ${styles.registerBtn}
                group
                relative
                overflow-hidden
                inline-flex
                items-center
                justify-between
                rounded-[6px]
                border
                border-[rgba(193,46,63,0.85)]
                bg-[#A61629]
                dark:bg-[#921426]
                text-[#FFF9F6]
                dark:text-[#FFF5F3]
                shadow-[0_8px_22px_rgba(105,14,27,0.12)]
                dark:shadow-[0_7px_24px_rgba(0,0,0,0.20)]
                transition-[border-color,transform,box-shadow]
                duration-[250ms]
                ease-[cubic-bezier(0.22,1,0.36,1)]
                hover:-translate-y-[1px]
                outline-none
                focus-visible:ring-2
                focus-visible:ring-[#A7192A]/40
                focus-visible:ring-offset-2
                focus-visible:rounded-[6px]
                dark:focus-visible:ring-offset-[#100405]
                shrink-0
              `}
            >
              {/* Expanding Chamber: strictly clipped inside button (380ms expansion / 320ms retraction) */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-[9px] top-1/2 -translate-y-1/2 h-[32px] w-[32px] rounded-full bg-[#FFF7F2] transition-transform duration-[320ms] group-hover:duration-[380ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[12] -z-0"
              />

              {/* CTA Label (280ms text transition) */}
              <span className="relative z-10 font-[650] transition-colors duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:text-[#A61629] dark:group-hover:text-[#921426]">
                Register Now
              </span>

              {/* Circular Arrow Chamber & Icon (300ms translation) */}
              <span
                aria-hidden="true"
                className="relative z-10 flex h-[32px] w-[32px] items-center justify-center rounded-full bg-[#FFF7F2] text-[#A61629] dark:text-[#921426] border-0 border-transparent shadow-none"
              >
                <ArrowRight
                  size={16}
                  strokeWidth={2.2}
                  className="transition-transform duration-[300ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-[2px]"
                />
              </span>
            </a>

            {/* Watch Video Link */}
            <a
              href="https://youtu.be/EByii89QzVQ?si=td8WOckyuKGbos_O"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Watch Qiskit Fall Fest video"
              onClick={() => trackEvent('watch_video_click', { url: 'https://youtu.be/EByii89QzVQ' })}
              className={`
                ${styles.watchVideoBtn}
                group
                inline-flex
                items-center
                font-semibold
                text-[#23191A]
                dark:text-[#F5EDEB]
                cursor-pointer
                shrink-0
                outline-none
                focus-visible:ring-2
                focus-visible:ring-[#A7192A]/35
                focus-visible:ring-offset-2
                focus-visible:rounded-[5px]
                dark:focus-visible:ring-offset-[#100405]
              `}
            >
              <span
                className={`
                  ${styles.watchVideoCircle}
                  flex
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-[#981728]
                  dark:border-[#ED7B87]
                  transition-transform
                  duration-200
                  group-hover:scale-105
                `}
              >
                <Play
                  size={13}
                  className="ml-0.5 text-[#981728] dark:text-[#ED7B87]"
                  fill="currentColor"
                />
              </span>
              <span>Watch Video</span>
            </a>
          </div>
        </div>

        {/* =======================================================
            LAYER 3: CRYOSTAT (SINGLE QUANTUM COMPUTER) (z-3)
            Height-driven sizing, lowered position, interactive hover.
        ======================================================== */}
        <div
          className={`
            ${styles.cryostatWrapper}
            select-none
          `}
        >
          <Image
            src={HERO_ASSETS.cryostat}
            alt="IBM Quantum Cryostat"
            width={1024}
            height={1535}
            priority
            className="
              h-auto
              w-full
              max-h-[330px]
              max-[389px]:max-h-[290px]
              md:max-h-none
              md:h-full
              md:w-auto
              object-contain
              drop-shadow-[0_20px_40px_rgba(0,0,0,0.18)]
              dark:drop-shadow-[0_24px_50px_rgba(0,0,0,0.55)]
            "
          />
        </div>


        {/* =======================================================
            LAYER 5: MOBILE METADATA (z-5)
            2x2 grid below cryostat in normal flow (< 768px).
        ======================================================== */}
        <div
          className="
            relative
            z-[5]
            mt-[18px]
            pt-[16px]
            border-t
            border-[#7C1721]/15
            dark:border-white/12
            grid
            grid-cols-2
            gap-x-[14px]
            min-[360px]:gap-x-[18px]
            gap-y-[14px]
            md:hidden
          "
        >
          {EVENT_META.map((item) => {
            const IconComponent = item.icon;
            const metaContent = (
              <HeroMeta
                icon={<IconComponent className="h-[19px] w-[19px]" strokeWidth={1.85} />}
                title={item.title}
                subtitle={item.subtitle}
                titleClassName="text-[11.5px] leading-tight"
                subtitleClassName="text-[10px] leading-tight"
              />
            );

            if (item.href) {
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  aria-label={item.ariaLabel}
                  className={styles.metaLink}
                >
                  {metaContent}
                </Link>
              );
            }

            return (
              <div key={item.title}>
                {metaContent}
              </div>
            );
          })}
          <div className="flex items-center justify-start gap-[8px] translate-y-[1px]">
            <div className="shrink-0 w-[54px]">
              <Image
                src={HERO_ASSETS.decadeLight}
                alt="10"
                width={1774}
                height={887}
                className="h-auto w-full object-contain dark:hidden"
              />
              <Image
                src={HERO_ASSETS.decadeDark}
                alt="10"
                width={1774}
                height={887}
                className="hidden h-auto w-full object-contain dark:block"
              />
            </div>
            <div className="font-sans font-bold uppercase text-[7.5px] leading-[1.35] tracking-[0.075em] text-[#342A28] dark:text-[#F6ECEA] whitespace-nowrap">
              <div>A DECADE OF</div>
              <div>QUANTUM ON CLOUD</div>
            </div>
          </div>
        </div>

        {/* =======================================================
            LAYER 6: DESKTOP & TABLET METADATA RAIL (z-6)
            Full-width coordinate system anchored to bottom.
            Always visible without scrolling on laptop and desktop.
        ======================================================== */}
        <div className={styles.metadataRail}>
          {/* Left Metadata Cluster */}
          <div className="flex items-center h-full">

            {/* 3 Information Blocks */}
            <div className={styles.metadataCols}>
              {EVENT_META.map((item, index) => {
                const IconComponent = item.icon;
                const isLast = index === EVENT_META.length - 1;
                const metaContent = (
                  <HeroMeta
                    icon={<IconComponent className={styles.metaItemIcon} strokeWidth={1.85} />}
                    title={item.title}
                    subtitle={item.subtitle}
                    titleClassName={styles.metaItemTitle}
                    subtitleClassName={styles.metaItemSubtitle}
                  />
                );

                return (
                  <div key={item.title} className={styles.metaItemWrapper}>
                    {item.href ? (
                      <Link
                        href={item.href}
                        aria-label={item.ariaLabel}
                        className={styles.metaLink}
                      >
                        {metaContent}
                      </Link>
                    ) : (
                      metaContent
                    )}
                    {!isLast && (
                      <div
                        aria-hidden="true"
                        className={styles.separator}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fourth Unit: Decade Block aligned inward from the right */}
          <div className={styles.decadeBlock}>
            <div className={styles.decadeImg}>
              <Image
                src={HERO_ASSETS.decadeLight}
                alt="10"
                width={1774}
                height={887}
                className="h-auto w-full object-contain dark:hidden"
              />
              <Image
                src={HERO_ASSETS.decadeDark}
                alt="10"
                width={1774}
                height={887}
                className="hidden h-auto w-full object-contain dark:block"
              />
            </div>

            <div
              className={`
                ${styles.decadeLabel}
                font-sans font-bold uppercase
                tracking-[0.075em]
                whitespace-nowrap
              `}
            >
              <div>A DECADE OF</div>
              <div>QUANTUM ON CLOUD</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroMeta({
  icon,
  title,
  subtitle,
  titleClassName = '',
  subtitleClassName = '',
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  titleClassName?: string;
  subtitleClassName?: string;
}) {
  return (
    <div className={styles.metaItem}>
      <div
        className="
          shrink-0 flex items-center justify-center
          text-[#A7192A]
          dark:text-[#F07481]
        "
      >
        {icon}
      </div>

      <div className="flex flex-col justify-center">
        <div
          className={`
            ${titleClassName}
            font-bold
            tracking-[0.02em]
            text-[#251B1A]
            dark:text-[#F7F1EE]
            leading-tight
          `}
        >
          {title}
        </div>

        <div
          className={`
            ${subtitleClassName}
            font-[450]
            text-[#756966]
            dark:text-[#C8BAB7]
            leading-tight
            mt-[2px]
          `}
        >
          {subtitle}
        </div>
      </div>
    </div>
  );
}
