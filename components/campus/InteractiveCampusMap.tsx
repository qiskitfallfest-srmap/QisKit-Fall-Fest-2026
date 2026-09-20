'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  MapPin,
  Navigation,
  ArrowRight,
  X,
} from 'lucide-react';
import {
  CampusLocation,
  CAMPUS_LOCATIONS,
} from '@/data/campus-locations';

interface InteractiveCampusMapProps {
  locations?: CampusLocation[];
  selectedLocationId?: string | null;
  onSelectLocation?: (location: CampusLocation) => void;
}

/**
 * Verified walking routes strictly originating from Gate 3 (x: 740, y: 310)
 * along campus avenues and walkways directly to building entrances.
 */
export const GATE3_ROUTES: Record<
  string,
  {
    path: string;
    destPoint: { x: number; y: number };
  }
> = {
  'x-lab': {
    path: 'M 740 310 L 437 310 L 437 335',
    destPoint: { x: 437, y: 335 },
  },
  'jc-bose': {
    path: 'M 740 310 L 585 310 L 585 335',
    destPoint: { x: 585, y: 335 },
  },
  'v-block': {
    path: 'M 740 310 L 430 310 L 430 285',
    destPoint: { x: 430, y: 285 },
  },
  'homi-bhabha': {
    path: 'M 740 310 L 580 310 L 580 285',
    destPoint: { x: 580, y: 285 },
  },
  'food-court': {
    path: 'M 740 310 L 625 310 L 625 465',
    destPoint: { x: 625, y: 465 },
  },
  'sr-block': {
    path: 'M 740 310 L 340 310 L 340 410 L 280 410',
    destPoint: { x: 280, y: 410 },
  },
  'c-block': {
    path: 'M 740 310 L 340 310 L 340 590 L 160 590 L 160 610',
    destPoint: { x: 160, y: 610 },
  },
  'ground': {
    path: 'M 740 310 L 440 310 L 440 465',
    destPoint: { x: 440, y: 465 },
  },
  'annapurna-mess': {
    path: 'M 740 310 L 527 310 L 527 200 L 527 185',
    destPoint: { x: 527, y: 185 },
  },
  'north-hostels': {
    path: 'M 740 310 L 480 310 L 480 200 L 480 130',
    destPoint: { x: 480, y: 130 },
  },
  'west-hostels': {
    path: 'M 740 310 L 340 310 L 340 265 L 280 265',
    destPoint: { x: 280, y: 265 },
  },
  'gate-3': {
    path: 'M 740 310 L 740 310',
    destPoint: { x: 740, y: 310 },
  },
};

