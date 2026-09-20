'use client';

import * as React from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

/**
 * Editorial Ecosystem & Partner Strip
 * Positioned cleanly between the Experience Hero and Track 01 (Learn).
 * Styled in the application's signature light Ivory palette (#F5F3F0), creating
 * a crisp, high-contrast separation that prevents any color mixing with the
 * dark event section below.
 */
export function EcosystemStrip() {
  const shouldReduceMotion = useReducedMotion();

  const handleCtaClick = React.useCallback(() => {
    const learnSection =
      document.getElementById('section-01-learn-container') ||
      document.getElementById('section-01-learn') ||
      document.getElementById('section-learn') ||
      document.getElementById('01-learn');

    if (!learnSection) return;

    if (shouldReduceMotion) {
      learnSection.scrollIntoView({ behavior: 'auto', block: 'start' });
      return;
    }

    // Accurately compute responsive navbar height offset
    const getNavbarOffset = () => {
      if (typeof window === 'undefined') return 84;
      if (window.innerWidth >= 1280) return 90;
      if (window.innerWidth >= 640) return 84;
      return 78;
    };

    const navOffset = getNavbarOffset();
    const rect = learnSection.getBoundingClientRect();
    const targetY = Math.max(0, window.scrollY + rect.top - navOffset);
    const startY = window.scrollY;
    const distance = targetY - startY;

    if (Math.abs(distance) < 5) return;

    // Cinematic slow scroll over 1500ms with smooth cubic ease-in-out curve
    const duration = 1500;
    const startTime = performance.now();

    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    let rafId: number;

    const cleanup = () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('wheel', onUserInterrupt);
      window.removeEventListener('touchstart', onUserInterrupt);
    };

    const onUserInterrupt = () => {
      cleanup();
    };

    window.addEventListener('wheel', onUserInterrupt, { passive: true });
    window.addEventListener('touchstart', onUserInterrupt, { passive: true });

    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeInOutCubic(progress);

      window.scrollTo(0, startY + distance * easedProgress);

      if (progress < 1) {
        rafId = requestAnimationFrame(animateScroll);
      } else {
        cleanup();
      }
    };

    rafId = requestAnimationFrame(animateScroll);
  }, [shouldReduceMotion]);

  return (
    <section
      id="experience-ecosystem-strip"
      aria-label="Quantum Ecosystem Partners and Editorial Mission"
      className="
        relative z-10 w-full overflow-hidden
        bg-[#F5F3F0] dark:bg-[#1C1E24]
        border-y border-[#DDD8CF] dark:border-white/10
        text-[#16171B] dark:text-[#F5F3F0]
        transition-colors duration-300
      "
    >
      {/* Subtle warm ambient lighting texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(176,141,87,0.06),transparent_80%)]"
      />

      {/* Main Container */}
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-3 sm:py-3.5">
        {/* ============================================================ */}
        {/* DESKTOP & WIDE VIEWPORTS (Single Horizontal Row Layout)     */}
        {/* ============================================================ */}
        <motion.div
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 10 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="hidden lg:flex items-center justify-between w-full"
        >
          {/* Left Cluster: Group 1, Group 2, Group 3 */}
          <div className="flex items-center flex-nowrap">
            {/* GROUP 1: POWERED BY + IBM Quantum Branding */}
            <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
              <span
                id="ecosystem-powered-by-label"
                className="text-[10px] xl:text-[11px] font-semibold tracking-[0.20em] text-[#6E7076] dark:text-[#C7C8CC] uppercase select-none font-sans"
              >
                POWERED BY
              </span>
              <div className="relative flex items-center h-7 xl:h-8">
                <Image
                  src="/images/branding/IBM_Quantum_logotype_rev_RGB.png"
                  alt="IBM Quantum"
                  width={196}
                  height={28}
                  className="h-6 xl:h-7 w-auto object-contain select-none brightness-0 opacity-90 dark:brightness-100 dark:opacity-100"
                  priority
                />
              </div>
            </div>

            {/* Vertical Divider 1 */}
            <div
              aria-hidden="true"
              className="h-7 xl:h-8 w-px bg-[#DDD8CF] dark:bg-white/20 mx-5 xl:mx-7 flex-shrink-0"
            />

            {/* GROUP 2: Qiskit Branding (Emblem + Logotype) */}
            <div className="flex items-center gap-2.5 xl:gap-3 flex-shrink-0">
              <div className="relative h-7 w-7 xl:h-8 xl:w-8 flex-shrink-0 flex items-center justify-center">
                <Image
                  src="/images/branding/qiskit_white.png"
                  alt="Qiskit logo"
                  width={32}
                  height={32}
                  className="h-6 w-6 xl:h-7 xl:w-7 object-contain select-none brightness-0 opacity-85 dark:brightness-100 dark:opacity-100"
                  priority
                />
              </div>
              <span className="text-[17px] xl:text-[19px] font-medium tracking-tight text-[#16171B] dark:text-[#F5F3F0] select-none font-sans">
                Qiskit
              </span>
            </div>

            {/* Vertical Divider 2 */}
            <div
              aria-hidden="true"
              className="h-7 xl:h-8 w-px bg-[#DDD8CF] dark:bg-white/20 mx-5 xl:mx-7 flex-shrink-0"
            />

            {/* GROUP 3: IBM Quantum Editorial Quote */}
            <div className="flex items-center flex-shrink-0">
              <p className="text-xs xl:text-[13px] text-[#16171B] dark:text-[#F5F3F0] font-serif font-normal leading-[1.3] select-none">
                &ldquo;Open science. Real impact.
                <br />
                A global movement.&rdquo;
              </p>
              <span className="text-[11px] xl:text-xs text-[#6E7076] dark:text-[#C7C8CC] font-sans font-medium tracking-wide ml-3 xl:ml-4 whitespace-nowrap select-none">
                — IBM Quantum
              </span>
            </div>
          </div>

          {/* Right Cluster: Vertical Divider 3 + GROUP 4: CTA */}
          <div className="flex items-center flex-shrink-0 pl-6">
            <div
              aria-hidden="true"
              className="h-7 xl:h-8 w-px bg-[#DDD8CF] dark:bg-white/20 mr-6 xl:mr-8 flex-shrink-0"
            />

            <button
              id="cta-explore-ecosystem-desktop"
              type="button"
              onClick={handleCtaClick}
              data-future-target="learn-section"
              className="
                group relative inline-flex items-center gap-2.5 sm:gap-3
                px-4 py-1.5 rounded-full
                bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/15
                border border-[#DDD8CF] dark:border-white/15
                shadow-[0_2px_8px_rgba(0,0,0,0.04)]
                text-xs xl:text-sm font-sans font-medium text-[#16171B] dark:text-[#F5F3F0]
                hover:text-[#6C151E] dark:hover:text-white
                transition-all duration-200
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B08D57]
                cursor-pointer
              "
              aria-label="Explore the Qiskit ecosystem"
            >
              <span className="tracking-wide">Explore the Qiskit ecosystem</span>
              <ArrowRight
                aria-hidden="true"
                className="w-4 h-4 text-[#B08D57] group-hover:text-[#6C151E] dark:group-hover:text-white transition-transform duration-200 ease-out group-hover:translate-x-1.5 flex-shrink-0"
              />
            </button>
          </div>
        </motion.div>

        {/* ============================================================ */}
        {/* TABLET VIEWPORTS (Compact 2-Cluster Balanced Layout)         */}
        {/* ============================================================ */}
        <motion.div
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 10 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="hidden md:flex lg:hidden flex-col gap-3 w-full"
        >
          {/* Row 1: Logos and CTA */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              {/* Group 1: Powered by + IBM */}
              <div className="flex items-center gap-2.5">
                <span className="text-[10px] font-semibold tracking-[0.2em] text-[#6E7076] dark:text-[#C7C8CC] uppercase font-sans">
                  POWERED BY
                </span>
                <Image
                  src="/images/branding/IBM_Quantum_logotype_rev_RGB.png"
                  alt="IBM Quantum"
                  width={154}
                  height={22}
                  className="h-5 w-auto object-contain brightness-0 opacity-90 dark:brightness-100 dark:opacity-100"
                />
              </div>

              {/* Divider */}
              <div
                aria-hidden="true"
                className="h-6 w-px bg-[#DDD8CF] dark:bg-white/20"
              />

              {/* Group 2: Qiskit */}
              <div className="flex items-center gap-2">
                <Image
                  src="/images/branding/qiskit_white.png"
                  alt="Qiskit logo"
                  width={24}
                  height={24}
                  className="h-5 w-5 object-contain brightness-0 opacity-85 dark:brightness-100 dark:opacity-100"
                />
                <span className="text-base font-medium tracking-tight text-[#16171B] dark:text-[#F5F3F0] font-sans">
                  Qiskit
                </span>
              </div>
            </div>

            {/* Group 4: CTA on Tablet */}
            <button
              id="cta-explore-ecosystem-tablet"
              type="button"
              onClick={handleCtaClick}
              data-future-target="learn-section"
              className="
                group inline-flex items-center gap-2
                px-3 py-1.5 rounded-full
                bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/15
                border border-[#DDD8CF] dark:border-white/15
                text-xs font-sans font-medium text-[#16171B] dark:text-[#F5F3F0]
                hover:text-[#6C151E] dark:hover:text-white
                transition-colors duration-200
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B08D57]
                cursor-pointer
              "
              aria-label="Explore the Qiskit ecosystem"
            >
              <span className="tracking-wide">Explore the Qiskit ecosystem</span>
              <ArrowRight
                aria-hidden="true"
                className="w-3.5 h-3.5 text-[#B08D57] group-hover:text-[#6C151E] dark:group-hover:text-white transition-transform duration-200 group-hover:translate-x-1"
              />
            </button>
          </div>

          {/* Row 2: Quote */}
          <div className="flex items-center justify-start pt-1.5 border-t border-[#DDD8CF] dark:border-white/10">
            <p className="text-xs text-[#16171B] dark:text-[#F5F3F0] font-serif font-normal leading-snug">
              &ldquo;Open science. Real impact. A global movement.&rdquo;
            </p>
            <span className="text-[11px] text-[#6E7076] dark:text-[#C7C8CC] font-sans font-medium tracking-wide ml-3">
              — IBM Quantum
            </span>
          </div>
        </motion.div>

        {/* ============================================================ */}
        {/* MOBILE VIEWPORTS (Clean, Touch-Optimized Layout)            */}
        {/* ============================================================ */}
        <motion.div
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 8 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="flex md:hidden flex-col gap-2.5 w-full py-1"
        >
          {/* Row 1: Logos (POWERED BY + IBM Quantum & Qiskit) */}
          <div className="flex items-center justify-between flex-wrap gap-2.5">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-semibold tracking-[0.18em] text-[#6E7076] dark:text-[#C7C8CC] uppercase font-sans">
                POWERED BY
              </span>
              <Image
                src="/images/branding/IBM_Quantum_logotype_rev_RGB.png"
                alt="IBM Quantum"
                width={130}
                height={20}
                className="h-4.5 w-auto object-contain brightness-0 opacity-90 dark:brightness-100 dark:opacity-100"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <Image
                src="/images/branding/qiskit_white.png"
                alt="Qiskit logo"
                width={20}
                height={20}
                className="h-4.5 w-4.5 object-contain brightness-0 opacity-85 dark:brightness-100 dark:opacity-100"
              />
              <span className="text-sm font-medium tracking-tight text-[#16171B] dark:text-[#F5F3F0] font-sans">
                Qiskit
              </span>
            </div>
          </div>

          {/* Row 2: Quote */}
          <div className="pt-2 border-t border-[#DDD8CF] dark:border-white/10">
            <p className="text-[11px] text-[#16171B] dark:text-[#F5F3F0] font-serif font-normal leading-tight">
              &ldquo;Open science. Real impact. A global movement.&rdquo;{' '}
              <span className="text-[10px] text-[#6E7076] dark:text-[#C7C8CC] font-sans font-medium whitespace-nowrap">
                — IBM Quantum
              </span>
            </p>
          </div>

          {/* Row 3: CTA */}
          <div className="pt-1">
            <button
              id="cta-explore-ecosystem-mobile"
              type="button"
              onClick={handleCtaClick}
              data-future-target="learn-section"
              className="
                group w-full min-h-[44px] flex items-center justify-between
                px-4 py-2.5 rounded-lg bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/15
                border border-[#DDD8CF] dark:border-white/15
                shadow-sm
                text-xs font-sans font-medium text-[#16171B] dark:text-[#F5F3F0]
                transition-colors duration-150 cursor-pointer
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B08D57]
              "
              aria-label="Explore the Qiskit ecosystem"
            >
              <span className="tracking-wide">Explore the Qiskit ecosystem</span>
              <ArrowRight
                aria-hidden="true"
                className="w-4 h-4 text-[#B08D57] group-hover:translate-x-1 transition-transform duration-200"
              />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
