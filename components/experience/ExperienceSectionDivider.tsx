'use client';

import * as React from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';

interface ExperienceSectionDividerProps {
  id?: string;
  fromTrackNumber: string;
  fromTrackTitle: string;
  toTrackNumber: string;
  toTrackTitle: string;
  headline?: string;
  subtitle?: string;
}

/**
 * Editorial chapter gap & transition strip between Experience tracks.
 * Features an authentic light ivory/sand canvas (#F5F3F0) matching the app's signature
 * light palette, with refined human serif typography and natural sentence-case descriptors.
 * Anchors sticky positioning so the subsequent section glides over it like an elevated card.
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
  // Default editorial headlines if not explicitly provided
  const displayHeadline =
    headline ||
    `From ${fromTrackTitle.toLowerCase()} to hands-on ${toTrackTitle.toLowerCase()} architectures`;

  const displaySubtitle =
    subtitle ||
    `Transitioning from theoretical foundations into interactive quantum computing workflows, collaborative challenges, and real-world system engineering.`;

  return (
    <div
      id={id}
      className="relative z-10 w-full min-h-[55vh] sm:min-h-[60vh] bg-[#F5F3F0] border-y border-[#DDD8CF] overflow-hidden flex flex-col items-center justify-center select-none"
    >
      {/* Delicate warm ambient lighting texture (zero burgundy) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_75%_60%_at_50%_45%,#FFFFFF_0%,#F5F3F0_60%,#EBE7E0_100%)]"
      />

      {/* Subtle architectural dot-matrix graph in soft warm graphite */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35] bg-[radial-gradient(#C5C0B5_1px,transparent_1px)] [background-size:24px_24px]"
      />

      {/* Sticky content presentation layer: stays anchored while the next card section rolls over it */}
      <div className="sticky top-[120px] sm:top-[140px] xl:top-[160px] w-full max-w-3xl mx-auto px-6 sm:px-8 py-10 sm:py-14 flex flex-col items-center text-center">
        {/* Milestone transition badge */}
        <div className="inline-flex items-center gap-2 sm:gap-3 px-3.5 sm:px-4 py-1.5 rounded-full bg-white/95 border border-[#D5D0C5] shadow-[0_2px_10px_rgba(0,0,0,0.04)] text-xs font-sans tracking-wide">
          <div className="inline-flex items-center gap-1.5 font-medium text-[#16171B]">
            <span className="w-5 h-5 rounded-full bg-[#16171B] text-white text-[10px] font-semibold inline-flex items-center justify-center">
              {fromTrackNumber}
            </span>
            <span className="uppercase text-[11px] font-semibold text-[#16171B]/80 tracking-wider">
              {fromTrackTitle}
            </span>
          </div>

          <span className="text-[#B08D57] font-serif italic text-sm px-0.5">
            to
          </span>

          <div className="inline-flex items-center gap-1.5 font-medium text-[#16171B]">
            <span className="w-5 h-5 rounded-full bg-[#B08D57] text-white text-[10px] font-semibold inline-flex items-center justify-center">
              {toTrackNumber}
            </span>
            <span className="uppercase text-[11px] font-semibold text-[#16171B] tracking-wider">
              {toTrackTitle}
            </span>
          </div>
        </div>

        {/* Human editorial headline (Playfair Display serif, natural casing) */}
        <h3 className="mt-5 sm:mt-6 font-serif text-2xl sm:text-3xl md:text-4xl text-[#16171B] font-normal tracking-tight leading-[1.25] max-w-2xl">
          {displayHeadline}
        </h3>

        {/* Narrative editorial subtitle */}
        <p className="mt-3 sm:mt-4 text-sm sm:text-base font-sans text-[#52545A] font-normal leading-relaxed max-w-xl">
          {displaySubtitle}
        </p>

        {/* Visual transition cue */}
        <div className="mt-6 flex flex-col items-center gap-1.5">
          <span className="w-12 h-px bg-gradient-to-r from-transparent via-[#B08D57]/70 to-transparent" />
          <div className="inline-flex items-center gap-1.5 text-[11px] font-sans font-medium uppercase tracking-[0.16em] text-[#8C8E94] mt-1">
            <span>Scroll for Track {toTrackNumber}</span>
            <ArrowRight className="w-3 h-3 text-[#B08D57]" />
          </div>
          <ChevronDown className="w-4 h-4 text-[#B08D57] animate-bounce mt-1 opacity-70" />
        </div>
      </div>
    </div>
  );
}
