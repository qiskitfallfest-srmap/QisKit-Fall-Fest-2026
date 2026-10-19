import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Trophy } from 'lucide-react';
import { loadWinnerBoards } from '@/lib/competition-winners';
import { WinnersBoard } from '@/components/learning/profile/ResultsSection';
import { awardSerif } from '@/components/learning/profile/award-font';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Online Competition Results',
  description: 'Winners of the Qiskit Fall Fest 2026 online competitions at SRM University-AP: Tech Reels, Digital Poster and Essay.',
};

/** Public list of announced winners. Unreleased placements never appear here. */
export default async function ResultsPage() {
  const boards = (await loadWinnerBoards()).filter((b) => b.winners.length > 0);

  return (
    <div className="min-h-screen bg-[#FAF7F4] dark:bg-[#100405] py-10 sm:py-14 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8C6A35] dark:text-[#D9C08E]">
            Qiskit Fall Fest 2026 · Partner Plus Host SRM University-AP
          </p>
          <h1 className={`${awardSerif.className} text-3xl sm:text-4xl font-bold text-slate-900 dark:text-[#FAF6F3] leading-tight`}>
            Online Competition Results
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xl">
            Winners selected by the jury for the Tech Reels, Digital Poster and Essay competitions of the online phase. Each award
            has a public verification page.
          </p>
        </header>

        {boards.length === 0 ? (
          <div className="rounded-xl border border-slate-200 dark:border-[#3D1418] bg-white dark:bg-[#150709] px-6 py-12 text-center">
            <Trophy className="mx-auto h-8 w-8 text-[#B08D57]" />
            <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-[#FAF6F3]">Results are not announced yet</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Winners will be listed here once they are announced.</p>
          </div>
        ) : (
          boards.map((board) => <WinnersBoard key={board.type} board={board} />)
        )}

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Qiskit Fall Fest SRMAP 2026 home
          </Link>
        </div>
      </div>
    </div>
  );
}
