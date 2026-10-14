import React from 'react';
import { ArrowRight, ArrowUpRight, Check } from 'lucide-react';
import { REGISTRATION_URL, WHATSAPP_COMMUNITY_URL } from '@/lib/constants';

const SECTIONS = [
  { id: 'online', number: '01', title: 'Start Your Quantum Journey Online' },
  { id: 'on-campus', number: '02', title: 'Five Days of Quantum Innovation on Campus' },
  { id: 'connected', number: '03', title: 'One Connected Experience' },
  { id: 'passes', number: '04', title: 'Registration and Offline Passes' },
  { id: 'why', number: '05', title: 'Why Participate' },
  { id: 'register', number: '06', title: 'Register and Join the Festival' },
];

const KEY_FACTS = [
  { label: 'Online phase', value: 'Free' },
  { label: 'Hackathon prize pool', value: '₹1,00,000' },
  { label: 'Creative competitions', value: '₹20,000' },
  { label: 'On campus', value: '26–30 Oct' },
];

const LEARNING_TOPICS = [
  'Quantum foundations and Qiskit SDK fundamentals',
  'Qubit connectivity, superconducting quantum hardware, and quantum processor architecture',
  'Quantum sensing, nitrogen-vacancy centres, and photonic quantum optics',
  'Quantum machine learning and hybrid optimization',
  'Post-quantum cryptography and lattice-based schemes',
];

const HACKATHON_TOPICS = [
  'Quantum optimization and combinatorial problems',
  'Variational Quantum Eigensolver (VQE) and quantum chemistry',
  'Quantum simulation and Hamiltonian models',
  'Quantum machine learning and hybrid optimization',
  'Quantum circuit design, connectivity, and routing',
  'Quantum security and related computational approaches',
];

const GAMES = [
  { name: 'QChess', text: 'Test strategic thinking and planning.' },
  { name: 'QEscapes', text: 'Work through puzzles and challenges that reward logic and collaboration.' },
  { name: 'Quantum Casino', text: "Explore the festival's themed gaming experience." },
  {
    name: 'Entanglement Partners',
    text: 'Take part in an interactive activity inspired by a defining concept in quantum mechanics.',
  },
  { name: 'QDrama', text: 'Experience a creative, performance-oriented side of the festival.' },
];

const PATHS = [
  { interest: 'Programming and algorithms', start: 'Quantum Hackathon, Phase 1 online and Phase 2 on campus' },
  { interest: 'Scientific communication', start: 'Tech Reels, Digital Poster, and Technical Essay competitions' },
  { interest: 'Experts and industry', start: 'IBM speaker workshops and the Industry Tech Expo' },
  { interest: 'Entrepreneurship', start: 'Quantum Startup Pitch' },
  { interest: 'Strategic problem-solving', start: 'QCTF, QChess, QEscapes, and the Quantum Arcade' },
];

const FLAGSHIP_PASS_BENEFITS = [
  'Access to eligible flagship activities, including Hackathon Phase 2, QCTF, and Startup Pitch, subject to their qualification and eligibility requirements',
  'Special lunch on all five days of the festival',
  'Two snack servings per day during the five-day event',
  'Access to eligible festival activities and industry interactions',
  'Priority workshop seating, subject to event arrangements and availability',
];

const REASONS = [
  { verb: 'Learn', text: 'Explore quantum foundations, algorithms, hardware, sensing, and security.' },
  { verb: 'Build', text: 'Develop Qiskit implementations and document technical solutions.' },
  { verb: 'Compete', text: 'Take part in online competitions and pursue selection to the hackathon finals.' },
  { verb: 'Communicate', text: 'Explain scientific ideas through videos, posters, essays, and debate.' },
  { verb: 'Discover', text: 'Explore demonstrations, workshops, and emerging industry technologies.' },
  { verb: 'Innovate', text: 'Investigate entrepreneurial opportunities through the Startup Pitch.' },
  { verb: 'Connect', text: 'Engage with speakers, fellow participants, and the wider quantum community.' },
];

