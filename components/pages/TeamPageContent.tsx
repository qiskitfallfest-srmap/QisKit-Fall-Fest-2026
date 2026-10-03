'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { Footer } from '@/components/shared/Footer';
import { HeroAnimatedGradient } from '@/components/shared/HeroAnimatedGradient';
import { BlurReveal } from '@/components/ui/blur-reveal';
import { TextBlockAnimation } from '@/components/ui/text-block-animation';
import { MagicText } from '@/components/ui/magic-text';
import { OrganizationalTreeChart } from '@/components/team/OrganizationalTreeChart';
import { REGISTRATION_URL } from '@/lib/constants';
import { trackUnstopClick } from '@/lib/analytics';

interface StatItem {
  id: string;
  targetNumber: number;
  prefix?: string;
  suffix?: string;
  padZero?: boolean;
  metric: string;
  subtext: string;
}

const IMPACT_STATS: StatItem[] = [
  {
    id: 'participants',
    targetNumber: 5000,
    suffix: '+',
    metric: 'Expected Participants',
    subtext: 'Students, researchers, and quantum developers congregating across India.',
  },
  {
    id: 'hackathon',
    targetNumber: 24,
    metric: 'Hours of Quantum Hackathon',
    subtext: 'Intensive challenge solving with Qiskit 1.x algorithms and error mitigation.',
  },
  {
    id: 'access',
    targetNumber: 100,
    suffix: '%',
    metric: 'Open Access Platform',
    subtext: 'SRM University-AP × IBM joint curriculum accessible to all accepted cohorts.',
  },
  {
    id: 'days',
    targetNumber: 3,
    padZero: true,
    metric: 'Conference Days',
    subtext: 'Keynotes, hands-on lab sessions, circuit synthesis workshops, and finals.',
  },
];

/**
 * Animated arrival count-up component with energetic speed easing
 */
