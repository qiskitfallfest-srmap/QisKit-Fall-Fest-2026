'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

interface SmoothScrollContextValue {
  lenis: Lenis | null;
  scrollTo: (
    target: string | HTMLElement | number,
    options?: {
      offset?: number;
      duration?: number;
      easing?: (t: number) => number;
      immediate?: boolean;
      lock?: boolean;
      force?: boolean;
      onComplete?: () => void;
    }
  ) => void;
}

const SmoothScrollContext = React.createContext<SmoothScrollContextValue>({
  lenis: null,
  scrollTo: () => {},
});

export function useSmoothScroll(): SmoothScrollContextValue {
  return React.useContext(SmoothScrollContext);
}

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const pathname = usePathname();
  const [lenisInstance, setLenisInstance] = React.useState<Lenis | null>(null);
  const lenisRef = React.useRef<Lenis | null>(null);

  React.useEffect(() => {
    // Respect reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      return;
    }

    const lenis = new Lenis({
      smoothWheel: true,
      syncTouch: false, // Preserve native touch scrolling on iOS & Android
      lerp: 0.085,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.0,
      infinite: false,
      orientation: 'vertical',
      gestureOrientation: 'vertical',
    });

    lenisRef.current = lenis;
    setLenisInstance(lenis);

    let rafId: number;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    // Section anchor links with smooth scroll & dynamic navbar offset
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement | null)?.closest('a');
      if (!target) return;
      const href = target.getAttribute('href');
      if (!href) return;

      if (href.startsWith('#') && href.length > 1) {
        try {
          const el = document.querySelector(href);
          if (el) {
            e.preventDefault();
            const navbarHeight = window.innerWidth >= 1280 ? 90 : window.innerWidth >= 640 ? 84 : 78;
            lenis.scrollTo(el as HTMLElement, { offset: -navbarHeight });
          }
        } catch {
          // Ignore invalid selector
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);

    return () => {
      document.removeEventListener('click', handleAnchorClick);
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
      setLenisInstance(null);
    };
  }, []);

  // Reset scroll to top on route change
  React.useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  const scrollTo = React.useCallback(
    (
      target: string | HTMLElement | number,
      options?: {
        offset?: number;
        duration?: number;
        easing?: (t: number) => number;
        immediate?: boolean;
        lock?: boolean;
        force?: boolean;
        onComplete?: () => void;
      }
    ) => {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(target, options);
      } else if (typeof window !== 'undefined') {
        if (typeof target === 'number') {
          window.scrollTo({ top: target, behavior: options?.immediate ? 'auto' : 'smooth' });
        } else if (typeof target === 'string') {
          const el = document.querySelector(target);
          if (el) {
            const top = (el as HTMLElement).offsetTop + (options?.offset || 0);
            window.scrollTo({ top, behavior: options?.immediate ? 'auto' : 'smooth' });
          }
        } else if (target instanceof HTMLElement) {
          const top = target.offsetTop + (options?.offset || 0);
          window.scrollTo({ top, behavior: options?.immediate ? 'auto' : 'smooth' });
        }
      }
    },
    []
  );

  const contextValue = React.useMemo(
    () => ({
      lenis: lenisInstance,
      scrollTo,
    }),
    [lenisInstance, scrollTo]
  );

  return (
    <SmoothScrollContext.Provider value={contextValue}>
      {children}
    </SmoothScrollContext.Provider>
  );
}

