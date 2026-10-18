'use client';

import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { Clock, ShieldCheck, Users, Building2 } from 'lucide-react';

const ANNOUNCEMENT_TARGET_ISO = '2026-10-18T16:00:00+05:30';

function splitRemaining(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

const pad = (n: number) => String(n).padStart(2, '0');

interface Phase1ResultsCountdownProps {
  className?: string;
  resultsPublished?: boolean;
}

export function Phase1ResultsCountdown({ className, resultsPublished = false }: Phase1ResultsCountdownProps) {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const targetMs = new Date(ANNOUNCEMENT_TARGET_ISO).getTime();
  const remainingMs = Math.max(0, targetMs - now);
  const isPast = remainingMs <= 0 || resultsPublished;

  const { hours, minutes, seconds } = splitRemaining(remainingMs);

  const units = mounted && !isPast
    ? [
        { value: pad(hours), unit: 'hrs' },
        { value: pad(minutes), unit: 'min' },
        { value: pad(seconds), unit: 'sec' },
      ]
    : [
        { value: '00', unit: 'hrs' },
        { value: '00', unit: 'min' },
        { value: '00', unit: 'sec' },
      ];

  if (isPast) {
    return (
      <div
        role="status"
        className={clsx(
          'p-5 sm:p-6 rounded-2xl border-2 border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-950/20 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4',
          className
        )}
      >
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                Announcement Live
              </span>
              <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                18 October 2026 · 4:00 PM IST
              </span>
            </div>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-slate-900 dark:text-[#FAF6F3]">
              Phase 1 Finalist Results & Auditorium Desk Allocations
            </h2>
            <p className="font-sans text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Jury evaluations have been published. Exactly 50 teams (25 Internal SRM AP + 25 External Colleges) receive auditorium desk allocations, with 30 teams on standby waiting room. Review your team standing below.
            </p>
          </div>
        </div>

        <div className="px-4 py-2.5 rounded-xl bg-white dark:bg-[#150709] border border-emerald-200 dark:border-emerald-800/60 shadow-2xs text-center shrink-0">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 block">
            Jury Decisions
          </span>
          <span className="font-serif text-sm font-semibold text-slate-800 dark:text-slate-200">
            Published Live
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label="Phase 1 Results Announcement Countdown"
      className={clsx(
        'relative overflow-hidden p-5 sm:p-6 rounded-2xl border-2 border-burgundy/25 dark:border-burgundy/40 bg-linear-to-r from-burgundy/[0.07] via-slate-50 to-white dark:from-[#200A0E] dark:via-[#160709] dark:to-[#120507] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5',
        className
      )}
    >
      <div className="flex items-start gap-4 min-w-0">
        <div className="w-11 h-11 rounded-xl bg-linear-to-br from-burgundy to-burgundy-deep text-white flex items-center justify-center shrink-0 shadow-sm ring-2 ring-burgundy/20 dark:ring-burgundy/40 mt-0.5">
          <Clock className="w-5 h-5 text-white" />
        </div>
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-burgundy/15 dark:bg-burgundy/30 text-burgundy dark:text-[#E89BA5]">
              Announcement Countdown
            </span>
            <span className="font-mono text-[11px] font-semibold text-slate-600 dark:text-slate-400">
              Today at 4:00 PM IST
            </span>
          </div>

          <h2 className="font-serif text-lg sm:text-xl font-bold text-slate-900 dark:text-[#FAF6F3] tracking-tight leading-snug">
            Phase 1 Finalist Results & 50 Auditorium Desks
          </h2>

          <p className="font-sans text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
            Jury evaluation of 129 team submissions is undergoing final review. Exactly <strong>50 finalist teams</strong> (25 SRM University-AP + 25 External Colleges) will be awarded auditorium desks for the on-campus Phase 2 sprint, alongside <strong>30 waiting room slots</strong> (20 Internal + 10 External).
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-0.5 text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-burgundy dark:text-[#E89BA5]" />
              50 Desks (25 Internal / 25 External)
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-burgundy dark:text-[#E89BA5]" />
              30 Waiting Room (20 Internal / 10 External)
            </span>
          </div>
        </div>
      </div>

      <div
        className="flex items-center gap-2 shrink-0 self-start md:self-auto bg-white/80 dark:bg-[#150709]/80 backdrop-blur-xs p-2.5 rounded-xl border border-burgundy/20 dark:border-burgundy/30 shadow-2xs"
        aria-live="off"
        aria-label={`${hours} hours, ${minutes} minutes, ${seconds} seconds until results announcement`}
      >
        {units.map(({ value, unit }, idx) => (
          <React.Fragment key={unit}>
            <div className="min-w-[3.75rem] px-2.5 py-2 rounded-lg bg-slate-50 dark:bg-[#1C0A0D] border border-slate-200 dark:border-[#3D1418] text-center shadow-2xs">
              <span className="block font-mono text-xl sm:text-2xl font-black tabular-nums text-burgundy dark:text-[#FAF6F3] leading-none">
                {value}
              </span>
              <span className="block font-mono text-[9px] uppercase font-bold tracking-widest text-slate-500 dark:text-slate-400 mt-1">
                {unit}
              </span>
            </div>
            {idx < units.length - 1 && (
              <span className="font-mono text-lg font-bold text-burgundy/40 dark:text-burgundy/60 select-none">
                :
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
