'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { AlertCircle, CheckCircle2, Download, FileText, Flag, Loader2, Lock } from 'lucide-react';
import { QCTF_EVENT, getQctfBlockLabel, getQctfTrack, type QctfChallengeDetail } from '@/data/qctf/tracks';
import { DifficultyBadge, QctfBreadcrumbBar, QctfStateBanner, TRACK_ICON } from './qctf-ui';
import { useQctfMe } from './QctfGate';

type SubmitState = 'idle' | 'submitting' | 'wrong' | 'error';

export function QctfChallengeView({ challengeId }: { challengeId: string }) {
  const { me, refreshMe } = useQctfMe();
  const [challenge, setChallenge] = useState<QctfChallengeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [flag, setFlag] = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [message, setMessage] = useState('');

  const loadChallenge = useCallback(async () => {
    try {
      const res = await fetch(`/api/qctf/challenges/${encodeURIComponent(challengeId)}`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok || !data.success) setLoadError(data.error || 'Could not load this challenge.');
      else {
        setChallenge(data.challenge);
        setLoadError('');
      }
    } catch {
      setLoadError('Could not load this challenge. Check your connection and refresh.');
    } finally {
      setIsLoading(false);
    }
  }, [challengeId]);

  useEffect(() => {
    loadChallenge();
  }, [loadChallenge, me.team?.id]);

  const track = challenge ? getQctfTrack(challenge.trackId) : undefined;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!challenge || !flag.trim() || challenge.solved || submitState === 'submitting') return;
    setSubmitState('submitting');
    setMessage('');
    try {
      const res = await fetch('/api/qctf/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId: challenge.id, flag }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setSubmitState('error');
        setMessage(data.error || 'Submission failed. Try again.');
      } else if (data.correct) {
        setSubmitState('idle');
        setMessage(data.message);
        setFlag('');
        await Promise.all([loadChallenge(), refreshMe()]);
      } else {
        setSubmitState('wrong');
        setMessage(data.message);
      }
    } catch {
      setSubmitState('error');
      setMessage('Could not reach the server. Your flag was not submitted.');
    }
  }

  const trail = ['QCTF', track?.name ?? '…', challenge?.id ?? challengeId.toUpperCase()];
  const blockedReason = !me.team
    ? 'Join or create a team on the arena page before submitting flags.'
    : !me.canSubmit
      ? me.state === 'closed'
        ? 'The round is closed. Submissions are no longer accepted.'
        : 'Flag submission is not open yet.'
      : null;

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-[#100405] pb-16 font-sans">
      <QctfBreadcrumbBar
        backHref={challenge ? `/learning/qctf?track=${challenge.trackId}` : '/learning/qctf'}
        backLabel="All challenges"
        trail={trail}
      />
      <QctfStateBanner me={me} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-24 text-sm text-slate-500 dark:text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading challenge
          </div>
        ) : loadError || !challenge ? (
          <div className="max-w-xl mx-auto p-6 rounded-xl bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] text-center space-y-3">
            <AlertCircle className="w-6 h-6 mx-auto text-rose-600 dark:text-rose-400" />
            <p className="text-sm text-slate-700 dark:text-slate-200">{loadError || 'Challenge not found.'}</p>
            <Link href="/learning/qctf" className="inline-block text-xs font-semibold text-burgundy dark:text-[#E89BA5] hover:underline">
              Back to all challenges
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
            {/* Statement */}
            <article className="p-5 sm:p-8 rounded-xl bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] shadow-xs min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-burgundy dark:text-[#E89BA5]">{challenge.id}</span>
                <DifficultyBadge difficulty={challenge.difficulty} />
                {track && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-slate-200 dark:border-[#3D1418] bg-slate-50 dark:bg-[#1C0A0D] text-[11px] font-medium text-slate-600 dark:text-slate-300">
                    {React.createElement(TRACK_ICON[track.id], { className: 'w-3 h-3' })}
                    {track.name}
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-md border border-burgundy/15 dark:border-burgundy/30 bg-burgundy/5 dark:bg-burgundy/15 font-mono text-[11px] text-burgundy dark:text-[#E89BA5]">
                  {getQctfBlockLabel(challenge.block)}
                </span>
                {!challenge.released && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 font-mono text-[11px] font-bold text-amber-800 dark:text-amber-300">
                    <Lock className="w-3 h-3" />
                    Not released to players
                  </span>
                )}
              </div>

              <h1 className="mt-4 font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-[#FAF6F3] tracking-tight">
                {challenge.title}
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                {challenge.summary}
              </p>

              <h2 className="mt-8 mb-3 flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                <FileText className="w-3.5 h-3.5" />
                Problem statement
              </h2>
              <div className="p-4 sm:p-5 rounded-lg bg-slate-50 dark:bg-[#1C0A0D] border border-slate-200 dark:border-[#3D1418] text-sm text-slate-800 dark:text-slate-100 leading-relaxed whitespace-pre-line">
                {challenge.statement}
              </div>

              {challenge.attachments.length > 0 && (
                <>
                  <h2 className="mt-8 mb-3 flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    <Download className="w-3.5 h-3.5" />
                    Files
                  </h2>
                  <ul className="space-y-2">
                    {challenge.attachments.map((file) => (
                      <li key={file.url}>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-[#3D1418] text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1C0A0D]"
                        >
                          <Download className="w-3.5 h-3.5 text-burgundy dark:text-[#E89BA5]" />
                          {file.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </article>

            {/* Flag panel */}
            <aside className="lg:sticky lg:top-6 p-5 rounded-xl bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] shadow-xs space-y-5">
              <dl className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Points', value: String(challenge.points) },
                  { label: 'Solves', value: String(challenge.solveCount) },
                  { label: 'Status', value: challenge.solved ? 'Solved' : 'Open' },
                ].map(({ label, value }) => (
                  <div key={label} className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#1C0A0D] border border-slate-200 dark:border-[#3D1418]">
                    <dt className="font-mono text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">{label}</dt>
                    <dd
                      className={clsx(
                        'mt-1 font-mono text-base font-bold',
                        label === 'Status' && challenge.solved
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-slate-900 dark:text-[#FAF6F3]'
                      )}
                    >
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>

              {challenge.solved ? (
                <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-sm text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold">{message || 'Your team has solved this challenge.'}</p>
                    <p className="text-xs mt-0.5 opacity-90">{challenge.points} points are on the scoreboard.</p>
                  </div>
                </div>
              ) : blockedReason ? (
                <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200">
                  <Lock className="w-4 h-4 shrink-0" />
                  <span>
                    {blockedReason}{' '}
                    {!me.team && (
                      <Link href="/learning/qctf" className="font-semibold underline">
                        Go to the arena
                      </Link>
                    )}
                  </span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-2.5">
                  <label
                    htmlFor="qctf-flag"
                    className="flex items-center gap-1.5 font-mono text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    Submit flag for {me.team?.name}
                  </label>
                  <input
                    id="qctf-flag"
                    type="text"
                    value={flag}
                    onChange={(e) => {
                      setFlag(e.target.value);
                      if (submitState === 'wrong' || submitState === 'error') setSubmitState('idle');
                    }}
                    placeholder={QCTF_EVENT.flagFormat}
                    autoComplete="off"
                    spellCheck={false}
                    maxLength={200}
                    aria-invalid={submitState === 'wrong'}
                    aria-describedby="qctf-flag-feedback"
                    className={clsx(
                      'w-full px-3 py-2.5 rounded-lg border bg-slate-50 dark:bg-[#1C0A0D] font-mono text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2',
                      submitState === 'wrong'
                        ? 'border-rose-400 focus:ring-rose-300/50 dark:border-rose-700'
                        : 'border-slate-200 dark:border-[#3D1418] focus:ring-burgundy/30 focus:border-burgundy/50'
                    )}
                  />
                  <div id="qctf-flag-feedback" aria-live="polite" className="min-h-[1.25rem]">
                    {(submitState === 'wrong' || submitState === 'error') && message && (
                      <p className="flex items-start gap-1.5 text-xs text-rose-700 dark:text-rose-400">
                        <AlertCircle className="w-3.5 h-3.5 mt-px shrink-0" />
                        {message}
                      </p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={!flag.trim() || submitState === 'submitting'}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-burgundy hover:bg-burgundy-deep text-white text-sm font-semibold shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {submitState === 'submitting' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Checking
                      </>
                    ) : (
                      'Submit flag'
                    )}
                  </button>
                </form>
              )}

              <p className="pt-4 border-t border-slate-100 dark:border-[#3D1418] text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Flags are checked on the server and are case-sensitive. Spaces before or after the flag are ignored.
                You can make 10 attempts per minute.
              </p>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