/* ---------------------------------------------------------------------------
   Typographic primitives
   ------------------------------------------------------------------------- */

function SectionHeading({ id, number, title }: { id: string; number: string; title: string }) {
  return (
    <header className="mb-8 border-t border-[#6C151E]/20 pt-8 dark:border-[#F07A86]/20">
      <span className="font-mono text-xs font-semibold tracking-[0.2em] text-[#6C151E] dark:text-[#F07A86]">
        {number}
      </span>
      <h2
        id={`${id}-title`}
        className="mt-2 font-serif text-3xl font-bold leading-snug tracking-tight text-[#201617] sm:text-4xl dark:text-[#FFF4F1]"
      >
        {title}
      </h2>
    </header>
  );
}

function SubHeading({ children, meta }: { children: React.ReactNode; meta?: string }) {
  return (
    <div className="mt-12 mb-4 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
      <h3 className="font-serif text-xl font-bold leading-snug text-[#201617] sm:text-2xl dark:text-[#FFF4F1]">
        {children}
      </h3>
      {meta && (
        <span className="shrink-0 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[#6C151E] dark:text-[#F07A86]">
          {meta}
        </span>
      )}
    </div>
  );
}

function P({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <p className={`mt-5 first:mt-0 ${className}`}>{children}</p>;
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <aside className="mt-6 border-l-2 border-gold py-1 pl-5 text-[15px] leading-relaxed text-[#4A3F40] dark:text-[#D2C4C1]">
      {children}
    </aside>
  );
}

