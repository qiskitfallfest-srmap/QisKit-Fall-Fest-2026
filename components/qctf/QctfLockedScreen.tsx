'use client';

import React from 'react';
import Link from 'next/link';
import { CalendarDays, Clock, Flag, Info, Lock, MapPin } from 'lucide-react';
import { QCTF_EVENT, type QctfState } from '@/data/qctf/tracks';
import { QCTF_PUBLIC_STATES } from '@/lib/qctf/access';
import { QctfBreadcrumbBar } from './qctf-ui';

const DETAILS = [
  { icon: CalendarDays, label: 'Date', value: QCTF_EVENT.dateLabel },
  { icon: MapPin, label: 'Venue', value: QCTF_EVENT.venue },
  { icon: Clock, label: 'Competition window', value: QCTF_EVENT.windowLabel },
  { icon: Flag, label: 'Answer format', value: QCTF_EVENT.flagFormat },
];

export function QctfLockedScreen({ state }: { state: QctfState }) {
  // Once the arena is open, a signed-in visitor who still lands here is not on the entry list
  const isOpen = QCTF_PUBLIC_STATES.includes(state);

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-[#100405] pb-16 font-sans">
      <QctfBreadcrumbBar backHref="/learning" backLabel="Learning Hub" trail={['Competitions', 'QCTF Locked']} />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 sm:pt-12">
        <div className="bg-white dark:bg-[#150709] rounded-xl shadow-sm border border-slate-200 dark:border-[#3D1418] text-center p-6 sm:p-10 space-y-6">
          <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-burgundy/10 dark:bg-burgundy/20 border border-burgundy/20 dark:border-burgundy/40 flex items-center justify-center text-burgundy dark:text-[#E89BA5]">
            <Lock className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>

          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-burgundy/10 dark:bg-burgundy/25 border border-burgundy/20 dark:border-burgundy/40 text-burgundy dark:text-[#E89BA5] font-mono text-xs font-semibold uppercase tracking-wider">
              Flagship · On Campus
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-[#FAF6F3] tracking-tight leading-snug">
              Quantum Capture the Flag
            </h1>
            {isOpen ? (
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg mx-auto">
                The arena is open to qualified participants, and your account is not on the QCTF entry list.
                If you qualified, ask the QCTF desk in the ALC to add the email you signed in with.
              </p>
            ) : (
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg mx-auto">
                The QCTF arena opens on the day of the competition. Challenges span quantum machine learning,
                optimization, post-quantum cryptography, quantum chemistry and simulation. Participation is
                subject to the competition&apos;s qualification and eligibility requirements.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-lg mx-auto">
            {DETAILS.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#1C0A0D] border border-slate-200 dark:border-[#3D1418] space-y-1"
              >
                <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase font-bold text-burgundy dark:text-[#E89BA5]">
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">{value}</p>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1C0A0D] border border-slate-200 dark:border-[#3D1418] max-w-lg mx-auto text-left space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
              <Info className="w-4 h-4 text-burgundy dark:text-[#E89BA5]" />
              How to prepare
            </div>
            <ul className="list-disc list-inside space-y-1.5 pl-1 leading-relaxed">
              <li>Bring a laptop with Python and Qiskit installed, or a working Google Colab login</li>
              <li>You solve each challenge on your own machine and submit only the flag</li>
              <li>Revise the masterclasses on quantum algorithms and cryptography</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/schedule#qctf"
              className="w-full sm:w-auto px-5 py-2.5 bg-burgundy hover:bg-burgundy-deep text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <CalendarDays className="w-4 h-4" />
              View the Day 2 schedule
            </Link>
            <Link
              href="/learning"
              className="w-full sm:w-auto px-5 py-2.5 border border-slate-200 dark:border-[#3D1418] hover:bg-slate-50 dark:hover:bg-[#1C0A0D] text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center"
            >
              Back to Learning Hub
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
