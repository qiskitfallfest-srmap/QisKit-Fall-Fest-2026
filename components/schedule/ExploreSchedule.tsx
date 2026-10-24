'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  BellRing,
  Bookmark,
  BookmarkCheck,
  CalendarDays,
  Check,
  Clock3,
  Filter,
  MapPin,
  Search,
  Users,
  BookOpen,
  Award,
  X,
} from 'lucide-react';
import { Day, Lane, SchedulePhase, Session } from '@/data/schedule.types';
import {
  AttendeeState,
  clockToMinutes,
  defaultOfflineDayIndex,
  filterSessions,
  getOfflineSessionCta,
  getPhaseDays,
  getPhaseInfo,
  isBreak,
  LANE_LABELS,
  OfflineSessionCta,
} from '@/data/schedule.utils';
import { StaggeredTextReveal } from '@/components/ui/StaggeredTextReveal';
import { LiveNowStrip, useScheduleNow } from '@/components/schedule/LiveNowStrip';
import { usePassStatus } from '@/hooks/use-pass-status';
import { useAgenda } from '@/hooks/use-agenda';
import { enablePush, usePushState } from '@/lib/pwa';

const posterImage = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="300" viewBox="0 0 600 300"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%233A0B10"/><stop offset="50%" stop-color="%236C151E"/><stop offset="100%" stop-color="%23120506"/></linearGradient></defs><rect width="600" height="300" fill="url(%23g)"/><g opacity="0.3" stroke="%23F5DABF" stroke-width="1.5" fill="none"><polygon points="300,40 420,95 420,205 300,260 180,205 180,95"/><line x1="300" y1="40" x2="300" y2="150"/><line x1="420" y1="95" x2="300" y2="150"/><line x1="180" y1="95" x2="300" y2="150"/><line x1="300" y1="150" x2="300" y2="260"/><line x1="420" y1="205" x2="300" y2="150"/><line x1="180" y1="205" x2="300" y2="150"/></g></svg>';

const views = [
  { id: 'all', label: 'All' },
  { id: 'main', label: LANE_LABELS.main },
  { id: 'open', label: 'Open games & expo' },
  { id: 'flagship', label: 'QCTF & Hackathon' },
  { id: 'mine', label: 'My agenda' },
] as const;

type ViewId = (typeof views)[number]['id'];

const laneChip: Record<Lane, string> = {
  main: 'bg-[#6C151E]/10 text-[#6C151E] dark:bg-[#E45464]/20 dark:text-[#F3A9B1]',
  open: 'bg-emerald-600/10 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300',
  flagship: 'bg-amber-500/15 text-amber-900 dark:bg-amber-400/15 dark:text-amber-200',
};

function CtaButton({ cta, size }: { cta: OfflineSessionCta; size: 'card' | 'panel' }) {
  const base =
    size === 'card'
      ? 'inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0'
      : 'flex w-full items-center justify-between rounded-xl py-3.5 px-6 text-xs font-bold';
  const quiet = `${base} border border-[#D9D0CB] dark:border-white/15 text-[#665B57] dark:text-[#BEB5B4]`;

  if (cta.passive) {
    return cta.href ? (
      <Link href={cta.href} onClick={(e) => e.stopPropagation()} className={`${quiet} hover:border-[#6C151E]`}>
        {cta.label}
      </Link>
    ) : (
      <span className={quiet}>
        {cta.label === 'Included in your pass' && <Check size={13} />}
        {cta.label}
      </span>
    );
  }
  return (
    <Link
      href={cta.href || '/learning'}
      onClick={(e) => e.stopPropagation()}
      className={`${base} bg-[#6C151E] hover:bg-[#8F2632] text-white shadow-xs transition-colors active:scale-95`}
    >
      <span>{cta.label}</span>
      <ArrowRight size={size === 'card' ? 13 : 16} />
    </Link>
  );
}

