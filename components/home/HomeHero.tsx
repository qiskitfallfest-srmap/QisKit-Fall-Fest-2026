import * as React from 'react';
import Image from 'next/image';
import { ArrowRight, CalendarDays, MapPin, Play } from 'lucide-react';
import { REGISTRATION_URL } from '@/lib/constants';
import styles from './HomeHero.module.css';

const HERO_ASSETS = {
  backgroundLight: '/hero/HOME-01-HERO-BACKGROUND-LIGHT.png',
  backgroundDark: '/hero/HOME-01-HERO-BACKGROUND-DAR.png',

  // Single cryostat asset for both light and dark themes (actual dimensions: 1024 × 1535)
  cryostat: '/hero/HOME-01-HERO-CRYOSTAT-ORBITAL-LIGHT-02.png',

  // Right decorative globe assets (left globe has been completely removed)
  globeRightLight: '/hero/HOME-01-HERO-GLOBE-RIGHT-LIGHT.png',
  globeRightDark: '/hero/HOME-01-HERO-GLOBE-RIGHT-DARK.png',

  decadeLight: '/hero/HOME-01-HERO-DECADE-10-LIGHT.png',
  decadeDark: '/hero/HOME-01-HERO-DECADE-10-DARK.png',
};

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
          LAYER 0: THEME BACKGROUND (z-0)
          Mobile: Upper 720px concentration letting base theme background show below.
          Tablet & Desktop: Full inset-0 coverage with centered anchor [50% 50%].
      ========================================================== */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute
          inset-x-0 top-0 h-[720px]
          md:inset-0 md:h-full
          z-0 overflow-hidden
        "
      >
        <Image
          src={HERO_ASSETS.backgroundLight}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[60%_center] md:object-[50%_50%] dark:hidden"
        />
        <Image
          src={HERO_ASSETS.backgroundDark}
          alt=""
          fill
          priority
          sizes="100vw"
          className="hidden object-cover object-[60%_center] md:object-[50%_50%] dark:block"
        />
      </div>

      {/* =========================================================
          LAYER 1: RIGHT DECORATIVE GLOBE (z-1)
          Height-based scaling with transformX (+82% to +84%)
          framing the right edge without colliding with cryostat or microcopy.
          Left globe is completely removed.
      ========================================================== */}
      <div
        aria-hidden="true"
        className={styles.rightGlobeWrapper}
      >
        <Image
          src={HERO_ASSETS.globeRightLight}
          alt=""
          width={1266}
          height={1243}
          priority
          className="h-full w-auto object-contain dark:hidden"
        />
        <Image
          src={HERO_ASSETS.globeRightDark}
          alt=""
          width={1268}
          height={1241}
          priority
          className="hidden h-full w-auto object-contain dark:block"
        />
      </div>

      {/* =========================================================
          HERO STAGE CONTAINER (FULL VIEWPORT COORDINATE SYSTEM)
          Mobile: Normal responsive flow (px-5, pt-[28px], pb-[24px])
          Tablet & Desktop: Relative stage with absolute layered units.
          No max-width constraint to preserve unified full-width coordinates.
      ========================================================== */}
      <div className="relative w-full h-full px-5 pt-[28px] pb-[24px] md:p-0">
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
              tracking-[0.28em]
              leading-none
              text-[#A7192A]
              dark:text-[#EF7885]
            `}
          >
            GLOBAL. OPEN. TOGETHER.
          </p>

          {/* Headline with editorial transition gradient */}
          <h1
            id="home-hero-title"
            className={`
              ${styles.headline}
              font-serif
              font-bold
              tracking-[-0.045em]
              m-0
              text-transparent
              bg-clip-text
              bg-[linear-gradient(90deg,#A7192A_0%,#851722_38%,#241617_85%)]
              dark:bg-[linear-gradient(90deg,#EA8793_0%,#EFB0B5_45%,#FFF1EE_100%)]
            `}
          >
            QISKIT
            <br />
            <span className="whitespace-nowrap">FALL FEST</span>
            <br />
            2026
          </h1>

          {/* Host */}
          <div
            className={`
              ${styles.host}
              font-bold
              tracking-[-0.01em]
              text-[#211818]
              dark:text-[#F8F2F0]
            `}
          >
            SRM UNIVERSITY-AP × IBM
          </div>

          {/* Theme */}
          <div
            className={`
              ${styles.theme}
              font-serif
              font-semibold
              text-[#261A19]
              dark:text-[#F0E4DF]
            `}
          >
            A Decade of Quantum on Cloud
          </div>

          {/* Description */}
          <p
            className={`
              ${styles.description}
              font-normal
              text-[#4E4441]
              dark:text-[#D6CDCA]
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
              flex
              flex-row
              items-center
              flex-wrap
              min-[360px]:flex-nowrap
            `}
          >
            {/* Primary Register Button */}
            <a
              href={REGISTRATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`
                ${styles.registerBtn}
                group
                inline-flex
                items-center
                justify-between
                rounded-[5px]
                border
                border-[rgba(193,46,63,0.85)]
                bg-[#A61629]
                dark:bg-[#921426]
                hover:bg-[#B51B30]
                dark:hover:bg-[#B51B30]
                font-[650]
                text-white
                shadow-[0_8px_22px_rgba(105,14,27,0.12)]
                dark:shadow-[0_7px_24px_rgba(0,0,0,0.20)]
                transition-[transform,background-color,box-shadow,border-color]
                duration-200
                hover:-translate-y-[1px]
                outline-none
                focus-visible:ring-2
                focus-visible:ring-[#A7192A]/40
                focus-visible:ring-offset-2
                focus-visible:rounded-[5px]
                dark:focus-visible:ring-offset-[#100405]
                shrink-0
              `}
            >
              <span>Register Now</span>
              <ArrowRight
                size={16}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </a>

            {/* Watch Video Link */}
            <a
              href="https://youtu.be/EByii89QzVQ?si=td8WOckyuKGbos_O"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Watch Qiskit Fall Fest video"
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
            LAYER 3: CRYOSTAT (z-3)
            Height-driven sizing preserving actual 1024 × 1535 ratio (0.6671).
            In laptop mode: Height 94-95%, bottom: 0, left: 60%.
            Image intrinsic dimensions 1024 x 1535, object-contain.
        ======================================================== */}
        <div
          className={`
            ${styles.cryostatWrapper}
            pointer-events-none
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
              max-h-[350px]
              max-[389px]:max-h-[320px]
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
            LAYER 5: RIGHT MICROCOPY (z-5)
            QUANTUM / IDEAS / REAL / IMPACT
            Visible on desktop / wide laptop (1280px+)
        ======================================================== */}
        <div
          className={`
            ${styles.rightMicrocopy}
            font-[650]
            uppercase
            text-[#F7EBE8]
          `}
        >
          <div>QUANTUM</div>
          <div>IDEAS</div>
          <div>REAL</div>
          <div>IMPACT</div>
          <div className="mt-[10px] h-[1px] w-[28px] bg-[#E77A86]" />
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
            gap-x-[12px]
            gap-y-[14px]
            md:hidden
          "
        >
          <HeroMeta
            icon={<CalendarDays className="h-[18px] w-[18px]" strokeWidth={1.85} />}
            title="5 – 9 OCT 2026"
            subtitle="Online Phase"
            titleClassName="text-[10px]"
            subtitleClassName="text-[9px]"
          />
          <HeroMeta
            icon={<CalendarDays className="h-[18px] w-[18px]" strokeWidth={1.85} />}
            title="26 – 30 OCT 2026"
            subtitle="On-Campus Phase"
            titleClassName="text-[10px]"
            subtitleClassName="text-[9px]"
          />
          <HeroMeta
            icon={<MapPin className="h-[18px] w-[18px]" strokeWidth={1.85} />}
            title="SRM University-AP"
            subtitle="Amaravati, India"
            titleClassName="text-[10px]"
            subtitleClassName="text-[9px]"
          />
          <div className="flex items-center justify-start gap-[6px] translate-y-[1px]">
            <div className="shrink-0 w-[52px]">
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
            <div className="font-sans font-bold uppercase text-[7px] leading-[1.35] tracking-[0.075em] text-[#342A28] dark:text-[#F6ECEA] whitespace-nowrap">
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
          {/* Left Metadata Cluster with Circular N Compass Marker */}
          <div className="flex items-center h-full">
            {/* Reference N Compass Marker */}
            <div
              aria-hidden="true"
              className={`
                ${styles.metadataCompass}
                flex shrink-0 items-center justify-center
                rounded-full
                bg-[#2B2B2B] dark:bg-[#161616]
                border border-white/35 text-white
                text-[11px] font-bold font-mono
                select-none
              `}
            >
              N
            </div>

            {/* 3 Information Blocks */}
            <div className={styles.metadataCols}>
              {/* Item 1: Online Phase */}
              <div className="relative h-full flex items-center pr-3 lg:pr-5">
                <HeroMeta
                  icon={<CalendarDays className={styles.metaItemIcon} strokeWidth={1.85} />}
                  title="5 – 9 OCT 2026"
                  subtitle="Online Phase"
                  titleClassName={styles.metaItemTitle}
                  subtitleClassName={styles.metaItemSubtitle}
                />
                <div
                  aria-hidden="true"
                  className={`
                    ${styles.separator}
                    absolute right-0 top-1/2 -translate-y-1/2 w-[1px]
                    bg-[rgba(124,23,33,0.18)] dark:bg-[rgba(255,238,235,0.18)]
                    pointer-events-none
                  `}
                />
              </div>

              {/* Item 2: On-Campus Phase */}
              <div className="relative h-full flex items-center px-3 lg:px-5">
                <HeroMeta
                  icon={<CalendarDays className={styles.metaItemIcon} strokeWidth={1.85} />}
                  title="26 – 30 OCT 2026"
                  subtitle="On-Campus Phase"
                  titleClassName={styles.metaItemTitle}
                  subtitleClassName={styles.metaItemSubtitle}
                />
                <div
                  aria-hidden="true"
                  className={`
                    ${styles.separator}
                    absolute right-0 top-1/2 -translate-y-1/2 w-[1px]
                    bg-[rgba(124,23,33,0.18)] dark:bg-[rgba(255,238,235,0.18)]
                    pointer-events-none
                  `}
                />
              </div>

              {/* Item 3: SRM University-AP */}
              <div className="relative h-full flex items-center pl-3 lg:pl-5">
                <HeroMeta
                  icon={<MapPin className={styles.metaItemIcon} strokeWidth={1.85} />}
                  title="SRM University-AP"
                  subtitle="Amaravati, India"
                  titleClassName={styles.metaItemTitle}
                  subtitleClassName={styles.metaItemSubtitle}
                />
              </div>
            </div>
          </div>

          {/* Fourth Unit: Decade Block aligned to the right edge */}
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
                tracking-[0.07em]
                text-white dark:text-[#F6ECEA]
                [text-shadow:0_1px_3px_rgba(0,0,0,0.22)]
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
    <div className="flex items-center gap-[8px] xl:gap-[9px] 2xl:gap-[10px]">
      <div
        className="
          shrink-0
          text-[#A7192A]
          dark:text-[#F07481]
        "
      >
        {icon}
      </div>

      <div>
        <div
          className={`
            ${titleClassName}
            font-bold
            tracking-[0.02em]
            text-[#251B1A]
            dark:text-[#F7F1EE]
          `}
        >
          {title}
        </div>

        <div
          className={`
            ${subtitleClassName}
            font-[450]
            text-[#756966]
            dark:text-[#BDB2AF]
          `}
        >
          {subtitle}
        </div>
      </div>
    </div>
  );
}
