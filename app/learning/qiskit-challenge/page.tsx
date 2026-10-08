'use client';

import React, { useState, useEffect, useCallback } from 'react';
import clsx from 'clsx';
import { AuthGate } from '@/components/learning/AuthGate';
import { QiskitPlayground } from '@/components/learning/QiskitPlayground';
import { QISKIT_CHALLENGES, CodingChallenge } from '@/data/qiskit/challenges';
import {
  Clock,
  Trophy,
  CheckCircle2,
  Circle,
  HelpCircle,
  Flame,
  ChevronRight,
  Code2,
  Terminal,
  ShieldAlert,
  Award,
  Sparkles,
  ExternalLink,
  Users,
  X,
  AlertCircle,
} from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  displayName: string;
  totalScore: number;
  maxPossibleScore: number;
  solvedCount: number;
  totalProblems: number;
  lastSubmissionTime: string | null;
}

export default function QiskitChallengePage() {
  return (
    <AuthGate>
      <QiskitChallengeDashboard />
    </AuthGate>
  );
}

function QiskitChallengeDashboard() {
  const [selectedProblemId, setSelectedProblemId] = useState<string>('P1');
  const [challenges, setChallenges] = useState<any[]>(QISKIT_CHALLENGES);
  const [sessionUser, setSessionUser] = useState<{ email: string; fullName: string } | null>(null);
  const [competitionConfig, setCompetitionConfig] = useState<any>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('--:--:--');
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState<boolean>(false);

  // 1. Fetch current user session
  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/auth/session');
        const data = await res.json();
        if (data?.session) {
          setSessionUser({
            email: data.session.email,
            fullName: data.session.fullName || data.session.email,
          });
        }
      } catch (e) {
        console.error('Failed to load session:', e);
      }
    }
    loadUser();
  }, []);

  // 2. Fetch challenge state & server-authoritative config
  const refreshChallenges = useCallback(async () => {
    try {
      const res = await fetch('/api/qiskit/challenges', { cache: 'no-store' });
      const data = await res.json();
      if (data?.success) {
        setChallenges(data.challenges);
        setCompetitionConfig(data.config);
      }
    } catch (e) {
      console.warn('Failed to load challenge metadata:', e);
    }
  }, []);

  useEffect(() => {
    refreshChallenges();
  }, [refreshChallenges]);

  // 3. Server-authoritative timer countdown
  useEffect(() => {
    if (!competitionConfig?.end_time) return;

    const target = new Date(competitionConfig.end_time).getTime();

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setTimeRemaining('COMPLETED');
        clearInterval(interval);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      const pad = (n: number) => n.toString().padStart(2, '0');
      setTimeRemaining(`${pad(hours)}h ${pad(mins)}m ${pad(secs)}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [competitionConfig]);

  // 4. Fetch Leaderboard
  const fetchLeaderboard = async () => {
    setIsLoadingLeaderboard(true);
    try {
      const res = await fetch('/api/qiskit/leaderboard', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.leaderboard) {
        setLeaderboard(data.leaderboard);
      }
    } catch (e) {
      console.error('Failed to load leaderboard:', e);
    } finally {
      setIsLoadingLeaderboard(false);
    }
  };

  const selectedChallenge: CodingChallenge =
    challenges.find((c) => c.id === selectedProblemId) || challenges[0];

  const totalEarnedPoints = challenges.reduce(
    (acc, curr) => acc + (curr.userBestScore || 0),
    0
  );
  const solvedCount = challenges.filter((c) => c.userState === 'solved').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 font-sans space-y-6">
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER & SERVER TIMER BAR
         ───────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-burgundy/10 text-burgundy dark:bg-burgundy/25 dark:text-[#E89BA5] uppercase tracking-wider">
              IBM Quantum × SRM University-AP
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="font-mono text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
              9 Problems · 100 Points Total
            </span>
          </div>

          <h1 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#FAF6F3] tracking-tight">
            Qiskit Coding Challenge
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Algorithmic Quantum Computing Evaluation. Write and optimize Python/Qiskit algorithms.
          </p>
        </div>

        {/* Right metrics: Time Remaining, Score, and Leaderboard toggle */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Server-authoritative timer */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#1C0A0D] border border-slate-200 dark:border-[#3D1418]">
            <Clock className="w-4 h-4 text-burgundy dark:text-[#E89BA5]" />
            <div className="flex flex-col">
              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                Time Remaining
              </span>
              <span className="font-mono text-xs font-bold text-slate-900 dark:text-[#FAF6F3]">
                {timeRemaining}
              </span>
            </div>
          </div>

          {/* User Score Pill */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-burgundy/10 dark:bg-burgundy/20 border border-burgundy/20 dark:border-burgundy/40">
            <Award className="w-4 h-4 text-burgundy dark:text-[#E89BA5]" />
            <div className="flex flex-col">
              <span className="text-[9px] font-mono font-bold text-burgundy dark:text-[#E89BA5] uppercase tracking-wider">
                Your Score
              </span>
              <span className="font-mono text-xs font-bold text-burgundy dark:text-[#FAF6F3]">
                {totalEarnedPoints} / 100 pts ({solvedCount}/9)
              </span>
            </div>
          </div>

          {/* Leaderboard Button */}
          <button
            onClick={() => {
              setIsLeaderboardOpen(true);
              fetchLeaderboard();
            }}
            className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-[#3D1418] hover:bg-slate-100 dark:hover:bg-[#1C0A0D] text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Leaderboard</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN DUAL-PANE WORKSPACE: PROBLEMS SIDEBAR + EDITOR
         ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Problem Nav Selector (4 cols on lg) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Problem Set (9)
            </span>
            <span className="font-mono text-[11px] text-slate-400">
              {solvedCount} of 9 Solved
            </span>
          </div>

          <div className="space-y-1.5">
            {challenges.map((prob) => {
              const isSelected = prob.id === selectedProblemId;
              const isSolved = prob.userState === 'solved';
              const isAttempted = prob.userState === 'attempted';

              return (
                <button
                  key={prob.id}
                  onClick={() => setSelectedProblemId(prob.id)}
                  className={clsx(
                    'w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between group cursor-pointer',
                    isSelected
                      ? 'bg-burgundy/10 dark:bg-burgundy/25 border-burgundy/40 dark:border-burgundy/60 shadow-xs'
                      : 'bg-white dark:bg-[#150709] border-slate-200 dark:border-[#3D1418] hover:bg-slate-50 dark:hover:bg-[#1C0A0D]'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Status Icon */}
                    {isSolved ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : isAttempted ? (
                      <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
                    )}

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-900 dark:text-[#FAF6F3]">
                          {prob.problemCode}
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate">
                          {prob.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Level {prob.level} · {prob.levelLabel}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className={clsx(
                      'px-2 py-0.5 rounded text-[10px] font-mono font-bold',
                      isSolved
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        : 'bg-slate-100 dark:bg-[#1C0A0D] text-slate-600 dark:text-slate-400'
                    )}>
                      {prob.userBestScore ? `${prob.userBestScore}/${prob.points}` : `${prob.points} pts`}
                    </span>
                    <ChevronRight className={clsx(
                      'w-3.5 h-3.5 transition-transform',
                      isSelected ? 'text-burgundy dark:text-[#E89BA5] translate-x-0.5' : 'text-slate-300'
                    )} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Info Box */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] text-xs text-slate-500 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
              <AlertCircle className="w-3.5 h-3.5 text-burgundy dark:text-[#E89BA5]" />
              <span>Judging Guidelines</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Submissions undergo automated evaluation on public test cases and hidden parameterized suites. Your highest score on each problem is retained.
            </p>
          </div>
        </div>

        {/* Right Column: Problem Statement & Playground (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Problem Statement Card */}
          <div className="bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-[#3D1418]">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-burgundy/10 text-burgundy dark:bg-burgundy/25 dark:text-[#E89BA5]">
                  {selectedChallenge.problemCode}
                </span>
                <h2 className="font-serif text-xl font-bold text-slate-900 dark:text-[#FAF6F3]">
                  {selectedChallenge.title}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  {selectedChallenge.points} Points
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-500 bg-slate-100 dark:bg-[#1C0A0D]">
                  Level {selectedChallenge.level}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line font-sans">
              {selectedChallenge.description}
            </div>

            {/* Constraints */}
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-[#1C0A0D] border border-slate-200/80 dark:border-[#3D1418] space-y-1.5">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-burgundy dark:text-[#E89BA5] block">
                Constraints & Requirements
              </span>
              <div className="text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                {selectedChallenge.constraints}
              </div>
            </div>

            {/* Public Tests preview */}
            {selectedChallenge.publicTests && selectedChallenge.publicTests.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Public Test Preview ({selectedChallenge.publicTests.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedChallenge.publicTests.map((t, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg border border-slate-200/70 dark:border-[#3D1418] bg-white dark:bg-[#150709] text-xs font-mono space-y-1"
                    >
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">
                        {t.name}
                      </span>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Input: <code className="text-burgundy dark:text-[#E89BA5]">{t.inputSummary}</code>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        Expected: {t.expectedSummary}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Monaco Playground & Execution Console */}
          <div className="min-h-[500px]">
            <QiskitPlayground
              challenge={selectedChallenge}
              userEmail={sessionUser?.email || ''}
              onSubmissionSuccess={() => {
                refreshChallenges();
              }}
            />
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. LEADERBOARD MODAL / DRAWER
         ───────────────────────────────────────────────────────────── */}
      {isLeaderboardOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-[#3D1418] flex items-center justify-between bg-slate-50 dark:bg-[#1C0A0D]">
              <div className="flex items-center gap-2.5">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-[#FAF6F3]">
                  Qiskit Challenge Leaderboard
                </h3>
              </div>
              <button
                onClick={() => setIsLeaderboardOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2A0E12] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 font-sans">
              {isLoadingLeaderboard ? (
                <div className="py-12 text-center text-slate-400 text-xs font-mono">
                  Loading live participant rankings...
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs font-mono">
                  No completed submissions recorded yet. Be the first to solve a problem!
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-12 px-3 py-1.5 font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-[#3D1418]">
                    <div className="col-span-2">Rank</div>
                    <div className="col-span-6">Participant</div>
                    <div className="col-span-2 text-center">Solved</div>
                    <div className="col-span-2 text-right">Score</div>
                  </div>

                  {leaderboard.map((entry) => (
                    <div
                      key={entry.rank}
                      className={clsx(
                        'grid grid-cols-12 items-center px-3 py-2.5 rounded-lg text-xs font-mono transition-colors',
                        entry.rank === 1
                          ? 'bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50'
                          : entry.rank <= 3
                          ? 'bg-slate-50 dark:bg-[#1C0A0D]'
                          : 'hover:bg-slate-50 dark:hover:bg-[#1C0A0D]'
                      )}
                    >
                      <div className="col-span-2 flex items-center gap-1.5 font-bold">
                        {entry.rank === 1 && <span className="text-amber-500">🥇</span>}
                        {entry.rank === 2 && <span className="text-slate-400">🥈</span>}
                        {entry.rank === 3 && <span className="text-amber-700">🥉</span>}
                        <span>#{entry.rank}</span>
                      </div>

                      <div className="col-span-6 font-semibold text-slate-800 dark:text-slate-200 truncate pr-2">
                        {entry.displayName}
                      </div>

                      <div className="col-span-2 text-center text-slate-500">
                        {entry.solvedCount}/9
                      </div>

                      <div className="col-span-2 text-right font-bold text-burgundy dark:text-[#E89BA5]">
                        {entry.totalScore} pts
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-200 dark:border-[#3D1418] bg-slate-50 dark:bg-[#1C0A0D] flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Ranked by Score DESC, then earliest submission time.</span>
              <button
                onClick={fetchLeaderboard}
                className="text-burgundy dark:text-[#E89BA5] hover:underline cursor-pointer"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
