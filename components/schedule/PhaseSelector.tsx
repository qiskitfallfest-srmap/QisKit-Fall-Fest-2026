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
          className={`group relative flex items-center gap-1.5 sm:gap-2 overflow-hidden rounded-full px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] whitespace-nowrap cursor-pointer active:scale-[0.96] ${
            currentPhase === 'online'
              ? 'bg-[#6C151E] text-white shadow-md'
              : 'text-[#665B57] hover:text-white dark:text-[#BEB5B4] dark:hover:text-white'
          }`}
        >
          {/* Fluid expanding hover circle for segmented button */}
          {currentPhase !== 'online' && (
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-[#6C151E] dark:bg-[#A7192A] rounded-full opacity-0 pointer-events-none transition-all duration-[2400ms] ease-[cubic-bezier(0.25,1,0.35,1)] group-hover:w-[260px] group-hover:h-[260px] group-hover:opacity-100" />
          )}
          <Monitor size={15} className="relative z-[1]" />
          <span className="relative z-[1] transition-transform duration-300 group-hover:translate-x-0.5">Online Phase</span>
          <span className="relative z-[1] hidden sm:inline text-[11px] opacity-80">(8–10 Oct)</span>
        </button>

        <button
          type="button"
          onClick={() => onPhaseChange('offline')}
          className={`group relative flex items-center gap-1.5 sm:gap-2 overflow-hidden rounded-full px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] whitespace-nowrap cursor-pointer active:scale-[0.96] ${
            currentPhase === 'offline'
              ? 'bg-[#6C151E] text-white shadow-md'
              : 'text-[#665B57] hover:text-white dark:text-[#BEB5B4] dark:hover:text-white'
          }`}
        >
          {/* Fluid expanding hover circle for segmented button */}
          {currentPhase !== 'offline' && (
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-[#6C151E] dark:bg-[#A7192A] rounded-full opacity-0 pointer-events-none transition-all duration-[2400ms] ease-[cubic-bezier(0.25,1,0.35,1)] group-hover:w-[260px] group-hover:h-[260px] group-hover:opacity-100" />
          )}
          <MapPin size={15} className="relative z-[1]" />
          <span className="relative z-[1] transition-transform duration-300 group-hover:translate-x-0.5">Offline Phase</span>
          <span className="relative z-[1] hidden sm:inline text-[11px] opacity-80">(26–30 Oct)</span>
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
        className={`group relative flex items-center justify-between p-4 sm:p-5 rounded-2xl border text-left cursor-pointer overflow-hidden transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] ${
          currentPhase === 'online'
            ? 'border-[#6C151E] bg-gradient-to-br from-[#6C151E] to-[#4A0D14] text-white shadow-xl scale-[1.02]'
            : 'border-[rgba(108,21,30,0.16)] bg-white/70 hover:bg-white dark:bg-white/5 dark:hover:bg-white/10 text-[#261F1D] dark:text-[#E8E0DE] hover:border-[#6C151E]/40'
        }`}
      >
        {/* Fluid Expanding Hover Circle */}
        <span
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full opacity-0 pointer-events-none transition-all duration-[2600ms] ease-[cubic-bezier(0.25,1,0.35,1)] group-hover:w-[750px] group-hover:h-[750px] group-hover:opacity-100 ${
            currentPhase === 'online'
              ? 'bg-[#3A0B10]'
              : 'bg-[#6C151E] dark:bg-[#A7192A]'
          }`}
        />

        <div className="relative z-[1] flex items-start gap-3.5">
          <div
            className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
              currentPhase === 'online'
                ? 'bg-white/15 text-white group-hover:bg-white/25'
                : 'bg-[#6C151E]/10 text-[#6C151E] dark:bg-white/10 dark:text-[#F5DABF] group-hover:bg-white/20 group-hover:text-white'
            }`}
          >
            <Monitor size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold tracking-wide uppercase transition-colors duration-300 ${
                currentPhase === 'online' ? 'text-white' : 'group-hover:text-white'
              }`}>
                Online Phase
              </span>
              {currentPhase === 'online' && (
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                  Active
                </span>
              )}
            </div>
            <p
              className={`mt-0.5 text-xs font-semibold transition-colors duration-300 ${
                currentPhase === 'online'
                  ? 'text-[#F5DABF]'
                  : 'text-[#6C151E] dark:text-[#D9A75D] group-hover:text-[#F5DABF]'
              }`}
            >
              8 – 10 October 2026
            </p>
            <p
              className={`mt-1 text-xs leading-relaxed transition-colors duration-300 ${
                currentPhase === 'online'
                  ? 'text-white/80'
                  : 'text-[#665B57] dark:text-[#BEB5B4] group-hover:text-white/90'
              }`}
            >
              Virtual foundations &amp; global access.
            </p>
          </div>
        </div>

        {/* Dynamic Dual-Arrow Circle Action Button */}
        <div
          className={`relative z-[1] flex h-9 w-9 shrink-0 items-center justify-center rounded-full overflow-hidden transition-all duration-500 ${
            currentPhase === 'online'
              ? 'bg-white/20 text-white group-hover:bg-white group-hover:text-[#6C151E]'
              : 'border border-[#6C151E]/20 text-[#6C151E] dark:border-white/20 dark:text-white group-hover:border-white group-hover:bg-white group-hover:text-[#6C151E]'
          }`}
        >
          {/* Left Arrow (arr-2) - slides in from offscreen on hover */}
          <ArrowRight
            size={15}
            className="absolute left-[-60%] z-10 opacity-0 group-hover:left-1/2 group-hover:-translate-x-1/2 group-hover:opacity-100 transition-all duration-[700ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          />
          {/* Right Arrow (arr-1) - slides out to right on hover */}
          <ArrowRight
            size={15}
            className="absolute left-1/2 -translate-x-1/2 z-10 group-hover:left-[160%] group-hover:opacity-0 transition-all duration-[700ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          />
        </div>
      </button>

      {/* Offline Phase Card */}
      <button
        type="button"
        onClick={() => onPhaseChange('offline')}
        className={`group relative flex items-center justify-between p-4 sm:p-5 rounded-2xl border text-left cursor-pointer overflow-hidden transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] ${
          currentPhase === 'offline'
            ? 'border-[#6C151E] bg-gradient-to-br from-[#6C151E] to-[#4A0D14] text-white shadow-xl scale-[1.02]'
            : 'border-[rgba(108,21,30,0.16)] bg-white/70 hover:bg-white dark:bg-white/5 dark:hover:bg-white/10 text-[#261F1D] dark:text-[#E8E0DE] hover:border-[#6C151E]/40'
        }`}
      >
        {/* Fluid Expanding Hover Circle */}
        <span
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full opacity-0 pointer-events-none transition-all duration-[2600ms] ease-[cubic-bezier(0.25,1,0.35,1)] group-hover:w-[750px] group-hover:h-[750px] group-hover:opacity-100 ${
            currentPhase === 'offline'
              ? 'bg-[#3A0B10]'
              : 'bg-[#6C151E] dark:bg-[#A7192A]'
          }`}
        />

        <div className="relative z-[1] flex items-start gap-3.5">
          <div
            className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
              currentPhase === 'offline'
                ? 'bg-white/15 text-white group-hover:bg-white/25'
                : 'bg-[#6C151E]/10 text-[#6C151E] dark:bg-white/10 dark:text-[#F5DABF] group-hover:bg-white/20 group-hover:text-white'
            }`}
          >
            <MapPin size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold tracking-wide uppercase transition-colors duration-300 ${
                currentPhase === 'offline' ? 'text-white' : 'group-hover:text-white'
              }`}>
                Offline Phase
              </span>
              {currentPhase === 'offline' && (
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                  Active
                </span>
              )}
            </div>
            <p
              className={`mt-0.5 text-xs font-semibold transition-colors duration-300 ${
                currentPhase === 'offline'
                  ? 'text-[#F5DABF]'
                  : 'text-[#6C151E] dark:text-[#D9A75D] group-hover:text-[#F5DABF]'
              }`}
            >
              26 – 30 October 2026
            </p>
            <p
              className={`mt-1 text-xs leading-relaxed transition-colors duration-300 ${
                currentPhase === 'offline'
                  ? 'text-white/80'
                  : 'text-[#665B57] dark:text-[#BEB5B4] group-hover:text-white/90'
              }`}
            >
              SRM University-AP. Real-world impact.
            </p>
          </div>
        </div>

        {/* Dynamic Dual-Arrow Circle Action Button */}
        <div
          className={`relative z-[1] flex h-9 w-9 shrink-0 items-center justify-center rounded-full overflow-hidden transition-all duration-500 ${
            currentPhase === 'offline'
              ? 'bg-white/20 text-white group-hover:bg-white group-hover:text-[#6C151E]'
              : 'border border-[#6C151E]/20 text-[#6C151E] dark:border-white/20 dark:text-white group-hover:border-white group-hover:bg-white group-hover:text-[#6C151E]'
          }`}
        >
          {/* Left Arrow (arr-2) - slides in from offscreen on hover */}
          <ArrowRight
            size={15}
            className="absolute left-[-60%] z-10 opacity-0 group-hover:left-1/2 group-hover:-translate-x-1/2 group-hover:opacity-100 transition-all duration-[700ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          />
          {/* Right Arrow (arr-1) - slides out to right on hover */}
          <ArrowRight
            size={15}
            className="absolute left-1/2 -translate-x-1/2 z-10 group-hover:left-[160%] group-hover:opacity-0 transition-all duration-[700ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          />
        </div>
      </button>
    </div>
  );
}