export function InteractiveCampusMap({
  locations = CAMPUS_LOCATIONS,
  selectedLocationId = 'x-lab',
  onSelectLocation,
}: InteractiveCampusMapProps) {
  const [zoom, setZoom] = React.useState<number>(1);
  const [pan, setPan] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeId, setActiveId] = React.useState<string>(selectedLocationId || 'x-lab');
  const [isDragging, setIsDragging] = React.useState<boolean>(false);
  const [dragStart, setDragStart] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = React.useState<boolean>(false);
  const [showPill, setShowPill] = React.useState<boolean>(true);
  const [showRoute, setShowRoute] = React.useState<boolean>(true);

  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (selectedLocationId) {
      setActiveId(selectedLocationId);
      setShowPill(true);
      setShowRoute(true);
    }
  }, [selectedLocationId]);

  const activeLocation =
    locations.find((l) => l.id === activeId) || locations[0];

  const currentRoute = GATE3_ROUTES[activeId] || GATE3_ROUTES['x-lab'];

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 2.2));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.8));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setPan({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const isSelected = (id: string) => activeId === id;

  const handleBuildingClick = (id: string) => {
    setActiveId(id);
    setShowPill(true);
    setShowRoute(true);
    const loc = locations.find((l) => l.id === id);
    if (loc && onSelectLocation) {
      onSelectLocation(loc);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Map Card Container */}
      <div
        ref={containerRef}
        className={`
          relative w-full overflow-hidden
          rounded-2xl
          border border-[rgba(22,23,27,0.15)] dark:border-[rgba(108,21,30,0.3)]
          bg-[#F3EFE9] dark:bg-[#140A0D]
          shadow-xl shadow-black/10 dark:shadow-black/50
          select-none cursor-grab active:cursor-grabbing
          touch-none overscroll-none
          transition-all duration-300
          ${isFullscreen ? 'fixed inset-2 sm:inset-4 z-50 rounded-2xl h-auto' : 'h-[500px] sm:h-[620px] lg:h-[700px]'}
        `}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Responsive Building Preview Card (Bottom docked on mobile, top-left on desktop) */}
        {showPill && activeLocation && (
          <div className="
            absolute z-30
            bottom-3 inset-x-3 sm:bottom-auto sm:inset-x-auto sm:top-4 sm:left-4
            w-auto sm:w-[340px] md:w-[360px]
            max-h-[58vh] sm:max-h-none overflow-y-auto
            p-3 sm:p-4 rounded-2xl
            bg-white/95 dark:bg-[#180A0D]/95 backdrop-blur-md
            border border-stone-200/90 dark:border-[#B08D57]/30
            shadow-2xl transition-all duration-300
          ">
            {/* Top Bar with Badge and Close */}
            <div className="flex items-center justify-between pb-2 mb-2">
              <span className="inline-block px-2.5 py-1 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider bg-[#6C151E]/10 dark:bg-[#6C151E]/30 text-[#6C151E] dark:text-[#B08D57]">
                {activeLocation.categoryLabel}
              </span>
              <button
                onClick={() => setShowPill(false)}
                className="w-7 h-7 rounded-full bg-stone-100 dark:bg-white/10 hover:bg-stone-200 dark:hover:bg-white/20 flex items-center justify-center text-stone-500 dark:text-stone-300 transition-colors cursor-pointer"
                aria-label="Dismiss building preview"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Real Building Image */}
            <div className="relative w-full h-32 sm:h-44 rounded-xl overflow-hidden bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-inner">
              <Image
                src={activeLocation.image}
                alt={activeLocation.name}
                fill
                sizes="(max-width: 640px) 100vw, 360px"
                className="object-cover object-center transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-2 left-3 right-3 text-white text-[11px] font-mono flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-[#B08D57]" />
                <span className="truncate">{activeLocation.locationLabel}</span>
              </div>
            </div>

            {/* Title */}
            <div className="pt-2 sm:pt-2.5">
              <h4 className="font-serif text-base sm:text-lg font-bold text-[#16171B] dark:text-[#F5F3F0] leading-snug">
                {activeLocation.name}
              </h4>
            </div>

            {/* Actions: View Schedule & Toggle On-Map Path from Gate 3 */}
            <div className="flex items-center gap-2 pt-2.5 sm:pt-3 mt-2 sm:mt-2.5 border-t border-stone-200 dark:border-stone-800 text-xs">
              <Link
                href="/schedule"
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-sans font-semibold bg-[#6C151E] text-white hover:bg-[#521018] dark:bg-[#6C151E] dark:hover:bg-[#851D28] transition-colors"
              >
                <span>Schedule</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
              <button
                onClick={() => setShowRoute(!showRoute)}
                className={`
                  flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-sans font-semibold
                  border transition-all cursor-pointer
                  ${showRoute
                    ? 'bg-[#B08D57]/20 border-[#B08D57] text-[#6C151E] dark:text-[#B08D57]'
                    : 'bg-white dark:bg-white/5 border-stone-300 dark:border-stone-700 text-[#16171B] dark:text-[#F5F3F0] hover:bg-stone-100 dark:hover:bg-white/10'}
                `}
              >
                <Navigation className="w-3.5 h-3.5 text-[#B08D57]" />
                <span>{showRoute ? 'Hide Path' : 'Show Path'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Top-Right: Map Controls (Zoom, Reset, Fullscreen) — Replaces old N compass and bottom buttons */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center gap-1 sm:gap-1.5 p-1 rounded-xl bg-white/90 dark:bg-[#1C0D11]/90 backdrop-blur-md border border-stone-300/80 dark:border-[#B08D57]/30 shadow-lg">
          <button
            onClick={handleZoomOut}
            title="Zoom out"
            aria-label="Zoom out"
            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg hover:bg-stone-100 dark:hover:bg-white/10 text-stone-700 dark:text-stone-200 transition-colors cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={handleZoomIn}
            title="Zoom in"
            aria-label="Zoom in"
            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg hover:bg-stone-100 dark:hover:bg-white/10 text-stone-700 dark:text-stone-200 transition-colors cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={handleReset}
            title="Reset View"
            aria-label="Reset View"
            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg hover:bg-stone-100 dark:hover:bg-white/10 text-stone-700 dark:text-stone-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
          <div className="w-px h-4 bg-stone-300 dark:bg-stone-700 mx-0.5" />
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'View Full Map'}
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'View Full Map'}
            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg hover:bg-stone-100 dark:hover:bg-white/10 text-[#6C151E] dark:text-[#B08D57] transition-colors cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* SVG Map Canvas */}
        <div
          className="w-full h-full transition-transform duration-150 ease-out origin-center"
          style={{
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
          }}
        >
          <svg
            viewBox="0 0 1000 700"
            className="w-full h-full pointer-events-auto"
            aria-label="SRM University-AP Campus Layout Diagram"
          >
            <defs>
              {/* 3D Standard Building Multi-Layer Cast Shadow */}
              <filter id="shadow-3d" x="-25%" y="-15%" width="150%" height="160%">
                <feDropShadow dx="0" dy="7" stdDeviation="4.5" floodColor="#000000" floodOpacity="0.25" />
                <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.16" />
              </filter>

              {/* 3D Tall Building Cast Shadow (X-Lab / Main Audi & JC Bose) */}
              <filter id="shadow-3d-tall" x="-30%" y="-20%" width="160%" height="170%">
                <feDropShadow dx="0" dy="12" stdDeviation="7" floodColor="#000000" floodOpacity="0.32" />
                <feDropShadow dx="0" dy="3" stdDeviation="2" floodColor="#000000" floodOpacity="0.22" />
              </filter>

              {/* 3D Active Building Glow + Shadow */}
              <filter id="shadow-3d-active" x="-30%" y="-20%" width="160%" height="170%">
                <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#B08D57" floodOpacity="0.85" />
                <feDropShadow dx="0" dy="10" stdDeviation="6" floodColor="#000000" floodOpacity="0.35" />
              </filter>

              {/* Active Selection Glow */}
              <filter id="active-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#B08D57" floodOpacity="0.8" />
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3" />
              </filter>

              {/* Route Glow */}
              <filter id="route-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#B08D57" floodOpacity="0.9" />
              </filter>

              {/* Building Shadow (Backwards compatibility) */}
              <filter id="block-shadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="1" dy="3" stdDeviation="2.5" floodOpacity="0.15" />
              </filter>

              {/* Grid Background Pattern */}
              <pattern id="campus-grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className="text-stone-300/50 dark:text-stone-800/40"
                />
              </pattern>
            </defs>

            {/* Background Grid */}
            <rect width="1000" height="700" fill="url(#campus-grid-pattern)" />

            {/* Outer Campus Boundary */}
            <rect
              x="40"
              y="20"
              width="920"
              height="660"
              rx="8"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.8"
              strokeDasharray="4 4"
              className="text-stone-300 dark:text-stone-800"
            />

            {/* =========================================================
                ROADS & THOROUGHFARES (Exact Eraser Schematic)
            ========================================================== */}
            {/* Gate 3 Entry Avenue (Horizontal at y: 310) */}
            <line
              x1="760"
              y1="310"
              x2="340"
              y2="310"
              stroke="currentColor"
              strokeWidth="14"
              strokeLinecap="round"
              className="text-stone-300 dark:text-[#25151A]"
            />
            <line
              x1="740"
              y1="310"
              x2="350"
              y2="310"
              stroke="#B08D57"
              strokeWidth="1"
              strokeDasharray="6 6"
              strokeOpacity="0.6"
            />

            {/* Western Spine Road (Vertical at x: 340) */}
            <line
              x1="340"
              y1="40"
              x2="340"
              y2="660"
              stroke="currentColor"
              strokeWidth="14"
              strokeLinecap="round"
              className="text-stone-300 dark:text-[#25151A]"
            />
            <line
              x1="340"
              y1="50"
              x2="340"
              y2="650"
              stroke="#B08D57"
              strokeWidth="1"
              strokeDasharray="6 6"
              strokeOpacity="0.6"
            />

            {/* North Walkway / Road (y: 200) */}
            <line
              x1="340"
              y1="200"
              x2="660"
              y2="200"
              stroke="currentColor"
              strokeWidth="10"
              className="text-stone-300/80 dark:text-[#25151A]"
            />

            {/* South Central Avenue (y: 445) */}
            <line
              x1="340"
              y1="445"
              x2="710"
              y2="445"
              stroke="currentColor"
              strokeWidth="12"
              className="text-stone-300 dark:text-[#25151A]"
            />

            {/* West Cross-Road (y: 380) */}
            <line
              x1="340"
              y1="380"
              x2="70"
              y2="380"
              stroke="currentColor"
              strokeWidth="10"
              className="text-stone-300/80 dark:text-[#25151A]"
            />

            {/* Bottom-West Walkway (y: 590) */}
            <line
              x1="70"
              y1="590"
              x2="340"
              y2="590"
              stroke="currentColor"
              strokeWidth="8"
              className="text-stone-300/80 dark:text-[#25151A]"
            />

            {/* =========================================================
                IN-MAP WALKING DIRECTIONS PATH FROM GATE 3
            ========================================================== */}
            {showRoute && currentRoute && activeId !== 'gate-3' && (
              <g className="pointer-events-none">
                {/* Soft Glowing Path Underlay */}
                <path
                  d={currentRoute.path}
                  fill="none"
                  stroke="#B08D57"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.35"
                  filter="url(#route-glow)"
                />

                {/* Animated Moving Dashed Golden Path */}
                <path
                  d={currentRoute.path}
                  fill="none"
                  stroke="#B08D57"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="8 6"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from="0"
                    to="-28"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                </path>

                {/* Gate 3 Departure Point Marker */}
                <circle cx="740" cy="310" r="8" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
                <circle cx="740" cy="310" r="14" fill="none" stroke="#10B981" strokeWidth="1.5" opacity="0.7">
                  <animate attributeName="r" from="8" to="18" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.7" to="0" dur="1.5s" repeatCount="indefinite" />
                </circle>

                {/* Destination Arrival Point Marker */}
                <circle
                  cx={currentRoute.destPoint.x}
                  cy={currentRoute.destPoint.y}
                  r="8"
                  fill="#6C151E"
                  stroke="#B08D57"
                  strokeWidth="2"
                />
                <circle
                  cx={currentRoute.destPoint.x}
                  cy={currentRoute.destPoint.y}
                  r="14"
                  fill="none"
                  stroke="#B08D57"
                  strokeWidth="1.5"
                  opacity="0.7"
                >
                  <animate attributeName="r" from="8" to="20" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.7" to="0" dur="1.5s" repeatCount="indefinite" />
                </circle>
              </g>
            )}

            {/* =========================================================
                SRM GATE 3 (Arrival Gateway on East Boundary)
            ========================================================== */}
            <g
              className="cursor-pointer group"
              onClick={() => handleBuildingClick('gate-3')}
            >
              {/* 3D Base Facade */}
              <rect
                x="745"
                y="296"
                width="40"
                height="36"
                rx="6"
                fill="#240508"
              />
              {/* 3D Roof */}
              <rect
                x="745"
                y="292"
                width="40"
                height="36"
                rx="6"
                fill={isSelected('gate-3') ? '#6C151E' : '#3A0B10'}
                stroke={isSelected('gate-3') ? '#B08D57' : '#6C151E'}
                strokeWidth={isSelected('gate-3') ? 2 : 1.2}
                filter={isSelected('gate-3') ? 'url(#shadow-3d-active)' : 'url(#shadow-3d)'}
                className="transition-all duration-200 group-hover:-translate-y-0.5"
              />
              <text
                x="765"
                y="314"
                textAnchor="middle"
                className="font-mono text-[9px] font-bold fill-white select-none pointer-events-none"
              >
                GATE 3
              </text>
              <text
                x="815"
                y="314"
                textAnchor="start"
                className="font-mono text-[10px] font-semibold tracking-wider fill-[#6C151E] dark:fill-[#B08D57] select-none pointer-events-none"
              >
                srm gate 3 →
              </text>
            </g>

            {/* =========================================================
                TOP HOSTELS — LEFT STACK (Kaveri, Godavari, Krishna)
            ========================================================== */}
            <g
              className="cursor-pointer group"
              onClick={() => handleBuildingClick('north-hostels')}
            >
              {/* Kaveri */}
              <rect x="395" y="49" width="80" height="36" rx="6" className={isSelected('north-hostels') ? 'fill-[#3B070D]' : 'fill-stone-300 dark:fill-[#120609]'} />
              <rect
                x="395"
                y="45"
                width="80"
                height="36"
                rx="6"
                filter={isSelected('north-hostels') ? 'url(#shadow-3d-active)' : 'url(#shadow-3d)'}
                className={`transition-all duration-200 group-hover:-translate-y-0.5 ${isSelected('north-hostels') ? 'fill-[#6C151E] stroke-[#B08D57] stroke-2' : 'fill-white dark:fill-[#201116] stroke-stone-300 dark:stroke-stone-700/80 stroke-1 group-hover:stroke-[#B08D57]'}`}
              />
              <line x1="403" y1="46" x2="467" y2="46" stroke="currentColor" strokeWidth="1" className={isSelected('north-hostels') ? 'text-[#B08D57]/60' : 'text-white/60 dark:text-white/10'} />
              <text x="435" y="67" textAnchor="middle" className="font-sans text-[11px] font-medium fill-stone-700 dark:fill-stone-300 select-none pointer-events-none">
                Kaveri
              </text>

              {/* Godavari */}
              <rect x="395" y="99" width="80" height="36" rx="6" className={isSelected('north-hostels') ? 'fill-[#3B070D]' : 'fill-stone-300 dark:fill-[#120609]'} />
              <rect
                x="395"
                y="95"
                width="80"
                height="36"
                rx="6"
                filter={isSelected('north-hostels') ? 'url(#shadow-3d-active)' : 'url(#shadow-3d)'}
                className={`transition-all duration-200 group-hover:-translate-y-0.5 ${isSelected('north-hostels') ? 'fill-[#6C151E] stroke-[#B08D57] stroke-2' : 'fill-white dark:fill-[#201116] stroke-stone-300 dark:stroke-stone-700/80 stroke-1 group-hover:stroke-[#B08D57]'}`}
              />
              <line x1="403" y1="96" x2="467" y2="96" stroke="currentColor" strokeWidth="1" className={isSelected('north-hostels') ? 'text-[#B08D57]/60' : 'text-white/60 dark:text-white/10'} />
              <text x="435" y="117" textAnchor="middle" className="font-sans text-[11px] font-medium fill-stone-700 dark:fill-stone-300 select-none pointer-events-none">
                Godavari
              </text>

              {/* Krishna */}
              <rect x="395" y="149" width="80" height="36" rx="6" className={isSelected('north-hostels') ? 'fill-[#3B070D]' : 'fill-stone-300 dark:fill-[#120609]'} />
              <rect
                x="395"
                y="145"
                width="80"
                height="36"
                rx="6"
                filter={isSelected('north-hostels') ? 'url(#shadow-3d-active)' : 'url(#shadow-3d)'}
                className={`transition-all duration-200 group-hover:-translate-y-0.5 ${isSelected('north-hostels') ? 'fill-[#6C151E] stroke-[#B08D57] stroke-2' : 'fill-white dark:fill-[#201116] stroke-stone-300 dark:stroke-stone-700/80 stroke-1 group-hover:stroke-[#B08D57]'}`}
              />
              <line x1="403" y1="146" x2="467" y2="146" stroke="currentColor" strokeWidth="1" className={isSelected('north-hostels') ? 'text-[#B08D57]/60' : 'text-white/60 dark:text-white/10'} />
              <text x="435" y="167" textAnchor="middle" className="font-sans text-[11px] font-medium fill-stone-700 dark:fill-stone-300 select-none pointer-events-none">
                Krishna
              </text>
            </g>

            {/* =========================================================
                TOP HOSTELS — RIGHT STACK (Yamuna, Narmada, Annapurna Mess)
            ========================================================== */}
            <g
              className="cursor-pointer group"
              onClick={() => handleBuildingClick('north-hostels')}
            >
              {/* Yamuna */}
              <rect x="525" y="49" width="80" height="36" rx="6" className={isSelected('north-hostels') ? 'fill-[#3B070D]' : 'fill-stone-300 dark:fill-[#120609]'} />
              <rect
                x="525"
                y="45"
                width="80"
                height="36"
                rx="6"
                filter={isSelected('north-hostels') ? 'url(#shadow-3d-active)' : 'url(#shadow-3d)'}
                className={`transition-all duration-200 group-hover:-translate-y-0.5 ${isSelected('north-hostels') ? 'fill-[#6C151E] stroke-[#B08D57] stroke-2' : 'fill-white dark:fill-[#201116] stroke-stone-300 dark:stroke-stone-700/80 stroke-1 group-hover:stroke-[#B08D57]'}`}
              />
              <line x1="533" y1="46" x2="597" y2="46" stroke="currentColor" strokeWidth="1" className={isSelected('north-hostels') ? 'text-[#B08D57]/60' : 'text-white/60 dark:text-white/10'} />
              <text x="565" y="67" textAnchor="middle" className="font-sans text-[11px] font-medium fill-stone-700 dark:fill-stone-300 select-none pointer-events-none">
                yamuna
              </text>

              {/* Narmada */}
              <rect x="525" y="99" width="80" height="36" rx="6" className={isSelected('north-hostels') ? 'fill-[#3B070D]' : 'fill-stone-300 dark:fill-[#120609]'} />
              <rect
                x="525"
                y="95"
                width="80"
                height="36"
                rx="6"
                filter={isSelected('north-hostels') ? 'url(#shadow-3d-active)' : 'url(#shadow-3d)'}
                className={`transition-all duration-200 group-hover:-translate-y-0.5 ${isSelected('north-hostels') ? 'fill-[#6C151E] stroke-[#B08D57] stroke-2' : 'fill-white dark:fill-[#201116] stroke-stone-300 dark:stroke-stone-700/80 stroke-1 group-hover:stroke-[#B08D57]'}`}
              />
              <line x1="533" y1="96" x2="597" y2="96" stroke="currentColor" strokeWidth="1" className={isSelected('north-hostels') ? 'text-[#B08D57]/60' : 'text-white/60 dark:text-white/10'} />
              <text x="565" y="117" textAnchor="middle" className="font-sans text-[11px] font-medium fill-stone-700 dark:fill-stone-300 select-none pointer-events-none">
                Narmada
              </text>
            </g>

            {/* Annapurna Mess */}
            <g
              className="cursor-pointer group"
              onClick={() => handleBuildingClick('annapurna-mess')}
            >
              <rect x="520" y="150" width="95" height="42" rx="6" className={isSelected('annapurna-mess') ? 'fill-[#3B070D]' : 'fill-stone-300 dark:fill-[#120609]'} />
              <rect
                x="520"
                y="145"
                width="95"
                height="42"
                rx="6"
                filter={isSelected('annapurna-mess') ? 'url(#shadow-3d-active)' : 'url(#shadow-3d)'}
                className={`transition-all duration-200 group-hover:-translate-y-0.5 ${isSelected('annapurna-mess') ? 'fill-[#6C151E] stroke-[#B08D57] stroke-2' : 'fill-white dark:fill-[#201116] stroke-stone-300 dark:stroke-stone-700/80 stroke-1 group-hover:stroke-[#B08D57]'}`}
              />
              <line x1="528" y1="146" x2="607" y2="146" stroke="currentColor" strokeWidth="1" className={isSelected('annapurna-mess') ? 'text-[#B08D57]/60' : 'text-white/60 dark:text-white/10'} />
              <text x="567" y="169" textAnchor="middle" className="font-sans text-[10.5px] font-medium fill-stone-700 dark:fill-stone-300 select-none pointer-events-none">
                Anapurna mess
              </text>
            </g>

            {/* =========================================================
                MIDDLE ROW ABOVE ROAD: V-BLOCK & HOMI J BHABHA BLOCK
            ========================================================== */}
            <g
              className="cursor-pointer group"
              onClick={() => handleBuildingClick('v-block')}
            >
              {/* 3D Facade Base */}
              <rect x="370" y="231" width="125" height="60" rx="8" className={isSelected('v-block') ? 'fill-[#3B070D]' : 'fill-stone-300 dark:fill-[#120609]'} />
              {/* 3D Roof */}
              <rect
                x="370"
                y="225"
                width="125"
                height="60"
                rx="8"
                filter={isSelected('v-block') ? 'url(#shadow-3d-active)' : 'url(#shadow-3d)'}
                className={`transition-all duration-200 group-hover:-translate-y-0.5 ${isSelected('v-block') ? 'fill-[#6C151E] stroke-[#B08D57] stroke-2' : 'fill-white dark:fill-[#201116] stroke-stone-300 dark:stroke-stone-700 stroke-1 group-hover:stroke-[#B08D57]'}`}
              />
              <line x1="380" y1="226" x2="485" y2="226" stroke="currentColor" strokeWidth="1" className={isSelected('v-block') ? 'text-[#B08D57]/60' : 'text-white/60 dark:text-white/10'} />
              <text
                x="432"
                y="260"
                textAnchor="middle"
                className={`font-sans text-xs font-semibold select-none pointer-events-none ${isSelected('v-block') ? 'fill-white' : 'fill-[#16171B] dark:fill-[#F5F3F0]'}`}
              >
                v block
              </text>
            </g>

            <g
              className="cursor-pointer group"
              onClick={() => handleBuildingClick('homi-bhabha')}
            >
              {/* 3D Facade Base */}
              <rect x="515" y="231" width="135" height="60" rx="8" className={isSelected('homi-bhabha') ? 'fill-[#3B070D]' : 'fill-stone-300 dark:fill-[#120609]'} />
              {/* 3D Roof */}
              <rect
                x="515"
                y="225"
                width="135"
                height="60"
                rx="8"
                filter={isSelected('homi-bhabha') ? 'url(#shadow-3d-active)' : 'url(#shadow-3d)'}
                className={`transition-all duration-200 group-hover:-translate-y-0.5 ${isSelected('homi-bhabha') ? 'fill-[#6C151E] stroke-[#B08D57] stroke-2' : 'fill-white dark:fill-[#201116] stroke-stone-300 dark:stroke-stone-700 stroke-1 group-hover:stroke-[#B08D57]'}`}
              />
              <line x1="525" y1="226" x2="640" y2="226" stroke="currentColor" strokeWidth="1" className={isSelected('homi-bhabha') ? 'text-[#B08D57]/60' : 'text-white/60 dark:text-white/10'} />
              <text
                x="582"
                y="260"
                textAnchor="middle"
                className={`font-sans text-xs font-semibold select-none pointer-events-none ${isSelected('homi-bhabha') ? 'fill-white' : 'fill-[#16171B] dark:fill-[#F5F3F0]'}`}
              >
                homi j baba block
              </text>
            </g>

            {/* =========================================================
                CENTER MAIN ACADEMIC: X-LAB (MAIN AUDI) & JC BOSE
            ========================================================== */}
            <g
              className="cursor-pointer group"
              onClick={() => handleBuildingClick('x-lab')}
            >
              {/* 3D Tall Facade Base (Tallest venue, depth 8px) */}
              <rect x="370" y="343" width="135" height="95" rx="8" className={isSelected('x-lab') ? 'fill-[#3B070D]' : 'fill-stone-300 dark:fill-[#120609]'} />
              {/* 3D Roof */}
              <rect
                x="370"
                y="335"
                width="135"
                height="95"
                rx="8"
                filter={isSelected('x-lab') ? 'url(#shadow-3d-active)' : 'url(#shadow-3d-tall)'}
                className={`transition-all duration-200 group-hover:-translate-y-0.5 ${isSelected('x-lab') ? 'fill-[#6C151E] stroke-[#B08D57] stroke-2' : 'fill-white dark:fill-[#201116] stroke-stone-300 dark:stroke-stone-700 stroke-1 group-hover:stroke-[#B08D57]'}`}
              />
              <line x1="380" y1="336" x2="495" y2="336" stroke="currentColor" strokeWidth="1" className={isSelected('x-lab') ? 'text-[#B08D57]/60' : 'text-white/60 dark:text-white/10'} />
              <text
                x="437"
                y="382"
                textAnchor="middle"
                className={`font-serif text-sm font-bold select-none pointer-events-none ${isSelected('x-lab') ? 'fill-white' : 'fill-[#16171B] dark:fill-[#F5F3F0]'}`}
              >
                X-Lab
              </text>
              <text
                x="437"
                y="397"
                textAnchor="middle"
                className={`font-mono text-[9px] font-semibold select-none pointer-events-none ${isSelected('x-lab') ? 'fill-[#B08D57]' : 'fill-[#6C151E] dark:fill-[#B08D57]'}`}
              >
                (Main Auditorium)
              </text>
            </g>

            <g
              className="cursor-pointer group"
              onClick={() => handleBuildingClick('jc-bose')}
            >
              {/* 3D Tall Facade Base */}
              <rect x="525" y="342" width="125" height="95" rx="8" className={isSelected('jc-bose') ? 'fill-[#3B070D]' : 'fill-stone-300 dark:fill-[#120609]'} />
              {/* 3D Roof */}
              <rect
                x="525"
                y="335"
                width="125"
                height="95"
                rx="8"
                filter={isSelected('jc-bose') ? 'url(#shadow-3d-active)' : 'url(#shadow-3d-tall)'}
                className={`transition-all duration-200 group-hover:-translate-y-0.5 ${isSelected('jc-bose') ? 'fill-[#6C151E] stroke-[#B08D57] stroke-2' : 'fill-white dark:fill-[#201116] stroke-stone-300 dark:stroke-stone-700 stroke-1 group-hover:stroke-[#B08D57]'}`}
              />
              <line x1="535" y1="336" x2="640" y2="336" stroke="currentColor" strokeWidth="1" className={isSelected('jc-bose') ? 'text-[#B08D57]/60' : 'text-white/60 dark:text-white/10'} />
              <text
                x="587"
                y="387"
                textAnchor="middle"
                className={`font-serif text-sm font-bold select-none pointer-events-none ${isSelected('jc-bose') ? 'fill-white' : 'fill-[#16171B] dark:fill-[#F5F3F0]'}`}
              >
                JC Bose
              </text>
            </g>

            {/* =========================================================
                WEST HOSTELS (Theestha, Vedavathi, Ganga, Brahmaputra)
            ========================================================== */}
            <g
              className="cursor-pointer group"
              onClick={() => handleBuildingClick('west-hostels')}
            >
              {/* Theestha */}
              <rect x="245" y="189" width="70" height="42" rx="6" className={isSelected('west-hostels') ? 'fill-[#3B070D]' : 'fill-stone-300 dark:fill-[#120609]'} />
              <rect
                x="245"
                y="185"
                width="70"
                height="42"
                rx="6"
                filter={isSelected('west-hostels') ? 'url(#shadow-3d-active)' : 'url(#shadow-3d)'}
                className={`transition-all duration-200 group-hover:-translate-y-0.5 ${isSelected('west-hostels') ? 'fill-[#6C151E] stroke-[#B08D57] stroke-2' : 'fill-white dark:fill-[#201116] stroke-stone-300 dark:stroke-stone-700 stroke-1 group-hover:stroke-[#B08D57]'}`}
              />
              <line x1="251" y1="186" x2="309" y2="186" stroke="currentColor" strokeWidth="1" className={isSelected('west-hostels') ? 'text-[#B08D57]/60' : 'text-white/60 dark:text-white/10'} />
              <text x="280" y="210" textAnchor="middle" className="font-sans text-[10.5px] font-medium fill-stone-700 dark:fill-stone-300 select-none pointer-events-none">
                theestha
              </text>

              {/* Vedavathi */}
              <rect x="245" y="249" width="70" height="42" rx="6" className={isSelected('west-hostels') ? 'fill-[#3B070D]' : 'fill-stone-300 dark:fill-[#120609]'} />
              <rect
                x="245"
                y="245"
                width="70"
                height="42"
                rx="6"
                filter={isSelected('west-hostels') ? 'url(#shadow-3d-active)' : 'url(#shadow-3d)'}
                className={`transition-all duration-200 group-hover:-translate-y-0.5 ${isSelected('west-hostels') ? 'fill-[#6C151E] stroke-[#B08D57] stroke-2' : 'fill-white dark:fill-[#201116] stroke-stone-300 dark:stroke-stone-700 stroke-1 group-hover:stroke-[#B08D57]'}`}
              />
              <line x1="251" y1="246" x2="309" y2="246" stroke="currentColor" strokeWidth="1" className={isSelected('west-hostels') ? 'text-[#B08D57]/60' : 'text-white/60 dark:text-white/10'} />
              <text x="280" y="270" textAnchor="middle" className="font-sans text-[10.5px] font-medium fill-stone-700 dark:fill-stone-300 select-none pointer-events-none">
                Vedavathi
              </text>

              {/* Ganga */}
              <rect x="245" y="309" width="70" height="42" rx="6" className={isSelected('west-hostels') ? 'fill-[#3B070D]' : 'fill-stone-300 dark:fill-[#120609]'} />
              <rect
                x="245"
                y="305"
                width="70"
                height="42"
                rx="6"
                filter={isSelected('west-hostels') ? 'url(#shadow-3d-active)' : 'url(#shadow-3d)'}
                className={`transition-all duration-200 group-hover:-translate-y-0.5 ${isSelected('west-hostels') ? 'fill-[#6C151E] stroke-[#B08D57] stroke-2' : 'fill-white dark:fill-[#201116] stroke-stone-300 dark:stroke-stone-700 stroke-1 group-hover:stroke-[#B08D57]'}`}
              />
              <line x1="251" y1="306" x2="309" y2="306" stroke="currentColor" strokeWidth="1" className={isSelected('west-hostels') ? 'text-[#B08D57]/60' : 'text-white/60 dark:text-white/10'} />
              <text x="280" y="330" textAnchor="middle" className="font-sans text-[10.5px] font-medium fill-stone-700 dark:fill-stone-300 select-none pointer-events-none">
                Ganga
              </text>

              {/* Brahmaputra */}
              <rect x="155" y="309" width="75" height="42" rx="6" className={isSelected('west-hostels') ? 'fill-[#3B070D]' : 'fill-stone-300 dark:fill-[#120609]'} />
              <rect
                x="155"
                y="305"
                width="75"
                height="42"
                rx="6"
                filter={isSelected('west-hostels') ? 'url(#shadow-3d-active)' : 'url(#shadow-3d)'}
                className={`transition-all duration-200 group-hover:-translate-y-0.5 ${isSelected('west-hostels') ? 'fill-[#6C151E] stroke-[#B08D57] stroke-2' : 'fill-white dark:fill-[#201116] stroke-stone-300 dark:stroke-stone-700 stroke-1 group-hover:stroke-[#B08D57]'}`}
              />
              <line x1="161" y1="306" x2="224" y2="306" stroke="currentColor" strokeWidth="1" className={isSelected('west-hostels') ? 'text-[#B08D57]/60' : 'text-white/60 dark:text-white/10'} />
              <text x="192" y="330" textAnchor="middle" className="font-sans text-[10px] font-medium fill-stone-700 dark:fill-stone-300 select-none pointer-events-none">
                Brahmaputra
              </text>
            </g>

            {/* =========================================================
                LOWER LEFT: S-BLOCK & C-BLOCK
            ========================================================== */}
            <g
              className="cursor-pointer group"
              onClick={() => handleBuildingClick('sr-block')}
            >
              {/* 3D Facade Base */}
              <rect x="250" y="417" width="60" height="160" rx="8" className={isSelected('sr-block') ? 'fill-[#3B070D]' : 'fill-stone-300 dark:fill-[#120609]'} />
              {/* 3D Roof */}
              <rect
                x="250"
                y="410"
                width="60"
                height="160"
                rx="8"
                filter={isSelected('sr-block') ? 'url(#shadow-3d-active)' : 'url(#shadow-3d)'}
                className={`transition-all duration-200 group-hover:-translate-y-0.5 ${isSelected('sr-block') ? 'fill-[#6C151E] stroke-[#B08D57] stroke-2' : 'fill-white dark:fill-[#201116] stroke-stone-300 dark:stroke-stone-700 stroke-1 group-hover:stroke-[#B08D57]'}`}
              />
              <line x1="258" y1="411" x2="302" y2="411" stroke="currentColor" strokeWidth="1" className={isSelected('sr-block') ? 'text-[#B08D57]/60' : 'text-white/60 dark:text-white/10'} />
              <text
                x="280"
                y="495"
                textAnchor="middle"
                className={`font-sans text-xs font-semibold select-none pointer-events-none ${isSelected('sr-block') ? 'fill-white' : 'fill-[#16171B] dark:fill-[#F5F3F0]'}`}
              >
                S-block
              </text>
            </g>

            <g
              className="cursor-pointer group"
              onClick={() => handleBuildingClick('c-block')}
            >
              {/* 3D Facade Base */}
              <rect x="80" y="616" width="160" height="60" rx="8" className={isSelected('c-block') ? 'fill-[#3B070D]' : 'fill-stone-300 dark:fill-[#120609]'} />
              {/* 3D Roof */}
              <rect
                x="80"
                y="610"
                width="160"
                height="60"
                rx="8"
                filter={isSelected('c-block') ? 'url(#shadow-3d-active)' : 'url(#shadow-3d)'}
                className={`transition-all duration-200 group-hover:-translate-y-0.5 ${isSelected('c-block') ? 'fill-[#6C151E] stroke-[#B08D57] stroke-2' : 'fill-white dark:fill-[#201116] stroke-stone-300 dark:stroke-stone-700 stroke-1 group-hover:stroke-[#B08D57]'}`}
              />
              <line x1="90" y1="611" x2="230" y2="611" stroke="currentColor" strokeWidth="1" className={isSelected('c-block') ? 'text-[#B08D57]/60' : 'text-white/60 dark:text-white/10'} />
              <text
                x="160"
                y="645"
                textAnchor="middle"
                className={`font-sans text-xs font-semibold select-none pointer-events-none ${isSelected('c-block') ? 'fill-white' : 'fill-[#16171B] dark:fill-[#F5F3F0]'}`}
              >
                C block
              </text>
            </g>

            {/* =========================================================
                BOTTOM CENTER & RIGHT: GROUND & FOOD COURT
            ========================================================== */}
            <g
              className="cursor-pointer group"
              onClick={() => handleBuildingClick('ground')}
            >
              {/* Sunken Outer Rim Shadow Base */}
              <rect x="345" y="470" width="195" height="175" rx="12" className="fill-stone-300/80 dark:fill-[#0C1710]" />
              {/* Turf Plane */}
              <rect
                x="345"
                y="465"
                width="195"
                height="175"
                rx="12"
                filter="url(#shadow-3d)"
                className={`transition-all duration-200 group-hover:-translate-y-0.5 ${isSelected('ground') ? 'fill-[#18291F] stroke-[#B08D57] stroke-2' : 'fill-[#1A3324]/20 dark:fill-[#13241A] stroke-emerald-800/40 dark:stroke-emerald-700/60 stroke-1 group-hover:stroke-[#B08D57]'}`}
              />
              {/* Running Track Ring */}
              <rect
                x="365"
                y="485"
                width="155"
                height="135"
                rx="60"
                fill="none"
                stroke="#C0392B"
                strokeWidth="2.5"
                strokeOpacity="0.4"
              />
              <text
                x="442"
                y="555"
                textAnchor="middle"
                className="font-serif text-sm font-bold fill-emerald-800 dark:fill-emerald-300 select-none pointer-events-none"
              >
                Ground
              </text>
            </g>

            <g
              className="cursor-pointer group"
              onClick={() => handleBuildingClick('food-court')}
            >
              {/* 3D Facade Base */}
              <rect x="560" y="471" width="135" height="110" rx="8" className={isSelected('food-court') ? 'fill-[#3B070D]' : 'fill-stone-300 dark:fill-[#120609]'} />
              {/* 3D Roof */}
              <rect
                x="560"
                y="465"
                width="135"
                height="110"
                rx="8"
                filter={isSelected('food-court') ? 'url(#shadow-3d-active)' : 'url(#shadow-3d)'}
                className={`transition-all duration-200 group-hover:-translate-y-0.5 ${isSelected('food-court') ? 'fill-[#6C151E] stroke-[#B08D57] stroke-2' : 'fill-white dark:fill-[#201116] stroke-stone-300 dark:stroke-stone-700 stroke-1 group-hover:stroke-[#B08D57]'}`}
              />
              <line x1="570" y1="466" x2="685" y2="466" stroke="currentColor" strokeWidth="1" className={isSelected('food-court') ? 'text-[#B08D57]/60' : 'text-white/60 dark:text-white/10'} />
              <text
                x="627"
                y="525"
                textAnchor="middle"
                className={`font-sans text-xs font-semibold select-none pointer-events-none ${isSelected('food-court') ? 'fill-white' : 'fill-[#16171B] dark:fill-[#F5F3F0]'}`}
              >
                Food court
              </text>
            </g>

            {/* =========================================================
                MAP BEACON PIN: MAIN AUDITORIUM IS IN X-LAB!
            ========================================================== */}
            <g
              className="cursor-pointer"
              onClick={() => handleBuildingClick('x-lab')}
            >
              <circle cx="437" cy="335" r="7" fill="#6C151E" stroke="#B08D57" strokeWidth="2" />
              <circle cx="437" cy="335" r="14" fill="none" stroke="#B08D57" strokeWidth="1.5" opacity="0.6" className="animate-ping" />
              <rect x="375" y="300" width="124" height="24" rx="12" fill="#6C151E" stroke="#B08D57" strokeWidth="1" />
              <circle cx="387" cy="312" r="3.5" fill="#B08D57" />
              <text x="398" y="316" className="font-sans text-[10px] font-bold fill-white">
                Main Auditorium
              </text>
            </g>

            <g
              className="cursor-pointer"
              onClick={() => handleBuildingClick('jc-bose')}
            >
              <circle cx="587" cy="335" r="5" fill="#6C151E" stroke="#B08D57" strokeWidth="1.5" />
              <rect x="535" y="302" width="105" height="22" rx="11" fill="#24090C" stroke="#B08D57" strokeWidth="1" />
              <circle cx="546" cy="313" r="3" fill="#B08D57" />
              <text x="555" y="317" className="font-sans text-[9.5px] font-bold fill-white">
                J.C. Bose Block
              </text>
            </g>

            <g
              className="cursor-pointer"
              onClick={() => handleBuildingClick('v-block')}
            >
              <circle cx="432" cy="225" r="5" fill="#6C151E" stroke="#B08D57" strokeWidth="1.5" />
              <rect x="382" y="192" width="100" height="22" rx="11" fill="#24090C" stroke="#B08D57" strokeWidth="1" />
              <circle cx="393" cy="203" r="3" fill="#B08D57" />
              <text x="402" y="207" className="font-sans text-[9.5px] font-bold fill-white">
                V-Block
              </text>
            </g>

            <g
              className="cursor-pointer"
              onClick={() => handleBuildingClick('food-court')}
            >
              <circle cx="627" cy="465" r="5" fill="#6C151E" stroke="#B08D57" strokeWidth="1.5" />
              <rect x="582" y="432" width="90" height="22" rx="11" fill="#24090C" stroke="#B08D57" strokeWidth="1" />
              <circle cx="593" cy="443" r="3" fill="#B08D57" />
              <text x="602" y="447" className="font-sans text-[9.5px] font-bold fill-white">
                Food Court
              </text>
            </g>

            <g
              className="cursor-pointer"
              onClick={() => handleBuildingClick('sr-block')}
            >
              <circle cx="280" cy="410" r="5" fill="#6C151E" stroke="#B08D57" strokeWidth="1.5" />
              <rect x="235" y="377" width="90" height="22" rx="11" fill="#24090C" stroke="#B08D57" strokeWidth="1" />
              <circle cx="246" cy="388" r="3" fill="#B08D57" />
              <text x="255" y="392" className="font-sans text-[9.5px] font-bold fill-white">
                S-Block
              </text>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
