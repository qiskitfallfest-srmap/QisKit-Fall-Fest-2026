'use client';

import React, { useState, useEffect } from 'react';
import { useCurriculumSessions } from '@/hooks/use-curriculum-sessions';
import { CURRICULUM_SESSIONS } from '@/data/learning/curriculum';
import { extractYoutubeId } from '@/lib/youtube';
import {
  Video,
  Radio,
  ExternalLink,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  Calendar,
  Sparkles,
  Link as LinkIcon,
  Play,
  Eye,
  Sliders,
} from 'lucide-react';

export function AdminSessionsManager() {
  const { sessions, overrides, mutate } = useCurriculumSessions();

  const [selectedSessionId, setSelectedSessionId] = useState<string>('session-1');
  const [formData, setFormData] = useState({
    youtubeUrl: '',
    lectureNotesUrl: '',
    slidesUrl: '',
    liveMeetingUrl: '',
    isLive: false,
    liveNotice: '',
    title: '',
    timeStr: '',
    dateStr: '',
    duration: '',
    description: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [statusIsError, setStatusIsError] = useState(false);

  // Sync form when selected session or overrides change
  useEffect(() => {
    const base = CURRICULUM_SESSIONS.find((s) => s.id === selectedSessionId);
    const override = overrides[selectedSessionId] || {};

    if (base) {
      setFormData({
        youtubeUrl: override.youtubeUrl || (override.youtubeId ? `https://www.youtube.com/watch?v=${override.youtubeId}` : base.youtubeUrl),
        lectureNotesUrl: override.lectureNotesUrl !== undefined ? override.lectureNotesUrl : (base.lectureNotesUrl || ''),
        slidesUrl: override.slidesUrl !== undefined ? override.slidesUrl : (base.slidesUrl || ''),
        liveMeetingUrl: override.liveMeetingUrl || '',
        isLive: Boolean(override.isLive),
        liveNotice: override.liveNotice || '',
        title: override.title || base.title,
        timeStr: override.timeStr || base.timeStr,
        dateStr: override.dateStr || base.dateStr,
        duration: override.duration || base.duration,
        description: override.description || base.description,
      });
      setStatusMsg('');
    }
  }, [selectedSessionId, overrides]);

  const currentBase = CURRICULUM_SESSIONS.find((s) => s.id === selectedSessionId);
  const currentMerged = sessions.find((s) => s.id === selectedSessionId) || currentBase;
  const currentOverride = overrides[selectedSessionId] || null;

  // Real-time extracted preview ID
  const previewYoutubeId = extractYoutubeId(formData.youtubeUrl) || currentMerged?.youtubeId;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      setIsSaving(true);
      setStatusMsg('');
      setStatusIsError(false);

      const updates: Record<string, any> = {
        youtubeUrl: formData.youtubeUrl.trim(),
        lectureNotesUrl: formData.lectureNotesUrl.trim() || undefined,
        slidesUrl: formData.slidesUrl.trim() || undefined,
        liveMeetingUrl: formData.liveMeetingUrl.trim() || undefined,
        isLive: formData.isLive,
        liveNotice: formData.liveNotice.trim() || undefined,
        title: formData.title.trim() !== currentBase?.title ? formData.title.trim() : undefined,
        timeStr: formData.timeStr.trim() !== currentBase?.timeStr ? formData.timeStr.trim() : undefined,
        dateStr: formData.dateStr.trim() !== currentBase?.dateStr ? formData.dateStr.trim() : undefined,
        duration: formData.duration.trim() !== currentBase?.duration ? formData.duration.trim() : undefined,
        description: formData.description.trim() !== currentBase?.description ? formData.description.trim() : undefined,
      };

      const res = await fetch('/api/learning/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: selectedSessionId,
          updates,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatusMsg(`Saved changes for ${currentBase?.title || selectedSessionId} & synced with Redis!`);
        setStatusIsError(false);
        await mutate();
      } else {
        setStatusMsg(data.error || 'Failed to update session');
        setStatusIsError(true);
      }
    } catch (err: any) {
      console.error('Error saving session updates:', err);
      setStatusMsg(err?.message || 'Error communicating with server');
      setStatusIsError(true);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleReset() {
    if (!confirm(`Are you sure you want to revert ${currentBase?.title || selectedSessionId} back to its default curriculum settings?`)) {
      return;
    }

    try {
      setIsResetting(true);
      setStatusMsg('');
      setStatusIsError(false);

      const res = await fetch('/api/learning/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: selectedSessionId,
          reset: true,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatusMsg(`Reset ${selectedSessionId} to default curriculum links!`);
        setStatusIsError(false);
        await mutate();
      } else {
        setStatusMsg(data.error || 'Failed to reset session');
        setStatusIsError(true);
      }
    } catch (err: any) {
      console.error('Error resetting session:', err);
      setStatusMsg(err?.message || 'Error communicating with server');
      setStatusIsError(true);
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-xl shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-burgundy/10 text-burgundy dark:bg-burgundy/20 dark:text-[#E89BA5]">
                <Radio className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-[#FAF6F3]">
                Live Curriculum & Video Links Dispatcher
              </h2>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
              Dynamically update lecture video URLs, YouTube recording embeds, Google Meet/Zoom live streams,
              lecture documentation, and slides for all 6 sessions without redeploying code.
            </p>
          </div>

          <a
            href={`/learning/session/${selectedSessionId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="self-start md:self-auto px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#1C0A0D] dark:hover:bg-[#250D11] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-[#3D1418] inline-flex items-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-burgundy dark:text-[#E89BA5]" />
            Preview Student Portal
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
        </div>

        {/* Sessions Fast Switcher Tabs */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {CURRICULUM_SESSIONS.map((sess) => {
            const isSelected = sess.id === selectedSessionId;
            const hasOverride = Boolean(overrides[sess.id]);
            const isLive = Boolean(overrides[sess.id]?.isLive);

            return (
              <button
                key={sess.id}
                type="button"
                onClick={() => setSelectedSessionId(sess.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'border-burgundy dark:border-[#E89BA5] bg-burgundy/5 dark:bg-burgundy/15 ring-2 ring-burgundy/20 dark:ring-[#E89BA5]/20 shadow-xs'
                    : 'border-slate-200 dark:border-[#3D1418] bg-white dark:bg-[#150709] hover:bg-slate-50 dark:hover:bg-[#1C0A0D]'
                }`}
              >
                <div className="flex items-center justify-between gap-1 w-full mb-1.5">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Day 0{sess.day} · S0{sess.sessionNumber}
                  </span>
                  {isLive && (
                    <span className="flex items-center gap-1 text-[9px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
                      LIVE
                    </span>
                  )}
                </div>

                <div className="text-xs font-semibold text-slate-900 dark:text-[#FAF6F3] line-clamp-2 leading-snug">
                  {sess.title}
                </div>

                <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-[#220B0F] flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                  <span>{sess.duration}</span>
                  {hasOverride && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-mono font-medium text-[9px]">
                      Custom
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Form & Live Video Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Editor Form (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#3D1418] pb-4">
            <div>
              <span className="font-mono text-[11px] font-bold text-burgundy dark:text-[#E89BA5] uppercase tracking-wider block">
                Session {currentBase?.sessionNumber} Configuration
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-[#FAF6F3]">
                {currentBase?.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Speaker: {currentBase?.speaker.name} ({currentBase?.speaker.institution})
              </p>
            </div>

            {currentOverride && (
              <span className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-mono text-[11px] font-semibold shrink-0">
                Override Active
              </span>
            )}
          </div>

          {/* Feedback Message */}
          {statusMsg && (
            <div
              className={`p-3.5 rounded-lg text-xs flex items-center gap-2.5 ${
                statusIsError
                  ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              }`}
            >
              {statusIsError ? (
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              )}
              <span className="font-medium">{statusMsg}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-5">
            {/* 1. Live Streaming Broadcast Controls */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1A080B] border border-slate-200 dark:border-[#3D1418] space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-burgundy dark:text-[#E89BA5]" />
                  <span className="text-xs font-bold text-slate-900 dark:text-[#FAF6F3]">
                    Live Broadcast Status
                  </span>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isLive}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isLive: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
                  <span className="ml-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {formData.isLive ? 'BROADCASTING LIVE' : 'Offline / Recording'}
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Live Meeting / Stream Join URL (Google Meet, Zoom, YouTube Live):
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={formData.liveMeetingUrl}
                    onChange={(e) => setFormData((prev) => ({ ...prev, liveMeetingUrl: e.target.value }))}
                    placeholder="https://meet.google.com/xyz-abcd-efg or Zoom link"
                    className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 dark:border-[#3D1418] bg-white dark:bg-[#150709] text-slate-900 dark:text-[#FAF6F3] rounded-lg focus:outline-none focus:ring-1 focus:ring-burgundy focus:border-burgundy"
                  />
                  <Video className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  When populated, students will see a prominent &quot;Join Live Session&quot; button on their screen.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Live Announcement Banner Notice (Optional):
                </label>
                <input
                  type="text"
                  value={formData.liveNotice}
                  onChange={(e) => setFormData((prev) => ({ ...prev, liveNotice: e.target.value }))}
                  placeholder="e.g. Session is live now! Please join the Google Meet room early for Q&A."
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-[#3D1418] bg-white dark:bg-[#150709] text-slate-900 dark:text-[#FAF6F3] rounded-lg focus:outline-none focus:ring-1 focus:ring-burgundy focus:border-burgundy"
                />
              </div>
            </div>

            {/* 2. Video Source Link */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-900 dark:text-[#FAF6F3]">
                YouTube Video URL or Video ID:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.youtubeUrl}
                  onChange={(e) => setFormData((prev) => ({ ...prev, youtubeUrl: e.target.value }))}
                  placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/... or 11-char ID"
                  className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 dark:border-[#3D1418] bg-white dark:bg-[#1C0A0D] text-slate-900 dark:text-[#FAF6F3] rounded-lg focus:outline-none focus:ring-1 focus:ring-burgundy focus:border-burgundy"
                />
                <Play className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 dark:text-slate-400 font-mono">
                  Extracted ID: <strong className="text-burgundy dark:text-[#E89BA5]">{previewYoutubeId || 'None'}</strong>
                </span>
                <span className="text-slate-400">Supports watch, shortlink, embed, and live URLs</span>
              </div>
            </div>

            {/* 3. Learning Documentation & Resource Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Lecture Guide & Documentation URL:
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={formData.lectureNotesUrl}
                    onChange={(e) => setFormData((prev) => ({ ...prev, lectureNotesUrl: e.target.value }))}
                    placeholder="https://docs.quantum.ibm.com/..."
                    className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 dark:border-[#3D1418] bg-white dark:bg-[#1C0A0D] text-slate-900 dark:text-[#FAF6F3] rounded-lg focus:outline-none focus:ring-1 focus:ring-burgundy focus:border-burgundy"
                  />
                  <FileText className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Slides & Companion Code URL:
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={formData.slidesUrl}
                    onChange={(e) => setFormData((prev) => ({ ...prev, slidesUrl: e.target.value }))}
                    placeholder="https://github.com/... or Google Drive"
                    className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 dark:border-[#3D1418] bg-white dark:bg-[#1C0A0D] text-slate-900 dark:text-[#FAF6F3] rounded-lg focus:outline-none focus:ring-1 focus:ring-burgundy focus:border-burgundy"
                  />
                  <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>
            </div>

            {/* 4. Schedule and Title Details */}
            <div className="pt-3 border-t border-slate-100 dark:border-[#3D1418] space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Session Metadata (Optional Schedule Overrides)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Display Title:
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 dark:border-[#3D1418] bg-white dark:bg-[#1C0A0D] text-slate-900 dark:text-[#FAF6F3] rounded focus:outline-none focus:ring-1 focus:ring-burgundy"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Duration:
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData((prev) => ({ ...prev, duration: e.target.value }))}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 dark:border-[#3D1418] bg-white dark:bg-[#1C0A0D] text-slate-900 dark:text-[#FAF6F3] rounded focus:outline-none focus:ring-1 focus:ring-burgundy"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Time String:
                  </label>
                  <input
                    type="text"
                    value={formData.timeStr}
                    onChange={(e) => setFormData((prev) => ({ ...prev, timeStr: e.target.value }))}
                    placeholder="10:00 AM – 12:00 PM IST"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 dark:border-[#3D1418] bg-white dark:bg-[#1C0A0D] text-slate-900 dark:text-[#FAF6F3] rounded focus:outline-none focus:ring-1 focus:ring-burgundy"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date String:
                  </label>
                  <input
                    type="text"
                    value={formData.dateStr}
                    onChange={(e) => setFormData((prev) => ({ ...prev, dateStr: e.target.value }))}
                    placeholder="Day 1 · 08 October 2026"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 dark:border-[#3D1418] bg-white dark:bg-[#1C0A0D] text-slate-900 dark:text-[#FAF6F3] rounded focus:outline-none focus:ring-1 focus:ring-burgundy"
                  />
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-4 border-t border-slate-100 dark:border-[#3D1418] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-lg bg-burgundy hover:bg-burgundy-deep text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSaving ? 'Publishing Updates...' : 'Publish Live Updates'}
                </button>

                {currentOverride && (
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={isResetting}
                    className="px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-[#3D1418] bg-white dark:bg-[#150709] hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-700 dark:text-rose-400 text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    {isResetting ? 'Reverting...' : 'Revert to Default'}
                  </button>
                )}
              </div>

              <a
                href={`/learning/session/${selectedSessionId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-burgundy dark:hover:text-[#E89BA5] flex items-center gap-1 transition-colors"
              >
                <span>Test Live Link in Student View</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </form>
        </div>

        {/* Right Column: Live Embed Preview & Quick Specs (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Real-time Video Embed Preview */}
          <div className="bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-burgundy dark:text-[#E89BA5] flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5" />
                Live Video Embed Preview
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {previewYoutubeId ? `ID: ${previewYoutubeId}` : 'No Video'}
              </span>
            </div>

            <div className="aspect-video w-full rounded-lg overflow-hidden bg-black border border-slate-200 dark:border-[#3D1418] relative shadow-inner">
              {previewYoutubeId ? (
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${previewYoutubeId}?rel=0&modestbranding=1`}
                  title="Session Video Preview"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-slate-400">
                  <Video className="w-8 h-8 opacity-40 mb-2" />
                  <p className="text-xs font-semibold">No YouTube Embed Configured</p>
                  <p className="text-[11px] opacity-75 mt-0.5">Enter a valid YouTube link or video ID to preview</p>
                </div>
              )}
            </div>

            {formData.isLive && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-red-600 mt-1 shrink-0 animate-ping" />
                <div className="text-xs">
                  <strong className="text-red-700 dark:text-red-300 font-semibold block">
                    🔴 Live Streaming Banner Active
                  </strong>
                  <p className="text-red-600 dark:text-red-400 text-[11px] mt-0.5">
                    {formData.liveNotice || 'Live stream is broadcasting. Participants will see the alert immediately.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Details Card */}
          <div className="bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-xl p-5 shadow-xs space-y-3">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Curriculum Metadata Reference
            </span>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-[#220B0F]">
                <span className="text-slate-500">Day & Slot:</span>
                <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                  Day 0{currentBase?.day} · Session {currentBase?.sessionNumber}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-[#220B0F]">
                <span className="text-slate-500">Scheduled Time:</span>
                <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                  {currentBase?.timeStr}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-[#220B0F]">
                <span className="text-slate-500">Lecturer:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {currentBase?.speaker.name}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">Default YouTube ID:</span>
                <span className="font-mono text-slate-600 dark:text-slate-400">
                  {currentBase?.youtubeId}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Table of All Sessions */}
      <div className="bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-burgundy dark:text-[#E89BA5]" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-[#FAF6F3]">
              All Sessions Real-Time Status Matrix
            </h3>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            6 of 6 Curriculum Lectures
          </span>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#3D1418] text-slate-500 dark:text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3">Session</th>
                <th className="py-2.5 px-3">Title</th>
                <th className="py-2.5 px-3">Live Status</th>
                <th className="py-2.5 px-3">Video Embed</th>
                <th className="py-2.5 px-3">Resources</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#220B0F]">
              {sessions.map((sess) => {
                const isSelected = sess.id === selectedSessionId;
                const hasOverride = Boolean(overrides[sess.id]);

                return (
                  <tr
                    key={sess.id}
                    className={`hover:bg-slate-50/80 dark:hover:bg-[#1A080B]/80 transition-colors ${
                      isSelected ? 'bg-burgundy/5 dark:bg-burgundy/10' : ''
                    }`}
                  >
                    <td className="py-3 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                      Day {sess.day} · S{sess.sessionNumber}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-900 dark:text-[#FAF6F3]">
                      <div className="truncate max-w-xs">{sess.title}</div>
                      <span className="text-[10px] text-slate-500 font-mono">{sess.timeStr}</span>
                    </td>
                    <td className="py-3 px-3">
                      {sess.isLive ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 font-mono text-[10px] font-bold animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
                          LIVE
                        </span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 font-mono text-[11px]">
                          Offline
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Play className="w-3 h-3 text-burgundy dark:text-[#E89BA5]" />
                        <span>{sess.youtubeId}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 space-x-2">
                      {sess.lectureNotesUrl && (
                        <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#1C0A0D] text-[10px] font-mono text-slate-600 dark:text-slate-300">
                          Notes
                        </span>
                      )}
                      {sess.slidesUrl && (
                        <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#1C0A0D] text-[10px] font-mono text-slate-600 dark:text-slate-300">
                          Slides
                        </span>
                      )}
                      {sess.liveMeetingUrl && (
                        <span className="inline-block px-1.5 py-0.5 rounded bg-burgundy/10 text-burgundy dark:text-[#E89BA5] text-[10px] font-mono">
                          Meet
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedSessionId(sess.id)}
                        className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-burgundy text-white'
                            : 'bg-slate-100 dark:bg-[#1C0A0D] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#250D11]'
                        }`}
                      >
                        {isSelected ? 'Editing' : 'Edit'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
