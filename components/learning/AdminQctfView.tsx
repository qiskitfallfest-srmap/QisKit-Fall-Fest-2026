'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { AlertCircle, CheckCircle2, ExternalLink, Loader2, RefreshCw, Trash2, XCircle } from 'lucide-react';
import {
  QCTF_BLOCKS,
  QCTF_STATES,
  getQctfBlockLabel,
  type QctfBlock,
  type QctfState,
} from '@/data/qctf/tracks';

interface AdminQctfData {
  config: { state: QctfState; run: string; releasedBlocks: QctfBlock[]; frozenAt: string | null };
  stats: { teams: number; players: number; solves: number; submissions: number; eligible: number };
  challenges: {
    id: string;
    title: string;
    trackId: string;
    block: QctfBlock;
    points: number;
    isEnabled: boolean;
    solveCount: number;
    attemptCount: number;
  }[];
  teams: {
    id: string;
    name: string;
    fromHackathon: boolean;
    members: { email: string; fullName: string }[];
    points: number;
    solvedCount: number;
  }[];
  eligible: { email: string; note: string | null; addedAt: string }[];
  recentSubmissions: {
    createdAt: string;
    email: string;
    teamName: string;
    challengeId: string;
    flag: string;
    correct: boolean;
  }[];
}

const CARD = 'rounded-xl border border-slate-200 dark:border-[#3D1418] bg-white dark:bg-[#150709] p-4 sm:p-5';
const HEADING = 'text-sm font-semibold text-slate-900 dark:text-[#FAF6F3]';
const SUBTLE = 'text-xs text-slate-500 dark:text-slate-400';

