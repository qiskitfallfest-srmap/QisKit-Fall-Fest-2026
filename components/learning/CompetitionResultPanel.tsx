import clsx from 'clsx';
import { Award } from 'lucide-react';
import type { CompetitionOutcome, CompetitionResult } from '@/lib/competition-results';

export const COMPETITION_OUTCOME_TONE: Record<CompetitionOutcome, string> = {
  winner: 'text-emerald-700 dark:text-emerald-300',
  finalist: 'text-blue-700 dark:text-blue-300',
  shortlisted: 'text-violet-700 dark:text-violet-300',
  not_selected: 'text-slate-600 dark:text-slate-300',
};

const PANEL_TONE: Record<CompetitionOutcome, string> = {
  winner: 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30',
  finalist: 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30',
  shortlisted: 'border-violet-200 bg-violet-50 dark:border-violet-900 dark:bg-violet-950/30',
  not_selected: 'border-slate-200 bg-slate-50 dark:border-[#3D1418] dark:bg-[#1C0A0D]',
};

const OUTCOME_MESSAGE: Record<CompetitionOutcome, string> = {
  winner: 'Your entry is among the winners of this competition.',
  finalist: 'Your entry reached the finalist round of this competition.',
  shortlisted: 'Your entry was shortlisted by the jury.',
  not_selected: 'Your entry was not selected for an award this time. Thank you for taking part.',
};

/** The released jury result for one daily competition entry. */
export function CompetitionResultPanel({ result }: { result: CompetitionResult }) {
  return (
    <div className={clsx('p-5 rounded-xl border space-y-2', PANEL_TONE[result.outcome])}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Award className={clsx('w-4 h-4', COMPETITION_OUTCOME_TONE[result.outcome])} />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Jury result
          </span>
        </div>
        {result.score != null && (
          <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
            Score {result.score}/{result.maxScore}
          </span>
        )}
      </div>
      <p className={clsx('font-serif text-xl font-bold', COMPETITION_OUTCOME_TONE[result.outcome])}>{result.label}</p>
      <p className="text-sm text-slate-700 dark:text-slate-300">{OUTCOME_MESSAGE[result.outcome]}</p>
      {result.feedback && (
        <div className="pt-2 border-t border-slate-200/70 dark:border-[#3D1418]">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Comment from the jury</p>
          <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line mt-0.5">{result.feedback}</p>
        </div>
      )}
    </div>
  );
}
