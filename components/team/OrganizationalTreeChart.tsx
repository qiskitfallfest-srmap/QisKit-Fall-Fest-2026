'use client';

import * as React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowDown,
  ArrowUpRight,
  Sparkles,
  ChevronDown,
  Layers,
  Cpu,
  Handshake,
  Megaphone,
  MonitorCheck,
  Building2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Info,
  X,
  Workflow
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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

const TRACKS_DATA: TrackItem[] = [
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
        label: '3. Expo & Exhibition Cell',
        description: 'Demonstrating hardware prototypes, scientific poster sessions, and quantum research booth installations.',
        focusArea: 'Academic Showcases & Posters',
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
        label: '10. Website & Technology Cell',
        description: 'Engineering the Next.js digital experience, real-time schedule synchronizers, and edge infrastructure.',
        focusArea: 'Digital Platform & Performance',
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

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────

const TREE_WIDTH = 1180;

export function OrganizationalTreeChart() {
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [activeCell, setActiveCell] = useState<CellItem | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'tree' | 'matrix'>('tree');
  const [treeHeight, setTreeHeight] = useState<number>(1350);
  const [isFitZoomActive, setIsFitZoomActive] = useState<boolean>(true);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const treeRef = React.useRef<HTMLDivElement>(null);

  // Helper to calculate optimal zoom factor to fit the viewport width
  const calculateFitZoom = React.useCallback((width: number) => {
    if (!width || width <= 0) return 1;
    // Responsive internal padding: 16px on mobile, 28px on tablet, 48px on desktop
    const padding = width < 480 ? 16 : width < 768 ? 28 : width < 1024 ? 36 : 48;
    const available = Math.max(260, width - padding);
    
    if (available >= TREE_WIDTH) {
      return 1;
    }
    // Calculate fit ratio
    const fit = Number((available / TREE_WIDTH).toFixed(3));
    // Clamp to ensure visual clarity (min 0.26 on tiny screens, max 1.0)
    return Math.min(1, Math.max(0.26, fit));
  }, []);

  // Handle ResizeObserver for dynamic responsiveness & container measurement
  React.useEffect(() => {
    setIsMounted(true);

    const updateFit = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      if (isFitZoomActive) {
        const optimal = calculateFitZoom(w);
        setZoomLevel(optimal);
      }
    };

    // Run initial fit
    updateFit();

    // Observe container width changes (screen resize, rotation) and tree height
    const resizeObserver = new ResizeObserver(() => {
      updateFit();
      if (treeRef.current) {
        setTreeHeight(treeRef.current.offsetHeight);
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    if (treeRef.current) {
      resizeObserver.observe(treeRef.current);
    }

    window.addEventListener('resize', updateFit);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateFit);
    };
  }, [calculateFitZoom, isFitZoomActive]);

  const handleZoomIn = () => {
    setIsFitZoomActive(false);
    setZoomLevel((prev) => Math.min(Number((prev + 0.15).toFixed(2)), 1.5));
  };

  const handleZoomOut = () => {
    setIsFitZoomActive(false);
    setZoomLevel((prev) => Math.max(Number((prev - 0.15).toFixed(2)), 0.25));
  };

  const handleFitToScreen = () => {
    setIsFitZoomActive(true);
    if (containerRef.current) {
      const optimal = calculateFitZoom(containerRef.current.clientWidth);
      setZoomLevel(optimal);
      containerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };

  const handleZoom100 = () => {
    setIsFitZoomActive(false);
    setZoomLevel(1);
    setTimeout(() => {
      if (containerRef.current) {
        const maxScroll = containerRef.current.scrollWidth - containerRef.current.clientWidth;
        if (maxScroll > 0) {
          containerRef.current.scrollTo({ left: maxScroll / 2, behavior: 'smooth' });
        }
      }
    }, 50);
  };

  // Close modal with ESC
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveCell(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="w-full space-y-8">
      
      {/* ─────────────────────────────────────────────────────────
          CONTROLS TOOLBAR: TRACK FILTER & VIEW TOGGLES
          ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-3 sm:p-4 rounded-2xl bg-white/70 dark:bg-[#200508]/70 backdrop-blur-md border border-[#3A0B10]/15 dark:border-white/10 shadow-sm">
        
        {/* Track Selection Pills */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-xs font-mono font-bold tracking-wider uppercase text-[#3A0B10]/60 dark:text-[#F5F3F0]/60 mr-1 hidden sm:inline-block">
            Focus:
          </span>
          
          <button
            type="button"
            onClick={() => setSelectedTrackId(null)}
            className={cn(
              "px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-mono font-semibold tracking-wide transition-all",
              selectedTrackId === null
                ? "bg-[#3A0B10] dark:bg-[#6C151E] text-white shadow-sm"
                : "bg-black/5 dark:bg-white/5 text-[#3A0B10]/80 dark:text-[#F5F3F0]/80 hover:bg-black/10 dark:hover:bg-white/10"
            )}
          >
            All Tracks
          </button>

          {TRACKS_DATA.map((t) => {
            const isSelected = selectedTrackId === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTrackId(isSelected ? null : t.id)}
                className={cn(
                  "px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-mono font-semibold tracking-wide transition-all flex items-center gap-1.5",
                  isSelected
                    ? "bg-[#800020] dark:bg-[#B08D57] text-white shadow-sm"
                    : "bg-black/5 dark:bg-white/5 text-[#3A0B10]/80 dark:text-[#F5F3F0]/80 hover:bg-black/10 dark:hover:bg-white/10"
                )}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#B08D57]" />
                <span>Track {t.number}</span>
              </button>
            );
          })}
        </div>

        {/* View Mode & Zoom controls */}
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#3A0B10]/10 dark:border-white/10">
          
          {/* View Mode Switcher (Tree vs Cards Directory on Mobile/Tablet) */}
          <div className="flex items-center p-1 rounded-lg bg-black/5 dark:bg-white/5 border border-[#3A0B10]/10 dark:border-white/10 lg:hidden">
            <button
              type="button"
              onClick={() => setActiveTab('tree')}
              className={cn(
                "px-2.5 py-1 rounded text-xs font-mono font-semibold transition-all",
                activeTab === 'tree' ? "bg-white dark:bg-[#3A0B10] text-[#3A0B10] dark:text-white shadow-xs" : "text-[#3A0B10]/60 dark:text-[#F5F3F0]/60"
              )}
            >
              Tree Chart
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('matrix')}
              className={cn(
                "px-2.5 py-1 rounded text-xs font-mono font-semibold transition-all",
                activeTab === 'matrix' ? "bg-white dark:bg-[#3A0B10] text-[#3A0B10] dark:text-white shadow-xs" : "text-[#3A0B10]/60 dark:text-[#F5F3F0]/60"
              )}
            >
              Cards
            </button>
          </div>

          {/* Universal Zoom Controls (Visible on ALL viewports: mobile, tablet, desktop) */}
          {activeTab === 'tree' && (
            <div className="flex items-center gap-1 p-1 rounded-lg bg-black/5 dark:bg-white/5 border border-[#3A0B10]/10 dark:border-white/10">
              <button
                type="button"
                onClick={handleZoomOut}
                aria-label="Zoom Out"
                className="p-1.5 rounded text-[#3A0B10]/70 dark:text-[#F5F3F0]/70 hover:bg-white/80 dark:hover:bg-white/10 active:scale-95 transition-all"
                title="Zoom Out"
              >
                <ZoomOut size={13} />
              </button>
              
              <span className="text-[11px] font-mono font-bold px-1 text-[#3A0B10] dark:text-[#F5F3F0] min-w-[2.8rem] text-center select-none">
                {Math.round(zoomLevel * 100)}%
              </span>
              
              <button
                type="button"
                onClick={handleZoomIn}
                aria-label="Zoom In"
                className="p-1.5 rounded text-[#3A0B10]/70 dark:text-[#F5F3F0]/70 hover:bg-white/80 dark:hover:bg-white/10 active:scale-95 transition-all"
                title="Zoom In"
              >
                <ZoomIn size={13} />
              </button>

              <div className="h-3.5 w-px bg-[#3A0B10]/15 dark:bg-white/15 mx-0.5" />

              {/* Fit Screen Button */}
              <button
                type="button"
                onClick={handleFitToScreen}
                className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider transition-all",
                  isFitZoomActive
                    ? "bg-[#800020] dark:bg-[#B08D57] text-white shadow-xs"
                    : "text-[#3A0B10]/70 dark:text-[#F5F3F0]/70 hover:bg-white/80 dark:hover:bg-white/10"
                )}
                title="Fit entire chart to viewport"
              >
                Fit
              </button>

              {/* 100% Detail Button */}
              <button
                type="button"
                onClick={handleZoom100}
                className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider transition-all",
                  !isFitZoomActive && Math.abs(zoomLevel - 1) < 0.05
                    ? "bg-[#800020] dark:bg-[#B08D57] text-white shadow-xs"
                    : "text-[#3A0B10]/70 dark:text-[#F5F3F0]/70 hover:bg-white/80 dark:hover:bg-white/10"
                )}
                title="100% full scale detail"
              >
                100%
              </button>
            </div>
          )}

          {/* Quick Stats Pill */}
          <div className="hidden sm:flex px-3 py-1.5 rounded-lg bg-[#3A0B10]/5 dark:bg-white/5 text-[11px] font-mono text-[#6C151E] dark:text-[#B08D57] font-semibold items-center gap-1.5">
            <Layers size={13} />
            <span>5 Tracks • 16 Cells</span>
          </div>

        </div>

      </div>

      {/* ─────────────────────────────────────────────────────────
          RESPONSIVE TREE CANVAS (AUTO-FITTED FOR ALL DEVICES)
          ───────────────────────────────────────────────────────── */}
      <div
        className={cn(
          "relative w-full rounded-3xl border border-[#3A0B10]/20 dark:border-white/10 bg-white/40 dark:bg-[#1A0507]/60 backdrop-blur-sm p-2 sm:p-5 lg:p-8 transition-all shadow-xl",
          activeTab === 'matrix' ? "hidden lg:block" : "block"
        )}
      >
        {/* Subtle decorative circuit dot-grid background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] rounded-3xl"
          style={{
            backgroundImage: 'radial-gradient(#800020 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Scrollable Viewport Wrapper */}
        <div
          ref={containerRef}
          className="w-full overflow-x-auto overflow-y-hidden flex justify-center items-start py-2 scrollbar-thin scrollbar-thumb-[#800020]/20 scrollbar-track-transparent"
          style={{
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {/* Dynamic Sizing Container: reserves exact scaled bounding box */}
          <div
            style={{
              width: `${Math.round(TREE_WIDTH * zoomLevel)}px`,
              height: treeHeight ? `${Math.round(treeHeight * zoomLevel)}px` : 'auto',
              minHeight: '260px',
              position: 'relative',
              flexShrink: 0,
              transition: isMounted ? 'width 0.25s cubic-bezier(0.2, 0, 0, 1), height 0.25s cubic-bezier(0.2, 0, 0, 1)' : 'none',
            }}
          >
            {/* The Actual Tree Diagram, scaled from top-left */}
            <div
              ref={treeRef}
              style={{
                width: `${TREE_WIDTH}px`,
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'top left',
                position: 'absolute',
                top: 0,
                left: 0,
                transition: isMounted ? 'transform 0.25s cubic-bezier(0.2, 0, 0, 1)' : 'none',
              }}
              className="flex flex-col items-center"
            >

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
            className="group relative z-20 flex flex-col items-center text-center px-8 py-5 rounded-2xl bg-gradient-to-b from-white to-[#F9F7F5] dark:from-[#2A080C] dark:to-[#1E0407] border-2 border-[#800020]/40 dark:border-[#B08D57]/40 shadow-xl hover:shadow-2xl transition-all duration-300 w-[420px] max-w-full"
          >
            {/* Top decorative seal pin */}
            <div className="absolute -top-3.5 px-3 py-0.5 rounded-full bg-[#3A0B10] text-[#B08D57] text-[10px] font-mono uppercase tracking-[0.25em] font-bold border border-[#B08D57]/40 shadow-sm flex items-center gap-1.5">
              <Sparkles size={10} />
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
            className="relative z-20 flex flex-col items-center text-center px-7 py-4 rounded-xl bg-white dark:bg-[#25060A] border-2 border-[#3A0B10]/25 dark:border-white/15 shadow-md hover:border-[#800020] dark:hover:border-[#B08D57] transition-all w-[380px] max-w-full"
          >
            <h4 className="text-base font-serif font-bold text-[#3A0B10] dark:text-[#F5F3F0] tracking-wide">
              CORE ORGANIZING TEAM
            </h4>
            <p className="text-xs font-mono font-medium text-[#6C151E] dark:text-[#B08D57] mt-0.5">
              (1 Lead + 4 Faculty Co-Organizers + 1 Student Lead)
            </p>
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
              className="flex-1 flex flex-col items-center text-center p-4 rounded-xl bg-white dark:bg-[#25060A] border-2 border-[#3A0B10]/20 dark:border-white/15 shadow-md hover:border-[#800020] dark:hover:border-[#B08D57] transition-all"
            >
              <h5 className="text-sm font-serif font-bold text-[#3A0B10] dark:text-[#F5F3F0]">
                FACULTY ADVISORY BOARD (FAB)
              </h5>
              <p className="text-xs font-mono font-medium text-[#6C151E] dark:text-[#B08D57] mt-0.5">
                (Guidance & Portfolios)
              </p>
            </motion.div>

            {/* Right Wing */}
            <motion.div
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex-1 flex flex-col items-center text-center p-4 rounded-xl bg-white dark:bg-[#25060A] border-2 border-[#3A0B10]/20 dark:border-white/15 shadow-md hover:border-[#800020] dark:hover:border-[#B08D57] transition-all"
            >
              <h5 className="text-sm font-serif font-bold text-[#3A0B10] dark:text-[#F5F3F0]">
                CO-ORGANIZER & STUDENT LEAD
              </h5>
              <p className="text-xs font-mono font-medium text-[#6C151E] dark:text-[#B08D57] mt-0.5">
                (Operational Execution)
              </p>
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
            className="relative z-20 flex items-center justify-center px-8 py-3 rounded-xl bg-white dark:bg-[#25060A] border-2 border-[#3A0B10]/25 dark:border-white/15 shadow-sm hover:border-[#800020] dark:hover:border-[#B08D57] transition-all min-w-[240px]"
          >
            <span className="text-sm font-serif font-bold text-[#3A0B10] dark:text-[#F5F3F0] tracking-wider uppercase">
              5 TRACK LEADS
            </span>
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
                    onClick={() => setSelectedTrackId(isSelected ? null : track.id)}
                    className={cn(
                      "cursor-pointer w-full text-center p-3.5 rounded-xl border-2 transition-all duration-300 shadow-md flex flex-col items-center justify-between min-h-[102px]",
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

                    <span className="mt-1 text-[10px] font-mono tracking-widest uppercase opacity-70">
                      {track.cells.length} Cells
                    </span>
                  </div>

                  {/* Vertical Spine linking to the cells */}
                  <div className="relative w-full flex flex-col items-center space-y-3 pt-1">
                    
                    {track.cells.map((cell) => {
                      const isCellActive = activeCell?.id === cell.id;

                      return (
                        <React.Fragment key={cell.id}>
                          {/* Connector line between cells */}
                          <div className="w-[1.5px] h-3 bg-[#800020]/40 dark:bg-[#B08D57]/40" />

                          {/* Cell Box (VERBATIM TEXT) */}
                          <motion.div
                            whileHover={{ y: -2, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setActiveCell(cell)}
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
                                View Specs
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
          </div>
        </div>
      </div>

      {/* Micro-guide hint on mobile / tablet */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 mt-1 border-t border-[#3A0B10]/10 dark:border-white/10 text-[11px] font-mono text-[#3A0B10]/70 dark:text-[#F5F3F0]/70">
          <span className="flex items-center gap-1.5">
            <Info size={12} className="text-[#800020] dark:text-[#B08D57]" />
            <span>Tap any cell to inspect duties &amp; specs</span>
          </span>
          <span className="hidden sm:inline text-[#3A0B10]/50 dark:text-[#F5F3F0]/50">
            Use &quot;Fit&quot; for bird&apos;s-eye overview or &quot;100%&quot; to scroll full-scale
          </span>
          <span className="sm:hidden text-[#3A0B10]/50 dark:text-[#F5F3F0]/50">
            Tap &quot;100%&quot; to inspect closely
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────
          MOBILE / TABLET CARDS DIRECTORY VIEW (when activeTab === 'matrix')
          Clean touch-friendly accordion & cards so mobile screens never cramp
          ───────────────────────────────────────────────────────── */}
      <div
        className={cn(
          "w-full space-y-4 lg:hidden",
          activeTab === 'tree' ? "hidden" : "block"
        )}
      >
        <div className="p-4 rounded-xl bg-white dark:bg-[#200508] border border-[#3A0B10]/15 dark:border-white/10 space-y-2">
          <div className="text-xs font-mono font-bold text-[#800020] dark:text-[#B08D57] uppercase tracking-wider">
            Mobile Directory View
          </div>
          <p className="text-xs font-sans text-[#16171B]/70 dark:text-[#C7C8CC]">
            Tap any track to inspect its operational cells, faculty leads, and duties.
          </p>
        </div>

        {TRACKS_DATA.map((track) => {
          const Icon = track.icon;
          const isExpanded = selectedTrackId === track.id || selectedTrackId === null;

          return (
            <div
              key={track.id}
              className="rounded-2xl border border-[#3A0B10]/15 dark:border-white/10 bg-white dark:bg-[#200508] shadow-sm overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setSelectedTrackId(selectedTrackId === track.id ? null : track.id)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#3A0B10]/10 dark:bg-white/10 text-[#800020] dark:text-[#B08D57]">
                    <Icon size={18} />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#800020] dark:text-[#B08D57]">
                      {track.headerLine1}
                    </span>
                    <h5 className="text-sm font-serif font-bold text-[#3A0B10] dark:text-[#F5F3F0]">
                      {track.headerLine2}
                    </h5>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 text-[#16171B]/70 dark:text-[#C7C8CC]">
                    {track.cells.length} Cells
                  </span>
                  <ChevronDown
                    size={16}
                    className={cn("transition-transform duration-200", isExpanded ? "rotate-180" : "rotate-0")}
                  />
                </div>
              </button>

              {isExpanded && (
                <div className="p-4 pt-0 border-t border-[#3A0B10]/10 dark:border-white/10 space-y-2 mt-2">
                  {track.cells.map((cell) => (
                    <div
                      key={cell.id}
                      onClick={() => setActiveCell(cell)}
                      className="p-3 rounded-xl border border-[#3A0B10]/10 dark:border-white/10 bg-[#FAF9F6] dark:bg-black/20 flex items-center justify-between cursor-pointer hover:border-[#800020] transition-all"
                    >
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-mono font-bold text-[#800020] dark:text-[#B08D57]">
                          Cell {cell.number < 10 ? `0${cell.number}` : cell.number}
                        </span>
                        <h6 className="text-xs font-serif font-bold text-[#3A0B10] dark:text-[#F5F3F0]">
                          {cell.label}
                        </h6>
                        <p className="text-[11px] font-sans text-[#16171B]/70 dark:text-[#C7C8CC]">
                          {cell.focusArea}
                        </p>
                      </div>
                      <ArrowUpRight size={14} className="text-[#800020] dark:text-[#B08D57] shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ─────────────────────────────────────────────────────────
          INTERACTIVE CELL DETAIL MODAL / DRAWER
          Opens when user clicks any cell card
          ───────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {activeCell && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setActiveCell(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-[#1E0407] border-2 border-[#800020]/30 dark:border-[#B08D57]/30 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-4 border-b border-[#3A0B10]/10 dark:border-white/10 pb-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#800020]/10 dark:bg-[#800020]/30 text-[#800020] dark:text-[#B08D57] text-[11px] font-mono font-bold uppercase tracking-wider">
                    <Workflow size={11} />
                    <span>Cell Specification • #{activeCell.number}</span>
                  </div>
                  <h4 className="text-xl sm:text-2xl font-serif font-bold text-[#3A0B10] dark:text-[#F5F3F0]">
                    {activeCell.label}
                  </h4>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveCell(null)}
                  className="p-1.5 rounded-lg text-[#3A0B10]/70 dark:text-[#F5F3F0]/70 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  aria-label="Close Overview"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-[#FAF9F6] dark:bg-black/30 border border-[#3A0B10]/10 dark:border-white/10 space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#800020] dark:text-[#B08D57]">
                    Operational Domain
                  </span>
                  <p className="text-sm font-sans font-medium text-[#3A0B10] dark:text-[#F5F3F0]">
                    {activeCell.focusArea}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#3A0B10]/70 dark:text-[#F5F3F0]/70">
                    Mandate & Responsibilities
                  </span>
                  <p className="text-sm font-sans text-[#16171B]/80 dark:text-[#C7C8CC] leading-relaxed">
                    {activeCell.description}
                  </p>
                </div>
              </div>

              {/* Modal Footer / Direct Navigation Link */}
              <div className="pt-4 border-t border-[#3A0B10]/10 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                <Link
                  href="/team/organizing"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#3A0B10] hover:bg-[#6C151E] text-white text-xs font-mono font-bold uppercase tracking-wider transition-all shadow-md"
                >
                  <span>Open Full Organizing Roster</span>
                  <ArrowUpRight size={14} />
                </Link>

                <button
                  type="button"
                  onClick={() => setActiveCell(null)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-mono font-semibold text-[#3A0B10]/70 dark:text-[#F5F3F0]/70 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  Close
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
