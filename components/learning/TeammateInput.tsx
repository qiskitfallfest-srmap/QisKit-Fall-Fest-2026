'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, XCircle, Loader2, Trash2, Plus } from 'lucide-react';

interface TeammateData {
  email: string;
  fullName: string;
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
  const [validationState, setValidationState] = useState<{
    status: 'valid' | 'not_whitelisted' | 'already_in_team' | 'checking' | 'idle';
    message?: string;
  }>({ status: member.status || 'idle' });

  // Debounced lookup
  useEffect(() => {
    const trimmed = emailInput.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) {
      setValidationState({ status: 'idle' });
      onChange(index, { email: trimmed, fullName: nameInput, status: 'idle' });
      return;
    }

    setValidationState({ status: 'checking' });
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/auth/verify-email?email=${encodeURIComponent(trimmed)}`);
        const data = await res.json();

        if (!data.whitelisted) {
          setValidationState({
            status: 'not_whitelisted',
            message: 'Email not found in registered whitelist',
          });
          onChange(index, {
            email: trimmed,
            fullName: nameInput,
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
    <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-700">Teammate {index + 1}</span>
        <div className="flex items-center gap-1">
          {canAdd && onAdd && (
            <button
              type="button"
              onClick={onAdd}
              className="text-burgundy hover:text-burgundy-deep transition-colors p-1"
              title="Add another teammate"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-slate-400 hover:text-rose-600 transition-colors p-1"
            title="Remove teammate"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <input
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="Teammate's registered Gmail"
            className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-burgundy focus:border-burgundy"
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
            className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-burgundy focus:border-burgundy"
          />
        </div>
      </div>

      {/* Validation status badge */}
      {validationState.status !== 'idle' && (
        <div className="flex items-center gap-1.5 text-xs">
          {validationState.status === 'checking' && (
            <span className="text-slate-500 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin text-slate-500" />
              Verifying platform whitelist...
            </span>
          )}

          {validationState.status === 'valid' && (
            <span className="text-emerald-700 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {validationState.message || 'Authorized & Available'}
            </span>
          )}

          {validationState.status === 'not_whitelisted' && (
            <span className="text-amber-700 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              {validationState.message}
            </span>
          )}

          {validationState.status === 'already_in_team' && (
            <span className="text-rose-700 font-medium flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              {validationState.message}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
