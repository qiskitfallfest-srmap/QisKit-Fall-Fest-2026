'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Cpu,
  Handshake,
  Megaphone,
  Users2,
  Building2,
  ChevronDown,
  ChevronUp,
  X,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ShieldCheck,
  Mail,
  Linkedin,
  Github,
  Layers,
  ExternalLink,
  Info,
  Terminal
} from 'lucide-react';
import { Footer } from '@/components/shared/Footer';
import { REGISTRATION_URL } from '@/lib/constants';
import { trackRegistrationClick } from '@/lib/analytics';
import { ROSTER_CELLS, ROSTER_TRACKS, initialsOf, RosterPerson } from '@/components/team/organizing-roster';

// ─────────────────────────────────────────────────────────────
// TYPES & DATA STRUCTURES
// ─────────────────────────────────────────────────────────────

interface Member {
  name: string;
  role: string;
  department: string;
  initials: string;
  email?: string;
  linkedin?: string;
  github?: string;
}

interface Cell {
  id: string; // e.g., 'TI-01'
  number: string;
  name: string;
  trackId: string;
  trackName: string;
  description: string;
  lead: Member;
  members: Member[];
  responsibilities: string[];
}

interface Track {
  id: string;
  number: string;
  name: string;
  acronym: string;
  shortDescription: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  cells: Cell[];
}

const TRACK_ICONS: Record<string, Track['icon']> = {
  'track-1': Cpu,
  'track-2': Handshake,
  'track-3': Megaphone,
  'track-4': Users2,
  'track-5': Building2,
};

function toMember(p: RosterPerson): Member {
  return {
    name: p.name,
    role: p.role,
    department: [p.department, p.year && `${p.year} year`].filter(Boolean).join(', '),
    initials: initialsOf(p.name),
  };
}

const ORGANIZING_TRACKS: Track[] = ROSTER_TRACKS.map((t) => ({
  id: t.id,
  number: String(t.number).padStart(2, '0'),
  name: t.name,
  acronym: t.acronym,
  shortDescription: t.shortDescription,
  icon: TRACK_ICONS[t.id],
  cells: ROSTER_CELLS.filter((c) => t.cellIds.includes(c.number)).map((c) => ({
    id: c.id,
    number: String(c.number).padStart(2, '0'),
    name: c.name,
    trackId: t.acronym,
    trackName: t.name,
    description: c.description,
    lead: toMember(c.people[0]),
    members: c.people.slice(1).map(toMember),
    responsibilities: c.responsibilities,
  })),
}));

const IMPACT_STATS = [
  {
    metric: 'Expected Participants',
    value: '500+',
    subtext: 'Universities and engineering institutions across India.',
  },
  {
    metric: 'Quantum Hackathon',
    value: '24h',
    subtext: 'Direct execution on IBM Quantum systems via Qiskit 1.x.',
  },
  {
    metric: 'Open Access Platform',
    value: '100%',
    subtext: 'No registration fees for students; merit-based access.',
  },
  {
    metric: 'Conference Days',
    value: '05',
    subtext: 'Keynotes, hands-on lab sessions, circuit synthesis workshops, and finals.',
  },
];

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────

