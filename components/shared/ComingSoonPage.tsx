import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Footer } from '@/components/shared/Footer';

interface ComingSoonPageProps {
  pageTitle: string;
  sectionSubtitle?: string;
  categoryName?: string;
}

export function ComingSoonPage({
  pageTitle,
  sectionSubtitle = 'This section is being prepared for Qiskit Fall Fest 2026.',
  categoryName = 'OFFICIAL EVENT SECTION',
}: ComingSoonPageProps) {
  return (
    <div className="w-full min-h-screen flex flex-col bg-[#F7F2ED] dark:bg-[#120506] transition-colors duration-300">
      <main
        className="
          flex-1 relative w-full flex items-center justify-center
          min-h-[calc(100svh-var(--navbar-height,80px))]
          px-4 sm:px-6 lg:px-8 py-16 sm:py-24
          overflow-hidden select-none
        "
      >
        {/* Subtle background radial glow */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none absolute inset-0 flex items-center justify-center
            bg-[radial-gradient(circle_at_center,rgba(108,21,30,0.06)_0%,transparent_70%)]
            dark:bg-[radial-gradient(circle_at_center,rgba(240,120,132,0.08)_0%,transparent_70%)]
          "
        />

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
          {/* Badge */}
          <div
            className="
              inline-flex items-center gap-1.5 px-3 py-1 rounded-full
              text-[11px] font-mono font-semibold tracking-wider uppercase
              bg-[rgba(108,21,30,0.08)] dark:bg-[rgba(240,120,132,0.12)]
              text-[#6C151E] dark:text-[#F07A86]
              border border-[rgba(108,21,30,0.18)] dark:border-[rgba(240,120,132,0.25)]
            "
          >
            <span>{categoryName}</span>
          </div>

          {/* Heading */}
          <h1
            className="
              mt-4 sm:mt-5
              font-serif font-bold
              text-[32px] sm:text-[42px] lg:text-[48px]
              leading-[1.02] tracking-[-0.025em]
              text-[#201617] dark:text-[#FFF4F1]
            "
          >
            {pageTitle}
          </h1>

          <div
            className="
              mt-2
              text-[13px] font-mono tracking-widest uppercase font-semibold
              text-[#80202A] dark:text-[#F0808C]
            "
          >
            Coming Soon
          </div>

          {/* Body */}
          <p
            className="
              mt-4 sm:mt-5
              text-[14px] sm:text-[15px]
              leading-[1.65]
              max-w-[460px]
              text-[#635654] dark:text-[#D2C4C1]
            "
          >
            {sectionSubtitle}
          </p>

          {/* Action buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full justify-center">
            <Link
              href="/"
              data-cursor="cta"
              className="
                group w-full sm:w-auto inline-flex items-center justify-center gap-2.5
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
              <ArrowLeft size={16} className="transition-transform duration-160 group-hover:-translate-x-0.5" />
              <span>Back to Home</span>
            </Link>

            <Link
              href="/about"
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
              <span>About Fall Fest</span>
              <ArrowRight size={16} className="transition-transform duration-160 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer attached at bottom */}
      <Footer />
    </div>
  );
}
