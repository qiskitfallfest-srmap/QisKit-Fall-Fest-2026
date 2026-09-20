export interface ExperienceHeroItem {
  id: string;
  title: string;
  image: string;
  credit?: string;
  meta?: string[];
  accent?: string;
  description?: string;
  registrationUrl?: string;
  registrationLabel?: string;
  category?: 'learn' | 'build' | 'connect';
}

// Alias for backwards compatibility
export type ExperienceEvent = ExperienceHeroItem;
export type ConnectHeroItem = ExperienceHeroItem;

export const LEARN_ITEMS: ExperienceHeroItem[] = [
  {
    id: 'learn-01-qiskit-fundamentals',
    title: 'Qiskit 1.0 Fundamentals\n& QPU Primitives',
    description:
      'Master quantum circuit synthesis, transpile pipelines, and utility-scale algorithm execution using Estimator and Sampler primitives on 100+ qubit IBM Quantum processors.',
    image: '/images/events/world-class-workshops-dark.png',
    accent: '#6C151E',
    category: 'learn',
    credit: 'LED BY IBM QUANTUM ADVOCATES',
    meta: ['FOUNDATIONS', 'OCT 14, 2026', 'MAIN AUDITORIUM'],
    registrationUrl: 'https://qiskit.org/fallfest',
    registrationLabel: 'Register for Fundamentals',
  },
  {
    id: 'learn-02-error-mitigation',
    title: 'Quantum Error Mitigation\n& Noise Characterization',
    description:
      'Hands-on laboratory implementing Zero-Noise Extrapolation (ZNE), Probabilistic Error Cancellation (PEC), and dynamical decoupling to run high-fidelity circuits on noisy backends.',
    image: '/images/events/inspiring-sessions-dark.png',
    accent: '#521018',
    category: 'learn',
    credit: 'SRM AP QUANTUM RESEARCH GROUP',
    meta: ['ADVANCED LAB', 'OCT 15, 2026', 'QUANTUM LAB COMPLEX'],
    registrationUrl: 'https://qiskit.org/fallfest',
    registrationLabel: 'Register for Error Mitigation',
  },
  {
    id: 'learn-03-vqe-chemistry',
    title: 'Variational Algorithms\n& Chemistry Applications',
    description:
      'Deep dive into molecular ground-state energy computation, ansatz optimization, and parameterized quantum circuits for electronic structure simulation with Qiskit Nature.',
    image: '/images/events/world-class-workshops-light.png',
    accent: '#B08D57',
    category: 'learn',
    credit: 'COMPUTATIONAL QUANTUM SCIENTISTS',
    meta: ['APPLICATIONS', 'OCT 15, 2026', 'SEMINAR HALL 1'],
    registrationUrl: 'https://qiskit.org/fallfest',
    registrationLabel: 'Register for Chemistry Track',
  },
  {
    id: 'learn-04-pulse-control',
    title: 'Pulse-Level Control\n& Dynamics Masterclass',
    description:
      'Explore microwave pulse scheduling, Hamiltonian modeling, open quantum system simulations, and transmon qubit state steering beyond standard gate abstractions.',
    image: '/images/events/inspiring-sessions-light.png',
    accent: '#3A0B10',
    category: 'learn',
    credit: 'HARDWARE RESEARCH SPECIALISTS',
    meta: ['MASTERCLASS', 'OCT 16, 2026', 'PHYSICS WING A'],
    registrationUrl: 'https://qiskit.org/fallfest',
    registrationLabel: 'Register for Masterclass',
  },
  {
    id: 'learn-05-qml-kernels',
    title: 'Quantum Machine Learning\n& Kernel Architectures',
    description:
      'Explore quantum support vector machines, parameterized feature maps, and hybrid classical-quantum models deployed on utility-scale hardware with Qiskit Machine Learning.',
    image: '/images/events/global-community-dark.png',
    accent: '#6C151E',
    category: 'learn',
    credit: 'IBM RESEARCH AI & QUANTUM ADVOCATES',
    meta: ['MACHINE LEARNING', 'OCT 16, 2026', 'INNOVATION LAB'],
    registrationUrl: 'https://qiskit.org/fallfest',
    registrationLabel: 'Register for QML Workshop',
  },
];

