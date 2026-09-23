'use client';

import * as React from 'react';
import {
  Search,
  X,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Layers,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { Footer } from '@/components/shared/Footer';
import { FAQS_DATA, FAQ_CATEGORIES, FAQCategory, FAQItem } from '@/data/faqs';

export default function FAQsPage() {
  // Search query state
  const [searchQuery, setSearchQuery] = React.useState('');

  // Selected category filter state
  const [selectedCategory, setSelectedCategory] = React.useState<FAQCategory>('All');

  // Top Questions expanded state (allows multiple open)
  const [topQuestionsOpen, setTopQuestionsOpen] = React.useState<Record<string, boolean>>({
    'faq-01': true, // Open the first top question by default for visual guidance
  });

  // Main FAQ List expanded state (allows multiple open)
  const [mainFaqsOpen, setMainFaqsOpen] = React.useState<Record<string, boolean>>({});

  // Curated top questions
  const topQuestions = React.useMemo(() => {
    return FAQS_DATA.filter((item) => item.isTopQuestion);
  }, []);

  // Filtered FAQs for Section 04
  const filteredFaqs = React.useMemo(() => {
    return FAQS_DATA.filter((item) => {
      // Category match
      const matchesCategory =
        selectedCategory === 'All' || item.category === selectedCategory;

      // Search match (question or answer)
      const query = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !query ||
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);

      return matchesCategory && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  // Toggle handlers
  const toggleTopQuestion = (id: string) => {
    setTopQuestionsOpen((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleMainFaq = (id: string) => {
    setMainFaqsOpen((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
  };

  return (
    <div className="w-full flex flex-col min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[#6C151E] selection:text-[#F5F3F0]">
      
      {/* ─────────────────────────────────────────────────────────────
          SECTION 01: HERO
          Premium editorial FAQ introduction
          ───────────────────────────────────────────────────────────── */}
      <section
        id="section-01-hero"
        aria-label="FAQ Hero"
        className="relative w-full border-b border-[#3A0B10]/20 bg-[#F5F3F0] dark:bg-[#22070A] text-[#16171B] dark:text-[#F5F3F0] transition-colors duration-300 overflow-hidden"
      >
        {/* Subtle background orbital geometry */}
        <div className="absolute inset-0 pointer-events-none opacity-25 dark:opacity-15">
          <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full border border-[#6C151E]/25" />
          <div className="absolute -top-16 -left-16 w-[450px] h-[450px] rounded-full border border-dashed border-[#6C151E]/20" />
          <div className="absolute top-1/2 right-0 w-[550px] h-[550px] rounded-full bg-gradient-to-bl from-[#B08D57]/20 to-transparent blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-12 pt-16 sm:pt-20 lg:pt-24 pb-16 sm:pb-20 lg:pb-24">
          
          <div className="max-w-3xl space-y-6 sm:space-y-8">
            
            {/* Small uppercase section label */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-[0.2em] uppercase bg-[#B08D57]/15 text-[#886937] dark:text-[#B08D57] border border-[#B08D57]/30">
                <HelpCircle size={13} className="text-[#886937] dark:text-[#B08D57]" />
                KNOWLEDGE BASE
              </span>
              <span className="text-xs font-mono text-[#16171B]/60 dark:text-[#C7C8CC]/60 tracking-wider">
                SRM UNIVERSITY-AP × IBM QISKIT
              </span>
            </div>

            {/* Large serif headline */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-serif font-bold tracking-tight text-[#3A0B10] dark:text-[#F5F3F0] leading-[1.06]">
                Frequently Asked Questions<span className="text-[#6C151E] dark:text-[#B08D57]">.</span>
              </h1>
              <p className="text-lg sm:text-xl font-sans font-medium text-[#6C151E] dark:text-[#B08D57]">
                Clear guidance on attendance, quantum credentials, algorithmic tracks, and logistics.
              </p>
            </div>

            {/* Concise supporting text */}
            <p className="text-base sm:text-lg font-sans text-[#16171B]/80 dark:text-[#E5E5E7]/80 leading-relaxed font-light">
              Everything you need to know before arriving on campus. Browse curated top questions below or search across all event domains.
            </p>

            {/* Restrained technical accent */}
            <div className="pt-2 flex items-center gap-3 text-xs font-mono text-[#16171B]/60 dark:text-[#C7C8CC]/60">
              <span className="h-px w-12 bg-[#3A0B10]/20 dark:bg-[#F5F3F0]/20" />
              <span>{FAQS_DATA.length} Verified Answers</span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#6C151E] dark:bg-[#B08D57]" />
              <span>Updated for 2026 Cohort</span>
            </div>

          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 02: TOP QUESTIONS
          Curated essential inquiries in an editorial accordion
          ───────────────────────────────────────────────────────────── */}
      <section
        id="section-02-top-questions"
        aria-label="Top Questions"
        className="w-full py-14 sm:py-16 lg:py-20 bg-white dark:bg-[#1E0507] border-b border-[#3A0B10]/15 dark:border-[#F5F3F0]/10 transition-colors duration-300"
      >
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-12 space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#3A0B10]/10 dark:border-[#F5F3F0]/10">
            <div className="space-y-1">
              <span className="text-xs font-mono font-semibold tracking-[0.2em] uppercase text-[#6C151E] dark:text-[#B08D57]">
                02 • Primary Inquiries
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#3A0B10] dark:text-[#F5F3F0]">
                Top Questions<span className="text-[#6C151E] dark:text-[#B08D57]">.</span>
              </h2>
            </div>
            <p className="text-xs font-mono text-[#16171B]/60 dark:text-[#C7C8CC]/70 max-w-sm">
              The four most frequent questions regarding eligibility, registration, and participation.
            </p>
          </div>

          {/* Curated Top Questions Accordion List */}
          <div className="space-y-4">
            {topQuestions.map((item, idx) => {
              const isOpen = !!topQuestionsOpen[item.id];
              const headerId = `top-question-btn-${item.id}`;
              const panelId = `top-question-panel-${item.id}`;

              return (
                <div
                  key={item.id}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? 'border-[#6C151E] dark:border-[#B08D57] bg-[#FAF9F6] dark:bg-[#28070B] shadow-sm'
                      : 'border-[#3A0B10]/15 dark:border-[#F5F3F0]/15 bg-[#FAF9F6]/60 dark:bg-[#220609] hover:border-[#3A0B10]/35'
                  }`}
                >
                  <button
                    type="button"
                    id={headerId}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggleTopQuestion(item.id)}
                    className="w-full text-left p-5 sm:p-6 flex items-start justify-between gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C151E] dark:focus-visible:ring-[#B08D57] rounded-2xl cursor-pointer"
                  >
                    <div className="flex items-start gap-3 sm:gap-5">
                      <span className="px-2.5 py-1 rounded text-xs font-mono font-bold uppercase bg-[#B08D57]/15 text-[#886937] dark:text-[#B08D57] shrink-0 mt-0.5">
                        0{idx + 1}
                      </span>
                      <div className="space-y-1">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-[#6C151E] dark:text-[#B08D57] font-semibold">
                          {item.category}
                        </span>
                        <h3 className="text-base sm:text-lg font-serif font-bold text-[#3A0B10] dark:text-[#F5F3F0] leading-snug">
                          {item.question}
                        </h3>
                      </div>
                    </div>

                    <div className="h-8 w-8 rounded-full border border-[#3A0B10]/15 dark:border-[#F5F3F0]/15 flex items-center justify-center text-[#3A0B10] dark:text-[#F5F3F0] shrink-0 mt-0.5">
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </button>

                  {isOpen && (
                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={headerId}
                      className="px-5 sm:px-6 pb-6 pt-1 text-sm sm:text-base font-sans text-[#16171B]/80 dark:text-[#C7C8CC] leading-relaxed border-t border-[#3A0B10]/10 dark:border-[#F5F3F0]/10"
                    >
                      <p className="max-w-4xl pl-0 sm:pl-11">
                        {item.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 03: SEARCH / CATEGORY FILTER
          Dedicated control area for filtering and searching FAQs
          ───────────────────────────────────────────────────────────── */}
      <section
        id="section-03-search-filter"
        aria-label="Search and Category Filter"
        className="w-full py-8 sm:py-10 bg-[#F5F3F0] dark:bg-[#200508] border-b border-[#3A0B10]/15 dark:border-[#F5F3F0]/10 transition-colors duration-300"
      >
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-12 space-y-6">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-semibold tracking-[0.2em] uppercase text-[#6C151E] dark:text-[#B08D57]">
                03 • Filter Knowledge Base
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#3A0B10] dark:text-[#F5F3F0]">
                Search by Domain<span className="text-[#6C151E] dark:text-[#B08D57]">.</span>
              </h2>
            </div>

            {/* Results count pill */}
            <div className="text-xs font-mono text-[#16171B]/70 dark:text-[#C7C8CC]/70 flex items-center gap-2">
              <span>Showing</span>
              <span className="font-bold text-[#6C151E] dark:text-[#B08D57]">
                {filteredFaqs.length} of {FAQS_DATA.length}
              </span>
              <span>questions</span>
              {(searchQuery || selectedCategory !== 'All') && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="ml-2 underline text-[#6C151E] dark:text-[#B08D57] hover:opacity-80"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Search Input Bar */}
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#16171B]/50 dark:text-[#C7C8CC]/50">
              <Search size={18} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic, hardware, Unstop, prerequisites, or campus venues..."
              aria-label="Search frequently asked questions"
              className="w-full pl-11 pr-10 py-3.5 rounded-xl border border-[#3A0B10]/20 dark:border-[#F5F3F0]/20 bg-white dark:bg-[#28070B] text-sm font-sans text-[#16171B] dark:text-[#F5F3F0] placeholder-[#16171B]/40 dark:placeholder-[#C7C8CC]/40 focus:outline-none focus:ring-2 focus:ring-[#6C151E] dark:focus:ring-[#B08D57] transition-all shadow-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search input"
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#16171B]/50 dark:text-[#C7C8CC]/50 hover:text-[#3A0B10] dark:hover:text-white"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-[#16171B]/60 dark:text-[#C7C8CC]/60">
              <Filter size={13} />
              <span>Select Category:</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              {FAQ_CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#3A0B10] text-[#F5F3F0] dark:bg-[#B08D57] dark:text-[#1A0507] shadow-sm'
                        : 'bg-white dark:bg-[#28070B] text-[#16171B]/75 dark:text-[#C7C8CC] border border-[#3A0B10]/15 dark:border-[#F5F3F0]/15 hover:border-[#3A0B10]/40'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 04: FAQ LIST
          Main accessible accordion listing filtered questions
          ───────────────────────────────────────────────────────────── */}
      <section
        id="section-04-faq-list"
        aria-label="FAQ List"
        className="w-full py-14 sm:py-16 lg:py-20 bg-[#FAF9F6] dark:bg-[#1A0507] transition-colors duration-300 flex-grow"
      >
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-12 space-y-6">
          
          <div className="flex items-center justify-between pb-3 border-b border-[#3A0B10]/10 dark:border-[#F5F3F0]/10">
            <span className="text-xs font-mono font-semibold tracking-widest uppercase text-[#6C151E] dark:text-[#B08D57]">
              04 • Comprehensive Directory ({filteredFaqs.length} Items)
            </span>
            <span className="text-xs font-mono text-[#16171B]/50 dark:text-[#C7C8CC]/50">
              Click row to toggle answer
            </span>
          </div>

          {/* Empty State when no results match search/filter */}
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
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-mono font-bold bg-[#3A0B10] text-[#F5F3F0] hover:bg-[#6C151E] transition-all"
              >
                Reset Search & Filters
              </button>
            </div>
          ) : (
            /* Main FAQ Accordion */
            <div className="space-y-3">
              {filteredFaqs.map((item) => {
                const isOpen = !!mainFaqsOpen[item.id];
                const headerId = `faq-btn-${item.id}`;
                const panelId = `faq-panel-${item.id}`;

                return (
                  <div
                    key={item.id}
                    className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                      isOpen
                        ? 'border-[#6C151E] dark:border-[#B08D57] bg-white dark:bg-[#25070A] shadow-sm'
                        : 'border-[#3A0B10]/15 dark:border-[#F5F3F0]/15 bg-white/70 dark:bg-[#200508] hover:border-[#3A0B10]/35'
                    }`}
                  >
                    <button
                      type="button"
                      id={headerId}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => toggleMainFaq(item.id)}
                      className="w-full text-left p-5 sm:p-6 flex items-start justify-between gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6C151E] dark:focus-visible:ring-[#B08D57] rounded-xl cursor-pointer"
                    >
                      <div className="space-y-1.5 pr-2">
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
                        <h3 className="text-base sm:text-lg font-serif font-bold text-[#3A0B10] dark:text-[#F5F3F0] leading-snug">
                          {item.question}
                        </h3>
                      </div>

                      <div className="h-8 w-8 rounded-full border border-[#3A0B10]/15 dark:border-[#F5F3F0]/15 flex items-center justify-center text-[#3A0B10] dark:text-[#F5F3F0] shrink-0 mt-1">
                        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </button>

                    {isOpen && (
                      <div
                        id={panelId}
                        role="region"
                        aria-labelledby={headerId}
                        className="px-5 sm:px-6 pb-6 pt-2 text-sm sm:text-base font-sans text-[#16171B]/80 dark:text-[#C7C8CC] leading-relaxed border-t border-[#3A0B10]/10 dark:border-[#F5F3F0]/10"
                      >
                        <p className="max-w-4xl">
                          {item.answer}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 05: FOOTER
          Reusing global shared Footer
          ───────────────────────────────────────────────────────────── */}
      <Footer />

    </div>
  );
}
