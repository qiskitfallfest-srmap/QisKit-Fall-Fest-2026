'use client';

import React from 'react';
import { Calendar, Users, Code, Globe, Award } from 'lucide-react';
import { computeScheduleStats } from '@/data/schedule.utils';
import { SchedulePhase } from '@/data/schedule.types';

interface ScheduleStatsProps {
  currentPhase: SchedulePhase;
}

const iconMap = {
  calendar: Calendar,
  users: Users,
  code: Code,
  globe: Globe,
  award: Award,
};

export function ScheduleStats({ currentPhase }: ScheduleStatsProps) {
  const stats = computeScheduleStats(currentPhase);

  return (
    <section 
      id="schedule-stats"
      className="relative w-full snap-start scroll-mt-[76px] sm:scroll-mt-[84px] bg-[#13090A] text-[#FAF7F3] border-t border-[#6C151E]/30 mb-0 py-5 sm:py-8 lg:py-9 shadow-2xl isolate overflow-hidden"
    >
      {/* Background ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#4A0D14]/40 via-[#13090A] to-[#4A0D14]/40 pointer-events-none" />

      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-6 lg:gap-y-0 lg:divide-x lg:divide-[#6C151E]/35">
          {stats.map((item, idx) => {
            const IconComponent = iconMap[item.icon as keyof typeof iconMap] || Calendar;
            return (
              <div
                key={idx}
                className="group flex flex-col items-center lg:items-start text-center lg:text-left lg:px-8 first:lg:pl-0 last:lg:pr-0 cursor-pointer transition-all duration-300 py-1 last:col-span-2 md:last:col-span-1 lg:last:col-span-1"
              >
                <div className="flex items-center gap-2 mb-2 text-[#BEB5B4] group-hover:text-[#F5DABF] transition-colors duration-300">
                  <div className="p-1.5 rounded-lg bg-[#6C151E]/30 text-[#F5DABF] group-hover:bg-[#6C151E] group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-sm">
                    <IconComponent size={15} />
                  </div>
                  <span className="font-mono text-[10px] sm:text-[11px] font-semibold tracking-[0.16em] uppercase">
                    {item.label}
                  </span>
                </div>
                <div className="font-serif text-xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#FAF7F3] group-hover:text-white group-hover:translate-x-1 transition-all duration-300 mt-0.5 sm:min-h-[60px] flex items-center leading-tight">
                  {item.value}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
