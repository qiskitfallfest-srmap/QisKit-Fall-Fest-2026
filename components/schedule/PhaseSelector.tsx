'use client';

import React from 'react';
import { Monitor, MapPin, ArrowRight } from 'lucide-react';
import { SchedulePhase } from '@/data/schedule.types';

interface PhaseSelectorProps {
  currentPhase: SchedulePhase;
  onPhaseChange: (phase: SchedulePhase) => void;
  variant?: 'cards' | 'segmented';
}

export function PhaseSelector({ currentPhase, onPhaseChange, variant = 'cards' }: PhaseSelectorProps) {
  if (variant === 'segmented') {
    return (
      <div className="inline-flex max-w-full items-center overflow-x-auto rounded-full border border-[rgba(108,21,30,0.2)] bg-white/40 p-1 sm:p-1.5 backdrop-blur-md dark:bg-black/40 dark:border-white/10 shadow-sm scrollbar-none">
        <button
          type="button"
          onClick={() => onPhaseChange('online')}
          className={`flex items-center gap-1.5 sm:gap-2 rounded-full px-3 sm:px-5 py-1.5 sm:py-2.5 text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
            currentPhase === 'online'
              ? 'bg-[#6C151E] text-white shadow-md'
              : 'text-[#665B57] hover:text-[#6C151E] dark:text-[#BEB5B4] dark:hover:text-white'
          }`}
        >
          <Monitor size={15} />
          <span>Online Phase</span>
          <span className="hidden sm:inline text-[11px] opacity-80">(5–9 Oct)</span>
        </button>

        <button
          type="button"
          onClick={() => onPhaseChange('offline')}
          className={`flex items-center gap-1.5 sm:gap-2 rounded-full px-3 sm:px-5 py-1.5 sm:py-2.5 text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
            currentPhase === 'offline'
              ? 'bg-[#6C151E] text-white shadow-md'
              : 'text-[#665B57] hover:text-[#6C151E] dark:text-[#BEB5B4] dark:hover:text-white'
          }`}
        >
          <MapPin size={15} />
          <span>Offline Phase</span>
          <span className="hidden sm:inline text-[11px] opacity-80">(26–30 Oct)</span>
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-[620px]">
      {/* Online Phase Card */}
      <button
        type="button"
        onClick={() => onPhaseChange('online')}
        className={`group relative flex items-center justify-between p-4 sm:p-5 rounded-2xl border text-left cursor-pointer ${
          currentPhase === 'online'
            ? 'border-[#6C151E] bg-gradient-to-br from-[#6C151E] to-[#4A0D14] text-white shadow-xl scale-[1.02]'
            : 'border-[rgba(108,21,30,0.16)] bg-white/70 hover:bg-white dark:bg-white/5 dark:hover:bg-white/10 text-[#261F1D] dark:text-[#E8E0DE]'
        }`}
      >
        <div className="flex items-start gap-3.5">
          <div
            className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              currentPhase === 'online'
                ? 'bg-white/15 text-white'
                : 'bg-[#6C151E]/10 text-[#6C151E] dark:bg-white/10 dark:text-[#F5DABF]'
            }`}
          >
            <Monitor size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-wide uppercase">Online Phase</span>
              {currentPhase === 'online' && (
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold text-white">
                  Active
                </span>
              )}
            </div>
            <p
              className={`mt-0.5 text-xs font-semibold ${
                currentPhase === 'online' ? 'text-[#F5DABF]' : 'text-[#6C151E] dark:text-[#D9A75D]'
              }`}
            >
              5 – 9 October 2026
            </p>
            <p
              className={`mt-1 text-xs leading-relaxed ${
                currentPhase === 'online' ? 'text-white/80' : 'text-[#665B57] dark:text-[#BEB5B4]'
              }`}
            >
              Virtual foundations &amp; global access.
            </p>
          </div>
        </div>
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform duration-200 group-hover:translate-x-1 ${
            currentPhase === 'online'
              ? 'bg-white/20 text-white'
              : 'border border-[#6C151E]/20 text-[#6C151E] dark:border-white/20 dark:text-white'
          }`}
        >
          <ArrowRight size={14} />
        </div>
      </button>

      {/* Offline Phase Card */}
      <button
        type="button"
        onClick={() => onPhaseChange('offline')}
        className={`group relative flex items-center justify-between p-4 sm:p-5 rounded-2xl border text-left cursor-pointer ${
          currentPhase === 'offline'
            ? 'border-[#6C151E] bg-gradient-to-br from-[#6C151E] to-[#4A0D14] text-white shadow-xl scale-[1.02]'
            : 'border-[rgba(108,21,30,0.16)] bg-white/70 hover:bg-white dark:bg-white/5 dark:hover:bg-white/10 text-[#261F1D] dark:text-[#E8E0DE]'
        }`}
      >
        <div className="flex items-start gap-3.5">
          <div
            className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
              currentPhase === 'offline'
                ? 'bg-white/15 text-white'
                : 'bg-[#6C151E]/10 text-[#6C151E] dark:bg-white/10 dark:text-[#F5DABF]'
            }`}
          >
            <MapPin size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-wide uppercase">Offline Phase</span>
              {currentPhase === 'offline' && (
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold text-white">
                  Active
                </span>
              )}
            </div>
            <p
              className={`mt-0.5 text-xs font-semibold ${
                currentPhase === 'offline' ? 'text-[#F5DABF]' : 'text-[#6C151E] dark:text-[#D9A75D]'
              }`}
            >
              26 – 30 October 2026
            </p>
            <p
              className={`mt-1 text-xs leading-relaxed ${
                currentPhase === 'offline' ? 'text-white/80' : 'text-[#665B57] dark:text-[#BEB5B4]'
              }`}
            >
              SRM University-AP. Real-world impact.
            </p>
          </div>
        </div>
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform duration-200 group-hover:translate-x-1 ${
            currentPhase === 'offline'
              ? 'bg-white/20 text-white'
              : 'border border-[#6C151E]/20 text-[#6C151E] dark:border-white/20 dark:text-white'
          }`}
        >
          <ArrowRight size={14} />
        </div>
      </button>
    </div>
  );
}
