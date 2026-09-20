'use client';

import * as React from 'react';
import Image from 'next/image';
import { ArrowRight, Play, Globe, Building2, Atom, X } from 'lucide-react';

const HERO_ASSETS = {
  artworkLight: '/ABOUT-01-HERO-LIGHT.png',
  artworkDark: '/ABOUT-01-HERO-DARK.png',
};

export function AboutHero() {
  const [isVideoOpen, setIsVideoOpen] = React.useState(false);

  // Close modal on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsVideoOpen(false);
    };
    if (isVideoOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isVideoOpen]);

  return (
    <div className="w-full flex flex-col">
      <section
        id="section-01-hero"
        aria-labelledby="about-hero-title"
        className="relative isolate overflow-hidden min-h-[590px] lg:min-h-[clamp(590px,38vw,700px)] bg-[#F8F2ED] text-[#181313] dark:bg-[#100405] dark:text-[#F8F4EF] transition-colors duration-300"
      >
        {/* Full-Bleed Artwork Layer */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image
            src={HERO_ASSETS.artworkLight}
            alt=""
            fill
            priority
            sizes="100vw"
            quality={88}
            referrerPolicy="no-referrer"
            className="object-cover dark:hidden object-[64%_50%] md:object-[62%_50%] lg:object-[59%_50%] xl:object-[58%_50%] 2xl:object-[57%_50%]"
          />
          <Image
            src={HERO_ASSETS.artworkDark}
            alt=""
            fill
            priority
            sizes="100vw"
            quality={88}
            referrerPolicy="no-referrer"
            className="hidden object-cover dark:block object-[66%_50%] md:object-[63%_50%] lg:object-[61%_50%] xl:object-[59%_50%] 2xl:object-[58%_50%]"
          />
        </div>

        {/* Readability Gradient Overlay */}
        <div
          aria-hidden="true"
          className="absolute inset-0 z-[1] pointer-events-none bg-[linear-gradient(90deg,#F8F2ED_0%,rgba(248,242,237,0.98)_29%,rgba(248,242,237,0.78)_42%,rgba(248,242,237,0.18)_57%,transparent_70%)] dark:bg-[linear-gradient(90deg,#100405_0%,rgba(16,4,5,0.98)_29%,rgba(16,4,5,0.80)_42%,rgba(16,4,5,0.18)_57%,transparent_70%)]"
        />

        {/* Bounded 92% / Max-1600 Macro Layout Grid (42% text / 58% visual) */}
        <div className="relative z-10 mx-auto grid min-h-[inherit] w-[92%] max-w-[1600px] lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)]">
          <div className="flex items-center">
            <div className="w-full max-w-[600px] py-14 lg:py-16 xl:py-20">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2.5 font-mono text-[11px] sm:text-xs tracking-[0.28em] uppercase font-semibold text-burgundy dark:text-[#E89BA5]">
                <span className="w-6 h-px bg-current opacity-60" />
                <span>ABOUT</span>
              </div>

              {/* Editorial Serif Display Heading with Bounded Responsive Scale */}
              <h1
                id="about-hero-title"
                className="mt-4 font-serif text-[clamp(3.35rem,4.5vw,5.35rem)] leading-[0.91] tracking-[-0.03em] text-[#181313] dark:text-[#FAF6F3]"
              >
                <span className="block">QISKIT</span>
                <span className="block italic text-burgundy dark:text-[#E89BA5] my-0.5">
                  A DECADE
                </span>
                <span className="block">ON CLOUD</span>
              </h1>

              {/* Supporting Monospace Descriptor */}
              <div className="mt-7 text-[10px] sm:text-[11px] tracking-[0.20em] uppercase font-mono font-semibold text-[#6C151E] dark:text-[#DFB2A8]">
                PEOPLE · IDEAS · TECHNOLOGY · A BRIGHTER TOMORROW
              </div>

              {/* Bounded Editorial Paragraph */}
              <p className="mt-6 max-w-[560px] text-[clamp(0.95rem,1.1vw,1.08rem)] leading-[1.65] text-[#453D3B] dark:text-[#D5CEC9] font-sans">
                Qiskit Fall Fest is a global series of community-driven events that
                bring together students, developers, researchers, and industry
                leaders to learn, build, and share the future of quantum computing.
              </p>

              {/* Interactive CTA Group */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="#section-02-the-matter"
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 min-h-[44px] rounded-lg sm:rounded-xl bg-burgundy text-ivory hover:bg-burgundy-deep dark:bg-ivory dark:text-burgundy-deep dark:hover:bg-white text-sm font-semibold tracking-wide transition-colors duration-200 shadow-sm hover:shadow-md group focus:outline-none focus:ring-2 focus:ring-burgundy dark:focus:ring-ivory"
                >
                  <span>Explore the journey</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </a>

                <button
                  type="button"
                  onClick={() => setIsVideoOpen(true)}
                  className="inline-flex items-center justify-center gap-2.5 px-5 py-3.5 min-h-[44px] rounded-lg sm:rounded-xl border border-silver dark:border-white/20 bg-white/70 dark:bg-white/5 backdrop-blur-sm hover:border-burgundy/50 dark:hover:border-gold/50 text-sm font-medium text-[#181313] dark:text-[#F5F3F0] transition-colors duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-burgundy/40 dark:focus:ring-gold/40"
                >
                  <span className="w-6 h-6 rounded-full bg-burgundy/10 dark:bg-white/10 flex items-center justify-center text-burgundy dark:text-gold">
                    <Play className="w-3 h-3 fill-current ml-0.5" />
                  </span>
                  <span>Watch Video</span>
                  <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[#6C151E] dark:text-[#C7C8CC]">
                    2 min
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Reserved visual column for globe artwork */}
          <div aria-hidden="true" className="hidden lg:block pointer-events-none" />
        </div>

        {/* Subtle Right-Side Editorial Microcopy */}
        <div className="hidden lg:block absolute right-[3.5%] top-[12%] z-20 text-[10px] uppercase tracking-[0.22em] leading-[1.5] font-mono text-[#6C151E]/80 dark:text-silver/80">
          <span className="block">QUANTUM</span>
          <span className="block">IDEAS</span>
          <span className="block">REAL</span>
          <span className="block">IMPACT</span>
          <span className="mt-3 block h-px w-8 bg-current/70" />
        </div>
      </section>

      {/* Semantic Statistics Strip Directly Under Hero */}
      <div className="border-y border-silver/60 dark:border-white/10 bg-white/40 dark:bg-black/30 backdrop-blur-sm">
        <div className="mx-auto w-[92%] max-w-[1600px] grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1.35fr] divide-y sm:divide-y-0 sm:divide-x divide-silver/40 dark:divide-white/10">
          {/* Stat 1 */}
          <div className="flex items-center gap-4 py-5 sm:py-6 sm:pr-6">
            <div className="w-11 h-11 shrink-0 rounded-xl bg-burgundy/10 dark:bg-burgundy/30 border border-burgundy/20 dark:border-burgundy/40 flex items-center justify-center text-burgundy dark:text-[#E89BA5]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#181313] dark:text-[#FAF6F3]">
                200+
              </div>
              <div className="font-mono text-xs uppercase tracking-wider text-[#665E5C] dark:text-[#B0ACA9] mt-0.5">
                Host Institutions
              </div>
            </div>
          </div>

          {/* Stat 2 */}
          <div className="flex items-center gap-4 py-5 sm:py-6 sm:px-6">
            <div className="w-11 h-11 shrink-0 rounded-xl bg-burgundy/10 dark:bg-burgundy/30 border border-burgundy/20 dark:border-burgundy/40 flex items-center justify-center text-burgundy dark:text-[#E89BA5]">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#181313] dark:text-[#FAF6F3]">
                Global
              </div>
              <div className="font-mono text-xs uppercase tracking-wider text-[#665E5C] dark:text-[#B0ACA9] mt-0.5">
                Qiskit Community
              </div>
            </div>
          </div>

          {/* Stat 3 */}
          <div className="flex items-center gap-4 py-5 sm:py-6 sm:px-6">
            <div className="w-11 h-11 shrink-0 rounded-xl bg-burgundy/10 dark:bg-burgundy/30 border border-burgundy/20 dark:border-burgundy/40 flex items-center justify-center text-burgundy dark:text-[#E89BA5]">
              <Atom className="w-5 h-5" />
            </div>
            <div>
              <div className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#181313] dark:text-[#FAF6F3]">
                10 Years
              </div>
              <div className="font-mono text-xs uppercase tracking-wider text-[#665E5C] dark:text-[#B0ACA9] mt-0.5">
                of Quantum on Cloud
              </div>
            </div>
          </div>

          {/* Stat 4: IBM Quantum Quote */}
          <div className="flex flex-col justify-center py-5 sm:py-6 sm:pl-6">
            <blockquote className="font-serif italic text-xs sm:text-sm text-[#38312F] dark:text-[#DDD8D5] leading-snug">
              “Quantum computing is not just a technology shift, it is a
              community movement.”
            </blockquote>
            <div className="font-mono text-[11px] font-semibold tracking-wider uppercase text-burgundy dark:text-gold mt-1.5 flex items-center gap-1.5">
              <span className="w-3 h-px bg-current opacity-60" />
              <span>IBM Quantum</span>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal Dialog */}
      {isVideoOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="video-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setIsVideoOpen(false)}
        >
          <div
            className="relative w-full max-w-3xl rounded-2xl bg-[#140608] border border-white/20 p-6 sm:p-8 text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsVideoOpen(false)}
              aria-label="Close video preview"
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <div className="font-mono text-xs uppercase tracking-widest text-gold mb-1">
                Qiskit Fall Fest Preview · 2 min
              </div>
              <h3
                id="video-modal-title"
                className="font-serif text-2xl font-bold text-ivory"
              >
                A Decade of Quantum on Cloud
              </h3>
            </div>

            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-white/10 flex flex-col items-center justify-center text-center p-6">
              <div className="w-16 h-16 rounded-full bg-burgundy flex items-center justify-center text-white mb-4 shadow-lg">
                <Play className="w-7 h-7 fill-current ml-1" />
              </div>
              <p className="font-serif text-lg text-white max-w-md">
                Experience ten years of collaborative quantum innovation from
                students, researchers, and global partners.
              </p>
              <p className="font-mono text-xs text-silver mt-2">
                Official Festival Showcase Feature
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
