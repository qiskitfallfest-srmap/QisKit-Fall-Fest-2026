'use client';

import React, { useState, useEffect } from 'react';
import {
  Award,
  CheckCircle2,
  Lock,
  Download,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  Sparkles,
  AlertCircle,
  X,
  ChevronRight,
  Clock,
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
  priceInr?: number;
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
  competitionsSubmitted: number;
  averageQuizScore: number;
  missingTasks: string[];
}

export function CertificateModal({
  isOpen,
  onClose,
  userEmail,
  userName,
}: CertificateModalProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<EligibilityData | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [issuedCert, setIssuedCert] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      loadEligibility();
    }
  }, [isOpen]);

  async function loadEligibility() {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/learning/certificate/eligibility');
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

  // Helper to load Razorpay script
  function loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  async function handleClaimCertificate() {
    setIsProcessingPayment(true);
    setErrorMessage('');

    try {
      // 1. Create Razorpay order on backend
      const res = await fetch('/api/learning/certificate/create-order', {
        method: 'POST',
      });
      const orderData = await res.json();

      if (!res.ok || !orderData.success) {
        if (orderData.alreadyIssued && orderData.certificate) {
          setIssuedCert(orderData.certificate);
          setIsProcessingPayment(false);
          return;
        }
        throw new Error(orderData.error || 'Order creation failed.');
      }

      // Check if fallback test order
      if (orderData.orderId.startsWith('order_test_')) {
        // Mock direct verification for sandbox testing
        const verifyRes = await fetch('/api/learning/certificate/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: orderData.orderId,
            razorpay_payment_id: `pay_test_${Date.now()}`,
            razorpay_signature: 'test_signature',
          }),
        });
        const verifyJson = await verifyRes.json();
        if (verifyRes.ok && verifyJson.success) {
          setIssuedCert(verifyJson.certificate || {
            serialNumber: verifyJson.serialNumber,
            certificateUrl: verifyJson.certificateUrl,
          });
          loadEligibility();
        } else {
          throw new Error(verifyJson.error || 'Verification failed.');
        }
        setIsProcessingPayment(false);
        return;
      }

      // 2. Load Razorpay Checkout SDK
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Could not load Razorpay SDK. Please check your network.');
      }

      // 3. Open Razorpay Checkout modal
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'IBM Quantum × SRM University-AP',
        description: 'Qiskit Fall Fest 2026 Masterclass Certificate',
        order_id: orderData.orderId,
        prefill: {
          name: userName,
          email: userEmail,
        },
        theme: {
          color: '#800020', // Burgundy
        },
        handler: async function (response: any) {
          try {
            // 4. Verify payment signature on backend
            const verifyRes = await fetch('/api/learning/certificate/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyJson = await verifyRes.json();
            if (verifyRes.ok && verifyJson.success) {
              setIssuedCert(verifyJson.certificate || {
                serialNumber: verifyJson.serialNumber,
                certificateUrl: verifyJson.certificateUrl,
              });
              loadEligibility();
            } else {
              setErrorMessage(
                verifyJson.error || 'Payment signature verification failed.'
              );
            }
          } catch (vErr: any) {
            setErrorMessage(vErr?.message || 'Verification network error.');
          } finally {
            setIsProcessingPayment(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessingPayment(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        setErrorMessage(
          resp?.error?.description || 'Payment was unsuccessful or cancelled.'
        );
        setIsProcessingPayment(false);
      });
      rzp.open();
    } catch (err: any) {
      console.error('[Certificate Claim Error]:', err);
      setErrorMessage(err?.message || 'Failed to process certificate claim.');
      setIsProcessingPayment(false);
    }
  }

  if (!isOpen) return null;

  const totalTasks = 9; // 6 sessions + 3 competitions
  const completedTasks =
    (data?.sessionsCompleted || 0) + (data?.competitionsSubmitted || 0);
  const progressPercent = Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-burgundy/10 text-burgundy flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Official Masterclass Credential
              </h2>
              <p className="font-mono text-[11px] text-slate-500 uppercase tracking-wider">
                IBM Quantum × SRM University-AP Certification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-burgundy border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-medium text-slate-500">
                Verifying academic completion status...
              </p>
            </div>
          ) : issuedCert ? (
            /* ISSUED STATE */
            <div className="space-y-5 text-center py-2">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200 inline-block mb-1.5">
                  ★ Official Certificate Minted
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  Congratulations, {userName}!
                </h3>
                <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto leading-relaxed">
                  Your academic completion has been verified and permanently recorded on the
                  blockchain-grade registry.
                </p>
              </div>

              {/* Serial & Preview Card */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Serial Number:</span>
                  <code className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {issuedCert.serialNumber || issuedCert.serial_number}
                  </code>
                </div>
                {issuedCert.averageQuizScore && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Distinction:</span>
                    <span className="font-bold text-emerald-700">
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
                  className="flex-1 py-2.5 px-4 bg-slate-100 text-slate-800 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5"
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
          ) : (
            /* ELIGIBILITY & PAYMENT STATE */
            <div className="space-y-6">
              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-slate-800">
                    Certification Progress: {completedTasks} / {totalTasks} Tasks
                  </span>
                  <span className="font-bold text-burgundy">{progressPercent}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-burgundy rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Checklist Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1">
                  <span className="font-bold text-slate-700 block">6 Masterclass Lectures:</span>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    {data?.sessionsCompleted === 6 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-500" />
                    )}
                    <span>{data?.sessionsCompleted} of 6 Completed</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1">
                  <span className="font-bold text-slate-700 block">6 Concept Quizzes:</span>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    {data?.quizzesPassed === 6 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-500" />
                    )}
                    <span>{data?.quizzesPassed} of 6 Passed (Avg: {data?.averageQuizScore}%)</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1 sm:col-span-2">
                  <span className="font-bold text-slate-700 block">3 Daily Creative Competitions:</span>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    {data?.competitionsSubmitted === 3 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-500" />
                    )}
                    <span>
                      {data?.competitionsSubmitted} of 3 Submitted (Reels, Poster, Essay)
                    </span>
                  </div>
                </div>
              </div>

              {/* Missing Tasks Notice if not eligible */}
              {!data?.eligible && data?.missingTasks && data.missingTasks.length > 0 && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 space-y-1.5">
                  <span className="font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                    Pending Academic Requirements:
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 text-amber-800 text-[11px] pl-1">
                    {data.missingTasks.slice(0, 4).map((task, idx) => (
                      <li key={idx}>{task}</li>
                    ))}
                    {data.missingTasks.length > 4 && (
                      <li>...and {data.missingTasks.length - 4} more requirements</li>
                    )}
                  </ul>
                </div>
              )}

              {/* Eligibility Unlocked & Payment Box */}
              {data?.eligible ? (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Academic Eligibility Verified!
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    You have passed all 6 masterclass sessions and completed every daily challenge.
                    Proceed below to claim your official co-certified digital credential.
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-emerald-200/60">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Certification Fee
                      </span>
                      <span className="text-lg font-bold text-slate-900">
                        ₹{data.priceInr || 499}{' '}
                        <span className="text-xs font-normal text-slate-500">INR</span>
                      </span>
                    </div>

                    <button
                      onClick={handleClaimCertificate}
                      disabled={isProcessingPayment}
                      className="px-5 py-2.5 bg-burgundy text-white text-xs font-semibold rounded-lg hover:bg-burgundy-deep transition-colors shadow-xs flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {isProcessingPayment ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-3.5 h-3.5" />
                          Claim & Pay with Razorpay
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-xs text-slate-600 font-medium">
                      Complete all 9 requirements above to unlock certificate issuance.
                    </span>
                  </div>
                  <button
                    disabled
                    className="px-4 py-2 bg-slate-200 text-slate-400 text-xs font-semibold rounded-lg cursor-not-allowed shrink-0"
                  >
                    Locked
                  </button>
                </div>
              )}

              {errorMessage && (
                <p className="text-xs text-red-600 font-medium bg-red-50 p-2.5 rounded border border-red-200">
                  {errorMessage}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
