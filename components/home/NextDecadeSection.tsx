'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import styles from './NextDecadeSection.module.css';

const NEXT_DECADE_ASSETS = {
  backgroundLight: '/images/home/next-decade/HOME-03-NEXT-DECADE-BACKGROUND-LIGHT.png',
  backgroundDark: '/images/home/next-decade/HOME-03-NEXT-DECADE-BACKGROUND-DARK.png',
};

const STATS = [
  {
    value: '200+',
    label: 'Host Institutions',
  },
  {
    value: 'Global',
    label: 'Qiskit Community',
  },
  {
    value: '10 Years',
    label: 'of Quantum on Cloud',
  },
];

export function NextDecadeSection() {
  const sectionRef = React.useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    // Use IntersectionObserver once to trigger editorial entrance motion
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="section-03-the-next-decade-together"
      aria-label="The Next Decade Together"
      className={`${styles.section} ${isVisible ? styles.animateIn : ''}`}
    >
      {/* Top boundary blend from preceding Impact Marquee */}
      <div aria-hidden="true" className={styles.topBlend} />

      {/* Bottom boundary blend into subsequent Event Highlights */}
      <div aria-hidden="true" className={styles.bottomBlend} />

      {/* Background artwork: native light and dark assets */}
      <div aria-hidden="true" className={styles.bgWrapper}>
        <Image
          src={NEXT_DECADE_ASSETS.backgroundLight}
          alt="The Next Decade Together Background Light"
          fill
          sizes="100vw"
          priority={false}
          className={`${styles.bgImageLight} dark:hidden`}
        />
        <Image
          src={NEXT_DECADE_ASSETS.backgroundDark}
          alt="The Next Decade Together Background Dark"
          fill
          sizes="100vw"
          priority={false}
          className={`${styles.bgImageDark} hidden dark:block`}
        />
        <div className={styles.readabilityGradient} />
      </div>

      {/* Content Canvas */}
      <div className={styles.contentCanvas}>
        {/* ZONE 1: Left Editorial Block with Continuous Rail */}
        <div className={styles.leftEditorial}>
          <div className={styles.editorialRail} aria-hidden="true">
            <span className={styles.railDotTop} />
            <span className={styles.railLine} />
            <span className={styles.railDotBottom} />
          </div>

          <div className={styles.leftContent}>
            {/* Heading with clip-reveal lines */}
            <h2 className={styles.headingWrapper}>
              <span className={styles.headingMask}>
                <span className={`${styles.headingLine} ${styles.headingLine1}`}>THE</span>
              </span>
              <span className={styles.headingMask}>
                <span className={`${styles.headingLine} ${styles.headingLine2} whitespace-nowrap`}>
                  NEXT DECADE
                </span>
              </span>
              <span className={styles.headingMask}>
                <span className={`${styles.headingLine} ${styles.headingLine3}`}>TOGETHER</span>
              </span>
            </h2>

            {/* Description Paragraph */}
            <p className={styles.bodyText}>
              Qiskit Fall Fest 2026 brings together students, developers, researchers, and
              industry leaders to learn, build, and share the future of quantum computing.
            </p>

            {/* Explore the event CTA */}
            <div className={styles.ctaWrapper}>
              <Link
                href="/experience"
                aria-label="Explore the Qiskit Fall Fest experience"
                className={styles.exploreLink}
              >
                <span>Explore the event</span>
                <span className={styles.ctaUnderline} aria-hidden="true" />
                <ArrowRight
                  className={`w-4 h-4 shrink-0 ${styles.ctaArrow}`}
                  strokeWidth={2}
                />
              </Link>
            </div>
          </div>
        </div>

        {/* ZONE 2: IBM Quantum Quote Card */}
        <div className={styles.quoteCard}>
          <p className={styles.quoteText}>
            &ldquo;Quantum computing is not just a technology shift, it’s a community
            movement.&rdquo;
          </p>
          <p className={styles.quoteAuthor}>— IBM Quantum</p>
        </div>

        {/* ZONE 3: Statistics Stack */}
        <div className={styles.statsStack}>
          {STATS.map((stat, idx) => (
            <div
              key={stat.label}
              className={`${styles.statItem} ${
                idx === 0
                  ? styles.statItem1
                  : idx === 1
                  ? styles.statItem2
                  : styles.statItem3
              }`}
            >
              <div aria-hidden="true" className={styles.statLine} />
              <div className={styles.statValue}>{stat.value}</div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
