'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import clsx from 'clsx';
import {
  Play,
  Send,
  RotateCcw,
  Save,
  CheckCircle2,
  XCircle,
  Clock,
  Terminal as TerminalIcon,
  Award,
  AlertTriangle,
  ChevronRight,
  Code2,
  Trophy,
  Info,
  Check,
  Loader2,
  Flame,
  FileCode,
} from 'lucide-react';
import { CodingChallenge } from '@/data/qiskit/challenges';

// Dynamically import Monaco Editor to avoid SSR window issues
const Editor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center h-full min-h-[350px] bg-slate-900 text-slate-400 font-mono text-xs gap-2">
      <Loader2 className="w-5 h-5 animate-spin text-burgundy" />
      <span>Loading Monaco Code Editor...</span>
    </div>
  ),
});

interface PublicTestResult {
  test_number: number;
  test_name: string;
  passed: boolean;
  execution_time_ms: number;
  error_message: string | null;
}

interface HiddenTestResult {
  test_number: number;
  passed: boolean;
  execution_time_ms: number;
  error_message: string | null;
}

interface SubmissionDetails {
  submissionId: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'timeout' | 'system_error';
  score?: number;
  maxScore?: number;
  passedTests?: number;
  totalTests?: number;
  executionTimeMs?: number;
  stdout?: string;
  stderr?: string;
  errorMessage?: string;
  publicResults?: PublicTestResult[];
  hiddenResults?: HiddenTestResult[];
}

interface QiskitPlaygroundProps {
  challenge: CodingChallenge;
  userEmail: string;
  onSubmissionSuccess?: (score: number) => void;
}

