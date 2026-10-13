'use client';

import React from 'react';
import { ExternalLink, FolderOpen, ArrowUpRight, BookOpen } from 'lucide-react';

export const PROBLEM_STATEMENTS_DRIVE_URL =
  'https://drive.google.com/drive/folders/1caxlXXeqjOkLmXGlimy_Etw0uPHSwyga';

interface DriveNoticeProps {
  psId?: string;
  variant?: 'banner' | 'card' | 'compact';
  className?: string;
}

export function ProblemStatementDriveNotice({
  psId,
  variant = 'banner',
  className = '',
}: DriveNoticeProps) {
  if (variant === 'compact') {
    return (
      <div
        className={`p-3 rounded-lg border border-burgundy/30 dark:border-[#E89BA5]/30 bg-burgundy/[0.04] dark:bg-[#1C0A0D] text-slate-800 dark:text-[#FAF6F3] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 font-sans ${className}`}
      >
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-burgundy dark:text-[#E89BA5] shrink-0" />
          <span className="text-xs font-semibold leading-snug">
            <strong className="font-bold text-burgundy dark:text-[#E89BA5]">MUST & SHOULD READ:</strong> Full directions & specifications for {psId || 'all problem statements'} are in the official Drive folder.
          </span>
        </div>
        <a
          href={PROBLEM_STATEMENTS_DRIVE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-burgundy hover:bg-burgundy-deep text-white font-bold text-xs shrink-0 transition-colors shadow-xs"
        >
          <span>Open Drive Folder</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </div>
    );
  }

  return (
    <div
      className={`p-4 sm:p-5 rounded-xl border border-burgundy/30 dark:border-[#E89BA5]/30 bg-gradient-to-r from-burgundy/[0.05] via-[#FAF5F6] to-burgundy/[0.03] dark:from-[#1E090D] dark:via-[#170609] dark:to-[#1A090C] shadow-xs space-y-3 font-sans ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-burgundy dark:bg-[#801D33] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
          <BookOpen className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
            <h4 className="font-extrabold text-xs sm:text-sm uppercase tracking-wider text-burgundy dark:text-[#E89BA5] flex items-center gap-1.5">
              <span>Required Directions & Guidelines</span>
            </h4>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-burgundy/15 dark:bg-burgundy/30 text-burgundy dark:text-[#E89BA5] font-extrabold uppercase tracking-widest border border-burgundy/25 dark:border-[#E89BA5]/40">
              Must & Should Read
            </span>
          </div>
          <p className="text-xs sm:text-[13px] text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
            All detailed technical directions, challenge specifications, benchmark parameters, and evaluation rubrics are provided in the official Google Drive repository.{' '}
            <strong className="font-bold text-burgundy dark:text-[#E89BA5] underline decoration-burgundy/50 underline-offset-2">
              All participants must and should thoroughly read the official Drive folder
            </strong>{' '}
            before beginning work or submitting their solution{psId ? ` for ${psId}` : ''}.
          </p>
        </div>
      </div>

      <div className="pt-2 border-t border-burgundy/15 dark:border-[#3D1418] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <a
          href={PROBLEM_STATEMENTS_DRIVE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-burgundy hover:bg-burgundy-deep text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
        >
          <FolderOpen className="w-4 h-4" />
          <span>Open Official Directions (Google Drive)</span>
          <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
        </a>
        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium text-center sm:text-right">
          Official Google Drive Folder for All Problem Statements
        </span>
      </div>
    </div>
  );
}
