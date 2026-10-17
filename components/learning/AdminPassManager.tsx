'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  RefreshCw,
  ExternalLink,
  Download,
  AlertCircle,
  FileText,
  UserCheck,
  Building,
} from 'lucide-react';

interface FestivalPassItem {
  id: string;
  user_email: string;
  user_name: string;
  pass_tier: string;
  transaction_reference: string;
  bank_reference: string | null;
  receipt_url: string;
  amount_inr: number;
  status: string;
  institution: string | null;
  contact_phone: string | null;
  checked_in: boolean;
  checked_in_at: string | null;
  checked_in_by: string | null;
  created_at: string;
}

export function AdminPassManager() {
  const [passes, setPasses] = useState<FestivalPassItem[]>([]);
  const [metrics, setMetrics] = useState({ totalClaims: 0, verifiedClaims: 0, checkedInClaims: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchPasses = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`/api/admin/passes?${params.toString()}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setPasses(json.passes || []);
        if (json.metrics) setMetrics(json.metrics);
      }
    } catch (err) {
      console.error('Error fetching admin passes:', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchPasses();
  }, [fetchPasses]);

  async function handleUpdateStatus(passId: string, newStatus: string) {
    try {
      setActionLoadingId(passId);
      const res = await fetch('/api/admin/passes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passId, status: newStatus }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setPasses((prev) =>
          prev.map((p) => (p.id === passId ? { ...p, status: newStatus } : p))
        );
      } else {
        alert(json.error || 'Failed to update pass status.');
      }
    } catch (err: any) {
      alert(err?.message || 'Error communicating with server.');
    } finally {
      setActionLoadingId(null);
    }
  }

  function handleExportCsv() {
    if (!passes.length) return;
    const headers = [
      'ID',
      'Name',
      'Email',
      'Institution',
      'Phone',
      'Pass Tier',
      'Amount INR',
      'Easebuzz Txn ID',
      'Bank Ref',
      'Status',
      'Checked In',
      'Checked In At',
      'Receipt URL',
      'Claimed At',
    ];

    const rows = passes.map((p) => [
      p.id,
      `"${p.user_name.replace(/"/g, '""')}"`,
      p.user_email,
      `"${(p.institution || '').replace(/"/g, '""')}"`,
      p.contact_phone || '',
      p.pass_tier,
      p.amount_inr,
      p.transaction_reference,
      p.bank_reference || '',
      p.status,
      p.checked_in ? 'YES' : 'NO',
      p.checked_in_at || '',
      p.receipt_url,
      p.created_at,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qff26_on_campus_passes_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-xl shadow-2xs">
          <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Passes Claimed
          </span>
          <p className="font-serif text-2xl font-bold text-slate-900 dark:text-[#FAF6F3] mt-1">
            {metrics.totalClaims}
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-xl shadow-2xs">
          <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
            Officially Verified
          </span>
          <p className="font-serif text-2xl font-bold text-slate-900 dark:text-[#FAF6F3] mt-1">
            {metrics.verifiedClaims}
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-xl shadow-2xs">
          <span className="font-mono text-[10px] font-bold text-burgundy dark:text-[#E89BA5] uppercase tracking-wider block">
            Gate Checked-In
          </span>
          <p className="font-serif text-2xl font-bold text-slate-900 dark:text-[#FAF6F3] mt-1">
            {metrics.checkedInClaims}
          </p>
        </div>
      </div>

      {/* Filter & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] p-4 rounded-xl shadow-2xs">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or Easebuzz Txn ID..."
              className="w-full pl-9 pr-3 py-1.5 text-xs font-mono border border-slate-300 dark:border-[#3D1418] rounded-lg bg-slate-50/50 dark:bg-[#1C0A0D] text-slate-900 dark:text-[#FAF6F3] focus:outline-none focus:ring-1 focus:ring-burgundy"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs font-mono border border-slate-300 dark:border-[#3D1418] rounded-lg bg-white dark:bg-[#1C0A0D] text-slate-800 dark:text-[#FAF6F3] focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="claimed_provisional">Provisional (Receipt Uploaded)</option>
            <option value="verified">Verified (Approved)</option>
            <option value="checked_in">Checked In at Gate</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => fetchPasses()}
            className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-[#3D1418] rounded-lg bg-white dark:bg-[#150709] transition-colors cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleExportCsv}
            disabled={!passes.length}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-[#200A0E] dark:hover:bg-[#2A0F13] text-slate-800 dark:text-[#FAF6F3] border border-slate-200 dark:border-[#3D1418] text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Passes Data Table */}
      <div className="bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#1C0A0D] text-slate-600 dark:text-slate-400 font-mono text-[10px] uppercase border-b border-slate-200 dark:border-[#3D1418]">
              <tr>
                <th className="px-4 py-3">Attendee</th>
                <th className="px-4 py-3">Txn Ref / Proof</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Gate Check-In</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#200A0E]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center font-mono text-slate-400">
                    Loading festival pass claims...
                  </td>
                </tr>
              ) : passes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center font-mono text-slate-400">
                    No festival pass claims found matching your filter.
                  </td>
                </tr>
              ) : (
                passes.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-[#1A090C]">
                    {/* Attendee */}
                    <td className="px-4 py-3 align-top">
                      <p className="font-bold text-slate-900 dark:text-[#FAF6F3]">
                        {p.user_name}
                      </p>
                      <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        {p.user_email}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[200px]">
                        {p.institution || 'SRM University-AP'}
                      </p>
                    </td>

                    {/* Txn Ref & Receipt */}
                    <td className="px-4 py-3 align-top font-mono">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">
                        {p.transaction_reference}
                      </span>
                      {p.bank_reference && (
                        <span className="text-[10px] text-slate-400 block">
                          Bank Ref: {p.bank_reference}
                        </span>
                      )}
                      <a
                        href={p.receipt_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-burgundy dark:text-[#E89BA5] hover:underline inline-flex items-center gap-1 mt-1 text-[11px] font-semibold"
                      >
                        <FileText className="w-3 h-3" />
                        <span>View Receipt</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3 align-top font-mono">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        ₹{p.amount_inr}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 align-top">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                          p.status === 'verified'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : p.status === 'rejected'
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {p.status === 'claimed_provisional' ? 'Provisional' : p.status}
                      </span>
                    </td>

                    {/* Gate Check-In */}
                    <td className="px-4 py-3 align-top font-mono text-[11px]">
                      {p.checked_in ? (
                        <div>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Checked In
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {p.checked_in_at
                              ? new Date(p.checked_in_at).toLocaleTimeString('en-IN', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : ''}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400">Pending Gate Entry</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 align-top text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {p.status !== 'verified' && (
                          <button
                            onClick={() => handleUpdateStatus(p.id, 'verified')}
                            disabled={actionLoadingId === p.id}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-semibold transition-colors cursor-pointer"
                          >
                            Approve
                          </button>
                        )}
                        {p.status !== 'rejected' && (
                          <button
                            onClick={() => handleUpdateStatus(p.id, 'rejected')}
                            disabled={actionLoadingId === p.id}
                            className="px-2 py-1 bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 rounded text-[10px] font-semibold transition-colors cursor-pointer"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