export default function OrganizingTeamPage() {
  // Track expansion state: by default, the first track (01. TI) is open for immediate visual engagement
  const [expandedTracks, setExpandedTracks] = React.useState<Record<string, boolean>>({
    'track-1': true,
  });

  // Cell modal state: null when closed, Cell object when open
  const [selectedCell, setSelectedCell] = React.useState<Cell | null>(null);

  // Trigger element ref to restore focus upon closing modal
  const lastActiveElementRef = React.useRef<HTMLElement | null>(null);
  const modalCloseButtonRef = React.useRef<HTMLButtonElement | null>(null);

  const toggleTrack = (trackId: string) => {
    setExpandedTracks((prev) => ({
      ...prev,
      [trackId]: !prev[trackId],
    }));
  };

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    ORGANIZING_TRACKS.forEach((t) => {
      allExpanded[t.id] = true;
    });
    setExpandedTracks(allExpanded);
  };

  const collapseAll = () => {
    setExpandedTracks({});
  };

  // Open modal handler
  const handleOpenCell = (cell: Cell, e: React.MouseEvent<HTMLElement>) => {
    lastActiveElementRef.current = e.currentTarget;
    setSelectedCell(cell);
  };

  // Close modal handler
  const handleCloseCell = React.useCallback(() => {
    setSelectedCell(null);
    if (lastActiveElementRef.current) {
      lastActiveElementRef.current.focus();
    }
  }, []);

  // Keyboard Escape listener & Body scroll locking
  React.useEffect(() => {
    if (!selectedCell) return;

    // Lock background scrolling
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus close button on mount
    if (modalCloseButtonRef.current) {
      modalCloseButtonRef.current.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseCell();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedCell, handleCloseCell]);

  return (
    <div className="w-full flex flex-col min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[#6C151E] selection:text-[#F5F3F0]">
      
      {/* ─────────────────────────────────────────────────────────────
          SECTION 01: HERO / ORGANISING TEAM
          Asymmetric editorial composition with hierarchy narrative
          ───────────────────────────────────────────────────────────── */}
      <section
        id="section-01-hero"
        aria-label="Organising Team Hero"
        className="relative w-full border-b border-[#3A0B10]/20 bg-[#F5F3F0] dark:bg-[#22070A] text-[#16171B] dark:text-[#F5F3F0] transition-colors duration-300 overflow-hidden"
      >
        {/* Subtle background orbital geometry */}
        <div className="absolute inset-0 pointer-events-none opacity-25 dark:opacity-15">
          <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full border border-[#6C151E]/25" />
          <div className="absolute -top-16 -left-16 w-[450px] h-[450px] rounded-full border border-dashed border-[#6C151E]/20" />
          <div className="absolute top-1/2 right-0 w-[550px] h-[550px] rounded-full bg-gradient-to-bl from-[#B08D57]/20 to-transparent blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-12 pt-16 sm:pt-20 lg:pt-24 pb-20 sm:pb-24 lg:pb-28">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column: Editorial Headline & Statement */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8">
              
              {/* Category / Eyebrow Badge */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-[0.2em] uppercase bg-[#B08D57]/15 text-[#886937] dark:text-[#B08D57] border border-[#B08D57]/30">
                  <Layers size={13} className="text-[#886937] dark:text-[#B08D57]" />
                  ORGANISING COMMITTEE
                </span>
                <span className="text-xs font-mono text-[#16171B]/60 dark:text-[#C7C8CC]/60 tracking-wider">
                  SRM UNIVERSITY-AP × IBM
                </span>
              </div>

              {/* Display Heading */}
              <div className="space-y-3">
                <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-serif font-bold tracking-tight text-[#3A0B10] dark:text-[#F5F3F0] leading-[1.06]">
                  Organising Team<span className="text-[#6C151E] dark:text-[#B08D57]">.</span>
                </h1>
                <p className="text-lg sm:text-xl font-sans font-medium text-[#6C151E] dark:text-[#B08D57]">
                  The institutional leadership, faculty patrons, and student coordinators orchestrating Qiskit Fall Fest 2026.
                </p>
              </div>

              {/* Supporting Paragraph */}
              <p className="text-base sm:text-lg font-sans text-[#16171B]/80 dark:text-[#E5E5E7]/80 leading-relaxed max-w-2xl font-light">
                Spanning five tracks and fifteen cells, our committee brings together academic governance and event operations for Qiskit Fall Fest Amaravati 2026.
              </p>

              {/* Quick Jump and Action CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="#section-02-five-tracks"
                  className="group inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold bg-[#3A0B10] text-[#F5F3F0] hover:bg-[#6C151E] transition-all shadow-md"
                >
                  <span>Explore 5 Organizing Tracks</span>
                  <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                </a>

                <Link
                  href="/team/website"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold border border-[#3A0B10]/25 dark:border-[#F5F3F0]/25 text-[#3A0B10] dark:text-[#F5F3F0] hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                >
                  <span>Website Team</span>
                  <ArrowUpRight size={15} />
                </Link>
              </div>

              {/* Small capability / track line */}
              <div className="pt-4 border-t border-[#3A0B10]/15 dark:border-[#F5F3F0]/15">
                <div className="text-xs font-mono tracking-[0.2em] text-[#6C151E] dark:text-[#B08D57] font-semibold">
                  TI · IPGR · MBM · TP · OA
                </div>
              </div>

            </div>

            {/* Right Column: Organizational Structure Matrix Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-lg lg:max-w-none rounded-2xl border border-[#3A0B10]/20 dark:border-[#F5F3F0]/20 bg-white dark:bg-[#2C080D] p-6 sm:p-8 shadow-2xl space-y-6">
                
                <div className="flex items-center justify-between pb-4 border-b border-[#3A0B10]/10 dark:border-[#F5F3F0]/10">
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono text-[#886937] dark:text-[#B08D57] font-semibold uppercase tracking-wider">
                      Executive Structure
                    </span>
                    <h3 className="text-lg font-serif font-bold text-[#3A0B10] dark:text-[#F5F3F0]">
                      Organisational Hierarchy
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-[#3A0B10]/10 dark:bg-white/10 text-[#6C151E] dark:text-[#B08D57]">
                    15 Cells Active
                  </span>
                </div>

                {/* Matrix summary rows */}
                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 rounded-lg bg-[#FAF9F6] dark:bg-black/20 border border-[#3A0B10]/10 dark:border-white/10 flex items-center justify-between">
                    <span className="text-[#16171B]/70 dark:text-[#C7C8CC]">Patronage & Advisory</span>
                    <span className="font-semibold text-[#3A0B10] dark:text-white">Vice Chancellor & Dean CSE</span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#FAF9F6] dark:bg-black/20 border border-[#3A0B10]/10 dark:border-white/10 flex items-center justify-between">
                    <span className="text-[#16171B]/70 dark:text-[#C7C8CC]">Technical Direction</span>
                    <span className="font-semibold text-[#3A0B10] dark:text-white">IBM Quantum Technical Lead</span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#FAF9F6] dark:bg-black/20 border border-[#3A0B10]/10 dark:border-white/10 flex items-center justify-between">
                    <span className="text-[#16171B]/70 dark:text-[#C7C8CC]">Five Functional Tracks</span>
                    <span className="font-semibold text-[#3A0B10] dark:text-white">4 Cells per Track</span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#FAF9F6] dark:bg-black/20 border border-[#3A0B10]/10 dark:border-white/10 flex items-center justify-between">
                    <span className="text-[#16171B]/70 dark:text-[#C7C8CC]">Cell Interaction</span>
                    <span className="font-semibold text-[#886937] dark:text-[#B08D57]">Interactive Modal Overlays</span>
                  </div>
                </div>

                {/* Footnote statement */}
                <p className="text-xs font-sans text-[#16171B]/70 dark:text-[#C7C8CC]/80 leading-relaxed pt-2 border-t border-[#3A0B10]/10 dark:border-[#F5F3F0]/10">
                  Select any track below to expand its constituent cells, or click any cell card to inspect verified faculty leadership, student coordinators, and operational duties.
                </p>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 02: EXPLORE OUR TEAMS / FIVE TRACKS
          Main interactive section: 5 expandable track rows + cell cards
          ───────────────────────────────────────────────────────────── */}
      <section
        id="section-02-five-tracks"
        aria-label="Five Organizing Tracks"
        className="w-full py-16 sm:py-20 lg:py-24 bg-[#FAF9F6] dark:bg-[#1A0507] border-b border-[#3A0B10]/15 dark:border-[#F5F3F0]/10 transition-colors duration-300"
      >
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-12 space-y-10">
          
          {/* Header & Controls Row */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#3A0B10]/15 dark:border-[#F5F3F0]/15">
            <div className="space-y-3 max-w-2xl">
              <span className="text-xs font-mono font-semibold tracking-[0.2em] uppercase text-[#6C151E] dark:text-[#B08D57]">
                02 • Functional Divisions
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#3A0B10] dark:text-[#F5F3F0]">
                Explore Our Teams<span className="text-[#6C151E] dark:text-[#B08D57]">.</span>
              </h2>
              <p className="text-base font-sans text-[#16171B]/75 dark:text-[#C7C8CC] leading-relaxed">
                Click on any of the five operational tracks to reveal its cells. Select any cell card to open the complete member roster and contact details in a focused overlay.
              </p>
            </div>

            {/* Expand All / Collapse All controls */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={expandAll}
                className="px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[#3A0B10] dark:text-[#F5F3F0] border border-[#3A0B10]/15 dark:border-[#F5F3F0]/15 transition-all"
              >
                Expand All
              </button>
              <button
                type="button"
                onClick={collapseAll}
                className="px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[#3A0B10] dark:text-[#F5F3F0] border border-[#3A0B10]/15 dark:border-[#F5F3F0]/15 transition-all"
              >
                Collapse All
              </button>
            </div>
          </div>

          {/* Expandable Tracks Accordion List */}
          <div className="space-y-6">
            {ORGANIZING_TRACKS.map((track) => {
              const isExpanded = !!expandedTracks[track.id];
              const IconComponent = track.icon;

              return (
                <div
                  key={track.id}
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isExpanded
                      ? 'border-[#6C151E] dark:border-[#B08D57] bg-white dark:bg-[#25070A] shadow-lg'
                      : 'border-[#3A0B10]/15 dark:border-[#F5F3F0]/15 bg-white/70 dark:bg-[#200508] hover:border-[#3A0B10]/40'
                  }`}
                >
                  {/* Track Header / Collapsed Row Button */}
                  <button
                    type="button"
                    onClick={() => toggleTrack(track.id)}
                    aria-expanded={isExpanded}
                    aria-controls={`track-cells-${track.id}`}
                    className="w-full text-left p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors hover:bg-black/[0.015] dark:hover:bg-white/[0.02]"
                  >
                    <div className="flex items-start sm:items-center gap-4 sm:gap-6">
                      
                      {/* Track number pill */}
                      <span className="px-3 py-1 rounded text-xs font-mono font-bold tracking-widest uppercase bg-[#3A0B10]/5 dark:bg-white/10 text-[#6C151E] dark:text-[#B08D57] shrink-0">
                        {track.number}
                      </span>

                      {/* Icon */}
                      <div className="h-12 w-12 rounded-xl bg-[#3A0B10]/5 dark:bg-white/5 border border-[#3A0B10]/10 dark:border-white/10 flex items-center justify-center text-[#6C151E] dark:text-[#B08D57] shrink-0">
                        <IconComponent size={22} />
                      </div>

                      {/* Track Titles & Description */}
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#3A0B10] dark:text-[#F5F3F0]">
                            {track.name}
                          </h3>
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#B08D57]/15 text-[#886937] dark:text-[#B08D57]">
                            {track.acronym}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm font-sans text-[#16171B]/75 dark:text-[#C7C8CC] max-w-2xl leading-relaxed">
                          {track.shortDescription}
                        </p>
                      </div>

                    </div>

                    {/* Right: Cell Count & Expand Indicator */}
                    <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pl-16 md:pl-0 border-t md:border-t-0 border-[#3A0B10]/10 dark:border-[#F5F3F0]/10 pt-3 md:pt-0">
                      <span className="text-xs font-mono text-[#16171B]/60 dark:text-[#C7C8CC]/70">
                        {track.cells.length} Active Cells
                      </span>
                      <div className="h-9 w-9 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center text-[#3A0B10] dark:text-[#F5F3F0] group-hover:bg-[#6C151E] group-hover:text-white transition-colors">
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </div>
                  </button>

                  {/* Expanded State: Track's Cells */}
                  {isExpanded && (
                    <div
                      id={`track-cells-${track.id}`}
                      className="p-6 sm:p-8 pt-0 border-t border-[#3A0B10]/10 dark:border-[#F5F3F0]/10 bg-[#FAF9F6]/50 dark:bg-black/20"
                    >
                      <div className="pt-6 pb-2">
                        <span className="text-xs font-mono tracking-wider uppercase text-[#6C151E] dark:text-[#B08D57] font-semibold">
                          Constituent Cells in Track {track.acronym} — Click to inspect team members
                        </span>
                      </div>

                      {/* Cells Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 pt-4">
                        {track.cells.map((cell) => (
                          <button
                            key={cell.id}
                            type="button"
                            onClick={(e) => handleOpenCell(cell, e)}
                            className="group relative flex flex-col justify-between text-left p-5 rounded-xl border border-[#3A0B10]/15 dark:border-[#F5F3F0]/15 bg-white dark:bg-[#2C080D] hover:border-[#6C151E] dark:hover:border-[#B08D57] transition-all duration-200 hover:shadow-md cursor-pointer"
                          >
                            <div className="space-y-3">
                              {/* Cell number tag */}
                              <div className="flex items-center justify-between">
                                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#6C151E]/10 dark:bg-[#6C151E]/30 text-[#6C151E] dark:text-[#E5E5E7] border border-[#6C151E]/20">
                                  {cell.number}
                                </span>
                                <span className="text-[11px] font-mono text-[#16171B]/50 dark:text-[#C7C8CC]/50 group-hover:text-[#6C151E] dark:group-hover:text-[#B08D57] transition-colors">
                                  {cell.members.length + 1} People
                                </span>
                              </div>

                              {/* Cell title */}
                              <h4 className="text-base font-serif font-bold text-[#3A0B10] dark:text-[#F5F3F0] group-hover:text-[#6C151E] dark:group-hover:text-[#B08D57] transition-colors leading-snug">
                                {cell.name}
                              </h4>

                              {/* Brief description */}
                              <p className="text-xs font-sans text-[#16171B]/70 dark:text-[#C7C8CC]/80 line-clamp-2 leading-relaxed">
                                {cell.description}
                              </p>
                            </div>

                            {/* Cell lead info preview */}
                            <div className="pt-4 mt-4 border-t border-[#3A0B10]/10 dark:border-[#F5F3F0]/10 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-full bg-[#3A0B10] text-[#F5F3F0] text-[10px] font-mono font-bold flex items-center justify-center">
                                  {cell.lead.initials}
                                </div>
                                <div className="text-[11px] font-mono text-[#16171B]/70 dark:text-[#C7C8CC]/80 truncate max-w-[110px]">
                                  {cell.lead.name}
                                </div>
                              </div>
                              <span className="text-xs font-mono font-bold text-[#6C151E] dark:text-[#B08D57] group-hover:translate-x-0.5 transition-transform">
                                →
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          CELL MODAL / OVERLAY INTERACTION
          Opens focused overlay containing cell information and member roster.
          Background page remains in place behind overlay.
          Traps focus, handles Escape, locks scrolling.
          ───────────────────────────────────────────────────────────── */}
      {selectedCell && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cell-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-black/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
          onClick={handleCloseCell}
        >
          {/* Modal Container */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border border-[#3A0B10]/30 dark:border-[#F5F3F0]/20 bg-[#FAF9F6] dark:bg-[#200508] text-[#16171B] dark:text-[#F5F3F0] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="p-6 sm:p-8 border-b border-[#3A0B10]/15 dark:border-[#F5F3F0]/15 bg-white dark:bg-[#28070B] flex items-start justify-between gap-6 shrink-0">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-[#6C151E]/10 dark:bg-[#6C151E]/30 text-[#6C151E] dark:text-[#E5E5E7] border border-[#6C151E]/20">
                    {selectedCell.number}
                  </span>
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#886937] dark:text-[#B08D57]">
                    {selectedCell.trackName} ({selectedCell.trackId})
                  </span>
                </div>
                <h3
                  id="cell-modal-title"
                  className="text-2xl sm:text-3xl font-serif font-bold text-[#3A0B10] dark:text-[#F5F3F0]"
                >
                  {selectedCell.name}
                </h3>
              </div>

              {/* Close Button */}
              <button
                ref={modalCloseButtonRef}
                type="button"
                onClick={handleCloseCell}
                aria-label="Close cell details dialog"
                className="h-10 w-10 rounded-full border border-black/15 dark:border-white/15 flex items-center justify-center text-[#16171B] dark:text-[#F5F3F0] hover:bg-black/5 dark:hover:bg-white/10 transition-colors shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 sm:p-8 space-y-8 overflow-y-auto">
              
              {/* Cell Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-semibold uppercase tracking-widest text-[#6C151E] dark:text-[#B08D57]">
                  Cell Mandate & Focus
                </h4>
                <p className="text-sm sm:text-base font-sans text-[#16171B]/80 dark:text-[#C7C8CC] leading-relaxed">
                  {selectedCell.description}
                </p>
              </div>

              {/* Responsibilities */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-semibold uppercase tracking-widest text-[#6C151E] dark:text-[#B08D57]">
                  Key Responsibilities
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedCell.responsibilities.map((resp) => (
                    <div
                      key={resp}
                      className="p-3 rounded-lg bg-white dark:bg-[#28070B] border border-[#3A0B10]/10 dark:border-[#F5F3F0]/10 text-xs font-mono flex items-start gap-2 text-[#16171B]/80 dark:text-[#C7C8CC]"
                    >
                      <CheckCircle2 size={14} className="text-[#6C151E] dark:text-[#B08D57] shrink-0 mt-0.5" />
                      <span>{resp}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lead Member Card */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-semibold uppercase tracking-widest text-[#6C151E] dark:text-[#B08D57]">
                  Cell Leadership
                </h4>
                <div className="p-5 rounded-xl border border-[#6C151E]/30 dark:border-[#B08D57]/30 bg-white dark:bg-[#28070B] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#6C151E] to-[#3A0B10] text-white flex items-center justify-center text-lg font-mono font-bold shadow-md shrink-0">
                      {selectedCell.lead.initials}
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#B08D57]/15 text-[#886937] dark:text-[#B08D57] font-semibold">
                        Cell Lead
                      </span>
                      <h5 className="text-lg font-serif font-bold text-[#3A0B10] dark:text-[#F5F3F0]">
                        {selectedCell.lead.name}
                      </h5>
                      <p className="text-xs font-mono text-[#6C151E] dark:text-[#B08D57]">
                        {selectedCell.lead.role}
                      </p>
                      <p className="text-xs font-sans text-[#16171B]/60 dark:text-[#C7C8CC]/60">
                        {selectedCell.lead.department}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 sm:pt-0">
                    {selectedCell.lead.email && (
                      <a
                        href={`mailto:${selectedCell.lead.email}`}
                        className="h-9 w-9 rounded-lg border border-[#3A0B10]/15 dark:border-white/15 flex items-center justify-center text-[#16171B]/70 dark:text-[#C7C8CC] hover:text-[#6C151E] hover:border-[#6C151E] transition-colors"
                        aria-label={`Email ${selectedCell.lead.name}`}
                      >
                        <Mail size={16} />
                      </a>
                    )}
                    {selectedCell.lead.linkedin && (
                      <a
                        href={selectedCell.lead.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-9 w-9 rounded-lg border border-[#3A0B10]/15 dark:border-white/15 flex items-center justify-center text-[#16171B]/70 dark:text-[#C7C8CC] hover:text-[#6C151E] hover:border-[#6C151E] transition-colors"
                        aria-label={`${selectedCell.lead.name} LinkedIn`}
                      >
                        <Linkedin size={16} />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Other Members Roster */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-semibold uppercase tracking-widest text-[#6C151E] dark:text-[#B08D57]">
                  Cell Associates & Coordinators ({selectedCell.members.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedCell.members.map((member) => (
                    <div
                      key={member.name}
                      className="p-4 rounded-xl border border-[#3A0B10]/10 dark:border-[#F5F3F0]/10 bg-white dark:bg-[#28070B] flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-[#3A0B10]/10 dark:bg-white/10 text-[#3A0B10] dark:text-[#F5F3F0] flex items-center justify-center text-xs font-mono font-bold shrink-0">
                          {member.initials}
                        </div>
                        <div className="space-y-0.5">
                          <h6 className="text-sm font-serif font-bold text-[#3A0B10] dark:text-[#F5F3F0]">
                            {member.name}
                          </h6>
                          <p className="text-[11px] font-mono text-[#6C151E] dark:text-[#B08D57]">
                            {member.role}
                          </p>
                          <p className="text-[10px] font-sans text-[#16171B]/60 dark:text-[#C7C8CC]/60">
                            {member.department}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {member.linkedin && (
                          <a
                            href={member.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-[#16171B]/60 dark:text-[#C7C8CC]/60 hover:text-[#6C151E] transition-colors"
                            aria-label={`${member.name} LinkedIn`}
                          >
                            <Linkedin size={14} />
                          </a>
                        )}
                        {member.github && (
                          <a
                            href={member.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-[#16171B]/60 dark:text-[#C7C8CC]/60 hover:text-[#6C151E] transition-colors"
                            aria-label={`${member.name} GitHub`}
                          >
                            <Github size={14} />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-6 border-t border-[#3A0B10]/15 dark:border-[#F5F3F0]/15 bg-white dark:bg-[#28070B] flex items-center justify-between gap-4 shrink-0">
              <span className="text-xs font-mono text-[#16171B]/60 dark:text-[#C7C8CC]/60">
                Press <kbd className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 text-[11px]">ESC</kbd> to close
              </span>
              <button
                type="button"
                onClick={handleCloseCell}
                className="px-5 py-2.5 rounded-lg text-xs font-mono font-bold bg-[#3A0B10] text-[#F5F3F0] hover:bg-[#6C151E] transition-all"
              >
                Close Cell Overview
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SECTION 03: OUR COLLECTIVE IMPACT
          Impact metrics strip
          ───────────────────────────────────────────────────────────── */}
      <section
        id="section-03-our-collective-impact"
        aria-label="Our Collective Impact"
        className="w-full py-16 sm:py-20 bg-[#3A0B10] text-[#F5F3F0] border-b border-black/30 selection:bg-[#6C151E] selection:text-white"
      >
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-12">
          
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
            <div className="space-y-2">
              <span className="text-xs font-mono font-semibold tracking-[0.2em] uppercase text-[#B08D57]">
                03 • Reach & Momentum
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white">
                Our Collective Impact<span className="text-[#B08D57]">.</span>
              </h2>
            </div>
            <p className="text-xs font-mono text-[#C7C8CC] max-w-md">
              Uniting academia, research labs, and next-generation quantum programmers into one rigorous environment.
            </p>
          </div>

          {/* Statistics 4-column Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {IMPACT_STATS.map((stat, idx) => (
              <div
                key={stat.metric}
                className="space-y-3 p-6 rounded-xl bg-black/25 border border-white/10"
              >
                <div className="flex items-baseline justify-between">
                  <span className="text-4xl sm:text-5xl font-serif font-bold tracking-tight text-white">
                    {stat.value}
                  </span>
                  <span className="text-xs font-mono text-[#B08D57]">
                    0{idx + 1}
                  </span>
                </div>
                <div className="text-sm font-bold font-sans tracking-wide text-[#E5E5E7] uppercase">
                  {stat.metric}
                </div>
                <p className="text-xs font-sans text-[#C7C8CC]/85 leading-relaxed">
                  {stat.subtext}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 04: DRIVEN BY PEOPLE
          Editorial statement / quote section
          ───────────────────────────────────────────────────────────── */}
      <section
        id="section-04-driven-by-people"
        aria-label="Driven by People"
        className="w-full py-20 sm:py-24 lg:py-28 bg-[#F5F3F0] dark:bg-[#1A0507] border-b border-[#3A0B10]/15 dark:border-[#F5F3F0]/10 transition-colors duration-300"
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-[0.2em] bg-[#6C151E]/10 dark:bg-[#6C151E]/30 text-[#6C151E] dark:text-[#B08D57] border border-[#6C151E]/20">
            <span>04 • Philosophy</span>
          </div>

          <blockquote className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-[#3A0B10] dark:text-[#F5F3F0] leading-[1.25]">
            &ldquo;Quantum computing is not merely an assemblage of qubits and microwave pulses. It is a shared human endeavor requiring curiosity, empathy, and collective determination.&rdquo;
          </blockquote>

          <div className="pt-4 space-y-1">
            <div className="text-sm font-sans font-bold text-[#16171B] dark:text-[#F5F3F0] uppercase tracking-wider">
              Organising Leadership & Committee Chairs
            </div>
            <div className="text-xs font-mono text-[#16171B]/60 dark:text-[#C7C8CC]/70">
              Department of Computer Science & Engineering • SRM University-AP
            </div>
          </div>

          {/* Thin technical divider */}
          <div className="flex items-center justify-center gap-4 pt-6">
            <span className="h-px w-16 bg-[#3A0B10]/20 dark:bg-[#F5F3F0]/20" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#6C151E] dark:bg-[#B08D57]" />
            <span className="h-px w-16 bg-[#3A0B10]/20 dark:bg-[#F5F3F0]/20" />
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 05: CTA — A STRONGER QUANTUM TOMORROW
          Deep burgundy CTA section with learning portal registration redirect
          ───────────────────────────────────────────────────────────── */}
      <section
        id="section-05-cta"
        aria-label="A Stronger Quantum Tomorrow CTA"
        className="relative w-full py-20 sm:py-24 lg:py-28 bg-gradient-to-br from-[#521018] via-[#3A0B10] to-[#16171B] text-[#F5F3F0] overflow-hidden"
      >
        {/* Subtle background orbital decoration */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-white/15" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[950px] h-[950px] rounded-full border border-dashed border-white/10" />
        </div>

        <div className="relative mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-12 text-center space-y-8">
          
          <div className="space-y-4 max-w-3xl mx-auto">
            <span className="text-xs font-mono font-semibold tracking-[0.25em] uppercase text-[#B08D57]">
              05 • FESTIVAL CTA
            </span>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white leading-tight">
              A Stronger Quantum Tomorrow<span className="text-[#B08D57]">.</span>
            </h2>

            <p className="text-base sm:text-lg font-sans text-[#E5E5E7]/85 max-w-2xl mx-auto leading-relaxed font-light">
              Join hundreds of quantum researchers, students, and algorithm developers at SRM University-AP. Registration is open directly on the official learning portal.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-4">
            <Link
              href="/learning"
              onClick={() => trackRegistrationClick('organizing_team_page')}
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl text-base font-semibold bg-[#F5F3F0] text-[#3A0B10] hover:bg-white hover:shadow-lg transition-all duration-300"
            >
              <span>Register Free</span>
              <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-[#6C151E]" />
            </Link>

            <Link
              href="/team"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-xl text-base font-semibold border border-white/30 text-white hover:bg-white/10 transition-all duration-300"
            >
              <span>Back to Team Overview</span>
            </Link>
          </div>

          {/* Technical subnote */}
          <div className="pt-6 text-xs font-mono text-[#C7C8CC]/60 max-w-md mx-auto">
            Official registration hosted on the learning portal • Co-hosted by SRM University-AP and IBM Quantum
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 06: FOOTER
          Reuse the existing shared Footer
          ───────────────────────────────────────────────────────────── */}
      <Footer />

    </div>
  );
}
