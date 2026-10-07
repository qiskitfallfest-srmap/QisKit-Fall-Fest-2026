'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthGate } from '@/components/learning/AuthGate';
import { CertificateModal } from '@/components/learning/CertificateModal';
import { CURRICULUM_SESSIONS } from '@/data/learning/curriculum';
import { DAILY_COMPETITIONS } from '@/data/learning/competitions';
import {
  Award,
  Send,
  CheckCircle2,
  ExternalLink,
  PlayCircle,
  Clock,
  BookOpen,
  ArrowRight,
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
      const res = await fetch('/api/learning/progress');
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
      const res = await fetch('/api/learning/competition-submit');
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
    CURRICULUM_SESSIONS.find((s) => {
      const p = progress[s.id];
      return !p || !p.videoCompleted || !p.quizPassed;
    }) || CURRICULUM_SESSIONS[0];

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
          {CURRICULUM_SESSIONS.map((s) => {
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
