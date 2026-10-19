'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Trophy,
  Search,
  Download,
  RefreshCw,
  ExternalLink,
  Trash2,
  FileText,
  Video,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileCode,
  Layers,
  Sliders,
  MessageSquare,
  XCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useEvaluationPolling } from './useEvaluationPolling';
import { EvaluationDrawer } from './EvaluationDrawer';
import { SubmissionEvaluation } from '@/types/evaluations';

export interface CompetitionSubmissionItem {
  id: string;
  email: string;
  fullName?: string;
  competition_type: 'reels' | 'poster' | 'essay';
  submission_url: string;
  submission_title?: string | null;
  notes?: string | null;
  status: string;
  submitted_at: string;
  isDocument: boolean;
  documentType: 'pdf' | 'docx' | 'link';
  evaluation?: SubmissionEvaluation | null;
}

interface Stats {
  total: number;
  reels: number;
  poster: number;
  essay: number;
  documentsCount: number;
  shortlistedCount?: number;
  rejectedCount?: number;
  evaluatedCount?: number;
  downloadedCount?: number;
}

const COMPETITION_EVALUATION_CATEGORIES = ['reels', 'poster', 'essay'] as const;

type TrackFilter = 'all' | 'reels' | 'poster' | 'essay';
type PipelineFilter = 'all' | 'ready' | 'shortlisted' | 'rejected' | 'downloaded' | 'documents';
type SortBy = 'newest' | 'score';

const PIPELINE_FILTERS: {
  key: PipelineFilter;
  label: string;
  activeTone: string;
  match: (s: CompetitionSubmissionItem) => boolean;
}[] = [
  { key: 'all', label: 'All Entries', activeTone: 'text-burgundy dark:text-[#E89BA5]', match: () => true },
  {
    key: 'ready',
    label: 'Ready for Review',
    activeTone: 'text-burgundy dark:text-[#E89BA5]',
    match: (s) => !s.evaluation?.downloaded && s.evaluation?.status !== 'rejected',
  },
  { key: 'shortlisted', label: 'Shortlisted', activeTone: 'text-emerald-700 dark:text-emerald-300', match: (s) => Boolean(s.evaluation?.is_next_round) },
  { key: 'rejected', label: 'Rejected', activeTone: 'text-rose-700 dark:text-rose-300', match: (s) => s.evaluation?.status === 'rejected' },
  { key: 'downloaded', label: 'Downloaded & Inspected', activeTone: 'text-sky-700 dark:text-sky-300', match: (s) => Boolean(s.evaluation?.downloaded) },
  { key: 'documents', label: 'Uploaded Docs', activeTone: 'text-amber-700 dark:text-amber-300', match: (s) => s.isDocument },
];

