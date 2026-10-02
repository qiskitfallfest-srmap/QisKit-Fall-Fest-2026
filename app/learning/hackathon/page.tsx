'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AuthGate } from '@/components/learning/AuthGate';
import { TeammateInput } from '@/components/learning/TeammateInput';
import { ProblemStatementDossier } from '@/components/learning/ProblemStatementDossier';
import { PROBLEM_STATEMENTS } from '@/data/learning/problem-statements';
import { VerticalType, ProblemStatement } from '@/data/learning/types';
import {
  Users,
  Shield,
  CheckCircle2,
  Clock,
  Plus,
  Send,
  AlertCircle,
  ExternalLink,
  Github,
  ArrowLeft,
  Lock,
  Sparkles,
} from 'lucide-react';

const VERTICALS: VerticalType[] = [
  'Quantum Chemistry',
  'Quantum Optimization',
  'Quantum Simulation',
  'Quantum Machine Learning',
  'Post-Quantum Cryptography',
];

export default function HackathonWorkspacePage() {
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [team, setTeam] = useState<any>(null);
  const [pendingInvitations, setPendingInvitations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Team creation form state
  const [teamName, setTeamName] = useState('');
  const [selectedVertical, setSelectedVertical] = useState<VerticalType>('Quantum Chemistry');
  const [selectedPSId, setSelectedPSId] = useState('PS-C1');
  const [teammates, setTeammates] = useState<Array<{ email: string; fullName: string; status?: any }>>([]);
  const [isSubmittingTeam, setIsSubmittingTeam] = useState(false);
  const [teamFormError, setTeamFormError] = useState('');

  // GitHub submission state
  const [githubUrl, setGithubUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmittingRepo, setIsSubmittingRepo] = useState(false);
  const [repoSuccessMsg, setRepoSuccessMsg] = useState('');
  const [repoErrorMsg, setRepoErrorMsg] = useState('');

  // Release status state
  const [isReleased, setIsReleased] = useState(false);

  useEffect(() => {
    fetchTeamData();
    checkReleaseStatus();
  }, []);

  async function checkReleaseStatus() {
    const targetDate = new Date('2026-10-10T00:00:00+05:30');
    if (new Date() >= targetDate) {
      setIsReleased(true);
      return;
    }
    try {
      const res = await fetch('/api/admin/config');
      const data = await res.json();
      if (data?.config?.hackathon_release_override?.enabled === true) {
        setIsReleased(true);
      }
    } catch {}
  }

  async function fetchTeamData() {
    try {
      setIsLoading(true);
      const res = await fetch('/api/hackathon/team');
      const data = await res.json();
      if (data.team) {
        setTeam(data.team);
        if (data.team.github_repo_url) {
          setGithubUrl(data.team.github_repo_url);
        }
      } else {
        setTeam(null);
      }
      setPendingInvitations(data.pendingInvitations || []);
    } catch (err) {
      console.error('Error fetching team data:', err);
    } finally {
      setIsLoading(false);
    }
  }

  // Handle vertical selection change -> auto-select first problem statement in that vertical
  function handleVerticalChange(vert: VerticalType) {
    setSelectedVertical(vert);
    const firstInVert = PROBLEM_STATEMENTS.find((ps) => ps.vertical === vert);
    if (firstInVert) {
      setSelectedPSId(firstInVert.id);
    }
  }

  // Teammates row handlers
  function handleAddTeammate() {
    if (teammates.length >= 5) return; // 1 leader + 5 members = 6 max
    setTeammates((prev) => [...prev, { email: '', fullName: '', status: 'idle' }]);
  }

  function handleTeammateChange(index: number, updated: { email: string; fullName: string; status?: any }) {
    setTeammates((prev) => {
      const copy = [...prev];
      copy[index] = updated;
      return copy;
    });
  }

  function handleRemoveTeammate(index: number) {
    setTeammates((prev) => prev.filter((_, i) => i !== index));
  }

  // Team creation submission
  async function handleCreateTeam(e: React.FormEvent) {
    e.preventDefault();
    setTeamFormError('');

    if (!teamName.trim() || teamName.trim().length < 3) {
      setTeamFormError('Team name must be at least 3 characters.');
      return;
    }

    // Verify all teammate rows are valid
    for (const m of teammates) {
      if (m.status === 'not_whitelisted') {
        setTeamFormError(`Teammate ${m.email} is not whitelisted. Remove or replace.`);
        return;
      }
      if (m.status === 'already_in_team') {
        setTeamFormError(`Teammate ${m.email} is already in another team.`);
        return;
      }
    }

    try {
      setIsSubmittingTeam(true);
      const res = await fetch('/api/hackathon/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamName: teamName.trim(),
          vertical: selectedVertical,
          problemStatementId: selectedPSId,
          teammates: teammates.filter((t) => t.email.trim()),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setTeamFormError(data.error || 'Failed to create team.');
        return;
      }

      await fetchTeamData();
    } catch (err: any) {
      setTeamFormError(err?.message || 'Error creating team.');
    } finally {
      setIsSubmittingTeam(false);
    }
  }

  // Respond to invitation (accept / decline)
  async function handleInviteResponse(invitationId: string, action: 'accept' | 'decline') {
    try {
      const res = await fetch('/api/hackathon/invite-respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitationId, action }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchTeamData();
      }
    } catch (err) {
      console.error('Error responding to invitation:', err);
    }
  }

  // Submit GitHub repository URL
  async function handleSubmitGithub(e: React.FormEvent) {
    e.preventDefault();
    setRepoSuccessMsg('');
    setRepoErrorMsg('');

    if (!team?.id || !githubUrl.trim()) return;

    try {
      setIsSubmittingRepo(true);
      const res = await fetch('/api/hackathon/submit-repo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: team.id,
          githubRepoUrl: githubUrl.trim(),
          submissionNotes: notes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setRepoErrorMsg(data.error || 'Failed to submit repository.');
        return;
      }

      setRepoSuccessMsg('GitHub repository link submitted successfully!');
      await fetchTeamData();
    } catch (err: any) {
      setRepoErrorMsg(err?.message || 'Failed to submit repository.');
    } finally {
      setIsSubmittingRepo(false);
    }
  }

  const verticalStatements = PROBLEM_STATEMENTS.filter((ps) => ps.vertical === selectedVertical);
  const selectedPSObj = PROBLEM_STATEMENTS.find((ps) => ps.id === (team ? team.problem_statement_id : selectedPSId));

  return (
    <AuthGate onSessionChange={setSessionUser}>
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono px-2.5 py-0.5 rounded bg-burgundy/10 text-burgundy font-semibold text-xs uppercase tracking-[0.2em]">
                Phase 1 Sprint
              </span>
              <span className="font-mono text-xs text-slate-500 font-medium tracking-wide">
                Releases 10 October 2026 · Algorithm-Architecture Co-Design
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#181313] dark:text-[#FAF6F3] tracking-tight">
              Flagship Hackathon Workspace
            </h1>
            <p className="font-sans text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Form your team of 1 to 6 members, select your specialized domain track and problem
              statement, and benchmark quantum algorithms across Processors A, B, and C before
              proposing custom Processor D.
            </p>
          </div>

          {/* Pending Invitations Alert Banner */}
          {pendingInvitations.length > 0 && (
            <div className="mb-8 space-y-3">
              <h2 className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-burgundy flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                Action Required: Pending Team Invitations ({pendingInvitations.length})
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingInvitations.map((inv) => (
                  <div
                    key={inv.invitationId}
                    className="p-5 bg-white border-2 border-burgundy/40 rounded-xl shadow-xs space-y-3"
                  >
                    <div>
                      <span className="text-sm font-bold uppercase tracking-wider text-burgundy block">
                        Team Invitation
                      </span>
                      <h3 className="text-base font-bold text-slate-900">{inv.teamName}</h3>
                      <p className="text-base text-slate-600 mt-1">
                        Invited by <span className="font-semibold text-slate-800">{inv.leadName}</span> ({inv.leadEmail})
                      </p>
                    </div>

                    <div className="text-sm bg-slate-50 p-2.5 rounded border border-slate-200 text-slate-700 space-y-1">
                      <div>
                        <span className="font-bold">Track:</span> {inv.vertical}
                      </div>
                      <div>
                        <span className="font-bold">Problem Statement:</span> {inv.problemStatementId}
                      </div>
                    </div>

                    <p className="text-base text-slate-500 leading-snug">
                      Accepting this invitation confirms you as a full team member and unlocks the
                      dossier for {inv.problemStatementId}. You cannot join other teams once accepted.
                    </p>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleInviteResponse(inv.invitationId, 'accept')}
                        className="flex-1 px-4 py-2 bg-burgundy text-white text-sm font-semibold rounded hover:bg-burgundy-deep transition-colors"
                      >
                        Accept Invitation
                      </button>
                      <button
                        onClick={() => handleInviteResponse(inv.invitationId, 'decline')}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Layout: Either Active Team Dashboard OR Team Formation Form */}
          {team ? (
            /* ACTIVE TEAM DASHBOARD */
            <div className="space-y-8">
              {/* Team Summary Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-sm font-bold uppercase tracking-wider text-burgundy block mb-1">
                      Your Hackathon Team
                    </span>
                    <h2 className="text-2xl font-bold text-slate-900">{team.name}</h2>
                    <p className="text-base text-slate-600 mt-1">
                      Track: <span className="font-semibold text-slate-800">{team.vertical}</span> · Problem Statement: <span className="font-mono font-bold text-burgundy">{team.problem_statement_id}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold text-sm border border-emerald-200 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Team Confirmed ({team.members?.length || 1} Member{team.members?.length !== 1 ? 's' : ''})
                    </span>
                  </div>
                </div>

                {/* Team Roster */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3">
                    Team Members Roster (1–6 Members)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {team.members?.map((m: any) => (
                      <div
                        key={m.id}
                        className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-sm space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 truncate">
                            {m.full_name || m.email.split('@')[0]}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-xs uppercase font-bold bg-slate-200 text-slate-700">
                            {m.role}
                          </span>
                        </div>
                        <span className="text-slate-500 truncate block">{m.email}</span>
                        <div className="pt-1">
                          {m.status === 'accepted' ? (
                            <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Confirmed
                            </span>
                          ) : m.status === 'invited' ? (
                            <span className="inline-flex items-center gap-1 text-sm font-medium text-amber-700">
                              <Clock className="w-3 h-3 text-amber-600" /> Invitation Pending
                            </span>
                          ) : (
                            <span className="text-sm text-slate-400">Declined</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* GitHub Repository Submission Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-slate-900">
                  <Github className="w-5 h-5 text-burgundy" />
                  <h3 className="text-base font-bold">Hackathon Code Submission</h3>
                </div>
                <p className="text-base text-slate-600 leading-relaxed">
                  Provide your team&apos;s public GitHub, GitLab, or Hugging Face Space repository link.
                  Ensure your repository includes `main.ipynb` (or `main.py`), `processors/` with
                  `processor_D.json`, and benchmark plots in `results/`.
                </p>

                {repoSuccessMsg && (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{repoSuccessMsg}</span>
                  </div>
                )}

                {repoErrorMsg && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{repoErrorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSubmitGithub} className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="url"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/organization/qff-2026-solution"
                      required
                      className="flex-1 px-4 py-2.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-burgundy focus:border-burgundy"
                    />
                    <button
                      type="submit"
                      disabled={isSubmittingRepo}
                      className="px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded hover:bg-slate-800 transition-colors shrink-0 disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {team.github_repo_url ? 'Update Repository Link' : 'Submit Repository'}
                    </button>
                  </div>

                  {team.github_repo_url && (
                    <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-sm flex items-center justify-between">
                      <span className="text-slate-600">Active submission:</span>
                      <a
                        href={team.github_repo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-burgundy font-semibold hover:underline flex items-center gap-1"
                      >
                        {team.github_repo_url}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </form>
              </div>

              {/* UNLOCKED PROBLEM STATEMENT DOSSIER */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-burgundy" />
                    Unlocked Problem Statement Dossier ({team.problem_statement_id})
                  </h3>
                  <span className="text-base text-slate-500">
                    Confidential to Team {team.name}
                  </span>
                </div>

                {selectedPSObj ? (
                  <ProblemStatementDossier ps={selectedPSObj} />
                ) : (
                  <div className="p-6 bg-white border border-slate-200 rounded-xl text-center text-base text-slate-600">
                    Problem statement details could not be found.
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* TEAM FORMATION & PROBLEM SELECTION FORM */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left 2 Cols: Form */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Step 1: Choose Domain Track & Problem Statement
                    </h2>
                    <p className="text-base text-slate-600 mt-1">
                      Choose from 5 domain verticals. Each vertical contains 3 specialized problem
                      statements and 1 open innovation track. Your team will unlock the full
                      technical dossier for the selected statement upon creation.
                    </p>
                  </div>

                  {/* Vertical Selection Dropdown */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                      Select Domain Vertical:
                    </label>
                    <select
                      value={selectedVertical}
                      onChange={(e) => handleVerticalChange(e.target.value as VerticalType)}
                      className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg bg-white font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-burgundy focus:border-burgundy"
                    >
                      {VERTICALS.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Problem Statement Radio/Card Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Choose Problem Statement in {selectedVertical}:
                    </label>
                    <div className="space-y-2">
                      {verticalStatements.map((ps) => {
                        const isSelected = selectedPSId === ps.id;
                        return (
                          <label
                            key={ps.id}
                            className={`flex items-start gap-3 p-3.5 rounded-lg border text-sm cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-burgundy/5 border-burgundy ring-1 ring-burgundy text-slate-900'
                                : 'bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-100/60'
                            }`}
                          >
                            <input
                              type="radio"
                              name="problemStatement"
                              value={ps.id}
                              checked={isSelected}
                              onChange={() => setSelectedPSId(ps.id)}
                              className="mt-0.5 text-burgundy focus:ring-burgundy"
                            />
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 font-mono text-sm bg-slate-200 px-1.5 py-0.2 rounded">
                                  {ps.id}
                                </span>
                                <span className="font-semibold">{ps.title.split(': ')[1] || ps.title}</span>
                              </div>
                              <p className="text-slate-500 text-sm leading-relaxed">
                                {ps.subtitle}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 2: Team Details */}
                  <div className="pt-6 border-t border-slate-200 space-y-4">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        Step 2: Team Name & Members (1–6 Members)
                      </h2>
                      <p className="text-base text-slate-600 mt-1">
                        Team names must be globally unique. You are the team leader. Add up to 5
                        additional members. Teammate Gmails are authenticated in real time against the
                        platform whitelist.
                      </p>
                    </div>

                    {teamFormError && (
                      <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{teamFormError}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-semibold text-slate-800 mb-1">
                        Team Name:
                      </label>
                      <input
                        type="text"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        placeholder="e.g. Quantum Singularity Labs"
                        required
                        className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-burgundy focus:border-burgundy"
                      />
                    </div>

                    {/* Team Leader Badge */}
                    <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 text-sm space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">
                          Team Leader: {sessionUser?.fullName || 'You'}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-sm font-bold bg-burgundy/10 text-burgundy uppercase">
                          Leader (Confirmed)
                        </span>
                      </div>
                      <span className="text-slate-500 font-mono">{sessionUser?.email}</span>
                    </div>

                    {/* Additional Teammates */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-800">
                          Additional Teammates ({teammates.length}/5)
                        </span>
                        {/* Global add button removed to favor inline buttons */}
                      </div>

                      {teammates.map((m, idx) => {
                        const isLast = idx === teammates.length - 1;
                        return (
                          <TeammateInput
                            key={idx}
                            index={idx}
                            member={m}
                            onChange={handleTeammateChange}
                            onRemove={handleRemoveTeammate}
                            onAdd={handleAddTeammate}
                            canAdd={isLast && teammates.length < 5}
                          />
                        );
                      })}
                      {teammates.length === 0 && (
                        <button
                          type="button"
                          onClick={handleAddTeammate}
                          className="w-full p-3 border border-dashed border-slate-300 rounded-lg text-slate-500 hover:text-burgundy hover:border-burgundy hover:bg-burgundy/5 transition-colors text-sm font-semibold flex items-center justify-center gap-1.5"
                        >
                          <Plus className="w-4 h-4" />
                          Add First Teammate
                        </button>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      type="button"
                      onClick={handleCreateTeam}
                      disabled={isSubmittingTeam}
                      className="w-full px-4 py-2.5 bg-burgundy text-white text-sm font-bold rounded-lg hover:bg-burgundy-deep transition-colors shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                    >
                      {isSubmittingTeam ? (
                        'Creating Team & Sending Invitations...'
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <Users className="w-4 h-4" />
                          Confirm Team & Unlock {selectedPSId} Dossier
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right 1 Col: Challenge Framework Preview */}
              <div className="space-y-6">
                <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4 text-sm text-slate-700">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-burgundy" />
                    Challenge Framework Rules
                  </h3>

                  <div className="space-y-2 leading-relaxed">
                    <p>
                      • <strong>Universal Rubric:</strong> 40 Pts Core Implementation, 30 Pts Hardware
                      Benchmarking on Processors A, B, and C, and 30 Pts Custom 12-Qubit Processor D.
                    </p>
                    <p>
                      • <strong>Confidentiality:</strong> Once your team is created, your workspace
                      unlocks the full technical dossier for your selected problem statement.
                    </p>
                    <p>
                      • <strong>Teammate Acceptance:</strong> Invited teammates will receive an
                      invitation card on their portal dashboard to accept before joining.
                    </p>
                    <p>
                      • <strong>Exclusivity:</strong> A student cannot belong to more than one team.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1 text-sm">
                    <span className="font-bold text-slate-900 block">Deliverables Required:</span>
                    <span>1. Executable Jupyter notebook (`main.ipynb`)</span>
                    <span>2. `processors/` with `processor_D.json`</span>
                    <span>3. Hardware trade-off justification report</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
    </AuthGate>
  );
}
