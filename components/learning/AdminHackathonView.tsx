'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Users,
  Building2,
  GraduationCap,
  Github,
  Search,
  Filter,
  Download,
  RefreshCw,
  CheckCircle2,
  Clock,
  Lock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  FileSpreadsheet,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';
import type {
  AdminHackathonData,
  AdminHackathonTeam,
  AdminHackathonParticipant,
} from '@/app/api/admin/hackathon/route';

export function AdminHackathonView() {
  const [data, setData] = useState<AdminHackathonData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurging, setIsPurging] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // View mode
  const [viewMode, setViewMode] = useState<'teams' | 'participants' | 'insights'>('teams');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVertical, setSelectedVertical] = useState<string>('all');
  const [selectedPS, setSelectedPS] = useState<string>('all');
  const [selectedFinalized, setSelectedFinalized] = useState<string>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<string>('all');

  // Expanded team IDs
  const [expandedTeamIds, setExpandedTeamIds] = useState<Set<string>>(new Set());

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/hackathon');
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setData(json.data);
          // Auto expand first 5 teams
          const initialSet = new Set<string>();
          (json.data.teams || []).slice(0, 5).forEach((t: AdminHackathonTeam) => initialSet.add(t.id));
          setExpandedTeamIds(initialSet);
        }
      }
    } catch (err) {
      console.error('Error fetching admin hackathon data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurge = async () => {
    try {
      setIsPurging(true);
      setFeedbackMsg(null);
      const res = await fetch('/api/admin/hackathon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'purge-cache' }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setData(json.data);
        }
        setFeedbackMsg('Hackathon data synchronized fresh from database!');
        setTimeout(() => setFeedbackMsg(null), 4000);
      }
    } catch (err) {
      console.error('Error refreshing hackathon cache:', err);
    } finally {
      setIsPurging(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleExpandTeam = (teamId: string) => {
    setExpandedTeamIds((prev) => {
      const copy = new Set(prev);
      if (copy.has(teamId)) {
        copy.delete(teamId);
      } else {
        copy.add(teamId);
      }
      return copy;
    });
  };

  const expandAll = () => {
    const allIds = new Set<string>((data?.teams || []).map((t) => t.id));
    setExpandedTeamIds(allIds);
  };

  const collapseAll = () => {
    setExpandedTeamIds(new Set());
  };

  // Filtered Teams
  const filteredTeams = useMemo(() => {
    if (!data?.teams) return [];
    const query = searchQuery.trim().toLowerCase();

    return data.teams.filter((t) => {
      // Search filter
      if (query) {
        const matchesName = (t.name || '').toLowerCase().includes(query);
        const matchesLead =
          (t.lead_name || '').toLowerCase().includes(query) ||
          (t.lead_email || '').toLowerCase().includes(query) ||
          (t.lead_university || '').toLowerCase().includes(query);
        const matchesPS = (t.problem_statement_id || '').toLowerCase().includes(query);
        const matchesVertical = (t.vertical || '').toLowerCase().includes(query);
        const matchesMember = (t.members || []).some(
          (m) =>
            (m.full_name || '').toLowerCase().includes(query) ||
            (m.email || '').toLowerCase().includes(query) ||
            (m.university || '').toLowerCase().includes(query)
        );

        if (!matchesName && !matchesLead && !matchesPS && !matchesVertical && !matchesMember) {
          return false;
        }
      }

      // Vertical filter
      if (selectedVertical !== 'all' && t.vertical !== selectedVertical) {
        return false;
      }

      // Problem statement filter
      if (selectedPS !== 'all' && t.problem_statement_id !== selectedPS) {
        return false;
      }

      // Finalized status filter
      if (selectedFinalized === 'finalized' && !t.is_finalized) return false;
      if (selectedFinalized === 'draft' && t.is_finalized) return false;

      // Submission status filter
      if (selectedSubmission === 'submitted' && !t.github_repo_url) return false;
      if (selectedSubmission === 'unsubmitted' && t.github_repo_url) return false;

      return true;
    });
  }, [data?.teams, searchQuery, selectedVertical, selectedPS, selectedFinalized, selectedSubmission]);

  // Filtered Participants
  const filteredParticipants = useMemo(() => {
    if (!data?.participants) return [];
    const query = searchQuery.trim().toLowerCase();

    return data.participants.filter((p) => {
      if (query) {
        const matchesName = (p.full_name || '').toLowerCase().includes(query);
        const matchesEmail = (p.email || '').toLowerCase().includes(query);
        const matchesUni = (p.university || '').toLowerCase().includes(query);
        const matchesTeam = (p.team_name || '').toLowerCase().includes(query);
        const matchesPS = (p.problem_statement_id || '').toLowerCase().includes(query);
        const matchesVertical = (p.vertical || '').toLowerCase().includes(query);

        if (!matchesName && !matchesEmail && !matchesUni && !matchesTeam && !matchesPS && !matchesVertical) {
          return false;
        }
      }

      if (selectedVertical !== 'all' && p.vertical !== selectedVertical) return false;
      if (selectedPS !== 'all' && p.problem_statement_id !== selectedPS) return false;
      if (selectedFinalized === 'finalized' && !p.is_finalized) return false;
      if (selectedFinalized === 'draft' && p.is_finalized) return false;
      if (selectedSubmission === 'submitted' && !p.github_repo_url) return false;
      if (selectedSubmission === 'unsubmitted' && p.github_repo_url) return false;

      return true;
    });
  }, [data?.participants, searchQuery, selectedVertical, selectedPS, selectedFinalized, selectedSubmission]);

  // Export to CSV Function
  const handleExportCSV = () => {
    if (!data) return;

    const headers = [
      'Team Name',
      'Vertical Track',
      'Problem Statement',
      'Roster Status',
      'Finalized At',
      'GitHub Submission URL',
      'Submitted At',
      'Participant Role',
      'Participant Name',
      'Participant Email',
      'Participant University / Institution',
      'Invitation Status',
      'Invited At',
      'Accepted At',
    ];

    const rows: string[][] = [];

    (data.teams || []).forEach((team) => {
      (team.members || []).forEach((m) => {
        rows.push([
          `"${(team.name || '').replace(/"/g, '""')}"`,
          `"${team.vertical || ''}"`,
          `"${team.problem_statement_id || ''}"`,
          team.is_finalized ? 'Finalized & Locked' : 'Draft',
          team.finalized_at ? `"${new Date(team.finalized_at).toLocaleString()}"` : 'N/A',
          team.github_repo_url ? `"${team.github_repo_url}"` : 'Not Submitted',
          team.submitted_at ? `"${new Date(team.submitted_at).toLocaleString()}"` : 'N/A',
          m.role === 'leader' ? 'Team Leader' : 'Team Member',
          `"${(m.full_name || '').replace(/"/g, '""')}"`,
          `"${m.email || ''}"`,
          `"${(m.university || '').replace(/"/g, '""')}"`,
          m.status || '',
          m.invited_at ? `"${new Date(m.invited_at).toLocaleString()}"` : '',
          m.responded_at ? `"${new Date(m.responded_at).toLocaleString()}"` : '',
        ]);
      });
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `QFF2026_Hackathon_Teams_Roster_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading && !data) {
    return (
      <div className="p-12 bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-xl flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 gap-3 font-sans">
        <RefreshCw className="w-6 h-6 animate-spin text-burgundy dark:text-[#E89BA5]" />
        <p className="text-xs font-medium">Aggregating Hackathon Teams, Participants & Universities...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner & Action Controls */}
      <div className="p-5 bg-linear-to-r from-burgundy via-burgundy-deep to-[#18070B] text-white rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 border border-burgundy/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-300" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Flagship Hackathon Participant Registry
            </span>
          </div>
          <h2 className="text-lg font-bold">Hackathon Teams, Rosters & University Affiliations</h2>
          <p className="text-xs text-slate-200 max-w-xl">
            Live directory of all formed teams, member universities/institutions, track problem
            statements, GitHub repositories, and finalized rosters.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={fetchData}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
            title="Refresh latest team data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handlePurge}
            disabled={isPurging}
            className="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 border border-white/25 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
            title="Purge Redis cache and sync directly from DB"
          >
            <Zap className={`w-3.5 h-3.5 text-amber-300 ${isPurging ? 'animate-spin' : ''}`} />
            <span>Purge Cache</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 border border-emerald-400/40 text-xs font-bold text-white flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* KPI Highlight Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Teams Formed */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Teams Formed
            </span>
            <div className="p-2 rounded-lg bg-burgundy/10 text-burgundy dark:bg-burgundy/20 dark:text-[#E89BA5]">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-[#FAF6F3]">
              {data?.stats?.totalTeams || 0}
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
              {data?.stats?.finalizedTeams || 0} locked
            </span>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-1">
            {data?.stats?.draftTeams || 0} teams in draft mode
          </span>
        </div>

        {/* Total Participants */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Participants
            </span>
            <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-[#FAF6F3]">
              {data?.stats?.totalParticipants || 0}
            </span>
            <span className="text-[11px] font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40 px-1.5 py-0.5 rounded">
              {data?.stats?.confirmedParticipants || 0} confirmed
            </span>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-1">
            {data?.stats?.pendingParticipants || 0} pending invites
          </span>
        </div>

        {/* Universities Represented */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Universities / Colleges
            </span>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-[#FAF6F3]">
              {data?.stats?.uniqueUniversitiesCount || 0}
            </span>
            <span className="text-[11px] font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded">
              Institutions
            </span>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-1">
            Across India & International
          </span>
        </div>

        {/* Code Submissions */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              GitHub Submissions
            </span>
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
              <Github className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-[#FAF6F3]">
              {data?.stats?.teamsWithSubmissions || 0}
            </span>
            <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 px-1.5 py-0.5 rounded">
              {Math.round(
                ((data?.stats?.teamsWithSubmissions || 0) / Math.max(1, data?.stats?.totalTeams || 1)) * 100
              )}
              % rate
            </span>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-1">
            Repositories connected
          </span>
        </div>
      </div>

      {/* Sub-Tabs Selector & Search/Filter Controls */}
      <div className="bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-[#3D1418] pb-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewMode('teams')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'teams'
                  ? 'bg-burgundy text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-[#1C0A0D] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#250D11]'
              }`}
            >
              Teams View ({filteredTeams.length})
            </button>
            <button
              type="button"
              onClick={() => setViewMode('participants')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'participants'
                  ? 'bg-burgundy text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-[#1C0A0D] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#250D11]'
              }`}
            >
              All Participants Roster ({filteredParticipants.length})
            </button>
            <button
              type="button"
              onClick={() => setViewMode('insights')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'insights'
                  ? 'bg-burgundy text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-[#1C0A0D] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#250D11]'
              }`}
            >
              University & Track Insights
            </button>
          </div>

          {viewMode === 'teams' && (
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={expandAll}
                className="text-slate-600 dark:text-slate-400 hover:text-burgundy dark:hover:text-[#E89BA5] underline cursor-pointer"
              >
                Expand All
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={collapseAll}
                className="text-slate-600 dark:text-slate-400 hover:text-burgundy dark:hover:text-[#E89BA5] underline cursor-pointer"
              >
                Collapse All
              </button>
            </div>
          )}
        </div>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search team, member, email, university..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 dark:border-[#3D1418] bg-white dark:bg-[#1C0A0D] text-slate-900 dark:text-[#FAF6F3] rounded-lg focus:outline-none focus:ring-1 focus:ring-burgundy"
            />
          </div>

          {/* Track Filter */}
          <div>
            <select
              value={selectedVertical}
              onChange={(e) => setSelectedVertical(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 dark:border-[#3D1418] bg-white dark:bg-[#1C0A0D] text-slate-900 dark:text-[#FAF6F3] rounded-lg focus:outline-none focus:ring-1 focus:ring-burgundy"
            >
              <option value="all">All Tracks</option>
              <option value="Quantum Chemistry">Quantum Chemistry</option>
              <option value="Quantum Optimization">Quantum Optimization</option>
              <option value="Quantum Simulation">Quantum Simulation</option>
              <option value="Quantum Machine Learning">Quantum Machine Learning</option>
              <option value="Post-Quantum Cryptography">Post-Quantum Cryptography</option>
            </select>
          </div>

          {/* Finalized Filter */}
          <div>
            <select
              value={selectedFinalized}
              onChange={(e) => setSelectedFinalized(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 dark:border-[#3D1418] bg-white dark:bg-[#1C0A0D] text-slate-900 dark:text-[#FAF6F3] rounded-lg focus:outline-none focus:ring-1 focus:ring-burgundy"
            >
              <option value="all">All Roster Statuses</option>
              <option value="finalized">Finalized & Locked Only</option>
              <option value="draft">Draft Only</option>
            </select>
          </div>

          {/* Submissions Filter */}
          <div>
            <select
              value={selectedSubmission}
              onChange={(e) => setSelectedSubmission(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 dark:border-[#3D1418] bg-white dark:bg-[#1C0A0D] text-slate-900 dark:text-[#FAF6F3] rounded-lg focus:outline-none focus:ring-1 focus:ring-burgundy"
            >
              <option value="all">All Submissions</option>
              <option value="submitted">Repo Submitted</option>
              <option value="unsubmitted">No Repo Yet</option>
            </select>
          </div>
        </div>
      </div>

      {/* MODE 1: TEAMS VIEW */}
      {viewMode === 'teams' && (
        <div className="space-y-4">
          {filteredTeams.map((team, idx) => {
            const isExpanded = expandedTeamIds.has(team.id);

            return (
              <div
                key={team.id}
                className="bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-xl shadow-xs overflow-hidden transition-all duration-200"
              >
                {/* Team Header Strip */}
                <div
                  onClick={() => toggleExpandTeam(team.id)}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/70 dark:hover:bg-[#1C0A0D]/70 transition-colors"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-base text-slate-900 dark:text-[#FAF6F3]">
                        #{idx + 1} {team.name}
                      </span>

                      {team.is_finalized ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 flex items-center gap-1">
                          <Lock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          Finalized
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          Draft ({team.confirmed_count}/6 Confirmed)
                        </span>
                      )}

                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-burgundy/10 text-burgundy dark:bg-burgundy/25 dark:text-[#E89BA5]">
                        {team.problem_statement_id}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
                      <span>Track: <strong>{team.vertical}</strong></span>
                      <span>·</span>
                      <span>
                        Leader: <strong>{team.lead_name}</strong> ({team.lead_email})
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-burgundy dark:text-[#E89BA5] font-semibold">
                        <GraduationCap className="w-3.5 h-3.5" />
                        {team.lead_university}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
                    {team.github_repo_url ? (
                      <a
                        href={team.github_repo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="px-2.5 py-1 rounded bg-slate-900 dark:bg-[#250D11] hover:bg-slate-800 text-white text-xs font-mono font-medium flex items-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <Github className="w-3.5 h-3.5" />
                        <span>Repo</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                        No repo submitted
                      </span>
                    )}

                    <button
                      type="button"
                      className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Member Roster Table */}
                {isExpanded && (
                  <div className="border-t border-slate-100 dark:border-[#3D1418] bg-slate-50/50 dark:bg-[#1C0A0D]/50 p-4 sm:p-5 space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                      <span>Full Team Roster ({team.members.length} Members)</span>
                      <span>Created {new Date(team.created_at).toLocaleDateString()}</span>
                    </div>

                    <div className="border border-slate-200 dark:border-[#3D1418] rounded-lg overflow-hidden bg-white dark:bg-[#150709]">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100/80 dark:bg-[#200B0E] border-b border-slate-200 dark:border-[#3D1418] text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                          <tr>
                            <th className="py-2.5 px-3">Role</th>
                            <th className="py-2.5 px-3">Full Name</th>
                            <th className="py-2.5 px-3">Email Address</th>
                            <th className="py-2.5 px-3">University / Institution</th>
                            <th className="py-2.5 px-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-[#250D11]">
                          {team.members.map((m) => {
                            const isLeader = m.role === 'leader';
                            return (
                              <tr key={m.id} className="hover:bg-slate-50/60 dark:hover:bg-[#1C0A0D]/60">
                                <td className="py-2.5 px-3">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                      isLeader
                                        ? 'bg-burgundy/15 text-burgundy dark:bg-burgundy/25 dark:text-[#E89BA5]'
                                        : 'bg-slate-100 dark:bg-[#250D11] text-slate-700 dark:text-slate-300'
                                    }`}
                                  >
                                    {m.role}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-[#FAF6F3]">
                                  {m.full_name}
                                </td>
                                <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-400">
                                  {m.email}
                                </td>
                                <td className="py-2.5 px-3">
                                  <span className="inline-flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                                    <GraduationCap className="w-3.5 h-3.5 text-burgundy dark:text-[#E89BA5] shrink-0" />
                                    <span>{m.university}</span>
                                  </span>
                                </td>
                                <td className="py-2.5 px-3">
                                  {m.status === 'accepted' || isLeader ? (
                                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold inline-flex items-center gap-1 text-[11px]">
                                      <CheckCircle2 className="w-3 h-3" /> Confirmed
                                    </span>
                                  ) : m.status === 'invited' ? (
                                    <span className="text-amber-700 dark:text-amber-400 font-medium inline-flex items-center gap-1 text-[11px]">
                                      <Clock className="w-3 h-3" /> Pending Invite
                                    </span>
                                  ) : (
                                    <span className="text-rose-600 dark:text-rose-400 font-semibold text-[11px]">
                                      Declined
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {team.submission_notes && (
                      <div className="p-3 rounded-lg bg-slate-100 dark:bg-[#1C0A0D] text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#3D1418]">
                        <strong>Submission Notes:</strong> {team.submission_notes}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {filteredTeams.length === 0 && (
            <div className="p-12 text-center text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-xl">
              No hackathon teams match your active search and filter criteria.
            </div>
          )}
        </div>
      )}

      {/* MODE 2: FLAT PARTICIPANTS ROSTER */}
      {viewMode === 'participants' && (
        <div className="bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-xl shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 dark:border-[#3D1418] flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-[#FAF6F3]">
              All Registered Hackathon Participants ({filteredParticipants.length})
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Showing every member across all formed teams
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#1C0A0D] border-b border-slate-200 dark:border-[#3D1418] text-slate-700 dark:text-slate-300 font-semibold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Participant Name</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">University / Institution</th>
                  <th className="py-3 px-4">Team Name</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Track (PS)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Repo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#3D1418]">
                {filteredParticipants.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-[#1C0A0D]/60 transition-colors">
                    <td className="py-3 px-4 text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-[#FAF6F3]">
                      {p.full_name}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                      {p.email}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 font-medium text-slate-800 dark:text-slate-200">
                        <GraduationCap className="w-3.5 h-3.5 text-burgundy dark:text-[#E89BA5] shrink-0" />
                        <span>{p.university}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-[#FAF6F3]">
                      {p.team_name}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          p.role === 'leader'
                            ? 'bg-burgundy/15 text-burgundy dark:bg-burgundy/25 dark:text-[#E89BA5]'
                            : 'bg-slate-100 dark:bg-[#250D11] text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {p.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] font-bold text-burgundy dark:text-[#E89BA5]">
                        {p.problem_statement_id}
                      </span>
                      <span className="text-[11px] text-slate-500 block">{p.vertical}</span>
                    </td>
                    <td className="py-3 px-4">
                      {p.status === 'accepted' || p.role === 'leader' ? (
                        <span className="text-emerald-700 dark:text-emerald-400 font-semibold inline-flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="w-3 h-3" /> Confirmed
                        </span>
                      ) : p.status === 'invited' ? (
                        <span className="text-amber-700 dark:text-amber-400 font-medium inline-flex items-center gap-1 text-[11px]">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      ) : (
                        <span className="text-rose-600 dark:text-rose-400 font-semibold text-[11px]">
                          Declined
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {p.github_repo_url ? (
                        <a
                          href={p.github_repo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-burgundy dark:text-[#E89BA5] hover:underline flex items-center gap-1 font-mono text-[11px]"
                        >
                          <Github className="w-3 h-3" />
                          <span>Link</span>
                        </a>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>
                  </tr>
                ))}

                {filteredParticipants.length === 0 && (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
                      No participants match your active search and filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODE 3: UNIVERSITY & TRACK INSIGHTS */}
      {viewMode === 'insights' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Universities Breakdown */}
          <div className="bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#3D1418] pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-burgundy dark:text-[#E89BA5]" />
                <h3 className="text-base font-bold text-slate-900 dark:text-[#FAF6F3]">
                  Universities & Institutions Representation
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                {Object.keys(data?.stats?.universitiesBreakdown || {}).length} Institutions
              </span>
            </div>

            <div className="space-y-3">
              {Object.entries(data?.stats?.universitiesBreakdown || {})
                .sort((a, b) => b[1] - a[1])
                .map(([uni, count]) => {
                  const pct = Math.round(
                    (count / Math.max(1, data?.stats?.totalParticipants || 1)) * 100
                  );

                  return (
                    <div key={uni} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800 dark:text-[#FAF6F3] truncate pr-2">
                          {uni}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-[#FAF6F3] shrink-0 font-mono">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-[#1C0A0D] h-2 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${Math.max(4, pct)}%` }}
                          className="bg-burgundy dark:bg-[#E89BA5] h-full rounded-full transition-all duration-500"
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Domain Track Distribution */}
          <div className="bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#3D1418] pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-burgundy dark:text-[#E89BA5]" />
                <h3 className="text-base font-bold text-slate-900 dark:text-[#FAF6F3]">
                  Track & Problem Statement Distribution
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-500">5 Verticals</span>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Domain Verticals:
                </h4>
                {Object.entries(data?.stats?.verticalsBreakdown || {}).map(([vert, count]) => {
                  const pct = Math.round((count / Math.max(1, data?.stats?.totalTeams || 1)) * 100);
                  return (
                    <div key={vert} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800 dark:text-[#FAF6F3]">{vert}</span>
                        <span className="font-bold text-slate-900 dark:text-[#FAF6F3] font-mono">
                          {count} teams ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-[#1C0A0D] h-2 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${Math.max(4, pct)}%` }}
                          className="bg-sky-500 h-full rounded-full transition-all duration-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-[#3D1418] space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Problem Statements Chosen:
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(data?.stats?.problemStatementsBreakdown || {}).map(([ps, count]) => (
                    <div
                      key={ps}
                      className="p-2.5 rounded-lg border border-slate-200 dark:border-[#3D1418] bg-slate-50 dark:bg-[#1C0A0D] text-xs flex items-center justify-between"
                    >
                      <span className="font-mono font-bold text-burgundy dark:text-[#E89BA5]">{ps}</span>
                      <span className="font-bold text-slate-900 dark:text-[#FAF6F3]">{count} teams</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
