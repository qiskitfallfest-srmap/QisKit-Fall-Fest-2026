'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Sun, Moon, ArrowRight, Menu, X } from 'lucide-react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useSpring,
  useReducedMotion,
  type MotionValue,
} from 'motion/react';
import clsx from 'clsx';
import { REGISTRATION_URL } from '@/lib/constants';

export const NAVBAR_JOIN_HREF = REGISTRATION_URL;
export { REGISTRATION_URL };

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Experience', href: '/experience' },
  { label: 'Schedule', href: '/schedule' },
  { label: 'Venues', href: '/venues' },
  { label: 'Team', href: '/team' },
  { label: 'Learning', href: '/learning' },
  { label: 'FAQs', href: '/faqs' },
];

function isRouteActive(pathname: string, href: string): boolean {
  if (href === '/') {
    return pathname === '/';
  }
  return pathname === href || pathname.startsWith(href + '/');
}

interface MagneticNavLinkProps {
  link: { label: string; href: string };
  isActive: boolean;
  activeTheme: string | undefined;
  mouseX: MotionValue<number>;
  isHoveredLink: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}

function MagneticNavLink({
  link,
  isActive,
  activeTheme,
  mouseX,
  isHoveredLink,
  onHoverStart,
  onHoverEnd,
}: MagneticNavLinkProps) {
  const itemRef = React.useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const isDark = activeTheme === 'dark';

  // Real DOM center calculation
  const distance = useTransform(mouseX, (val: number) => {
    if (val === Infinity || !itemRef.current) return Infinity;
    const bounds = itemRef.current.getBoundingClientRect();
    return val - (bounds.left + bounds.width / 2);
  });

  // Magnetic scale mapping: -150px to +150px around each link center
  const rawScale = useTransform(
    distance,
    [-150, -75, 0, 75, 150],
    [1.0, 1.015, 1.048, 1.015, 1.0],
    { clamp: true }
  );

  // Magnetic translateY mapping: -150px to +150px around each link center
  const rawTranslateY = useTransform(
    distance,
    [-150, -75, 0, 75, 150],
    [0, -0.75, -2.25, -0.75, 0],
    { clamp: true }
  );

  const springConfig = { mass: 0.12, stiffness: 180, damping: 18 };
  const springScale = useSpring(rawScale, springConfig);
  const springTranslateY = useSpring(rawTranslateY, springConfig);

  const scale = shouldReduceMotion ? 1 : springScale;
  const translateY = shouldReduceMotion ? 0 : springTranslateY;

  return (
    <div
      ref={itemRef}
      className="relative inline-flex items-center"
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
    >
      {/* Shared Glass Hover Lens */}
      <AnimatePresence>
        {isHoveredLink && (
          <motion.div
            layoutId="navbar-shared-lens"
            className="absolute inset-0 rounded-full pointer-events-none -z-10"
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.045)' : 'rgba(255,255,255,0.30)',
              border: isDark ? '1px solid rgba(239,116,129,0.055)' : '1px solid rgba(122,17,27,0.055)',
              boxShadow: isDark
                ? '0 5px 14px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.035)'
                : '0 5px 14px rgba(55,20,25,0.05), inset 0 1px 0 rgba(255,255,255,0.50)',
              backdropFilter: isDark ? undefined : 'blur(10px)',
              WebkitBackdropFilter: isDark ? undefined : 'blur(10px)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <motion.div
        style={{
          scale,
          translateY,
          transformOrigin: 'center bottom',
        }}
        className="relative flex items-center"
      >
        <Link
          href={link.href}
          aria-current={isActive ? 'page' : undefined}
          className={clsx(
            "relative px-3.5 2xl:px-4 py-1.5 text-[14px] 2xl:text-[15px] font-medium outline-none rounded-full select-none focus-visible:ring-2 focus-visible:ring-burgundy transition-colors duration-160",
            isActive
              ? (isDark
                  ? "font-semibold text-[#F28A96]"
                  : "font-semibold text-[#8F1723]")
              : (isDark
                  ? "text-[#EFE5E3] hover:text-[#FFF7F5]"
                  : "text-[var(--nav-text)]/85 hover:text-burgundy")
          )}
        >
          <span className="relative z-10">{link.label}</span>

          {/* Resting Active Route Accent (Subtle persistent underline/accent) */}
          {isActive && (
            <motion.span
              layoutId="navbar-active-accent"
              className="absolute bottom-0.5 left-3.5 right-3.5 h-[2px] rounded-full pointer-events-none"
              style={{
                backgroundColor: isDark ? 'rgba(242,138,150,0.82)' : 'rgba(143,23,35,0.75)',
              }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              aria-hidden="true"
            />
          )}
        </Link>
      </motion.div>
    </div>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const mouseX = useMotionValue(Infinity);
  const [hoveredLensIndex, setHoveredLensIndex] = React.useState<number | null>(null);
  const [isJoinHovered, setIsJoinHovered] = React.useState(false);
  const [isMobileJoinHovered, setIsMobileJoinHovered] = React.useState(false);

  const headerRef = React.useRef<HTMLElement>(null);

  // Mount detection to avoid hydration theme mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const activeTheme = mounted ? (resolvedTheme || theme) : 'light';

  // =========================================================
  // UNIVERSAL SCROLL / FLOATING-STATE DETECTION (V7)
  // - Identical integrated-to-floating behavior across all routes.
  // - At page top: integrated state on every route (Home, About, etc.).
  // - Meaningful downward scroll or wheel intent sets isFloating = true.
  // - Returning genuinely to top (scrollY <= 4) restores isFloating = false.
  // - Recomputes from actual scroll position upon route change.
  // =========================================================
  const [isFloating, setIsFloating] = React.useState(false);

  React.useEffect(() => {
    const WHEEL_THRESHOLD = 14;
    const TOUCH_THRESHOLD = 18;
    const SCROLL_Y_THRESHOLD = 16;

    const checkScroll = () => {
      const currentScrollY = window.scrollY || document.documentElement.scrollTop || 0;
      if (currentScrollY > SCROLL_Y_THRESHOLD) {
        setIsFloating(true);
      } else if (currentScrollY <= 4) {
        setIsFloating(false);
      }
    };

    // Evaluate scroll position immediately on mount and route change
    checkScroll();
    const rafId = requestAnimationFrame(checkScroll);

    const handleScroll = () => {
      checkScroll();
    };

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY > WHEEL_THRESHOLD) {
        setIsFloating(true);
      } else if (e.deltaY < -WHEEL_THRESHOLD) {
        const currentScrollY = window.scrollY || document.documentElement.scrollTop || 0;
        if (currentScrollY <= 4) {
          setIsFloating(false);
        }
      }
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const deltaY = touchStartY - e.touches[0].clientY;
        if (deltaY > TOUCH_THRESHOLD) {
          setIsFloating(true);
        } else if (deltaY < -TOUCH_THRESHOLD) {
          const currentScrollY = window.scrollY || document.documentElement.scrollTop || 0;
          if (currentScrollY <= 4) {
            setIsFloating(false);
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [pathname]);

  // Close mobile menu on route change
  const [prevPathname, setPrevPathname] = React.useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
  }

  // Handle escape key and click outside to close mobile menu
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

  // =========================================================
  // FIX 1: HEADER & SHELL SURFACE STYLING SPECIFICATION (V6)
  // - Integrated state: outer header carries continuous burgundy surface, inner shell is transparent.
  // - Floating state: outer header is transparent, inner shell becomes elevated floating glass.
  // =========================================================
  const headerStyles: React.CSSProperties = React.useMemo(() => {
    const isDark = activeTheme === 'dark';
    if (!isFloating) {
      return isDark
        ? {
            background: 'linear-gradient(105deg, #26060A 0%, #30080D 50%, #3A0A10 100%)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }
        : {
            background: 'rgba(248,244,239,0.96)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          };
    }
    return {
      background: 'transparent',
      backgroundColor: 'transparent',
      backgroundImage: 'none',
      border: '0',
      borderTop: '0',
      borderBottom: '0',
      boxShadow: 'none',
      outline: '0',
      backdropFilter: 'none',
      WebkitBackdropFilter: 'none',
    };
  }, [isFloating, activeTheme]);

  const shellStyles: React.CSSProperties = React.useMemo(() => {
    const isDark = activeTheme === 'dark';
    if (!isFloating) {
      // Fix 1: Home top integrated state — inner shell is transparent, borderless, flat, shadowless
      return {
        background: 'transparent',
        border: 'none',
        boxShadow: 'none',
        borderRadius: '0px',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none',
        color: isDark ? '#F6EEEC' : undefined,
      };
    }

    // Fix 1 & Fix 2: Floating state — separate floating glass component
    return isDark
      ? {
          background: 'linear-gradient(105deg, rgba(38,6,10,0.86) 0%, rgba(48,8,13,0.84) 52%, rgba(58,10,16,0.82) 100%)',
          color: '#F7EFED',
          border: '1px solid rgba(239,116,129,0.09)',
          boxShadow: '0 12px 32px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '18px',
        }
      : {
          backgroundColor: 'rgba(248,244,239,0.80)',
          border: '1px solid rgba(108,21,30,0.07)',
          boxShadow: '0 12px 32px rgba(38,18,22,0.09), inset 0 1px 0 rgba(255,255,255,0.68)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '18px',
        };
  }, [isFloating, activeTheme]);

  // Tactile Theme Toggle track styling
  const toggleTrackStyles: React.CSSProperties = React.useMemo(() => {
    const isDark = activeTheme === 'dark';
    return isDark
      ? {
          backgroundColor: 'rgba(255,255,255,0.045)',
          border: '1px solid rgba(255,255,255,0.09)',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
        }
      : {
          backgroundColor: 'rgba(255,255,255,0.40)',
          border: '1px solid rgba(108,21,30,0.08)',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
        };
  }, [activeTheme]);

  return (
    <header
      ref={headerRef}
      style={headerStyles}
      className={clsx(
        "sticky top-0 z-50 w-full pointer-events-none transition-[padding] duration-350 ease-[cubic-bezier(0.22,1,0.36,1)]",
        isFloating
          ? "px-2 sm:px-4 lg:px-6 xl:px-8 pt-1 sm:pt-1.5 !bg-transparent !border-0 !border-none !border-transparent !shadow-none !outline-none before:!hidden after:!hidden before:!content-none after:!content-none"
          : "px-0 pt-0 !border-0 !shadow-none !outline-none"
      )}
    >
      {/* =========================================================
          INNER NAVBAR CONTENT SHELL
          Visible surface, exact height/width preservation, constant max-width
      ========================================================== */}
      <div
        style={shellStyles}
        className="pointer-events-auto mx-auto flex h-[76px] sm:h-[82px] xl:h-[88px] max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-8 2xl:px-12 relative overflow-hidden transition-[background,background-color,border-color,box-shadow,backdrop-filter,border-radius] duration-350 ease-[cubic-bezier(0.22,1,0.36,1)]"
      >
        {/* LEFT BLOCK: Qiskit Mark + Event Identity */}
        <div className="flex items-center shrink-0">
          <Link
            href="/"
            className="group flex items-center gap-2.5 sm:gap-3 xl:gap-3.5 outline-none rounded-md focus-visible:ring-2 focus-visible:ring-burgundy"
          >
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

            {/* Event Branding Typography */}
            <div className="flex flex-col justify-center leading-none mt-0.5 select-none whitespace-nowrap shrink-0">
              <span className="text-[13px] sm:text-[14px] xl:text-[13px] 2xl:text-sm font-semibold tracking-[0.14em] text-[var(--brand-text)]">
                QISKIT FALL FEST
              </span>
              <span className="text-[26px] sm:text-[28px] xl:text-[30px] font-bold text-[var(--brand-text)] mt-0.5 sm:mt-1 font-serif tracking-tight">
                2026
              </span>
            </div>
          </Link>
        </div>

        {/* CENTER BLOCK: Magnetic Cursor-Distance Navigation + Shared Glass Lens */}
        <nav
          className="hidden xl:flex items-center gap-1 2xl:gap-1.5 relative"
          aria-label="Primary Navigation"
          onMouseMove={(e) => mouseX.set(e.clientX)}
          onMouseLeave={() => {
            mouseX.set(Infinity);
            setHoveredLensIndex(null);
          }}
        >
          {NAV_LINKS.map((link, index) => {
            const isActive = isRouteActive(pathname, link.href);
            return (
              <MagneticNavLink
                key={link.href}
                link={link}
                isActive={isActive}
                activeTheme={activeTheme}
                mouseX={mouseX}
                isHoveredLink={hoveredLensIndex === index}
                onHoverStart={() => setHoveredLensIndex(index)}
                onHoverEnd={() => {}}
              />
            );
          })}
        </nav>

        {/* RIGHT BLOCK: Tactile Theme Toggle + Arrow-Fill Join CTA + SRM Logo */}
        <div className="hidden xl:flex items-center gap-4 2xl:gap-6 shrink-0">

          {/* Theme Toggle (Preserved dimensions & functionality) */}
          <button
            type="button"
            onClick={() => setTheme(activeTheme === 'dark' ? 'light' : 'dark')}
            style={toggleTrackStyles}
            className="group relative flex h-[34px] w-[72px] cursor-pointer items-center rounded-full p-[3px] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-burgundy focus-visible:ring-offset-1"
            aria-label="Toggle theme"
          >
            {/* Sliding Thumb Indicator */}
            <div
              className={clsx(
                "absolute h-[26px] w-[26px] rounded-full transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                activeTheme === 'dark'
                  ? "translate-x-[38px] bg-[#2C0A0E] border border-[#8F1723]/40 shadow-[0_2px_8px_rgba(0,0,0,0.45)]"
                  : "translate-x-0 bg-white border border-black/[0.05] shadow-[0_2px_6px_rgba(0,0,0,0.10)]"
              )}
            />

            {/* Icon Alignment Track */}
            <div className="relative z-10 flex w-full items-center justify-between px-[6px]">
              <Sun
                size={14}
                strokeWidth={2}
                className={clsx(
                  "transition-all duration-250",
                  activeTheme === 'dark'
                    ? "opacity-35 text-white/50"
                    : "opacity-100 text-[#7A111B]"
                )}
              />
              <Moon
                size={14}
                strokeWidth={2}
                className={clsx(
                  "transition-all duration-250",
                  activeTheme === 'dark'
                    ? "opacity-100 text-[#E5B869]"
                    : "opacity-35 text-black/40"
                )}
              />
            </div>
          </button>

          {/* Join CTA (Fix 3: Subtle Border in Default State, Clean Ivory Surface on Hover) */}
          <a
            href={NAVBAR_JOIN_HREF}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="cta"
            onMouseEnter={() => setIsJoinHovered(true)}
            onMouseLeave={() => setIsJoinHovered(false)}
            style={{
              borderColor: isJoinHovered
                ? 'transparent'
                : (activeTheme === 'dark' ? 'rgba(239,116,129,0.26)' : 'rgba(122,17,27,0.22)'),
              transition: 'border-color 250ms cubic-bezier(0.22,1,0.36,1), background-color 280ms cubic-bezier(0.22,1,0.36,1), color 280ms cubic-bezier(0.22,1,0.36,1), box-shadow 250ms cubic-bezier(0.22,1,0.36,1), transform 250ms cubic-bezier(0.22,1,0.36,1)',
            }}
            className="group relative flex h-[44px] min-w-[110px] items-center justify-between overflow-hidden rounded-[8px] pl-5 pr-2 text-[14px] font-semibold tracking-[0.01em] outline-none border bg-[#8F1723] text-[#FFF8F4] shadow-[0_4px_14px_rgba(108,21,30,0.12)] active:scale-[0.985] focus-visible:ring-2 focus-visible:ring-burgundy focus-visible:ring-offset-2 dark:bg-[#841521] dark:text-[#FFF3EF] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)]"
          >
            {/* Expanding Chamber: strictly clipped inside button (400ms expansion / 320ms retraction) */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-[8px] top-1/2 -translate-y-1/2 h-[28px] w-[28px] rounded-full bg-[#FFF7F2] transition-transform duration-[320ms] group-hover:duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[6.5] -z-0"
            />

            {/* CTA Label (280ms transition) */}
            <span className="relative z-10 transition-colors duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:text-[#851722] dark:group-hover:text-[#851722]">
              Join
            </span>

            {/* Circular Arrow Chamber & Icon (seamlessly merges into expanding fill) */}
            <span
              aria-hidden="true"
              className="relative z-10 flex h-[28px] w-[28px] items-center justify-center rounded-full bg-[#FFF8F4] dark:bg-[#FFF3EF] text-[#8F1723] dark:text-[#851722] border-0 border-transparent shadow-none"
            >
              <ArrowRight
                size={15}
                strokeWidth={2.2}
                className="transition-transform duration-[300ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-[2px]"
              />
            </span>
          </a>

          {/* Official SRM University-AP Production Logo */}
          <div className="relative h-[56px] w-[124px] 2xl:w-[140px] shrink-0">
            <Image
              src="/brand/srmap/SRMAP-Logo-Main.png"
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
          {/* Mobile Theme Toggle Button */}
          <button
            type="button"
            onClick={() => setTheme(activeTheme === 'dark' ? 'light' : 'dark')}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-[var(--nav-text)] transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.06] outline-none focus-visible:ring-2 focus-visible:ring-burgundy"
            aria-label="Toggle theme"
          >
            <span className="hidden dark:inline"><Moon size={20} /></span>
            <span className="inline dark:hidden"><Sun size={20} /></span>
          </button>

          {/* Mobile Menu / Close Trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-[var(--nav-text)] transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.06] outline-none focus-visible:ring-2 focus-visible:ring-burgundy"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* =========================================================
          MOBILE & TABLET EXPANDED OVERLAY MENU
          Floating glass card style, no layout shift, fully accessible
      ========================================================== */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto absolute top-full left-0 right-0 mx-auto mt-2 w-[calc(100%-16px)] sm:w-[calc(100%-32px)] max-w-xl md:max-w-2xl rounded-2xl border border-[#6C151E]/15 dark:border-white/10 bg-[#F8F4EF]/96 dark:bg-[#1A060A]/96 backdrop-blur-2xl text-[var(--nav-text)] shadow-2xl xl:hidden max-h-[calc(100dvh-90px)] overflow-y-auto"
            role="dialog"
            aria-modal="false"
            aria-label="Navigation menu"
            style={{
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            }}
          >
            <div className="px-4 py-6 sm:px-8 sm:py-8 flex flex-col">
              <nav className="flex flex-col gap-1.5 sm:gap-2 w-full" aria-label="Mobile Navigation">
                {NAV_LINKS.map((link) => {
                  const isActive = isRouteActive(pathname, link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      aria-current={isActive ? 'page' : undefined}
                      onClick={() => setMobileMenuOpen(false)}
                      className={clsx(
                        "flex h-12 sm:h-[50px] min-h-[48px] w-full items-center justify-start text-left px-4 sm:px-5 rounded-lg text-base sm:text-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-burgundy",
                        isActive
                          ? "font-semibold text-burgundy dark:text-[#F28A96] bg-burgundy/10 dark:bg-[#EF7481]/15 border border-burgundy/20 dark:border-[#EF7481]/25"
                          : "font-medium text-[var(--nav-text)] dark:text-[#EFE5E3] hover:text-burgundy hover:bg-burgundy/5 dark:hover:text-[#FFF7F5] dark:focus-visible:text-[#FFF7F5] dark:hover:bg-white/5 active:bg-burgundy/10 dark:active:bg-white/10"
                      )}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Thin Horizontal Divider */}
              <div className="my-5 sm:my-6 h-px w-full bg-[var(--nav-divider)]/40" />

              {/* Full-width Join Button with Arrow Fill */}
              <a
                href={NAVBAR_JOIN_HREF}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="cta"
                onMouseEnter={() => setIsMobileJoinHovered(true)}
                onMouseLeave={() => setIsMobileJoinHovered(false)}
                style={{
                  borderColor: isMobileJoinHovered
                    ? 'transparent'
                    : (activeTheme === 'dark' ? 'rgba(239,116,129,0.26)' : 'rgba(122,17,27,0.22)'),
                  transition: 'border-color 250ms cubic-bezier(0.22,1,0.36,1), background-color 280ms cubic-bezier(0.22,1,0.36,1), color 280ms cubic-bezier(0.22,1,0.36,1), box-shadow 250ms cubic-bezier(0.22,1,0.36,1), transform 250ms cubic-bezier(0.22,1,0.36,1)',
                }}
                className="group relative flex h-12 w-full items-center justify-between overflow-hidden rounded-[8px] pl-6 pr-3 text-[15px] sm:text-base font-semibold tracking-[0.01em] outline-none border bg-[#8F1723] text-[#FFF8F4] shadow-[0_4px_14px_rgba(108,21,30,0.12)] active:scale-[0.985] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-burgundy dark:bg-[#841521] dark:text-[#FFF3EF]"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-[10px] top-1/2 -translate-y-1/2 h-[32px] w-[32px] rounded-full bg-[#FFF7F2] transition-transform duration-[320ms] group-hover:duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[16] -z-0"
                />
                <span className="relative z-10 transition-colors duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:text-[#851722] dark:group-hover:text-[#851722]">
                  Join Festival
                </span>
                <span
                  aria-hidden="true"
                  className="relative z-10 flex h-[32px] w-[32px] items-center justify-center rounded-full bg-[#FFF8F4] dark:bg-[#FFF3EF] text-[#8F1723] dark:text-[#851722] border-0 border-transparent shadow-none"
                >
                  <ArrowRight
                    size={17}
                    strokeWidth={2.2}
                    className="transition-transform duration-[300ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-[2px]"
                  />
                </span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}



