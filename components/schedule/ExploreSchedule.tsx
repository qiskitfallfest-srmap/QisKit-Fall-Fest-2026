'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Filter,
  Heart,
  MapPin,
  Play,
  Search,
  Sparkles,
  Users,
  BookOpen,
  Award,
  X,
} from 'lucide-react';
import { Day, SchedulePhase, Session, Track } from '@/data/schedule.types';
import { getPhaseDays, getPhaseInfo, filterSessions } from '@/data/schedule.utils';
import { REGISTRATION_URL } from '@/lib/constants';
import { PhaseSelector } from './PhaseSelector';

const posterImage = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="300" viewBox="0 0 600 300"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%233A0B10"/><stop offset="50%" stop-color="%236C151E"/><stop offset="100%" stop-color="%23120506"/></linearGradient></defs><rect width="600" height="300" fill="url(%23g)"/><g opacity="0.3" stroke="%23F5DABF" stroke-width="1.5" fill="none"><polygon points="300,40 420,95 420,205 300,260 180,205 180,95"/><line x1="300" y1="40" x2="300" y2="150"/><line x1="420" y1="95" x2="300" y2="150"/><line x1="180" y1="95" x2="300" y2="150"/><line x1="300" y1="150" x2="300" y2="260"/><line x1="420" y1="205" x2="300" y2="150"/><line x1="180" y1="205" x2="300" y2="150"/></g></svg>';

const tracks = ['All', 'Workshop', 'Talk', 'Hackathon', 'Networking', 'Community'] as const;

type ToastState = { message: string } | null;

interface ExploreScheduleProps {
  currentPhase: SchedulePhase;
  onPhaseChange: (phase: SchedulePhase) => void;
}

