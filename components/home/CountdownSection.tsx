'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { REGISTRATION_URL } from '@/lib/constants';
import { ResponsivePicture } from '@/components/shared/ResponsivePicture';

const ONLINE_PHASE_START = new Date('2026-10-05T00:00:00+05:30').getTime();

const COUNTDOWN_ASSETS = {
  backgroundLight: '/images/home/countdown/HOME-05-COUNTDOWN-BACKGROUND-LIGHT.png',
  backgroundDark: '/images/home/countdown/HOME-05-COUNTDOWN-BACKGROUND-DARK.png',
};

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isLive: boolean;
}

function calculateTimeRemaining(): TimeRemaining {
  const difference = ONLINE_PHASE_START - Date.now();

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

let currentSnapshot: TimeRemaining = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  isLive: false,
};
let lastSecond = -1;

function getSnapshot(): TimeRemaining {
  const nowSecond = Math.floor(Date.now() / 1000);
  if (nowSecond !== lastSecond) {
    lastSecond = nowSecond;
    currentSnapshot = calculateTimeRemaining();
  }
  return currentSnapshot;
}

const SERVER_SNAPSHOT: TimeRemaining = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  isLive: false,
};

function getServerSnapshot(): TimeRemaining {
  return SERVER_SNAPSHOT;
}

function subscribe(callback: () => void) {
  const interval = setInterval(callback, 1000);
  return () => clearInterval(interval);
}

