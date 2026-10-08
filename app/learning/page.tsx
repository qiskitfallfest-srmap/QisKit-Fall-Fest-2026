'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import clsx from 'clsx';
import { AuthGate } from '@/components/learning/AuthGate';
import { CertificateModal } from '@/components/learning/CertificateModal';
import { CURRICULUM_SESSIONS, ONLINE_PROGRAMME_SCHEDULE } from '@/data/learning/curriculum';
import { DAILY_COMPETITIONS } from '@/data/learning/competitions';
import { useCurriculumSessions } from '@/hooks/use-curriculum-sessions';
import {
  Award,
  Send,
  CheckCircle2,
  ExternalLink,
  PlayCircle,
  Clock,
  BookOpen,
  ArrowRight,
  Calendar,
  Sparkles,
  ChevronRight,
  Coffee,
  Users,
  Terminal,
} from 'lucide-react';

function LearningDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('session');
  const challengeDay = searchParams?.get('challenge');

  // If someone visits /learning?session=session-1, redirect directly to /learning/session/session-1
  useEffect(() => {
    if (sessionId) {
      router.replace(`/learning/session/${sessionId}`);
    }
  }, [sessionId, router]);

  const [competitions, setCompetitions] = useState<Record<string, any>>({});
  const [competitionUrls, setCompetitionUrls] = useState<Record<string, string>>({});
  const [isSubmittingComp, setIsSubmittingComp] = useState<Record<string, boolean>>({});
  const [compSuccessMsg, setCompSuccessMsg] = useState<Record<string, string>>({});

  // Session progress state
  const [progress, setProgress] = useState<Record<string, any>>({});

  // Dynamic curriculum sessions from admin/Redis
  const { sessions } = useCurriculumSessions();
  const curriculumList = sessions && sessions.length > 0 ? sessions : CURRICULUM_SESSIONS;

  // Schedule timetable tab state
  const [selectedScheduleDay, setSelectedScheduleDay] = useState<number>(1);
  const currentDayProgramme =
    ONLINE_PROGRAMME_SCHEDULE.find((d) => d.day === selectedScheduleDay) ||
    ONLINE_PROGRAMME_SCHEDULE[0];

  // Certificate Modal state
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [sessionUser, setSessionUser] = useState<{ email: string; fullName: string } | null>(null);

  useEffect(() => {
    fetchCompetitions();
    fetchProgress();
    fetchSessionUser();
  }, []);

  async function fetchSessionUser() {
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
      console.error('Error fetching session user:', e);
    }
  }

  async function fetchProgress() {
    try {
      const res = await fetch('/api/learning/progress', { cache: 'no-store' });
      const data = await res.json();
      if (data?.progress) {
        setProgress(data.progress);
      }
    } catch (e) {
      console.error('Error loading progress:', e);
    }
  }

  async function fetchCompetitions() {
    try {
      const res = await fetch('/api/learning/competition-submit', { cache: 'no-store' });
      const data = await res.json();
      if (data.submissions) {
        setCompetitions(data.submissions);
        const urls: Record<string, string> = {};
        Object.entries(data.submissions).forEach(([type, sub]: [string, any]) => {
          urls[type] = sub.submission_url || '';
        });
        setCompetitionUrls(urls);
      }
    } catch (e) {
      console.error('Error loading competitions:', e);
    }
  }

  async function handleCompetitionSubmit(e: React.FormEvent, type: 'reels' | 'poster' | 'essay') {
    e.preventDefault();
    const url = competitionUrls[type]?.trim();
    if (!url) return;

    setIsSubmittingComp((prev) => ({ ...prev, [type]: true }));
    setCompSuccessMsg((prev) => ({ ...prev, [type]: '' }));

    try {
      const res = await fetch('/api/learning/competition-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ competitionType: type, submissionUrl: url }),
      });

      const data = await res.json();
      if (data.success) {
        setCompetitions((prev) => ({ ...prev, [type]: data.submission }));
        setCompSuccessMsg((prev) => ({ ...prev, [type]: 'Submitted successfully' }));
      }
    } catch (err) {
      console.error('Error submitting competition:', err);
    } finally {
      setIsSubmittingComp((prev) => ({ ...prev, [type]: false }));
    }
  }

  // Calculate metrics
  const completedSessionsCount = Object.values(progress).filter((p: any) => p?.videoCompleted).length;
  const passedQuizzesCount = Object.values(progress).filter((p: any) => p?.quizPassed).length;
  const submittedCompsCount = Object.keys(competitions).length;

  // Next session to study
  const nextSession =
    curriculumList.find((s) => {
      const p = progress[s.id];
      return !p || !p.videoCompleted || !p.quizPassed;
    }) || curriculumList[0];

  // 1. If viewing a challenge
  if (challengeDay) {
    const day = Number(challengeDay);
    const challenge = DAILY_COMPETITIONS[day];

    if (!challenge) {
      return (
        <div className="p-8 text-center font-mono text-xs text-slate-500">
          No challenge available for Day {day}.
        </div>
      );
    }

    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 font-sans">
        <div className="bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-xl shadow-xs p-5 sm:p-7 space-y-6">
          <div className="border-b border-slate-100 dark:border-[#3D1418] pb-4">
            <span className="font-mono text-[10px] font-bold text-burgundy dark:text-[#E89BA5] uppercase tracking-wider block mb-1">
              Day {day} Daily Challenge
            </span>
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#181313] dark:text-[#FAF6F3] tracking-tight">
              {challenge.title}
            </h1>
            <p className="font-sans text-slate-600 dark:text-slate-300 text-xs sm:text-sm mt-1">
              {challenge.description}
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-[#1C0A0D] rounded-lg p-4 border border-slate-200/80 dark:border-[#3D1418] space-y-3">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-burgundy dark:text-[#E89BA5] block">
              Guidelines
            </span>
            <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
              {challenge.guidelines.map((g, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-burgundy dark:bg-[#E89BA5] mt-1.5 shrink-0" />
                  <span>{g}</span>
                </li>
              ))}
            </ul>
            <div className="pt-2 border-t border-slate-200/60 dark:border-[#3D1418] flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Deadline:</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-[#FAF6F3]">
                {challenge.submissionDeadline}
              </span>
            </div>
          </div>

          <div>
            <form onSubmit={(e) => handleCompetitionSubmit(e, challenge.type)} className="space-y-3">
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                Work URL (Public Link)
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  value={competitionUrls[challenge.type] || ''}
                  onChange={(e) =>
                    setCompetitionUrls((prev) => ({
                      ...prev,
                      [challenge.type]: e.target.value,
                    }))
                  }
                  placeholder={challenge.urlPlaceholder}
                  required
                  className="flex-1 px-3 py-2 text-xs font-mono border border-slate-300 dark:border-[#3D1418] rounded-lg bg-white dark:bg-[#1C0A0D] text-slate-900 dark:text-[#FAF6F3] focus:outline-none focus:ring-1 focus:ring-burgundy"
                />
                <button
                  type="submit"
                  disabled={isSubmittingComp[challenge.type]}
                  className="px-4 py-2 bg-burgundy hover:bg-burgundy-deep text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  {competitions[challenge.type] ? 'Update Link' : 'Submit'}
                </button>
              </div>

              {compSuccessMsg[challenge.type] && (
                <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {compSuccessMsg[challenge.type]}
                </div>
              )}

              {competitions[challenge.type] && (
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#1C0A0D] border border-slate-200 dark:border-[#3D1418] text-xs flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Recorded Submission:</span>
                  <a
                    href={competitions[challenge.type].submission_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-burgundy dark:text-[#E89BA5] font-semibold hover:underline flex items-center gap-1 truncate max-w-xs"
                  >
                    {competitions[challenge.type].submission_url}
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    );
  }

  // 2. Default state: Clean, high-density dashboard
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 font-sans space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#3D1418]">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-[#FAF6F3] tracking-tight">
            Learning Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {sessionUser?.fullName ? `Welcome back, ${sessionUser.fullName.split(' ')[0]}.` : 'Complete sessions sequentially.'}
          </p>
        </div>

        <button
          onClick={() => setIsCertModalOpen(true)}
          className="px-4 py-2 bg-burgundy text-white hover:bg-burgundy-deep text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Award className="w-4 h-4" />
          <span>Certificate Status</span>
        </button>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Lectures</span>
            <BookOpen className="w-4 h-4 text-burgundy dark:text-[#E89BA5]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-serif text-2xl font-bold text-slate-900 dark:text-[#FAF6F3]">
              {completedSessionsCount}
            </span>
            <span className="text-xs text-slate-400">/ 6</span>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Quizzes</span>
            <Award className="w-4 h-4 text-burgundy dark:text-[#E89BA5]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-serif text-2xl font-bold text-slate-900 dark:text-[#FAF6F3]">
              {passedQuizzesCount}
            </span>
            <span className="text-xs text-slate-400">/ 6</span>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Challenges</span>
            <CheckCircle2 className="w-4 h-4 text-burgundy dark:text-[#E89BA5]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-serif text-2xl font-bold text-slate-900 dark:text-[#FAF6F3]">
              {submittedCompsCount}
            </span>
            <span className="text-xs text-slate-400">/ 3</span>
          </div>
        </div>
      </div>

      {/* Qiskit Coding Challenge Feature Card */}
      <div className="p-5 bg-gradient-to-r from-burgundy/10 via-burgundy/5 to-transparent dark:from-burgundy/25 dark:via-burgundy/10 dark:to-transparent border border-burgundy/30 dark:border-burgundy/40 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold text-burgundy dark:text-[#E89BA5] uppercase tracking-wider px-2 py-0.5 rounded bg-burgundy/10 dark:bg-burgundy/20">
              Official Evaluation
            </span>
            <span className="font-mono text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              9 Problems · 100 Points Total
            </span>
          </div>
          <h2 className="font-serif text-base sm:text-lg font-bold text-slate-900 dark:text-[#FAF6F3]">
            Qiskit Coding Challenge
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-sans max-w-xl">
            Solve quantum programming problems using Python and Qiskit. Run your code against public tests, pass hidden tests, and earn points on the live leaderboard.
          </p>
        </div>

        <Link
          href="/learning/qiskit-challenge"
          className="px-4 py-2.5 bg-burgundy text-white hover:bg-burgundy-deep text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shrink-0 shadow-sm"
        >
          <Terminal className="w-4 h-4" />
          <span>Enter Challenge</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Quick Resume Card */}
      {nextSession && (
        <div className="p-5 bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="font-mono text-[10px] font-bold text-burgundy dark:text-[#E89BA5] uppercase tracking-wider block">
              Up Next · Day {nextSession.day}
            </span>
            <h2 className="font-serif text-base sm:text-lg font-bold text-slate-900 dark:text-[#FAF6F3]">
              Session {nextSession.sessionNumber}: {nextSession.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
              {nextSession.duration} · {nextSession.speaker.name} ({nextSession.speaker.institution})
            </p>
          </div>

          <Link
            href={`/learning/session/${nextSession.id}`}
            className="px-4 py-2.5 bg-slate-900 dark:bg-burgundy text-white hover:bg-slate-800 dark:hover:bg-burgundy-deep text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shrink-0"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Open Session</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Curriculum Grid */}
      <div className="space-y-3">
        <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Curriculum Sessions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {curriculumList.map((s) => {
            const p = progress[s.id];
            const isDone = p?.videoCompleted && p?.quizPassed;

            return (
              <Link
                key={s.id}
                href={`/learning/session/${s.id}`}
                className="p-3.5 bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-lg hover:border-burgundy/40 dark:hover:border-[#E89BA5]/40 transition-colors flex items-start justify-between gap-2 group"
              >
                <div className="min-w-0">
                  <span className="font-mono text-[10px] font-bold text-burgundy dark:text-[#E89BA5] uppercase block">
                    Day {s.day} · Session {s.sessionNumber}
                  </span>
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-[#FAF6F3] group-hover:text-burgundy dark:group-hover:text-[#E89BA5] transition-colors truncate mt-0.5">
                    {s.title}
                  </h4>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    {s.duration}
                  </span>
                </div>
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <Clock className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0 mt-0.5" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Official 3-Day Programme Schedule (8–10 October 2026) */}
      <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-[#3D1418]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-burgundy dark:text-[#E89BA5]" />
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-[#FAF6F3]">
                Official 3-Day Programme Schedule
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              SRM AP Partner Plus · Qiskit Fall Fest 2026 Online Phase (8–10 October 2026)
            </p>
          </div>

          {/* Day Fast Switcher Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-[#1C0A0D] rounded-lg border border-slate-200 dark:border-[#3D1418] self-start sm:self-auto">
            {ONLINE_PROGRAMME_SCHEDULE.map((prog) => (
              <button
                key={prog.day}
                type="button"
                onClick={() => setSelectedScheduleDay(prog.day)}
                className={clsx(
                  'px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer',
                  selectedScheduleDay === prog.day
                    ? 'bg-white dark:bg-burgundy text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                )}
              >
                Day {prog.day} ({prog.weekday.slice(0, 3)})
              </button>
            ))}
          </div>
        </div>

        {/* Selected Day Programme Timetable */}
        {currentDayProgramme && (
          <div className="bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-xl overflow-hidden shadow-xs">
            <div className="px-4 py-3 bg-slate-50/80 dark:bg-[#1C0A0D]/80 border-b border-slate-200 dark:border-[#3D1418] flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-mono text-[10px] font-bold text-burgundy dark:text-[#E89BA5] uppercase tracking-wider block">
                  {currentDayProgramme.theme}
                </span>
                <span className="text-xs font-semibold text-slate-800 dark:text-[#FAF6F3]">
                  {currentDayProgramme.dateStr}
                </span>
              </div>
              <span className="font-mono text-xs font-medium text-slate-500 dark:text-slate-400 px-2.5 py-0.5 rounded-full bg-slate-200/60 dark:bg-[#2A0E12]">
                {currentDayProgramme.timeRange}
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-[#220B0F]">
              {currentDayProgramme.items.map((item, idx) => {
                const isSession = item.type === 'session';
                const isQuiz = item.type === 'quiz';
                const isCompetition = item.type === 'competition';
                const isBreak = item.type === 'break';
                const isInauguration = item.type === 'inauguration';
                const isCeremony = item.type === 'ceremony';

                return (
                  <div
                    key={idx}
                    className={clsx(
                      'p-3.5 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors',
                      isBreak
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20'
                        : isSession
                        ? 'hover:bg-slate-50/80 dark:hover:bg-[#1C0A0D]/60'
                        : 'hover:bg-slate-50/50 dark:hover:bg-[#1C0A0D]/40'
                    )}
                  >
                    {/* Time & Duration */}
                    <div className="flex md:flex-col items-center md:items-start justify-between md:justify-center gap-1 shrink-0 md:w-36">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-[#FAF6F3]">
                        {item.time}
                      </span>
                      <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        {item.duration}
                      </span>
                    </div>

                    {/* Details & Speaker Info */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {isInauguration && (
                          <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono text-[9px] font-bold uppercase tracking-wider border border-indigo-200/60 dark:border-indigo-900/60">
                            Inaugural Address
                          </span>
                        )}
                        {isSession && (
                          <span className="px-2 py-0.5 rounded bg-burgundy/10 text-burgundy dark:bg-burgundy/25 dark:text-[#E89BA5] font-mono text-[9px] font-bold uppercase tracking-wider border border-burgundy/20 dark:border-burgundy/40">
                            Lecture Session
                          </span>
                        )}
                        {isBreak && (
                          <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-mono text-[9px] font-bold uppercase tracking-wider border border-emerald-200 dark:border-emerald-900">
                            Midday Break
                          </span>
                        )}
                        {isQuiz && (
                          <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-mono text-[9px] font-bold uppercase tracking-wider border border-amber-200 dark:border-amber-900">
                            LMS Assessment
                          </span>
                        )}
                        {isCompetition && (
                          <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 font-mono text-[9px] font-bold uppercase tracking-wider border border-purple-200 dark:border-purple-900">
                            Daily Online Game
                          </span>
                        )}
                        {isCeremony && (
                          <span className="px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 font-mono text-[9px] font-bold uppercase tracking-wider border border-sky-200 dark:border-sky-900">
                            Ceremony & Release
                          </span>
                        )}
                        <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-[#FAF6F3]">
                          {item.title}
                        </h4>
                      </div>

                      {item.speaker && item.speaker !== '—' && (
                        <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {item.speaker}
                          </span>
                          {item.speakerRole && (
                            <>
                              <span className="text-slate-400">·</span>
                              <span className="text-slate-500 dark:text-slate-400">
                                {item.speakerRole}
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Quick Link */}
                    <div className="shrink-0 flex items-center gap-2 pt-1 md:pt-0">
                      {item.sessionId && (
                        <Link
                          href={`/learning/session/${item.sessionId}`}
                          className="px-3 py-1.5 rounded-lg bg-burgundy/10 text-burgundy dark:bg-burgundy/25 dark:text-[#E89BA5] hover:bg-burgundy hover:text-white dark:hover:bg-burgundy-deep text-xs font-semibold transition-colors flex items-center gap-1"
                        >
                          <span>Session Video</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}
                      {isQuiz && (
                        <Link
                          href={`/learning/session/${item.sessionId || 'session-1'}/quiz`}
                          className="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 hover:bg-amber-600 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1 border border-amber-200 dark:border-amber-900"
                        >
                          <Award className="w-3 h-3" />
                          <span>Concept Quiz</span>
                        </Link>
                      )}
                      {isCompetition && (
                        <Link
                          href={`/learning?challenge=${currentDayProgramme.day}`}
                          className="px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300 hover:bg-purple-600 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1 border border-purple-200 dark:border-purple-900"
                        >
                          <Send className="w-3 h-3" />
                          <span>Submit Work</span>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <CertificateModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        userEmail={sessionUser?.email || ''}
        userName={sessionUser?.fullName || sessionUser?.email || 'Candidate'}
      />
    </div>
  );
}

export default function LearningDashboardPage() {
  return (
    <AuthGate>
      <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading...</div>}>
        <LearningDashboardContent />
      </Suspense>
    </AuthGate>
  );
}