export const BUILD_ITEMS: ExperienceHeroItem[] = [
  {
    id: 'build-01-hackathon-sprint',
    title: 'Quantum Algorithm\nHackathon Sprint',
    description:
      '48-hour competitive sprint engineering quantum algorithms for combinatorial optimization, Hamiltonian simulation, and financial modeling on real IBM Quantum backends.',
    image: '/images/events/quantum-hackathons-dark.png',
    accent: '#6C151E',
    category: 'build',
    credit: 'SRM AP QUANTUM CLUB & IBM MENTORS',
    meta: ['48-HR SPRINT', 'OCT 16-17, 2026', 'HACKER LOUNGE'],
    registrationUrl: 'https://qiskit.org/fallfest',
    registrationLabel: 'Register for Hackathon',
  },
  {
    id: 'build-02-circuit-optimization',
    title: 'Quantum Circuit\nOptimization Lab',
    description:
      'Hands-on engineering workshop reducing two-qubit gate depths, optimizing swap routing, and building custom transpiler pass managers with Qiskit 1.0.',
    image: '/images/events/world-class-workshops-dark.png',
    accent: '#521018',
    category: 'build',
    credit: 'IBM QUANTUM SYSTEMS ENGINEERS',
    meta: ['HANDS-ON LAB', 'OCT 16, 2026', 'LAB WING B'],
    registrationUrl: 'https://qiskit.org/fallfest',
    registrationLabel: 'Register for Circuit Lab',
  },
  {
    id: 'build-03-opensource-extension',
    title: 'Open-Source Qiskit\nExtension Sprint',
    description:
      'Collaborative open-source workshop contributing features, bug fixes, and documentation to the Qiskit ecosystem and community packages.',
    image: '/images/events/inspiring-sessions-dark.png',
    accent: '#B08D57',
    category: 'build',
    credit: 'QISKIT CORE MAINTAINERS',
    meta: ['OPEN SOURCE', 'OCT 17, 2026', 'INNOVATION HUB'],
    registrationUrl: 'https://qiskit.org/fallfest',
    registrationLabel: 'Join Open-Source Sprint',
  },
  {
    id: 'build-04-pulse-calibration',
    title: 'Pulse Calibration\n& QPU Steering Lab',
    description:
      'Calibrate cross-resonance microwave pulses, tune DRAG coefficients, and execute fine-grained quantum state tomography directly on superconducting qubits.',
    image: '/images/events/inspiring-sessions-light.png',
    accent: '#3A0B10',
    category: 'build',
    credit: 'HARDWARE EXPERIMENTAL GROUP',
    meta: ['PULSE TUNING', 'OCT 17, 2026', 'CRYO LAB A'],
    registrationUrl: 'https://qiskit.org/fallfest',
    registrationLabel: 'Apply for Lab Seat',
  },
  {
    id: 'build-05-runtime-showcase',
    title: 'Qiskit Runtime\nApplication Showcase',
    description:
      'Live demonstration and project defense of hybrid quantum-classical pipelines deployed on cloud QPU primitives using Qiskit Runtime Service.',
    image: '/images/events/world-class-workshops-light.png',
    accent: '#6C151E',
    category: 'build',
    credit: 'JUDGING PANEL & INDUSTRY PARTNERS',
    meta: ['SHOWCASE', 'OCT 18, 2026', 'AUDITORIUM 2'],
    registrationUrl: 'https://qiskit.org/fallfest',
    registrationLabel: 'Submit Project Pitch',
  },
];

export const CONNECT_ITEMS: ExperienceHeroItem[] = [
  {
    id: 'connect-01-ecosystem-panel',
    title: 'Quantum Leaders\n& Ecosystem Panel',
    description:
      'Connect with quantum executives, research scientists, and startup founders discussing commercial quantum advantage and industry adoption roadmap.',
    image: '/images/events/global-community-dark.png',
    accent: '#6C151E',
    category: 'connect',
    credit: 'BY IBM QUANTUM & INDUSTRY LEADERS',
    meta: ['PANEL DISCUSSION', 'OCT 16, 2026', 'MAIN AUDITORIUM'],
    registrationUrl: 'https://qiskit.org/fallfest',
    registrationLabel: 'Register for Panel',
  },
  {
    id: 'connect-02-student-summit',
    title: 'Global Student\nChapter Summit',
    description:
      'International collaboration circle uniting university quantum club presidents, student delegates, and quantum open-source contributors.',
    image: '/images/events/quantum-hackathons-dark.png',
    accent: '#521018',
    category: 'connect',
    credit: 'BY QISKIT ADVOCATES & SRM AP CHAPTER',
    meta: ['STUDENT SUMMIT', 'OCT 17, 2026', 'INNOVATION COMMONS'],
    registrationUrl: 'https://qiskit.org/fallfest',
    registrationLabel: 'Join Student Summit',
  },
  {
    id: 'connect-03-mentorship-roundtables',
    title: 'Research Mentorship\n& Theory Roundtables',
    description:
      'Direct roundtable discussions pairing undergraduate and graduate students with senior quantum theorists and experimentalists in error mitigation.',
    image: '/images/events/inspiring-sessions-dark.png',
    accent: '#B08D57',
    category: 'connect',
    credit: 'BY VISITING ACADEMIC FELLOWS',
    meta: ['MENTORSHIP', 'OCT 17, 2026', 'CENTRAL PAVILION'],
    registrationUrl: 'https://qiskit.org/fallfest',
    registrationLabel: 'Apply for Mentorship',
  },
  {
    id: 'connect-04-careers-mixer',
    title: 'Careers in Quantum\nIndustry Mixer',
    description:
      'Meet talent scouts and engineering managers from leading hardware and software quantum enterprises recruiting for internships and research posts.',
    image: '/images/events/world-class-workshops-dark.png',
    accent: '#3A0B10',
    category: 'connect',
    credit: 'BY QUANTUM ECOSYSTEM ALLIANCE',
    meta: ['CAREERS MIXER', 'OCT 18, 2026', 'GRAND ATRIUM'],
    registrationUrl: 'https://qiskit.org/fallfest',
    registrationLabel: 'Register for Mixer',
  },
  {
    id: 'connect-05-open-science-gala',
    title: 'Open Science\nCollaborative Gala',
    description:
      'Celebrate the conclusion of Qiskit Fall Fest 2026 with award announcements, contributor recognitions, and keynote closing addresses.',
    image: '/images/events/inspiring-sessions-light.png',
    accent: '#6C151E',
    category: 'connect',
    credit: 'BY QISKIT COMMUNITY COUNCIL',
    meta: ['CLOSING GALA', 'OCT 18, 2026', 'GALA DINING HALL'],
    registrationUrl: 'https://qiskit.org/fallfest',
    registrationLabel: 'RSVP for Gala',
  },
];

// Alias for backwards compatibility
export const LEARN_EVENTS = LEARN_ITEMS;
