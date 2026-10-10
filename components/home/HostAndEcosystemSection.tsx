'use client';

import * as React from 'react';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import styles from './HostAndEcosystemSection.module.css';

interface EcosystemEntity {
  id: string;
  name: string;
  role: string;
  description: string;
  href: string;
  actionLabel: string;
  renderLogo: () => React.ReactNode;
}

const STATEMENTS = [
  'Building a Stronger Quantum Tomorrow.',
  'Building an Open Quantum Ecosystem.',
  'Building a Connected Quantum Future.',
];

const ENTITIES: EcosystemEntity[] = [
  {
    id: 'srm-university-ap',
    name: 'SRM University-AP',
    role: 'Host Institution',
    description:
      'Premier research-driven university in Amaravati, hosting workshops, distinguished keynotes, and the flagship quantum hackathon on campus.',
    href: 'https://www.srmap.edu.in/',
    actionLabel: 'Visit University',
    renderLogo: () => (
      <div className="flex items-center gap-3.5">
        <div className="relative w-[42px] h-[42px] sm:w-[46px] sm:h-[46px] shrink-0">
          <Image
            src="/images/footer/srm-ap-emblem.webp"
            alt="SRM University-AP Emblem"
            fill
            sizes="46px"
            className="object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex flex-col">
          <span className="font-sans font-bold text-[15px] sm:text-[16px] lg:text-[17px] leading-tight tracking-[0.04em] text-[#281D1E] dark:text-[#FFF1ED]">
            SRM UNIVERSITY-AP
          </span>
          <span className="font-sans text-[12px] sm:text-[13px] font-semibold tracking-[0.12em] uppercase text-[#625453] dark:text-[#D3C4C2] mt-0.5">
            Amaravati &middot; India
          </span>
        </div>
      </div>
    ),
  },
  {
    id: 'ibm-quantum',
    name: 'IBM Quantum',
    role: 'Ecosystem Support',
    description:
      'Advancing quantum computing to solve the world’s hardest problems with state-of-the-art superconducting processors and cloud access.',
    href: 'https://www.ibm.com/quantum',
    actionLabel: 'Explore IBM Quantum',
    renderLogo: () => (
      <div className="flex items-center">
        {/* Light Theme: Dark Positive Logotype with -ml compensation for internal transparent whitespace */}
        <div className="dark:hidden relative h-[76px] w-[200px] sm:h-[82px] sm:w-[216px] -ml-[28px] sm:-ml-[30px] -my-[22px] sm:-my-[24px] flex items-center">
          <Image
            src="/images/branding/IBM_Quantum_logotype_pos_RGB.webp"
            alt="IBM Quantum"
            fill
            sizes="216px"
            className="object-contain object-left select-none"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Dark Theme: Light Reverse Logotype */}
        <div className="hidden dark:block relative h-[28px] w-[155px] sm:h-[30px] sm:w-[166px]">
          <Image
            src="/images/branding/IBM_Quantum_logotype_rev_RGB.webp"
            alt="IBM Quantum"
            fill
            sizes="166px"
            className="object-contain object-left select-none"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    ),
  },
  {
    id: 'qiskit',
    name: 'Qiskit',
    role: 'Quantum Software Ecosystem',
    description:
      'Open-source software development kit providing tools for creating and manipulating quantum programs and executing them on prototype devices.',
    href: 'https://qiskit.org/',
    actionLabel: 'Explore Qiskit',
    renderLogo: () => (
      <div className="flex items-center gap-3">
        <div className="relative w-[34px] h-[34px] sm:w-[38px] sm:h-[38px] shrink-0">
          <Image
            src="/qiskit-purple-60.webp"
            alt="Qiskit Purple Mark"
            fill
            sizes="38px"
            className="object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
        <span className="font-sans font-bold text-[22px] sm:text-[24px] tracking-[-0.01em] text-[#281D1E] dark:text-[#FFF1ED]">
          Qiskit
        </span>
      </div>
    ),
  },
];

