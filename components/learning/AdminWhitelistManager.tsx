'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, CheckCircle2, Trash2, FileSpreadsheet, AlertCircle, UserPlus, UploadCloud, FileUp, Loader2, X } from 'lucide-react';
import { extractParticipantsFromCSV, ParsedParticipant } from '@/lib/csv';

interface Props {
  /** Called after a change that affects platform-wide stats (members added). */
  onChange?: () => void;
  /** Reports the number of rows currently listed, for the sidebar count. */
  onCountChange?: (count: number) => void;
}

export function AdminWhitelistManager({ onChange, onCountChange }: Props) {
  const [emails, setEmails] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingEmails, setIsLoadingEmails] = useState(true);

  // CSV file upload state
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvFileName, setCsvFileName] = useState('');
  const [csvFileSize, setCsvFileSize] = useState('');
  const [csvParticipants, setCsvParticipants] = useState<ParsedParticipant[]>([]);
  const [csvTotalRows, setCsvTotalRows] = useState(0);
  const [csvDuplicates, setCsvDuplicates] = useState(0);
  const [csvRole, setCsvRole] = useState('participant');
  const [isUploadingCsv, setIsUploadingCsv] = useState(false);
  const [csvMsg, setCsvMsg] = useState('');
  const [csvMsgIsError, setCsvMsgIsError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Single email form
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('participant');
  const [isAddingEmail, setIsAddingEmail] = useState(false);
  const [singleMsg, setSingleMsg] = useState('');
  const [singleMsgIsError, setSingleMsgIsError] = useState(false);
  const singleEmailInputRef = useRef<HTMLInputElement | null>(null);

  // Bulk email form
  const [bulkText, setBulkText] = useState('');
  const [bulkRole, setBulkRole] = useState('participant');
  const [isAddingBulk, setIsAddingBulk] = useState(false);
  const [bulkMsg, setBulkMsg] = useState('');
  const [bulkMsgIsError, setBulkMsgIsError] = useState(false);

  const fetchWhitelist = useCallback(async () => {
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

  useEffect(() => {
    fetchWhitelist();
  }, [fetchWhitelist]);

  useEffect(() => {
    if (!isLoadingEmails) onCountChange?.(emails.length);
  }, [isLoadingEmails, emails.length, onCountChange]);

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
        setSingleMsg(data.message || 'Member added to whitelist & synced!');
        setSingleMsgIsError(false);
        setNewEmail('');
        setNewName('');
        await fetchWhitelist();
        onChange?.();
      } else {
        setSingleMsg(data.error || 'Failed to add member');
        setSingleMsgIsError(true);
      }
    } catch (err: any) {
      setSingleMsg(err?.message || 'Error adding member');
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
        setBulkMsg(data.message || `Successfully whitelisted ${data.addedCount} email(s)!`);
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

  // CSV file selection and client-side extraction
  function handleCsvFileSelect(file: File) {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setCsvMsg('Please select a valid .csv file');
      setCsvMsgIsError(true);
      return;
    }

    setCsvFile(file);
    setCsvFileName(file.name);
    setCsvFileSize((file.size / 1024).toFixed(1) + ' KB');
    setCsvMsg('');
    setCsvMsgIsError(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        const { participants, totalRows, duplicateCount } = extractParticipantsFromCSV(text, csvRole);
        setCsvParticipants(participants);
        setCsvTotalRows(totalRows);
        setCsvDuplicates(duplicateCount);
        if (participants.length === 0) {
          setCsvMsg('No valid participant emails found in this CSV. Please check the column headers.');
          setCsvMsgIsError(true);
        }
      }
    };
    reader.onerror = () => {
      setCsvMsg('Failed to read CSV file content');
      setCsvMsgIsError(true);
    };
    reader.readAsText(file);
  }

  function handleCsvClear() {
    setCsvFile(null);
    setCsvFileName('');
    setCsvFileSize('');
    setCsvParticipants([]);
    setCsvTotalRows(0);
    setCsvDuplicates(0);
    setCsvMsg('');
    setCsvMsgIsError(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  async function handleCsvUploadSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!csvParticipants || csvParticipants.length === 0) {
      setCsvMsg('No valid participants to seed. Please select a valid CSV sheet.');
      setCsvMsgIsError(true);
      return;
    }

    try {
      setIsUploadingCsv(true);
      setCsvMsg('');
      setCsvMsgIsError(false);

      const res = await fetch('/api/admin/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participants: csvParticipants.map((p) => ({
            ...p,
            role: csvRole,
          })),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCsvMsg(data.message || `Successfully seeded ${data.addedCount} new participant(s)!`);
        setCsvMsgIsError(false);
        setCsvFile(null);
        setCsvParticipants([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
        await fetchWhitelist();
        onChange?.();
      } else {
        setCsvMsg(data.error || 'Failed to seed CSV data');
        setCsvMsgIsError(true);
      }
    } catch (err: any) {
      setCsvMsg(err?.message || 'Error uploading and seeding CSV data');
      setCsvMsgIsError(true);
    } finally {
      setIsUploadingCsv(false);
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

  return (
    <div className="space-y-6">
      {/* FEATURED: CSV File Upload & Participant Seeding */}
      <div className="p-6 bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 text-slate-900 dark:text-[#FAF6F3]">
            <div className="p-2 rounded-lg bg-burgundy/10 dark:bg-burgundy/20 text-burgundy dark:text-[#E89BA5]">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Upload CSV to Seed Participants</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Upload registration sheets (Google Forms, CSV exports, etc.). Safely adds unique new members and updates names without deleting any previous participants.
              </p>
            </div>
          </div>
          <span className="text-2xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 self-start sm:self-auto flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            Safe Upsert (Zero Deletion)
          </span>
        </div>

        {/* CSV Feedback Alert */}
        {csvMsg && (
          <div
            className={`p-3.5 rounded-lg text-xs flex items-center gap-2.5 ${
              csvMsgIsError
                ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300'
                : 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
            }`}
          >
            {csvMsgIsError ? (
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            )}
            <span className="font-medium leading-relaxed">{csvMsg}</span>
          </div>
        )}

        {/* Drag-and-drop file upload zone */}
        {!csvFile ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleCsvFileSelect(file);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-burgundy bg-burgundy/5 dark:border-[#E89BA5] dark:bg-burgundy/10'
                : 'border-slate-300 dark:border-[#3D1418] hover:border-burgundy dark:hover:border-[#E89BA5] bg-slate-50/50 dark:bg-[#1C0A0D]/50 hover:bg-slate-50 dark:hover:bg-[#1C0A0D]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleCsvFileSelect(file);
              }}
            />
            <div className="flex flex-col items-center gap-2.5">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-[#250D11] flex items-center justify-center text-slate-500 dark:text-[#E89BA5] shadow-2xs">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-[#FAF6F3]">
                  Click to browse file
                </span>
                <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  {' '}
                  or drag and drop your CSV sheet here
                </span>
              </div>
              <p className="text-2xs text-slate-400 dark:text-slate-500">
                Automatically detects Candidate Email & Name columns (e.g. Registrations / Responses CSV)
              </p>
            </div>
          </div>
        ) : (
          /* CSV Parsed Preview & Confirm Form */
          <form onSubmit={handleCsvUploadSubmit} className="space-y-4">
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#1C0A0D] border border-slate-200 dark:border-[#3D1418] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-burgundy/10 text-burgundy dark:bg-burgundy/20 dark:text-[#E89BA5] shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-[#FAF6F3] flex items-center gap-2">
                    <span>{csvFileName}</span>
                    <span className="text-2xs font-normal text-slate-500 dark:text-slate-400">
                      ({csvFileSize})
                    </span>
                  </div>
                  <div className="text-2xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {csvParticipants.length} valid unique participants
                    </span>
                    <span>•</span>
                    <span>{csvTotalRows} total rows</span>
                    {csvDuplicates > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-amber-600 dark:text-amber-400">
                          {csvDuplicates} duplicate(s) reconciled
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCsvClear}
                className="text-xs text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 flex items-center gap-1 self-end sm:self-auto cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Remove file</span>
              </button>
            </div>

            {/* Preview Table */}
            {csvParticipants.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-2xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>
                    Sheet Preview (First {Math.min(4, csvParticipants.length)} of {csvParticipants.length} participants)
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 lowercase font-medium">
                    all existing members will remain intact
                  </span>
                </div>
                <div className="border border-slate-200 dark:border-[#3D1418] rounded-lg overflow-hidden bg-white dark:bg-[#150709]">
                  <table className="w-full text-left text-2xs">
                    <thead className="bg-slate-50 dark:bg-[#1C0A0D] border-b border-slate-200 dark:border-[#3D1418] text-slate-600 dark:text-slate-400">
                      <tr>
                        <th className="px-3 py-2 font-semibold">#</th>
                        <th className="px-3 py-2 font-semibold">Candidate Name</th>
                        <th className="px-3 py-2 font-semibold">Email</th>
                        <th className="px-3 py-2 font-semibold">Target Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-[#250D11]">
                      {csvParticipants.slice(0, 4).map((p, idx) => (
                        <tr key={p.email} className="text-slate-700 dark:text-slate-300">
                          <td className="px-3 py-2 text-slate-400">{idx + 1}</td>
                          <td className="px-3 py-2 font-medium">{p.fullName || '—'}</td>
                          <td className="px-3 py-2 font-mono text-slate-500 dark:text-slate-400">
                            {p.email}
                          </td>
                          <td className="px-3 py-2">
                            <span className="px-2 py-0.5 rounded text-2xs bg-slate-100 dark:bg-[#250D11] text-slate-700 dark:text-slate-300 font-medium">
                              {csvRole}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Action buttons and Role */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Assign Role:
                </label>
                <select
                  value={csvRole}
                  onChange={(e) => {
                    const newR = e.target.value;
                    setCsvRole(newR);
                    setCsvParticipants((prev) => prev.map((p) => ({ ...p, role: newR })));
                  }}
                  className="px-2.5 py-1 text-xs border border-slate-300 dark:border-[#3D1418] rounded bg-white dark:bg-[#1C0A0D] text-slate-900 dark:text-[#FAF6F3] focus:outline-none focus:ring-1 focus:ring-burgundy"
                >
                  <option value="participant">Participant (Recommended)</option>
                  <option value="tester">Tester</option>
                </select>
                <span className="text-2xs text-slate-500 dark:text-slate-400 hidden sm:inline">
                  (Existing admins are automatically protected)
                </span>
              </div>

              <button
                type="submit"
                disabled={isUploadingCsv || csvParticipants.length === 0}
                className="px-5 py-2.5 bg-burgundy hover:bg-burgundy-deep text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isUploadingCsv ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Seeding {csvParticipants.length} Participants...</span>
                  </>
                ) : (
                  <>
                    <FileUp className="w-4 h-4" />
                    <span>Seed {csvParticipants.length} Unique Participants</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Add Emails Section (Single & Bulk Manual Entries) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Single Email Form */}
        <div
          id="add-individual-member"
          className="p-6 bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-xl shadow-xs space-y-4"
        >
          <div className="flex items-center gap-2 text-slate-900 dark:text-[#FAF6F3]">
            <UserPlus className="w-5 h-5 text-burgundy dark:text-[#E89BA5]" />
            <h2 className="text-base font-bold">Add Individual Member</h2>
          </div>

          {singleMsg && (
            <div
              className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                singleMsgIsError
                  ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              }`}
            >
              {singleMsgIsError ? (
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              )}
              <span>{singleMsg}</span>
            </div>
          )}

          <form onSubmit={handleAddSingle} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                Email Address:
              </label>
              <input
                ref={singleEmailInputRef}
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="participant@gmail.com or student@srmap.edu.in"
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-[#3D1418] bg-white dark:bg-[#1C0A0D] text-slate-900 dark:text-[#FAF6F3] rounded focus:outline-none focus:ring-1 focus:ring-burgundy focus:border-burgundy dark:placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                Participant Full Name (Optional):
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Full Name (e.g. Anurag Kumar)"
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-[#3D1418] bg-white dark:bg-[#1C0A0D] text-slate-900 dark:text-[#FAF6F3] rounded focus:outline-none focus:ring-1 focus:ring-burgundy focus:border-burgundy dark:placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">Role:</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-[#3D1418] rounded bg-white dark:bg-[#1C0A0D] text-slate-900 dark:text-[#FAF6F3] focus:outline-none focus:ring-1 focus:ring-burgundy focus:border-burgundy"
              >
                <option value="participant">Participant (Default)</option>
                <option value="tester">Tester</option>
                <option value="admin">Administrator</option>
                <option value="mentor">Technical Mentor</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isAddingEmail}
              className="w-full px-4 py-2.5 bg-burgundy hover:bg-burgundy-deep text-white text-xs font-semibold rounded-lg transition-colors shadow-xs disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {isAddingEmail ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Member to Database...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add Authorized Member</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Bulk Import Form */}
        <div className="p-6 bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-xl shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 dark:text-[#FAF6F3]">
            <FileSpreadsheet className="w-5 h-5 text-burgundy dark:text-[#E89BA5]" />
            <h2 className="text-base font-bold">Bulk Paste Authorized Emails</h2>
          </div>

          {bulkMsg && (
            <div
              className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                bulkMsgIsError
                  ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              }`}
            >
              {bulkMsgIsError ? (
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              )}
              <span>{bulkMsg}</span>
            </div>
          )}

          <form onSubmit={handleAddBulk} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                Paste Emails (Separated by newlines or commas):
              </label>
              <textarea
                rows={4}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="student1@gmail.com&#10;student2@gmail.com&#10;student3@gmail.com"
                required
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-[#3D1418] bg-white dark:bg-[#1C0A0D] text-slate-900 dark:text-[#FAF6F3] rounded font-mono focus:outline-none focus:ring-1 focus:ring-burgundy focus:border-burgundy dark:placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                Default Role for Batch:
              </label>
              <select
                value={bulkRole}
                onChange={(e) => setBulkRole(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-[#3D1418] rounded bg-white dark:bg-[#1C0A0D] text-slate-900 dark:text-[#FAF6F3] focus:outline-none focus:ring-1 focus:ring-burgundy focus:border-burgundy"
              >
                <option value="participant">Participant</option>
                <option value="tester">Tester</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isAddingBulk}
              className="w-full px-4 py-2 bg-slate-900 dark:bg-burgundy text-white text-xs font-semibold rounded hover:bg-slate-800 dark:hover:bg-burgundy-deep transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isAddingBulk ? 'Processing Bulk Import...' : 'Import Batch into Whitelist'}
            </button>
          </form>
        </div>
      </div>

      {/* Whitelist Roster Table */}
      <div className="bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-xl shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-[#3D1418] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-[#FAF6F3]">
              Authorized Whitelist Directory ({emails.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Synchronized in real-time with Upstash Redis cache.
            </p>
          </div>

          {/* Search Bar & Quick Add */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('add-individual-member');
                el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                singleEmailInputRef.current?.focus();
              }}
              className="px-3 py-1.5 bg-burgundy/10 text-burgundy dark:bg-burgundy/20 dark:text-[#E89BA5] hover:bg-burgundy/20 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Add Member</span>
            </button>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchWhitelist()}
                placeholder="Search emails or names..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 dark:border-[#3D1418] bg-white dark:bg-[#1C0A0D] text-slate-900 dark:text-[#FAF6F3] rounded focus:outline-none focus:ring-1 focus:ring-burgundy focus:border-burgundy dark:placeholder-slate-500"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#1C0A0D] border-b border-slate-200 dark:border-[#3D1418] text-slate-700 dark:text-slate-300 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#3D1418]">
              {emails.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/60 dark:hover:bg-[#1C0A0D]/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-slate-900 dark:text-[#FAF6F3]">
                    {row.email}
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                    {row.full_name || '—'}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-[#250D11] text-slate-700 dark:text-slate-300">
                      {row.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {row.is_active ? (
                      <span className="text-emerald-700 dark:text-emerald-400 font-medium inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Active
                      </span>
                    ) : (
                      <span className="text-slate-400 font-medium">Inactive</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(row.email, row.is_active)}
                      className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-[#FAF6F3] underline cursor-pointer"
                    >
                      {row.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteEmail(row.email)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                      title="Remove from whitelist"
                    >
                      <Trash2 className="w-3.5 h-3.5 inline" />
                    </button>
                  </td>
                </tr>
              ))}
              {emails.length === 0 && !isLoadingEmails && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 dark:text-slate-400">
                    No authorized emails found matching your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
