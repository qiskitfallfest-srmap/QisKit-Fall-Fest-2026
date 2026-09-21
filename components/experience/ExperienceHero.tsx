'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Play, X, ExternalLink } from 'lucide-react';
import { PlasmaRing } from '@/components/ui/plasma-ring';

const TRAILER_VIDEO_ID = 'EByii89QzVQ';
const TRAILER_YOUTUBE_URL = 'https://youtu.be/EByii89QzVQ?si=td8WOckyuKGbos_O';

// Exact burgundy, oxblood, silver and restrained ivory palette specified
const PLASMA_HERO_COLORS = ['#6C151E', '#3A0B10', '#521018', '#C7C8CC', '#E5E5E7'];

export function ExperienceHero() {
  const [isVideoModalOpen, setIsVideoModalOpen] = React.useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Dynamically calibrate sphere scale relative to viewport dimensions so it commands the space
  const [sphereScale, setSphereScale] = React.useState(72);
  // Defer heavy WebGL canvas initialization slightly so initial DOM, typography, and controls paint instantly
  const [isCanvasMounted, setIsCanvasMounted] = React.useState(false);

  React.useEffect(() => {
    // Mount WebGL sphere on next idle/frame cycle to prevent route transition stalls
    const rafId = requestAnimationFrame(() => {
      setIsCanvasMounted(true);
    });
    return () => cancelAnimationFrame(rafId);
  }, []);

  React.useEffect(() => {
    const updateScale = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (w < 640) {
        setSphereScale(62);
      } else if (w < 1024) {
        setSphereScale(68);
      } else if (w < 1440 || h < 820) {
        setSphereScale(72);
      } else {
        setSphereScale(76);
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // Close modal on Escape key and restore body scrolling
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsVideoModalOpen(false);
      }
    };
    if (isVideoModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isVideoModalOpen]);

  const handleScrollToExplore = () => {
    const target =
      document.getElementById('experience-ecosystem-strip') ||
      document.getElementById('section-01-learn-container') ||
      document.getElementById('section-01-learn') ||
      document.getElementById('section-learn') ||
      document.getElementById('01-learn');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollBy({ top: window.innerHeight * 0.85, behavior: 'smooth' });
    }
  };

  return (
    <section
      id="section-01-hero"
      aria-labelledby="experience-hero-title"
      className="
        relative isolate w-full overflow-hidden
        bg-[#F5F3F0] text-[#16171B]
        dark:bg-[#16171B] dark:text-[#F5F3F0]
        min-h-[calc(100dvh-78px)] sm:min-h-[calc(100dvh-84px)] lg:h-[calc(100dvh-84px)] xl:h-[calc(100dvh-90px)]
        lg:max-h-[calc(100dvh-84px)] xl:max-h-[calc(100dvh-90px)]
        flex flex-col justify-center
        transition-colors duration-300
      "
    >
      {/* Background Engineering Graph Grid & Atmospheric Ambient Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        {/* Engineering technical grid pattern */}
        <div
          className="
            absolute inset-0 opacity-[0.45] dark:opacity-[0.20]
            bg-[linear-gradient(to_right,rgba(108,21,30,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(108,21,30,0.06)_1px,transparent_1px)]
            dark:bg-[linear-gradient(to_right,rgba(229,229,231,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(229,229,231,0.05)_1px,transparent_1px)]
            [background-size:52px_52px]
          "
        />

        {/* Ambient warm radial glow positioned behind the visual */}
        <div
          className="
            absolute
            right-[-10%] top-[5%]
            h-[400px] w-[400px]
            sm:h-[520px] sm:w-[520px]
            lg:right-[5%] lg:top-[5%]
            lg:h-[min(680px,calc(100dvh-120px))] lg:w-[min(680px,calc(100dvh-120px))]
            rounded-full
            bg-[radial-gradient(circle,rgba(108,21,30,0.12)_0%,rgba(58,11,16,0.03)_45%,transparent_70%)]
            dark:bg-[radial-gradient(circle,rgba(240,120,132,0.14)_0%,rgba(108,21,30,0.06)_50%,transparent_70%)]
            blur-3xl
          "
        />
      </div>

      {/* Main Content Container: calibrated vertical padding so hero fits 100% in a single screen */}
      <div
        className="
          relative mx-auto w-full max-w-[1600px]
          px-5 sm:px-8 md:px-10 lg:px-12 xl:px-16
          py-2 sm:py-4 lg:py-2 xl:py-3
          flex-1 flex items-center justify-center
        "
      >
        <div
          className="
            w-full grid grid-cols-1 lg:grid-cols-12
            items-center
            gap-6 sm:gap-8 lg:gap-6 xl:gap-8
          "
        >
          {/* =========================================================
              LEFT COLUMN: EDITORIAL CONTENT & TYPOGRAPHY (5 cols)
          ========================================================== */}
          <div
            className="
              lg:col-span-5 xl:col-span-5
              flex flex-col justify-center
              z-10
            "
          >
            {/* Eyebrow: EXPERIENCES + Burgundy Horizontal Rule */}
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.08 }}
              className="flex items-center gap-3 mb-2 sm:mb-2.5"
            >
              <span
                className="
                  text-[11px] sm:text-[12px]
                  font-bold uppercase
                  tracking-[0.22em]
                  text-[#6C151E] dark:text-[#F07A86]
                  font-sans
                "
              >
                EXPERIENCES
              </span>
              <span
                className="
                  w-10 sm:w-14 h-[1.5px]
                  bg-[#6C151E] dark:bg-[#F07A86]
                  opacity-90
                "
                aria-hidden="true"
              />
            </motion.div>

            {/* Headline: Learn. Build. Connect. */}
            <h1
              id="experience-hero-title"
              className="
                font-serif font-bold
                leading-[0.92] sm:leading-[0.90]
                tracking-[-0.035em]
                text-[clamp(34px,4.4vw,66px)] 2xl:text-[72px]
                text-[#3A0B10] dark:text-[#FFF4F2]
                m-0
              "
            >
              <span className="block overflow-hidden py-0.5">
                <motion.span
                  className="inline-block"
                  initial={{ y: shouldReduceMotion ? 0 : '100%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
                >
                  Learn.
                </motion.span>
              </span>
              <span className="block overflow-hidden py-0.5">
                <motion.span
                  className="inline-block whitespace-normal sm:whitespace-nowrap"
                  initial={{ y: shouldReduceMotion ? 0 : '100%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
                >
                  Build. Connect.
                </motion.span>
              </span>
            </h1>

            {/* Subheadline: Three paths. A global quantum community. */}
            <motion.p
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.3 }}
              className="
                mt-2 sm:mt-3
                text-[16px] sm:text-[17.5px] lg:text-[18.5px] xl:text-[20px]
                font-semibold font-sans
                leading-[1.25]
                tracking-[-0.015em]
                text-[#16171B] dark:text-[#F5F3F0]
              "
            >
              Three paths. A global quantum community.
            </motion.p>

            {/* Body Description */}
            <motion.p
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.38 }}
              className="
                mt-1.5 sm:mt-2
                max-w-[440px]
                text-[13px] sm:text-[13.5px] lg:text-[14px]
                leading-[1.55]
                font-normal font-sans
                text-[#5A4D4B] dark:text-[#C7BCB9]
              "
            >
              Gain new skills, build real solutions, and connect with the people
              shaping the future of quantum computing.
            </motion.p>

            {/* Hero Actions Row: Watch Trailer + Scroll to explore */}
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.46 }}
              className="
                mt-4 sm:mt-5 lg:mt-5 xl:mt-6
                flex flex-wrap items-center
                gap-4 sm:gap-6
              "
            >
              {/* Watch Trailer Group with Thin Vertical Rule */}
              <div className="flex items-center gap-3 border-l-2 border-[#6C151E]/25 dark:border-[#F07A86]/30 pl-3 sm:pl-3.5">
                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(true)}
                  aria-label="Watch Qiskit Fall Fest 2026 Trailer (2 minutes)"
                  className="
                    group relative flex h-9 w-9 sm:h-10 sm:w-10
                    items-center justify-center
                    rounded-full
                    border border-[#6C151E] dark:border-[#F07A86]
                    bg-[#6C151E]/5 hover:bg-[#6C151E]
                    dark:bg-[#F07A86]/10 dark:hover:bg-[#F07A86]
                    focus-visible:ring-2 focus-visible:ring-[#6C151E] dark:focus-visible:ring-[#F07A86]
                    transition-all duration-200
                    cursor-pointer shadow-sm hover:scale-105
                  "
                >
                  <Play
                    size={13}
                    className="
                      ml-0.5 fill-[#6C151E] text-[#6C151E]
                      group-hover:fill-white group-hover:text-white
                      dark:fill-[#F07A86] dark:text-[#F07A86]
                      dark:group-hover:fill-[#16171B] dark:group-hover:text-[#16171B]
                      transition-colors
                    "
                  />
                </button>
                <div className="flex flex-col text-left">
                  <button
                    type="button"
                    onClick={() => setIsVideoModalOpen(true)}
                    className="
                      text-[13.5px] sm:text-[14px] font-bold font-sans
                      text-[#16171B] dark:text-[#FFF4F2]
                      hover:text-[#6C151E] dark:hover:text-[#F07A86]
                      transition-colors text-left cursor-pointer
                      leading-tight outline-none focus-visible:underline
                    "
                  >
                    Watch Trailer
                  </button>
                  <span className="text-[11px] text-[#7A6D6B] dark:text-[#A89B99] font-mono mt-0.5">
                    2 min
                  </span>
                </div>
              </div>

              {/* Vertical Divider between actions on larger screens */}
              <div
                className="hidden sm:block h-7 w-[1px] bg-[#6C151E]/15 dark:bg-white/15"
                aria-hidden="true"
              />

              {/* Scroll to explore visual cue */}
              <button
                type="button"
                onClick={handleScrollToExplore}
                aria-label="Scroll to explore Experience section"
                className="
                  group inline-flex items-center gap-2.5
                  text-[#3D3032] dark:text-[#D5C8C6]
                  hover:text-[#6C151E] dark:hover:text-[#F07A86]
                  focus-visible:ring-2 focus-visible:ring-[#6C151E] dark:focus-visible:ring-[#F07A86]
                  rounded-md p-1
                  transition-colors cursor-pointer outline-none
                "
              >
                {/* Mouse Outline Pill with Animated Dot */}
                <div
                  className="
                    w-[16px] h-[25px] rounded-full
                    border border-[#521018]/60 dark:border-white/50
                    group-hover:border-[#6C151E] dark:group-hover:border-[#F07A86]
                    flex justify-center pt-1
                    transition-colors
                  "
                  aria-hidden="true"
                >
                  <div
                    className="
                      w-1 h-1.5 rounded-full
                      bg-[#521018] dark:bg-white/80
                      group-hover:bg-[#6C151E] dark:group-hover:bg-[#F07A86]
                      animate-bounce
                    "
                  />
                </div>
                <span className="text-[13px] sm:text-[13.5px] font-medium font-sans tracking-tight">
                  Scroll to explore
                </span>
              </button>
            </motion.div>
          </div>

          {/* =========================================================
              RIGHT COLUMN: INTERACTIVE PLASMA RING & EDITORIAL ANNOTATIONS (7 cols)
              Calibrated with responsive explicit dimensions so the sphere scales
              with screen size while strictly fitting within the single-screen viewport.
          ========================================================== */}
          <div
            className="
              lg:col-span-7 xl:col-span-7
              relative
              flex items-center justify-center
              w-full
              h-[320px] sm:h-[420px] md:h-[480px]
              lg:h-[min(580px,calc(100dvh-130px))]
              xl:h-[min(660px,calc(100dvh-140px))]
              2xl:h-[min(740px,calc(100dvh-150px))]
            "
          >
            {/* Upper-Right Editorial Text Block (PEOPLE, IDEAS, etc.) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="
                pointer-events-none absolute
                top-0 sm:top-1 lg:top-2 right-0 sm:right-1 lg:right-2
                z-20 flex flex-col items-start select-none
              "
              aria-label="People, Ideas, Technology, A Brighter Tomorrow"
            >
              <div
                className="
                  text-[9.5px] sm:text-[10px] lg:text-[11px] font-mono
                  tracking-[0.18em] uppercase leading-[1.6]
                  text-[#3D3032] dark:text-[#E2D6D4] font-medium
                "
              >
                <div>PEOPLE</div>
                <div>IDEAS</div>
                <div>TECHNOLOGY</div>
                <div>A BRIGHTER</div>
                <div>TOMORROW</div>
              </div>
              <div
                className="mt-1.5 w-7 sm:w-9 h-[1.5px] bg-[#6C151E] dark:bg-[#F07A86]"
                aria-hidden="true"
              />
            </motion.div>

            {/* Lower-Right Editorial Text Block (A DECADE OF PROGRESS, etc.) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="
                pointer-events-none absolute
                bottom-0 sm:bottom-1 lg:bottom-2 right-0 sm:right-1 lg:right-2
                z-20 flex flex-col items-start select-none
              "
              aria-label="A Decade of Progress, A Brighter Quantum Future"
            >
              <div
                className="
                  text-[9px] sm:text-[9.5px] lg:text-[10px] font-mono
                  tracking-[0.16em] uppercase leading-[1.6]
                  text-[#7A6D6B] dark:text-[#A89B99]
                "
              >
                <div>A DECADE</div>
                <div>OF PROGRESS.</div>
                <div>A BRIGHTER</div>
                <div>QUANTUM FUTURE.</div>
              </div>
            </motion.div>

            {/* Central Interactive PlasmaRing Visual Container:
                Takes generous responsive aspect-square bounds so the WebGL sphere
                renders in true circular aspect ratio and commands the right side. */}
            <motion.div
              initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="
                relative w-full h-full
                aspect-square
                max-w-[320px] max-h-[320px]
                sm:max-w-[420px] sm:max-h-[420px]
                md:max-w-[480px] md:max-h-[480px]
                lg:max-w-[min(580px,calc(100dvh-130px))]
                lg:max-h-[min(580px,calc(100dvh-130px))]
                xl:max-w-[min(660px,calc(100dvh-140px))]
                xl:max-h-[min(660px,calc(100dvh-140px))]
                2xl:max-w-[min(740px,calc(100dvh-150px))]
                2xl:max-h-[min(740px,calc(100dvh-150px))]
                flex items-center justify-center
              "
              aria-hidden="true"
            >
              {isCanvasMounted ? (
                <PlasmaRing
                  background="transparent"
                  colors={PLASMA_HERO_COLORS}
                  density={120}
                  speed={85}
                  waveHeight={22}
                  centerOpacity={92}
                  scale={sphereScale}
                  dragSensitivity={100}
                  className="w-full h-full"
                />
              ) : (
                <div
                  aria-hidden="true"
                  className="w-3/4 h-3/4 rounded-full bg-[radial-gradient(circle,rgba(108,21,30,0.14)_0%,transparent_70%)] animate-pulse"
                />
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* =========================================================
          ACCESSIBLE VIDEO MODAL FOR WATCH TRAILER
      ========================================================== */}
      {isVideoModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-trailer-title"
          className="
            fixed inset-0 z-50
            flex items-center justify-center
            p-4 sm:p-6 md:p-10
            bg-black/80 backdrop-blur-sm
          "
          onClick={() => setIsVideoModalOpen(false)}
        >
          <div
            className="
              relative
              w-full max-w-4xl
              bg-[#161112] text-white
              rounded-xl
              border border-white/15
              shadow-[0_24px_50px_rgba(0,0,0,0.7)]
              overflow-hidden
            "
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#EF7885]" aria-hidden="true" />
                <h3
                  id="modal-trailer-title"
                  className="text-sm font-semibold tracking-wide uppercase font-sans"
                >
                  Qiskit Fall Fest 2026 • Official Trailer
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={TRAILER_YOUTUBE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    inline-flex items-center gap-1.5
                    text-xs text-white/70 hover:text-white
                    transition-colors
                  "
                >
                  <span>Open on YouTube</span>
                  <ExternalLink size={13} />
                </a>
                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(false)}
                  aria-label="Close trailer modal"
                  className="
                    p-1.5 rounded-md
                    text-white/70 hover:text-white hover:bg-white/10
                    transition-colors cursor-pointer
                  "
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Video Player Embed */}
            <div className="relative w-full aspect-video bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${TRAILER_VIDEO_ID}?autoplay=1&rel=0`}
                title="Qiskit Fall Fest 2026 Official Trailer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
