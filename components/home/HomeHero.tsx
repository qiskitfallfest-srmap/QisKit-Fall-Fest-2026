import * as React from 'react';
import Image from 'next/image';
import { ArrowRight, CalendarDays, MapPin, Play } from 'lucide-react';
import { REGISTRATION_URL } from '@/lib/constants';

const HERO_ASSETS = {
  backgroundLight: '/hero/HOME-01-HERO-BACKGROUND-LIGHT.png',
  backgroundDark: '/hero/HOME-01-HERO-BACKGROUND-DAR.png',

  // Single cryostat asset for both light and dark themes
  cryostat: '/hero/HOME-01-HERO-CRYOSTAT-ORBITAL-LIGHT-02.png',

  globeLeftLight: '/hero/HOME-01-HERO-GLOBE-LEFT-LIGHT.png',
  globeLeftDark: '/hero/HOME-01-HERO-GLOBE-LEFT-DARK.png',

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
      className="
        relative isolate w-full overflow-hidden
        bg-[#F8F4EF] text-[#181313]
        dark:bg-[#100405] dark:text-[#F5F0EE]
        min-h-0 h-auto
        md:h-[720px] md:min-h-[700px] md:max-h-[740px]
        lg:h-[calc(100svh-88px)] lg:min-h-[700px] lg:max-h-[900px]
        2xl:h-[calc(100svh-88px)] 2xl:min-h-[760px] 2xl:max-h-[930px]
      "
    >
      {/* =========================================================
          LAYER 0: THEME BACKGROUND (z-0, non-negative)
          Mobile: Confined to upper 760px to prevent 16:9 zooming,
          letting base background color show below.
          Tablet & Desktop: Full inset-0 coverage.
      ========================================================== */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute
          inset-x-0 top-0 h-[760px]
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
          className="object-cover object-[68%_center] md:object-[62%_center] lg:object-center dark:hidden"
        />
        <Image
          src={HERO_ASSETS.backgroundDark}
          alt=""
          fill
          priority
          sizes="100vw"
          className="hidden object-cover object-[68%_center] md:object-[62%_center] lg:object-center dark:block"
        />
      </div>

      {/* =========================================================
          LAYER 1: LEFT DECORATIVE GLOBE (z-1)
          Separate wrappers for light and dark with calibrated
          responsive cropping:
          - Compact Desktop (1024–1279): Compact entry (-360px)
          - Desktop (1280–1535): -29vw
          - Large Desktop (1536+): -26vw (~16–20% entry)
          Hidden on mobile & tablet.
      ========================================================== */}
      {/* Light Mode Left Globe */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          z-[1]
          hidden
          h-auto
          lg:block
          dark:hidden
          lg:left-[-360px]
          lg:top-[12%]
          lg:w-[500px]
          lg:opacity-[0.80]
          xl:left-[-29vw]
          xl:top-[8%]
          xl:w-[clamp(560px,43vw,690px)]
          xl:opacity-[0.88]
          2xl:left-[-26vw]
          2xl:top-[7%]
          2xl:w-[clamp(620px,42vw,800px)]
          2xl:opacity-[0.92]
        "
      >
        <Image
          src={HERO_ASSETS.globeLeftLight}
          alt=""
          width={1246}
          height={1263}
          priority
          className="h-auto w-full object-contain"
        />
      </div>

      {/* Dark Mode Left Globe */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          z-[1]
          hidden
          h-auto
          dark:lg:block
          lg:left-[-370px]
          lg:top-[12%]
          lg:w-[510px]
          lg:opacity-[0.78]
          xl:left-[-32vw]
          xl:top-[9%]
          xl:w-[clamp(560px,43vw,700px)]
          xl:opacity-[0.82]
          2xl:left-[-30vw]
          2xl:top-[8%]
          2xl:w-[clamp(620px,43vw,800px)]
          2xl:opacity-[0.84]
        "
      >
        <Image
          src={HERO_ASSETS.globeLeftDark}
          alt=""
          width={1254}
          height={1254}
          priority
          className="h-auto w-full object-contain"
        />
      </div>

      {/* =========================================================
          LAYER 1: RIGHT DECORATIVE GLOBE (z-1)
          Edge-frame element that never collides with cryostat or microcopy.
          Hidden on mobile & tablet.
      ========================================================== */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          z-[1]
          hidden
          h-auto
          lg:block
          lg:right-[-355px]
          lg:top-[14%]
          lg:w-[500px]
          lg:opacity-[0.77]
          dark:lg:opacity-[0.84]
          xl:right-[-31vw]
          xl:top-[11%]
          xl:w-[clamp(530px,39vw,660px)]
          xl:opacity-[0.82]
          dark:xl:opacity-[0.88]
          2xl:right-[-28vw]
          2xl:top-[10%]
          2xl:w-[clamp(600px,39vw,760px)]
          2xl:opacity-[0.84]
          dark:2xl:opacity-[0.90]
        "
      >
        <Image
          src={HERO_ASSETS.globeRightLight}
          alt=""
          width={1266}
          height={1243}
          priority
          className="h-auto w-full object-contain dark:hidden"
        />
        <Image
          src={HERO_ASSETS.globeRightDark}
          alt=""
          width={1268}
          height={1241}
          priority
          className="hidden h-auto w-full object-contain dark:block"
        />
      </div>

      {/* =========================================================
          HERO STAGE CONTAINER
          Mobile: Normal responsive flow (px-5, pt-[26px], pb-[24px])
          Tablet & Desktop: Relative stage with absolute layered units
      ========================================================== */}
      <div
        className="
          relative
          mx-auto
          w-full
          max-w-[1760px]
          h-full
          px-5
          pt-[26px]
          pb-[24px]
          md:p-0
        "
      >
        {/* =======================================================
            LAYER 4: MAIN TYPOGRAPHY AND CTAS (z-4)
            Mobile: Normal flow
            Tablet: Absolute top-left lockup (36px, 40px)
            Compact Desktop (1024–1279): (clamp(52px,6vw,76px), 8.5%)
            Standard Desktop (1280+): (clamp(72px,7.7vw,148px), 9.5%)
        ======================================================== */}
        <div
          className="
            relative
            z-[4]
            w-full
            max-w-full
            md:absolute
            md:left-[36px]
            md:top-[40px]
            md:w-[45%]
            md:max-w-[350px]
            lg:left-[clamp(52px,6vw,76px)]
            lg:top-[8.5%]
            lg:w-[390px]
            lg:max-w-none
            xl:left-[clamp(72px,7.7vw,148px)]
            xl:top-[9.5%]
            xl:w-[clamp(420px,32vw,515px)]
          "
        >
          {/* Eyebrow */}
          <p
            className="
              text-[11px]
              md:text-[11.5px]
              lg:text-[12px]
              2xl:text-[12.5px]
              font-bold
              uppercase
              tracking-[0.25em]
              lg:tracking-[0.29em]
              leading-[1.2]
              mb-[14px]
              md:mb-[15px]
              lg:mb-[16px]
              text-[#A7192A]
              dark:text-[#EF7885]
            "
          >
            GLOBAL. OPEN. TOGETHER.
          </p>

          {/* Headline with editorial transition gradient */}
          <h1
            id="home-hero-title"
            className="
              font-serif
              font-bold
              leading-[0.89]
              md:leading-[0.88]
              lg:leading-[0.865]
              xl:leading-[0.86]
              tracking-[-0.045em]
              m-0
              text-[clamp(48px,13.5vw,60px)]
              md:text-[clamp(50px,6.7vw,62px)]
              lg:text-[clamp(60px,5.8vw,74px)]
              xl:text-[clamp(68px,5.35vw,88px)]
              2xl:text-[clamp(78px,5vw,94px)]
              text-transparent
              bg-clip-text
              bg-[linear-gradient(90deg,#A7192A_0%,#851722_38%,#241617_85%)]
              dark:bg-[linear-gradient(90deg,#EA8793_0%,#EFB0B5_45%,#FFF1EE_100%)]
            "
          >
            QISKIT
            <br />
            <span className="whitespace-nowrap">FALL FEST</span>
            <br />
            2026
          </h1>

          {/* Host */}
          <div
            className="
              mt-[18px]
              md:mt-[16px]
              lg:mt-[18px]
              text-[16px]
              md:text-[15px]
              lg:text-[16px]
              xl:text-[17px]
              2xl:text-[18px]
              font-bold
              tracking-[-0.01em]
              leading-[1.2]
              text-[#211818]
              dark:text-[#F8F2F0]
            "
          >
            SRM UNIVERSITY-AP × IBM
          </div>

          {/* Theme */}
          <div
            className="
              mt-[5px]
              font-serif
              font-semibold
              text-[15px]
              md:text-[14.5px]
              lg:text-[17px]
              leading-[1.25]
              text-[#261A19]
              dark:text-[#F0E4DF]
            "
          >
            A Decade of Quantum on Cloud
          </div>

          {/* Description */}
          <p
            className="
              mt-[16px]
              md:mt-[15px]
              lg:mt-[16px]
              max-w-full
              md:max-w-[315px]
              lg:max-w-[390px]
              xl:max-w-[430px]
              text-[13px]
              md:text-[12.5px]
              lg:text-[13px]
              xl:text-[14px]
              2xl:text-[14.5px]
              leading-[1.55]
              md:leading-[1.52]
              lg:leading-[1.55]
              font-normal
              text-[#4E4441]
              dark:text-[#D6CDCA]
            "
          >
            Join a global celebration of quantum computing with workshops,
            technical sessions, hackathons and more — at SRM University-AP,
            Amaravati.
          </p>

          {/* CTAs */}
          <div
            className="
              mt-[20px]
              md:mt-[18px]
              lg:mt-[20px]
              flex
              flex-row
              items-center
              gap-[12px]
              md:gap-[16px]
              lg:gap-[20px]
              xl:gap-[24px]
              flex-wrap
              min-[360px]:flex-nowrap
            "
          >
            {/* Primary Register Button */}
            <a
              href={REGISTRATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="
                group
                inline-flex
                h-[50px]
                md:h-[48px]
                lg:h-[52px]
                w-[184px]
                max-[359px]:w-[170px]
                md:w-[172px]
                lg:w-[214px]
                items-center
                justify-between
                rounded-[5px]
                border
                border-[rgba(193,46,63,0.85)]
                bg-[#A61629]
                dark:bg-[#921426]
                hover:bg-[#B51B30]
                dark:hover:bg-[#B51B30]
                px-[18px]
                lg:px-[24px]
                text-[13px]
                lg:text-[14px]
                font-[650]
                text-white
                shadow-[0_8px_22px_rgba(105,14,27,0.12)]
                dark:shadow-[0_7px_24px_rgba(0,0,0,0.20)]
                transition-all
                duration-200
                hover:-translate-y-[1px]
                outline-none
                focus-visible:ring-2
                focus-visible:ring-[#A7192A]/40
                focus-visible:ring-offset-2
                focus-visible:rounded-[5px]
                dark:focus-visible:ring-offset-[#100405]
                shrink-0
              "
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
              className="
                group
                inline-flex
                items-center
                gap-[10px]
                md:gap-[11px]
                lg:gap-[12px]
                text-[13px]
                lg:text-[13.5px]
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
              "
            >
              <span
                className="
                  flex
                  h-[40px]
                  w-[40px]
                  md:h-[38px]
                  md:w-[38px]
                  lg:h-[40px]
                  lg:w-[40px]
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-[#981728]
                  dark:border-[#ED7B87]
                  transition-transform
                  duration-200
                  group-hover:scale-105
                "
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
            Single transparent cryostat composition for both themes.
            Intrinsic ratio 1024 x 1536.
            Mobile: Restrained scale taking 300–360px vertical height.
            Tablet: Shorter scale ending cleanly above metadata (61% / 44%).
            Compact Desktop (1024–1279): Smooth step (56.5% / 48%).
            Standard Desktop (1280+): Dominates center-right (55.5% / 48.5%).
        ======================================================== */}
        <div
          className="
            pointer-events-none
            select-none
            relative
            z-[3]
            mt-[24px]
            mb-[8px]
            mx-auto
            w-[min(58vw,230px)]
            max-[389px]:w-[min(56vw,215px)]
            h-auto
            md:my-0
            md:mx-0
            md:absolute
            md:left-[61%]
            md:top-[44%]
            md:-translate-y-1/2
            md:w-[clamp(225px,29vw,280px)]
            lg:left-[56.5%]
            lg:top-[48%]
            lg:-translate-y-1/2
            lg:w-[clamp(360px,31vw,410px)]
            xl:left-[55.5%]
            xl:top-[48.5%]
            xl:w-[clamp(420px,31vw,560px)]
            xl:max-h-[calc(100%-30px)]
          "
        >
          <Image
            src={HERO_ASSETS.cryostat}
            alt="IBM Quantum Cryostat"
            width={1024}
            height={1536}
            priority
            className="
              h-auto
              w-full
              max-h-[360px]
              max-[389px]:max-h-[330px]
              md:max-h-[420px]
              lg:max-h-[calc(100%-30px)]
              object-contain
              drop-shadow-[0_20px_40px_rgba(0,0,0,0.18)]
              dark:drop-shadow-[0_24px_50px_rgba(0,0,0,0.55)]
            "
          />
        </div>

        {/* =======================================================
            LAYER 5: RIGHT MICROCOPY (z-5)
            QUANTUM / IDEAS / REAL / IMPACT
            Positioned in burgundy negative-space lane left of the globe.
            Visible only on desktop (1280px+)
        ======================================================== */}
        <div
          className="
            pointer-events-none
            absolute
            z-[5]
            hidden
            -translate-y-1/2
            font-[650]
            uppercase
            tracking-[0.17em]
            leading-[1.72]
            text-[#F7EBE8]
            xl:block
            xl:right-[clamp(112px,8.2vw,135px)]
            xl:top-[49%]
            xl:w-[76px]
            xl:text-[10px]
            2xl:right-[clamp(145px,8.8vw,178px)]
            2xl:top-[49.5%]
            2xl:w-[84px]
            2xl:text-[10.5px]
          "
        >
          <div>QUANTUM</div>
          <div>IDEAS</div>
          <div>REAL</div>
          <div>IMPACT</div>
          <div className="mt-[14px] h-[1px] w-[31px] bg-[#E77A86]" />
        </div>

        {/* =======================================================
            LAYER 5: HERO METADATA STRIP (z-5)
            Mobile: 2x2 grid below cryostat
            Tablet & Desktop: Compact 3-item stationary cluster + independently anchored Decade block
        ======================================================== */}
        {/* Mobile Metadata (2x2 grid below cryostat) */}
        <div
          className="
            relative
            z-[5]
            mt-[20px]
            pt-[18px]
            border-t
            border-[#7C1721]/15
            dark:border-white/12
            grid
            grid-cols-2
            gap-x-[14px]
            gap-y-[16px]
            md:hidden
          "
        >
          <HeroMeta
            icon={<CalendarDays className="h-[20px] w-[20px]" strokeWidth={1.85} />}
            title="5 – 9 OCT 2026"
            subtitle="Online Phase"
          />
          <HeroMeta
            icon={<CalendarDays className="h-[20px] w-[20px]" strokeWidth={1.85} />}
            title="26 – 30 OCT 2026"
            subtitle="On-Campus Phase"
          />
          <HeroMeta
            icon={<MapPin className="h-[20px] w-[20px]" strokeWidth={1.85} />}
            title="SRM University-AP"
            subtitle="Amaravati, India"
          />
          <div className="flex items-center justify-start gap-[6px] translate-y-[2px]">
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
            <div className="font-sans font-bold uppercase text-[7px] leading-[1.35] tracking-[0.075em] text-[#342A28] dark:text-[#F6ECEA] whitespace-nowrap">
              <div>A DECADE OF</div>
              <div>QUANTUM ON CLOUD</div>
            </div>
          </div>
        </div>

        {/* Tablet & Desktop Metadata (Compact stationary cluster + right-aligned Decade block) */}
        <div
          className="
            hidden
            md:absolute
            md:left-[32px]
            md:right-[32px]
            md:bottom-[14px]
            md:h-[72px]
            md:flex
            md:items-center
            md:justify-between
            lg:left-[52px]
            lg:right-[52px]
            lg:bottom-[15px]
            lg:h-[74px]
            xl:left-[clamp(68px,5.4vw,92px)]
            xl:right-[clamp(68px,5.4vw,92px)]
            xl:bottom-[17px]
            xl:h-[76px]
            2xl:left-[clamp(82px,5.8vw,112px)]
            2xl:right-[clamp(82px,5.8vw,112px)]
            2xl:bottom-[18px]
            2xl:h-[78px]
            z-[5]
          "
        >
          {/* Left Metadata Cluster: 3 Information Blocks */}
          <div
            className="
              grid
              md:grid-cols-[155px_180px_205px]
              lg:grid-cols-[180px_205px_230px]
              xl:grid-cols-[205px_225px_245px]
              2xl:grid-cols-[220px_240px_260px]
              items-center
              h-full
            "
          >
            {/* Item 1: Online Phase */}
            <div className="relative h-full flex items-center pr-4 lg:pr-6">
              <HeroMeta
                icon={<CalendarDays className="h-[20px] w-[20px] lg:h-[21px] lg:w-[21px] xl:h-[22px] xl:w-[22px] 2xl:h-[23px] 2xl:w-[23px]" strokeWidth={1.85} />}
                title="5 – 9 OCT 2026"
                subtitle="Online Phase"
              />
              <div
                aria-hidden="true"
                className="absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-[42px] bg-[rgba(124,23,33,0.18)] dark:bg-[rgba(255,238,235,0.18)] pointer-events-none"
              />
            </div>

            {/* Item 2: On-Campus Phase */}
            <div className="relative h-full flex items-center px-4 lg:px-6">
              <HeroMeta
                icon={<CalendarDays className="h-[20px] w-[20px] lg:h-[21px] lg:w-[21px] xl:h-[22px] xl:w-[22px] 2xl:h-[23px] 2xl:w-[23px]" strokeWidth={1.85} />}
                title="26 – 30 OCT 2026"
                subtitle="On-Campus Phase"
              />
              <div
                aria-hidden="true"
                className="absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-[42px] bg-[rgba(124,23,33,0.18)] dark:bg-[rgba(255,238,235,0.18)] pointer-events-none"
              />
            </div>

            {/* Item 3: SRM University-AP (No separator toward decade block) */}
            <div className="relative h-full flex items-center pl-4 lg:pl-6">
              <HeroMeta
                icon={<MapPin className="h-[20px] w-[20px] lg:h-[21px] lg:w-[21px] xl:h-[22px] xl:w-[22px] 2xl:h-[23px] 2xl:w-[23px]" strokeWidth={1.85} />}
                title="SRM University-AP"
                subtitle="Amaravati, India"
              />
            </div>
          </div>

          {/* Fourth Unit: Decade Block aligned to the right */}
          <div className="md:ml-auto md:flex md:items-center gap-[8px] xl:gap-[10px]">
            <div className="shrink-0 w-[58px] lg:w-[68px] xl:w-[78px] 2xl:w-[88px]">
              <Image
                src={HERO_ASSETS.decadeLight}
                alt="10"
                width={1774}
                height={887}
                className="
                  h-auto
                  w-full
                  object-contain
                  dark:hidden
                "
              />
              <Image
                src={HERO_ASSETS.decadeDark}
                alt="10"
                width={1774}
                height={887}
                className="
                  hidden
                  h-auto
                  w-full
                  object-contain
                  dark:block
                "
              />
            </div>

            <div
              className="
                font-sans
                font-bold
                uppercase
                text-[7.5px]
                lg:text-[8px]
                xl:text-[9px]
                2xl:text-[9.5px]
                leading-[1.3]
                tracking-[0.07em]
                text-white
                dark:text-[#F6ECEA]
                [text-shadow:0_1px_3px_rgba(0,0,0,0.22)]
                whitespace-nowrap
              "
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
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
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
          className="
            text-[10.5px]
            lg:text-[11px]
            xl:text-[11.5px]
            2xl:text-[12px]
            font-bold
            tracking-[0.02em]
            leading-[1.2]
            text-[#251B1A]
            dark:text-[#F7F1EE]
          "
        >
          {title}
        </div>

        <div
          className="
            mt-[2px]
            text-[9.5px]
            xl:text-[10px]
            2xl:text-[10.5px]
            font-[450]
            leading-[1.3]
            text-[#756966]
            dark:text-[#BDB2AF]
          "
        >
          {subtitle}
        </div>
      </div>
    </div>
  );
}



