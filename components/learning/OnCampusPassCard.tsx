'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import QRCode from 'qrcode';
import {
  ShieldCheck,
  Download,
  Printer,
  ExternalLink,
  Upload,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  QrCode,
  Users,
  ArrowRight,
  Info,
  Calendar,
  Building,
} from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

interface PassClaim {
  id: string;
  user_email: string;
  user_name: string;
  pass_tier: string;
  transaction_reference: string;
  bank_reference?: string | null;
  receipt_url: string;
  amount_inr: number;
  status: string;
  institution?: string;
  contact_phone?: string | null;
  checked_in: boolean;
  qr_code_token: string;
  created_at: string;
}

interface PassStatusResponse {
  success: boolean;
  isAuthenticated: boolean;
  user?: {
    email: string;
    fullName: string;
    institution?: string;
    phone?: string;
  };
  isHackathonParticipant: boolean;
  pass?: PassClaim | null;
}

const EASEBUZZ_GATEWAY_URL =
  'https://forms.easebuzz.in/register/SRMAPIA9oJ/QiskitFallFestSRMAP2026';
const MAX_RECEIPT_SIZE_MB = 15;

export function OnCampusPassCard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PassStatusResponse | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Form states for claiming
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [transactionRef, setTransactionRef] = useState('');
  const [bankRef, setBankRef] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateQrCode = useCallback(async (token: string) => {
    try {
      const origin =
        typeof window !== 'undefined' ? window.location.origin : 'https://www.qffsrmap2026.com';
      const verifyUrl = `${origin}/verify-pass?token=${encodeURIComponent(token)}`;
      const url = await QRCode.toDataURL(verifyUrl, {
        width: 320,
        margin: 1,
        color: {
          dark: '#201617',
          light: '#ffffff',
        },
      });
      setQrDataUrl(url);
    } catch (err) {
      console.error('Failed to generate QR code:', err);
    }
  }, []);

  const fetchPassStatus = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/pass/status', { cache: 'no-store' });
      const json: PassStatusResponse = await res.json();
      if (res.ok && json.success) {
        setData(json);
        if (json.pass?.qr_code_token) {
          generateQrCode(json.pass.qr_code_token);
        }
      }
    } catch (err: any) {
      console.error('Error fetching pass status:', err);
    } finally {
      setLoading(false);
    }
  }, [generateQrCode]);

  useEffect(() => {
    fetchPassStatus();
  }, [fetchPassStatus]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setErrorMessage('');
    if (!file) return;

    const lower = file.name.toLowerCase();
    const isValidType =
      lower.endsWith('.pdf') ||
      lower.endsWith('.png') ||
      lower.endsWith('.jpg') ||
      lower.endsWith('.jpeg') ||
      file.type.startsWith('image/') ||
      file.type === 'application/pdf';

    if (!isValidType) {
      setErrorMessage('Please select a valid receipt file (PDF, PNG, JPG, or JPEG).');
      return;
    }

    if (file.size > MAX_RECEIPT_SIZE_MB * 1024 * 1024) {
      setErrorMessage(`Receipt size exceeds ${MAX_RECEIPT_SIZE_MB} MB limit.`);
      return;
    }

    setSelectedFile(file);
  }

  async function handleClaimPass(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const trimmedTxn = transactionRef.trim();
    if (!trimmedTxn || trimmedTxn.length < 4) {
      setErrorMessage('Please enter a valid Easebuzz Transaction ID (e.g. E26101518BKHN3).');
      return;
    }

    if (!selectedFile) {
      setErrorMessage('Please upload your downloaded Easebuzz receipt (PDF or screenshot).');
      return;
    }

    setIsSubmitting(true);
    setUploadStatus('Uploading receipt to secure storage...');

    try {
      // 1. Upload receipt to Supabase Storage bucket 'media/pass-receipts/'
      const { supabase } = await import('@/lib/supabase');
      const ext = selectedFile.name.split('.').pop()?.toLowerCase() || 'pdf';
      const emailSlug = (data?.user?.email || 'attendee')
        .replace(/[^a-z0-9]/gi, '_')
        .slice(0, 40);
      const safeTxn = trimmedTxn.replace(/[^a-zA-Z0-9_-]/g, '_');
      const storagePath = `pass-receipts/${emailSlug}_${safeTxn}_${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(storagePath, selectedFile, {
          cacheControl: '3600',
          upsert: true,
          contentType: selectedFile.type || 'application/pdf',
        });

      if (uploadError) {
        throw new Error(`Receipt upload failed: ${uploadError.message}`);
      }

      const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(storagePath);
      if (!publicUrlData?.publicUrl) {
        throw new Error('Could not resolve public URL for receipt.');
      }

      setUploadStatus('Registering pass claim with database...');

      // 2. Submit pass claim to backend API
      const res = await fetch('/api/pass/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionReference: trimmedTxn,
          receiptUrl: publicUrlData.publicUrl,
          bankReference: bankRef.trim() || null,
        }),
      });

      const resJson = await res.json();
      if (!res.ok || !resJson.success) {
        throw new Error(resJson.error || 'Failed to register pass claim.');
      }

      setSuccessMessage('On-Campus Pass successfully registered! Digital badge generated.');
      setData((prev) => (prev ? { ...prev, pass: resJson.pass } : null));
      if (resJson.pass?.qr_code_token) {
        generateQrCode(resJson.pass.qr_code_token);
      }
    } catch (err: any) {
      console.error('Error claiming pass:', err);
      setErrorMessage(err?.message || 'Failed to claim pass. Please try again.');
    } finally {
      setIsSubmitting(false);
      setUploadStatus('');
    }
  }

  // Generate downloadable high-resolution badge PNG
  function handleDownloadBadge() {
    if (!data?.pass || !qrDataUrl) return;

    const pass = data.pass;
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 1800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#FAF7F5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header band
    ctx.fillStyle = '#6C151E';
    ctx.fillRect(0, 0, canvas.width, 280);

    // Header text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 38px sans-serif';
    ctx.fillText('SRM UNIVERSITY-AP', 80, 110);

    ctx.font = '28px monospace';
    ctx.fillStyle = '#FECDD3';
    ctx.fillText('QISKIT FALL FEST 2026 · ON-CAMPUS PASS', 80, 165);

    ctx.font = '24px sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('26–30 OCTOBER 2026 · MAIN CAMPUS', 80, 215);

    // Pass Tier Ribbon
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(80, 340, 1040, 1300);
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 4;
    ctx.strokeRect(80, 340, 1040, 1300);

    // Pass Badge Type
    ctx.fillStyle = '#6C151E';
    ctx.font = 'bold 32px monospace';
    ctx.fillText('OFFICIAL ATTENDEE BADGE', 140, 430);

    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 54px serif';
    ctx.fillText(pass.user_name || 'Attendee', 140, 520);

    ctx.fillStyle = '#475569';
    ctx.font = '30px sans-serif';
    ctx.fillText(pass.institution || 'SRM University-AP', 140, 580);

    ctx.fillStyle = '#64748B';
    ctx.font = '26px monospace';
    ctx.fillText(pass.user_email, 140, 630);

    // Divider
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(140, 670);
    ctx.lineTo(1060, 670);
    ctx.stroke();

    // Pass details
    ctx.fillStyle = '#6C151E';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('GENERAL OFFLINE PASS (₹99)', 140, 740);

    ctx.fillStyle = '#334155';
    ctx.font = '26px sans-serif';
    ctx.fillText('Access: Keynotes, Workshops, Industry Tech Expo, Arcade & Debates', 140, 790);

    // Draw QR Code
    const qrImage = new Image();
    qrImage.onload = () => {
      ctx.drawImage(qrImage, 360, 870, 480, 480);

      // Footer reference info
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 26px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`Easebuzz Ref: ${pass.transaction_reference}`, 600, 1430);

      ctx.fillStyle = '#64748B';
      ctx.font = '22px sans-serif';
      ctx.fillText('Scan at campus security gate for immediate entry', 600, 1480);
      ctx.fillText('qffsrmap2026.com · Verified Digital Gate Pass', 600, 1530);

      // Trigger download
      const link = document.createElement('a');
      link.download = `QFF26-Campus-Pass-${(pass.user_name || 'Attendee').replace(/[^a-zA-Z0-9]/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    qrImage.src = qrDataUrl;
  }

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-2xl shadow-xs flex items-center justify-center gap-3">
        <Loader2 className="w-5 h-5 text-burgundy dark:text-[#E89BA5] animate-spin" />
        <span className="font-mono text-xs text-slate-500">Checking campus pass status...</span>
      </div>
    );
  }

  // 1. Guardrail State: Active Hackathon Participant
  if (data?.isHackathonParticipant) {
    return (
      <div className="p-5 sm:p-6 bg-white dark:bg-[#150709] border-2 border-burgundy/40 dark:border-burgundy/60 rounded-2xl shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] font-bold text-white uppercase tracking-wider px-2.5 py-0.5 rounded bg-burgundy">
            Hackathon Phase 1 Participant
          </span>
          <span className="font-mono text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
            Flagship Pass Track
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-slate-900 dark:text-[#FAF6F3]">
              On-Campus Flagship Pass Notice
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              You are currently registered as an active participant in <strong>Quantum Hackathon Phase 1</strong>. Please do <strong>not</strong> pay the ₹99 General Pass. Teams qualifying for Phase 2 on-campus development sprint will receive instructions for the <strong>₹499 All-Access Flagship Pass</strong> (covering 24-hr sprint access, hardware setup, and lunch on all 5 days).
            </p>
          </div>

          <Link
            href="/learning/hackathon"
            className="px-4 py-2.5 bg-burgundy hover:bg-burgundy-deep text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shrink-0 shadow-xs"
          >
            <Users className="w-4 h-4" />
            <span>Open Hackathon Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  // 2. Active Pass State: Attendee has already claimed pass
  if (data?.pass) {
    const pass = data.pass;
    const isProvisional = pass.status === 'claimed_provisional';

    return (
      <div className="bg-white dark:bg-[#150709] border-2 border-emerald-500/70 dark:border-emerald-600/70 rounded-2xl shadow-md overflow-hidden">
        {/* Pass Top Ribbon */}
        <div className="bg-emerald-600 text-white px-5 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-200" />
            <span>
              {isProvisional ? 'Provisional Gate Pass · Receipt Uploaded' : 'Verified On-Campus Pass'}
            </span>
          </div>
          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-emerald-700/60 text-white">
            ₹{pass.amount_inr} · General Offline Pass
          </span>
        </div>

        {/* Pass Main Grid */}
        <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-[1fr_260px] gap-6 items-center">
          {/* Left Details */}
          <div className="space-y-4">
            <div>
              <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Attendee Name &amp; Affiliation
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#FAF6F3]">
                {pass.user_name}
              </h2>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-slate-500 dark:text-slate-400 mt-1">
                <span>{pass.user_email}</span>
                <span>·</span>
                <span>{pass.institution || 'SRM University-AP'}</span>
              </div>
            </div>

            {/* Inclusions summary */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#1C0A0D] border border-slate-200 dark:border-[#3D1418] text-xs text-slate-600 dark:text-slate-300 space-y-1">
              <p className="font-bold text-slate-800 dark:text-slate-200">
                Valid for On-Campus Festival: 26–30 October 2026
              </p>
              <p className="leading-relaxed">
                Includes all keynote lectures by IBM Quantum researchers, hands-on masterclass workshops, Industry Tech Expo, The Great Quantum Debate, and Quantum Arcade.
              </p>
            </div>

            {/* Reference info */}
            <div className="grid grid-cols-2 gap-3 font-mono text-xs pt-1">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Easebuzz Transaction ID</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                  {pass.transaction_reference}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Documentary Proof</span>
                <a
                  href={pass.receipt_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-burgundy dark:text-[#E89BA5] hover:underline inline-flex items-center gap-1"
                >
                  <span>View Uploaded Receipt</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleDownloadBadge}
                disabled={!qrDataUrl}
                className="px-4 py-2.5 bg-burgundy hover:bg-burgundy-deep text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>Download Pass (PNG for Mobile)</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-[#200A0E] dark:hover:bg-[#2A0F13] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#3D1418] text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Lanyard Pass</span>
              </button>
            </div>
          </div>

          {/* Right QR Box */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-[#1C0A0D] border border-slate-200 dark:border-[#3D1418] rounded-xl text-center space-y-2">
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrDataUrl}
                alt="Security QR Code Gate Pass"
                className="w-44 h-44 rounded-lg bg-white p-1 border border-slate-200 shadow-2xs"
              />
            ) : (
              <div className="w-44 h-44 flex items-center justify-center bg-white rounded-lg border border-slate-200">
                <QrCode className="w-12 h-12 text-slate-300 animate-pulse" />
              </div>
            )}
            <div className="space-y-0.5">
              <span className="font-mono text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                Security Gate QR
              </span>
              <span className="font-mono text-[9px] text-slate-400 block">
                Scan on arrival at SRM-AP
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Unclaimed State: Prompt to Pay on Easebuzz & Upload Receipt
  return (
    <div className="bg-white dark:bg-[#150709] border-2 border-burgundy/30 dark:border-burgundy/50 rounded-2xl shadow-sm overflow-hidden space-y-0">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-burgundy to-burgundy-deep text-white px-5 sm:px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-rose-200">
            On-Campus Festival Access · 26–30 October 2026
          </span>
          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white/20 text-white">
            General Offline Pass · ₹99
          </span>
        </div>
        <h2 className="font-serif text-xl sm:text-2xl font-bold mt-1 text-white">
          Claim Your On-Campus Attendance Pass
        </h2>
        <p className="text-xs sm:text-sm text-rose-100 max-w-2xl mt-1 leading-relaxed">
          The online masterclasses are concluding! Join us physically at SRM University-AP for keynote sessions by IBM Quantum researchers, hands-on workshops, Industry Tech Expo, Quantum Arcade, and debates.
        </p>
      </div>

      {/* Two-Step Action Container */}
      <div className="p-5 sm:p-6 space-y-6">
        {/* Step 1: Gateway Link */}
        <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-[#1C0A0D] border border-slate-200 dark:border-[#3D1418] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="font-mono text-[10px] font-bold text-burgundy dark:text-[#E89BA5] uppercase tracking-wider">
              Step 1 · Official Payment Gateway
            </span>
            <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-[#FAF6F3]">
              Pay ₹99 on SRM University-AP Gateway (Easebuzz)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-lg">
              Upon successful payment, Easebuzz displays a payment receipt on screen, allows instant PDF download, and emails a copy to your inbox.
            </p>
          </div>

          <a
            href={EASEBUZZ_GATEWAY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-burgundy hover:bg-burgundy-deep text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 shrink-0 shadow-xs"
          >
            <span>Open Easebuzz Gateway (₹99)</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Step 2: Upload Receipt & Submit Reference */}
        <form onSubmit={handleClaimPass} className="space-y-4">
          <div className="space-y-1">
            <span className="font-mono text-[10px] font-bold text-burgundy dark:text-[#E89BA5] uppercase tracking-wider">
              Step 2 · Upload Receipt &amp; Generate Gate Pass
            </span>
            <h3 className="font-sans text-sm font-bold text-slate-900 dark:text-[#FAF6F3]">
              Confirm Your Easebuzz Transaction Reference
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Upload your downloaded Easebuzz PDF receipt or payment screenshot to activate your digital pass immediately.
            </p>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div className="rounded-xl border-2 border-dashed border-slate-300 dark:border-[#4A181E] bg-slate-50/50 dark:bg-[#1A090C] p-4 sm:p-5 transition-colors hover:border-burgundy/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-burgundy/10 dark:bg-burgundy/20 text-burgundy dark:text-[#E89BA5] flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-[#FAF6F3] truncate">
                    {selectedFile ? selectedFile.name : 'Select your Easebuzz receipt (.pdf, .png, .jpg)'}
                  </p>
                  <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    {selectedFile
                      ? `${(selectedFile.size / 1024).toFixed(1)} KB · Ready to submit`
                      : 'Computer-generated Easebuzz receipt PDF or mobile payment screenshot'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {selectedFile && (
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="p-2 rounded-lg border border-slate-200 dark:border-[#3D1418] text-slate-500 hover:text-rose-600 transition-colors"
                    title="Remove selected file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <label className="px-3.5 py-2 rounded-lg border border-slate-300 dark:border-[#3D1418] bg-white dark:bg-[#150709] hover:bg-slate-50 text-slate-800 dark:text-[#FAF6F3] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs">
                  <Upload className="w-3.5 h-3.5 text-burgundy dark:text-[#E89BA5]" />
                  <span>{selectedFile ? 'Change Receipt' : 'Choose Receipt'}</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/*"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Form Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                Easebuzz Transaction ID <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                placeholder="e.g. E26101518BKHN3"
                className="w-full px-3.5 py-2 text-xs sm:text-sm font-mono border border-slate-300 dark:border-[#3D1418] rounded-lg bg-white dark:bg-[#1C0A0D] text-slate-900 dark:text-[#FAF6F3] focus:outline-none focus:ring-1 focus:ring-burgundy"
              />
              <span className="font-mono text-[10px] text-slate-400 mt-1 block">
                Found on line 4 of your receipt under &quot;Easebuzz Transaction ID&quot;
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                Bank Reference Number (Optional)
              </label>
              <input
                type="text"
                value={bankRef}
                onChange={(e) => setBankRef(e.target.value)}
                placeholder="e.g. 194589444789"
                className="w-full px-3.5 py-2 text-xs sm:text-sm font-mono border border-slate-300 dark:border-[#3D1418] rounded-lg bg-white dark:bg-[#1C0A0D] text-slate-900 dark:text-[#FAF6F3] focus:outline-none focus:ring-1 focus:ring-burgundy"
              />
              <span className="font-mono text-[10px] text-slate-400 mt-1 block">
                Found on line 3 of your receipt (UPI UTR / RRN)
              </span>
            </div>
          </div>

          {/* Feedback Banners */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-lg text-xs text-rose-900 dark:text-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-lg text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isSubmitting || !selectedFile || !transactionRef.trim()}
              className="w-full sm:w-auto px-6 py-2.5 bg-burgundy hover:bg-burgundy-deep text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{uploadStatus || 'Processing Claim...'}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Receipt &amp; Claim On-Campus Pass</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
