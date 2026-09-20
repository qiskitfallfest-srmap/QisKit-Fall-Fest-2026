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
 * Reusable architectural component responsible exclusively for:
 * 1. Pinned sticky viewport stage management beneath the responsive navbar.
 * 2. Dynamic container height calculation based on item count.
 * 3. Passive scroll observation and index progression computation.
 * 4. Programmatic scroll synchronization for index selection, back, and next events.
 */
export function ScrollLockedSection({
  id,
  ariaLabel,
  itemCount,
  prevSectionId,
  nextSectionId,
  className = '',
  children,
}: ScrollLockedSectionProps) {
  const containerId = `${id}-container`;
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [progress, setProgress] = React.useState(0);

  // Measure top offset dynamically based on responsive Navbar height:
  // mobile (<640px) = 78px, sm/md/lg (640-1279px) = 84px, xl (>=1280px) = 90px
  const getNavbarOffset = React.useCallback(() => {
    if (typeof window === 'undefined') return 84;
    if (window.innerWidth >= 1280) return 90;
    if (window.innerWidth >= 640) return 84;
    return 78;
  }, []);

  // Update card index smoothly as user scrolls through the pinned container
  React.useEffect(() => {
    let rafId: number;

    const handleScroll = () => {
      const container = document.getElementById(containerId);
      if (!container || container.getAttribute('data-nav-locking') === 'true') {
        return;
      }

      const rect = container.getBoundingClientRect();
      const topOffset = getNavbarOffset();
      const stickyHeight = window.innerHeight - topOffset;
      const containerHeight = rect.height;
      const maxScroll = containerHeight - stickyHeight;

      if (maxScroll <= 0) return;

      // Distance the container top has traveled past the navbar pinning line
      const scrolled = topOffset - rect.top;

      if (scrolled <= 0) {
        setCurrentIndex(0);
        setProgress(0);
        return;
      }

      if (scrolled >= maxScroll) {
        setCurrentIndex(itemCount - 1);
        setProgress(1);
        return;
      }

      const currentProgress = scrolled / maxScroll; // strictly 0 to 1
      setProgress(currentProgress);

      const targetIndex = Math.min(
        itemCount - 1,
        Math.floor(currentProgress * itemCount)
      );

      setCurrentIndex(targetIndex);
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(rafId);
    };
  }, [containerId, itemCount, getNavbarOffset]);

  // Navigate directly to a specific card and synchronize scroll position
  const handleSelectIndex = React.useCallback(
    (targetIdx: number) => {
      if (typeof window === 'undefined' || targetIdx < 0 || targetIdx >= itemCount) {
        return;
      }
      const container = document.getElementById(containerId);
      if (!container) return;

      container.setAttribute('data-nav-locking', 'true');
      setCurrentIndex(targetIdx);

      const topOffset = getNavbarOffset();
      const rect = container.getBoundingClientRect();
      const containerTopInDoc = window.scrollY + rect.top;
      const stickyHeight = window.innerHeight - topOffset;
      const maxScroll = container.offsetHeight - stickyHeight;

      if (maxScroll > 0) {
        const targetProgress = (targetIdx + 0.5) / itemCount;
        const targetScrollY =
          containerTopInDoc - topOffset + targetProgress * maxScroll;

        window.scrollTo({
          top: targetScrollY,
          behavior: 'smooth',
        });
      }

      window.setTimeout(() => {
        const c = document.getElementById(containerId);
        if (c) c.removeAttribute('data-nav-locking');
      }, 650);
    },
    [containerId, getNavbarOffset, itemCount]
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

  // Height formula: 100vh base view + 75vh scroll distance per additional card
  const scrollContainerHeight = `${100 + (itemCount - 1) * 75}vh`;

  return (
    <div
      id={containerId}
      className={`relative z-20 w-full ${className}`}
      style={{ height: scrollContainerHeight }}
    >
      {/* Viewport-locked sticky stage: flush edge-to-edge layout with zero corner color gaps */}
      <section
        id={id}
        aria-label={ariaLabel}
        className="sticky top-[78px] sm:top-[84px] xl:top-[90px] w-full h-[calc(100vh-78px)] sm:h-[calc(100vh-84px)] xl:h-[calc(100vh-90px)] overflow-hidden bg-[#16171B] border-t border-white/15 border-b border-white/10 shadow-[0_-16px_36px_rgba(0,0,0,0.35)]"
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
