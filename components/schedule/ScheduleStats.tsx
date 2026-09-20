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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-0 lg:divide-x lg:divide-[#6C151E]/30">
          {stats.map((item, idx) => {
            const IconComponent = iconMap[item.icon as keyof typeof iconMap] || Calendar;
            return (
              <div
                key={idx}
                className="flex flex-col items-center lg:items-start text-center lg:text-left lg:px-6 first:lg:pl-0 last:lg:pr-0 group last:col-span-2 md:last:col-span-1 lg:last:col-span-1"
              >
                <div className="flex items-center gap-2 mb-1 text-[#6C151E] group-hover:text-[#F5DABF] transition-colors">
                  <div className="p-1.5 rounded-lg bg-[#6C151E]/30 text-[#F5DABF] shadow-sm">
                    <IconComponent size={15} />
                  </div>
                  <span className="font-mono text-[10px] sm:text-[11px] font-semibold tracking-[0.16em] uppercase text-[#BEB5B4]">
                    {item.label}
                  </span>
                </div>
                <div className="font-serif text-xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#FAF7F3] group-hover:text-[#F5DABF] transition-colors mt-0.5 sm:min-h-[70px] flex items-center leading-tight">
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
