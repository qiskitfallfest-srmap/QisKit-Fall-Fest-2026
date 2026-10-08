'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { AuthGate } from '@/components/learning/AuthGate';
import { QiskitPlayground } from '@/components/learning/QiskitPlayground';
import { QISKIT_CHALLENGES, CodingChallenge } from '@/data/qiskit/challenges';
import {
  Clock,
  Trophy,
  CheckCircle2,
  Circle,
  Play,
  Send,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  List,
  FileText,
  History,
  Tag,
  Code2,
  X,
  AlertCircle,
  ExternalLink,
  Award,
  Sparkles,
  ArrowLeft,
  Loader2,
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

interface UserSubmissionSummary {
  id: string;
  challengeId: string;
  status: string;
  score: number;
  maxScore: number;
  passedTests: number;
  totalTests: number;
  executionTimeMs: number;
  submittedAt: string;
  errorMessage?: string | null;
}

export default function QiskitChallengePage() {
  return (
    <AuthGate>
      <QiskitChallengeWorkspace />
    </AuthGate>
  );
}

function QiskitChallengeWorkspace() {
  const [selectedProblemId, setSelectedProblemId] = useState<string>('P1');
  const [challenges, setChallenges] = useState<any[]>(QISKIT_CHALLENGES);
  const [sessionUser, setSessionUser] = useState<{ email: string; fullName: string } | null>(null);
  const [competitionConfig, setCompetitionConfig] = useState<any>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('--:--:--');
  
  // UI Tabs & Modals
  const [leftTab, setLeftTab] = useState<'description' | 'submissions'>('description');
  const [isProblemListOpen, setIsProblemListOpen] = useState<boolean>(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState<boolean>(false);

  // Submissions for current problem
  const [problemSubmissions, setProblemSubmissions] = useState<UserSubmissionSummary[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState<boolean>(false);

  // Playground execution state
  const [engineState, setEngineState] = useState<{ isRunning: boolean; isSubmitting: boolean }>({
    isRunning: false,
    isSubmitting: false,
  });

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

  // 3. Fetch submissions for selected problem
  const loadSubmissions = useCallback(async (pId: string) => {
    setIsLoadingSubmissions(true);
    try {
      const res = await fetch(`/api/qiskit/submissions?problemId=${pId}`, { cache: 'no-store' });
      const data = await res.json();
      if (data?.success && Array.isArray(data.submissions)) {
        setProblemSubmissions(data.submissions);
      }
    } catch (e) {
      console.error('Failed to load problem submissions:', e);
    } finally {
      setIsLoadingSubmissions(false);
    }
  }, []);

  useEffect(() => {
    loadSubmissions(selectedProblemId);
  }, [selectedProblemId, loadSubmissions]);

  // 4. Synchronize engine run/submit state from QiskitPlayground
  useEffect(() => {
    const handleStateChange = (e: any) => {
      if (e.detail) {
        setEngineState(e.detail);
      }
    };
    window.addEventListener('qiskit:state', handleStateChange);
    return () => window.removeEventListener('qiskit:state', handleStateChange);
  }, []);

  // 5. Server-authoritative timer countdown
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

  // 6. Fetch Leaderboard
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

  const currentIndex = challenges.findIndex((c) => c.id === selectedProblemId);
  const prevProblem = currentIndex > 0 ? challenges[currentIndex - 1] : null;
  const nextProblem = currentIndex < challenges.length - 1 ? challenges[currentIndex + 1] : null;

  const totalEarnedPoints = challenges.reduce(
    (acc, curr) => acc + (curr.userBestScore || 0),
    0
  );
  const solvedCount = challenges.filter((c) => c.userState === 'solved').length;

  // Global action triggers
  const triggerRun = () => {
    window.dispatchEvent(new CustomEvent('qiskit:run'));
  };

  const triggerSubmit = () => {
    window.dispatchEvent(new CustomEvent('qiskit:submit'));
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0D0406] text-slate-900 dark:text-[#FAF6F3] font-sans flex flex-col">
      {/* ─────────────────────────────────────────────────────────────
          1. LEETCODE TOP NAVIGATION BAR
         ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white dark:bg-[#160608] border-b border-slate-200 dark:border-[#3D1418] px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 shadow-xs">
        {/* Left: Hub Link, Problem List Modal Button, Prev/Next Navigation */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link
            href="/learning"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-burgundy dark:hover:text-[#E89BA5] transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden md:inline">Learning Hub</span>
          </Link>

          <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>

          {/* Problem List Drawer Button */}
          <button
            onClick={() => setIsProblemListOpen(true)}
            type="button"
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-[#3D1418] bg-slate-50 dark:bg-[#1C0A0D] hover:bg-slate-100 dark:hover:bg-[#250D11] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            title="Open Problem Set Catalog"
          >
            <List className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Problem List</span>
            <span className="font-mono text-[10px] text-slate-400">({currentIndex + 1}/9)</span>
          </button>

          {/* Prev / Next Problem Switchers */}
          <div className="flex items-center bg-slate-100 dark:bg-[#1C0A0D] border border-slate-200 dark:border-[#3D1418] rounded-lg p-0.5 shrink-0">
            <button
              onClick={() => prevProblem && setSelectedProblemId(prevProblem.id)}
              disabled={!prevProblem}
              type="button"
              title={prevProblem ? `Previous: ${prevProblem.title}` : 'First problem'}
              className="p-1 rounded text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-[#250D11] disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => nextProblem && setSelectedProblemId(nextProblem.id)}
              disabled={!nextProblem}
              type="button"
              title={nextProblem ? `Next: ${nextProblem.title}` : 'Last problem'}
              className="p-1 rounded text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-[#250D11] disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Active Problem Title */}
          <div className="flex items-center gap-2 truncate">
            <span className="font-mono font-bold text-xs text-burgundy dark:text-[#E89BA5] shrink-0">
              {selectedChallenge.problemCode}.
            </span>
            <span className="font-semibold text-xs text-slate-800 dark:text-slate-100 truncate">
              {selectedChallenge.title}
            </span>
          </div>
        </div>

        {/* Center: Action Buttons (Run & Submit) */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={triggerRun}
            disabled={engineState.isRunning || engineState.isSubmitting}
            type="button"
            className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-[#3D1418] bg-white dark:bg-[#1C0A0D] hover:bg-slate-50 dark:hover:bg-[#250D11] text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {engineState.isRunning ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current text-slate-500" />
            )}
            <span>Run Code</span>
          </button>

          <button
            onClick={triggerSubmit}
            disabled={engineState.isRunning || engineState.isSubmitting}
            type="button"
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {engineState.isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>Submit</span>
          </button>
        </div>

        {/* Right: Timer, Score, and Leaderboard Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Server-authoritative timer */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-[#1C0A0D] border border-slate-200 dark:border-[#3D1418]">
            <Clock className="w-3.5 h-3.5 text-burgundy dark:text-[#E89BA5]" />
            <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
              {timeRemaining}
            </span>
          </div>

          {/* User Score Pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-burgundy/10 dark:bg-burgundy/25 border border-burgundy/30">
            <Award className="w-3.5 h-3.5 text-burgundy dark:text-[#E89BA5]" />
            <span className="font-mono text-xs font-bold text-burgundy dark:text-[#FAF6F3]">
              {totalEarnedPoints}/100 pts ({solvedCount}/9)
            </span>
          </div>

          {/* Leaderboard Button */}
          <button
            onClick={() => {
              setIsLeaderboardOpen(true);
              fetchLeaderboard();
            }}
            type="button"
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-[#3D1418] hover:bg-slate-50 dark:hover:bg-[#1C0A0D] text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Leaderboard</span>
          </button>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN LEETCODE DUAL-PANE SPLIT WORKSPACE
         ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-[1920px] mx-auto w-full">
        {/* ───────────────────────────────────────────────────────────
            LEFT PANE: PROBLEM STATEMENT & SUBMISSIONS TABS
           ─────────────────────────────────────────────────────────── */}
        <div className="flex flex-col bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-xl overflow-hidden shadow-xs h-full min-h-[500px]">
          {/* Left Pane Navigation Tabs */}
          <div className="flex items-center px-4 bg-slate-50 dark:bg-[#1C0A0D] border-b border-slate-200 dark:border-[#3D1418]">
            <button
              onClick={() => setLeftTab('description')}
              type="button"
              className={clsx(
                'py-2.5 px-3 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer',
                leftTab === 'description'
                  ? 'border-burgundy dark:border-[#E89BA5] text-burgundy dark:text-[#FAF6F3] font-semibold'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              )}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Description</span>
            </button>

            <button
              onClick={() => {
                setLeftTab('submissions');
                loadSubmissions(selectedProblemId);
              }}
              type="button"
              className={clsx(
                'py-2.5 px-3 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer',
                leftTab === 'submissions'
                  ? 'border-burgundy dark:border-[#E89BA5] text-burgundy dark:text-[#FAF6F3] font-semibold'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              )}
            >
              <History className="w-3.5 h-3.5" />
              <span>Submissions</span>
              {problemSubmissions.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-slate-200 dark:bg-[#2A0E12] text-slate-700 dark:text-slate-300">
                  {problemSubmissions.length}
                </span>
              )}
            </button>
          </div>

          {/* Left Pane Content Body */}
          <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-6">
            {leftTab === 'description' ? (
              <div className="space-y-6">
                {/* Title & Metadata Badges */}
                <div className="space-y-3 pb-4 border-b border-slate-100 dark:border-[#3D1418]">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-burgundy/10 text-burgundy dark:bg-burgundy/25 dark:text-[#E89BA5]">
                      {selectedChallenge.problemCode}
                    </span>
                    <h1 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#FAF6F3] tracking-tight">
                      {selectedChallenge.title}
                    </h1>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Difficulty Badge */}
                    <span
                      className={clsx(
                        'px-2.5 py-0.5 rounded-full text-xs font-semibold border',
                        selectedChallenge.difficulty === 'Easy'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                          : selectedChallenge.difficulty === 'Medium'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                      )}
                    >
                      {selectedChallenge.difficulty}
                    </span>

                    {/* Points Badge */}
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-100 dark:bg-[#1C0A0D] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#3D1418]">
                      {selectedChallenge.points} Points
                    </span>

                    {/* Level Label */}
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#18080B]">
                      Level {selectedChallenge.level} · {selectedChallenge.levelLabel}
                    </span>
                  </div>

                  {/* Topic Tags */}
                  {selectedChallenge.tags && selectedChallenge.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <Tag className="w-3 h-3 text-slate-400 shrink-0" />
                      {selectedChallenge.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-[#1C0A0D] text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-[#3D1418]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Problem Description Statement */}
                <div className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                  <div className="whitespace-pre-line leading-relaxed">
                    {selectedChallenge.description}
                  </div>
                </div>

                {/* Structured LeetCode Examples */}
                {selectedChallenge.examples && selectedChallenge.examples.length > 0 && (
                  <div className="space-y-4 pt-2">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      Examples
                    </span>

                    <div className="space-y-3">
                      {selectedChallenge.examples.map((ex) => (
                        <div
                          key={ex.id}
                          className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#1C0A0D] border border-slate-200 dark:border-[#3D1418] text-xs font-mono space-y-1.5"
                        >
                          <div className="font-bold text-slate-800 dark:text-slate-200 font-sans text-xs">
                            Example {ex.id}:
                          </div>
                          <div className="space-y-1 bg-white dark:bg-[#150709] p-2.5 rounded-lg border border-slate-200/70 dark:border-[#3D1418]">
                            <div>
                              <span className="font-semibold text-slate-500">Input: </span>
                              <code className="text-burgundy dark:text-[#E89BA5] font-bold">
                                {ex.input}
                              </code>
                            </div>
                            <div>
                              <span className="font-semibold text-slate-500">Output: </span>
                              <code className="text-emerald-600 dark:text-emerald-400 font-bold">
                                {ex.output}
                              </code>
                            </div>
                            {ex.explanation && (
                              <div className="pt-1 text-[11px] text-slate-600 dark:text-slate-400 font-sans leading-relaxed border-t border-slate-100 dark:border-[#250D11] mt-1">
                                <span className="font-semibold text-slate-500">Explanation: </span>
                                {ex.explanation}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Constraints Section */}
                {selectedChallenge.constraints && selectedChallenge.constraints.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      Constraints & Requirements
                    </span>
                    <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-700 dark:text-slate-300 font-mono bg-slate-50 dark:bg-[#1C0A0D] p-3.5 rounded-xl border border-slate-200 dark:border-[#3D1418]">
                      {selectedChallenge.constraints.map((c, i) => (
                        <li key={i} className="leading-relaxed">
                          <span className="text-slate-800 dark:text-slate-200">{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Function Signature Callout */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#1C0A0D] border border-slate-200 dark:border-[#3D1418] space-y-1.5">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300 text-xs">
                    <Code2 className="w-3.5 h-3.5 text-burgundy dark:text-[#E89BA5]" />
                    <span>Evaluation Protocol</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    The automated judge tests your required function signature: <code className="font-mono text-burgundy dark:text-[#E89BA5] font-bold">{selectedChallenge.functionName}</code>. Do not rename the function. Return circuits or values matching the specification.
                  </p>
                </div>
              </div>
            ) : (
              /* Submissions History Tab */
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#3D1418]">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-500">
                    Your Submission Records ({problemSubmissions.length})
                  </span>
                  <button
                    onClick={() => loadSubmissions(selectedProblemId)}
                    type="button"
                    className="text-xs text-burgundy dark:text-[#E89BA5] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Refresh</span>
                  </button>
                </div>

                {isLoadingSubmissions ? (
                  <div className="py-12 text-center text-slate-400 text-xs font-mono">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-burgundy" />
                    Loading submission history...
                  </div>
                ) : problemSubmissions.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs font-mono space-y-2">
                    <p>No submissions recorded for this problem yet.</p>
                    <p className="text-[11px] text-slate-500">
                      Write your code in the editor, click <strong>Run Code</strong> to test against public cases, and click <strong>Submit</strong> to earn official points.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {problemSubmissions.map((sub) => {
                      const isFullScore = sub.score === selectedChallenge.points;
                      const isPartial = sub.score > 0 && !isFullScore;

                      return (
                        <div
                          key={sub.id}
                          className="p-3.5 rounded-xl border border-slate-200 dark:border-[#3D1418] bg-slate-50 dark:bg-[#1C0A0D] text-xs font-mono space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                className={clsx(
                                  'font-bold text-xs px-2 py-0.5 rounded',
                                  isFullScore
                                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                                    : isPartial
                                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                                    : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                                )}
                              >
                                {isFullScore ? 'Accepted' : isPartial ? 'Partial Score' : 'Wrong Answer'}
                              </span>
                              <span className="text-slate-400 text-[11px]">
                                {sub.executionTimeMs} ms
                              </span>
                            </div>

                            <span className="font-bold text-slate-900 dark:text-[#FAF6F3]">
                              {sub.score} / {sub.maxScore} pts
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-[#2A0E12]">
                            <span>
                              Passed {sub.passedTests} of {sub.totalTests} tests
                            </span>
                            <span>{new Date(sub.submittedAt).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────
            RIGHT PANE: MONACO CODE EDITOR & CONSOLE DRAWER
           ─────────────────────────────────────────────────────────── */}
        <div className="flex flex-col h-full min-h-[500px]">
          <QiskitPlayground
            challenge={selectedChallenge}
            userEmail={sessionUser?.email || ''}
            onSubmissionSuccess={() => {
              refreshChallenges();
              loadSubmissions(selectedProblemId);
            }}
          />
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. PROBLEM LIST CATALOG MODAL
         ───────────────────────────────────────────────────────────── */}
      {isProblemListOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-[#3D1418] flex items-center justify-between bg-slate-50 dark:bg-[#1C0A0D]">
              <div className="flex items-center gap-2.5">
                <List className="w-5 h-5 text-burgundy dark:text-[#E89BA5]" />
                <div>
                  <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-[#FAF6F3]">
                    Qiskit Problem Set (9 Problems)
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Score: {totalEarnedPoints}/100 pts ({solvedCount}/9 Solved)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsProblemListOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2A0E12] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 font-sans space-y-2">
              {challenges.map((prob) => {
                const isSelected = prob.id === selectedProblemId;
                const isSolved = prob.userState === 'solved';
                const isAttempted = prob.userState === 'attempted';

                return (
                  <button
                    key={prob.id}
                    onClick={() => {
                      setSelectedProblemId(prob.id);
                      setIsProblemListOpen(false);
                    }}
                    type="button"
                    className={clsx(
                      'w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between group cursor-pointer',
                      isSelected
                        ? 'bg-burgundy/10 dark:bg-burgundy/25 border-burgundy/50 shadow-xs'
                        : 'bg-white dark:bg-[#1C0A0D] border-slate-200 dark:border-[#3D1418] hover:bg-slate-50 dark:hover:bg-[#250D11]'
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {isSolved ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
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
                          Level {prob.level} · {prob.difficulty}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span
                        className={clsx(
                          'px-2 py-0.5 rounded text-[10px] font-mono font-bold',
                          isSolved
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                            : 'bg-slate-100 dark:bg-[#250D11] text-slate-600 dark:text-slate-400'
                        )}
                      >
                        {prob.userBestScore ? `${prob.userBestScore}/${prob.points}` : `${prob.points} pts`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. LEADERBOARD MODAL
         ───────────────────────────────────────────────────────────── */}
      {isLeaderboardOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
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

            {/* Body */}
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

            {/* Footer */}
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
