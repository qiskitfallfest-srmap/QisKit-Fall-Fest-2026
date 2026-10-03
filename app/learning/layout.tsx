import React, { Suspense } from 'react';
import { LearningSidebar } from '@/components/learning/LearningSidebar';
import { Footer } from '@/components/shared/Footer';

export default function LearningLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen font-sans bg-[#FAF7F4] text-[#181313] dark:bg-[#100405] dark:text-[#F8F4EF]">
      {/* Main Learning Container */}
      <div className="flex-1 flex flex-col md:flex-row min-w-0">
        {/* Sidebar - flows normally on mobile, sticky under navbar on desktop */}
        <aside 
          data-lenis-prevent="true"
          className="w-full md:w-72 bg-white dark:bg-[#150709] border-b md:border-b-0 md:border-r border-slate-200 dark:border-[#3D1418] shrink-0 md:sticky md:top-[78px] sm:md:top-[84px] xl:md:top-[90px] md:h-[calc(100vh-78px)] sm:md:h-[calc(100vh-84px)] xl:md:h-[calc(100vh-90px)] md:flex md:flex-col md:overflow-hidden z-30 overscroll-contain"
          style={{ overscrollBehavior: 'contain' }}
        >
          <Suspense fallback={<div className="p-4 font-mono text-xs text-slate-400 uppercase tracking-wider">Loading curriculum...</div>}>
            <LearningSidebar />
          </Suspense>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 bg-[#FAF7F4] dark:bg-[#100405]">
          {children}
        </main>
      </div>

      {/* Global Shared Footer */}
      <Footer />
    </div>
  );
}

