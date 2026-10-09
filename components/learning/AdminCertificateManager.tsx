'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  AlertTriangle,
  QrCode,
  Save,
  Search,
  RefreshCw,
  ExternalLink,
  XCircle,
  CreditCard,
  Building,
  Hash,
  Copy,
  Check,
} from 'lucide-react';

interface CertificateConfig {
  payment_status: 'updating_soon' | 'active';
  price_inr: number | null;
  fee_label: string;
  upi_id: string;
  account_holder: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  qr_code_url: string;
  notice_title: string;
  notice_message: string;
}

interface PaymentSubmission {
  id: string;
  user_email: string;
  candidate_name: string;
  transaction_reference: string;
  payment_mode: string;
  amount_inr: number | null;
  status: 'pending_verification' | 'verified' | 'rejected';
  admin_notes: string | null;
  created_at: string;
  verified_at: string | null;
  certificate_id: string | null;
}

const DEFAULT_CONFIG: CertificateConfig = {
  payment_status: 'updating_soon',
  price_inr: null,
  fee_label: 'Updating Soon / To be announced',
  upi_id: '',
  account_holder: 'SRM University-AP',
  bank_name: '',
  account_number: '',
  ifsc_code: '',
  qr_code_url: '',
  notice_title: 'Payment Gateway & Official QR Code Updating Soon',
  notice_message:
    'The official UPI payment QR code and bank account details for certificate issuance are currently being finalized by the organizing team. Once released, you will be able to scan the QR code to complete the fee transfer and submit your Unique Transaction ID (UTI) / UPI Reference Number below.',
};

