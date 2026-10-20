'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { ChevronDown, ChevronRight, ExternalLink, Loader2, MessageSquare, RotateCw, Search } from 'lucide-react';
import type {
  AdminCompetitionResultRow,
  AdminCompetitionResultStage,
  AdminCompetitionResultsData,
} from '@/app/api/admin/competition-results/route';
import {
  AWARD_RANKS,
  AWARD_RANK_LABEL,
  COMPETITION_TYPES,
  OUTCOME_LABEL,
  formatInr,
  type CompetitionType,
} from '@/lib/competition-results';
import { DAILY_COMPETITIONS } from '@/data/learning/competitions';

const COMPETITION_PRIZE_POOL = Object.fromEntries(
  Object.values(DAILY_COMPETITIONS).map((c) => [c.type, c.prizePool])
) as Record<CompetitionType, number[] | undefined>;

type Filter = 'undecided' | 'ready' | 'released' | 'all';

const FILTERS: { key: Filter; label: string; match: (r: AdminCompetitionResultRow) => boolean }[] = [
  { key: 'undecided', label: 'To decide', match: (r) => r.stage === 'undecided' },
  { key: 'ready', label: 'Ready to release', match: (r) => r.stage === 'ready' },
  { key: 'released', label: 'Released', match: (r) => r.stage === 'released' },
  { key: 'all', label: 'All entries', match: () => true },
];

const TYPE_LABEL: Record<CompetitionType, string> = {
  reels: 'Day 1 · Tech Reels',
  poster: 'Day 2 · Digital Poster',
  essay: 'Day 3 · Essay',
};

const STAGE_LABEL: Record<AdminCompetitionResultStage, string> = {
  undecided: 'Not decided',
  ready: 'Not released',
  released: 'Released',
};

const STAGE_TONE: Record<AdminCompetitionResultStage, string> = {
  undecided: 'bg-slate-100 text-slate-600 dark:bg-[#1C0A0D] dark:text-slate-300',
  ready: 'bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300',
  released: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300',
};

const OUTCOME_TONE: Record<string, string> = {
  winner: 'text-emerald-700 dark:text-emerald-300',
  finalist: 'text-blue-700 dark:text-blue-300',
  shortlisted: 'text-violet-700 dark:text-violet-300',
  not_selected: 'text-rose-600 dark:text-rose-300',
};

const DECISIONS: { value: string; label: string }[] = [
  { value: 'winner', label: 'Winner' },
  { value: 'finalist', label: 'Finalist' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'rejected', label: 'Not selected' },
  { value: 'under_review', label: 'Undecided (keep in review)' },
];

function formatIst(iso: string | null | undefined) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

const btn =
  'inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
const btnPrimary = `${btn} bg-burgundy hover:bg-burgundy-deep text-white`;
const btnSecondary = `${btn} border border-slate-300 dark:border-[#3D1418] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1C0A0D]`;
const btnDanger = `${btn} border border-rose-300 dark:border-rose-900 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30`;
const inputCls =
  'px-2.5 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-[#3D1418] bg-white dark:bg-[#100405] text-slate-900 dark:text-[#FAF6F3] focus:outline-none focus:ring-2 focus:ring-burgundy/30';

