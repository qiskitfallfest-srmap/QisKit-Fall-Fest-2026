'use client';

import React, { useState } from 'react';
import clsx from 'clsx';
import { PHASE1_RESULTS_ANNOUNCE_ISO } from '@/lib/constants';

/** Phase 1 results are public; read once per mount so render stays pure */
export function useResultsOut(): boolean {
  const [out] = useState(() => Date.now() >= Date.parse(PHASE1_RESULTS_ANNOUNCE_ISO));
  return out;
}

export type Tone = 'success' | 'warning' | 'danger' | 'neutral' | 'info';

const PILL_TONE: Record<Tone, string> = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/70',
  warning: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/70',
  danger: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/70',
  neutral: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-[#1C0A0D] dark:text-slate-300 dark:border-[#3D1418]',
  info: 'bg-burgundy/10 text-burgundy border-burgundy/20 dark:bg-burgundy/20 dark:text-[#E89BA5] dark:border-burgundy/40',
};

export function StatusPill({ tone, children, className }: { tone: Tone; children: React.ReactNode; className?: string }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 shrink-0 rounded-md border px-2 py-0.5 text-[11px] font-semibold leading-5 whitespace-nowrap',
        PILL_TONE[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function Card({
  title,
  description,
  action,
  children,
  className,
  id,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={clsx(
        'rounded-xl border border-slate-200 dark:border-[#3D1418] bg-white dark:bg-[#150709] shadow-xs scroll-mt-40',
        className
      )}
    >
      {(title || action) && (
        <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 px-4 sm:px-5 pt-4 sm:pt-5">
          <div className="min-w-0">
            {title && <h2 className="text-base font-semibold text-slate-900 dark:text-[#FAF6F3] leading-snug">{title}</h2>}
            {description && (
              <p className="mt-0.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
            )}
          </div>
          {action}
        </header>
      )}
      <div className="px-4 sm:px-5 py-4 sm:py-5">{children}</div>
    </section>
  );
}

export function EmptyState({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center text-center gap-2 py-6 px-4">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-[#1C0A0D] text-slate-400">
        <Icon className="h-5 w-5" />
      </span>
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{title}</p>
      {children && <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">{children}</div>}
    </div>
  );
}

export function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-4 py-2.5">
      <dt className="sm:w-40 shrink-0 text-xs font-medium text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="min-w-0 text-sm text-slate-900 dark:text-[#FAF6F3] break-words">{children}</dd>
    </div>
  );
}

export function ProgressBar({ value, max, tone = 'info' }: { value: number; max: number; tone?: 'info' | 'success' }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-[#250D11] overflow-hidden"
    >
      <div
        className={clsx(
          'h-full rounded-full transition-[width] duration-500',
          tone === 'success' ? 'bg-emerald-500' : 'bg-burgundy dark:bg-[#E89BA5]'
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

const linkBase =
  'inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-xs sm:text-sm font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 disabled:opacity-60 disabled:cursor-not-allowed';

export const buttonStyles = {
  primary: clsx(linkBase, 'bg-burgundy text-white hover:bg-burgundy-deep shadow-xs'),
  secondary: clsx(
    linkBase,
    'border border-slate-300 dark:border-[#3D1418] text-slate-700 dark:text-slate-200 bg-white dark:bg-transparent hover:bg-slate-50 dark:hover:bg-[#1C0A0D]'
  ),
  ghost: clsx(linkBase, 'px-2 text-burgundy dark:text-[#E89BA5] hover:bg-burgundy/5 dark:hover:bg-burgundy/15'),
};

export function formatIst(iso: string | null | undefined, withTime = true): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    ...(withTime ? { hour: 'numeric', minute: '2-digit' } : { year: 'numeric' }),
  });
}

/** "in 2d 4h", "in 35m", "overdue" */
export function timeLeft(iso: string | null | undefined, now: number = Date.now()): string {
  if (!iso) return '';
  const ms = Date.parse(iso) - now;
  if (Number.isNaN(ms)) return '';
  if (ms <= 0) return 'deadline passed';
  const mins = Math.floor(ms / 60_000);
  const days = Math.floor(mins / 1440);
  const hours = Math.floor((mins % 1440) / 60);
  if (days > 0) return `in ${days}d ${hours}h`;
  if (hours > 0) return `in ${hours}h ${mins % 60}m`;
  return `in ${mins}m`;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return ((parts[0][0] || '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}
