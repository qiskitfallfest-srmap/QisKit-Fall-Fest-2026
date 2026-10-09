'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, XCircle, Loader2, Trash2, Plus } from 'lucide-react';

interface TeammateData {
  email: string;
  fullName: string;
  university?: string;
  status?: 'valid' | 'not_whitelisted' | 'already_in_team' | 'checking' | 'idle';
  teamName?: string;
}

interface TeammateInputProps {
  index: number;
  member: TeammateData;
  onChange: (index: number, updated: TeammateData) => void;
  onRemove: (index: number) => void;
  onAdd?: () => void;
  canAdd?: boolean;
}

export function TeammateInput({
  index,
  member,
  onChange,
  onRemove,
  onAdd,
  canAdd = false,
}: TeammateInputProps) {
  const [emailInput, setEmailInput] = useState(member.email || '');
  const [nameInput, setNameInput] = useState(member.fullName || '');
  const [universityInput, setUniversityInput] = useState(member.university || '');
  const [validationState, setValidationState] = useState<{
    status: 'valid' | 'not_whitelisted' | 'already_in_team' | 'checking' | 'idle';
    message?: string;
  }>({ status: member.status || 'idle' });

  // Debounced lookup
  useEffect(() => {
    const trimmed = emailInput.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) {
      setValidationState({ status: 'idle' });
      onChange(index, { email: trimmed, fullName: nameInput, university: universityInput, status: 'idle' });
      return;
    }

    setValidationState({ status: 'checking' });
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/auth/verify-email?email=${encodeURIComponent(trimmed)}`);
        const data = await res.json();

        const defaultUni = universityInput || (trimmed.endsWith('@srmap.edu.in') ? 'SRM University-AP' : '');
        if (defaultUni && !universityInput) {
          setUniversityInput(defaultUni);
        }

        if (!data.whitelisted) {
          setValidationState({
            status: 'not_whitelisted',
            message: 'Email not found in registered whitelist',
          });
          onChange(index, {
            email: trimmed,
            fullName: nameInput,
            university: defaultUni,
            status: 'not_whitelisted',
          });
        } else if (data.inTeam) {
          setValidationState({
            status: 'already_in_team',
            message: `Already registered in team "${data.teamName || 'Existing'}"`,
          });
          onChange(index, {
            email: trimmed,
            fullName: nameInput || data.fullName || '',
            university: defaultUni,
            status: 'already_in_team',
            teamName: data.teamName,
          });
        } else {
          setValidationState({
            status: 'valid',
            message: data.fullName ? `Verified: ${data.fullName}` : 'Authorized & Available',
          });
          onChange(index, {
            email: trimmed,
            fullName: nameInput || data.fullName || '',
            university: defaultUni,
            status: 'valid',
          });
        }
      } catch (err) {
        setValidationState({ status: 'idle' });
      }
    }, 400);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailInput]);

  return (
    <div className="p-3.5 rounded-lg border border-slate-200 dark:border-[#3D1418] bg-slate-50/50 dark:bg-[#1C0A0D]/60 space-y-2.5 font-sans">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Teammate {index + 1}</span>
        <div className="flex items-center gap-1">
          {canAdd && onAdd && (
            <button
              type="button"
              onClick={onAdd}
              className="text-burgundy dark:text-[#E89BA5] hover:text-burgundy-deep transition-colors p-1 cursor-pointer"
              title="Add another teammate"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
            title="Remove teammate"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div>
          <input
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="Teammate's Gmail"
            className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#150709] border border-slate-300 dark:border-[#3D1418] text-slate-900 dark:text-[#FAF6F3] rounded focus:outline-none focus:ring-1 focus:ring-burgundy focus:border-burgundy dark:placeholder-slate-500"
            required
          />
        </div>
        <div>
          <input
            type="text"
            value={nameInput}
            onChange={(e) => {
              setNameInput(e.target.value);
              onChange(index, { ...member, fullName: e.target.value });
            }}
            placeholder="Teammate Full Name"
            className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#150709] border border-slate-300 dark:border-[#3D1418] text-slate-900 dark:text-[#FAF6F3] rounded focus:outline-none focus:ring-1 focus:ring-burgundy focus:border-burgundy dark:placeholder-slate-500"
          />
        </div>
        <div>
          <input
            type="text"
            value={universityInput}
            onChange={(e) => {
              setUniversityInput(e.target.value);
              onChange(index, { ...member, university: e.target.value });
            }}
            placeholder="University / College Name *"
            required
            className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#150709] border border-slate-300 dark:border-[#3D1418] text-slate-900 dark:text-[#FAF6F3] rounded focus:outline-none focus:ring-1 focus:ring-burgundy focus:border-burgundy dark:placeholder-slate-500"
          />
        </div>
      </div>

      {/* Validation status badge */}
      {validationState.status !== 'idle' && (
        <div className="flex items-center gap-1.5 text-xs">
          {validationState.status === 'checking' && (
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin text-slate-500 dark:text-slate-400" />
              Verifying platform whitelist...
            </span>
          )}

          {validationState.status === 'valid' && (
            <span className="text-emerald-700 dark:text-emerald-300 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              {validationState.message || 'Authorized & Available'}
            </span>
          )}

          {validationState.status === 'not_whitelisted' && (
            <span className="text-amber-700 dark:text-amber-300 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              {validationState.message}
            </span>
          )}

          {validationState.status === 'already_in_team' && (
            <span className="text-rose-700 dark:text-rose-300 font-medium flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              {validationState.message}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
