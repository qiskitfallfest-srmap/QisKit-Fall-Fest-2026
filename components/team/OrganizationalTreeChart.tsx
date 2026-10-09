'use client';

import * as React from 'react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
  ArrowDown,
  ArrowUpRight,
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
  Workflow,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { CoverflowCarousel } from '@/components/ui/coverflow-carousel';
import { FLOWCHART_ROSTER_DATA, FlowchartModalData, GENERIC_PERSON_AVATAR } from './flowchart-roster-data';

// ─────────────────────────────────────────────────────────────
// DATA SPECIFICATION — 100% VERBATIM MATCH TO DIAGRAM
// ─────────────────────────────────────────────────────────────

import {
  TRACKS_DATA,
  CellItem,
  TrackItem,
  TreeDiagramNodes,
} from './TreeDiagramNodes';

export type { CellItem, TrackItem };

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────

const TREE_WIDTH = 1180;

export function OrganizationalTreeChart() {
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [activeModalData, setActiveModalData] = useState<FlowchartModalData | null>(null);

  const selectedTrack = TRACKS_DATA.find((t) => t.id === selectedTrackId);
  const activeTrack = activeModalData ? TRACKS_DATA.find((t) => t.id === activeModalData.id) : null;

  // Fullscreen Slideshow State (Modeled after InteractiveCampusMap)
  const [fullscreenZoom, setFullscreenZoom] = useState<number>(0.5);
  const [isFullscreenFitActive, setIsFullscreenFitActive] = useState<boolean>(true);
  const [fullscreenPan, setFullscreenPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreenDragging, setIsFullscreenDragging] = useState<boolean>(false);
  const fullscreenDragStartRef = React.useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const fullscreenDragDistanceRef = React.useRef<number>(0);

  const openModalFor = (entityKey: string, fallbackCell?: CellItem) => {
    // If the user was dragging/panning the flowchart in fullscreen, ignore click
    if (fullscreenDragDistanceRef.current > 6) {
      return;
    }
    const data = FLOWCHART_ROSTER_DATA[entityKey];
    if (data) {
      setActiveModalData(data);
    } else if (fallbackCell) {
      setActiveModalData({
        id: fallbackCell.id,
        badge: `CELL ${fallbackCell.number < 10 ? '0' : ''}${fallbackCell.number} • OPERATIONAL DOMAIN`,
        title: fallbackCell.label,
        subtitle: fallbackCell.focusArea,
        description: fallbackCell.description,
        linkHref: fallbackCell.id === 'cell-3' ? '/team/website' : '/team/organizing',
        linkText: fallbackCell.id === 'cell-3' ? 'Open Website Team Roster' : 'Open Full Organizing Roster',
        slides: [
          {
            src: GENERIC_PERSON_AVATAR,
            alt: fallbackCell.label,
            title: fallbackCell.label,
            subtitle: fallbackCell.focusArea,
            meta: [
              { label: 'Domain', value: fallbackCell.focusArea },
              { label: 'Cell', value: `#${fallbackCell.number}` },
            ],
          },
        ],
      });
    }
  };

  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'tree' | 'matrix'>('tree');
  const [treeHeight, setTreeHeight] = useState<number>(1350);
  const [isFitZoomActive, setIsFitZoomActive] = useState<boolean>(true);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const treeRef = React.useRef<HTMLDivElement>(null);

  // Slideshow fit: calculates scale so BOTH width and height fit on the screen without scrolling
  const calculateFullscreenFitZoom = React.useCallback((viewportWidth: number, viewportHeight: number, contentHeight: number) => {
    if (!viewportWidth || !viewportHeight) return 0.5;
    // Leave safe room for top controls (80px) and bottom hint (50px), plus horizontal padding
    const padX = viewportWidth < 640 ? 20 : 64;
    const padY = viewportHeight < 640 ? 90 : 130;
    const availW = Math.max(280, viewportWidth - padX);
    const availH = Math.max(280, viewportHeight - padY);
    const targetH = contentHeight && contentHeight > 500 ? contentHeight : 1350;

    const scaleW = availW / TREE_WIDTH;
    const scaleH = availH / targetH;

    // Fit BOTH width AND height so 100% of the entire flowchart fits into the screen at once!
    const optimal = Number(Math.min(scaleW, scaleH).toFixed(3));
    return Math.max(0.16, Math.min(2.0, optimal));
  }, []);

  const enterFullscreen = () => {
    setIsFullscreen(true);
    setIsFullscreenFitActive(true);
    setFullscreenPan({ x: 0, y: 0 });
    fullscreenDragDistanceRef.current = 0;
    if (typeof window !== 'undefined') {
      const optimal = calculateFullscreenFitZoom(window.innerWidth, window.innerHeight, treeHeight);
      setFullscreenZoom(optimal);
    }
  };

  const exitFullscreen = () => {
    setIsFullscreen(false);
  };

  const handleFullscreenFitToScreen = () => {
    setIsFullscreenFitActive(true);
    setFullscreenPan({ x: 0, y: 0 });
    if (typeof window !== 'undefined') {
      const optimal = calculateFullscreenFitZoom(window.innerWidth, window.innerHeight, treeHeight);
      setFullscreenZoom(optimal);
    }
  };

  const handleFullscreenZoom100 = () => {
    setIsFullscreenFitActive(false);
    setFullscreenZoom(1);
    setFullscreenPan({ x: 0, y: 0 });
  };

  const handleFullscreenZoomIn = () => {
    setIsFullscreenFitActive(false);
    setFullscreenZoom((prev) => Math.min(Number((prev + 0.15).toFixed(2)), 2.2));
  };

  const handleFullscreenZoomOut = () => {
    setIsFullscreenFitActive(false);
    setFullscreenZoom((prev) => Math.max(Number((prev - 0.15).toFixed(2)), 0.16));
  };

  // Drag and pan handlers for fullscreen slideshow
  const handleFullscreenMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsFullscreenDragging(true);
    fullscreenDragDistanceRef.current = 0;
    fullscreenDragStartRef.current = {
      x: e.clientX - fullscreenPan.x,
      y: e.clientY - fullscreenPan.y,
    };
  };

  const handleFullscreenMouseMove = (e: React.MouseEvent) => {
    if (!isFullscreenDragging) return;
    const curX = e.clientX - fullscreenDragStartRef.current.x;
    const curY = e.clientY - fullscreenDragStartRef.current.y;
    const dx = curX - fullscreenPan.x;
    const dy = curY - fullscreenPan.y;
    fullscreenDragDistanceRef.current += Math.hypot(dx, dy);
    setFullscreenPan({ x: curX, y: curY });
  };

  const handleFullscreenMouseUp = () => {
    setIsFullscreenDragging(false);
  };

  const handleFullscreenTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsFullscreenDragging(true);
      fullscreenDragDistanceRef.current = 0;
      const t = e.touches[0];
      fullscreenDragStartRef.current = {
        x: t.clientX - fullscreenPan.x,
        y: t.clientY - fullscreenPan.y,
      };
    }
  };

  const handleFullscreenTouchMove = (e: React.TouchEvent) => {
    if (!isFullscreenDragging || e.touches.length !== 1) return;
    const t = e.touches[0];
    const curX = t.clientX - fullscreenDragStartRef.current.x;
    const curY = t.clientY - fullscreenDragStartRef.current.y;
    const dx = curX - fullscreenPan.x;
    const dy = curY - fullscreenPan.y;
    fullscreenDragDistanceRef.current += Math.hypot(dx, dy);
    setFullscreenPan({ x: curX, y: curY });
  };

  const handleFullscreenTouchEnd = () => {
    setIsFullscreenDragging(false);
  };

  const handleFullscreenWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      setIsFullscreenFitActive(false);
      const delta = e.deltaY < 0 ? 0.08 : -0.08;
      setFullscreenZoom((prev) => Math.min(2.2, Math.max(0.16, Number((prev + delta).toFixed(2)))));
    } else {
      setFullscreenPan((prev) => ({
        x: prev.x - e.deltaX * 0.8,
        y: prev.y - e.deltaY * 0.8,
      }));
    }
  };

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

  // Handle fullscreen body scroll locking
  React.useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  // Slideshow auto-fit resize listener
  React.useEffect(() => {
    if (!isFullscreen) return;
    const handleResize = () => {
      if (isFullscreenFitActive && typeof window !== 'undefined') {
        const optimal = calculateFullscreenFitZoom(window.innerWidth, window.innerHeight, treeHeight);
        setFullscreenZoom(optimal);
        setFullscreenPan({ x: 0, y: 0 });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isFullscreen, isFullscreenFitActive, calculateFullscreenFitZoom, treeHeight]);

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

  // Close modal or exit fullscreen with ESC
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeModalData) {
          setActiveModalData(null);
        } else if (isFullscreen) {
          setIsFullscreen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModalData, isFullscreen]);

  return (
    <div className="relative w-full space-y-8">
      
      {/* ─────────────────────────────────────────────────────────
          CONTROLS TOOLBAR: TRACK FILTER & VIEW TOGGLES
          ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3.5 p-3 sm:p-4 rounded-2xl bg-white/80 dark:bg-[#200508]/80 backdrop-blur-md border border-[#3A0B10]/15 dark:border-white/10 shadow-sm transition-all">
        
        {/* Main Controls Row */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Track Selection Pills */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-[#3A0B10]/70 dark:text-[#F5F3F0]/70 mr-1 hidden sm:inline-block">
              Focus:
            </span>
            
            <button
              type="button"
              onClick={() => setSelectedTrackId(null)}
              className={cn(
                "px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-mono font-semibold tracking-wide transition-all cursor-pointer",
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
                    "px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-mono font-semibold tracking-wide transition-all flex items-center gap-1.5 cursor-pointer",
                    isSelected
                      ? "bg-[#800020] dark:bg-[#B08D57] text-white shadow-sm ring-2 ring-[#800020]/25 dark:ring-[#B08D57]/30"
                      : "bg-black/5 dark:bg-white/5 text-[#3A0B10]/80 dark:text-[#F5F3F0]/80 hover:bg-black/10 dark:hover:bg-white/10"
                  )}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#B08D57]" />
                  <span>Track {t.number}</span>
                  {isSelected && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/20 text-white font-bold">
                      {t.cells.length}
                    </span>
                  )}
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

            {/* Fullscreen Button */}
            <button
              type="button"
              onClick={enterFullscreen}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-mono font-semibold tracking-wide transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 border bg-black/5 dark:bg-white/5 text-[#3A0B10]/80 dark:text-[#F5F3F0]/80 hover:bg-[#800020] hover:text-white dark:hover:bg-[#B08D57] dark:hover:text-[#1A0407] border-[#3A0B10]/10 dark:border-white/10"
              title="Fullscreen Slideshow (Slide-fitted)"
              aria-label="Fullscreen Flowchart"
            >
              <Maximize2 size={13} className="shrink-0" />
              <span>Fullscreen</span>
            </button>

          </div>

        </div>

        {/* Sub-options for the focused track: appears down below the track buttons */}
        <AnimatePresence>
          {selectedTrack && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden border-t border-[#3A0B10]/10 dark:border-white/10 pt-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#800020] dark:text-[#B08D57] flex items-center gap-1.5 mr-1 shrink-0">
                  <Workflow size={13} className="text-[#800020] dark:text-[#B08D57]" />
                  <span>Track {selectedTrack.number} Cells ({selectedTrack.cells.length}):</span>
                </span>

                {selectedTrack.cells.map((cell) => {
                  const isCellModalOpen = activeModalData?.id === cell.id;

                  return (
                    <button
                      key={cell.id}
                      type="button"
                      onClick={() => openModalFor(cell.id, cell)}
                      className={cn(
                        "group inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all shadow-xs active:scale-95 cursor-pointer border",
                        isCellModalOpen
                          ? "bg-[#800020] text-white border-[#B08D57] shadow-sm ring-2 ring-[#B08D57]/30"
                          : "bg-white dark:bg-[#1E0407] border-[#3A0B10]/15 dark:border-white/15 text-[#3A0B10] dark:text-[#F5F3F0] hover:border-[#800020] dark:hover:border-[#B08D57] hover:bg-[#800020]/5 dark:hover:bg-[#B08D57]/10"
                      )}
                    >
                      <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-[#800020]/10 dark:bg-white/10 text-[#800020] dark:text-[#B08D57] group-hover:bg-[#800020] group-hover:text-white transition-colors">
                        Cell {cell.number < 10 ? `0${cell.number}` : cell.number}
                      </span>
                      <span className="font-sans font-medium text-xs">
                        {cell.label.replace(/^\d+\.\s*/, '')}
                      </span>
                      <ArrowUpRight size={13} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-[#800020] dark:text-[#B08D57] transition-all" />
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
              <TreeDiagramNodes
                openModalFor={openModalFor}
                selectedTrackId={selectedTrackId}
                setSelectedTrackId={setSelectedTrackId}
                activeModalId={activeModalData?.id}
              />
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
              <div
                role="button"
                tabIndex={0}
                onClick={() => setSelectedTrackId(selectedTrackId === track.id ? null : track.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedTrackId(selectedTrackId === track.id ? null : track.id);
                  }
                }}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
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
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openModalFor(track.id);
                    }}
                    className="px-2 py-1 rounded bg-[#800020]/10 dark:bg-[#B08D57]/20 text-[#800020] dark:text-[#B08D57] text-[11px] font-mono font-bold flex items-center gap-1 hover:bg-[#800020]/20 transition-colors"
                  >
                    <span>{track.cells.length} Cells</span>
                    <ArrowUpRight size={11} />
                  </button>
                  <ChevronDown
                    size={16}
                    className={cn("transition-transform duration-200 text-[#3A0B10]/60 dark:text-white/60", isExpanded ? "rotate-180" : "rotate-0")}
                  />
                </div>
              </div>

              {isExpanded && (
                <div className="p-4 pt-0 border-t border-[#3A0B10]/10 dark:border-white/10 space-y-2 mt-2">
                  {track.cells.map((cell) => (
                    <div
                      key={cell.id}
                      onClick={() => openModalFor(cell.id, cell)}
                      role="button"
                      tabIndex={0}
                      aria-label={`Open ${cell.label} Roster Carousel`}
                      className="p-3 rounded-xl border border-[#3A0B10]/10 dark:border-white/10 bg-[#FAF9F6] dark:bg-black/20 flex items-center justify-between cursor-pointer hover:border-[#800020] transition-all group"
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
                      <ArrowUpRight size={14} className="text-[#800020] dark:text-[#B08D57] shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ─────────────────────────────────────────────────────────
          FULLSCREEN PRESENTATION SLIDESHOW PORTAL (MATCHES VENUES MAP)
          Pure presentation slide mode: 100% full screen, fitted to
          both screen width and height with zero clutter, interactive
          pan/zoom, and floating controls in the top-right corner.
          ───────────────────────────────────────────────────────── */}
      {isFullscreen && isMounted && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[99980] bg-[#F3EFE9] dark:bg-[#140A0D] select-none overflow-hidden flex items-center justify-center transition-colors duration-300"
          onMouseDown={handleFullscreenMouseDown}
          onMouseMove={handleFullscreenMouseMove}
          onMouseUp={handleFullscreenMouseUp}
          onMouseLeave={handleFullscreenMouseUp}
          onTouchStart={handleFullscreenTouchStart}
          onTouchMove={handleFullscreenTouchMove}
          onTouchEnd={handleFullscreenTouchEnd}
          onWheel={handleFullscreenWheel}
          style={{
            cursor: isFullscreenDragging ? 'grabbing' : 'grab',
          }}
        >
          {/* Subtle Decorative Circuit Background Grid */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.035] dark:opacity-[0.055]"
            style={{
              backgroundImage: 'radial-gradient(#800020 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Top-Left: Minimal Live Mode Indicator Pill (like InteractiveCampusMap) */}
          <div className="absolute top-4 left-4 sm:top-5 sm:left-6 z-30 pointer-events-none">
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/95 dark:bg-[#1A0C0F]/95 backdrop-blur-md border border-stone-300/80 dark:border-[#B08D57]/30 shadow-lg text-xs font-medium text-[#16171B] dark:text-[#F5F3F0]">
              <span className="w-2 h-2 rounded-full bg-[#B08D57] animate-pulse" />
              <span className="font-mono text-[11px] uppercase tracking-wider text-stone-500 dark:text-stone-400">Slideshow:</span>
              <span className="font-semibold text-[#6C151E] dark:text-[#B08D57]">
                {selectedTrack ? `Track ${selectedTrack.number}: ${selectedTrack.headerLine2}` : 'Full Organizational Structure'}
              </span>
            </div>
          </div>

          {/* Top-Right: Map/Flowchart Controls Bar (Identical to InteractiveCampusMap) */}
          <div className="absolute top-4 right-4 sm:top-5 sm:right-6 z-30 flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
            {/* Quick Track Focus Pills on Desktop */}
            <div className="hidden lg:flex items-center gap-1 p-1 rounded-xl bg-white/95 dark:bg-[#1C0D11]/95 backdrop-blur-md border border-stone-300/80 dark:border-[#B08D57]/30 shadow-lg">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 px-1.5">
                Focus:
              </span>
              <button
                type="button"
                onClick={() => setSelectedTrackId(null)}
                className={cn(
                  "px-2 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer",
                  selectedTrackId === null
                    ? "bg-[#3A0B10] dark:bg-[#6C151E] text-white shadow-xs"
                    : "text-stone-600 dark:text-stone-300 hover:bg-black/5 dark:hover:bg-white/10"
                )}
              >
                All
              </button>
              {TRACKS_DATA.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTrackId(selectedTrackId === t.id ? null : t.id)}
                  className={cn(
                    "px-2 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer",
                    selectedTrackId === t.id
                      ? "bg-[#800020] dark:bg-[#B08D57] text-white dark:text-[#1A0407] shadow-xs font-bold"
                      : "text-stone-600 dark:text-stone-300 hover:bg-black/5 dark:hover:bg-white/10"
                  )}
                >
                  T{t.number}
                </button>
              ))}
            </div>

            {/* Zoom, Fit & Exit Controls (Styled like InteractiveCampusMap) */}
            <div className="flex items-center gap-1 sm:gap-1.5 p-1 rounded-xl bg-white/95 dark:bg-[#1C0D11]/95 backdrop-blur-md border border-stone-300/80 dark:border-[#B08D57]/30 shadow-lg">
              <button
                type="button"
                onClick={handleFullscreenZoomOut}
                title="Zoom out"
                aria-label="Zoom out"
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg hover:bg-stone-100 dark:hover:bg-white/10 text-stone-700 dark:text-stone-200 transition-colors cursor-pointer"
              >
                <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              <span className="text-[11px] font-mono font-bold px-1 text-stone-800 dark:text-stone-200 min-w-[2.6rem] text-center select-none">
                {Math.round(fullscreenZoom * 100)}%
              </span>

              <button
                type="button"
                onClick={handleFullscreenZoomIn}
                title="Zoom in"
                aria-label="Zoom in"
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg hover:bg-stone-100 dark:hover:bg-white/10 text-stone-700 dark:text-stone-200 transition-colors cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              <div className="w-px h-4 bg-stone-300 dark:bg-stone-700 mx-0.5" />

              {/* Fit Slide Button */}
              <button
                type="button"
                onClick={handleFullscreenFitToScreen}
                className={cn(
                  "h-7 sm:h-8 px-2.5 rounded-lg text-xs font-mono font-bold tracking-wider transition-all flex items-center gap-1 cursor-pointer",
                  isFullscreenFitActive
                    ? "bg-[#800020] dark:bg-[#B08D57] text-white dark:text-[#1A0407] shadow-xs"
                    : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/10"
                )}
                title="Fit entire flowchart slide to screen"
              >
                <Maximize2 size={12} className="shrink-0" />
                <span>Fit</span>
              </button>

              {/* 100% Detail Button */}
              <button
                type="button"
                onClick={handleFullscreenZoom100}
                className={cn(
                  "h-7 sm:h-8 px-2 rounded-lg text-xs font-mono font-bold tracking-wider transition-all cursor-pointer",
                  !isFullscreenFitActive && Math.abs(fullscreenZoom - 1) < 0.05
                    ? "bg-[#800020] dark:bg-[#B08D57] text-white dark:text-[#1A0407] shadow-xs"
                    : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/10"
                )}
                title="View 100% full scale detail"
              >
                100%
              </button>

              <div className="w-px h-4 bg-stone-300 dark:bg-stone-700 mx-0.5" />

              {/* Exit Fullscreen Button */}
              <button
                type="button"
                onClick={exitFullscreen}
                title="Exit Fullscreen (Esc)"
                aria-label="Exit Fullscreen"
                className="h-7 sm:h-8 px-2.5 flex items-center gap-1.5 rounded-lg bg-[#800020]/10 dark:bg-[#B08D57]/20 hover:bg-[#800020] hover:text-white dark:hover:bg-[#B08D57] dark:hover:text-[#1A0407] text-[#6C151E] dark:text-[#B08D57] transition-all cursor-pointer font-semibold text-xs active:scale-95"
              >
                <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Exit Fullscreen</span>
              </button>
            </div>
          </div>

          {/* Floating Bottom Hint */}
          <div className="absolute bottom-4 inset-x-0 flex justify-center z-20 pointer-events-none">
            <div className="inline-flex items-center gap-2 sm:gap-3 px-3.5 py-1.5 rounded-full bg-white/85 dark:bg-[#1A0C0F]/85 backdrop-blur-md border border-stone-300/70 dark:border-white/10 shadow-md text-[11px] font-mono text-stone-600 dark:text-stone-300">
              <span>Press <kbd className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 font-bold text-stone-900 dark:text-white">Esc</kbd> or click Exit</span>
              <span className="opacity-40">•</span>
              <span>Drag to pan</span>
              <span className="opacity-40">•</span>
              <span>Click any cell for roster</span>
            </div>
          </div>

          {/* The Scaled & Centered Flowchart Canvas */}
          <div
            style={{
              width: `${TREE_WIDTH}px`,
              height: `${treeHeight}px`,
              transform: `translate(${fullscreenPan.x}px, ${fullscreenPan.y}px) scale(${fullscreenZoom})`,
              transformOrigin: 'center center',
              transition: isFullscreenDragging ? 'none' : 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
              position: 'relative',
              flexShrink: 0,
            }}
            className="flex flex-col items-center pointer-events-auto"
          >
            <TreeDiagramNodes
              openModalFor={openModalFor}
              selectedTrackId={selectedTrackId}
              setSelectedTrackId={setSelectedTrackId}
              activeModalId={activeModalData?.id}
            />
          </div>
        </div>,
        document.body
      )}

      {/* ─────────────────────────────────────────────────────────
          INTERACTIVE 3D PHOTO COVERFLOW MODAL POPUP
          Opens when user clicks any node in the hierarchy:
          - Core Organizing Team (Root / Apex)
          - Faculty Advisory Board (FAB)
          - Co-Organizer & Student Lead
          - 5 Tracks
          - 16 Operational Cells
          ───────────────────────────────────────────────────────── */}
      {isMounted && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {activeModalData && (
            <div
              className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-8 md:p-10 lg:p-12 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
              onClick={() => setActiveModalData(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-[95vw] max-w-5xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-[#1A0407] border-2 border-[#800020]/30 dark:border-[#B08D57]/40 shadow-2xl overflow-hidden my-auto shrink-0"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between gap-4 px-6 sm:px-8 py-3.5 sm:py-4 border-b border-[#3A0B10]/10 dark:border-white/10 shrink-0 bg-[#FAF9F6]/95 dark:bg-black/40 backdrop-blur-sm">
                  <div className="space-y-1 pr-2">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#800020]/10 dark:bg-[#B08D57]/15 text-[#800020] dark:text-[#B08D57] text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider border border-[#800020]/20 dark:border-[#B08D57]/30">
                      <Workflow size={11} className="text-[#800020] dark:text-[#B08D57] shrink-0" />
                      <span>{activeModalData.badge}</span>
                    </div>
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                      <h4 className="text-xl sm:text-2xl font-serif font-bold text-[#3A0B10] dark:text-[#F5F3F0] tracking-tight">
                        {activeModalData.title}
                      </h4>
                      {activeModalData.subtitle && (
                        <span className="hidden sm:inline-block text-xs font-mono font-medium text-[#6C151E] dark:text-[#B08D57]">
                          • {activeModalData.subtitle}
                        </span>
                      )}
                    </div>

                    {/* If this modal is for a track (e.g. Track 1), show its constituent cells right here */}
                    {activeTrack && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#800020] dark:text-[#B08D57] mr-0.5">
                          Track Cells:
                        </span>
                        {activeTrack.cells.map((cell) => (
                          <button
                            key={cell.id}
                            type="button"
                            onClick={() => openModalFor(cell.id, cell)}
                            className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-black/5 dark:bg-white/10 hover:bg-[#800020] hover:text-white dark:hover:bg-[#B08D57] dark:hover:text-[#1A0407] transition-colors border border-[#3A0B10]/10 dark:border-white/10 flex items-center gap-1 cursor-pointer"
                          >
                            <span>#{cell.number < 10 ? `0${cell.number}` : cell.number}</span>
                            <span className="hidden md:inline">{cell.label.replace(/^\d+\.\s*/, '')}</span>
                            <ArrowUpRight size={10} className="opacity-60" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Header Actions: optional Roster link + Close Cross Button */}
                  <div className="flex items-center gap-3 shrink-0">
                    {activeModalData.linkHref && (
                      <Link
                        href={activeModalData.linkHref}
                        onClick={() => setActiveModalData(null)}
                        className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#3A0B10]/10 dark:bg-white/10 hover:bg-[#800020] hover:text-white dark:hover:bg-[#B08D57] dark:hover:text-[#1A0407] text-[#3A0B10] dark:text-[#F5F3F0] text-xs font-mono font-bold uppercase tracking-wider transition-all border border-[#3A0B10]/15 dark:border-white/15 active:scale-95"
                      >
                        <span>{activeModalData.linkText || 'Full Roster'}</span>
                        <ArrowUpRight size={13} />
                      </Link>
                    )}

                    {/* Prominent High-Visibility Close Cross Button */}
                    <button
                      type="button"
                      onClick={() => setActiveModalData(null)}
                      className="h-10 w-10 rounded-full bg-black/5 dark:bg-white/10 hover:bg-[#800020] hover:text-white dark:hover:bg-[#B08D57] dark:hover:text-[#1A0407] text-[#3A0B10]/80 dark:text-[#F5F3F0]/90 transition-all flex items-center justify-center shadow-xs hover:shadow-md border border-[#3A0B10]/10 dark:border-white/10 active:scale-95 shrink-0"
                      aria-label="Close dialog"
                      title="Close (Esc)"
                    >
                      <X size={20} strokeWidth={2.4} />
                    </button>
                  </div>
                </div>

                {/* Modal Body: CAROUSEL COMPONENT WITH CLEAN SCROLLING SUPPORT */}
                <div className="w-full overflow-y-auto max-h-[calc(92vh-80px)] px-4 sm:px-8 py-4 sm:py-5 flex flex-col items-center justify-center bg-gradient-to-b from-transparent via-[#800020]/[0.02] to-[#800020]/[0.04] dark:via-white/[0.01] dark:to-white/[0.02]">
                  <CoverflowCarousel
                    slides={activeModalData.slides}
                    cardWidth="clamp(160px, 18vw, 220px)"
                    rotate={34}
                    depth={0.5}
                    perspective={3}
                    loop={activeModalData.slides.length > 1}
                  />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

    </div>
  );
}
