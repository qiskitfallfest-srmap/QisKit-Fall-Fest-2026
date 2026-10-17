'use client';

import clsx from 'clsx';
import { Clock, Lock } from 'lucide-react';
import { ONLINE_SUBMISSIONS_CLOSE_LABEL } from '@/lib/constants';
import type { SubmissionDeadlineState } from '@/hooks/use-submission-deadline';

const HOUR_MS = 60 * 60 * 1000;

function splitRemaining(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

const pad = (n: number) => String(n).padStart(2, '0');

interface SubmissionCountdownProps {
  deadline: SubmissionDeadlineState;
  /** What is closing, e.g. "Essay submissions" or "Phase 1 submissions". */
  label: string;
  /** Shown under the heading once the window has closed. */
  closedDetail?: string;
  className?: string;
}

export function SubmissionCountdown({ deadline, label, closedDetail, className }: SubmissionCountdownProps) {
  const { ready, closed, remainingMs } = deadline;

  if (ready && closed) {
    return (
      <div
        role="status"
        className={clsx(
          'p-4 sm:p-5 rounded-xl border border-slate-300 dark:border-[#4A181E] bg-slate-100 dark:bg-[#1C0A0D] flex items-start gap-3',
          className
        )}
      >
        <Lock className="w-5 h-5 shrink-0 mt-0.5 text-slate-600 dark:text-slate-300" />
        <div>
          <p className="font-semibold text-sm sm:text-base text-slate-900 dark:text-[#FAF6F3] leading-snug">
            {label} are closed
          </p>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
            {closedDetail ?? `The window closed on ${ONLINE_SUBMISSIONS_CLOSE_LABEL}. Recorded entries have been sent for evaluation.`}
          </p>
        </div>
      </div>
    );
  }

  const { hours, minutes, seconds } = splitRemaining(remainingMs);
  const urgent = ready && remainingMs < HOUR_MS;
  const units = ready
    ? [
        { value: pad(hours), unit: 'hrs' },
        { value: pad(minutes), unit: 'min' },
        { value: pad(seconds), unit: 'sec' },
      ]
    : [
        { value: '--', unit: 'hrs' },
        { value: '--', unit: 'min' },
        { value: '--', unit: 'sec' },
      ];

  return (
    <div
      className={clsx(
        'p-4 sm:p-5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3.5',
        urgent
          ? 'border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40'
          : 'border-amber-300/80 dark:border-amber-800/80 bg-amber-50/90 dark:bg-amber-950/40',
        className
      )}
    >
      <div className="flex items-start gap-3 min-w-0">
        <Clock
          className={clsx(
            'w-5 h-5 shrink-0 mt-0.5',
            urgent ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'
          )}
        />
        <div>
          <p
            className={clsx(
              'font-semibold text-sm sm:text-base leading-snug',
              urgent ? 'text-rose-950 dark:text-rose-200' : 'text-amber-950 dark:text-amber-200'
            )}
          >
            {ready && remainingMs < 24 * HOUR_MS ? `${label} close tonight` : `${label} are open`}
          </p>
          <p
            className={clsx(
              'text-xs sm:text-sm mt-1 leading-relaxed',
              urgent ? 'text-rose-900/90 dark:text-rose-300/90' : 'text-amber-900/90 dark:text-amber-300/90'
            )}
          >
            Deadline: {ONLINE_SUBMISSIONS_CLOSE_LABEL}. Entries are locked after this time.
          </p>
        </div>
      </div>

      <div
        className="flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
        aria-label={ready ? `${hours} hours ${minutes} minutes ${seconds} seconds remaining` : undefined}
        aria-live="off"
      >
        {units.map(({ value, unit }) => (
          <div
            key={unit}
            className="min-w-[3.25rem] px-2 py-1.5 rounded-lg bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] text-center"
          >
            <span className="block font-mono text-lg font-bold tabular-nums text-slate-900 dark:text-[#FAF6F3] leading-none">
              {value}
            </span>
            <span className="block font-mono text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">
              {unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
