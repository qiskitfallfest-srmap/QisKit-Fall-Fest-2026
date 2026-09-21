import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  Github,
  Linkedin,
  Terminal,
  Code2,
  Layers,
  ShieldCheck,
  Sparkles,
  Radio,
  Cpu,
  Palette,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { Footer } from '@/components/shared/Footer';
import { REGISTRATION_URL } from '@/lib/constants';

interface TeamMember {
  name: string;
  role: string;
  category: string;
  bio: string;
  skills: string[];
  github?: string;
  linkedin?: string;
  initials: string;
  avatarGradient: string;
  image?: string;
}

const WEBSITE_TEAM_MEMBERS: TeamMember[] = [
  {
    name: 'Srihaas Pigilam',
    role: 'Team Leader',
    category: 'Architecture / Full-Stack',
    bio: 'Overseeing website team leadership, frontend architecture, theme systems, Next.js App Router implementation, and responsive layout specifications.',
    skills: ['Team Leadership', 'Next.js 15', 'TypeScript', 'Tailwind CSS', 'Systems Design'],
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    initials: 'SP',
    avatarGradient: 'from-[#6C151E] via-[#521018] to-[#3A0B10]',
    image: '/images/team/srihaas-pigilam.jpg',
  },
  {
    name: 'Pradnish Chintada',
    role: 'Lead UI/UX and Frontend',
    category: 'UI/UX & Frontend Engineering',
    bio: 'Directing user experience design, orbital visual language, responsive component architecture, and high-fidelity interactive design systems.',
    skills: ['Lead UI/UX', 'Frontend Engineering', 'Design Systems', 'Responsive UI'],
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    initials: 'PC',
    avatarGradient: 'from-[#521018] via-[#3A0B10] to-[#16171B]',
    image: '/images/team/pradnish-chintada.jpg',
  },
  {
    name: 'Shaik Mahaboob Subhani',
    role: 'Co-lead UI/UX and Components',
    category: 'UI/UX & Component Systems',
    bio: 'Architecting core component primitives, design-to-code translations, responsive UI layouts, and interactive coverflow modules.',
    skills: ['Co-lead UI/UX', 'Component Systems', 'Tailwind CSS', 'React 19'],
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    initials: 'SMS',
    avatarGradient: 'from-[#1B1425] via-[#451220] to-[#16171B]',
    image: '/images/team/shaik-subhani.jpg',
  },
  {
    name: 'Robert Bandaru',
    role: 'UI/UX and documentation',
    category: 'UI/UX & Documentation',
    bio: 'Collaborating on user flows, design system documentation, typography pairings, and layout design consistency.',
    skills: ['UI/UX Design', 'Technical Writing', 'Design Docs', 'User Journey'],
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    initials: 'RB',
    avatarGradient: 'from-[#2E1015] via-[#4A0D15] to-[#16171B]',
    image: '/images/team/robert-bandaru.jpg',
  },
  {
    name: 'Sandeep Nambi',
    role: 'UI/UX Technical and Documentation',
    category: 'UI/UX & Documentation',
    bio: 'Spearheading technical UI/UX implementation, component specifications, interface documentation, and accessible frontend workflows.',
    skills: ['Technical UI/UX', 'Documentation', 'Interface Specs', 'Component Standards'],
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    initials: 'SN',
    avatarGradient: 'from-[#3A0B10] via-[#6C151E] to-[#521018]',
    image: '/images/team/sandeep-nambi.jpg',
  },
];

const CAPABILITIES = [
  {
    title: 'Design',
    subtitle: 'Visual Architecture & Art Direction',
    icon: Palette,
    description: 'Translating quantum theory into an editorial aesthetic — pairing Playfair Display with technical sans typography, refined burgundy hues, and controlled orbital geometry.',
    tags: ['Editorial Layout', 'Dark/Light Palette', 'Typography Pairing', 'Orbital Motifs'],
  },
  {
    title: 'Development',
    subtitle: 'App Router & Component Engineering',
    icon: Code2,
    description: 'Constructed with Next.js 15 App Router, React 19, and Tailwind CSS. Built with clean server-client boundaries, zero unwanted dependencies, and ultra-fast page transitions.',
    tags: ['Next.js 15', 'TypeScript', 'Tailwind CSS', 'Static Prerender'],
  },
  {
    title: 'Maintain',
    subtitle: 'Accessibility & Reliability',
    icon: ShieldCheck,
    description: 'Continuous cross-device viewport testing from mobile to 4K displays. Enforcing WCAG 2.1 AA contrast, keyboard navigation, and semantic DOM structures.',
    tags: ['WCAG AA', 'Cross-Browser QA', 'Viewport Testing', 'Clean Hierarchy'],
  },
  {
    title: 'Innovate',
    subtitle: 'Interactive Quantum Experiences',
    icon: Sparkles,
    description: 'Developing dynamic schedule agendas, campus venue navigators, countdown timers, and seamless integration with the external Unstop registration portal.',
    tags: ['Quantum Circuits', 'Interactive Maps', 'Dynamic Agendas', 'Unstop Integration'],
  },
];

