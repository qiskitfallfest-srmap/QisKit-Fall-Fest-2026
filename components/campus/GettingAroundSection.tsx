'use client';

import * as React from 'react';
import { Car, MapPin, Accessibility, Utensils } from 'lucide-react';

export function GettingAroundSection() {
  const cards = [
    {
      icon: MapPin,
      title: 'Gate 3 Arrival',
      tag: 'Check-in Desk',
      description: 'Primary festival entrance and badge distribution counter located at the east perimeter.',
    },
    {
      icon: Car,
      title: 'Parking & Transit',
      tag: 'Free On-Campus',
      description: 'Designated parking for cars and two-wheelers situated adjacent to Gate 3 and the athletics ground.',
    },
    {
      icon: Accessibility,
      title: 'Accessibility',
      tag: 'Universal Access',
      description: 'Wheelchair ramps, tactile pathways, and high-capacity elevators across X-Lab and J.C. Bose.',
    },
    {
      icon: Utensils,
      title: 'Food & Cafeterias',
      tag: 'Concourse & Stalls',
      description: 'Multi-cuisine campus food court, drinking water stations, and attendee coffee kiosks open all day.',
    },
  ];

  return (
    <section
      id="getting-around"
      aria-label="Getting Around"
      className="
        relative isolate w-full
        bg-[#F7F5F0] dark:bg-[#120709]
        border-t border-[rgba(22,23,27,0.08)] dark:border-[rgba(245,243,240,0.08)]
        py-10 sm:py-14 lg:py-18
        transition-colors duration-300
      "
    >
      <div className="w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 space-y-6 sm:space-y-8">
        {/* Section Header */}
        <div className="space-y-2">
          <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#6C151E] dark:text-[#B08D57]">
            CAMPUS LOGISTICS
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#16171B] dark:text-[#F5F3F0] tracking-tight">
            Before You Arrive.
          </h2>
          <p className="text-sm text-[#16171B]/75 dark:text-[#F5F3F0]/75 font-sans max-w-xl leading-relaxed">
            Essential arrival coordinates and accessibility details for a seamless experience at SRM University-AP.
          </p>
        </div>

        {/* 4 Logistics Cards in a Row / Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="
                  group rounded-2xl p-5 sm:p-6
                  border border-stone-200 dark:border-[rgba(108,21,30,0.25)]
                  bg-white dark:bg-[#180A0D]
                  hover:border-[#6C151E] dark:hover:border-[#B08D57]
                  hover:shadow-md transition-all duration-300
                  flex flex-col justify-between space-y-4
                "
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[#6C151E]/10 dark:bg-[#6C151E]/25 border border-[#6C151E]/20 dark:border-[#B08D57]/30 flex items-center justify-center text-[#6C151E] dark:text-[#B08D57]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-mono text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-stone-100 dark:bg-white/5 text-stone-500 dark:text-stone-400">
                      {card.tag}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-[#16171B] dark:text-[#F5F3F0]">
                    {card.title}
                  </h3>

                  <p className="text-xs font-sans text-stone-600 dark:text-stone-400 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
