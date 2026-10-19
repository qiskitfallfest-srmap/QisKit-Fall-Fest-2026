import React, { cache } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, ExternalLink, ShieldCheck, XCircle } from 'lucide-react';
import { loadWinnerBoards } from '@/lib/competition-winners';
import { AWARD_RANK_LABEL, formatInr, parseAwardId } from '@/lib/competition-results';
import { AwardCard } from '@/components/learning/profile/AwardCard';
import { awardSerif } from '@/components/learning/profile/award-font';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

/** The released placement for this ID, or null. Unreleased placements are reported as not found. */
const findAward = cache(async (rawId: string) => {
  const parsed = parseAwardId(decodeURIComponent(rawId));
  if (!parsed) return null;
  const board = (await loadWinnerBoards()).find((b) => b.type === parsed.type);
  const winner = board?.winners.find((w) => w.rank === parsed.rank && w.released);
  return board && winner ? { board, winner } : null;
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const award = await findAward(id);
  if (!award) return { title: 'Award verification', robots: { index: false } };
  const { board, winner } = award;
  return {
    title: `${winner.name}: ${AWARD_RANK_LABEL[winner.rank]}, ${board.title}`,
    description: `Verified award ${winner.awardId}: ${winner.name} won ${AWARD_RANK_LABEL[winner.rank]} in the ${board.title} at Qiskit Fall Fest 2026, SRM University-AP.`,
  };
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">{label}</span>
      <div className="text-sm font-semibold text-slate-900 dark:text-[#FAF6F3]">{children}</div>
    </div>
  );
}

export default async function AwardVerificationPage({ params }: PageProps) {
  const { id } = await params;
  const award = await findAward(id);

  if (!award) {
    return (
      <div className="min-h-screen bg-[#FAF7F4] dark:bg-[#100405] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-[#150709] rounded-2xl border border-slate-200 dark:border-[#3D1418] shadow-sm p-8 text-center space-y-4">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-200">
            <XCircle className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-[#FAF6F3]">Award not found</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              No announced award matches{' '}
              <code className="bg-slate-100 dark:bg-[#1C0A0D] text-slate-800 dark:text-slate-200 px-1.5 py-0.5 rounded font-mono font-semibold">
                {decodeURIComponent(id)}
              </code>
              .
            </p>
          </div>
          <div className="pt-4 border-t border-slate-100 dark:border-[#3D1418] flex flex-col items-center gap-2">
            <Link href="/results" className="text-xs font-semibold text-burgundy dark:text-[#E89BA5] hover:underline">
              See all competition results
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { board, winner } = award;
  const announced = winner.releasedAt
    ? new Date(winner.releasedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' })
    : null;

  return (
    <div className="min-h-screen bg-[#FAF7F4] dark:bg-[#100405] py-10 sm:py-14 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white dark:bg-[#150709] rounded-2xl border border-emerald-200 dark:border-emerald-900/60 shadow-xs p-6 sm:p-8">
          <div className="flex items-start gap-3 pb-6 border-b border-slate-100 dark:border-[#3D1418]">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3 h-3" /> Verified award
              </span>
              <h1 className={`${awardSerif.className} text-2xl sm:text-3xl font-bold text-slate-900 dark:text-[#FAF6F3] mt-2 leading-tight`}>
                {AWARD_RANK_LABEL[winner.rank]}, {board.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Qiskit Fall Fest 2026 online phase · Partner Plus Host SRM University-AP, Amaravati
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
            <Detail label="Awarded to">
              <span className="text-lg font-bold">{winner.name}</span>
            </Detail>
            {winner.institution && <Detail label="Institution">{winner.institution}</Detail>}
            <Detail label="Placement">{AWARD_RANK_LABEL[winner.rank]}</Detail>
            {winner.prizeInr != null && <Detail label="Cash prize">{formatInr(winner.prizeInr)}</Detail>}
            {announced && <Detail label="Announced">{announced}</Detail>}
            <Detail label="Award ID">
              <code className="text-xs font-mono font-bold bg-slate-100 dark:bg-[#1C0A0D] px-2 py-1 rounded inline-block">{winner.awardId}</code>
            </Detail>
            {(winner.entryTitle || winner.entryUrl) && (
              <div className="sm:col-span-2">
                <Detail label="Winning entry">
                  {winner.entryTitle && <span className="block">{winner.entryTitle}</span>}
                  {winner.entryUrl && (
                    <a
                      href={winner.entryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-burgundy dark:text-[#E89BA5] hover:underline"
                    >
                      View entry <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </Detail>
              </div>
            )}
          </div>
        </div>

        <AwardCard board={board} winner={{ ...winner, isYou: false }} />

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <Link
            href="/results"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            All competition results
          </Link>
          <Link href="/" className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
            Qiskit Fall Fest SRMAP 2026 home
          </Link>
        </div>
      </div>
    </div>
  );
}