export function CountdownSection() {
  const timeLeft = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

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
      aria-label="Countdown to Qiskit Fall Fest 2026 Online Phase"
      className="
        relative isolate w-full overflow-hidden
        bg-[#541018] dark:bg-[#140708]
        min-h-[calc(100svh-var(--navbar-height,80px))]
        flex flex-col justify-center
        transition-colors duration-300
      "
    >
      {/* =========================================================
          BACKGROUND ARTWORK LAYERS
      ========================================================== */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 select-none overflow-hidden"
      >
        <ResponsivePicture
          page="home"
          index={4}
          alt="Online Phase Countdown Background"
          fill
        />

        {/* Cinematic Gradient Overlays */}
        <div
          className="
            absolute inset-0 dark:hidden
            [background:linear-gradient(90deg,rgba(41,6,10,0.80)_0%,rgba(76,10,18,0.62)_43%,rgba(43,5,9,0.74)_100%)]
          "
        />
        <div
          className="
            absolute inset-0 hidden dark:block
            [background:linear-gradient(90deg,rgba(8,5,5,0.87)_0%,rgba(32,7,10,0.72)_46%,rgba(8,5,5,0.84)_100%)]
          "
        />
      </div>

      {/* =========================================================
          CONTENT CONTAINER
      ========================================================== */}
      <div
        className="
          relative z-10 w-full max-w-[1920px] mx-auto
          px-5 sm:px-[34px] md:px-[52px] lg:px-[64px] xl:px-[76px] 2xl:px-[96px]
          py-12 sm:py-16 lg:py-20
          min-h-[calc(100svh-var(--navbar-height,80px))]
          flex flex-col justify-center
        "
      >
        {timeLeft.isLive ? (
          /* =========================================================
              LIVE STATE DISPLAY (When Countdown reaches zero)
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
                <span className="font-sans font-semibold text-[11px] lg:text-[11.5px] tracking-[0.19em] uppercase text-[#E7A4AA]">
                  ONLINE PHASE
                </span>
              </div>
              <h2 className="mt-3 font-serif font-bold text-[34px] sm:text-[39px] lg:text-[48px] leading-[0.92] tracking-[-0.035em] text-[#FFF1EE]">
                THE ONLINE PHASE IS LIVE
              </h2>
              <p className="mt-3 text-[12.5px] font-normal leading-[1.45] text-[#FFF1EE]/70">
                Qiskit Fall Fest 2026 Online Phase · 5 – 9 October 2026
              </p>
            </div>

            <Link
              href={REGISTRATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="
                inline-flex items-center gap-3 self-start lg:self-center
                px-6 py-3.5 rounded-[6px]
                bg-[#FFF1EE] text-[#541018] font-sans font-bold text-[13.5px] tracking-[0.04em]
                hover:bg-white hover:scale-[1.02] transition-all duration-180
              "
            >
              <span>Join the Online Phase</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* =========================================================
              STANDARD COUNTDOWN DISPLAY
          ========================================================== */
          <div
            className="
              grid grid-cols-1
              lg:grid-cols-[minmax(320px,0.88fr)_minmax(620px,1.35fr)]
              gap-8 sm:gap-10 lg:gap-[clamp(56px,7vw,120px)]
              items-center
            "
          >
            {/* Left Editorial Column */}
            <div className="w-full max-w-[480px]">
              {/* Eyebrow with diamond marker */}
              <div className="flex items-center gap-[10px]">
                <span
                  aria-hidden="true"
                  className="w-[5px] h-[5px] rotate-45 shrink-0 bg-[#E7A4AA]"
                />
                <span className="font-sans font-semibold text-[10px] sm:text-[11px] lg:text-[11.5px] 2xl:text-[12px] tracking-[0.19em] uppercase text-[#E7A4AA]">
                  COUNTDOWN
                </span>
              </div>

              {/* Heading */}
              <h2
                className="
                  mt-3 font-serif font-bold uppercase
                  text-[34px] sm:text-[39px] md:text-[44px] lg:text-[48px] xl:text-[52px] 2xl:text-[56px]
                  leading-[0.92] tracking-[-0.035em]
                  text-[#FFF1EE]
                "
              >
                <span className="block">THE FUTURE</span>
                <span className="block whitespace-nowrap">IS A CLICK AWAY</span>
              </h2>

              {/* Supporting Copy */}
              <p className="mt-[13px] text-[12px] lg:text-[12.5px] font-normal leading-[1.45] text-[#FFF1EE]/70 max-w-[350px]">
                Countdown to the Qiskit Fall Fest 2026 Online Phase.
              </p>
            </div>

            {/* Right Countdown Column */}
            <div className="w-full flex flex-col gap-3">
              {/* 4 Unit Boxes */}
              <div
                className="
                  grid grid-cols-2 sm:grid-cols-4
                  gap-[10px] sm:gap-[10px] lg:gap-4 2xl:gap-[18px]
                  w-full
                "
              >
                {UNITS.map((unit) => (
                  <div
                    key={unit.key}
                    className="
                      group flex flex-col items-center justify-center
                      h-[96px] sm:h-[100px] lg:h-[116px] 2xl:h-[124px]
                      p-[14px_8px] sm:p-[16px_10px] lg:p-[18px_12px]
                      rounded-[5px]
                      bg-[#23080B]/40
                      border border-[#F6D0CF]/30
                      backdrop-blur-[2px]
                      shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]
                      transition-all duration-180 ease-out
                      hover:bg-[#490F16]/45 hover:border-[#F79AA5]/45 hover:-translate-y-[1px]
                    "
                  >
                    {/* Number */}
                    <span
                      className="
                        font-serif font-bold tabular-nums
                        text-[38px] sm:text-[37px] md:text-[42px] lg:text-[46px] xl:text-[49px] 2xl:text-[52px]
                        leading-[0.9] text-[#FFF0EC]
                        transition-opacity duration-120
                      "
                    >
                      {unit.value}
                    </span>

                    {/* Unit Label */}
                    <span
                      className="
                        mt-[10px] font-sans font-semibold uppercase
                        text-[9px] sm:text-[9.5px] lg:text-[10px]
                        tracking-[0.14em] text-[#FFEBE8]/70
                      "
                    >
                      {unit.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Phase confirmation text */}
              <div
                className="
                  text-[10.5px] font-semibold tracking-[0.12em]
                  text-[#FFEBE8]/65
                  text-center sm:text-right
                  pt-1
                "
              >
                ONLINE PHASE · 5 – 9 OCT 2026
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
