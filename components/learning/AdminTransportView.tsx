'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { Bus, Clock, Copy, Download, Loader2, MapPin, Phone, RefreshCw, Search } from 'lucide-react';
import { SPECIAL_BUS_TRIPS, TRAVEL_DATES, boardingLabel, formatTravelDate, type TransportRequest } from '@/lib/transport';
import { OFFER_LABEL, downloadCsv, whatsappLink } from './admin-csv';

type Row = TransportRequest & {
  team_name: string | null;
  /** On a team with an invited, accepted or confirmed Phase 2 offer */
  shortlisted: boolean;
  /** 'general_pass': not shortlisted but holds a General Pass; null: neither */
  group: 'shortlisted' | 'general_pass' | null;
  offer_status: string | null;
  institution: string | null;
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
  phone: string | null;
  phoneConfirmed: boolean;
  emergencyName: string | null;
  emergencyPhone: string | null;
};
type Filter = 'needs' | 'general_pass' | 'own' | 'not_eligible' | 'all';

export function AdminTransportView() {
  const [rows, setRows] = useState<Row[]>([]);
  const [unanswered, setUnanswered] = useState<Unanswered[]>([]);
  const [shortlistedTotal, setShortlistedTotal] = useState(0);
  const [passTotal, setPassTotal] = useState(0);
  const [closed, setClosed] = useState(false);
  const [note, setNote] = useState('');
  const [pointsText, setPointsText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState<Filter>('needs');
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/transport', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to load.');
      setRows(json.requests);
      setUnanswered(json.unanswered);
      setShortlistedTotal(json.shortlistedTotal);
      setPassTotal(json.generalPassExternal || 0);
      setClosed(Boolean(json.config?.closed));
      setNote(json.config?.note || '');
      setPointsText((json.config?.boardingPoints || []).join('\n'));
    } catch (err: any) {
      setError(err?.message || 'Failed to load.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Seats cover shortlisted teams and external General Pass holders; anyone else is listed under "Not eligible"
  const riding = rows.filter((r) => r.group && r.needs_transport);
  const notEligible = rows.filter((r) => !r.group);

  // Seats per boarding point per day
  const byPoint = useMemo(() => {
    const out = new Map<string, Record<string, number>>();
    for (const r of riding) {
      const label = boardingLabel(r);
      const counts = out.get(label) || Object.fromEntries(TRAVEL_DATES.map((d) => [d, 0]));
      for (const d of r.travel_dates) if (d in counts) counts[d] += 1;
      out.set(label, counts);
    }
    return Array.from(out, ([point, counts]) => ({
      point,
      counts,
      people: riding.filter((r) => boardingLabel(r) === point).length,
    })).sort((a, b) => b.people - a.people);
  }, [riding]);

  const visible = rows.filter((r) => {
    if (filter === 'needs' && !(r.group && r.needs_transport)) return false;
    if (filter === 'general_pass' && r.group !== 'general_pass') return false;
    if (filter === 'own' && r.needs_transport) return false;
    if (filter === 'not_eligible' && r.group) return false;
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    return [r.full_name, r.email, r.team_name, r.institution, boardingLabel(r)].some((v) => v?.toLowerCase().includes(q));
  });

  async function saveConfig() {
    setMessage('');
    const res = await fetch('/api/admin/transport', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ closed, note, boardingPoints: pointsText.split('\n') }),
    });
    const json = await res.json().catch(() => ({}));
    setMessage(res.ok && json.success ? 'Settings saved.' : json.error || 'Failed to save settings.');
  }

  function exportCsv() {
    downloadCsv(
      'bus-travel',
      ['Name', 'Email', 'Phone', 'Phone confirmed', 'Emergency contact', 'Emergency phone', 'Group', 'Phase 2 offer', 'Team', 'Institution', 'Needs bus', 'Boarding point', ...TRAVEL_DATES.map(formatTravelDate), 'Notes', 'Submitted by', 'Updated'],
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
        r.institution,
        r.needs_transport ? 'Yes' : 'No',
        boardingLabel(r),
        ...TRAVEL_DATES.map((d) => (r.travel_dates.includes(d) ? 'Yes' : '')),
        r.notes,
        r.submitted_by,
        r.updated_at,
      ])
    );
  }

  function exportUnansweredCsv() {
    downloadCsv(
      'bus-travel-not-answered',
      ['Name', 'Email', 'Phone', 'Phone confirmed', 'Emergency contact', 'Emergency phone', 'WhatsApp link', 'Role', 'Team', 'Phase 2 offer', 'Institution'],
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
      ])
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-12 justify-center text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading bus travel answers
      </div>
    );
  }

  const tile = 'rounded-xl border border-slate-200 dark:border-[#3D1418] bg-white dark:bg-[#150709] p-4';
  const outline = 'inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-[#3D1418] px-3 py-1.5 text-xs font-semibold cursor-pointer';

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-[#FAF6F3]">SRM bus travel</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Asked of shortlisted teams and external General Pass holders on /learning/profile. Leads can answer for teammates.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={load} className={clsx(outline, 'py-2')}>
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
          { label: 'Shortlisted participants', value: shortlistedTotal },
          { label: 'External General Pass', value: passTotal },
          { label: 'Need the bus', value: riding.length },
          { label: 'Own arrangement', value: rows.filter((r) => r.group && !r.needs_transport).length },
          { label: 'Not answered', value: unanswered.length },
          { label: 'Not eligible', value: notEligible.length },
        ].map((t) => (
          <div key={t.label} className={tile}>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t.label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900 dark:text-[#FAF6F3]">{t.value}</p>
          </div>
        ))}
      </div>

      {/* Official Special Bus Trips Allocation */}
      <div className={clsx(tile, 'space-y-3')}>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-[#250D11] pb-3">
          <div className="flex items-center gap-2">
            <Bus className="w-5 h-5 text-burgundy dark:text-[#E89BA5]" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-[#FAF6F3]">
                Allocated Special Bus Trips (26.10.2026 to 30.10.2026)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Exclusive to external participants who opted for daily bus transport.
              </p>
            </div>
          </div>
          <span className="font-mono text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-md">
            2 Vehicles Assigned · 5 Days
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {SPECIAL_BUS_TRIPS.map((trip) => (
            <div
              key={trip.sno}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-[#3D1418] bg-slate-50/70 dark:bg-[#150709] space-y-2.5"
            >
              <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 dark:border-[#250D11] pb-2">
                <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-burgundy dark:text-[#E89BA5]" />
                  {trip.route}
                </span>
                <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                  {trip.vehicleNo}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Boarding Route
                </span>
                <p className="font-medium text-slate-800 dark:text-slate-200">
                  {trip.boardingPoints.join(' → ')}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
                <div>
                  <span className="text-[10px] uppercase text-slate-400 block">Morning Reporting</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {trip.reportingTime}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-400 block">Evening Return</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {trip.returnTime}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 dark:border-[#250D11] flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] uppercase text-slate-400 block">Assigned Driver</span>
                  <span className="font-medium text-slate-900 dark:text-white">{trip.driverName}</span>
                </div>
                <a
                  href={`tel:${trip.driverPhone}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-700 dark:bg-slate-200 dark:hover:bg-white dark:text-slate-900 text-white font-mono text-xs font-semibold"
                >
                  <Phone className="w-3 h-3" />
                  <span>{trip.driverPhoneDisplay}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={tile}>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-[#FAF6F3] mb-3">Seats per boarding point</h3>
        {byPoint.length === 0 ? (
          <p className="text-sm text-slate-500">No one has asked for the bus yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 dark:text-slate-400">
                  <th className="py-2 pr-4 font-medium">Boarding point</th>
                  <th className="py-2 pr-4 font-medium text-right">People</th>
                  {TRAVEL_DATES.map((d, i) => (
                    <th key={d} className="py-2 pr-4 font-medium text-right" title={formatTravelDate(d)}>
                      Day {i + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#250D11] tabular-nums">
                {byPoint.map((p) => (
                  <tr key={p.point}>
                    <td className="py-2 pr-4">{p.point}</td>
                    <td className="py-2 pr-4 text-right font-semibold">{p.people}</td>
                    {TRAVEL_DATES.map((d) => (
                      <td key={d} className="py-2 pr-4 text-right">
                        {p.counts[d]}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="font-semibold">
                  <td className="py-2 pr-4">Total</td>
                  <td className="py-2 pr-4 text-right">{riding.length}</td>
                  {TRAVEL_DATES.map((d) => (
                    <td key={d} className="py-2 pr-4 text-right">
                      {riding.filter((r) => r.travel_dates.includes(d)).length}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className={clsx(tile, 'space-y-3')}>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-[#FAF6F3]">Participant form</h3>
        <div>
          <label htmlFor="bus-points" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Boarding points, one per line (participants can also choose Other and type a place)
          </label>
          <textarea
            id="bus-points"
            value={pointsText}
            onChange={(e) => setPointsText(e.target.value)}
            rows={5}
            className="w-full rounded-lg border border-slate-300 dark:border-[#3D1418] bg-white dark:bg-[#1C0A0D] px-3 py-2 text-sm"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={closed} onChange={(e) => setClosed(e.target.checked)} className="accent-[#6C151E]" />
          Close responses (participants can no longer add or edit)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="Optional note shown above the form, e.g. pickup time or contact number"
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
              Not answered ({unanswered.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => navigator.clipboard.writeText(unanswered.map((u) => u.email).join(', '))} className={outline}>
                <Copy className="h-3.5 w-3.5" />
                Copy emails
              </button>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(unanswered.map((u) => u.phone).filter(Boolean).join(', '))}
                className={outline}
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
              ['needs', 'Need the bus'],
              ['own', 'Own arrangement'],
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
              placeholder="Search name, email, team, place"
              className="w-full rounded-lg border border-slate-300 dark:border-[#3D1418] bg-white dark:bg-[#1C0A0D] pl-8 pr-3 py-1.5 text-sm"
            />
          </div>
        </div>

        {visible.length === 0 ? (
          <p className="text-sm text-slate-500 py-6 text-center">No answers in this view.</p>
        ) : (
          <ul className="space-y-2">
            {visible.map((r) => (
              <li key={r.id} className={tile}>
                <p className="text-sm font-semibold text-slate-900 dark:text-[#FAF6F3]">
                  {r.full_name}
                  {r.group === 'general_pass' && (
                    <span className="ml-2 rounded border border-sky-200 bg-sky-50 dark:border-sky-900 dark:bg-sky-950/30 px-1.5 py-0.5 text-[11px] font-medium text-sky-800 dark:text-sky-200">
                      General Pass
                    </span>
                  )}
                  {!r.group && (
                    <span className="ml-2 rounded border border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 px-1.5 py-0.5 text-[11px] font-medium text-amber-800 dark:text-amber-200">
                      Not eligible
                    </span>
                  )}
                </p>
                <p className="text-xs text-slate-500 break-all">
                  {r.email}
                  {r.team_name && ` · ${r.team_name}`}
                  {r.institution && ` · ${r.institution}`}
                  {r.contact_phone && ` · ${r.contact_phone}${r.phone_confirmed ? '' : ' (not confirmed)'}`}
                </p>
                {r.needs_transport ? (
                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
                    From {boardingLabel(r)} ·{' '}
                    {r.travel_dates.length === TRAVEL_DATES.length
                      ? 'all 5 days'
                      : r.travel_dates.map((d) => `Day ${TRAVEL_DATES.indexOf(d) + 1}`).join(', ')}
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 mt-0.5">Own arrangement</p>
                )}
                {r.emergency_phone && (
                  <p className="text-xs text-slate-500">
                    Emergency: {r.emergency_name} · {r.emergency_phone}
                  </p>
                )}
                {r.notes && <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 whitespace-pre-line">Note: {r.notes}</p>}
                {r.submitted_by !== r.email && <p className="text-[11px] text-slate-400 mt-0.5">Submitted by {r.submitted_by}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
