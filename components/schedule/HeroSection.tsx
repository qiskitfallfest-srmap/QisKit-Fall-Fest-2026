'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import ParticleDrift from './ParticleDrift';
import { PhaseSelector } from './PhaseSelector';
import { SchedulePhase } from '@/data/schedule.types';
import { StaggeredTextReveal } from '@/components/ui/StaggeredTextReveal';

interface HeroSectionProps {
  currentPhase: SchedulePhase;
  onPhaseChange: (phase: SchedulePhase) => void;
}

const fadeInUpVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: (customDelay: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1] as const,
      delay: customDelay,
    },
  }),
};

export function HeroSection({ currentPhase, onPhaseChange }: HeroSectionProps) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const isDark = mounted && (theme === 'dark' || resolvedTheme === 'dark');

  // Dark mode dots MUST be beige (#F5DABF) as requested
  const baseColor = isDark ? '#F5DABF' : '#6C151E';
  const accentColor = isDark ? '#E45464' : '#8F2632';

  return (
    <section 
      id="hero" 
      data-section="top" 
      className="relative w-full snap-start overflow-hidden bg-gradient-to-b from-[#F9F5F0] via-[#F5DABF]/20 to-[#F4F0EE] dark:from-[#13090A] dark:via-[#1C0709] dark:to-[#120506] border-b border-[rgba(108,21,30,0.14)] dark:border-[rgba(108,21,30,0.3)]"
    >
      {/* BACKGROUND PARTICLE ENGINE LAYER - Subtle on mobile, full intensity on PC/Laptop */}
      <div className="absolute inset-0 z-0 opacity-35 sm:opacity-75 dark:opacity-30 dark:sm:opacity-70 overflow-hidden pointer-events-auto">
        <ParticleDrift
          baseColor={baseColor}
          accentColor={accentColor}
          density={isMobile ? 45 : 90}
          dotSize={isMobile ? 6 : 10}
          hover={isMobile ? 80 : 160}
        />
      </div>

      <div className="relative z-10 pointer-events-none mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-12 py-8 sm:py-14 md:py-18 min-h-0 sm:min-h-[500px] lg:min-h-[560px] flex flex-col justify-center">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
          
          {/* LEFT COLUMN: HERO CONTENT */}
          <div className="lg:col-span-8 flex flex-col justify-center space-y-4 sm:space-y-6 pointer-events-auto">
            
            {/* Eyebrow */}
            <motion.div 
              className="inline-flex items-center gap-3"
              initial="hidden"
              animate="visible"
              custom={0.05}
              variants={fadeInUpVariant}
            >
              <span className="h-px w-8 bg-[#A7192A] dark:bg-[#EF7885]" />
              <p className="font-bold uppercase tracking-[0.28em] leading-none text-xs sm:text-sm text-[#A7192A] dark:text-[#EF7885]">
                QUANTUM TIMELINE &middot; ONLINE &amp; ON-CAMPUS
              </p>
            </motion.div>

            {/* Headline */}
            <motion.h1 
              className="font-serif text-[clamp(2.75rem,5.5vw,5.25rem)] font-bold leading-[0.96] tracking-[-0.045em] m-0 text-[#A7192A] dark:text-[#EA8793]"
              initial="hidden"
              animate="visible"
              custom={0.15}
              variants={fadeInUpVariant}
            >
              <StaggeredTextReveal text="Full Event" delay={0.1} stagger={0.02} letterClassName="text-[#A7192A] dark:text-[#EA8793]" />{' '}
              <StaggeredTextReveal text="Schedule." delay={0.3} stagger={0.025} letterClassName="font-serif italic font-semibold text-[#6C151E] dark:text-[#F5DABF]" />
            </motion.h1>

            {/* Subheadline & Description */}
            <div className="max-w-[680px] space-y-2.5">
              <motion.div 
                className="font-bold tracking-[-0.01em] text-base sm:text-lg md:text-xl text-[#211818] dark:text-[#F8F2F0] uppercase"
                initial="hidden"
                animate="visible"
                custom={0.25}
                variants={fadeInUpVariant}
              >
                <StaggeredTextReveal text="Two phases. One global community." delay={0.4} stagger={0.015} letterClassName="text-[#211818] dark:text-[#F8F2F0]" />
              </motion.div>
              <motion.p 
                className="font-sans font-normal text-[#4E4441] dark:text-[#D6CDCA] text-base sm:text-lg leading-relaxed max-w-[660px]"
                initial="hidden"
                animate="visible"
                custom={0.35}
                variants={fadeInUpVariant}
              >
                Explore a full week of immersive masterclasses, keynote talks, hackathons, and networking — hosted across Online and SRM University-AP phases.
              </motion.p>
            </div>

            {/* Phase Selector Control Cards */}
            <motion.div 
              className="pt-2"
              initial="hidden"
              animate="visible"
              custom={0.45}
              variants={fadeInUpVariant}
            >
              <div className="mb-2.5 font-bold uppercase tracking-[0.24em] text-[11px] text-[#A7192A] dark:text-[#EF7885]">
                SELECT FESTIVAL PHASE
              </div>
              <PhaseSelector currentPhase={currentPhase} onPhaseChange={onPhaseChange} variant="cards" />
            </motion.div>
          </div>

          {/* RIGHT COLUMN: EDITORIAL SIDE COPY & ATMOSPHERIC ART */}
          <motion.div 
            className="hidden lg:flex lg:col-span-4 flex-col justify-between items-end h-full pl-6 border-l border-[rgba(108,21,30,0.16)] dark:border-[rgba(108,21,30,0.35)] min-h-[380px] pointer-events-auto"
            initial="hidden"
            animate="visible"
            custom={0.55}
            variants={fadeInUpVariant}
          >
            
            {/* Editorial Vertical Typography */}
            <div className="flex flex-col items-end text-right space-y-2.5 font-sans text-xs sm:text-sm font-semibold tracking-[0.22em] uppercase text-[#4E4441] dark:text-[#D6CDCA]">
              <span className="hover:text-[#A7192A] dark:hover:text-[#F5DABF] transition-colors">PEOPLE</span>
              <span className="hover:text-[#A7192A] dark:hover:text-[#F5DABF] transition-colors">IDEAS</span>
              <span className="hover:text-[#A7192A] dark:hover:text-[#F5DABF] transition-colors">TECHNOLOGY</span>
              <span className="text-[#A7192A] dark:text-[#EF7885] font-bold">A BRIGHTER</span>
              <span className="text-[#A7192A] dark:text-[#EF7885] font-bold">TOMORROW</span>
              <div className="mt-3 h-14 w-px bg-gradient-to-b from-[#A7192A] via-[#A7192A]/40 to-transparent dark:from-[#EF7885]" />
            </div>

            {/* Subtle Tag */}
            <div className="text-right pt-8">
              <div className="text-[11px] font-bold tracking-[0.24em] uppercase text-[#A7192A] dark:text-[#EF7885]">
                SRM UNIVERSITY-AP &times; IBM
              </div>
              <div className="text-xs font-serif italic text-[#211818] dark:text-[#F8F2F0] mt-1">
                A Decade of Quantum on Cloud
              </div>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
