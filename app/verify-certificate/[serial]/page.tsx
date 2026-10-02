import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Download,
  ExternalLink,
  Award,
  Calendar,
  Building2,
  Hash,
  ArrowLeft,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ serial: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { serial } = await params;
  return {
    title: `Credential Verification: ${serial} | Qiskit Fall Fest SRMAP 2026`,
    description: `Official IBM Quantum × SRM University-AP verified credential record for ${serial}.`,
  };
}

export default async function VerifyCertificatePage({ params }: PageProps) {
  const { serial } = await params;

  // Query issued_certificates by serial_number
  const { data: cert, error } = await supabase
    .from('issued_certificates')
    .select('*')
    .eq('serial_number', serial)
    .maybeSingle();

  if (error || !cert) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center space-y-4">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-200">
            <XCircle className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Credential Not Found</h1>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              No verified academic credential matching serial number <br />
              <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded font-mono font-semibold">
                {serial}
              </code>{' '}
              exists in the registry.
            </p>
          </div>
          <div className="pt-4 border-t border-slate-100">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-burgundy hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to Qiskit Fall Fest Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const issuedDate = new Date(cert.issued_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const distinction =
    Number(cert.average_quiz_score) >= 90
      ? 'High Distinction'
      : Number(cert.average_quiz_score) >= 75
      ? 'Distinction'
      : 'Pass';

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Verification Banner */}
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-xs p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" /> Authentic & Verified
                  </span>
                  <span className="text-xs text-slate-400">· Official Registry Record</span>
                </div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                  IBM Quantum Masterclass Credential
                </h1>
              </div>
            </div>

            <a
              href={cert.certificate_url}
              target="_blank"
              rel="noopener noreferrer"
              download={`${cert.serial_number}.svg`}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-burgundy text-white text-xs font-semibold rounded-lg hover:bg-burgundy-deep transition-colors shadow-xs shrink-0"
            >
              <Download className="w-4 h-4" />
              Download Certificate
            </a>
          </div>

          {/* Credential Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Recipient Name
              </span>
              <p className="text-lg font-bold text-slate-900">{cert.recipient_name}</p>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Academic Distinction
              </span>
              <p className="text-base font-bold text-emerald-700 flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                {distinction} ({cert.average_quiz_score}%)
              </p>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Issuing Program
              </span>
              <p className="text-sm font-semibold text-slate-800">{cert.course_name}</p>
              <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <Building2 className="w-3.5 h-3.5" />
                {cert.institution} × IBM Quantum
              </span>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Date Issued
              </span>
              <p className="text-sm font-semibold text-slate-800 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {issuedDate}
              </p>
            </div>

            <div className="sm:col-span-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Serial Number
              </span>
              <code className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded inline-block">
                {cert.serial_number}
              </code>
            </div>

            <div className="sm:col-span-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Cryptographic Verification Hash (SHA-256)
              </span>
              <p className="text-[11px] font-mono text-slate-500 break-all bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                {cert.verification_hash}
              </p>
            </div>
          </div>
        </div>

        {/* Live Visual Certificate Preview */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-burgundy" />
              Verified Certificate Preview
            </h2>
            <a
              href={cert.certificate_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-burgundy hover:underline flex items-center gap-1"
            >
              Open Full Resolution
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cert.certificate_url}
              alt={`Certificate for ${cert.recipient_name}`}
              className="w-full h-auto block"
            />
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return to Qiskit Fall Fest SRMAP 2026 Home
          </Link>
        </div>
      </div>
    </div>
  );
}