const CONFIRM_STATE: Partial<Record<QctfState, string>> = {
  announced: 'Open the arena to everyone on the entry list?',
  live: 'Start the live round?',
  frozen: 'Freeze the public scoreboard now?',
  closed: 'Close the round? Players can no longer submit flags.',
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function AdminQctfView() {
  const [data, setData] = useState<AdminQctfData | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [runInput, setRunInput] = useState('');
  const [emailsInput, setEmailsInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [eligibleFilter, setEligibleFilter] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/qctf', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) setError(json.error || 'Failed to load QCTF data.');
      else {
        setData(json);
        setError('');
      }
    } catch {
      setError('Failed to load QCTF data.');
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, 15000);
    return () => clearInterval(timer);
  }, [load]);

  async function act(payload: Record<string, unknown>, confirmText?: string) {
    if (confirmText && !window.confirm(confirmText)) return false;
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/admin/qctf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Update failed.');
        return false;
      }
      await load();
      return true;
    } catch {
      setError('Update failed.');
      return false;
    } finally {
      setBusy(false);
    }
  }

  if (!data) {
    return (
      <div className={clsx(CARD, 'flex items-center gap-2 text-sm text-slate-500')}>
        {error ? (
          <>
            <AlertCircle className="w-4 h-4 text-rose-600" />
            {error}
          </>
        ) : (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading QCTF
          </>
        )}
      </div>
    );
  }

  const { config, stats } = data;
  const eligible = data.eligible.filter((e) => !eligibleFilter || e.email.includes(eligibleFilter.trim().toLowerCase()));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-[#FAF6F3]">QCTF control</h2>
          <p className={SUBTLE}>
            Run <span className="font-mono">{config.run}</span> · refreshes every 15 seconds
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/learning/qctf"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#3D1418] text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1C0A0D]"
          >
            Open arena <ExternalLink className="w-3 h-3" />
          </Link>
          <Link
            href="/qctf/scoreboard"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#3D1418] text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1C0A0D]"
          >
            Projector scoreboard <ExternalLink className="w-3 h-3" />
          </Link>
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#3D1418] text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1C0A0D] cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <p className="flex items-center gap-2 p-3 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          ['Entry list', stats.eligible],
          ['Teams', stats.teams],
          ['Players', stats.players],
          ['Solves', stats.solves],
          ['Attempts', stats.submissions],
        ].map(([label, value]) => (
          <div key={label} className={CARD}>
            <p className="font-mono text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
            <p className="mt-1 font-mono text-xl font-bold text-slate-900 dark:text-[#FAF6F3]">{value}</p>
          </div>
        ))}
      </div>

      {/* State */}
      <section className={clsx(CARD, 'space-y-3')}>
        <h3 className={HEADING}>Arena state</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {QCTF_STATES.map((state) => {
            const isActive = config.state === state.id;
            return (
              <button
                key={state.id}
                type="button"
                disabled={busy || isActive}
                onClick={() => act({ action: 'setState', state: state.id }, CONFIRM_STATE[state.id])}
                className={clsx(
                  'text-left p-3 rounded-lg border transition-colors cursor-pointer disabled:cursor-default',
                  isActive
                    ? 'border-burgundy bg-burgundy/10 dark:bg-burgundy/20'
                    : 'border-slate-200 dark:border-[#3D1418] hover:bg-slate-50 dark:hover:bg-[#1C0A0D]'
                )}
              >
                <p
                  className={clsx(
                    'text-sm font-semibold',
                    isActive ? 'text-burgundy dark:text-[#E89BA5]' : 'text-slate-800 dark:text-slate-100'
                  )}
                >
                  {state.label}
                  {isActive && ' (current)'}
                </p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{state.description}</p>
              </button>
            );
          })}
        </div>
        {config.frozenAt && <p className={SUBTLE}>Public scoreboard frozen at {formatTime(config.frozenAt)}.</p>}
      </section>

      {/* Blocks and run */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <section className={clsx(CARD, 'space-y-3')}>
          <h3 className={HEADING}>Released blocks</h3>
          <p className={SUBTLE}>Players only see challenges in released blocks. Admins see every block.</p>
          <div className="flex flex-wrap gap-2">
            {QCTF_BLOCKS.map((block) => {
              const isReleased = config.releasedBlocks.includes(block.id);
              const count = data.challenges.filter((c) => c.block === block.id && c.isEnabled).length;
              return (
                <button
                  key={block.id}
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    const next = isReleased
                      ? config.releasedBlocks.filter((b) => b !== block.id)
                      : [...config.releasedBlocks, block.id];
                    act(
                      { action: 'setBlocks', releasedBlocks: next },
                      isReleased ? undefined : `Release ${block.label} (${count} challenges) to players?`
                    );
                  }}
                  className={clsx(
                    'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors cursor-pointer',
                    isReleased
                      ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-[#3D1418] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1C0A0D]'
                  )}
                >
                  {isReleased ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  {block.label} · {count}
                </button>
              );
            })}
          </div>
        </section>

        <section className={clsx(CARD, 'space-y-3')}>
          <h3 className={HEADING}>Run</h3>
          <p className={SUBTLE}>
            Teams, solves and the scoreboard belong to a run. Start a new run to clear a rehearsal; old runs stay in the
            database. Use <span className="font-mono">live</span> for the competition.
          </p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const ok = await act(
                { action: 'setRun', run: runInput },
                `Switch to run "${runInput}"? Everyone starts with no team and no points.`
              );
              if (ok) setRunInput('');
            }}
            className="flex gap-2"
          >
            <input
              value={runInput}
              onChange={(e) => setRunInput(e.target.value.toLowerCase())}
              placeholder="rehearsal-2"
              className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-[#3D1418] bg-slate-50 dark:bg-[#1C0A0D] font-mono text-sm"
            />
            <button
              type="submit"
              disabled={busy || runInput.trim().length < 2}
              className="px-3 py-2 rounded-lg bg-burgundy hover:bg-burgundy-deep text-white text-xs font-semibold disabled:opacity-50 cursor-pointer"
            >
              Start run
            </button>
          </form>
        </section>
      </div>

      {/* Entry list */}
      <section className={clsx(CARD, 'space-y-3')}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className={HEADING}>Entry list ({data.eligible.length})</h3>
          <input
            value={eligibleFilter}
            onChange={(e) => setEligibleFilter(e.target.value)}
            placeholder="Filter emails"
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#3D1418] bg-slate-50 dark:bg-[#1C0A0D] text-xs"
          />
        </div>
        <p className={SUBTLE}>
          Only these emails can enter once the arena is announced. Paste emails separated by commas, spaces or new lines.
          Admins and testers do not need to be listed.
        </p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const ok = await act({ action: 'addEligible', emails: emailsInput, note: noteInput });
            if (ok) {
              setEmailsInput('');
              setNoteInput('');
            }
          }}
          className="grid grid-cols-1 md:grid-cols-[1fr_200px_auto] gap-2 items-start"
        >
          <textarea
            value={emailsInput}
            onChange={(e) => setEmailsInput(e.target.value)}
            rows={3}
            placeholder="student1@srmap.edu.in, student2@gmail.com"
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-[#3D1418] bg-slate-50 dark:bg-[#1C0A0D] text-xs font-mono"
          />
          <input
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            placeholder="Note (optional)"
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-[#3D1418] bg-slate-50 dark:bg-[#1C0A0D] text-xs"
          />
          <button
            type="submit"
            disabled={busy || !emailsInput.trim()}
            className="px-3 py-2 rounded-lg bg-burgundy hover:bg-burgundy-deep text-white text-xs font-semibold disabled:opacity-50 cursor-pointer"
          >
            Add emails
          </button>
        </form>
        {eligible.length > 0 && (
          <ul className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-[#3D1418] border border-slate-100 dark:border-[#3D1418] rounded-lg">
            {eligible.map((entry) => (
              <li key={entry.email} className="flex items-center justify-between gap-2 px-3 py-1.5 text-xs">
                <span className="font-mono truncate text-slate-700 dark:text-slate-200">{entry.email}</span>
                <span className="flex items-center gap-2 shrink-0">
                  {entry.note && <span className="text-slate-400">{entry.note}</span>}
                  <button
                    type="button"
                    onClick={() => act({ action: 'removeEligible', email: entry.email }, `Remove ${entry.email}?`)}
                    aria-label={`Remove ${entry.email}`}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Challenges */}
      <section className={clsx(CARD, 'space-y-3 overflow-x-auto')}>
        <h3 className={HEADING}>Challenges ({data.challenges.length})</h3>
        <table className="w-full text-xs">
          <thead className="text-left text-slate-500 dark:text-slate-400">
            <tr>
              <th className="py-1.5 pr-3 font-semibold">ID</th>
              <th className="py-1.5 pr-3 font-semibold">Title</th>
              <th className="py-1.5 pr-3 font-semibold">Block</th>
              <th className="py-1.5 pr-3 font-semibold text-right">Points</th>
              <th className="py-1.5 pr-3 font-semibold text-right">Solves</th>
              <th className="py-1.5 pr-3 font-semibold text-right">Attempts</th>
              <th className="py-1.5 font-semibold text-right">Enabled</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-[#3D1418]">
            {data.challenges.map((c) => (
              <tr key={c.id} className={clsx(!c.isEnabled && 'opacity-50')}>
                <td className="py-1.5 pr-3 font-mono font-semibold text-burgundy dark:text-[#E89BA5]">{c.id}</td>
                <td className="py-1.5 pr-3 text-slate-700 dark:text-slate-200">
                  <Link href={`/learning/qctf/${c.id.toLowerCase()}`} className="hover:underline">
                    {c.title}
                  </Link>
                </td>
                <td className="py-1.5 pr-3 text-slate-500">{getQctfBlockLabel(c.block)}</td>
                <td className="py-1.5 pr-3 text-right font-mono">{c.points}</td>
                <td className="py-1.5 pr-3 text-right font-mono">{c.solveCount}</td>
                <td className="py-1.5 pr-3 text-right font-mono">{c.attemptCount}</td>
                <td className="py-1.5 text-right">
                  <input
                    type="checkbox"
                    checked={c.isEnabled}
                    disabled={busy}
                    onChange={(e) =>
                      act(
                        { action: 'setChallengeEnabled', id: c.id, enabled: e.target.checked },
                        e.target.checked ? undefined : `Hide ${c.id} from everyone?`
                      )
                    }
                    aria-label={`Enable ${c.id}`}
                    className="accent-burgundy cursor-pointer"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Teams */}
        <section className={clsx(CARD, 'space-y-3')}>
          <h3 className={HEADING}>Teams ({data.teams.length})</h3>
          {data.teams.length === 0 ? (
            <p className={SUBTLE}>No teams in this run yet.</p>
          ) : (
            <ul className="space-y-2 max-h-[28rem] overflow-y-auto">
              {data.teams.map((team) => (
                <li key={team.id} className="p-3 rounded-lg border border-slate-100 dark:border-[#3D1418]">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900 dark:text-[#FAF6F3] truncate">
                      {team.name}
                      {team.fromHackathon && <span className="ml-2 text-[10px] font-normal text-slate-400">hackathon</span>}
                    </p>
                    <span className="font-mono text-xs font-bold shrink-0">
                      {team.points} pts · {team.solvedCount}
                    </span>
                  </div>
                  <ul className="mt-1.5 space-y-0.5">
                    {team.members.map((member) => (
                      <li key={member.email} className="flex items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <span className="truncate" title={member.email}>
                          {member.fullName} <span className="text-slate-400">· {member.email}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            act({ action: 'removeMember', email: member.email }, `Remove ${member.email} from ${team.name}?`)
                          }
                          aria-label={`Remove ${member.email}`}
                          className="p-0.5 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Submissions */}
        <section className={clsx(CARD, 'space-y-3')}>
          <h3 className={HEADING}>Latest attempts</h3>
          {data.recentSubmissions.length === 0 ? (
            <p className={SUBTLE}>No attempts in this run yet.</p>
          ) : (
            <ul className="space-y-1 max-h-[28rem] overflow-y-auto font-mono text-[11px]">
              {data.recentSubmissions.map((s, index) => (
                <li
                  key={`${s.createdAt}-${index}`}
                  className={clsx(
                    'grid grid-cols-[auto_auto_1fr] gap-x-2 px-2 py-1 rounded',
                    s.correct ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'bg-slate-50 dark:bg-[#1C0A0D]'
                  )}
                >
                  <span className="text-slate-400">{formatTime(s.createdAt)}</span>
                  <span className="font-semibold text-burgundy dark:text-[#E89BA5]">{s.challengeId}</span>
                  <span className="truncate text-slate-700 dark:text-slate-200" title={`${s.email} · ${s.flag}`}>
                    {s.teamName} · {s.flag}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
