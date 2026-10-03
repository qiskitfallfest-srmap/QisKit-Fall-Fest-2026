'use client';

import * as React from 'react';

export interface ExperienceSectionDividerProps {
  id?: string;
  fromTrackNumber: string;
  fromTrackTitle: string;
  toTrackNumber: string;
  toTrackTitle: string;
  headline?: string;
  subtitle?: string;
  onProceed?: () => void;
  proceedLabel?: string;
}

/**
 * ExperienceSectionDivider
 *
 * Clean, grand editorial chapter divider bridging Experience tracks.
 * Features pure, refined typography with a prominent headline and narrative subtitle.
 */
export function ExperienceSectionDivider({
  id,
  fromTrackNumber,
  fromTrackTitle,
  toTrackNumber,
  toTrackTitle,
  headline,
  subtitle,
}: ExperienceSectionDividerProps) {
  const displayHeadline =
    headline ||
    `From ${fromTrackTitle.toLowerCase()} to hands-on ${toTrackTitle.toLowerCase()} architectures`;

  const displaySubtitle =
    subtitle ||
    `Transitioning from theoretical quantum foundations into collaborative programming challenges, technical summits, and real-world system engineering.`;

  return (
    <section
      id={id}
      aria-label={displayHeadline}
      className="relative z-10 w-full min-h-[46vh] sm:min-h-[52vh] py-20 sm:py-28 md:py-36 px-6 sm:px-10 bg-[#FBF9F6] dark:bg-[#121316] border-y border-[#E5E0D8] dark:border-white/10 overflow-hidden flex flex-col items-center justify-center text-center transition-colors duration-300 select-none"
    >
      {/* Precision ambient lighting gradients */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,rgba(242,238,230,0.85)_0%,rgba(251,249,246,0.98)_60%,#F5F2ED_100%)] dark:bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,rgba(108,21,30,0.12)_0%,rgba(18,19,22,0.95)_60%,#121316_100%)]"
      />

      {/* Subtle technical cross-grid overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35] dark:opacity-[0.14] bg-[radial-gradient(#B8B2A6_1px,transparent_1px)] dark:bg-[radial-gradient(#FFFFFF_1px,transparent_1px)] [background-size:28px_28px]"
      />

      {/* Architectural hairline borders */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#B08D57]/30 dark:via-[#B08D57]/50 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#B08D57]/30 dark:via-[#B08D57]/50 to-transparent"
      />

      {/* Main Editorial Text & Small Description */}
      <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center text-center px-4">
        {/* Editorial Headline */}
        <h3 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[54px] text-[#16171B] dark:text-[#F5F3F0] font-normal tracking-[-0.02em] leading-[1.18] sm:leading-[1.16] max-w-3xl mx-auto">
          {displayHeadline}
        </h3>

        {/* Small Description */}
        <p className="mt-4 sm:mt-5 md:mt-6 text-sm sm:text-base md:text-lg font-sans text-[#5E5B55] dark:text-[#A8AAB0] font-normal leading-relaxed max-w-2xl mx-auto">
          {displaySubtitle}
        </p>
      </div>
    </section>
  );
}

export default ExperienceSectionDivider;
