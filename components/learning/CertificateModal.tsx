'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Award,
  CheckCircle2,
  Lock,
  Download,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  X,
  Clock,
  QrCode,
  Mail,
  Info,
  Copy,
  Check,
  Send,
} from 'lucide-react';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  userName: string;
}

interface EligibilityData {
  eligible: boolean;
  alreadyIssued: boolean;
  priceInr?: number | null;
  feeLabel?: string;
  paymentStatus?: 'updating_soon' | 'active';
  upiId?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  accountHolder?: string;
  qrCodeUrl?: string;
  noticeTitle?: string;
  noticeMessage?: string;
  paymentSubmission?: {
    id: string;
    transaction_reference: string;
    status: 'pending_verification' | 'verified' | 'rejected';
    created_at: string;
  } | null;
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
  const [utiInput, setUtiInput] = useState('');
  const [isSubmittingUti, setIsSubmittingUti] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

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
    setSuccessMessage('');
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

  async function handleSubmitUti(e: React.FormEvent) {
    e.preventDefault();
    if (!utiInput.trim()) {
      setErrorMessage('Please enter a valid UTI or UPI Reference Number.');
      return;
    }

    setIsSubmittingUti(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await fetch('/api/learning/certificate/submit-uti', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionReference: utiInput.trim(),
        }),
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        setSuccessMessage('Payment transaction ID submitted successfully! Verification is underway.');
        setUtiInput('');
        await loadEligibility();
      } else {
        setErrorMessage(resData.error || 'Failed to submit transaction reference.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Network error submitting reference.');
    } finally {
      setIsSubmittingUti(false);
    }
  }

  function handleCopy(text: string, fieldName: string) {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
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

  const isGatewayActive = data?.paymentStatus === 'active';
  const existingSub = data?.paymentSubmission;
  const activeUserName = userName || data?.userName || 'Candidate';
  const activeUserEmail = userEmail || data?.userEmail || 'your registered email';

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
                Official Masterclass Credential
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
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
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
                  Official Certificate Minted
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-[#FAF6F3]">
                  Congratulations, {activeUserName}!
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-md mx-auto leading-relaxed">
                  Your academic completion has been verified and permanently recorded on the
                  blockchain-grade registry.
                </p>
              </div>

              {/* Serial & Distinction Preview Card */}
              <div className="p-4 bg-slate-50 dark:bg-[#1C0A0D] rounded-xl border border-slate-200 dark:border-[#3D1418] text-left space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Serial Number:</span>
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
                    Complete all {totalSessionsCount} video lectures and quizzes to unlock certificate payment and issuance.
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
                <p className="text-xs text-rose-600 dark:text-rose-400 font-medium bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded border border-rose-200 dark:border-rose-900">
                  {errorMessage}
                </p>
              )}
            </div>
          ) : (
            /* STATE 3: ELIGIBLE (UNLOCKED) */
            <div className="space-y-5">
              {/* Verification Success Badge */}
              <div className="p-4 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Academic Eligibility Verified
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  You have completed all {totalSessionsCount} video lectures and passed every concept check quiz (Average Score: {data?.averageQuizScore}%). Your certificate qualification has been confirmed.
                </p>
              </div>

              {/* Status Notice Banner (Updating Soon vs Active) */}
              {!isGatewayActive ? (
                /* Updating Soon Notice */
                <div className="p-4 bg-amber-50/90 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl space-y-2.5">
                  <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>{data?.noticeTitle || 'Payment Gateway & Official QR Code Updating Soon'}</span>
                  </div>
                  <p className="text-xs text-amber-900/90 dark:text-amber-200/90 leading-relaxed">
                    {data?.noticeMessage ||
                      'The official UPI payment QR code and bank account details for certificate issuance are currently being finalized by the organizing team.'}
                  </p>
                  <div className="p-2.5 bg-amber-100/70 dark:bg-amber-900/40 rounded-lg text-[11px] text-amber-950 dark:text-amber-200 space-y-1 border border-amber-200/60 dark:border-amber-800/60">
                    <div className="font-semibold flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
                      How certification works once details are published:
                    </div>
                    <ol className="list-decimal list-inside space-y-0.5 pl-1 text-[11px] leading-relaxed">
                      <li>Scan the official UPI QR code or transfer directly to the provided bank account.</li>
                      <li>Enter your 12-digit Unique Transaction ID (UTI) or UPI Reference Number in the verification form below.</li>
                      <li>Upon administrative payment verification, your official co-certified digital certificate will be minted and emailed to <span className="font-mono font-semibold">{activeUserEmail}</span>.</li>
                    </ol>
                  </div>
                </div>
              ) : (
                /* Active Payment Instructions */
                <div className="p-4 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Payment Gateway Active · Complete Transfer &amp; Submit UTI</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    Scan the official QR code below or use the bank details to transfer the certification fee. Once done, enter your UTI / UPI Reference number to submit for verification.
                  </p>
                </div>
              )}

              {/* Payment QR & Account Information Box */}
              <div className="p-4 bg-slate-50 dark:bg-[#1A0A0D] border border-dashed border-slate-300 dark:border-[#3D1418] rounded-xl space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* QR Box */}
                  <div className="w-36 h-36 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#150709] flex flex-col items-center justify-center p-2 text-center shrink-0 shadow-xs overflow-hidden">
                    {isGatewayActive && data?.qrCodeUrl ? (
                      <img
                        src={data.qrCodeUrl}
                        alt="Payment QR Code"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <>
                        <QrCode className="w-10 h-10 text-slate-400 dark:text-slate-600 mb-1" />
                        <span className="font-mono text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          UPI QR Code
                        </span>
                        <span className="font-mono text-[8px] text-amber-600 dark:text-amber-400 mt-0.5">
                          {isGatewayActive ? 'Scan & Pay' : 'Updating Soon'}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Specifications Grid */}
                  <div className="flex-1 w-full space-y-2 text-xs">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/70 dark:border-[#3D1418]">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Certification Fee</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {data?.feeLabel || 'Updating Soon / To be announced'}
                      </span>
                    </div>

                    {data?.upiId && (
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/70 dark:border-[#3D1418]">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">UPI ID (VPA)</span>
                        <div className="flex items-center gap-1.5">
                          <code className="font-mono font-bold text-slate-800 dark:text-slate-200">
                            {data.upiId}
                          </code>
                          <button
                            type="button"
                            onClick={() => handleCopy(data.upiId || '', 'upi')}
                            className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                            title="Copy UPI ID"
                          >
                            {copiedField === 'upi' ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {data?.bankName && (
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/70 dark:border-[#3D1418]">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Bank</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {data.bankName}
                        </span>
                      </div>
                    )}

                    {data?.accountNumber && (
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/70 dark:border-[#3D1418]">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Account Number</span>
                        <div className="flex items-center gap-1.5">
                          <code className="font-mono font-bold text-slate-800 dark:text-slate-200">
                            {data.accountNumber}
                          </code>
                          <button
                            type="button"
                            onClick={() => handleCopy(data.accountNumber || '', 'acc')}
                            className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                            title="Copy Account Number"
                          >
                            {copiedField === 'acc' ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {data?.ifscCode && (
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/70 dark:border-[#3D1418]">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">IFSC Code</span>
                        <div className="flex items-center gap-1.5">
                          <code className="font-mono font-bold text-slate-800 dark:text-slate-200">
                            {data.ifscCode}
                          </code>
                          <button
                            type="button"
                            onClick={() => handleCopy(data.ifscCode || '', 'ifsc')}
                            className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                            title="Copy IFSC"
                          >
                            {copiedField === 'ifsc' ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Certificate Delivery</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        Emailed post-verification
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction ID Submission Section */}
              {existingSub ? (
                /* Already Submitted State */
                <div className="p-4 bg-slate-50 dark:bg-[#1C0A0D] border border-slate-200 dark:border-[#3D1418] rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Payment Verification Status
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
                        Payment Verified
                      </span>
                    )}
                    {existingSub.status === 'rejected' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                        Rejected
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <span>Submitted UTI Reference:</span>
                    <code className="font-mono font-bold text-slate-900 dark:text-[#FAF6F3] bg-white dark:bg-[#150709] px-2 py-0.5 rounded border border-slate-200 dark:border-[#3D1418]">
                      {existingSub.transaction_reference}
                    </code>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Your reference number is currently being cross-referenced with university records. The official certificate will be minted and emailed to <span className="font-mono font-semibold">{activeUserEmail}</span> once approved.
                  </p>
                </div>
              ) : isGatewayActive ? (
                /* Active Submission Form */
                <form onSubmit={handleSubmitUti} className="p-4 bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-xl space-y-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                      UTI (Unique Transaction ID) / UPI Reference Number
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Enter the 12-digit reference number provided by your UPI app (Google Pay, PhonePe, Paytm, BHIM) or bank receipt.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <input
                      type="text"
                      required
                      value={utiInput}
                      onChange={(e) => setUtiInput(e.target.value)}
                      placeholder="e.g. 428901234567 (12-digit transaction ID)"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-[#1C0A0D] border border-slate-200 dark:border-[#3D1418] rounded-lg text-xs text-slate-900 dark:text-[#FAF6F3] font-mono focus:outline-hidden focus:ring-1 focus:ring-burgundy"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingUti}
                    className="w-full py-2.5 px-4 bg-burgundy hover:bg-burgundy-deep text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs"
                  >
                    {isSubmittingUti ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Submitting Reference...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Transaction ID for Verification</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Inactive Preview Mode Form */
                <div className="p-4 bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-xl space-y-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                      UTI (Unique Transaction ID) / UPI Reference Number
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Enter the 12-digit reference number provided by your UPI application (Google Pay, PhonePe, Paytm, BHIM) or bank statement.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <input
                      type="text"
                      disabled
                      value={utiInput}
                      onChange={(e) => setUtiInput(e.target.value)}
                      placeholder="e.g. 428901234567 (12-digit transaction ID)"
                      className="w-full px-3 py-2 bg-slate-100 dark:bg-[#250D11] border border-slate-200 dark:border-[#3D1418] rounded-lg text-xs text-slate-500 dark:text-slate-400 cursor-not-allowed opacity-75 font-mono"
                    />
                    <div className="flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-400">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>Reference input form will activate immediately once payment details are live.</span>
                    </div>
                  </div>

                  <button
                    disabled
                    className="w-full py-2.5 px-4 bg-slate-200 dark:bg-[#250D11] text-slate-400 dark:text-slate-500 font-semibold text-xs rounded-lg cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Submit Transaction ID for Verification (Opening Soon)</span>
                  </button>
                </div>
              )}

              {successMessage && (
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded border border-emerald-200 dark:border-emerald-900">
                  {successMessage}
                </p>
              )}

              {errorMessage && (
                <p className="text-xs text-rose-600 dark:text-rose-400 font-medium bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded border border-rose-200 dark:border-rose-900">
                  {errorMessage}
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
