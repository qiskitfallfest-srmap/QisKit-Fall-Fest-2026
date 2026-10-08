'use client';

import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import {
  Terminal,
  Trophy,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search,
  Filter,
  Users,
  Code2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export function AdminCodingChallengeView() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterProblem, setFilterProblem] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchUser, setSearchUser] = useState<string>('');

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/coding-challenge', { cache: 'no-store' });
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load coding challenge stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const submissions = data?.recentSubmissions || [];
  const filteredSubmissions = submissions.filter((sub: any) => {
    if (filterProblem !== 'all' && sub.challenge_id !== filterProblem) return false;
    if (filterStatus !== 'all' && sub.status !== filterStatus) return false;
    if (searchUser && !sub.user_email.toLowerCase().includes(searchUser.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418]">
        <div>
          <h2 className="font-serif text-lg font-bold text-slate-900 dark:text-[#FAF6F3]">
            Qiskit Challenge Analytics & Submissions
          </h2>
          <p className="text-xs text-slate-500">
            Real-time evaluation statistics, problem solve rates, and participant submission records.
          </p>
        </div>

        <button
          onClick={fetchStats}
          disabled={isLoading}
          className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-[#3D1418] hover:bg-slate-100 dark:hover:bg-[#1C0A0D] text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={clsx('w-3.5 h-3.5', isLoading && 'animate-spin')} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">Total Submissions</span>
          <div className="font-serif text-2xl font-bold mt-1 text-slate-900 dark:text-[#FAF6F3]">
            {data?.stats?.totalSubmissions || 0}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">Active Participants</span>
          <div className="font-serif text-2xl font-bold mt-1 text-slate-900 dark:text-[#FAF6F3]">
            {data?.stats?.uniqueParticipants || 0}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] shadow-xs">
          <span className="text-xs text-slate-500 font-semibold">Problems Configured</span>
          <div className="font-serif text-2xl font-bold mt-1 text-slate-900 dark:text-[#FAF6F3]">
            9 Problems (100 pts)
          </div>
        </div>
      </div>

      {/* Problem-wise Statistics Grid */}
      <div className="bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-xl p-5 shadow-xs space-y-3">
        <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-500">
          Problem-Wise Performance
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(data?.stats?.problems || []).map((prob: any) => (
            <div
              key={prob.id}
              className="p-3.5 rounded-lg border border-slate-100 dark:border-[#3D1418] bg-slate-50/50 dark:bg-[#1C0A0D] flex flex-col justify-between gap-2"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-burgundy dark:text-[#E89BA5]">
                    {prob.problemCode}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    {prob.points} pts
                  </span>
                </div>
                <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                  {prob.title}
                </h4>
              </div>

              <div className="pt-2 border-t border-slate-200/50 dark:border-[#2A0E12] flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>{prob.uniqueSolvers} solved</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{prob.solveRate}% solve rate</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Submissions Log & Filter */}
      <div className="bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-500">
            Recent Submissions
          </h3>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Search by email..."
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              className="px-2.5 py-1 text-xs font-mono border border-slate-200 dark:border-[#3D1418] rounded-lg bg-slate-50 dark:bg-[#1C0A0D] text-slate-900 dark:text-[#FAF6F3]"
            />

            <select
              value={filterProblem}
              onChange={(e) => setFilterProblem(e.target.value)}
              className="px-2.5 py-1 text-xs font-mono border border-slate-200 dark:border-[#3D1418] rounded-lg bg-slate-50 dark:bg-[#1C0A0D] text-slate-900 dark:text-[#FAF6F3]"
            >
              <option value="all">All Problems</option>
              {['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9'].map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2.5 py-1 text-xs font-mono border border-slate-200 dark:border-[#3D1418] rounded-lg bg-slate-50 dark:bg-[#1C0A0D] text-slate-900 dark:text-[#FAF6F3]"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="running">Running</option>
              <option value="queued">Queued</option>
              <option value="failed">Failed</option>
              <option value="timeout">Timeout</option>
            </select>
          </div>
        </div>

        {filteredSubmissions.length === 0 ? (
          <div className="py-8 text-center text-xs font-mono text-slate-400">
            No submissions match the current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-200 dark:border-[#3D1418] text-slate-400 text-[10px] uppercase">
                  <th className="pb-2">User Email</th>
                  <th className="pb-2">Problem</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Score</th>
                  <th className="pb-2">Tests</th>
                  <th className="pb-2">Runtime</th>
                  <th className="pb-2 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#2A0E12]">
                {filteredSubmissions.map((sub: any) => (
                  <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-[#1C0A0D]/50 transition-colors">
                    <td className="py-2.5 font-medium text-slate-800 dark:text-slate-200 max-w-xs truncate">
                      {sub.user_email}
                    </td>
                    <td className="py-2.5 font-bold text-burgundy dark:text-[#E89BA5]">
                      {sub.challenge_id}
                    </td>
                    <td className="py-2.5">
                      <span className={clsx(
                        'px-2 py-0.5 rounded text-[10px] font-bold uppercase',
                        sub.status === 'completed'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          : sub.status === 'running' || sub.status === 'queued'
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                          : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                      )}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-2.5 font-bold">
                      {sub.score || 0} / {sub.max_score || 0}
                    </td>
                    <td className="py-2.5 text-slate-500">
                      {sub.passed_tests || 0} / {sub.total_tests || 0}
                    </td>
                    <td className="py-2.5 text-slate-400">
                      {sub.execution_time_ms ? `${sub.execution_time_ms}ms` : '-'}
                    </td>
                    <td className="py-2.5 text-right text-slate-400 text-[10px]">
                      {new Date(sub.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
