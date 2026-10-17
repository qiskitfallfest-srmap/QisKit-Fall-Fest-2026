'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Ticket,
  Award,
  Search,
  RefreshCw,
  Download,
  ExternalLink,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Copy,
  Check,
  RotateCcw,
  Inbox,
} from 'lucide-react';
import clsx from 'clsx';

type PaymentType = 'pass' | 'certificate';
type ReviewStatus = 'pending' | 'verified' | 'rejected';
type StatusFilter = ReviewStatus | 'all' | 'checked_in' | 'to_deliver';
type DeliveryMode = 'ceremony' | 'email';

const DELIVERY_LABEL: Record<DeliveryMode, string> = {
  ceremony: 'Valedictory ceremony (in person)',
  email: 'Email',
};

interface PaymentItem {
  id: string;
  type: PaymentType;
  name: string;
  email: string;
  institution: string | null;
  phone: string | null;
  transactionReference: string;
  bankReference: string | null;
  receiptUrl: string | null;
  amountInr: number | null;
  paymentMode: string;
  status: ReviewStatus;
  adminNotes: string | null;
  reviewedBy: string | null;
  createdAt: string;
  updatedAt: string | null;
  checkedIn?: boolean;
  checkedInAt?: string | null;
  certificateSerial?: string | null;
  deliveryMode?: DeliveryMode | null;
  deliveredAt?: string | null;
  deliveredBy?: string | null;
  courseProgress: string | null;
  otherPurchaseStatus: ReviewStatus | null;
  flags: string[];
}

interface Metrics {
  pass: { pending: number; verified: number; rejected: number; checkedIn: number };
  certificate: { pending: number; verified: number; rejected: number; toDeliver: number };
}

const EMPTY_METRICS: Metrics = {
  pass: { pending: 0, verified: 0, rejected: 0, checkedIn: 0 },
  certificate: { pending: 0, verified: 0, rejected: 0, toDeliver: 0 },
};

const TYPE_META: Record<PaymentType, { label: string; short: string; other: string }> = {
  pass: { label: 'General Offline Pass', short: 'Offline Pass', other: 'Certificate' },
  certificate: { label: 'Course Certificate', short: 'Certificate', other: 'Offline Pass' },
};

const STATUS_STYLE: Record<ReviewStatus, string> = {
  pending:
    'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
  verified:
    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
  rejected:
    'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
};

const STATUS_LABEL: Record<ReviewStatus, string> = {
  pending: 'Pending',
  verified: 'Verified',
  rejected: 'Rejected',
};

const CARD = 'bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-xl';

