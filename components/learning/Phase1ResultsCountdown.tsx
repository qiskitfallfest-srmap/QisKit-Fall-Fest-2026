'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { Clock, CheckCircle2, ArrowRight, Hourglass, CircleMinus } from 'lucide-react';
import {
  PHASE1_RESULTS_ANNOUNCE_ISO,
  PHASE1_RESULTS_ANNOUNCE_LABEL,
  PHASE1_SUBMISSION_COUNT,
  PHASE2_DESK_QUOTA,
  PHASE2_WAITLIST_QUOTA,
} from '@/lib/constants';
import { usePassStatus } from '@/hooks/use-pass-status';

function splitRemaining(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

const pad = (n: number) => String(n).padStart(2, '0');

type ResultState = 'countdown' | 'finalising' | 'finalist' | 'waitlist' | 'not_selected' | 'no_submission' | 'published';

const RESULT_COPY: Record<Exclude<ResultState, 'countdown'>, { title: string; body: string; tone: 'positive' | 'neutral' | 'muted' }> = {
  finalising: {
    title: 'Results are being finalised',
    body: 'The announcement time has passed and the jury is publishing decisions. Team results will appear here shortly.',
    tone: 'neutral',
  },
  finalist: {
    title: 'Your team is a Phase 2 finalist',
    body: 'Your team has an auditorium desk for the on-campus Phase 2 sprint. Confirm your place through the Flagship Pass before the payment window closes.',
    tone: 'positive',
  },
  waitlist: {
    title: 'Your team is on the Phase 2 waitlist',
    body: 'If a finalist team does not confirm its desk, desks are offered to waitlisted teams in rank order. You will be contacted by email if a desk opens.',
    tone: 'neutral',
  },
  not_selected: {
    title: 'Your team was not selected for Phase 2',
    body: 'Thank you for submitting. You can still attend the on-campus festival with a General Pass.',
    tone: 'muted',
  },
  no_submission: {
    title: 'No Phase 1 submission was recorded',
    body: 'Your team did not submit a repository before the deadline. You can still attend the on-campus festival with a General Pass.',
    tone: 'muted',
  },
  published: {
    title: 'Phase 1 results are published',
    body: `Jury decisions for all ${PHASE1_SUBMISSION_COUNT} submissions are out. Team members can see their result in the hackathon workspace.`,
    tone: 'neutral',
  },
};

// Spreads the post-announcement refetch so every open tab does not hit the API in the same second
const MAX_FETCH_JITTER_MS = 20_000;

interface Phase1ResultsCountdownProps {
  className?: string;
  /** `compact` is a single-line notice for overview pages; `full` carries the quota detail. */
  variant?: 'full' | 'compact';
}

export function Phase1ResultsCountdown({ className, variant = 'full' }: Phase1ResultsCountdownProps) {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const targetMs = new Date(PHASE1_RESULTS_ANNOUNCE_ISO).getTime();
  const remainingMs = Math.max(0, targetMs - now);
  const reached = remainingMs <= 0;

  useEffect(() => {
    setMounted(true);
    if (reached) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [reached]);

  // Team result is only requested once the announcement time has passed. Tabs opened after
  // the announcement fetch immediately; tabs that were counting down wait a random delay.
  const [fetchEnabled, setFetchEnabled] = useState(reached);
  useEffect(() => {
    if (!reached || fetchEnabled) return;
    const timer = setTimeout(() => setFetchEnabled(true), Math.random() * MAX_FETCH_JITTER_MS);
    return () => clearTimeout(timer);
  }, [reached, fetchEnabled]);

  const { data } = usePassStatus({ enabled: fetchEnabled });

  const team = data?.hackathon ?? null;
  let state: ResultState = 'countdown';
  if (reached) {
    if (!data) state = 'finalising';
    else if (!team) state = 'published';
    else if (!team.submittedAt) state = 'no_submission';
    else if (!team.resultsPublished) state = 'finalising';
    else if (team.outcome === 'shortlisted') state = 'finalist';
    else if (team.isWaitlisted) state = 'waitlist';
    else state = 'not_selected';
  }

  const { hours, minutes, seconds } = splitRemaining(remainingMs);
  const clock = mounted ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}` : '--:--:--';
  const copy = state === 'countdown' ? null : RESULT_COPY[state];

  const StatusIcon =
    state === 'countdown' ? Clock
    : state === 'finalising' || state === 'waitlist' ? Hourglass
    : copy?.tone === 'muted' ? CircleMinus
    : CheckCircle2;
  const iconColor =
    state === 'countdown' ? 'text-burgundy dark:text-[#E89BA5]'
    : copy?.tone === 'positive' || state === 'published' ? 'text-emerald-600 dark:text-emerald-400'
    : copy?.tone === 'muted' ? 'text-slate-400'
    : 'text-amber-600 dark:text-amber-400';

  if (variant === 'compact') {
    return (
      <div
        role="status"
        className={clsx(
          'flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 px-4 py-3 rounded-lg border border-slate-200 dark:border-[#3D1418] bg-white dark:bg-[#150709]',
          className
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0 text-sm">
          <StatusIcon className={clsx('w-4 h-4 shrink-0', iconColor)} aria-hidden />
          <span className="font-medium text-slate-800 dark:text-slate-200">
            {copy ? copy.title : 'Phase 1 hackathon results'}
          </span>
          {!copy && (
            <span className="hidden sm:inline text-slate-500 dark:text-slate-400">Today, 4:00 PM IST</span>
          )}
        </div>
        <div className="flex items-center gap-4 shrink-0">
          {!copy && (
            <span
              className="font-mono text-sm font-semibold tabular-nums text-slate-900 dark:text-[#FAF6F3]"
              aria-label={mounted ? `${hours} hours, ${minutes} minutes, ${seconds} seconds remaining` : undefined}
            >
              {clock}
            </span>
          )}
          <Link
            href="/learning/hackathon"
            className="inline-flex items-center gap-1 text-sm font-medium text-burgundy dark:text-[#E89BA5] hover:underline"
          >
            {copy ? 'Open workspace' : 'Details'}
            <ArrowRight className="w-3.5 h-3.5" aria-hidden />
          </Link>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Auditorium desks',
      value: PHASE2_DESK_QUOTA.total,
      detail: `${PHASE2_DESK_QUOTA.internal} internal · ${PHASE2_DESK_QUOTA.external} external`,
    },
    {
      label: 'Waitlist',
      value: PHASE2_WAITLIST_QUOTA.total,
      detail: `${PHASE2_WAITLIST_QUOTA.internal} internal · ${PHASE2_WAITLIST_QUOTA.external} external`,
    },
  ];

  return (
    <section
      aria-label="Phase 1 results announcement"
      className={clsx(
        'rounded-xl border border-slate-200 dark:border-[#3D1418] bg-white dark:bg-[#150709]',
        className
      )}
    >
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-5 p-5 sm:p-6">
        <div className="space-y-2 min-w-0">
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className={clsx('inline-flex items-center gap-1.5', iconColor)}>
              <StatusIcon className="w-3.5 h-3.5" aria-hidden />
              {copy ? 'Phase 1 results' : 'Announcement'}
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-500 dark:text-slate-400">{PHASE1_RESULTS_ANNOUNCE_LABEL}</span>
          </div>

          <h2 className="font-serif text-lg sm:text-xl font-semibold text-slate-900 dark:text-[#FAF6F3] leading-snug">
            {copy ? copy.title : 'Phase 1 Finalist Results'}
          </h2>

          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
            {copy
              ? copy.body
              : `The jury is completing its review of ${PHASE1_SUBMISSION_COUNT} submissions. Finalists receive an auditorium desk for the on-campus Phase 2 sprint; waitlisted teams are offered desks in rank order if a finalist does not confirm.`}
          </p>
          {team && copy && state !== 'published' && (
            <p className="text-xs text-slate-500 dark:text-slate-400">Team: {team.teamName}</p>
          )}
        </div>

        {!copy && (
          <div className="shrink-0 md:text-right">
            <span className="block text-xs text-slate-500 dark:text-slate-400">Time remaining</span>
            <span
              className="block font-mono text-2xl sm:text-3xl font-semibold tabular-nums text-slate-900 dark:text-[#FAF6F3] leading-tight"
              aria-label={mounted ? `${hours} hours, ${minutes} minutes, ${seconds} seconds remaining` : undefined}
            >
              {clock}
            </span>
          </div>
        )}
      </div>

      <dl className="grid grid-cols-2 border-t border-slate-200 dark:border-[#3D1418] divide-x divide-slate-200 dark:divide-[#3D1418]">
        {stats.map(({ label, value, detail }) => (
          <div key={label} className="px-5 sm:px-6 py-3">
            <dt className="text-xs text-slate-500 dark:text-slate-400">{label}</dt>
            <dd className="flex items-baseline gap-2">
              <span className="text-lg font-semibold text-slate-900 dark:text-[#FAF6F3] tabular-nums">{value}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">{detail}</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