function TrackBadge({ type }: { type: CompetitionSubmissionItem['competition_type'] }) {
  if (type === 'reels') {
    return (
      <span className="px-2 py-0.5 rounded text-2xs font-semibold bg-burgundy/10 text-burgundy border border-burgundy/20 dark:bg-burgundy/25 dark:text-[#E89BA5] dark:border-burgundy/40 flex items-center gap-1 w-fit">
        <Video className="w-3 h-3" />
        Day 1 Reel
      </span>
    );
  }
  if (type === 'poster') {
    return (
      <span className="px-2 py-0.5 rounded text-2xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 flex items-center gap-1 w-fit">
        <Layers className="w-3 h-3" />
        Day 2 Poster
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded text-2xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 flex items-center gap-1 w-fit">
      <FileText className="w-3 h-3" />
      Day 3 Essay
    </span>
  );
}

function FormatBadge({ sub }: { sub: CompetitionSubmissionItem }) {
  const url = (sub.submission_url || '').toLowerCase();
  const base = 'px-2 py-0.5 rounded text-2xs font-semibold border flex items-center gap-1 w-fit';
  if (sub.documentType === 'pdf') {
    return (
      <span className={`${base} bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800`}>
        <FileCode className="w-3 h-3" />
        PDF Document
      </span>
    );
  }
  if (sub.documentType === 'docx') {
    return (
      <span className={`${base} bg-slate-100 text-slate-700 border-slate-200 dark:bg-[#1C0A0D] dark:text-slate-300 dark:border-[#3D1418]`}>
        <FileText className="w-3 h-3" />
        Word (DOCX)
      </span>
    );
  }
  if (sub.competition_type === 'reels' && url.includes('drive.google')) {
    return (
      <span className={`${base} bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800`}>
        <AlertCircle className="w-3 h-3" />
        Drive Link (Needs Social URL)
      </span>
    );
  }
  const label =
    sub.competition_type === 'reels' && url.includes('instagram.com')
      ? 'Instagram Reel'
      : sub.competition_type === 'reels' && (url.includes('linkedin.com') || url.includes('lnkd.in'))
      ? 'LinkedIn Video'
      : sub.competition_type === 'reels' && (url.includes('youtube.com') || url.includes('youtu.be'))
      ? 'YouTube Short'
      : 'Web Link';
  return (
    <span className={`${base} bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700`}>
      <ExternalLink className="w-3 h-3" />
      {label}
    </span>
  );
}

export function AdminCompetitionsView() {
  const [submissions, setSubmissions] = useState<CompetitionSubmissionItem[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    reels: 0,
    poster: 0,
    essay: 0,
    documentsCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [trackFilter, setTrackFilter] = useState<TrackFilter>('all');
  const [pipelineFilter, setPipelineFilter] = useState<PipelineFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Evaluation drawer state
  const [selectedSubForEvaluation, setSelectedSubForEvaluation] = useState<CompetitionSubmissionItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);

  const fetchSubmissions = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/competitions');
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data.submissions || []);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error('Error fetching admin competitions data:', err);
      setFeedbackMsg({ text: 'Failed to load submissions from server.', isError: true });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  // Pick up evaluations recorded in other admin sessions. submission_evaluations
  // is service-role only, so this polls the admin API instead of Supabase Realtime.
  useEvaluationPolling(COMPETITION_EVALUATION_CATEGORIES, (evaluations) => {
    const byTarget = new Map(evaluations.map((ev) => [ev.target_id, ev]));
    setSubmissions((prev) => {
      let changed = false;
      const next = prev.map((sub) => {
        const ev = byTarget.get(sub.id);
        if (!ev || ev.updated_at === sub.evaluation?.updated_at) return sub;
        changed = true;
        return { ...sub, evaluation: ev };
      });
      return changed ? next : prev;
    });
    setSelectedSubForEvaluation((curr) => {
      const ev = curr ? byTarget.get(curr.id) : undefined;
      if (!curr || !ev || ev.updated_at === curr.evaluation?.updated_at) return curr;
      return { ...curr, evaluation: ev };
    });
  });

  // Quick Action: Download / Inspect & Auto-Tick in DB
  const handleQuickDownload = async (sub: CompetitionSubmissionItem) => {
    try {
      setActionInProgressId(sub.id);
      const link = document.createElement('a');
      link.href = sub.submission_url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      if (sub.isDocument) link.download = '';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      const res = await fetch('/api/admin/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: sub.competition_type,
          target_id: sub.id,
          action: 'mark_download',
        }),
      });

      const json = await res.json();
      if (json.success && json.evaluation) {
        setSubmissions((prev) =>
          prev.map((s) => (s.id === sub.id ? { ...s, evaluation: json.evaluation } : s))
        );
      }
    } catch (err) {
      console.error('Error logging competition download:', err);
    } finally {
      setActionInProgressId(null);
    }
  };

  // Quick Action: Toggle Next Round Shortlist
  const handleQuickToggleNextRound = async (sub: CompetitionSubmissionItem) => {
    try {
      setActionInProgressId(sub.id);
      const res = await fetch('/api/admin/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: sub.competition_type,
          target_id: sub.id,
          action: 'toggle_next_round',
        }),
      });

      const json = await res.json();
      if (json.success && json.evaluation) {
        setSubmissions((prev) =>
          prev.map((s) => (s.id === sub.id ? { ...s, evaluation: json.evaluation } : s))
        );
      }
    } catch (err) {
      console.error('Error toggling competition next round:', err);
    } finally {
      setActionInProgressId(null);
    }
  };

  // Quick Action: Toggle Rejection
  const handleQuickToggleReject = async (sub: CompetitionSubmissionItem) => {
    try {
      setActionInProgressId(sub.id);
      const res = await fetch('/api/admin/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: sub.competition_type,
          target_id: sub.id,
          action: 'toggle_reject',
        }),
      });

      const json = await res.json();
      if (json.success && json.evaluation) {
        setSubmissions((prev) =>
          prev.map((s) => (s.id === sub.id ? { ...s, evaluation: json.evaluation } : s))
        );
        const wasRejected = json.evaluation.status === 'rejected';
        setFeedbackMsg({
          text: wasRejected
            ? `Submission for ${sub.email} marked as rejected.`
            : `Rejection cleared for ${sub.email} (restored to review).`,
          isError: false,
        });
      } else {
        setFeedbackMsg({
          text: json.error || 'Failed to update rejection status.',
          isError: true,
        });
      }
    } catch (err) {
      console.error('Error toggling competition rejection:', err);
      setFeedbackMsg({ text: 'Network error updating rejection status.', isError: true });
    } finally {
      setActionInProgressId(null);
    }
  };

  const openEvaluationDesk = (sub: CompetitionSubmissionItem) => {
    setSelectedSubForEvaluation(sub);
    setIsDrawerOpen(true);
  };

  const handleEvaluationUpdated = (updated: SubmissionEvaluation) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === updated.target_id ? { ...s, evaluation: updated } : s))
    );
  };

  const handleDelete = async (sub: CompetitionSubmissionItem) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to remove the ${sub.competition_type.toUpperCase()} submission for ${sub.email}? This will reset their challenge status to pending so they can resubmit.`
    );
    if (!confirmDelete) return;

    try {
      setDeletingId(sub.id);
      const res = await fetch(`/api/admin/competitions?id=${encodeURIComponent(sub.id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFeedbackMsg({ text: data.message || 'Submission deleted successfully.', isError: false });
        await fetchSubmissions();
      } else {
        setFeedbackMsg({ text: data.error || 'Failed to delete submission.', isError: true });
      }
    } catch (err) {
      console.error('Error deleting submission:', err);
      setFeedbackMsg({ text: 'Network error deleting submission.', isError: true });
    } finally {
      setDeletingId(null);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const inTrack = useMemo(
    () => submissions.filter((sub) => trackFilter === 'all' || sub.competition_type === trackFilter),
    [submissions, trackFilter]
  );

  const filteredSubmissions = useMemo(() => {
    const pipeline = PIPELINE_FILTERS.find((f) => f.key === pipelineFilter)!;
    const query = searchQuery.toLowerCase().trim();
    const list = inTrack.filter((sub) => {
      if (!pipeline.match(sub)) return false;
      if (!query) return true;
      return (
        sub.email.toLowerCase().includes(query) ||
        (sub.fullName || '').toLowerCase().includes(query) ||
        (sub.submission_title || '').toLowerCase().includes(query) ||
        (sub.notes || '').toLowerCase().includes(query) ||
        sub.competition_type.toLowerCase().includes(query)
      );
    });
    if (sortBy === 'score') {
      return [...list].sort((x, y) => (y.evaluation?.score ?? -1) - (x.evaluation?.score ?? -1));
    }
    return list;
  }, [inTrack, pipelineFilter, searchQuery, sortBy]);

  const exportCSV = () => {
    if (filteredSubmissions.length === 0) return;

    const headers = [
      'Participant Name',
      'Email',
      'Competition Track',
      'Day',
      'Submission Mode',
      'Document Format',
      'Submission / File URL',
      'Submission Title',
      'Notes / Abstract',
      'Round 2 Shortlisted',
      'Evaluation Status',
      'Score',
      'Downloaded',
      'Downloaded By',
      'Submitted At (UTC)',
    ];

    const rows = filteredSubmissions.map((sub) => {
      const day =
        sub.competition_type === 'reels' ? 'Day 1' : sub.competition_type === 'poster' ? 'Day 2' : 'Day 3';
      const mode = sub.isDocument ? 'Uploaded Document' : 'External Web Link';
      const format = sub.documentType.toUpperCase();

      return [
        `"${(sub.fullName || '').replace(/"/g, '""')}"`,
        `"${sub.email.replace(/"/g, '""')}"`,
        `"${sub.competition_type.toUpperCase()}"`,
        `"${day}"`,
        `"${mode}"`,
        `"${format}"`,
        `"${sub.submission_url.replace(/"/g, '""')}"`,
        `"${(sub.submission_title || '').replace(/"/g, '""')}"`,
        `"${(sub.notes || '').replace(/"/g, '""')}"`,
        sub.evaluation?.is_next_round ? 'YES (Round 2)' : 'NO',
        sub.evaluation?.status || 'pending',
        sub.evaluation?.score !== null && sub.evaluation?.score !== undefined ? String(sub.evaluation.score) : 'N/A',
        sub.evaluation?.downloaded ? 'YES' : 'NO',
        `"${(sub.evaluation?.downloaded_by || '').replace(/"/g, '""')}"`,
        `"${sub.submitted_at}"`,
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `qff_competition_submissions_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="p-6 bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-burgundy/10 dark:bg-burgundy/20 text-burgundy dark:text-[#E89BA5]">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-[#FAF6F3]">
                Daily Competitions & Jury Registry
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Review, filter, inspect, and export participant submissions across Day 1 (Reels), Day 2 (Digital Poster), and Day 3 (Quantum Essay). Supports direct document downloads (.pdf / .docx) and web links.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={exportCSV}
              disabled={filteredSubmissions.length === 0}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV ({filteredSubmissions.length})</span>
            </button>

            <button
              type="button"
              onClick={fetchSubmissions}
              disabled={isLoading}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-[#3D1418] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1E0B0E] transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh submissions"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div
            className={`p-3.5 rounded-lg text-xs flex items-center justify-between gap-2.5 ${
              feedbackMsg.isError
                ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300'
                : 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedbackMsg.isError ? (
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              )}
              <span>{feedbackMsg.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedbackMsg(null)}
              className="text-xs font-semibold underline hover:opacity-75"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#1A0A0D] border border-slate-100 dark:border-[#331115]">
            <span className="text-2xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Entries
            </span>
            <div className="text-lg font-bold text-slate-900 dark:text-[#FAF6F3] mt-0.5">
              {stats.total}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#1A0A0D] border border-slate-100 dark:border-[#331115]">
            <span className="text-2xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Day 1 Reels
            </span>
            <div className="text-lg font-bold text-burgundy dark:text-[#E89BA5] mt-0.5">
              {stats.reels}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#1A0A0D] border border-slate-100 dark:border-[#331115]">
            <span className="text-2xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Day 2 Posters
            </span>
            <div className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-0.5">
              {stats.poster}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#1A0A0D] border border-slate-100 dark:border-[#331115]">
            <span className="text-2xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Day 3 Essays
            </span>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {stats.essay}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#1A0A0D] border border-slate-100 dark:border-[#331115]">
            <span className="text-2xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Uploaded Docs
            </span>
            <div className="text-lg font-bold text-burgundy dark:text-[#E89BA5] mt-0.5">
              {stats.documentsCount}
            </div>
          </div>
        </div>
      </div>

      {/* Review Pipeline */}
      <div className="p-4 bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-xl shadow-xs space-y-3">
        <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50 dark:bg-[#1C0A0D]/70 rounded-lg border border-slate-200 dark:border-[#3D1418]">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-2">Review Pipeline:</span>
          {PIPELINE_FILTERS.map((f) => {
            const n = inTrack.filter(f.match).length;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setPipelineFilter(f.key)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  pipelineFilter === f.key
                    ? `bg-white dark:bg-[#250D11] shadow-xs border border-slate-200 dark:border-[#3D1418] ${f.activeTone}`
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {f.label} ({n})
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <div className="lg:col-span-2 relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search participant, email, title, notes..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 dark:border-[#3D1418] bg-white dark:bg-[#1C0A0D] text-slate-900 dark:text-[#FAF6F3] rounded-lg focus:outline-none focus:ring-1 focus:ring-burgundy"
            />
          </div>
          <select
            value={trackFilter}
            onChange={(e) => setTrackFilter(e.target.value as TrackFilter)}
            className="w-full px-2.5 py-1.5 text-xs border border-slate-300 dark:border-[#3D1418] bg-white dark:bg-[#1C0A0D] text-slate-900 dark:text-[#FAF6F3] rounded-lg focus:outline-none focus:ring-1 focus:ring-burgundy"
          >
            <option value="all">All Competitions ({submissions.length})</option>
            <option value="reels">Day 1 · Tech Reels ({stats.reels})</option>
            <option value="poster">Day 2 · Digital Poster ({stats.poster})</option>
            <option value="essay">Day 3 · Essay ({stats.essay})</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="w-full px-2.5 py-1.5 text-xs border border-slate-300 dark:border-[#3D1418] bg-white dark:bg-[#1C0A0D] text-slate-900 dark:text-[#FAF6F3] rounded-lg focus:outline-none focus:ring-1 focus:ring-burgundy"
          >
            <option value="newest">Newest first</option>
            <option value="score">Highest score first</option>
          </select>
        </div>
      </div>

      {/* Submission Cards */}
      {isLoading ? (
        <div className="p-12 bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-xl text-center text-slate-500 dark:text-slate-400 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-burgundy dark:text-[#E89BA5]" />
          <p className="text-xs">Loading competition registry...</p>
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="p-12 bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-xl text-center text-slate-500 dark:text-slate-400 space-y-2">
          <Trophy className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No competition submissions found</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? 'No entries match your search query. Try clearing the filter.'
              : 'No entries in this part of the review pipeline.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSubmissions.map((sub, idx) => {
            const isExpanded = expandedIds.has(sub.id);
            const busy = actionInProgressId === sub.id;
            return (
              <div
                key={sub.id}
                className="bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-xl shadow-xs overflow-hidden"
              >
                {/* Entry Header Strip */}
                <div
                  onClick={() => toggleExpand(sub.id)}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/70 dark:hover:bg-[#1C0A0D]/70 transition-colors"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-base text-slate-900 dark:text-[#FAF6F3]">
                        #{idx + 1} {sub.fullName || sub.email.split('@')[0]}
                      </span>
                      <TrackBadge type={sub.competition_type} />
                      <FormatBadge sub={sub} />
                      {sub.evaluation?.is_next_round && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          Shortlisted
                        </span>
                      )}
                      {sub.evaluation?.status === 'rejected' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-700 flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                          Rejected
                        </span>
                      )}
                      {sub.evaluation?.result_released_at && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                          Result released
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
                      <span className="font-mono">{sub.email}</span>
                      <span>·</span>
                      <span className="truncate max-w-md">
                        {sub.submission_title ? <strong>{sub.submission_title}</strong> : <em className="text-slate-400">No custom title</em>}
                      </span>
                      <span>·</span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {new Date(sub.submitted_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
                    <a
                      href={sub.submission_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="px-2.5 py-1 rounded bg-slate-900 dark:bg-[#250D11] hover:bg-slate-800 text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <span>Open Entry</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                    <button type="button" aria-label={isExpanded ? 'Collapse' : 'Expand'} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Evaluation & Review Strip */}
                <div className="border-t border-slate-100 dark:border-[#3D1418] bg-slate-50/70 dark:bg-[#180709] px-4 py-2.5 sm:px-5 flex flex-wrap items-center justify-between gap-2.5 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickDownload(sub)}
                      disabled={busy}
                      className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50 ${
                        sub.evaluation?.downloaded
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100'
                          : 'bg-burgundy hover:bg-burgundy-deep text-white'
                      }`}
                      title="Download / inspect the entry and register the inspection"
                    >
                      {busy ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : sub.evaluation?.downloaded ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {sub.evaluation?.downloaded
                          ? `Inspected (${sub.evaluation.downloaded_by?.split(' ')[0] || 'Admin'})`
                          : sub.isDocument
                          ? 'Download Document'
                          : 'Open & Mark Inspected'}
                      </span>
                    </button>
                    {sub.evaluation?.downloaded && sub.evaluation.downloaded_at && (
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 hidden md:inline">
                        Verified {new Date(sub.evaluation.downloaded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickToggleNextRound(sub)}
                      disabled={busy}
                      className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50 ${
                        sub.evaluation?.is_next_round
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500'
                          : 'bg-white dark:bg-[#1C0A0D] hover:bg-slate-100 dark:hover:bg-[#250D11] text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-[#3D1418]'
                      }`}
                      title="Toggle shortlist"
                    >
                      <CheckCircle2 className={`w-3.5 h-3.5 ${sub.evaluation?.is_next_round ? 'text-white' : 'text-slate-400'}`} />
                      <span>{sub.evaluation?.is_next_round ? 'Shortlisted' : 'Shortlist'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickToggleReject(sub)}
                      disabled={busy}
                      className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50 ${
                        sub.evaluation?.status === 'rejected'
                          ? 'bg-rose-600 hover:bg-rose-700 text-white border border-rose-500'
                          : 'bg-white dark:bg-[#1C0A0D] hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-[#3D1418]'
                      }`}
                      title={sub.evaluation?.status === 'rejected' ? 'Undo rejection (restore to review)' : 'Reject submission'}
                    >
                      <XCircle className={`w-3.5 h-3.5 ${sub.evaluation?.status === 'rejected' ? 'text-white' : 'text-slate-400'}`} />
                      <span>{sub.evaluation?.status === 'rejected' ? 'Rejected' : 'Reject'}</span>
                    </button>

                    {sub.evaluation?.score !== null && sub.evaluation?.score !== undefined && (
                      <span className="px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-mono font-bold">
                        {sub.evaluation.score}/100 pts
                      </span>
                    )}

                    {sub.evaluation?.comments && sub.evaluation.comments.length > 0 && (
                      <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-[#1C0A0D] border border-slate-200 dark:border-[#3D1418] text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-burgundy dark:text-[#E89BA5]" />
                        <span>{sub.evaluation.comments.length}</span>
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => openEvaluationDesk(sub)}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-[#250D11] hover:bg-slate-800 text-white font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Review Desk</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(sub)}
                      disabled={deletingId === sub.id}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors cursor-pointer disabled:opacity-50"
                      title="Reset submission (allow resubmission)"
                    >
                      {deletingId === sub.id ? <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Entry Details */}
                {isExpanded && (
                  <div className="border-t border-slate-100 dark:border-[#3D1418] bg-slate-50/50 dark:bg-[#1C0A0D]/50 p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
                    <dl className="space-y-2">
                      <div>
                        <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Submission URL</dt>
                        <dd className="font-mono break-all text-slate-700 dark:text-slate-300">{sub.submission_url}</dd>
                      </div>
                      {sub.notes && sub.notes !== 'file_upload' && (
                        <div>
                          <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Participant notes</dt>
                          <dd className="text-slate-700 dark:text-slate-300 whitespace-pre-line">{sub.notes}</dd>
                        </div>
                      )}
                      <div>
                        <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Submission ID</dt>
                        <dd className="font-mono text-slate-500 dark:text-slate-400">{sub.id}</dd>
                      </div>
                    </dl>
                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Inspection log ({sub.evaluation?.downloads?.length || 0})
                      </p>
                      {sub.evaluation?.downloads && sub.evaluation.downloads.length > 0 ? (
                        <ul className="space-y-1 text-slate-700 dark:text-slate-300">
                          {sub.evaluation.downloads.map((d, i) => (
                            <li key={`${d.evaluator_email}-${d.downloaded_at}-${i}`}>
                              {d.evaluator_name} · {new Date(d.downloaded_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-slate-400 italic">Not inspected yet.</p>
                      )}
                      {sub.evaluation?.last_evaluated_by_name && (
                        <p className="text-slate-500 dark:text-slate-400">
                          Last evaluated by {sub.evaluation.last_evaluated_by_name}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Evaluation Drawer Modal */}
      {selectedSubForEvaluation && (
        <EvaluationDrawer
          isOpen={isDrawerOpen}
          onClose={() => {
            setIsDrawerOpen(false);
            setSelectedSubForEvaluation(null);
          }}
          category={selectedSubForEvaluation.competition_type}
          targetId={selectedSubForEvaluation.id}
          targetTitle={`${selectedSubForEvaluation.fullName || selectedSubForEvaluation.email} (${selectedSubForEvaluation.competition_type.toUpperCase()})`}
          targetSubtitle={selectedSubForEvaluation.submission_title || selectedSubForEvaluation.notes || 'Creative Competition Entry'}
          targetUrl={selectedSubForEvaluation.submission_url}
          initialEvaluation={selectedSubForEvaluation.evaluation}
          onEvaluationUpdated={handleEvaluationUpdated}
        />
      )}
    </div>
  );
}
