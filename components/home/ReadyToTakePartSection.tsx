'use client';

import * as React from 'react';
import { ArrowRight } from 'lucide-react';
import { REGISTRATION_URL } from '@/lib/constants';
import { ResponsivePicture } from '@/components/shared/ResponsivePicture';

export function ReadyToTakePartSection() {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);
  const [pointerPos, setPointerPos] = React.useState({ x: 0, y: 0 });

  const sectionRef = React.useRef<HTMLElement>(null);
  const btnRef = React.useRef<HTMLAnchorElement>(null);
  const rafIdRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    mediaQuery.addEventListener('change', handleMotionChange);

    return () => {
      mediaQuery.removeEventListener('change', handleMotionChange);
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  // Phase 15 & 23: Restrained pointer-reactive globe depth via rAF
  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (prefersReducedMotion || !sectionRef.current) return;
    const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!isFinePointer) return;

    if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
    const rect = sectionRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8; // max 4px
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 6; // max 3px

    rafIdRef.current = requestAnimationFrame(() => {
      setPointerPos({ x, y });
    });
  };

  const handlePointerLeave = () => {
    if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
    setPointerPos({ x: 0, y: 0 });
  };

  return (
    <section
      ref={sectionRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      id="section-08-ready-to-take-part"
      aria-labelledby="ready-to-take-part-heading"
      className="readySection"
    >
      <style dangerouslySetInnerHTML={{ __html: `
        /* -------------------------------------------------------------------------
           1. Phase 2 & 3: Section Geometry & Top-Anchored Artwork Frame
           ------------------------------------------------------------------------- */
        .readySection {
          position: relative;
          isolation: isolate;
          width: 100%;
          overflow: clip;
          background-color: #180508;
          height: clamp(640px, 72svh, 760px);
          min-height: clamp(640px, 72svh, 760px);
          display: flex;
          align-items: center;
          transition: background-color 300ms ease;
          border-bottom: 1px solid rgba(143, 23, 35, 0.14);
        }

        :global(.dark) .readySection {
          background-color: #140406;
          border-bottom-color: rgba(239, 116, 129, 0.10);
        }

        @media (min-width: 1920px) {
          .readySection {
            height: clamp(660px, 70svh, 780px);
            min-height: clamp(660px, 70svh, 780px);
          }
        }

        @media (max-width: 1279px) and (min-width: 1024px) {
          .readySection {
            height: clamp(600px, 70svh, 700px);
            min-height: clamp(600px, 70svh, 700px);
          }
        }

        @media (max-width: 1023px) {
          .readySection {
            height: auto;
            min-height: 680px;
            padding-top: clamp(80px, 10vh, 110px);
            padding-bottom: clamp(60px, 8vh, 90px);
          }
        }

        /* -------------------------------------------------------------------------
           2. Phase 3 & 5: Top-Anchored Artwork Viewport & Globe Composition
           ------------------------------------------------------------------------- */
        .artworkViewport {
          position: absolute;
          inset: 0;
          overflow: clip;
          pointer-events: none;
          z-index: 0;
          user-select: none;
        }

        .artworkLayer {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          transition: transform 600ms cubic-bezier(0.16, 1, 0.3, 1);
          will-change: transform;
        }

        /* Top-anchored image crop: Y component is top/0% to crop bottom only */
        .artworkLayer img {
          object-fit: cover !important;
          object-position: 68% top !important;
        }

        @media (min-width: 1920px) {
          .artworkLayer img {
            object-position: 70% top !important;
          }
        }

        @media (max-width: 1279px) and (min-width: 1024px) {
          .artworkLayer img {
            object-position: 69% top !important;
          }
        }

        @media (max-width: 1023px) {
          .artworkLayer img {
            object-position: 66% top !important;
          }
        }

        /* -------------------------------------------------------------------------
           3. Phase 7: Content Grid Layout
           ------------------------------------------------------------------------- */
        .contentContainer {
          position: relative;
          z-index: 10;
          width: min(calc(100% - clamp(48px, 6vw, 140px)), 1740px);
          margin-inline: auto;
          height: 100%;
          display: grid;
          grid-template-columns: minmax(500px, 0.78fr) minmax(0, 1.22fr);
          align-items: center;
          gap: clamp(50px, 6vw, 110px);
        }

        @media (max-width: 1023px) {
          .contentContainer {
            grid-template-columns: 1fr;
            gap: 0;
            width: min(calc(100% - 48px), 640px);
          }
        }

        @media (max-width: 639px) {
          .contentContainer {
            width: calc(100% - 32px);
          }
        }

        .leftColumn {
          position: relative;
          z-index: 4;
          max-width: 650px;
          min-width: 0;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        /* -------------------------------------------------------------------------
           4. Phase 10 & 11: Editorial Serif Headline Typography & Entrance
           ------------------------------------------------------------------------- */
        .readyHeadline {
          color: #FFF3EF;
          font-family: var(--font-serif), "Playfair Display", Georgia, serif;
          font-weight: 700;
          font-size: clamp(44px, 12vw, 58px);
          line-height: 0.91;
          letter-spacing: -0.035em;
          max-width: 620px;
          margin: 0;
          padding: 0.04em 0.05em 0.10em 0;
          overflow: visible;
          animation: readyHeadlineEntrance 700ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @media (min-width: 640px) {
          .readyHeadline {
            font-size: clamp(50px, 7vw, 64px);
          }
        }

        @media (min-width: 1024px) {
          .readyHeadline {
            font-size: clamp(58px, 4.6vw, 74px);
          }
        }

        @media (min-width: 1280px) {
          .readyHeadline {
            font-size: clamp(68px, 4.7vw, 90px);
          }
        }

        .readyHeadlineLine {
          display: block;
          color: #FFF3EF;
          width: fit-content;
        }

        @supports (-webkit-background-clip: text) {
          .readyHeadlineLine {
            background: linear-gradient(108deg, #FFF8F4 0%, #F8E1DD 43%, #F5BBC2 72%, #F08A96 100%);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
        }

        @keyframes readyHeadlineEntrance {
          0% {
            opacity: 0.75;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .readyHeadline {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }

        /* -------------------------------------------------------------------------
           5. Phase 14: Register Button with Satin Light Sweep
           ------------------------------------------------------------------------- */
        .readyCtaBtn {
          position: relative;
          display: inline-flex;
          height: 56px;
          align-items: center;
          justify-content: space-between;
          overflow: hidden;
          border-radius: 8px;
          padding-left: 28px;
          padding-right: 10px;
          font-size: clamp(15px, 0.95vw, 16px);
          background: linear-gradient(105deg, #A7192A 0%, #941522 100%);
          border: 1px solid rgba(255, 205, 211, 0.24);
          color: #FFF8F5;
          text-decoration: none;
          outline: none;
          box-shadow: 0 6px 20px rgba(73, 3, 10, 0.22);
          transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 300ms cubic-bezier(0.16, 1, 0.3, 1);
          -webkit-tap-highlight-color: transparent;
        }

        .readyCtaBtn:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 32px rgba(73, 3, 10, 0.30);
        }

        .readyCtaBtn:active {
          transform: translateY(0) scale(0.985);
        }

        .readyCtaBtn:focus-visible {
          outline: 2px solid #F18A96;
          outline-offset: 3px;
        }

        .readyCtaShine {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(105deg, transparent 20%, rgba(255, 255, 255, 0.18) 48%, transparent 74%);
          transform: translateX(-140%);
          transition: transform 620ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .readyCtaBtn:hover .readyCtaShine {
          transform: translateX(145%);
        }

        .readyCtaArrow {
          position: relative;
          z-index: 10;
          display: flex;
          height: 40px;
          width: 40px;
          margin-left: 20px;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          background: #FFF6F2;
          color: #991827;
          transition: transform 260ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .readyCtaBtn:hover .readyCtaArrow {
          transform: translateX(3px);
        }
      `}} />

      {/* =========================================================
          BACKGROUND ARTWORK LAYER (Top-Anchored & Cropped from Bottom)
      ========================================================== */}
      <div className="artworkViewport" aria-hidden="true">
        {/* Globe Artwork with Optional Restrained Pointer Depth */}
        <div
          style={{
            transform: prefersReducedMotion
              ? 'none'
              : `translate3d(${pointerPos.x}px, ${pointerPos.y}px, 0) scale(${pointerPos.x !== 0 || pointerPos.y !== 0 ? 1.004 : 1})`,
          }}
          className="artworkLayer"
        >
          <ResponsivePicture
            page="home"
            index={4}
            alt="Ready to Take Part Background"
            fill
            objectPosition="68% top"
            imgClassName="!object-[68%_top]"
          />
        </div>

        {/* Phase 16: Restrained Atmospheric Halo Behind Globe */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 72% 43%, rgba(235,113,84,0.08) 0%, rgba(191,51,41,0.035) 30%, transparent 58%)',
          }}
          aria-hidden="true"
        />

        {/* Phase 6: Left-Only Atmospheric Readability Gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, rgba(44,3,8,0.86) 0%, rgba(54,5,10,0.67) 24%, rgba(54,5,10,0.30) 40%, rgba(54,5,10,0.08) 52%, transparent 64%)',
          }}
          aria-hidden="true"
        />

        {/* Phase 6: Secondary Vertical Tone */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(20,0,3,0.08) 0%, transparent 25%, transparent 72%, rgba(20,0,3,0.18) 100%)',
          }}
          aria-hidden="true"
        />
      </div>

      {/* =========================================================
          CONTENT CONTAINER (40% Editorial / 60% Visual Globe)
      ========================================================== */}
      <div className="contentContainer">
        {/* Left Editorial Column */}
        <div className="leftColumn">
          {/* Phase 8: Structural Editorial Rail */}
          <div
            aria-hidden="true"
            className="
              hidden lg:flex flex-col items-center
              absolute -left-6 xl:-left-7 top-1 bottom-1 w-[1.5px]
              pointer-events-none select-none
              opacity-90
            "
            style={{
              background: 'linear-gradient(to bottom, rgba(245,139,151,0.96) 0%, rgba(239,116,129,0.46) 58%, rgba(239,116,129,0.08) 100%)',
            }}
          >
            <span
              className="w-[5px] h-[5px] rounded-full bg-[#EF8794] -translate-y-1/2"
              style={{
                boxShadow: '0 0 12px rgba(239,116,129,0.42)',
              }}
            />
          </div>

          {/* Phase 9: Eyebrow */}
          <div
            style={{ marginBottom: 'clamp(30px, 3vh, 40px)' }}
            className="flex items-center gap-[10px]"
          >
            <span
              aria-hidden="true"
              className="w-[6px] h-[6px] rotate-45 shrink-0 bg-[#EF8794]"
              style={{ boxShadow: '0 0 8px rgba(239,135,148,0.36)' }}
            />
            <span
              className="font-sans font-bold uppercase"
              style={{
                fontSize: 'clamp(12px, 0.75vw, 14px)',
                letterSpacing: '0.22em',
                color: '#F1939D',
              }}
            >
              BE PART OF IT
            </span>
          </div>

          {/* Phase 10: Editorial Display Serif Headline */}
          <h2 id="ready-to-take-part-heading" className="readyHeadline">
            <span className="readyHeadlineLine">
              Ready to
            </span>
            <span className="readyHeadlineLine">
              Take Part?
            </span>
          </h2>

          {/* Phase 12: Body Copy with Selective Emphasis */}
          <p
            style={{
              marginTop: 'clamp(34px, 3.5vh, 46px)',
              maxWidth: '590px',
              fontSize: 'clamp(16px, 1.0vw, 18px)',
              lineHeight: '1.62',
              letterSpacing: '-0.005em',
              color: 'rgba(255, 241, 237, 0.83)',
            }}
            className="font-sans font-normal"
          >
            Join students, developers, researchers, and industry leaders at{' '}
            <span className="text-[#FFF2EE] font-semibold">Qiskit Fall Fest 2026</span> —{' '}
            <span className="text-[#F3BBC0] font-semibold">SRM University-AP × IBM</span>.
          </p>

          {/* Phase 14: Register Button with Directional Satin Sweep */}
          <div style={{ marginTop: 'clamp(30px, 3vh, 40px)' }}>
            <a
              ref={btnRef}
              href={REGISTRATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="cta"
              aria-label="Register Now on Unstop (opens in a new tab)"
              className="readyCtaBtn group"
            >
              {/* Directional satin-light sweep */}
              <span aria-hidden="true" className="readyCtaShine" />

              {/* Button Label */}
              <span className="relative z-10 font-semibold tracking-[0.01em] text-[#FFF8F5]">
                Register Now
              </span>

              {/* Arrow Chamber */}
              <span
                aria-hidden="true"
                className="readyCtaArrow"
              >
                <ArrowRight size={18} strokeWidth={2.4} />
              </span>
            </a>
          </div>
        </div>

        {/* Right Area: Dedicated unobstructed space for glowing quantum globe */}
        <div className="hidden lg:block pointer-events-none" aria-hidden="true" />
      </div>
    </section>
  );
}
