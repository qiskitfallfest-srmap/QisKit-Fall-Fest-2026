import * as React from 'react';
import Link from 'next/link';
import {
  Box,
  Infinity as InfinityIcon,
  TrendingUp,
  Users,
} from 'lucide-react';
import styles from './ImpactStrip.module.css';

interface ImpactItem {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number | string }>;
  href: string;
  ariaLabel: string;
}

const IMPACT_ITEMS: ImpactItem[] = [
  {
    title: 'LEARN',
    description: 'Gain new skills from global experts',
    icon: TrendingUp,
    href: '/experience#learn',
    ariaLabel: 'Experience Track 01: LEARN - Gain new skills from global experts',
  },
  {
    title: 'BUILD',
    description: 'Turn ideas into real solutions',
    icon: Box,
    href: '/experience#build',
    ariaLabel: 'Experience Track 02: BUILD - Turn ideas into real solutions',
  },
  {
    title: 'CONNECT',
    description: 'Be part of a global community',
    icon: Users,
    href: '/experience#connect',
    ariaLabel: 'Experience Track 03: CONNECT - Be part of a global community',
  },
  {
    title: 'CREATE IMPACT',
    description: 'Shape a quantum future together',
    icon: InfinityIcon,
    href: '/experience#impact',
    ariaLabel: 'Experience Track: CREATE IMPACT - Shape a quantum future together',
  },
];

export function ImpactStrip() {
  return (
    <section
      id="section-02-learn-build-connect-create-impact"
      aria-label="Learn, Build, Connect and Create Impact"
      className={styles.marqueeSection}
    >
      {/* Subtle ambient lighting overlay */}
      <div aria-hidden="true" className={styles.ambientLighting} />

      <div className={styles.marqueeViewport}>
        <div className={styles.marqueeTrack}>
          {/* Group 1: Primary interactive group */}
          <div className={styles.marqueeGroup}>
            {IMPACT_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={`p-${item.title}`}
                  href={item.href}
                  aria-label={item.ariaLabel}
                  className={styles.marqueeItem}
                >
                  <div className={styles.itemContent}>
                    <div aria-hidden="true" className={styles.iconWrapper}>
                      <Icon
                        className="h-[28px] w-[28px] sm:h-[32px] sm:w-[32px] lg:h-[34px] lg:w-[34px] 2xl:h-[36px] 2xl:w-[36px]"
                        strokeWidth={1.9}
                      />
                    </div>
                    <div className={styles.textWrapper}>
                      <h2 className={styles.itemTitle}>{item.title}</h2>
                      <p className={styles.itemDesc}>{item.description}</p>
                    </div>
                  </div>
                  <div aria-hidden="true" className={styles.separator} />
                </Link>
              );
            })}
          </div>

          {/* Group 2: Cloned group for seamless continuous loop */}
          <div className={styles.marqueeGroup} aria-hidden="true">
            {IMPACT_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={`c-${item.title}`}
                  href={item.href}
                  tabIndex={-1}
                  className={styles.marqueeItem}
                >
                  <div className={styles.itemContent}>
                    <div aria-hidden="true" className={styles.iconWrapper}>
                      <Icon
                        className="h-[28px] w-[28px] sm:h-[32px] sm:w-[32px] lg:h-[34px] lg:w-[34px] 2xl:h-[36px] 2xl:w-[36px]"
                        strokeWidth={1.9}
                      />
                    </div>
                    <div className={styles.textWrapper}>
                      <span className={styles.itemTitle}>{item.title}</span>
                      <p className={styles.itemDesc}>{item.description}</p>
                    </div>
                  </div>
                  <div aria-hidden="true" className={styles.separator} />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
