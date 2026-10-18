'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ShieldCheck,
  Building,
  User,
  Hash,
  ExternalLink,
  Search,
  Loader2,
  QrCode,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

interface PassData {
  id: string;
  userName: string;
  userEmail?: string;
  passTier: string;
  institution: string;
  transactionReference?: string;
  status: string;
  amountInr: number;
  receiptUrl?: string;
  checkedIn: boolean;
  checkedInAt: string | null;
  checkedInBy?: string | null;
  createdAt?: string;
}

const STATUS_STYLES: Record<string, { label: string; border: string; band: string; chip: string }> = {
  verified: {
    label: 'Verified Attendee · Payment Confirmed',
    border: 'border-emerald-500/70 dark:border-emerald-600/70',
    band: 'bg-emerald-600',
    chip: 'bg-emerald-700/60',
  },
  claimed_provisional: {
    label: 'Payment Pending Verification',
    border: 'border-amber-400 dark:border-amber-600/70',
    band: 'bg-amber-500',
    chip: 'bg-amber-600/60',
  },
  rejected: {
    label: 'Pass Rejected · Do Not Admit',
    border: 'border-rose-500/70 dark:border-rose-600/70',
    band: 'bg-rose-600',
    chip: 'bg-rose-700/60',
  },
};

function VerifyPassContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const initialQuery = searchParams.get('q') || '';

  const [searchInput, setSearchInput] = useState(initialQuery);
  const [loading, setLoading] = useState(Boolean(token || initialQuery));
  const [passData, setPassData] = useState<PassData | null>(null);
  const [isStaff, setIsStaff] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkInSuccess, setCheckInSuccess] = useState(false);

  useEffect(() => {
    if (token) {
      verifyToken(token);
    } else if (initialQuery) {
      verifySearch(initialQuery);
    }
  }, [token, initialQuery]);

  async function verifyToken(t: string) {
    setLoading(true);
    setErrorMessage('');
    setPassData(null);
    try {
      const res = await fetch(`/api/pass/verify?token=${encodeURIComponent(t)}`);
      const data = await res.json();
      if (res.ok && data.pass) {
        setPassData(data.pass);
        setIsStaff(Boolean(data.isStaff));
      } else {
        setErrorMessage(data.error || 'Invalid or unregistered festival pass.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error communicating with verification engine.');
    } finally {
      setLoading(false);
    }
  }

  async function verifySearch(q: string) {
    if (!q.trim()) return;
    setLoading(true);
    setErrorMessage('');
    setPassData(null);
    try {
      const res = await fetch(`/api/pass/verify?q=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      if (res.ok && data.pass) {
        setPassData(data.pass);
        setIsStaff(Boolean(data.isStaff));
      } else {
        setErrorMessage(data.error || 'No attendee pass found matching your search.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error searching for pass.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckIn() {
    if (!passData) return;
    setCheckingIn(true);
    try {
      const res = await fetch('/api/pass/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passId: passData.id }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPassData((prev) =>
          prev ? { ...prev, checkedIn: true, checkedInAt: data.pass?.checkedInAt || new Date().toISOString() } : null
        );
        setCheckInSuccess(true);
      } else {
        alert(data.error || 'Failed to record check-in.');
      }
    } catch (err: any) {
      alert(err?.message || 'Network error processing check-in.');
    } finally {
      setCheckingIn(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0E0406] text-slate-900 dark:text-[#FAF6F3] font-sans py-8 px-4 sm:px-6">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <p className="font-mono text-xs uppercase tracking-widest text-burgundy dark:text-[#E89BA5] font-bold">
            SRM University-AP · Qiskit Fall Fest 2026
          </p>
          <h1 className="font-serif text-2xl font-bold tracking-tight">
            Campus Gate Pass Verification Desk
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Official on-site check-in terminal for 26–30 October 2026
          </p>
        </div>

        {/* Manual Lookup Search Bar (Ideal for Laptop Volunteer Desks) */}
        <div className="bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-xl p-3.5 shadow-xs">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              verifySearch(searchInput);
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by Easebuzz Txn ID or email (organizers only)"
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm font-mono border border-slate-300 dark:border-[#3D1418] rounded-lg bg-slate-50/50 dark:bg-[#1C0A0D] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-burgundy"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !searchInput.trim()}
              className="px-4 py-2 bg-burgundy hover:bg-burgundy-deep text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Verify</span>}
            </button>
          </form>
        </div>

        {/* Verification Result Card */}
        {loading && (
          <div className="p-12 text-center bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-xl shadow-xs space-y-3">
            <Loader2 className="w-8 h-8 text-burgundy dark:text-[#E89BA5] animate-spin mx-auto" />
            <p className="font-mono text-xs text-slate-500">Verifying security token with database...</p>
          </div>
        )}

        {!loading && errorMessage && (
          <div className="p-6 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-xl text-center space-y-2">
            <XCircle className="w-10 h-10 text-rose-600 dark:text-rose-400 mx-auto" />
            <h2 className="font-serif text-lg font-bold text-rose-950 dark:text-rose-100">
              Pass Verification Failed
            </h2>
            <p className="text-xs text-rose-800 dark:text-rose-300 leading-relaxed max-w-md mx-auto">
              {errorMessage}
            </p>
          </div>
        )}

        {!loading && passData && (() => {
          const style = STATUS_STYLES[passData.status] || STATUS_STYLES.claimed_provisional;
          const isRejected = passData.status === 'rejected';
          const isProvisional = passData.status === 'claimed_provisional';
          return (
          <div className={`bg-white dark:bg-[#150709] border-2 ${style.border} rounded-2xl overflow-hidden shadow-md`}>
            {/* Status Banner */}
            <div className={`${style.band} text-white px-5 py-3 flex items-center justify-between gap-2`}>
              <div className="flex items-center gap-2">
                {isRejected ? (
                  <XCircle className="w-5 h-5" />
                ) : isProvisional ? (
                  <Clock className="w-5 h-5" />
                ) : (
                  <ShieldCheck className="w-5 h-5" />
                )}
                <span className="font-mono text-xs font-bold uppercase tracking-wider">
                  {style.label}
                </span>
              </div>
              <span className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${style.chip} text-white shrink-0`}>
                ₹{passData.amountInr} {passData.passTier === 'flagship_offline' ? 'Flagship Pass' : 'General Pass'}
              </span>
            </div>

            {/* Pass Content Body */}
            <div className="p-6 space-y-5">
              {/* Attendee Identity */}
              <div>
                <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Attendee Name
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#FAF6F3]">
                  {passData.userName}
                </h2>
                {passData.userEmail && (
                  <p className="font-mono text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {passData.userEmail}
                  </p>
                )}
              </div>

              {/* Grid Details */}
              <div className="grid grid-cols-2 gap-3 text-xs border-t border-b border-slate-100 dark:border-[#250D11] py-3.5">
                <div>
                  <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block">
                    Pass Type
                  </span>
                  <p className="font-bold text-burgundy dark:text-[#E89BA5] mt-0.5">
                    {passData.passTier === 'flagship_offline' ? 'Flagship Pass' : 'General Offline Pass'}
                  </p>
                </div>
                <div>
                  <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block">
                    Valid Dates
                  </span>
                  <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                    26–30 Oct 2026
                  </p>
                </div>
                <div>
                  <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block">
                    Institution
                  </span>
                  <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                    {passData.institution}
                  </p>
                </div>
                {passData.transactionReference && (
                  <div>
                    <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block">
                      Easebuzz Txn Ref
                    </span>
                    <p className="font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                      {passData.transactionReference}
                    </p>
                  </div>
                )}
              </div>

              {/* Receipt Preview Link */}
              {passData.receiptUrl && (
                <div className="flex items-center justify-between text-xs bg-slate-50 dark:bg-[#1C0A0D] border border-slate-200 dark:border-[#3D1418] p-3 rounded-xl">
                  <span className="font-medium text-slate-600 dark:text-slate-400">
                    Documentary Proof:
                  </span>
                  <a
                    href={passData.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-burgundy dark:text-[#E89BA5] hover:underline inline-flex items-center gap-1"
                  >
                    <span>View Uploaded Easebuzz Receipt</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {isProvisional && isStaff && !passData.checkedIn && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl flex items-start gap-2 text-xs text-amber-900 dark:text-amber-200">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    The receipt has not been verified yet. Open the receipt above and confirm the Easebuzz
                    Transaction ID matches before admitting.
                  </span>
                </div>
              )}

              {/* Check-In Action Section */}
              <div className="pt-2">
                {isRejected ? (
                  <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-xl flex items-center gap-3 text-xs text-rose-900 dark:text-rose-200 font-medium">
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    <span>Receipt was rejected by the organizing team. Direct the attendee to the help desk.</span>
                  </div>
                ) : passData.checkedIn ? (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl flex items-center gap-3 text-xs text-emerald-900 dark:text-emerald-200 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div>
                      <p className="font-bold">Already Checked In</p>
                      <p className="font-mono text-[11px] text-emerald-800 dark:text-emerald-300 mt-0.5">
                        {passData.checkedInAt
                          ? new Date(passData.checkedInAt).toLocaleString('en-IN', {
                              timeZone: 'Asia/Kolkata',
                            })
                          : 'Recorded on gate ledger'}
                      </p>
                    </div>
                  </div>
                ) : !isStaff ? (
                  <p className="text-center font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    Gate check-in is recorded by organizers signed in on the learning portal.
                  </p>
                ) : (
                  <button
                    onClick={handleCheckIn}
                    disabled={checkingIn}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {checkingIn ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Recording Check-In...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm Attendee Entry (Check-In)</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
          );
        })()}

        {/* Footer Link */}
        <div className="text-center pt-4">
          <Link
            href="/learning"
            className="font-mono text-xs text-slate-500 hover:text-burgundy dark:hover:text-[#E89BA5] transition-colors inline-flex items-center gap-1"
          >
            <span>Back to Learning Portal</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPassPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center font-mono text-xs text-slate-500">
          Loading Pass Verification Terminal...
        </div>
      }
    >
      <VerifyPassContent />
    </Suspense>
  );
}
