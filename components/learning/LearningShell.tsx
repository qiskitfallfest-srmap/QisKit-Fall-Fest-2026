'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface LearningShellProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}

const DEFAULT_WIDTH = 288; // 18rem (w-72)
const MIN_WIDTH = 240;
const MAX_WIDTH = 540;
const STORAGE_KEY = 'qff_learning_sidebar_width';

export function LearningShell({ children, sidebar }: LearningShellProps) {
  const [sidebarWidth, setSidebarWidth] = useState<number>(DEFAULT_WIDTH);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const asideRef = useRef<HTMLElement>(null);

  // Restore saved width from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= MIN_WIDTH && parsed <= MAX_WIDTH) {
          setSidebarWidth(parsed);
        }
      }
    } catch (e) {
      // localStorage might be unavailable in some private windows
    }
  }, []);

  // Handle Drag Resizing
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);

    const startX = e.clientX;
    const startWidth = asideRef.current ? asideRef.current.getBoundingClientRect().width : sidebarWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.min(Math.max(startWidth + deltaX, MIN_WIDTH), MAX_WIDTH);
      setSidebarWidth(newWidth);
    };

    const onMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      // Persist width
      if (asideRef.current) {
        const finalWidth = asideRef.current.getBoundingClientRect().width;
        try {
          localStorage.setItem(STORAGE_KEY, Math.round(finalWidth).toString());
        } catch (e) {}
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [sidebarWidth]);

  // Reset to default on double-click
  const handleDoubleClick = useCallback(() => {
    setSidebarWidth(DEFAULT_WIDTH);
    try {
      localStorage.setItem(STORAGE_KEY, DEFAULT_WIDTH.toString());
    } catch (e) {}
  }, []);

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

  return (
    <div className="flex-1 flex flex-col md:flex-row min-w-0">
      {/* Resizable Sidebar Container */}
      <aside
        ref={asideRef}
        data-lenis-prevent="true"
        style={{
          width: isMounted && typeof window !== 'undefined' && window.innerWidth >= 768 ? `${sidebarWidth}px` : undefined,
        }}
        className={`w-full md:shrink-0 bg-white dark:bg-[#150709] border-b md:border-b-0 md:border-r border-slate-200 dark:border-[#3D1418] md:sticky md:top-[78px] sm:md:top-[84px] xl:md:top-[90px] md:h-[calc(100vh-78px)] sm:md:h-[calc(100vh-84px)] xl:md:h-[calc(100vh-90px)] md:flex md:flex-col md:overflow-hidden z-30 overscroll-contain relative ${
          isDragging ? 'select-none pointer-events-auto' : ''
        }`}
      >
        {sidebar}

        {/* Desktop Interactive Drag Handle on Right Border */}
        <div
          onMouseDown={handleMouseDown}
          onDoubleClick={handleDoubleClick}
          role="separator"
          aria-orientation="vertical"
          aria-valuenow={sidebarWidth}
          aria-valuemin={MIN_WIDTH}
          aria-valuemax={MAX_WIDTH}
          title="Drag to resize sidebar · Double-click to reset"
          className="hidden md:flex flex-col items-center justify-center absolute top-0 right-0 w-2 h-full cursor-col-resize z-40 group select-none transition-colors"
        >
          {/* Subtle background line on hover or drag */}
          <div
            className={`w-full h-full transition-colors ${
              isDragging
                ? 'bg-burgundy/30 dark:bg-[#E89BA5]/30'
                : 'group-hover:bg-burgundy/15 dark:group-hover:bg-[#E89BA5]/15'
            }`}
          />
          {/* Centered visual grip handle */}
          <div
            className={`absolute top-1/2 -translate-y-1/2 right-0.5 w-1 h-9 rounded-full transition-all duration-150 ${
              isDragging
                ? 'bg-burgundy dark:text-[#E89BA5] scale-y-125'
                : 'bg-slate-300 dark:bg-[#3D1418] group-hover:bg-burgundy dark:group-hover:bg-[#E89BA5]'
            }`}
          />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 bg-[#FAF7F4] dark:bg-[#100405]">
        {children}
      </main>
    </div>
  );
}
