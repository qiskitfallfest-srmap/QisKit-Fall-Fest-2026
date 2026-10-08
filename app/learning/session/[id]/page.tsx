'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AuthGate } from '@/components/learning/AuthGate';
import { CURRICULUM_SESSIONS } from '@/data/learning/curriculum';
import { useCurriculumSession } from '@/hooks/use-curriculum-sessions';
import { useQuiz } from '@/hooks/use-quizzes';
import { trackLectureView } from '@/lib/analytics';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Award,
  Video,
  ChevronRight,
  Lock,
} from 'lucide-react';
import clsx from 'clsx';

export default function SessionPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = params.id as string;

  const { session: dynamicSession } = useCurriculumSession(sessionId);
  const session = dynamicSession || CURRICULUM_SESSIONS.find((s) => s.id === sessionId);
  const { quiz, isLocked } = useQuiz(sessionId);
  const hasReferenceMaterial = Boolean(session?.lectureNotesUrl?.trim() || session?.slidesUrl?.trim());

  const [videoCompleted, setVideoCompleted] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);
  const [isMarkingVideo, setIsMarkingVideo] = useState(false);

  const fetchSessionProgress = React.useCallback(async () => {
    try {
      setIsLoadingProgress(true);
      const res = await fetch('/api/learning/progress', { cache: 'no-store' });
      const data = await res.json();
      if (data?.progress?.[sessionId]) {
        const s = data.progress[sessionId];
        setVideoCompleted(s.videoCompleted);
        setQuizPassed(s.quizPassed);
        setQuizScore(s.quizScore);
      }
    } catch (e) {
      console.error('Error fetching session progress:', e);
    } finally {
      setIsLoadingProgress(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchSessionProgress();
    if (session) {
      trackLectureView(sessionId, session.title);
    }
  }, [fetchSessionProgress, session, sessionId]);

  async function handleMarkVideoCompleted() {
    try {
      setIsMarkingVideo(true);
      const res = await fetch('/api/learning/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          action: 'mark_video',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setVideoCompleted(true);
        fetchSessionProgress();
      }
    } catch (err) {
      console.error('Error marking video completed:', err);
    } finally {
      setIsMarkingVideo(false);
    }
  }

  if (!session) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-[#FAF6F3]">Session not found</h2>
        <Link href="/learning" className="mt-2 text-xs text-burgundy dark:text-[#E89BA5] font-semibold hover:underline">
          Return to Learning Hub
        </Link>
      </div>
    );
  }

  // Find next session in curriculum
  const currentIndex = CURRICULUM_SESSIONS.findIndex((s) => s.id === sessionId);
  const nextSession =
    currentIndex !== -1 && currentIndex < CURRICULUM_SESSIONS.length - 1
      ? CURRICULUM_SESSIONS[currentIndex + 1]
      : null;

  const isSessionFullyDone = videoCompleted && quizPassed;

  return (
    <AuthGate>
      <div className="min-h-screen bg-slate-50/60 dark:bg-[#100405] pb-16 font-sans">
        {/* Navigation Breadcrumb Bar */}
        <div className="bg-white dark:bg-[#150709] border-b border-slate-200 dark:border-[#3D1418]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-2">
            <Link
              href="/learning"
              className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-burgundy dark:hover:text-[#E89BA5] flex items-center gap-1.5 transition-colors uppercase tracking-wider"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Learning Hub
            </Link>

            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-slate-500 dark:text-slate-400">Day 0{session.day}</span>
              <span className="text-slate-300 dark:text-slate-600">/</span>
              <span className="font-bold text-slate-900 dark:text-[#FAF6F3]">Session {session.sessionNumber}</span>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
          <div className="space-y-6">
            {/* Live Session Alert Banner if active */}
            {session.isLive && (
              <div className="bg-red-500/10 dark:bg-red-950/40 border border-red-500/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping shrink-0" />
                  <div>
                    <span className="font-mono text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-widest block">
                      Live Broadcast
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                      {session.liveNotice || 'Live lecture stream is in progress.'}
                    </p>
                  </div>
                </div>

                {session.liveMeetingUrl && (
                  <a
                    href={session.liveMeetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors shrink-0"
                  >
                    <Video className="w-3.5 h-3.5" />
                    Join Stream
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}

            {/* Video Player */}
            <div className="bg-black rounded-xl sm:rounded-2xl overflow-hidden shadow-sm aspect-video relative border border-slate-200 dark:border-[#3D1418]">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${session.youtubeId}?rel=0&modestbranding=1`}
                title={session.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Title & Metadata Strip */}
            <div className="bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono px-2 py-0.5 rounded bg-burgundy/10 text-burgundy dark:bg-burgundy/20 dark:text-[#E89BA5] font-semibold text-[11px] uppercase tracking-wider">
                    Session {session.sessionNumber}
                  </span>
                  <span className="font-mono text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {session.duration}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {isSessionFullyDone ? (
                    <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      Session Complete ({quizScore}%)
                    </span>
                  ) : isLocked ? (
                    <Link
                      href={`/learning/session/${session.id}/quiz`}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300/80 dark:border-amber-700/60 text-xs font-semibold transition-colors"
                    >
                      <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      Quiz Coming Soon
                    </Link>
                  ) : (
                    <Link
                      href={`/learning/session/${session.id}/quiz`}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-burgundy text-white hover:bg-burgundy-deep text-xs font-semibold transition-colors"
                    >
                      <Award className="w-3.5 h-3.5" />
                      {quizPassed ? `Quiz Passed (${quizScore}%)` : 'Take Concept Quiz'}
                    </Link>
                  )}
                </div>
              </div>

              <h1 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-[#FAF6F3] tracking-tight">
                {session.title}
              </h1>

              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                {session.description}
              </p>

              {/* Key Learning Points */}
              <div className="pt-3 border-t border-slate-100 dark:border-[#3D1418]">
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-burgundy dark:text-[#E89BA5] block mb-2">
                  Learning Objectives
                </span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {session.learnPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-burgundy dark:bg-[#E89BA5] mt-1.5 shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Attendance confirmation */}
              <div className="pt-3 border-t border-slate-100 dark:border-[#3D1418] flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Attendance Status
                </span>
                <button
                  type="button"
                  onClick={handleMarkVideoCompleted}
                  disabled={videoCompleted || isMarkingVideo}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                    videoCompleted
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 cursor-default'
                      : 'bg-slate-900 dark:bg-burgundy text-white hover:bg-slate-800 dark:hover:bg-burgundy-deep'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {videoCompleted ? 'Watched' : 'Mark as Watched'}
                </button>
              </div>
            </div>

            {/* Resources and Lecturer Profile Grid */}
            <div
              className={clsx(
                'grid gap-5',
                hasReferenceMaterial ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
              )}
            >
              {/* Lecturer Profile Card */}
              <div className="p-5 bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-xl shadow-xs space-y-4">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-burgundy dark:text-[#E89BA5] block">
                  {session.coSpeakers && session.coSpeakers.length > 0 ? 'Lecturers & Speakers' : 'Session Lecturer'}
                </span>

                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <h3 className="font-serif text-base font-bold text-slate-900 dark:text-[#FAF6F3]">{session.speaker.name}</h3>
                    <p className="font-mono text-[11px] font-semibold text-burgundy dark:text-[#E89BA5] uppercase tracking-wide">{session.speaker.role}</p>
                    <p className="font-sans text-xs text-slate-500 dark:text-slate-400">{session.speaker.institution}</p>
                    <p className="font-sans text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                      {session.speaker.bio}
                    </p>
                  </div>

                  {session.coSpeakers?.map((co, cIdx) => (
                    <div key={cIdx} className="space-y-1 pt-3 border-t border-slate-100 dark:border-[#3D1418]">
                      <h3 className="font-serif text-base font-bold text-slate-900 dark:text-[#FAF6F3]">{co.name}</h3>
                      <p className="font-mono text-[11px] font-semibold text-burgundy dark:text-[#E89BA5] uppercase tracking-wide">{co.role}</p>
                      <p className="font-sans text-xs text-slate-500 dark:text-slate-400">{co.institution}</p>
                      <p className="font-sans text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                        {co.bio}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lecture Notes & Resources - ONLY rendered if actual URLs are provided */}
              {hasReferenceMaterial && (
                <div className="p-5 bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-xl shadow-xs space-y-3">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-burgundy dark:text-[#E89BA5] block">
                    Reference Material
                  </span>

                  <div className="space-y-2 text-xs">
                    {session.lectureNotesUrl?.trim() && (
                      <a
                        href={session.lectureNotesUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-lg border border-slate-200 dark:border-[#3D1418] bg-slate-50 dark:bg-[#1C0A0D] hover:bg-slate-100 dark:hover:bg-[#250D11] flex items-center justify-between text-slate-800 dark:text-[#FAF6F3] font-medium transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-burgundy dark:text-[#E89BA5]" />
                          Official Documentation & Guides
                        </span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    )}

                    {session.slidesUrl?.trim() && (
                      <a
                        href={session.slidesUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-lg border border-slate-200 dark:border-[#3D1418] bg-slate-50 dark:bg-[#1C0A0D] hover:bg-slate-100 dark:hover:bg-[#250D11] flex items-center justify-between text-slate-800 dark:text-[#FAF6F3] font-medium transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-burgundy dark:text-[#E89BA5]" />
                          Tutorial Code & Notebooks
                        </span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Next session pointer */}
            {isSessionFullyDone && nextSession && (
              <div className="p-4 bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-xl shadow-xs">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">
                  Up Next
                </span>
                <Link
                  href={`/learning/session/${nextSession.id}`}
                  className="p-3 rounded-lg border border-slate-200 dark:border-[#3D1418] hover:border-burgundy/40 dark:hover:border-[#E89BA5]/40 bg-slate-50 dark:bg-[#1C0A0D] hover:bg-white dark:hover:bg-[#250D11] transition-all flex items-center justify-between group"
                >
                  <div className="truncate pr-2">
                    <span className="font-mono text-[10px] uppercase font-bold text-burgundy dark:text-[#E89BA5] block">
                      Session {nextSession.sessionNumber}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-[#FAF6F3] group-hover:text-burgundy dark:group-hover:text-[#E89BA5] truncate block">
                      {nextSession.title}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-burgundy dark:group-hover:text-[#E89BA5] shrink-0" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGate>
  );
}
