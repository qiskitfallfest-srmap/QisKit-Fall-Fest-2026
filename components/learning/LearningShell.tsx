'use client';

import React, { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react';
import { usePathname } from 'next/navigation';
import { PanelLeft, ChevronLeft, Menu } from 'lucide-react';
import clsx from 'clsx';

interface LearningShellProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}

export interface LearningSidebarContextValue {
  sidebarWidth: number;
  setSidebarWidth: (width: number) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  toggleCollapse: () => void;
}

export const LearningSidebarContext = createContext<LearningSidebarContextValue | null>(null);

export function useLearningSidebar() {
  return useContext(LearningSidebarContext);
}

const DEFAULT_WIDTH = 288; // 18rem (w-72)
const MIN_WIDTH = 200;
const MAX_WIDTH = 540;
const STORAGE_KEY = 'qff_learning_sidebar_width';
const COLLAPSED_KEY = 'qff_learning_sidebar_collapsed';

export function LearningShell({ children, sidebar }: LearningShellProps) {
  const [sidebarWidth, setSidebarWidth] = useState<number>(DEFAULT_WIDTH);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const asideRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const isCodingChallenge = pathname?.startsWith('/learning/qiskit-challenge');

  // Restore saved width and collapsed state from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    try {
      const savedWidth = localStorage.getItem(STORAGE_KEY);
      if (savedWidth) {
        const parsed = parseInt(savedWidth, 10);
        if (!isNaN(parsed) && parsed >= MIN_WIDTH && parsed <= MAX_WIDTH) {
          setSidebarWidth(parsed);
        }
      }
      const savedCollapsed = localStorage.getItem(COLLAPSED_KEY);
      if (savedCollapsed !== null) {
        setIsCollapsed(savedCollapsed === 'true');
      }
    } catch (e) {}
  }, []);

  // Listen to global toggle sidebar event
  useEffect(() => {
    const handleToggle = () => {
      setIsCollapsed((prev) => {
        const next = !prev;
        try {
          localStorage.setItem(COLLAPSED_KEY, String(next));
        } catch (e) {}
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
        }, 50);
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
        }, 200);
        return next;
      });
    };

    window.addEventListener('qff_toggle_sidebar', handleToggle);
    return () => window.removeEventListener('qff_toggle_sidebar', handleToggle);
  }, []);

  // Handle Drag Resizing
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);

    const startX = e.clientX;
    const startWidth = asideRef.current ? asideRef.current.getBoundingClientRect().width : sidebarWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const targetWidth = startWidth + deltaX;

      // If user drags to less than 160px, auto-collapse
      if (targetWidth < 160) {
        setIsCollapsed(true);
        try {
          localStorage.setItem(COLLAPSED_KEY, 'true');
        } catch (e) {}
        return;
      }

      setIsCollapsed(false);
      try {
        localStorage.setItem(COLLAPSED_KEY, 'false');
      } catch (e) {}

      const newWidth = Math.min(Math.max(targetWidth, MIN_WIDTH), MAX_WIDTH);
      setSidebarWidth(newWidth);
    };

    const onMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      // Persist width & trigger layout resize for Monaco Editor
      if (asideRef.current) {
        const finalWidth = asideRef.current.getBoundingClientRect().width;
        if (finalWidth >= MIN_WIDTH) {
          try {
            localStorage.setItem(STORAGE_KEY, Math.round(finalWidth).toString());
          } catch (e) {}
        }
      }
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 50);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [sidebarWidth]);

  // Reset to default on double-click
  const handleDoubleClick = useCallback(() => {
    if (isCollapsed) {
      setIsCollapsed(false);
      setSidebarWidth(DEFAULT_WIDTH);
      try {
        localStorage.setItem(COLLAPSED_KEY, 'false');
        localStorage.setItem(STORAGE_KEY, DEFAULT_WIDTH.toString());
      } catch (e) {}
    } else {
      setIsCollapsed(true);
      try {
        localStorage.setItem(COLLAPSED_KEY, 'true');
      } catch (e) {}
    }
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 50);
  }, [isCollapsed]);

  // Sync cursor & user-select styles while dragging
  useEffect(() => {
    if (isDragging) {
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging]);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(COLLAPSED_KEY, String(next));
      } catch (e) {}

      // If expanding and width is collapsed or below minimum, restore DEFAULT_WIDTH
      if (!next && sidebarWidth < MIN_WIDTH) {
        setSidebarWidth(DEFAULT_WIDTH);
        try {
          localStorage.setItem(STORAGE_KEY, String(DEFAULT_WIDTH));
        } catch (e) {}
      }

      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 50);
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 220);
      return next;
    });
  }, [sidebarWidth]);

  // Global Ctrl+B / Cmd+B keyboard shortcut to toggle curriculum sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        const target = e.target as HTMLElement | null;
        const tagName = target?.tagName?.toLowerCase();
        if (tagName === 'input' || tagName === 'textarea' || target?.isContentEditable) {
          return;
        }
        e.preventDefault();
        toggleCollapse();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleCollapse]);

  return (
    <LearningSidebarContext.Provider
      value={{
        sidebarWidth,
        setSidebarWidth,
        isCollapsed,
        setIsCollapsed,
        toggleCollapse,
      }}
    >
      <div className={clsx(
        'flex-1 flex flex-col md:flex-row min-w-0 relative',
        isCodingChallenge && 'min-h-0 h-full overflow-hidden'
      )}>
        {/* Global Transparent Drag Overlay to guarantee reliable mouse tracking over Monaco & iframes */}
        {isDragging && (
          <div
            className="fixed inset-0 z-50 cursor-col-resize select-none bg-transparent"
            style={{ cursor: 'col-resize' }}
          />
        )}

        {/* Resizable Sidebar Container */}
        <aside
          ref={asideRef}
          data-lenis-prevent="true"
          style={{
            width: isMounted && typeof window !== 'undefined' && window.innerWidth >= 768
              ? (isCollapsed ? 0 : `${sidebarWidth}px`)
              : undefined,
            minWidth: isMounted && typeof window !== 'undefined' && window.innerWidth >= 768
              ? (isCollapsed ? 0 : `${sidebarWidth}px`)
              : undefined,
            maxWidth: isMounted && typeof window !== 'undefined' && window.innerWidth >= 768
              ? (isCollapsed ? 0 : `${sidebarWidth}px`)
              : undefined,
          }}
          className={clsx(
            'w-full md:shrink-0 bg-white dark:bg-[#150709] border-b md:border-b-0 border-slate-200 dark:border-[#3D1418]',
            !isDragging && 'transition-[width] duration-200 ease-in-out',
            isCollapsed ? 'hidden md:flex md:w-0 md:overflow-hidden md:border-r-0' : 'md:flex md:flex-col md:border-r md:overflow-hidden',
            isCodingChallenge
              ? 'md:relative md:h-full'
              : 'md:sticky md:top-[82px] md:h-[calc(100dvh-82px)] xl:top-[88px] xl:h-[calc(100dvh-88px)]',
            'z-30 overscroll-contain',
            isDragging && 'select-none pointer-events-auto'
          )}
        >
          <div
            style={{
              width: isMounted && typeof window !== 'undefined' && window.innerWidth >= 768
                ? `${sidebarWidth}px`
                : undefined,
            }}
            className={clsx(
              'h-full flex flex-col min-w-0 transition-opacity duration-200',
              isCollapsed && 'opacity-0 pointer-events-none select-none'
            )}
          >
            {sidebar}
          </div>
        </aside>

        {/* Desktop Interactive Drag Handle between Sidebar & Main Content */}
        {!isCollapsed && (
          <div
            onMouseDown={handleMouseDown}
            onDoubleClick={handleDoubleClick}
            role="separator"
            aria-orientation="vertical"
            aria-valuenow={sidebarWidth}
            aria-valuemin={MIN_WIDTH}
            aria-valuemax={MAX_WIDTH}
            title="Drag to resize sidebar · Double-click to collapse"
            className={clsx(
              'hidden md:flex flex-col items-center justify-center w-2 cursor-col-resize z-50 group select-none shrink-0 transition-colors -mx-1 px-1',
              isCodingChallenge
                ? 'relative h-full'
                : 'sticky top-[82px] h-[calc(100dvh-82px)] xl:top-[88px] xl:h-[calc(100dvh-88px)]'
            )}
          >
            {/* Subtle vertical indicator line */}
            <div
              className={clsx(
                'w-0.5 h-full transition-colors',
                isDragging
                  ? 'bg-burgundy dark:bg-[#E89BA5]'
                  : 'bg-transparent group-hover:bg-burgundy/40 dark:group-hover:bg-[#E89BA5]/40'
              )}
            />
            {/* Centered visual grip handle */}
            <div
              className={clsx(
                'absolute top-1/2 -translate-y-1/2 w-1.5 h-10 rounded-full transition-all duration-150 flex flex-col items-center justify-center gap-1 shadow-xs',
                isDragging
                  ? 'bg-burgundy dark:bg-[#E89BA5] scale-y-125 shadow-md'
                  : 'bg-slate-300 dark:bg-[#3D1418] group-hover:bg-burgundy dark:group-hover:bg-[#E89BA5]'
              )}
            >
              <div className="w-0.5 h-0.5 rounded-full bg-white dark:bg-black/60" />
              <div className="w-0.5 h-0.5 rounded-full bg-white dark:bg-black/60" />
              <div className="w-0.5 h-0.5 rounded-full bg-white dark:bg-black/60" />
            </div>

            {/* Quick collapse button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleCollapse();
              }}
              title="Collapse Sidebar"
              className="absolute top-4 -right-1 w-5 h-5 rounded-full bg-white dark:bg-[#1C0A0D] border border-slate-200 dark:border-[#3D1418] text-slate-400 hover:text-burgundy dark:hover:text-[#E89BA5] flex items-center justify-center shadow-xs cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity z-50"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Floating expand button (with 3 horizontal lines) when sidebar is collapsed on desktop */}
        {isCollapsed && isMounted && !isCodingChallenge && (
          <button
            type="button"
            onClick={toggleCollapse}
            title="Expand Curriculum Sidebar (Ctrl+B)"
            aria-label="Expand Curriculum Sidebar"
            className="hidden md:inline-flex items-center gap-2 z-40 px-3 py-1.5 rounded-xl border border-slate-200/90 dark:border-[#3D1418] bg-white/95 dark:bg-[#150709]/95 backdrop-blur-md text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-burgundy dark:hover:text-[#E89BA5] hover:bg-slate-50 dark:hover:bg-[#250D11] shadow-sm hover:shadow-md cursor-pointer transition-all duration-150 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 fixed top-[94px] xl:top-[100px] left-4"
          >
            <Menu className="w-4 h-4 text-burgundy dark:text-[#E89BA5] group-hover:scale-110 transition-transform" />
            <span>Curriculum</span>
            <kbd className="hidden xl:inline-block ml-0.5 font-mono text-[9px] px-1 py-0.5 rounded bg-slate-100 dark:bg-[#250D11] text-slate-400 dark:text-slate-500 border border-slate-200/60 dark:border-[#3D1418]/60">
              Ctrl+B
            </kbd>
          </button>
        )}

        {/* Main Content Area */}
        <main className={clsx(
          'flex-1 min-w-0 bg-[#FAF7F4] dark:bg-[#100405]',
          isCodingChallenge && 'min-h-0 h-full overflow-hidden flex flex-col',
          isDragging && 'pointer-events-none select-none'
        )}>
          {children}
        </main>
      </div>
    </LearningSidebarContext.Provider>
  );
}
