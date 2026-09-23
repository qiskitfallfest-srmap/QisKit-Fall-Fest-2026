'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function PlanVisitCTA() {
  return (
    <section
      id="plan-your-visit"
      aria-labelledby="plan-visit-heading"
      className="
        relative isolate w-full overflow-hidden
        border-t border-[rgba(22,23,27,0.15)] dark:border-[rgba(245,243,240,0.15)]
        bg-[linear-gradient(100deg,#521018_0%,#3A0B10_50%,#160608_100%)]
        text-[#F5F3F0]
        py-12 sm:py-16
        transition-colors duration-300
      "
    >
      {/* Background Decorative Ambient Nebula */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0 -z-10
          bg-[radial-gradient(ellipse_60%_80%_at_75%_50%,rgba(176,141,87,0.15),transparent_70%)]
        "
      />

      <div className="w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Left: Heading & Subtitle */}
        <div className="space-y-2 max-w-xl text-center lg:text-left">
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-[#B08D57]">
            PLAN YOUR VISIT
          </span>
          <h2
            id="plan-visit-heading"
            className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-white tracking-tight leading-snug"
          >
            Be Part of Something Bigger.
          </h2>
          <p className="text-xs sm:text-sm text-[#F5F3F0]/80 font-sans leading-relaxed">
            Explore the venues. Plan your schedule. Join a global quantum community.
          </p>
        </div>

        {/* Center / Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 shrink-0 w-full sm:w-auto">
          <Link
            href="/schedule"
            className="
              w-full sm:w-auto inline-flex items-center justify-center gap-2
              px-6 py-3 rounded-full font-sans text-xs font-semibold
              bg-white text-[#16171B] hover:bg-stone-100 active:scale-[0.98]
              shadow-md transition-all duration-200
            "
          >
            <span>View Schedule</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <a
            href="https://unstop.com/college-fests/qiskit-fall-fest-srmap-2026-srm-university-amaravati-515345"
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="cta"
            aria-label="Register Now on Unstop"
            className="
              w-full sm:w-auto inline-flex items-center justify-center gap-2
              px-7 py-3 rounded-full font-sans text-xs font-semibold tracking-wide
              bg-[#6C151E] text-white border border-[#B08D57]/40
              hover:bg-[#851D28] active:scale-[0.98]
              shadow-lg shadow-black/30 transition-all duration-200
            "
          >
            <span>Register on Unstop</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
