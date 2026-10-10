import { LectureSession } from './types';

export interface ScheduleAgendaItem {
  time: string;
  duration: string;
  title: string;
  speaker: string;
  speakerRole: string;
  type: 'inauguration' | 'session' | 'break' | 'quiz' | 'competition' | 'ceremony';
  sessionId?: string;
  deliverables?: string;
}

export interface DayProgramme {
  day: 1 | 2 | 3;
  dateStr: string;
  weekday: string;
  theme: string;
  timeRange: string;
  items: ScheduleAgendaItem[];
}

export const CURRICULUM_SESSIONS: LectureSession[] = [
  {
    id: 'session-1',
    day: 1,
    sessionNumber: 1,
    title: 'Session 1: Introduction to Qiskit, Quantum Computing & Quantum Material',
    dateStr: 'Day 1 · Thursday, 8 October 2026',
    timeStr: '11:00 AM – 04:00 PM IST',
    duration: '4 Hours (Comprehensive Foundations & Material)',
    youtubeId: 'Tk9LOL9--Y4',
    youtubeUrl: 'https://www.youtube.com/watch?v=Tk9LOL9--Y4',
    speaker: {
      name: 'Raghav Singla',
      role: 'Application Developer',
      institution: 'IBM',
      bio: 'Raghav Singla is an Application Developer at IBM specializing in quantum software architecture, Qiskit 1.x SDK development, and developer ecosystem enablement.',
      websiteUrl: 'https://www.ibm.com/quantum',
    },
    coSpeakers: [
      {
        name: 'Jayakumar Vaithiyashankar',
        role: 'Founder / CEO',
        institution: 'Anuthantra',
        bio: 'Jayakumar Vaithiyashankar is the Founder & CEO of Anuthantra, pioneering deep-tech quantum education, hardware-software integration, and industry quantum adoption.',
        websiteUrl: 'https://anuthantra.com',
      },
      {
        name: 'Dr. Jagrati Dwivedi',
        role: 'Researcher & Faculty',
        institution: 'QMD Foundation of the National Quantum Mission, at IIT Delhi',
        bio: 'Dr. Jagrati Dwivedi works with the Quantum Material and Device (QMD) Foundation under the National Quantum Mission at IIT Delhi, researching novel quantum matter, topological phases, and solid-state quantum devices.',
        websiteUrl: 'https://home.iitd.ac.in',
      },
    ],
    description:
      'The comprehensive foundational entry point to Qiskit Fall Fest 2026 combining quantum computing principles, hands-on Qiskit 1.x workflows, and quantum materials. Transition from classical bits to qubits, superposition, Bloch sphere state vectors, and single and two-qubit gate synthesis (X, H, CNOT, Rz). Learn to construct, simulate, and measure quantum circuits, and explore how quantum hardware revolutionizes materials science and simulates complex quantum materials beyond classical limits.',
    prerequisites: 'Basic linear algebra and Python fundamentals.',
    learnPoints: [
      'Qubit representations, statevectors, and probability amplitudes',
      'Single-qubit unitary rotations (X, Y, Z, H, S, T, Rx, Ry, Rz) and Bloch sphere geometry',
      'Multi-qubit entanglement and Bell state synthesis via CNOT gates',
      'Qiskit 1.x QuantumCircuit construction, transpilation, and statevector simulation',
      'Superconducting qubits: Nonlinear Josephson junctions, transmons, and quantum materials simulation',
      'Physical noise and decoherence times (T1 relaxation, T2 dephasing)',
    ],
  },
  {
    id: 'session-3',
    day: 2,
    sessionNumber: 3,
    title: 'Session 3: Qubit Connectivity & Architecture',
    dateStr: 'Day 2 · Friday, 9 October 2026',
    timeStr: '10:00 AM – 12:15 PM IST',
    duration: '2 Hours 15 Mins (Architecture, 2Q-QFT Live Coding & Lab Tour)',
    youtubeId: 'no-MUQ50ihg',
    youtubeUrl: 'https://www.youtube.com/live/no-MUQ50ihg',
    defaultStartSeconds: 716,
    speaker: {
      name: 'Karthikganesh Durai',
      role: 'Associate Director - Business Analysis',
      institution: 'NTT DATA',
      bio: 'Karthikganesh Durai serves as Associate Director of Business Analysis at NTT DATA, specializing in quantum hardware architectures, Qiskit and PennyLane circuit synthesis, Quantum Machine Learning, and enterprise quantum adoption.',
      websiteUrl: 'https://www.nttdata.com',
    },
    coSpeakers: [
      {
        name: 'Dr. Varsha Sambhaje',
        role: 'Faculty In-charge, Quantum Research Centre',
        institution: 'SRM University-AP',
        bio: 'Dr. Varsha Sambhaje leads the Quantum Research Centre at SRM University-AP, overseeing India’s first Quantum Reference Facility, millikelvin dilution refrigerator operations, and superconducting processor testing.',
        websiteUrl: 'https://srmap.edu.in',
      },
    ],
    description:
      'Bridge classical semiconductor electronics and the five mature quantum hardware modalities: Superconducting, Trapped Ion, Photonic, Neutral Atom, and Quantum Annealers. Explore Single Electron Transistors (SET), electron spin as Intrinsic Angular Momentum (IAM), photon polarization, classical complex column vector simulation on the Bloch sphere, unitary gate matrix composition, a live 2-qubit Quantum Fourier Transform (QFT) Qiskit coding walkthrough, and a live virtual tour inside SRM University-AP’s Dilution Refrigerator down to 10 mK.',
    prerequisites: 'Session 1 foundations, complex numbers, linear algebra, and basic Qiskit syntax.',
    learnPoints: [
      'Classical NPN/PNP/MOSFET transistor bit physics (5V DC, ~3,000–5,000 electrons) vs. 5 mature commercial qubit technologies',
      'Electron spin as Intrinsic Angular Momentum (IAM), photon polarization (0 vs. π/2 rad), and two-element complex column vectors',
      'Why quantum computers are exponentially faster: 2^n superposition parallelism and reverse-order unitary matrix composition (P · Y · H |ψ⟩)',
      'Superconducting Niobium/Aluminium Josephson junctions, Cooper pairs at 10 mK, 4:1 physical-to-logical qubit ratio, and Quantum Volume (QV)',
      'Trapped Ions (Ca+/Yb+ fluorescence), Photonics (SPS, waveguides, ring resonators), Neutral Atoms (1,180+ UHV optical lattice qubits), and D-Wave Ising Annealers (-1/+1 spins)',
      'Hands-on 2-Qubit Quantum Fourier Transform (QFT) circuit in Qiskit and live virtual tour of SRM AP’s Quantum Reference Facility',
    ],
  },
  {
    id: 'session-4',
    day: 2,
    sessionNumber: 4,
    title: 'Session 4: Quantum Sensing & Quantum Optics',
    dateStr: 'Day 2 · Friday, 9 October 2026',
    timeStr: '02:00 PM – 04:20 PM IST (4A: Sensing · 4B: Quantum Optics · Quirk Demo)',
    duration: '2 Hours 15 Mins (60m Sensing + 60m Optics + Live Simulator)',
    youtubeId: 'no-MUQ50ihg',
    youtubeUrl: 'https://www.youtube.com/live/no-MUQ50ihg',
    defaultStartSeconds: 14946,
    speaker: {
      name: 'Prof. Durga B. Rao Dasari',
      role: 'Director of Quantum Software Division',
      institution: 'QubitForce (Formerly University of Stuttgart, Germany)',
      bio: 'Prof. Durga B. Rao Dasari is Director of the Quantum Software Division at QubitForce and spent over 15 years at the University of Stuttgart pioneering solid-state NV-center diamond magnetometry, nuclear spin quantum registers, and quantum computational sensing.',
      websiteUrl: 'https://srmap.edu.in',
    },
    coSpeakers: [
      {
        name: 'Dr. Gangi Reddy Salla',
        role: 'Associate Professor & Founder of Quantum Optics Lab',
        institution: 'SRM University-AP (PRL Ahmedabad Alumnus)',
        bio: 'Dr. Gangi Reddy Salla is an Associate Professor of Physics at SRM University-AP and founder of its DST/ANRF-funded Quantum Optics Laboratory, specializing in Spontaneous Parametric Down-Conversion (SPDC), orbital angular momentum (OAM) optical vortices, and photonic quantum technologies.',
        websiteUrl: 'https://srmap.edu.in',
      },
    ],
    description:
      'Master precision quantum metrology and photonic quantum technologies. Session 4A (Prof. Durga B. Rao Dasari) covers single-spin nanodiamond probes, femtotesla bio-magnetometry, 1/ε² vs. 1/ε resource scaling, Standard Quantum Limit vs. Heisenberg Limit, Quantum Fisher Information (F = N²) and the Cramér-Rao Bound, Ramsey, Hahn Echo, Dynamical Decoupling filter functions, 4-qubit GHZ sensing, room-temperature Diamond NV centers coupled to 10–25 13C nuclear memory spins, and Quantum Computational Sensing. Session 4B (Dr. Gangi Reddy Salla) covers Quantum Photonics, the 1935 EPR paradox, OAM Hilbert spaces, SU(2) waveplate control, SPDC in χ^(2) PPKTP/BBO crystals, Hanbury Brown–Twiss g^(2)(0) anti-bunching, Type-I vs. Type-II entangled rings, Bell’s inequality (S ≤ 2√2), optical tweezers, 6-beam laser cooling, SNSPD/SPAD detectors, BB84 QKD, Quantum Teleportation, and a live Quirk & QuVis circuit simulation demo.',
    prerequisites: 'Sessions 1 & 3. Familiarity with superposition, relative phase, and Bloch sphere rotations.',
    learnPoints: [
      'Session 4A: Single-spin nanodiamond fiber probes (200–500 nm), femtotesla brain magnetometry, and room-temperature NV centers vs. cryogenic SQUIDs',
      'Resource scaling (1/ε² classical vs. 1/ε quantum), SQL (1/√N, F=N) vs. Heisenberg Limit (1/N, F=N²), and the Cramér-Rao Bound',
      'Spin-resonance Qiskit circuits (π/2 ↔ H, π ↔ X): Ramsey DC sensing, Hahn Echo AC refocussing, Dynamical Decoupling filter functions, and 4-qubit GHZ cos(4φ) phase amplification',
      'Diamond NV center optical readout (532 nm green laser, bright m_s=0 vs. dark m_s=±1 red fluorescence), 10–25 13C nuclear spin memories, and Quantum Computational Sensing before measurement',
      'Session 4B: Photonic degrees of freedom (OAM infinite Hilbert space), 3-waveplate SU(2) polarization unitaries, 1550 nm telecom propagation, and SPDC in χ^(2) PPKTP/BBO crystals',
      'Hanbury Brown–Twiss g^(2)(0) = 0 anti-bunching, Type-I vs. Type-II entangled SPDC rings, Bell’s inequality (S ≤ 2√2), 6-beam laser cooling, SNSPD/SPAD detectors, Quantum Teleportation, and Quirk/QuVis simulation',
    ],
  },
  {
    id: 'session-5',
    day: 3,
    sessionNumber: 5,
    title: 'Session 5: Quantum Machine Learning',
    dateStr: 'Day 3 · Saturday, 10 October 2026',
    timeStr: '10:00 AM – 12:00 PM IST',
    duration: '2 Hours (120 Mins)',
    youtubeId: '-sxlXNz7ZxU',
    youtubeUrl: 'https://www.youtube.com/watch?v=-sxlXNz7ZxU',
    speaker: {
      name: 'Jay Shah',
      role: 'Senior Quantum Machine Learning Engineer',
      institution: 'BQP',
      bio: 'Jay Shah is a Senior Quantum Machine Learning Engineer at BQP, developing parameterized variational circuits, quantum feature spaces, and hybrid QML algorithms for engineering simulations.',
      websiteUrl: 'https://bosonqenergy.com',
    },
    description:
      'Unite modern machine learning with quantum Hilbert spaces. Learn data encoding strategies (amplitude encoding, angle encoding, and non-linear ZZFeatureMaps), evaluate quantum kernel matrices on classical support vector machines (QSVM), and construct trainable Variational Quantum Classifiers (VQC) with Primitives V2.',
    prerequisites: 'Sessions 1–3, and basic machine learning concepts (classification, loss functions).',
    learnPoints: [
      'Parameterized quantum circuits (PQC) and variational ansatz design',
      'Hybrid classical-quantum training loops with gradient estimators (parameter-shift rule)',
      'Data encoding techniques: Amplitude encoding, angle encoding, and ZZ-feature maps',
      'Hands-on implementation of a Variational Quantum Classifier (VQC) using EstimatorV2',
    ],
  },
  {
    id: 'session-6',
    day: 3,
    sessionNumber: 6,
    title: 'Session 6: Quantum Cyber Security / Cryptography',
    dateStr: 'Day 3 · Saturday, 10 October 2026',
    timeStr: '02:00 PM – 04:00 PM IST',
    duration: '2 Hours (120 Mins)',
    youtubeId: 'ev-L2YibRR4',
    youtubeUrl: 'https://www.youtube.com/live/ev-L2YibRR4',
    speaker: {
      name: 'Dr. Sazzad Ali Biswas',
      role: 'Assistant Professor',
      institution: 'SRM University-AP',
      bio: 'Dr. Sazzad Ali Biswas is an Assistant Professor at SRM University-AP, researching quantum cryptography, post-quantum cryptographic standards (NIST ML-KEM / ML-DSA), and cybersecurity protocols.',
      websiteUrl: 'https://srmap.edu.in',
    },
    description:
      'The definitive cryptographic masterclass for the quantum era. Analyze how Shor’s algorithm shatters RSA and elliptic-curve cryptography through period finding. Study the reversible arithmetic hardware bottlenecks (carry-ripple adders, modular multipliers), and explore enterprise transition to NIST Post-Quantum Cryptography standards.',
    prerequisites: 'Sessions 1–3. Familiarity with public-key cryptography and modular arithmetic.',
    learnPoints: [
      'Foundations of classical cryptography (RSA, Diffie-Hellman, ECC) and prime factorization hardness',
      'Quantum period-finding, Quantum Fourier Transform (QFT), and Shor’s algorithm formulation',
      'NIST Post-Quantum Cryptography standards: Lattice-based ML-KEM and ML-DSA',
      'Quantum Key Distribution (BB84) vs Post-Quantum Mathematical Cryptography',
    ],
  },
];

