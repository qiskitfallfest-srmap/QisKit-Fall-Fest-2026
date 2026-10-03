'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { REGISTRATION_URL } from '@/lib/constants';
import { trackUnstopClick } from '@/lib/analytics';
import { ResponsivePicture } from '@/components/shared/ResponsivePicture';

type PhaseId = 'online' | 'on-campus';

interface PhaseConfig {
  id: PhaseId;
  label: string;
  name: string;
  dateRange: string;
  targetTime: number;
  description: string;
  liveTitle: string;
  liveDate: string;
  joinLabel: string;
  joinUrl: string;
}

const PHASES: Record<PhaseId, PhaseConfig> = {
  online: {
    id: 'online',
    label: 'ONLINE PHASE',
    name: 'Online Phase',
    dateRange: '8 – 10 OCT 2026',
    targetTime: new Date('2026-10-08T00:00:00+05:30').getTime(),
    description: 'Countdown to the Qiskit Fall Fest 2026 Online Phase workshops, hackathon kickoff, and worldwide sessions.',
    liveTitle: 'THE ONLINE PHASE IS LIVE',
    liveDate: 'Qiskit Fall Fest 2026 Online Phase · 8 – 10 October 2026',
    joinLabel: 'Join the Online Phase',
    joinUrl: REGISTRATION_URL,
  },
  'on-campus': {
    id: 'on-campus',
    label: 'ON-CAMPUS PHASE',
    name: 'On-Campus Phase',
    dateRange: '26 – 30 OCT 2026',
    targetTime: new Date('2026-10-26T00:00:00+05:30').getTime(),
    description: 'Countdown to the Qiskit Fall Fest 2026 On-Campus Phase at SRM University-AP in Amaravati, India.',
    liveTitle: 'THE ON-CAMPUS PHASE IS LIVE',
    liveDate: 'Qiskit Fall Fest 2026 On-Campus Phase · 26 – 30 October 2026',
    joinLabel: 'Explore Campus Events',
    joinUrl: '/schedule#offline-day-1',
  },
};

const COUNTDOWN_PHRASES = [
  {
    id: 'future',
    text: 'THE FUTURE IS A CLICK AWAY',
    words: ['THE', 'FUTURE', 'IS', 'A', 'CLICK', 'AWAY'],
  },
  {
    id: 'quantum-era',
    text: 'THE QUANTUM ERA STARTS RIGHT HERE',
    words: ['THE', 'QUANTUM', 'ERA', 'STARTS', 'RIGHT', 'HERE'],
  },
  {
    id: 'breakthrough',
    text: 'THE NEXT BREAKTHROUGH BEGINS WITH YOU',
    words: ['THE', 'NEXT', 'BREAKTHROUGH', 'BEGINS', 'WITH', 'YOU'],
  },
  {
    id: 'cloud',
    text: 'THE CLOUD CONNECTS US TO QUANTUM',
    words: ['THE', 'CLOUD', 'CONNECTS', 'US', 'TO', 'QUANTUM'],
  },
];

