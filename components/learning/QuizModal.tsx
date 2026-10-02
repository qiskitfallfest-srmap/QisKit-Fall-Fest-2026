'use client';

import React, { useState } from 'react';
import { SessionQuiz } from '@/data/learning/types';
import { CheckCircle2, XCircle, AlertCircle, Award, RotateCcw, X } from 'lucide-react';

interface QuizModalProps {
  quiz: SessionQuiz;
  isOpen: boolean;
  onClose: () => void;
  onPassed: (score: number) => void;
}

export function QuizModal({ quiz, isOpen, onClose, onPassed }: QuizModalProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<{
    scorePercent: number;
    passed: boolean;
    correctCount: number;
    totalQuestions: number;
    questionResults: Record<string, boolean>;
  } | null>(null);

  if (!isOpen) return null;

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

        if (data.passed) {
          onPassed(data.scorePercent);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between font-sans">
          <div>
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-burgundy">
              Concept Check Verification
            </span>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-slate-900 tracking-tight">{quiz.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {results ? (
            <div className="space-y-6">
              {/* Result banner */}
              <div
                className={`p-4 rounded-lg border flex items-start gap-3 ${
                  results.passed
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                {results.passed ? (
                  <Award className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-bold text-sm">
                    {results.passed
                      ? 'Congratulations! You passed the concept check.'
                      : 'Passing threshold not met.'}
                  </h4>
                  <p className="text-xs mt-1">
                    Your score: <span className="font-bold">{results.scorePercent}%</span> (
                    {results.correctCount}/{results.totalQuestions} correct). Required:{' '}
                    {quiz.passingScore}%.
                    {results.passed
                      ? ' The next session in your curriculum sequence is now unlocked.'
                      : ' Please review the feedback below and try again to proceed.'}
                  </p>
                </div>
              </div>

              {/* Question feedback */}
              <div className="space-y-4">
                {quiz.questions.map((q, idx) => {
                  const isCorrect = results.questionResults[q.id];
                  const userChoice = selectedAnswers[q.id];
                  return (
                    <div
                      key={q.id}
                      className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-800">
                          Question {idx + 1}: {q.question}
                        </span>
                        {isCorrect ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3" /> Correct
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-rose-700 font-bold bg-rose-100 px-2 py-0.5 rounded">
                            <XCircle className="w-3 h-3" /> Incorrect
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-600 space-y-1">
                        <p>
                          <span className="font-semibold text-slate-700">Your Answer:</span>{' '}
                          {q.options[userChoice] || 'None selected'}
                        </p>
                        {!isCorrect && (
                          <p>
                            <span className="font-semibold text-emerald-700">Correct Answer:</span>{' '}
                            {q.options[q.correctIndex]}
                          </p>
                        )}
                      </div>

                      <div className="mt-2 text-xs bg-white p-2.5 rounded border border-slate-200 text-slate-700">
                        <span className="font-semibold text-slate-900">Explanation:</span>{' '}
                        {q.explanation}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-5">
                {quiz.questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-3"
                  >
                    <p className="text-xs font-semibold text-slate-900 leading-snug">
                      <span className="text-burgundy mr-1 font-bold">Q{idx + 1}.</span>
                      {q.question}
                    </p>
                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => {
                        const isChecked = selectedAnswers[q.id] === optIdx;
                        return (
                          <label
                            key={optIdx}
                            className={`flex items-start gap-2.5 p-2 rounded-md border text-xs cursor-pointer transition-colors ${
                              isChecked
                                ? 'bg-burgundy/5 border-burgundy text-slate-900 font-medium'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/60'
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
                              className="mt-0.5 text-burgundy focus:ring-burgundy"
                            />
                            <span className="leading-relaxed">{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <span className="text-xs text-slate-500">
                  Passing requirement: {quiz.passingScore}%
                </span>
                <button
                  type="submit"
                  disabled={!allAnswered || isSubmitting}
                  className="px-5 py-2 bg-burgundy text-white text-xs font-semibold rounded-lg hover:bg-burgundy-deep transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Verifying Answers...' : 'Submit Answers'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        {results && (
          <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            {!results.passed && (
              <button
                onClick={handleReset}
                className="text-xs text-burgundy hover:underline font-semibold flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Retry Concept Check
              </button>
            )}
            <div className="ml-auto">
              <button
                onClick={onClose}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded transition-colors"
              >
                Close Window
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
