'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthGate } from '@/components/learning/AuthGate';
import { CURRICULUM_SESSIONS } from '@/data/learning/curriculum';
import { SESSION_QUIZZES } from '@/data/learning/quizzes';
import { trackQuizAttempt } from '@/lib/analytics';
import { CheckCircle2, XCircle, AlertCircle, Award, RotateCcw, ArrowLeft, PlayCircle } from 'lucide-react';

export default function DedicatedQuizPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const session = CURRICULUM_SESSIONS.find((s) => s.id === sessionId);
  const quiz = SESSION_QUIZZES[sessionId];

  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<{
    scorePercent: number;
    passed: boolean;
    correctCount: number;
    totalQuestions: number;
    questionResults: Record<string, boolean>;
  } | null>(null);

  if (!session || !quiz) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-4">
        <h2 className="text-lg font-bold text-slate-900">Quiz not found</h2>
        <Link href="/learning" className="mt-2 text-xs text-burgundy font-medium hover:underline">
          Return to Learning Hub
        </Link>
      </div>
    );
  }

  const allAnswered = quiz.questions.every((q) => selectedAnswers[q.id] !== undefined);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!allAnswered) return;

    try {
      setIsSubmitting(true);
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
      if (data.success) {
        setResults({
          scorePercent: data.scorePercent,
          passed: data.passed,
          correctCount: data.correctCount,
          totalQuestions: data.totalQuestions,
          questionResults: data.questionResults,
        });

        // Track quiz telemetry in Vercel Analytics & internal metrics
        trackQuizAttempt(sessionId, data.scorePercent || 0, !!data.passed);

        // Also mark video as attended automatically if passed
        if (data.passed) {
          await fetch('/api/learning/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, action: 'mark_video' }),
          });
        }
      }
    } catch (err) {
      console.error('Quiz submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleReset() {
    setSelectedAnswers({});
    setResults(null);
  }

  return (
    <AuthGate>
      <div className="min-h-screen bg-slate-50/60 dark:bg-[#100405] pb-16 font-sans">
        {/* Navigation Breadcrumb Bar */}
        <div className="bg-white dark:bg-[#150709] border-b border-slate-200 dark:border-[#3D1418]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-2">
            <Link
              href={`/learning/session/${sessionId}`}
              className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-burgundy dark:hover:text-[#E89BA5] flex items-center gap-1.5 transition-colors uppercase tracking-wider"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Session {session.sessionNumber}
            </Link>

            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Day 0{session.day}</span>
              <span className="text-slate-300 dark:text-slate-600">/</span>
              <span className="font-bold text-slate-900 dark:text-[#FAF6F3]">Concept Quiz</span>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-8 font-sans">
          <div className="bg-white dark:bg-[#150709] rounded-xl shadow-xs border border-slate-200 dark:border-[#3D1418] overflow-hidden">
            {/* Header */}
            <div className="px-4 py-4 sm:px-6 sm:py-5 bg-slate-50 dark:bg-[#1C0A0D] border-b border-slate-200 dark:border-[#3D1418] flex items-center justify-between font-sans">
              <div className="min-w-0 pr-2">
                <span className="font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-burgundy dark:text-[#E89BA5] block">
                  Concept Check Verification
                </span>
                <h1 className="font-serif text-lg sm:text-2xl font-bold text-slate-900 dark:text-[#FAF6F3] mt-1 leading-snug truncate sm:whitespace-normal">
                  {quiz.title}
                </h1>
              </div>
              <Award className="w-7 h-7 sm:w-8 sm:h-8 text-burgundy/30 dark:text-[#E89BA5]/30 shrink-0" />
            </div>

            {/* Content */}
            <div className="p-4 sm:p-8">
              {results ? (
                <div className="space-y-8">
                  {/* Result banner */}
                  <div
                    className={`p-5 rounded-xl border flex items-start gap-4 ${
                      results.passed
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                        : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200'
                    }`}
                  >
                    {results.passed ? (
                      <Award className="w-8 h-8 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-8 h-8 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h2 className="font-bold text-lg">
                        {results.passed
                          ? 'Congratulations! You passed the concept check.'
                          : 'Passing threshold not met.'}
                      </h2>
                      <p className="text-sm mt-1.5 leading-relaxed text-slate-700 dark:text-slate-300">
                        Your score: <span className="font-bold text-slate-900 dark:text-[#FAF6F3]">{results.scorePercent}%</span> (
                        {results.correctCount}/{results.totalQuestions} correct). Required:{' '}
                        {quiz.passingScore}%.
                        <br/>
                        {results.passed
                          ? 'The next session in your curriculum sequence is now unlocked.'
                          : 'Please review the feedback below and try again to proceed.'}
                      </p>
                    </div>
                  </div>

                  {/* Question feedback */}
                  <div className="space-y-5">
                    <h3 className="text-base font-bold text-slate-900 dark:text-[#FAF6F3]">Detailed Feedback</h3>
                    {quiz.questions.map((q, idx) => {
                      const isCorrect = results.questionResults[q.id];
                      const userChoice = selectedAnswers[q.id];
                      return (
                        <div
                          key={q.id}
                          className="p-5 rounded-xl border border-slate-200 dark:border-[#3D1418] bg-slate-50/50 dark:bg-[#1C0A0D]/60 space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <span className="text-sm font-semibold text-slate-800 dark:text-[#FAF6F3] leading-snug">
                              <span className="text-slate-500 dark:text-slate-400 mr-1.5">{idx + 1}.</span>
                              {q.question}
                            </span>
                            {isCorrect ? (
                              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-1 rounded shrink-0">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-xs text-rose-700 dark:text-rose-300 font-bold bg-rose-100 dark:bg-rose-950/60 px-2.5 py-1 rounded shrink-0">
                                <XCircle className="w-3.5 h-3.5" /> Incorrect
                              </span>
                            )}
                          </div>

                          <div className="text-sm text-slate-600 dark:text-slate-300 space-y-1.5 bg-white dark:bg-[#150709] p-3 rounded-lg border border-slate-200 dark:border-[#3D1418]">
                            <p>
                              <span className="font-semibold text-slate-700 dark:text-slate-300">Your Answer:</span>{' '}
                              {q.options[userChoice] || 'None selected'}
                            </p>
                            {!isCorrect && (
                              <p>
                                <span className="font-semibold text-emerald-700 dark:text-emerald-400">Correct Answer:</span>{' '}
                                {q.options[q.correctIndex]}
                              </p>
                            )}
                          </div>

                          <div className="mt-2 text-sm bg-slate-100/80 dark:bg-[#1C0A0D] p-3 rounded-lg text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-[#3D1418]">
                            <span className="font-semibold text-slate-900 dark:text-[#FAF6F3]">Explanation:</span>{' '}
                            {q.explanation}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-6 border-t border-slate-200 dark:border-[#3D1418] flex flex-col sm:flex-row items-center justify-between gap-4">
                    {!results.passed ? (
                      <button
                        onClick={handleReset}
                        className="w-full sm:w-auto px-6 py-2.5 bg-burgundy text-white text-sm font-bold rounded-lg hover:bg-burgundy-deep transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Retry Concept Check
                      </button>
                    ) : (
                      <Link
                        href={`/learning/session/${sessionId}`}
                        className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 dark:bg-burgundy text-white text-sm font-bold rounded-lg hover:bg-slate-800 dark:hover:bg-burgundy-deep transition-colors shadow-sm flex items-center justify-center gap-2"
                      >
                        <PlayCircle className="w-4 h-4" />
                        Return to Session
                      </Link>
                    )}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-6">
                    {quiz.questions.map((q, idx) => (
                      <div
                        key={q.id}
                        className="p-5 rounded-xl border border-slate-200 dark:border-[#3D1418] bg-slate-50/50 dark:bg-[#1C0A0D]/60 space-y-4"
                      >
                        <p className="text-sm font-semibold text-slate-900 dark:text-[#FAF6F3] leading-snug">
                          <span className="text-burgundy dark:text-[#E89BA5] mr-1.5 font-bold">Q{idx + 1}.</span>
                          {q.question}
                        </p>
                        <div className="space-y-2.5">
                          {q.options.map((opt, optIdx) => {
                            const isChecked = selectedAnswers[q.id] === optIdx;
                            return (
                              <label
                                key={optIdx}
                                className={`flex items-start gap-3 p-3 rounded-lg border text-sm cursor-pointer transition-all ${
                                  isChecked
                                    ? 'bg-burgundy/5 dark:bg-burgundy/25 border-burgundy dark:border-[#E89BA5] text-slate-900 dark:text-[#FAF6F3] font-semibold ring-1 ring-burgundy dark:ring-[#E89BA5]'
                                    : 'bg-white dark:bg-[#150709] border-slate-200 dark:border-[#3D1418] text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-[#250D11] hover:border-slate-300 dark:hover:border-[#4A181E]'
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
                                  className="mt-0.5 text-burgundy focus:ring-burgundy w-4 h-4"
                                />
                                <span className="leading-relaxed pt-px">{opt}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-slate-200 dark:border-[#3D1418] gap-4">
                    <span className="text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-[#1C0A0D] border border-slate-200 dark:border-[#3D1418] px-3 py-1.5 rounded-lg font-medium">
                      Passing requirement: <span className="font-bold text-slate-700 dark:text-[#FAF6F3]">{quiz.passingScore}%</span>
                    </span>
                    <button
                      type="submit"
                      disabled={!allAnswered || isSubmitting}
                      className="w-full sm:w-auto px-8 py-3 bg-burgundy text-white text-sm font-bold rounded-lg hover:bg-burgundy-deep transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer font-sans"
                    >
                      {isSubmitting ? 'Verifying Answers...' : 'Submit Answers'}
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
