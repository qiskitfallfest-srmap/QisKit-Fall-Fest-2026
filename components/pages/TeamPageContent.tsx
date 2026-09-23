'use client';

import * as React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  ArrowUpRight,
  ArrowDown,
  Users,
  Code,
  Layers,
  Compass,
  CheckCircle2,
  Cpu,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { Footer } from '@/components/shared/Footer';
import { HeroAnimatedGradient } from '@/components/shared/HeroAnimatedGradient';
import { LayeredText } from '@/components/ui/layered-text';
import { BlurReveal } from '@/components/ui/blur-reveal';
import { TextBlockAnimation } from '@/components/ui/text-block-animation';
import { TeamBranchCard } from '@/components/ui/card-17';
import { CoverflowCarousel, CoverflowSlide } from '@/components/ui/coverflow-carousel';
import { MagicText } from '@/components/ui/magic-text';
import { OrganizationalTreeChart } from '@/components/team/OrganizationalTreeChart';
import { cn } from '@/lib/utils';

const IMPACT_STATS = [
  {
    value: '500+',
    metric: 'Expected Participants',
    subtext: 'Students, researchers, and quantum developers congregating across India.',
  },
  {
    value: '24',
    metric: 'Hours of Quantum Hackathon',
    subtext: 'Intensive challenge solving with Qiskit 1.x algorithms and error mitigation.',
  },
  {
    value: '100%',
    metric: 'Open Access Platform',
    subtext: 'SRM University-AP × IBM joint curriculum accessible to all accepted cohorts.',
  },
  {
    value: '05',
    metric: 'Conference Days',
    subtext: 'Keynotes, hands-on lab sessions, circuit synthesis workshops, and finals.',
  },
];

