'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import {
  ArrowDown,
  ArrowUpRight,
  Info,
  Cpu,
  Handshake,
  Megaphone,
  MonitorCheck,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────
// DATA SPECIFICATION — 100% VERBATIM MATCH TO DIAGRAM
// ─────────────────────────────────────────────────────────────

export interface CellItem {
  id: string;
  number: number;
  label: string; // Exact text, e.g. "1. Technical Program Cell"
  description: string;
  focusArea: string;
}

export interface TrackItem {
  id: string;
  number: number;
  headerLine1: string; // "TRACK 1:"
  headerLine2: string; // "TECHNICAL & INNOVATION"
  fullTitle: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  accentColor: string;
  cells: CellItem[];
}

export const TRACKS_DATA: TrackItem[] = [
  {
    id: 'track-1',
    number: 1,
    headerLine1: 'TRACK 1:',
    headerLine2: 'TECHNICAL & INNOVATION',
    fullTitle: 'TRACK 1: TECHNICAL & INNOVATION',
    icon: Cpu,
    accentColor: '#800020',
    cells: [
      {
        id: 'cell-1',
        number: 1,
        label: '1. Technical Program Cell',
        description: 'Curating the academic agenda, quantum algorithm keynotes, faculty lectures, and speaker session timing.',
        focusArea: 'Quantum Pedagogy & Circuit Theory',
      },
      {
        id: 'cell-2',
        number: 2,
        label: '2. Hackathon & Competitions Cell',
        description: 'Crafting problem statements on 127-qubit IBM hardware, automated test harnesses, and evaluation rubrics.',
        focusArea: 'Competitive Quantum Programming',
      },
      {
        id: 'cell-3',
        number: 3,
        label: '3. Website & Technology Cell',
        description: 'Engineering the Next.js digital experience, real-time schedule synchronizers, and edge infrastructure.',
        focusArea: 'Digital Platform & Performance',
      },
    ],
  },
  {
    id: 'track-2',
    number: 2,
    headerLine1: 'TRACK 2:',
    headerLine2: 'INDUSTRY, PARTNERSHIPS & GUEST RELATIONS',
    fullTitle: 'TRACK 2: INDUSTRY, PARTNERSHIPS & GUEST RELATIONS',
    icon: Handshake,
    accentColor: '#B08D57',
    cells: [
      {
        id: 'cell-4',
        number: 4,
        label: '4. Industry & Partnerships Cell',
        description: 'Direct institutional liaison with IBM Quantum executives, enterprise sponsors, and research consortia.',
        focusArea: 'IBM Alliances & Industry Grants',
      },
      {
        id: 'cell-5',
        number: 5,
        label: '5. Hospitality & Guest Relations Cell',
        description: 'Managing protocol, guest itineraries, executive lodging, and VIP dignitary facilitation across 5 days.',
        focusArea: 'Speaker Itineraries & Protocol',
      },
    ],
  },
  {
    id: 'track-3',
    number: 3,
    headerLine1: 'TRACK 3:',
    headerLine2: 'MARKETING, BRAND & MEDIA',
    fullTitle: 'TRACK 3: MARKETING, BRAND & MEDIA',
    icon: Megaphone,
    accentColor: '#6C151E',
    cells: [
      {
        id: 'cell-6',
        number: 6,
        label: '6. Marketing & Outreach Cell',
        description: 'Promoting national participation, student chapter activations, and outreach across 60+ Indian universities.',
        focusArea: 'Inter-University Outreach',
      },
      {
        id: 'cell-7',
        number: 7,
        label: '7. Public Relations & Documentation Cell',
        description: 'Press briefings, print media coverage, institutional archiving, and festival recap bulletins.',
        focusArea: 'Press & Festival Archiving',
      },
      {
        id: 'cell-8',
        number: 8,
        label: '8. Branding & Creative Cell',
        description: 'Visual identity stewardship, badge styling, digital artwork, and festival stage design aesthetics.',
        focusArea: 'Visual Identity & Swag Assets',
      },
      {
        id: 'cell-9',
        number: 9,
        label: '9. Digital Media Cell',
        description: 'Broadcasting live 4K keynotes, producing daily highlight reels, and managing interactive social campaigns.',
        focusArea: 'Livestream Broadcasts & Highlights',
      },
    ],
  },
  {
    id: 'track-4',
    number: 4,
    headerLine1: 'TRACK 4:',
    headerLine2: 'TECHNOLOGY & PARTICIPANT EXPERIENCE',
    fullTitle: 'TRACK 4: TECHNOLOGY & PARTICIPANT EXPERIENCE',
    icon: MonitorCheck,
    accentColor: '#800020',
    cells: [
      {
        id: 'cell-10',
        number: 10,
        label: '10. Expo & Exhibition Cell',
        description: 'Demonstrating hardware prototypes, scientific poster sessions, and quantum research booth installations.',
        focusArea: 'Academic Showcases & Posters',
      },
      {
        id: 'cell-11',
        number: 11,
        label: '11. Registration Cell',
        description: 'Managing the Unstop registration funnel, attendee credential verification, and waitlist allocations.',
        focusArea: 'Unstop Funnel & Badging Passes',
      },
      {
        id: 'cell-12',
        number: 12,
        label: '12. Participant Experience Cell',
        description: 'On-site helpdesks, welcome merchandise distribution, attendee orientation, and hackathon guidance.',
        focusArea: 'Attendee Flow & Support Desks',
      },
    ],
  },
  {
    id: 'track-5',
    number: 5,
    headerLine1: 'TRACK 5:',
    headerLine2: 'OPERATIONS & ADMINISTRATION',
    fullTitle: 'TRACK 5: OPERATIONS & ADMINISTRATION',
    icon: Building2,
    accentColor: '#B08D57',
    cells: [
      {
        id: 'cell-13',
        number: 13,
        label: '13. Operations & Logistics Cell',
        description: 'Managing auditorium seating, power backup, hardware workstations, and 24-hour campus logistics.',
        focusArea: 'Auditorium Operations & AL Labs',
      },
      {
        id: 'cell-14',
        number: 14,
        label: '14. Finance & Procurement Cell',
        description: 'Budget auditing, prize disbursements, purchase orders for computing hardware, and vendor clearances.',
        focusArea: 'Audited Accounts & Hackathon Prizes',
      },
      {
        id: 'cell-15',
        number: 15,
        label: '15. Volunteer Management Cell',
        description: 'Rostering 100+ student volunteers, station coordination, briefing sessions, and shift handovers.',
        focusArea: 'Student Volunteer Marshals',
      },
      {
        id: 'cell-16',
        number: 16,
        label: '16. Food Safety & Discipline Cell',
        description: 'Buffet meal operations, 24-hour hackathon refreshments, medical triage, and campus safety protocols.',
        focusArea: 'Catering & Campus Safety',
      },
    ],
  },
];

