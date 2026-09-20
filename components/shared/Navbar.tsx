'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Sun, Moon, ArrowRight, Menu, X } from 'lucide-react';
import clsx from 'clsx';
import { REGISTRATION_URL } from '@/lib/constants';

export const NAVBAR_JOIN_HREF = REGISTRATION_URL;
export { REGISTRATION_URL };

const NAV_LINKS = [
  { label: 'About', href: '/about' },
  { label: 'Experience', href: '/experience' },
  { label: 'Schedule', href: '/schedule' },
  { label: 'Venues', href: '/venues' },
  { label: 'Team', href: '/team' },
  { label: 'FAQs', href: '/faqs' },
];

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme, systemTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const headerRef = React.useRef<HTMLElement>(null);
  const progressBarRef = React.useRef<HTMLDivElement>(null);

  const activeTheme = theme === 'system' ? systemTheme : theme;

  // Scroll-progress line handler (uses RAF and direct transform scaleX, no React re-renders)
  React.useEffect(() => {
    let ticking = false;

    const updateScrollProgress = () => {
      if (!progressBarRef.current) return;
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? Math.min(Math.max(scrollY / maxScroll, 0), 1) : 0;
      progressBarRef.current.style.transform = `scaleX(${progress})`;
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateScrollProgress);
      }
    };

    const handleResize = () => {
      handleScroll();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    // Initial update
    updateScrollProgress();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [pathname]);

  // Route-aware navigation links:
  // When on an inner page, the current route is excluded, and Home is prepended at the first position.
  const visibleLinks = React.useMemo(() => {
    if (pathname === '/about') {
      return [
        { label: 'Home', href: '/' },
        { label: 'Experience', href: '/experience' },
        { label: 'Schedule', href: '/schedule' },
        { label: 'Venues', href: '/venues' },
        { label: 'Team', href: '/team' },
        { label: 'FAQs', href: '/faqs' },
      ];
    }
    if (pathname.startsWith('/team')) {
      return [
        { label: 'Home', href: '/' },
        { label: 'About', href: '/about' },
        { label: 'Experience', href: '/experience' },
        { label: 'Schedule', href: '/schedule' },
        { label: 'Venues', href: '/venues' },
        { label: 'FAQs', href: '/faqs' },
      ];
    }
    if (pathname === '/') {
      return NAV_LINKS;
    }
    // For other routes: include Home first, and filter out current route
    return [
      { label: 'Home', href: '/' },
      ...NAV_LINKS.filter((link) => link.href !== pathname),
    ];
  }, [pathname]);

  // Close menu on route change during render
  const [prevPathname, setPrevPathname] = React.useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
  }

  // Handle escape key and click outside to close open menu
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  return (
    <header 
      ref={headerRef}
      className="sticky top-0 z-50 w-full border-b border-[var(--nav-border)] [background:var(--nav-bg)] text-[var(--nav-text)] transition-colors duration-300"
    >
      {/* =========================================================
          TOP EDGE SCROLL PROGRESS LINE
      ========================================================== */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 h-[2px] w-full z-40 overflow-hidden"
      >
        <div
          ref={progressBarRef}
          className="
            h-full w-full origin-left will-change-transform
            bg-[linear-gradient(90deg,#6C101A_0%,#A9182A_60%,#C44352_100%)]
            shadow-[0_0_5px_rgba(143,23,35,0.18)]
            dark:bg-[linear-gradient(90deg,#8F1723_0%,#E45464_55%,#FF9AA3_100%)]
            dark:shadow-[0_0_6px_rgba(239,116,129,0.20)]
          "
          style={{ transform: 'scaleX(0)' }}
        />
      </div>

      <div className="mx-auto flex h-[78px] sm:h-[84px] xl:h-[90px] max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-12">
        
        {/* LEFT BLOCK: Qiskit Mark + Event Branding */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 xl:gap-3.5 group outline-none focus-visible:ring-2 focus-visible:ring-burgundy rounded-sm">
            {/* Qiskit Globe Mark */}
            <div className="relative h-[48px] w-[48px] sm:h-[54px] sm:w-[54px] xl:h-[52px] xl:w-[52px] shrink-0">
              <Image
                src="/images/branding/HOME-09-FOOTER-QISKIT-DARK.png"
                alt="Qiskit Mark"
                width={54}
                height={54}
                className="h-full w-full object-contain dark:hidden"
                referrerPolicy="no-referrer"
              />
              <Image
                src="/images/branding/HOME-09-FOOTER-QISKIT-LIGHT.png"
                alt="Qiskit Mark"
                width={54}
                height={54}
                className="hidden h-full w-full object-contain dark:block"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Event Branding */}
            <div className="flex flex-col justify-center leading-none mt-0.5">
              <span className="text-[13px] sm:text-[14px] xl:text-[13px] 2xl:text-sm font-semibold tracking-[0.14em] text-[var(--brand-text)]">
                QISKIT FALL FEST
              </span>
              <span className="text-[26px] sm:text-[28px] xl:text-[30px] font-bold text-[var(--brand-text)] mt-0.5 sm:mt-1">
                2026
              </span>
            </div>
          </Link>
        </div>

        {/* CENTER BLOCK: Primary Navigation (Desktop) */}
        <nav className="hidden xl:flex items-center gap-8 2xl:gap-10">
          {visibleLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[15px] font-medium transition-colors hover:text-[var(--nav-hover)] outline-none focus-visible:ring-2 focus-visible:ring-burgundy rounded-sm px-1 py-0.5"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* RIGHT BLOCK: Theme Toggle + Join + SRM Logo (Desktop) */}
        <div className="hidden xl:flex items-center gap-6 2xl:gap-8">
          
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(activeTheme === 'dark' ? 'light' : 'dark')}
            className="group relative flex h-[34px] w-[72px] cursor-pointer items-center rounded-full border border-[var(--nav-border)] bg-[var(--background)] p-1 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-burgundy shadow-sm"
            aria-label="Toggle theme"
          >
            {/* Toggle background indicator */}
            <div
              className="absolute h-[26px] w-[26px] rounded-full bg-[var(--nav-text)] transition-transform duration-300 translate-x-0 dark:translate-x-[38px] shadow-sm"
            />
            
            <div className="relative z-10 flex w-full justify-between px-[5px] text-[var(--background)] items-center">
              <Sun size={14} className="transition-opacity opacity-100 dark:opacity-50 dark:text-[var(--nav-text)]" />
              <Moon size={14} className="transition-opacity opacity-50 text-[var(--nav-text)] dark:opacity-100 dark:text-[var(--background)]" />
            </div>
          </button>

          {/* Join CTA */}
          <a
            href={NAVBAR_JOIN_HREF} 
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="cta"
            className="group flex h-[44px] min-w-[110px] items-center justify-center gap-[14px] rounded-[8px] px-[24px] text-[14px] font-semibold tracking-[0.01em] outline-none transition-all duration-160 ease-[cubic-bezier(0.22,1,0.36,1)] bg-[#7A111B] text-[#FFF9F6] border border-[rgba(108,21,30,0.90)] shadow-[0_4px_14px_rgba(108,21,30,0.08)] hover:bg-[#961824] hover:shadow-[0_7px_20px_rgba(108,21,30,0.14)] hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.985] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] focus-visible:ring-burgundy dark:bg-transparent dark:text-[#FFF5F3] dark:border dark:border-burgundy dark:shadow-none dark:hover:bg-burgundy/10 dark:hover:shadow-[0_0_15px_rgba(108,21,30,0.5)] dark:hover:translate-y-0 dark:active:scale-100"
          >
            <span>Join</span>
            <ArrowRight size={17} strokeWidth={1.8} className="transition-transform duration-160 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-[3px]" />
          </a>

          {/* SRM Logo */}
          <div className="relative h-[56px] w-[140px] shrink-0">
            <Image
              src="/images/branding/srm-ap-logo-horizontal-backgroundless.png"
              alt="SRM University-AP"
              width={140}
              height={56}
              className="h-full w-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* MOBILE & TABLET CONTROLS */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 xl:hidden">
          {/* Mobile/Tablet Theme Toggle */}
          <button
            onClick={() => setTheme(activeTheme === 'dark' ? 'light' : 'dark')}
            className="flex h-11 w-11 items-center justify-center rounded-md text-[var(--nav-text)] transition-colors hover:text-[var(--nav-hover)] outline-none focus-visible:ring-2 focus-visible:ring-burgundy"
            aria-label="Toggle theme"
          >
            <span className="hidden dark:inline"><Moon size={20} /></span>
            <span className="inline dark:hidden"><Sun size={20} /></span>
          </button>
          
          {/* Mobile/Tablet Menu / Close Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-11 w-11 items-center justify-center rounded-md text-[var(--nav-text)] transition-colors hover:text-[var(--nav-hover)] outline-none focus-visible:ring-2 focus-visible:ring-burgundy"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE & TABLET EXPANDED OVERLAY MENU (POSITIONS ABOVE PAGE CONTENT WITHOUT LAYOUT SHIFT) */}
      {mobileMenuOpen && (
        <div 
          className="absolute top-full left-0 w-full border-b border-[var(--nav-border)] [background:var(--nav-bg)] text-[var(--nav-text)] shadow-2xl xl:hidden max-h-[calc(100dvh-78px)] sm:max-h-[calc(100dvh-84px)] overflow-y-auto"
          role="dialog"
          aria-modal="false"
          aria-label="Navigation menu"
        >
          <div className="mx-auto max-w-xl md:max-w-2xl px-4 py-6 sm:px-8 sm:py-8 flex flex-col">
            <nav className="flex flex-col gap-1.5 sm:gap-2 w-full">
              {visibleLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={clsx(
                      "flex h-12 sm:h-[50px] min-h-[48px] w-full items-center justify-start text-left px-4 sm:px-5 rounded-lg text-base sm:text-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-burgundy",
                      isActive
                        ? "font-semibold text-burgundy dark:text-[#B08D57] bg-burgundy/10 dark:bg-white/10"
                        : "font-medium text-[var(--nav-text)] hover:text-burgundy hover:bg-burgundy/5 dark:hover:text-[#B08D57] dark:focus-visible:text-[#B08D57] dark:hover:bg-white/5 active:bg-burgundy/10 dark:active:bg-white/10"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Thin Horizontal Divider */}
            <div className="my-5 sm:my-6 h-px w-full bg-[var(--nav-divider)]" />

            {/* Full-width Join Button */}
            <a
              href={NAVBAR_JOIN_HREF}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="cta"
              className="group flex h-12 w-full items-center justify-center gap-[14px] rounded-[8px] text-[15px] sm:text-base font-semibold tracking-[0.01em] outline-none transition-all duration-160 bg-[#7A111B] text-[#FFF9F6] border border-[rgba(108,21,30,0.90)] shadow-[0_4px_14px_rgba(108,21,30,0.08)] hover:bg-[#961824] active:scale-[0.985] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] focus-visible:ring-burgundy dark:border dark:border-burgundy dark:bg-transparent dark:text-[#FFF5F3] dark:shadow-none dark:hover:bg-burgundy/10"
            >
              <span>Join</span>
              <ArrowRight size={17} strokeWidth={1.8} className="transition-transform duration-160 group-hover:translate-x-[3px]" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
