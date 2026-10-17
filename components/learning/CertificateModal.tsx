'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import {
  Award,
  CheckCircle2,
  Lock,
  Download,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  X,
  Clock,
  Upload,
  FileText,
  XCircle,
  Send,
  Info,
  Fingerprint,
  BadgeCheck,
  GraduationCap,
  Printer,
} from 'lucide-react';
import {
  CERTIFICATE_DELIVERY_LABEL,
  CERTIFICATE_FEE_INR,
  type CertificateDeliveryMode,
  EASEBUZZ_GATEWAY_URL,
  MAX_RECEIPT_SIZE_MB,
  TXN_FORMAT_HINT,
  TXN_PATTERN,
  isAcceptedReceipt,
  normalizeTxn,
  uploadReceipt,
} from '@/lib/payments';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  userName: string;
}

interface PaymentSubmission {
  id: string;
  transaction_reference: string;
  bank_reference?: string | null;
  receipt_url?: string | null;
  amount_inr?: number | null;
  status: 'pending_verification' | 'verified' | 'rejected';
  admin_notes?: string | null;
  delivery_mode?: CertificateDeliveryMode | null;
  delivered_at?: string | null;
  created_at: string;
}

interface EligibilityData {
  eligible: boolean;
  alreadyIssued: boolean;
  feeInr?: number;
  gatewayUrl?: string;
  paymentSubmission?: PaymentSubmission | null;
  issuedCertificate?: {
    id: string;
    serialNumber: string;
    recipientName: string;
    averageQuizScore: number;
    certificateUrl: string;
    issuedAt: string;
    verificationHash: string;
  };
  totalSessions: number;
  sessionsCompleted: number;
  quizzesPassed: number;
  averageQuizScore: number;
  missingTasks: string[];
  userEmail?: string;
  userName?: string;
}

