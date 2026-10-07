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
  Compass,
} from 'lucide-react';
import clsx from 'clsx';
import { supabase } from '@/lib/supabase';
import { CURRICULUM_SESSIONS } from '@/data/learning/curriculum';
import { DAILY_COMPETITIONS } from '@/data/learning/competitions';

const DAYS = [
  { id: 1, label: 'Day 1: Foundations' },
  { id: 2, label: 'Day 2: Physical Realization' },
  { id: 3, label: 'Day 3: Applications & Security' },
];

export function LearningSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isHackathon = pathname === '/learning/hackathon';
  const activeChallengeDay = searchParams?.get('challenge');

  // Detect active session from pathname (e.g. /learning/session/session-3 or /learning/session/session-3/quiz)
  const sessionPathMatch = pathname?.match(/^\/learning\/session\/([^/]+)/);
  const activeSessionId = sessionPathMatch?.[1] || null;
  const activeSessionObj = activeSessionId
    ? CURRICULUM_SESSIONS.find((s) => s.id === activeSessionId)
    : null;

  // Determine which day is open in the accordion. If a session or challenge is active, open that day.
  const initialOpenDay = activeSessionId
    ? CURRICULUM_SESSIONS.find((s) => s.id === activeSessionId)?.day
    : activeChallengeDay
    ? Number(activeChallengeDay)
    : 1;

  const [openDay, setOpenDay] = useState<number | null>(initialOpenDay || 1);
  const [session, setSession] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<{
    id: string;
    title: string;
    badge?: string;
    subtitle?: string;
    meta?: string;
    top: number;
    left: number;
  } | null>(null);

  // Auto-close mobile drawer & dismiss hover tooltip on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setHoveredItem(null);
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
    activeMobileTitle = `Day ${activeSessionObj.day} · Session ${activeSessionObj.sessionNumber}: ${activeSessionObj.title}`;
  } else if (activeChallengeDay) {
    activeMobileTitle = `Day ${activeChallengeDay} Daily Challenge`;
  }

  // Navigation Items Renderer
  const renderNavContent = () => (
    <>
      <div className="font-mono text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-3 pb-2 pt-1">
        Learning Phase
      </div>

      {DAYS.map((day) => {
        const isDayOpen = openDay === day.id;
        const daySessions = CURRICULUM_SESSIONS.filter((s) => s.day === day.id);
        const dayChallenge = DAILY_COMPETITIONS[day.id];

        return (
          <div key={day.id} className="mb-2">
            <button
              onClick={() => setOpenDay(isDayOpen ? null : day.id)}
              title={day.label}
              className={clsx(
                'w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-semibold group cursor-pointer',
                isDayOpen
                  ? 'bg-slate-100 dark:bg-[#1C0A0D] text-slate-900 dark:text-[#FAF6F3]'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1C0A0D]'
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <BookOpen
                  className={clsx(
                    'w-4 h-4 shrink-0',
                    isDayOpen
                      ? 'text-burgundy dark:text-[#E89BA5]'
                      : 'text-slate-400 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'
                  )}
                />
                <span className="truncate">{day.label}</span>
              </div>
              {isDayOpen ? (
                <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-400 shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 shrink-0" />
              )}
            </button>

            {/* Expandable Sessions & Challenge */}
            {isDayOpen && (
              <div className="mt-1 pl-3 sm:pl-4 space-y-1">
                {daySessions.map((sessionItem) => {
                  const isJustSessionActive =
                    pathname === `/learning/session/${sessionItem.id}`;
                  const isQuizActive =
                    pathname === `/learning/session/${sessionItem.id}/quiz`;

                  return (
                    <div key={sessionItem.id} className="flex flex-col mb-1">
                      <Link
                        href={`/learning/session/${sessionItem.id}`}
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          setHoveredItem(null);
                        }}
                        title={sessionItem.title}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredItem({
                            id: sessionItem.id,
                            title: sessionItem.title,
                            badge: `Day ${sessionItem.day} · Session ${sessionItem.sessionNumber}`,
                            subtitle: `${sessionItem.speaker.name} · ${sessionItem.speaker.institution}`,
                            meta: sessionItem.duration,
                            top: rect.top + rect.height / 2,
                            left: rect.right + 10,
                          });
                        }}
                        onMouseLeave={() => setHoveredItem(null)}
                        className={clsx(
                          'group flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors',
                          isJustSessionActive
                            ? 'bg-burgundy/10 text-burgundy dark:bg-burgundy/25 dark:text-[#E89BA5] font-semibold'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1C0A0D] hover:text-slate-900 dark:hover:text-[#FAF6F3] font-medium'
                        )}
                      >
                        <PlayCircle
                          className={clsx(
                            'w-3.5 h-3.5 shrink-0 transition-transform group-hover:scale-110',
                            isJustSessionActive
                              ? 'text-burgundy dark:text-[#E89BA5]'
                              : 'text-slate-400 dark:text-slate-400'
                          )}
                        />
                        <span className="line-clamp-1 leading-snug group-hover:text-slate-900 dark:group-hover:text-[#FAF6F3] transition-colors">
                          {sessionItem.title}
                        </span>
                      </Link>

                      <Link
                        href={`/learning/session/${sessionItem.id}/quiz`}
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          setHoveredItem(null);
                        }}
                        title={`Concept Quiz · Session ${sessionItem.sessionNumber}: ${sessionItem.title}`}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredItem({
                            id: `quiz-${sessionItem.id}`,
                            title: `Concept Quiz: ${sessionItem.title}`,
                            badge: `Session ${sessionItem.sessionNumber} Assessment`,
                            subtitle: 'Pass the quiz to fulfill academic requirements for the certificate.',
                            top: rect.top + rect.height / 2,
                            left: rect.right + 10,
                          });
                        }}
                        onMouseLeave={() => setHoveredItem(null)}
                        className={clsx(
                          'group flex items-center gap-2.5 px-3 py-1.5 ml-4 mt-0.5 rounded-md text-xs transition-colors',
                          isQuizActive
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold border border-emerald-100 dark:border-emerald-900'
                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1C0A0D] hover:text-slate-800 dark:hover:text-slate-200'
                        )}
                      >
                        <Award
                          className={clsx(
                            'w-3 h-3 shrink-0 transition-transform group-hover:scale-110',
                            isQuizActive
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-400 dark:text-slate-400'
                          )}
                        />
                        <span className="line-clamp-1 leading-snug">Concept Quiz</span>
                      </Link>
                    </div>
                  );
                })}

                {/* Daily Challenge inside the day */}
                {dayChallenge && (
                  <Link
                    href={`/learning?challenge=${day.id}`}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setHoveredItem(null);
                    }}
                    title={`Daily Challenge: ${dayChallenge.title} - ${dayChallenge.subtitle}`}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setHoveredItem({
                        id: `challenge-${day.id}`,
                        title: `Daily Challenge: ${dayChallenge.title}`,
                        badge: `Day ${day.id} Challenge`,
                        subtitle: dayChallenge.subtitle,
                        meta: `Due: ${dayChallenge.submissionDeadline}`,
                        top: rect.top + rect.height / 2,
                        left: rect.right + 10,
                      });
                    }}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={clsx(
                      'group flex items-center gap-2.5 px-3 py-2 mt-1 rounded-md text-sm transition-colors',
                      activeChallengeDay === String(day.id)
                        ? 'bg-burgundy/10 text-burgundy dark:bg-burgundy/25 dark:text-[#E89BA5] font-semibold'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1C0A0D] hover:text-slate-900 dark:hover:text-[#FAF6F3] font-medium'
                    )}
                  >
                    <Award
                      className={clsx(
                        'w-3.5 h-3.5 shrink-0 transition-transform group-hover:scale-110',
                        activeChallengeDay === String(day.id)
                          ? 'text-burgundy dark:text-[#E89BA5]'
                          : 'text-slate-400 dark:text-slate-400'
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

      <div className="font-mono text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-3 pb-2 pt-4 sm:pt-6">
        Hackathon Phase
      </div>

      <Link
        href="/learning/hackathon"
        onClick={() => {
          setIsMobileMenuOpen(false);
          setHoveredItem(null);
        }}
        title="Hackathon Workspace · Team Formation & Project Submissions"
        onMouseEnter={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setHoveredItem({
            id: 'hackathon',
            title: 'Hackathon Workspace',
            badge: 'Main Hackathon',
            subtitle: 'Collaborate with your team, claim problem statements, and submit repositories.',
            top: rect.top + rect.height / 2,
            left: rect.right + 10,
          });
        }}
        onMouseLeave={() => setHoveredItem(null)}
        className={clsx(
          'w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-semibold group',
          isHackathon
            ? 'bg-burgundy/10 text-burgundy dark:bg-burgundy/20 dark:text-[#E89BA5] border border-burgundy/20 dark:border-burgundy/40'
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1C0A0D] border border-transparent'
        )}
      >
        <div className="flex items-center gap-2.5">
          <Users
            className={clsx(
              'w-4 h-4 shrink-0',
              isHackathon
                ? 'text-burgundy dark:text-[#E89BA5]'
                : 'text-slate-400 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'
            )}
          />
          <span>Workspace</span>
        </div>
        <ChevronRight
          className={clsx(
            'w-3.5 h-3.5 transition-transform shrink-0',
            isHackathon
              ? 'text-burgundy dark:text-[#E89BA5] translate-x-0.5'
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
      <div className="p-4 border-t border-slate-100 dark:border-[#3D1418] bg-slate-50 dark:bg-[#1C0A0D] shrink-0 mt-auto">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col min-w-0">
            <span
              title={session.fullName || session.email}
              className="font-semibold text-sm text-slate-800 dark:text-[#FAF6F3] truncate"
            >
              {session.fullName || session.email}
            </span>
            <span
              title={session.email}
              className="font-mono text-[11px] text-slate-500 dark:text-slate-400 truncate"
            >
              {session.email}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1 pt-2 border-t border-slate-200/60 dark:border-[#3D1418]">
            {session.isAdmin && (
              <Link
                href="/learning/admin"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setHoveredItem(null);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg bg-burgundy/10 text-burgundy dark:bg-burgundy/20 dark:text-[#E89BA5] hover:bg-burgundy/20 dark:hover:bg-burgundy/30 transition-colors font-mono text-[11px] font-semibold uppercase tracking-wider"
              >
                <Shield className="w-3.5 h-3.5" />
                Admin
              </Link>
            )}
            <button
              onClick={handleSignOut}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg border border-slate-200 dark:border-[#3D1418] text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-rose-950/40 hover:text-red-700 dark:hover:text-rose-300 hover:border-red-200 dark:hover:border-rose-900 transition-colors font-mono text-[11px] font-semibold uppercase tracking-wider cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
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
          <div className="border-t border-slate-200 dark:border-[#3D1418] bg-white dark:bg-[#150709] shadow-2xl max-h-[75vh] flex flex-col overflow-hidden animate-in slide-in-from-top-2 duration-200">
            <div className="p-4 border-b border-slate-100 dark:border-[#3D1418] flex items-center justify-between">
              <div>
                <h3 className="font-serif text-base font-bold text-slate-900 dark:text-[#FAF6F3]">
                  Quantum Masterclass 2026
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Select a session, quiz, or challenge to jump to it.
                </p>
              </div>
              <Link
                href="/learning"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-xs font-mono font-semibold text-burgundy dark:text-[#E89BA5] hover:underline"
              >
                Overview
              </Link>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
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
        <div className="p-6 border-b border-slate-100 dark:border-[#3D1418] bg-white dark:bg-[#150709] shrink-0 z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono px-2 py-0.5 rounded bg-burgundy/10 text-burgundy dark:bg-burgundy/20 dark:text-[#E89BA5] font-semibold text-[11px] uppercase tracking-[0.2em]">
              Curriculum
            </span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#FAF6F3] tracking-tight">
            Masterclass 2026
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed font-sans">
            Complete the sessions sequentially to earn your certificate.
          </p>
        </div>

        {/* Nav items - strictly scrollable options container */}
        <nav
          data-lenis-prevent="true"
          onWheel={(e) => {
            e.stopPropagation();
          }}
          onScroll={() => setHoveredItem(null)}
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-1 focus:outline-none [scrollbar-width:thin] [scrollbar-color:#CBD5E1_transparent] dark:[scrollbar-color:#3D1418_transparent]"
          style={{ overscrollBehavior: 'contain' }}
        >
          {renderNavContent()}
        </nav>

        {/* User Profile & Sign Out at the bottom */}
        {renderUserProfile()}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. FLOATING HOVER PREVIEW TOOLTIP (Never clipped by sidebar overflow)
         ───────────────────────────────────────────────────────────── */}
      {hoveredItem && typeof window !== 'undefined' && (
        <div
          style={{
            top: `${Math.max(80, Math.min(hoveredItem.top, window.innerHeight - 90))}px`,
            left: `${Math.min(hoveredItem.left, window.innerWidth - 320)}px`,
          }}
          className="hidden md:flex fixed z-50 -translate-y-1/2 flex-col max-w-sm w-76 p-3.5 bg-white/98 dark:bg-[#1C0A0D]/98 backdrop-blur-md border border-slate-200 dark:border-[#3D1418] rounded-xl shadow-2xl pointer-events-none animate-in fade-in zoom-in-95 duration-150 ring-1 ring-black/5 dark:ring-white/5"
        >
          {/* Subtle pointer arrowhead */}
          <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white dark:bg-[#1C0A0D] border-l border-b border-slate-200 dark:border-[#3D1418] rotate-45" />

          {hoveredItem.badge && (
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="font-mono text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-burgundy/10 text-burgundy dark:bg-burgundy/25 dark:text-[#E89BA5]">
                {hoveredItem.badge}
              </span>
              {hoveredItem.meta && (
                <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                  {hoveredItem.meta}
                </span>
              )}
            </div>
          )}

          <h4 className="font-sans text-xs sm:text-sm font-bold text-slate-900 dark:text-[#FAF6F3] leading-snug">
            {hoveredItem.title}
          </h4>

          {hoveredItem.subtitle && (
            <p className="font-sans text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {hoveredItem.subtitle}
            </p>
          )}
        </div>
      )}
    </>
  );
}