interface ExploreScheduleProps {
  currentPhase?: SchedulePhase;
  onPhaseChange?: (phase: SchedulePhase) => void;
  targetDayIndex?: number;
}

export function ExploreSchedule({ currentPhase = 'offline', targetDayIndex }: ExploreScheduleProps) {
  const [dayIndex, setDayIndex] = useState(0);
  const [activeView, setActiveView] = useState<ViewId>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState<{ text: string; offerPush?: boolean } | null>(null);

  const phaseInfo = getPhaseInfo('offline');
  const currentDays = getPhaseDays('offline');
  const now = useScheduleNow();

  const { data: passStatus } = usePassStatus();
  const isAuthenticated = Boolean(passStatus?.isAuthenticated);
  const agenda = useAgenda(isAuthenticated);
  const [pushState, setPushState] = usePushState();

  const attendee: AttendeeState = !passStatus?.isAuthenticated
    ? 'signed_out'
    : passStatus.pass?.status === 'verified'
      ? 'pass_verified'
      : passStatus.pass?.status === 'claimed_provisional'
        ? 'pass_pending'
        : 'no_pass';
  const isFinalist = passStatus?.hackathon?.outcome === 'shortlisted';

  // Reset or sync day index & session selection when phase or external targetDayIndex changes
  useEffect(() => {
    setDayIndex(typeof targetDayIndex === 'number' && targetDayIndex >= 0 ? targetDayIndex : 0);
    setSelectedId(null);
    setSearch('');
    setActiveView('all');
  }, [currentPhase, targetDayIndex]);

  // Without a #day hash, open on today's tab during the festival
  const openedOnToday = useRef(false);
  useEffect(() => {
    if (now === null || openedOnToday.current) return;
    openedOnToday.current = true;
    if (typeof targetDayIndex !== 'number') setDayIndex(defaultOfflineDayIndex(now));
  }, [now, targetDayIndex]);

  const activeDay: Day = currentDays[dayIndex] || currentDays[0];

  const visibleSessions = useMemo(() => {
    let list = activeDay ? activeDay.sessions : [];
    if (activeView === 'mine') list = list.filter((s) => agenda.saved.has(s.id));
    else if (activeView !== 'all') {
      list = list.filter((s) => (s.lane || 'main') === activeView || (activeView === 'main' && isBreak(s)));
    }
    return filterSessions(list, 'All', search).sort((a, b) => clockToMinutes(a.time) - clockToMinutes(b.time));
  }, [activeDay, activeView, search, agenda.saved]);

  // Sessions that start together are shown side by side
  const timeGroups = useMemo(() => {
    const groups: { time: string; sessions: Session[] }[] = [];
    for (const session of visibleSessions) {
      const last = groups[groups.length - 1];
      if (last && last.time === session.time) last.sessions.push(session);
      else groups.push({ time: session.time, sessions: [session] });
    }
    return groups;
  }, [visibleSessions]);

  // Return null when no session is clicked so timeline expands full width
  const selectedSession = useMemo(() => {
    if (selectedId && activeDay) {
      const found = activeDay.sessions.find((s) => s.id === selectedId);
      if (found) return found;
    }
    return null;
  }, [selectedId, activeDay]);

  const [activePanelSession, setActivePanelSession] = useState<Session | null>(null);

  useEffect(() => {
    if (selectedSession) {
      setActivePanelSession(selectedSession);
    }
  }, [selectedSession]);

  const selectDay = (index: number) => {
    setDayIndex(index);
    setSelectedId(null);
  };

  const selectFromLive = (index: number, sessionId: string) => {
    setDayIndex(index);
    setActiveView('all');
    setSearch('');
    setSelectedId(sessionId);
    requestAnimationFrame(() =>
      document.getElementById(sessionId)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    );
  };

  const toggleSaved = async (session: Session) => {
    if (!isAuthenticated) {
      setNotice({ text: 'Register or sign in to save sessions and get reminders.' });
      return;
    }
    const result = await agenda.toggle(session.id);
    if (result.error) setNotice({ text: result.error });
    else if (result.saved) setNotice({ text: `Saved "${session.title}" to your agenda.`, offerPush: pushState === 'off' });
    else setNotice(null);
  };

  const turnOnReminders = async () => {
    try {
      const next = await enablePush();
      setPushState(next);
      setNotice({
        text:
          next === 'on'
            ? 'Reminders are on. You will get a notification 10 minutes before each saved session.'
            : next === 'denied'
              ? 'Notifications are blocked for this site. Allow them in your browser settings to get reminders.'
              : 'Notifications were not turned on.',
      });
    } catch (err: any) {
      setNotice({ text: err?.message || 'Could not turn on notifications.' });
    }
  };

  const saveButton = (session: Session, size: 'card' | 'panel') => {
    if (isBreak(session)) return null;
    const isSaved = agenda.saved.has(session.id);
    const Icon = isSaved ? BookmarkCheck : Bookmark;
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          toggleSaved(session);
        }}
        aria-pressed={isSaved}
        aria-label={isSaved ? `Remove ${session.title} from my agenda` : `Save ${session.title} to my agenda`}
        className={`inline-flex items-center justify-center gap-1.5 rounded-xl border text-xs font-bold transition-colors shrink-0 ${
          size === 'card' ? 'px-3 py-1.5' : 'w-full py-3'
        } ${
          isSaved
            ? 'border-[#6C151E] bg-[#6C151E]/10 text-[#6C151E] dark:border-[#E45464] dark:text-[#F3A9B1]'
            : 'border-[#D9D0CB] dark:border-white/15 text-[#261F1D] dark:text-[#E8E0DE] hover:border-[#6C151E]'
        }`}
      >
        <Icon size={14} />
        <span>{size === 'panel' ? (isSaved ? 'Saved to my agenda' : 'Save to my agenda') : isSaved ? 'Saved' : 'Save'}</span>
      </button>
    );
  };

  const renderDetailContent = (session: Session) => {
    const cta = getOfflineSessionCta(session, attendee, isFinalist);
    const lane = session.lane || 'main';

    return (
      <aside className="rounded-2xl border border-[#D9D0CB] dark:border-[rgba(108,21,30,0.4)] bg-white dark:bg-[#1C0709] p-5 sm:p-6 shadow-md shadow-black/5 dark:shadow-black/30 space-y-5 transition-colors">

      {/* Header Lane & Day Badge with Close (X) Button */}
      <div className="flex items-center justify-between border-b border-[#D9D0CB]/60 dark:border-white/10 pb-3 text-xs font-bold uppercase tracking-wider">
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 ${laneChip[lane]}`}>
            {LANE_LABELS[lane]}
          </span>
          <span className="font-mono text-[#6C151E] dark:text-[#E45464]">
            {activeDay?.label} &middot; {activeDay?.date}
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
      <div className="relative h-36 w-full overflow-hidden rounded-2xl border border-[#D9D0CB] dark:border-white/10 bg-gradient-to-br from-[#3A0B10] to-[#120506]">
        <Image
          src={posterImage}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          className="object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#13090A] via-transparent to-transparent opacity-80" />
        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded">
            {session.track}
          </span>
          <span className="text-xs font-semibold text-[#F5DABF]">
            {session.duration}
          </span>
        </div>
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-medium text-[#261F1D] dark:text-[#E8E0DE]">
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F4F0EE] dark:bg-white/5">
          <Clock3 size={15} className="text-[#6C151E] dark:text-[#E45464] shrink-0" />
          <span>{session.time} &ndash; {session.end}{session.endDate ? ' (next day)' : ''}</span>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F4F0EE] dark:bg-white/5 min-w-0">
          <MapPin size={15} className="text-[#6C151E] dark:text-[#E45464] shrink-0" />
          <Link href="/venues" className="truncate hover:underline" title={session.location}>
            {session.location}
          </Link>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F4F0EE] dark:bg-white/5">
          <Users size={15} className="text-[#6C151E] dark:text-[#E45464] shrink-0" />
          <span>{session.level}</span>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F4F0EE] dark:bg-white/5">
          <Award size={15} className="text-[#6C151E] dark:text-[#E45464] shrink-0" />
          <span>All times IST</span>
        </div>
      </div>

      {/* Speaker & Host Info */}
      {session.speaker && session.speaker !== '—' && (
        <div className="border-t border-[#D9D0CB]/60 dark:border-white/10 pt-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#665B57] dark:text-[#BEB5B4] mb-2">
            Speaker / Host
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#6C151E] text-sm font-bold text-white shadow-inner">
              {session.initials}
            </div>
            <div>
              <div className="text-sm font-bold text-[#13090A] dark:text-[#F6F2F1]">
                {session.speaker}
              </div>
              {session.speakerRole && (
                <div className="text-xs text-[#665B57] dark:text-[#BEB5B4]">
                  {session.speakerRole}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Learning Objectives */}
      {session.learn && session.learn.length > 0 && (
        <div className="border-t border-[#D9D0CB]/60 dark:border-white/10 pt-4 space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#665B57] dark:text-[#BEB5B4] flex items-center gap-1.5">
            <BookOpen size={13} className="text-[#6C151E] dark:text-[#E45464]" />
            What You Will Learn
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

      {/* Actions */}
      {!isBreak(session) && (
        <div className="pt-2 space-y-2">
          {saveButton(session, 'panel')}
          {cta && <CtaButton cta={cta} size="panel" />}
        </div>
      )}

    </aside>
    );
  };

  const renderCard = (session: Session) => {
    const isSelected = selectedSession?.id === session.id;
    const lane = session.lane || 'main';
    const cta = getOfflineSessionCta(session, attendee, isFinalist);
    const pause = isBreak(session);

    if (pause) {
      return (
        <div
          key={session.id}
          id={session.id}
          className="flex items-center gap-3 rounded-2xl border border-dashed border-[#D9D0CB] dark:border-white/10 px-4 py-2.5 text-xs text-[#665B57] dark:text-[#BEB5B4]"
        >
          <span className="font-semibold">{session.title}</span>
          <span className="font-mono">until {session.end}</span>
        </div>
      );
    }

    return (
      <React.Fragment key={session.id}>
        <div
          id={session.id}
          onClick={() => setSelectedId(isSelected ? null : session.id)}
          className={`group relative flex h-full flex-col justify-between gap-3 rounded-2xl border p-4 sm:p-5 transition-all duration-200 ease-in-out cursor-pointer scroll-mt-28 ${
            isSelected
              ? 'border-[#6C151E] bg-white dark:bg-white/10 shadow-lg ring-2 ring-[#6C151E]'
              : 'border-[#D9D0CB] dark:border-white/10 bg-white/60 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 hover:shadow-md'
          }`}
        >
          <div className="flex flex-col space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${laneChip[lane]}`}>
                {LANE_LABELS[lane]}
              </span>
              <span className="font-mono rounded-full bg-[#D9D0CB]/50 dark:bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-[#665B57] dark:text-[#BEB5B4]">
                {session.track}
              </span>
              <span className="font-mono text-[11px] font-semibold text-[#8D857F] dark:text-[#998F8C]">
                until {session.end}{session.endDate ? ' tomorrow' : ''}
              </span>
            </div>

            <h4 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#13090A] dark:text-[#F6F2F1] group-hover:text-[#6C151E] dark:group-hover:text-[#E45464] transition-colors leading-snug">
              {session.title}
            </h4>

            {session.speaker && !['—', 'Organizing Team'].includes(session.speaker) && (
              <p className="text-xs font-semibold text-[#261F1D] dark:text-[#E8E0DE]">
                {session.speaker}
                {session.speakerRole && <span className="font-normal text-[#665B57] dark:text-[#BEB5B4]"> &middot; {session.speakerRole}</span>}
              </p>
            )}

            <p className="flex items-center gap-1 text-xs text-[#665B57] dark:text-[#BEB5B4]">
              <MapPin size={12} className="shrink-0" />
              <span className="truncate">{session.location}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#D9D0CB]/40 dark:border-white/10">
            {saveButton(session, 'card')}
            {cta && <CtaButton cta={cta} size="card" />}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedId(isSelected ? null : session.id);
              }}
              className={`ml-auto flex h-8 w-8 items-center justify-center rounded-full transition-colors shrink-0 ${
                isSelected
                  ? 'bg-[#6C151E] text-white'
                  : 'bg-[#6C151E]/10 text-[#6C151E] dark:bg-white/10 dark:text-white hover:bg-[#6C151E] hover:text-white'
              }`}
              title={isSelected ? 'Close details' : 'View session details'}
              aria-label={isSelected ? 'Close session details' : 'View session details'}
            >
              <ArrowRight size={15} className={`transition-transform duration-200 ${isSelected ? 'rotate-90' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile inline detail drawer, directly under the selected card */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="lg:hidden overflow-hidden w-full"
            >
              {renderDetailContent(session)}
            </motion.div>
          )}
        </AnimatePresence>
      </React.Fragment>
    );
  };

  return (
    <section
      id="explore-schedule"
      className="w-full snap-start scroll-mt-[80px] md:scroll-mt-[100px] bg-[#F4F0EE] dark:bg-[#120506] pt-4 sm:pt-8 pb-8 sm:pb-16 text-[#261F1D] dark:text-[#E8E0DE]"
    >
      <div className="mx-auto max-w-[1440px] px-3 sm:px-6 lg:px-8 xl:px-12">

        <LiveNowStrip now={now} onSelect={selectFromLive} />

        {/* TOP BAR / CONTROL HEADER */}
        <div
          id="explore-schedule-card"
          className="scroll-mt-0 sm:scroll-mt-0 xl:scroll-mt-[5px] rounded-[20px] sm:rounded-[28px] border border-[#D9D0CB] dark:border-[rgba(108,21,30,0.35)] bg-white/40 dark:bg-black/30 backdrop-blur-md p-3.5 sm:p-6 lg:p-8 shadow-sm mb-4 sm:mb-8"
        >

          <header className="mb-4 sm:mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 pb-4 sm:pb-6 border-b border-[#D9D0CB]/70 dark:border-white/10">
            <div>
              <div className="font-bold uppercase tracking-[0.14em] sm:tracking-[0.28em] text-[11px] sm:text-xs text-[#A7192A] dark:text-[#EF7885] inline-flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap">
                <span className="block h-px w-4 sm:w-5 bg-[#A7192A] dark:bg-[#EF7885] shrink-0" />
                <span>{phaseInfo.title}</span>
                <span>&middot;</span>
                <span className="whitespace-nowrap">{phaseInfo.dateRange}</span>
              </div>

              <h2 className="mt-2 font-serif text-[clamp(2rem,3.5vw,3.5rem)] font-bold leading-[0.96] tracking-[-0.04em] text-[#A7192A] dark:text-[#EA8793]">
                <StaggeredTextReveal text="Explore the" delay={0.1} stagger={0.02} letterClassName="text-[#A7192A] dark:text-[#EA8793]" />{' '}
                <StaggeredTextReveal text="schedule." delay={0.25} stagger={0.025} letterClassName="font-serif italic font-semibold text-[#6C151E] dark:text-[#F5DABF]" />
              </h2>

              <p className="mt-3 max-w-[720px] font-sans font-normal text-sm sm:text-base leading-relaxed text-[#4E4441] dark:text-[#D6CDCA]">
                See what is on across all five days, save the sessions you want, and get a reminder 10 minutes before each one starts.
              </p>
            </div>

            {/* Venue Location Pill */}
            <div className="flex items-center">
              <Link
                href="/venues"
                className="inline-flex items-center gap-2 rounded-full border border-[rgba(108,21,30,0.2)] bg-white/50 dark:bg-black/40 px-4 py-2 text-xs font-semibold text-[#6C151E] dark:text-[#F5DABF] shadow-sm hover:border-[#6C151E]"
              >
                <MapPin size={14} className="text-[#6C151E] dark:text-[#F5DABF]" />
                <span>SRM University-AP, Amaravati &middot; Campus map</span>
              </Link>
            </div>
          </header>

          {/* DAY NAVIGATION TABS & VIEW FILTERS */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">

            {/* Day Selector Tabs */}
            <div className="flex overflow-x-auto rounded-[20px] border border-[#D9D0CB] dark:border-white/10 bg-white/30 dark:bg-white/5 p-1 scrollbar-none" role="tablist">
              {currentDays.map((item, index) => {
                const isActive = index === dayIndex;
                return (
                  <button
                    key={item.id}
                    id={item.id}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => selectDay(index)}
                    className={`group relative flex min-w-[88px] sm:min-w-[120px] flex-col items-center justify-center overflow-hidden rounded-[16px] px-3 sm:px-4 py-2.5 text-center transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.96] cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-b from-[#6C151E] to-[#4A0D14] text-white shadow-md scale-[1.02]'
                        : 'text-[#665B57] dark:text-[#BEB5B4] hover:text-white'
                    }`}
                  >
                    {/* Fluid expanding hover circle */}
                    {!isActive && (
                      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-[#6C151E] dark:bg-[#A7192A] rounded-full opacity-0 pointer-events-none transition-all duration-[2400ms] ease-[cubic-bezier(0.25,1,0.35,1)] group-hover:w-[300px] group-hover:h-[300px] group-hover:opacity-100" />
                    )}
                    <span className="relative z-[1] text-[10px] font-extrabold uppercase tracking-[0.14em] opacity-90 transition-transform duration-300 group-hover:scale-105">
                      {item.label}
                    </span>
                    <span className="relative z-[1] text-xs sm:text-sm font-bold mt-0.5">{item.date}</span>
                    <span className="relative z-[1] text-[10px] opacity-75">{item.weekday}</span>
                  </button>
                );
              })}
            </div>

            {/* View Filter Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#665B57] dark:text-[#BEB5B4] mr-1">
                <Filter size={13} />
                Show:
              </div>

              {views.map((item) => {
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveView(item.id)}
                    aria-pressed={isActive}
                    className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                      isActive
                        ? 'border-[#6C151E] bg-[#6C151E] text-white shadow-md'
                        : 'border-[#D9D0CB] dark:border-white/15 bg-white/40 dark:bg-white/5 text-[#261F1D] dark:text-[#E8E0DE] hover:border-[#6C151E]'
                    }`}
                  >
                    {item.label}
                    {item.id === 'mine' && agenda.saved.size > 0 && (
                      <span className="ml-1.5 font-mono opacity-80">{agenda.saved.size}</span>
                    )}
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
              placeholder="Search sessions, speakers, games, rooms..."
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
              activePanelSession ? 'lg:col-span-7' : 'lg:col-span-12'
            }`}
          >

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1 pb-2 border-b border-[#D9D0CB] dark:border-white/10">
              <div className="flex flex-col">
                <h3
                  id={activeDay ? `heading-${activeDay.id}` : undefined}
                  className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#13090A] dark:text-[#F6F2F1] scroll-mt-24 sm:scroll-mt-28"
                >
                  {activeDay?.weekday}, {activeDay?.date} 2026
                </h3>
                <span className="text-xs sm:text-sm text-[#665B57] dark:text-[#BEB5B4]">
                  {activeDay?.theme}
                </span>
              </div>

              <span className="font-mono text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-[#6C151E] dark:text-[#E45464] whitespace-nowrap shrink-0">
                All times IST
              </span>
            </div>

            {/* SESSIONS, GROUPED BY START TIME */}
            {timeGroups.length > 0 ? (
              <ol className="space-y-5">
                {timeGroups.map((group) => {
                  const parallel = group.sessions.filter((s) => !isBreak(s)).length > 1;
                  return (
                    <li key={group.time} className="grid grid-cols-1 sm:grid-cols-[92px_1fr] gap-2 sm:gap-4">
                      <div className="flex sm:flex-col items-baseline sm:items-start gap-2 sm:gap-0.5 sm:pt-4">
                        <span className="font-mono text-sm font-semibold text-[#6C151E] dark:text-[#E45464]">{group.time}</span>
                        {parallel && (
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#665B57] dark:text-[#BEB5B4]">
                            {group.sessions.length} in parallel
                          </span>
                        )}
                      </div>
                      <div
                        className={`grid gap-3 grid-cols-1 ${
                          parallel ? (activePanelSession ? 'xl:grid-cols-2' : 'md:grid-cols-2 xl:grid-cols-3') : ''
                        }`}
                      >
                        {group.sessions.map(renderCard)}
                      </div>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#D9D0CB] dark:border-white/15 p-12 text-center text-[#665B57] dark:text-[#BEB5B4]">
                <CalendarDays size={36} className="mx-auto mb-3 text-[#6C151E] opacity-50" />
                <h4 className="font-serif text-lg font-bold text-[#13090A] dark:text-white">
                  {activeView === 'mine' ? 'Nothing saved for this day' : 'No sessions found'}
                </h4>
                <p className="mt-1 text-sm">
                  {activeView === 'mine'
                    ? isAuthenticated
                      ? 'Use Save on any session to add it to your agenda.'
                      : 'Sign in on the Learning Portal, then use Save on any session.'
                    : 'Try a different search or filter.'}
                </p>
              </div>
            )}

          </div>

          {/* RIGHT SELECTED SESSION DETAIL PANEL (5 cols desktop, slides in when a session is selected) */}
          <div className={`hidden lg:block transition-all duration-300 ease-in-out ${activePanelSession ? 'lg:col-span-5 sticky top-24' : 'hidden'}`}>
            <AnimatePresence
              mode="wait"
              onExitComplete={() => {
                if (!selectedSession) {
                  setActivePanelSession(null);
                }
              }}
            >
              {selectedSession && (
                <motion.div
                  key={selectedSession.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                >
                  {renderDetailContent(selectedSession)}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>

      {/* Toast sits outside the blurred control card: backdrop-filter would pin a fixed child to that card */}
      {notice && (
        <div
          role="status"
          className="fixed bottom-4 inset-x-3 sm:left-auto sm:right-6 sm:max-w-md z-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-[#D9D0CB] dark:border-white/15 bg-white dark:bg-[#1C0709] px-4 py-3 text-sm text-[#261F1D] dark:text-[#E8E0DE] shadow-lg"
        >
          <span>
            {notice.text}
            {notice.offerPush && ' Turn on notifications to get a reminder 10 minutes before it starts.'}
            {!isAuthenticated && (
              <>
                {' '}
                <Link href="/learning" className="font-semibold text-[#6C151E] dark:text-[#F3A9B1] underline">
                  Go to the Learning Portal
                </Link>
              </>
            )}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            {notice.offerPush && (
              <button
                type="button"
                onClick={turnOnReminders}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#6C151E] hover:bg-[#8F2632] px-3.5 py-1.5 text-xs font-bold text-white"
              >
                <BellRing size={13} />
                Turn on reminders
              </button>
            )}
            <button
              type="button"
              onClick={() => setNotice(null)}
              aria-label="Dismiss"
              className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
