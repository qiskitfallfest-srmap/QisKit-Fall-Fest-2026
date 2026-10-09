'use client';

import * as React from 'react';

export interface ScrollLockedSectionRenderProps {
  currentIndex: number;
  progress: number;
  onSelectIndex: (index: number) => void;
  onBack: () => void;
  onNext: () => void;
}

export interface ScrollLockedSectionProps {
  id: string;
  ariaLabel: string;
  itemCount: number;
  controlledIndex?: number;
  onIndexChange?: (index: number) => void;
  activeCategory?: string;
  scrollPerItemVh?: number;
  prevSectionId?: string;
  nextSectionId?: string;
  className?: string;
  children:
    | React.ReactNode
    | ((props: ScrollLockedSectionRenderProps) => React.ReactNode);
}

/**
 * ScrollLockedSection
 *
 * Locks the viewport on the Experience Stage while exploring events:
 * 1. Normal page scroll brings the section to the top beneath the navbar.
 * 2. Viewpoint stays fixed while scrolling through events (Event 1 -> Event 2 -> ... -> Last Event).
 * 3. Releases naturally into normal page scroll once reaching the boundary:
 *    - At Last Event, scrolling DOWN continues naturally to Next Divider & Footer.
 *    - At Event 1, scrolling UP continues naturally to Hero & Ecosystem.
 * 4. Category switching (Learn <-> Build <-> Connect) is a 100% in-place view switch
 *    with zero window scrolling, preserving each category's last selected event.
 */
