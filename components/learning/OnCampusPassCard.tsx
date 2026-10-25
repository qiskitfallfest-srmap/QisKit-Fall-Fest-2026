'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import QRCode from 'qrcode';
import {
  ShieldCheck,
  ExternalLink,
  Upload,
  FileText,
  X,
  Check,
  AlertCircle,
  Loader2,
  QrCode,
  Users,
  ArrowRight,
  Clock,
  XCircle,
  Lock,
  MapPin,
  CalendarDays,
  RotateCw,
  Phone,
  BedDouble,
  MessageCircle,
} from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import {
  EASEBUZZ_GATEWAY_URL,
  FLAGSHIP_PASS_FEE_INR,
  MAX_RECEIPT_SIZE_MB,
  PASS_FEE_INR,
  TXN_FORMAT_HINT,
  TXN_PATTERN,
  isAcceptedReceipt,
  normalizeTxn,
  passTierLabel,
  uploadReceipt,
} from '@/lib/payments';
import { usePassStatus } from '@/hooks/use-pass-status';
import { handleGoogleSignInDirect } from '@/components/learning/AuthGate';
import { supabase } from '@/lib/supabase';
import { isSrmApEmail } from '@/lib/participant-track';
import { ACCOMMODATION_HELPLINES, ACCOMMODATION_WHATSAPP_GROUP } from '@/lib/accommodation';
import { SPECIAL_BUS_TRIPS } from '@/lib/transport';

