import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowRight, 
  ArrowUpRight, 
  Github, 
  Linkedin, 
  Globe, 
  Sparkles, 
  Users, 
  Code, 
  Layers, 
  Compass, 
  CheckCircle2, 
  Radio, 
  Cpu
} from 'lucide-react';
import { Footer } from '@/components/shared/Footer';
import { REGISTRATION_URL } from '@/lib/constants';

interface WebsiteMember {
  name: string;
  role: string;
  category: string;
  bio: string;
  skills: string[];
  github?: string;
  linkedin?: string;
  portfolio?: string;
  initials: string;
  gradient: string;
}

const WEBSITE_MEMBERS: WebsiteMember[] = [
  {
    name: 'Srihaas Pigilam',
    role: 'Lead Architect & Systems Engineer',
    category: 'Architecture / Full-Stack',
    bio: 'Overseeing frontend architecture, theme systems, and responsive editorial layout specifications.',
    skills: ['Next.js 15', 'TypeScript', 'Tailwind CSS', 'Systems Design'],
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    initials: 'SP',
    gradient: 'from-[#6C151E] to-[#3A0B10]',
  },
  {
    name: 'Quantum UI Engineer',
    role: 'Visual Design & Editorial Interface',
    category: 'UI/UX & Editorial Craft',
    bio: 'Specializing in quantum orbital visual language, typography pairing, and dark/light atmospheric art direction.',
    skills: ['Editorial UI', 'Responsive Design', 'Design Systems', 'Motion'],
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    initials: 'QU',
    gradient: 'from-[#521018] to-[#16171B]',
  },
  {
    name: 'Frontend Systems Engineer',
    role: 'Component Architecture & Accessibility',
    category: 'Frontend Engineering',
    bio: 'Crafting accessible UI primitives, navigation workflows, and strict cross-device viewport responsiveness.',
    skills: ['WCAG AA', 'Next.js App Router', 'React 19', 'Performance'],
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    initials: 'FE',
    gradient: 'from-[#3A0B10] to-[#6C151E]',
  },
  {
    name: 'Creative Technologist',
    role: 'Quantum Visualizer & Assets',
    category: 'Creative Tech',
    bio: 'Translating quantum circuit logic, Bloch spheres, and event telemetry into restrained vector aesthetics.',
    skills: ['SVG Vectors', 'Quantum Circuits', 'Interaction', 'Brand Identity'],
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    initials: 'CT',
    gradient: 'from-[#16171B] to-[#521018]',
  },
];

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

