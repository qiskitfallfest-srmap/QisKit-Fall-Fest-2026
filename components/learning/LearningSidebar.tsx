'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { BookOpen, Users, ChevronRight, ChevronDown, Award, PlayCircle, LogOut, Shield } from 'lucide-react';
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

  // Determine which day is open in the accordion. If a session or challenge is active, open that day.
  const initialOpenDay = activeSessionId 
    ? CURRICULUM_SESSIONS.find(s => s.id === activeSessionId)?.day 
    : activeChallengeDay 
      ? Number(activeChallengeDay) 
      : 1;

  const [openDay, setOpenDay] = useState<number | null>(initialOpenDay || 1);
  const [session, setSession] = useState<any>(null);

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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, sbSession) => {
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') {
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

  return (
    <div 
      className="flex flex-col h-full bg-white dark:bg-[#150709] overflow-hidden"
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
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-1 focus:outline-none [scrollbar-width:thin] [scrollbar-color:#CBD5E1_transparent] dark:[scrollbar-color:#3D1418_transparent]"
        style={{ overscrollBehavior: 'contain' }}
      >
        <div className="font-mono text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-3 pb-2 pt-1">
          Learning Phase
        </div>
        
        {DAYS.map((day) => {
          const isDayOpen = openDay === day.id;
          const daySessions = CURRICULUM_SESSIONS.filter(s => s.day === day.id);
          const dayChallenge = DAILY_COMPETITIONS[day.id];

          return (
            <div key={day.id} className="mb-2">
              <button
                onClick={() => setOpenDay(isDayOpen ? null : day.id)}
                className={clsx(
                  'w-full flex items-center justify-between px-3 py-3 rounded-lg transition-all duration-200 text-sm font-semibold group',
                  isDayOpen 
                    ? 'bg-slate-50 dark:bg-[#1C0A0D] text-slate-900 dark:text-[#FAF6F3]' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1C0A0D]'
                )}
              >
                <div className="flex items-center gap-3">
                  <BookOpen className={clsx('w-4 h-4', isDayOpen ? 'text-slate-800 dark:text-[#FAF6F3]' : 'text-slate-400 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200')} />
                  <span>{day.label}</span>
                </div>
                {isDayOpen ? (
                  <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
                )}
              </button>

              {/* Expandable Sessions & Challenge */}
              {isDayOpen && (
                <div className="mt-1 pl-4 space-y-1">
                  {daySessions.map(sessionItem => {
                    const isJustSessionActive = pathname === `/learning/session/${sessionItem.id}`;
                    const isQuizActive = pathname === `/learning/session/${sessionItem.id}/quiz`;

                    return (
                      <div key={sessionItem.id} className="flex flex-col mb-1">
                        <Link
                          href={`/learning/session/${sessionItem.id}`}
                          className={clsx(
                            'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors',
                            isJustSessionActive
                              ? 'bg-burgundy/10 text-burgundy dark:bg-burgundy/25 dark:text-[#E89BA5] font-semibold'
                              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1C0A0D] hover:text-slate-900 dark:hover:text-[#FAF6F3] font-medium'
                          )}
                        >
                          <PlayCircle className={clsx('w-3.5 h-3.5', isJustSessionActive ? 'text-burgundy dark:text-[#E89BA5]' : 'text-slate-400 dark:text-slate-400')} />
                          <span className="line-clamp-1">{sessionItem.title}</span>
                        </Link>
                        
                        <Link
                          href={`/learning/session/${sessionItem.id}/quiz`}
                          className={clsx(
                            'flex items-center gap-2.5 px-3 py-1.5 ml-4 mt-0.5 rounded-md text-xs transition-colors',
                            isQuizActive
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold border border-emerald-100 dark:border-emerald-900'
                              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1C0A0D] hover:text-slate-800 dark:hover:text-slate-200'
                          )}
                        >
                          <Award className={clsx('w-3 h-3', isQuizActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-400')} />
                          <span className="line-clamp-1">Concept Quiz</span>
                        </Link>
                      </div>
                    );
                  })}

                  {/* Daily Challenge inside the day */}
                  {dayChallenge && (
                    <Link
                      href={`/learning?challenge=${day.id}`}
                      className={clsx(
                        'flex items-center gap-2.5 px-3 py-2 mt-1 rounded-md text-sm transition-colors',
                        activeChallengeDay === String(day.id)
                          ? 'bg-burgundy/10 text-burgundy dark:bg-burgundy/25 dark:text-[#E89BA5] font-semibold'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1C0A0D] hover:text-slate-900 dark:hover:text-[#FAF6F3] font-medium'
                      )}
                    >
                      <Award className={clsx('w-3.5 h-3.5', activeChallengeDay === String(day.id) ? 'text-burgundy dark:text-[#E89BA5]' : 'text-slate-400 dark:text-slate-400')} />
                      <span className="line-clamp-1">Daily Challenge</span>
                    </Link>
                  )}
                </div>
              )}
            </div>
          );
        })}

        <div className="font-mono text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-3 pb-2 pt-6">
          Hackathon Phase
        </div>

        <Link
          href="/learning/hackathon"
          className={clsx(
            'w-full flex items-center justify-between px-3 py-3 rounded-lg transition-all duration-200 text-sm font-semibold group',
            isHackathon 
              ? 'bg-burgundy/5 text-burgundy dark:bg-burgundy/20 dark:text-[#E89BA5] border border-burgundy/20 dark:border-burgundy/40' 
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1C0A0D] border border-transparent'
          )}
        >
          <div className="flex items-center gap-3">
            <Users className={clsx('w-4 h-4', isHackathon ? 'text-burgundy dark:text-[#E89BA5]' : 'text-slate-400 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200')} />
            <span>Workspace</span>
          </div>
          <ChevronRight className={clsx('w-3.5 h-3.5 transition-transform', isHackathon ? 'text-burgundy dark:text-[#E89BA5] translate-x-0.5' : 'text-slate-300 dark:text-slate-600')} />
        </Link>
      </nav>

      {/* User Profile & Sign Out at the bottom */}
      {session && (
        <div className="p-4 border-t border-slate-100 dark:border-[#3D1418] bg-slate-50 dark:bg-[#1C0A0D] shrink-0 mt-auto">
          <div className="flex flex-col gap-2">
            <div className="flex flex-col">
              <span className="font-semibold text-sm text-slate-800 dark:text-[#FAF6F3] line-clamp-1">
                {session.fullName || session.email}
              </span>
              <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{session.email}</span>
            </div>
            
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200/60 dark:border-[#3D1418]">
              {session.isAdmin && (
                <Link
                  href="/learning/admin"
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
      )}
    </div>
  );
}
