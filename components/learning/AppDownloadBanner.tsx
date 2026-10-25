import React from 'react';
import { Smartphone, ArrowRight } from 'lucide-react';

export const QFF_APP_URL = 'https://app.qffsrmap2026.com';

/**
 * Shown at the top of every learning page, on every visit (deliberately not dismissible: knowledge in the world, not a toast).
 * Points participants to the QFF 2026 app (college entry, attendance at every event, support). The website's own pass QR stays on the pass card as a fallback if the app has any problem.
 */
export function AppDownloadBanner() {
  return (
    <div
      role="region"
      aria-label="QFF 2026 app"
      className="w-full border-b border-slate-200 dark:border-[#3D1418] bg-[#7E1322] text-white"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6">
        <div className="flex items-start gap-3 min-w-0">
          <Smartphone aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="text-sm leading-snug">
            <span className="font-semibold">Download the QFF 2026 app.</span>{' '}
            <span className="text-white/90">
              It is used for college entry, for attendance at every event, and to get any support you need.
            </span>
          </p>
        </div>
        <a
          href={QFF_APP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-[#7E1322] transition-colors hover:bg-[#FAF7F4] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#7E1322]"
        >
          Download the app
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