export interface TreeDiagramNodesProps {
  openModalFor: (entityKey: string, fallbackCell?: CellItem) => void;
  selectedTrackId: string | null;
  setSelectedTrackId?: React.Dispatch<React.SetStateAction<string | null>>;
  activeModalId?: string;
}

export function TreeDiagramNodes({
  openModalFor,
  selectedTrackId,
  setSelectedTrackId,
  activeModalId,
}: TreeDiagramNodesProps) {
  return (
    <>
      {/* ─────────────────────────────────────────────────────
          LEVEL 1: ROOT APEX BOX (VERBATIM TEXT)
          SRM AP PARTNER PLUS
          QISKIT FALL FEST AMARAVATI 2026
          ORGANIZATIONAL STRUCTURE
          ───────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onClick={() => openModalFor('core-organizing')}
        role="button"
        tabIndex={0}
        aria-label="View Core Organizing Leadership Carousel"
        className="group relative z-20 flex flex-col items-center text-center px-8 py-5 rounded-2xl bg-gradient-to-b from-white to-[#F9F7F5] dark:from-[#2A080C] dark:to-[#1E0407] border-2 border-[#800020]/40 dark:border-[#B08D57]/40 shadow-xl hover:shadow-2xl hover:border-[#800020] dark:hover:border-[#B08D57] cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 w-[420px] max-w-full"
      >
        {/* Top decorative seal pin */}
        <div className="absolute -top-3.5 px-3 py-0.5 rounded-full bg-[#3A0B10] text-[#B08D57] text-[10px] font-mono uppercase tracking-[0.25em] font-bold border border-[#B08D57]/40 shadow-sm flex items-center gap-1.5">
          <span>OFFICIAL GOVERNANCE</span>
        </div>

        <div className="space-y-1">
          <span className="block text-[11px] font-mono uppercase tracking-[0.25em] font-bold text-[#800020] dark:text-[#B08D57]">
            SRM AP PARTNER PLUS
          </span>
          <h3 className="text-lg sm:text-xl font-serif font-bold text-[#3A0B10] dark:text-[#F5F3F0] tracking-tight">
            QISKIT FALL FEST AMARAVATI 2026
          </h3>
          <div className="pt-1 flex items-center justify-center gap-2">
            <span className="h-px w-6 bg-[#800020]/30 dark:bg-[#B08D57]/30" />
            <span className="text-xs font-mono uppercase tracking-[0.22em] font-bold text-[#3A0B10]/80 dark:text-[#F5F3F0]/90">
              ORGANIZATIONAL STRUCTURE
            </span>
            <span className="h-px w-6 bg-[#800020]/30 dark:bg-[#B08D57]/30" />
          </div>
        </div>

        <div className="mt-2.5 flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase tracking-wider text-[#800020] dark:text-[#B08D57] opacity-60 group-hover:opacity-100 transition-opacity">
          <span>View Leadership Carousel</span>
          <ArrowUpRight size={11} />
        </div>
      </motion.div>

      {/* SVG Connector: Level 1 -> Level 2 */}
      <div className="relative flex flex-col items-center h-12 w-full">
        <div className="w-[2px] h-full bg-gradient-to-b from-[#800020]/60 to-[#800020]/90 dark:from-[#B08D57]/60 dark:to-[#B08D57]/90 relative">
          <div className="absolute top-1/2 -left-1 h-2.5 w-2.5 rounded-full bg-[#800020] dark:bg-[#B08D57] animate-ping opacity-30" />
        </div>
        <ArrowDown size={14} className="-mt-1 text-[#800020] dark:text-[#B08D57]" />
      </div>

      {/* ─────────────────────────────────────────────────────
          LEVEL 2: CORE ORGANIZING TEAM (VERBATIM TEXT)
          CORE ORGANIZING TEAM
          (1 Lead + 4 Faculty Co-Organizers + 1 Student Lead)
          ───────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        onClick={() => openModalFor('core-organizing')}
        role="button"
        tabIndex={0}
        aria-label="View Core Organizing Team Details"
        className="group relative z-20 flex flex-col items-center text-center px-7 py-4 rounded-xl bg-white dark:bg-[#25060A] border-2 border-[#3A0B10]/25 dark:border-white/15 shadow-md hover:border-[#800020] dark:hover:border-[#B08D57] hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition-all w-[380px] max-w-full"
      >
        <h4 className="text-base font-serif font-bold text-[#3A0B10] dark:text-[#F5F3F0] tracking-wide">
          CORE ORGANIZING TEAM
        </h4>
        <p className="text-xs font-mono font-medium text-[#6C151E] dark:text-[#B08D57] mt-0.5">
          (1 Lead + 4 Faculty Co-Organizers + 1 Student Lead)
        </p>
        <div className="mt-1 flex items-center gap-1 text-[9px] font-mono font-semibold uppercase tracking-wider text-[#800020] dark:text-[#B08D57] opacity-0 group-hover:opacity-100 transition-opacity">
          <span>View Roster</span>
          <ArrowUpRight size={10} />
        </div>
      </motion.div>

      {/* SVG Connector: Level 2 splits into Left & Right (FAB and Student Lead) */}
      <div className="relative w-[620px] h-14 flex justify-center">
        <svg
          className="w-full h-full overflow-visible"
          viewBox="0 0 620 56"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Vertical trunk coming down from Level 2 */}
          <path
            d="M 310 0 L 310 24"
            stroke="currentColor"
            strokeWidth="2"
            className="text-[#800020]/70 dark:text-[#B08D57]/70"
          />
          {/* Horizontal split bar */}
          <path
            d="M 155 24 L 465 24"
            stroke="currentColor"
            strokeWidth="2"
            className="text-[#800020]/70 dark:text-[#B08D57]/70"
          />
          {/* Drop to Left Box */}
          <path
            d="M 155 24 L 155 52"
            stroke="currentColor"
            strokeWidth="2"
            className="text-[#800020]/70 dark:text-[#B08D57]/70"
          />
          {/* Drop to Right Box */}
          <path
            d="M 465 24 L 465 52"
            stroke="currentColor"
            strokeWidth="2"
            className="text-[#800020]/70 dark:text-[#B08D57]/70"
          />
          {/* Directional arrow markers */}
          <circle cx="155" cy="52" r="3" fill="#800020" className="dark:fill-[#B08D57]" />
          <circle cx="465" cy="52" r="3" fill="#800020" className="dark:fill-[#B08D57]" />
        </svg>
      </div>

      {/* ─────────────────────────────────────────────────────
          LEVEL 3: DUAL WINGS (VERBATIM TEXT)
          Left: FACULTY ADVISORY BOARD (FAB) (Guidance & Portfolios)
          Right: CO-ORGANIZER & STUDENT LEAD (Operational Execution)
          ───────────────────────────────────────────────────── */}
      <div className="relative z-20 flex items-center justify-between w-[640px] gap-8">
        {/* Left Wing */}
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          onClick={() => openModalFor('faculty-advisory-board')}
          role="button"
          tabIndex={0}
          aria-label="View Faculty Advisory Board Members"
          className="group flex-1 flex flex-col items-center text-center p-4 rounded-xl bg-white dark:bg-[#25060A] border-2 border-[#3A0B10]/20 dark:border-white/15 shadow-md hover:border-[#800020] dark:hover:border-[#B08D57] hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition-all"
        >
          <h5 className="text-sm font-serif font-bold text-[#3A0B10] dark:text-[#F5F3F0]">
            FACULTY ADVISORY BOARD (FAB)
          </h5>
          <p className="text-xs font-mono font-medium text-[#6C151E] dark:text-[#B08D57] mt-0.5">
            (Guidance & Portfolios)
          </p>
          <div className="mt-1 flex items-center gap-1 text-[9px] font-mono font-semibold uppercase tracking-wider text-[#800020] dark:text-[#B08D57] opacity-0 group-hover:opacity-100 transition-opacity">
            <span>View Board Roster</span>
            <ArrowUpRight size={10} />
          </div>
        </motion.div>

        {/* Right Wing */}
        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          onClick={() => openModalFor('student-lead')}
          role="button"
          tabIndex={0}
          aria-label="View Student Lead & General Chairs"
          className="group flex-1 flex flex-col items-center text-center p-4 rounded-xl bg-white dark:bg-[#25060A] border-2 border-[#3A0B10]/20 dark:border-white/15 shadow-md hover:border-[#800020] dark:hover:border-[#B08D57] hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition-all"
        >
          <h5 className="text-sm font-serif font-bold text-[#3A0B10] dark:text-[#F5F3F0]">
            CO-ORGANIZER & STUDENT LEAD
          </h5>
          <p className="text-xs font-mono font-medium text-[#6C151E] dark:text-[#B08D57] mt-0.5">
            (Operational Execution)
          </p>
          <div className="mt-1 flex items-center gap-1 text-[9px] font-mono font-semibold uppercase tracking-wider text-[#800020] dark:text-[#B08D57] opacity-0 group-hover:opacity-100 transition-opacity">
            <span>View Leadership</span>
            <ArrowUpRight size={10} />
          </div>
        </motion.div>
      </div>

      {/* SVG Connector: Dual wings converge down to Level 4 (5 TRACK LEADS) */}
      <div className="relative w-[640px] h-14 flex justify-center">
        <svg
          className="w-full h-full overflow-visible"
          viewBox="0 0 640 56"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Left wing down */}
          <path
            d="M 160 0 L 160 28"
            stroke="currentColor"
            strokeWidth="2"
            className="text-[#800020]/70 dark:text-[#B08D57]/70"
          />
          {/* Right wing down */}
          <path
            d="M 480 0 L 480 28"
            stroke="currentColor"
            strokeWidth="2"
            className="text-[#800020]/70 dark:text-[#B08D57]/70"
          />
          {/* Converging horizontal bridge */}
          <path
            d="M 160 28 L 480 28"
            stroke="currentColor"
            strokeWidth="2"
            className="text-[#800020]/70 dark:text-[#B08D57]/70"
          />
          {/* Center drop to Level 4 */}
          <path
            d="M 320 28 L 320 52"
            stroke="currentColor"
            strokeWidth="2"
            className="text-[#800020]/70 dark:text-[#B08D57]/70"
          />
          <circle cx="320" cy="52" r="3" fill="#800020" className="dark:fill-[#B08D57]" />
        </svg>
      </div>

      {/* ─────────────────────────────────────────────────────
          LEVEL 4: 5 TRACK LEADS (VERBATIM TEXT)
          ───────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        onClick={() => openModalFor('core-organizing')}
        role="button"
        tabIndex={0}
        aria-label="View 5 Track Leads and Core Committee"
        className="group relative z-20 flex flex-col items-center justify-center px-8 py-3 rounded-xl bg-white dark:bg-[#25060A] border-2 border-[#3A0B10]/25 dark:border-white/15 shadow-sm hover:border-[#800020] dark:hover:border-[#B08D57] hover:scale-[1.02] active:scale-[0.98] cursor-pointer transition-all min-w-[240px]"
      >
        <span className="text-sm font-serif font-bold text-[#3A0B10] dark:text-[#F5F3F0] tracking-wider uppercase">
          5 TRACK LEADS
        </span>
        <div className="mt-0.5 flex items-center gap-1 text-[9px] font-mono font-semibold uppercase tracking-wider text-[#800020] dark:text-[#B08D57] opacity-0 group-hover:opacity-100 transition-opacity">
          <span>Inspect All Tracks</span>
          <ArrowUpRight size={10} />
        </div>
      </motion.div>

      {/* ─────────────────────────────────────────────────────
          CONNECTOR BUS: 5 TRACK LEADS DISTRIBUTES DIRECTLY ACROSS 5 TRACKS
          Orthogonal distributor line spanning 5 columns
          Column Centers calculated for 5 equal columns:
          Width ~ 1160px: centers at approx 116, 348, 580, 812, 1044
          ───────────────────────────────────────────────────── */}
      <div className="relative w-[1160px] h-16 flex justify-center">
        <svg
          className="w-full h-full overflow-visible"
          viewBox="0 0 1160 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Vertical trunk dropping directly from 5 TRACK LEADS (center at 580) */}
          <path
            d="M 580 0 L 580 32"
            stroke="currentColor"
            strokeWidth="2"
            className="text-[#800020]/70 dark:text-[#B08D57]/70"
          />

          {/* Major horizontal bus line spanning across 5 columns */}
          <path
            d="M 116 32 L 1044 32"
            stroke="currentColor"
            strokeWidth="2"
            className="text-[#800020]/70 dark:text-[#B08D57]/70"
          />

          {/* 5 Vertical drops to each Track Column */}
          {[116, 348, 580, 812, 1044].map((x, idx) => {
            const track = TRACKS_DATA[idx];
            const isHighlighted = selectedTrackId === null || selectedTrackId === track.id;
            return (
              <g key={x}>
                <path
                  d={`M ${x} 32 L ${x} 60`}
                  stroke="currentColor"
                  strokeWidth={isHighlighted ? "2.5" : "1.5"}
                  className={cn(
                    "transition-all duration-300",
                    isHighlighted
                      ? "text-[#800020] dark:text-[#B08D57]"
                      : "text-[#800020]/30 dark:text-[#B08D57]/30"
                  )}
                />
                <circle
                  cx={x}
                  cy={60}
                  r={isHighlighted ? "3.5" : "2"}
                  fill="currentColor"
                  className={cn(
                    "transition-all duration-300",
                    isHighlighted
                      ? "text-[#800020] dark:text-[#B08D57]"
                      : "text-[#800020]/40 dark:text-[#B08D57]/40"
                  )}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* ─────────────────────────────────────────────────────
          LEVEL 7: THE 5 TRACK COLUMNS & 16 CONSTITUENT CELLS
          Verbatim Track Headers & Box Names
          ───────────────────────────────────────────────────── */}
      <div className="relative z-20 grid grid-cols-5 gap-6 w-[1160px]">
        {TRACKS_DATA.map((track) => {
          const Icon = track.icon;
          const isSelected = selectedTrackId === track.id;
          const isDimmed = selectedTrackId !== null && !isSelected;

          return (
            <div
              key={track.id}
              className={cn(
                "flex flex-col items-center space-y-4 transition-all duration-300",
                isDimmed ? "opacity-35 scale-[0.98]" : "opacity-100 scale-100"
              )}
            >
              {/* Track Header Card (VERBATIM TEXT) */}
              <div
                onClick={() => {
                  if (setSelectedTrackId) {
                    setSelectedTrackId(isSelected ? null : track.id);
                  }
                  openModalFor(track.id);
                }}
                role="button"
                tabIndex={0}
                aria-label={`Open ${track.fullTitle} Roster Carousel`}
                className={cn(
                  "group cursor-pointer w-full text-center p-3.5 rounded-xl border-2 transition-all duration-300 shadow-md flex flex-col items-center justify-between min-h-[102px] hover:scale-[1.02] active:scale-[0.98]",
                  isSelected
                    ? "bg-[#3A0B10] text-[#F5F3F0] border-[#B08D57] shadow-xl ring-2 ring-[#B08D57]/30"
                    : "bg-white dark:bg-[#25060A] border-[#3A0B10]/25 dark:border-white/15 text-[#3A0B10] dark:text-[#F5F3F0] hover:border-[#800020] dark:hover:border-[#B08D57]"
                )}
              >
                <div className="flex items-center gap-1.5 pb-1">
                  <Icon size={14} className={isSelected ? "text-[#B08D57]" : "text-[#800020] dark:text-[#B08D57]"} />
                  <span className="text-xs font-mono font-bold tracking-wider uppercase">
                    {track.headerLine1}
                  </span>
                </div>

                <h6 className="text-xs font-serif font-bold tracking-tight leading-snug">
                  {track.headerLine2}
                </h6>

                <div className="mt-1 flex items-center gap-1 text-[10px] font-mono tracking-widest uppercase opacity-70 group-hover:opacity-100 transition-opacity">
                  <span>{track.cells.length} Cells</span>
                  <ArrowUpRight size={10} className="text-[#800020] dark:text-[#B08D57]" />
                </div>
              </div>

              {/* Vertical Spine linking to the cells */}
              <div className="relative w-full flex flex-col items-center space-y-3 pt-1">
                {track.cells.map((cell) => {
                  const isCellActive = activeModalId === cell.id;

                  return (
                    <React.Fragment key={cell.id}>
                      {/* Connector line between cells */}
                      <div className="w-[1.5px] h-3 bg-[#800020]/40 dark:bg-[#B08D57]/40" />

                      {/* Cell Box (VERBATIM TEXT) */}
                      <motion.div
                        whileHover={{ y: -2, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => openModalFor(cell.id, cell)}
                        role="button"
                        tabIndex={0}
                        aria-label={`Open ${cell.label} Roster Carousel`}
                        className={cn(
                          "cursor-pointer w-full p-3 rounded-lg border-2 text-center transition-all duration-200 shadow-sm relative group",
                          isCellActive
                            ? "bg-[#800020] text-white border-[#B08D57] shadow-lg ring-2 ring-[#B08D57]/40"
                            : "bg-white dark:bg-[#200508] border-[#3A0B10]/20 dark:border-white/10 text-[#3A0B10] dark:text-[#F5F3F0] hover:border-[#800020] dark:hover:border-[#B08D57] hover:shadow-md"
                        )}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[10px] font-mono font-bold text-[#800020] dark:text-[#B08D57] group-hover:underline">
                            Cell {cell.number < 10 ? `0${cell.number}` : cell.number}
                          </span>
                          <Info size={11} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                        </div>

                        <p className="text-xs font-serif font-bold leading-tight tracking-tight">
                          {cell.label}
                        </p>

                        <div className="mt-1.5 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[9px] font-mono text-[#800020] dark:text-[#B08D57] font-semibold">
                            View Carousel
                          </span>
                          <ArrowUpRight size={10} className="text-[#800020] dark:text-[#B08D57]" />
                        </div>
                      </motion.div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
