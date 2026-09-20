'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';

export interface LoadScreenProps {
  /** Callback fired when the intro/loading sequence completes or is skipped */
  onComplete?: () => void;
  /** Primary category / tag text above the title (default: "GLOBAL. OPEN. TOGETHER.") */
  tagText?: string;
  /** First part of main title (default: "QISKIT") */
  titlePart1?: string;
  /** Second part of main title (default: "FALL FEST 2026") */
  titlePart2?: string;
  /** Subtitle / host text (default: "SRM UNIVERSITY-AP × IBM QUANTUM") */
  subtitle?: string;
  /** Sub-headline or theme tagline (default: "A Decade of Quantum on Cloud") */
  tagline?: string;
  /** Tech status readout label (default: "INITIALIZING DILUTION CRYOSTAT [15 mK]") */
  readoutText?: string;
  /** Text shown above the progress bar (default: "LOADING SYSTEM") */
  loadingLabel?: string;
  /** Main solid background color (default: "#650015") */
  backgroundColor?: string;
  /** Primary text color (default: "#FFFFFF") */
  textColor?: string;
  /** Accent / border color (default: "#8A1B27") */
  accentColor?: string;
  /** Whether to display the skip button (default: true) */
  showSkipButton?: boolean;
  /** Text for the skip button (default: "Skip to Content") */
  skipButtonText?: string;
  /** Whether to lock page scrolling while the loading screen is active (default: true) */
  lockScroll?: boolean;
  /** Optional custom CSS class on the root container */
  className?: string;
}

export type LoadingScreenProps = LoadScreenProps;

/**
 * Critical hero assets physically verified in /public
 */
const CRITICAL_ASSETS = [
  '/hero/HOME-01-HERO-BACKGROUND-LIGHT.png',
  '/hero/HOME-01-HERO-BACKGROUND-DAR.png',
  '/hero/HOME-01-HERO-CRYOSTAT-ORBITAL-LIGHT-02.png',
  '/hero/HOME-01-HERO-GLOBE-LEFT-LIGHT.png',
  '/hero/HOME-01-HERO-GLOBE-LEFT-DARK.png',
  '/hero/HOME-01-HERO-GLOBE-RIGHT-LIGHT.png',
  '/hero/HOME-01-HERO-GLOBE-RIGHT-DARK.png',
  '/hero/HOME-01-HERO-DECADE-10-LIGHT.png',
  '/hero/HOME-01-HERO-DECADE-10-DARK.png',
];

const HARD_TIMEOUT_MS = 3600;
const FINAL_HOLD_MS = 250;
const EXIT_FADE_DURATION_S = 0.5;

/**
 * LoadScreen - Cinematic intro loading screen with real critical asset preloading,
 * GSAP optical beam/flash transitions, typography reveals, and safe route & scroll preservation.
 */
