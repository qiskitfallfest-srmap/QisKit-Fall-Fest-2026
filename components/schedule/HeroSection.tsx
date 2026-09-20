'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import ParticleDrift from './ParticleDrift';
import { PhaseSelector } from './PhaseSelector';
import { SchedulePhase } from '@/data/schedule.types';

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

      <div className="relative z-10 pointer-events-none mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-12 md:py-16 min-h-0 sm:min-h-[500px] lg:min-h-[560px] flex flex-col justify-center">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
          
          {/* LEFT COLUMN: HERO CONTENT (approx 7-8 cols on desktop) */}
          <div className="lg:col-span-8 flex flex-col justify-center space-y-4 sm:space-y-6 pointer-events-auto">
            
            {/* Eyebrow */}
            <motion.div 
              className="inline-flex items-center gap-3"
              initial="hidden"
              animate="visible"
              custom={0.05}
              variants={fadeInUpVariant}
            >
              <span className="h-px w-8 bg-[#6C151E] dark:bg-[#E45464]" />
              <span className="font-mono text-xs sm:text-sm font-semibold uppercase tracking-[0.20em] text-[#6C151E] dark:text-[#E45464]">
                SCHEDULE
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1 
              className="font-serif text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-[1.02] tracking-tight text-[#13090A] dark:text-[#F6F2F1]"
              initial="hidden"
              animate="visible"
              custom={0.15}
              variants={fadeInUpVariant}
            >
              Full Event <span className="italic font-medium text-[#6C151E] dark:text-[#E45464]">Schedule.</span>
            </motion.h1>

            {/* Subheadline & Description */}
            <div className="max-w-[680px] space-y-2">
              <motion.h2 
                className="font-sans text-lg sm:text-xl font-semibold text-[#4A0D14] dark:text-[#F5DABF]"
                initial="hidden"
                animate="visible"
                custom={0.25}
                variants={fadeInUpVariant}
              >
                Two phases. One global community.
              </motion.h2>
              <motion.p 
                className="font-sans font-normal text-base sm:text-lg leading-relaxed text-[#665B57] dark:text-[#BEB5B4]"
                initial="hidden"
                animate="visible"
                custom={0.35}
                variants={fadeInUpVariant}
              >
                Explore a week of learning, building, and connecting through workshops, talks, hackathons, and more.
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
              <div className="mb-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[#6C151E]/80 dark:text-[#F5DABF]/80">
                Select Festival Phase
              </div>
              <PhaseSelector currentPhase={currentPhase} onPhaseChange={onPhaseChange} variant="cards" />
            </motion.div>
          </div>

          {/* RIGHT COLUMN: EDITORIAL SIDE COPY & ATMOSPHERIC ART (4 cols on desktop) */}
          <motion.div 
            className="hidden lg:flex lg:col-span-4 flex-col justify-between items-end h-full pl-6 border-l border-[rgba(108,21,30,0.16)] dark:border-[rgba(108,21,30,0.35)] min-h-[380px] pointer-events-auto"
            initial="hidden"
            animate="visible"
            custom={0.55}
            variants={fadeInUpVariant}
          >
            
            {/* Editorial Vertical Typography */}
            <div className="flex flex-col items-end text-right space-y-2 font-sans text-xs sm:text-sm font-semibold tracking-[0.20em] uppercase text-[#665B57] dark:text-[#BEB5B4]">
              <span className="hover:text-[#6C151E] dark:hover:text-[#F5DABF] transition-colors">PEOPLE</span>
              <span className="hover:text-[#6C151E] dark:hover:text-[#F5DABF] transition-colors">IDEAS</span>
              <span className="hover:text-[#6C151E] dark:hover:text-[#F5DABF] transition-colors">TECHNOLOGY</span>
              <span className="text-[#6C151E] dark:text-[#E45464] font-bold">A BRIGHTER</span>
              <span className="text-[#6C151E] dark:text-[#E45464] font-bold">TOMORROW</span>
              <div className="mt-3 h-12 w-px bg-gradient-to-b from-[#6C151E] to-transparent dark:from-[#E45464]" />
            </div>

            {/* Subtle Tag */}
            <div className="text-right pt-8">
              <div className="text-[11px] font-mono font-medium tracking-[0.18em] uppercase text-[#6C151E]/70 dark:text-[#F5DABF]/70">
                SRM UNIVERSITY-AP &middot; IBM
              </div>
              <div className="text-xs font-serif italic text-[#363130] dark:text-[#E8E0DE] mt-1">
                A Decade of Quantum on Cloud
              </div>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