export function AdminCertificateManager() {
  const [config, setConfig] = useState<CertificateConfig>(DEFAULT_CONFIG);
  const [submissions, setSubmissions] = useState<PaymentSubmission[]>([]);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [configMsg, setConfigMsg] = useState('');
  const [configMsgIsError, setConfigMsgIsError] = useState(false);
  const [processingSubId, setProcessingSubId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    try {
      setIsLoadingConfig(true);
      const res = await fetch('/api/admin/config');
      const data = await res.json();
      if (data.config && data.config.certificate_config) {
        setConfig({
          ...DEFAULT_CONFIG,
          ...data.config.certificate_config,
        });
      }
    } catch (err) {
      console.error('Error loading certificate config:', err);
    } finally {
      setIsLoadingConfig(false);
    }
  }, []);

  const fetchSubmissions = useCallback(async () => {
    try {
      setIsLoadingSubmissions(true);
      const res = await fetch('/api/admin/certificate-submissions');
      const data = await res.json();
      if (data.submissions) {
        setSubmissions(data.submissions);
      }
    } catch (err) {
      console.error('Error fetching submissions:', err);
    } finally {
      setIsLoadingSubmissions(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
    fetchSubmissions();
  }, [fetchConfig, fetchSubmissions]);

  async function handleSaveConfig(e: React.FormEvent) {
    e.preventDefault();
    setIsSavingConfig(true);
    setConfigMsg('');
    setConfigMsgIsError(false);

    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'certificate_config',
          value: config,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setConfigMsg('Certificate configuration saved successfully.');
      } else {
        setConfigMsg(data.error || 'Failed to save configuration.');
        setConfigMsgIsError(true);
      }
    } catch (err: any) {
      setConfigMsg(err?.message || 'Network error saving configuration.');
      setConfigMsgIsError(true);
    } finally {
      setIsSavingConfig(false);
    }
  }

  async function handleUpdateSubmission(submissionId: string, action: 'verify' | 'reject') {
    setProcessingSubId(submissionId);
    try {
      const res = await fetch('/api/admin/certificate-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId,
          action,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        await fetchSubmissions();
      } else {
        alert(data.error || 'Failed to update submission.');
      }
    } catch (err: any) {
      alert(err?.message || 'Error updating submission.');
    } finally {
      setProcessingSubId(null);
    }
  }

  function handleCopy(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const filteredSubmissions = submissions.filter((sub) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      sub.user_email.toLowerCase().includes(q) ||
      sub.candidate_name.toLowerCase().includes(q) ||
      sub.transaction_reference.toLowerCase().includes(q)
    );
  });

  const pendingCount = submissions.filter((s) => s.status === 'pending_verification').length;
  const verifiedCount = submissions.filter((s) => s.status === 'verified').length;
  const rejectedCount = submissions.filter((s) => s.status === 'rejected').length;

  return (
    <div className="space-y-6">
      {/* 1. CONFIGURATION CARD */}
      <div className="p-6 bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-xl shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-[#3D1418]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-burgundy dark:text-[#E89BA5]" />
              <h2 className="text-base font-bold text-slate-900 dark:text-[#FAF6F3]">
                Certificate & Payment Gateway Configuration
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure payment gateway availability, bank details, official QR code, fee display, and candidate guidance notices.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Gateway Status:</span>
            <button
              type="button"
              onClick={() =>
                setConfig((prev) => ({
                  ...prev,
                  payment_status: prev.payment_status === 'active' ? 'updating_soon' : 'active',
                }))
              }
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                config.payment_status === 'active'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
              }`}
            >
              {config.payment_status === 'active' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Active &amp; Accepting Payments</span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5" />
                  <span>Updating Soon (Details Pending)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {isLoadingConfig ? (
          <div className="py-8 text-center text-xs text-slate-500">Loading settings...</div>
        ) : (
          <form onSubmit={handleSaveConfig} className="space-y-5">
            {/* Grid 1: Pricing & Payment Method */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Certification Fee (INR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400">₹</span>
                  <input
                    type="number"
                    value={config.price_inr ?? ''}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        price_inr: e.target.value ? Number(e.target.value) : null,
                      }))
                    }
                    placeholder="e.g. 499 (leave blank for TBA)"
                    className="w-full pl-7 pr-3 py-2 bg-slate-50 dark:bg-[#1C0A0D] border border-slate-200 dark:border-[#3D1418] rounded-lg text-xs font-sans text-slate-900 dark:text-[#FAF6F3]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Fee Display Label
                </label>
                <input
                  type="text"
                  value={config.fee_label}
                  onChange={(e) => setConfig((prev) => ({ ...prev, fee_label: e.target.value }))}
                  placeholder="e.g. ₹499 INR or Updating Soon"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#1C0A0D] border border-slate-200 dark:border-[#3D1418] rounded-lg text-xs font-sans text-slate-900 dark:text-[#FAF6F3]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  UPI ID (VPA)
                </label>
                <input
                  type="text"
                  value={config.upi_id}
                  onChange={(e) => setConfig((prev) => ({ ...prev, upi_id: e.target.value }))}
                  placeholder="e.g. srmuniversity@sbi"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#1C0A0D] border border-slate-200 dark:border-[#3D1418] rounded-lg text-xs font-sans text-slate-900 dark:text-[#FAF6F3]"
                />
              </div>
            </div>

            {/* Grid 2: Bank Account Details */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Beneficiary Name
                </label>
                <input
                  type="text"
                  value={config.account_holder}
                  onChange={(e) => setConfig((prev) => ({ ...prev, account_holder: e.target.value }))}
                  placeholder="e.g. SRM University-AP"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#1C0A0D] border border-slate-200 dark:border-[#3D1418] rounded-lg text-xs font-sans text-slate-900 dark:text-[#FAF6F3]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={config.bank_name}
                  onChange={(e) => setConfig((prev) => ({ ...prev, bank_name: e.target.value }))}
                  placeholder="e.g. State Bank of India"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#1C0A0D] border border-slate-200 dark:border-[#3D1418] rounded-lg text-xs font-sans text-slate-900 dark:text-[#FAF6F3]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  value={config.account_number}
                  onChange={(e) => setConfig((prev) => ({ ...prev, account_number: e.target.value }))}
                  placeholder="e.g. 123456789012"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#1C0A0D] border border-slate-200 dark:border-[#3D1418] rounded-lg text-xs font-mono text-slate-900 dark:text-[#FAF6F3]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  IFSC Code
                </label>
                <input
                  type="text"
                  value={config.ifsc_code}
                  onChange={(e) => setConfig((prev) => ({ ...prev, ifsc_code: e.target.value }))}
                  placeholder="e.g. SBIN0012345"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#1C0A0D] border border-slate-200 dark:border-[#3D1418] rounded-lg text-xs font-mono text-slate-900 dark:text-[#FAF6F3]"
                />
              </div>
            </div>

            {/* QR Code URL */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                UPI QR Code Image URL
              </label>
              <input
                type="text"
                value={config.qr_code_url}
                onChange={(e) => setConfig((prev) => ({ ...prev, qr_code_url: e.target.value }))}
                placeholder="https://... or /images/... (leave empty to show placeholder icon)"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#1C0A0D] border border-slate-200 dark:border-[#3D1418] rounded-lg text-xs font-sans text-slate-900 dark:text-[#FAF6F3]"
              />
            </div>

            {/* Notice Title & Message */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Candidate Notice Title
                </label>
                <input
                  type="text"
                  value={config.notice_title}
                  onChange={(e) => setConfig((prev) => ({ ...prev, notice_title: e.target.value }))}
                  placeholder="e.g. Payment Gateway & Official QR Code Updating Soon"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#1C0A0D] border border-slate-200 dark:border-[#3D1418] rounded-lg text-xs font-sans text-slate-900 dark:text-[#FAF6F3]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Candidate Notice Message
                </label>
                <textarea
                  rows={3}
                  value={config.notice_message}
                  onChange={(e) => setConfig((prev) => ({ ...prev, notice_message: e.target.value }))}
                  placeholder="Notice message shown to students..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#1C0A0D] border border-slate-200 dark:border-[#3D1418] rounded-lg text-xs font-sans text-slate-900 dark:text-[#FAF6F3]"
                />
              </div>
            </div>

            {configMsg && (
              <div
                className={`p-3 rounded-lg text-xs font-medium border ${
                  configMsgIsError
                    ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                }`}
              >
                {configMsg}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={isSavingConfig}
                className="px-5 py-2.5 bg-burgundy hover:bg-burgundy-deep text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSavingConfig ? 'Saving...' : 'Save Certificate Settings'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 2. CANDIDATE PAYMENT SUBMISSIONS TABLE */}
      <div className="p-6 bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-burgundy dark:text-[#E89BA5]" />
              <h2 className="text-base font-bold text-slate-900 dark:text-[#FAF6F3]">
                Candidate UTI / Payment Submissions
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Review submitted Unique Transaction IDs (UTI) and UPI Reference numbers. Approving automatically mints the official credential.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 text-[11px] font-bold">
              {pendingCount} Pending
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold">
              {verifiedCount} Verified
            </span>
            <button
              onClick={fetchSubmissions}
              disabled={isLoadingSubmissions}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-[#3D1418] text-slate-500 hover:text-slate-900 dark:hover:text-[#FAF6F3] transition-colors cursor-pointer"
              title="Refresh submissions"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSubmissions ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by candidate email, name, or transaction reference..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-[#1C0A0D] border border-slate-200 dark:border-[#3D1418] rounded-lg text-xs text-slate-900 dark:text-[#FAF6F3]"
          />
        </div>

        {/* Submissions Table */}
        {isLoadingSubmissions ? (
          <div className="py-8 text-center text-xs text-slate-500">Loading submissions...</div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-[#3D1418] rounded-xl">
            No payment submissions recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-[#3D1418] text-slate-500 dark:text-slate-400 font-medium">
                  <th className="py-2.5 px-3">Candidate</th>
                  <th className="py-2.5 px-3">UTI / UPI Ref No.</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Submitted At</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#3D1418]">
                {filteredSubmissions.map((sub) => {
                  const isProcessing = processingSubId === sub.id;

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-[#1C0A0D]/50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900 dark:text-[#FAF6F3]">
                          {sub.candidate_name || sub.user_email}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          {sub.user_email}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <code className="font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-[#1C0A0D] px-2 py-0.5 rounded border border-slate-200 dark:border-[#3D1418]">
                            {sub.transaction_reference}
                          </code>
                          <button
                            type="button"
                            onClick={() => handleCopy(sub.transaction_reference, sub.id)}
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                            title="Copy reference"
                          >
                            {copiedId === sub.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="py-3 px-3 font-medium text-slate-700 dark:text-slate-300">
                        {sub.amount_inr ? `₹${sub.amount_inr}` : '—'}
                      </td>

                      <td className="py-3 px-3 text-slate-500 dark:text-slate-400 text-[11px]">
                        {new Date(sub.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      <td className="py-3 px-3">
                        {sub.status === 'verified' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Verified
                          </span>
                        )}
                        {sub.status === 'pending_verification' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Pending Review
                          </span>
                        )}
                        {sub.status === 'rejected' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900 inline-flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            Rejected
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {sub.status === 'pending_verification' && (
                            <>
                              <button
                                type="button"
                                disabled={isProcessing}
                                onClick={() => handleUpdateSubmission(sub.id, 'verify')}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-50"
                              >
                                {isProcessing ? 'Minting...' : 'Verify & Mint'}
                              </button>
                              <button
                                type="button"
                                disabled={isProcessing}
                                onClick={() => handleUpdateSubmission(sub.id, 'reject')}
                                className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 dark:bg-[#250D11] text-slate-700 dark:text-slate-300 rounded text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {sub.status === 'verified' && sub.certificate_id && (
                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                              Certificate Minted
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
