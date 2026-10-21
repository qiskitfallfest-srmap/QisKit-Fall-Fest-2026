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
import { OFFER_LABEL, downloadCsv, whatsappLink } from './admin-csv';

type Row = AccommodationRequest & {
  team_name: string | null;
  /** On a team with an invited, accepted or confirmed Phase 2 offer */
  shortlisted: boolean;
  /** 'general_pass': not shortlisted but holds a General Pass; null: neither */
  group: 'shortlisted' | 'general_pass' | null;
  offer_status: string | null;
  current_institution: string | null;
  institution_confirmed: boolean;
  institution_confirm_source: 'confirmed' | 'edited' | null;
  contact_phone: string | null;
  phone_confirmed: boolean;
  emergency_name: string | null;
  emergency_phone: string | null;
};
type Unanswered = {
  email: string;
  name: string;
  role: 'Lead' | 'Member' | 'General Pass';
  teamName: string;
  offerStatus: string | null;
  institution: string | null;
  institutionConfirmed: boolean;
  phone: string | null;
  phoneConfirmed: boolean;
  emergencyName: string | null;
  emergencyPhone: string | null;
};
type InstitutionConfirmation = {
  registrations: number | null;
  confirmed: number | null;
  edited: number | null;
  shortlistedExternal: number;
  shortlistedExternalConfirmed: number;
};
type Filter = 'needs' | 'general_pass' | 'allocated' | 'not_needed' | 'not_eligible' | 'all';

const GENDERS: Gender[] = ['male', 'female', 'other'];

