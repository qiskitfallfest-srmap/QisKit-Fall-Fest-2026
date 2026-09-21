'use client';

import * as React from 'react';

type HoverState = 'default' | 'interactive' | 'cta' | 'hidden';

function subscribeToMediaQuery(callback: () => void) {
  const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
  mediaQuery.addEventListener('change', callback);
  return () => mediaQuery.removeEventListener('change', callback);
}

function getMediaSnapshot() {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

function getServerSnapshot() {
  return false;
}

export function CustomCursor() {
  const isSupported = React.useSyncExternalStore(
    subscribeToMediaQuery,
    getMediaSnapshot,
    getServerSnapshot
  );

  // References to DOM elements
  const dotWrapperRef = React.useRef<HTMLDivElement>(null);
  const ringWrapperRef = React.useRef<HTMLDivElement>(null);
  const dotInnerRef = React.useRef<HTMLDivElement>(null);
  const ringInnerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isSupported) {
      return;
    }

    document.documentElement.classList.add('has-custom-cursor');

    // Pointer state stored in mutable variables to avoid React re-renders
    let targetX = -100;
    let targetY = -100;
    let dotX = -100;
    let dotY = -100;
    let ringX = -100;
    let ringY = -100;

    let hasMoved = false;
    let isVisible = false;
    let isDown = false;
    let currentHover: HoverState = 'default';
    let animationFrameId: number;

    const DOT_LERP = 0.82;
    const RING_LERP = 0.18;

    const updateHoverStyles = () => {
      if (!dotInnerRef.current || !ringInnerRef.current) return;

      const dotEl = dotInnerRef.current;
      const ringEl = ringInnerRef.current;

      if (!isVisible || currentHover === 'hidden') {
        dotEl.style.opacity = '0';
        ringEl.style.opacity = '0';
        return;
      }

      dotEl.style.opacity = '1';
      ringEl.style.opacity = '1';

      const scaleDownDot = isDown ? 0.72 : 1;
      const scaleDownRing = isDown ? 0.84 : 1;

      if (currentHover === 'cta') {
        // CTA hover state
        dotEl.style.width = '10px';
        dotEl.style.height = '10px';
        dotEl.style.transform = `translate(-50%, -50%) scale(${scaleDownDot})`;

        ringEl.style.width = '50px';
        ringEl.style.height = '50px';
        ringEl.style.transform = `translate(-50%, -50%) scale(${scaleDownRing})`;
        ringEl.setAttribute('data-cta', 'true');
      } else if (currentHover === 'interactive') {
        // Standard interactive hover (links, buttons)
        dotEl.style.width = '10px';
        dotEl.style.height = '10px';
        dotEl.style.transform = `translate(-50%, -50%) scale(${scaleDownDot})`;

        ringEl.style.width = '46px';
        ringEl.style.height = '46px';
        ringEl.style.transform = `translate(-50%, -50%) scale(${scaleDownRing})`;
        ringEl.removeAttribute('data-cta');
      } else {
        // Default cursor state
        dotEl.style.width = '14px';
        dotEl.style.height = '14px';
        dotEl.style.transform = `translate(-50%, -50%) scale(${scaleDownDot})`;

        ringEl.style.width = '36px';
        ringEl.style.height = '36px';
        ringEl.style.transform = `translate(-50%, -50%) scale(${scaleDownRing})`;
        ringEl.removeAttribute('data-cta');
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;

      if (!hasMoved) {
        hasMoved = true;
        dotX = targetX;
        dotY = targetY;
        ringX = targetX;
        ringY = targetY;
      }

      if (!isVisible) {
        isVisible = true;
      }

      // Check hover targets
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // When hovering over inputs or text areas, hide custom cursor to keep native text cursor
      if (target.closest('input, textarea, [contenteditable="true"], select')) {
        if (currentHover !== 'hidden') {
          currentHover = 'hidden';
          updateHoverStyles();
        }
        return;
      }

      // Check for CTA targets
      if (
        target.closest("[data-cursor='cta']") ||
        target.closest("a[href*='unstop'], button[data-cta='true']")
      ) {
        if (currentHover !== 'cta') {
          currentHover = 'cta';
          updateHoverStyles();
        }
        return;
      }

      // Check for standard interactive elements
      if (
        target.closest("a, button, [role='button'], [data-cursor='interactive'], summary")
      ) {
        if (currentHover !== 'interactive') {
          currentHover = 'interactive';
          updateHoverStyles();
        }
        return;
      }

      // Default state
      if (currentHover !== 'default') {
        currentHover = 'default';
        updateHoverStyles();
      }
    };

    const onPointerDown = () => {
      isDown = true;
      updateHoverStyles();
    };

    const onPointerUp = () => {
      isDown = false;
      updateHoverStyles();
    };

    const onPointerLeave = () => {
      isVisible = false;
      updateHoverStyles();
    };

    const onPointerEnter = () => {
      if (hasMoved) {
        isVisible = true;
        updateHoverStyles();
      }
    };

    // Animation render loop
    const renderLoop = () => {
      if (hasMoved) {
        // Fast follow for inner dot
        dotX += (targetX - dotX) * DOT_LERP;
        dotY += (targetY - dotY) * DOT_LERP;

        // Smooth delayed follow for outer ring
        ringX += (targetX - ringX) * RING_LERP;
        ringY += (targetY - ringY) * RING_LERP;

        if (dotWrapperRef.current) {
          dotWrapperRef.current.style.transform = `translate3d(${dotX}px, ${dotY}px, 0)`;
        }
        if (ringWrapperRef.current) {
          ringWrapperRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
        }
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    document.addEventListener('mouseleave', onPointerLeave, { passive: true });
    document.addEventListener('mouseenter', onPointerEnter, { passive: true });

    animationFrameId = requestAnimationFrame(renderLoop);

    return () => {
      document.documentElement.classList.remove('has-custom-cursor');
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      document.removeEventListener('mouseleave', onPointerLeave);
      document.removeEventListener('mouseenter', onPointerEnter);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isSupported]);

  if (!isSupported) {
    return null;
  }

  return (
    <div aria-hidden="true" className="pointer-events-none select-none">
      {/* Outer Ring Wrapper */}
      <div
        ref={ringWrapperRef}
        className="fixed top-0 left-0 z-[99997] pointer-events-none will-change-transform"
        style={{ transform: 'translate3d(-100px, -100px, 0)' }}
      >
        <div
          ref={ringInnerRef}
          className="
            rounded-full pointer-events-none border-[1.5px] opacity-0
            border-[rgba(126,16,27,0.72)]
            shadow-[0_0_0_1px_rgba(126,16,27,0.04)]
            dark:border-[rgba(255,225,222,0.82)]
            dark:shadow-[0_0_8px_rgba(244,124,136,0.08)]
            data-[cta=true]:border-[rgba(143,23,35,0.90)]
            dark:data-[cta=true]:border-[rgba(244,124,136,0.92)]
            transition-[width,height,transform,opacity,border-color,box-shadow]
            duration-150 ease-[cubic-bezier(0.22,1,0.36,1)]
          "
          style={{
            width: '36px',
            height: '36px',
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>

      {/* Inner Dot Wrapper */}
      <div
        ref={dotWrapperRef}
        className="fixed top-0 left-0 z-[99998] pointer-events-none will-change-transform"
        style={{ transform: 'translate3d(-100px, -100px, 0)' }}
      >
        <div
          ref={dotInnerRef}
          className="
            rounded-full pointer-events-none opacity-0
            bg-[#7E101B]
            dark:bg-[#F47C88]
            transition-[width,height,transform,opacity,background-color]
            duration-150 ease-[cubic-bezier(0.22,1,0.36,1)]
          "
          style={{
            width: '14px',
            height: '14px',
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>
    </div>
  );
}
