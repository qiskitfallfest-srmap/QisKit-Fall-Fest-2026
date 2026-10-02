'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AuthGate } from '@/components/learning/AuthGate';
import { QuizModal } from '@/components/learning/QuizModal';
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

  const [competitions, setCompetitions] = useState<Record<string, any>>({});
  const [competitionUrls, setCompetitionUrls] = useState<Record<string, string>>({});
  const [isSubmittingComp, setIsSubmittingComp] = useState<Record<string, boolean>>({});
  const [compSuccessMsg, setCompSuccessMsg] = useState<Record<string, string>>({});

  // Session progress & quiz state
  const [progress, setProgress] = useState<Record<string, any>>({});
  const [isQuizOpen, setIsQuizOpen] = useState(false);
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
          videoCompleted: true,
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
      <div className="max-w-5xl mx-auto px-6 py-8 animate-in fade-in duration-500">
        {/* Session Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider">
                Session {session.sessionNumber} · Day {session.day}
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5" />
                {session.duration}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              {session.title}
            </h1>
          </div>
        </div>

        {/* Video Player */}
        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-lg mb-8 relative border border-slate-200">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${session.youtubeId}?rel=0`}
            title={session.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          />
        </div>

        {/* Action bar under video */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-xl mb-8">
          <div className="flex items-center gap-2">
            {sessionProgress.videoCompleted ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                <CheckCircle2 className="w-4 h-4" /> Video Marked Complete
              </span>
            ) : (
              <button
                onClick={() => handleMarkVideoCompleted(session.id)}
                disabled={isMarkingVideo}
                className="px-3.5 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5 disabled:opacity-50"
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
                className="text-xs font-semibold text-slate-700 hover:text-burgundy flex items-center gap-1 transition-colors"
              >
                <FileText className="w-4 h-4" /> Notes & Tutorials
              </a>
            )}
            {session.slidesUrl && (
              <a
                href={session.slidesUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-slate-700 hover:text-burgundy flex items-center gap-1 transition-colors"
              >
                <ExternalLink className="w-4 h-4" /> Slides
              </a>
            )}
          </div>
        </div>

        {/* Description & Key Takeaways */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Lecture Overview</h2>
            <p className="text-slate-600 text-sm leading-relaxed">{session.description}</p>

            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/80">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2.5">
                Key Learning Points
              </h3>
              <ul className="space-y-1.5">
                {session.learnPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                    <span className="text-burgundy font-bold mt-0.5">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Speaker Bio */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-base font-bold text-slate-900 mb-4">Speaker Profile</h2>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center font-bold text-slate-600 text-lg">
                {session.speaker.name.charAt(0)}
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">{session.speaker.name}</h3>
                <p className="text-burgundy font-semibold text-xs">{session.speaker.role}</p>
                <p className="text-slate-500 text-xs">{session.speaker.institution}</p>
                <p className="text-slate-600 text-xs leading-relaxed pt-2">{session.speaker.bio}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quiz Modal */}
        {sessionQuiz && (
          <QuizModal
            isOpen={isQuizOpen}
            onClose={() => {
              setIsQuizOpen(false);
              fetchProgress();
            }}
            quiz={sessionQuiz}
            onPassed={() => fetchProgress()}
          />
        )}
      </div>
    );
  }

  // 2. If viewing a challenge
  if (challengeDay) {
    const day = Number(challengeDay);
    const challenge = DAILY_COMPETITIONS[day];

    if (!challenge) {
      return <div className="p-12 text-center text-slate-500">No challenge available for this day.</div>;
    }

    return (
      <div className="max-w-4xl mx-auto px-6 py-8 animate-in fade-in duration-500">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-burgundy/10 rounded-xl">
            <Award className="w-8 h-8 text-burgundy" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Daily Challenge: Day {day}
            </h1>
            <p className="text-slate-500 text-xs mt-1">{challenge.subtitle}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">{challenge.title}</h2>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">{challenge.description}</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2.5">
              Submission Guidelines
            </h3>
            <ul className="space-y-1.5">
              {challenge.guidelines.map((g, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                  <span className="text-burgundy font-bold">•</span>
                  <span>{g}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-3 border-t border-slate-200/80">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Submission Deadline
              </span>
              <p className="text-xs font-semibold text-slate-900 mt-0.5">{challenge.submissionDeadline}</p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <form onSubmit={(e) => handleCompetitionSubmit(e, challenge.type)} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5">
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
                    className="flex-1 px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-burgundy focus:border-burgundy"
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingComp[challenge.type]}
                    className="px-5 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {competitions[challenge.type] ? 'Update Submission' : 'Submit Now'}
                  </button>
                </div>
              </div>

              {compSuccessMsg[challenge.type] && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center gap-2 text-emerald-700 text-xs font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {compSuccessMsg[challenge.type]}
                </div>
              )}

              {competitions[challenge.type] && (
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Recorded Submission Link:</span>
                  <a
                    href={competitions[challenge.type].submission_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-burgundy hover:underline flex items-center gap-1"
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
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center animate-in fade-in duration-500">
      <div className="w-20 h-20 bg-burgundy/5 text-burgundy rounded-full flex items-center justify-center mb-5 ring-8 ring-burgundy/5">
        <PlayCircle className="w-10 h-10" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-3">
        Welcome to QisKit Fall Fest Learning Phase
      </h1>
      <p className="text-slate-600 text-xs sm:text-sm max-w-lg mb-6 leading-relaxed">
        Select a session or daily challenge from the sidebar to begin your quantum computing journey. Complete all modules sequentially to earn your certificate!
      </p>

      {/* Official Certificate Claim & Status Button */}
      <button
        onClick={() => setIsCertModalOpen(true)}
        className="px-6 py-3 bg-burgundy text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-burgundy-deep transition-all shadow-xs flex items-center gap-2 cursor-pointer"
      >
        <Award className="w-4 h-4 text-amber-300" />
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
