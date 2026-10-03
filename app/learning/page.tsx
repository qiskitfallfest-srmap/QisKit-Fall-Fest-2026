'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AuthGate } from '@/components/learning/AuthGate';
import { CertificateModal } from '@/components/learning/CertificateModal';
import { CURRICULUM_SESSIONS } from '@/data/learning/curriculum';
import { DAILY_COMPETITIONS } from '@/data/learning/competitions';
import { SESSION_QUIZZES } from '@/data/learning/quizzes';
import {
  Award,
  Send,
  CheckCircle2,
  ExternalLink,
  PlayCircle,
  FileText,
  Clock,
  Lock,
} from 'lucide-react';

function LearningDashboardContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('session');
  const challengeDay = searchParams?.get('challenge');
  const quizRequested = searchParams?.get('quiz') === 'true';

  const [competitions, setCompetitions] = useState<Record<string, any>>({});
  const [competitionUrls, setCompetitionUrls] = useState<Record<string, string>>({});
  const [isSubmittingComp, setIsSubmittingComp] = useState<Record<string, boolean>>({});
  const [compSuccessMsg, setCompSuccessMsg] = useState<Record<string, string>>({});

  // Session progress & quiz state
  const [progress, setProgress] = useState<Record<string, any>>({});
  const [isMarkingVideo, setIsMarkingVideo] = useState(false);

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

  async function handleMarkVideoCompleted(currentSessionId: string) {
    try {
      setIsMarkingVideo(true);
      const res = await fetch('/api/learning/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: currentSessionId,
          action: 'mark_video',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setProgress((prev) => ({
          ...prev,
          [currentSessionId]: {
            ...prev[currentSessionId],
            videoCompleted: true,
          },
        }));
      }
    } catch (e) {
      console.error('Error marking video completed:', e);
    } finally {
      setIsMarkingVideo(false);
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
        setCompSuccessMsg((prev) => ({ ...prev, [type]: 'Submitted successfully!' }));
      }
    } catch (err) {
      console.error('Error submitting competition:', err);
    } finally {
      setIsSubmittingComp((prev) => ({ ...prev, [type]: false }));
    }
  }

  // 1. If viewing a session
  if (sessionId) {
    const session = CURRICULUM_SESSIONS.find((s) => s.id === sessionId);
    if (!session) {
      return <div className="p-12 text-center text-slate-500">Session not found.</div>;
    }

    const sessionProgress = progress[sessionId] || {
      videoCompleted: false,
      quizPassed: false,
      quizScore: 0,
    };
    const sessionQuiz = SESSION_QUIZZES[sessionId];

    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-8 animate-in fade-in duration-500 font-sans">
        {/* Session Header */}
        <div className="mb-4 sm:mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-mono px-2.5 py-0.5 rounded-full bg-burgundy/10 text-burgundy font-semibold text-[11px] uppercase tracking-[0.2em]">
                Session {session.sessionNumber} · Day {session.day}
              </span>
              <span className="font-mono text-xs text-slate-500 flex items-center gap-1 font-medium tracking-wider">
                <Clock className="w-3.5 h-3.5" />
                {session.duration}
              </span>
            </div>
            <h1 className="font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#181313] dark:text-[#FAF6F3] tracking-tight">
              {session.title}
            </h1>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {sessionProgress.quizPassed ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4" /> Passed ({sessionProgress.quizScore}%)
              </span>
            ) : (
              <Link
                href={`/learning/session/${session.id}/quiz`}
                className="w-full sm:w-auto px-4 py-2 bg-burgundy text-white text-xs font-semibold rounded-lg hover:bg-burgundy-deep transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer font-sans"
              >
                <Award className="w-4 h-4" />
                {sessionProgress.videoCompleted ? 'Take Concept Quiz' : 'Concept Quiz'}
              </Link>
            )}
          </div>
        </div>

        {/* Video Player */}
        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-lg mb-8 relative border border-slate-200 dark:border-[#3D1418]">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${session.youtubeId}?rel=0`}
            title={session.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          />
        </div>

        {/* Action bar under video */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-xl mb-8">
          <div className="flex items-center gap-2">
            {sessionProgress.videoCompleted ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-4 h-4" /> Video Marked Complete
              </span>
            ) : (
              <button
                onClick={() => handleMarkVideoCompleted(session.id)}
                disabled={isMarkingVideo}
                className="px-3.5 py-1.5 bg-slate-900 dark:bg-burgundy text-white text-xs font-semibold rounded-lg hover:bg-slate-800 dark:hover:bg-burgundy-deep transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isMarkingVideo ? 'Saving...' : 'Mark Video as Watched'}
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {session.lectureNotesUrl && (
              <a
                href={session.lectureNotesUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-burgundy dark:hover:text-[#E89BA5] flex items-center gap-1 transition-colors"
              >
                <FileText className="w-4 h-4" /> Notes & Tutorials
              </a>
            )}
            {session.slidesUrl && (
              <a
                href={session.slidesUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-burgundy dark:hover:text-[#E89BA5] flex items-center gap-1 transition-colors"
              >
                <ExternalLink className="w-4 h-4" /> Slides
              </a>
            )}

          </div>
        </div>

        {/* Description & Key Takeaways */}
        <div className="space-y-6 font-sans">
          <div className="bg-white dark:bg-[#150709] rounded-2xl border border-slate-200 dark:border-[#3D1418] p-6 sm:p-8 space-y-4">
            <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#181313] dark:text-[#FAF6F3]">Lecture Overview</h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{session.description}</p>

            <div className="bg-[#FAF7F4] dark:bg-[#1C0A0D] rounded-xl p-5 border border-slate-200/80 dark:border-[#3D1418]">
              <h3 className="font-mono font-bold text-burgundy dark:text-[#E89BA5] text-xs uppercase tracking-[0.18em] mb-2.5">
                Key Learning Points
              </h3>
              <ul className="space-y-1.5">
                {session.learnPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                    <span className="text-burgundy font-bold mt-0.5">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Speaker Bio */}
          <div className="bg-white dark:bg-[#150709] rounded-2xl border border-slate-200 dark:border-[#3D1418] p-6 sm:p-8">
            <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#181313] dark:text-[#FAF6F3] mb-4">Speaker Profile</h2>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-[#250D11] border border-slate-200 dark:border-[#3D1418] shrink-0 flex items-center justify-center font-serif font-bold text-burgundy text-xl">
                {session.speaker.name.charAt(0)}
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-bold text-[#181313] dark:text-[#FAF6F3]">{session.speaker.name}</h3>
                <p className="font-mono text-xs font-semibold uppercase tracking-wider text-burgundy dark:text-[#E89BA5]">{session.speaker.role}</p>
                <p className="font-sans text-xs text-slate-500">{session.speaker.institution}</p>
                <p className="font-sans text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-2">{session.speaker.bio}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    );
  }

  // 2. If viewing a challenge
  if (challengeDay) {
    const day = Number(challengeDay);
    const challenge = DAILY_COMPETITIONS[day];

    if (!challenge) {
      return <div className="p-12 text-center font-mono text-xs text-slate-500 uppercase tracking-wider">No challenge available for this day.</div>;
    }

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8 animate-in fade-in duration-500 font-sans">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 sm:p-3 bg-burgundy/10 rounded-xl shrink-0">
            <Award className="w-7 h-7 sm:w-8 sm:h-8 text-burgundy" />
          </div>
          <div className="min-w-0">
            <div className="font-mono text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] text-burgundy dark:text-[#E89BA5] mb-0.5">
              QISKIT FALL FEST COMPETITION
            </div>
            <h1 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-[#181313] dark:text-[#FAF6F3] tracking-tight">
              Daily Challenge: Day {day}
            </h1>
            <p className="font-sans text-slate-500 text-xs sm:text-sm mt-0.5">{challenge.subtitle}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-2xl shadow-xs p-4 sm:p-8 space-y-6">
          <div>
            <h2 className="font-serif text-lg sm:text-2xl font-bold tracking-tight text-[#181313] dark:text-[#FAF6F3] mb-2">{challenge.title}</h2>
            <p className="font-sans text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">{challenge.description}</p>
          </div>

          <div className="bg-[#FAF7F4] dark:bg-[#1C0A0D] rounded-xl p-4 sm:p-5 border border-slate-100 dark:border-[#3D1418]">
            <h3 className="font-mono font-bold text-burgundy dark:text-[#E89BA5] text-xs uppercase tracking-[0.18em] mb-2.5">
              Submission Guidelines
            </h3>
            <ul className="space-y-1.5 font-sans">
              {challenge.guidelines.map((g, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <span className="text-burgundy font-bold">•</span>
                  <span>{g}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-[#3D1418]">
              <span className="font-mono text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Submission Deadline
              </span>
              <p className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{challenge.submissionDeadline}</p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-[#3D1418]">
            <form onSubmit={(e) => handleCompetitionSubmit(e, challenge.type)} className="space-y-3">
              <div>
                <label className="block font-mono text-[11px] font-bold text-slate-900 dark:text-slate-100 mb-1.5 uppercase tracking-wider">
                  Submit Your Work Link (URL)
                </label>
                <div className="flex flex-col sm:flex-row gap-2.5">
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
                    className="flex-1 px-3.5 py-2.5 text-base sm:text-xs font-mono border border-slate-300 dark:border-[#3D1418] rounded-xl focus:outline-none focus:ring-1 focus:ring-burgundy focus:border-burgundy dark:bg-[#1C0A0D]"
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingComp[challenge.type]}
                    className="w-full sm:w-auto px-5 py-2.5 bg-burgundy hover:bg-burgundy-deep text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer font-sans"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {competitions[challenge.type] ? 'Update Submission' : 'Submit Now'}
                  </button>
                </div>
              </div>

              {compSuccessMsg[challenge.type] && (
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 flex items-center gap-2 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {compSuccessMsg[challenge.type]}
                </div>
              )}

              {competitions[challenge.type] && (
                <div className="p-3 rounded-lg bg-[#FAF7F4] dark:bg-[#1C0A0D] border border-slate-200 dark:border-[#3D1418] text-xs flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Recorded Submission Link:</span>
                  <a
                    href={competitions[challenge.type].submission_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs font-semibold text-burgundy hover:underline flex items-center gap-1"
                  >
                    View Submission <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    );
  }

  // 3. Default state (Welcome / Congratulations & Certificate Trigger)
  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] px-4 text-center animate-in fade-in duration-500 font-sans">
      <div className="w-20 h-20 bg-burgundy/10 text-burgundy rounded-full flex items-center justify-center mb-5 ring-8 ring-burgundy/5">
        <PlayCircle className="w-10 h-10" />
      </div>
      <div className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.24em] uppercase font-semibold text-burgundy dark:text-[#E89BA5] mb-2">
        <span>CURRICULUM PORTAL</span>
      </div>
      <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#181313] dark:text-[#FAF6F3] tracking-tight mb-3">
        Welcome to Qiskit Fall Fest
      </h1>
      <p className="font-serif italic text-burgundy dark:text-[#E89BA5] text-lg sm:text-xl mb-4">
        A Decade of Quantum on Cloud · Masterclass Series
      </p>
      <p className="font-sans text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-lg mb-8 leading-relaxed">
        Select a session or daily challenge from the sidebar to begin your quantum computing journey. Complete all modules sequentially to earn your certificate!
      </p>

      {/* Official Certificate Claim & Status Button */}
      <button
        onClick={() => setIsCertModalOpen(true)}
        className="px-6 py-3.5 bg-burgundy text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-burgundy-deep transition-all shadow-sm flex items-center gap-2 cursor-pointer group font-sans"
      >
        <Award className="w-4 h-4 text-amber-300 transition-transform group-hover:scale-110" />
        Official Masterclass Certificate
      </button>

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
      <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading learning environment...</div>}>
        <LearningDashboardContent />
      </Suspense>
    </AuthGate>
  );
}
