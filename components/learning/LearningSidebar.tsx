'use client';

import React, { useState } from 'react';
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
  const activeSessionId = searchParams?.get('session');
  const activeChallengeDay = searchParams?.get('challenge');

  // Determine which day is open in the accordion. If a session or challenge is active, open that day.
  const initialOpenDay = activeSessionId 
    ? CURRICULUM_SESSIONS.find(s => s.id === activeSessionId)?.day 
    : activeChallengeDay 
      ? Number(activeChallengeDay) 
      : 1;

  const [openDay, setOpenDay] = useState<number | null>(initialOpenDay || 1);
  const [session, setSession] = useState<any>(null);

  React.useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        if (data.session) setSession(data.session);
      })
      .catch(console.error);
  }, []);

  async function handleSignOut() {
    try {
      await fetch('/api/auth/session', { method: 'DELETE' });
      await supabase.auth.signOut();
      window.location.reload();
    } catch (err) {
      console.error('Error signing out:', err);
    }
  }

  return (
    <div 
      className="flex flex-col h-full bg-white overflow-hidden"
      data-lenis-prevent="true"
      style={{ overscrollBehavior: 'contain' }}
    >
      {/* Header section */}
      <div className="p-6 border-b border-slate-100 bg-white shrink-0 z-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-mono px-2 py-0.5 rounded bg-burgundy/10 text-burgundy font-semibold text-[11px] uppercase tracking-[0.2em]">
            Curriculum
          </span>
        </div>
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Masterclass 2026
        </h2>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed font-sans">
          Complete the sessions sequentially to earn your certificate.
        </p>
      </div>

      {/* Nav items - strictly scrollable options container */}
      <nav 
        data-lenis-prevent="true"
        onWheel={(e) => {
          e.stopPropagation();
        }}
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-1 focus:outline-none [scrollbar-width:thin] [scrollbar-color:#CBD5E1_transparent]"
        style={{ overscrollBehavior: 'contain' }}
      >
        <div className="font-mono text-xs font-semibold text-slate-400 uppercase tracking-[0.2em] px-3 pb-2 pt-1">
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
                    ? 'bg-slate-50 text-slate-900' 
                    : 'text-slate-600 hover:bg-slate-50'
                )}
              >
                <div className="flex items-center gap-3">
                  <BookOpen className={clsx('w-4 h-4', isDayOpen ? 'text-slate-800' : 'text-slate-400 group-hover:text-slate-600')} />
                  <span>{day.label}</span>
                </div>
                {isDayOpen ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                )}
              </button>

              {/* Expandable Sessions & Challenge */}
              {isDayOpen && (
                <div className="mt-1 pl-4 space-y-1">
                  {daySessions.map(session => {
                    const isActive = activeSessionId === session.id;
                    const isQuizActive = isActive && searchParams?.get('quiz') === 'true';
                    const isJustSessionActive = isActive && !isQuizActive;

                    return (
                      <div key={session.id} className="flex flex-col mb-1">
                        <Link
                          href={`/learning?session=${session.id}`}
                          className={clsx(
                            'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors',
                            isJustSessionActive
                              ? 'bg-burgundy/10 text-burgundy font-semibold'
                              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium'
                          )}
                        >
                          <PlayCircle className={clsx('w-3.5 h-3.5', isJustSessionActive ? 'text-burgundy' : 'text-slate-400')} />
                          <span className="line-clamp-1">{session.title}</span>
                        </Link>
                        
                        <Link
                          href={`/learning?session=${session.id}&quiz=true`}
                          className={clsx(
                            'flex items-center gap-2.5 px-3 py-1.5 ml-4 mt-0.5 rounded-md text-xs transition-colors',
                            isQuizActive
                              ? 'bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100'
                              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                          )}
                        >
                          <Award className={clsx('w-3 h-3', isQuizActive ? 'text-emerald-600' : 'text-slate-400')} />
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
                          ? 'bg-burgundy/10 text-burgundy font-semibold'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium'
                      )}
                    >
                      <Award className={clsx('w-3.5 h-3.5', activeChallengeDay === String(day.id) ? 'text-burgundy' : 'text-slate-400')} />
                      <span className="line-clamp-1">Daily Challenge</span>
                    </Link>
                  )}
                </div>
              )}
            </div>
          );
        })}

        <div className="font-mono text-xs font-semibold text-slate-400 uppercase tracking-[0.2em] px-3 pb-2 pt-6">
          Hackathon Phase
        </div>

        <Link
          href="/learning/hackathon"
          className={clsx(
            'w-full flex items-center justify-between px-3 py-3 rounded-lg transition-all duration-200 text-sm font-semibold group',
            isHackathon 
              ? 'bg-burgundy/5 text-burgundy border border-burgundy/20' 
              : 'text-slate-600 hover:bg-slate-50 border border-transparent'
          )}
        >
          <div className="flex items-center gap-3">
            <Users className={clsx('w-4 h-4', isHackathon ? 'text-burgundy' : 'text-slate-400 group-hover:text-slate-600')} />
            <span>Workspace</span>
          </div>
          <ChevronRight className={clsx('w-3.5 h-3.5 transition-transform', isHackathon ? 'text-burgundy translate-x-0.5' : 'text-slate-300')} />
        </Link>
      </nav>

      {/* User Profile & Sign Out at the bottom */}
      {session && (
        <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0 mt-auto">
          <div className="flex flex-col gap-2">
            <div className="flex flex-col">
              <span className="font-semibold text-sm text-slate-800 line-clamp-1">
                {session.fullName || session.email}
              </span>
              <span className="font-mono text-[11px] text-slate-500 line-clamp-1">{session.email}</span>
            </div>
            
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200/60">
              {session.isAdmin && (
                <Link
                  href="/learning/admin"
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded bg-burgundy/10 text-burgundy hover:bg-burgundy/20 transition-colors font-mono text-[11px] font-semibold uppercase tracking-wider"
                >
                  <Shield className="w-3 h-3" />
                  Admin
                </Link>
              )}
              <button
                onClick={handleSignOut}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded border border-slate-200 text-slate-600 hover:bg-slate-200 transition-colors font-mono text-[11px] font-semibold uppercase tracking-wider cursor-pointer"
              >
                <LogOut className="w-3 h-3" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