/**
 * Complete Official 3-Day Programme Schedule extracted from the official schedule:
 * SRM AP Partner Plus | Qiskit Fall Fest 2026 — Online Phase
 */
export const ONLINE_PROGRAMME_SCHEDULE: DayProgramme[] = [
  {
    day: 1,
    dateStr: 'Thursday, 8 October 2026',
    weekday: 'Thursday',
    theme: 'Day 1 — Foundations',
    timeRange: '10:00 AM – 5:00 PM IST',
    items: [
      {
        time: '10:00 - 10:05',
        duration: '5 min',
        title: 'Welcome Address',
        speaker: 'Dr. Varsha Sambhaje',
        speakerRole: 'Faculty In-charge for Quantum Research Centre – SRM University – AP',
        type: 'inauguration',
      },
      {
        time: '10:05 - 10:15',
        duration: '10 min',
        title: 'Address to gathering',
        speaker: 'Sri C.V. Sridhar',
        speakerRole: 'Mission Director AP State Quantum Mission, GoAP',
        type: 'inauguration',
      },
      {
        time: '10:15 - 10:30',
        duration: '15 min',
        title: 'Address to gathering',
        speaker: 'Dr. L.V Subramaniam',
        speakerRole: 'CEO, Qbit Force',
        type: 'inauguration',
      },
      {
        time: '10:30 - 10:35',
        duration: '5 min',
        title: 'Address to gathering',
        speaker: 'Prof. C.V Tomy',
        speakerRole: 'Dean, SEAS',
        type: 'inauguration',
      },
      {
        time: '10:35 - 10:50',
        duration: '15 min',
        title: 'Address to gathering',
        speaker: 'Prof. Somnath Bhattacharya',
        speakerRole: 'Dean, QuTI, SRM AP',
        type: 'inauguration',
      },
      {
        time: '10:50 - 11:00',
        duration: '10 min',
        title: 'Address to gathering',
        speaker: 'Prof. CH Satish Kumar',
        speakerRole: 'Vice Chancellor, SRM University AP',
        type: 'inauguration',
      },
      {
        time: '11:00 - 12:00',
        duration: '60 min',
        title: 'Session 1: Introduction to Qiskit, Quantum Computing & Quantum Material (Part 1)',
        speaker: 'Raghav Singla',
        speakerRole: 'Application Developer, IBM',
        type: 'session',
        sessionId: 'session-1',
      },
      {
        time: '12:00 - 13:00',
        duration: '60 min',
        title: 'Session 1: Introduction to Qiskit, Quantum Computing & Quantum Material (Part 2)',
        speaker: 'Jayakumar Vaithiyashankar',
        speakerRole: 'Founder / CEO, Anuthantra',
        type: 'session',
        sessionId: 'session-1',
      },
      {
        time: '13:00 - 14:00',
        duration: '60 min',
        title: 'Lunch Break',
        speaker: '—',
        speakerRole: 'Midday Recharge',
        type: 'break',
      },
      {
        time: '14:00 - 16:00',
        duration: '120 min',
        title: 'Session 1: Introduction to Qiskit, Quantum Computing & Quantum Material (Part 3)',
        speaker: 'Dr. Jagrati Dwivedi',
        speakerRole: 'QMD Foundation of the National Quantum Mission, at IIT Delhi',
        type: 'session',
        sessionId: 'session-1',
      },
      {
        time: '16:00 - 23:59',
        duration: 'Self-paced',
        title: 'Concept Quiz: 20-Question Challenge',
        speaker: 'Self',
        speakerRole: 'Accessible via LMS',
        type: 'quiz',
        sessionId: 'session-1',
      },
      {
        time: 'Deadline: 12 Oct (11:59 PM)',
        duration: 'Due 12 Oct',
        title: 'Online Game: Tech Reels Competition',
        speaker: 'Open to all participants',
        speakerRole: 'Accessible via LMS / Link',
        type: 'competition',
      },
    ],
  },
  {
    day: 2,
    dateStr: 'Friday, 9 October 2026',
    weekday: 'Friday',
    theme: 'Day 2 — Architecture, Optics & Sensing',
    timeRange: '10:00 AM – 5:00 PM IST',
    items: [
      {
        time: '10:00 - 11:55',
        duration: '115 min',
        title: 'Session 3: Qubit Connectivity, Quantum Hardware Architectures & 2-Qubit QFT Live Coding',
        speaker: 'Karthikganesh Durai',
        speakerRole: 'Associate Director - Business Analysis at NTT DATA',
        type: 'session',
        sessionId: 'session-3',
      },
      {
        time: '11:55 - 12:15',
        duration: '20 min',
        title: 'Session 3 (Part 2): Live Virtual Tour — SRM AP Quantum Reference Facility & Dilution Refrigerator',
        speaker: 'Dr. Varsha Sambhaje',
        speakerRole: 'Faculty In-charge, Quantum Research Centre, SRM University-AP',
        type: 'session',
        sessionId: 'session-3',
      },
      {
        time: '12:15 - 14:00',
        duration: '105 min',
        title: 'Lunch Break',
        speaker: '—',
        speakerRole: 'Midday Recharge',
        type: 'break',
      },
      {
        time: '14:00 - 14:45',
        duration: '45 min',
        title: 'Session 4A: Quantum Sensing, NV-Center Magnetometry & Quantum Computational Sensing',
        speaker: 'Prof. Durga B. Rao Dasari',
        speakerRole: 'Director of Quantum Software Division, QubitForce (Formerly University of Stuttgart)',
        type: 'session',
        sessionId: 'session-4',
      },
      {
        time: '14:45 - 16:20',
        duration: '95 min',
        title: 'Session 4B: Quantum Photonics, SPDC, Entangled Photons & Quirk/QuVis Live Simulation',
        speaker: 'Dr. Gangi Reddy Salla & Gyanendra',
        speakerRole: 'Associate Professor & Technical Team Lead, SRM University-AP',
        type: 'session',
        sessionId: 'session-4',
      },
      {
        time: '16:20 - 23:59',
        duration: 'Self-paced',
        title: 'Session 3 Concept Quiz: 20-Question Challenge (Qubit Connectivity & Hardware)',
        speaker: 'Self',
        speakerRole: 'Accessible via LMS',
        type: 'quiz',
        sessionId: 'session-3',
      },
      {
        time: '16:20 - 23:59',
        duration: 'Self-paced',
        title: 'Session 4 Concept Quiz: 20-Question Challenge (Quantum Sensing & Quantum Optics)',
        speaker: 'Self',
        speakerRole: 'Accessible via LMS',
        type: 'quiz',
        sessionId: 'session-4',
      },
      {
        time: 'Deadline: 12 Oct (11:59 PM)',
        duration: 'Due 12 Oct',
        title: 'Online Game: Digital Poster Creation',
        speaker: 'Open to all participants',
        speakerRole: 'Accessible via LMS / Link',
        type: 'competition',
      },
    ],
  },
  {
    day: 3,
    dateStr: 'Saturday, 10 October 2026',
    weekday: 'Saturday',
    theme: 'Day 3 — Quantum Algorithms & Security',
    timeRange: '10:00 AM – 6:00 PM IST',
    items: [
      {
        time: '10:00 - 12:00',
        duration: '120 min',
        title: 'Session 5: Quantum Machine Learning',
        speaker: 'Jay Shah',
        speakerRole: 'Senior Quantum Machine Learning Engineer, BQP',
        type: 'session',
        sessionId: 'session-5',
      },
      {
        time: '12:00 - 14:00',
        duration: '120 min',
        title: 'Lunch Break',
        speaker: '—',
        speakerRole: 'Midday Recharge',
        type: 'break',
      },
      {
        time: '14:00 - 16:00',
        duration: '120 min',
        title: 'Session 6: Quantum Cyber Security / Cryptography',
        speaker: 'Dr. Sazzad Ali Biswas',
        speakerRole: 'Assistant Professor, SRM AP',
        type: 'session',
        sessionId: 'session-6',
      },
      {
        time: '17:00 - 18:00',
        duration: '60 min',
        title: 'Hackathon Problem Statement Release & Closing Ceremony',
        speaker: 'Organising Team',
        speakerRole: 'SRM University-AP Organizing Committee',
        type: 'ceremony',
      },
      {
        time: 'Deadline: 12 Oct (11:59 PM)',
        duration: 'Due 12 Oct',
        title: 'Online Game: Essay Competition',
        speaker: 'Open to all participants',
        speakerRole: 'Accessible via LMS / Link',
        type: 'competition',
      },
    ],
  },
];
