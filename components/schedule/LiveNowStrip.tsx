'use client';

import React, { useEffect, useState } from 'react';
import { Clock3, MapPin } from 'lucide-react';
import { getTimedOfflineSessions, isBreak, LANE_LABELS, TimedSession } from '@/data/schedule.utils';

/**
 * Current time for the schedule, ticking every 30 s. Null until mounted so the server
 * render and first client render match. `?now=2026-10-27T11:45` (read as IST) runs the
 * page on a simulated clock for previews.
 */
export function useScheduleNow(): number | null {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    let offset = 0;
    const override = new URLSearchParams(window.location.search).get('now');
    if (override) {
      const parsed = Date.parse(/[zZ]|[+-]\d{2}:?\d{2}$/.test(override) ? override : `${override}+05:30`);
      if (!Number.isNaN(parsed)) offset = parsed - Date.now();
    }
    const tick = () => setNow(Date.now() + offset);
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  return now;
}

function formatGap(ms: number): string {
  const minutes = Math.max(1, Math.round(ms / 60_000));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return minutes % 60 ? `${hours} hr ${minutes % 60} min` : `${hours} hr`;
  const days = Math.floor(hours / 24);
  return hours % 24 ? `${days} day${days > 1 ? 's' : ''} ${hours % 24} hr` : `${days} day${days > 1 ? 's' : ''}`;
}

const laneChip: Record<string, string> = {
  main: 'bg-[#6C151E]/10 text-[#6C151E] dark:bg-[#E45464]/20 dark:text-[#F3A9B1]',
  open: 'bg-emerald-600/10 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300',
  flagship: 'bg-amber-500/15 text-amber-900 dark:bg-amber-400/15 dark:text-amber-200',
};

interface LiveNowStripProps {
  now: number | null;
  onSelect: (dayIndex: number, sessionId: string) => void;
}

export function LiveNowStrip({ now, onSelect }: LiveNowStripProps) {
  if (now === null) return null;

  const all = getTimedOfflineSessions();
  const lastEnd = Math.max(...all.map((t) => t.endMs));
  if (now >= lastEnd) return null;

  const talks = all.filter((t) => !isBreak(t.session));
  // The 24-hour hackathon block would otherwise sit in "now" all night and all of Day 4.
  const live = talks.filter((t) => t.startMs <= now && now < t.endMs && t.endMs - t.startMs <= 8 * 3600_000);
  const liveBreak = all.find((t) => isBreak(t.session) && t.startMs <= now && now < t.endMs);
  const nextStart = talks.find((t) => t.startMs > now)?.startMs;
  const upNext = nextStart ? talks.filter((t) => t.startMs === nextStart) : [];
  const beforeFest = now < all[0].startMs;

  const row = (t: TimedSession, showEnd: boolean) => (
    <li key={t.session.id}>
      <button
        type="button"
        onClick={() => onSelect(t.dayIndex, t.session.id)}
        className="w-full text-left rounded-xl border border-[#D9D0CB] dark:border-white/10 bg-white/80 dark:bg-white/5 px-3.5 py-2.5 hover:border-[#6C151E] dark:hover:border-[#E45464] transition-colors"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${laneChip[t.session.lane || 'main']}`}>
            {LANE_LABELS[t.session.lane || 'main']}
          </span>
          <span className="font-mono text-[11px] text-[#665B57] dark:text-[#BEB5B4]">
            {showEnd
              ? `until ${t.session.end}`
              : t.startMs - now > 12 * 3600_000
                ? `${t.day.weekday}, ${t.session.time}`
                : t.session.time}
          </span>
        </div>
        <div className="mt-1 text-sm font-semibold leading-snug text-[#13090A] dark:text-[#F6F2F1]">{t.session.title}</div>
        <div className="mt-0.5 flex items-center gap-1 text-xs text-[#665B57] dark:text-[#BEB5B4]">
          <MapPin size={12} className="shrink-0" />
          <span className="truncate">{t.session.location}</span>
        </div>
      </button>
    </li>
  );

  if (beforeFest) {
    const first = all[0];
    return (
      <div className="mb-4 sm:mb-6 rounded-2xl border border-[#D9D0CB] dark:border-white/10 bg-white dark:bg-[#1C0709] px-4 py-3.5 sm:px-6 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 text-sm font-semibold text-[#13090A] dark:text-[#F6F2F1]">
          <Clock3 size={16} className="text-[#6C151E] dark:text-[#E45464] shrink-0" />
          <span>
            The festival opens {first.day.weekday}, {first.day.date} at {first.session.time} in the {first.session.location}.
          </span>
        </div>
        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#6C151E] dark:text-[#E45464]">
          Starts in {formatGap(first.startMs - now)}
        </span>
      </div>
    );
  }

  return (
    <div className="mb-4 sm:mb-6 rounded-2xl border border-[#D9D0CB] dark:border-white/10 bg-white dark:bg-[#1C0709] p-4 sm:p-6 grid gap-5 lg:grid-cols-2">
      <section aria-label="Happening now">
        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#13090A] dark:text-[#F6F2F1]">
          <span className="h-2 w-2 rounded-full bg-[#C12E3F]" aria-hidden="true" />
          Happening now
        </h3>
        {live.length > 0 ? (
          <ul className="mt-3 grid gap-2">{live.map((t) => row(t, true))}</ul>
        ) : (
          <p className="mt-3 text-sm text-[#665B57] dark:text-[#BEB5B4]">
            {liveBreak ? `${liveBreak.session.title} until ${liveBreak.session.end}.` : 'Nothing is running right now.'}
          </p>
        )}
      </section>
      <section aria-label="Up next">
        <h3 className="flex items-center justify-between gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#13090A] dark:text-[#F6F2F1]">
          <span>Up next</span>
          {nextStart && (
            <span className="font-mono normal-case tracking-normal text-[#6C151E] dark:text-[#E45464]">
              in {formatGap(nextStart - now)}
            </span>
          )}
        </h3>
        {upNext.length > 0 ? (
          <ul className="mt-3 grid gap-2">{upNext.map((t) => row(t, false))}</ul>
        ) : (
          <p className="mt-3 text-sm text-[#665B57] dark:text-[#BEB5B4]">That was the last session of the festival.</p>
        )}
      </section>
    </div>
  );
}
