import React, { Suspense } from 'react';
import { LearningSidebar } from '@/components/learning/LearningSidebar';
import { Footer } from '@/components/shared/Footer';

import { LearningShell } from '@/components/learning/LearningShell';

export default function LearningLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen font-sans bg-[#FAF7F4] text-[#181313] dark:bg-[#100405] dark:text-[#F8F4EF]">
      <LearningShell
        sidebar={
          <Suspense fallback={<div className="p-4 font-mono text-xs text-slate-400 uppercase tracking-wider">Loading curriculum...</div>}>
            <LearningSidebar />
          </Suspense>
        }
      >
        {children}
      </LearningShell>

      {/* Global Shared Footer */}
      <Footer />
    </div>
  );
}