export function HostAndEcosystemSection() {
  const sectionRef = React.useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = React.useState(false);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [outgoingIndex, setOutgoingIndex] = React.useState<number | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);
  const rafIdRef = React.useRef<number | null>(null);

  // Detect prefers-reduced-motion
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Section entrance trigger & pointer-reactive ambient atmosphere
  React.useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );

    observer.observe(el);

    // Pointer-reactive ambient background lighting for fine pointer devices
    const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (isFinePointer) {
      const handlePointerMove = (e: PointerEvent) => {
        if (rafIdRef.current !== null) {
          cancelAnimationFrame(rafIdRef.current);
        }
        rafIdRef.current = requestAnimationFrame(() => {
          const rect = el.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          el.style.setProperty('--pointer-x', `${x}px`);
          el.style.setProperty('--pointer-y', `${y}px`);
          el.style.setProperty('--pointer-opacity', '1');
        });
      };

      const handlePointerLeave = () => {
        el.style.setProperty('--pointer-opacity', '0');
      };

      el.addEventListener('pointermove', handlePointerMove, { passive: true });
      el.addEventListener('pointerleave', handlePointerLeave, { passive: true });

      return () => {
        observer.disconnect();
        if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
        el.removeEventListener('pointermove', handlePointerMove);
        el.removeEventListener('pointerleave', handlePointerLeave);
      };
    }

    return () => observer.disconnect();
  }, []);

  // Continuous phrase rotation loop (3.4s hold per statement, 750ms transition)
  React.useEffect(() => {
    if (prefersReducedMotion) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        setOutgoingIndex(prev);
        return (prev + 1) % STATEMENTS.length;
      });
    }, 3400);

    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  // Clean up outgoing statement from DOM after 750ms transition
  React.useEffect(() => {
    if (outgoingIndex === null) return;
    const timer = setTimeout(() => {
      setOutgoingIndex(null);
    }, 760);
    return () => clearTimeout(timer);
  }, [outgoingIndex]);

  const handleCardPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty('--card-x', `${x.toFixed(1)}px`);
    el.style.setProperty('--card-y', `${y.toFixed(1)}px`);
    el.style.setProperty('--card-hover', '1');
  };

  const handleCardPointerLeave = (e: React.PointerEvent<HTMLElement>) => {
    e.currentTarget.style.setProperty('--card-hover', '0');
  };

  return (
    <section
      ref={sectionRef}
      id="section-06-host-and-ecosystem"
      aria-labelledby="host-ecosystem-heading"
      className={`${styles.section} ${isVisible ? styles.animateIn : ''}`}
    >
      {/* Subtle Pointer-Reactive Ambient Spotlight */}
      <div className={styles.pointerSpotlight} aria-hidden="true" />

      <div className={styles.container}>
        {/* =========================================================
            HEADER ROW: Editorial eyebrow + Dynamic Rotating Headline + Narrative
            Divider completely removed in both light & dark modes
        ========================================================== */}
        <div className={styles.headerRow}>
          <div className={styles.headlineCol}>
            {/* Eyebrow */}
            <div className={styles.eyebrowContainer}>
              <span aria-hidden="true" className={styles.eyebrowMarker} />
              <h2 id="host-ecosystem-heading" className={styles.eyebrowText}>
                HOST &amp; ECOSYSTEM
              </h2>
            </div>

            {/* Stable screen-reader description */}
            <span className="sr-only">
              Building a Stronger Quantum Tomorrow. An academic host, an industry ecosystem, and an open-source quantum platform coming together for Qiskit Fall Fest 2026.
            </span>

            {/* Vertical Phrase Rotator (Zero layout shift with ghost reservation) */}
            <div className={styles.rotatingHeadlineViewport} aria-hidden="true">
              {/* Ghost to reserve exact dimensions and prevent any layout shift */}
              <span className={styles.headlineGhost}>
                Building a Stronger Quantum Tomorrow.
              </span>

              {/* Clean single/two item rendering: only render outgoing during transition */}
              {outgoingIndex !== null && (
                <span
                  key={`outgoing-${outgoingIndex}`}
                  className={`${styles.statementItem} ${styles.statementOutgoing}`}
                >
                  {STATEMENTS[outgoingIndex]}
                </span>
              )}

              <span
                key={`current-${currentIndex}`}
                className={`${styles.statementItem} ${
                  outgoingIndex !== null ? styles.statementIncoming : styles.statementResting
                }`}
              >
                {STATEMENTS[currentIndex]}
              </span>
            </div>
          </div>

          {/* Phase 08: Recomposed Secondary Intro Copy with Inline Semantic Highlights */}
          <p className={styles.introCopy}>
            An <span className={styles.introHighlight}>academic host</span>, an{' '}
            <span className={styles.introHighlight}>industry ecosystem</span>, and an{' '}
            <span className={styles.introHighlight}>open-source quantum platform</span> coming together for Qiskit Fall Fest 2026.
          </p>
        </div>

        {/* =========================================================
            3-ENTITY LIQUID-GLASS CARDS ROW
            Standalone cards with no separating divider lines
        ========================================================== */}
        <div className={styles.cardsGrid}>
          {ENTITIES.map((entity) => (
            <div key={entity.id} className={styles.cardWrapper}>
              <article
                className={styles.ecosystemCard}
                onPointerMove={handleCardPointerMove}
                onPointerLeave={handleCardPointerLeave}
              >
                {/* Single Travelling Edge-Light */}
                <span className={styles.edgeLight} aria-hidden="true" />

                <div className={styles.cardContent}>
                  {/* Category Role Badge */}
                  <div className={styles.roleBadgeRow}>
                    <span className={styles.roleBadge}>
                      {entity.role}
                    </span>
                  </div>

                  {/* Logo Viewport (Consistent Baseline Across All Cards) */}
                  <div className={styles.logoViewport}>
                    {entity.renderLogo()}
                  </div>

                  {/* Supporting Description */}
                  <p className={styles.cardDescription}>
                    {entity.description}
                  </p>

                  {/* Action Link Row */}
                  <div className={styles.ctaRow}>
                    <a
                      href={entity.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${entity.actionLabel} (opens in a new tab)`}
                      className={styles.ctaLink}
                    >
                      <span>{entity.actionLabel}</span>
                      <ArrowUpRight className={styles.ctaArrow} strokeWidth={2.2} />
                    </a>
                  </div>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>

      {/* Visual crossfade dissolve into Countdown section (Phase 13) */}
      <div className={styles.countdownCrossfadeOverlay} aria-hidden="true" />
    </section>
  );
}
