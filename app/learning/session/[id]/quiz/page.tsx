'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthGate } from '@/components/learning/AuthGate';
import { CURRICULUM_SESSIONS } from '@/data/learning/curriculum';
import { useCurriculumSession } from '@/hooks/use-curriculum-sessions';
import { useQuiz } from '@/hooks/use-quizzes';
import { trackQuizAttempt } from '@/lib/analytics';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Award,
  RotateCcw,
  ArrowLeft,
  PlayCircle,
  Lock,
  Clock,
  Sparkles,
  Loader2,
} from 'lucide-react';

export default function DedicatedQuizPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const { session: dynamicSession } = useCurriculumSession(sessionId);
  const session = dynamicSession || CURRICULUM_SESSIONS.find((s) => s.id === sessionId);
  const { quiz, isLocked, isLoading: isQuizLoading } = useQuiz(sessionId);

  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [results, setResults] = useState<{
    scorePercent: number;
    passed: boolean;
    correctCount: number;
    totalQuestions: number;
    questionResults: Record<string, boolean>;
  } | null>(null);

  React.useEffect(() => {
    if (sessionId === 'session-2') {
      router.replace('/learning/session/session-1/quiz');
    }
  }, [sessionId, router]);

  if (isQuizLoading) {
    return (
      <AuthGate>
        <div className="min-h-screen bg-slate-50/60 dark:bg-[#100405] pb-16 font-sans">
          <div className="max-w-3xl mx-auto px-4 pt-16 flex flex-col items-center justify-center text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-burgundy dark:text-[#E89BA5]" />
            <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
              Loading session quiz...
            </p>
          </div>
        </div>
      </AuthGate>
    );
  }

  if (!session || !quiz) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-[#FAF6F3]">Quiz not found</h2>
        <Link
          href="/learning"
          className="mt-2 text-xs text-burgundy dark:text-[#E89BA5] font-semibold hover:underline"
        >
          Return to Learning Hub
        </Link>
      </div>
    );
  }

  // If Quiz is LOCKED: Show Coming Soon View (No questions are visible)
  if (isLocked) {
    return (
      <AuthGate>
        <div className="min-h-screen bg-slate-50/60 dark:bg-[#100405] pb-16 font-sans">
          {/* Navigation Breadcrumb Bar */}
          <div className="bg-white dark:bg-[#150709] border-b border-slate-200 dark:border-[#3D1418]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-2">
              <Link
                href={`/learning/session/${sessionId}`}
                className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-burgundy dark:hover:text-[#E89BA5] flex items-center gap-1.5 transition-colors uppercase tracking-wider"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Session {session.sessionNumber}
              </Link>

              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="text-slate-500 dark:text-slate-400">Day 0{session.day}</span>
                <span className="text-slate-300 dark:text-slate-600">/</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">Quiz Locked</span>
              </div>
            </div>
          </div>

          <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 sm:pt-12 font-sans">
            <div className="bg-white dark:bg-[#150709] rounded-2xl shadow-sm border border-slate-200 dark:border-[#3D1418] overflow-hidden text-center p-6 sm:p-10 space-y-6">
              {/* Lock Icon */}
              <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-amber-500/10 dark:bg-amber-500/20 animate-ping opacity-60" />
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/80 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm relative z-10">
                  <Lock className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
              </div>

              {/* Title & Badge */}
              <div className="space-y-2.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-mono text-xs font-semibold uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5" />
                  Coming Soon · Quiz Locked
                </div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-[#FAF6F3] tracking-tight">
                  {quiz.title || `Session ${session.sessionNumber} Concept Check`}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans max-w-lg mx-auto">
                  This concept check quiz is currently locked by the organizers.
                  Questions and options will be unlocked once the masterclass session concludes.
                </p>
              </div>

              {/* Preparation Guidance */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1C0A0D] border border-slate-200 dark:border-[#3D1418] max-w-lg mx-auto text-left space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200 font-sans">
                  <Sparkles className="w-4 h-4 text-burgundy dark:text-[#E89BA5]" />
                  How to prepare while you wait:
                </div>
                <ul className="list-disc list-inside space-y-1.5 pl-1 leading-relaxed">
                  <li>Watch the Session {session.sessionNumber} masterclass lecture video</li>
                  <li>Review the lecture notes and accompanying slide decks</li>
                  <li>Make note of key quantum gates, primitives, and SDK concepts</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link
                  href={`/learning/session/${sessionId}`}
                  className="w-full sm:w-auto px-5 py-2.5 bg-burgundy hover:bg-burgundy-deep text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <PlayCircle className="w-4 h-4" />
                  Watch Session Lecture
                </Link>
                <Link
                  href="/learning"
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 dark:bg-[#250D11] hover:bg-slate-200 dark:hover:bg-[#351419] text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg border border-slate-200 dark:border-[#3D1418] transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Return to Learning Hub
                </Link>
              </div>
            </div>
          </div>
        </div>
      </AuthGate>
    );
  }

  const allAnswered =
    Boolean(quiz?.questions?.length) &&
    Boolean(quiz?.questions?.every((q) => selectedAnswers[q.id] !== undefined));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!quiz || !allAnswered) return;

    try {
      setIsSubmitting(true);
      setSubmissionError(null);
      const res = await fetch('/api/learning/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: quiz.sessionId,
          action: 'submit_quiz',
          userAnswers: selectedAnswers,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setResults({
          scorePercent: data.scorePercent,
          passed: data.passed,
          correctCount: data.correctCount,
          totalQuestions: data.totalQuestions,
          questionResults: data.questionResults,
        });

        // Track quiz telemetry
        trackQuizAttempt(sessionId, data.scorePercent || 0, !!data.passed);

        // Also mark video as attended automatically if passed
        if (data.passed) {
          try {
            await fetch('/api/learning/progress', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sessionId, action: 'mark_video' }),
            });
          } catch (e) {
            console.warn('Auto mark video error:', e);
          }
        }
      } else {
        setSubmissionError(data.error || 'Failed to submit quiz. Please try again.');
      }
    } catch (err: any) {
      console.error('Quiz submission error:', err);
      setSubmissionError(err?.message || 'Error communicating with server.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleReset() {
    setSelectedAnswers({});
    setResults(null);
    setSubmissionError(null);
  }

  return (
    <AuthGate>
      <div className="min-h-screen bg-slate-50/60 dark:bg-[#100405] pb-16 font-sans">
        {/* Navigation Breadcrumb Bar */}
        <div className="bg-white dark:bg-[#150709] border-b border-slate-200 dark:border-[#3D1418]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-2">
            <Link
              href={`/learning/session/${sessionId}`}
              className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-burgundy dark:hover:text-[#E89BA5] flex items-center gap-1.5 transition-colors uppercase tracking-wider"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Session {session.sessionNumber}
            </Link>

            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-slate-500 dark:text-slate-400">Day 0{session.day}</span>
              <span className="text-slate-300 dark:text-slate-600">/</span>
              <span className="font-bold text-slate-900 dark:text-[#FAF6F3]">Concept Quiz</span>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 font-sans">
          <div className="bg-white dark:bg-[#150709] rounded-xl shadow-xs border border-slate-200 dark:border-[#3D1418] overflow-hidden">
            {/* Header */}
            <div className="px-4 py-4 sm:px-6 sm:py-4 bg-slate-50 dark:bg-[#1C0A0D] border-b border-slate-200 dark:border-[#3D1418] flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-burgundy dark:text-[#E89BA5] block">
                  Session {session.sessionNumber} Quiz
                </span>
                <h1 className="font-serif text-base sm:text-xl font-bold text-slate-900 dark:text-[#FAF6F3] mt-0.5 leading-snug">
                  {quiz.title || session.title}
                </h1>
              </div>
              <Award className="w-6 h-6 text-burgundy dark:text-[#E89BA5] shrink-0 opacity-80" />
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6">
              {submissionError && (
                <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{submissionError}</span>
                </div>
              )}

              {results ? (
                <div className="space-y-6">
                  {/* Result banner */}
                  <div
                    className={`p-4 rounded-xl border flex items-center gap-3.5 ${
                      results.passed
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                        : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200'
                    }`}
                  >
                    {results.passed ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0" />
                    )}
                    <div>
                      <h2 className="font-bold text-sm sm:text-base">
                        {results.passed ? 'Quiz Passed' : 'Passing Threshold Not Met'}
                      </h2>
                      <p className="text-xs mt-0.5 text-slate-700 dark:text-slate-300 font-mono">
                        Score: {results.scorePercent}% ({results.correctCount}/{results.totalQuestions} correct) · Pass requirement: {quiz.passingScore}%
                      </p>
                    </div>
                  </div>

                  {/* Question feedback */}
                  <div className="space-y-4">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      Review Answers
                    </span>
                    {quiz.questions.map((q, idx) => {
                      const isCorrect = results.questionResults[q.id];
                      const userChoice = selectedAnswers[q.id];
                      return (
                        <div
                          key={q.id}
                          className="p-4 rounded-lg border border-slate-200 dark:border-[#3D1418] bg-slate-50/50 dark:bg-[#1C0A0D]/60 space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-[#FAF6F3]">
                              <span className="text-slate-400 mr-1.5">{idx + 1}.</span>
                              {q.question}
                            </span>
                            {isCorrect ? (
                              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-300 font-bold shrink-0">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] text-rose-700 dark:text-rose-300 font-bold shrink-0">
                                <XCircle className="w-3.5 h-3.5" /> Incorrect
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 bg-white dark:bg-[#150709] p-2.5 rounded border border-slate-200 dark:border-[#3D1418]">
                            <p>
                              <span className="text-slate-500">Your Answer:</span>{' '}
                              {q.options[userChoice] || 'None'}
                            </p>
                            {!isCorrect && (
                              <p className="text-emerald-700 dark:text-emerald-400 font-medium">
                                <span>Correct Answer:</span> {q.options[q.correctIndex]}
                              </p>
                            )}
                          </div>

                          {q.explanation && (
                            <div className="text-xs bg-slate-100/70 dark:bg-[#1C0A0D] p-2.5 rounded text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-[#3D1418]">
                              <span className="font-semibold text-slate-800 dark:text-[#FAF6F3]">Explanation:</span>{' '}
                              {q.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-[#3D1418] flex flex-col sm:flex-row items-center justify-between gap-3">
                    {!results.passed ? (
                      <button
                        onClick={handleReset}
                        className="w-full sm:w-auto px-5 py-2 bg-burgundy text-white text-xs font-semibold rounded-lg hover:bg-burgundy-deep transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Try Again
                      </button>
                    ) : (
                      <Link
                        href={`/learning/session/${sessionId}`}
                        className="w-full sm:w-auto px-5 py-2 bg-slate-900 dark:bg-burgundy text-white text-xs font-semibold rounded-lg hover:bg-slate-800 dark:hover:bg-burgundy-deep transition-colors flex items-center justify-center gap-1.5"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        Return to Session
                      </Link>
                    )}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    {quiz.questions.map((q, idx) => (
                      <div
                        key={q.id}
                        className="p-4 rounded-lg border border-slate-200 dark:border-[#3D1418] bg-slate-50/50 dark:bg-[#1C0A0D]/60 space-y-3"
                      >
                        <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-[#FAF6F3]">
                          <span className="text-burgundy dark:text-[#E89BA5] mr-1.5 font-bold">Q{idx + 1}.</span>
                          {q.question}
                        </p>
                        <div className="space-y-2">
                          {q.options.map((opt, optIdx) => {
                            const isChecked = selectedAnswers[q.id] === optIdx;
                            return (
                              <label
                                key={optIdx}
                                className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                                  isChecked
                                    ? 'bg-burgundy/5 dark:bg-burgundy/25 border-burgundy dark:border-[#E89BA5] text-slate-900 dark:text-[#FAF6F3] font-semibold'
                                    : 'bg-white dark:bg-[#150709] border-slate-200 dark:border-[#3D1418] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#250D11]'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={q.id}
                                  checked={isChecked}
                                  onChange={() =>
                                    setSelectedAnswers((prev) => ({
                                      ...prev,
                                      [q.id]: optIdx,
                                    }))
                                  }
                                  className="mt-0.5 text-burgundy focus:ring-burgundy w-3.5 h-3.5"
                                />
                                <span className="leading-relaxed">{opt}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-200 dark:border-[#3D1418] gap-3">
                    <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                      Pass score: <span className="font-bold text-slate-800 dark:text-[#FAF6F3]">{quiz.passingScore}%</span>
                    </span>
                    <button
                      type="submit"
                      disabled={!allAnswered || isSubmitting}
                      className="w-full sm:w-auto px-6 py-2 bg-burgundy text-white text-xs font-semibold rounded-lg hover:bg-burgundy-deep transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {isSubmitting ? 'Evaluating...' : 'Submit Answers'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthGate>
  );
}
