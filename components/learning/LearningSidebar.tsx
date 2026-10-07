'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  BookOpen,
  Users,
  ChevronRight,
  ChevronDown,
  Award,
  PlayCircle,
  LogOut,
  Shield,
  Menu,
  X,
} from 'lucide-react';
import clsx from 'clsx';
import { supabase } from '@/lib/supabase';
import { CURRICULUM_SESSIONS } from '@/data/learning/curriculum';
import { DAILY_COMPETITIONS } from '@/data/learning/competitions';
import { useCurriculumSessions } from '@/hooks/use-curriculum-sessions';

const DAYS = [
  { id: 1, label: 'Day 1: Foundations' },
  { id: 2, label: 'Day 2: Physical Realization' },
  { id: 3, label: 'Day 3: Applications & Security' },
];

export function LearningSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { sessions } = useCurriculumSessions();

  const isHackathon = pathname === '/learning/hackathon';
  const activeChallengeDay = searchParams?.get('challenge');

  // Detect active session from pathname (e.g. /learning/session/session-3 or /learning/session/session-3/quiz)
  const sessionPathMatch = pathname?.match(/^\/learning\/session\/([^/]+)/);
  const activeSessionId = sessionPathMatch?.[1] || null;
  const activeSessionObj = activeSessionId
    ? sessions.find((s) => s.id === activeSessionId) || CURRICULUM_SESSIONS.find((s) => s.id === activeSessionId)
    : null;

  // Determine which days are open in the accordion. If a session or challenge is active, ensure that day is open.
  const activeDay = activeSessionObj?.day ?? (activeChallengeDay ? Number(activeChallengeDay) : null);
  const initialOpenDays = activeDay ? [activeDay] : [1];

  const [openDays, setOpenDays] = useState<number[]>(initialOpenDays);

  // Keep newly active day open without collapsing already opened days
  useEffect(() => {
    if (activeDay) {
      setOpenDays((prev) => (prev.includes(activeDay) ? prev : [...prev, activeDay]));
    }
  }, [activeDay]);

  const toggleDay = (dayId: number) => {
    setOpenDays((prev) =>
      prev.includes(dayId) ? prev.filter((id) => id !== dayId) : [...prev, dayId]
    );
  };
  const [session, setSession] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Auto-close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname, searchParams]);

  const fetchSession = React.useCallback(async () => {
    try {
      const res = await fetch('/api/auth/session');
      const data = await res.json();
      if (data.session) {
        setSession(data.session);
      } else {
        setSession(null);
      }
    } catch (err) {
      console.error('Error fetching session in sidebar:', err);
    }
  }, []);

  useEffect(() => {
    fetchSession();

    // Listen for custom auth events from AuthGate or anywhere in the app
    const handleAuthChange = (e: any) => {
      if (e?.detail) {
        setSession(e.detail);
      } else {
        fetchSession();
      }
    };

    window.addEventListener('qff_auth_change', handleAuthChange);

    // Also subscribe to Supabase auth events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, sbSession) => {
      if (
        event === 'SIGNED_IN' ||
        event === 'INITIAL_SESSION' ||
        event === 'TOKEN_REFRESHED'
      ) {
        fetchSession();
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
      }
    });

    return () => {
      window.removeEventListener('qff_auth_change', handleAuthChange);
      subscription.unsubscribe();
    };
  }, [fetchSession]);

  async function handleSignOut() {
    try {
      await fetch('/api/auth/session', { method: 'DELETE' });
      await supabase.auth.signOut();
      setSession(null);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('qff_auth_change', { detail: null }));
      }
      window.location.reload();
    } catch (err) {
      console.error('Error signing out:', err);
    }
  }

  // Active Label for mobile header
  let activeMobileTitle = 'Curriculum Hub';
  if (isHackathon) {
    activeMobileTitle = 'Hackathon Workspace';
  } else if (activeSessionObj) {
    activeMobileTitle = `Day ${activeSessionObj.day} · Session ${activeSessionObj.sessionNumber}`;
  } else if (activeChallengeDay) {
    activeMobileTitle = `Day ${activeChallengeDay} Daily Challenge`;
  }

  // Navigation Items Renderer
  const renderNavContent = () => (
    <>
      <div className="font-mono text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-3 pb-2 pt-1">
        Learning Phase
      </div>

      {DAYS.map((day) => {
        const isDayOpen = openDays.includes(day.id);
        const daySessions = sessions.filter((s) => s.day === day.id);
        const dayChallenge = DAILY_COMPETITIONS[day.id];

        return (
          <div key={day.id} className="mb-1.5">
            <button
              onClick={() => toggleDay(day.id)}
              className={clsx(
                'w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-xs sm:text-sm font-semibold group cursor-pointer',
                isDayOpen
                  ? 'bg-slate-100 dark:bg-[#1C0A0D] text-slate-900 dark:text-[#FAF6F3]'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1C0A0D]'
              )}
            >
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <BookOpen
                  className={clsx(
                    'w-3.5 h-3.5 shrink-0',
                    isDayOpen
                      ? 'text-burgundy dark:text-[#E89BA5]'
                      : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'
                  )}
                />
                <span className="truncate">{day.label}</span>
              </div>
              {isDayOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 shrink-0" />
              )}
            </button>

            {/* Expandable Sessions & Challenge */}
            {isDayOpen && (
              <div className="mt-1 pl-2.5 sm:pl-3 space-y-0.5">
                {daySessions.map((sessionItem) => {
                  const isJustSessionActive =
                    pathname === `/learning/session/${sessionItem.id}`;
                  const isQuizActive =
                    pathname === `/learning/session/${sessionItem.id}/quiz`;

                  return (
                    <div key={sessionItem.id} className="flex flex-col mb-0.5">
                      <Link
                        href={`/learning/session/${sessionItem.id}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={clsx(
                          'group flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs sm:text-sm transition-colors',
                          isJustSessionActive
                            ? 'bg-burgundy/10 text-burgundy dark:bg-burgundy/25 dark:text-[#E89BA5] font-semibold'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1C0A0D] hover:text-slate-900 dark:hover:text-[#FAF6F3] font-medium'
                        )}
                      >
                        <PlayCircle
                          className={clsx(
                            'w-3.5 h-3.5 shrink-0',
                            isJustSessionActive
                              ? 'text-burgundy dark:text-[#E89BA5]'
                              : 'text-slate-400'
                          )}
                        />
                        <span className="line-clamp-1 leading-snug">
                          {sessionItem.title}
                        </span>
                        {sessionItem.isLive && (
                          <span className="ml-auto shrink-0 px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 font-mono text-[9px] font-bold uppercase tracking-wider animate-pulse">
                            LIVE
                          </span>
                        )}
                      </Link>

                      <Link
                        href={`/learning/session/${sessionItem.id}/quiz`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={clsx(
                          'group flex items-center gap-2 px-2.5 py-1 ml-4 rounded-md text-[11px] sm:text-xs transition-colors',
                          isQuizActive
                            ? 'bg-burgundy/10 text-burgundy dark:bg-burgundy/25 dark:text-[#E89BA5] font-semibold'
                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1C0A0D] hover:text-slate-800 dark:hover:text-slate-200'
                        )}
                      >
                        <Award
                          className={clsx(
                            'w-3 h-3 shrink-0',
                            isQuizActive
                              ? 'text-burgundy dark:text-[#E89BA5]'
                              : 'text-slate-400'
                          )}
                        />
                        <span>Concept Quiz</span>
                      </Link>
                    </div>
                  );
                })}

                {/* Daily Challenge inside the day */}
                {dayChallenge && (
                  <Link
                    href={`/learning?challenge=${day.id}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={clsx(
                      'group flex items-center gap-2 px-2.5 py-1.5 mt-0.5 rounded-md text-xs sm:text-sm transition-colors',
                      activeChallengeDay === String(day.id)
                        ? 'bg-burgundy/10 text-burgundy dark:bg-burgundy/25 dark:text-[#E89BA5] font-semibold'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1C0A0D] hover:text-slate-900 dark:hover:text-[#FAF6F3] font-medium'
                    )}
                  >
                    <Award
                      className={clsx(
                        'w-3.5 h-3.5 shrink-0',
                        activeChallengeDay === String(day.id)
                          ? 'text-burgundy dark:text-[#E89BA5]'
                          : 'text-slate-400'
                      )}
                    />
                    <span className="line-clamp-1 leading-snug">
                      Daily Challenge: {dayChallenge.title}
                    </span>
                  </Link>
                )}
              </div>
            )}
          </div>
        );
      })}

      <div className="font-mono text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-3 pb-2 pt-3 sm:pt-4">
        Hackathon Phase
      </div>

      <Link
        href="/learning/hackathon"
        onClick={() => setIsMobileMenuOpen(false)}
        className={clsx(
          'w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-xs sm:text-sm font-semibold group',
          isHackathon
            ? 'bg-burgundy/10 text-burgundy dark:bg-burgundy/20 dark:text-[#E89BA5] border border-burgundy/20 dark:border-burgundy/40'
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1C0A0D] border border-transparent'
        )}
      >
        <div className="flex items-center gap-2">
          <Users
            className={clsx(
              'w-3.5 h-3.5 shrink-0',
              isHackathon
                ? 'text-burgundy dark:text-[#E89BA5]'
                : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'
            )}
          />
          <span>Hackathon Workspace</span>
        </div>
        <ChevronRight
          className={clsx(
            'w-3.5 h-3.5 shrink-0',
            isHackathon
              ? 'text-burgundy dark:text-[#E89BA5]'
              : 'text-slate-300 dark:text-slate-600'
          )}
        />
      </Link>
    </>
  );

  // User Profile Renderer
  const renderUserProfile = () => {
    if (!session) return null;
    return (
      <div className="p-3 border-t border-slate-100 dark:border-[#3D1418] bg-slate-50 dark:bg-[#1C0A0D] shrink-0 mt-auto">
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-col min-w-0">
            <span
              title={session.fullName || session.email}
              className="font-semibold text-xs text-slate-800 dark:text-[#FAF6F3] truncate"
            >
              {session.fullName || session.email}
            </span>
            <span
              title={session.email}
              className="font-mono text-[10px] text-slate-500 dark:text-slate-400 truncate"
            >
              {session.email}
            </span>
          </div>

          <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-200/60 dark:border-[#3D1418]">
            {session.isAdmin && (
              <Link
                href="/learning/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-md bg-burgundy/10 text-burgundy dark:bg-burgundy/20 dark:text-[#E89BA5] hover:bg-burgundy/20 transition-colors font-mono text-[10px] font-semibold uppercase tracking-wider"
              >
                <Shield className="w-3 h-3" />
                Admin
              </Link>
            )}
            <button
              onClick={handleSignOut}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-md border border-slate-200 dark:border-[#3D1418] text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-rose-950/40 hover:text-red-700 dark:hover:text-rose-300 hover:border-red-200 transition-colors font-mono text-[10px] font-semibold uppercase tracking-wider cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────
          1. MOBILE VIEW (< md): Sleek Sticky Header & Dropdown Drawer
         ───────────────────────────────────────────────────────────── */}
      <div className="md:hidden w-full border-b border-slate-200 dark:border-[#3D1418] bg-white dark:bg-[#150709] z-40 sticky top-0">
        <div className="px-4 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-burgundy/10 text-burgundy dark:bg-burgundy/20 dark:text-[#E89BA5] uppercase tracking-wider shrink-0">
              Curriculum
            </span>
            <span className="text-xs font-semibold text-slate-800 dark:text-[#FAF6F3] truncate">
              {activeMobileTitle}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle Curriculum Menu"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#3D1418] bg-slate-50 dark:bg-[#1C0A0D] text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
          >
            {isMobileMenuOpen ? (
              <>
                <X className="w-3.5 h-3.5 text-burgundy dark:text-[#E89BA5]" />
                <span>Close</span>
              </>
            ) : (
              <>
                <Menu className="w-3.5 h-3.5 text-burgundy dark:text-[#E89BA5]" />
                <span>Menu</span>
              </>
            )}
          </button>
        </div>

        {/* Mobile Dropdown Drawer */}
        {isMobileMenuOpen && (
          <div className="border-t border-slate-200 dark:border-[#3D1418] bg-white dark:bg-[#150709] shadow-xl max-h-[75vh] flex flex-col overflow-hidden animate-in slide-in-from-top-2 duration-150">
            <div className="p-3 border-b border-slate-100 dark:border-[#3D1418] flex items-center justify-between">
              <span className="font-serif text-sm font-bold text-slate-900 dark:text-[#FAF6F3]">
                Curriculum Hub
              </span>
              <Link
                href="/learning"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-xs font-mono font-semibold text-burgundy dark:text-[#E89BA5] hover:underline"
              >
                Overview
              </Link>
            </div>

            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {renderNavContent()}
            </nav>

            {renderUserProfile()}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. DESKTOP VIEW (>= md): Classic Smooth Sticky Left Sidebar
         ───────────────────────────────────────────────────────────── */}
      <div
        className="hidden md:flex md:flex-col h-full bg-white dark:bg-[#150709] overflow-hidden relative"
        data-lenis-prevent="true"
        style={{ overscrollBehavior: 'contain' }}
      >
        {/* Header section */}
        <div className="p-4 border-b border-slate-100 dark:border-[#3D1418] bg-white dark:bg-[#150709] shrink-0 z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono px-2 py-0.5 rounded bg-burgundy/10 text-burgundy dark:bg-burgundy/20 dark:text-[#E89BA5] font-semibold text-[10px] uppercase tracking-[0.2em]">
              Curriculum
            </span>
          </div>
          <h2 className="font-serif text-lg font-bold text-slate-900 dark:text-[#FAF6F3] tracking-tight">
            Masterclass 2026
          </h2>
        </div>

        {/* Nav items - strictly scrollable options container */}
        <nav
          data-lenis-prevent="true"
          onWheel={(e) => {
            e.stopPropagation();
          }}
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-3 space-y-1 focus:outline-none [scrollbar-width:thin] [scrollbar-color:#CBD5E1_transparent] dark:[scrollbar-color:#3D1418_transparent]"
          style={{ overscrollBehavior: 'contain' }}
        >
          {renderNavContent()}
        </nav>

        {/* User Profile & Sign Out at the bottom */}
        {renderUserProfile()}
      </div>
    </>
  );
}
