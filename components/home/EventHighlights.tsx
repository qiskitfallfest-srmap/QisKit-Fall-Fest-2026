'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BriefcaseBusiness, Boxes, Atom, Users, ArrowRight } from 'lucide-react';
import styles from './EventHighlights.module.css';

interface HighlightItem {
  id: string;
  title: string;
  tag: string;
  description: string;
  icon: React.ElementType;
  imageSrc: string;
  imageAlt: string;
  href: string;
}

const HIGHLIGHTS: HighlightItem[] = [
  {
    id: 'workshops',
    title: 'World-Class Workshops',
    tag: 'WORKSHOPS',
    description: 'Learn from experts and get hands-on experience with Qiskit SDK & quantum circuits.',
    icon: BriefcaseBusiness,
    imageSrc: '/images/home/highlights/workshops.jpg',
    imageAlt: 'World-Class Quantum Workshops and hands-on laboratory sessions',
    href: '/schedule#online-day-1',
  },
  {
    id: 'hackathons',
    title: 'Quantum Hackathons',
    tag: 'COMPETITION',
    description: 'Build real solutions to global quantum computing challenges in collaborative teams.',
    icon: Boxes,
    imageSrc: '/images/home/highlights/hackathons.jpg',
    imageAlt: 'Quantum Hackathon collaboration and software builds',
    href: '/schedule#offline-day-3',
  },
  {
    id: 'sessions',
    title: 'Inspiring Technical Sessions',
    tag: 'KEYNOTES',
    description: 'Explore state-of-the-art research, industry developments, and quantum algorithms.',
    icon: Atom,
    imageSrc: '/images/home/highlights/sessions.jpg',
    imageAlt: 'Keynotes and technical presentations on quantum computing',
    href: '/schedule#online-day-2',
  },
  {
    id: 'community',
    title: 'Global Community',
    tag: 'NETWORKING',
    description: 'Connect with a diverse and growing global ecosystem of quantum pioneers and researchers.',
    icon: Users,
    imageSrc: '/images/home/highlights/community.jpg',
    imageAlt: 'Global quantum community networking and collaboration',
    href: '/team#organizing-structure',
  },
];

export function EventHighlights() {
  const sectionRef = React.useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = React.useState(false);
  const rafIdRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    // Trigger one-time editorial entrance motion when section enters viewport
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

    // Pointer-reactive ambient lighting for fine pointer devices
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

  const handleCardPointerMove = (e: React.PointerEvent<HTMLAnchorElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty('--card-x', `${x.toFixed(1)}px`);
    el.style.setProperty('--card-y', `${y.toFixed(1)}px`);
    el.style.setProperty('--card-hover', '1');
  };

  const handleCardPointerLeave = (e: React.PointerEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.setProperty('--card-hover', '0');
  };

  return (
    <section
      ref={sectionRef}
      id="section-04-event-highlights"
      aria-labelledby="highlights-heading"
      className={`${styles.section} ${isVisible ? styles.animateIn : ''}`}
    >
      {/* Subtle Pointer-Reactive Ambient Spotlight */}
      <div className={styles.pointerSpotlight} aria-hidden="true" />

      {/* Cross-section seamless atmosphere blend into Host & Ecosystem */}
      <div className={styles.bottomAtmosphereBlend} aria-hidden="true" />

      <div className={styles.sectionContainer}>
        {/* =========================================================
            HEADER SECTION: Continuous Typewriter Eyebrow &
            Staggered Editorial Heading + Description (No Divider)
        ========================================================== */}
        <div className="mb-2">
          {/* Eyebrow with diamond marker and continuous typewriter */}
          <div className={styles.eyebrowContainer}>
            <span aria-hidden="true" className={styles.eyebrowMarker} />

            {/* Accessible screen reader announcement */}
            <span className="sr-only">EVENT HIGHLIGHTS</span>

            {/* Visual continuous typing/deleting typewriter loop */}
            <span className={styles.typewriterContainer} aria-hidden="true">
              <span className={styles.typewriterGhost}>EVENT HIGHLIGHTS</span>
              <span className={styles.typewriterText}>EVENT HIGHLIGHTS</span>
              <span className={styles.typewriterCaret} />
            </span>
          </div>

          {/* Heading Row: Staggered Two-Line Reveal & Description */}
          <div className={styles.headingRow}>
            <h2 id="highlights-heading" className={styles.headingBlock}>
              <span className={styles.headingReveal}>
                <span className={`${styles.headingLine} ${styles.headingLineOne}`}>
                  Immersive Quantum Experiences
                </span>
              </span>
              <span className={styles.headingReveal}>
                <span className={`${styles.headingLine} ${styles.headingLineTwo}`}>
                  &amp; Tracks.
                </span>
              </span>
            </h2>

            <p className={styles.description}>
              From hands-on Qiskit SDK workshops and competitive hackathons to keynote sessions and global community networking at SRM University-AP.
            </p>
          </div>
        </div>

        {/* =========================================================
            HIGHLIGHT CARDS GRID: 4 Liquid Glass Track Surfaces
            - Desktop: 4 equal columns
            - Tablet: 2x2 grid
            - Mobile: 1 column
        ========================================================== */}
        <div className={styles.cardsGrid}>
          {HIGHLIGHTS.map((card) => {
            const IconComponent = card.icon;
            return (
              <div key={card.id} className={styles.cardWrapper}>
                <Link
                  href={card.href}
                  className={styles.cardLink}
                  onPointerMove={handleCardPointerMove}
                  onPointerLeave={handleCardPointerLeave}
                  aria-label={`${card.title} — Explore Track`}
                >
                  {/* Single Travelling Edge-Light */}
                  <span className={styles.edgeLight} aria-hidden="true" />

                  {/* Top Media: Image with subtle brand gradient overlay & category badge */}
                  <div className={styles.imageContainer}>
                    <Image
                      src={card.imageSrc}
                      alt={card.imageAlt}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className={styles.cardImage}
                      referrerPolicy="no-referrer"
                    />

                    {/* Subtle tonal wash */}
                    <div aria-hidden="true" className={styles.imageOverlay} />

                    {/* Category Tag Badge */}
                    <span className={styles.badgePill}>
                      {card.tag}
                    </span>
                  </div>

                  {/* Card Body: Title with Icon, Description, and Explore Action */}
                  <div className={styles.cardBody}>
                    {/* Title Row with Brand Icon */}
                    <div className={styles.titleRow}>
                      <div className={styles.iconBox} aria-hidden="true">
                        <IconComponent strokeWidth={2} className="w-4 h-4 shrink-0" />
                      </div>
                      <h3 className={styles.cardTitle}>
                        {card.title}
                      </h3>
                    </div>

                    {/* Card Description */}
                    <p className={styles.cardDescription}>
                      {card.description}
                    </p>

                    {/* Explore Track Row */}
                    <div className={styles.exploreRow}>
                      <span className={styles.exploreText}>
                        Explore Track
                      </span>
                      <span className={styles.exploreArrowChamber} aria-hidden="true">
                        <ArrowRight className={`w-3.5 h-3.5 ${styles.exploreArrowIcon}`} strokeWidth={2.2} />
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
