'use client';

import * as React from 'react';
import { Car, MapPin, Accessibility, Utensils, ArrowRight } from 'lucide-react';

export function GettingAroundSection() {
  const cards = [
    {
      icon: Car,
      title: 'Parking',
      description: 'Designated parking zones across campus near Gate 3 and sports grounds.',
    },
    {
      icon: MapPin,
      title: 'Entry & Registration',
      description: 'Main entry points and check-in desks at Gate 3 with security badge distribution.',
    },
    {
      icon: Accessibility,
      title: 'Accessibility',
      description: 'Wheelchair-accessible ramps, elevators, and wide corridors across all academic blocks.',
    },
    {
      icon: Utensils,
      title: 'Food & Amenities',
      description: 'Campus cafeterias, multi-cuisine food courts, water stations, and attendee rest lounges.',
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
        py-12 sm:py-16 lg:py-20
        transition-colors duration-300
      "
    >
      <div className="w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 space-y-8">
        {/* Section Header */}
        <div className="space-y-2">
          <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#6C151E] dark:text-[#B08D57]">
            GETTING AROUND
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#16171B] dark:text-[#F5F3F0] tracking-tight">
            Before You Arrive.
          </h2>
          <p className="text-sm text-[#16171B]/75 dark:text-[#F5F3F0]/75 font-sans max-w-xl leading-relaxed">
            Everything you need for a smooth and comfortable experience at SRM University-AP.
          </p>
        </div>

        {/* 4 Logistics Cards in a Row / Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="
                  group rounded-xl p-5 sm:p-6
                  border border-stone-200 dark:border-[rgba(108,21,30,0.25)]
                  bg-white dark:bg-[#1A0C0F]
                  hover:border-[#6C151E] dark:hover:border-[#B08D57]
                  hover:shadow-lg transition-all duration-300
                  flex flex-col justify-between space-y-4
                "
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-[#6C151E]/10 dark:bg-[#6C151E]/30 border border-[#6C151E]/20 dark:border-[#B08D57]/30 flex items-center justify-center text-[#6C151E] dark:text-[#B08D57]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#16171B] dark:text-[#F5F3F0]">
                    {card.title}
                  </h3>
                  <p className="text-xs font-sans text-stone-600 dark:text-stone-400 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs font-semibold text-[#6C151E] dark:text-[#B08D57]">
                  <span>Guidelines</span>
                  <span className="w-6 h-6 rounded-full bg-[#6C151E]/10 dark:bg-[#B08D57]/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