function Stat({ label, value, detail }: { label: string; value: React.ReactNode; detail?: string }) {
  return (
    <div className="px-4 py-3 bg-white dark:bg-[#150709]">
      <dt className="text-[11px] text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="text-xl font-semibold tabular-nums text-slate-900 dark:text-[#FAF6F3]">{value}</dd>
      {detail && <p className="text-[11px] text-slate-500 dark:text-slate-400">{detail}</p>}
    </div>
  );
}

interface Draft {
  status: string;
  score: string;
  awardRank: string;
  feedback: string;
}

/** "2026-10-30T14:00" in IST for a datetime-local input */
function toIstInput(iso: string): string {
  const d = new Date(Date.parse(iso) + 330 * 60_000);
  return d.toISOString().slice(0, 16);
}

function formatIstLong(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** When released results become visible to participants (Valedictory Ceremony). */
function RevealPanel({
  revealAt,
  revealed,
  busy,
  onSave,
  onRevealNow,
}: {
  revealAt: string;
  revealed: boolean;
  busy: boolean;
  onSave: (iso: string) => void;
  onRevealNow: () => void;
}) {
  const [value, setValue] = useState(() => toIstInput(revealAt));
  useEffect(() => setValue(toIstInput(revealAt)), [revealAt]);
  return (
    <div
      className={clsx(
        'rounded-xl border p-4 space-y-3',
        revealed
          ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/60 dark:bg-emerald-950/20'
          : 'border-amber-200 bg-amber-50/60 dark:border-amber-900/60 dark:bg-amber-950/20'
      )}
    >
      <div>
        <p className="text-sm font-semibold text-slate-900 dark:text-[#FAF6F3]">
          {revealed ? 'Results are visible to participants' : `Results are hidden until ${formatIstLong(revealAt)} IST`}
        </p>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
          {revealed
            ? `Visible since ${formatIstLong(revealAt)} IST: released results show on profiles, the dashboard, /results and the award pages.`
            : 'Winners are announced at the Valedictory Ceremony. Released results stay saved; profiles, the dashboard, /results and the award pages show them from this time on. Admins can preview them on their profile.'}
        </p>
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <label className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
          <span className="block">Visible from (IST)</span>
          <input
            type="datetime-local"
            className={inputCls}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </label>
        <button
          type="button"
          className={btnSecondary}
          disabled={busy || !value || value === toIstInput(revealAt)}
          onClick={() => onSave(`${value}:00+05:30`)}
        >
          Save time
        </button>
        {!revealed && (
          <button
            type="button"
            className={btnPrimary}
            disabled={busy}
            onClick={() => {
              if (window.confirm('Show all released competition results to participants and on the public pages now?')) onRevealNow();
            }}
          >
            Publish now
          </button>
        )}
      </div>
    </div>
  );
}

export function AdminCompetitionResultsView() {
  const [data, setData] = useState<AdminCompetitionResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [filter, setFilter] = useState<Filter>('undecided');
  const [typeFilter, setTypeFilter] = useState<CompetitionType | 'all'>('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/competition-results', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to load');
      setData(json.data);
      setError('');
    } catch (err: any) {
      setError(err?.message || 'Failed to load competition results');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function act(payload: Record<string, unknown>, successMessage: string) {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const res = await fetch('/api/admin/competition-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Action failed');
      setData(json.data);
      const failures = (json.results || []).filter((r: any) => !r.ok);
      if (failures.length) {
        const names = failures
          .map((f: any) => `${json.data.rows.find((r: AdminCompetitionResultRow) => r.id === f.id)?.name || f.id}: ${f.message}`)
          .join('; ');
        setError(names);
      }
      const okCount = (json.results || []).length - failures.length;
      if (okCount > 0) setNotice(successMessage);
      setSelected(new Set());
      return true;
    } catch (err: any) {
      setError(err?.message || 'Action failed');
      return false;
    } finally {
      setBusy(false);
    }
  }

  const rows = useMemo(() => data?.rows || [], [data]);
  // Rows arrive ranked by score within each competition
  const rankById = useMemo(() => {
    const counters: Record<string, number> = {};
    return new Map(rows.map((r) => [r.id, (counters[r.type] = (counters[r.type] || 0) + 1)]));
  }, [rows]);

  const inType = useMemo(() => rows.filter((r) => typeFilter === 'all' || r.type === typeFilter), [rows, typeFilter]);

  const visible = useMemo(() => {
    const f = FILTERS.find((x) => x.key === filter)!;
    const q = query.trim().toLowerCase();
    return inType.filter(
      (r) =>
        f.match(r) &&
        (!q ||
          r.name.toLowerCase().includes(q) ||
          r.email.includes(q) ||
          (r.title || '').toLowerCase().includes(q))
    );
  }, [inType, filter, query]);

  const selectedRows = rows.filter((r) => selected.has(r.id));

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function draftFor(r: AdminCompetitionResultRow): Draft {
    return (
      drafts[r.id] || {
        status: r.outcome ? r.juryStatus : 'under_review',
        score: r.score != null ? String(r.score) : '',
        awardRank: r.awardRank != null ? String(r.awardRank) : '',
        feedback: r.feedback,
      }
    );
  }

  function release(ids: string[]) {
    if (!ids.length) return;
    if (!window.confirm(`Release the result to ${ids.length} participant(s)? They see it on their dashboard immediately.`)) return;
    act({ action: 'release', ids }, `Released ${ids.length} result(s).`);
  }

  function withdraw(ids: string[]) {
    if (!ids.length) return;
    if (!window.confirm(`Hide the result from ${ids.length} participant(s) again?`)) return;
    act({ action: 'withdraw', ids }, 'Result hidden from the participant.');
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-6 text-sm text-slate-500">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading competition results...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-sm text-rose-700 dark:text-rose-300">
        {error || 'Could not load competition results.'}{' '}
        <button type="button" onClick={load} className="underline cursor-pointer">Retry</button>
      </div>
    );
  }

  const s = data.summary;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl font-semibold text-slate-900 dark:text-[#FAF6F3]">Competition Results</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Decide and release results entry by entry. Participants see a released result from the reveal time below
            (Valedictory Ceremony); after that, changes to the decision, score or comment show up for them immediately. A
            released winner with a placement appears on the Results tab of every profile and on /results; admins see
            everything there as a preview before the reveal.
          </p>
        </div>
        <button type="button" className={btnSecondary} onClick={() => { setLoading(true); load(); }} disabled={busy}>
          <RotateCw className={clsx('w-3.5 h-3.5', busy && 'animate-spin')} /> Refresh
        </button>
      </div>

      {data && (
        <RevealPanel
          revealAt={data.revealAt}
          revealed={data.revealed}
          busy={busy}
          onSave={async (iso) => {
            if (await act({ action: 'set_reveal', revealAt: iso }, '')) setNotice('Reveal time saved.');
          }}
          onRevealNow={async () => {
            if (await act({ action: 'reveal_now' }, '')) setNotice('Results are now visible to participants.');
          }}
        />
      )}

      {/* Counters per competition */}
      <dl className="grid grid-cols-1 sm:grid-cols-3 gap-px rounded-xl overflow-hidden border border-slate-200 dark:border-[#3D1418] bg-slate-200 dark:bg-[#3D1418]">
        {COMPETITION_TYPES.map((t) => (
          <Stat
            key={t}
            label={TYPE_LABEL[t]}
            value={`${s[t].released}/${s[t].total} released`}
            detail={`${s[t].undecided} to decide · ${s[t].ready} ready · ${s[t].winners} winners · ${s[t].finalists} finalists`}
          />
        ))}
      </dl>

      {(error || notice) && (
        <div className={clsx('p-3 rounded-lg text-xs border',
          error ? 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200'
                : 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200')}>
          {error || notice}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => {
          const n = inType.filter(f.match).length;
          return (
            <button key={f.key} type="button" onClick={() => { setFilter(f.key); setSelected(new Set()); }}
              className={clsx('px-3 py-1.5 text-xs font-medium rounded-full border cursor-pointer',
                filter === f.key
                  ? 'bg-burgundy border-burgundy text-white'
                  : 'border-slate-200 dark:border-[#3D1418] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1C0A0D]')}>
              {f.label} <span className="tabular-nums opacity-80">{n}</span>
            </button>
          );
        })}

        <div className="flex items-center gap-2 ml-auto flex-wrap">
          <select
            className={clsx(inputCls, 'text-xs py-1.5 cursor-pointer')}
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value as CompetitionType | 'all'); setSelected(new Set()); }}
          >
            <option value="all">All competitions</option>
            {COMPETITION_TYPES.map((t) => (
              <option key={t} value={t}>{TYPE_LABEL[t]}</option>
            ))}
          </select>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className={clsx(inputCls, 'pl-8 w-52 text-xs py-1.5')} placeholder="Search name, email, title..." value={query}
              onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Bulk actions */}
      {selectedRows.length > 0 && (
        <div className="sticky top-2 z-10 flex flex-wrap items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-[#3D1418] bg-white dark:bg-[#150709] shadow-sm">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 mr-2">{selectedRows.length} selected</span>
          <button type="button" className={btnPrimary} disabled={busy || !selectedRows.some((r) => r.stage === 'ready')}
            onClick={() => release(selectedRows.filter((r) => r.stage === 'ready').map((r) => r.id))}>
            Release results
          </button>
          <button type="button" className={btnSecondary} disabled={busy || !selectedRows.some((r) => r.stage === 'released')}
            onClick={() => withdraw(selectedRows.filter((r) => r.stage === 'released').map((r) => r.id))}>
            Hide results
          </button>
          <button type="button" className={`${btn} text-slate-500`} onClick={() => setSelected(new Set())}>Clear</button>
          {selectedRows.some((r) => r.stage === 'undecided') && (
            <span className="text-[11px] text-slate-500">Entries without a decision are skipped.</span>
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-slate-200 dark:border-[#3D1418] overflow-x-auto bg-white dark:bg-[#150709]">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-[#3D1418]">
              <th className="p-3 w-8">
                <input type="checkbox" aria-label="Select all visible"
                  checked={visible.length > 0 && visible.every((r) => selected.has(r.id))}
                  onChange={(e) => setSelected(e.target.checked ? new Set(visible.map((r) => r.id)) : new Set())} />
              </th>
              <th className="p-3 w-10">#</th>
              <th className="p-3">Participant</th>
              <th className="p-3">Competition & Entry</th>
              <th className="p-3 text-right">Score</th>
              <th className="p-3">Result</th>
              <th className="p-3 w-8" />
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr><td colSpan={7} className="p-6 text-center text-xs text-slate-500">No entries in this view.</td></tr>
            )}
            {visible.map((r) => {
              const isOpen = expanded === r.id;
              const draft = draftFor(r);
              return (
                <React.Fragment key={r.id}>
                  <tr className={clsx('border-b border-slate-100 dark:border-[#250D11] hover:bg-slate-50/70 dark:hover:bg-[#1C0A0D]/60', isOpen && 'bg-slate-50 dark:bg-[#1C0A0D]')}>
                    <td className="p-3">
                      <input type="checkbox" aria-label={`Select ${r.name}`} checked={selected.has(r.id)} onChange={() => toggle(r.id)} />
                    </td>
                    <td className="p-3 text-xs tabular-nums text-slate-400">{rankById.get(r.id)}</td>
                    <td className="p-3 cursor-pointer" onClick={() => setExpanded(isOpen ? null : r.id)}>
                      <p className="font-medium text-slate-900 dark:text-[#FAF6F3]">{r.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{r.email}</p>
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-xs text-slate-900 dark:text-[#FAF6F3] block">{TYPE_LABEL[r.type]}</span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs">{r.title || 'Untitled entry'}</p>
                    </td>
                    <td className="p-3 text-right tabular-nums font-medium text-slate-900 dark:text-[#FAF6F3]">{r.score ?? '–'}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={clsx('px-2 py-0.5 rounded-full text-[11px] font-semibold', STAGE_TONE[r.stage])}>{STAGE_LABEL[r.stage]}</span>
                        {r.outcome && (
                          <span className={clsx('text-[11px] font-semibold', OUTCOME_TONE[r.outcome])}>
                            {OUTCOME_LABEL[r.outcome]}
                            {r.awardRank != null && ` · ${AWARD_RANK_LABEL[r.awardRank]}`}
                          </span>
                        )}
                        {r.notesCount > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-[11px] text-slate-500 dark:text-slate-400" title="Internal jury notes">
                            <MessageSquare className="w-3 h-3" /> {r.notesCount}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <button type="button" aria-label="Details" className="text-slate-400 hover:text-slate-700 cursor-pointer"
                        onClick={() => setExpanded(isOpen ? null : r.id)}>
                        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>

                  {isOpen && (
                    <tr className="border-b border-slate-200 dark:border-[#3D1418] bg-slate-50 dark:bg-[#1C0A0D]">
                      <td colSpan={7} className="p-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                          {/* Decision, score and note */}
                          <div className="space-y-3">
                            <div className="flex flex-wrap items-end gap-3">
                              <label className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                                <span className="block">Decision</span>
                                <select className={clsx(inputCls, 'cursor-pointer')} value={draft.status}
                                  onChange={(e) => setDrafts((d) => ({ ...d, [r.id]: { ...draft, status: e.target.value } }))}>
                                  {DECISIONS.map((o) => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                  ))}
                                </select>
                              </label>
                              {draft.status === 'winner' && (
                                <label className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                                  <span className="block">Placement</span>
                                  <select className={clsx(inputCls, 'cursor-pointer')} value={draft.awardRank}
                                    onChange={(e) => setDrafts((d) => ({ ...d, [r.id]: { ...draft, awardRank: e.target.value } }))}>
                                    <option value="">Not placed</option>
                                    {AWARD_RANKS.filter((rank) => rank <= (COMPETITION_PRIZE_POOL[r.type]?.length ?? 3)).map((rank) => (
                                      <option key={rank} value={rank}>
                                        {AWARD_RANK_LABEL[rank]}
                                        {COMPETITION_PRIZE_POOL[r.type]?.[rank - 1] != null && ` · ${formatInr(COMPETITION_PRIZE_POOL[r.type]![rank - 1])}`}
                                      </option>
                                    ))}
                                  </select>
                                </label>
                              )}
                              <label className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                                <span className="block">Score (0–100)</span>
                                <input type="number" min={0} max={100} step="0.01" className={clsx(inputCls, 'w-28')} value={draft.score}
                                  onChange={(e) => setDrafts((d) => ({ ...d, [r.id]: { ...draft, score: e.target.value } }))} />
                              </label>
                              {r.url && (
                                <a href={r.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-burgundy dark:text-[#E89BA5] hover:underline pb-2">
                                  Open entry <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                            <label className="block text-xs text-slate-600 dark:text-slate-300 space-y-1">
                              <span className="block">Comment shown to the participant with the result</span>
                              <textarea rows={3} className={clsx(inputCls, 'w-full')} value={draft.feedback} maxLength={2000}
                                placeholder="e.g. Clear explanation of superposition; the visuals carried the story well."
                                onChange={(e) => setDrafts((d) => ({ ...d, [r.id]: { ...draft, feedback: e.target.value } }))} />
                            </label>
                            <button type="button" className={btnSecondary} disabled={busy}
                              onClick={async () => {
                                const ok = await act(
                                  { action: 'save', id: r.id, status: draft.status, score: draft.score, awardRank: draft.status === 'winner' ? draft.awardRank : '', feedback: draft.feedback },
                                  'Saved.'
                                );
                                if (ok) setDrafts((d) => { const n = { ...d }; delete n[r.id]; return n; });
                              }}>
                              Save decision, placement, score & comment
                            </button>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {r.stage === 'released'
                                ? 'This result is released: saved changes are visible to the participant right away.'
                                : 'Saving does not release anything. The rubric and internal notes stay in the Review Desk under Daily Competitions.'}
                            </p>
                          </div>

                          {/* Release */}
                          <div className="space-y-3">
                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Release</p>
                            {r.stage === 'released' ? (
                              <>
                                <p className="text-xs text-slate-600 dark:text-slate-300">
                                  Released {formatIst(r.releasedAt)} IST as <strong>{r.outcome && OUTCOME_LABEL[r.outcome]}</strong>.
                                </p>
                                <button type="button" className={btnDanger} disabled={busy} onClick={() => withdraw([r.id])}>
                                  Hide result
                                </button>
                              </>
                            ) : r.stage === 'ready' ? (
                              <>
                                <p className="text-xs text-slate-600 dark:text-slate-300">
                                  Decision: <strong>{r.outcome && OUTCOME_LABEL[r.outcome]}</strong>. Not visible to the participant yet.
                                </p>
                                <button type="button" className={btnPrimary} disabled={busy} onClick={() => release([r.id])}>
                                  Release result
                                </button>
                              </>
                            ) : (
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Save a decision (winner, finalist, shortlisted or not selected) before releasing.
                              </p>
                            )}
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">Submitted {formatIst(r.submittedAt)} IST</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
