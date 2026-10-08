'use client';

import React, { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { LearningSidebar } from '@/components/learning/LearningSidebar';
import { Footer } from '@/components/shared/Footer';
import { LearningShell } from '@/components/learning/LearningShell';

export default function LearningLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isCodingChallenge = pathname?.startsWith('/learning/qiskit-challenge');

  return (
    <div
      data-lenis-prevent={isCodingChallenge ? 'true' : undefined}
      className={
        isCodingChallenge
          ? 'flex flex-col h-screen overflow-hidden font-sans bg-[#FAF7F4] text-[#181313] dark:bg-[#100405] dark:text-[#F8F4EF]'
          : 'flex flex-col min-h-screen font-sans bg-[#FAF7F4] text-[#181313] dark:bg-[#100405] dark:text-[#F8F4EF]'
      }
    >
      <LearningShell
        sidebar={
          <Suspense fallback={<div className="p-4 font-mono text-xs text-slate-400 uppercase tracking-wider">Loading curriculum...</div>}>
            <LearningSidebar />
          </Suspense>
        }
      >
        {children}
      </LearningShell>

      {/* Global Shared Footer - Suppressed on Qiskit Coding Challenge */}
      {!isCodingChallenge && <Footer />}
    </div>
  );
}

