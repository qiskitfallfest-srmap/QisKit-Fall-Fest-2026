'use client';

import * as React from 'react';
import { InteractiveCampusMap } from './InteractiveCampusMap';

export function CampusAtlasSection() {
  return (
    <section
      id="interactive-atlas"
      aria-label="Interactive Campus Atlas"
      className="
        relative isolate w-full
        bg-[#F7F5F0] dark:bg-[#120709]
        py-10 sm:py-14 lg:py-16
        transition-colors duration-300
      "
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 space-y-6 sm:space-y-8">
        {/* Section Header */}
        <div className="space-y-2 max-w-2xl">
          <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#6C151E] dark:text-[#B08D57]">
            CAMPUS ATLAS
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#16171B] dark:text-[#F5F3F0] tracking-tight">
            Navigate the Fest.
          </h2>
          <p className="text-sm sm:text-base text-[#16171B]/75 dark:text-[#F5F3F0]/75 font-sans leading-relaxed">
            Click on any building to view its details, key facilities, and fest sessions.
          </p>
        </div>

        {/* Full-Width Interactive Vector Map (Cards on right removed per user request) */}
        <div className="w-full">
          <InteractiveCampusMap />
        </div>
      </div>
    </section>
  );
}
