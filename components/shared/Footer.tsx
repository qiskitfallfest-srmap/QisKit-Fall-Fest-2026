'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ArrowUp, Globe2 } from 'lucide-react';
import { REGISTRATION_URL } from '@/lib/constants';
import SingularityHorizon from '@/components/ui/singularity-horizon';

const LEGAL_DOCUMENTS = {
  privacy: { path: '/documents/privacy-policy.pdf', available: false },
  terms: { path: '/documents/terms-of-use.pdf', available: false },
  accessibility: { path: '/documents/accessibility-statement.pdf', available: false }
};

const FOOTER_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Experience', href: '/experience' },
  { label: 'Schedule', href: '/schedule' },
  { label: 'Venues', href: '/venues' },
  { label: 'Team', href: '/team' },
  { label: 'FAQs', href: '/faqs' }
];

export function Footer() {
  const [isVisible, setIsVisible] = useState(false);
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setTimeout(() => setIsVisible(true), 0);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), 0);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderLegalLink = (key: keyof typeof LEGAL_DOCUMENTS, label: string) => {
    const doc = LEGAL_DOCUMENTS[key];
    if (doc.available) {
      return (
        <a 
          href={doc.path} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="hover:text-[#781421] dark:hover:text-[#D9A75D] transition-colors duration-200"
        >
          {label}
        </a>
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
          opacity: 0; transform: translateY(28px); filter: blur(3px); transition-duration: 760ms; transition-delay: 0ms;
        }
        .is-visible .reveal-brand {
          opacity: 1; transform: translateY(0); filter: blur(0);
        }
        .reveal-sep-1 {
          transform: scaleY(0); transform-origin: top; transition-duration: 700ms; transition-delay: 70ms; transition-property: transform; transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
        }
        .is-visible .reveal-sep-1 { transform: scaleY(1); }
        .reveal-nav {
          opacity: 0; transform: translateY(28px); transition-duration: 760ms; transition-delay: 100ms;
        }
        .is-visible .reveal-nav { opacity: 1; transform: translateY(0); }
        .reveal-sep-2 {
          transform: scaleY(0); transform-origin: top; transition-duration: 700ms; transition-delay: 150ms; transition-property: transform; transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
        }
        .is-visible .reveal-sep-2 { transform: scaleY(1); }
        .reveal-cta {
          opacity: 0; transform: translateY(30px) scale(0.985); transition-duration: 820ms; transition-delay: 180ms;
        }
        .is-visible .reveal-cta { opacity: 1; transform: translateY(0) scale(1); }
        .reveal-actions {
          opacity: 0; transform: translateY(20px); transition-duration: 720ms; transition-delay: 260ms;
        }
        .is-visible .reveal-actions { opacity: 1; transform: translateY(0); }
        .reveal-divider {
          transform: scaleX(0); transform-origin: center; transition-duration: 800ms; transition-delay: 390ms; transition-property: transform; transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
        }
        .is-visible .reveal-divider { transform: scaleX(1); }
        .reveal-legal {
          opacity: 0; transform: translateY(16px); transition-duration: 700ms; transition-delay: 340ms;
        }
        .is-visible .reveal-legal { opacity: 1; transform: translateY(0); }
        
        .reveal-watermark {
          opacity: 0; transform: translateY(28px) scale(0.995); transition-duration: 1000ms; transition-delay: 400ms;
        }
        .is-visible .reveal-watermark {
          opacity: 0.80; transform: translateY(0) scale(1); letter-spacing: -0.05em;
        }
        .dark .is-visible .reveal-watermark {
          opacity: 0.86;
        }
      `}} />
      
      <footer 
        ref={footerRef}
        className={`relative w-full overflow-x-clip mb-0 pb-0 isolate bg-gradient-to-br from-[#FBF8F5] via-[#F7F3EF] to-[#F4EEEA] dark:from-[#120506] dark:via-[#1C0709] dark:to-[#160608] text-[#363130] dark:text-[#E8E0DE] transition-colors duration-300 ${isVisible ? 'is-visible' : ''}`}
      >
        {/* Primary Content Container */}
        <div className="mx-auto w-full max-w-[1920px] px-[20px] min-[480px]:px-[24px] sm:px-[28px] md:px-[36px] lg:px-[44px] xl:px-[52px] 2xl:px-[64px] min-[1920px]:px-[72px] pt-[42px] sm:pt-[46px] md:pt-[50px] lg:pt-[50px] xl:pt-[52px] 2xl:pt-[56px] min-[1920px]:pt-[56px] pb-[24px] sm:pb-[24px] md:pb-[24px] lg:pb-[24px] xl:pb-[24px] 2xl:pb-[28px]">
          
          {/* Main Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1.12fr)_minmax(210px,0.88fr)] xl:grid-cols-[minmax(420px,1.05fr)_minmax(180px,0.42fr)_minmax(520px,1.15fr)] gap-y-[30px] sm:gap-y-[34px] xl:gap-y-0 gap-x-8 xl:gap-x-[32px] 2xl:gap-x-[38px] min-[1920px]:gap-x-[44px] items-start">
            
            {/* Zone 1: Brand / Host / Partners */}
            <div className="reveal-base reveal-brand flex flex-col items-start relative space-y-[20px] lg:space-y-[22px] xl:space-y-[22px] 2xl:space-y-[24px]">
              
              {/* Top Row: Badge + Event Title */}
              <div className="flex flex-row items-center gap-[18px] sm:gap-5 xl:gap-6">
                <div className="relative w-[78px] h-[78px] min-[480px]:w-[84px] min-[480px]:h-[84px] sm:w-[92px] sm:h-[92px] md:w-[100px] md:h-[100px] lg:w-[112px] lg:h-[112px] xl:w-[128px] xl:h-[128px] 2xl:w-[142px] 2xl:h-[142px] min-[1920px]:w-[148px] min-[1920px]:h-[148px] flex-shrink-0">
                  <Image 
                    src="/images/footer/HOME-09-FALL-FEST-2026-BADGE.png" 
                    alt="Qiskit Fall Fest 2026 Badge" 
                    fill 
                    className="object-contain" 
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="font-serif leading-[1.0] tracking-[-0.02em]">
                  <div className="text-[25px] min-[480px]:text-[27px] sm:text-[29px] md:text-[32px] lg:text-[33px] xl:text-[40px] 2xl:text-[43px] min-[1920px]:text-[46px] font-bold text-[#171313] dark:text-[#F6F2F1]">QISKIT</div>
                  <div className="text-[25px] min-[480px]:text-[27px] sm:text-[29px] md:text-[32px] lg:text-[33px] xl:text-[40px] 2xl:text-[43px] min-[1920px]:text-[46px] font-bold text-[#171313] dark:text-[#F6F2F1]">FALL FEST</div>
                  <div className="text-[20px] min-[480px]:text-[22px] sm:text-[23px] md:text-[25px] lg:text-[26px] xl:text-[31px] 2xl:text-[33px] min-[1920px]:text-[34px] font-medium text-[#66605D] dark:text-[#BEB5B4] mt-1">2026</div>
                </div>
              </div>

              {/* Second Row: SRM Emblem + Text */}
              <a 
                href="https://www.srmap.edu.in/qrc/" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Visit SRM University-AP"
                className="group flex items-center gap-[14px] lg:gap-[16px] hover:-translate-y-[1px] transition-transform duration-220 ease-[cubic-bezier(0.22,1,0.36,1)]"
              >
                <div className="relative w-[44px] h-[44px] sm:w-[46px] sm:h-[46px] lg:w-[48px] lg:h-[48px] xl:w-[50px] xl:h-[50px] min-[1920px]:w-[52px] min-[1920px]:h-[52px] flex-shrink-0 transition-transform duration-220 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]">
                  <Image 
                    src="/images/footer/srm-ap-emblem.png" 
                    alt="SRM University-AP Emblem" 
                    fill 
                    className="object-contain" 
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="uppercase tracking-[0.13em] text-[11.5px] sm:text-[12.5px] lg:text-[13px] xl:text-[13.5px] min-[1920px]:text-[14px] font-semibold text-[#24201F] dark:text-[#F2EDEC] group-hover:text-[#781421] dark:group-hover:text-[#D9A75D] transition-colors">
                  SRM UNIVERSITY-AP &middot; AMARAVATI
                </div>
              </a>

              {/* Third & Fourth Rows: Labels */}
              <div className="space-y-[5px]">
                <div className="text-[#771421] dark:text-[#D3A55D] font-semibold text-[11px] sm:text-[11.5px] lg:text-[12px] xl:text-[12.5px] min-[1920px]:text-[13px] tracking-[0.2em] uppercase">
                  Partner Plus Host
                </div>
                <div className="text-[#4D4A48] dark:text-[#D5CDCB] font-medium text-[11px] sm:text-[11.5px] lg:text-[12px] xl:text-[12.5px] min-[1920px]:text-[13px] tracking-[0.15em] uppercase">
                  A Decade of Quantum on Cloud
                </div>
              </div>

              {/* Bottom Row: IBM + Qiskit */}
              <div className="flex items-center justify-start gap-[20px] lg:gap-[22px] xl:gap-[24px]">
                {/* IBM Quantum */}
                <div className="flex-shrink-0">
                  {/* Light Theme: Dark Positive Logotype with -ml compensation for internal transparent whitespace */}
                  <div className="dark:hidden h-[68px] w-[188px] sm:h-[74px] sm:w-[205px] lg:h-[80px] lg:w-[222px] xl:h-[86px] xl:w-[240px] min-[1920px]:h-[92px] min-[1920px]:w-[254px] -ml-[28px] sm:-ml-[30px] xl:-ml-[32px] -my-[22px] sm:-my-[24px] lg:-my-[26px] xl:-my-[28px] relative flex items-center">
                    <Image
                      src="/images/branding/IBM_Quantum_logotype_pos_RGB.png"
                      alt="IBM Quantum"
                      fill
                      className="object-contain object-left select-none"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  {/* Dark Theme: Light Reverse Logotype */}
                  <div className="hidden dark:block h-[24px] w-[130px] sm:h-[26px] sm:w-[142px] lg:h-[28px] lg:w-[154px] xl:h-[30px] xl:w-[166px] min-[1920px]:h-[32px] min-[1920px]:w-[176px] relative">
                    <Image
                      src="/images/branding/IBM_Quantum_logotype_rev_RGB.png"
                      alt="IBM Quantum"
                      fill
                      className="object-contain object-left select-none"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
                
                <div className="w-[1px] h-[34px] sm:h-[36px] lg:h-[38px] xl:h-[38px] bg-[#6C151E]/20 dark:bg-[#6C151E]/50"></div>

                {/* Qiskit Logo & Text */}
                <div className="flex items-center gap-[9px] sm:gap-[10px]">
                  <div className="relative h-[29px] w-[29px] sm:h-[31px] sm:w-[31px] lg:h-[33px] lg:w-[33px] xl:h-[36px] xl:w-[36px] min-[1920px]:h-[38px] min-[1920px]:w-[38px]">
                    {/* Light Theme: Dark Qiskit Mark */}
                    <Image 
                      src="/images/footer/HOME-09-FOOTER-QISKIT-DARK.png" 
                      alt="" 
                      fill 
                      className="object-contain dark:hidden" 
                      referrerPolicy="no-referrer"
                    />
                    {/* Dark Theme: Light Qiskit Mark */}
                    <Image 
                      src="/images/footer/HOME-09-FOOTER-QISKIT-LIGHT.png" 
                      alt="" 
                      fill 
                      className="object-contain hidden dark:block" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="font-semibold tracking-[0.01em] text-[17px] sm:text-[18px] lg:text-[19px] xl:text-[21px] min-[1920px]:text-[22px] text-[#161616] dark:text-[#F4F4F4]">
                    Qiskit
                  </span>
                </div>
              </div>
            </div>

            {/* Zone 2: Event Navigation */}
            <div className="reveal-base reveal-nav flex flex-col items-start space-y-[18px] relative xl:pl-2 2xl:pl-3">
              <h4 className="text-[11.5px] sm:text-[12px] lg:text-[12.5px] xl:text-[13px] min-[1920px]:text-[13.5px] font-semibold tracking-[0.17em] uppercase text-[#771421] dark:text-[#D4A75F]">
                EVENT
              </h4>
              <ul className="grid grid-cols-2 xl:grid-cols-1 gap-y-[16px] sm:gap-y-[16px] lg:gap-y-[17px] gap-x-6 sm:gap-x-8 text-[15px] sm:text-[15.5px] lg:text-[16px] xl:text-[16.5px] min-[1920px]:text-[17px] font-medium">
                {FOOTER_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="group relative inline-flex items-center text-[#1E1918] dark:text-[#F1ECEB] hover:text-[#781421] dark:hover:text-[#D9A75D] transition-colors duration-200">
                      <span>{link.label}</span>
                      <span className="absolute -bottom-1 left-0 w-full h-[1px] bg-[#781421] dark:bg-[#D9A75D] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"></span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Zone 3: Singularity Horizon & Actions */}
            <div className="sm:col-span-2 xl:col-span-1 flex flex-col xl:pl-2 2xl:pl-3">
              
              {/* Singularity Horizon Accretion Disk */}
              <div className="reveal-base reveal-cta relative w-full h-[220px] sm:h-[230px] md:h-[240px] lg:h-[245px] xl:h-[250px] 2xl:h-[260px] min-[1920px]:h-[270px] flex items-center justify-center overflow-hidden">
                <SingularityHorizon
                  height="100%"
                  hud={true}
                  className="w-full h-full"
                />
              </div>

              {/* Bottom Row: Register Now + Socials */}
              <div className="reveal-base reveal-actions flex flex-col md:flex-row items-start md:items-center justify-between gap-[16px] md:gap-[24px] lg:gap-[30px] xl:gap-[36px] w-full pt-[12px] lg:pt-[14px] xl:pt-[16px]">
                <div className="flex items-center w-full sm:w-auto">
                  <a 
                    href={REGISTRATION_URL} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group flex-1 sm:flex-none inline-flex items-center justify-center gap-[10px] px-8 lg:px-9 xl:px-10 h-[54px] lg:h-[54px] xl:h-[54px] min-[1920px]:h-[54px] w-full sm:w-[205px] lg:w-[220px] xl:w-[240px] min-[1920px]:w-[240px] bg-gradient-to-r from-[#6C151E] to-[#521018] dark:from-[#3A0B10] dark:to-[#24090C] border border-transparent dark:border-[#521018] text-[#FCF8F2] dark:text-[#F4F4F4] font-semibold tracking-wide uppercase text-[13px] sm:text-[13.5px] rounded-[10px] sm:rounded-[12px] hover:-translate-y-[2px] active:translate-y-0 active:scale-[0.99] hover:shadow-[0_10px_28px_rgba(108,21,30,0.25)] dark:hover:shadow-[0_10px_30px_rgba(180,40,58,0.18)] hover:from-[#7c1822] hover:to-[#5e131b] dark:hover:from-[#4a0e14] dark:hover:to-[#310c11] transition-all duration-240 ease-[cubic-bezier(0.22,1,0.36,1)] relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#6C151E] focus:ring-offset-2 dark:focus:ring-offset-[#120506]"
                  >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_800ms_ease-out_forwards]"></span>
                    <span className="relative">REGISTER NOW</span>
                    <ArrowRight size={17} className="relative transition-transform duration-240 ease-out group-hover:translate-x-[5px]" />
                  </a>
                </div>

                {/* Socials */}
                <div className="flex items-center gap-[10px] lg:gap-[12px] w-full sm:w-auto justify-start sm:justify-center mt-1 sm:mt-0">
                  <a href="https://www.instagram.com/srmuap/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-[42px] h-[42px] sm:w-[43px] sm:h-[43px] lg:w-[44px] lg:h-[44px] xl:w-[44px] xl:h-[44px] min-[1920px]:w-[46px] min-[1920px]:h-[46px] flex items-center justify-center rounded-full bg-[#F7F3EF] dark:bg-[#24090C]/50 border border-[#D9C5C2] dark:border-[#461017] hover:-translate-y-[2px] hover:scale-[1.04] hover:bg-[#F4EEEA] dark:hover:bg-[#3A0B10] hover:border-[#6C151E]/40 dark:hover:border-[#D9A75D]/40 text-[#171313] dark:text-[#F6F2F1] hover:text-[#781421] dark:hover:text-[#D9A75D] hover:shadow-[0_4px_12px_rgba(108,21,30,0.08)] transition-all duration-200 ease-out">
                    <svg className="w-[17px] h-[17px] xl:w-5 xl:h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" clipRule="evenodd" /></svg>
                  </a>
                  <a href="https://www.linkedin.com/school/srmuap/posts/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-[42px] h-[42px] sm:w-[43px] sm:h-[43px] lg:w-[44px] lg:h-[44px] xl:w-[44px] xl:h-[44px] min-[1920px]:w-[46px] min-[1920px]:h-[46px] flex items-center justify-center rounded-full bg-[#F7F3EF] dark:bg-[#24090C]/50 border border-[#D9C5C2] dark:border-[#461017] hover:-translate-y-[2px] hover:scale-[1.04] hover:bg-[#F4EEEA] dark:hover:bg-[#3A0B10] hover:border-[#6C151E]/40 dark:hover:border-[#D9A75D]/40 text-[#171313] dark:text-[#F6F2F1] hover:text-[#781421] dark:hover:text-[#D9A75D] hover:shadow-[0_4px_12px_rgba(108,21,30,0.08)] transition-all duration-200 ease-out">
                    <svg className="w-[17px] h-[17px] xl:w-5 xl:h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" /></svg>
                  </a>
                  <a href="https://x.com/SRMUAP?s=20" target="_blank" rel="noopener noreferrer" aria-label="X" className="w-[42px] h-[42px] sm:w-[43px] sm:h-[43px] lg:w-[44px] lg:h-[44px] xl:w-[44px] xl:h-[44px] min-[1920px]:w-[46px] min-[1920px]:h-[46px] flex items-center justify-center rounded-full bg-[#F7F3EF] dark:bg-[#24090C]/50 border border-[#D9C5C2] dark:border-[#461017] hover:-translate-y-[2px] hover:scale-[1.04] hover:bg-[#F4EEEA] dark:hover:bg-[#3A0B10] hover:border-[#6C151E]/40 dark:hover:border-[#D9A75D]/40 text-[#171313] dark:text-[#F6F2F1] hover:text-[#781421] dark:hover:text-[#D9A75D] hover:shadow-[0_4px_12px_rgba(108,21,30,0.08)] transition-all duration-200 ease-out">
                    <svg className="w-[13px] h-[13px] xl:w-[15px] xl:h-[15px]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.007 3.968H5.078z" /></svg>
                  </a>
                  <a href="https://www.srmap.edu.in/" target="_blank" rel="noopener noreferrer" aria-label="SRM University-AP Website" className="w-[42px] h-[42px] sm:w-[43px] sm:h-[43px] lg:w-[44px] lg:h-[44px] xl:w-[44px] xl:h-[44px] min-[1920px]:w-[46px] min-[1920px]:h-[46px] flex items-center justify-center rounded-full bg-[#F7F3EF] dark:bg-[#24090C]/50 border border-[#D9C5C2] dark:border-[#461017] hover:-translate-y-[2px] hover:scale-[1.04] hover:bg-[#F4EEEA] dark:hover:bg-[#3A0B10] hover:border-[#6C151E]/40 dark:hover:border-[#D9A75D]/40 text-[#171313] dark:text-[#F6F2F1] hover:text-[#781421] dark:hover:text-[#D9A75D] hover:shadow-[0_4px_12px_rgba(108,21,30,0.08)] transition-all duration-200 ease-out">
                    <Globe2 size={18} strokeWidth={1.8} />
                  </a>
                </div>
              </div>
            </div>
            
          </div>
        </div>

        {/* Full-width Divider */}
        <div className="reveal-base reveal-divider w-full h-[1px] bg-[rgba(108,21,30,0.16)] dark:bg-[rgba(130,32,44,0.32)] relative z-20 mt-[24px] lg:mt-[25px] xl:mt-[27px] mb-0"></div>

        {/* Legal & Meta Row - Max Width Container */}
        <div className="reveal-base reveal-legal relative z-20 mx-auto w-full max-w-[1920px] px-[20px] min-[480px]:px-[24px] sm:px-[28px] md:px-[36px] lg:px-[44px] xl:px-[52px] 2xl:px-[64px] min-[1920px]:px-[72px] pt-[16px] pb-[3px] md:pb-[2px] xl:pb-[1px]">
          <div className="flex flex-col xl:flex-row items-center justify-between gap-[12px] sm:gap-[14px] xl:gap-5 text-[11.5px] sm:text-[12px] md:text-[12.5px] lg:text-[13px] xl:text-[13.5px] font-medium text-[#4A5058] dark:text-[#DAD2D0] w-full">
            
            {/* Mobile/Tablet Row 1 / Desktop Left */}
            <div className="flex flex-wrap items-center justify-center xl:justify-start gap-2 sm:gap-2.5 text-center xl:text-left w-full xl:w-auto flex-shrink-0">
              <span>&copy; 2026 Qiskit Fall Fest &middot; SRM University-AP. All rights reserved.</span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] sm:text-[10.5px] font-mono font-semibold tracking-wider uppercase bg-[rgba(108,21,30,0.08)] dark:bg-[rgba(240,107,120,0.12)] text-[#781421] dark:text-[#EF7481] border border-[rgba(108,21,30,0.18)] dark:border-[rgba(240,107,120,0.22)]">
                v1.0 Official
              </span>
            </div>
            
            {/* Mobile/Tablet Row 2 wrapper */}
            <div className="flex flex-col sm:flex-row items-center justify-between w-full xl:w-auto xl:flex-1 xl:justify-end gap-[14px] sm:gap-4 xl:gap-0">
              {/* Center */}
              <div className="flex items-center flex-wrap justify-center gap-3 sm:gap-4 xl:px-4 xl:mx-auto">
                {renderLegalLink('privacy', 'Privacy')}
                <span className="w-[1px] h-3.5 sm:h-4 bg-[#4A5058]/20 dark:bg-[#DAD2D0]/20"></span>
                {renderLegalLink('terms', 'Terms')}
                <span className="w-[1px] h-3.5 sm:h-4 bg-[#4A5058]/20 dark:bg-[#DAD2D0]/20"></span>
                {renderLegalLink('accessibility', 'Accessibility')}
              </div>

              {/* Right */}
              <div className="flex items-center justify-center gap-5 sm:gap-6">
                <span>Amaravati &middot; India</span>
                <span className="hidden lg:block w-[1px] h-4 bg-[#4A5058]/20 dark:bg-[#DAD2D0]/20"></span>
                <button 
                  onClick={scrollToTop} 
                  className="group flex items-center justify-center gap-[10px] hover:text-[#781421] dark:hover:text-[#D9A75D] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#781421] rounded-full pl-2 pr-1 py-1 lg:p-0 lg:rounded-none"
                  aria-label="Back to top"
                >
                  <span className="hidden sm:inline">Back to top</span>
                  <span className="flex items-center justify-center w-[38px] h-[38px] md:w-[44px] md:h-[44px] rounded-full border border-[#D9C5C2] dark:border-[#461017] bg-[#F7F3EF] dark:bg-[#24090C]/50 group-hover:bg-[#781421] group-hover:border-[#781421] group-hover:text-[#F7F3EF] dark:group-hover:bg-[#D9A75D] dark:group-hover:border-[#D9A75D] dark:group-hover:text-[#160608] transition-all">
                    <ArrowUp size={16} />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Full-width Watermark Stage */}
        <div
          className="
            relative z-10 w-full mb-0 pb-0
            overflow-hidden
            pointer-events-none select-none
            flex items-end justify-center
            px-[8px] sm:px-[10px] md:px-[12px] lg:px-[14px] xl:px-[16px] min-[1920px]:px-[20px]
          "
          aria-hidden="true"
        >
          <h2
            className="
              reveal-base reveal-watermark
              font-serif font-bold
              leading-[0.84]
              tracking-[-0.05em]
              whitespace-nowrap
              text-center
              text-[clamp(28px,8vw,164px)]
              text-[#E4C4BE]/80
              dark:text-[#42151C]/86
              mb-0 pb-0
            "
          >
            QISKIT FALL FEST 2026
          </h2>
        </div>
      </footer>
    </>
  );
}