// ─────────────────────────────────────────────────────────────
// COHORT 01: WEBSITE DEVELOPMENT TEAM ROSTER SLIDES
// ─────────────────────────────────────────────────────────────
const WEBSITE_TEAM_SLIDES: CoverflowSlide[] = [
  {
    src: '/images/team/srihaas-pigilam.jpg',
    alt: 'Srihaas Pigilam',
    title: 'Srihaas Pigilam',
    subtitle: 'Team Leader',
    meta: [
      { label: 'Branch', value: 'Website Team' },
      { label: 'Role', value: 'Team Leader' },
      { label: 'Track', value: 'Full-Stack Engineering & Architecture' },
    ],
  },
  {
    src: '/images/team/pradnish-chintada.jpg',
    alt: 'Pradnish Chintada',
    title: 'Pradnish Chintada',
    subtitle: 'Lead UI/UX and Frontend',
    meta: [
      { label: 'Branch', value: 'Website Team' },
      { label: 'Role', value: 'Lead UI/UX and Frontend' },
      { label: 'Track', value: 'UI/UX Design & Component Systems' },
    ],
  },
  {
    src: '/images/team/shaik-subhani.jpg',
    alt: 'Shaik Mahaboob Subhani',
    title: 'Shaik Mahaboob Subhani',
    subtitle: 'Co-lead UI/UX and Components',
    meta: [
      { label: 'Branch', value: 'Website Team' },
      { label: 'Role', value: 'Co-lead UI/UX and Components' },
      { label: 'Track', value: 'UI/UX Architecture & Primitives' },
    ],
  },
  {
    src: '/images/team/robert-bandaru.jpg',
    alt: 'Robert Bandaru',
    title: 'Robert Bandaru',
    subtitle: 'UI/UX and documentation',
    meta: [
      { label: 'Branch', value: 'Website Team' },
      { label: 'Role', value: 'UI/UX and documentation' },
      { label: 'Track', value: 'Design Flow & Technical Docs' },
    ],
  },
  {
    src: '/images/team/sandeep-nambi.jpg',
    alt: 'Sandeep Nambi',
    title: 'Sandeep Nambi',
    subtitle: 'UI/UX Technical and Documentation',
    meta: [
      { label: 'Branch', value: 'Website Team' },
      { label: 'Role', value: 'UI/UX Technical and Documentation' },
      { label: 'Track', value: 'Technical UI/UX & Interface Docs' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// COHORT 02: ORGANISING TEAM LEADERSHIP ROSTER SLIDES
// ─────────────────────────────────────────────────────────────
const ORGANISING_TEAM_SLIDES: CoverflowSlide[] = [
  {
    src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=800&q=80',
    alt: 'Dr. K. S. Ramanujan',
    title: 'Dr. K. S. Ramanujan',
    subtitle: 'Faculty Co-Lead • Quantum Algorithms',
    meta: [
      { label: 'Track', value: 'Technical & Innovation (TI-01)' },
      { label: 'Focus', value: '127-Qubit Eagle Benchmarks' },
      { label: 'Affiliation', value: 'Dept. of CSE, SRM AP' },
    ],
  },
  {
    src: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=80',
    alt: 'Prof. Meera Sundaram',
    title: 'Prof. Meera Sundaram',
    subtitle: 'Curriculum Chair & Associate Professor',
    meta: [
      { label: 'Track', value: 'Curriculum & Workshops (TI-02)' },
      { label: 'Focus', value: 'Qiskit 1.x Algorithmic Pedagogy' },
      { label: 'Affiliation', value: 'Physics & Computational Sciences' },
    ],
  },
  {
    src: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=800&q=80',
    alt: 'Dr. Vasudha Rao',
    title: 'Dr. Vasudha Rao',
    subtitle: 'IBM University Liaison Chair',
    meta: [
      { label: 'Track', value: 'Industry Partnerships (IPGR-01)' },
      { label: 'Focus', value: 'IBM Quantum Fall Fest Charter' },
      { label: 'Affiliation', value: 'Dean of International Alliances' },
    ],
  },
  {
    src: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
    alt: 'Prof. S. R. Mukhopadhyay',
    title: 'Prof. S. R. Mukhopadhyay',
    subtitle: 'Speaker Protocol Dean & Plenary Liaison',
    meta: [
      { label: 'Track', value: 'Guest Relations (IPGR-02)' },
      { label: 'Focus', value: 'Visiting Plenary Scientists & VIPs' },
      { label: 'Affiliation', value: 'Senior Advisory Council' },
    ],
  },
  {
    src: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=800&q=80',
    alt: 'Pallavi Nambiar',
    title: 'Pallavi Nambiar',
    subtitle: 'Creative Director • Brand & Visual Media',
    meta: [
      { label: 'Track', value: 'Marketing & Brand (MBM-01)' },
      { label: 'Focus', value: 'Editorial Print & Stage Identity' },
      { label: 'Affiliation', value: 'Design & Visual Arts Cell' },
    ],
  },
  {
    src: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=800&q=80',
    alt: 'Col. V. R. Patnaik',
    title: 'Col. V. R. Patnaik',
    subtitle: 'Venue Operations & Logistics Director',
    meta: [
      { label: 'Track', value: 'Operations & Admin (OA-01)' },
      { label: 'Focus', value: '600-Capacity Auditorium & HPC Labs' },
      { label: 'Affiliation', value: 'Estate & Infrastructure Office' },
    ],
  },
];

export default function TeamPage() {
  const [selectedTeam, setSelectedTeam] = useState<'website' | 'organizing'>('website');

  const handleSelectTeam = (team: 'website' | 'organizing') => {
    setSelectedTeam(team);
    // On desktop, scroll to the dedicated showcase section below the cards
    // On mobile & tablets (< 1024px), scroll smoothly to the selected card's inline showcase
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        const isDesktop = window.innerWidth >= 1024;
        if (isDesktop) {
          const targetElement = document.getElementById('section-roster-showcase');
          if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        } else {
          const mobileTarget = document.getElementById(
            team === 'website' ? 'mobile-card-website' : 'mobile-card-organizing'
          );
          if (mobileTarget) {
            mobileTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }
    }, 50);
  };

  return (
    <div className="w-full flex flex-col min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[#6C151E] selection:text-[#F5F3F0]">

      {/* ─────────────────────────────────────────────────────────────
          SECTION 01: HERO — "Our Team."
          Burgundy and ivory editorial treatment matching design reference
          ───────────────────────────────────────────────────────────── */}
      <section
        id="section-01-hero"
        aria-label="Meet the People Behind the experience"
        className="relative w-full h-[calc(100vh-78px)] sm:h-[calc(100vh-84px)] xl:h-[calc(100vh-90px)] supports-[height:100dvh]:h-[calc(100dvh-78px)] sm:supports-[height:100dvh]:h-[calc(100dvh-84px)] xl:supports-[height:100dvh]:h-[calc(100dvh-90px)] min-h-[460px] flex items-center justify-center border-b border-[#3A0B10]/15 dark:border-white/10 bg-[#F8F4EE] dark:bg-[#000000] text-[#16171B] dark:text-[#F5F3F0] transition-colors duration-300 overflow-hidden"
      >
        {/* WebGL2 Animated Gradient (Beige & #800020 in Light, Black & #800020 in Dark) */}
        <HeroAnimatedGradient />

        {/* Ambient Subtle Contrast Overlay (seamless with no bleaching at bottom) */}
        <div className="absolute inset-0 pointer-events-none bg-black/[0.02] dark:bg-black/20 z-[1]" />

        <div className="relative z-10 w-full h-full mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-12 flex flex-col items-center justify-center text-center">
          <div className="flex flex-col items-center justify-center font-serif font-bold tracking-tight uppercase text-[#16171B] dark:text-[#F5F3F0] text-[clamp(34px,5.2vw,75px)] leading-[1.12] sm:leading-[1.08] select-none">
            <BlurReveal
              as="h1"
              delay={0.1}
              speedReveal={1.5}
              speedSegment={0.6}
              className="inline-block"
            >
              MEET THE
            </BlurReveal>
            <BlurReveal
              as="h2"
              delay={0.28}
              speedReveal={1.5}
              speedSegment={0.6}
              className="inline-block"
            >
              PEOPLE
            </BlurReveal>
            <BlurReveal
              as="h2"
              delay={0.46}
              speedReveal={1.5}
              speedSegment={0.6}
              className="inline-block"
            >
              BEHIND
            </BlurReveal>
            <BlurReveal
              as="h2"
              delay={0.64}
              speedReveal={1.5}
              speedSegment={0.6}
              className="inline-block"
            >
              THE EXPERIENCE
            </BlurReveal>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity pointer-events-none z-10">
          <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] text-[#3A0B10]/70 dark:text-[#F5F3F0]/70">
            Scroll to Reveal
          </span>
          <ArrowDown size={14} className="text-[#800020] dark:text-[#B08D57] animate-bounce" />
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 01.5: THE NARRATIVE — SCROLL TO REVEAL
          #3A0B10 background matching Section 04 with crisp white wipe animations
          ───────────────────────────────────────────────────────────── */}
      <section
        id="section-narrative-reveal"
        aria-label="A Decade of Quantum on Cloud"
        className="w-full min-h-[75vh] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-24 sm:py-32 bg-[#3A0B10] text-[#F5F3F0] border-b border-black/30 transition-colors duration-300 relative overflow-hidden selection:bg-[#6C151E] selection:text-white"
      >
        <div className="mx-auto max-w-4xl w-full space-y-10 sm:space-y-12 text-left">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-[0.2em] bg-white/10 text-white border border-white/20">
            <span>01.5 • The Narrative</span>
          </div>

          {/* Heading: A Decade of Quantum on Cloud */}
          <TextBlockAnimation blockColor="#FFFFFF" duration={0.7} delay={0.1}>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold tracking-tight text-white leading-[1.18]">
              A Decade of Quantum on Cloud<span className="text-[#B08D57]">.</span>
            </h2>
          </TextBlockAnimation>

          {/* Paragraph */}
          <TextBlockAnimation blockColor="#FFFFFF" stagger={0.04} duration={0.65} delay={0.15}>
            <p className="text-lg sm:text-xl md:text-2xl font-sans text-white/90 leading-relaxed font-normal">
              From the digital experience you are using to the people orchestrating the festival on campus, Qiskit Fall Fest 2026 is powered by a community working together.
            </p>
          </TextBlockAnimation>

          {/* Tagline: PEOPLE X IDEAS X TECHNOLOGY X IMPACT */}
          <div className="pt-2">
            <TextBlockAnimation blockColor="#FFFFFF" duration={0.6} delay={0.1}>
              <div className="inline-block px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg border border-white/25 bg-white/10 backdrop-blur-sm">
                <span className="text-xs sm:text-sm md:text-base font-mono font-bold tracking-[0.22em] uppercase text-white">
                  PEOPLE X IDEAS X TECHNOLOGY X IMPACT
                </span>
              </div>
            </TextBlockAnimation>
          </div>

          {/* Closing Line: Same Ideas. Brighter Horizons. */}
          <div className="pl-6 border-l-2 border-white/60 pt-2">
            <TextBlockAnimation blockColor="#FFFFFF" duration={0.6} delay={0.1}>
              <p className="text-xl sm:text-2xl md:text-3xl font-serif italic font-medium text-white">
                Same Ideas. Brighter Horizons.
              </p>
            </TextBlockAnimation>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 03: EXPLORE OUR TEAMS
          Two interactive branch cards:
          - Desktop (lg+): 2-column grid, clicking card switches cohort in Section 03.5 below
          - Mobile / Tablet (< lg): Clicking card displays that cohort's carousel directly underneath it!
          ───────────────────────────────────────────────────────────── */}
      <section
        id="section-03-explore-our-teams"
        aria-label="Explore Our Teams"
        className="w-full py-16 sm:py-20 lg:py-24 bg-[#F5F3F0] dark:bg-[#1A0507] border-b border-[#3A0B10]/15 dark:border-[#F5F3F0]/10 transition-colors duration-300"
      >
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-12 space-y-12">

          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-mono font-semibold tracking-[0.2em] uppercase text-[#6C151E] dark:text-[#B08D57]">
              03 • Team Structure
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#3A0B10] dark:text-[#F5F3F0]">
              Explore Our Teams<span className="text-[#6C151E] dark:text-[#B08D57]">.</span>
            </h2>
            <p className="text-base font-sans text-[#16171B]/75 dark:text-[#C7C8CC] leading-relaxed">
              Click either branch below to preview their interactive roster showcase, or use the top-right arrow to open the dedicated full hierarchy.
            </p>
          </div>

          {/* Responsive grid for the branch cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">

            {/* Column 01: Website Team Card + Mobile/Tablet Inline Showcase */}
            <div id="mobile-card-website" className="flex flex-col space-y-4">
              <TeamBranchCard
                branch="Branch 01"
                category="Digital Architecture & Interactive UI"
                title="Website Team"
                description="Explore the complete roster of designers, software engineers, and technical writers who engineered the official Qiskit Fall Fest 2026 digital portal."
                highlights={[
                  "Full Member Profiles & Contributions",
                  "Interactive System Architecture",
                ]}
                imageUrl="/images/team/website-team.png"
                href="/team/website"
                badgeColor="bg-[#6C151E]/20 dark:bg-[#6C151E]/40 text-[#B08D57] border-[#6C151E]/30"
                icon={<Code size={14} className="text-[#B08D57]" />}
                onSelect={() => handleSelectTeam('website')}
                isSelected={selectedTeam === 'website'}
                actionLabel="Show Website Cohort"
              />

              {/* Mobile & Tablet Only: Inline Carousel below Website Team card */}
              {selectedTeam === 'website' && (
                <div
                  id="mobile-roster-website"
                  className="block lg:hidden w-full pt-4 pb-2 transition-all duration-500 animate-in fade-in slide-in-from-top-4"
                >
                  <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#150406] border-2 border-[#3A0B10]/15 dark:border-white/10 shadow-lg space-y-5">
                    <div className="space-y-1.5">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono font-semibold uppercase tracking-[0.2em] bg-[#6C151E]/10 dark:bg-[#6C151E]/30 text-[#6C151E] dark:text-[#B08D57] border border-[#6C151E]/20">
                        <span>Website Team Roster</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#3A0B10] dark:text-[#F5F3F0]">
                        Website Development Cohort<span className="text-[#6C151E] dark:text-[#B08D57]">.</span>
                      </h3>
                      <p className="text-xs sm:text-sm font-sans text-[#16171B]/75 dark:text-[#C7C8CC]">
                        Swipe cards or tap arrows to browse engineers and UI architects.
                      </p>
                    </div>

                    <div className="relative w-full pt-1">
                      <CoverflowCarousel
                        key="mobile-roster-website"
                        slides={WEBSITE_TEAM_SLIDES}
                        rotate={36}
                        depth={0.5}
                        perspective={2.5}
                        fade={0}
                        cardWidth="clamp(210px, 62vw, 290px)"
                        showCaption={true}
                        showNavigation={true}
                        showPagination={true}
                        label="Website Team Roster"
                      />
                    </div>

                    <div className="pt-3 border-t border-[#3A0B10]/10 dark:border-white/10 flex items-center justify-between text-xs font-mono">
                      <span className="text-[#16171B]/60 dark:text-[#C7C8CC]/60">
                        {WEBSITE_TEAM_SLIDES.length} Active Members
                      </span>
                      <Link
                        href="/team/website"
                        className="inline-flex items-center gap-1 text-[#6C151E] dark:text-[#B08D57] font-semibold hover:underline"
                      >
                        <span>Full specifications</span>
                        <ArrowUpRight size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Column 02: Organising Team Card + Mobile/Tablet Inline Showcase */}
            <div id="mobile-card-organizing" className="flex flex-col space-y-4">
              <TeamBranchCard
                branch="Branch 02"
                category="Leadership, Logistics & Academic Direction"
                title="Organising Team"
                description="View the institutional hierarchy, faculty advisors, student leads, and hospitality coordinators overseeing the five-day quantum celebration at SRM AP."
                highlights={[
                  "Organisational Hierarchy Flowchart",
                  "Faculty Patronage & Committee Leads",
                ]}
                imageUrl="/images/team/organising-team.png"
                href="/team/organizing"
                badgeColor="bg-[#B08D57]/20 text-[#B08D57] border-[#B08D57]/30"
                icon={<Users size={14} className="text-[#B08D57]" />}
                onSelect={() => handleSelectTeam('organizing')}
                isSelected={selectedTeam === 'organizing'}
                actionLabel="Show Organising Cohort"
              />

              {/* Mobile & Tablet Only: Inline Carousel below Organising Team card */}
              {selectedTeam === 'organizing' && (
                <div
                  id="mobile-roster-organizing"
                  className="block lg:hidden w-full pt-4 pb-2 transition-all duration-500 animate-in fade-in slide-in-from-top-4"
                >
                  <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#150406] border-2 border-[#3A0B10]/15 dark:border-white/10 shadow-lg space-y-5">
                    <div className="space-y-1.5">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono font-semibold uppercase tracking-[0.2em] bg-[#B08D57]/10 text-[#B08D57] border border-[#B08D57]/20">
                        <span>Organising Team Roster</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#3A0B10] dark:text-[#F5F3F0]">
                        Organising Leadership Cohort<span className="text-[#6C151E] dark:text-[#B08D57]">.</span>
                      </h3>
                      <p className="text-xs sm:text-sm font-sans text-[#16171B]/75 dark:text-[#C7C8CC]">
                        Swipe cards or tap arrows to browse faculty coordinators and track chairs.
                      </p>
                    </div>

                    <div className="relative w-full pt-1">
                      <CoverflowCarousel
                        key="mobile-roster-organizing"
                        slides={ORGANISING_TEAM_SLIDES}
                        rotate={36}
                        depth={0.5}
                        perspective={2.5}
                        fade={0}
                        cardWidth="clamp(210px, 62vw, 290px)"
                        showCaption={true}
                        showNavigation={true}
                        showPagination={true}
                        label="Organising Team Roster"
                      />
                    </div>

                    <div className="pt-3 border-t border-[#3A0B10]/10 dark:border-white/10 flex items-center justify-between text-xs font-mono">
                      <span className="text-[#16171B]/60 dark:text-[#C7C8CC]/60">
                        6 Leadership Leads
                      </span>
                      <Link
                        href="/team/organizing"
                        className="inline-flex items-center gap-1 text-[#6C151E] dark:text-[#B08D57] font-semibold hover:underline"
                      >
                        <span>Full specifications</span>
                        <ArrowUpRight size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 03.5: MEMBER ROSTER SHOWCASE (3D COVERFLOW - DESKTOP)
          Full-width showcase carousel displayed on large screens (lg+)
          ───────────────────────────────────────────────────────────── */}
      <section
        id="section-roster-showcase"
        aria-label="Member Roster Showcase"
        className="hidden lg:block w-full py-16 sm:py-24 bg-[#F5F3F0] dark:bg-[#1A0507] border-b border-[#3A0B10]/15 dark:border-[#F5F3F0]/10 transition-colors duration-300 overflow-hidden relative"
      >
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-12 space-y-10">
          
          {/* Header & Cohort Switcher */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#3A0B10]/15 dark:border-[#F5F3F0]/15">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-[0.2em] bg-[#6C151E]/10 dark:bg-[#6C151E]/30 text-[#6C151E] dark:text-[#B08D57] border border-[#6C151E]/20">
                <span>03.5 • Member Roster Showcase</span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#3A0B10] dark:text-[#F5F3F0] transition-all">
                {selectedTeam === 'website' ? (
                  <>Website Development Cohort<span className="text-[#6C151E] dark:text-[#B08D57]">.</span></>
                ) : (
                  <>Organising Leadership Cohort<span className="text-[#6C151E] dark:text-[#B08D57]">.</span></>
                )}
              </h2>

              <p className="text-base font-sans text-[#16171B]/75 dark:text-[#C7C8CC] leading-relaxed">
                {selectedTeam === 'website'
                  ? "Explore the engineers, UI architects, and creative technologists responsible for the official Qiskit Fall Fest 2026 digital portal."
                  : "Discover the track chairs, committee heads, and faculty coordinators orchestrating all five days of South Asia’s premier quantum festival."}
              </p>
            </div>

            {/* Direct Switcher Tabs */}
            <div className="flex items-center gap-2 p-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-[#3A0B10]/15 dark:border-white/10 self-start md:self-end">
              <button
                type="button"
                onClick={() => setSelectedTeam('website')}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-mono font-semibold uppercase tracking-wider transition-all duration-300 flex items-center gap-2",
                  selectedTeam === 'website'
                    ? "bg-[#3A0B10] text-white shadow-md"
                    : "text-[#3A0B10]/70 dark:text-[#F5F3F0]/70 hover:text-[#3A0B10] dark:hover:text-white"
                )}
              >
                <Code size={13} />
                <span>Website Team</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTeam('organizing')}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-mono font-semibold uppercase tracking-wider transition-all duration-300 flex items-center gap-2",
                  selectedTeam === 'organizing'
                    ? "bg-[#3A0B10] text-white shadow-md"
                    : "text-[#3A0B10]/70 dark:text-[#F5F3F0]/70 hover:text-[#3A0B10] dark:hover:text-white"
                )}
              >
                <Users size={13} />
                <span>Organising Team</span>
              </button>
            </div>
          </div>

          {/* 3D Coverflow Carousel */}
          <div className="relative w-full pt-4">
            <CoverflowCarousel
              key={selectedTeam}
              slides={selectedTeam === 'website' ? WEBSITE_TEAM_SLIDES : ORGANISING_TEAM_SLIDES}
              rotate={44}
              depth={0.65}
              perspective={3}
              fade={0}
              cardWidth="clamp(220px, 22vw, 320px)"
              showCaption={true}
              showNavigation={true}
              showPagination={true}
              label={selectedTeam === 'website' ? "Website Team Roster" : "Organising Team Roster"}
            />
          </div>

          {/* Sub-note link to full branch pages */}
          <div className="pt-6 border-t border-[#3A0B10]/10 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#16171B]/60 dark:text-[#C7C8CC]/60">
            <span>
              Drag cards or use keyboard arrows (← / →) to browse team members
            </span>
            <Link
              href={selectedTeam === 'website' ? '/team/website' : '/team/organizing'}
              className="inline-flex items-center gap-1.5 text-[#6C151E] dark:text-[#B08D57] font-semibold hover:underline"
            >
              <span>View full {selectedTeam === 'website' ? 'Website Team' : 'Organising Team'} specifications</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 04: OUR COLLECTIVE IMPACT
          Key statistics / impact strip from design reference
          ───────────────────────────────────────────────────────────── */}
      <section
        id="section-04-our-collective-impact"
        aria-label="Our Collective Impact"
        className="w-full py-16 sm:py-20 bg-[#3A0B10] text-[#F5F3F0] border-b border-black/30 selection:bg-[#6C151E] selection:text-white"
      >
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-12">

          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
            <div className="space-y-2">
              <span className="text-xs font-mono font-semibold tracking-[0.2em] uppercase text-[#B08D57]">
                04 • Reach & Momentum
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white">
                Our Collective Impact<span className="text-[#B08D57]">.</span>
              </h2>
            </div>
            <p className="text-xs font-mono text-[#C7C8CC] max-w-md">
              Uniting academia, research labs, and next-generation quantum programmers into one rigorous environment.
            </p>
          </div>

          {/* Statistics 4-column Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {IMPACT_STATS.map((stat, idx) => (
              <div
                key={stat.metric}
                className="space-y-3 p-6 rounded-xl bg-black/25 border border-white/10"
              >
                <div className="flex items-baseline justify-between">
                  <span className="text-4xl sm:text-5xl font-serif font-bold tracking-tight text-white">
                    {stat.value}
                  </span>
                  <span className="text-xs font-mono text-[#B08D57]">
                    0{idx + 1}
                  </span>
                </div>
                <div className="text-sm font-bold font-sans tracking-wide text-[#E5E5E7] uppercase">
                  {stat.metric}
                </div>
                <p className="text-xs font-sans text-[#C7C8CC]/85 leading-relaxed">
                  {stat.subtext}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 05: ORGANIZATIONAL STRUCTURE & HIERARCHICAL FLOW
          Interactive Tree Chart faithfully rendering the 16 operational cells
          across 5 tracks, followed by the philosophical epigraph
          ───────────────────────────────────────────────────────────── */}
      <section
        id="section-05-organizational-structure"
        aria-label="Organizational Structure & Hierarchy"
        className="w-full py-20 sm:py-24 lg:py-28 bg-[#F5F3F0] dark:bg-[#1A0507] border-b border-[#3A0B10]/15 dark:border-[#F5F3F0]/10 transition-colors duration-300 relative overflow-hidden"
      >
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-12 space-y-16">

          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-[0.2em] bg-[#6C151E]/10 dark:bg-[#6C151E]/30 text-[#6C151E] dark:text-[#B08D57] border border-[#6C151E]/20">
              <span>05 • Organizational Structure</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#3A0B10] dark:text-[#F5F3F0]">
              Organizational Hierarchy<span className="text-[#6C151E] dark:text-[#B08D57]">.</span>
            </h2>

            <p className="text-base font-sans text-[#16171B]/75 dark:text-[#C7C8CC] leading-relaxed">
              Explore the institutional governance, advisory councils, track directors, and sixteen operational cells powering Qiskit Fall Fest Amaravati 2026. Click any cell to inspect its operational mandate.
            </p>
          </div>

          {/* Interactive Organizational Tree Chart */}
          <OrganizationalTreeChart />

          {/* Epigraph / Philosophy Statement (Preserved from Section 05) */}
          <div className="pt-12 border-t border-[#3A0B10]/15 dark:border-white/10 mx-auto max-w-4xl text-center space-y-8">
            <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-[#3A0B10] dark:text-[#F5F3F0] leading-[1.25]">
              <MagicText
                text="“Quantum computing is not merely an assemblage of qubits and microwave pulses. It is a shared human endeavor requiring curiosity, empathy, and collective determination.”"
                className="justify-center text-center font-serif"
              />
            </div>

            <div className="pt-2 space-y-1">
              <div className="text-sm font-sans font-bold text-[#16171B] dark:text-[#F5F3F0] uppercase tracking-wider">
                Organising Leadership & Committee Chairs
              </div>
              <div className="text-xs font-mono text-[#16171B]/60 dark:text-[#C7C8CC]/70">
                Department of Computer Science & Engineering • SRM University-AP
              </div>
            </div>

            {/* Thin technical divider */}
            <div className="flex items-center justify-center gap-4 pt-4">
              <span className="h-px w-16 bg-[#3A0B10]/20 dark:bg-[#F5F3F0]/20" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#6C151E] dark:bg-[#B08D57]" />
              <span className="h-px w-16 bg-[#3A0B10]/20 dark:bg-[#F5F3F0]/20" />
            </div>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 06: BE PART OF OUR JOURNEY / CTA
          Burgundy CTA section with external Unstop registration redirect
          ───────────────────────────────────────────────────────────── */}
      <section
        id="section-06-be-part-of-our-journey"
        aria-label="Be Part of Our Journey"
        className="relative w-full py-20 sm:py-24 lg:py-28 bg-gradient-to-br from-[#521018] via-[#3A0B10] to-[#16171B] text-[#F5F3F0] overflow-hidden"
      >
        {/* Subtle decorative radial rings */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-white/15" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-dashed border-white/10" />
        </div>

        <div className="relative mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-12 text-center space-y-8">

          <div className="space-y-4 max-w-3xl mx-auto">
            <span className="text-xs font-mono font-semibold tracking-[0.25em] uppercase text-[#B08D57]">
              06 • Registration Portal
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white leading-tight">
              Be Part of Our Journey<span className="text-[#B08D57]">.</span>
            </h2>
            <p className="text-base sm:text-lg font-sans text-[#E5E5E7]/85 max-w-2xl mx-auto leading-relaxed font-light">
              Registration is exclusively managed via Unstop. Secure your seat for keynotes, workshops, and the 24-hour quantum hackathon before quotas fill.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-4">
            <a
              href="https://unstop.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl text-base font-semibold bg-[#F5F3F0] text-[#3A0B10] hover:bg-white hover:shadow-2xl transition-all duration-300"
            >
              <span>Register on Unstop</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform text-[#6C151E]" />
            </a>

            <Link
              href="/experience"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-xl text-base font-semibold border border-white/30 text-white hover:bg-white/10 transition-all duration-300"
            >
              <span>Explore Fest Experience</span>
            </Link>
          </div>

          {/* Technical subnote */}
          <div className="pt-6 text-xs font-mono text-[#C7C8CC]/60 max-w-md mx-auto">
            Free participation for verified academic cohorts. Hardware-backed execution credentials provided via IBM Quantum Platform.
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 07: FOOTER
          Reusing the global shared Footer component
          ───────────────────────────────────────────────────────────── */}
      <Footer />

    </div>
  );
}
