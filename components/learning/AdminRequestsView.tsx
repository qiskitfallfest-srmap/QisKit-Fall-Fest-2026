'use client';

import React, { useCallback, useEffect, useState } from 'react';
import clsx from 'clsx';
import { AlertTriangle, Loader2, RefreshCw, UserMinus, UserPlus } from 'lucide-react';
import { QUESTION_CATEGORIES, type ParticipantRequest, type QuestionCategory } from '@/lib/participant-requests-shared';

type AdminRequest = ParticipantRequest & {
  roster?: { email: string; name: string; status: string }[];
  check?: { errors: string[]; warnings: string[]; currentSize: number; finalSize: number };
};
type StatusFilter = 'open' | 'closed' | 'all';
type KindFilter = 'all' | 'roster_change' | 'question';

const STATUS_STYLE: Record<string, string> = {
  open: 'bg-amber-50 text-amber-800 border-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  answered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
  withdrawn: 'bg-slate-100 text-slate-600 border-slate-200',
};

const box = 'rounded-xl border border-slate-200 dark:border-[#3D1418] bg-white dark:bg-[#150709] p-4';
const btn = 'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

function RequestCard({ r, onDone }: { r: AdminRequest; onDone: (message: string) => void }) {
  const [response, setResponse] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const add = r.changes?.add || [];
  const drop = r.changes?.drop || [];
  const blocked = Boolean(r.check?.errors.length);

  async function act(action: 'approve' | 'reject' | 'answer') {
    if ((action === 'reject' || action === 'answer') && !response.trim()) {
      setError(action === 'reject' ? 'Write the reason; the participant sees it.' : 'Write the answer.');
      return;
    }
    if (action === 'approve' && !window.confirm(`Apply this change to team "${r.team_name}" now?`)) return;
    setBusy(action);
    setError('');
    try {
      const res = await fetch('/api/admin/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: r.id, action, response }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Update failed.');
      onDone(
        action === 'approve'
          ? `Applied to ${r.team_name}.${json.warnings?.length ? ` Follow up: ${json.warnings.join(' ')}` : ''}`
          : action === 'answer'
            ? `Answer sent to ${r.requester_name}.`
            : `Request from ${r.requester_name} declined.`
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <li className={clsx(box, 'space-y-3')}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 dark:text-[#FAF6F3]">
            {r.kind === 'question'
              ? r.subject || QUESTION_CATEGORIES[r.category as QuestionCategory] || 'Question'
              : `Team change: ${r.team_name || 'Unknown team'}`}
          </p>
          <p className="text-xs text-slate-500 break-all">
            {r.requester_name} · {r.requester_email}
            {r.kind === 'question' && r.team_name && ` · ${r.team_name}`}
            {r.kind === 'question' && r.category && ` · ${QUESTION_CATEGORIES[r.category as QuestionCategory] || r.category}`}
            {' · '}
            {new Date(r.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
          </p>
        </div>
        <span className={clsx('rounded-md border px-2 py-0.5 text-[11px] font-semibold capitalize', STATUS_STYLE[r.status])}>{r.status}</span>
      </div>

      {r.kind === 'roster_change' && (
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">Requested change</p>
            <ul className="text-sm space-y-1">
              {drop.map((d) => (
                <li key={d.email} className="flex items-center gap-2 text-rose-700 dark:text-rose-300">
                  <UserMinus className="h-4 w-4 shrink-0" />
                  Remove {d.name} <span className="text-xs text-slate-500">{d.email}</span>
                </li>
              ))}
              {add.map((a) => (
                <li key={a.email} className="flex items-start gap-2 text-emerald-700 dark:text-emerald-300">
                  <UserPlus className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    Add {a.name} <span className="text-xs text-slate-500">{a.email} · {a.institution}</span>
                  </span>
                </li>
              ))}
            </ul>
            {r.check && (
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                Size {r.check.currentSize} to <strong>{r.check.finalSize}</strong> members
              </p>
            )}
          </div>
          {r.roster && (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">Current roster</p>
              <ul className="text-xs space-y-0.5 text-slate-700 dark:text-slate-300">
                {r.roster.map((m) => (
                  <li key={m.email}>
                    {m.name} <span className="text-slate-500">{m.email}</span>
                    {m.status !== 'accepted' && <span className="ml-1 text-slate-500">({m.status})</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div>
        <p className="text-xs font-semibold text-slate-500 mb-1">{r.kind === 'question' ? 'Question' : 'Reason given'}</p>
        <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line">{r.message}</p>
      </div>

      {r.check?.errors.length ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/30 px-3 py-2 text-xs text-rose-800 dark:text-rose-200 space-y-1">
          <p className="font-semibold">Cannot be applied as it stands</p>
          {r.check.errors.map((e) => <p key={e}>{e}</p>)}
        </div>
      ) : null}
      {r.check?.warnings.length ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 px-3 py-2 text-xs text-amber-900 dark:text-amber-200 space-y-1">
          {r.check.warnings.map((w) => (
            <p key={w} className="flex gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-px" />
              {w}
            </p>
          ))}
        </div>
      ) : null}

      {r.status === 'open' ? (
        <div className="space-y-2">
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            rows={2}
            placeholder={
              r.kind === 'question'
                ? 'Answer (shown to the participant)'
                : 'Message to the team (required to decline, optional to approve)'
            }
            className="w-full rounded-lg border border-slate-300 dark:border-[#3D1418] bg-white dark:bg-[#1C0A0D] px-3 py-2 text-sm"
          />
          {error && <p className="text-xs text-rose-600">{error}</p>}
          <div className="flex flex-wrap gap-2">
            {r.kind === 'roster_change' ? (
              <button type="button" disabled={Boolean(busy) || blocked} onClick={() => act('approve')} className={clsx(btn, 'bg-burgundy text-white')}>
                {busy === 'approve' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Approve and apply
              </button>
            ) : (
              <button type="button" disabled={Boolean(busy)} onClick={() => act('answer')} className={clsx(btn, 'bg-burgundy text-white')}>
                {busy === 'answer' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Send answer
              </button>
            )}
            <button
              type="button"
              disabled={Boolean(busy)}
              onClick={() => act('reject')}
              className={clsx(btn, 'border border-slate-300 dark:border-[#3D1418] text-slate-700 dark:text-slate-200')}
            >
              {busy === 'reject' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {r.kind === 'question' ? 'Close without answer' : 'Decline'}
            </button>
          </div>
        </div>
      ) : (
        r.admin_response && (
          <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line">
            <span className="font-semibold">Response by {r.reviewed_by}:</span> {r.admin_response}
          </p>
        )
      )}
    </li>
  );
}

export function AdminRequestsView() {
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [openCounts, setOpenCounts] = useState({ roster_change: 0, question: 0 });
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('open');
  const [kindFilter, setKindFilter] = useState<KindFilter>('all');
  const [closed, setClosed] = useState(false);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/requests?status=${statusFilter}`, { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to load.');
      setRequests(json.requests);
      setOpenCounts(json.openCounts);
      setClosed(Boolean(json.config?.closed));
      setNote(json.config?.note || '');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function saveConfig() {
    const res = await fetch('/api/admin/requests', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ closed, note }),
    });
    const json = await res.json().catch(() => ({}));
    setMessage(res.ok && json.success ? 'Settings saved.' : json.error || 'Failed to save.');
  }

  const visible = requests.filter((r) => kindFilter === 'all' || r.kind === kindFilter);
  const chip = (active: boolean) =>
    clsx(
      'rounded-full border px-3 py-1 text-xs font-semibold cursor-pointer',
      active ? 'border-burgundy bg-burgundy text-white' : 'border-slate-300 dark:border-[#3D1418] text-slate-600 dark:text-slate-300'
    );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-[#FAF6F3]">Participant requests</h2>
          <p className="text-xs text-slate-500">
            {openCounts.roster_change} team changes and {openCounts.question} questions waiting. Approving a team change applies it to the roster.
          </p>
        </div>
        <button type="button" onClick={load} className={clsx(btn, 'border border-slate-300 dark:border-[#3D1418]')}>
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      <div className={clsx(box, 'space-y-3')}>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={closed} onChange={(e) => setClosed(e.target.checked)} className="accent-[#6C151E]" />
          Stop accepting new team change requests (questions stay open)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="Optional note shown above the team change form, e.g. the last date for changes"
          className="w-full rounded-lg border border-slate-300 dark:border-[#3D1418] bg-white dark:bg-[#1C0A0D] px-3 py-2 text-sm"
        />
        <div className="flex items-center gap-3">
          <button type="button" onClick={saveConfig} className={clsx(btn, 'bg-burgundy text-white')}>Save settings</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['open', 'closed', 'all'] as StatusFilter[]).map((s) => (
          <button key={s} type="button" onClick={() => setStatusFilter(s)} className={chip(statusFilter === s)}>
            {s === 'open' ? 'Waiting' : s === 'closed' ? 'Decided' : 'All'}
          </button>
        ))}
        <span className="w-px bg-slate-200 dark:bg-[#3D1418] mx-1" />
        {(
          [
            ['all', 'Everything'],
            ['roster_change', 'Team changes'],
            ['question', 'Questions'],
          ] as [KindFilter, string][]
        ).map(([k, label]) => (
          <button key={k} type="button" onClick={() => setKindFilter(k)} className={chip(kindFilter === k)}>
            {label}
          </button>
        ))}
      </div>

      {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</p>}
      {message && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900" role="status">
          {message}
        </p>
      )}

      {loading ? (
        <p className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading
        </p>
      ) : visible.length === 0 ? (
        <p className="text-sm text-slate-500 py-8 text-center">Nothing here.</p>
      ) : (
        <ul className="space-y-3">
          {visible.map((r) => (
            <RequestCard
              key={r.id}
              r={r}
              onDone={(m) => {
                setMessage(m);
                load();
              }}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
