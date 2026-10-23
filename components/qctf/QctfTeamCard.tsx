'use client';

import React, { useState } from 'react';
import { AlertCircle, Check, Copy, Loader2, LogOut, UserPlus, Users } from 'lucide-react';
import { QCTF_MAX_TEAM_SIZE } from '@/data/qctf/tracks';
import { useQctfMe } from './QctfGate';

const INPUT_CLASS =
  'w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-[#3D1418] bg-slate-50 dark:bg-[#1C0A0D] text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy/50';
const PRIMARY_BUTTON =
  'w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-burgundy hover:bg-burgundy-deep text-white text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';
const SECONDARY_BUTTON =
  'w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-slate-200 dark:border-[#3D1418] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1C0A0D] text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

export function QctfTeamCard() {
  const { me, setMe } = useQctfMe();
  const [teamName, setTeamName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [busy, setBusy] = useState<'create' | 'join' | 'leave' | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const team = me.team;
  const isClosed = me.state === 'closed';

  async function teamAction(action: 'create' | 'join' | 'leave', payload: Record<string, string> = {}) {
    setBusy(action);
    setError('');
    try {
      const res = await fetch('/api/qctf/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...payload }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) setError(data.error || 'Could not update your team.');
      else {
        setMe(data.me);
        setTeamName('');
        setJoinCode('');
      }
    } catch {
      setError('Could not reach the server. Try again.');
    } finally {
      setBusy(null);
    }
  }

  async function copyCode() {
    if (!team) return;
    try {
      await navigator.clipboard.writeText(team.joinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  return (
    <section className="p-5 rounded-xl bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] shadow-xs space-y-4">
      <div className="flex items-center gap-2 font-semibold text-sm text-slate-900 dark:text-[#FAF6F3]">
        <Users className="w-4 h-4 text-burgundy dark:text-[#E89BA5]" />
        Your team
      </div>

      {team ? (
        <>
          <div className="space-y-1">
            <p className="font-serif text-lg font-bold text-slate-900 dark:text-[#FAF6F3] leading-snug">{team.name}</p>
            {team.fromHackathon && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Carried over from your hackathon team</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#1C0A0D] border border-slate-200 dark:border-[#3D1418]">
              <div className="font-mono text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">Points</div>
              <div className="font-mono text-base font-bold text-slate-900 dark:text-[#FAF6F3]">{team.points}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#1C0A0D] border border-slate-200 dark:border-[#3D1418]">
              <div className="font-mono text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">Solved</div>
              <div className="font-mono text-base font-bold text-slate-900 dark:text-[#FAF6F3]">{team.solvedCount}</div>
            </div>
          </div>

          <div>
            <div className="font-mono text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Members ({team.members.length}/{QCTF_MAX_TEAM_SIZE})
            </div>
            <ul className="space-y-1">
              {team.members.map((member) => (
                <li key={member.email} className="text-xs text-slate-700 dark:text-slate-200 truncate" title={member.email}>
                  {member.fullName}
                </li>
              ))}
            </ul>
          </div>

          {team.members.length < QCTF_MAX_TEAM_SIZE && !isClosed && (
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#1C0A0D] border border-slate-200 dark:border-[#3D1418] space-y-1.5">
              <div className="font-mono text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
                Join code
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-lg font-bold tracking-[0.2em] text-burgundy dark:text-[#E89BA5]">
                  {team.joinCode}
                </span>
                <button
                  type="button"
                  onClick={copyCode}
                  aria-label="Copy join code"
                  className="p-1.5 rounded-md text-slate-500 hover:bg-white dark:hover:bg-[#250D11] cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Teammates who are not on your hackathon team join with this code.
              </p>
            </div>
          )}

          {team.solvedCount === 0 && !isClosed && (
            <button type="button" onClick={() => teamAction('leave')} disabled={busy !== null} className={SECONDARY_BUTTON}>
              {busy === 'leave' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
              Leave team
            </button>
          )}
        </>
      ) : isClosed ? (
        <p className="text-xs text-slate-600 dark:text-slate-300">You did not join a team in this round.</p>
      ) : (
        <>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Teams have 2 to {QCTF_MAX_TEAM_SIZE} members. Hackathon teams carry over automatically; if you are new,
            create a team or join one with its code.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              teamAction('join', { code: joinCode });
            }}
            className="space-y-2"
          >
            <label htmlFor="qctf-join-code" className="font-mono text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
              Join with a code
            </label>
            <input
              id="qctf-join-code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="ABC123"
              maxLength={6}
              autoComplete="off"
              className={`${INPUT_CLASS} font-mono tracking-[0.2em] uppercase`}
            />
            <button type="submit" disabled={busy !== null || joinCode.trim().length !== 6} className={PRIMARY_BUTTON}>
              {busy === 'join' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
              Join team
            </button>
          </form>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-slate-400">
            <span className="flex-1 h-px bg-slate-200 dark:bg-[#3D1418]" />
            or
            <span className="flex-1 h-px bg-slate-200 dark:bg-[#3D1418]" />
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              teamAction('create', { name: teamName });
            }}
            className="space-y-2"
          >
            <label htmlFor="qctf-team-name" className="font-mono text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
              Create a new team
            </label>
            <input
              id="qctf-team-name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Team name"
              maxLength={60}
              className={INPUT_CLASS}
            />
            <button type="submit" disabled={busy !== null || teamName.trim().length < 2} className={SECONDARY_BUTTON}>
              {busy === 'create' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Create team
            </button>
          </form>
        </>
      )}

      {error && (
        <p className="flex items-start gap-1.5 text-xs text-rose-700 dark:text-rose-400" role="alert">
          <AlertCircle className="w-3.5 h-3.5 mt-px shrink-0" />
          {error}
        </p>
      )}
    </section>
  );
}
