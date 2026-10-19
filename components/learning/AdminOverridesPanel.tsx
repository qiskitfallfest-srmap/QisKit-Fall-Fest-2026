'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Settings } from 'lucide-react';

export function AdminOverridesPanel() {
  const [config, setConfig] = useState<any>({});
  const [isUpdatingConfig, setIsUpdatingConfig] = useState(false);

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/config');
      const data = await res.json();
      if (data.config) {
        setConfig(data.config);
      }
    } catch (e) {
      console.error('Error fetching config:', e);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

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
    <div className="p-6 bg-white dark:bg-[#150709] border border-slate-200 dark:border-[#3D1418] rounded-xl shadow-xs space-y-4">
      <div className="flex items-center gap-2 text-slate-900 dark:text-[#FAF6F3]">
        <Settings className="w-5 h-5 text-burgundy dark:text-[#E89BA5]" />
        <h2 className="text-base font-bold">Testing & System Release Overrides</h2>
      </div>
      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
        Enable these switches to test the entire participant journey immediately without
        waiting for real-world festival calendar dates.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Lecture Lock Override */}
        <div className="p-4 rounded-lg border border-slate-200 dark:border-[#3D1418] bg-slate-50 dark:bg-[#1C0A0D] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-[#FAF6F3] block">
              Bypass Sequential Lecture Locks
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
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
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              config.lecture_lock_override?.enabled === true
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            {config.lecture_lock_override?.enabled === true ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        {/* Hackathon Release Override */}
        <div className="p-4 rounded-lg border border-slate-200 dark:border-[#3D1418] bg-slate-50 dark:bg-[#1C0A0D] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-[#FAF6F3] block">
              Unlock Hackathon Workspace Early
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
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
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              config.hackathon_release_override?.enabled === true
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            {config.hackathon_release_override?.enabled === true ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      </div>
    </div>
  );
}