export default function WebsiteTeamPage() {
  return (
    <div className="w-full flex flex-col min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[#6C151E] selection:text-[#F5F3F0]">

      {/* ─────────────────────────────────────────────────────────────
          SECTION 01: HERO — "Designing Connections."
          Asymmetric editorial composition with left content & right visual
          ───────────────────────────────────────────────────────────── */}
      <section
        id="section-01-hero"
        aria-label="Website Team Hero"
        className="relative w-full border-b border-[#3A0B10]/20 bg-[#F5F3F0] dark:bg-[#22070A] text-[#16171B] dark:text-[#F5F3F0] transition-colors duration-300 overflow-hidden"
      >
        {/* Subtle background circuit & orbital elements */}
        <div className="absolute inset-0 pointer-events-none opacity-25 dark:opacity-15">
          <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full border border-[#6C151E]/25" />
          <div className="absolute -top-16 -left-16 w-[450px] h-[450px] rounded-full border border-dashed border-[#6C151E]/20" />
          <div className="absolute top-1/2 right-0 w-[550px] h-[550px] rounded-full bg-gradient-to-bl from-[#6C151E]/20 to-transparent blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-12 pt-16 sm:pt-20 lg:pt-24 pb-20 sm:pb-24 lg:pb-28">

          {/* Main Grid: Left Editorial Statement + Right Code Visual Area */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

            {/* Left Column: Editorial Headline & Statement */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8">

              {/* Category / Eyebrow Badge */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-[0.2em] uppercase bg-[#6C151E]/10 dark:bg-[#6C151E]/30 text-[#6C151E] dark:text-[#E5E5E7] border border-[#6C151E]/20">
                  <Terminal size={13} className="text-[#6C151E] dark:text-[#B08D57]" />
                  WEBSITE TEAM
                </span>
                <span className="text-xs font-mono text-[#16171B]/60 dark:text-[#C7C8CC]/60 tracking-wider">
                  SRM UNIVERSITY-AP × IBM QISKIT
                </span>
              </div>

              {/* Display Heading */}
              <div className="space-y-3">
                <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-serif font-bold tracking-tight text-[#3A0B10] dark:text-[#F5F3F0] leading-[1.06]">
                  Designing Connections<span className="text-[#6C151E] dark:text-[#B08D57]">.</span>
                </h1>
                <p className="text-lg sm:text-xl font-sans font-medium text-[#6C151E] dark:text-[#B08D57]">
                  Architecting the digital gateway for South Asia’s premier Qiskit Fall Fest.
                </p>
              </div>

              {/* Supporting Paragraph */}
              <p className="text-base sm:text-lg font-sans text-[#16171B]/80 dark:text-[#E5E5E7]/80 leading-relaxed max-w-2xl font-light">
                We craft high-performance, accessible, and cinematic web interfaces that translate complex quantum computational theory, keynote sessions, and hackathon logistics into an intuitive festival journey.
              </p>

              {/* CTA and Action Row */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="#section-03-what-we-do"
                  className="group inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold bg-[#3A0B10] text-[#F5F3F0] hover:bg-[#6C151E] transition-all shadow-md"
                >
                  <span>Explore Our Work</span>
                  <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                </a>

                <a
                  href="#section-02-website-team-members"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold border border-[#3A0B10]/25 dark:border-[#F5F3F0]/25 text-[#3A0B10] dark:text-[#F5F3F0] hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                >
                  Meet the Builders
                </a>
              </div>

              {/* Small capability line */}
              <div className="pt-4 border-t border-[#3A0B10]/15 dark:border-[#F5F3F0]/15">
                <div className="text-xs font-mono tracking-[0.25em] text-[#6C151E] dark:text-[#B08D57] font-semibold">
                  CODE · DESIGN · DEVELOP · MAINTAIN
                </div>
              </div>

            </div>

            {/* Right Column: Large Website / Code / Development Visual Area */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-lg lg:max-w-none rounded-2xl border border-[#3A0B10]/20 dark:border-[#F5F3F0]/20 bg-[#16171B] text-[#F5F3F0] shadow-2xl overflow-hidden">

                {/* Code Window Titlebar */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/40 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-[#6C151E]" />
                    <span className="h-3 w-3 rounded-full bg-[#B08D57]" />
                    <span className="h-3 w-3 rounded-full bg-[#C7C8CC]/50" />
                    <span className="ml-2 text-white/70">fallfest.qiskit.tsx</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] text-[#B08D57]">
                    <Cpu size={12} /> EST. 2026
                  </span>
                </div>

                {/* Simulated Code Editor Area */}
                <div className="p-5 sm:p-6 space-y-4 font-mono text-xs sm:text-[13px] leading-relaxed overflow-x-auto text-[#C7C8CC]">
                  <div className="text-white/40">{`// Quantum Fest Digital Interface Schema`}</div>
                  <div>
                    <span className="text-[#B08D57]">const</span>{' '}
                    <span className="text-white font-bold">FallFestInterface</span> = {'{'}
                  </div>
                  <div className="pl-4 space-y-1">
                    <div>
                      <span className="text-white/70">event:</span>{' '}
                      <span className="text-[#E5E5E7]">&quot;Qiskit Fall Fest 2026&quot;</span>,
                    </div>
                    <div>
                      <span className="text-white/70">host:</span>{' '}
                      <span className="text-[#E5E5E7]">&quot;SRM University-AP × IBM&quot;</span>,
                    </div>
                    <div>
                      <span className="text-white/70">stack:</span>{' '}
                      <span className="text-[#E5E5E7]">&quot;Next.js 15 + TypeScript + Tailwind&quot;</span>,
                    </div>
                    <div>
                      <span className="text-white/70">palette:</span>{' '}
                      <span className="text-[#B08D57]">[&quot;Burgundy&quot;, &quot;Ivory&quot;, &quot;Gold&quot;]</span>,
                    </div>
                    <div>
                      <span className="text-white/70">a11yStandard:</span>{' '}
                      <span className="text-[#E5E5E7]">&quot;WCAG 2.1 AA Certified&quot;</span>,
                    </div>
                    <div>
                      <span className="text-white/70">registration:</span>{' '}
                      <span className="text-[#E5E5E7]">&quot;Exclusive via Unstop&quot;</span>,
                    </div>
                    <div>
                      <span className="text-white/70">status:</span>{' '}
                      <span className="text-emerald-400 font-bold">&quot;100% PRODUCTION READY&quot;</span>
                    </div>
                  </div>
                  <div>{'};'}</div>
                </div>

                {/* Supporting Technical Side Statements */}
                <div className="p-4 sm:p-5 border-t border-white/10 bg-black/30 grid grid-cols-2 gap-3 text-[11px] font-mono">
                  <div className="flex items-center gap-1.5 text-white/80">
                    <CheckCircle2 size={13} className="text-[#B08D57] shrink-0" />
                    <span>Edge CDN Optimized</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-white/80">
                    <CheckCircle2 size={13} className="text-[#B08D57] shrink-0" />
                    <span>Editorial Art Direction</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-white/80">
                    <CheckCircle2 size={13} className="text-[#B08D57] shrink-0" />
                    <span>Restrained Vector Graphics</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-white/80">
                    <CheckCircle2 size={13} className="text-[#B08D57] shrink-0" />
                    <span>Hardware-Grade Fidelity</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 02: WEBSITE TEAM MEMBERS
          Responsive card grid: multi-column desktop, natural reflow on mobile/tablet
          Supports: portrait, name, role, short description, social/action icons
          ───────────────────────────────────────────────────────────── */}
      <section
        id="section-02-website-team-members"
        aria-label="Website Team Members"
        className="w-full py-16 sm:py-20 lg:py-24 bg-[#FAF9F6] dark:bg-[#1E0608] border-b border-[#3A0B10]/15 dark:border-[#F5F3F0]/10 transition-colors duration-300"
      >
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-12 space-y-12">

          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#3A0B10]/15 dark:border-[#F5F3F0]/15">
            <div className="space-y-3 max-w-2xl">
              <span className="text-xs font-mono font-semibold tracking-[0.2em] uppercase text-[#6C151E] dark:text-[#B08D57]">
                02 • Core Engineering
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#3A0B10] dark:text-[#F5F3F0]">
                Website Team Members<span className="text-[#6C151E] dark:text-[#B08D57]">.</span>
              </h2>
              <p className="text-base font-sans text-[#16171B]/75 dark:text-[#C7C8CC] leading-relaxed">
                The developers, visual designers, and system engineers responsible for conceptualizing, building, and maintaining the digital presence of Qiskit Fall Fest 2026.
              </p>
            </div>

            <div className="text-xs font-mono text-[#16171B]/60 dark:text-[#C7C8CC]/60 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#6C151E] dark:bg-[#B08D57]" />
              <span>{WEBSITE_TEAM_MEMBERS.length} Verified Engineering Members</span>
            </div>
          </div>

          {/* Responsive Card Grid: Multi-Column on Desktop (3 cols), Tablet (2 cols), Mobile (1 col) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
            {WEBSITE_TEAM_MEMBERS.map((member) => (
              <div
                key={member.name}
                className="group relative flex flex-col justify-between rounded-xl border border-[#3A0B10]/15 dark:border-[#F5F3F0]/15 bg-white dark:bg-[#28080C] p-6 shadow-sm hover:shadow-xl hover:border-[#6C151E] dark:hover:border-[#B08D57] transition-all duration-300"
              >
                {/* Top Section: Portrait & Bio */}
                <div className="space-y-5">

                  {/* Portrait Area */}
                  <div className="relative aspect-square w-full rounded-lg overflow-hidden border border-black/10 dark:border-white/10 bg-gradient-to-br from-[#3A0B10] via-[#521018] to-[#16171B] flex flex-col items-center justify-center text-center">
                    {member.image ? (
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="relative z-10 flex flex-col items-center space-y-2 p-4">
                        <div className="h-16 w-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xl font-mono font-bold text-white shadow-inner">
                          {member.initials}
                        </div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-[#B08D57]">
                          Verified Contributor
                        </span>
                      </div>
                    )}

                    {/* Subtle gradient overlay at bottom */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </div>

                  {/* Identification */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#6C151E] dark:text-[#B08D57] font-semibold">
                      {member.category}
                    </span>
                    <h3 className="text-xl font-serif font-bold text-[#3A0B10] dark:text-[#F5F3F0] group-hover:text-[#6C151E] dark:group-hover:text-[#B08D57] transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-xs font-mono text-[#16171B]/60 dark:text-[#C7C8CC]/70">
                      {member.role}
                    </p>
                  </div>

                  {/* Short Description */}
                  <p className="text-xs font-sans text-[#16171B]/80 dark:text-[#C7C8CC]/90 leading-relaxed">
                    {member.bio}
                  </p>
                </div>

                {/* Bottom Section: Skills & Social Icons */}
                <div className="pt-6 mt-6 border-t border-[#3A0B10]/10 dark:border-[#F5F3F0]/10 space-y-3">
                  {/* Skill tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {member.skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 text-[#16171B]/70 dark:text-[#C7C8CC]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Social and Action Icons */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2 text-[#16171B]/60 dark:text-[#C7C8CC]/60">
                      {member.github && (
                        <a
                          href={member.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[#6C151E] dark:hover:text-[#B08D57] transition-colors p-1"
                          aria-label={`${member.name} GitHub`}
                        >
                          <Github size={15} />
                        </a>
                      )}
                      {member.linkedin && (
                        <a
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[#6C151E] dark:hover:text-[#B08D57] transition-colors p-1"
                          aria-label={`${member.name} LinkedIn`}
                        >
                          <Linkedin size={15} />
                        </a>
                      )}
                    </div>

                    <span className="text-[10px] font-mono text-[#16171B]/40 dark:text-[#C7C8CC]/40 uppercase tracking-wider">
                      SRM AP × IBM
                    </span>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 03: WHAT WE DO
          Editorial left block + 4 capability cards (Design, Development, Maintain, Innovate)
          ───────────────────────────────────────────────────────────── */}
      <section
        id="section-03-what-we-do"
        aria-label="What We Do"
        className="w-full py-16 sm:py-20 lg:py-24 bg-[#F5F3F0] dark:bg-[#24080B] border-b border-[#3A0B10]/15 dark:border-[#F5F3F0]/10 transition-colors duration-300"
      >
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-12">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

            {/* Left Side: Editorial Block */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
              <span className="text-xs font-mono font-semibold tracking-[0.2em] uppercase text-[#6C151E] dark:text-[#B08D57]">
                03 • WHAT WE DO
              </span>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#3A0B10] dark:text-[#F5F3F0] leading-tight">
                From Ideas to Interfaces<span className="text-[#6C151E] dark:text-[#B08D57]">.</span>
              </h2>

              <p className="text-base font-sans text-[#16171B]/80 dark:text-[#C7C8CC] leading-relaxed">
                Building an international quantum computing event website requires bridging high-level algorithmic concepts with refined digital storytelling. Our multidisciplinary group merges design rigor with modern web engineering to deliver a responsive, accessible, and cinematic festival portal.
              </p>

              {/* Editorial Technical Bulletins */}
              <div className="pt-4 border-t border-[#3A0B10]/15 dark:border-[#F5F3F0]/15 space-y-3 text-xs font-mono text-[#16171B]/70 dark:text-[#C7C8CC]/70">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#6C151E] dark:bg-[#B08D57]" />
                  <span>Iterative prototyping aligned with IBM & SRM brand guidelines</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#6C151E] dark:bg-[#B08D57]" />
                  <span>Robust, zero-bloat App Router component architecture</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#6C151E] dark:bg-[#B08D57]" />
                  <span>External Unstop registration integration with zero mock stubs</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/team/organizing"
                  className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#6C151E] dark:text-[#B08D57] hover:underline underline-offset-4"
                >
                  Explore the Organising Team Hierarchy <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Right Side: Four Capability Cards (Design, Development, Maintain, Innovate) */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {CAPABILITIES.map((cap) => {
                const IconComponent = cap.icon;
                return (
                  <div
                    key={cap.title}
                    className="p-6 sm:p-7 rounded-xl border border-[#3A0B10]/15 dark:border-[#F5F3F0]/15 bg-white dark:bg-[#2C080D] space-y-4 hover:border-[#6C151E] dark:hover:border-[#B08D57] transition-all shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="h-10 w-10 rounded-lg bg-[#3A0B10]/5 dark:bg-white/5 border border-[#3A0B10]/10 dark:border-white/10 flex items-center justify-center text-[#6C151E] dark:text-[#B08D57]">
                        <IconComponent size={20} />
                      </div>
                      <span className="text-[11px] font-mono text-[#16171B]/40 dark:text-[#C7C8CC]/40 uppercase tracking-widest">
                        Capability
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xl font-serif font-bold text-[#3A0B10] dark:text-[#F5F3F0]">
                        {cap.title}
                      </h3>
                      <p className="text-xs font-mono text-[#6C151E] dark:text-[#B08D57] font-medium">
                        {cap.subtitle}
                      </p>
                    </div>

                    <p className="text-xs font-sans text-[#16171B]/80 dark:text-[#C7C8CC]/90 leading-relaxed">
                      {cap.description}
                    </p>

                    <div className="pt-2 flex flex-wrap gap-1.5 border-t border-[#3A0B10]/10 dark:border-[#F5F3F0]/10">
                      {cap.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 text-[#16171B]/70 dark:text-[#C7C8CC]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 04: CTA — A Stronger Quantum Tomorrow
          Deep burgundy CTA section with external Unstop registration redirect
          ───────────────────────────────────────────────────────────── */}
      <section
        id="section-04-cta"
        aria-label="A Stronger Quantum Tomorrow CTA"
        className="relative w-full py-20 sm:py-24 lg:py-28 bg-gradient-to-br from-[#521018] via-[#3A0B10] to-[#16171B] text-[#F5F3F0] overflow-hidden"
      >
        {/* Subtle background orbital decoration */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-white/15" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[950px] h-[950px] rounded-full border border-dashed border-white/10" />
        </div>

        <div className="relative mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-12 text-center space-y-8">

          <div className="space-y-4 max-w-3xl mx-auto">
            <span className="text-xs font-mono font-semibold tracking-[0.25em] uppercase text-[#B08D57]">
              04 • FESTIVAL CTA
            </span>

            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white leading-tight">
              A Stronger Quantum Tomorrow<span className="text-[#B08D57]">.</span>
            </h2>

            <p className="text-base sm:text-lg font-sans text-[#E5E5E7]/85 max-w-2xl mx-auto leading-relaxed font-light">
              Join hundreds of quantum researchers, students, and algorithm developers at SRM University-AP. Registration is open exclusively through Unstop.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-4">
            <a
              href={REGISTRATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl text-base font-semibold bg-[#F5F3F0] text-[#3A0B10] hover:bg-white hover:shadow-2xl transition-all duration-300"
            >
              <span>Register on Unstop</span>
              <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-[#6C151E]" />
            </a>

            <Link
              href="/team"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-xl text-base font-semibold border border-white/30 text-white hover:bg-white/10 transition-all duration-300"
            >
              <span>Back to Team Overview</span>
            </Link>
          </div>

          {/* Technical subnote */}
          <div className="pt-6 text-xs font-mono text-[#C7C8CC]/60 max-w-md mx-auto">
            Official registration handled exclusively through Unstop • Co-hosted by SRM University-AP and IBM Quantum
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 05: FOOTER
          Reuse the existing shared Footer
          ───────────────────────────────────────────────────────────── */}
      <Footer />

    </div>
  );
}
