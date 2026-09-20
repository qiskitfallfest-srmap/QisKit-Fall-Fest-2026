'use client';

import * as React from 'react';
import { Landmark, Users, Atom, Network } from 'lucide-react';

export function CampusStatsStrip() {
  const stats = [
    {
      icon: Landmark,
      value: '1',
      label: 'Campus',
    },
    {
      icon: Users,
      value: '5+',
      label: 'Key Venues',
    },
    {
      icon: Atom,
      value: '100+',
      label: 'Sessions Across Campus',
    },
    {
      icon: Network,
      value: 'A Connected',
      label: 'Experience',
    },
  ];

  return (
    <section
      id="campus-stats-strip"
      aria-label="Campus Atlas Statistics"
      className="
        relative isolate w-full
        border-y border-[rgba(108,21,30,0.15)] dark:border-[rgba(176,141,87,0.2)]
        bg-[#ECE8E1] dark:bg-[#180A0D]
        text-[#16171B] dark:text-[#F5F3F0]
        py-6 sm:py-7
        transition-colors duration-300
      "
    >
      <div className="w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* 4 Stats Items */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-10 w-full lg:w-auto flex-1">
          {stats.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-3.5 sm:gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-[#6C151E]/10 dark:bg-[#6C151E]/30 border border-[#6C151E]/20 dark:border-[#B08D57]/30 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-[#6C151E] dark:text-[#B08D57]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-serif text-xl sm:text-2xl font-bold text-[#16171B] dark:text-[#F5F3F0] leading-none">
                    {item.value}
                  </span>
                  <span className="font-mono text-xs text-[#16171B]/70 dark:text-[#F5F3F0]/70 mt-1 uppercase tracking-wider">
                    {item.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Accent Slogan */}
        <div className="hidden xl:flex flex-col text-right font-mono text-[11px] uppercase tracking-widest text-[#6C151E]/70 dark:text-[#B08D57]/80 pl-6 border-l border-stone-300 dark:border-stone-800">
          <span>SAME IDEAS.</span>
          <span className="font-semibold text-[#6C151E] dark:text-[#B08D57]">BRIGHTER HORIZONS.</span>
        </div>
      </div>
    </section>
  );
}
