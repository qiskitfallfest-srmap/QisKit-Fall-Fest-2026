'use client';

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
  Share2,
  Check,
  Filter,
  ArrowRight,
  Info,
  CheckCircle2,
  ExternalLink,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import ParticleDrift from '@/components/schedule/ParticleDrift';
import { Footer } from '@/components/shared/Footer';
import { FlowButton } from '@/components/ui/FlowButton';
import { FAQS_DATA, FAQ_CATEGORIES, FAQ_META, FAQCategory, FAQItem } from '@/data/faqs';
import { REGISTRATION_URL } from '@/lib/constants';

export default function FAQsPageContent() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FAQCategory>('All');

  // Accordion open states
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    'faq-01': true,
    'faq-02': true,
  });

  // Copied link toast state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const isDark = mounted && (theme === 'dark' || resolvedTheme === 'dark');
  const baseColor = isDark ? '#F5DABF' : '#6C151E';
  const accentColor = isDark ? '#E45464' : '#8F2632';

  // Support direct anchor linking on page mount or hash change
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

  // Filter FAQs
  const filteredFaqs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return FAQS_DATA.filter((item) => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesQuery =
        !q ||
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        `q${item.number}`.includes(q) ||
        `${item.number}` === q;

      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, selectedCategory]);

  // Toggle single FAQ
  const toggleFaq = useCallback((id: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  // Expand / Collapse all
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

  // Copy share link for an FAQ
  const copyFaqLink = useCallback((id: string) => {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2200);
    });
  }, []);

  // Top questions for quick highlights
  const topQuestions = useMemo(() => {
    return FAQS_DATA.filter((item) => item.isTopQuestion);
  }, []);

  return (
    <div className="w-full flex flex-col min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[#6C151E] selection:text-[#F5F3F0]">
      {/* =========================================================================
          SECTION 01: HERO WITH PARTICLE DRIFT BACKDROP
          ========================================================================= */}
      <section
        id="faq-hero"
        aria-label="FAQ Hero"
        className="relative w-full border-b border-[#3A0B10]/20 bg-gradient-to-b from-[#F9F5F0] via-[#F5DABF]/20 to-[#F4F0EE] dark:from-[#13090A] dark:via-[#1C0709] dark:to-[#120506] text-[#16171B] dark:text-[#F5F3F0] transition-colors duration-300 overflow-hidden"
      >
        {/* Quantum Particle Engine Backdrop */}
        <div className="absolute inset-0 z-0 opacity-35 sm:opacity-70 dark:opacity-30 dark:sm:opacity-65 overflow-hidden pointer-events-auto">
          <ParticleDrift
            baseColor={baseColor}
            accentColor={accentColor}
            density={isMobile ? 40 : 80}
            dotSize={isMobile ? 6 : 9}
            hover={isMobile ? 70 : 140}
          />
        </div>

        {/* Ambient glows and orbital geometry */}
        <div className="absolute inset-0 pointer-events-none opacity-25 dark:opacity-15 z-0">
          <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full border border-[#6C151E]/25" />
          <div className="absolute -top-16 -left-16 w-[450px] h-[450px] rounded-full border border-dashed border-[#6C151E]/20" />
          <div className="absolute top-1/2 right-0 w-[550px] h-[550px] rounded-full bg-gradient-to-bl from-[#B08D57]/20 to-transparent blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-12 pt-16 sm:pt-20 lg:pt-24 pb-14 sm:pb-16 lg:pb-20">
          <div className="max-w-4xl space-y-6 sm:space-y-8">
            {/* Metadata Pills: Host & Location */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-wrap items-center gap-2.5 sm:gap-3"
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-mono font-bold tracking-[0.2em] uppercase bg-[#B08D57]/15 text-[#886937] dark:text-[#B08D57] border border-[#B08D57]/30 shadow-xs">
                <HelpCircle size={13} className="text-[#886937] dark:text-[#B08D57]" />
                KNOWLEDGE BASE
              </span>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-mono font-semibold bg-[#3A0B10]/5 dark:bg-white/10 text-[#3A0B10] dark:text-[#F5F3F0] border border-[#3A0B10]/15 dark:border-white/15">
                <Building2 size={13} className="text-[#6C151E] dark:text-[#B08D57]" />
                <span>Host: <strong className="font-bold">{FAQ_META.host}</strong></span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-mono font-semibold bg-[#3A0B10]/5 dark:bg-white/10 text-[#3A0B10] dark:text-[#F5F3F0] border border-[#3A0B10]/15 dark:border-white/15">
                <MapPin size={13} className="text-[#6C151E] dark:text-[#B08D57]" />
                <span>Location: <strong className="font-bold">{FAQ_META.location}</strong></span>
              </div>
            </motion.div>

            {/* Headline */}
            <div className="space-y-3">
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif font-bold tracking-tight text-[#3A0B10] dark:text-[#F5F3F0] leading-[1.08]"
              >
                Qiskit Fall Fest 2026 Frequently Asked Questions (FAQ)
                <span className="text-[#6C151E] dark:text-[#B08D57]">.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-base sm:text-lg md:text-xl font-sans font-medium text-[#6C151E] dark:text-[#B08D57] max-w-3xl"
              >
                Comprehensive answers regarding eligibility, schedules, technical activities, prerequisites, registration fees, and campus logistics.
              </motion.p>
            </div>

            {/* Editorial Status Line */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="pt-2 flex flex-wrap items-center gap-3 text-xs font-mono text-[#16171B]/70 dark:text-[#C7C8CC]/70"
            >
              <span className="h-px w-10 bg-[#3A0B10]/20 dark:bg-[#F5F3F0]/20" />
              <span className="font-semibold">{FAQS_DATA.length} Official Questions</span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#6C151E] dark:bg-[#B08D57]" />
              <span>IBM Quantum Partnership</span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#6C151E] dark:bg-[#B08D57]" />
              <span>SRM University-AP Host</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 02: KEY METRICS STRIP
          ========================================================================= */}
      <section
        id="faq-stats"
        aria-label="FAQ Highlights"
        className="relative w-full bg-[#13090A] text-[#FAF7F3] border-t border-[#6C151E]/30 py-6 sm:py-8 shadow-2xl isolate overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#4A0D14]/40 via-[#13090A] to-[#4A0D14]/40 pointer-events-none" />

        <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:divide-x lg:divide-[#6C151E]/35">
            <div className="flex flex-col items-start lg:px-6 first:lg:pl-0">
              <div className="flex items-center gap-2 mb-1 text-[#BEB5B4]">
                <div className="p-1 rounded bg-[#6C151E]/30 text-[#F5DABF]">
                  <HelpCircle size={14} />
                </div>
                <span className="font-mono text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase">
                  Directory Scope
                </span>
              </div>
              <div className="font-serif text-2xl sm:text-3xl font-bold text-[#FAF7F3]">
                15 Questions
              </div>
              <span className="text-[11px] font-mono text-[#BEB5B4]/70 mt-0.5">
                Full festival guide
              </span>
            </div>

            <div className="flex flex-col items-start lg:px-6">
              <div className="flex items-center gap-2 mb-1 text-[#BEB5B4]">
                <div className="p-1 rounded bg-[#6C151E]/30 text-[#F5DABF]">
                  <Calendar size={14} />
                </div>
                <span className="font-mono text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase">
                  Event Phases
                </span>
              </div>
              <div className="font-serif text-xl sm:text-2xl font-bold text-[#FAF7F3]">
                Oct 5–9 & 26–30
              </div>
              <span className="text-[11px] font-mono text-[#BEB5B4]/70 mt-0.5">
                Online & Offline tracks
              </span>
            </div>

            <div className="flex flex-col items-start lg:px-6">
              <div className="flex items-center gap-2 mb-1 text-[#BEB5B4]">
                <div className="p-1 rounded bg-[#6C151E]/30 text-[#F5DABF]">
                  <Sparkles size={14} />
                </div>
                <span className="font-mono text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase">
                  Online Course
                </span>
              </div>
              <div className="font-serif text-2xl sm:text-3xl font-bold text-[#FAF7F3]">
                ₹99 Fee
              </div>
              <span className="text-[11px] font-mono text-[#BEB5B4]/70 mt-0.5">
                Per participant course fee
              </span>
            </div>

            <div className="flex flex-col items-start lg:px-6 last:lg:pr-0">
              <div className="flex items-center gap-2 mb-1 text-[#BEB5B4]">
                <div className="p-1 rounded bg-[#6C151E]/30 text-[#F5DABF]">
                  <MapPin size={14} />
                </div>
                <span className="font-mono text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase">
                  Offline Venue
                </span>
              </div>
              <div className="font-serif text-xl sm:text-2xl font-bold text-[#FAF7F3]">
                SRM University-AP
              </div>
              <span className="text-[11px] font-mono text-[#BEB5B4]/70 mt-0.5">
                Amaravati, Andhra Pradesh
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 03: TOP QUESTIONS SPOTLIGHT (EDITORIAL CARDS)
          ========================================================================= */}
      <section
        id="faq-top-questions"
        aria-label="Top Inquiries"
        className="w-full py-12 sm:py-16 bg-white dark:bg-[#1E0507] border-b border-[#3A0B10]/15 dark:border-[#F5F3F0]/10 transition-colors duration-300"
      >
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-12 space-y-6 sm:space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#3A0B10]/10 dark:border-[#F5F3F0]/10">
            <div className="space-y-1">
              <span className="text-xs font-mono font-semibold tracking-[0.2em] uppercase text-[#6C151E] dark:text-[#B08D57]">
                02 • Primary Inquiries
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#3A0B10] dark:text-[#F5F3F0]">
                Key Highlights at a Glance<span className="text-[#6C151E] dark:text-[#B08D57]">.</span>
              </h2>
            </div>
            <p className="text-xs font-mono text-[#16171B]/60 dark:text-[#C7C8CC]/70 max-w-md">
              Fast answers to festival overview, official dates, proposed events, and course registration.
            </p>
          </div>

          {/* Grid of Top 4 Inquiries */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {topQuestions.map((item) => {
              const isOpen = !!openItems[item.id];
              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col justify-between ${
                    isOpen
                      ? 'border-[#6C151E] dark:border-[#B08D57] bg-[#FAF9F6] dark:bg-[#28070B] shadow-md ring-1 ring-[#6C151E]/20 dark:ring-[#B08D57]/20'
                      : 'border-[#3A0B10]/15 dark:border-[#F5F3F0]/15 bg-[#FAF9F6]/60 dark:bg-[#220609] hover:border-[#3A0B10]/40'
                  }`}
                >
                  <div className="p-5 sm:p-6 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase bg-[#B08D57]/20 text-[#886937] dark:text-[#B08D57]">
                          Q{item.number < 10 ? `0${item.number}` : item.number}
                        </span>
                        <span className="text-[11px] font-mono uppercase tracking-wider text-[#6C151E] dark:text-[#B08D57] font-semibold">
                          {item.category}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyFaqLink(item.id)}
                        title="Copy direct link"
                        className="p-1 rounded-md text-[#16171B]/40 hover:text-[#3A0B10] dark:text-[#C7C8CC]/40 dark:hover:text-white transition-colors cursor-pointer"
                      >
                        {copiedId === item.id ? (
                          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                            <Check size={12} /> Copied!
                          </span>
                        ) : (
                          <Share2 size={13} />
                        )}
                      </button>
                    </div>

                    <h3 className="text-base sm:text-lg font-serif font-bold text-[#3A0B10] dark:text-[#F5F3F0] leading-snug">
                      {item.question}
                    </h3>

                    <div className="text-xs sm:text-sm font-sans text-[#16171B]/80 dark:text-[#C7C8CC] leading-relaxed pt-1">
                      {item.id === 'faq-02' ? (
                        <div className="space-y-1.5 p-3 rounded-lg bg-[#3A0B10]/5 dark:bg-white/5 border border-[#3A0B10]/10 dark:border-white/10">
                          <p className="font-semibold text-[#3A0B10] dark:text-[#F5F3F0]">Planned Schedule:</p>
                          <div className="flex flex-col gap-1 text-[11px] font-mono">
                            <span className="text-[#6C151E] dark:text-[#B08D57]">
                              • Online Phase: <strong>October 5–9, 2026</strong>
                            </span>
                            <span className="text-[#6C151E] dark:text-[#B08D57]">
                              • Offline Phase: <strong>October 26–30, 2026</strong>
                            </span>
                          </div>
                        </div>
                      ) : item.id === 'faq-07' ? (
                        <div className="space-y-1.5">
                          <p className="font-medium text-[#3A0B10] dark:text-[#F5F3F0]">Proposed activities at SRM University-AP:</p>
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono pt-1">
                            <li className="p-2 rounded bg-[#3A0B10]/5 dark:bg-white/5 border border-[#3A0B10]/10 dark:border-white/10">
                              <span className="font-bold text-[#6C151E] dark:text-[#B08D57]">Quantum Quiddles</span>
                              <p className="text-[10px] text-[#16171B]/70 dark:text-[#C7C8CC]/70">20 quantum-themed riddles & quiz</p>
                            </li>
                            <li className="p-2 rounded bg-[#3A0B10]/5 dark:bg-white/5 border border-[#3A0B10]/10 dark:border-white/10">
                              <span className="font-bold text-[#6C151E] dark:text-[#B08D57]">QTalk</span>
                              <p className="text-[10px] text-[#16171B]/70 dark:text-[#C7C8CC]/70">2-minute quantum presentation</p>
                            </li>
                            <li className="p-2 rounded bg-[#3A0B10]/5 dark:bg-white/5 border border-[#3A0B10]/10 dark:border-white/10">
                              <span className="font-bold text-[#6C151E] dark:text-[#B08D57]">Guess the QTech</span>
                              <p className="text-[10px] text-[#16171B]/70 dark:text-[#C7C8CC]/70">Team tech identification game</p>
                            </li>
                            <li className="p-2 rounded bg-[#3A0B10]/5 dark:bg-white/5 border border-[#3A0B10]/10 dark:border-white/10">
                              <span className="font-bold text-[#6C151E] dark:text-[#B08D57]">Technical Activities</span>
                              <p className="text-[10px] text-[#16171B]/70 dark:text-[#C7C8CC]/70">Repeaters & entanglement tracks</p>
                            </li>
                          </ul>
                        </div>
                      ) : item.id === 'faq-14' ? (
                        <div className="p-3 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between gap-3">
                          <div>
                            <span className="text-xs font-mono font-bold text-emerald-800 dark:text-emerald-300">
                              Registration Fee: ₹99 per participant
                            </span>
                            <p className="text-[11px] text-[#16171B]/70 dark:text-[#C7C8CC]/70 mt-0.5">
                              For the Qiskit Fall Fest 2026 online course.
                            </p>
                          </div>
                          <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-emerald-600 text-white shrink-0">
                            ₹99
                          </span>
                        </div>
                      ) : (
                        <p>{item.answer}</p>
                      )}
                    </div>
                  </div>

                  <div className="px-5 sm:px-6 pb-4 pt-2 border-t border-[#3A0B10]/10 dark:border-[#F5F3F0]/10 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        toggleFaq(item.id);
                        const el = document.getElementById(item.id);
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }}
                      className="text-xs font-mono font-bold text-[#6C151E] dark:text-[#B08D57] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>View in full directory</span>
                      <ArrowRight size={13} />
                    </button>
                    <span className="text-[11px] font-mono text-[#16171B]/50 dark:text-[#C7C8CC]/50">
                      Item #{item.number}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 04: SEARCH & CATEGORY FILTER CONTROL BAR
          ========================================================================= */}
      <section
        id="faq-search-filter"
        aria-label="Search and Filter Controls"
        className="sticky top-[var(--navbar-height,78px)] z-30 w-full py-4 sm:py-5 bg-[#F5F3F0]/95 dark:bg-[#1A0507]/95 backdrop-blur-md border-y border-[#3A0B10]/15 dark:border-[#F5F3F0]/15 shadow-sm transition-colors duration-300"
      >
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-12 space-y-3 sm:space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold tracking-wider uppercase text-[#6C151E] dark:text-[#B08D57] flex items-center gap-1.5">
                <Filter size={13} />
                <span>Search & Filter:</span>
              </span>
              <span className="text-xs font-mono text-[#16171B]/60 dark:text-[#C7C8CC]/60">
                ({filteredFaqs.length} of {FAQS_DATA.length} matching)
              </span>
            </div>

            {/* Quick Action: Expand/Collapse All */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium border border-[#3A0B10]/20 dark:border-[#F5F3F0]/20 bg-white/80 dark:bg-black/30 hover:bg-[#3A0B10]/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                {areAllExpanded ? (
                  <>
                    <Minimize2 size={13} />
                    <span>Collapse All</span>
                  </>
                ) : (
                  <>
                    <Maximize2 size={13} />
                    <span>Expand All</span>
                  </>
                )}
              </button>

              {(searchQuery || selectedCategory !== 'All') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                  className="px-2.5 py-1.5 text-xs font-mono text-[#6C151E] dark:text-[#B08D57] hover:underline cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Search Input Bar */}
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#16171B]/50 dark:text-[#C7C8CC]/50">
              <Search size={16} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keywords (e.g. ₹99, October dates, Python, certificate, Quiddles, Amaravati)..."
              aria-label="Search all FAQs"
              className="w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-xl border border-[#3A0B10]/20 dark:border-[#F5F3F0]/20 bg-white dark:bg-[#25070A] text-xs sm:text-sm font-sans text-[#16171B] dark:text-[#F5F3F0] placeholder-[#16171B]/40 dark:placeholder-[#C7C8CC]/40 focus:outline-none focus:ring-2 focus:ring-[#6C151E] dark:focus:ring-[#B08D57] transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search text"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#16171B]/50 dark:text-[#C7C8CC]/50 hover:text-[#3A0B10] dark:hover:text-white cursor-pointer"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Category Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-1">
            {FAQ_CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#3A0B10] text-[#F5F3F0] dark:bg-[#B08D57] dark:text-[#1A0507] shadow-sm scale-[1.02]'
                      : 'bg-white/80 dark:bg-[#28070B] text-[#16171B]/75 dark:text-[#C7C8CC] border border-[#3A0B10]/15 dark:border-[#F5F3F0]/15 hover:border-[#3A0B10]/40 dark:hover:border-white/30'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 05: FULL 15-ITEM FAQ DIRECTORY (ACCORDION)
          ========================================================================= */}
      <section
        id="faq-directory"
        aria-label="Complete FAQ Directory"
        className="w-full py-12 sm:py-16 lg:py-20 bg-[#FAF9F6] dark:bg-[#1A0507] transition-colors duration-300 flex-grow"
      >
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-12 space-y-6 sm:space-y-8">
          <div className="flex items-center justify-between pb-3 border-b border-[#3A0B10]/10 dark:border-[#F5F3F0]/10">
            <span className="text-xs font-mono font-semibold tracking-widest uppercase text-[#6C151E] dark:text-[#B08D57]">
              04 • Comprehensive Directory ({filteredFaqs.length} of {FAQS_DATA.length} Questions)
            </span>
            <span className="text-xs font-mono text-[#16171B]/50 dark:text-[#C7C8CC]/50">
              Click any question to expand
            </span>
          </div>

          {/* Empty State */}
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-16 sm:py-20 rounded-2xl border border-dashed border-[#3A0B10]/20 dark:border-[#F5F3F0]/20 bg-white/50 dark:bg-black/20 p-8 space-y-4">
              <div className="h-12 w-12 rounded-full bg-[#3A0B10]/5 dark:bg-white/5 mx-auto flex items-center justify-center text-[#6C151E] dark:text-[#B08D57]">
                <HelpCircle size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-serif font-bold text-[#3A0B10] dark:text-[#F5F3F0]">
                  No matching questions found
                </h3>
                <p className="text-xs font-sans text-[#16171B]/70 dark:text-[#C7C8CC]/70 max-w-md mx-auto">
                  We couldn&apos;t find any questions matching &ldquo;{searchQuery}&rdquo; in the selected category.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-mono font-bold bg-[#3A0B10] text-[#F5F3F0] hover:bg-[#6C151E] transition-all cursor-pointer"
              >
                Reset Search & Filters
              </button>
            </div>
          ) : (
            /* Main FAQ Accordion List */
            <div className="space-y-3.5">
              {filteredFaqs.map((item) => {
                const isOpen = !!openItems[item.id];
                const headerId = `faq-btn-${item.id}`;
                const panelId = `faq-panel-${item.id}`;

                return (
                  <motion.div
                    key={item.id}
                    id={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                      isOpen
                        ? 'border-[#6C151E] dark:border-[#B08D57] bg-white dark:bg-[#25070A] shadow-md ring-1 ring-[#6C151E]/15 dark:ring-[#B08D57]/20'
                        : 'border-[#3A0B10]/15 dark:border-[#F5F3F0]/15 bg-white/70 dark:bg-[#200508] hover:border-[#3A0B10]/35 dark:hover:border-white/25'
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex items-center justify-between p-4 sm:p-6 gap-3">
                      <button
                        type="button"
                        id={headerId}
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={() => toggleFaq(item.id)}
                        className="flex-1 text-left flex items-start gap-3 sm:gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C151E] rounded-xl cursor-pointer"
                      >
                        {/* Number Badge */}
                        <span className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold shrink-0 mt-0.5 transition-colors ${
                          isOpen
                            ? 'bg-[#3A0B10] text-white dark:bg-[#B08D57] dark:text-[#1A0507]'
                            : 'bg-[#3A0B10]/10 text-[#3A0B10] dark:bg-white/10 dark:text-[#F5F3F0]'
                        }`}>
                          {item.number < 10 ? `0${item.number}` : item.number}
                        </span>

                        <div className="space-y-1.5 pr-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#6C151E]/10 dark:bg-[#6C151E]/30 text-[#6C151E] dark:text-[#E5E5E7]">
                              {item.category}
                            </span>
                            {item.isTopQuestion && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#B08D57]/15 text-[#886937] dark:text-[#B08D57]">
                                Popular
                              </span>
                            )}
                          </div>
                          <h3 className="text-base sm:text-lg lg:text-xl font-serif font-bold text-[#3A0B10] dark:text-[#F5F3F0] leading-snug">
                            {item.question}
                          </h3>
                        </div>
                      </button>

                      {/* Right action tools: Share + Expand chevron */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => copyFaqLink(item.id)}
                          title="Copy link to this question"
                          aria-label={`Copy link to question ${item.number}`}
                          className="p-2 rounded-lg border border-[#3A0B10]/10 dark:border-[#F5F3F0]/10 text-[#16171B]/50 hover:text-[#3A0B10] dark:text-[#C7C8CC]/50 dark:hover:text-white hover:bg-[#3A0B10]/5 dark:hover:bg-white/5 transition-all cursor-pointer"
                        >
                          {copiedId === item.id ? (
                            <Check size={14} className="text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Share2 size={14} />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleFaq(item.id)}
                          aria-label={isOpen ? 'Collapse answer' : 'Expand answer'}
                          className={`h-9 w-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                            isOpen
                              ? 'border-[#6C151E] bg-[#6C151E] text-white dark:border-[#B08D57] dark:bg-[#B08D57] dark:text-[#1A0507]'
                              : 'border-[#3A0B10]/15 dark:border-[#F5F3F0]/15 text-[#3A0B10] dark:text-[#F5F3F0] hover:bg-[#3A0B10]/5 dark:hover:bg-white/5'
                          }`}
                        >
                          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
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
                          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 sm:px-6 pb-6 pt-3 text-sm sm:text-base font-sans text-[#16171B]/85 dark:text-[#C7C8CC] leading-relaxed border-t border-[#3A0B10]/10 dark:border-[#F5F3F0]/10">
                            
                            {/* Rich rendering tailored for specific answer content */}
                            {item.id === 'faq-02' ? (
                              <div className="space-y-4 max-w-4xl">
                                <p className="font-medium text-[#3A0B10] dark:text-[#F5F3F0]">
                                  Planned schedule:
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                  <div className="p-4 rounded-xl bg-gradient-to-br from-[#3A0B10]/5 to-transparent dark:from-white/5 dark:to-transparent border border-[#3A0B10]/15 dark:border-white/10 space-y-1">
                                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#6C151E] dark:text-[#B08D57] uppercase tracking-wider">
                                      <Calendar size={14} />
                                      <span>Online Phase</span>
                                    </div>
                                    <div className="text-base sm:text-lg font-serif font-bold text-[#3A0B10] dark:text-[#F5F3F0]">
                                      October 5–9, 2026
                                    </div>
                                    <p className="text-xs text-[#16171B]/70 dark:text-[#C7C8CC]/70">
                                      Virtual lectures, algorithmic masterclasses, and online interactive sessions.
                                    </p>
                                  </div>

                                  <div className="p-4 rounded-xl bg-gradient-to-br from-[#B08D57]/10 to-transparent dark:from-[#B08D57]/15 dark:to-transparent border border-[#B08D57]/30 dark:border-[#B08D57]/20 space-y-1">
                                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#886937] dark:text-[#B08D57] uppercase tracking-wider">
                                      <Building2 size={14} />
                                      <span>Offline Phase</span>
                                    </div>
                                    <div className="text-base sm:text-lg font-serif font-bold text-[#3A0B10] dark:text-[#F5F3F0]">
                                      October 26–30, 2026
                                    </div>
                                    <p className="text-xs text-[#16171B]/70 dark:text-[#C7C8CC]/70">
                                      Hosted at SRM University-AP campus, Amaravati, Andhra Pradesh, India.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ) : item.id === 'faq-07' ? (
                              <div className="space-y-4 max-w-4xl">
                                <p className="font-medium text-[#3A0B10] dark:text-[#F5F3F0]">
                                  The proposed activities include:
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                  <div className="p-4 rounded-xl bg-[#FAF9F6] dark:bg-[#2A080C] border border-[#3A0B10]/15 dark:border-white/10 space-y-1.5 hover:border-[#6C151E]/40 transition-colors">
                                    <div className="flex items-center justify-between">
                                      <h4 className="font-serif font-bold text-[#3A0B10] dark:text-[#F5F3F0] text-base">
                                        Quantum Quiddles
                                      </h4>
                                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#6C151E]/10 dark:bg-white/10 text-[#6C151E] dark:text-[#B08D57]">
                                        Individual Quiz
                                      </span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-[#16171B]/75 dark:text-[#C7C8CC]">
                                      An individual quiz-and-riddle competition featuring 20 quantum-themed questions.
                                    </p>
                                  </div>

                                  <div className="p-4 rounded-xl bg-[#FAF9F6] dark:bg-[#2A080C] border border-[#3A0B10]/15 dark:border-white/10 space-y-1.5 hover:border-[#6C151E]/40 transition-colors">
                                    <div className="flex items-center justify-between">
                                      <h4 className="font-serif font-bold text-[#3A0B10] dark:text-[#F5F3F0] text-base">
                                        QTalk
                                      </h4>
                                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#6C151E]/10 dark:bg-white/10 text-[#6C151E] dark:text-[#B08D57]">
                                        Presentation
                                      </span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-[#16171B]/75 dark:text-[#C7C8CC]">
                                      A 2-minute presentation on a quantum concept or project-related topic.
                                    </p>
                                  </div>

                                  <div className="p-4 rounded-xl bg-[#FAF9F6] dark:bg-[#2A080C] border border-[#3A0B10]/15 dark:border-white/10 space-y-1.5 hover:border-[#6C151E]/40 transition-colors">
                                    <div className="flex items-center justify-between">
                                      <h4 className="font-serif font-bold text-[#3A0B10] dark:text-[#F5F3F0] text-base">
                                        Guess the QTech
                                      </h4>
                                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#6C151E]/10 dark:bg-white/10 text-[#6C151E] dark:text-[#B08D57]">
                                        Team Game
                                      </span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-[#16171B]/75 dark:text-[#C7C8CC]">
                                      A team-based game involving the identification of quantum technologies through clues.
                                    </p>
                                  </div>

                                  <div className="p-4 rounded-xl bg-[#FAF9F6] dark:bg-[#2A080C] border border-[#3A0B10]/15 dark:border-white/10 space-y-1.5 hover:border-[#6C151E]/40 transition-colors">
                                    <div className="flex items-center justify-between">
                                      <h4 className="font-serif font-bold text-[#3A0B10] dark:text-[#F5F3F0] text-base">
                                        Technical Activities
                                      </h4>
                                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#6C151E]/10 dark:bg-white/10 text-[#6C151E] dark:text-[#B08D57]">
                                        Challenges
                                      </span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-[#16171B]/75 dark:text-[#C7C8CC]">
                                      Quantum computing challenges and topics such as quantum repeaters and long-distance entanglement.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ) : item.id === 'faq-08' ? (
                              <div className="space-y-4 max-w-4xl">
                                <p className="font-medium text-[#3A0B10] dark:text-[#F5F3F0]">
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
                                      className="flex items-start gap-3 p-3 rounded-xl bg-[#FAF9F6] dark:bg-white/5 border border-[#3A0B10]/10 dark:border-white/10"
                                    >
                                      <CheckCircle2
                                        size={18}
                                        className="text-[#6C151E] dark:text-[#B08D57] shrink-0 mt-0.5"
                                      />
                                      <span className="text-xs sm:text-sm font-medium text-[#16171B]/90 dark:text-[#F5F3F0]">
                                        {bullet}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ) : item.id === 'faq-14' ? (
                              <div className="space-y-3 max-w-4xl">
                                <div className="p-5 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                  <div>
                                    <div className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                                      Online Course Registration Fee
                                    </div>
                                    <div className="text-2xl sm:text-3xl font-serif font-bold text-emerald-950 dark:text-emerald-100 mt-1">
                                      ₹99 per participant
                                    </div>
                                    <p className="text-xs sm:text-sm text-[#16171B]/80 dark:text-[#C7C8CC]/80 mt-1.5">
                                      The registration fee for the Qiskit Fall Fest 2026 online course is ₹99 per participant. Participants can register by following the official registration instructions provided by the organizing committee.
                                    </p>
                                  </div>
                                  <a
                                    href={REGISTRATION_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono font-bold bg-emerald-700 text-white hover:bg-emerald-800 transition-colors shadow-sm shrink-0 cursor-pointer"
                                  >
                                    <span>Register on Unstop</span>
                                    <ExternalLink size={14} />
                                  </a>
                                </div>
                              </div>
                            ) : (
                              <p className="max-w-4xl whitespace-pre-line">
                                {item.answer}
                              </p>
                            )}

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
              SECTION 06: OFFICIAL NOTICE & DISCLAIMER BOX
              ===================================================================== */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-[#FAF9F6] to-[#F5EBE1] dark:from-[#24080B] dark:to-[#180507] border-2 border-[#B08D57]/40 dark:border-[#B08D57]/30 shadow-md space-y-3"
          >
            <div className="flex items-center gap-2.5 text-[#886937] dark:text-[#B08D57]">
              <Info size={20} className="shrink-0" />
              <span className="font-mono text-xs font-bold tracking-[0.18em] uppercase">
                Official Organizing Committee Notice
              </span>
            </div>

            <p className="text-sm sm:text-base font-sans font-medium text-[#3A0B10] dark:text-[#F5F3F0] leading-relaxed">
              <strong>Note:</strong> {FAQ_META.disclaimer}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-mono text-[#16171B]/70 dark:text-[#C7C8CC]/70">
              <span>Host Institution: <strong>{FAQ_META.host}</strong></span>
              <span>•</span>
              <span>Location: <strong>{FAQ_META.location}</strong></span>
              <span>•</span>
              <a
                href="https://events.srmap.edu.in/event/qiskit-fall-fest-2026/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6C151E] dark:text-[#B08D57] underline hover:opacity-80 inline-flex items-center gap-1 font-semibold"
              >
                Official Event Announcements
                <ExternalLink size={12} />
              </a>
            </div>
          </motion.div>

          {/* =====================================================================
              SECTION 07: CONTACT & REGISTRATION CALL TO ACTION
              ===================================================================== */}
          <div className="rounded-2xl p-8 sm:p-10 bg-[#3A0B10] text-[#F5F3F0] dark:bg-[#150406] border border-[#6C151E]/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#B08D57]">
                Still Have Questions?
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white leading-tight">
                Connect with the SRMAP Organizing Committee
              </h3>
              <p className="text-xs sm:text-sm font-sans text-[#E5E5E7]/80 leading-relaxed">
                Contact the SRMAP Qiskit Fall Fest 2026 organizing committee through the official event communication channels or explore our scheduled tracks.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/schedule"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-xs font-mono font-bold border border-white/30 text-white hover:bg-white/10 transition-colors"
              >
                <Calendar size={14} />
                <span>Explore Schedule</span>
              </Link>

              <FlowButton
                text="Official Registration"
                href={REGISTRATION_URL}
                target="_blank"
                rel="noopener noreferrer"
                variant="burgundy"
                className="!py-3 !px-6 text-xs font-mono font-bold shadow-md"
              />
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