export default function TeamPage() {
  return (
    <div className="w-full flex flex-col min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[#6C151E] selection:text-[#F5F3F0]">
      
      {/* ─────────────────────────────────────────────────────────────
          SECTION 01: HERO — "Our Team."
          Burgundy and ivory editorial treatment matching design reference
          ───────────────────────────────────────────────────────────── */}
      <section
        id="section-01-hero"
        aria-label="Our Team Hero"
        className="relative w-full border-b border-[#3A0B10]/20 bg-[#F5F3F0] dark:bg-[#2A080C] text-[#16171B] dark:text-[#F5F3F0] transition-colors duration-300 overflow-hidden"
      >
        {/* Subtle background circuit coordinates / radial motif */}
        <div className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-10">
          <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full border border-[#6C151E]/30" />
          <div className="absolute -top-16 -left-16 w-[450px] h-[450px] rounded-full border border-dashed border-[#6C151E]/20" />
          <div className="absolute top-1/2 right-0 w-[500px] h-[500px] rounded-full bg-gradient-to-bl from-[#6C151E]/15 to-transparent blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-12 pt-16 sm:pt-20 lg:pt-24 pb-20 sm:pb-24 lg:pb-28">
          
          {/* Eyebrow / Technical Classification */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold tracking-[0.16em] uppercase bg-[#6C151E]/10 dark:bg-[#6C151E]/30 text-[#6C151E] dark:text-[#E5E5E7] border border-[#6C151E]/20">
              <Radio size={12} className="text-[#6C151E] dark:text-[#B08D57] animate-pulse" />
              People & Stewardship
            </span>
            <span className="text-xs font-mono text-[#16171B]/60 dark:text-[#C7C8CC]/60 tracking-wider">
              SRM UNIVERSITY-AP × IBM
            </span>
          </div>

          {/* Main Grid: Left Editorial Statement + Right Visual Area */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column: Editorial Headline & Statement */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8">
              <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-serif font-bold tracking-tight text-[#3A0B10] dark:text-[#F5F3F0] leading-[1.08]">
                Our Team<span className="text-[#6C151E] dark:text-[#B08D57]">.</span>
              </h1>

              <p className="text-lg sm:text-xl font-sans text-[#16171B]/85 dark:text-[#E5E5E7]/85 leading-relaxed max-w-2xl font-light">
                The minds, developers, faculty, and student organizers shaping South Asia’s premier Qiskit gathering. We bring together quantum theory, algorithmic rigor, and digital craftsmanship into an unforgettable festival experience.
              </p>

              {/* Technical side messaging row */}
              <div className="pt-4 border-t border-[#3A0B10]/15 dark:border-[#F5F3F0]/15 flex flex-wrap items-center gap-6 sm:gap-10 text-xs font-mono text-[#16171B]/70 dark:text-[#C7C8CC]/70">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#6C151E] dark:bg-[#B08D57]" />
                  <span>2 Dedicated Branches</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#6C151E] dark:bg-[#B08D57]" />
                  <span>Website & Core Organising</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#6C151E] dark:bg-[#B08D57]" />
                  <span>SRM University-AP Campus</span>
                </div>
              </div>

              {/* Quick jump anchor tags */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="#section-02-website-team"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-mono font-semibold bg-[#3A0B10] text-[#F5F3F0] hover:bg-[#6C151E] transition-all shadow-sm"
                >
                  Website Team Showcase <ArrowRight size={13} />
                </a>
                <a
                  href="#section-03-explore-our-teams"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-mono font-semibold border border-[#3A0B10]/30 dark:border-[#F5F3F0]/30 text-[#3A0B10] dark:text-[#F5F3F0] hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                >
                  Explore Both Branches
                </a>
              </div>
            </div>

            {/* Right Column: Large Team/Community Visual Framing */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none rounded-2xl overflow-hidden border border-[#3A0B10]/20 dark:border-[#F5F3F0]/20 bg-gradient-to-br from-[#3A0B10] via-[#521018] to-[#16171B] p-6 sm:p-8 text-[#F5F3F0] shadow-2xl">
                
                {/* Circuit Grid Decoration */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-radial from-[#B08D57]/20 to-transparent blur-2xl" />
                
                <div className="relative space-y-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <span className="text-[11px] font-mono tracking-widest text-[#B08D57] uppercase">
                      Cohort Framework
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-white/70">
                      <Cpu size={12} /> EST. 2026
                    </span>
                  </div>

                  {/* Team Composition Matrix */}
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-black/30 border border-white/10 space-y-2">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-white/80 font-bold uppercase tracking-wide">Website & Digital Craft</span>
                        <span className="text-[#B08D57]">Branch 01</span>
                      </div>
                      <p className="text-xs font-sans text-white/75 leading-relaxed">
                        Responsible for web architecture, interactive schedules, venue maps, and editorial digital identity.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-black/30 border border-white/10 space-y-2">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-white/80 font-bold uppercase tracking-wide">Core Organising Committee</span>
                        <span className="text-[#B08D57]">Branch 02</span>
                      </div>
                      <p className="text-xs font-sans text-white/75 leading-relaxed">
                        Curating keynote speakers, hackathon problem statements, university logistics, and student hospitality.
                      </p>
                    </div>
                  </div>

                  {/* Quote Snippet */}
                  <div className="pt-2 border-t border-white/10 text-xs font-serif italic text-[#C7C8CC]/90 leading-relaxed">
                    &ldquo;Building the bridge between cutting-edge quantum science and human community experience.&rdquo;
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 02: WEBSITE TEAM MEMBER SHOWCASE
          Person cards arranged as a horizontal desktop group with photo/placeholder,
          name, role, description, and social links.
          ───────────────────────────────────────────────────────────── */}
      <section
        id="section-02-website-team"
        aria-label="Website Team Member Showcase"
        className="w-full py-16 sm:py-20 lg:py-24 bg-[#FAF9F6] dark:bg-[#1E0608] border-b border-[#3A0B10]/15 dark:border-[#F5F3F0]/10 transition-colors duration-300"
      >
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-12 space-y-12">
          
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#3A0B10]/15 dark:border-[#F5F3F0]/15">
            <div className="space-y-3 max-w-2xl">
              <span className="text-xs font-mono font-semibold tracking-[0.2em] uppercase text-[#6C151E] dark:text-[#B08D57]">
                02 • Member Showcase
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#3A0B10] dark:text-[#F5F3F0]">
                Website Team<span className="text-[#6C151E] dark:text-[#B08D57]">.</span>
              </h2>
              <p className="text-base font-sans text-[#16171B]/75 dark:text-[#C7C8CC] leading-relaxed">
                The engineers, interface designers, and system architects behind the digital home of Qiskit Fall Fest 2026.
              </p>
            </div>

            <Link
              href="/team/website"
              className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-[#6C151E] dark:text-[#B08D57] hover:underline underline-offset-4"
            >
              View Full Website Team Page <ArrowRight size={14} />
            </Link>
          </div>

          {/* Desktop Horizontal Group / Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
            {WEBSITE_MEMBERS.map((member) => (
              <div
                key={member.name}
                className="group relative flex flex-col justify-between rounded-xl border border-[#3A0B10]/15 dark:border-[#F5F3F0]/15 bg-white dark:bg-[#28080C] p-6 shadow-sm hover:shadow-xl hover:border-[#6C151E] transition-all duration-300"
              >
                {/* Top: Portrait area */}
                <div className="space-y-5">
                  <div className="relative aspect-square w-full rounded-lg overflow-hidden border border-black/10 dark:border-white/10 bg-gradient-to-br from-[#3A0B10] to-[#16171B] flex flex-col items-center justify-center text-center p-4">
                    {/* Artistic initials badge placeholder until photography is approved */}
                    <div className="relative z-10 flex flex-col items-center space-y-2">
                      <div className="h-16 w-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xl font-mono font-bold text-white shadow-inner">
                        {member.initials}
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#B08D57]">
                        Verified Contributor
                      </span>
                    </div>

                    {/* Subtle orbital decoration */}
                    <div className="absolute inset-0 border border-white/5 rounded-full scale-125 pointer-events-none" />
                  </div>

                  {/* Identification */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#6C151E] dark:text-[#B08D57] font-semibold">
                      {member.category}
                    </span>
                    <h3 className="text-lg font-serif font-bold text-[#3A0B10] dark:text-[#F5F3F0] group-hover:text-[#6C151E] dark:group-hover:text-[#B08D57] transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-xs font-mono text-[#16171B]/60 dark:text-[#C7C8CC]/70">
                      {member.role}
                    </p>
                  </div>

                  {/* Bio */}
                  <p className="text-xs font-sans text-[#16171B]/80 dark:text-[#C7C8CC]/90 leading-relaxed">
                    {member.bio}
                  </p>
                </div>

                {/* Bottom: Skills & Social Icons */}
                <div className="pt-6 mt-6 border-t border-[#3A0B10]/10 dark:border-[#F5F3F0]/10 space-y-3">
                  {/* Skill tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {member.skills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 text-[#16171B]/70 dark:text-[#C7C8CC]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Social links */}
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

                    <Link
                      href="/team/website"
                      className="text-[11px] font-mono font-semibold text-[#6C151E] dark:text-[#B08D57] hover:underline"
                    >
                      Profile →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-2">
            <span className="text-xs font-mono text-[#16171B]/50 dark:text-[#C7C8CC]/50">
              * Dedicated portrait photography and full team roster accessible in the dedicated sub-branches.
            </span>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 03: EXPLORE OUR TEAMS
          Two large team-selection navigation cards:
          - Website Team card → /team/website
          - Organising Team card → /team/organizing
          ───────────────────────────────────────────────────────────── */}
      <section
        id="section-03-explore-our-teams"
        aria-label="Explore Our Teams"
        className="w-full py-16 sm:py-20 lg:py-24 bg-[#F5F3F0] dark:bg-[#24080B] border-b border-[#3A0B10]/15 dark:border-[#F5F3F0]/10 transition-colors duration-300"
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
              Navigate into the dedicated branches to view detailed member roles, sub-committees, and operational leaders.
            </p>
          </div>

          {/* Cards Grid: 2 Large Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            
            {/* Card 01: Website Team */}
            <Link
              href="/team/website"
              className="group relative flex flex-col justify-between rounded-2xl border-2 border-[#3A0B10]/20 dark:border-[#F5F3F0]/15 bg-white dark:bg-[#320A0E] p-8 sm:p-10 hover:border-[#6C151E] dark:hover:border-[#B08D57] transition-all duration-300 hover:shadow-2xl overflow-hidden"
            >
              {/* Background ambient gradient */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#6C151E]/10 to-transparent rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-500" />

              <div className="space-y-6 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-[#6C151E]/10 dark:bg-[#6C151E]/30 text-[#6C151E] dark:text-[#B08D57] border border-[#6C151E]/20">
                    Branch 01
                  </span>
                  <div className="h-10 w-10 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center text-[#3A0B10] dark:text-[#F5F3F0] group-hover:bg-[#6C151E] group-hover:text-white transition-colors">
                    <ArrowUpRight size={20} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#16171B]/60 dark:text-[#C7C8CC]/60">
                    <Code size={14} className="text-[#6C151E] dark:text-[#B08D57]" />
                    <span>Digital Architecture & Interactive UI</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#3A0B10] dark:text-[#F5F3F0]">
                    Website Team
                  </h3>
                  <p className="text-sm font-sans text-[#16171B]/80 dark:text-[#C7C8CC] leading-relaxed">
                    Explore the complete roster of designers, software engineers, and technical writers who engineered the official Qiskit Fall Fest 2026 digital portal.
                  </p>
                </div>

                {/* Feature highlights */}
                <div className="space-y-2 pt-2 text-xs font-mono text-[#16171B]/70 dark:text-[#C7C8CC]/80">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-[#6C151E] dark:text-[#B08D57]" />
                    <span>Full Member Profiles & Contributions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-[#6C151E] dark:text-[#B08D57]" />
                    <span>Interactive System Architecture</span>
                  </div>
                </div>
              </div>

              <div className="pt-8 mt-6 border-t border-[#3A0B10]/10 dark:border-[#F5F3F0]/10 flex items-center justify-between text-xs font-mono font-bold text-[#6C151E] dark:text-[#B08D57]">
                <span>Go to /team/website</span>
                <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Enter Branch <ArrowRight size={14} />
                </span>
              </div>
            </Link>

            {/* Card 02: Organising Team */}
            <Link
              href="/team/organizing"
              className="group relative flex flex-col justify-between rounded-2xl border-2 border-[#3A0B10]/20 dark:border-[#F5F3F0]/15 bg-white dark:bg-[#320A0E] p-8 sm:p-10 hover:border-[#6C151E] dark:hover:border-[#B08D57] transition-all duration-300 hover:shadow-2xl overflow-hidden"
            >
              {/* Background ambient gradient */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#B08D57]/15 to-transparent rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-500" />

              <div className="space-y-6 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-[#B08D57]/15 text-[#886937] dark:text-[#B08D57] border border-[#B08D57]/30">
                    Branch 02
                  </span>
                  <div className="h-10 w-10 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center text-[#3A0B10] dark:text-[#F5F3F0] group-hover:bg-[#B08D57] group-hover:text-white transition-colors">
                    <ArrowUpRight size={20} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#16171B]/60 dark:text-[#C7C8CC]/60">
                    <Users size={14} className="text-[#886937] dark:text-[#B08D57]" />
                    <span>Leadership, Logistics & Academic Direction</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#3A0B10] dark:text-[#F5F3F0]">
                    Organising Team
                  </h3>
                  <p className="text-sm font-sans text-[#16171B]/80 dark:text-[#C7C8CC] leading-relaxed">
                    View the institutional hierarchy, faculty advisors, student leads, and hospitality coordinators overseeing the five-day quantum celebration at SRM AP.
                  </p>
                </div>

                {/* Feature highlights */}
                <div className="space-y-2 pt-2 text-xs font-mono text-[#16171B]/70 dark:text-[#C7C8CC]/80">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-[#886937] dark:text-[#B08D57]" />
                    <span>Organisational Hierarchy Flowchart</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-[#886937] dark:text-[#B08D57]" />
                    <span>Faculty Patronage & Committee Leads</span>
                  </div>
                </div>
              </div>

              <div className="pt-8 mt-6 border-t border-[#3A0B10]/10 dark:border-[#F5F3F0]/10 flex items-center justify-between text-xs font-mono font-bold text-[#886937] dark:text-[#B08D57]">
                <span>Go to /team/organizing</span>
                <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Enter Branch <ArrowRight size={14} />
                </span>
              </div>
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
          SECTION 05: DRIVEN BY PEOPLE
          Editorial statement / quote section from the reference
          ───────────────────────────────────────────────────────────── */}
      <section
        id="section-05-driven-by-people"
        aria-label="Driven by People"
        className="w-full py-20 sm:py-24 lg:py-28 bg-[#F5F3F0] dark:bg-[#1A0507] border-b border-[#3A0B10]/15 dark:border-[#F5F3F0]/10 transition-colors duration-300"
      >
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-[0.2em] bg-[#6C151E]/10 dark:bg-[#6C151E]/30 text-[#6C151E] dark:text-[#B08D57] border border-[#6C151E]/20">
            <Sparkles size={12} />
            <span>05 • Philosophy</span>
          </div>

          <blockquote className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-[#3A0B10] dark:text-[#F5F3F0] leading-[1.25]">
            &ldquo;Quantum computing is not merely an assemblage of qubits and microwave pulses. It is a shared human endeavor requiring curiosity, empathy, and collective determination.&rdquo;
          </blockquote>

          <div className="pt-4 space-y-1">
            <div className="text-sm font-sans font-bold text-[#16171B] dark:text-[#F5F3F0] uppercase tracking-wider">
              Organising Leadership & Committee Chairs
            </div>
            <div className="text-xs font-mono text-[#16171B]/60 dark:text-[#C7C8CC]/70">
              Department of Computer Science & Engineering • SRM University-AP
            </div>
          </div>

          {/* Thin technical divider */}
          <div className="flex items-center justify-center gap-4 pt-6">
            <span className="h-px w-16 bg-[#3A0B10]/20 dark:bg-[#F5F3F0]/20" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#6C151E] dark:bg-[#B08D57]" />
            <span className="h-px w-16 bg-[#3A0B10]/20 dark:bg-[#F5F3F0]/20" />
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
              href={REGISTRATION_URL}
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
