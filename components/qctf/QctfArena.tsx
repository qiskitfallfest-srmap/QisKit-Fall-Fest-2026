'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import clsx from 'clsx';
import {
  AlertCircle,
  Award,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  Flag,
  Info,
  Layers,
  Loader2,
  Lock,
  MapPin,
  Search,
  Trophy,
  XCircle,
} from 'lucide-react';
import {
  QCTF_DIFFICULTY_LABEL,
  QCTF_EVENT,
  QCTF_TRACKS,
  getQctfBlockLabel,
  type QctfChallengeSummary,
  type QctfDifficulty,
  type QctfTrackId,
} from '@/data/qctf/tracks';
import { useQctfScoreboard } from '@/hooks/use-qctf-scoreboard';
import { DifficultyBadge, QctfBreadcrumbBar, QctfStateBanner, TRACK_ICON } from './qctf-ui';
import { useQctfMe } from './QctfGate';
import { QctfTeamCard } from './QctfTeamCard';

type StatusFilter = 'all' | 'open' | 'solved';
const DIFFICULTIES: ('all' | QctfDifficulty)[] = ['all', 'easy', 'hard', 'advanced'];
const STATUSES: StatusFilter[] = ['all', 'open', 'solved'];

const PILL_BASE =
  'px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold uppercase tracking-wider transition-colors cursor-pointer border';
const PILL_ACTIVE = 'bg-burgundy/10 text-burgundy border-burgundy/30 dark:bg-burgundy/25 dark:text-[#E89BA5] dark:border-burgundy/50';
const PILL_IDLE =
  'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-[#1C0A0D]';

function isTrackId(value: string | null): value is QctfTrackId {
  return QCTF_TRACKS.some((track) => track.id === value);
}

