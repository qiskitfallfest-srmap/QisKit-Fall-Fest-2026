'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AuthGate } from '@/components/learning/AuthGate';
import { AdminAnalyticsView } from '@/components/learning/AdminAnalyticsView';
import { AdminHackathonView } from '@/components/learning/AdminHackathonView';
import { AdminSessionsManager } from '@/components/learning/AdminSessionsManager';
import { AdminQuizzesManager } from '@/components/learning/AdminQuizzesManager';
import { AdminCodingChallengeView } from '@/components/learning/AdminCodingChallengeView';
import { AdminCompetitionsView } from '@/components/learning/AdminCompetitionsView';
import { AdminPaymentsManager } from '@/components/learning/AdminPaymentsManager';
import { AdminPhase2View } from '@/components/learning/AdminPhase2View';
import { AdminNoticesManager } from '@/components/learning/AdminNoticesManager';
import { AdminAccommodationView } from '@/components/learning/AdminAccommodationView';
import { AdminRequestsView } from '@/components/learning/AdminRequestsView';
import { AdminWhitelistManager } from '@/components/learning/AdminWhitelistManager';
import { AdminOverridesPanel } from '@/components/learning/AdminOverridesPanel';
import {
  Shield,
  ListChecks,
  Ticket,
  Users,
  ArrowLeft,
  BarChart3,
  SlidersHorizontal,
  Video,
  Terminal,
  ChevronRight,
  Award,
  Trophy,
  Bell,
  Inbox,
  BedDouble,
} from 'lucide-react';

type AdminTab =
  | 'analytics'
  | 'phase2'
  | 'hackathon'
  | 'competitions'
  | 'whitelist'
  | 'overrides'
  | 'sessions'
  | 'quizzes'
  | 'coding'
  | 'payments'
  | 'notices'
  | 'accommodation'
  | 'requests';

const NAV_GROUPS: { label: string; items: { id: AdminTab; label: string; icon: React.ElementType }[] }[] = [
  {
    label: 'Hackathon',
    items: [
      { id: 'hackathon', label: 'Teams & Participants', icon: Trophy },
      { id: 'phase2', label: 'Phase 2 Results', icon: ListChecks },
    ],
  },
  {
    label: 'Participants',
    items: [
      { id: 'whitelist', label: 'Access & Whitelist', icon: Users },
      { id: 'requests', label: 'Requests & Questions', icon: Inbox },
      { id: 'payments', label: 'Payments', icon: Ticket },
      { id: 'accommodation', label: 'Accommodation', icon: BedDouble },
      { id: 'notices', label: 'Notices', icon: Bell },
    ],
  },
  {
    label: 'Learning',
    items: [
      { id: 'competitions', label: 'Daily Competitions', icon: Award },
      { id: 'coding', label: 'Coding Challenge', icon: Terminal },
      { id: 'quizzes', label: 'Quizzes & Locking', icon: ListChecks },
      { id: 'sessions', label: 'Session Videos', icon: Video },
    ],
  },
  {
    label: 'System',
    items: [
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
      { id: 'overrides', label: 'Release Overrides', icon: SlidersHorizontal },
    ],
  },
];

const ALL_TABS: AdminTab[] = NAV_GROUPS.flatMap((g) => g.items.map((i) => i.id));

interface Attention {
  passPending: number;
  certPending: number;
  certToDeliver: number;
  accommodationRequested: number;
}