function StatusBadge({ status }: { status: ReviewStatus }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-mono font-bold uppercase tracking-wider',
        STATUS_STYLE[status]
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

function formatTime(iso: string | null | undefined) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function isImageUrl(url: string) {
  return /\.(png|jpe?g|webp|gif)$/i.test(url.split('?')[0]);
}

function csvCell(value: unknown) {
  const s = value == null ? '' : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function AdminPaymentsManager() {
  const [type, setType] = useState<PaymentType>('pass');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [items, setItems] = useState<PaymentItem[]>([]);
  const [metrics, setMetrics] = useState<Metrics>(EMPTY_METRICS);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [actionPending, setActionPending] = useState(false);
  const [actionError, setActionError] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const params = new URLSearchParams({ type, status: statusFilter });
      if (debouncedSearch) params.set('search', debouncedSearch);
      const res = await fetch(`/api/admin/payments?${params.toString()}`, { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Failed to load payments.');
      setItems(json.items || []);
      setMetrics(json.metrics || EMPTY_METRICS);
    } catch (err: any) {
      setLoadError(err?.message || 'Failed to load payments.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [type, statusFilter, debouncedSearch]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Keep a valid selection: first item when the current one leaves the list
  useEffect(() => {
    if (!items.length) {
      setSelectedId(null);
    } else if (!items.some((i) => i.id === selectedId)) {
      setSelectedId(items[0].id);
    }
  }, [items, selectedId]);

  const selected = useMemo(
    () => items.find((i) => i.id === selectedId) || null,
    [items, selectedId]
  );

  useEffect(() => {
    setNotes(selected?.adminNotes || '');
    setActionError('');
  }, [selected?.id, selected?.adminNotes]);

  function switchType(next: PaymentType) {
    if (next === type) return;
    setType(next);
    if (statusFilter === 'checked_in' || statusFilter === 'to_deliver') setStatusFilter('pending');
  }

  async function decide(
    action: 'approve' | 'reject' | 'reopen' | 'mark_delivered' | 'unmark_delivered'
  ) {
    if (!selected) return;
    if (action === 'reject' && !notes.trim()) {
      setActionError('Enter a rejection reason. The participant sees it on their dashboard.');
      return;
    }
    setActionPending(true);
    setActionError('');
    try {
      const res = await fetch('/api/admin/payments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id: selected.id, action, notes }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Update failed.');

      // Move to the next item in the queue, then refresh counts and list
      const idx = items.findIndex((i) => i.id === selected.id);
      const next = items[idx + 1] || items[idx - 1];
      const leavesView =
        statusFilter === 'to_deliver'
          ? action === 'mark_delivered'
          : statusFilter !== 'all' && statusFilter !== 'checked_in' && statusFilter !== json.status;
      if (leavesView) {
        setSelectedId(next?.id || null);
      }
      await fetchItems();
    } catch (err: any) {
      setActionError(err?.message || 'Update failed.');
    } finally {
      setActionPending(false);
    }
  }

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  }

  function exportCsv() {
    if (!items.length) return;
    const headers = [
      'Type',
      'Name',
      'Email',
      'Institution',
      'Phone',
      'Amount INR',
      'Easebuzz Txn ID',
      'Bank Ref',
      'Status',
      'Admin Notes',
      'Reviewed By',
      type === 'pass' ? 'Checked In' : 'Certificate Serial',
      'Delivery Mode',
      'Delivered At',
      'Receipt URL',
      'Submitted At',
    ];
    const rows = items.map((p) => [
      TYPE_META[p.type].short,
      p.name,
      p.email,
      p.institution,
      p.phone,
      p.amountInr,
      p.transactionReference,
      p.bankReference,
      p.status,
      p.adminNotes,
      p.reviewedBy,
      type === 'pass' ? (p.checkedIn ? 'YES' : 'NO') : p.certificateSerial,
      p.deliveryMode || '',
      p.deliveredAt || '',
      p.receiptUrl,
      p.createdAt,
    ]);
    const csv = [headers, ...rows].map((r) => r.map(csvCell).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `qff26_${type}_payments_${statusFilter}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const m = metrics[type];
  const statusTabs: { key: StatusFilter; label: string; count?: number }[] = [
    { key: 'pending', label: 'Pending', count: m.pending },
    { key: 'verified', label: 'Verified', count: m.verified },
    { key: 'rejected', label: 'Rejected', count: m.rejected },
    ...(type === 'pass'
      ? [{ key: 'checked_in' as StatusFilter, label: 'Checked in', count: metrics.pass.checkedIn }]
      : [{ key: 'to_deliver' as StatusFilter, label: 'To deliver', count: metrics.certificate.toDeliver }]),
    { key: 'all', label: 'All' },
  ];

  return (
    <div className="space-y-4">
      {/* Purchase type switch */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(['pass', 'certificate'] as PaymentType[]).map((t) => {
          const active = t === type;
          const tm = metrics[t];
          const Icon = t === 'pass' ? Ticket : Award;
          return (
            <button
              key={t}
              type="button"
              onClick={() => switchType(t)}
              className={clsx(
                CARD,
                'p-4 text-left transition-colors cursor-pointer',
                active
                  ? 'ring-2 ring-burgundy/70 dark:ring-[#E89BA5]/60 border-transparent'
                  : 'hover:border-slate-300 dark:hover:border-[#5A1E24]'
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-[#FAF6F3]">
                  <Icon className="w-4 h-4 text-burgundy dark:text-[#E89BA5]" />
                  {TYPE_META[t].label}
                  <span className="font-mono text-[11px] font-semibold text-slate-400">₹99</span>
                </span>
                {tm.pending > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px] font-bold">
                    {tm.pending} to review
                  </span>
                )}
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                <span>
                  <strong className="block font-serif text-lg text-slate-900 dark:text-[#FAF6F3]">
                    {tm.verified}
                  </strong>
                  verified
                </span>
                <span>
                  <strong className="block font-serif text-lg text-slate-900 dark:text-[#FAF6F3]">
                    ₹{(tm.verified * 99).toLocaleString('en-IN')}
                  </strong>
                  collected
                </span>
                <span>
                  <strong className="block font-serif text-lg text-slate-900 dark:text-[#FAF6F3]">
                    {t === 'pass' ? metrics.pass.checkedIn : metrics.certificate.toDeliver}
                  </strong>
                  {t === 'pass' ? 'checked in' : 'to deliver'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className={clsx(CARD, 'p-3 flex flex-col lg:flex-row lg:items-center gap-3')}>
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {statusTabs.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setStatusFilter(s.key)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer',
                statusFilter === s.key
                  ? 'bg-slate-900 text-white dark:bg-[#FAF6F3] dark:text-[#150709]'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1C0A0D]'
              )}
            >
              {s.label}
              {s.count !== undefined && <span className="ml-1.5 font-mono opacity-70">{s.count}</span>}
            </button>
          ))}
        </div>

        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name, email, institution or transaction ID"
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 dark:border-[#3D1418] rounded-lg bg-slate-50 dark:bg-[#1C0A0D] text-slate-900 dark:text-[#FAF6F3] focus:outline-none focus:ring-1 focus:ring-burgundy"
            />
          </div>
          <button
            type="button"
            onClick={() => fetchItems()}
            className="p-1.5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#3D1418] rounded-lg hover:bg-slate-50 dark:hover:bg-[#1C0A0D] cursor-pointer"
            title="Refresh"
            aria-label="Refresh"
          >
            <RefreshCw className={clsx('w-4 h-4', loading && 'animate-spin')} />
          </button>
          <button
            type="button"
            onClick={exportCsv}
            disabled={!items.length}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#3D1418] rounded-lg hover:bg-slate-50 dark:hover:bg-[#1C0A0D] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {loadError && (
        <p className="text-xs text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg p-3">
          {loadError}
        </p>
      )}

      {/* Queue + decision panel */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 items-start">
        {/* Queue */}
        <div className={clsx(CARD, 'overflow-hidden')}>
          <div className="px-4 py-2.5 border-b border-slate-100 dark:border-[#3D1418] font-mono text-[10px] uppercase tracking-wider text-slate-500 flex justify-between">
            <span>{TYPE_META[type].short} submissions</span>
            <span>{items.length}{items.length === 500 ? '+' : ''}</span>
          </div>
          <ul className="max-h-[70vh] overflow-y-auto divide-y divide-slate-100 dark:divide-[#200A0E]">
            {loading && !items.length ? (
              <li className="px-4 py-10 text-center text-xs text-slate-400">Loading...</li>
            ) : !items.length ? (
              <li className="px-4 py-10 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                <Inbox className="w-5 h-5" />
                {statusFilter === 'pending' ? 'Nothing waiting for review.' : 'No submissions match this filter.'}
              </li>
            ) : (
              items.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(p.id)}
                    className={clsx(
                      'w-full text-left px-4 py-3 flex items-start gap-3 transition-colors cursor-pointer',
                      p.id === selectedId
                        ? 'bg-slate-100 dark:bg-[#250D11]'
                        : 'hover:bg-slate-50 dark:hover:bg-[#1A090C]'
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-[#FAF6F3] truncate">{p.name}</p>
                      <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400 truncate">{p.email}</p>
                      <p className="font-mono text-[10px] text-slate-400 mt-0.5 truncate">
                        {p.transactionReference} · {formatTime(p.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <StatusBadge status={p.status} />
                      {p.flags.length > 0 && (
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                          <AlertTriangle className="w-3 h-3" />
                          {p.flags.length}
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Decision panel */}
        <div className={clsx(CARD, 'lg:sticky lg:top-4')}>
          {!selected ? (
            <div className="p-10 text-center text-xs text-slate-400">Select a submission to review.</div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-[#3D1418]">
              {/* Identity */}
              <div className="p-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-[#FAF6F3]">{selected.name}</h3>
                  <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400 break-all">{selected.email}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {[selected.institution, selected.phone].filter(Boolean).join(' · ') || 'No registration details'}
                  </p>
                </div>
                <StatusBadge status={selected.status} />
              </div>

              {/* Payment facts */}
              <dl className="p-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-xs">
                <dt className="text-slate-500">Purchase</dt>
                <dd className="text-slate-800 dark:text-slate-200 font-semibold">
                  {TYPE_META[selected.type].label}
                  {selected.amountInr != null && <span className="font-mono"> · ₹{selected.amountInr}</span>}
                </dd>

                <dt className="text-slate-500">Easebuzz Txn ID</dt>
                <dd className="flex items-center gap-1.5 min-w-0">
                  <code className="font-mono font-bold text-slate-900 dark:text-[#FAF6F3] break-all">
                    {selected.transactionReference}
                  </code>
                  <button
                    type="button"
                    onClick={() => copy(selected.transactionReference, 'txn')}
                    className="p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                    aria-label="Copy transaction ID"
                  >
                    {copied === 'txn' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </dd>

                {selected.bankReference && (
                  <>
                    <dt className="text-slate-500">Bank ref</dt>
                    <dd className="font-mono text-slate-700 dark:text-slate-300 break-all">{selected.bankReference}</dd>
                  </>
                )}

                <dt className="text-slate-500">Submitted</dt>
                <dd className="text-slate-700 dark:text-slate-300">{formatTime(selected.createdAt)}</dd>

                {selected.type === 'certificate' && (
                  <>
                    <dt className="text-slate-500">Course</dt>
                    <dd className="text-slate-700 dark:text-slate-300">
                      {selected.certificateSerial ? (
                        <a
                          href={`/verify-certificate/${selected.certificateSerial}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-burgundy dark:text-[#E89BA5] hover:underline inline-flex items-center gap-1"
                        >
                          Issued {selected.certificateSerial}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        selected.courseProgress || (selected.status === 'pending' ? 'Checking...' : 'Not issued')
                      )}
                    </dd>
                  </>
                )}

                {selected.type === 'certificate' && (
                  <>
                    <dt className="text-slate-500">Delivery</dt>
                    <dd className="text-slate-700 dark:text-slate-300">
                      {selected.deliveryMode ? DELIVERY_LABEL[selected.deliveryMode] : 'Not chosen (legacy)'}
                      {selected.deliveredAt && (
                        <span className="block text-[11px] text-emerald-700 dark:text-emerald-400">
                          Delivered {formatTime(selected.deliveredAt)}
                          {selected.deliveredBy ? ` by ${selected.deliveredBy}` : ''}
                        </span>
                      )}
                    </dd>
                  </>
                )}

                {selected.type === 'pass' && (
                  <>
                    <dt className="text-slate-500">Gate</dt>
                    <dd className="text-slate-700 dark:text-slate-300">
                      {selected.checkedIn ? `Checked in ${formatTime(selected.checkedInAt)}` : 'Not checked in'}
                    </dd>
                  </>
                )}

                <dt className="text-slate-500">{TYPE_META[selected.type].other}</dt>
                <dd className="text-slate-700 dark:text-slate-300">
                  {selected.otherPurchaseStatus ? STATUS_LABEL[selected.otherPurchaseStatus] : 'Not purchased'}
                </dd>

                {selected.reviewedBy && (
                  <>
                    <dt className="text-slate-500">Reviewed by</dt>
                    <dd className="font-mono text-[11px] text-slate-500 break-all">{selected.reviewedBy}</dd>
                  </>
                )}
              </dl>

              {selected.flags.length > 0 && (
                <div className="p-4">
                  <ul className="space-y-1.5 text-xs text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                    {selected.flags.map((f) => (
                      <li key={f} className="flex items-start gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-px text-amber-600" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Receipt */}
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">Receipt</span>
                  {selected.receiptUrl && (
                    <a
                      href={selected.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-semibold text-burgundy dark:text-[#E89BA5] hover:underline inline-flex items-center gap-1"
                    >
                      Open in new tab
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                {!selected.receiptUrl ? (
                  <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-[#3D1418] rounded-lg">
                    No receipt on file. Match the transaction ID against the Easebuzz dashboard.
                  </div>
                ) : isImageUrl(selected.receiptUrl) ? (
                  <img
                    src={selected.receiptUrl}
                    alt={`Receipt from ${selected.name}`}
                    className="w-full max-h-[420px] object-contain rounded-lg border border-slate-200 dark:border-[#3D1418] bg-slate-50 dark:bg-[#1C0A0D]"
                  />
                ) : (
                  <div className="space-y-2">
                    <iframe
                      src={selected.receiptUrl}
                      title={`Receipt from ${selected.name}`}
                      className="w-full h-[420px] rounded-lg border border-slate-200 dark:border-[#3D1418] bg-slate-50 hidden sm:block"
                    />
                    <a
                      href={selected.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sm:hidden flex items-center justify-center gap-2 p-4 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#3D1418] rounded-lg"
                    >
                      <FileText className="w-4 h-4" />
                      Open PDF receipt
                    </a>
                  </div>
                )}
              </div>

              {/* Decision */}
              <div className="p-4 space-y-3">
                <label className="block space-y-1">
                  <span className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    Note to participant
                    <span className="font-normal text-slate-400"> (required to reject)</span>
                  </span>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    maxLength={500}
                    placeholder="e.g. Transaction ID does not match the receipt"
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-[#3D1418] rounded-lg bg-slate-50 dark:bg-[#1C0A0D] text-slate-900 dark:text-[#FAF6F3] focus:outline-none focus:ring-1 focus:ring-burgundy resize-y"
                  />
                </label>

                {actionError && (
                  <p className="text-xs text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg p-2.5">
                    {actionError}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  {selected.status !== 'verified' && (
                    <button
                      type="button"
                      onClick={() => decide('approve')}
                      disabled={actionPending}
                      className="flex-1 min-w-[140px] py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {selected.type === 'certificate' ? 'Approve and issue certificate' : 'Approve pass'}
                    </button>
                  )}
                  {selected.status !== 'rejected' && !(selected.type === 'certificate' && selected.certificateSerial && selected.status === 'verified') && !(selected.type === 'pass' && selected.checkedIn) && (
                    <button
                      type="button"
                      onClick={() => decide('reject')}
                      disabled={actionPending}
                      className="flex-1 min-w-[120px] py-2 px-4 bg-white dark:bg-[#1C0A0D] border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  )}
                  {selected.status === 'rejected' && (
                    <button
                      type="button"
                      onClick={() => decide('reopen')}
                      disabled={actionPending}
                      className="py-2 px-4 bg-white dark:bg-[#1C0A0D] border border-slate-200 dark:border-[#3D1418] text-slate-700 dark:text-slate-300 hover:bg-slate-50 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Move back to pending
                    </button>
                  )}
                  {selected.type === 'certificate' && selected.status === 'verified' && (
                    <button
                      type="button"
                      onClick={() => decide(selected.deliveredAt ? 'unmark_delivered' : 'mark_delivered')}
                      disabled={actionPending}
                      className={clsx(
                        'flex-1 min-w-[160px] py-2 px-4 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50',
                        selected.deliveredAt
                          ? 'bg-white dark:bg-[#1C0A0D] border border-slate-200 dark:border-[#3D1418] text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                          : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-[#FAF6F3] dark:text-[#150709]'
                      )}
                    >
                      {selected.deliveredAt ? (
                        <>
                          <RotateCcw className="w-3.5 h-3.5" />
                          Undo delivered
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          {selected.deliveryMode === 'ceremony' ? 'Mark handed over at ceremony' : 'Mark emailed'}
                        </>
                      )}
                    </button>
                  )}
                </div>

                {actionPending && (
                  <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    Saving decision...
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