export function QiskitPlayground({
  challenge,
  userEmail,
  onSubmissionSuccess,
}: QiskitPlaygroundProps) {
  const [code, setCode] = useState<string>(challenge.starterCode);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'console' | 'tests' | 'submission'>('console');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Run execution result state
  const [runStdout, setRunStdout] = useState<string>('');
  const [runStderr, setRunStderr] = useState<string>('');
  const [runExecutionMs, setRunExecutionMs] = useState<number>(0);
  const [publicTestResults, setPublicTestResults] = useState<PublicTestResult[]>([]);

  // Submission result state
  const [submission, setSubmission] = useState<SubmissionDetails | null>(null);

  const localDraftKey = `qff_draft_${userEmail.toLowerCase()}_${challenge.id}`;
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Load initial code from LocalStorage or server draft
  useEffect(() => {
    let initialCode = challenge.starterCode;

    // Check LocalStorage first
    try {
      const local = localStorage.getItem(localDraftKey);
      if (local && local.trim()) {
        initialCode = local;
      }
    } catch (e) {
      // LocalStorage unavailable
    }

    setCode(initialCode);

    // Fetch server draft asynchronously
    async function fetchServerDraft() {
      try {
        const res = await fetch(`/api/qiskit/draft?problemId=${challenge.id}`);
        const data = await res.json();
        if (data.success && data.code) {
          setCode(data.code);
          try {
            localStorage.setItem(localDraftKey, data.code);
          } catch {}
        }
      } catch (err) {
        console.warn('Could not fetch server draft:', err);
      }
    }

    fetchServerDraft();

    // Reset results when switching problem
    setRunStdout('');
    setRunStderr('');
    setPublicTestResults([]);
    setSubmission(null);
    setActiveTab('console');

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [challenge.id, localDraftKey, challenge.starterCode]);

  // 2. Local Draft Persistence with Debounced Auto-Save
  useEffect(() => {
    if (!code) return;

    try {
      localStorage.setItem(localDraftKey, code);
    } catch {}

    const timer = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        await fetch('/api/qiskit/draft', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            problemId: challenge.id,
            code,
          }),
        });
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch {
        setSaveStatus('idle');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [code, challenge.id, localDraftKey]);

  // 3. Reset to Starter Code
  const handleReset = () => {
    if (confirm('Reset code to starter template? Any unsaved edits will be replaced.')) {
      setCode(challenge.starterCode);
      try {
        localStorage.removeItem(localDraftKey);
      } catch {}
    }
  };

  // 4. Run Code (Public Tests Only)
  const handleRunCode = async () => {
    if (isRunning || isSubmitting) return;

    setIsRunning(true);
    setActiveTab('console');
    setRunStdout('');
    setRunStderr('');

    try {
      const res = await fetch('/api/qiskit/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: challenge.id,
          code,
        }),
      });

      const data = await res.json();
      setRunExecutionMs(data.executionTimeMs || 0);

      if (!res.ok || !data.success) {
        setRunStderr(data.error || 'Execution failed.');
        if (data.stderr) setRunStderr((prev) => `${prev}\n${data.stderr}`);
        if (data.publicResults) setPublicTestResults(data.publicResults);
      } else {
        setRunStdout(data.stdout || '');
        setRunStderr(data.stderr || '');
        if (data.publicResults) {
          setPublicTestResults(data.publicResults);
          setActiveTab('tests');
        }
      }
    } catch (err: any) {
      setRunStderr(`Connection error: ${err.message || 'Failed to communicate with runner.'}`);
    } finally {
      setIsRunning(false);
    }
  };

  // 5. Submit Solution (Asynchronous Evaluation)
  const handleSubmitCode = async () => {
    if (isRunning || isSubmitting) return;

    setIsSubmitting(true);
    setActiveTab('submission');
    setSubmission({
      submissionId: '',
      status: 'queued',
    });

    try {
      const res = await fetch('/api/qiskit/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: challenge.id,
          code,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setSubmission({
          submissionId: '',
          status: 'failed',
          errorMessage: data.error || 'Submission failed.',
        });
        setIsSubmitting(false);
        return;
      }

      const subId = data.submissionId;
      setSubmission({
        submissionId: subId,
        status: 'queued',
      });

      // Begin polling submission status
      pollSubmissionStatus(subId);
    } catch (err: any) {
      setSubmission({
        submissionId: '',
        status: 'failed',
        errorMessage: err.message || 'Network error during submission.',
      });
      setIsSubmitting(false);
    }
  };

  // 6. Polling Worker for Asynchronous Submission Status
  const pollSubmissionStatus = useCallback((subId: string) => {
    let attempts = 0;
    const maxAttempts = 30; // 30 * 1000ms = 30s timeout

    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    pollingIntervalRef.current = setInterval(async () => {
      attempts += 1;
      try {
        const res = await fetch(`/api/qiskit/submission/${subId}`);
        const data = await res.json();

        if (res.ok && data.success) {
          if (data.status === 'completed' || data.status === 'failed' || data.status === 'timeout') {
            clearInterval(pollingIntervalRef.current!);
            setIsSubmitting(false);
            setSubmission(data);
            if (data.status === 'completed' && onSubmissionSuccess) {
              onSubmissionSuccess(data.score || 0);
            }
          } else {
            setSubmission((prev) => ({
              ...(prev || { submissionId: subId }),
              status: data.status,
            }));
          }
        }

        if (attempts >= maxAttempts) {
          clearInterval(pollingIntervalRef.current!);
          setIsSubmitting(false);
          setSubmission((prev) => ({
            ...(prev || { submissionId: subId }),
            status: 'timeout',
            errorMessage: 'Evaluation timed out waiting for judge results.',
          }));
        }
      } catch (e) {
        console.warn('Error polling submission:', e);
      }
    }, 1000);
  }, [onSubmissionSuccess]);

  // Keyboard shortcut: Cmd/Ctrl + Enter to Run Code
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRunCode();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-xl overflow-hidden shadow-xs" onKeyDown={handleKeyDown}>
      {/* Editor Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-50 dark:bg-[#1C0A0D] border-b border-slate-200 dark:border-[#3D1418]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-xs text-slate-700 dark:text-slate-300 font-semibold">
            <FileCode className="w-4 h-4 text-burgundy dark:text-[#E89BA5]" />
            <span>solution.py</span>
          </div>

          <span className="text-slate-300 dark:text-slate-700">|</span>

          {saveStatus === 'saving' && (
            <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
              <Loader2 className="w-3 h-3 animate-spin" />
              Saving...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
              <Check className="w-3 h-3" />
              Saved
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Reset Template */}
          <button
            onClick={handleReset}
            title="Reset code to starter template"
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-[#3D1418] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#2A0E12] text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* Run Code Button */}
          <button
            onClick={handleRunCode}
            disabled={isRunning || isSubmitting}
            title="Run code against public tests (Cmd/Ctrl + Enter)"
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {isRunning ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>Run Code</span>
            <span className="hidden md:inline text-[10px] font-mono opacity-60 ml-0.5">⌘↵</span>
          </button>

          {/* Submit Solution Button */}
          <button
            onClick={handleSubmitCode}
            disabled={isRunning || isSubmitting}
            title="Submit solution for official judging"
            className="px-4 py-1.5 rounded-lg bg-burgundy hover:bg-burgundy-deep text-white text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>Submit</span>
          </button>
        </div>
      </div>

      {/* Monaco Code Editor Pane */}
      <div className="relative flex-1 min-h-[360px] sm:min-h-[420px] bg-[#1e1e1e]">
        <Editor
          height="100%"
          language="python"
          theme="vs-dark"
          value={code}
          onChange={(newVal) => setCode(newVal || '')}
          options={{
            fontSize: 13,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            lineNumbers: 'on',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            tabSize: 4,
            automaticLayout: true,
            bracketPairColorization: { enabled: true },
            padding: { top: 12, bottom: 12 },
          }}
        />
      </div>

      {/* Output / Test Results Drawer */}
      <div className="border-t border-slate-200 dark:border-[#3D1418] bg-slate-50 dark:bg-[#120507]">
        {/* Output Tabs Header */}
        <div className="flex items-center justify-between px-3 border-b border-slate-200 dark:border-[#3D1418] bg-slate-100/70 dark:bg-[#180609]">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('console')}
              className={clsx(
                'px-3 py-2 text-xs font-mono font-semibold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer',
                activeTab === 'console'
                  ? 'border-burgundy text-burgundy dark:text-[#E89BA5]'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              )}
            >
              <TerminalIcon className="w-3.5 h-3.5" />
              <span>Console Output</span>
            </button>

            <button
              onClick={() => setActiveTab('tests')}
              className={clsx(
                'px-3 py-2 text-xs font-mono font-semibold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer',
                activeTab === 'tests'
                  ? 'border-burgundy text-burgundy dark:text-[#E89BA5]'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              )}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Public Tests {publicTestResults.length > 0 && `(${publicTestResults.filter(t => t.passed).length}/${publicTestResults.length})`}</span>
            </button>

            <button
              onClick={() => setActiveTab('submission')}
              className={clsx(
                'px-3 py-2 text-xs font-mono font-semibold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer',
                activeTab === 'submission'
                  ? 'border-burgundy text-burgundy dark:text-[#E89BA5]'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              )}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Submission {submission?.score !== undefined ? `(${submission.score}/${challenge.points} pts)` : ''}</span>
            </button>
          </div>

          {runExecutionMs > 0 && (
            <span className="font-mono text-[11px] text-slate-400">
              {runExecutionMs} ms
            </span>
          )}
        </div>

        {/* Tab Content Display */}
        <div className="p-4 min-h-[160px] max-h-[260px] overflow-y-auto font-mono text-xs">
          {/* TAB 1: Console Output */}
          {activeTab === 'console' && (
            <div>
              {isRunning ? (
                <div className="flex items-center gap-2 text-slate-500 py-4">
                  <Loader2 className="w-4 h-4 animate-spin text-burgundy" />
                  <span>Executing code against test runner in quantum sandbox...</span>
                </div>
              ) : !runStdout && !runStderr ? (
                <div className="text-slate-400 italic py-2">
                  No execution output yet. Click <span className="font-semibold text-slate-600 dark:text-slate-300">[Run Code]</span> or press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px]">Cmd/Ctrl + Enter</kbd> to run your solution.
                </div>
              ) : (
                <div className="space-y-2">
                  {runStdout && (
                    <div className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-mono">
                      {runStdout}
                    </div>
                  )}
                  {runStderr && (
                    <div className="p-2.5 rounded-lg bg-red-50 dark:bg-rose-950/40 border border-red-200 dark:border-rose-900/50 text-red-700 dark:text-rose-300 whitespace-pre-wrap font-mono">
                      {runStderr}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Public Tests Breakdown */}
          {activeTab === 'tests' && (
            <div className="space-y-2">
              {publicTestResults.length === 0 ? (
                <div className="text-slate-400 italic py-2">
                  Run your code to see detailed public test results.
                </div>
              ) : (
                publicTestResults.map((t, idx) => (
                  <div
                    key={idx}
                    className={clsx(
                      'p-2.5 rounded-lg border flex flex-col gap-1 transition-colors',
                      t.passed
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                        : 'bg-red-50/70 dark:bg-rose-950/20 border-red-200 dark:border-rose-800/60'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {t.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600 dark:text-rose-400 shrink-0" />
                        )}
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {t.test_name || `Public Test #${t.test_number}`}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        {t.execution_time_ms} ms
                      </span>
                    </div>
                    {t.error_message && (
                      <p className="text-[11px] text-red-600 dark:text-rose-300 pl-6 font-mono">
                        {t.error_message}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: Official Submission Results */}
          {activeTab === 'submission' && (
            <div>
              {!submission ? (
                <div className="text-slate-400 italic py-2">
                  Click <span className="font-semibold text-slate-600 dark:text-slate-300">[Submit]</span> to evaluate your code on public + hidden test suites.
                </div>
              ) : submission.status === 'queued' || submission.status === 'running' ? (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-amber-600 dark:text-amber-400 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-amber-900 dark:text-amber-200 text-xs">
                      Submission In Queue ({submission.status})
                    </h4>
                    <p className="text-[11px] text-amber-700 dark:text-amber-300">
                      Judge worker is executing tests inside isolated sandbox. Please wait...
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Score Summary Banner */}
                  <div className={clsx(
                    'p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3',
                    submission.status === 'completed'
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
                      : 'bg-red-50 dark:bg-rose-950/30 border-red-200 dark:border-rose-800'
                  )}>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300">
                          Status: {submission.status}
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span className="text-[11px] text-slate-500">
                          {submission.executionTimeMs} ms
                        </span>
                      </div>
                      <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-[#FAF6F3]">
                        Score: {submission.score || 0} / {challenge.points} Points
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        Passed {submission.passedTests || 0} of {submission.totalTests || 0} total test cases.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {submission.score === challenge.points ? (
                        <div className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>ALL TESTS PASSED</span>
                        </div>
                      ) : (
                        <div className="px-3 py-1.5 rounded-lg bg-slate-800 text-white font-bold text-xs">
                          PARTIAL SCORE
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Public Test Breakdown */}
                  {submission.publicResults && submission.publicResults.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Public Tests ({submission.publicResults.filter(t => t.passed).length}/{submission.publicResults.length})
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {submission.publicResults.map((t, i) => (
                          <div
                            key={i}
                            className={clsx(
                              'p-2 rounded-md border text-[11px] flex items-center justify-between',
                              t.passed
                                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50'
                                : 'bg-red-50/50 dark:bg-rose-950/20 border-red-200 dark:border-rose-800/50'
                            )}
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              {t.passed ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                              )}
                              <span className="truncate">{t.test_name || `Public #${t.test_number}`}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 shrink-0 ml-1">{t.execution_time_ms}ms</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hidden Test Breakdown (Sanitized - No Test Inputs Leaked!) */}
                  {submission.hiddenResults && submission.hiddenResults.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-[#3D1418]">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Hidden Tests ({submission.hiddenResults.filter(t => t.passed).length}/{submission.hiddenResults.length})
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {submission.hiddenResults.map((t, i) => (
                          <div
                            key={i}
                            className={clsx(
                              'p-2 rounded-md border text-[11px] flex items-center justify-between',
                              t.passed
                                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50'
                                : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50'
                            )}
                          >
                            <div className="flex items-center gap-1.5">
                              {t.passed ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              )}
                              <span>Hidden Case #{t.test_number}</span>
                            </div>
                            <span className="text-[10px] font-semibold text-slate-500">
                              {t.passed ? 'Passed' : 'Failed'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