export function ExploreSchedule({ currentPhase, onPhaseChange }: ExploreScheduleProps) {
  const [dayIndex, setDayIndex] = useState(0);
  const [activeTrack, setActiveTrack] = useState<(typeof tracks)[number]>('All');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  // Load saved sessions from localStorage on client render
  useEffect(() => {
    try {
      const stored = localStorage.getItem('qff_saved_sessions_2026');
      if (stored) {
        setSavedIds(JSON.parse(stored));
      } else {
        setSavedIds(['on-d1-session-1']);
      }
    } catch {
      setSavedIds(['on-d1-session-1']);
    }
  }, []);

  // Save sessions to localStorage when updated
  const updateSavedIds = (newSaved: string[]) => {
    setSavedIds(newSaved);
    try {
      localStorage.setItem('qff_saved_sessions_2026', JSON.stringify(newSaved));
    } catch {
      // ignore
    }
  };

  const phaseInfo = getPhaseInfo(currentPhase);
  const currentDays = getPhaseDays(currentPhase);

  // Reset day index & session selection when phase changes
  useEffect(() => {
    setDayIndex(0);
    setSelectedId(null);
    setSearch('');
    setActiveTrack('All');
    setShowSavedOnly(false);
  }, [currentPhase]);

  const activeDay: Day = currentDays[dayIndex] || currentDays[0];

  const visibleSessions = useMemo(() => {
    let list = activeDay ? activeDay.sessions : [];
    
    // Filter by track and search query
    list = filterSessions(list, activeTrack, search);

    // If My Schedule / Wishlist filter active
    if (showSavedOnly) {
      list = list.filter((s) => savedIds.includes(s.id));
    }

    return list;
  }, [activeDay, activeTrack, search, showSavedOnly, savedIds]);

  // Return null when no session is clicked so timeline expands full width
  const selectedSession = useMemo(() => {
    if (selectedId && activeDay) {
      const found = activeDay.sessions.find((s) => s.id === selectedId);
      if (found) return found;
    }
    return null;
  }, [selectedId, activeDay]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const selectDay = (index: number) => {
    setDayIndex(index);
    setSelectedId(null);
    setShowSavedOnly(false);
  };

  const toggleSaveSession = (session: Session, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const isSaved = savedIds.includes(session.id);
    const updated = isSaved
      ? savedIds.filter((id) => id !== session.id)
      : [...savedIds, session.id];
    updateSavedIds(updated);

    setToast({
      message: isSaved
        ? `Removed "${session.title}" from your schedule`
        : `Added "${session.title}" to your schedule`,
    });
  };

  const savedCount = savedIds.length;

  const renderDetailContent = (session: Session) => (
    <aside className="rounded-3xl border border-[#D9D0CB] dark:border-[rgba(108,21,30,0.4)] bg-white dark:bg-[#1C0709] p-5 sm:p-6 shadow-2xl space-y-5 transition-colors">
      
      {/* Header Track & Day Badge with Close (X) Button */}
      <div className="flex items-center justify-between border-b border-[#D9D0CB]/60 dark:border-white/10 pb-3 text-xs font-bold uppercase tracking-wider">
        <div className="flex items-center gap-2">
          <span className="font-mono rounded-full bg-[#6C151E] px-3 py-1 text-white">
            {session.track}
          </span>
          <span className="font-mono text-[#6C151E] dark:text-[#E45464]">
            {activeDay?.label} &middot; {activeDay?.date} 2026
          </span>
        </div>
        <button
          type="button"
          onClick={() => setSelectedId(null)}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-black/5 dark:bg-white/10 hover:bg-[#6C151E] hover:text-white transition-colors text-[#665B57] dark:text-[#BEB5B4]"
          title="Close detail panel"
          aria-label="Close session details"
        >
          <X size={15} />
        </button>
      </div>

      {/* Session Title & Description */}
      <div>
        <h3 className="font-serif text-2xl sm:text-3xl font-bold leading-tight text-[#13090A] dark:text-[#F6F2F1]">
          {session.title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-[#665B57] dark:text-[#BEB5B4]">
          {session.description}
        </p>
      </div>

      {/* Poster Visual Card */}
      <div className="relative h-44 w-full overflow-hidden rounded-2xl border border-[#D9D0CB] dark:border-white/10 bg-gradient-to-br from-[#3A0B10] to-[#120506]">
        {posterImage && (
          <Image
            src={posterImage}
            alt="Quantum visual"
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover opacity-80"
            referrerPolicy="no-referrer"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#13090A] via-transparent to-transparent opacity-80" />
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded backdrop-blur-sm">
            QISKIT MASTERCLASS
          </span>
          <span className="text-xs font-semibold text-[#F5DABF]">
            {session.duration}
          </span>
        </div>
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-medium text-[#261F1D] dark:text-[#E8E0DE]">
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F4F0EE] dark:bg-white/5">
          <Clock3 size={15} className="text-[#6C151E] dark:text-[#E45464]" />
          <span>{session.time} &ndash; {session.end}</span>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F4F0EE] dark:bg-white/5">
          <MapPin size={15} className="text-[#6C151E] dark:text-[#E45464]" />
          <span className="truncate">{session.location}</span>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F4F0EE] dark:bg-white/5">
          <Users size={15} className="text-[#6C151E] dark:text-[#E45464]" />
          <span>{session.level} Level</span>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F4F0EE] dark:bg-white/5">
          <Award size={15} className="text-[#6C151E] dark:text-[#E45464]" />
          <span>IST Timezone</span>
        </div>
      </div>

      {/* Speaker & Host Info */}
      {session.speaker && (
        <div className="border-t border-[#D9D0CB]/60 dark:border-white/10 pt-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#665B57] dark:text-[#BEB5B4] mb-2">
            Instructor / Lead
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#6C151E] text-sm font-bold text-white shadow-inner">
              {session.initials}
            </div>
            <div>
              <div className="text-sm font-bold text-[#13090A] dark:text-[#F6F2F1]">
                {session.speaker}
              </div>
              <div className="text-xs text-[#665B57] dark:text-[#BEB5B4]">
                {session.speakerRole}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Learning Objectives */}
      {session.learn && session.learn.length > 0 && (
        <div className="border-t border-[#D9D0CB]/60 dark:border-white/10 pt-4 space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#665B57] dark:text-[#BEB5B4] flex items-center gap-1.5">
            <BookOpen size={13} className="text-[#6C151E] dark:text-[#E45464]" />
            What You Will Learn:
          </div>
          <ul className="space-y-1.5 pl-1">
            {session.learn.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs leading-relaxed text-[#261F1D] dark:text-[#E8E0DE]">
                <Check size={14} className="mt-0.5 shrink-0 text-[#6C151E] dark:text-[#E45464]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={(e) => toggleSaveSession(session, e)}
          className={`flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-xs font-bold transition-all shadow-md ${
            savedIds.includes(session.id)
              ? 'bg-emerald-700 text-white hover:bg-emerald-800'
              : 'bg-[#6C151E] text-white hover:bg-[#4A0D14]'
          }`}
        >
          {savedIds.includes(session.id) ? (
            <>
              <Check size={15} />
              <span>Saved to Schedule</span>
            </>
          ) : (
            <>
              <Heart size={15} />
              <span>Add to Schedule</span>
            </>
          )}
        </button>

        <a
          href={session.registrationUrl || REGISTRATION_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl border border-[#D9D0CB] dark:border-white/20 bg-white/60 dark:bg-white/5 py-3 px-4 text-xs font-bold text-[#13090A] dark:text-white hover:bg-white transition-colors"
        >
          <span>Register Now</span>
          <ArrowRight size={14} />
        </a>
      </div>

    </aside>
  );

  return (
    <section 
      id="explore-schedule" 
      className="w-full snap-start scroll-mt-[80px] md:scroll-mt-[100px] bg-[#F4F0EE] dark:bg-[#120506] pt-4 sm:pt-8 pb-8 sm:pb-16 text-[#261F1D] dark:text-[#E8E0DE]"
    >
      <div className="mx-auto max-w-[1440px] px-3 sm:px-6 lg:px-8 xl:px-12">
        
        {/* TOP BAR / CONTROL HEADER */}
        <div 
          id="explore-schedule-card"
          className="scroll-mt-0 sm:scroll-mt-0 xl:scroll-mt-[5px] rounded-[20px] sm:rounded-[28px] border border-[#D9D0CB] dark:border-[rgba(108,21,30,0.35)] bg-white/40 dark:bg-black/30 backdrop-blur-md p-3.5 sm:p-6 lg:p-8 shadow-sm mb-4 sm:mb-8"
        >
          
          <header className="mb-4 sm:mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 pb-4 sm:pb-6 border-b border-[#D9D0CB]/70 dark:border-white/10">
            <div>
              <div className="font-mono inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#6C151E] dark:text-[#E45464]">
                <span className="block h-px w-5 bg-[#6C151E] dark:bg-[#E45464]" />
                {phaseInfo.title} &middot; {phaseInfo.dateRange}
              </div>

              <h2 className="mt-2 font-serif text-[clamp(2rem,3.5vw,3.5rem)] font-bold leading-[0.96] tracking-tight text-[#13090A] dark:text-[#F6F2F1]">
                Explore the <em className="font-semibold italic text-[#6C151E] dark:text-[#E45464]">schedule.</em>
              </h2>

              <p className="mt-3 max-w-[720px] font-sans font-normal text-sm sm:text-base leading-relaxed text-[#665B57] dark:text-[#BEB5B4]">
                Browse sessions, filter by track, and plan your Fall Fest experience across Online and Offline phases.
              </p>
            </div>

            {/* View Mode & My Schedule Counter Button */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-full border border-[#D9D0CB] dark:border-white/15 bg-white/40 dark:bg-white/5 p-1">
                <button
                  type="button"
                  onClick={() => setShowSavedOnly(false)}
                  className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                    !showSavedOnly
                      ? 'bg-[#6C151E] text-white shadow-sm'
                      : 'text-[#665B57] dark:text-[#BEB5B4] hover:text-[#6C151E]'
                  }`}
                >
                  All Events &amp; Sessions ({activeDay?.sessions.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setShowSavedOnly(true)}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                    showSavedOnly
                      ? 'bg-[#6C151E] text-white shadow-sm'
                      : 'text-[#665B57] dark:text-[#BEB5B4] hover:text-[#6C151E]'
                  }`}
                >
                  <Heart size={13} fill={savedCount > 0 ? 'currentColor' : 'none'} />
                  <span>My Wishlist ({savedCount})</span>
                </button>
              </div>

              <div className="flex items-center">
                <PhaseSelector currentPhase={currentPhase} onPhaseChange={onPhaseChange} variant="segmented" />
              </div>
            </div>
          </header>

          {/* DAY NAVIGATION TABS & TRACK FILTERS */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            
            {/* Day Selector Tabs */}
            <div className="flex overflow-x-auto rounded-[20px] border border-[#D9D0CB] dark:border-white/10 bg-white/30 dark:bg-white/5 p-1 scrollbar-none">
              {currentDays.map((item, index) => {
                const isActive = index === dayIndex;
                return (
                  <button
                    key={item.id}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => selectDay(index)}
                    className={`flex min-w-[100px] sm:min-w-[120px] flex-col items-center justify-center rounded-[16px] px-4 py-2.5 text-center transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-b from-[#6C151E] to-[#4A0D14] text-white shadow-md'
                        : 'text-[#665B57] dark:text-[#BEB5B4] hover:bg-white/40 dark:hover:bg-white/10'
                    }`}
                  >
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] opacity-90">
                      {item.label}
                    </span>
                    <span className="text-xs sm:text-sm font-bold mt-0.5">{item.date}</span>
                    <span className="text-[10px] opacity-75">{item.weekday}</span>
                  </button>
                );
              })}
            </div>

            {/* Track Filter Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#665B57] dark:text-[#BEB5B4] mr-1">
                <Filter size={13} />
                Tracks:
              </div>

              {tracks.map((item) => {
                const isActive = activeTrack === item;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setActiveTrack(item)}
                    className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all ${
                      isActive
                        ? 'border-[#6C151E] bg-[#6C151E] text-white shadow-sm'
                        : 'border-[#D9D0CB] dark:border-white/15 bg-white/40 dark:bg-white/5 text-[#261F1D] dark:text-[#E8E0DE] hover:bg-white'
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>

          </div>

          {/* SEARCH INPUT BAR */}
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-[#D9D0CB] dark:border-white/15 bg-white/70 dark:bg-white/10 px-4 py-3 text-[#665B57] shadow-inner focus-within:border-[#6C151E]">
            <Search size={18} className="text-[#6C151E] dark:text-[#E45464]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sessions, topics, speakers, rooms, level..."
              aria-label="Search sessions"
              className="w-full bg-transparent text-sm font-medium text-[#261F1D] dark:text-white outline-none placeholder:text-[#8D857F] dark:placeholder:text-[#998F8C]"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="text-xs font-bold uppercase tracking-wider text-[#6C151E] hover:underline"
              >
                Clear
              </button>
            )}
          </div>

        </div>

        {/* MAIN TWO-COLUMN TIMELINE & DETAIL VIEW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT TIMELINE COLUMN (12 cols when collapsed, 7 cols when session selected on desktop) */}
          <div 
            className={`transition-[grid-column,width,max-width] duration-300 ease-in-out flex flex-col space-y-4 ${
              selectedSession ? 'lg:col-span-7' : 'lg:col-span-12'
            }`}
          >
            
            <div className="flex items-center justify-between px-2 pb-2 border-b border-[#D9D0CB] dark:border-white/10">
              <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#13090A] dark:text-[#F6F2F1]">
                {activeDay?.weekday}, {activeDay?.date} 2026
                <span className="ml-2 text-xs font-sans font-normal text-[#665B57] dark:text-[#BEB5B4]">
                  ({visibleSessions.length} session{visibleSessions.length === 1 ? '' : 's'})
                </span>
              </h3>
              <div className="flex items-center gap-3">
                {!selectedSession && visibleSessions.length > 0 && (
                  <span className="hidden sm:inline-block text-[11px] font-mono font-medium text-[#6C151E]/80 dark:text-[#E45464]/80">
                    &bull; Click any card to expand full session details
                  </span>
                )}
                <span className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#6C151E] dark:text-[#E45464]">
                  All Times IST
                </span>
              </div>
            </div>

            {/* SESSION TIMELINE CARDS LIST */}
            {visibleSessions.length > 0 ? (
              <div className="space-y-3">
                {visibleSessions.map((session) => {
                  const isSelected = selectedSession?.id === session.id;
                  const isSaved = savedIds.includes(session.id);

                  return (
                    <React.Fragment key={session.id}>
                      <div
                        onClick={() => setSelectedId(isSelected ? null : session.id)}
                        className={`group relative flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-2xl border p-4 sm:p-5 transition-all duration-200 ease-in-out cursor-pointer ${
                          isSelected
                            ? 'border-[#6C151E] bg-white dark:bg-white/10 shadow-lg ring-2 ring-[#6C151E]'
                            : 'border-[#D9D0CB] dark:border-white/10 bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 hover:shadow-md'
                        }`}
                      >
                        {/* Left: Time & Details */}
                        <div className="flex flex-col sm:flex-row items-start gap-4 w-full">
                          
                          {/* Time Column */}
                          <div className="flex sm:flex-col items-center sm:items-start justify-between sm:justify-center min-w-[100px] text-left border-b sm:border-b-0 sm:border-r border-[#D9D0CB]/60 dark:border-white/10 pb-2 sm:pb-0 sm:pr-4 w-full sm:w-auto">
                            <span className="font-mono text-sm font-semibold text-[#6C151E] dark:text-[#E45464]">
                              {session.time}
                            </span>
                            <span className="font-mono text-xs text-[#665B57] dark:text-[#BEB5B4]">
                              &mdash; {session.end}
                            </span>
                          </div>

                          {/* Session Content */}
                          <div className="flex flex-col space-y-1.5 flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono rounded-full bg-[#6C151E]/10 dark:bg-[#E45464]/20 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#6C151E] dark:text-[#E45464]">
                                {session.track}
                              </span>
                              <span className="font-mono rounded-full bg-[#D9D0CB]/50 dark:bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-[#665B57] dark:text-[#BEB5B4]">
                                {session.level}
                              </span>
                              <span className="font-mono text-[11px] font-semibold text-[#8D857F] dark:text-[#998F8C]">
                                {session.duration}
                              </span>
                            </div>

                            <h4 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#13090A] dark:text-[#F6F2F1] group-hover:text-[#6C151E] dark:group-hover:text-[#E45464] transition-colors leading-snug">
                              {session.title}
                            </h4>

                            <p className="font-sans font-normal text-xs sm:text-sm leading-relaxed text-[#665B57] dark:text-[#BEB5B4] line-clamp-2">
                              {session.description}
                            </p>
                          </div>

                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2 mt-3 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#D9D0CB]/40 dark:border-white/10 w-full sm:w-auto justify-end">
                          {!selectedSession && (
                            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-[#6C151E] dark:text-[#E45464] opacity-0 group-hover:opacity-100 transition-opacity mr-1">
                              View Details <ArrowRight size={12} />
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={(e) => toggleSaveSession(session, e)}
                            title={isSaved ? 'Remove from schedule' : 'Add to schedule'}
                            className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                              isSaved
                                ? 'bg-[#6C151E] text-white'
                                : 'border border-[#D9D0CB] dark:border-white/20 text-[#665B57] dark:text-[#BEB5B4] hover:bg-[#6C151E]/10'
                            }`}
                          >
                            <Heart size={15} fill={isSaved ? 'currentColor' : 'none'} />
                          </button>

                          <div className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                            isSelected
                              ? 'bg-[#6C151E] text-white'
                              : 'bg-[#6C151E]/10 text-[#6C151E] dark:bg-white/10 dark:text-white group-hover:bg-[#6C151E] group-hover:text-white'
                          }`}>
                            <ArrowRight size={15} className={`transition-transform duration-200 ${isSelected ? 'rotate-90' : ''}`} />
                          </div>
                        </div>

                      </div>

                      {/* MOBILE INLINE ACCORDION DETAIL DRAWER (Renders directly under the selected card on mobile/tablet) */}
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className="lg:hidden overflow-hidden w-full"
                          >
                            {renderDetailContent(session)}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#D9D0CB] dark:border-white/15 p-12 text-center text-[#665B57] dark:text-[#BEB5B4]">
                <CalendarDays size={36} className="mx-auto mb-3 text-[#6C151E] opacity-50" />
                <h4 className="font-serif text-lg font-bold text-[#13090A] dark:text-white">No sessions found</h4>
                <p className="mt-1 text-sm">
                  {showSavedOnly
                    ? 'Your schedule is currently empty for this day. Click the heart icon on any session to add it.'
                    : 'Try adjusting your search query or track filters.'}
                </p>
              </div>
            )}

          </div>

          {/* RIGHT SELECTED SESSION DETAIL PANEL (5 cols desktop, slides in cleanly when session clicked) */}
          <div className="hidden lg:block lg:col-span-5 sticky top-24">
            <AnimatePresence mode="wait">
              {selectedSession && (
                <motion.div 
                  key={selectedSession.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  {renderDetailContent(selectedSession)}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>

      {/* TOAST NOTIFICATION POPUP */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2.5 rounded-2xl bg-[#13090A] text-white px-4 py-3 text-xs font-semibold shadow-2xl border border-[#6C151E]/40 animate-bounce">
          <Sparkles size={16} className="text-[#F5DABF]" />
          <span>{toast.message}</span>
        </div>
      )}
    </section>
  );
}