export function QctfArena() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const trackParam = searchParams.get('track');
  const activeTrack: QctfTrackId | 'all' = isTrackId(trackParam) ? trackParam : 'all';
  const { me } = useQctfMe();
  const { data: scoreboard } = useQctfScoreboard();

  const [challenges, setChallenges] = useState<QctfChallengeSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [difficulty, setDifficulty] = useState<'all' | QctfDifficulty>('all');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [query, setQuery] = useState('');

  // Reload when the team changes (joining a team brings its solves) or blocks are released
  const teamId = me.team?.id ?? null;
  const releasedKey = me.releasedBlocks.join(',');
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/qctf/challenges', { cache: 'no-store' });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok || !data.success) setLoadError(data.error || 'Could not load challenges.');
        else {
          setChallenges(data.challenges);
          setLoadError('');
        }
      } catch {
        if (!cancelled) setLoadError('Could not load challenges. Check your connection and refresh.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [teamId, releasedKey]);

  const released = challenges.filter((c) => c.released);
  const totalPoints = released.reduce((sum, c) => sum + c.points, 0);
  const myEntry = scoreboard?.entries.find((entry) => entry.teamId === teamId);

  const visible = challenges.filter((c) => {
    if (activeTrack !== 'all' && c.trackId !== activeTrack) return false;
    if (difficulty !== 'all' && c.difficulty !== difficulty) return false;
    if (status === 'solved' && !c.solved) return false;
    if (status === 'open' && c.solved) return false;
    const q = query.trim().toLowerCase();
    if (q) {
      const haystack = [c.id, c.title, c.summary, ...c.tags].join(' ').toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  function selectTrack(track: QctfTrackId | 'all') {
    const params = new URLSearchParams(searchParams.toString());
    if (track === 'all') params.delete('track');
    else params.set('track', track);
    const qs = params.toString();
    router.replace(qs ? `/learning/qctf?${qs}` : '/learning/qctf', { scroll: false });
  }

  function clearFilters() {
    setDifficulty('all');
    setStatus('all');
    setQuery('');
  }

  const stats = [
    { label: 'Solved', value: `${me.team?.solvedCount ?? 0} / ${released.length}`, icon: CheckCircle2 },
    { label: 'Points', value: `${me.team?.points ?? 0} / ${totalPoints}`, icon: Award },
    {
      label: 'Rank',
      value: myEntry ? `#${myEntry.rank}` : '—',
      hint: scoreboard?.frozenAt ? 'As of the freeze' : myEntry ? `of ${scoreboard?.entries.length} teams` : 'After your first solve',
      icon: Trophy,
    },
    { label: 'Tracks', value: String(QCTF_TRACKS.length), icon: Layers },
  ];

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-[#100405] pb-16 font-sans">
      <QctfBreadcrumbBar backHref="/learning" backLabel="Learning Hub" trail={['Competitions', 'QCTF Arena']} />
      <QctfStateBanner me={me} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 space-y-6">
        {/* Header */}
        <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-burgundy/10 dark:bg-burgundy/25 border border-burgundy/20 dark:border-burgundy/40 text-burgundy dark:text-[#E89BA5] font-mono text-[11px] font-semibold uppercase tracking-wider">
              <Flag className="w-3.5 h-3.5" />
              Flagship · Quantum Capture the Flag
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 dark:text-[#FAF6F3] tracking-tight">
              QCTF Arena
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Solve each challenge on your own machine, then submit the flag you recover. Every correct flag
              scores once for your whole team.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {[
              { icon: CalendarDays, text: QCTF_EVENT.dateLabel },
              { icon: Clock, text: QCTF_EVENT.windowLabel },
              { icon: MapPin, text: QCTF_EVENT.venue },
            ].map(({ icon: Icon, text }) => (
              <span
                key={text}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] text-slate-700 dark:text-slate-200 font-medium"
              >
                <Icon className="w-3.5 h-3.5 text-burgundy dark:text-[#E89BA5]" />
                {text}
              </span>
            ))}
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map(({ label, value, hint, icon: Icon }) => (
            <div
              key={label}
              className="p-4 rounded-xl bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] shadow-xs"
            >
              <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
                <Icon className="w-3.5 h-3.5 text-burgundy dark:text-[#E89BA5]" />
                {label}
              </div>
              <div className="mt-1.5 font-mono text-xl font-bold text-slate-900 dark:text-[#FAF6F3]">{value}</div>
              {hint && <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{hint}</div>}
            </div>
          ))}
        </div>

        {/* Tracks */}
        <nav aria-label="Tracks" className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {[{ id: 'all' as const, name: 'All tracks' }, ...QCTF_TRACKS].map((track) => {
            const isActive = activeTrack === track.id;
            const Icon = track.id === 'all' ? Layers : TRACK_ICON[track.id];
            const inTrack = challenges.filter((c) => track.id === 'all' || c.trackId === track.id);
            const solvedInTrack = inTrack.filter((c) => c.solved).length;
            return (
              <button
                key={track.id}
                type="button"
                onClick={() => selectTrack(track.id)}
                aria-pressed={isActive}
                className={clsx(
                  'shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg border text-xs sm:text-sm font-semibold transition-colors cursor-pointer',
                  isActive
                    ? 'bg-burgundy/10 text-burgundy border-burgundy/20 dark:bg-burgundy/20 dark:text-[#E89BA5] dark:border-burgundy/40'
                    : 'bg-white dark:bg-[#150709] border-slate-200 dark:border-[#3D1418] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1C0A0D]'
                )}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">{track.name}</span>
                <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">
                  {solvedInTrack}/{inTrack.length}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
          <section className="space-y-4 min-w-0">
            {!me.team && (
              <div className="flex items-start gap-2 p-3.5 rounded-xl border border-amber-300/70 dark:border-amber-800/70 bg-amber-50 dark:bg-amber-950/30 text-xs text-amber-900 dark:text-amber-200">
                <Info className="w-4 h-4 shrink-0 mt-px" />
                You need a team to submit flags. Join one with a code or create one in the team panel.
              </div>
            )}

            {/* Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-2 rounded-xl bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418]">
              <div className="flex flex-wrap items-center gap-1">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    aria-pressed={difficulty === d}
                    className={clsx(PILL_BASE, difficulty === d ? PILL_ACTIVE : PILL_IDLE)}
                  >
                    {d === 'all' ? 'Any level' : QCTF_DIFFICULTY_LABEL[d]}
                  </button>
                ))}
                <span className="mx-1 h-4 w-px bg-slate-200 dark:bg-[#3D1418]" aria-hidden="true" />
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    aria-pressed={status === s}
                    className={clsx(PILL_BASE, status === s ? PILL_ACTIVE : PILL_IDLE)}
                  >
                    {s === 'all' ? 'Any status' : s}
                  </button>
                ))}
              </div>
              <div className="relative md:w-64">
                <label htmlFor="qctf-search" className="sr-only">
                  Search challenges
                </label>
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="qctf-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search title, ID or tag"
                  className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 dark:border-[#3D1418] bg-slate-50 dark:bg-[#1C0A0D] text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy/50"
                />
              </div>
            </div>

            {/* Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-20 text-sm text-slate-500 dark:text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading challenges
              </div>
            ) : loadError ? (
              <div className="flex items-center gap-2 p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-sm text-rose-700 dark:text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {loadError}
              </div>
            ) : challenges.length === 0 ? (
              <div className="py-16 text-center rounded-xl border border-dashed border-slate-300 dark:border-[#3D1418] text-sm text-slate-600 dark:text-slate-300">
                No challenges are released yet. They appear here as each block opens.
              </div>
            ) : visible.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-16 rounded-xl border border-dashed border-slate-300 dark:border-[#3D1418]">
                <p className="font-semibold text-slate-800 dark:text-slate-100">No challenges match these filters</p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#3D1418] text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1C0A0D] cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
                {visible.map((challenge) => (
                  <ChallengeCard key={challenge.id} challenge={challenge} />
                ))}
              </div>
            )}
          </section>

          <div className="space-y-4 xl:sticky xl:top-6">
            <QctfTeamCard />
            <ScoreboardPanel teamId={teamId} />
            <QctfRulesCard />
          </div>
        </div>
      </div>
    </div>
  );
}

function ChallengeCard({ challenge }: { challenge: QctfChallengeSummary }) {
  const track = QCTF_TRACKS.find((t) => t.id === challenge.trackId);
  const Icon = TRACK_ICON[challenge.trackId];

  return (
    <Link
      href={`/learning/qctf/${challenge.id.toLowerCase()}`}
      className={clsx(
        'group flex flex-col p-4 sm:p-5 rounded-xl border bg-white dark:bg-[#150709] shadow-xs transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40',
        challenge.solved
          ? 'border-emerald-300 dark:border-emerald-800/70'
          : challenge.released
            ? 'border-slate-200 dark:border-[#3D1418] hover:border-burgundy/40 dark:hover:border-burgundy/60'
            : 'border-dashed border-amber-300 dark:border-amber-800/70'
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs font-bold text-burgundy dark:text-[#E89BA5]">{challenge.id}</span>
        <span className="flex items-center gap-1.5">
          {!challenge.released && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 font-mono text-[10px] font-bold uppercase text-amber-800 dark:text-amber-300">
              <Lock className="w-2.5 h-2.5" />
              Unreleased
            </span>
          )}
          <DifficultyBadge difficulty={challenge.difficulty} />
        </span>
      </div>

      <h3 className="mt-3 font-serif text-lg font-bold leading-snug text-slate-900 dark:text-[#FAF6F3] group-hover:text-burgundy dark:group-hover:text-[#E89BA5] transition-colors">
        {challenge.title}
      </h3>
      <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
        {challenge.summary}
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="px-1.5 py-0.5 rounded font-mono text-[10px] text-burgundy dark:text-[#E89BA5] bg-burgundy/5 dark:bg-burgundy/15 border border-burgundy/15 dark:border-burgundy/30">
          {getQctfBlockLabel(challenge.block)}
        </span>
        {challenge.tags.map((tag) => (
          <span
            key={tag}
            className="px-1.5 py-0.5 rounded font-mono text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-[#1C0A0D] border border-slate-200 dark:border-[#3D1418]"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#3D1418] flex items-center justify-between gap-2 text-xs">
        <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 min-w-0">
          <Icon className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{track?.name}</span>
        </span>
        <span className="flex items-center gap-3 shrink-0">
          <span className="text-slate-500 dark:text-slate-400" title="Teams that solved it">
            {challenge.solveCount} {challenge.solveCount === 1 ? 'solve' : 'solves'}
          </span>
          <span className="font-mono font-bold text-slate-900 dark:text-[#FAF6F3]">{challenge.points} pts</span>
          {challenge.solved ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" aria-label="Solved" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-burgundy dark:group-hover:text-[#E89BA5]" />
          )}
        </span>
      </div>
    </Link>
  );
}

function ScoreboardPanel({ teamId }: { teamId: string | null }) {
  const { data: scoreboard } = useQctfScoreboard();
  const top = scoreboard?.entries.slice(0, 8) ?? [];

  return (
    <section className="p-5 rounded-xl bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] shadow-xs space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-semibold text-sm text-slate-900 dark:text-[#FAF6F3]">
          <Trophy className="w-4 h-4 text-amber-500" />
          Scoreboard
        </div>
        <Link href="/qctf/scoreboard" className="text-xs font-semibold text-burgundy dark:text-[#E89BA5] hover:underline">
          Full view
        </Link>
      </div>
      {scoreboard?.frozenAt && (
        <p className="text-[11px] text-amber-700 dark:text-amber-300">
          Frozen at {new Date(scoreboard.frozenAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </p>
      )}
      {top.length === 0 ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">No teams yet.</p>
      ) : (
        <ol className="space-y-1">
          {top.map((entry) => (
            <li
              key={entry.teamId}
              className={clsx(
                'flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs',
                entry.teamId === teamId
                  ? 'bg-burgundy/10 dark:bg-burgundy/20 text-burgundy dark:text-[#E89BA5] font-semibold'
                  : 'text-slate-700 dark:text-slate-200'
              )}
            >
              <span className="w-5 font-mono text-slate-400 text-right">{entry.rank}</span>
              <span className="flex-1 truncate">{entry.teamName}</span>
              <span className="font-mono font-bold">{entry.points}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function QctfRulesCard() {
  return (
    <aside className="p-5 rounded-xl bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] shadow-xs space-y-4">
      <div className="flex items-center gap-2 font-semibold text-sm text-slate-900 dark:text-[#FAF6F3]">
        <Info className="w-4 h-4 text-burgundy dark:text-[#E89BA5]" />
        How QCTF works
      </div>
      <ol className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
        {[
          'Open a challenge and read the statement. Download any files it provides.',
          'Work it out on your own laptop or in Google Colab, with Qiskit or by hand.',
          `Submit the answer in the format ${QCTF_EVENT.flagFormat}, exactly as the statement asks.`,
          'Each challenge scores once per team. Wrong attempts cost nothing but are limited to 10 per minute.',
          'Ranking is by total points, then by which team reached its total first.',
        ].map((rule, index) => (
          <li key={rule} className="flex gap-2.5">
            <span className="shrink-0 w-5 h-5 rounded-full bg-burgundy/10 dark:bg-burgundy/25 text-burgundy dark:text-[#E89BA5] font-mono text-[10px] font-bold flex items-center justify-center">
              {index + 1}
            </span>
            <span>{rule}</span>
          </li>
        ))}
      </ol>
      <p className="pt-3 border-t border-slate-100 dark:border-[#3D1418] text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
        Sharing flags or answers with other teams leads to disqualification.
      </p>
    </aside>
  );
}
