'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { Copy, Download, Loader2, RefreshCw, Search } from 'lucide-react';
import {
  ACCOMMODATION_DATES,
  GENDER_LABEL,
  formatStayDate,
  stayNights,
  type AccommodationRequest,
  type Gender,
} from '@/lib/accommodation';

type Row = AccommodationRequest & { team_name: string | null };
type Filter = 'needs' | 'allocated' | 'not_needed' | 'all';

const GENDERS: Gender[] = ['male', 'female', 'other'];

function csvCell(v: unknown) {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function AdminAccommodationView() {
  const [rows, setRows] = useState<Row[]>([]);
  const [unanswered, setUnanswered] = useState<{ email: string; name: string; teamName: string }[]>([]);
  const [closed, setClosed] = useState(false);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState<Filter>('needs');
  const [query, setQuery] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [allocDrafts, setAllocDrafts] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/accommodation', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to load.');
      setRows(json.requests);
      setUnanswered(json.unanswered);
      setClosed(Boolean(json.config?.closed));
      setNote(json.config?.note || '');
    } catch (err: any) {
      setError(err?.message || 'Failed to load.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const staying = rows.filter((r) => r.needs_accommodation && r.status !== 'cancelled');

  const byGender = useMemo(() => {
    const out: Record<Gender, number> = { male: 0, female: 0, other: 0 };
    for (const r of staying) if (r.gender) out[r.gender] += 1;
    return out;
  }, [staying]);

  const perNight = useMemo(
    () =>
      ACCOMMODATION_DATES.slice(0, -1).map((night) => {
        const counts: Record<Gender, number> = { male: 0, female: 0, other: 0 };
        for (const r of staying) {
          if (r.gender && stayNights(r.check_in, r.check_out).includes(night)) counts[r.gender] += 1;
        }
        return { night, counts, total: counts.male + counts.female + counts.other };
      }),
    [staying]
  );

  const visible = rows.filter((r) => {
    if (filter === 'needs' && !(r.needs_accommodation && r.status !== 'cancelled')) return false;
    if (filter === 'allocated' && r.status !== 'allocated') return false;
    if (filter === 'not_needed' && r.needs_accommodation) return false;
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    return [r.full_name, r.email, r.team_name, r.institution].some((v) => v?.toLowerCase().includes(q));
  });

  async function saveConfig() {
    setMessage('');
    const res = await fetch('/api/admin/accommodation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ closed, note }),
    });
    const json = await res.json().catch(() => ({}));
    setMessage(res.ok && json.success ? 'Settings saved.' : json.error || 'Failed to save settings.');
  }

  async function update(row: Row, patch: { status?: string; allocationNotes?: string }) {
    setSavingId(row.id);
    try {
      const res = await fetch('/api/admin/accommodation', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: row.id, ...patch }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Update failed.');
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, ...json.request } : r)));
    } catch (err: any) {
      setError(err?.message || 'Update failed.');
    } finally {
      setSavingId(null);
    }
  }

  function exportCsv() {
    const header = ['Name', 'Email', 'Team', 'Institution', 'Gender', 'Needs stay', 'Check-in', 'Check-out', 'Nights', 'Phone', 'Notes', 'Status', 'Allocation', 'Submitted by', 'Updated'];
    const lines = rows.map((r) =>
      [
        r.full_name,
        r.email,
        r.team_name,
        r.institution,
        r.gender ? GENDER_LABEL[r.gender] : '',
        r.needs_accommodation ? 'Yes' : 'No',
        r.check_in,
        r.check_out,
        stayNights(r.check_in, r.check_out).length || '',
        r.phone,
        r.notes,
        r.status,
        r.allocation_notes,
        r.submitted_by,
        r.updated_at,
      ]
        .map(csvCell)
        .join(',')
    );
    const blob = new Blob([[header.join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accommodation-requests-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-12 justify-center text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading accommodation requests
      </div>
    );
  }

  const tile = 'rounded-xl border border-slate-200 dark:border-[#3D1418] bg-white dark:bg-[#150709] p-4';

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-[#FAF6F3]">Accommodation (external participants)</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Participants answer on /learning/profile. Leads can answer for external teammates.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={load} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-[#3D1418] px-3 py-2 text-xs font-semibold cursor-pointer">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
          <button type="button" onClick={exportCsv} className="inline-flex items-center gap-1.5 rounded-lg bg-burgundy text-white px-3 py-2 text-xs font-semibold cursor-pointer">
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Need a stay', value: staying.length },
          { label: GENDER_LABEL.male, value: byGender.male },
          { label: GENDER_LABEL.female, value: byGender.female },
          { label: 'Other', value: byGender.other },
          { label: 'No stay needed', value: rows.filter((r) => !r.needs_accommodation).length },
          { label: 'Phase 2 not answered', value: unanswered.length },
        ].map((t) => (
          <div key={t.label} className={tile}>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t.label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900 dark:text-[#FAF6F3]">{t.value}</p>
          </div>
        ))}
      </div>

      <div className={tile}>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-[#FAF6F3] mb-3">Beds needed per night</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 dark:text-slate-400">
                <th className="py-2 pr-4 font-medium">Night of</th>
                <th className="py-2 pr-4 font-medium text-right">Male</th>
                <th className="py-2 pr-4 font-medium text-right">Female</th>
                <th className="py-2 pr-4 font-medium text-right">Other</th>
                <th className="py-2 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#250D11] tabular-nums">
              {perNight.map((n) => (
                <tr key={n.night}>
                  <td className="py-2 pr-4">{formatStayDate(n.night)}</td>
                  <td className="py-2 pr-4 text-right">{n.counts.male}</td>
                  <td className="py-2 pr-4 text-right">{n.counts.female}</td>
                  <td className="py-2 pr-4 text-right">{n.counts.other}</td>
                  <td className="py-2 text-right font-semibold">{n.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={clsx(tile, 'space-y-3')}>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-[#FAF6F3]">Participant form</h3>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={closed} onChange={(e) => setClosed(e.target.checked)} className="accent-[#6C151E]" />
          Close requests (participants can no longer add or edit)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="Optional note shown above the form, e.g. location, cost, reporting time"
          className="w-full rounded-lg border border-slate-300 dark:border-[#3D1418] bg-white dark:bg-[#1C0A0D] px-3 py-2 text-sm"
        />
        <div className="flex items-center gap-3">
          <button type="button" onClick={saveConfig} className="rounded-lg bg-burgundy text-white px-3 py-2 text-xs font-semibold cursor-pointer">
            Save settings
          </button>
          {message && <span className="text-xs text-slate-600 dark:text-slate-300">{message}</span>}
        </div>
      </div>

      {unanswered.length > 0 && (
        <div className={clsx(tile, 'space-y-2')}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-[#FAF6F3]">
              External Phase 2 members who have not answered ({unanswered.length})
            </h3>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(unanswered.map((u) => u.email).join(', '))}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-[#3D1418] px-3 py-1.5 text-xs font-semibold cursor-pointer"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy emails
            </button>
          </div>
          <ul className="text-sm divide-y divide-slate-100 dark:divide-[#250D11] max-h-64 overflow-y-auto">
            {unanswered.map((u) => (
              <li key={u.email} className="py-1.5 flex flex-wrap justify-between gap-2">
                <span>{u.name} <span className="text-xs text-slate-500">{u.email}</span></span>
                <span className="text-xs text-slate-500">{u.teamName}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              ['needs', 'Need a stay'],
              ['allocated', 'Allocated'],
              ['not_needed', 'No stay needed'],
              ['all', 'All'],
            ] as [Filter, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={clsx(
                'rounded-full border px-3 py-1 text-xs font-semibold cursor-pointer',
                filter === id
                  ? 'border-burgundy bg-burgundy text-white'
                  : 'border-slate-300 dark:border-[#3D1418] text-slate-600 dark:text-slate-300'
              )}
            >
              {label}
            </button>
          ))}
          <div className="relative ml-auto w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email, team"
              className="w-full rounded-lg border border-slate-300 dark:border-[#3D1418] bg-white dark:bg-[#1C0A0D] pl-8 pr-3 py-1.5 text-sm"
            />
          </div>
        </div>

        {visible.length === 0 ? (
          <p className="text-sm text-slate-500 py-6 text-center">No requests in this view.</p>
        ) : (
          <ul className="space-y-2">
            {visible.map((r) => {
              const nights = stayNights(r.check_in, r.check_out).length;
              const draft = allocDrafts[r.id] ?? r.allocation_notes ?? '';
              return (
                <li key={r.id} className={clsx(tile, 'space-y-2')}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-[#FAF6F3]">
                        {r.full_name}
                        {r.gender && <span className="ml-2 text-xs font-normal text-slate-500">{GENDER_LABEL[r.gender]}</span>}
                      </p>
                      <p className="text-xs text-slate-500 break-all">
                        {r.email}
                        {r.team_name && ` · ${r.team_name}`}
                        {r.institution && ` · ${r.institution}`}
                        {r.phone && ` · ${r.phone}`}
                      </p>
                      {r.needs_accommodation ? (
                        <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
                          {formatStayDate(r.check_in!)} to {formatStayDate(r.check_out!)} · {nights} night{nights === 1 ? '' : 's'}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-500 mt-0.5">No stay needed</p>
                      )}
                      {r.notes && <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 whitespace-pre-line">Note: {r.notes}</p>}
                      {r.submitted_by !== r.email && <p className="text-[11px] text-slate-400 mt-0.5">Submitted by {r.submitted_by}</p>}
                    </div>
                    <select
                      value={r.status}
                      disabled={savingId === r.id}
                      onChange={(e) => update(r, { status: e.target.value })}
                      aria-label={`Status for ${r.full_name}`}
                      className="rounded-lg border border-slate-300 dark:border-[#3D1418] bg-white dark:bg-[#1C0A0D] px-2 py-1.5 text-xs"
                    >
                      <option value="requested">Requested</option>
                      <option value="allocated">Allocated</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  {r.needs_accommodation && (
                    <div className="flex gap-2">
                      <input
                        value={draft}
                        onChange={(e) => setAllocDrafts((d) => ({ ...d, [r.id]: e.target.value }))}
                        placeholder="Allocation shown to participant, e.g. Hostel B, Room 214"
                        className="flex-1 min-w-0 rounded-lg border border-slate-300 dark:border-[#3D1418] bg-white dark:bg-[#1C0A0D] px-2.5 py-1.5 text-xs"
                      />
                      <button
                        type="button"
                        disabled={savingId === r.id || draft === (r.allocation_notes ?? '')}
                        onClick={() => update(r, { allocationNotes: draft })}
                        className="rounded-lg border border-slate-300 dark:border-[#3D1418] px-3 py-1.5 text-xs font-semibold cursor-pointer disabled:opacity-50"
                      >
                        Save
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
