'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ArrowUp } from 'lucide-react';
import { REGISTRATION_URL } from '@/lib/constants';
import SingularityHorizon from '@/components/ui/singularity-horizon';

const LEGAL_DOCUMENTS = {
  privacy: { path: '/privacy', available: true },
  terms: { path: '/terms', available: true },
  accessibility: { path: '/accessibility', available: true }
};

const FOOTER_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Experience', href: '/experience' },
  { label: 'Schedule', href: '/schedule' },
  { label: 'Venues', href: '/venues' },
  { label: 'Team', href: '/team' },
  { label: 'FAQs', href: '/faqs' },
  { label: 'Learning', href: '/learning' }
];

const PARTNER_STATEMENTS = [
  'A DECADE OF QUANTUM ON THE CLOUD',
  'LEARN · BUILD · CONNECT · CREATE IMPACT',
  'SRM UNIVERSITY-AP · AMARAVATI',
  'QISKIT FALL FEST 2026'
];

export function Footer() {
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [partnerIdx, setPartnerIdx] = useState(0);
  const [isPartnerTransitioning, setIsPartnerTransitioning] = useState(false);
  const [isWatermarkHovered, setIsWatermarkHovered] = useState(false);

  const footerRef = useRef<HTMLElement>(null);
  const watermarkRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = () => {
      setPrefersReducedMotion(mediaQuery.matches);
      if (mediaQuery.matches) {
        setIsVisible(true);
      }
    };
    handleMotionChange();
    mediaQuery.addEventListener('change', handleMotionChange);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => {
      mediaQuery.removeEventListener('change', handleMotionChange);
      observer.disconnect();
    };
  }, []);

  // Phase 22: Partner Plus Supporting Rotating Copy (hold 3200ms, transition ~460ms)
  useEffect(() => {
    if (prefersReducedMotion) return;

    const interval = setInterval(() => {
      setIsPartnerTransitioning(true);
      setTimeout(() => {
        setPartnerIdx((prev) => (prev + 1) % PARTNER_STATEMENTS.length);
        setIsPartnerTransitioning(false);
      }, 460);
    }, 3400);

    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  // Phase 24: Watermark Hover vs Idle Tracking (LOCAL coordinate space only)
  const handleWatermarkPointerEnter = () => {
    if (prefersReducedMotion) return;
    setIsWatermarkHovered(true);
    watermarkRef.current?.style.setProperty('--wm-hover', '1');
  };

  const handleWatermarkPointerLeave = () => {
    if (prefersReducedMotion) return;
    setIsWatermarkHovered(false);
    watermarkRef.current?.style.setProperty('--wm-hover', '0');
  };

  const handleWatermarkPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !watermarkRef.current) return;
    const rect = watermarkRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    watermarkRef.current.style.setProperty('--wm-x', `${x.toFixed(1)}px`);
    watermarkRef.current.style.setProperty('--wm-y', `${y.toFixed(1)}px`);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderLegalLink = (key: keyof typeof LEGAL_DOCUMENTS, label: string) => {
    const doc = LEGAL_DOCUMENTS[key];
    if (doc.available) {
      return (
        <Link 
          href={doc.path} 
          className="group relative hover:text-[#781421] dark:hover:text-[#EF7481] transition-colors duration-200 py-0.5 outline-none focus-visible:ring-1 focus-visible:ring-burgundy rounded-[2px]"
        >
          <span>{label}</span>
          <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#781421] dark:bg-[#EF7481] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-200 ease-out" />
        </Link>
      );
    }
    return (
      <span aria-disabled="true" className="opacity-60 cursor-not-allowed">
        {label}
      </span>
    );
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .reveal-base {
          transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
          transition-property: opacity, transform, filter, letter-spacing;
        }
        .reveal-brand {
          opacity: 0; transform: translateY(12px); filter: blur(3px); transition-duration: 650ms; transition-delay: 0ms;
        }
        .is-visible .reveal-brand {
          opacity: 1; transform: translateY(0); filter: blur(0);
        }
        .reveal-sep-1 {
          transform: scaleY(0); transform-origin: top; transition-duration: 700ms; transition-delay: 70ms; transition-property: transform; transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
        }
        .is-visible .reveal-sep-1 { transform: scaleY(1); }
        .reveal-nav {
          opacity: 0; transform: translateY(20px); transition-duration: 720ms; transition-delay: 100ms;
        }
        .is-visible .reveal-nav { opacity: 1; transform: translateY(0); }
        .reveal-sep-2 {
          transform: scaleY(0); transform-origin: top; transition-duration: 700ms; transition-delay: 150ms; transition-property: transform; transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
        }
        .is-visible .reveal-sep-2 { transform: scaleY(1); }
        .reveal-cta {
          opacity: 0.65; transform: translateY(16px) scale(0.99); transition-duration: 850ms; transition-delay: 160ms;
        }
        .is-visible .reveal-cta { opacity: 1; transform: translateY(0) scale(1); }
        .reveal-actions {
          opacity: 0; transform: translateY(16px); transition-duration: 700ms; transition-delay: 240ms;
        }
        .is-visible .reveal-actions { opacity: 1; transform: translateY(0); }
        .reveal-divider {
          transform: scaleX(0); transform-origin: center; transition-duration: 800ms; transition-delay: 360ms; transition-property: transform; transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
        }
        .is-visible .reveal-divider { transform: scaleX(1); }
        .reveal-legal {
          opacity: 0; transform: translateY(14px); transition-duration: 680ms; transition-delay: 320ms;
        }
        .is-visible .reveal-legal { opacity: 1; transform: translateY(0); }
        
        .reveal-watermark {
          opacity: 0; transform: translateY(24px) scale(0.995); transition-duration: 950ms; transition-delay: 380ms;
        }
        .is-visible .reveal-watermark {
          opacity: 1; transform: translateY(0) scale(1);
        }

        /* Phase 24: Watermark Idle Autonomous Sheen */
        @keyframes wm-sheen-pulse {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .footer-watermark-text {
          background: linear-gradient(
            100deg,
            rgba(228, 196, 190, 0.20) 0%,
            rgba(239, 116, 129, 0.42) 50%,
            rgba(228, 196, 190, 0.20) 100%
          );
          background-size: 200% 100%;
          animation: wm-sheen-pulse 6.2s ease-in-out infinite;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          transition: background 0.28s ease;
        }

        .dark .footer-watermark-text {
          background: linear-gradient(
            100deg,
            rgba(66, 21, 28, 0.35) 0%,
            rgba(239, 116, 129, 0.52) 50%,
            rgba(66, 21, 28, 0.35) 100%
          );
          background-size: 200% 100%;
          animation: wm-sheen-pulse 6.2s ease-in-out infinite;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          transition: background 0.28s ease;
        }

        /* Phase 24: Pointer-follow radial highlight active ONLY when hovering watermark */
        .footer-watermark-text.is-hovered {
          animation: none;
          background: radial-gradient(
            340px circle at var(--wm-x, 50%) var(--wm-y, 50%),
            rgba(239, 116, 129, 0.72) 0%,
            rgba(143, 23, 35, 0.26) 48%,
            rgba(228, 196, 190, 0.20) 76%
          );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .dark .footer-watermark-text.is-hovered {
          animation: none;
          background: radial-gradient(
            340px circle at var(--wm-x, 50%) var(--wm-y, 50%),
            rgba(239, 116, 129, 0.82) 0%,
            rgba(143, 23, 35, 0.38) 48%,
            rgba(66, 21, 28, 0.32) 76%
          );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        @media (prefers-reduced-motion: reduce) {
          .reveal-base, .reveal-brand, .reveal-nav, .reveal-cta, .reveal-actions, .reveal-divider, .reveal-legal, .reveal-watermark {
            transition: none !important;
            opacity: 1 !important;
            transform: none !important;
            filter: none !important;
          }
          .footer-watermark-text,
          .dark .footer-watermark-text,
          .footer-watermark-text.is-hovered,
          .dark .footer-watermark-text.is-hovered {
            animation: none !important;
            background: rgba(228, 196, 190, 0.25) !important;
            -webkit-background-clip: text !important;
            background-clip: text !important;
          }
          .dark .footer-watermark-text,
          .dark .footer-watermark-text.is-hovered {
            background: rgba(66, 21, 28, 0.45) !important;
            -webkit-background-clip: text !important;
            background-clip: text !important;
          }
        }
      `}} />
      
      <footer 
        ref={footerRef}
        className={`relative w-full overflow-x-clip mb-0 pb-0 isolate bg-gradient-to-br from-[#FAF6F2] via-[#F5ECE5] to-[#EFE5DD] dark:from-[#110406] dark:via-[#180609] dark:to-[#120507] text-[#211819] dark:text-[#FFF0EC] transition-colors duration-300 ${isVisible ? 'is-visible' : ''}`}
      >
        {/* Primary Content Container */}
        <div className="mx-auto w-full max-w-[1920px] px-[20px] min-[480px]:px-[24px] sm:px-[28px] md:px-[36px] lg:px-[44px] xl:px-[52px] 2xl:px-[64px] min-[1920px]:px-[72px] pt-[42px] sm:pt-[46px] md:pt-[50px] lg:pt-[50px] xl:pt-[52px] 2xl:pt-[56px] min-[1920px]:pt-[56px] pb-[24px] sm:pb-[24px] md:pb-[24px] lg:pb-[24px] xl:pb-[24px] 2xl:pb-[28px]">
          
          {/* Main Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1.12fr)_minmax(210px,0.88fr)] xl:grid-cols-[minmax(420px,1.05fr)_minmax(180px,0.42fr)_minmax(520px,1.15fr)] gap-y-[30px] sm:gap-y-[34px] xl:gap-y-0 gap-x-8 xl:gap-x-[32px] 2xl:gap-x-[38px] min-[1920px]:gap-x-[44px] items-start">
            
            {/* Zone 1: Brand / Host / Partners */}
            <div className="reveal-base reveal-brand flex flex-col items-start relative space-y-[20px] lg:space-y-[22px] xl:space-y-[22px] 2xl:space-y-[24px]">
              
              {/* Phase 20: Top Row: Badge (+4% sizing) + Event Title (clamp(48px,3vw,62px)) + Year */}
              <div className="flex flex-row items-center gap-[20px] sm:gap-[24px] xl:gap-[28px]">
                <div className="relative w-[82px] h-[82px] min-[480px]:w-[88px] min-[480px]:h-[88px] sm:w-[96px] sm:h-[96px] md:w-[104px] md:h-[104px] lg:w-[116px] lg:h-[116px] xl:w-[134px] xl:h-[134px] 2xl:w-[148px] 2xl:h-[148px] min-[1920px]:w-[154px] min-[1920px]:h-[154px] flex-shrink-0">
                  <Image 
                    src="/images/footer/HOME-09-FALL-FEST-2026-BADGE.webp" 
                    alt="Qiskit Fall Fest 2026 Badge" 
                    fill 
                    sizes="(max-width: 768px) 104px, 148px"
                    className="object-contain" 
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="font-serif leading-[0.93] tracking-[-0.025em]">
                  <div className="text-[28px] min-[480px]:text-[32px] sm:text-[36px] md:text-[40px] lg:text-[42px] xl:text-[clamp(48px,3vw,62px)] font-bold text-[#351C20] dark:text-[#FFF0EC]">
                    QISKIT
                  </div>
                  <div className="text-[28px] min-[480px]:text-[32px] sm:text-[36px] md:text-[40px] lg:text-[42px] xl:text-[clamp(48px,3vw,62px)] font-bold text-[#351C20] dark:text-[#FFF0EC] mt-0.5">
                    FALL FEST
                  </div>
                  <div className="text-[22px] min-[480px]:text-[24px] sm:text-[26px] md:text-[28px] lg:text-[30px] xl:text-[36px] font-medium text-[rgba(71,45,48,0.70)] dark:text-[rgba(255,240,236,0.72)] mt-1">
                    2026
                  </div>
                </div>
              </div>

              {/* Second Row: SRM Emblem + Text */}
              <a 
                href="https://www.srmap.edu.in/qrc/" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Visit SRM University-AP"
                className="group flex items-center gap-[16px] xl:gap-[18px] hover:-translate-y-[1px] transition-transform duration-220 ease-[cubic-bezier(0.22,1,0.36,1)] outline-none focus-visible:ring-2 focus-visible:ring-burgundy rounded-[4px]"
              >
                <div className="relative w-[44px] h-[44px] sm:w-[46px] sm:h-[46px] lg:w-[48px] lg:h-[48px] xl:w-[50px] xl:h-[50px] min-[1920px]:w-[52px] min-[1920px]:h-[52px] flex-shrink-0 transition-transform duration-220 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]">
                  <Image 
                    src="/images/footer/srm-ap-emblem.webp" 
                    alt="SRM University-AP Emblem" 
                    fill 
                    sizes="52px"
                    className="object-contain" 
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="uppercase tracking-[0.13em] text-[11.5px] sm:text-[12.5px] lg:text-[13px] xl:text-[13.5px] min-[1920px]:text-[14px] font-semibold text-[#24201F] dark:text-[#F2EDEC] group-hover:text-[#781421] dark:group-hover:text-[#EF7481] transition-colors">
                  SRM UNIVERSITY-AP &middot; AMARAVATI
                </div>
              </a>

              {/* Third & Fourth Rows: Phase 21 & Phase 22 Partner Plus Host + Rotating Copy */}
              <div className="space-y-[4px]">
                <div className="text-[#8F1723] dark:text-[#E8B85D] font-bold text-[13px] sm:text-[13.5px] xl:text-[14px] tracking-[0.18em] uppercase">
                  PARTNER PLUS HOST
                </div>
                <div 
                  className="h-[1.5em] overflow-hidden relative flex items-center"
                  aria-live="polite"
                >
                  <div 
                    key={partnerIdx}
                    className={`
                      text-[#665554] dark:text-[rgba(255,236,231,0.74)] 
                      font-semibold text-[12px] sm:text-[12.5px] xl:text-[13px] 
                      tracking-[0.16em] uppercase leading-[1.35] whitespace-nowrap
                      transition-all duration-[460ms] ease-out
                      ${isPartnerTransitioning ? 'opacity-0 -translate-y-[6px]' : 'opacity-100 translate-y-0'}
                    `}
                  >
                    {prefersReducedMotion ? PARTNER_STATEMENTS[0] : PARTNER_STATEMENTS[partnerIdx]}
                  </div>
                </div>
              </div>

              {/* Bottom Row: Phase 30 IBM Quantum + Separator + Qiskit (Official Links with Identity Float & Backlight, ZERO red underlines) */}
              <div className="flex items-center justify-start gap-[24px] sm:gap-[26px] xl:gap-[28px]">
                {/* Phase 30: IBM Quantum Official Brand Link */}
                <a
                  href="https://www.ibm.com/quantum"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Visit IBM Quantum"
                  className="group relative flex-shrink-0 inline-flex items-center hover:-translate-y-[2px] transition-transform duration-[280ms] ease-out outline-none focus-visible:ring-2 focus-visible:ring-burgundy rounded-[4px]"
                >
                  {/* Phase 30: Soft Radial Backlight Glow */}
                  <span
                    aria-hidden="true"
                    className="
                      pointer-events-none absolute -inset-3 rounded-xl
                      opacity-0 group-hover:opacity-100 transition-opacity duration-[280ms] ease-out
                      [background:radial-gradient(circle,rgba(143,23,35,0.065),transparent_70%)]
                      dark:[background:radial-gradient(circle,rgba(232,184,93,0.10),transparent_70%)]
                    "
                  />

                  {/* Light Theme: Dark Positive Logotype with -ml compensation for internal transparent whitespace */}
                  <div className="dark:hidden h-[68px] w-[188px] sm:h-[74px] sm:w-[205px] lg:h-[80px] lg:w-[222px] xl:h-[86px] xl:w-[240px] min-[1920px]:h-[92px] min-[1920px]:w-[254px] -ml-[28px] sm:-ml-[30px] xl:-ml-[32px] -my-[22px] sm:-my-[24px] lg:-my-[26px] xl:-my-[28px] relative flex items-center transition-all duration-[280ms] ease-out group-hover:scale-[1.035] group-hover:opacity-100">
                    <Image
                      src="/images/branding/IBM_Quantum_logotype_pos_RGB.webp"
                      alt="IBM Quantum"
                      fill
                      sizes="(max-width: 768px) 205px, 254px"
                      className="object-contain object-left select-none"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  {/* Dark Theme: Light Reverse Logotype */}
                  <div className="hidden dark:block h-[24px] w-[130px] sm:h-[26px] sm:w-[142px] lg:h-[28px] lg:w-[154px] xl:h-[30px] xl:w-[166px] min-[1920px]:h-[32px] min-[1920px]:w-[176px] relative transition-all duration-[280ms] ease-out group-hover:scale-[1.035] group-hover:opacity-100">
                    <Image
                      src="/images/branding/IBM_Quantum_logotype_rev_RGB.webp"
                      alt="IBM Quantum"
                      fill
                      sizes="(max-width: 768px) 142px, 176px"
                      className="object-contain object-left select-none"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </a>
                
                {/* Vertical Separator (44px height) */}
                <div 
                  aria-hidden="true" 
                  className="w-[1px] h-[44px] shrink-0 bg-[rgba(143,23,35,0.18)] dark:bg-[rgba(239,116,129,0.22)]"
                />

                {/* Phase 30: Qiskit Official Brand Link */}
                <a
                  href="https://www.ibm.com/quantum/qiskit"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Visit IBM Qiskit"
                  className="group relative flex items-center gap-[10px] sm:gap-[12px] hover:-translate-y-[2px] transition-transform duration-[280ms] ease-out outline-none focus-visible:ring-2 focus-visible:ring-burgundy rounded-[4px]"
                >
                  {/* Phase 30: Soft Radial Backlight Glow */}
                  <span
                    aria-hidden="true"
                    className="
                      pointer-events-none absolute -inset-3 rounded-xl
                      opacity-0 group-hover:opacity-100 transition-opacity duration-[280ms] ease-out
                      [background:radial-gradient(circle,rgba(123,72,225,0.065),transparent_70%)]
                      dark:[background:radial-gradient(circle,rgba(153,95,255,0.10),transparent_70%)]
                    "
                  />

                  <div className="relative h-[29px] w-[29px] sm:h-[31px] sm:w-[31px] lg:h-[33px] lg:w-[33px] xl:h-[36px] xl:w-[36px] min-[1920px]:h-[38px] min-[1920px]:w-[38px] transition-transform duration-[280ms] ease-out group-hover:scale-[1.035]">
                    {/* Light Theme: Dark Qiskit Mark */}
                    <Image 
                      src="/images/footer/HOME-09-FOOTER-QISKIT-DARK.webp" 
                      alt="" 
                      fill 
                      sizes="38px"
                      className="object-contain dark:hidden" 
                      referrerPolicy="no-referrer"
                    />
                    {/* Dark Theme: Light Qiskit Mark */}
                    <Image 
                      src="/images/footer/HOME-09-FOOTER-QISKIT-LIGHT.webp" 
                      alt="" 
                      fill 
                      sizes="38px"
                      className="object-contain hidden dark:block" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="font-semibold tracking-[0.01em] text-[17px] sm:text-[18px] lg:text-[19px] xl:text-[21px] min-[1920px]:text-[22px] text-[#161616] dark:text-[#F4F4F4] group-hover:text-[#8F1723] dark:group-hover:text-[#FFF0EC] transition-colors duration-[280ms]">
                    Qiskit
                  </span>
                </a>
              </div>
            </div>

            {/* Zone 2: Event Navigation (Phase 29: Text Lift + Micro Rose Dot, NO Red Underlines) */}
            <div className="reveal-base reveal-nav flex flex-col items-start space-y-[18px] relative xl:pl-2 2xl:pl-3">
              <h4 className="text-[11.5px] sm:text-[12px] lg:text-[12.5px] xl:text-[13px] min-[1920px]:text-[13.5px] font-bold tracking-[0.17em] uppercase text-[#771421] dark:text-[#EF7481]">
                EVENT
              </h4>
              <ul className="grid grid-cols-2 xl:grid-cols-1 gap-y-[16px] sm:gap-y-[16px] lg:gap-y-[17px] gap-x-6 sm:gap-x-8 text-[15px] sm:text-[15.5px] lg:text-[16px] xl:text-[16.5px] min-[1920px]:text-[17px] font-medium">
                {FOOTER_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group relative inline-flex items-center text-[#1E1918] dark:text-[#F1ECEB] hover:text-[#781421] dark:hover:text-[#FFF0EC] hover:translate-x-[5px] transition-all duration-[260ms] ease-out outline-none focus-visible:ring-2 focus-visible:ring-burgundy rounded-[2px]"
                    >
                      {/* Micro 4px Rose Dot (Phase 29) */}
                      <span
                        aria-hidden="true"
                        className="
                          w-[4px] h-[4px] rounded-full mr-2
                          bg-[#8F1723] dark:bg-[#F07B88]
                          opacity-0 scale-40
                          group-hover:opacity-100 group-hover:scale-100
                          transition-all duration-[260ms] ease-out
                        "
                      />
                      <span className="transition-all duration-[260ms] ease-out group-hover:tracking-[0.005em]">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Zone 3: Phase 18, 27, 30 Restored Right Stack (Singularity Horizon Visualization ABOVE Register Now & Socials) */}
            <div className="sm:col-span-2 xl:col-span-1 flex flex-col xl:pl-2 2xl:pl-3">
              
              {/* Singularity Horizon Accretion Disk Canvas & HUD */}
              <div className="reveal-base reveal-cta relative w-full h-[230px] sm:h-[240px] md:h-[250px] lg:h-[255px] xl:h-[265px] 2xl:h-[275px] min-[1920px]:h-[280px] flex items-center justify-center overflow-hidden rounded-xl border border-black/5 dark:border-white/5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
                <SingularityHorizon
                  height="100%"
                  hud={true}
                  className="w-full h-full"
                />
              </div>

              {/* Bottom Action Row: Phase 18 (28px - 34px breathing room) Register Now CTA + Social Row Beneath */}
              <div className="reveal-base reveal-actions flex flex-col md:flex-row items-start md:items-center justify-between gap-[16px] md:gap-[24px] lg:gap-[28px] xl:gap-[32px] w-full pt-[28px] sm:pt-[32px] xl:pt-[34px]">
                {/* Phase 27: Register Now Button (Navbar Join Expanding Ivory Fill Language) */}
                <div className="flex items-center w-full sm:w-auto">
                  <a 
                    href={REGISTRATION_URL} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    data-cursor="cta"
                    className="
                      group relative inline-flex h-[52px] sm:h-[54px] w-full sm:w-[210px] lg:w-[225px] xl:w-[240px]
                      items-center justify-between overflow-hidden rounded-[8px] pl-6 pr-2.5 text-[14px] sm:text-[14.5px]
                      font-semibold tracking-[0.01em] outline-none
                      border border-[#7A111B]/25 dark:border-[rgba(239,116,129,0.20)]
                      bg-[#8F1723] text-[#FFF7F2]
                      shadow-[0_4px_16px_rgba(108,21,30,0.18)]
                      hover:border-transparent active:scale-[0.985]
                      focus-visible:ring-2 focus-visible:ring-burgundy focus-visible:ring-offset-2
                      transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
                    "
                  >
                    {/* Expanding Ivory Chamber (sweeps right-to-left) */}
                    <span
                      aria-hidden="true"
                      className="
                        pointer-events-none absolute right-[8px] top-1/2 -translate-y-1/2
                        h-[32px] w-[32px] rounded-full bg-[#FFF7F2]
                        transition-transform duration-[320ms] group-hover:duration-[400ms]
                        ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[14] -z-0
                      "
                    />

                    {/* Button Label */}
                    <span className="relative z-10 mr-4 tracking-wider uppercase text-[12.5px] sm:text-[13px] transition-colors duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:text-[#851722]">
                      REGISTER NOW
                    </span>

                    {/* Circular Arrow Chamber & Icon */}
                    <span
                      aria-hidden="true"
                      className="
                        relative z-10 flex h-[32px] w-[32px] items-center justify-center rounded-full
                        bg-[#FFF7F2] text-[#8F1723]
                        transition-transform duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-[2px]
                      "
                    >
                      <ArrowRight
                        size={16}
                        strokeWidth={2.4}
                      />
                    </span>
                  </a>
                </div>

                {/* Phase 31: Socials (Instagram, LinkedIn, X, WhatsApp in exact order with Lift & Theme Sensitive Glow) */}
                <div className="flex items-center gap-[10px] sm:gap-[12px] w-full sm:w-auto justify-start sm:justify-center mt-1 sm:mt-0">
                  {/* 1. Instagram */}
                  <a 
                    href="https://www.instagram.com/qiskitfallfest?stkn=MXNtZjhmNjFvbWh5Mg==" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    aria-label="Instagram" 
                    className="group w-[48px] h-[48px] sm:w-[50px] sm:h-[50px] xl:w-[52px] xl:h-[52px] flex items-center justify-center rounded-full bg-[#F7F3EF] dark:bg-[#24090C]/50 border border-[#D9C5C2] dark:border-[#461017] hover:-translate-y-[3px] hover:scale-[1.04] hover:bg-[#8F1723]/14 dark:hover:bg-[#8F1723]/22 hover:border-[#8F1723]/40 dark:hover:border-[#EF7481]/50 text-[#171313] dark:text-[#F6F2F1] hover:text-[#781421] dark:hover:text-[#EF7481] hover:shadow-[0_10px_24px_rgba(0,0,0,0.18),0_0_18px_rgba(239,116,129,0.08)] active:scale-[0.96] transition-all duration-[260ms] ease-[cubic-bezier(0.22,1,0.36,1)] outline-none focus-visible:ring-2 focus-visible:ring-[#8F1723] dark:focus-visible:ring-[#EF7481] focus-visible:ring-offset-2"
                  >
                    <svg className="w-[18px] h-[18px] xl:w-5 xl:h-5 transition-transform duration-[260ms] group-hover:scale-[1.06]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" clipRule="evenodd" />
                    </svg>
                  </a>

                  {/* 2. LinkedIn */}
                  <a 
                    href="https://www.linkedin.com/school/srmuap/posts/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    aria-label="LinkedIn" 
                    className="group w-[48px] h-[48px] sm:w-[50px] sm:h-[50px] xl:w-[52px] xl:h-[52px] flex items-center justify-center rounded-full bg-[#F7F3EF] dark:bg-[#24090C]/50 border border-[#D9C5C2] dark:border-[#461017] hover:-translate-y-[3px] hover:scale-[1.04] hover:bg-[#8F1723]/14 dark:hover:bg-[#8F1723]/22 hover:border-[#8F1723]/40 dark:hover:border-[#EF7481]/50 text-[#171313] dark:text-[#F6F2F1] hover:text-[#781421] dark:hover:text-[#EF7481] hover:shadow-[0_10px_24px_rgba(0,0,0,0.18),0_0_18px_rgba(239,116,129,0.08)] active:scale-[0.96] transition-all duration-[260ms] ease-[cubic-bezier(0.22,1,0.36,1)] outline-none focus-visible:ring-2 focus-visible:ring-[#8F1723] dark:focus-visible:ring-[#EF7481] focus-visible:ring-offset-2"
                  >
                    <svg className="w-[18px] h-[18px] xl:w-5 xl:h-5 transition-transform duration-[260ms] group-hover:scale-[1.06]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                    </svg>
                  </a>

                  {/* 3. X / Twitter */}
                  <a 
                    href="https://x.com/SRMUAP?s=20" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    aria-label="X" 
                    className="group w-[48px] h-[48px] sm:w-[50px] sm:h-[50px] xl:w-[52px] xl:h-[52px] flex items-center justify-center rounded-full bg-[#F7F3EF] dark:bg-[#24090C]/50 border border-[#D9C5C2] dark:border-[#461017] hover:-translate-y-[3px] hover:scale-[1.04] hover:bg-[#8F1723]/14 dark:hover:bg-[#8F1723]/22 hover:border-[#8F1723]/40 dark:hover:border-[#EF7481]/50 text-[#171313] dark:text-[#F6F2F1] hover:text-[#781421] dark:hover:text-[#EF7481] hover:shadow-[0_10px_24px_rgba(0,0,0,0.18),0_0_18px_rgba(239,116,129,0.08)] active:scale-[0.96] transition-all duration-[260ms] ease-[cubic-bezier(0.22,1,0.36,1)] outline-none focus-visible:ring-2 focus-visible:ring-[#8F1723] dark:focus-visible:ring-[#EF7481] focus-visible:ring-offset-2"
                  >
                    <svg className="w-[15px] h-[15px] xl:w-[16px] xl:h-[16px] transition-transform duration-[260ms] group-hover:scale-[1.06]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.007 3.968H5.078z" />
                    </svg>
                  </a>

                  {/* 4. WhatsApp */}
                  <a 
                    href="https://whatsapp.com/channel/0029Vb8LIXtCxoB0Po2jIb3k" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    aria-label="WhatsApp Channel" 
                    className="group w-[48px] h-[48px] sm:w-[50px] sm:h-[50px] xl:w-[52px] xl:h-[52px] flex items-center justify-center rounded-full bg-[#F7F3EF] dark:bg-[#24090C]/50 border border-[#D9C5C2] dark:border-[#461017] hover:-translate-y-[3px] hover:scale-[1.04] hover:bg-[#8F1723]/14 dark:hover:bg-[#8F1723]/22 hover:border-[#8F1723]/40 dark:hover:border-[#EF7481]/50 text-[#171313] dark:text-[#F6F2F1] hover:text-[#781421] dark:hover:text-[#EF7481] hover:shadow-[0_10px_24px_rgba(0,0,0,0.18),0_0_18px_rgba(239,116,129,0.08)] active:scale-[0.96] transition-all duration-[260ms] ease-[cubic-bezier(0.22,1,0.36,1)] outline-none focus-visible:ring-2 focus-visible:ring-[#8F1723] dark:focus-visible:ring-[#EF7481] focus-visible:ring-offset-2"
                  >
                    <svg className="w-[18px] h-[18px] xl:w-5 xl:h-5 transition-transform duration-[260ms] group-hover:scale-[1.06]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12.031 0C5.396 0 0 5.394 0 12.029c0 2.117.553 4.184 1.602 6.002L.069 24l6.155-1.574a12.015 12.015 0 0 0 5.807 1.493h.005c6.634 0 12.03-5.395 12.03-12.03 0-3.213-1.252-6.234-3.525-8.508A11.954 11.954 0 0 0 12.031 0zm0 22.013a9.986 9.986 0 0 1-5.093-1.39l-.365-.217-3.784.968.995-3.649-.238-.379a9.98 9.98 0 0 1-1.536-5.317c0-5.526 4.498-10.024 10.027-10.024 2.678 0 5.195 1.043 7.088 2.937a9.972 9.972 0 0 1 2.934 7.087c0 5.527-4.499 10.024-10.028 10.024zm5.494-7.498c-.3-.15-1.776-.876-2.052-.976-.275-.1-.475-.15-.675.15-.2.3-.775.976-.95 1.176-.175.2-.35.225-.65.075-.3-.15-1.267-.467-2.414-1.49-.893-.796-1.496-1.78-1.671-2.08-.175-.3-.019-.462.131-.611.135-.134.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.243-.584-.49-.505-.675-.515-.175-.008-.375-.01-.575-.01s-.525.075-.8.375c-.275.3-1.05 1.026-1.05 2.501 0 1.475 1.075 2.899 1.225 3.1.15.2 2.115 3.23 5.124 4.53 3.01 1.3 3.01.867 3.56.817.55-.05 1.775-.725 2.025-1.425.25-.7.25-1.3.175-1.425-.075-.125-.275-.2-.575-.35z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
            
          </div>
        </div>

        {/* Full-width Divider */}
        <div className="reveal-base reveal-divider w-full h-[1px] bg-[rgba(108,21,30,0.16)] dark:bg-[rgba(130,32,44,0.32)] relative z-20 mt-[24px] lg:mt-[25px] xl:mt-[27px] mb-0" />

        {/* Legal & Meta Row - Max Width Container */}
        <div className="reveal-base reveal-legal relative z-20 mx-auto w-full max-w-[1920px] px-[20px] min-[480px]:px-[24px] sm:px-[28px] md:px-[36px] lg:px-[44px] xl:px-[52px] 2xl:px-[64px] min-[1920px]:px-[72px] pt-[16px] pb-[3px] md:pb-[2px] xl:pb-[1px]">
          <div className="flex flex-col xl:flex-row items-center justify-between gap-[12px] sm:gap-[14px] xl:gap-5 text-[11.5px] sm:text-[12px] md:text-[12.5px] lg:text-[13px] xl:text-[13.5px] font-medium text-[#4A5058] dark:text-[#DAD2D0] w-full">
            
            {/* Mobile/Tablet Row 1 / Desktop Left */}
            <div className="flex flex-wrap items-center justify-center xl:justify-start gap-2 sm:gap-2.5 text-center xl:text-left w-full xl:w-auto flex-shrink-0">
              <span>&copy; 2026 Qiskit Fall Fest &middot; SRM University-AP. All rights reserved.</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10.5px] sm:text-[11px] font-mono font-bold tracking-[0.08em] uppercase bg-[rgba(108,21,30,0.08)] dark:bg-[rgba(240,107,120,0.12)] text-[#781421] dark:text-[#EF7481] border border-[rgba(108,21,30,0.22)] dark:border-[rgba(240,107,120,0.28)] hover:border-[rgba(108,21,30,0.36)] dark:hover:border-[rgba(240,107,120,0.45)] transition-colors">
                V2.0 OFFICIAL
              </span>
            </div>
            
            {/* Mobile/Tablet Row 2 wrapper */}
            <div className="flex flex-col sm:flex-row items-center justify-between w-full xl:w-auto xl:flex-1 xl:justify-end gap-[14px] sm:gap-4 xl:gap-0">
              {/* Center */}
              <div className="flex items-center flex-wrap justify-center gap-3 sm:gap-4 xl:px-4 xl:mx-auto">
                {renderLegalLink('privacy', 'Privacy')}
                <span className="w-[1px] h-3.5 sm:h-4 bg-[#4A5058]/20 dark:bg-[#DAD2D0]/20" />
                {renderLegalLink('terms', 'Terms')}
                <span className="w-[1px] h-3.5 sm:h-4 bg-[#4A5058]/20 dark:bg-[#DAD2D0]/20" />
                {renderLegalLink('accessibility', 'Accessibility')}
              </div>

              {/* Right */}
              <div className="flex items-center justify-center gap-5 sm:gap-6">
                <span>Amaravati &middot; India</span>
                <span className="hidden lg:block w-[1px] h-4 bg-[#4A5058]/20 dark:bg-[#DAD2D0]/20" />
                <button 
                  onClick={scrollToTop} 
                  className="group flex items-center justify-center gap-[10px] hover:text-[#781421] dark:hover:text-[#EF7481] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-burgundy rounded-full pl-2 pr-1 py-1 lg:p-0 lg:rounded-none"
                  aria-label="Back to top"
                >
                  <span className="hidden sm:inline">Back to top</span>
                  <span className="flex items-center justify-center w-[38px] h-[38px] md:w-[44px] md:h-[44px] rounded-full border border-[#D9C5C2] dark:border-[#461017] bg-[#F7F3EF] dark:bg-[#24090C]/50 group-hover:bg-[#8F1723]/16 group-hover:border-[#EF7481]/50 group-hover:-translate-y-[3px] group-hover:text-[#781421] dark:group-hover:text-[#EF7481] transition-all duration-200 ease-out shadow-sm">
                    <ArrowUp size={16} className="transition-transform duration-200 group-hover:-translate-y-[2px]" />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Phase 24: Watermark Stage with Local Hover Tracking & Autonomous Idle Sheen */}
        <div
          ref={watermarkRef}
          onPointerEnter={handleWatermarkPointerEnter}
          onPointerLeave={handleWatermarkPointerLeave}
          onPointerMove={handleWatermarkPointerMove}
          className="
            relative z-10 w-full mb-0 pb-0
            overflow-hidden
            select-none
            flex items-end justify-center
            px-[8px] sm:px-[10px] md:px-[12px] lg:px-[14px] xl:px-[16px] min-[1920px]:px-[20px]
            cursor-default
          "
          style={{ '--wm-x': '50%', '--wm-y': '50%', '--wm-hover': '0' } as React.CSSProperties}
          aria-hidden="true"
        >
          <h2
            className={`
              reveal-base reveal-watermark
              footer-watermark-text
              ${isWatermarkHovered ? 'is-hovered' : ''}
              font-serif font-bold
              leading-[0.84]
              tracking-[-0.045em]
              whitespace-nowrap
              text-center
              text-[clamp(28px,8vw,164px)]
              mb-0 pb-0
            `}
          >
            QISKIT FALL FEST 2026
          </h2>
        </div>
      </footer>
    </>
  );
}
