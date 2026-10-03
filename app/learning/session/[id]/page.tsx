'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AuthGate } from '@/components/learning/AuthGate';
import { CURRICULUM_SESSIONS } from '@/data/learning/curriculum';
import { SESSION_QUIZZES } from '@/data/learning/quizzes';
import { trackLectureView } from '@/lib/analytics';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Globe,
  Award,
  Video,
  ChevronRight,
  Lock,
} from 'lucide-react';

export default function SessionPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = params.id as string;

  const session = CURRICULUM_SESSIONS.find((s) => s.id === sessionId);
  const quiz = SESSION_QUIZZES[sessionId];

  const [videoCompleted, setVideoCompleted] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);
  const [isMarkingVideo, setIsMarkingVideo] = useState(false);

  const fetchSessionProgress = React.useCallback(async () => {
    try {
      setIsLoadingProgress(true);
      const res = await fetch('/api/learning/progress');
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
        <h2 className="text-lg font-bold text-slate-900">Session not found</h2>
        <Link href="/learning" className="mt-2 text-xs text-burgundy font-medium hover:underline">
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
            <Link
              href="/learning"
              className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-burgundy dark:hover:text-[#E89BA5] flex items-center gap-1.5 transition-colors uppercase tracking-wider"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Curriculum Hub
            </Link>

            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Day 0{session.day}</span>
              <span className="text-slate-300 dark:text-slate-600">/</span>
              <span className="font-bold text-slate-900 dark:text-[#FAF6F3]">Session {session.sessionNumber}</span>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="space-y-8">
            {/* Main Video & Details */}
            <div className="space-y-6">
              {/* YouTube Video Player Embed */}
              <div className="bg-black rounded-xl overflow-hidden shadow-sm aspect-video relative border border-slate-200 dark:border-[#3D1418]">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${session.youtubeId}?rel=0&modestbranding=1`}
                  title={session.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Title & Metadata Strip */}
              <div className="bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-xl p-6 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono px-2.5 py-0.5 rounded bg-burgundy/10 text-burgundy dark:bg-burgundy/20 dark:text-[#E89BA5] font-semibold text-[11px] uppercase tracking-[0.2em]">
                      Session {session.sessionNumber}
                    </span>
                    <span className="font-mono text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {session.duration}
                    </span>
                  </div>

                  {isSessionFullyDone ? (
                    <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      Session Completed (Quiz: {quizScore}%)
                    </span>
                  ) : (
                    <span className="font-mono text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded font-medium border border-amber-200 dark:border-amber-800">
                      Pass quiz to complete session
                    </span>
                  )}
                </div>

                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-[#FAF6F3] tracking-tight">
                  {session.title}
                </h1>

                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                  {session.description}
                </p>

                {/* Key Learning Objectives */}
                <div className="pt-3 border-t border-slate-100 dark:border-[#3D1418]">
                  <h3 className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-burgundy dark:text-[#E89BA5] mb-2.5">
                    Core Learning Objectives
                  </h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {session.learnPoints.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-burgundy dark:bg-[#E89BA5] mt-1.5 shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Video Attendance Confirmation */}
                <div className="pt-3 border-t border-slate-100 dark:border-[#3D1418] flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Finished watching the stream or lecture recording?
                  </span>
                  <button
                    type="button"
                    onClick={handleMarkVideoCompleted}
                    disabled={videoCompleted || isMarkingVideo}
                    className={`px-3.5 py-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                      videoCompleted
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 cursor-default'
                        : 'bg-slate-900 dark:bg-burgundy text-white hover:bg-slate-800 dark:hover:bg-burgundy-deep'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {videoCompleted ? 'Lecture Acknowledged' : 'Mark Lecture as Watched'}
                  </button>
                </div>
              </div>
            </div>

            {/* Resources and Lecturer Profile Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Lecturer Profile Card */}
              <div className="p-5 bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-xl shadow-xs space-y-4">
                <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-burgundy dark:text-[#E89BA5] block">
                  Session Lecturer
                </span>

                <div className="space-y-1">
                  <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-[#FAF6F3]">{session.speaker.name}</h3>
                  <p className="font-mono text-xs font-semibold text-burgundy dark:text-[#E89BA5] uppercase tracking-wider">{session.speaker.role}</p>
                  <p className="font-sans text-xs text-slate-500 dark:text-slate-400">{session.speaker.institution}</p>
                </div>

                <p className="font-sans text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-[#3D1418] pt-3">
                  {session.speaker.bio}
                </p>

                {/* External links */}
                <div className="pt-2 border-t border-slate-100 dark:border-[#3D1418] flex flex-wrap gap-2 text-xs">
                  {session.speaker.websiteUrl && (
                    <a
                      href={session.speaker.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded bg-slate-100 dark:bg-[#1C0A0D] hover:bg-slate-200 dark:hover:bg-[#250D11] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#3D1418] font-medium inline-flex items-center gap-1 transition-colors"
                    >
                      <Globe className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                      Speaker Website
                      <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                    </a>
                  )}
                  {session.speaker.profileUrl && (
                    <a
                      href={session.speaker.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded bg-slate-100 dark:bg-[#1C0A0D] hover:bg-slate-200 dark:hover:bg-[#250D11] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#3D1418] font-medium inline-flex items-center gap-1 transition-colors"
                    >
                      Academic Profile
                      <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                    </a>
                  )}
                </div>
              </div>

              {/* Lecture Notes & Resources */}
              <div className="p-5 bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-xl shadow-xs space-y-3">
                <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-burgundy dark:text-[#E89BA5] block">
                  Lecture Notes & Notebooks
                </span>

                <div className="space-y-2 text-xs">
                  {session.lectureNotesUrl && (
                    <a
                      href={session.lectureNotesUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-lg border border-slate-200 dark:border-[#3D1418] bg-slate-50 dark:bg-[#1C0A0D] hover:bg-slate-100 dark:hover:bg-[#250D11] flex items-center justify-between text-slate-800 dark:text-[#FAF6F3] font-medium transition-colors"
                    >
                      <span className="flex items-center gap-2">
                         <FileText className="w-4 h-4 text-burgundy dark:text-[#E89BA5]" />
                         Lecture Guide & Documentation
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </a>
                  )}

                  {session.slidesUrl && (
                    <a
                      href={session.slidesUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-lg border border-slate-200 dark:border-[#3D1418] bg-slate-50 dark:bg-[#1C0A0D] hover:bg-slate-100 dark:hover:bg-[#250D11] flex items-center justify-between text-slate-800 dark:text-[#FAF6F3] font-medium transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-burgundy dark:text-[#E89BA5]" />
                        Companion Code & Notebooks
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </a>
                  )}
                </div>
                
                {/* Next session progression pointer */}
                {isSessionFullyDone && nextSession && (
                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-[#3D1418]">
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-[#FAF6F3] block mb-2">Up Next in Sequence</span>
                    <Link
                      href={`/learning/session/${nextSession.id}`}
                      className="p-3 rounded-lg border border-slate-200 dark:border-[#3D1418] hover:border-burgundy/40 dark:hover:border-[#E89BA5]/40 bg-slate-50 dark:bg-[#1C0A0D] hover:bg-white dark:hover:bg-[#250D11] transition-all flex items-center justify-between group"
                    >
                      <div className="truncate pr-2">
                        <span className="font-mono text-[10px] uppercase font-bold text-burgundy dark:text-[#E89BA5] block">
                          Session {nextSession.sessionNumber}
                        </span>
                        <span className="font-serif text-sm font-semibold text-slate-800 dark:text-[#FAF6F3] group-hover:text-burgundy dark:group-hover:text-[#E89BA5] truncate block">
                          {nextSession.title}
                        </span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-burgundy dark:group-hover:text-[#E89BA5] shrink-0" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGate>
  );
}
