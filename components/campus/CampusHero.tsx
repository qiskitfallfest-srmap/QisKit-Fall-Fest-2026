'use client';

import * as React from 'react';
import Image from 'next/image';
import { Map, Compass, ArrowRight } from 'lucide-react';

export function CampusHero() {
  const handleScrollToAtlas = (e: React.MouseEvent) => {
    e.preventDefault();
    const atlasSection = document.getElementById('interactive-atlas');
    if (atlasSection) {
      atlasSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToGuidelines = (e: React.MouseEvent) => {
    e.preventDefault();
    const gettingAround = document.getElementById('getting-around');
    if (gettingAround) {
      gettingAround.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      id="campus-hero"
      aria-label="Campus Hero"
      className="
        relative isolate w-full overflow-hidden
        pt-6 sm:pt-8 lg:pt-10 pb-8 sm:pb-12 lg:pb-14
        bg-[#F5F3F0] dark:bg-[#120709]
        transition-colors duration-300
      "
    >
      {/* Cinematic Hero Background Image */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 select-none overflow-hidden"
      >
        <Image
          src="/images/venues/hero-1.png"
          alt="SRM University-AP Campus Aerial Overview"
          fill
          priority
          sizes="100vw"
          className="
            object-cover object-[center_35%]
            opacity-75 dark:opacity-35
            scale-105 transition-transform duration-1000 ease-out
          "
        />

        {/* Soft Vignette Gradients ensuring text readability while background stays clearly visible */}
        <div
          className="
            absolute inset-0
            bg-gradient-to-r from-[#F5F3F0]/90 via-[#F5F3F0]/45 to-transparent
            dark:from-[#120709]/95 dark:via-[#120709]/60 dark:to-transparent
          "
        />
        <div
          className="
            absolute inset-0
            bg-gradient-to-t from-[#F5F3F0] via-transparent to-transparent
            dark:from-[#120709] dark:via-transparent to-transparent
          "
        />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="max-w-3xl space-y-5 sm:space-y-6">
            {/* Eyebrow */}
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-[#6C151E] dark:text-[#B08D57]">
                VENUES
              </span>
              <div className="w-12 h-px bg-[#6C151E]/40 dark:bg-[#B08D57]/40" />
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold tracking-tight text-[#16171B] dark:text-[#F5F3F0] leading-[1.08]">
              Explore Our <br />
              <span className="italic text-[#6C151E] dark:text-[#B08D57]">
                Campus.
              </span>
            </h1>

            {/* Description Subtitle */}
            <p className="text-sm sm:text-base text-[#16171B]/80 dark:text-[#F5F3F0]/80 font-sans max-w-xl leading-relaxed">
              Qiskit Fall Fest 2026 will be hosted at the beautiful SRM University-AP,
              Amaravati. Discover key locations and plan your visit.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <a
                href="#interactive-atlas"
                onClick={handleScrollToAtlas}
                className="
                  inline-flex items-center gap-3
                  px-6 py-3 rounded-full font-sans text-sm font-semibold tracking-wide
                  bg-[#6C151E] text-[#F5F3F0]
                  hover:bg-[#521018] active:scale-[0.98]
                  dark:bg-[#6C151E] dark:text-white dark:hover:bg-[#851D28]
                  shadow-lg shadow-[#6C151E]/20 transition-all duration-200 cursor-pointer
                "
              >
                <Map className="w-4 h-4" />
                <span>Explore Map</span>
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  <ArrowRight className="w-3 h-3" />
                </span>
              </a>

              <a
                href="#getting-around"
                onClick={handleScrollToGuidelines}
                className="
                  inline-flex items-center gap-3
                  px-6 py-3 rounded-full font-sans text-sm font-semibold tracking-wide
                  border border-stone-300 dark:border-stone-700
                  bg-white/70 dark:bg-[#1E1416]/60
                  text-[#16171B] dark:text-[#F5F3F0]
                  hover:bg-stone-100 dark:hover:bg-white/10 active:scale-[0.98]
                  shadow-sm transition-all duration-200 cursor-pointer
                "
              >
                <Compass className="w-4 h-4" />
                <span>Before You Arrive</span>
                <span className="w-5 h-5 rounded-full bg-stone-200 dark:bg-white/10 flex items-center justify-center">
                  <ArrowRight className="w-3 h-3" />
                </span>
              </a>
            </div>
          </div>
        </div>
      </header>
  );
}