function formatIst(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// Live time left in the Flagship payment window; calls onExpire once it reaches zero
function PaymentCountdown({ deadlineIso, onExpire }: { deadlineIso: string; onExpire: () => void }) {
  const deadlineMs = new Date(deadlineIso).getTime();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const remaining = Math.max(0, deadlineMs - now);
  useEffect(() => {
    if (remaining === 0) onExpire();
  }, [remaining, onExpire]);

  const hours = Math.floor(remaining / 3_600_000);
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);
  const seconds = Math.floor((remaining % 60_000) / 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  const urgent = remaining < 6 * 3_600_000;

  return (
    <div
      className={clsx(
        'flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 rounded-lg border px-3.5 py-2.5',
        urgent
          ? 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200'
          : 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200'
      )}
    >
      <span className="flex items-center gap-1.5 text-xs font-semibold">
        <Clock className="w-3.5 h-3.5 shrink-0" />
        Time left to pay
      </span>
      <span className="font-mono text-lg font-bold tabular-nums">
        {pad(hours)}:{pad(minutes)}:{pad(seconds)}
      </span>
      <span className="w-full font-mono text-[11px] opacity-80">Closes {formatIst(deadlineIso)} IST</span>
    </div>
  );
}

const FLAGSHIP_INCLUSIONS = [
  'Hackathon Phase 2 (24-hour on-campus sprint)',
  'Flagship Track: QCTF',
  'Special lunch & 2 snack servings on all 5 days',
  'Hardware setup & priority seating',
  'Everything in the General Pass',
];

function StepRow({
  index,
  state,
  title,
  children,
}: {
  index: number;
  state: 'done' | 'active' | 'locked' | 'missed';
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <li className="flex gap-3">
      <span
        className={clsx(
          'w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0 border-2',
          state === 'done' && 'bg-emerald-600 border-emerald-600 text-white',
          state === 'active' && 'bg-white dark:bg-[#150709] border-burgundy text-burgundy dark:border-[#E89BA5] dark:text-[#E89BA5]',
          state === 'locked' && 'bg-slate-50 dark:bg-[#1C0A0D] border-slate-200 dark:border-[#3D1418] text-slate-400',
          state === 'missed' && 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-600'
        )}
      >
        {state === 'done' ? <Check className="w-3.5 h-3.5" /> : state === 'locked' ? <Lock className="w-3 h-3" /> : index}
      </span>
      <div className="flex-1 min-w-0 space-y-1.5 pt-0.5">
        <p
          className={clsx(
            'text-sm font-semibold',
            state === 'locked' ? 'text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-[#FAF6F3]'
          )}
        >
          {title}
        </p>
        {children}
      </div>
    </li>
  );
}

const GATEWAY_OPENED_KEY = 'qff_pass_gateway_opened_v1';

const PASS_INCLUSIONS = [
  'Keynotes by IBM Quantum researchers',
  'Hands-on masterclass workshops',
  'Industry Tech Expo & Quantum Startup Pitch',
  'Quantum Reference Center Tour',
  'The Great Quantum Debate & Quantum Arcade',
];

// Ticket notches are filled with the dashboard background so they read as cut-outs
const NOTCH = 'absolute w-5 h-5 rounded-full bg-[#FAF7F4] dark:bg-[#100405]';

function StepMarker({ index, done, active }: { index: number; done: boolean; active: boolean }) {
  return (
    <span
      className={clsx(
        'w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0 border-2',
        done
          ? 'bg-emerald-600 border-emerald-600 text-white'
          : active
            ? 'bg-white dark:bg-[#150709] border-burgundy text-burgundy dark:border-[#E89BA5] dark:text-[#E89BA5]'
            : 'bg-white dark:bg-[#150709] border-slate-300 dark:border-[#3D1418] text-slate-400'
      )}
    >
      {done ? <Check className="w-3.5 h-3.5" /> : index}
    </span>
  );
}

export function OnCampusPassCard() {
  const { data, isLoading: loading, isError, mutate } = usePassStatus();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const [gatewayOpened, setGatewayOpened] = useState(false);
  const [isResubmitting, setIsResubmitting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [transactionRef, setTransactionRef] = useState('');
  const [bankRef, setBankRef] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Shortlisted members: receipt form for the ₹499 Flagship Pass, and client-side window expiry
  const [flagshipFormOpen, setFlagshipFormOpen] = useState(false);
  const [flagshipWindowExpired, setFlagshipWindowExpired] = useState(false);
  const handleFlagshipWindowExpire = useCallback(() => setFlagshipWindowExpired(true), []);

  const generateQrCode = useCallback(async (token: string) => {
    try {
      const origin =
        typeof window !== 'undefined' ? window.location.origin : 'https://www.qffsrmap2026.com';
      const verifyUrl = `${origin}/verify-pass?token=${encodeURIComponent(token)}`;
      const url = await QRCode.toDataURL(verifyUrl, {
        width: 320,
        margin: 1,
        color: { dark: '#201617', light: '#ffffff' },
      });
      setQrDataUrl(url);
    } catch (err) {
      console.error('Failed to generate QR code:', err);
    }
  }, []);

  const qrToken = data?.pass?.qr_code_token;
  useEffect(() => {
    if (qrToken) generateQrCode(qrToken);
    else setQrDataUrl('');
  }, [qrToken, generateQrCode]);

  // AuthGate re-announces the same session on every load; refetch only when the account changes
  const loadedEmail = data ? (data.isAuthenticated ? data.user?.email ?? null : null) : undefined;
  const loadedEmailRef = useRef(loadedEmail);
  loadedEmailRef.current = loadedEmail;

  useEffect(() => {
    try {
      setGatewayOpened(localStorage.getItem(GATEWAY_OPENED_KEY) === 'true');
    } catch {}
  }, []);

  useEffect(() => {
    const handleAuthChange = (e: Event) => {
      const nextEmail = (e as CustomEvent).detail?.email?.trim().toLowerCase() ?? null;
      if (nextEmail !== loadedEmailRef.current) mutate();
    };
    window.addEventListener('qff_auth_change', handleAuthChange);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (
        event === 'SIGNED_IN' ||
        event === 'INITIAL_SESSION' ||
        event === 'TOKEN_REFRESHED' ||
        event === 'SIGNED_OUT'
      ) {
        mutate();
      }
    });

    return () => {
      window.removeEventListener('qff_auth_change', handleAuthChange);
      subscription.unsubscribe();
    };
  }, [mutate]);

  function markGatewayOpened() {
    setGatewayOpened(true);
    try {
      localStorage.setItem(GATEWAY_OPENED_KEY, 'true');
    } catch {}
  }

  function acceptFile(file: File | undefined) {
    setErrorMessage('');
    if (!file) return;

    if (!isAcceptedReceipt(file)) {
      setErrorMessage('Please select a valid receipt file (PDF, PNG, JPG, or JPEG).');
      return;
    }
    if (file.size > MAX_RECEIPT_SIZE_MB * 1024 * 1024) {
      setErrorMessage(`Receipt size exceeds ${MAX_RECEIPT_SIZE_MB} MB limit.`);
      return;
    }
    setSelectedFile(file);
  }

  function clearFile() {
    setSelectedFile(null);
    // Reset the input so re-selecting the same file fires onChange again
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setIsDragOver(false);
    acceptFile(e.dataTransfer.files?.[0]);
  }

  async function handleClaimPass(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage('');

    const normalizedTxn = normalizeTxn(transactionRef);
    if (!TXN_PATTERN.test(normalizedTxn)) {
      setErrorMessage(TXN_FORMAT_HINT);
      return;
    }
    if (!selectedFile) {
      setErrorMessage('Please upload your Easebuzz receipt (PDF or screenshot).');
      return;
    }

    setIsSubmitting(true);
    setUploadStatus('Uploading receipt...');

    try {
      const receiptUrl = await uploadReceipt(
        selectedFile,
        'pass-receipts',
        data?.user?.email || '',
        normalizedTxn
      );

      setUploadStatus('Submitting claim...');

      const res = await fetch('/api/pass/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionReference: normalizedTxn,
          receiptUrl,
          bankReference: bankRef.trim() || null,
        }),
      });

      const resJson = await res.json();
      if (!res.ok || !resJson.success) {
        throw new Error(resJson.error || 'Failed to register pass claim.');
      }

      await mutate((prev) => (prev ? { ...prev, pass: resJson.pass } : prev), { revalidate: false });
      setIsResubmitting(false);
      clearFile();
      setTransactionRef('');
      setBankRef('');
    } catch (err: any) {
      console.error('Error claiming pass:', err);
      setErrorMessage(err?.message || 'Failed to claim pass. Please try again.');
    } finally {
      setIsSubmitting(false);
      setUploadStatus('');
    }
  }

  async function handleClaimFreePass() {
    setErrorMessage('');
    setIsSubmitting(true);
    setUploadStatus('Issuing complimentary pass...');

    try {
      const res = await fetch('/api/pass/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isInstitutionalFreePass: true,
        }),
      });

      const resJson = await res.json();
      if (!res.ok || !resJson.success) {
        throw new Error(resJson.error || 'Failed to claim complimentary pass.');
      }

      await mutate((prev) => (prev ? { ...prev, pass: resJson.pass } : prev), { revalidate: false });
    } catch (err: any) {
      console.error('Error claiming free pass:', err);
      setErrorMessage(err?.message || 'Failed to claim pass. Please try again.');
    } finally {
      setIsSubmitting(false);
      setUploadStatus('');
    }
  }

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-2xl flex items-center justify-center gap-3">
        <Loader2 className="w-5 h-5 text-burgundy dark:text-[#E89BA5] animate-spin" />
        <span className="font-mono text-xs text-slate-500">Checking campus pass status...</span>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-5 bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-[#FAF6F3]">Could not load your pass status</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              The server is busy. Do not pay again; retry in a few seconds.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => mutate()}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-slate-300 dark:border-[#3D1418] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1C0A0D] text-xs font-semibold rounded-lg cursor-pointer shrink-0"
        >
          <RotateCw className="w-3.5 h-3.5" />
          Retry
        </button>
      </div>
    );
  }

  // Payments are matched to the signed-in account, so guests sign in before seeing the gateway
  if (!data.isAuthenticated) {
    return (
      <div className="relative bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-[280px_1fr]">
        <div className="relative bg-burgundy text-white p-5 sm:p-6 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-rose-200">
              Admit One · On-Campus
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold leading-tight">On-Campus Festival Pass</h2>
            <div className="space-y-1.5 text-xs text-rose-100">
              <p className="flex items-center gap-2">
                <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                26–30 October 2026
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                SRM University-AP, Main Campus
              </p>
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 border-t border-white/20 pt-4">
            <span className="font-serif text-4xl font-bold tabular-nums">₹{PASS_FEE_INR}</span>
            <span className="font-mono text-[11px] text-rose-200">General Pass · all 5 days</span>
          </div>
          <span className={clsx(NOTCH, 'hidden lg:block -top-2.5 -right-2.5')} />
          <span className={clsx(NOTCH, 'hidden lg:block -bottom-2.5 -right-2.5')} />
        </div>
        <div className="p-5 sm:p-6 border-t-2 lg:border-t-0 lg:border-l-2 border-dashed border-slate-200 dark:border-[#3D1418] flex flex-col justify-center gap-4">
          <div className="space-y-1.5">
            <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-[#FAF6F3]">
              Sign in before you pay
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Your pass, QR code and Phase 1 result are linked to your Google account. Sign in first so your payment
              can be matched to you. Hackathon finalists see the ₹{FLAGSHIP_PASS_FEE_INR} Flagship Pass here instead.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleGoogleSignInDirect()}
            className="self-start inline-flex items-center gap-1.5 px-4 py-2.5 bg-burgundy hover:bg-burgundy-deep text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Sign In with Google
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Hackathon teams awaiting results, or shortlisted: Flagship Pass track.
  // An existing General Pass claim still takes precedence so it is never hidden.
  const hackathon = data?.hackathon;
  const flagship = data?.flagshipPayment;
  const flagshipStatus =
    flagship?.status === 'open' && flagshipWindowExpired ? 'closed' : flagship?.status || 'not_open';
  const showFlagshipForm = hackathon?.outcome === 'shortlisted' && flagshipFormOpen && flagshipStatus === 'open';

  if (data?.isHackathonParticipant && hackathon && !data.pass && !showFlagshipForm) {
    const isShortlisted = hackathon.outcome === 'shortlisted';
    const stage = hackathon.phase2?.stage;
    const teamPayment = hackathon.phase2?.payment;
    const leadWaitingForTeam = Boolean(hackathon.isLead && teamPayment && !teamPayment.allOthersPaid);
    const hasSubmitted = Boolean(hackathon.submittedAt);
    const deadlinePassed = hackathon.phase1DeadlinePassed;
    const submittedLabel =
      hackathon.submittedAt && hackathon.submittedAt !== 'submitted'
        ? new Date(hackathon.submittedAt).toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            day: 'numeric',
            month: 'short',
            hour: 'numeric',
            minute: '2-digit',
          })
        : null;

    return (
      <div className="relative bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-[280px_1fr]">
        {/* Flagship Pass ticket stub */}
        <div className="relative bg-[#201617] text-white p-5 sm:p-6 flex flex-col justify-between gap-5">
          <div className="space-y-3">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-amber-300">
              Admit One · Phase 2 Finalists
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold leading-tight">Flagship Pass</h2>
            <div className="space-y-1.5 text-xs text-slate-300">
              <p className="flex items-center gap-2">
                <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                26–30 October 2026
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                SRM University-AP, Main Campus
              </p>
            </div>
            <ul className="space-y-1 text-xs text-slate-200 pt-1">
              {FLAGSHIP_INCLUSIONS.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-300" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex items-baseline gap-1.5 border-t border-white/15 pt-4">
            <span className="font-serif text-4xl font-bold tabular-nums">₹499</span>
            <span className="font-mono text-[11px] text-slate-400">shortlisted teams only</span>
          </div>
          <span className={clsx(NOTCH, 'hidden lg:block -top-2.5 -right-2.5')} />
          <span className={clsx(NOTCH, 'hidden lg:block -bottom-2.5 -right-2.5')} />
        </div>

        {/* Progress */}
        <div className="p-5 sm:p-6 border-t-2 lg:border-t-0 lg:border-l-2 border-dashed border-slate-200 dark:border-[#3D1418] flex flex-col">
          <div className="mb-5">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Team {hackathon.teamName}
            </span>
            <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-[#FAF6F3] mt-0.5">
              {isShortlisted
                ? 'Your team is shortlisted for Phase 2'
                : 'Your on-campus pass comes with Phase 2'}
            </h3>
          </div>

          <ol className="space-y-5 flex-1">
            <StepRow
              index={1}
              state={hasSubmitted ? 'done' : deadlinePassed ? 'missed' : 'active'}
              title={hasSubmitted ? 'Phase 1 submitted' : 'Submit your Phase 1 project'}
            >
              {hasSubmitted ? (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {submittedLabel ? `Received ${submittedLabel} IST.` : 'Submission received.'}
                </p>
              ) : deadlinePassed ? (
                <p className="text-xs text-rose-700 dark:text-rose-300">
                  The deadline has passed and no submission was recorded for your team.
                </p>
              ) : (
                <>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Due 17 October 2026, 11:59 PM IST.{' '}
                    {hackathon.isLead ? 'As team lead, you submit for the team.' : 'Your team lead submits for the team.'}
                  </p>
                  <Link
                    href="/learning/hackathon"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-burgundy hover:bg-burgundy-deep text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    Open Hackathon Workspace
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </>
              )}
            </StepRow>

            <StepRow
              index={2}
              state={isShortlisted ? 'done' : hasSubmitted || deadlinePassed ? 'active' : 'locked'}
              title={isShortlisted ? 'Shortlisted for Phase 2' : 'Phase 1 results'}
            >
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isShortlisted
                  ? 'Congratulations. Your team will build on campus during the 24-hour sprint.'
                  : stage === 'invited'
                    ? hackathon.isLead
                      ? 'Congratulations, your team is selected. Confirm your place in the Phase 2 card in the hackathon workspace.'
                      : 'Congratulations, your team is selected. Your team lead confirms the place before anyone pays.'
                    : stage === 'waitlisted'
                      ? 'Your team is in the waiting room. Do not pay yet; this card updates if a desk opens.'
                      : 'Results are released team by team. Your result appears here once released.'}
              </p>
            </StepRow>

            <StepRow
              index={3}
              state={!isShortlisted ? 'locked' : flagshipStatus === 'closed' ? 'missed' : 'active'}
              title={`Pay ₹${FLAGSHIP_PASS_FEE_INR} per person for the Flagship Pass`}
            >
              {!isShortlisted ? (
                <p className="text-xs text-slate-400 dark:text-slate-500">Opens for shortlisted teams after results.</p>
              ) : flagshipStatus === 'open' && leadWaitingForTeam ? (
                <div className="space-y-3">
                  {flagship?.deadlineIso && (
                    <PaymentCountdown deadlineIso={flagship.deadlineIso} onExpire={handleFlagshipWindowExpire} />
                  )}
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    As team lead you pay last. {teamPayment?.othersPaid} of {teamPayment?.othersTotal} teammates have
                    submitted their receipts. Your payment button appears here once all of them have.
                  </p>
                </div>
              ) : flagshipStatus === 'open' && flagship?.deadlineIso && flagship.gatewayUrl ? (
                <div className="space-y-3">
                  <PaymentCountdown deadlineIso={flagship.deadlineIso} onExpire={handleFlagshipWindowExpire} />
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Every team member pays ₹{FLAGSHIP_PASS_FEE_INR} separately and submits their own receipt here.
                    Pay before the timer ends; unpaid places may be released.
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    On Easebuzz this pass is called the Diamond Pass. It appears only after you tick &ldquo;I confirm
                    the above&rdquo; and set &ldquo;Offline Entry Pass (Platinum)&rdquo; to &ldquo;No&rdquo;.{' '}
                    <Link href="/flagship-pass-guide" className="font-semibold text-burgundy dark:text-[#F07A86] hover:underline">
                      Read the payment guide before paying
                    </Link>
                    .
                  </p>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <a
                      href={flagship.gatewayUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-burgundy hover:bg-burgundy-deep text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      Pay ₹{FLAGSHIP_PASS_FEE_INR} on Easebuzz
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={() => setFlagshipFormOpen(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 dark:border-[#3D1418] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1C0A0D] text-xs font-semibold rounded-lg cursor-pointer"
                    >
                      I have paid: submit receipt
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : flagshipStatus === 'closed' ? (
                <p className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
                  The {flagship?.windowHours ?? 48}-hour payment window closed
                  {flagship?.deadlineIso ? ` on ${formatIst(flagship.deadlineIso)} IST` : ''}. If you paid in time but
                  did not submit your receipt, contact the organizing committee.
                </p>
              ) : (
                <div className="p-3.5 rounded-xl border border-amber-200/80 dark:border-amber-900/40 bg-amber-50/90 dark:bg-amber-950/20 text-xs text-amber-900 dark:text-amber-200/90 space-y-1.5 leading-relaxed">
                  <p className="font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    Payment link expected on {flagship?.expectedLabel || '19 October 2026'}
                  </p>
                  <p>
                    Your team&apos;s desk is held. There is nothing to pay today. When the link is published it appears on
                    this card, and your team gets <strong>{hackathon.phase2?.paymentWindowHours ?? 48} hours</strong> from
                    then to pay ₹{FLAGSHIP_PASS_FEE_INR} each, the team lead last.
                  </p>
                  <p>
                    Do not pay on the ₹{PASS_FEE_INR} General Pass form. That payment does not count towards the Flagship Pass.
                  </p>
                </div>
              )}
            </StepRow>
          </ol>

          {!isShortlisted && (
            <p className="mt-5 pt-4 border-t border-slate-100 dark:border-[#250D11] text-[11px] text-slate-500 dark:text-slate-400">
              Not shortlisted? You can still attend the festival with the ₹99 General Pass. It opens here once results are announced.
            </p>
          )}
        </div>
      </div>
    );
  }

  const pass = data?.pass;
  const showClaimForm = !pass || isResubmitting;

  // Claimed pass: badge view (pending / verified / rejected)
  if (pass && !showClaimForm) {
    const isVerified = pass.status === 'verified';
    const isRejected = pass.status === 'rejected';
    // SRM AP students with a rejected General Pass claim take the free pass instead of resubmitting
    const canClaimFree =
      isRejected && isSrmApEmail(data?.user?.email) && hackathon?.outcome !== 'shortlisted';

    const tone = isVerified
      ? {
          label: 'Verified · Ready for Entry',
          band: 'bg-emerald-700',
          icon: <ShieldCheck className="w-4 h-4" />,
        }
      : isRejected
        ? {
            label: 'Receipt Rejected · Action Required',
            band: 'bg-rose-700',
            icon: <XCircle className="w-4 h-4" />,
          }
        : {
            label: 'Submitted · Pending Verification',
            band: 'bg-amber-600',
            icon: <Clock className="w-4 h-4" />,
          };

    return (
      <div className="relative bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-2xl overflow-hidden">
        <div className={clsx(tone.band, 'text-white px-5 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2')}>
          <span className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider">
            {tone.icon}
            {tone.label}
          </span>
          <span className="font-mono text-[11px] font-semibold opacity-90">
            {pass.institution?.toLowerCase().includes('faculty')
              ? 'Faculty Pass · Official Guest (QIS)'
              : Number(pass.amount_inr) === 0
              ? 'General Offline Pass · Free (SRM-AP)'
              : `${passTierLabel(pass.pass_tier)} · ₹${pass.amount_inr}`}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto]">
          <div className="p-5 sm:p-6 space-y-4">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#FAF6F3]">
                {pass.user_name}
              </h2>
              <p className="font-mono text-xs text-slate-500 dark:text-slate-400 mt-0.5 break-all">
                {pass.user_email} · {pass.institution || 'SRM University-AP'}
              </p>
            </div>

            {isRejected ? (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-200 space-y-1">
                <p className="font-semibold">The organizing team could not match your receipt to a payment.</p>
                {pass.admin_notes && <p>Reason: {pass.admin_notes}</p>}
                <p>
                  {canClaimFree
                    ? 'The General Pass is now free for SRM University-AP students. Claim your free pass below.'
                    : 'Check the Transaction ID and upload the correct receipt.'}
                </p>
              </div>
            ) : isVerified ? (
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {pass.institution?.toLowerCase().includes('faculty')
                  ? 'Official Faculty Pass confirmed. Show this QR code at Campus Gate 3 upon arrival. Valid 26–30 October 2026.'
                  : Number(pass.amount_inr) === 0
                  ? 'SRM University-AP complimentary pass confirmed. Show the QR code at the event entrance. Valid 26–30 October 2026.'
                  : 'Payment confirmed. Show this QR code at Campus Gate 3 when you arrive. Valid 26–30 October 2026.'}
              </p>
            ) : (
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                The organizing team is matching your receipt with Easebuzz records. You can already download your pass; the desk will see its status when they scan it.
              </p>
            )}

            <dl className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="min-w-0">
                <dt className="text-[10px] text-slate-400 uppercase">
                  {Number(pass.amount_inr) === 0 ? 'Pass Reference' : 'Transaction ID'}
                </dt>
                <dd className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {pass.transaction_reference}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-[10px] text-slate-400 uppercase">
                  {pass.receipt_url?.startsWith('institutional://') ? 'Verification' : 'Receipt'}
                </dt>
                <dd>
                  {pass.receipt_url?.startsWith('institutional://') ? (
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      SRM-AP Student
                    </span>
                  ) : (
                    <a
                      href={pass.receipt_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-burgundy dark:text-[#E89BA5] hover:underline inline-flex items-center gap-1"
                    >
                      View
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </dd>
              </div>
            </dl>

            <div className="flex flex-wrap items-center gap-2.5">
              {canClaimFree ? (
                <button
                  type="button"
                  onClick={handleClaimFreePass}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 bg-burgundy hover:bg-burgundy-deep text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>Claim Free Campus Pass</span>
                </button>
              ) : isRejected ? (
                <button
                  type="button"
                  onClick={() => setIsResubmitting(true)}
                  className="px-4 py-2.5 bg-burgundy hover:bg-burgundy-deep text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Resubmit Receipt</span>
                </button>
              ) : null}
              {!isVerified && !isRejected && (
                <button
                  type="button"
                  onClick={() => setIsResubmitting(true)}
                  className="px-3.5 py-2.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-semibold rounded-xl border border-slate-200 dark:border-[#3D1418] cursor-pointer"
                >
                  Correct Details
                </button>
              )}
            </div>
            {canClaimFree && errorMessage && (
              <p className="text-xs text-rose-700 dark:text-rose-300">{errorMessage}</p>
            )}
          </div>

          {/* QR stub, separated by a perforated edge */}
          {!isRejected && (
            <div className="relative border-t-2 md:border-t-0 md:border-l-2 border-dashed border-slate-200 dark:border-[#3D1418] p-5 sm:p-6 flex flex-col items-center justify-center text-center gap-2 bg-slate-50/60 dark:bg-[#1C0A0D]">
              <span className={clsx(NOTCH, 'hidden md:block -top-2.5 -left-2.5')} />
              <span className={clsx(NOTCH, 'hidden md:block -bottom-2.5 -left-2.5')} />
              {qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrDataUrl}
                  alt="Pass QR code"
                  className="w-40 h-40 rounded-lg bg-white p-1 border border-slate-200"
                />
              ) : (
                <div className="w-40 h-40 flex items-center justify-center bg-white rounded-lg border border-slate-200">
                  <QrCode className="w-10 h-10 text-slate-300" />
                </div>
              )}
              <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Show at Gate 3
              </span>
            </div>
          )}

          {/* Campus arrival guide for external participants; SRM AP students are already on campus */}
          {!isSrmApEmail(pass.user_email) && (
          <div className="md:col-span-2 border-t border-slate-200 dark:border-[#3D1418] bg-slate-50/80 dark:bg-[#1A0A0D] p-5 sm:p-6 space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-burgundy dark:text-[#E89BA5]" />
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900 dark:text-[#FAF6F3]">
                Getting to campus
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] space-y-1">
                <span className="font-mono text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400">
                  On-Campus Stay (Chargeable)
                </span>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  For external participants who requested stay in their profile. Hostel stay is chargeable at subsidized student rates (tariff will be published shortly). For queries or tariff info, call{' '}
                  <a href="tel:+916301387227" className="font-semibold text-burgundy dark:text-[#E89BA5] underline">
                    +91 63013 87227
                  </a>
                  .
                </p>
              </div>
              <div className="p-3 rounded-lg bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] space-y-1">
                <span className="font-mono text-[10px] uppercase font-bold text-sky-700 dark:text-sky-400">
                  Check-In from Monday Morning
                </span>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  Room check-in and allotment begin strictly from <strong>Monday morning (26 October)</strong> at Gate 3. Early check-in prior to Monday morning is not available.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] space-y-1">
                <span className="font-mono text-[10px] uppercase font-bold text-burgundy dark:text-[#E89BA5]">
                  Transit to Gate 3 (Train / Auto Arrivals)
                </span>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  From Vijayawada or Guntur railway station, take an auto directly to <strong>SRM University-AP, Gate 3</strong>. Our desk at Gate 3 checks your pass QR and coordinates on-spot room allocation starting Monday morning.
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                  <strong>Opted for daily SRM bus?</strong>{' '}
                  {SPECIAL_BUS_TRIPS.map((trip) => `${trip.route}: ${trip.boardingPoints.join(', ')}`).join('; ')}. Reporting{' '}
                  {SPECIAL_BUS_TRIPS[0].reportingTime}, return {SPECIAL_BUS_TRIPS[0].returnTime}.
                </p>
              </div>
            </div>
            <div className="pt-1 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-400 font-mono">
              <span>Call when you are on the way, or if you arrive late:</span>
              <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                {ACCOMMODATION_HELPLINES.map((h) => (
                  <a
                    key={h.tel}
                    href={`tel:${h.tel}`}
                    className="font-bold text-burgundy dark:text-[#E89BA5] hover:underline inline-flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{h.display}</span>
                  </a>
                ))}
              </span>
            </div>
            <a
              href={ACCOMMODATION_WHATSAPP_GROUP}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-[#150709] text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-xs font-semibold"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Staying on campus? Join the accommodation WhatsApp group
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          )}
        </div>
      </div>
    );
  }

  // Claim flow: ticket stub (left) + three-step checkout (right)
  const isSrmAp = isSrmApEmail(data?.user?.email);
  const flagshipMode = hackathon?.outcome === 'shortlisted' || pass?.pass_tier === 'flagship_offline';
  const fee = flagshipMode ? FLAGSHIP_PASS_FEE_INR : PASS_FEE_INR;
  const gatewayUrl = flagshipMode && flagship?.gatewayUrl ? flagship.gatewayUrl : EASEBUZZ_GATEWAY_URL;
  // Shortlisted members reach this form via "I have paid", so the pay step counts as done
  const payStepDone = gatewayOpened || isResubmitting || flagshipMode;
  const fileDone = Boolean(selectedFile);
  const txnDone = transactionRef.trim().length >= 6;

  return (
    <div className="relative bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-[280px_1fr]">
      {/* Ticket stub */}
      {flagshipMode ? (
        <div className="relative bg-[#201617] text-white p-5 sm:p-6 flex flex-col justify-between gap-5">
          <div className="space-y-3">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-amber-300">
              Admit One · Phase 2 Finalists
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold leading-tight">Flagship Pass</h2>
            <div className="space-y-1.5 text-xs text-slate-300">
              <p className="flex items-center gap-2">
                <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                26–30 October 2026
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                SRM University-AP, Main Campus
              </p>
            </div>
            <ul className="space-y-1 text-xs text-slate-200 pt-1">
              {FLAGSHIP_INCLUSIONS.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-300" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex items-baseline gap-1.5 border-t border-white/15 pt-4">
            <span className="font-serif text-4xl font-bold tabular-nums">₹{FLAGSHIP_PASS_FEE_INR}</span>
            <span className="font-mono text-[11px] text-slate-400">per person · all 5 days</span>
          </div>
          <span className={clsx(NOTCH, 'hidden lg:block -top-2.5 -right-2.5')} />
          <span className={clsx(NOTCH, 'hidden lg:block -bottom-2.5 -right-2.5')} />
        </div>
      ) : isSrmAp ? (
        <div className="relative bg-[#3B070D] text-white p-5 sm:p-6 flex flex-col justify-between gap-5">
          <div className="space-y-3">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-300">
              Host University Privilege · Admit One
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold leading-tight">
              SRM-AP Campus Pass
            </h2>
            <div className="space-y-1.5 text-xs text-rose-100">
              <p className="flex items-center gap-2">
                <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                26–30 October 2026
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                SRM University-AP, Main Campus
              </p>
            </div>
            <ul className="space-y-1 text-xs text-rose-50/90 pt-1">
              {PASS_INCLUSIONS.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 mt-0.5 shrink-0 text-emerald-300" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-rose-200/80 pt-2 border-t border-white/10 leading-snug">
              Excludes Hackathon Phase 2, QCTF &amp; meals (Flagship Pass only).
            </p>
          </div>
          <div className="flex items-baseline gap-2 border-t border-white/20 pt-4">
            <span className="font-serif text-3xl sm:text-4xl font-bold text-white">FREE</span>
            <span className="font-mono text-[11px] text-emerald-300 line-through">₹99</span>
            <span className="font-mono text-[11px] text-rose-200">SRM-AP Students</span>
          </div>
          <span className={clsx(NOTCH, 'hidden lg:block -top-2.5 -right-2.5')} />
          <span className={clsx(NOTCH, 'hidden lg:block -bottom-2.5 -right-2.5')} />
        </div>
      ) : (
      <div className="relative bg-burgundy text-white p-5 sm:p-6 flex flex-col justify-between gap-5">
        <div className="space-y-3">
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-rose-200">
            Admit One · On-Campus
          </span>
          <h2 className="font-serif text-xl sm:text-2xl font-bold leading-tight">
            General Offline Pass
          </h2>
          <div className="space-y-1.5 text-xs text-rose-100">
            <p className="flex items-center gap-2">
              <CalendarDays className="w-3.5 h-3.5 shrink-0" />
              26–30 October 2026
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              SRM University-AP, Main Campus
            </p>
          </div>
          <ul className="space-y-1 text-xs text-rose-50/90 pt-1">
            {PASS_INCLUSIONS.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 mt-0.5 shrink-0 text-rose-200" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-rose-200/80 pt-2 border-t border-white/10 leading-snug">
            Excludes Hackathon Phase 2, QCTF &amp; meals (Flagship Pass only).
          </p>
        </div>
        <div className="flex items-baseline gap-1.5 border-t border-white/20 pt-4">
          <span className="font-serif text-4xl font-bold tabular-nums">₹99</span>
          <span className="font-mono text-[11px] text-rose-200">one-time · all 5 days</span>
        </div>
        <span className={clsx(NOTCH, 'hidden lg:block -top-2.5 -right-2.5')} />
        <span className={clsx(NOTCH, 'hidden lg:block -bottom-2.5 -right-2.5')} />
      </div>
      )}

      {/* Checkout steps */}
      {!flagshipMode && isSrmAp && !isResubmitting ? (
        <div className="p-5 sm:p-6 border-t-2 lg:border-t-0 lg:border-l-2 border-dashed border-slate-200 dark:border-[#3D1418] flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                SRM University-AP Host Student Privilege
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#FAF6F3]">
                Claim Your Free On-Campus Pass
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                As an SRM-AP student, entry to keynote lectures, hands-on workshops, the Industry Tech Expo, the Quantum Startup Pitch, the Quantum Reference Center tour, the debate, and open arcade games is free.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1C0A0D] border border-slate-200 dark:border-[#3D1418] space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Users className="w-4 h-4 text-burgundy dark:text-[#E89BA5]" />
                Attendee Details
              </p>
              <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                {data?.user?.fullName} &middot; {data?.user?.email}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                Clicking below will issue your official verified badge with a personalized gate QR code. No payment or receipt upload required.
              </p>
            </div>

            <div className="p-3.5 bg-amber-50/90 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 rounded-xl text-xs text-amber-900 dark:text-amber-200/90 space-y-1">
              <p className="font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                Scope &amp; Exclusions Notice
              </p>
              <p className="leading-relaxed">
                The free General Pass includes all general festival events (exhibits, keynotes, workshops, games). It does <strong>not</strong> include entry to Hackathon Phase 2 sprint competition or 5-day special meals (reserved exclusively for ₹499 Flagship Pass holders).
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          <div>
            <button
              type="button"
              onClick={handleClaimFreePass}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-3 bg-burgundy hover:bg-burgundy-deep text-white text-sm font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Issuing Campus Pass...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Claim Free Campus Pass</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">
              Valid on campus 26–30 October 2026. Show downloaded badge or phone QR code at desk.
            </p>
          </div>
        </div>
      ) : (
      <form
        onSubmit={handleClaimPass}
        className="p-5 sm:p-6 border-t-2 lg:border-t-0 lg:border-l-2 border-dashed border-slate-200 dark:border-[#3D1418]"
      >
        <div className="flex items-center justify-between gap-2 mb-4">
          <div>
            {data?.hackathon?.outcome === 'not_shortlisted' && !isResubmitting && (
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">
                Team {data.hackathon.teamName} ·{' '}
                {data.hackathon.submittedAt ? 'Not shortlisted for Phase 2' : 'Phase 1 not submitted'}
              </p>
            )}
            {flagshipMode && !isResubmitting && (
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">
                Team {data?.hackathon?.teamName} · Shortlisted for Phase 2
              </p>
            )}
            <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-[#FAF6F3]">
              {isResubmitting
                ? 'Update your receipt details'
                : flagshipMode
                  ? `Submit your ₹${FLAGSHIP_PASS_FEE_INR} payment receipt`
                  : data?.hackathon?.outcome === 'not_shortlisted'
                  ? 'You can still attend: get your pass in three steps'
                  : 'Get your pass in three steps'}
            </h3>
          </div>
          {(isResubmitting || (flagshipMode && !pass)) && (
            <button
              type="button"
              onClick={() => {
                setIsResubmitting(false);
                setFlagshipFormOpen(false);
                setErrorMessage('');
              }}
              className="font-mono text-[11px] text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>

        {!flagshipMode && !isResubmitting && (
          <p className="mb-4 p-3 rounded-xl bg-slate-50 dark:bg-[#1C0A0D] border border-slate-200 dark:border-[#3D1418] text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            SRM University-AP student? The General Pass is free. Sign in with your @srmap.edu.in account to claim
            it, or show your SRM AP student ID card at the registration desk. Do not pay ₹{PASS_FEE_INR}.
          </p>
        )}

        {flagshipMode && flagshipStatus === 'open' && flagship?.deadlineIso && (
          <div className="mb-5">
            <PaymentCountdown deadlineIso={flagship.deadlineIso} onExpire={handleFlagshipWindowExpire} />
          </div>
        )}

        {/* Scope & Exclusions Notice */}
        {!flagshipMode && (
        <div className="mb-5 p-3.5 bg-amber-50/90 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 rounded-xl text-xs text-amber-900 dark:text-amber-200/90 space-y-1.5">
          <p className="font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            Pass Scope &amp; Exclusions Notice
          </p>
          <p className="leading-relaxed">
            The <strong>₹99 General Pass</strong> grants full campus entry to keynotes, workshops, tech expo exhibits, the Quantum Reference Center tour, debates, and open games for all 5 days. It also includes the <strong>Quantum Startup Pitch</strong>. It does <strong>not</strong> include entry to competitive flagship tracks (<strong>Hackathon Phase 2</strong>, <strong>QCTF</strong>) or the <strong>5-day special lunch and daily refreshments</strong>.
          </p>
          <p className="leading-relaxed text-amber-800/80 dark:text-amber-300/80">
            These flagship tracks and meals are reserved exclusively for the <strong>₹499 All-Access Flagship Pass</strong> (awarded to shortlisted hackathon teams and qualified finalists).
          </p>
        </div>
        )}

        <ol className="space-y-5">
          {/* Step 1 */}
          <li className="flex gap-3">
            <StepMarker index={1} done={payStepDone} active={!payStepDone} />
            <div className="flex-1 min-w-0 space-y-2">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-[#FAF6F3]">
                  Pay ₹{fee} on the SRM-AP payment gateway
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Opens Easebuzz in a new tab. After paying, download the receipt; a copy is also emailed to you.
                </p>
                {!flagshipMode && (
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    <strong>This is the pass payment.</strong> The ₹{PASS_FEE_INR} masterclass certificate uses the same
                    Easebuzz form but is a separate payment; one transaction ID cannot be used for both.
                  </p>
                )}
              </div>
              <a
                href={gatewayUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={markGatewayOpened}
                className={clsx(
                  'inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-colors',
                  payStepDone
                    ? 'border border-slate-300 dark:border-[#3D1418] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1C0A0D]'
                    : 'bg-burgundy hover:bg-burgundy-deep text-white'
                )}
              >
                {payStepDone ? 'Open Gateway Again' : `Pay ₹${fee} on Easebuzz`}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </li>

          {/* Step 2 */}
          <li className="flex gap-3">
            <StepMarker index={2} done={fileDone} active={payStepDone && !fileDone} />
            <div className="flex-1 min-w-0 space-y-2">
              <p className="text-sm font-semibold text-slate-900 dark:text-[#FAF6F3]">
                Upload the receipt
              </p>
              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                className={clsx(
                  'flex items-center gap-3 rounded-lg border-2 border-dashed px-3.5 py-3 cursor-pointer transition-colors',
                  isDragOver
                    ? 'border-burgundy bg-burgundy/5'
                    : fileDone
                      ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20'
                      : 'border-slate-300 dark:border-[#4A181E] hover:border-burgundy/60'
                )}
              >
                <FileText className="w-5 h-5 text-slate-400 shrink-0" />
                <span className="flex-1 min-w-0">
                  <span className="block text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                    {selectedFile ? selectedFile.name : 'Choose file or drop it here'}
                  </span>
                  <span className="block font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    {selectedFile
                      ? `${(selectedFile.size / 1024).toFixed(1)} KB`
                      : `PDF receipt or screenshot · up to ${MAX_RECEIPT_SIZE_MB} MB`}
                  </span>
                </span>
                {selectedFile ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      clearFile();
                    }}
                    className="p-1.5 rounded-md text-slate-500 hover:text-rose-600 cursor-pointer"
                    aria-label="Remove selected file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <Upload className="w-4 h-4 text-burgundy dark:text-[#E89BA5] shrink-0" />
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/*"
                  onChange={(e) => acceptFile(e.target.files?.[0])}
                  className="sr-only"
                />
              </label>
            </div>
          </li>

          {/* Step 3 */}
          <li className="flex gap-3">
            <StepMarker index={3} done={txnDone} active={fileDone && !txnDone} />
            <div className="flex-1 min-w-0 space-y-3">
              <p className="text-sm font-semibold text-slate-900 dark:text-[#FAF6F3]">
                Enter the reference numbers from the receipt
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="pass-txn" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Easebuzz Transaction ID <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="pass-txn"
                    type="text"
                    required
                    autoComplete="off"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value.toUpperCase())}
                    placeholder="E26101518BKHN3"
                    className="w-full px-3 py-2 text-sm font-mono uppercase border border-slate-300 dark:border-[#3D1418] rounded-lg bg-white dark:bg-[#1C0A0D] text-slate-900 dark:text-[#FAF6F3] focus:outline-none focus:ring-1 focus:ring-burgundy"
                  />
                </div>
                <div>
                  <label htmlFor="pass-bank" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Bank Reference / UTR <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input
                    id="pass-bank"
                    type="text"
                    autoComplete="off"
                    inputMode="numeric"
                    value={bankRef}
                    onChange={(e) => setBankRef(e.target.value)}
                    placeholder="194589444789"
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-300 dark:border-[#3D1418] rounded-lg bg-white dark:bg-[#1C0A0D] text-slate-900 dark:text-[#FAF6F3] focus:outline-none focus:ring-1 focus:ring-burgundy"
                  />
                </div>
              </div>
            </div>
          </li>
        </ol>

        {errorMessage && (
          <div className="mt-5 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-lg text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-[#250D11] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm">
            Your pass and QR code appear here right after you submit. The organizing team then verifies the payment.
          </p>
          <button
            type="submit"
            disabled={isSubmitting || !fileDone || !txnDone}
            className="w-full sm:w-auto px-5 py-2.5 bg-burgundy hover:bg-burgundy-deep text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{uploadStatus || 'Submitting...'}</span>
              </>
            ) : (
              <span>Submit &amp; Get Pass</span>
            )}
          </button>
        </div>
      </form>
      )}
    </div>
  );
}
