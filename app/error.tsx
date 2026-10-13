'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { RotateCw, ArrowLeft } from 'lucide-react';

function isChunkLoadError(err: unknown): boolean {
  if (!err) return false;
  const msg =
    typeof err === 'object' && 'message' in err && typeof (err as any).message === 'string'
      ? (err as any).message
      : String(err);
  const name =
    typeof err === 'object' && 'name' in err && typeof (err as any).name === 'string'
      ? (err as any).name
      : '';

  return (
    name === 'ChunkLoadError' ||
    /Loading chunk [\d\w-]+ failed/i.test(msg) ||
    /Failed to fetch dynamically imported module/i.test(msg) ||
    /Importing a module script failed/i.test(msg) ||
    /error loading dynamically imported module/i.test(msg)
  );
}

function isDomMutationError(err: unknown): boolean {
  if (!err) return false;
  const msg =
    typeof err === 'object' && 'message' in err && typeof (err as any).message === 'string'
      ? (err as any).message
      : String(err);
  return (
    msg.includes("Failed to execute 'removeChild' on 'Node'") ||
    msg.includes("Failed to execute 'insertBefore' on 'Node'")
  );
}

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const hasAutoRetriedRef = useRef(false);
  const manualRetryCountRef = useRef(0);

  useEffect(() => {
    // Log error securely without exposing stack trace to the UI
    console.error('Application error occurred:', error?.message || error);

    // 1. Auto-recover from stale deployment ChunkLoadError (once per 15s window)
    if (typeof window !== 'undefined' && isChunkLoadError(error)) {
      try {
        const lastReload = Number(sessionStorage.getItem('qff_chunk_reload_ts') || '0');
        const now = Date.now();
        if (now - lastReload > 15000) {
          sessionStorage.setItem('qff_chunk_reload_ts', String(now));
          window.location.reload();
          return;
        }
      } catch {
        // Ignore sessionStorage restrictions
      }
    }

    // 2. Auto-recover once from browser-extension / translation DOM reconciliation errors
    if (!hasAutoRetriedRef.current && isDomMutationError(error)) {
      hasAutoRetriedRef.current = true;
      reset();
    }
  }, [error, reset]);

  const handleRetry = () => {
    manualRetryCountRef.current += 1;
    if (
      typeof window !== 'undefined' &&
      (isChunkLoadError(error) || manualRetryCountRef.current > 1)
    ) {
      window.location.reload();
      return;
    }
    reset();
  };

  return (
    <main
      className="
        relative w-full flex items-center justify-center
        min-h-[calc(100svh-var(--navbar-height,80px))]
        px-4 sm:px-6 lg:px-8 py-12 sm:py-16
        bg-[#F7F2ED] dark:bg-[#120506]
        overflow-hidden select-none
      "
    >
      {/* Centered Editorial Card */}
      <div
        className="
          relative z-10 w-full
          max-w-[calc(100vw-32px)] sm:max-w-[min(580px,calc(100vw-48px))] lg:max-w-[min(620px,calc(100vw-48px))]
          p-6 sm:p-10 lg:p-[48px_52px]
          rounded-[16px]
          bg-[rgba(255,250,246,0.85)] dark:bg-[rgba(35,8,11,0.78)]
          backdrop-blur-md
          border border-[rgba(108,21,30,0.20)] dark:border-[rgba(240,120,132,0.24)]
          shadow-[0_18px_60px_rgba(55,20,22,0.06)] dark:shadow-[0_18px_70px_rgba(0,0,0,0.30)]
          text-center flex flex-col items-center
        "
      >
        <span
          className="
            text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.20em]
            text-[#6C151E] dark:text-[#F07A86]
          "
        >
          SYSTEM
        </span>

        <h1
          className="
            mt-3 sm:mt-4
            font-serif font-bold
            text-[32px] sm:text-[42px] lg:text-[48px]
            leading-[0.98] tracking-[-0.025em]
            text-[#201617] dark:text-[#FFF4F1]
          "
        >
          Something went off course.
        </h1>

        <p
          className="
            mt-4 sm:mt-5
            text-[14px] sm:text-[15px]
            leading-[1.65]
            max-w-[480px]
            text-[#635654] dark:text-[#D2C4C1]
          "
        >
          The page encountered an unexpected problem. You can retry or return to the home page.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full justify-center">
          <button
            onClick={handleRetry}
            data-cursor="cta"
            className="
              group w-full sm:w-auto inline-flex items-center justify-center gap-2
              h-[44px] px-6 rounded-[8px]
              text-[14px] font-semibold tracking-[0.01em]
              bg-[#7D111C] hover:bg-[#961824] text-[#FFF8F6]
              dark:bg-[#8F1723] dark:hover:bg-[#A91D2B] dark:text-[#FFF7F5]
              shadow-[0_4px_14px_rgba(108,21,30,0.08)]
              transition-all duration-160 ease-[cubic-bezier(0.22,1,0.36,1)]
              hover:-translate-y-[1px] active:translate-y-0
              focus-visible:ring-2 focus-visible:ring-burgundy outline-none
            "
          >
            <RotateCw size={16} className="transition-transform duration-160 group-hover:rotate-45" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            data-cursor="interactive"
            className="
              group w-full sm:w-auto inline-flex items-center justify-center gap-2
              h-[44px] px-5 rounded-[8px]
              text-[14px] font-semibold tracking-[0.01em]
              text-[#201617] dark:text-[#FFF4F1]
              border border-[rgba(108,21,30,0.22)] dark:border-[rgba(240,120,132,0.26)]
              hover:bg-black/[0.03] dark:hover:bg-white/[0.04]
              transition-all duration-160 ease-[cubic-bezier(0.22,1,0.36,1)]
              focus-visible:ring-2 focus-visible:ring-burgundy outline-none
            "
          >
            <ArrowLeft size={16} className="transition-transform duration-160 group-hover:-translate-x-0.5" />
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