function RuledList({ items, columns = 1 }: { items: string[]; columns?: 1 | 2 }) {
  return (
    <ul
      className={`mt-6 grid border-t border-[#6C151E]/15 dark:border-[#F07A86]/15 ${
        columns === 2 ? 'sm:grid-cols-2 sm:gap-x-8' : ''
      }`}
    >
      {items.map((item) => (
        <li
          key={item}
          className="flex gap-3 border-b border-[#6C151E]/15 py-3 text-[15px] leading-snug dark:border-[#F07A86]/15"
        >
          <span aria-hidden="true" className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-[#6C151E] dark:bg-[#F07A86]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function PrimaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="group inline-flex items-center gap-2 rounded-lg bg-[#6C151E] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-[#851D28] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6C151E] dark:bg-[#F07A86] dark:text-[#1A0709] dark:hover:bg-[#F59AA4]"
    >
      <span>{children}</span>
      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
    </a>
  );
}

/* ---------------------------------------------------------------------------
   Article
   ------------------------------------------------------------------------- */

export function AboutArticle() {
  return (
    <article className="w-full bg-[#F7F2ED] text-[#3D3334] transition-colors duration-300 dark:bg-[#120506] dark:text-[#E2D5D3]">
      {/* Masthead */}
      <header className="mx-auto max-w-6xl px-4 pt-28 sm:px-6 sm:pt-36 lg:px-8">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6C151E] dark:text-[#F07A86]">
            <span aria-hidden="true" className="h-px w-8 bg-current opacity-60" />
            <span>About the Festival</span>
          </div>

          <p className="mt-6 font-sans text-sm font-semibold text-[#6C151E] sm:text-base dark:text-[#F07A86]">
            Partner Plus IBM Qiskit Fall Fest 2026 at SRM University-AP
          </p>
          <h1 className="mt-3 font-serif text-4xl font-bold leading-[1.08] tracking-tight text-[#201617] sm:text-5xl lg:text-6xl dark:text-[#FFF4F1]">
            Five Days of Quantum Innovation, Competition, and Discovery
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#4A3F40] sm:text-xl dark:text-[#D2C4C1]">
            Explore quantum computing. Build real solutions. Compete for prizes. Connect with the people
            shaping tomorrow&apos;s technology.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <PrimaryLink href={REGISTRATION_URL}>Register on the Learning Platform</PrimaryLink>
            <a
              href="#online"
              className="text-sm font-semibold text-[#201617] underline decoration-[#6C151E]/40 underline-offset-4 transition-colors duration-200 hover:decoration-[#6C151E] dark:text-[#FFF4F1] dark:decoration-[#F07A86]/40 dark:hover:decoration-[#F07A86]"
            >
              Read the full guide
            </a>
          </div>
        </div>

        {/* Key facts */}
        <dl className="mt-14 grid grid-cols-2 gap-px border-y border-[#6C151E]/20 bg-[#6C151E]/15 lg:grid-cols-4 dark:border-[#F07A86]/20 dark:bg-[#F07A86]/15">
          {KEY_FACTS.map((fact) => (
            <div key={fact.label} className="bg-[#F7F2ED] py-5 pr-4 pl-4 first:pl-0 lg:pl-6 dark:bg-[#120506] [&:nth-child(3)]:pl-0 lg:[&:nth-child(3)]:pl-6">
              <dt className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7A6B6C] dark:text-[#A8999A]">
                {fact.label}
              </dt>
              <dd className="mt-1.5 font-serif text-2xl font-bold text-[#201617] sm:text-3xl dark:text-[#FFF4F1]">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      </header>

      <div className="mx-auto grid max-w-6xl gap-12 px-4 pt-14 pb-24 sm:px-6 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-16 lg:px-8">
        {/* Table of contents */}
        <nav aria-label="Article contents" className="lg:sticky lg:top-32 lg:self-start">
          <details className="group rounded-lg border border-[#6C151E]/15 bg-white/50 lg:hidden dark:border-[#F07A86]/15 dark:bg-white/[0.03]" >
            <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold text-[#201617] dark:text-[#FFF4F1]">
              Contents
              <span aria-hidden="true" className="font-mono text-xs text-[#6C151E] transition-transform duration-200 group-open:rotate-45 dark:text-[#F07A86]">
                +
              </span>
            </summary>
            <ol className="space-y-1 border-t border-[#6C151E]/10 px-4 py-3 dark:border-[#F07A86]/10">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="flex gap-3 py-1 text-sm text-[#4A3F40] hover:text-[#6C151E] dark:text-[#D2C4C1] dark:hover:text-[#F07A86]">
                    <span className="font-mono text-xs text-[#6C151E] dark:text-[#F07A86]">{s.number}</span>
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </details>

          <div className="hidden lg:block">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7A6B6C] dark:text-[#A8999A]">
              In this guide
            </p>
            <ol className="mt-4 space-y-3 border-l border-[#6C151E]/15 dark:border-[#F07A86]/15">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="-ml-px block border-l border-transparent pl-4 text-sm leading-snug text-[#4A3F40] transition-colors duration-200 hover:border-[#6C151E] hover:text-[#6C151E] dark:text-[#D2C4C1] dark:hover:border-[#F07A86] dark:hover:text-[#F07A86]"
                  >
                    <span className="block font-mono text-[11px] text-[#6C151E] dark:text-[#F07A86]">{s.number}</span>
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>

        {/* Body */}
        <div className="max-w-[68ch] text-base leading-[1.8] sm:text-[17px]">
          {/* Introduction */}
          <div className="mb-16">
            <P className="first-letter:float-left first-letter:mr-3 first-letter:font-serif first-letter:text-6xl first-letter:font-bold first-letter:leading-[0.85] first-letter:text-[#6C151E] dark:first-letter:text-[#F07A86]">
              Quantum computing is moving beyond theoretical physics into optimization, cryptography,
              artificial intelligence, scientific simulation, and advanced hardware. As the technology
              develops, students need more than classroom knowledge: they need opportunities to experiment,
              collaborate, build, and engage with the research and industry communities driving the field
              forward.
            </P>
            <P>
              <strong className="font-semibold text-[#201617] dark:text-[#FFF4F1]">
                Partner Plus IBM Qiskit Fall Fest 2026 at SRM University-AP
              </strong>{' '}
              brings these opportunities together through online learning, technical competitions, creative
              challenges, hands-on workshops, industry engagement, and on-campus experiences. Hosted at SRM
              University-AP in collaboration with IBM Quantum, the festival invites students, researchers,
              technology enthusiasts, and aspiring innovators to explore quantum technologies from multiple
              perspectives.
            </P>
            <P>
              The festival runs in two connected phases: an online phase designed to make participation
              accessible to everyone, followed by five days of on-campus activities from{' '}
              <strong className="font-semibold text-[#201617] dark:text-[#FFF4F1]">26–30 October 2026</strong>.
              Whether you are already developing quantum algorithms or just beginning to explore the field,
              there is a way to learn, participate, and discover something new.
            </P>
          </div>

          {/* 01 Online */}
          <section id="online" aria-labelledby="online-title" className="scroll-mt-32 mb-20">
            <SectionHeading {...SECTIONS[0]} />
            <P>
              The online phase helps participants explore quantum computing at their own pace, develop
              practical skills, and demonstrate their understanding through competitions.{' '}
              <strong className="font-semibold text-[#201617] dark:text-[#FFF4F1]">
                Online participation is completely free.
              </strong>
            </P>
            <P>
              The official{' '}
              <a href={REGISTRATION_URL} className="font-medium text-[#6C151E] underline decoration-[#6C151E]/30 underline-offset-4 hover:decoration-[#6C151E] dark:text-[#F07A86] dark:decoration-[#F07A86]/30">
                Qiskit Fall Fest Learning Platform
              </a>{' '}
              brings together learning resources, competition information, quizzes, and the Quantum
              Hackathon Phase 1 workspace in one place.
            </P>

            <SubHeading>Online Masterclasses and Learning Modules</SubHeading>
            <P>
              Quantum computing involves concepts that can seem abstract at first, from superposition and
              entanglement to quantum gates, circuits, and hybrid algorithms. The online modules build that
              understanding through structured sessions, recorded lectures, technical presentations, and
              concept-check quizzes, across topics including:
            </P>
            <RuledList items={LEARNING_TOPICS} />
            <P className="mt-6">
              Use these resources to strengthen your theoretical foundations and support your work on the
              hackathon and other technical activities. Participants who meet the completion and passing
              requirements can qualify for the festival&apos;s certificate of completion, subject to the
              official certification guidelines.
            </P>

            <SubHeading meta="Prize pool ₹10,000">Tech Reels Competition</SubHeading>
            <P>
              Can you explain a quantum concept in a way that makes people stop scrolling and start thinking?
              The Tech Reels Competition challenges you to communicate quantum computing through short-form
              video, from superposition and entanglement to quantum algorithms and real-world applications,
              combining scientific understanding with storytelling.
            </P>

            <SubHeading meta="Prize pool ₹5,000">Digital Poster Competition</SubHeading>
            <P>
              Scientific ideas can be powerful when presented visually. Transform quantum concepts into clear,
              engaging, and scientifically meaningful designs on topics such as quantum circuits, quantum
              sensing, superconducting hardware, quantum algorithms, and emerging applications. Entries are
              judged on original design, scientific accuracy, and clarity.
            </P>

            <SubHeading meta="Prize pool ₹5,000">Technical Essay Competition</SubHeading>
            <P>
              For participants who enjoy exploring ideas in depth, the essay competition investigates questions
              at the intersection of quantum physics, computing, and emerging technology: quantum algorithms,
              quantum security, hardware architectures, quantum machine learning, and more. It rewards
              independent thinking, evidence-based reasoning, and clear scientific communication.
            </P>

            <SubHeading meta="Prize pool ₹1,00,000">Quantum Hackathon, Phase 1: Build with Qiskit</SubHeading>
            <P>
              The hackathon takes you from understanding quantum computing to implementing and benchmarking
              quantum solutions. Teams work on technical problem statements using Qiskit and related scientific
              computing tools. Depending on the challenge, projects may explore:
            </P>
            <RuledList items={HACKATHON_TOPICS} columns={2} />
            <P className="mt-6">
              Phase 1 focuses on a working implementation, a documented approach, and an evaluation against the
              specified benchmark requirements. Teams submit through the official hackathon portal using a
              public GitHub repository, and eligible teams compete for selection to the on-campus Phase 2
              finals.
            </P>
          </section>

          {/* 02 On campus */}
          <section id="on-campus" aria-labelledby="on-campus-title" className="scroll-mt-32 mb-20">
            <SectionHeading {...SECTIONS[1]} />
            <P>
              From <strong className="font-semibold text-[#201617] dark:text-[#FFF4F1]">26 to 30 October 2026</strong>,
              the festival moves to the SRM University-AP campus for an immersive programme of workshops,
              competitions, demonstrations, discussions, games, and industry engagement, bringing together
              scientific learning, practical experimentation, creative thinking, and entrepreneurship.
            </P>

            <SubHeading>IBM Speakers, Keynotes, and Quantum Workshops</SubHeading>
            <P>
              Learn from experts working across quantum technologies and advanced computing. The speaker
              programme connects foundational concepts with the challenges of building and applying emerging
              technologies across hardware, algorithms, and industry applications. A featured hands-on
              masterclass,{' '}
              <em className="font-serif font-semibold text-[#201617] dark:text-[#FFF4F1]">
                Sample Then Diagonalize
              </em>{' '}
              with Bharadwaj Mummaneni, adds a practical dimension to the programme.
            </P>

            <SubHeading>Industry Tech Expo</SubHeading>
            <P>
              The expo brings technology demonstrations, prototypes, and research-oriented exhibits into the
              festival. Explore systems built by industry and research teams and see how scientific principles
              become engineering systems and products. For students interested in experimental physics,
              electronics, quantum hardware, software engineering, and deep-tech development, it connects theory
              with practical implementation, and opens conversations about research careers, product development,
              and emerging technology ventures.
            </P>

            <SubHeading>Quantum Startup Pitch</SubHeading>
            <P>
              Quantum technologies will need more than scientific breakthroughs: they need products, practical
              applications, business models, and teams that can translate research into useful solutions. The
              Startup Pitch is a platform to present ideas related to quantum technology and its wider ecosystem,
              and to articulate how an idea addresses a real technical or commercial challenge.
            </P>

            <SubHeading meta="24 hours">Quantum Hackathon, Phase 2</SubHeading>
            <P>
              Teams selected through Phase 1 continue on campus with an intensive 24-hour development sprint:
              implementing, refining, testing, and presenting their solutions in a collaborative technical
              environment.
            </P>
            <Note>
              <strong className="font-semibold text-[#201617] dark:text-[#FFF4F1]">Phase 2 requires selection through Phase 1.</strong>{' '}
              Completing online registration or purchasing an offline pass does not, by itself, guarantee
              qualification.
            </Note>

            <SubHeading>Quantum Capture the Flag (QCTF)</SubHeading>
            <P>
              Quantum cybersecurity and cryptography bring together computational thinking, mathematical
              reasoning, and security engineering. The flagship QCTF challenges eligible participants with
              technical problems involving quantum-related security concepts. Participation is subject to the
              competition&apos;s qualification and eligibility requirements.
            </P>

            <SubHeading>The Great Quantum Debate</SubHeading>
            <P>
              Does quantum computing replace classical computing, or will the two remain complementary? The
              debate explores quantum and classical computation, technological limits, practical applications,
              and the future of computing, rewarding structured reasoning and the ability to communicate
              technical arguments to an audience.
            </P>

            <SubHeading>QChess, QEscapes, and the Quantum Arcade</SubHeading>
            <P>
              Learning about quantum computing can also be interactive and fun. Campus activities encourage
              strategic thinking, collaboration, and exploration, and give you a chance to meet fellow students
              beyond the formal technical sessions.
            </P>
            <dl className="mt-6 border-t border-[#6C151E]/15 dark:border-[#F07A86]/15">
              {GAMES.map((g) => (
                <div
                  key={g.name}
                  className="grid gap-1 border-b border-[#6C151E]/15 py-4 sm:grid-cols-[180px_1fr] sm:gap-6 dark:border-[#F07A86]/15"
                >
                  <dt className="font-serif text-lg font-bold leading-snug text-[#201617] dark:text-[#FFF4F1]">{g.name}</dt>
                  <dd className="text-[15px] leading-relaxed">{g.text}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* 03 Connected */}
          <section id="connected" aria-labelledby="connected-title" className="scroll-mt-32 mb-20">
            <SectionHeading {...SECTIONS[2]} />
            <P>
              The online competitions and on-campus activities are designed for different ways of engaging with
              quantum technology. Start with what matches your interests, and use the festival to explore the
              parts of the field you know least.
            </P>
            <div className="mt-8 overflow-hidden rounded-lg border border-[#6C151E]/15 dark:border-[#F07A86]/15">
              <table className="w-full text-left text-[15px] leading-snug">
                <thead className="bg-[#6C151E]/[0.05] dark:bg-[#F07A86]/[0.06]">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6C151E] dark:text-[#F07A86]">
                      If you enjoy
                    </th>
                    <th scope="col" className="px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6C151E] dark:text-[#F07A86]">
                      Start with
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {PATHS.map((p) => (
                    <tr key={p.interest} className="border-t border-[#6C151E]/10 dark:border-[#F07A86]/10">
                      <th scope="row" className="w-2/5 px-4 py-3.5 align-top font-semibold text-[#201617] dark:text-[#FFF4F1]">
                        {p.interest}
                      </th>
                      <td className="px-4 py-3.5 align-top">{p.start}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <P className="mt-6">
              The online phase is free, so you can begin learning and competing without an offline pass. The
              campus phase adds further experiences through separately priced passes and activity-specific
              eligibility requirements.
            </P>
          </section>

          {/* 04 Passes */}
          <section id="passes" aria-labelledby="passes-title" className="scroll-mt-32 mb-20">
            <SectionHeading {...SECTIONS[3]} />

            <SubHeading meta="Free">Online Phase</SubHeading>
            <P>
              The masterclass resources, creative competitions, and Quantum Hackathon Phase 1 workspace are
              available at no cost. Register on the{' '}
              <a href={REGISTRATION_URL} className="font-medium text-[#6C151E] underline decoration-[#6C151E]/30 underline-offset-4 hover:decoration-[#6C151E] dark:text-[#F07A86] dark:decoration-[#F07A86]/30">
                official learning platform
              </a>{' '}
              to view instructions, materials, and submission requirements.
            </P>

            <SubHeading meta="26–30 October 2026">Offline Phase: Choose Your Pass</SubHeading>
            <div className="mt-6 grid overflow-hidden rounded-xl border border-[#6C151E]/20 bg-white/60 shadow-sm sm:grid-cols-2 dark:border-[#F07A86]/20 dark:bg-white/[0.03]">
              <div className="p-6">
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7A6B6C] dark:text-[#A8999A]">
                  General Offline Pass
                </p>
                <p className="mt-2 font-serif text-3xl font-bold text-[#201617] dark:text-[#FFF4F1]">
                  <span className="mr-1.5 font-sans text-sm font-medium text-[#7A6B6C] dark:text-[#A8999A]">from</span>
                  ₹99
                </p>
                <p className="mt-4 text-[15px] leading-relaxed">
                  For eligible campus activities, exhibitions, keynote sessions, workshops, debates, and
                  open-participation games.
                </p>
              </div>
              <div className="border-t border-[#6C151E]/20 bg-[#6C151E]/[0.04] p-6 sm:border-t-0 sm:border-l dark:border-[#F07A86]/20 dark:bg-[#F07A86]/[0.05]">
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6C151E] dark:text-[#F07A86]">
                  All-Access Flagship Pass
                </p>
                <p className="mt-2 font-serif text-3xl font-bold text-[#201617] dark:text-[#FFF4F1]">₹499</p>
                <ul className="mt-4 space-y-2.5">
                  {FLAGSHIP_PASS_BENEFITS.map((b) => (
                    <li key={b} className="flex gap-2.5 text-[15px] leading-snug">
                      <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#6C151E] dark:text-[#F07A86]" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <P className="mt-6">
              The ₹499 pass is intended for participants who want to spend all five days on campus, engage with
              the technical programme, experience the expo and workshops, and join the wider festival community.
            </P>
            <Note>
              Consult the official event instructions for final pass inclusions, activity restrictions, and
              qualification requirements. Purchasing a pass does not guarantee selection for competitive events
              that require separate evaluation.
            </Note>
          </section>

          {/* 05 Why */}
          <section id="why" aria-labelledby="why-title" className="scroll-mt-32 mb-20">
            <SectionHeading {...SECTIONS[4]} />
            <P>
              The value of a technology festival lies not only in its sessions but in the opportunities it
              creates. Qiskit Fall Fest 2026 brings together several dimensions of learning and innovation:
            </P>
            <dl className="mt-6 grid border-t border-[#6C151E]/15 sm:grid-cols-2 sm:gap-x-8 dark:border-[#F07A86]/15">
              {REASONS.map((r) => (
                <div key={r.verb} className="border-b border-[#6C151E]/15 py-4 dark:border-[#F07A86]/15">
                  <dt className="font-serif text-lg font-bold leading-snug text-[#201617] dark:text-[#FFF4F1]">{r.verb}</dt>
                  <dd className="mt-1 text-[15px] leading-relaxed">{r.text}</dd>
                </div>
              ))}
            </dl>
            <P className="mt-6">
              You do not need to be an expert in every area to get involved. Start with the activities that
              match your interests, use the learning resources available to you, and explore unfamiliar parts of
              the field.
            </P>
          </section>

          {/* 06 Register */}
          <section id="register" aria-labelledby="register-title" className="scroll-mt-32">
            <SectionHeading {...SECTIONS[5]} />
            <P>
              Registration has been extended to{' '}
              <strong className="font-semibold text-[#201617] dark:text-[#FFF4F1]">17 October 2026, 11:59 PM IST</strong>.
              Students who had difficulty with external registration platforms can register directly on the
              official learning website and follow the platform instructions to access learning materials and
              participant workspaces.
            </P>

            <div className="mt-10 rounded-xl bg-[#3A0B10] p-6 text-[#F5F3F0] shadow-md sm:p-8 dark:bg-[#1F0609] dark:ring-1 dark:ring-[#F07A86]/20">
              <p className="font-serif text-2xl font-bold leading-snug sm:text-3xl">
                Learn the concepts. Build the solutions. Challenge your assumptions.
              </p>
              <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-[#E5D8D5]">
                Meet the community shaping the future of quantum technology. Online phase free; on campus
                26–30 October 2026 at SRM University-AP.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a
                  href={REGISTRATION_URL}
                  className="group inline-flex items-center gap-2 rounded-lg bg-[#F5F3F0] px-5 py-3 text-sm font-semibold text-[#3A0B10] transition-colors duration-200 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                >
                  Register and Explore the Learning Platform
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </a>
                <a
                  href={WHATSAPP_COMMUNITY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/25 px-5 py-3 text-sm font-semibold text-[#F5F3F0] transition-colors duration-200 hover:border-white/50 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                >
                  WhatsApp Community
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </div>

            <p className="mt-10 font-serif text-lg italic leading-relaxed text-[#4A3F40] dark:text-[#D2C4C1]">
              We look forward to welcoming you to five days of quantum innovation at SRM University-AP.
            </p>
          </section>
        </div>
      </div>
    </article>
  );
}