export default function AdminConsolePage() {
  const [session, setSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('hackathon');

  // Keep the selected section in ?tab= so a refresh or shared link reopens it.
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('tab');
    if (fromUrl && ALL_TABS.includes(fromUrl as AdminTab)) {
      setActiveTab(fromUrl as AdminTab);
    }
  }, []);

  // Sections stay mounted (hidden) after their first visit so switching back
  // keeps their loaded data, filters and scroll position.
  const [visited, setVisited] = useState<Set<AdminTab>>(() => new Set([activeTab]));
  useEffect(() => {
    setVisited((prev) => (prev.has(activeTab) ? prev : new Set(prev).add(activeTab)));
  }, [activeTab]);

  function selectTab(tab: AdminTab) {
    setActiveTab(tab);
    fetchConfig();
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.replaceState(null, '', url);
  }

  const [whitelistCount, setWhitelistCount] = useState<number | null>(null);
  const [stats, setStats] = useState<any>({});
  const [attention, setAttention] = useState<Attention | null>(null);

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/config');
      const data = await res.json();
      if (data.stats) {
        setStats(data.stats);
      }
      if (data.attention) {
        setAttention(data.attention);
      }
    } catch (e) {
      console.error('Error fetching config:', e);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const tabCounts: Partial<Record<AdminTab, number>> = {
    hackathon: stats.teamsFormed || 0,
    competitions: stats.competitionSubmissions || 0,
    whitelist: whitelistCount ?? stats.whitelistedUsers ?? 0,
  };

  const attentionItems: { label: string; count: number; tab: AdminTab }[] = attention
    ? [
        { label: 'Pass payments to review', count: attention.passPending, tab: 'payments' },
        { label: 'Certificate payments to review', count: attention.certPending, tab: 'payments' },
        { label: 'Certificates to deliver', count: attention.certToDeliver, tab: 'payments' },
        { label: 'Accommodation to allocate', count: attention.accommodationRequested, tab: 'accommodation' },
      ].filter((item) => item.count > 0) as { label: string; count: number; tab: AdminTab }[]
    : [];

  const sections: Record<AdminTab, React.ReactNode> = {
    hackathon: <AdminHackathonView />,
    phase2: <AdminPhase2View />,
    whitelist: <AdminWhitelistManager onChange={fetchConfig} onCountChange={setWhitelistCount} />,
    payments: <AdminPaymentsManager />,
    accommodation: <AdminAccommodationView />,
    notices: <AdminNoticesManager />,
    requests: <AdminRequestsView />,
    competitions: <AdminCompetitionsView />,
    coding: <AdminCodingChallengeView />,
    quizzes: <AdminQuizzesManager />,
    sessions: <AdminSessionsManager />,
    analytics: <AdminAnalyticsView />,
    overrides: <AdminOverridesPanel />,
  };

  return (
    <AuthGate onSessionChange={setSession}>
      <div className="min-h-screen bg-slate-50/60 dark:bg-[#100405] pb-16 font-sans">
        {/* Navigation Breadcrumb Bar */}
        <div className="bg-white/90 dark:bg-[#150709]/90 border-b border-slate-200 dark:border-[#3D1418] sticky top-0 z-20 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
            <Link
              href="/learning"
              className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-[#FAF6F3] flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Learning Hub
            </Link>

            <span className="px-2.5 py-0.5 rounded bg-burgundy/10 text-burgundy dark:bg-burgundy/20 dark:text-[#E89BA5] font-bold text-xs uppercase tracking-wider flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              Organizer Administration Console
            </span>
          </div>
        </div>

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-[#FAF6F3] tracking-tight">
                Festival Administration & Analytics
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Monitor live traffic with Vercel Analytics & Redis cache, manage participant access
                control, and configure real-time testing overrides.
              </p>
            </div>

            {/* Work waiting on an organizer */}
            {attention && (
              <div className="flex flex-wrap items-center gap-2">
                {attentionItems.length === 0 ? (
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] px-3 py-1.5 rounded-lg shadow-2xs">
                    Nothing waiting for review
                  </span>
                ) : (
                  attentionItems.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => selectTab(item.tab)}
                      className="text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 hover:border-amber-300 dark:hover:border-amber-500/50 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {item.label}: <strong className="tabular-nums">{item.count}</strong>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8 lg:items-start">
          {/* Navigation: native select on small screens, grouped sidebar on desktop */}
          <div className="lg:hidden mb-6">
            <label htmlFor="admin-section" className="sr-only">Section</label>
            <select
              id="admin-section"
              value={activeTab}
              onChange={(e) => selectTab(e.target.value as AdminTab)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-[#3D1418] bg-white dark:bg-[#150709] text-sm font-semibold text-slate-900 dark:text-[#FAF6F3]"
            >
              {NAV_GROUPS.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.items.map((item) => {
                    const count = tabCounts[item.id];
                    return (
                      <option key={item.id} value={item.id}>
                        {item.label}{count !== undefined ? ` (${count})` : ''}
                      </option>
                    );
                  })}
                </optgroup>
              ))}
            </select>
          </div>

          <nav aria-label="Admin sections" className="hidden lg:block sticky top-20 space-y-5">
            {NAV_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {group.label}
                </p>
                <ul className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    const count = tabCounts[item.id];
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => selectTab(item.id)}
                          aria-current={isActive ? 'page' : undefined}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-left transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-burgundy/10 text-burgundy dark:bg-burgundy/20 dark:text-[#E89BA5]'
                              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1C0A0D] hover:text-slate-900 dark:hover:text-[#FAF6F3]'
                          }`}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="flex-1 truncate">{item.label}</span>
                          {count !== undefined && (
                            <span className="text-[10px] font-bold tabular-nums text-slate-400 dark:text-slate-500">
                              {count}
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          <div className="min-w-0">
            {ALL_TABS.filter((tab) => visited.has(tab)).map((tab) => (
              <div key={tab} hidden={activeTab !== tab}>
                {sections[tab]}
              </div>
            ))}
          </div>
          </div>
        </div>
      </div>
    </AuthGate>
  );
}
