'use client';

import React, { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { Flag, Maximize2, Minimize2, Snowflake, Trophy } from 'lucide-react';
import { QCTF_EVENT, QCTF_STATES } from '@/data/qctf/tracks';
import { useQctfScoreboard } from '@/hooks/use-qctf-scoreboard';

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

/** Projector view for the ALC. Always dark, large type, refreshes every 10 seconds. */
export default function QctfScoreboardPage() {
  const { data: scoreboard, error } = useQctfScoreboard({ refreshMs: 10000 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else containerRef.current?.requestFullscreen().catch(() => {});
  }

  const stateLabel = scoreboard ? QCTF_STATES.find((s) => s.id === scoreboard.state)?.label : null;
  const entries = scoreboard?.entries ?? [];
  const isHidden = scoreboard?.state === 'hidden';

  return (
    <div
      ref={containerRef}
      data-lenis-prevent="true"
      className="min-h-screen bg-[#100405] text-[#FAF6F3] font-sans overflow-y-auto"
      style={{ backgroundImage: 'radial-gradient(ellipse at top, rgba(108,21,30,0.45), transparent 60%)' }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8 lg:py-10 space-y-8">
        <header className="flex flex-wrap items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6C151E]/40 border border-[#6C151E] font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#E89BA5]">
              <Flag className="w-3.5 h-3.5" />
              Qiskit Fall Fest 2026 · SRM University-AP
            </div>
            <h1 className="font-serif text-4xl lg:text-6xl font-bold tracking-tight">Quantum Capture the Flag</h1>
            <p className="text-sm lg:text-base text-slate-300">
              {QCTF_EVENT.venue} · {QCTF_EVENT.windowLabel}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {stateLabel && (
              <span
                className={clsx(
                  'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono text-sm font-bold uppercase tracking-wider',
                  scoreboard?.state === 'live'
                    ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
                    : 'border-amber-500/50 bg-amber-500/15 text-amber-200'
                )}
              >
                {scoreboard?.state === 'live' && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
                {scoreboard?.state === 'frozen' && <Snowflake className="w-4 h-4" />}
                {stateLabel}
              </span>
            )}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-2 rounded-lg border border-[#3D1418] hover:bg-[#1C0A0D] text-slate-300 cursor-pointer"
              aria-label={isFullscreen ? 'Exit full screen' : 'Full screen'}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {scoreboard?.frozenAt && (
          <p className="px-4 py-3 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-100 text-base">
            Standings frozen at {formatTime(scoreboard.frozenAt)}. Final results will be announced at the ceremony.
          </p>
        )}

        {error && !scoreboard ? (
          <p className="text-slate-300">Could not load the scoreboard. Retrying.</p>
        ) : isHidden || entries.length === 0 ? (
          <div className="py-24 text-center space-y-3">
            <Trophy className="w-12 h-12 mx-auto text-[#B08D57]" />
            <p className="font-serif text-3xl font-bold">{isHidden ? 'The arena opens soon' : 'Waiting for the first team'}</p>
            <p className="text-slate-400">The scoreboard updates automatically.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px] gap-8 items-start">
            <ol className="space-y-2">
              {entries.map((entry) => (
                <li
                  key={entry.teamId}
                  className={clsx(
                    'flex items-center gap-4 lg:gap-6 px-4 lg:px-6 py-3 lg:py-4 rounded-xl border',
                    entry.rank === 1
                      ? 'border-[#B08D57] bg-[#B08D57]/15'
                      : entry.rank <= 3
                        ? 'border-[#6C151E] bg-[#6C151E]/25'
                        : 'border-[#3D1418] bg-[#150709]'
                  )}
                >
                  <span
                    className={clsx(
                      'w-10 lg:w-14 text-right font-mono text-2xl lg:text-4xl font-bold',
                      entry.rank === 1 ? 'text-[#E3C48D]' : entry.rank <= 3 ? 'text-[#E89BA5]' : 'text-slate-500'
                    )}
                  >
                    {entry.rank}
                  </span>
                  <span className="flex-1 min-w-0 truncate text-xl lg:text-3xl font-semibold">{entry.teamName}</span>
                  <span className="hidden sm:block font-mono text-sm lg:text-base text-slate-400 shrink-0">
                    {entry.solvedCount} solved
                  </span>
                  <span className="font-mono text-2xl lg:text-4xl font-bold shrink-0 tabular-nums">{entry.points}</span>
                </li>
              ))}
            </ol>

            <aside className="p-5 rounded-xl border border-[#3D1418] bg-[#150709] space-y-4">
              <h2 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Latest solves</h2>
              {scoreboard?.recentSolves.length ? (
                <ul className="space-y-3">
                  {scoreboard.recentSolves.map((solve) => (
                    <li key={`${solve.teamName}-${solve.solvedAt}`} className="space-y-0.5">
                      <p className="text-base font-semibold truncate">{solve.teamName}</p>
                      <p className="text-sm text-slate-400 truncate">
                        {solve.challengeTitle} · <span className="text-[#E3C48D] font-mono">+{solve.points}</span> ·{' '}
                        {formatTime(solve.solvedAt)}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400">No solves yet.</p>
              )}
            </aside>
          </div>
        )}

        {scoreboard && (
          <p className="text-xs text-slate-500 font-mono">Updated {formatTime(scoreboard.generatedAt)}</p>
        )}
      </div>
    </div>
  );
}
