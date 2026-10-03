'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ResponsivePicture } from '@/components/shared/ResponsivePicture';

const EYEBROW_TEXT = 'HOSTED AT';

export function HostedAtSection() {
  const [isVisible, setIsVisible] = React.useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);
  const [eyebrowChars, setEyebrowChars] = React.useState(0);
  const [isTypingDone, setIsTypingDone] = React.useState(false);

  const sectionRef = React.useRef<HTMLElement>(null);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const titleRef = React.useRef<HTMLHeadingElement>(null);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    if (mediaQuery.matches) {
      setIsVisible(true);
      setEyebrowChars(EYEBROW_TEXT.length);
      setIsTypingDone(true);
      return;
    }

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
      if (e.matches) {
        setEyebrowChars(EYEBROW_TEXT.length);
        setIsTypingDone(true);
      }
    };
    mediaQuery.addEventListener('change', handleMotionChange);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      mediaQuery.removeEventListener('change', handleMotionChange);
      observer.disconnect();
    };
  }, []);

  // Phase 20: One-time typewriter for "HOSTED AT"
  React.useEffect(() => {
    if (!isVisible || prefersReducedMotion || isTypingDone) return;

    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      setEyebrowChars(current);
      if (current >= EYEBROW_TEXT.length) {
        clearInterval(interval);
        setTimeout(() => setIsTypingDone(true), 500);
      }
    }, 95);

    return () => clearInterval(interval);
  }, [isVisible, prefersReducedMotion, isTypingDone]);

  // Phase 18: Card Pointer Movement (Subtle 3D perspective tilt)
  const handleCardPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    const rx = (-ny * 1.0).toFixed(2);
    const ry = (nx * 1.2).toFixed(2);

    cardRef.current.style.setProperty('--glass-rx', `${rx}deg`);
    cardRef.current.style.setProperty('--glass-ry', `${ry}deg`);
    cardRef.current.style.setProperty('--glass-ty', '-2px');
    cardRef.current.style.setProperty('--glass-x', `${(e.clientX - rect.left).toFixed(1)}px`);
    cardRef.current.style.setProperty('--glass-y', `${(e.clientY - rect.top).toFixed(1)}px`);
    cardRef.current.style.setProperty('--glass-hover', '1');
  };

  const handleCardPointerLeave = () => {
    if (prefersReducedMotion || !cardRef.current) return;
    cardRef.current.style.setProperty('--glass-rx', '0deg');
    cardRef.current.style.setProperty('--glass-ry', '0deg');
    cardRef.current.style.setProperty('--glass-ty', '0px');
    cardRef.current.style.setProperty('--glass-hover', '0');
  };

  // Phase 21: Local Title Pointer Movement
  const handleTitlePointerMove = (e: React.PointerEvent<HTMLHeadingElement>) => {
    if (prefersReducedMotion || !titleRef.current) return;
    const rect = titleRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left).toFixed(1);
    const y = (e.clientY - rect.top).toFixed(1);
    titleRef.current.style.setProperty('--title-x', `${x}px`);
    titleRef.current.style.setProperty('--title-y', `${y}px`);
    titleRef.current.style.setProperty('--title-hover', '1');
  };

  const handleTitlePointerLeave = () => {
    if (prefersReducedMotion || !titleRef.current) return;
    titleRef.current.style.setProperty('--title-hover', '0');
  };

  return (
    <section
      ref={sectionRef}
      id="section-07-hosted-at"
      aria-labelledby="hosted-at-heading"
      className="
        relative isolate w-full overflow-hidden
        bg-[#F5F0EA] dark:bg-[#0D0909]
        min-h-[clamp(680px,78svh,860px)]
        flex flex-col justify-center
        transition-colors duration-300
      "
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes hostedMarkerPulse {
          0%, 100% {
            transform: rotate(45deg) scale(1);
            opacity: 0.85;
          }
          50% {
            transform: rotate(45deg) scale(1.15);
            opacity: 1;
          }
        }
        .hosted-marker-glow {
          animation: hostedMarkerPulse 2.8s ease-in-out infinite;
        }

        .hosted-title-gradient {
          background: linear-gradient(105deg, #70131D 0%, #941B27 50%, #74141E 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          transition: filter 260ms ease-out;
        }
        .dark .hosted-title-gradient {
          background: linear-gradient(105deg, #FFF0EC 0%, #F4D6D3 50%, #F08B97 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        @media (hover: hover) and (pointer: fine) {
          .hosted-title-gradient.is-title-hovered {
            background: radial-gradient(260px circle at var(--title-x, 50%) var(--title-y, 50%), #C7394A 0%, #931725 36%, #67111A 75%);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
          }
          .dark .hosted-title-gradient.is-title-hovered {
            background: radial-gradient(260px circle at var(--title-x, 50%) var(--title-y, 50%), #FFE1D9 0%, #F18A96 40%, #D85B69 76%);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hosted-marker-glow {
            animation: none !important;
          }
        }
      `}} />

      {/* =========================================================
          BACKGROUND ARTWORK LAYER (Embedded Campus Visuals)
      ========================================================== */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 z-0 select-none overflow-hidden transition-transform duration-1000 ease-out ${
          isVisible ? 'scale-100' : 'scale-[1.015]'
        }`}
      >
        <ResponsivePicture
          page="home"
          index={3}
          alt="SRM University-AP Campus Visual"
          fill
        />

        {/* Desktop & Tablet Soft Readability Gradient Protecting Left Editorial Region */}
        <div
          aria-hidden="true"
          className="
            hidden sm:block pointer-events-none absolute inset-0 z-[1]
            bg-[linear-gradient(90deg,rgba(245,240,234,0.90)_0%,rgba(245,240,234,0.68)_36%,rgba(245,240,234,0.18)_52%,transparent_66%)]
            dark:bg-[linear-gradient(90deg,rgba(13,9,9,0.94)_0%,rgba(13,9,9,0.78)_36%,rgba(13,9,9,0.26)_52%,transparent_66%)]
          "
        />

        {/* Mobile Readability Gradient */}
        <div
          aria-hidden="true"
          className="
            sm:hidden pointer-events-none absolute inset-0 z-[1]
            bg-gradient-to-t from-[#F5F0EA] via-[#F5F0EA]/85 to-transparent
            dark:from-[#0D0909] dark:via-[#0D0909]/85 dark:to-transparent
          "
        />
      </div>

      {/* =========================================================
          CONTENT CONTAINER (Editorial Grid / Campus Artwork)
      ========================================================== */}
      <div
        className="
          relative z-10 w-full max-w-[1920px] mx-auto
          px-5 sm:px-8 md:px-12 lg:px-16 xl:px-[70px] 2xl:px-[82px] min-[1920px]:px-[96px]
          py-14 sm:py-16 md:py-20 lg:py-24
          min-h-[clamp(680px,78svh,860px)]
          flex flex-col justify-center
          lg:grid lg:grid-cols-[48%_52%] lg:items-center
        "
      >
        {/* Left Liquid Glass Editorial Card (Phases 18 & 19: Subtle Tilt & Liquid Reflection) */}
        <div
          ref={cardRef}
          onPointerMove={handleCardPointerMove}
          onPointerLeave={handleCardPointerLeave}
          style={{
            backdropFilter: 'blur(18px) saturate(1.12)',
            WebkitBackdropFilter: 'blur(18px) saturate(1.12)',
            transform: isVisible
              ? 'perspective(1100px) rotateX(var(--glass-rx, 0deg)) rotateY(var(--glass-ry, 0deg)) translateY(var(--glass-ty, 0px))'
              : 'translateY(16px) scale(0.985)',
            transitionProperty: 'transform, opacity, box-shadow, border-color',
            transitionDuration: '340ms',
            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            ['--glass-rx' as string]: '0deg',
            ['--glass-ry' as string]: '0deg',
            ['--glass-ty' as string]: '0px',
            ['--glass-x' as string]: '50%',
            ['--glass-y' as string]: '50%',
            ['--glass-hover' as string]: '0',
          } as React.CSSProperties}
          className={`
            relative z-10 w-full max-w-[500px] lg:max-w-[520px]
            p-7 sm:p-9 lg:p-10 rounded-[18px]
            bg-[linear-gradient(145deg,rgba(255,250,247,0.54),rgba(248,237,232,0.34))]
            dark:bg-[linear-gradient(145deg,rgba(32,7,11,0.58),rgba(18,4,7,0.36))]
            border border-white/60 dark:border-[#EF7481]/18
            shadow-[0_24px_60px_rgba(63,25,27,0.12),inset_0_1px_0_rgba(255,255,255,0.78)]
            dark:shadow-[0_24px_62px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.06)]
            lg:justify-self-start
            ${isVisible ? 'opacity-100' : 'opacity-0'}
          `}
        >
          {/* Liquid Glass Highlight Overlay (Phase 19) */}
          <div
            aria-hidden="true"
            className="
              pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden
              transition-opacity duration-260 ease-out
              [background:radial-gradient(380px_circle_at_var(--glass-x,50%)_var(--glass-y,50%),rgba(255,255,255,0.46),rgba(199,78,91,0.045)_45%,transparent_72%)]
              dark:[background:radial-gradient(380px_circle_at_var(--glass-x,50%)_var(--glass-y,50%),rgba(255,236,221,0.12),rgba(232,184,93,0.045)_45%,transparent_72%)]
            "
            style={{
              opacity: 'calc(var(--glass-hover, 0) * 0.75)',
            }}
          />

          {/* Eyebrow (Phase 20: Pulsing Marker & Typewriter) */}
          <div className="relative z-10 flex items-center gap-[10px] mb-5">
            <span
              aria-hidden="true"
              className="
                w-[6px] h-[6px] shrink-0
                bg-[#981725] dark:bg-[#F07B88] rounded-[1px]
                shadow-[0_0_0_4px_rgba(167,25,42,0.08),0_0_16px_rgba(167,25,42,0.22)]
                dark:shadow-[0_0_0_4px_rgba(240,123,136,0.07),0_0_17px_rgba(240,123,136,0.20)]
                hosted-marker-glow
              "
            />
            <span className="font-sans font-bold text-[13.5px] tracking-[0.21em] uppercase text-[#981725] dark:text-[#F07B88] flex items-center">
              <span>{EYEBROW_TEXT.slice(0, eyebrowChars)}</span>
              {!isTypingDone && !prefersReducedMotion && (
                <span
                  aria-hidden="true"
                  className="inline-block w-[2px] h-[13px] ml-1 bg-[#981725] dark:bg-[#F07B88] animate-pulse"
                />
              )}
            </span>
          </div>

          {/* Heading (Phase 21: Local Liquid Text Gradient on Hover) */}
          <h2
            ref={titleRef}
            id="hosted-at-heading"
            onPointerMove={handleTitlePointerMove}
            onPointerLeave={handleTitlePointerLeave}
            style={{
              ['--title-x' as string]: '50%',
              ['--title-y' as string]: '50%',
              ['--title-hover' as string]: '0',
            } as React.CSSProperties}
            className="
              relative z-10
              font-serif font-bold uppercase
              tracking-[-0.035em] leading-[0.96]
              text-[clamp(36px,3.6vw,48px)] lg:text-[clamp(44px,3.5vw,58px)] xl:text-[clamp(52px,3.45vw,68px)]
              hosted-title-gradient cursor-default select-none
            "
          >
            <span className="block">SRM UNIVERSITY-AP</span>
            <span className="block mt-0.5">AMARAVATI</span>
          </h2>

          {/* Description */}
          <p
            className="
              relative z-10
              mt-[30px]
              max-w-[500px]
              font-sans font-normal
              text-[15.5px] sm:text-[16px] xl:text-[17px]
              leading-[1.55]
              text-[#584B49] dark:text-[#D9C9C6]
            "
          >
            A world-class campus, a global stage. Experience innovation, collaboration, and community at the heart of Amaravati.
          </p>

          {/* CTA Button (Phase 22: Liquid Press + Border Glow) */}
          <div className="relative z-10 mt-[28px]">
            <Link
              href="/venues"
              data-cursor="cta"
              aria-label="Explore Venues"
              className="
                group relative inline-flex h-[46px] sm:h-[48px] items-center justify-between overflow-hidden
                rounded-[8px] pl-6 pr-2.5 text-[14px] sm:text-[14.5px] font-semibold tracking-[0.01em] outline-none
                border border-[#8F1723]/25 dark:border-[rgba(239,116,129,0.30)]
                bg-[#8F1723] dark:bg-[#841521] text-[#FFF7F2]
                shadow-[0_4px_14px_rgba(108,21,30,0.14)]
                hover:bg-[linear-gradient(110deg,#8F1723,#A91D2B)]
                hover:-translate-y-[2px]
                hover:shadow-[0_8px_22px_rgba(143,23,35,0.32),0_0_18px_rgba(169,29,43,0.20)]
                active:scale-[0.985]
                focus-visible:ring-2 focus-visible:ring-[#8F1723] focus-visible:ring-offset-2
                transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
              "
            >
              {/* Phase 22: Top Glint Runner */}
              <span
                aria-hidden="true"
                className="
                  pointer-events-none absolute top-0 left-0 right-0 h-[1.5px] overflow-hidden
                "
              >
                <span
                  className="
                    block h-full w-[40%]
                    bg-[linear-gradient(90deg,transparent,rgba(255,235,231,0.85),transparent)]
                    -translate-x-[140%] group-hover:translate-x-[320%]
                    transition-transform duration-600 ease-[cubic-bezier(0.16,1,0.3,1)]
                  "
                />
              </span>

              {/* Button Text */}
              <span className="relative z-10 mr-4 transition-colors duration-260 ease-out text-[#FFF7F2]">
                Explore Venues
              </span>

              {/* Circular Arrow Chamber & Icon */}
              <span
                aria-hidden="true"
                className="
                  relative z-10 flex h-[30px] w-[30px] items-center justify-center rounded-full
                  bg-[#FFF7F2] dark:bg-[#FFF3EF] text-[#8F1723] dark:text-[#841521]
                  transition-transform duration-260 ease-out
                  group-hover:scale-[1.07]
                "
              >
                <ArrowRight
                  size={15}
                  strokeWidth={2.4}
                  className="transition-transform duration-260 ease-out group-hover:translate-x-[3px]"
                />
              </span>
            </Link>
          </div>
        </div>

        {/* Right Column Spacer for desktop (allows background campus visual & SRM monument to breathe) */}
        <div aria-hidden="true" className="hidden lg:block h-full w-full pointer-events-none" />
      </div>

      {/* =========================================================
          BOTTOM SEAM OVERLAY (Phase 13: Hosted At owns transition to Ready)
      ========================================================== */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute -bottom-px left-0 right-0 z-10
          h-[clamp(40px,5vh,60px)] select-none
          bg-[linear-gradient(to_bottom,transparent_0%,rgba(245,240,234,0.15)_35%,rgba(68,11,18,0.35)_75%,rgba(24,5,8,0.85)_100%)]
          dark:bg-[linear-gradient(to_bottom,transparent_0%,rgba(20,4,7,0.35)_45%,rgba(24,5,8,0.92)_100%)]
        "
      />
    </section>
  );
}