export function ScrollLockedSection({
  id,
  ariaLabel,
  itemCount,
  controlledIndex,
  onIndexChange,
  activeCategory,
  scrollPerItemVh = 42,
  prevSectionId,
  nextSectionId,
  className = '',
  children,
}: ScrollLockedSectionProps) {
  const containerId = `${id}-container`;
  const sectionRef = React.useRef<HTMLElement>(null);
  const [internalIndex, setInternalIndex] = React.useState(0);

  const currentIndex = controlledIndex !== undefined ? controlledIndex : internalIndex;
  const progress = itemCount > 1 ? currentIndex / (itemCount - 1) : 0;

  // Responsive navbar height offset: mobile 78px, sm/md/lg 84px, xl 90px
  const getNavbarOffset = React.useCallback(() => {
    if (typeof window === 'undefined') return 84;
    if (window.innerWidth >= 1280) return 90;
    if (window.innerWidth >= 640) return 84;
    return 78;
  }, []);

  // Synchronize internal index if itemCount changes and index is out of bounds
  React.useEffect(() => {
    if (currentIndex >= itemCount && itemCount > 0) {
      const clamped = itemCount - 1;
      if (controlledIndex === undefined) {
        setInternalIndex(clamped);
      }
      onIndexChange?.(clamped);
    }
  }, [currentIndex, itemCount, controlledIndex, onIndexChange]);

  // Keep latest state in refs for stable wheel handling without recreating event listener
  const currentIndexRef = React.useRef(currentIndex);
  const itemCountRef = React.useRef(itemCount);
  const onIndexChangeRef = React.useRef(onIndexChange);
  const controlledIndexRef = React.useRef(controlledIndex);

  React.useEffect(() => {
    currentIndexRef.current = currentIndex;
    itemCountRef.current = itemCount;
    onIndexChangeRef.current = onIndexChange;
    controlledIndexRef.current = controlledIndex;
  });

  const cooldownUntilRef = React.useRef(0);
  const wheelAccumulatorYRef = React.useRef(0);
  const wheelAccumulatorXRef = React.useRef(0);
  const idleTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // In-stage wheel / trackpad gesture listener:
  // Viewpoint is fixed while exploring events. Releases cleanly to normal page scroll at boundaries.
  React.useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const handleWheel = (e: WheelEvent) => {
      // Allow browser zoom (pinch to zoom)
      if (e.ctrlKey || e.metaKey) return;

      const currentIdx = currentIndexRef.current;
      const count = itemCountRef.current;
      if (count <= 1) return;

      const rect = section.getBoundingClientRect();
      const topOffset = getNavbarOffset();
      const now = Date.now();
      const inCooldown = now < cooldownUntilRef.current;

      // Zone 1: Section is below the navbar line (Hero / Ecosystem area)
      // Allow normal page scroll so the user naturally scrolls into the section.
      if (rect.top > topOffset + 8) {
        return;
      }

      // Zone 2: Section has scrolled past the viewport (Divider / Footer area)
      // Allow normal page scroll while viewing content below the Experience stage.
      if (rect.bottom < topOffset + 120) {
        return;
      }

      // If scrolling UP from below (e.g. from Divider section), allow normal page scroll
      // until the section top comes back down to dock cleanly at the navbar line.
      if (e.deltaY < 0 && rect.top < topOffset - 15) {
        return;
      }

      // BOUNDARY CHECK 1: At LAST event and scrolling DOWN -> release to normal page scroll!
      if (e.deltaY > 0 && currentIdx >= count - 1) {
        if (inCooldown) {
          // Absorb residual trackpad inertia from arriving at the last card
          e.preventDefault();
          (e as any).lenisStopPropagation = true;
          return;
        }
        // New intentional scroll down at last event: release naturally to divider and footer!
        wheelAccumulatorYRef.current = 0;
        wheelAccumulatorXRef.current = 0;
        return;
      }

      // BOUNDARY CHECK 2: At FIRST event and scrolling UP -> release to normal page scroll!
      if (e.deltaY < 0 && currentIdx <= 0) {
        if (inCooldown) {
          // Absorb residual trackpad inertia from arriving at the first card
          e.preventDefault();
          (e as any).lenisStopPropagation = true;
          return;
        }
        // New intentional scroll up at first event: release naturally to ecosystem and hero!
        wheelAccumulatorYRef.current = 0;
        wheelAccumulatorXRef.current = 0;
        return;
      }

      // WHILE EXPLORING EVENTS: HOLD VIEWPOINT FIXED
      // Consume wheel event so neither native document nor Lenis scrolls the page away
      e.preventDefault();
      e.stopPropagation();
      (e as any).lenisStopPropagation = true;

      // If slightly offset from dock line (e.g. within 35px), snap dock position instantly
      const dockY = Math.round(rect.top + window.scrollY - topOffset);
      const diff = Math.abs(window.scrollY - dockY);
      if (diff > 1 && diff <= 35) {
        window.scrollTo({ top: dockY, behavior: 'instant' });
      }

      // If in cooldown from a recent card transition, absorb momentum and ignore
      if (inCooldown) {
        return;
      }

      // Reset idle timer for wheel accumulator
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      idleTimerRef.current = setTimeout(() => {
        wheelAccumulatorYRef.current = 0;
        wheelAccumulatorXRef.current = 0;
      }, 180);

      const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.2;
      const THRESHOLD = 35;

      if (isHorizontal) {
        wheelAccumulatorXRef.current += e.deltaX;
        if (wheelAccumulatorXRef.current >= THRESHOLD && currentIdx < count - 1) {
          wheelAccumulatorXRef.current = 0;
          cooldownUntilRef.current = Date.now() + 380;
          const nextIdx = currentIdx + 1;
          if (controlledIndexRef.current === undefined) setInternalIndex(nextIdx);
          onIndexChangeRef.current?.(nextIdx);
        } else if (wheelAccumulatorXRef.current <= -THRESHOLD && currentIdx > 0) {
          wheelAccumulatorXRef.current = 0;
          cooldownUntilRef.current = Date.now() + 380;
          const prevIdx = currentIdx - 1;
          if (controlledIndexRef.current === undefined) setInternalIndex(prevIdx);
          onIndexChangeRef.current?.(prevIdx);
        }
      } else {
        wheelAccumulatorYRef.current += e.deltaY;
        if (wheelAccumulatorYRef.current >= THRESHOLD && currentIdx < count - 1) {
          wheelAccumulatorYRef.current = 0;
          cooldownUntilRef.current = Date.now() + 380;
          const nextIdx = currentIdx + 1;
          if (controlledIndexRef.current === undefined) setInternalIndex(nextIdx);
          onIndexChangeRef.current?.(nextIdx);
        } else if (wheelAccumulatorYRef.current <= -THRESHOLD && currentIdx > 0) {
          wheelAccumulatorYRef.current = 0;
          cooldownUntilRef.current = Date.now() + 380;
          const prevIdx = currentIdx - 1;
          if (controlledIndexRef.current === undefined) setInternalIndex(prevIdx);
          onIndexChangeRef.current?.(prevIdx);
        }
      }
    };

    section.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      section.removeEventListener('wheel', handleWheel);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [getNavbarOffset]);

  // Navigate directly to a specific card without scrolling the document
  const handleSelectIndex = React.useCallback(
    (targetIdx: number) => {
      if (targetIdx < 0 || targetIdx >= itemCount) {
        return;
      }
      if (controlledIndex === undefined) {
        setInternalIndex(targetIdx);
      }
      onIndexChange?.(targetIdx);
    },
    [controlledIndex, itemCount, onIndexChange]
  );

  const handleBack = React.useCallback(() => {
    if (currentIndex > 0) {
      handleSelectIndex(currentIndex - 1);
    } else if (prevSectionId) {
      const prevEl = document.getElementById(prevSectionId);
      if (prevEl) {
        prevEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [currentIndex, handleSelectIndex, prevSectionId]);

  const handleNext = React.useCallback(() => {
    if (currentIndex < itemCount - 1) {
      handleSelectIndex(currentIndex + 1);
    } else if (nextSectionId) {
      const nextEl = document.getElementById(nextSectionId);
      if (nextEl) {
        nextEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [currentIndex, handleSelectIndex, itemCount, nextSectionId]);

  return (
    <div
      id={containerId}
      className={`relative z-20 w-full ${className}`}
    >
      {/* Pinned viewport stage flush beneath navbar */}
      <section
        id={id}
        ref={sectionRef}
        aria-label={ariaLabel}
        className="sticky top-[78px] sm:top-[84px] xl:top-[90px] w-full h-[calc(100vh-78px)] sm:h-[calc(100vh-84px)] xl:h-[calc(100vh-90px)] min-h-[640px] max-h-[960px] overflow-hidden bg-[#16171B] border-t border-white/15 border-b border-white/10 shadow-[0_-16px_36px_rgba(0,0,0,0.35)]"
      >
        {typeof children === 'function'
          ? children({
              currentIndex,
              progress,
              onSelectIndex: handleSelectIndex,
              onBack: handleBack,
              onNext: handleNext,
            })
          : children}
      </section>
    </div>
  );
}

export default ScrollLockedSection;
