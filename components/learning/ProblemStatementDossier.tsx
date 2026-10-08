import React from 'react';
import { ProblemStatement } from '@/data/learning/types';
import { ProblemStatementDriveNotice } from './ProblemStatementDriveNotice';

interface ProblemStatementDossierProps {
  ps: ProblemStatement;
}

export function ProblemStatementDossier({ ps }: ProblemStatementDossierProps) {
  return (
    <div className="bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-xl shadow-xs overflow-hidden font-sans">
      {/* Header Banner */}
      <div className="p-6 bg-slate-50 dark:bg-[#1C0A0D] border-b border-slate-200 dark:border-[#3D1418]">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded bg-burgundy/10 text-burgundy dark:bg-burgundy/20 dark:text-[#E89BA5] font-bold text-xs uppercase tracking-wider">
            {ps.vertical}
          </span>
          <span className="px-2.5 py-0.5 rounded bg-slate-200 dark:bg-[#250D11] text-slate-800 dark:text-[#FAF6F3] font-mono font-bold text-xs">
            {ps.id}
          </span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-[#FAF6F3] tracking-tight">{ps.title}</h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">{ps.subtitle}</p>
      </div>

      <div className="p-6">
        {/* Mandatory Reading Notice & Drive Link */}
        <ProblemStatementDriveNotice psId={ps.id} />
      </div>
    </div>
  );
}