function AnimatedCountStat({
  targetNumber,
  prefix = '',
  suffix = '',
  padZero = false,
  duration = 1.35,
}: {
  targetNumber: number;
  prefix?: string;
  suffix?: string;
  padZero?: boolean;
  duration?: number;
}) {
  const [count, setCount] = React.useState(0);
  const [hasStarted, setHasStarted] = React.useState(false);
  const elementRef = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasStarted) {
            setHasStarted(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasStarted]);

  React.useEffect(() => {
    if (!hasStarted) return;

    let startTimestamp: number | null = null;
    let animId: number;
    const durMs = duration * 1000;

    const step = (now: number) => {
      if (!startTimestamp) startTimestamp = now;
      const elapsed = now - startTimestamp;
      const progress = Math.min(elapsed / durMs, 1);

      // Fast-start exponential ease-out for energetic arrival
      const easeProgress = 1 - Math.pow(1 - progress, 3.5);
      const currentVal = Math.round(easeProgress * targetNumber);

      setCount(currentVal);

      if (progress < 1) {
        animId = requestAnimationFrame(step);
      } else {
        setCount(targetNumber);
      }
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [hasStarted, targetNumber, duration]);

  const formattedValue = React.useMemo(() => {
    if (padZero && count < 10) {
      return `0${count}`;
    }
    return `${count}`;
  }, [count, padZero]);

  return (
    <span ref={elementRef} className="tabular-nums">
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  );
}

export default function TeamPage() {
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
            <span>02 • The Narrative</span>
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
          SECTION 03: OUR COLLECTIVE IMPACT
          Key statistics / impact strip from design reference
          ───────────────────────────────────────────────────────────── */}
      <section
        id="section-03-our-collective-impact"
        aria-label="Our Collective Impact"
        className="relative w-full py-20 sm:py-24 bg-[#3A0B10] text-[#F5F3F0] border-b border-black/30 selection:bg-[#6C151E] selection:text-white overflow-hidden"
      >
        {/* Atmospheric Quantum Ambient Lighting for Rich Frosted Glass Refraction */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#800020]/45 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[460px] h-[460px] bg-[#B08D57]/20 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute -bottom-32 left-1/3 w-80 h-80 bg-[#6C151E]/35 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-12">

          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
            <div className="space-y-2">
              <span className="text-xs font-mono font-semibold tracking-[0.2em] uppercase text-[#B08D57]">
                03 • Reach & Momentum
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white">
                Our Collective Impact<span className="text-[#B08D57]">.</span>
              </h2>
            </div>
            <p className="text-xs font-mono text-[#C7C8CC] max-w-md">
              Uniting academia, research labs, and next-generation quantum programmers into one rigorous environment.
            </p>
          </div>

          {/* Statistics 4-column Strip with High-Performance Glassmorphism */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {IMPACT_STATS.map((stat, idx) => (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.55, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="group relative flex flex-col justify-between p-7 sm:p-8 rounded-2xl bg-gradient-to-br from-white/[0.09] via-white/[0.04] to-white/[0.015] backdrop-blur-2xl border border-white/20 hover:border-[#B08D57]/70 shadow-[inset_0_1px_1px_rgba(255,255,255,0.45),0_12px_40px_rgba(0,0,0,0.45)] hover:shadow-[0_22px_55px_rgba(0,0,0,0.65),inset_0_1px_2px_rgba(255,255,255,0.55),0_0_35px_rgba(176,141,87,0.22)] hover:-translate-y-1.5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden cursor-pointer"
              >
                {/* Specular top-edge glass sheen highlight */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.12] via-white/[0.02] to-transparent pointer-events-none" />

                {/* Ambient corner refractive gold glow */}
                <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-[#B08D57]/15 blur-2xl group-hover:bg-[#B08D57]/30 transition-all duration-500 pointer-events-none" />

                {/* Top Row: Animated Number & Order Pill */}
                <div className="relative z-10 flex items-baseline justify-between mb-5">
                  <span className="text-4xl sm:text-5xl lg:text-[3.25rem] font-serif font-bold tracking-tight bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-transparent drop-shadow-sm leading-none">
                    <AnimatedCountStat
                      targetNumber={stat.targetNumber}
                      prefix={stat.prefix}
                      suffix={stat.suffix}
                      padZero={stat.padZero}
                    />
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold tracking-wider text-[#B08D57] bg-white/10 backdrop-blur-md border border-white/20 shadow-xs group-hover:border-[#B08D57]/50 group-hover:bg-[#B08D57]/15 transition-all duration-300">
                    0{idx + 1}
                  </span>
                </div>

                {/* Middle Row: Metric Label with Gold Dot */}
                <div className="relative z-10 text-xs sm:text-sm font-mono font-bold tracking-wider text-[#F5F3F0] uppercase flex items-center gap-2 mb-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B08D57] group-hover:scale-125 transition-transform duration-300 shrink-0" />
                  <span>{stat.metric}</span>
                </div>

                {/* Bottom Row: Detailed Subtext */}
                <p className="relative z-10 text-xs sm:text-sm font-sans text-[#C7C8CC]/80 leading-relaxed font-normal group-hover:text-white/95 transition-colors duration-300">
                  {stat.subtext}
                </p>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 04: ORGANIZATIONAL STRUCTURE & HIERARCHICAL FLOW
          Interactive Tree Chart faithfully rendering the 16 operational cells
          across 5 tracks, followed by the philosophical epigraph
          ───────────────────────────────────────────────────────────── */}
      <section
        id="section-04-organizational-structure"
        aria-label="Organizational Structure & Hierarchy"
        className="w-full py-20 sm:py-24 lg:py-28 bg-[#F5F3F0] dark:bg-[#1A0507] border-b border-[#3A0B10]/15 dark:border-[#F5F3F0]/10 transition-colors duration-300 relative overflow-hidden"
      >
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-12 space-y-16">

          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-[0.2em] bg-[#6C151E]/10 dark:bg-[#6C151E]/30 text-[#6C151E] dark:text-[#B08D57] border border-[#6C151E]/20">
              <span>04 • Organizational Structure</span>
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
          SECTION 05: BE PART OF OUR JOURNEY / CTA
          Burgundy CTA section with external Unstop registration redirect
          ───────────────────────────────────────────────────────────── */}
      <section
        id="section-05-be-part-of-our-journey"
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
              05 • Registration Portal
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
              href={REGISTRATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackUnstopClick('team_page')}
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
          SECTION 06: FOOTER
          Reusing the global shared Footer component
          ───────────────────────────────────────────────────────────── */}
      <Footer />

    </div>
  );
}