export function AdminAccommodationView() {
  const [rows, setRows] = useState<Row[]>([]);
  const [unanswered, setUnanswered] = useState<Unanswered[]>([]);
  const [confirmation, setConfirmation] = useState<InstitutionConfirmation | null>(null);
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
      setConfirmation(json.institutionConfirmation || null);
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

  // Bed counts are for shortlisted teams; General Pass holders are counted separately for the organizers to decide
  const wantsStay = (r: Row) => r.needs_accommodation && r.status !== 'cancelled';
  const staying = rows.filter((r) => r.group === 'shortlisted' && wantsStay(r));
  const passStaying = rows.filter((r) => r.group === 'general_pass' && wantsStay(r));
  const notEligible = rows.filter((r) => !r.group);

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
        const pass = passStaying.filter((r) => stayNights(r.check_in, r.check_out).includes(night)).length;
        return { night, counts, total: counts.male + counts.female + counts.other, pass };
      }),
    [staying, passStaying]
  );

  const visible = rows.filter((r) => {
    if (filter === 'needs' && !(r.group === 'shortlisted' && wantsStay(r))) return false;
    if (filter === 'general_pass' && r.group !== 'general_pass') return false;
    if (filter === 'not_eligible' && r.group) return false;
    if (filter === 'allocated' && r.status !== 'allocated') return false;
    if (filter === 'not_needed' && r.needs_accommodation) return false;
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    return [r.full_name, r.email, r.team_name, r.current_institution].some((v) => v?.toLowerCase().includes(q));
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
    downloadCsv(
      'accommodation-requests',
      [
        'Name', 'Email', 'Phone', 'Phone confirmed', 'Emergency contact', 'Emergency phone', 'Group', 'Phase 2 offer', 'Team', 'Institution', 'Institution confirmed',
        'Gender', 'Needs stay', 'Arrival (check-in)', 'Departure (check-out)', 'Nights', 'Notes', 'Status',
        'Allocation', 'Submitted by', 'Updated',
      ],
      rows.map((r) => [
        r.full_name,
        r.email,
        r.contact_phone,
        r.phone_confirmed ? 'Yes' : 'No',
        r.emergency_name,
        r.emergency_phone,
        r.group === 'shortlisted' ? 'Shortlisted' : r.group === 'general_pass' ? 'General Pass' : 'Not eligible',
        r.offer_status ? OFFER_LABEL[r.offer_status] || r.offer_status : '',
        r.team_name,
        r.current_institution,
        r.institution_confirmed ? (r.institution_confirm_source === 'edited' ? 'Yes (corrected)' : 'Yes') : 'No',
        r.gender ? GENDER_LABEL[r.gender] : '',
        r.needs_accommodation ? 'Yes' : 'No',
        r.check_in,
        r.check_out,
        stayNights(r.check_in, r.check_out).length || '',
        r.notes,
        r.status,
        r.allocation_notes,
        r.submitted_by,
        r.updated_at,
      ])
    );
  }

  function exportUnansweredCsv() {
    downloadCsv(
      'accommodation-not-answered',
      ['Name', 'Email', 'Phone', 'Phone confirmed', 'Emergency contact', 'Emergency phone', 'WhatsApp link', 'Role', 'Team', 'Phase 2 offer', 'Institution', 'Institution confirmed'],
      unanswered.map((u) => [
        u.name,
        u.email,
        u.phone,
        u.phoneConfirmed ? 'Yes' : 'No',
        u.emergencyName,
        u.emergencyPhone,
        whatsappLink(u.phone),
        u.role,
        u.teamName,
        u.offerStatus ? OFFER_LABEL[u.offerStatus] || u.offerStatus : '',
        u.institution,
        u.institutionConfirmed ? 'Yes' : 'No',
      ])
    );
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

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { label: 'Need a stay (shortlisted)', value: staying.length },
          { label: GENDER_LABEL.male, value: byGender.male },
          { label: GENDER_LABEL.female, value: byGender.female },
          { label: 'Other', value: byGender.other },
          { label: 'No stay needed', value: rows.filter((r) => r.group === 'shortlisted' && !r.needs_accommodation).length },
          { label: 'General Pass want a stay', value: passStaying.length },
          { label: 'Not answered', value: unanswered.length },
          { label: 'Not eligible', value: notEligible.length },
        ].map((t) => (
          <div key={t.label} className={tile}>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t.label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900 dark:text-[#FAF6F3]">{t.value}</p>
          </div>
        ))}
      </div>

      {confirmation && (
        <div className={tile}>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-[#FAF6F3]">Institution confirmations (profile banner)</h3>
          {confirmation.confirmed == null ? (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Not recorded yet: apply migration 20261021120000_registrations_institution_confirmation.sql.
            </p>
          ) : (
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-700 dark:text-slate-300">
              <p>
                <span className="font-semibold tabular-nums text-slate-900 dark:text-[#FAF6F3]">{confirmation.confirmed}</span> of{' '}
                <span className="tabular-nums">{confirmation.registrations}</span> registrations answered ({confirmation.edited}{' '}
                corrected, {(confirmation.confirmed ?? 0) - (confirmation.edited ?? 0)} kept as shown)
              </p>
              <p>
                Shortlisted external participants:{' '}
                <span className="font-semibold tabular-nums text-slate-900 dark:text-[#FAF6F3]">
                  {confirmation.shortlistedExternalConfirmed}
                </span>{' '}
                of <span className="tabular-nums">{confirmation.shortlistedExternal}</span> confirmed
              </p>
            </div>
          )}
        </div>
      )}

      <div className={tile}>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-[#FAF6F3] mb-3">Beds needed per night (shortlisted)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 dark:text-slate-400">
                <th className="py-2 pr-4 font-medium">Night of</th>
                <th className="py-2 pr-4 font-medium text-right">Male</th>
                <th className="py-2 pr-4 font-medium text-right">Female</th>
                <th className="py-2 pr-4 font-medium text-right">Other</th>
                <th className="py-2 pr-4 font-medium text-right">Total</th>
                <th className="py-2 font-medium text-right">General Pass (not booked)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#250D11] tabular-nums">
              {perNight.map((n) => (
                <tr key={n.night}>
                  <td className="py-2 pr-4">{formatStayDate(n.night)}</td>
                  <td className="py-2 pr-4 text-right">{n.counts.male}</td>
                  <td className="py-2 pr-4 text-right">{n.counts.female}</td>
                  <td className="py-2 pr-4 text-right">{n.counts.other}</td>
                  <td className="py-2 pr-4 text-right font-semibold">{n.total}</td>
                  <td className="py-2 text-right text-slate-500">{n.pass}</td>
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
              External participants who have not answered ({unanswered.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(unanswered.map((u) => u.email).join(', '))}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-[#3D1418] px-3 py-1.5 text-xs font-semibold cursor-pointer"
              >
                <Copy className="h-3.5 w-3.5" />
                Copy emails
              </button>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(unanswered.map((u) => u.phone).filter(Boolean).join(', '))}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-[#3D1418] px-3 py-1.5 text-xs font-semibold cursor-pointer"
              >
                <Copy className="h-3.5 w-3.5" />
                Copy phones
              </button>
              <button
                type="button"
                onClick={exportUnansweredCsv}
                className="inline-flex items-center gap-1.5 rounded-lg bg-burgundy text-white px-3 py-1.5 text-xs font-semibold cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                Export CSV
              </button>
            </div>
          </div>
          {unanswered.some((u) => !u.phone) && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {unanswered.filter((u) => !u.phone).length} have no phone number on file; reach them by email.
            </p>
          )}
          <ul className="text-sm divide-y divide-slate-100 dark:divide-[#250D11] max-h-64 overflow-y-auto">
            {unanswered.map((u) => (
              <li key={u.email} className="py-1.5 flex flex-wrap justify-between gap-2">
                <span>
                  {u.name}{' '}
                  <span className="text-xs text-slate-500">
                    {u.email}
                    {u.phone && ` · ${u.phone}${u.phoneConfirmed ? '' : ' (not confirmed)'}`}
                  </span>
                </span>
                <span className="text-xs text-slate-500">
                  {u.role === 'General Pass' ? 'General Pass' : u.teamName}
                  {u.offerStatus && ` · ${OFFER_LABEL[u.offerStatus] || u.offerStatus}`}
                </span>
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
              ['general_pass', `General Pass (${rows.filter((r) => r.group === 'general_pass').length})`],
              ['not_eligible', `Not eligible (${notEligible.length})`],
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
                        {r.group === 'general_pass' ? (
                          <span className="ml-2 rounded border border-sky-200 bg-sky-50 dark:border-sky-900 dark:bg-sky-950/30 px-1.5 py-0.5 text-[11px] font-medium text-sky-800 dark:text-sky-200">
                            General Pass
                          </span>
                        ) : r.group === 'shortlisted' ? (
                          r.offer_status && (
                            <span className="ml-2 rounded border border-slate-200 dark:border-[#3D1418] px-1.5 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                              Phase 2 {OFFER_LABEL[r.offer_status] || r.offer_status}
                            </span>
                          )
                        ) : (
                          <span className="ml-2 rounded border border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 px-1.5 py-0.5 text-[11px] font-medium text-amber-800 dark:text-amber-200">
                            Not eligible
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500 break-all">
                        {r.email}
                        {r.team_name && ` · ${r.team_name}`}
                        {r.contact_phone && ` · ${r.contact_phone}${r.phone_confirmed ? '' : ' (not confirmed)'}`}
                      </p>
                      {r.current_institution && (
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          {r.current_institution}
                          <span className={clsx('ml-1.5', r.institution_confirmed ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-400')}>
                            {r.institution_confirmed
                              ? r.institution_confirm_source === 'edited'
                                ? '(corrected by participant)'
                                : '(confirmed by participant)'
                              : '(not confirmed)'}
                          </span>
                        </p>
                      )}
                      {r.needs_accommodation ? (
                        <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
                          {formatStayDate(r.check_in!)} to {formatStayDate(r.check_out!)} · {nights} night{nights === 1 ? '' : 's'}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-500 mt-0.5">No stay needed</p>
                      )}
                      {r.emergency_phone && (
                        <p className="text-xs text-slate-500">
                          Emergency: {r.emergency_name} · {r.emergency_phone}
                        </p>
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