export function CertificateModal({
  isOpen,
  onClose,
  userEmail,
  userName,
}: CertificateModalProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<EligibilityData | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [issuedCert, setIssuedCert] = useState<any>(null);
  const [transactionRef, setTransactionRef] = useState('');
  const [bankRef, setBankRef] = useState('');
  const [deliveryMode, setDeliveryMode] = useState<CertificateDeliveryMode | ''>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isResubmitting, setIsResubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Prevent background scrolling while modal is open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      loadEligibility();
    }
  }, [isOpen]);

  async function loadEligibility() {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/learning/certificate/eligibility', {
        cache: 'no-store',
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setData(json);
        if (json.alreadyIssued && json.issuedCertificate) {
          setIssuedCert(json.issuedCertificate);
        }
      } else {
        setErrorMessage(json.error || 'Failed to load certification details.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error connecting to certification engine.');
    } finally {
      setLoading(false);
    }
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
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleSubmitPayment(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const normalizedTxn = normalizeTxn(transactionRef);
    if (!TXN_PATTERN.test(normalizedTxn)) {
      setErrorMessage(TXN_FORMAT_HINT);
      return;
    }
    if (!selectedFile) {
      setErrorMessage('Please upload your Easebuzz receipt (PDF or screenshot).');
      return;
    }
    if (!deliveryMode) {
      setErrorMessage('Choose how you want to receive the certificate.');
      return;
    }

    setIsSubmitting(true);
    setUploadStatus('Uploading receipt...');

    try {
      const receiptUrl = await uploadReceipt(
        selectedFile,
        'certificate-receipts',
        data?.userEmail || userEmail,
        normalizedTxn
      );

      setUploadStatus('Submitting payment...');
      const res = await fetch('/api/learning/certificate/submit-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionReference: normalizedTxn,
          receiptUrl,
          bankReference: bankRef.trim() || null,
          deliveryMode,
        }),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to submit payment.');
      }

      setSuccessMessage('Receipt submitted. Your certificate will be issued once the payment is verified.');
      setTransactionRef('');
      setBankRef('');
      clearFile();
      setIsResubmitting(false);
      await loadEligibility();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Network error submitting payment.');
    } finally {
      setIsSubmitting(false);
      setUploadStatus('');
    }
  }

  if (!isOpen || !isMounted || typeof document === 'undefined') return null;

  const totalSessionsCount = data?.totalSessions || 5;
  const totalTasks = totalSessionsCount * 2;
  const completedTasks =
    (data?.sessionsCompleted || 0) + (data?.quizzesPassed || 0);
  const progressPercent = Math.min(
    100,
    Math.round((completedTasks / totalTasks) * 100)
  );

  const existingSub = data?.paymentSubmission;
  const showPaymentForm = !existingSub || (existingSub.status === 'rejected' && isResubmitting);
  const feeInr = data?.feeInr ?? CERTIFICATE_FEE_INR;
  const gatewayUrl = data?.gatewayUrl || EASEBUZZ_GATEWAY_URL;
  const activeUserName = userName || data?.userName || 'Candidate';

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/70 dark:bg-black/85 backdrop-blur-xs font-sans overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="certificate-modal-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#150709] rounded-2xl border border-slate-200 dark:border-[#3D1418] shadow-2xl max-w-xl w-full max-h-[85vh] sm:max-h-[88vh] flex flex-col my-auto relative overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Sticky/Fixed Header - Stays anchored at top */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-[#3D1418] bg-white dark:bg-[#150709] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-burgundy/10 text-burgundy dark:bg-burgundy/20 dark:text-[#E89BA5] flex items-center justify-center font-bold shrink-0">
              <Award className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h2 id="certificate-modal-title" className="font-serif text-base sm:text-lg font-bold text-slate-900 dark:text-[#FAF6F3] tracking-tight truncate">
                Official Masterclass Certificate
              </h2>
              <p className="font-mono text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                IBM Quantum × SRM University-AP
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1C0A0D] transition-colors cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body Content Container */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 min-h-0 [scrollbar-width:thin] [scrollbar-color:#CBD5E1_transparent] dark:[scrollbar-color:#3D1418_transparent]">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-burgundy border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                Verifying academic completion status...
              </p>
            </div>
          ) : issuedCert ? (
            /* STATE 1: ALREADY ISSUED */
            <div className="space-y-5 text-center py-2">
              <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1 mb-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Certificate Issued
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-[#FAF6F3] leading-snug">
                  Congratulations, {activeUserName}!
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-md mx-auto leading-relaxed">
                  Your course completion and payment have been verified. Anyone can confirm this
                  certificate on the public verification page using its Credential ID.
                </p>
              </div>

              {data?.paymentSubmission?.delivery_mode && (
                <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#1C0A0D] border border-slate-200 dark:border-[#3D1418] rounded-lg p-3 text-left">
                  {data.paymentSubmission.delivery_mode === 'ceremony'
                    ? data.paymentSubmission.delivered_at
                      ? 'Collected at the valedictory ceremony.'
                      : 'Collect your printed certificate in person at the valedictory ceremony.'
                    : data.paymentSubmission.delivered_at
                      ? `Emailed to ${data.userEmail || userEmail}.`
                      : `A copy will be emailed to ${data.userEmail || userEmail}.`}
                </p>
              )}

              {/* Serial & Distinction Preview Card */}
              <div className="p-4 bg-slate-50 dark:bg-[#1C0A0D] rounded-xl border border-slate-200 dark:border-[#3D1418] text-left space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Credential ID:</span>
                  <code className="font-mono font-bold text-slate-900 dark:text-[#FAF6F3] bg-white dark:bg-[#150709] px-2 py-0.5 rounded border border-slate-200 dark:border-[#3D1418]">
                    {issuedCert.serialNumber || issuedCert.serial_number}
                  </code>
                </div>
                {issuedCert.averageQuizScore && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Distinction:</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                      Score: {issuedCert.averageQuizScore}%
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href={`/verify-certificate/${issuedCert.serialNumber || issuedCert.serial_number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-4 bg-slate-100 dark:bg-[#1C0A0D] hover:bg-slate-200 dark:hover:bg-[#250D11] text-slate-800 dark:text-[#FAF6F3] border border-slate-200 dark:border-[#3D1418] text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Public Verification
                </a>
                <a
                  href={issuedCert.certificateUrl || issuedCert.certificate_url}
                  download={`${issuedCert.serialNumber || issuedCert.serial_number}.svg`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-4 bg-burgundy text-white text-xs font-semibold rounded-lg hover:bg-burgundy-deep transition-colors shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Certificate (SVG)
                </a>
              </div>
            </div>
          ) : !data?.eligible ? (
            /* STATE 2: INCOMPLETE / LOCKED */
            <div className="space-y-6">
              <CertificatePreview
                recipientName={activeUserName}
                totalSessions={totalSessionsCount}
                locked
              />
              <CertificateAbout totalSessions={totalSessionsCount} />

              {/* Academic Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Academic Requirement Progress: {completedTasks} / {totalTasks} Tasks
                  </span>
                  <span className="font-bold text-burgundy dark:text-[#E89BA5]">
                    {progressPercent}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-[#250D11] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-burgundy rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Strict Requirement Checklist Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-[#1C0A0D] rounded-lg border border-slate-200/80 dark:border-[#3D1418] space-y-1">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block">
                    {totalSessionsCount} Video Lectures:
                  </span>
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                    {data?.sessionsCompleted === totalSessionsCount ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-500" />
                    )}
                    <span>
                      {data?.sessionsCompleted || 0} of {totalSessionsCount} Watched
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-[#1C0A0D] rounded-lg border border-slate-200/80 dark:border-[#3D1418] space-y-1">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block">
                    {totalSessionsCount} Concept Check Quizzes:
                  </span>
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                    {data?.quizzesPassed === totalSessionsCount ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-500" />
                    )}
                    <span>
                      {data?.quizzesPassed || 0} of {totalSessionsCount} Passed (Avg: {data?.averageQuizScore || 0}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Missing Requirements List */}
              {data?.missingTasks && data.missingTasks.length > 0 && (
                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-900 dark:text-amber-200 space-y-2">
                  <span className="font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                    Pending Academic Requirements:
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-amber-800 dark:text-amber-300 text-[11px] pl-1">
                    {data.missingTasks.map((task, idx) => (
                      <li key={idx}>{task}</li>
                    ))}
                  </ul>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400/90 pt-1 border-t border-amber-200/60 dark:border-amber-800/60">
                    The certificate unlocks automatically once every video lecture has been watched and all concept quizzes are passed.
                  </p>
                </div>
              )}

              {/* Locked Notice */}
              <div className="p-4 bg-slate-50 dark:bg-[#1C0A0D] border border-slate-200 dark:border-[#3D1418] rounded-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    Complete all {totalSessionsCount} video lectures and quizzes to unlock the ₹{CERTIFICATE_FEE_INR} certificate payment.
                  </span>
                </div>
                <button
                  disabled
                  className="px-4 py-2 bg-slate-200 dark:bg-[#250D11] text-slate-400 dark:text-slate-500 text-xs font-semibold rounded-lg cursor-not-allowed shrink-0"
                >
                  Locked
                </button>
              </div>

              {errorMessage && (
                <p className="text-xs text-rose-600 dark:text-rose-400 font-medium bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded border border-rose-200 dark:border-rose-900 leading-relaxed">
                  {errorMessage}
                </p>
              )}
            </div>
          ) : (
            /* STATE 3: ELIGIBLE (UNLOCKED) */
            <div className="space-y-5">
              <CertificatePreview
                recipientName={activeUserName}
                totalSessions={totalSessionsCount}
                averageScore={data?.averageQuizScore}
              />

              <div className="flex items-start gap-2 px-3.5 py-2.5 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-px text-emerald-600 dark:text-emerald-400" />
                <span>
                  <span className="font-bold">Course completed.</span> All {totalSessionsCount} video lectures watched and every concept check quiz passed (average {data?.averageQuizScore}%).
                </span>
              </div>

              {!(existingSub && !showPaymentForm) && (
                <>
                  <CertificateAbout totalSessions={totalSessionsCount} />

                  <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-[#1C0A0D] border border-slate-200 dark:border-[#3D1418]">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-[#FAF6F3]">
                        Verified Masterclass Certificate
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        One-time fee, paid on the SRM-AP Easebuzz page. Issued after {CERTIFICATE_RELEASE_LABEL}.
                      </p>
                    </div>
                    <span className="font-serif text-2xl font-bold text-slate-900 dark:text-[#FAF6F3] shrink-0">
                      ₹{feeInr}
                    </span>
                  </div>
                </>
              )}

              {existingSub && !showPaymentForm ? (
                /* Submitted payment status */
                <div className="p-4 bg-slate-50 dark:bg-[#1C0A0D] border border-slate-200 dark:border-[#3D1418] rounded-xl space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Certificate Payment
                    </span>
                    {existingSub.status === 'pending_verification' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Under Review
                      </span>
                    )}
                    {existingSub.status === 'verified' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                    {existingSub.status === 'rejected' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900 flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        Rejected
                      </span>
                    )}
                  </div>

                  <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs">
                    <dt className="text-slate-500 dark:text-slate-400">Transaction ID</dt>
                    <dd className="font-mono font-bold text-slate-900 dark:text-[#FAF6F3] break-all">
                      {existingSub.transaction_reference}
                    </dd>
                    <dt className="text-slate-500 dark:text-slate-400">Submitted</dt>
                    <dd className="text-slate-700 dark:text-slate-300">
                      {new Date(existingSub.created_at).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </dd>
                    {existingSub.delivery_mode && (
                      <>
                        <dt className="text-slate-500 dark:text-slate-400">Delivery</dt>
                        <dd className="text-slate-700 dark:text-slate-300">
                          {CERTIFICATE_DELIVERY_LABEL[existingSub.delivery_mode]}
                        </dd>
                      </>
                    )}
                    {existingSub.receipt_url && (
                      <>
                        <dt className="text-slate-500 dark:text-slate-400">Receipt</dt>
                        <dd>
                          <a
                            href={existingSub.receipt_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-burgundy dark:text-[#E89BA5] font-semibold hover:underline inline-flex items-center gap-1"
                          >
                            View
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </dd>
                      </>
                    )}
                  </dl>

                  {existingSub.status === 'pending_verification' && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      The organizing team is matching your receipt against Easebuzz records. Once approved, your certificate appears here and is delivered the way you chose above.
                    </p>
                  )}

                  {existingSub.status === 'rejected' && (
                    <div className="space-y-3">
                      <p className="text-[11px] text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg p-2.5 leading-relaxed">
                        {existingSub.admin_notes ||
                          'The payment could not be matched. Check the Transaction ID and receipt, then resubmit.'}
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsResubmitting(true)}
                        className="w-full py-2 px-4 bg-burgundy hover:bg-burgundy-deep text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        Resubmit Payment Details
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Checkout: pay on Easebuzz, then submit Transaction ID + receipt */
                <form onSubmit={handleSubmitPayment} className="space-y-4">
                  <div className="p-4 bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-xl space-y-3">
                    <StepHeader step={1} title={`Pay the ₹${feeInr} certificate fee on Easebuzz`} />
                    <a
                      href={gatewayUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 bg-burgundy hover:bg-burgundy-deep text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      Open Easebuzz Payment Page
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <p className="flex items-start gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      <Info className="w-3.5 h-3.5 shrink-0 mt-px" />
                      <span>
                        The certificate is a separate payment from the On-Campus Pass. A Transaction ID already used for a pass cannot be reused here.
                      </span>
                    </p>
                  </div>

                  <div className="p-4 bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-xl space-y-3">
                    <StepHeader step={2} title="Submit your receipt" />

                    <label className="block space-y-1">
                      <span className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        Easebuzz Transaction ID
                      </span>
                      <input
                        type="text"
                        required
                        value={transactionRef}
                        onChange={(e) => setTransactionRef(e.target.value)}
                        placeholder="e.g. E26101518BKHN3"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-[#1C0A0D] border border-slate-200 dark:border-[#3D1418] rounded-lg text-xs text-slate-900 dark:text-[#FAF6F3] font-mono uppercase focus:outline-hidden focus:ring-1 focus:ring-burgundy"
                      />
                    </label>

                    <label className="block space-y-1">
                      <span className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        Bank reference <span className="font-normal text-slate-400">(optional)</span>
                      </span>
                      <input
                        type="text"
                        value={bankRef}
                        onChange={(e) => setBankRef(e.target.value)}
                        placeholder="UTR / bank reference number"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-[#1C0A0D] border border-slate-200 dark:border-[#3D1418] rounded-lg text-xs text-slate-900 dark:text-[#FAF6F3] font-mono focus:outline-hidden focus:ring-1 focus:ring-burgundy"
                      />
                    </label>

                    {selectedFile ? (
                      <div className="flex items-center justify-between gap-2 p-3 bg-slate-50 dark:bg-[#1C0A0D] border border-slate-200 dark:border-[#3D1418] rounded-lg">
                        <span className="flex items-center gap-2 min-w-0 text-xs text-slate-800 dark:text-slate-200">
                          <FileText className="w-4 h-4 text-burgundy dark:text-[#E89BA5] shrink-0" />
                          <span className="truncate">{selectedFile.name}</span>
                        </span>
                        <button
                          type="button"
                          onClick={clearFile}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer shrink-0"
                          aria-label="Remove receipt"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragOver(true);
                        }}
                        onDragLeave={() => setIsDragOver(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDragOver(false);
                          acceptFile(e.dataTransfer.files?.[0]);
                        }}
                        className={`flex flex-col items-center justify-center gap-1 p-4 border border-dashed rounded-lg cursor-pointer text-center transition-colors ${
                          isDragOver
                            ? 'border-burgundy bg-burgundy/5'
                            : 'border-slate-300 dark:border-[#3D1418] hover:border-slate-400'
                        }`}
                      >
                        <Upload className="w-5 h-5 text-slate-400" />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Upload receipt
                        </span>
                        <span className="text-[10px] text-slate-400">
                          PDF or screenshot, up to {MAX_RECEIPT_SIZE_MB} MB
                        </span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/*"
                          className="sr-only"
                          onChange={(e) => acceptFile(e.target.files?.[0])}
                        />
                      </label>
                    )}
                  </div>

                  <div
                    role="radiogroup"
                    aria-label="Certificate delivery"
                    className="p-4 bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-xl space-y-2"
                  >
                    <StepHeader step={3} title="How do you want to receive it?" />
                    {(Object.keys(CERTIFICATE_DELIVERY_LABEL) as CertificateDeliveryMode[]).map((mode) => (
                      <label
                        key={mode}
                        className={`flex items-start gap-2.5 p-3 border rounded-lg cursor-pointer transition-colors ${
                          deliveryMode === mode
                            ? 'border-burgundy bg-burgundy/5 dark:border-[#E89BA5]'
                            : 'border-slate-200 dark:border-[#3D1418] hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="certificate-delivery"
                          value={mode}
                          checked={deliveryMode === mode}
                          onChange={() => setDeliveryMode(mode)}
                          className="mt-0.5 accent-[#800020]"
                        />
                        <span className="text-xs">
                          <span className="block font-semibold text-slate-800 dark:text-slate-200">
                            {CERTIFICATE_DELIVERY_LABEL[mode]}
                          </span>
                          <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                            {mode === 'ceremony'
                              ? 'Pick up the printed certificate in person at the valedictory ceremony.'
                              : `Sent to ${data?.userEmail || userEmail} after your payment is verified.`}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    {isResubmitting && (
                      <button
                        type="button"
                        onClick={() => setIsResubmitting(false)}
                        disabled={isSubmitting}
                        className="py-2.5 px-4 bg-slate-100 dark:bg-[#1C0A0D] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#3D1418] text-xs font-semibold rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-2.5 px-4 bg-burgundy hover:bg-burgundy-deep text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>{uploadStatus || 'Submitting...'}</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit for Verification</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {successMessage && (
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded border border-emerald-200 dark:border-emerald-900 leading-relaxed">
                  {successMessage}
                </p>
              )}

              {errorMessage && (
                <p className="text-xs text-rose-600 dark:text-rose-400 font-medium bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded border border-rose-200 dark:border-rose-900 leading-relaxed flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-px" />
                  <span>{errorMessage}</span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Sticky/Fixed Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-100 dark:border-[#3D1418] bg-slate-50/70 dark:bg-[#1A0A0D]/70 flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-400 dark:text-slate-500 text-[10px] sm:text-[11px] font-mono">
            Qiskit Fall Fest 2026 · Official Certification
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-slate-200/80 hover:bg-slate-200 dark:bg-[#250D11] dark:hover:bg-[#2F1116] text-slate-700 dark:text-slate-300 font-medium transition-colors cursor-pointer text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

const CERTIFICATE_RELEASE_LABEL = '30 October 2026';

function StepHeader({ step, title }: { step: number; title: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="w-6 h-6 rounded-full bg-burgundy/10 dark:bg-burgundy/25 text-burgundy dark:text-[#E89BA5] text-[11px] font-bold flex items-center justify-center shrink-0">
        {step}
      </span>
      <p className="text-xs font-bold text-slate-900 dark:text-[#FAF6F3]">{title}</p>
    </div>
  );
}

function distinctionLabel(score: number) {
  if (score >= 90) return 'Passed with High Distinction';
  if (score >= 75) return 'Passed with Distinction';
  return 'Successful Completion';
}

/** Scaled-down rendering of the issued certificate so participants see what they are paying for. */
function CertificatePreview({
  recipientName,
  totalSessions,
  averageScore,
  locked = false,
}: {
  recipientName: string;
  totalSessions: number;
  averageScore?: number;
  locked?: boolean;
}) {
  return (
    <figure className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Illustrative preview
        </span>
        {locked && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#250D11] border border-slate-200 dark:border-[#3D1418] text-[10px] font-semibold text-slate-600 dark:text-slate-400">
            <Lock className="w-3 h-3" />
            Locked
          </span>
        )}
      </div>
      <div className="relative rounded-xl bg-[#FDFBF6] dark:bg-[#F7F2E8] border border-[#E7DCC3] p-1.5 shadow-sm">
        <div className="relative rounded-lg border border-[#800020]/35 px-4 py-5 sm:px-8 sm:py-6 text-center">
          <div className="absolute inset-[3px] rounded-md border border-[#C9A646]/50 pointer-events-none" />

          <div className="relative flex items-center justify-center gap-3 sm:gap-4">
            <Image
              src="/images/branding/IBM_Quantum_logotype_pos_RGB_tight.webp"
              alt="IBM Quantum"
              width={1200}
              height={186}
              className="h-3.5 sm:h-4 w-auto select-none"
            />
            <span className="h-6 w-px bg-slate-300" aria-hidden="true" />
            <Image
              src="/images/branding/srm-ap-logo-horizontal-backgroundless.webp"
              alt="SRM University-AP"
              width={1947}
              height={808}
              className="h-7 sm:h-8 w-auto select-none"
            />
          </div>
          <p className="font-serif text-lg sm:text-xl font-bold text-[#4A0012] mt-3 leading-tight">
            Certificate of Academic Mastery
          </p>
          <p className="text-[8px] sm:text-[9px] font-semibold tracking-[0.2em] uppercase text-[#A8842C] mt-1">
            Qiskit Fall Fest 2026 · Masterclass
          </p>

          <p className="font-serif italic text-[11px] text-slate-500 mt-4">Awarded to</p>
          <p className="font-serif text-xl sm:text-2xl font-bold text-slate-900 mt-0.5 truncate">
            {recipientName}
          </p>
          <div className="h-px w-40 sm:w-56 mx-auto mt-1.5 bg-gradient-to-r from-transparent via-[#C9A646] to-transparent" />

          <p className="text-[10px] sm:text-[11px] text-slate-600 mt-2.5 max-w-sm mx-auto leading-relaxed">
            for completing all {totalSessions} video lectures and concept check evaluations of the
            Qiskit Fall Fest 2026 quantum computing masterclass.
          </p>

          {averageScore !== undefined && (
            <p className="inline-block mt-3 px-3 py-1 rounded-full border border-[#C9A646] text-[9px] font-bold tracking-wider uppercase text-[#800020]">
              {distinctionLabel(averageScore)} ({averageScore}%)
            </p>
          )}

          <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-end gap-3 text-left">
            <div className="min-w-0">
              <p className="text-[7px] sm:text-[8px] font-bold tracking-widest uppercase text-slate-400">
                Credential ID
              </p>
              <p className="font-mono text-[9px] sm:text-[10px] font-bold text-[#800020] truncate">
                QFF26-MCL-······
              </p>
            </div>
            <div className="w-11 h-11 rounded-full bg-[#800020] ring-2 ring-[#C9A646] ring-offset-2 ring-offset-[#FDFBF6] flex flex-col items-center justify-center leading-none">
              <span className="text-[7px] font-extrabold tracking-wider text-white">QFF</span>
              <span className="text-[9px] font-black text-[#E5C766]">2026</span>
            </div>
            <div className="min-w-0 text-right">
              <p className="text-[7px] sm:text-[8px] font-bold tracking-widest uppercase text-slate-400">
                Verify at
              </p>
              <p className="font-mono text-[9px] sm:text-[10px] text-slate-600 truncate">
                qffsrmap2026.com/verify-certificate
              </p>
            </div>
          </div>
        </div>

      </div>
      <figcaption className="text-center text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
        For illustration only. The final certificate design is in progress, and certificates
        with your Credential ID are issued after {CERTIFICATE_RELEASE_LABEL}.
      </figcaption>
    </figure>
  );
}

function CertificateAbout({ totalSessions }: { totalSessions: number }) {
  const points = [
    {
      icon: Fingerprint,
      title: 'Unique Credential ID',
      body: 'Every certificate gets its own ID, backed by a tamper-evident SHA-256 record in the official registry.',
    },
    {
      icon: BadgeCheck,
      title: 'Publicly verifiable',
      body: 'Recruiters and universities can confirm it on the Qiskit Fall Fest verification page using the Credential ID.',
    },
    {
      icon: GraduationCap,
      title: 'Grade on record',
      body: 'Your concept check average and distinction level are printed on the certificate.',
    },
    {
      icon: Printer,
      title: 'Digital and printed',
      body: 'Download the digital copy, and collect a printed copy at the valedictory ceremony or get it by email.',
    },
  ];

  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-[#FAF6F3]">What this certificate is</h3>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-1">
          An official certificate issued by SRM University-AP in collaboration with IBM Quantum. It
          confirms that you completed the Qiskit Fall Fest 2026 masterclass: all {totalSessions} video
          lectures and every concept check quiz.
        </p>
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {points.map(({ icon: Icon, title, body }) => (
          <li
            key={title}
            className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-200 dark:border-[#3D1418] bg-white dark:bg-[#150709]"
          >
            <Icon className="w-4 h-4 shrink-0 mt-0.5 text-burgundy dark:text-[#E89BA5]" />
            <span>
              <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200">{title}</span>
              <span className="block text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">
                {body}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
