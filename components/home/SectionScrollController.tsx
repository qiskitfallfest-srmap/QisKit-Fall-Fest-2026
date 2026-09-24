'use client';

import * as React from 'react';
import { useSmoothScroll } from '@/components/shared/SmoothScrollProvider';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface DiscoveredSection {
  id: string;
  num: string;
  title: string;
  tag: string;
  element: HTMLElement;
}

function getNavbarHeight(): number {
  if (typeof window === 'undefined') return 90;
  if (window.innerWidth >= 1280) return 90;
  if (window.innerWidth >= 640) return 84;
  return 78;
}

export function SectionScrollController() {
  const { lenis, scrollTo } = useSmoothScroll();
  const [sections, setSections] = React.useState<DiscoveredSection[]>([]);
  const [activeIndex, setActiveIndex] = React.useState<number>(0);

  const activeIndexRef = React.useRef<number>(0);
  const isTransitioningRef = React.useRef<boolean>(false);
  const cooldownRef = React.useRef<number>(0);
  const touchStartYRef = React.useRef<number>(0);

  // Scroll effort accumulation state (2-3 second effort lock)
  const [scrollProgress, setScrollProgress] = React.useState<number>(0);
  const [scrollDirection, setScrollDirection] = React.useState<'down' | 'up' | null>(null);
  const [isUnlockedNotice, setIsUnlockedNotice] = React.useState<boolean>(false);

  const accumulatedDurationRef = React.useRef<number>(0);
  const lastWheelTimestampRef = React.useRef<number>(0);
  const decayTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const decayIntervalRef = React.useRef<NodeJS.Timeout | null>(null);
  const targetDirectionRef = React.useRef<'down' | 'up' | null>(null);

  React.useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  // -------------------------------------------------------------
  // 1. AUTOMATIC SECTION DISCOVERY
  // Automatically queries all [data-snap-section] elements in DOM
  // -------------------------------------------------------------
  const discoverSections = React.useCallback(() => {
    if (typeof document === 'undefined') return;

    const elements = Array.from(
      document.querySelectorAll<HTMLElement>('[data-snap-section="true"], section[id^="home-slide-"], section[id^="about-slide-"]')
    );

    if (elements.length === 0) return;

    const discovered: DiscoveredSection[] = elements.map((el, index) => {
      const id = el.id || el.getAttribute('data-section-id') || `section-${index + 1}`;
      const num =
        el.getAttribute('data-section-num') || String(index + 1).padStart(2, '0');
      const title =
        el.getAttribute('data-section-title') ||
        el.querySelector('h1, h2, h3')?.textContent?.trim().slice(0, 24) ||
        `Section ${num}`;
      const tag = el.getAttribute('data-section-tag') || '';

      return {
        id,
        num,
        title,
        tag,
        element: el,
      };
    });

    setSections(discovered);
  }, []);

  React.useEffect(() => {
    const rafId = requestAnimationFrame(() => {
      discoverSections();
    });

    // Re-discover on resize or content changes
    window.addEventListener('resize', discoverSections);
    const observer = new MutationObserver(discoverSections);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', discoverSections);
      observer.disconnect();
    };
  }, [discoverSections]);

  // -------------------------------------------------------------
  // 2. SCROLL-LOCK TRANSITION NAVIGATION
  // Seamless glide between sections with Lenis easing & transition lock
  // -------------------------------------------------------------
  const navigateToSection = React.useCallback(
    (index: number, immediate = false) => {
      if (sections.length === 0) return;

      const clampedIndex = Math.max(0, Math.min(index, sections.length - 1));
      const target = sections[clampedIndex];
      if (!target?.element) return;

      isTransitioningRef.current = true;
      setActiveIndex(clampedIndex);

      // Reset effort state
      accumulatedDurationRef.current = 0;
      setScrollProgress(0);
      setScrollDirection(null);

      const navHeight = getNavbarHeight();
      const duration = immediate ? 0.4 : 0.92;

      scrollTo(target.element, {
        offset: -navHeight,
        duration,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        lock: true,
      });

      // Release lock after transition duration + short buffer
      const unlockTime = (duration * 1000) + 140;
      setTimeout(() => {
        isTransitioningRef.current = false;
        cooldownRef.current = Date.now() + 200;
      }, unlockTime);
    },
    [sections, scrollTo]
  );

  // -------------------------------------------------------------
  // 3. SYNCHRONIZE ACTIVE SECTION WITH SCROLL POSITION
  // Keeps active dot & counter in sync if user uses scrollbar or links
  // -------------------------------------------------------------
  React.useEffect(() => {
    if (sections.length === 0) return;

    const handleScroll = () => {
      if (isTransitioningRef.current) return;

      const navHeight = getNavbarHeight();
      const viewportMid = window.scrollY + navHeight + (window.innerHeight - navHeight) * 0.35;

      let closestIndex = 0;
      let minDistance = Infinity;

      sections.forEach((sec, idx) => {
        const top = sec.element.offsetTop;
        const dist = Math.abs(top - viewportMid);
        if (dist < minDistance) {
          minDistance = dist;
          closestIndex = idx;
        }
      });

      if (closestIndex !== activeIndexRef.current) {
        setActiveIndex(closestIndex);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  // -------------------------------------------------------------
  // 4. ACTIVE 2-3 SECOND EFFORT SCROLL-LOCK ENGINE
  // Locks at each section until continuous 2-3s scrolling effort unlocks & advances
  // -------------------------------------------------------------
  React.useEffect(() => {
    if (sections.length === 0) return;

    const REQUIRED_EFFORT_MS = 2200; // ~2.2 seconds of continuous active wheel effort

    const handleWheel = (e: WheelEvent) => {
      // Allow native scroll on mobile & tablets (< 1024px)
      if (window.innerWidth < 1024) return;

      // Filter out micro-jitter
      if (Math.abs(e.deltaY) < 12) return;

      // If already smoothly transitioning, lock and absorb wheel events
      if (isTransitioningRef.current || Date.now() < cooldownRef.current) {
        e.preventDefault();
        return;
      }

      const currentIndex = activeIndexRef.current;
      const currentSection = sections[currentIndex];
      if (!currentSection?.element) return;

      const dir = e.deltaY > 0 ? 'down' : 'up';

      // Reached top or bottom boundary checks
      if (dir === 'down' && currentIndex >= sections.length - 1) {
        return; // Reached end of page
      }
      if (dir === 'up' && currentIndex <= 0) {
        return; // Reached start of page
      }

      // PREVENT DEFAULT to lock the section in place!
      e.preventDefault();

      const now = Date.now();
      const timeSinceLastWheel = now - lastWheelTimestampRef.current;

      // Clear any active decay timers
      if (decayTimeoutRef.current) {
        clearTimeout(decayTimeoutRef.current);
        decayTimeoutRef.current = null;
      }
      if (decayIntervalRef.current) {
        clearInterval(decayIntervalRef.current);
        decayIntervalRef.current = null;
      }

      // If user changed direction or paused for > 450ms, reset accumulation
      if (targetDirectionRef.current !== dir || timeSinceLastWheel > 450) {
        accumulatedDurationRef.current = 0;
        targetDirectionRef.current = dir;
        setScrollDirection(dir);
      }

      // Accumulate duration of continuous scrolling effort
      const increment = Math.min(Math.max(timeSinceLastWheel, 20), 110);
      accumulatedDurationRef.current += increment;
      lastWheelTimestampRef.current = now;

      // Calculate progress percentage
      const progress = Math.min(100, Math.round((accumulatedDurationRef.current / REQUIRED_EFFORT_MS) * 100));
      setScrollProgress(progress);

      // Check if threshold reached (~2 seconds of active continuous wheel scrolling)
      if (progress >= 100) {
        setIsUnlockedNotice(true);
        isTransitioningRef.current = true;

        accumulatedDurationRef.current = 0;
        setScrollProgress(0);
        setScrollDirection(null);

        const nextIndex = dir === 'down' ? currentIndex + 1 : currentIndex - 1;
        navigateToSection(nextIndex);

        setTimeout(() => {
          setIsUnlockedNotice(false);
        }, 1200);
        return;
      }

      // Smooth decay if user stops scrolling for 400ms
      decayTimeoutRef.current = setTimeout(() => {
        decayIntervalRef.current = setInterval(() => {
          accumulatedDurationRef.current = Math.max(0, accumulatedDurationRef.current - 140);
          const decayed = Math.min(100, Math.round((accumulatedDurationRef.current / REQUIRED_EFFORT_MS) * 100));
          setScrollProgress(decayed);

          if (decayed <= 0) {
            if (decayIntervalRef.current) clearInterval(decayIntervalRef.current);
            decayIntervalRef.current = null;
            setScrollDirection(null);
          }
        }, 40);
      }, 400);
    };

    // -----------------------------------------------------------
    // KEYBOARD NAVIGATION (Arrow keys, PageUp/Down, Space, Home/End)
    // -----------------------------------------------------------
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      const currentIndex = activeIndexRef.current;
      const currentSection = sections[currentIndex];
      const navHeight = getNavbarHeight();
      const rect = currentSection?.element.getBoundingClientRect();

      if (e.key === 'ArrowDown' || e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) {
        if (rect && rect.bottom > window.innerHeight + 20) {
          return; // Allow page-down inside taller section
        }
        if (currentIndex < sections.length - 1) {
          e.preventDefault();
          navigateToSection(currentIndex + 1);
        }
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) {
        if (rect && rect.top < navHeight - 20) {
          return; // Allow page-up inside taller section
        }
        if (currentIndex > 0) {
          e.preventDefault();
          navigateToSection(currentIndex - 1);
        }
      } else if (e.key === 'Home') {
        e.preventDefault();
        navigateToSection(0, true);
      } else if (e.key === 'End') {
        e.preventDefault();
        navigateToSection(sections.length - 1, true);
      }
    };

    // -----------------------------------------------------------
    // TOUCH SWIPE NAVIGATION (for touchscreens and mobile)
    // -----------------------------------------------------------
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartYRef.current = e.touches[0].clientY;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (window.innerWidth < 1024) return; // Keep native touch on mobile devices
      if (e.changedTouches.length === 1) {
        const deltaY = touchStartYRef.current - e.changedTouches[0].clientY;
        const currentIndex = activeIndexRef.current;

        if (Math.abs(deltaY) > 55 && !isTransitioningRef.current) {
          if (deltaY > 0 && currentIndex < sections.length - 1) {
            navigateToSection(currentIndex + 1);
          } else if (deltaY < 0 && currentIndex > 0) {
            navigateToSection(currentIndex - 1);
          }
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [sections, navigateToSection]);

  if (sections.length === 0) return null;

  const currentActive = sections[activeIndex] || sections[0];

  return (
    <>
      {/* =========================================================
          FLOATING RIGHT SECTION INDICATOR (DESKTOP & LAPTOP)
          With Quantum Glow, Hover Tooltips & Instant Section Glide
      ========================================================== */}
      <nav
        aria-label="Section Navigation"
        className="
          fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-40
          hidden lg:flex flex-col items-center gap-2.5
          p-2 rounded-full
          bg-[#181313]/75 dark:bg-[#120608]/85
          backdrop-blur-md
          border border-white/20 dark:border-white/12
          shadow-[0_8px_32px_rgba(0,0,0,0.35)]
          transition-all duration-300
        "
      >
        {sections.map((slide, index) => {
          const isActive = activeIndex === index;

          return (
            <div key={slide.id} className="group relative flex items-center justify-center">
              {/* Tooltip on hover */}
              <div
                className="
                  pointer-events-none absolute right-full mr-3.5
                  opacity-0 group-hover:opacity-100 group-hover:translate-x-0
                  translate-x-2 transition-all duration-200
                  flex items-center gap-2 px-3 py-1.5 rounded-lg
                  bg-[#1F1819]/90 dark:bg-[#1C0A0D]/90
                  backdrop-blur-md
                  border border-white/15 dark:border-white/10
                  text-white shadow-xl whitespace-nowrap
                "
              >
                <span className="font-mono text-[10px] text-[#E77A86] dark:text-[#F06B78] font-bold">
                  {slide.num}
                </span>
                <span className="h-2.5 w-[1px] bg-white/20" />
                <span className="font-sans font-semibold text-[11px] tracking-wide text-white/95">
                  {slide.title}
                </span>
                {slide.tag && (
                  <span className="hidden xl:inline text-[10px] text-white/50 font-normal">
                    — {slide.tag}
                  </span>
                )}
              </div>

              {/* Indicator Dot / Pill */}
              <button
                type="button"
                onClick={() => navigateToSection(index)}
                aria-label={`Jump to section ${slide.num}: ${slide.title}`}
                aria-current={isActive ? 'true' : 'false'}
                className={`
                  relative flex items-center justify-center overflow-hidden
                  rounded-full transition-all duration-300 outline-none
                  focus-visible:ring-2 focus-visible:ring-[#E77A86]
                  ${
                    isActive
                      ? 'w-3.5 h-8 bg-[#450A10] border border-white/40 shadow-[0_0_14px_rgba(231,122,134,0.55)] scale-105'
                      : 'w-2 h-2 bg-white/40 dark:bg-white/30 hover:bg-white/90 hover:scale-125'
                  }
                `}
              >
                {isActive && (
                  <span
                    className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#C41C2C] to-[#E77A86] transition-all duration-100 ease-out"
                    style={{ height: `${Math.max(25, scrollProgress)}%` }}
                  />
                )}
                <span className="sr-only">
                  {slide.num} {slide.title}
                </span>
              </button>
            </div>
          );
        })}
      </nav>

      {/* =========================================================
          SLIDE COUNTER & QUICK NAVIGATION CONTROLLER (BOTTOM-RIGHT)
      ========================================================== */}
      <div
        aria-live="polite"
        className="
          fixed bottom-6 right-6 z-40
          hidden lg:flex items-center gap-3 px-3.5 py-2 rounded-full
          bg-[#1A0A0C]/85 dark:bg-[#120506]/90 text-[#F5EFEA]
          border border-[#E77A86]/40
          backdrop-blur-md shadow-2xl
          text-[11px] font-mono tracking-wider
          transition-all duration-300
        "
      >
        <span className="font-bold text-[#E77A86] dark:text-[#F06B78]">
          {currentActive.num}
        </span>
        <span className="text-white/40">/</span>
        <span className="text-white/60">
          {String(sections.length).padStart(2, '0')}
        </span>
        <span className="h-2.5 w-[1px] bg-white/20" />
        <span className="font-sans font-medium text-white/90 truncate max-w-[140px]">
          {currentActive.title}
        </span>

        {/* Quick previous/next section buttons */}
        <div className="flex items-center gap-1 ml-1 border-l border-white/15 pl-2">
          <button
            type="button"
            disabled={activeIndex <= 0}
            onClick={() => navigateToSection(activeIndex - 1)}
            aria-label="Previous section"
            className="
              p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10
              disabled:opacity-25 disabled:cursor-not-allowed transition-all
            "
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={activeIndex >= sections.length - 1}
            onClick={() => navigateToSection(activeIndex + 1)}
            aria-label="Next section"
            className="
              p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10
              disabled:opacity-25 disabled:cursor-not-allowed transition-all
            "
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* =========================================================
          ACTIVE SCROLL RESISTANCE HUD FEEDBACK (BOTTOM-CENTER)
          Shows real-time effort percentage while breaking the lock
      ========================================================== */}
      {scrollProgress > 0 && (
        <div
          role="status"
          aria-live="assertive"
          className="
            fixed bottom-8 left-1/2 -translate-x-1/2 z-50
            flex items-center gap-3 px-5 py-2.5 rounded-full
            bg-[#1A0A0C]/92 text-[#F5EFEA]
            border border-[#E77A86]/60
            backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.55)]
            text-[12px] font-sans font-semibold tracking-wide
            animate-in fade-in zoom-in-95 duration-200
          "
        >
          {/* Animated Spinner / Pulse */}
          <div className="relative w-4 h-4 flex items-center justify-center">
            <span className="absolute inset-0 rounded-full border-2 border-white/20" />
            <span
              className="absolute inset-0 rounded-full border-2 border-[#E77A86] border-t-transparent animate-spin"
            />
          </div>

          <span className="text-white/90">
            {scrollDirection === 'down' ? 'Keep scrolling to advance' : 'Keep scrolling to go back'}
          </span>

          <span className="font-mono text-[#E77A86] font-bold">
            {scrollProgress}%
          </span>

          {/* Mini progress bar */}
          <div className="w-16 h-1.5 rounded-full bg-white/20 overflow-hidden ml-1">
            <div
              className="h-full bg-gradient-to-r from-[#E77A86] to-[#C41C2C] rounded-full transition-all duration-75"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Unlock Notice */}
      {isUnlockedNotice && (
        <div
          role="status"
          className="
            fixed bottom-8 left-1/2 -translate-x-1/2 z-50
            flex items-center gap-2 px-5 py-2.5 rounded-full
            bg-[#C41C2C] text-white
            shadow-[0_0_30px_rgba(196,28,44,0.7)]
            text-[12px] font-mono font-bold tracking-widest uppercase
            animate-in fade-in scale-105 duration-150
          "
        >
          <span>UNLOCKED · GLIDING</span>
        </div>
      )}
    </>
  );
}
