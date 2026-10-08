"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  MapPin,
  Building2,
  Calendar,
  Sparkles,
  Copy,
  Check,
  ArrowRight,
  Info,
  CheckCircle2,
  ExternalLink,
  Maximize2,
  Minimize2,
  Cpu,
  Terminal,
} from 'lucide-react';
import { QuantumWaveField } from '@/components/ui/QuantumWaveField';
import { Footer } from '@/components/shared/Footer';
import { StaggeredTextReveal } from '@/components/ui/StaggeredTextReveal';
import { FAQS_DATA, FAQ_META } from '@/data/faqs';
import { REGISTRATION_URL } from '@/lib/constants';

const fadeInUpVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: (customDelay: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as const,
      delay: customDelay,
    },
  }),
};

export default function FAQsPageContent() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Accordion open states (Default first 2 open)
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    'faq-01': true,
    'faq-02': true,
  });

  // Copied link toast state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Support direct anchor linking on page mount or hash change (#faq-01..#faq-15)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (!hash) return;

      const targetId = hash.startsWith('faq-') ? hash : `faq-${hash.padStart(2, '0')}`;
      const found = FAQS_DATA.find((item) => item.id === targetId || `faq-${item.number}` === hash);

      if (found) {
        setOpenItems((prev) => ({ ...prev, [found.id]: true }));
        setTimeout(() => {
          const el = document.getElementById(found.id);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 200);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Filter FAQs based only on Search Query
  const filteredFaqs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return FAQS_DATA;

    return FAQS_DATA.filter((item) => {
      return (
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        `q${item.number}`.includes(q) ||
        `${item.number}` === q
      );
    });
  }, [searchQuery]);

  // Toggle single FAQ accordion
  const toggleFaq = useCallback((id: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  // Expand / Collapse all filtered FAQs
  const areAllExpanded = useMemo(() => {
    if (filteredFaqs.length === 0) return false;
    return filteredFaqs.every((item) => !!openItems[item.id]);
  }, [filteredFaqs, openItems]);

  const toggleAll = useCallback(() => {
    if (areAllExpanded) {
      setOpenItems({});
    } else {
      const newOpen: Record<string, boolean> = {};
      filteredFaqs.forEach((item) => {
        newOpen[item.id] = true;
      });
      setOpenItems((prev) => ({ ...prev, ...newOpen }));
    }
  }, [areAllExpanded, filteredFaqs]);

  // Copy Question & Answer text to clipboard cleanly
  const copyFaqContent = useCallback((item: typeof FAQS_DATA[0]) => {
    if (typeof window === 'undefined') return;
    const formattedText = `Q: ${item.question}\n\nA: ${item.answer}`;
    navigator.clipboard.writeText(formattedText).then(() => {
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2200);
    });
  }, []);

  // Scroll smoothly to a target FAQ item & expand it
  const scrollToQuestion = (id: string) => {
    setOpenItems((prev) => ({ ...prev, [id]: true }));
    if (typeof window === 'undefined') return;
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  return (
    <div className="w-full flex flex-col min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[#6C151E] selection:text-[#F5F3F0]">
      
      {/* =========================================================================
          HERO + KEY HIGHLIGHTS VIEWPORT WRAPPER (100vh MIN-HEIGHT COVERAGE)
          ========================================================================= */}
      <div className="relative w-full min-h-[calc(100vh-80px)] lg:min-h-[calc(100vh-84px)] flex flex-col justify-between">
        {/* SECTION 01: CLEAN EDITORIAL HERO SECTION */}
        <section
          id="hero"
          data-section="top"
          className="relative w-full flex-1 overflow-hidden bg-gradient-to-b from-[#FAF7F2] via-[#F4E8DC]/30 to-[#FAF7F5] dark:from-[#0B0506] dark:via-[#14080A] dark:to-[#0B0506] border-b border-[rgba(108,21,30,0.15)] dark:border-[rgba(61,20,24,0.6)] transition-colors duration-300 py-6 sm:py-8 lg:py-12 flex items-center"
        >
          {/* QUANTUM WAVE FIELD CANVAS */}
          <QuantumWaveField className="opacity-50 dark:opacity-80" />

          {/* Ambient Glow Orbs */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <div className="absolute -top-32 -left-32 w-[650px] h-[650px] rounded-full bg-gradient-to-br from-[#6C151E]/20 via-[#A7192A]/10 to-transparent blur-3xl dark:from-[#6C151E]/30" />
            <div className="absolute top-1/4 right-0 w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-[#B08D57]/20 via-[#6C151E]/10 to-transparent blur-3xl dark:from-[#F0A2B0]/20" />
          </div>

          <div className="relative z-10 mx-auto max-w-[1440px] w-full px-4 sm:px-6 lg:px-8 xl:px-12">
            <div className="max-w-3xl space-y-3.5 sm:space-y-4 pointer-events-auto">
              
              {/* Main Headline (Dark Mode: Soft Rose Pink + White matching reference image) */}
              <motion.h1
                className="font-serif text-[clamp(2rem,4.5vw,3.8rem)] font-bold leading-[1.02] tracking-[-0.03em] m-0 text-[#A7192A] dark:text-[#F0A2B0]"
                initial="hidden"
                animate="visible"
                custom={0.05}
                variants={fadeInUpVariant}
              >
                <span className="block">
                  <StaggeredTextReveal text="Frequently Asked" delay={0.05} stagger={0.02} letterClassName="text-[#A7192A] dark:text-[#F0A2B0]" />
                </span>
                <span className="block mt-0.5 sm:mt-1">
                  <StaggeredTextReveal text="Questions." delay={0.2} stagger={0.025} letterClassName="font-serif italic font-semibold text-[#6C151E] dark:text-white" />
                </span>
              </motion.h1>

              {/* Description Subtext */}
              <motion.p
                className="font-sans font-normal text-[#4E4441] dark:text-[#C4B9B8] text-sm sm:text-base leading-relaxed max-w-2xl"
                initial="hidden"
                animate="visible"
                custom={0.15}
                variants={fadeInUpVariant}
              >
                Detailed answers on the two-phase schedule, ₹99 course fee, technical challenges, eligibility criteria, and preparation guidelines for Qiskit Fall Fest 2026.
              </motion.p>

              {/* Key Highlights Domain Cards */}
              <motion.div
                className="pt-1.5 space-y-2.5 max-w-2xl"
                initial="hidden"
                animate="visible"
                custom={0.25}
                variants={fadeInUpVariant}
              >
                <div className="font-sans text-xs font-bold uppercase tracking-widest text-[#A7192A] dark:text-[#F0A2B0]">
                  KEY EVENT HIGHLIGHTS
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                  {/* Card 1: Schedule & Dates */}
                  <button
                    type="button"
                    onClick={() => scrollToQuestion('faq-02')}
                    className="group relative flex flex-col justify-center p-3.5 sm:p-4 rounded-xl border border-[#6C151E]/20 dark:border-[#3D1418] bg-white/95 dark:bg-[#180C0E] text-left transition-all duration-300 hover:border-[#6C151E] dark:hover:border-[#F0A2B0]/50 shadow-xs hover:shadow-lg hover:-translate-y-0.5 cursor-pointer overflow-hidden backdrop-blur-xl"
                  >
                    {/* Smooth Color Spread Hover Shade */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#6C151E] via-[#8A1522] to-[#A7192A] dark:from-[#3D1418] dark:via-[#6C151E] dark:to-[#A7192A] opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out pointer-events-none" />

                    <div className="relative z-10 font-serif font-bold text-base sm:text-lg text-[#211818] dark:text-white leading-tight group-hover:text-white transition-colors duration-300">
                      Schedule &amp; Dates
                    </div>
                    <div className="relative z-10 text-xs sm:text-sm font-sans font-semibold text-[#6C151E] dark:text-[#F0A2B0] group-hover:text-white dark:group-hover:text-white transition-colors duration-300 mt-0.5">
                      Oct 5–9 &amp; Oct 26–30
                    </div>
                  </button>

                  {/* Card 2: Registration & Fee */}
                  <button
                    type="button"
                    onClick={() => scrollToQuestion('faq-14')}
                    className="group relative flex flex-col justify-center p-3.5 sm:p-4 rounded-xl border border-[#6C151E]/20 dark:border-[#3D1418] bg-white/95 dark:bg-[#180C0E] text-left transition-all duration-300 hover:border-[#6C151E] dark:hover:border-[#F0A2B0]/50 shadow-xs hover:shadow-lg hover:-translate-y-0.5 cursor-pointer overflow-hidden backdrop-blur-xl"
                  >
                    {/* Smooth Color Spread Hover Shade */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#6C151E] via-[#8A1522] to-[#A7192A] dark:from-[#3D1418] dark:via-[#6C151E] dark:to-[#A7192A] opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out pointer-events-none" />

                    <div className="relative z-10 font-serif font-bold text-base sm:text-lg text-[#211818] dark:text-white leading-tight group-hover:text-white transition-colors duration-300">
                      Registration &amp; Fee
                    </div>
                    <div className="relative z-10 text-xs sm:text-sm font-sans font-semibold text-[#6C151E] dark:text-[#F0A2B0] group-hover:text-white dark:group-hover:text-white transition-colors duration-300 mt-0.5">
                      ₹99 Online Course Fee
                    </div>
                  </button>
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* SECTION 02: PURE QISKIT BURGUNDY KEY HIGHLIGHTS STRIP */}
        <section
          id="faq-stats"
          aria-label="FAQ Highlights"
          className="relative w-full shrink-0 bg-gradient-to-r from-[#500D14] via-[#6C151E] to-[#500D14] dark:from-[#200508] dark:via-[#350A0F] dark:to-[#200508] text-[#FAF7F3] border-y border-[#A7192A]/50 dark:border-[#4A151C] py-5 sm:py-6 shadow-2xl isolate overflow-hidden"
        >
          {/* Ambient Glow Orbs */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-[#A7192A]/25 dark:bg-[#A7192A]/15 rounded-full blur-3xl" />
            <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-[#8A1522]/35 dark:bg-[#F0A2B0]/15 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              
              {/* Metric 1 */}
              <div className="group flex flex-col items-start p-4 rounded-2xl bg-white/12 dark:bg-[#1A060A]/85 border border-white/20 dark:border-[#4A151C] hover:border-white/40 dark:hover:border-[#F0A2B0]/50 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 shadow-lg">
                <span className="font-sans text-xs font-bold tracking-widest uppercase text-[#F5DABF] dark:text-[#F0A2B0] mb-1">
                  Directory Scope
                </span>
                <div className="font-serif text-xl sm:text-2xl font-bold text-white leading-tight group-hover:text-white transition-colors">
                  All FAQ Topics
                </div>
                <span className="text-xs font-sans text-[#F0E6E3] dark:text-[#C4B9B8] mt-1">
                  Complete Festival Guide
                </span>
              </div>

              {/* Metric 2 */}
              <div className="group flex flex-col items-start p-4 rounded-2xl bg-white/12 dark:bg-[#1A060A]/85 border border-white/20 dark:border-[#4A151C] hover:border-white/40 dark:hover:border-[#F0A2B0]/50 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 shadow-lg">
                <span className="font-sans text-xs font-bold tracking-widest uppercase text-[#F5DABF] dark:text-[#F0A2B0] mb-1">
                  Event Timeline
                </span>
                <div className="font-serif text-lg sm:text-xl font-bold text-white leading-tight group-hover:text-white transition-colors">
                  Oct 5–9 &amp; 26–30
                </div>
                <span className="text-xs font-sans text-[#F0E6E3] dark:text-[#C4B9B8] mt-1">
                  Two-Phase Hybrid Festival
                </span>
              </div>

              {/* Metric 3 */}
              <div className="group flex flex-col items-start p-4 rounded-2xl bg-white/12 dark:bg-[#1A060A]/85 border border-white/20 dark:border-[#4A151C] hover:border-white/40 dark:hover:border-[#F0A2B0]/50 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 shadow-lg">
                <span className="font-sans text-xs font-bold tracking-widest uppercase text-[#F5DABF] dark:text-[#F0A2B0] mb-1">
                  Online Course
                </span>
                <div className="font-serif text-xl sm:text-2xl font-bold text-white leading-tight group-hover:text-white transition-colors">
                  ₹99 Fee
                </div>
                <span className="text-xs font-sans text-[#F0E6E3] dark:text-[#C4B9B8] mt-1">
                  Per Participant Registration
                </span>
              </div>

              {/* Metric 4 */}
              <div className="group flex flex-col items-start p-4 rounded-2xl bg-white/12 dark:bg-[#1A060A]/85 border border-white/20 dark:border-[#4A151C] hover:border-white/40 dark:hover:border-[#F0A2B0]/50 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 shadow-lg">
                <span className="font-sans text-xs font-bold tracking-widest uppercase text-[#F5DABF] dark:text-[#F0A2B0] mb-1">
                  Host Institution
                </span>
                <div className="font-serif text-lg sm:text-xl font-bold text-white leading-tight group-hover:text-white transition-colors">
                  SRM University-AP
                </div>
                <span className="text-xs font-sans text-[#F0E6E3] dark:text-[#C4B9B8] mt-1">
                  Amaravati, Andhra Pradesh
                </span>
              </div>

            </div>
          </div>
        </section>
      </div>

      {/* =========================================================================
          SECTION 03: CLEAN CONTROL BAR (SEARCH BAR + EXPAND ALL BUTTON ONLY)
          ========================================================================= */}
      <section
        id="faq-controls"
        aria-label="FAQ Search & Controls"
        className="sticky top-[80px] sm:top-[84px] z-30 w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-2.5 pointer-events-none transition-colors duration-300"
      >
        <div className="mx-auto max-w-[1440px] rounded-2xl p-3.5 sm:p-4 bg-white/95 dark:bg-[#16080B]/95 backdrop-blur-xl border border-[#3A0B10]/15 dark:border-[#3D1418] shadow-xl pointer-events-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Instant Search Bar */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6C151E] dark:text-[#F0A2B0]">
              <Search size={18} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search the FAQ by keywords (e.g., ₹99 fee, October dates, Python, Quiddles)..."
              aria-label="Search the FAQ"
              className="w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-xl border border-[#3A0B10]/20 dark:border-[#3D1418] bg-white dark:bg-[#1C0B0E] text-sm sm:text-base font-sans text-[#16171B] dark:text-white placeholder-[#16171B]/45 dark:placeholder-[#9C8F8E] focus:outline-none focus:ring-2 focus:ring-[#6C151E] dark:focus:ring-[#F0A2B0] transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#16171B]/50 dark:text-[#9C8F8E] hover:text-[#3A0B10] dark:hover:text-white cursor-pointer"
              >
                <X size={17} />
              </button>
            )}
          </div>

          {/* Right Action: Expand All / Collapse All Toggle */}
          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
            {searchQuery && (
              <span className="text-xs sm:text-sm font-sans font-semibold text-[#16171B]/70 dark:text-[#C4B9B8] bg-white/60 dark:bg-black/40 px-3 py-2 rounded-xl border border-[#3A0B10]/10 dark:border-[#3D1418]">
                {filteredFaqs.length} Results
              </span>
            )}

            <button
              type="button"
              onClick={toggleAll}
              className="inline-flex items-center gap-2 px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-sans font-bold bg-[#6C151E] text-white dark:bg-[#2A1014] dark:text-[#F0A2B0] border border-transparent dark:border-[#4A151C] hover:bg-[#8A1B27] dark:hover:bg-[#3A141A] transition-all duration-300 shadow-md cursor-pointer"
            >
              {areAllExpanded ? (
                <>
                  <Minimize2 size={15} />
                  <span>Collapse All</span>
                </>
              ) : (
                <>
                  <Maximize2 size={15} />
                  <span>Expand All</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 04: FULL ACCORDION FAQ DIRECTORY
          ========================================================================= */}
      <section
        id="faq-directory"
        aria-label="Complete FAQ Questions List"
        className="w-full py-12 sm:py-16 lg:py-20 bg-[#FAF7F5] dark:bg-[#0D0506] transition-colors duration-300 flex-grow"
      >
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-12 space-y-6">
          
          {/* Empty Search State */}
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-14 sm:py-16 rounded-2xl border border-dashed border-[#3A0B10]/20 dark:border-[#3D1418] bg-white/50 dark:bg-[#14080A] p-8 space-y-4">
              <div className="h-12 w-12 rounded-full bg-[#3A0B10]/5 dark:bg-white/5 mx-auto flex items-center justify-center text-[#6C151E] dark:text-[#F0A2B0]">
                <HelpCircle size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-serif font-bold text-[#3A0B10] dark:text-white">
                  No matching questions found
                </h3>
                <p className="text-sm font-sans text-[#16171B]/70 dark:text-[#C4B9B8] max-w-md mx-auto">
                  We couldn&apos;t find any questions matching &ldquo;{searchQuery}&rdquo;.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-sans font-bold bg-[#6C151E] dark:bg-[#2A1014] text-white dark:text-[#F0A2B0] hover:bg-[#4A0D14] dark:hover:bg-[#3A141A] transition-all cursor-pointer shadow-md"
              >
                Reset Search
              </button>
            </div>
          ) : (
            /* Main FAQ Accordion List (Dark Mode: Soft Rose & Pitch-Black Palette) */
            <div className="space-y-4">
              {filteredFaqs.map((item) => {
                const isOpen = !!openItems[item.id];
                const headerId = `faq-btn-${item.id}`;
                const panelId = `faq-panel-${item.id}`;

                return (
                  <motion.div
                    key={item.id}
                    id={item.id}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-30px' }}
                    transition={{ duration: 0.25 }}
                    className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                      isOpen
                        ? 'border-[#6C151E] dark:border-[#F0A2B0]/40 bg-white dark:bg-[#1C0A0D] shadow-md ring-1 ring-[#6C151E]/15 dark:ring-[#F0A2B0]/20'
                        : 'border-[#3A0B10]/15 dark:border-[#2D1014] bg-white/90 dark:bg-[#14080A] hover:border-[#6C151E]/40 dark:hover:border-[#4A151C]'
                    }`}
                  >
                    {/* Accordion Header Row */}
                    <div className="flex items-start justify-between p-4 sm:p-6 gap-3.5">
                      <button
                        type="button"
                        id={headerId}
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={() => toggleFaq(item.id)}
                        className="flex-1 min-w-0 text-left space-y-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C151E] rounded-xl cursor-pointer"
                      >
                        {/* Category Tag */}
                        <div className="flex items-center gap-2">
                          <span className="inline-block px-3 py-1 rounded-md text-xs font-sans font-semibold uppercase bg-[#6C151E]/8 dark:bg-[#261014] text-[#6C151E] dark:text-[#F0A2B0] tracking-wider border border-transparent dark:border-[#3D1418]">
                            {item.category}
                          </span>
                        </div>
                        
                        {/* Question Headline */}
                        <h2 className="text-base sm:text-xl lg:text-2xl font-serif font-bold text-[#2A080D] dark:text-white leading-snug tracking-tight break-words">
                          {item.question}
                        </h2>
                      </button>

                      {/* Right Action Tools: Copy Q&A (Visible only when expanded) + Expand Chevron */}
                      <div className="flex items-center gap-2 shrink-0 pt-0.5">
                        <AnimatePresence>
                          {isOpen && (
                            <motion.button
                              type="button"
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              transition={{ duration: 0.18 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                copyFaqContent(item);
                              }}
                              title="Copy question and answer text"
                              aria-label="Copy question text"
                              className="h-9 sm:h-10 px-3 rounded-xl border border-[#3A0B10]/15 dark:border-[#3D1418] text-xs font-sans font-semibold text-[#16171B]/70 dark:text-[#F0A2B0] hover:text-[#6C151E] dark:hover:text-white hover:bg-[#6C151E]/5 dark:hover:bg-[#240D10] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                            >
                              {copiedId === item.id ? (
                                <>
                                  <Check size={14} className="text-[#6C151E] dark:text-[#F0A2B0]" />
                                  <span className="text-[#6C151E] dark:text-[#F0A2B0] font-bold">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy size={14} />
                                  <span className="hidden sm:inline">Copy Q&amp;A</span>
                                </>
                              )}
                            </motion.button>
                          )}
                        </AnimatePresence>

                        <button
                          type="button"
                          onClick={() => toggleFaq(item.id)}
                          aria-label={isOpen ? 'Collapse answer' : 'Expand answer'}
                          className={`h-9 w-9 sm:h-10 sm:w-10 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                            isOpen
                              ? 'border-[#6C151E] bg-[#6C151E] text-white dark:border-[#F0A2B0] dark:bg-[#F0A2B0] dark:text-[#14080A]'
                              : 'border-[#3A0B10]/20 dark:border-[#3D1418] text-[#3A0B10] dark:text-[#F0A2B0] hover:bg-[#3A0B10]/5 dark:hover:bg-[#240D10]'
                          }`}
                        >
                          {isOpen ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
                        </button>
                      </div>
                    </div>

                    {/* Animated Answer Panel */}
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          id={panelId}
                          role="region"
                          aria-labelledby={headerId}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 sm:px-6 pb-5 pt-1">
                            <div className="p-4 sm:p-5 rounded-xl bg-[#FAF6F0]/80 dark:bg-[#150709] border-l-4 border-[#6C151E] dark:border-[#F0A2B0] text-sm sm:text-base md:text-lg font-sans text-[#2A2120] dark:text-[#C4B9B8] leading-relaxed shadow-xs">

                            {/* Rich rendering tailored for specific answer content */}
                            {item.id === 'faq-02' ? (
                              <div className="space-y-3.5 max-w-4xl">
                                <p className="font-semibold text-base sm:text-lg text-[#3A0B10] dark:text-white">
                                  Planned Schedule &amp; Phase Overview:
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 pt-1">
                                  <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-[#6C151E]/5 to-transparent dark:from-[#240D10] dark:to-[#180C0E] border border-[#6C151E]/20 dark:border-[#3D1418] space-y-1.5">
                                    <div className="text-xs font-sans font-bold text-[#6C151E] dark:text-[#F0A2B0] uppercase tracking-wider">
                                      Online Phase
                                    </div>
                                    <div className="text-lg sm:text-xl font-serif font-bold text-[#3A0B10] dark:text-white">
                                      October 8–10, 2026
                                    </div>
                                    <p className="text-xs sm:text-sm text-[#16171B]/80 dark:text-[#C4B9B8]">
                                      Virtual lectures, algorithmic masterclasses, and online interactive sessions.
                                    </p>
                                  </div>

                                  <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-[#B08D57]/10 to-transparent dark:from-[#240D10] dark:to-[#180C0E] border border-[#B08D57]/30 dark:border-[#3D1418] space-y-1.5">
                                    <div className="text-xs font-sans font-bold text-[#886937] dark:text-[#F0A2B0] uppercase tracking-wider">
                                      Offline Phase
                                    </div>
                                    <div className="text-lg sm:text-xl font-serif font-bold text-[#3A0B10] dark:text-white">
                                      October 26–30, 2026
                                    </div>
                                    <p className="text-xs sm:text-sm text-[#16171B]/80 dark:text-[#C4B9B8]">
                                      Hosted at SRM University-AP campus, Amaravati, Andhra Pradesh, India.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ) : item.id === 'faq-07' ? (
                              <div className="space-y-3.5 max-w-4xl">
                                <p className="font-semibold text-base sm:text-lg text-[#3A0B10] dark:text-white">
                                  The proposed activities at SRM University-AP include:
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 pt-1">
                                  <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#180C0E] border border-[#3A0B10]/15 dark:border-[#3D1418] space-y-1.5">
                                    <h4 className="font-serif font-bold text-[#3A0B10] dark:text-white text-lg sm:text-xl">
                                      Quantum Quiddles
                                    </h4>
                                    <p className="text-xs sm:text-sm text-[#16171B]/85 dark:text-[#C4B9B8]">
                                      An individual quiz-and-riddle competition featuring 20 quantum-themed questions.
                                    </p>
                                  </div>

                                  <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#180C0E] border border-[#3A0B10]/15 dark:border-[#3D1418] space-y-1.5">
                                    <h4 className="font-serif font-bold text-[#3A0B10] dark:text-white text-lg sm:text-xl">
                                      QTalk
                                    </h4>
                                    <p className="text-xs sm:text-sm text-[#16171B]/85 dark:text-[#C4B9B8]">
                                      A 2-minute presentation on a quantum concept or project-related topic.
                                    </p>
                                  </div>

                                  <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#180C0E] border border-[#3A0B10]/15 dark:border-[#3D1418] space-y-1.5">
                                    <h4 className="font-serif font-bold text-[#3A0B10] dark:text-white text-lg sm:text-xl">
                                      Guess the QTech
                                    </h4>
                                    <p className="text-xs sm:text-sm text-[#16171B]/85 dark:text-[#C4B9B8]">
                                      A team-based game involving the identification of quantum technologies through clues.
                                    </p>
                                  </div>

                                  <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#180C0E] border border-[#3A0B10]/15 dark:border-[#3D1418] space-y-1.5">
                                    <h4 className="font-serif font-bold text-[#3A0B10] dark:text-white text-lg sm:text-xl">
                                      Technical Activities
                                    </h4>
                                    <p className="text-xs sm:text-sm text-[#16171B]/85 dark:text-[#C4B9B8]">
                                      Quantum computing challenges and topics such as quantum repeaters and long-distance entanglement.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ) : item.id === 'faq-08' ? (
                              <div className="space-y-3.5 max-w-4xl">
                                <p className="font-semibold text-base sm:text-lg text-[#3A0B10] dark:text-white">
                                  For online activities and hands-on sessions, participants are advised to have:
                                </p>
                                <ul className="space-y-2.5 pt-1">
                                  {[
                                    'A laptop and a stable internet connection.',
                                    'A GitHub account, where required.',
                                    'Basic Python knowledge.',
                                    'Basic knowledge of quantum computing.',
                                    'Familiarity with Qiskit, particularly for advanced technical activities.',
                                  ].map((bullet, bIdx) => (
                                    <li
                                      key={bIdx}
                                      className="flex items-start gap-3 p-3.5 rounded-xl bg-white dark:bg-[#180C0E] border border-[#3A0B10]/10 dark:border-[#3D1418] shadow-xs"
                                    >
                                      <span className="h-2 w-2 rounded-full bg-[#6C151E] dark:bg-[#F0A2B0] shrink-0 mt-2" />
                                      <span className="text-sm sm:text-base font-medium text-[#16171B]/90 dark:text-white">
                                        {bullet}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ) : item.id === 'faq-14' ? (
                              <div className="space-y-3.5 max-w-4xl">
                                <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#6C151E]/10 via-[#3A0B10]/5 to-transparent dark:from-[#240D10] dark:to-[#180C0E] border border-[#6C151E]/30 dark:border-[#3D1418] flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-xs">
                                  <div>
                                    <div className="text-xs font-sans font-bold uppercase tracking-wider text-[#6C151E] dark:text-[#F0A2B0]">
                                      Online Course Registration Fee
                                    </div>
                                    <div className="text-xl sm:text-3xl font-serif font-bold text-[#3A0B10] dark:text-white mt-1">
                                      ₹99 per participant
                                    </div>
                                    <p className="text-xs sm:text-sm text-[#16171B]/80 dark:text-[#C4B9B8] mt-1.5">
                                      The registration fee for the Qiskit Fall Fest 2026 online course is ₹99 per participant.
                                    </p>
                                  </div>
                                  <Link
                                    href="/schedule"
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-sans font-bold bg-[#6C151E] text-white hover:bg-[#8A1B27] dark:bg-[#F0A2B0] dark:text-[#14080A] dark:hover:bg-[#F7B5C1] transition-all shadow-md shrink-0 cursor-pointer"
                                  >
                                    <span>Explore Schedule</span>
                                    <ArrowRight size={16} />
                                  </Link>
                                </div>
                              </div>
                            ) : (
                              <p className="max-w-4xl whitespace-pre-line text-sm sm:text-base md:text-lg">
                                {item.answer}
                              </p>
                            )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* =====================================================================
              SECTION 05: OFFICIAL NOTICE & DISCLAIMER BOX
              ===================================================================== */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl p-7 sm:p-9 bg-gradient-to-br from-white to-[#F5EBE1] dark:from-[#22070A] dark:to-[#180507] border-2 border-[#B08D57]/40 dark:border-[#B08D57]/30 shadow-md space-y-4"
          >
            <div className="flex items-center gap-3 text-[#886937] dark:text-[#B08D57]">
              <Info size={24} className="shrink-0" />
              <span className="font-sans text-xs sm:text-sm font-bold tracking-widest uppercase">
                Official Organizing Committee Notice
              </span>
            </div>

            <p className="text-base sm:text-lg font-sans font-medium text-[#3A0B10] dark:text-[#F5F3F0] leading-relaxed">
              <strong>Note:</strong> {FAQ_META.disclaimer}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs sm:text-sm font-sans text-[#16171B]/75 dark:text-[#C7C8CC]/75">
              <span>Host Institution: <strong>{FAQ_META.host}</strong></span>
              <span>&bull;</span>
              <span>Location: <strong>{FAQ_META.location}</strong></span>
            </div>
          </motion.div>

          {/* =====================================================================
              SECTION 06: CONTACT & SCHEDULE CTA
              ===================================================================== */}
          <div className="rounded-2xl p-8 sm:p-12 bg-[#3A0B10] text-[#F5F3F0] dark:bg-[#150406] border border-[#6C151E]/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <span className="text-xs sm:text-sm font-sans font-bold tracking-widest uppercase text-[#B08D57]">
                Still Have Questions?
              </span>
              <h3 className="text-2xl sm:text-4xl font-serif font-bold text-white leading-tight">
                Connect with the SRMAP Organizing Committee
              </h3>
              <p className="text-sm sm:text-base font-sans text-[#E5E5E7]/80 leading-relaxed">
                Contact the SRMAP Qiskit Fall Fest 2026 organizing committee through the official event communication channels or explore our scheduled tracks.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 shrink-0">
              <Link
                href="/schedule"
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full text-sm font-sans font-bold bg-[#A7192A] hover:bg-[#8A1522] dark:bg-[#B08D57] dark:text-[#13090A] dark:hover:bg-[#C9A268] text-white shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0 border border-white/20 dark:border-[#B08D57]/40"
              >
                <span>Explore Schedule</span>
                <ArrowRight size={18} className="shrink-0" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          GLOBAL FOOTER
          ========================================================================= */}
      <Footer />
    </div>
  );
}

