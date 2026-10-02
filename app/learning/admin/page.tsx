'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AuthGate } from '@/components/learning/AuthGate';
import {
  Shield,
  UserPlus,
  Users,
  Search,
  CheckCircle2,
  Trash2,
  Lock,
  Unlock,
  Settings,
  ArrowLeft,
  FileSpreadsheet,
  AlertCircle,
  ExternalLink,
  Award,
} from 'lucide-react';

export default function AdminConsolePage() {
  const [session, setSession] = useState<any>(null);
  const [emails, setEmails] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingEmails, setIsLoadingEmails] = useState(true);

  // Single email form
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('participant');
  const [isAddingEmail, setIsAddingEmail] = useState(false);
  const [singleMsg, setSingleMsg] = useState('');
  const [singleMsgIsError, setSingleMsgIsError] = useState(false);

  // Bulk email form
  const [bulkText, setBulkText] = useState('');
  const [bulkRole, setBulkRole] = useState('participant');
  const [isAddingBulk, setIsAddingBulk] = useState(false);
  const [bulkMsg, setBulkMsg] = useState('');
  const [bulkMsgIsError, setBulkMsgIsError] = useState(false);

  // System config overrides
  const [config, setConfig] = useState<any>({});
  const [stats, setStats] = useState<any>({});
  const [isUpdatingConfig, setIsUpdatingConfig] = useState(false);

  const fetchWhitelist = React.useCallback(async () => {
    try {
      setIsLoadingEmails(true);
      const res = await fetch(`/api/admin/emails?search=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data.emails) {
        setEmails(data.emails);
      }
    } catch (e) {
      console.error('Error fetching whitelist:', e);
    } finally {
      setIsLoadingEmails(false);
    }
  }, [searchQuery]);

  const fetchConfig = React.useCallback(async () => {
    try {
      const res = await fetch('/api/admin/config');
      const data = await res.json();
      if (data.config) {
        setConfig(data.config);
      }
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (e) {
      console.error('Error fetching config:', e);
    }
  }, []);

  useEffect(() => {
    fetchWhitelist();
    fetchConfig();
  }, [fetchWhitelist, fetchConfig]);

  // Add single email
  async function handleAddSingle(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail.trim()) return;

    try {
      setIsAddingEmail(true);
      setSingleMsg('');
      setSingleMsgIsError(false);
      const res = await fetch('/api/admin/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newEmail.trim(),
          fullName: newName.trim(),
          role: newRole,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSingleMsg('Email added to whitelist & synced to Redis!');
        setSingleMsgIsError(false);
        setNewEmail('');
        setNewName('');
        await fetchWhitelist();
      } else {
        setSingleMsg(data.error || 'Failed to add email');
        setSingleMsgIsError(true);
      }
    } catch (err: any) {
      setSingleMsg(err?.message || 'Error adding email');
      setSingleMsgIsError(true);
    } finally {
      setIsAddingEmail(false);
    }
  }

  // Bulk add emails
  async function handleAddBulk(e: React.FormEvent) {
    e.preventDefault();
    if (!bulkText.trim()) return;

    try {
      setIsAddingBulk(true);
      setBulkMsg('');
      setBulkMsgIsError(false);
      const res = await fetch('/api/admin/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emails: bulkText.trim(),
          role: bulkRole,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setBulkMsg(`Successfully whitelisted ${data.addedCount} email(s)!`);
        setBulkMsgIsError(false);
        setBulkText('');
        await fetchWhitelist();
      } else {
        setBulkMsg(data.error || 'Failed to bulk add');
        setBulkMsgIsError(true);
      }
    } catch (err: any) {
      setBulkMsg(err?.message || 'Error processing bulk add');
      setBulkMsgIsError(true);
    } finally {
      setIsAddingBulk(false);
    }
  }

  // Toggle active status
  async function handleToggleActive(email: string, currentActive: boolean) {
    try {
      await fetch('/api/admin/emails', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, isActive: !currentActive }),
      });
      await fetchWhitelist();
    } catch (err) {
      console.error('Error toggling email active status:', err);
    }
  }

  // Delete email
  async function handleDeleteEmail(email: string) {
    if (!confirm(`Are you sure you want to remove ${email} from authorized access?`)) return;

    try {
      await fetch(`/api/admin/emails?email=${encodeURIComponent(email)}`, {
        method: 'DELETE',
      });
      await fetchWhitelist();
    } catch (err) {
      console.error('Error deleting email:', err);
    }
  }

  // Toggle config override
  async function handleToggleOverride(key: string, currentValue: boolean) {
    try {
      setIsUpdatingConfig(true);
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key,
          value: { enabled: !currentValue },
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchConfig();
      }
    } catch (err) {
      console.error('Error toggling override:', err);
    } finally {
      setIsUpdatingConfig(false);
    }
  }

  return (
    <AuthGate onSessionChange={setSession}>
      <div className="min-h-screen bg-slate-50/60 pb-16">
        {/* Navigation Breadcrumb Bar */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
            <Link
              href="/learning"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Learning Hub
            </Link>

            <span className="px-2.5 py-0.5 rounded bg-burgundy/10 text-burgundy font-bold text-xs uppercase tracking-wider flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              Organizer Administration Console
            </span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
          {/* Header & Stats Strip */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Access Control & Whitelist Manager
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Add authorized test Gmail addresses, manage participant permissions, configure system
              overrides, and monitor hackathon teams.
            </p>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Whitelisted Accounts
                </span>
                <span className="text-2xl font-bold text-slate-900 mt-1 block">
                  {stats.whitelistedUsers || emails.length || 0}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Hackathon Teams Formed
                </span>
                <span className="text-2xl font-bold text-slate-900 mt-1 block">
                  {stats.teamsFormed || 0}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Competition Entries
                </span>
                <span className="text-2xl font-bold text-slate-900 mt-1 block">
                  {stats.competitionSubmissions || 0}
                </span>
              </div>
            </div>
          </div>

          {/* System Overrides Card (Crucial for Testing!) */}
          <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-slate-900">
              <Settings className="w-5 h-5 text-burgundy" />
              <h2 className="text-base font-bold">Testing & System Release Overrides</h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Enable these switches to test the entire participant journey immediately without
              waiting for real-world festival calendar dates.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Lecture Lock Override */}
              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Bypass Sequential Lecture Locks
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Unlock all 6 sessions immediately for review and testing.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleToggleOverride(
                      'lecture_lock_override',
                      config.lecture_lock_override?.enabled === true
                    )
                  }
                  disabled={isUpdatingConfig}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    config.lecture_lock_override?.enabled === true
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-300 text-slate-700'
                  }`}
                >
                  {config.lecture_lock_override?.enabled === true ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              {/* Hackathon Release Override */}
              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Unlock Hackathon Workspace Early
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Allow participants to form teams and view problem statements prior to Oct 10th.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleToggleOverride(
                      'hackathon_release_override',
                      config.hackathon_release_override?.enabled === true
                    )
                  }
                  disabled={isUpdatingConfig}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    config.hackathon_release_override?.enabled === true
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-300 text-slate-700'
                  }`}
                >
                  {config.hackathon_release_override?.enabled === true ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>
          </div>

          {/* Add Emails Section (Single & Bulk) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Single Email Form */}
            <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-slate-900">
                <UserPlus className="w-5 h-5 text-burgundy" />
                <h2 className="text-base font-bold">Add Individual Authorized Email</h2>
              </div>

              {singleMsg && (
                <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                  singleMsgIsError
                    ? 'bg-rose-50 border border-rose-200 text-rose-800'
                    : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                }`}>
                  {singleMsgIsError ? (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                  <span>{singleMsg}</span>
                </div>
              )}

              <form onSubmit={handleAddSingle} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Gmail Address:
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="tester@gmail.com"
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-burgundy focus:border-burgundy"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Participant Full Name (Optional):
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-burgundy focus:border-burgundy"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">Role:</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-burgundy focus:border-burgundy"
                  >
                    <option value="participant">Participant</option>
                    <option value="tester">Tester</option>
                    <option value="admin">Administrator</option>
                    <option value="mentor">Technical Mentor</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isAddingEmail}
                  className="w-full px-4 py-2 bg-burgundy text-white text-xs font-semibold rounded hover:bg-burgundy-deep transition-colors shadow-xs disabled:opacity-50"
                >
                  {isAddingEmail ? 'Saving to Database & Cache...' : 'Add Authorized Email'}
                </button>
              </form>
            </div>

            {/* Bulk Import Form */}
            <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-slate-900">
                <FileSpreadsheet className="w-5 h-5 text-burgundy" />
                <h2 className="text-base font-bold">Bulk Paste Authorized Emails</h2>
              </div>

              {bulkMsg && (
                <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                  bulkMsgIsError
                    ? 'bg-rose-50 border border-rose-200 text-rose-800'
                    : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                }`}>
                  {bulkMsgIsError ? (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                  <span>{bulkMsg}</span>
                </div>
              )}

              <form onSubmit={handleAddBulk} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Paste Emails (Separated by newlines or commas):
                  </label>
                  <textarea
                    rows={4}
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    placeholder="student1@gmail.com&#10;student2@gmail.com&#10;student3@gmail.com"
                    required
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded font-mono focus:outline-none focus:ring-1 focus:ring-burgundy focus:border-burgundy"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Default Role for Batch:
                  </label>
                  <select
                    value={bulkRole}
                    onChange={(e) => setBulkRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-burgundy focus:border-burgundy"
                  >
                    <option value="participant">Participant</option>
                    <option value="tester">Tester</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isAddingBulk}
                  className="w-full px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded hover:bg-slate-800 transition-colors shadow-xs disabled:opacity-50"
                >
                  {isAddingBulk ? 'Processing Bulk Import...' : 'Import Batch into Whitelist'}
                </button>
              </form>
            </div>
          </div>

          {/* Whitelist Roster Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Authorized Whitelist Directory ({emails.length})
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Synchronized in real-time with Upstash Redis cache.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchWhitelist()}
                  placeholder="Search emails..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-burgundy focus:border-burgundy"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Email Address</th>
                    <th className="py-3 px-4">Full Name</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {emails.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-900">
                        {row.email}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {row.full_name || '—'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                          {row.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {row.is_active ? (
                          <span className="text-emerald-700 font-medium inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium">Inactive</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(row.email, row.is_active)}
                          className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 underline"
                        >
                          {row.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteEmail(row.email)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                          title="Remove from whitelist"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {emails.length === 0 && !isLoadingEmails && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        No authorized emails found matching your query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AuthGate>
  );
}