const wordVariants = {
  initial: { opacity: 0, y: 16, filter: 'blur(2px)' },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.42,
      delay: i * 0.065,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
  exit: (i: number) => ({
    opacity: 0,
    y: -16,
    filter: 'blur(2px)',
    transition: {
      duration: 0.38,
      delay: i * 0.05,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isLive: boolean;
}

function calculateTimeRemaining(targetTime: number): TimeRemaining {
  const difference = targetTime - Date.now();

  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isLive: true,
    };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    isLive: false,
  };
}

export function CountdownSection() {
  const [selectedPhase, setSelectedPhase] = React.useState<PhaseId>('online');
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);
  const [phraseIdx, setPhraseIdx] = React.useState(0);
  const [timeLeft, setTimeLeft] = React.useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isLive: false,
  });

  const activePhase = PHASES[selectedPhase];

  // Client hydration check
  React.useEffect(() => {
    setMounted(true);
    setTimeLeft(calculateTimeRemaining(activePhase.targetTime));
  }, [activePhase.targetTime]);

  // Tick timer every second
  React.useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeRemaining(activePhase.targetTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [mounted, activePhase.targetTime]);

  // Handle phase switch with smooth crossfade
  const handlePhaseChange = (phase: PhaseId) => {
    if (phase === selectedPhase) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedPhase(phase);
      setTimeLeft(calculateTimeRemaining(PHASES[phase].targetTime));
      setIsTransitioning(false);
    }, 180);
  };

  const formatUnit = (value: number, isDay = false) => {
    if (!mounted) return '--';
    if (isDay) return String(value);
    return String(value).padStart(2, '0');
  };

  const UNITS = [
    { key: 'days', label: 'DAYS', value: formatUnit(timeLeft.days, true) },
    { key: 'hours', label: 'HOURS', value: formatUnit(timeLeft.hours) },
    { key: 'minutes', label: 'MINUTES', value: formatUnit(timeLeft.minutes) },
    { key: 'seconds', label: 'SECONDS', value: formatUnit(timeLeft.seconds) },
  ];

  return (
    <section
      id="section-05-countdown"
      aria-label="Countdown to Qiskit Fall Fest 2026"
      className="
        relative isolate w-full overflow-x-clip overflow-y-visible
        bg-[#541018] dark:bg-[#140708]
        min-h-auto lg:min-h-[clamp(540px,67svh,680px)] xl:min-h-[clamp(600px,69svh,750px)]
        py-[64px] px-[20px] lg:p-0
        flex flex-col justify-center
        transition-colors duration-300
      "
    >
      {/* =========================================================
          BACKGROUND ARTWORK LAYERS (Phase 11: Viewport-Adaptive Framing)
      ========================================================== */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 select-none overflow-hidden [&_img]:object-[68%_50%] sm:[&_img]:object-[64%_50%] lg:[&_img]:object-[62%_48%] xl:[&_img]:object-[60%_47%]"
      >
        <ResponsivePicture
          page="home"
          index={4}
          alt="Countdown Background Artwork"
          fill
        />

        {/* Cinematic Gradient Overlays */}
        <div
          className="
            absolute inset-0 dark:hidden
            [background:linear-gradient(90deg,rgba(41,6,10,0.82)_0%,rgba(76,10,18,0.64)_43%,rgba(43,5,9,0.76)_100%)]
          "
        />
        <div
          className="
            absolute inset-0 hidden dark:block
            [background:linear-gradient(90deg,rgba(8,5,5,0.88)_0%,rgba(32,7,10,0.74)_46%,rgba(8,5,5,0.85)_100%)]
          "
        />

        {/* Countdown to Hosted At Bottom Seam Blend (Single Owner: Countdown owns boundary) */}
        <div
          className="
            absolute -bottom-[1px] left-0 right-0 h-[clamp(40px,5vh,58px)] pointer-events-none z-[1]
            dark:hidden
            [background:linear-gradient(to_bottom,transparent_0%,rgba(143,23,35,0.12)_45%,rgba(245,240,234,0.70)_85%,#F5F0EA_100%)]
          "
        />
        <div
          className="
            absolute -bottom-[1px] left-0 right-0 h-[clamp(40px,5vh,58px)] pointer-events-none z-[1]
            hidden dark:block
            [background:linear-gradient(to_bottom,transparent_0%,rgba(24,7,10,0.15)_45%,rgba(13,9,9,0.72)_85%,#0D0909_100%)]
          "
        />
      </div>

      {/* =========================================================
          CONTENT CONTAINER (Phase 10: +10px Internal Micro-Spacing)
      ========================================================== */}
      <div
        className="
          relative z-10 w-full max-w-[1920px] mx-auto
          px-5 sm:px-[34px] md:px-[52px] lg:px-[64px] xl:px-[76px] 2xl:px-[96px]
          py-[66px] pb-[70px] lg:py-0 lg:pt-[clamp(78px,8vh,102px)] lg:pb-[clamp(72px,8vh,100px)]
          flex flex-col justify-center
        "
      >
        {timeLeft.isLive ? (
          /* =========================================================
              LIVE STATE DISPLAY
          ========================================================== */
          <div
            aria-live="polite"
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 py-4"
          >
            <div>
              <div className="flex items-center gap-[10px]">
                <span
                  aria-hidden="true"
                  className="w-[5px] h-[5px] rotate-45 shrink-0 bg-[#E7A4AA]"
                />
                <span className="font-sans font-bold text-[13px] lg:text-[14px] tracking-[0.20em] uppercase text-[#E7A4AA]">
                  {activePhase.label}
                </span>
              </div>
              <h2 className="mt-3 font-serif font-bold text-[36px] sm:text-[44px] lg:text-[52px] leading-[0.94] tracking-[-0.035em] text-[#FFF1EE]">
                {activePhase.liveTitle}
              </h2>
              <p className="mt-3 text-[14.5px] font-normal leading-[1.55] text-[#FFF1EE]/80">
                {activePhase.liveDate}
              </p>
            </div>

            <Link
              href={activePhase.joinUrl}
              target={activePhase.joinUrl.startsWith('http') ? '_blank' : undefined}
              rel={activePhase.joinUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
              onClick={() => {
                if (activePhase.joinUrl.includes('unstop.com') || activePhase.joinUrl === REGISTRATION_URL) {
                  trackUnstopClick('countdown_live');
                }
              }}
              className="
                group relative inline-flex items-center justify-center gap-3
                px-7 py-4 rounded-full overflow-hidden
                bg-[#FFF1EE] text-[#541018] font-sans font-bold text-[14px] tracking-[0.03em]
                hover:shadow-[0_10px_28px_rgba(0,0,0,0.24)] hover:scale-[1.02]
                transition-all duration-200
              "
            >
              <span>{activePhase.joinLabel}</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        ) : (
          /* =========================================================
              STANDARD COUNTDOWN DISPLAY WITH INTERACTIVE PHASE CONTROL
          ========================================================== */
          <div
            className="
              grid grid-cols-1
              lg:grid-cols-[minmax(370px,0.9fr)_minmax(0,1.1fr)]
              xl:grid-cols-[minmax(430px,0.86fr)_minmax(0,1.14fr)]
              gap-8 sm:gap-[34px] xl:gap-[clamp(42px,4vw,82px)]
              items-center
            "
          >
            {/* Left Editorial Column */}
            <div className="w-full max-w-[700px]">
              {/* Header Row: Eyebrow + Interactive Phase Selector */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3.5">
                <div className="flex items-center gap-[10px]">
                  <span
                    aria-hidden="true"
                    className="w-[5px] h-[5px] rotate-45 shrink-0 bg-[#E7A4AA]"
                  />
                  <span className="font-sans font-bold text-[13px] lg:text-[14px] tracking-[0.20em] uppercase text-[#E7A4AA]">
                    COUNTDOWN
                  </span>
                </div>

                {/* Segmented Phase Switcher Control */}
                <div
                  role="tablist"
                  aria-label="Select Event Phase"
                  className="
                    inline-flex items-center p-1 rounded-full
                    border border-white/15 bg-[rgba(28,5,9,0.35)]
                    backdrop-blur-[10px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]
                  "
                >
                  <button
                    type="button"
                    role="tab"
                    id="phase-tab-online"
                    aria-selected={selectedPhase === 'online'}
                    aria-controls="countdown-timer-view"
                    onClick={() => handlePhaseChange('online')}
                    className={`
                      px-3.5 py-1.5 rounded-full font-sans font-bold text-[10.5px] sm:text-[11px] tracking-[0.14em] uppercase
                      transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#EF7481]
                      ${
                        selectedPhase === 'online'
                          ? 'bg-[#8F1723] text-[#FFF5F1] border border-[rgba(239,116,129,0.30)] shadow-[0_4px_16px_rgba(0,0,0,0.22)]'
                          : 'text-[rgba(255,241,237,0.68)] hover:text-[#FFF2EE] hover:bg-[rgba(143,23,35,0.26)] hover:-translate-y-[1px]'
                      }
                    `}
                  >
                    ONLINE PHASE
                  </button>

                  <button
                    type="button"
                    role="tab"
                    id="phase-tab-campus"
                    aria-selected={selectedPhase === 'on-campus'}
                    aria-controls="countdown-timer-view"
                    onClick={() => handlePhaseChange('on-campus')}
                    className={`
                      px-3.5 py-1.5 rounded-full font-sans font-bold text-[10.5px] sm:text-[11px] tracking-[0.14em] uppercase
                      transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#EF7481]
                      ${
                        selectedPhase === 'on-campus'
                          ? 'bg-[#8F1723] text-[#FFF5F1] border border-[rgba(239,116,129,0.30)] shadow-[0_4px_16px_rgba(0,0,0,0.22)]'
                          : 'text-[rgba(255,241,237,0.68)] hover:text-[#FFF2EE] hover:bg-[rgba(143,23,35,0.26)] hover:-translate-y-[1px]'
                      }
                    `}
                  >
                    ON-CAMPUS PHASE
                  </button>
                </div>
              </div>

              {/* Phase 8: Single Permanent Headline */}
              <h2
                className="
                  mt-3 font-serif font-bold uppercase
                  text-[clamp(44px,11vw,56px)] sm:text-[clamp(48px,4vw,60px)] lg:text-[clamp(60px,4.1vw,80px)]
                  leading-[0.94] tracking-[-0.035em]
                  max-w-[690px]
                  text-transparent bg-clip-text
                  [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]
                  bg-[linear-gradient(105deg,#FFF8F4_0%,#F7DDD9_55%,#EFA1AA_100%)]
                "
              >
                <span className="block">THE FUTURE IS</span>
                <span className="block">A CLICK AWAY</span>
              </h2>

              {/* Phase Description (Phase 16: Transitions smoothly with active phase) */}
              <p
                className={`
                  mt-[16px] text-[14.5px] lg:text-[15.5px] font-normal leading-[1.55] text-[#D7C1BE] max-w-[480px]
                  transition-opacity duration-240
                  ${isTransitioning ? 'opacity-0' : 'opacity-100'}
                `}
              >
                {activePhase.description}
              </p>

              {/* Phase 17: Context-Aware Schedule CTA (Shimmer Track + Arrow Glide Interaction) */}
              <div className="mt-6 sm:mt-7">
                <Link
                  href={selectedPhase === 'online' ? '/schedule#online-day-1' : '/schedule#offline-day-1'}
                  data-cursor="cta"
                  aria-label={selectedPhase === 'online' ? 'View Online Schedule' : 'View On-Campus Schedule'}
                  className="
                    group relative inline-flex h-[46px] sm:h-[48px] items-center justify-between overflow-hidden
                    rounded-[8px] pl-6 pr-3 text-[14px] sm:text-[14.5px] font-semibold tracking-[0.01em] outline-none
                    border border-[rgba(255,214,218,0.18)]
                    bg-[linear-gradient(110deg,#9D1726,#B51E30)] text-[#FFF7F3]
                    shadow-[0_4px_14px_rgba(108,21,30,0.18)]
                    hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(181,30,48,0.32)] hover:brightness-105
                    active:scale-[0.985]
                    focus-visible:ring-2 focus-visible:ring-burgundy focus-visible:ring-offset-2
                    transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                  "
                >
                  {/* Single-Pass Sheen Track Layer (sweeps left to right on hover) */}
                  <span
                    aria-hidden="true"
                    className="
                      pointer-events-none absolute w-[36%] h-[180%] top-[-40%] left-0
                      -translate-x-[180%] rotate-[18deg]
                      bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.28),transparent)]
                      transition-transform duration-[680ms] ease-out group-hover:translate-x-[430%]
                    "
                  />

                  {/* Button Label */}
                  <span className="relative z-10 mr-4 tracking-wide uppercase text-[12px] sm:text-[12.5px] transition-colors duration-200">
                    {selectedPhase === 'online' ? 'View Online Schedule' : 'View On-Campus Schedule'}
                  </span>

                  {/* Circular Arrow Chamber with Arrow Glide */}
                  <span
                    aria-hidden="true"
                    className="
                      relative z-10 flex h-[28px] w-[28px] items-center justify-center rounded-full
                      bg-[rgba(255,255,255,0.14)] text-[#FFF7F3] border border-white/20
                      transition-transform duration-300 ease-out group-hover:translate-x-[4px]
                    "
                  >
                    <ArrowRight
                      size={14}
                      strokeWidth={2.4}
                      className="transition-transform duration-300 ease-out group-hover:translate-x-[1.5px] group-hover:rotate-[-2deg]"
                    />
                  </span>
                </Link>
              </div>
            </div>

            {/* Right Countdown Column */}
            <div
              id="countdown-timer-view"
              role="tabpanel"
              aria-labelledby={`phase-tab-${selectedPhase === 'online' ? 'online' : 'campus'}`}
              className={`
                w-full lg:max-w-[920px] lg:justify-self-end
                flex flex-col
                transition-all duration-240
                ${isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}
              `}
            >
              {/* 4 Unit Boxes */}
              <div
                className="
                  grid grid-cols-2 sm:grid-cols-4
                  gap-[12px] xl:gap-[clamp(12px,1.2vw,22px)]
                  w-full
                "
              >
                {UNITS.map((unit) => (
                  <div
                    key={unit.key}
                    className="
                      group flex flex-col items-center justify-center
                      h-[clamp(138px,9.2vw,168px)]
                      p-[clamp(14px,1.2vw,20px)]
                      rounded-[8px]
                      bg-[#23080B]/44
                      border border-[#F6D0CF]/28
                      backdrop-blur-[6px]
                      shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]
                      transition-all duration-300 ease-out
                      hover:-translate-y-[3px] hover:border-[rgba(239,116,129,0.38)]
                      hover:bg-[rgba(55,11,17,0.50)] hover:shadow-[0_14px_34px_rgba(0,0,0,0.22),0_0_20px_rgba(180,35,49,0.09)]
                    "
                  >
                    {/* Number with smooth vertical roll/fade */}
                    <span
                      className="
                        font-serif font-bold tabular-nums
                        text-[40px] sm:text-[44px] md:text-[48px] lg:text-[clamp(48px,3.4vw,66px)]
                        leading-[0.9] text-[#FFF6F2]
                        transition-opacity duration-180
                      "
                    >
                      {unit.value}
                    </span>

                    {/* Unit Label */}
                    <span
                      className="
                        mt-[8px] sm:mt-[10px] font-sans font-semibold uppercase
                        text-[10px] sm:text-[10.5px] lg:text-[11.5px]
                        tracking-[0.14em] text-[#FFEBE8]/68
                      "
                    >
                      {unit.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Phase confirmation text & date range */}
              <div
                className="
                  flex items-center justify-between flex-wrap gap-2
                  pt-1.5 px-0.5
                "
              >
                <span className="font-sans text-[11px] font-semibold tracking-[0.14em] uppercase text-[#FFEBE8]/60">
                  EVENT COUNTDOWN
                </span>
                <span className="font-sans text-[12.5px] sm:text-[13.5px] font-bold tracking-[0.10em] uppercase text-[#E9C1BD]">
                  {activePhase.name.toUpperCase()} · {activePhase.dateRange}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
