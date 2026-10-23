'use client';

import React from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { ArrowLeft, Atom, ExternalLink, FlaskConical, Info, Lock, Network, Share2, Shield } from 'lucide-react';
import type { QctfDifficulty, QctfMe, QctfState, QctfTrackId } from '@/data/qctf/tracks';
import { QCTF_DIFFICULTY_LABEL, QCTF_STATES } from '@/data/qctf/tracks';
import { QCTF_PUBLIC_STATES } from '@/lib/qctf/access';

export const TRACK_ICON: Record<QctfTrackId, React.ElementType> = {
  qml: Network,
  qaoa: Share2,
  pqc: Shield,
  'q-chemistry': FlaskConical,
  'quantum-simulation': Atom,
};

const DIFFICULTY_STYLE: Record<QctfDifficulty, string> = {
  easy: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/70',
  hard: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/70',
  advanced: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/70',
};

export function DifficultyBadge({ difficulty }: { difficulty: QctfDifficulty }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-0.5 rounded-md border font-mono text-[10px] font-bold uppercase tracking-wider',
        DIFFICULTY_STYLE[difficulty]
      )}
    >
      {QCTF_DIFFICULTY_LABEL[difficulty]}
    </span>
  );
}

/** Breadcrumb bar matching the coding challenge and hackathon pages. */
export function QctfBreadcrumbBar({
  backHref,
  backLabel,
  trail,
}: {
  backHref: string;
  backLabel: string;
  trail: string[];
}) {
  return (
    <div className="bg-white dark:bg-[#150709] border-b border-slate-200 dark:border-[#3D1418]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-2">
        <Link
          href={backHref}
          className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-burgundy dark:hover:text-[#E89BA5] flex items-center gap-1.5 transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {backLabel}
        </Link>
        <div className="flex items-center gap-2 font-mono text-xs min-w-0">
          {trail.map((item, index) => (
            <React.Fragment key={item}>
              {index > 0 && <span className="text-slate-300 dark:text-slate-600">/</span>}
              <span
                className={clsx(
                  'truncate',
                  index === trail.length - 1
                    ? 'font-bold text-burgundy dark:text-[#E89BA5]'
                    : 'text-slate-500 dark:text-slate-400'
                )}
              >
                {item}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

const PLAYER_NOTICE: Partial<Record<QctfState, string>> = {
  announced: 'The warm-up is open. Competition blocks open during the round on 27 October.',
  frozen: 'The scoreboard is frozen. Flags you submit still count towards the final result.',
  closed: 'The round is closed. Submissions are no longer accepted.',
};

/** Arena state for organizers (with the run label), and state notices for players. */
export function QctfStateBanner({ me }: { me: QctfMe }) {
  const stateLabel = QCTF_STATES.find((s) => s.id === me.state)?.label ?? me.state;

  if (me.isStaff) {
    const participantsLocked = !QCTF_PUBLIC_STATES.includes(me.state);
    return (
      <div className="bg-amber-500/15 border-b border-amber-500/40 px-4 sm:px-6 py-2 text-xs text-amber-900 dark:text-amber-200">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-start gap-2">
            <Lock className="w-4 h-4 mt-px text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              <strong>Organizer view:</strong> arena is <strong>{stateLabel}</strong> · run{' '}
              <span className="font-mono">{me.run}</span>
              {participantsLocked && ' · participants see the locked screen'}
            </span>
          </span>
          <Link
            href="/learning/admin?tab=qctf"
            className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-950 dark:text-amber-100 font-semibold transition-colors text-[11px] flex items-center gap-1"
          >
            QCTF control
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    );
  }

  const notice = PLAYER_NOTICE[me.state];
  if (!notice) return null;
  return (
    <div className="bg-burgundy/10 dark:bg-burgundy/20 border-b border-burgundy/20 dark:border-burgundy/40 px-4 sm:px-6 py-2 text-xs text-burgundy dark:text-[#F3C9CF]">
      <div className="max-w-7xl mx-auto flex items-start gap-2">
        <Info className="w-4 h-4 mt-px shrink-0" />
        <span>{notice}</span>
      </div>
    </div>
  );
}