export const LoadScreen: React.FC<LoadScreenProps> = ({
  onComplete,
  tagText = 'GLOBAL. OPEN. TOGETHER.',
  titlePart1 = 'QISKIT',
  titlePart2 = 'FALL FEST 2026',
  subtitle = 'SRM UNIVERSITY-AP × IBM QUANTUM',
  tagline = 'A Decade of Quantum on Cloud',
  readoutText = 'INITIALIZING DILUTION CRYOSTAT [15 mK]',
  loadingLabel = 'LOADING SYSTEM',
  backgroundColor = '#650015',
  textColor = '#FFFFFF',
  accentColor = '#8A1B27',
  showSkipButton = true,
  skipButtonText = 'Skip to Content',
  lockScroll = true,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const solidBgRef = useRef<HTMLDivElement>(null);
  const lightBeamRef = useRef<HTMLDivElement>(null);
  const lightFlashRef = useRef<HTMLDivElement>(null);
  const topBarRef = useRef<HTMLDivElement>(null);

  // Masked typography refs
  const typographyRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);
  const titlePart1Ref = useRef<HTMLSpanElement>(null);
  const titlePart2Ref = useRef<HTMLSpanElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLDivElement>(null);

  // Loading progress bar refs
  const loadingContainerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const percentTextRef = useRef<HTMLSpanElement>(null);

  // State
  const [canSkip, setCanSkip] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const isFinishingRef = useRef(false);
  const tlIntroRef = useRef<gsap.core.Timeline | null>(null);
  const progressTweenRef = useRef<gsap.core.Tween | null>(null);
  const progressAnimRef = useRef<{ pct: number }>({ pct: 0 });

  // Stable callback ref
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // ---------------------------------------------------------------------------
  // 1. SCROLL LOCKING & SAFE RESTORATION
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!lockScroll || isDone) return;

    const originalBodyOverflow = document.body.style.overflow;
    const originalDocOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    const preventScroll = (e: Event) => {
      e.preventDefault();
    };

    window.addEventListener('wheel', preventScroll, { passive: false });
    window.addEventListener('touchmove', preventScroll, { passive: false });

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalDocOverflow;
      window.removeEventListener('wheel', preventScroll);
      window.removeEventListener('touchmove', preventScroll);
    };
  }, [lockScroll, isDone]);

  // ---------------------------------------------------------------------------
  // 2. EXIT HANDLER: NO FORCED REDIRECT, RESTORE SCROLL & FADE OUT
  // ---------------------------------------------------------------------------
  const finishLoading = useCallback(() => {
    if (isFinishingRef.current) return;
    isFinishingRef.current = true;
    setIsExiting(true);

    // Ensure visual progress displays 100% on finish
    if (percentTextRef.current) {
      percentTextRef.current.textContent = '100%';
    }
    if (progressBarRef.current) {
      progressBarRef.current.style.width = '100%';
    }

    if (containerRef.current) {
      gsap.to(containerRef.current, {
        opacity: 0,
        duration: EXIT_FADE_DURATION_S,
        ease: 'power2.inOut',
        onComplete: () => {
          if (containerRef.current) {
            containerRef.current.style.display = 'none';
          }
          setIsDone(true);
          onCompleteRef.current?.();
        },
      });
    } else {
      setIsDone(true);
      onCompleteRef.current?.();
    }
  }, []);

  // ---------------------------------------------------------------------------
  // 3. FAST-FORWARD SKIP HANDLER
  // ---------------------------------------------------------------------------
  const handleSkip = useCallback(() => {
    if (isFinishingRef.current) return;
    tlIntroRef.current?.kill();
    progressTweenRef.current?.kill();
    finishLoading();
  }, [finishLoading]);

  // ---------------------------------------------------------------------------
  // 4. GSAP CINEMATIC TIMELINE & REAL CRITICAL ASSET PRELOADING
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (isDone) return;

    let isCleanedUp = false;
    const startTime = performance.now();

    // Enable skip button after brief initial flash
    const skipTimer = setTimeout(() => {
      if (!isCleanedUp) setCanSkip(true);
    }, 600);

    // Setup GSAP Context
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: false });
      tlIntroRef.current = tl;

      // Chrome / top bar fades in
      if (topBarRef.current) {
        tl.to(topBarRef.current, { opacity: 1, duration: 0.5, ease: 'power1.out' }, 0.2);
      }

      // Step A: Horizontal white light beam expands across center (0.3s -> 0.8s)
      if (lightBeamRef.current) {
        tl.fromTo(
          lightBeamRef.current,
          { width: '0px', opacity: 0 },
          {
            width: '100vw',
            opacity: 1,
            duration: 0.5,
            ease: 'power2.inOut',
          },
          0.3
        );
      }

      // Step B: Pure white light bursts vertically to illuminate screen (0.8s -> 1.1s)
      if (lightFlashRef.current) {
        tl.fromTo(
          lightFlashRef.current,
          { scaleY: 0, opacity: 0 },
          {
            scaleY: 1,
            opacity: 0.85,
            duration: 0.3,
            ease: 'power3.out',
          },
          0.8
        );

        // Step C: Light dissolves away leaving pure solid background (1.1s -> 1.5s)
        tl.to(
          lightFlashRef.current,
          {
            opacity: 0,
            duration: 0.4,
            ease: 'power2.out',
          },
          1.1
        );
      }

      if (lightBeamRef.current) {
        tl.to(
          lightBeamRef.current,
          {
            opacity: 0,
            duration: 0.35,
            ease: 'power2.out',
          },
          1.15
        );
      }

      // Typography container reveals
      if (typographyRef.current) {
        tl.to(typographyRef.current, { opacity: 1, duration: 0.3 }, 1.15);
      }

      // Text 1: Tag indicator
      if (tagRef.current) {
        tl.fromTo(
          tagRef.current,
          { y: 28, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' },
          1.2
        );
      }

      // Text 2: Title Part 1
      if (titlePart1Ref.current) {
        tl.fromTo(
          titlePart1Ref.current,
          { y: 55, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' },
          1.35
        );
      }

      // Text 3: Title Part 2
      if (titlePart2Ref.current) {
        tl.fromTo(
          titlePart2Ref.current,
          { y: 55, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' },
          1.45
        );
      }

      // Text 4: Subtitle
      if (subtitleRef.current) {
        tl.fromTo(
          subtitleRef.current,
          { y: 35, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.65, ease: 'power3.out' },
          1.6
        );
      }

      // Text 5: Tagline
      if (taglineRef.current) {
        tl.fromTo(
          taglineRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' },
          1.75
        );
      }

      // Text 6: Readout text
      if (readoutRef.current) {
        tl.fromTo(
          readoutRef.current,
          { y: 25, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out' },
          1.9
        );
      }

      // Loading Progress Container reveals smoothly as the light flash bursts
      if (loadingContainerRef.current) {
        tl.fromTo(
          loadingContainerRef.current,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
          0.85
        );
      }
    }, containerRef);

    // 1. Critical Asset Preloading in Parallel (independent from visible percentage)
    const preloadPromises = CRITICAL_ASSETS.map((src) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        const done = () => {
          resolve();
        };
        img.onload = done;
        img.onerror = done; // Fail-safe: error counts as complete so loader never freezes
        img.src = src;
      });
    });
    const assetsReadyPromise = Promise.all(preloadPromises);

    // 2. Smooth Continuous Visual Progress Animation (0% to 100%)
    const visualProgressPromise = new Promise<void>((resolve) => {
      progressAnimRef.current.pct = 0;
      if (percentTextRef.current) {
        percentTextRef.current.textContent = '0%';
      }
      if (progressBarRef.current) {
        progressBarRef.current.style.width = '0%';
      }

      progressTweenRef.current = gsap.to(progressAnimRef.current, {
        pct: 100,
        duration: 2.4,
        delay: 0.85, // Starts synchronously with the appearance of the progress container
        ease: 'power1.inOut',
        onUpdate: () => {
          if (isCleanedUp) return;
          const current = Math.min(100, Math.max(0, Math.round(progressAnimRef.current.pct)));
          if (percentTextRef.current) {
            percentTextRef.current.textContent = `${current}%`;
          }
          if (progressBarRef.current) {
            progressBarRef.current.style.width = `${current}%`;
          }
        },
        onComplete: () => {
          if (isCleanedUp) return;
          progressAnimRef.current.pct = 100;
          if (percentTextRef.current) {
            percentTextRef.current.textContent = '100%';
          }
          if (progressBarRef.current) {
            progressBarRef.current.style.width = '100%';
          }
          resolve();
        },
      });
    });

    // 3. Dual synchronization: wait for BOTH visual progress reaching 100% AND real assets
    const normalCompletion = Promise.all([
      assetsReadyPromise,
      visualProgressPromise,
    ]);

    const hardTimeoutPromise = new Promise<void>((resolve) => {
      setTimeout(resolve, HARD_TIMEOUT_MS);
    });

    Promise.race([normalCompletion, hardTimeoutPromise]).then(() => {
      if (isCleanedUp || isFinishingRef.current) return;

      // Always guarantee 100% display
      progressAnimRef.current.pct = 100;
      if (percentTextRef.current) {
        percentTextRef.current.textContent = '100%';
      }
      if (progressBarRef.current) {
        progressBarRef.current.style.width = '100%';
      }

      // Short intentional hold at 100%
      setTimeout(() => {
        if (isCleanedUp || isFinishingRef.current) return;

        // Fade out progress container slightly before overall exit
        if (loadingContainerRef.current) {
          gsap.to(loadingContainerRef.current, {
            opacity: 0,
            y: 8,
            duration: 0.25,
            ease: 'power2.inOut',
          });
        }

        setTimeout(() => {
          if (!isCleanedUp) {
            finishLoading();
          }
        }, FINAL_HOLD_MS);
      }, 150);
    });

    return () => {
      isCleanedUp = true;
      clearTimeout(skipTimer);
      progressTweenRef.current?.kill();
      ctx.revert();
    };
  }, [finishLoading, isDone]);

  // If loading has completed, remove from DOM
  if (isDone) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      id="app-loading-screen"
      className={`fixed inset-0 z-[99999] pointer-events-auto select-none overflow-hidden ${className}`}
      style={{ backgroundColor }}
      aria-live="polite"
      aria-busy={!isDone}
    >
      {/* Background layer */}
      <div
        ref={solidBgRef}
        className="absolute inset-0 pointer-events-none transition-opacity duration-700"
        style={{ backgroundColor }}
      />

      {/* Light Slit Beam */}
      <div
        ref={lightBeamRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[2px] bg-white pointer-events-none z-10"
        style={{ width: '0px', opacity: 0 }}
      />

      {/* Light Flash Burst */}
      <div
        ref={lightFlashRef}
        className="absolute inset-0 bg-white pointer-events-none z-10 origin-center"
        style={{ transform: 'scaleY(0)', opacity: 0 }}
      />

      {/* Top Bar with Skip Button */}
      <div
        ref={topBarRef}
        className="absolute top-0 left-0 right-0 px-6 sm:px-12 py-5 flex items-center justify-end opacity-0 z-40"
      >
        {showSkipButton && canSkip && !isExiting && (
          <button
            type="button"
            onClick={handleSkip}
            className="group relative inline-flex min-w-32 cursor-pointer items-center justify-center overflow-hidden rounded-full border px-5 py-2 text-xs font-semibold tracking-wider backdrop-blur-sm transition-[border-color,background-color] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            style={{
              borderColor: `${accentColor}80`,
              backgroundColor: 'rgba(24, 25, 29, 0.65)',
              color: textColor,
            }}
          >
            <span className="inline-block transition-transform duration-300 group-hover:-translate-x-1">
              {skipButtonText}
            </span>
            <svg
              className="w-3.5 h-3.5 ml-1.5 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Center Typography */}
      <div
        ref={typographyRef}
        className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 sm:px-6 pointer-events-none opacity-0 z-20"
        style={{ color: textColor }}
      >
        {/* Text 1: Tag indicator */}
        {tagText && (
          <div className="overflow-hidden mb-3 sm:mb-4">
            <div
              ref={tagRef}
              className="font-mono text-[10px] sm:text-[11px] tracking-[0.35em] sm:tracking-[0.4em] uppercase text-slate-200"
            >
              {tagText}
            </div>
          </div>
        )}

        {/* Text 2: Main Title */}
        <div className="overflow-hidden mb-3 sm:mb-4 py-1 max-w-full">
          <h1 className="font-serif text-[clamp(1.75rem,5.8vw,5.5rem)] tracking-tight font-black uppercase leading-[1.02] text-white">
            {titlePart1 && (
              <span ref={titlePart1Ref} className="inline-block mr-2 sm:mr-4">
                {titlePart1}
              </span>
            )}
            {titlePart2 && (
              <span ref={titlePart2Ref} className="inline-block">
                {titlePart2}
              </span>
            )}
          </h1>
        </div>

        {/* Text 3: Subtitle */}
        {subtitle && (
          <div className="overflow-hidden mb-3">
            <div ref={subtitleRef}>
              <p className="font-mono text-[11px] sm:text-xs md:text-sm tracking-[0.2em] sm:tracking-[0.25em] text-slate-300 uppercase">
                {subtitle}
              </p>
            </div>
          </div>
        )}

        {/* Text 4: Tagline */}
        {tagline && (
          <div className="overflow-hidden mb-4">
            <div ref={taglineRef}>
              <p className="font-serif italic text-xs sm:text-sm md:text-base text-slate-300 tracking-wide">
                {tagline}
              </p>
            </div>
          </div>
        )}

        {/* Text 5: Status Readout */}
        {readoutText && (
          <div className="overflow-hidden mb-5 sm:mb-6">
            <div
              ref={readoutRef}
              className="font-mono flex items-center justify-center gap-2 sm:gap-2.5 text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.25em] text-slate-200"
            >
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>{readoutText}</span>
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar Container */}
      <div
        ref={loadingContainerRef}
        className="absolute bottom-12 sm:bottom-16 md:bottom-20 left-1/2 -translate-x-1/2 w-[85vw] max-w-xs sm:max-w-sm flex flex-col items-center opacity-0 z-20"
      >
        <div className="font-mono w-full flex items-center justify-between mb-2 text-[10px] sm:text-xs tracking-widest text-slate-300 uppercase">
          <span>{loadingLabel}</span>
          <span ref={percentTextRef} className="text-white font-semibold tabular-nums">
            0%
          </span>
        </div>

        <div
          className="w-full h-[3px] rounded-full overflow-hidden border border-white/20 p-[0.5px]"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
        >
          <div
            ref={progressBarRef}
            className="h-full rounded-full transition-[width] duration-75"
            style={{
              width: '0%',
              background: 'linear-gradient(90deg, #77151F 0%, #D25A68 48%, #C9A261 78%, #E1BD78 100%)',
              boxShadow: '0 0 8px rgba(201, 162, 97, 0.55), 0 0 14px rgba(201, 162, 97, 0.18)',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export const LoadingScreen = LoadScreen;
export default LoadScreen;
