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
    title: 'Session 1: Introduction to Qiskit & Quantum Computing',
    dateStr: 'Day 1 · Thursday, 8 October 2026',
    timeStr: '11:00 AM – 01:00 PM IST',
    duration: '2 Hours (11:00–12:00 & 12:00–13:00)',
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
    ],
    description:
      'The foundational entry point to Qiskit Fall Fest 2026. Transition from classical bit intuition to qubits, superposition, Bloch sphere state vectors, and single and two-qubit gate synthesis (X, H, CNOT, Rz). Learn to construct, simulate, and measure your first quantum circuit using Qiskit 1.x SDK.',
    prerequisites: 'Basic linear algebra and Python fundamentals.',
    learnPoints: [
      'Qubit representations, statevectors, and probability amplitudes',
      'Single-qubit unitary rotations (X, Y, Z, H, S, T, Rx, Ry, Rz)',
      'Multi-qubit entanglement and Bell state synthesis via CNOT gates',
      'Qiskit 1.x QuantumCircuit construction, transpilation, and statevector simulation',
    ],
  },
  {
    id: 'session-2',
    day: 1,
    sessionNumber: 2,
    title: 'Session 2: Quantum Material',
    dateStr: 'Day 1 · Thursday, 8 October 2026',
    timeStr: '02:00 PM – 04:00 PM IST',
    duration: '2 Hours (120 Mins)',
    youtubeId: 'uOvITnNq9nk',
    youtubeUrl: 'https://www.youtube.com/watch?v=uOvITnNq9nk',
    speaker: {
      name: 'Dr. Jagrati Dwivedi',
      role: 'Researcher & Faculty',
      institution: 'QMD Foundation of the National Quantum Mission, at IIT Delhi',
      bio: 'Dr. Jagrati Dwivedi works with the Quantum Material and Device (QMD) Foundation under the National Quantum Mission at IIT Delhi, researching novel quantum matter, topological phases, and solid-state quantum devices.',
      websiteUrl: 'https://home.iitd.ac.in',
    },
    description:
      'Investigate how quantum computing revolutionizes materials science. Discover electronic band structure calculation, strongly correlated electron systems, Hubbard models, and topological insulators. Understand how physical quantum hardware simulates complex quantum materials beyond classical supercomputer limits.',
    prerequisites: 'Session 1. Basic familiarity with Hamiltonian operators and energy levels.',
    learnPoints: [
      'Superconducting qubits: Nonlinear Josephson junctions, LC circuits, and transmon design',
      'Semiconductor spin qubits, quantum dot nanostructures, and trapped-ion substrates',
      'Coherence times (T1 relaxation, T2 dephasing) and material fabrication trade-offs',
      'Variational Quantum Eigensolver (VQE) for condensed matter systems',
    ],
  },
  {
    id: 'session-3',
    day: 2,
    sessionNumber: 3,
    title: 'Session 3: Qubit Connectivity & Architecture',
    dateStr: 'Day 2 · Friday, 9 October 2026',
    timeStr: '10:00 AM – 12:00 PM IST',
    duration: '2 Hours (120 Mins)',
    youtubeId: 'TmXlUUFMUgI',
    youtubeUrl: 'https://www.youtube.com/watch?v=TmXlUUFMUgI',
    speaker: {
      name: 'Karthikganesh Durai',
      role: 'Associate Director - Business Analysis',
      institution: 'NTT DATA',
      bio: 'Karthikganesh Durai serves as Associate Director of Business Analysis at NTT DATA, focusing on enterprise quantum computing adoption, algorithm efficiency, and quantum architecture co-design.',
      websiteUrl: 'https://www.nttdata.com',
    },
    description:
      'Bridging algorithmic mathematics and physical hardware realities. Explore superconducting qubit layouts, coupling graphs, and physical connectivity constraints. Analyze how linear chains, heavy-hex lattices, and planar topologies mandate SWAP gate insertions, inflating circuit depth and fidelity degradation.',
    prerequisites: 'Sessions 1 & 2 or familiarity with multi-qubit gates and circuit diagrams.',
    learnPoints: [
      'Physical superconducting qubit coupling topologies (Linear vs Heavy-Hex)',
      'Transpiler layout and routing passes: SabreLayout and SabreSwap',
      'SWAP overhead calculation and two-qubit gate depth inflation',
      'Benchmarking coupling constraints on Processor A (5Q linear) vs Processor B (7Q heavy-hex)',
    ],
  },
  {
    id: 'session-4',
    day: 2,
    sessionNumber: 4,
    title: 'Session 4: Quantum Sensing & Quantum Optics',
    dateStr: 'Day 2 · Friday, 9 October 2026',
    timeStr: '02:00 PM – 04:00 PM IST (4A: 14:00–15:00 · 4B: 15:00–16:00)',
    duration: '2 Hours (60 min Sensing + 60 min Optics)',
    youtubeId: 'FrXQkJIbO3w',
    youtubeUrl: 'https://www.youtube.com/watch?v=FrXQkJIbO3w',
    speaker: {
      name: 'Prof. Durga B Rao Dasari',
      role: 'Head of Defence System Engineering',
      institution: 'SRM University-AP',
      bio: 'Prof. Durga B Rao Dasari heads Defence System Engineering at SRM University-AP, leading research in precision metrology, NV-center diamond magnetometry, and high-sensitivity quantum sensing systems for Session 4A.',
      websiteUrl: 'https://srmap.edu.in',
    },
    coSpeakers: [
      {
        name: 'Dr. Gangi Reddy Salla',
        role: 'Associate Professor',
        institution: 'SRM University-AP',
        bio: 'Dr. Gangi Reddy Salla is an Associate Professor at SRM University-AP, specializing in quantum optics, photonic states, light-matter interactions, and non-classical interferometry for Session 4B.',
        websiteUrl: 'https://srmap.edu.in',
      },
    ],
    description:
      'Explore the science of extreme precision measurement. Session 4A covers quantum sensing, surpassing classical shot-noise limits with quantum probes, and NV-center diamond magnetometry. Session 4B explores quantum optics, photonic qubits, beam splitters, and non-classical interferometry.',
    prerequisites: 'Sessions 1–3. Understanding of superposition and phase estimation.',
    learnPoints: [
      'Session 4A: Quantum sensing principles and surpassing classical shot-noise limits',
      'Solid-state spin systems: NV Centers in diamond for nanoscale magnetometry',
      'Session 4B: Photonic quantum computing, beam splitters, and optical interferometry',
      'Quantum state generation and platform comparisons between photonic and matter qubits',
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
    youtubeId: 'MO-hajVngHM',
    youtubeUrl: 'https://www.youtube.com/watch?v=MO-hajVngHM',
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
        title: 'Session 1: Introduction to Qiskit & Quantum Computing (Part 1)',
        speaker: 'Raghav Singla',
        speakerRole: 'Application Developer, IBM',
        type: 'session',
        sessionId: 'session-1',
      },
      {
        time: '12:00 - 13:00',
        duration: '60 min',
        title: 'Session 1: Introduction to Qiskit & Quantum Computing (Part 2)',
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
        title: 'Session 2: Quantum Material',
        speaker: 'Dr. Jagrati Dwivedi',
        speakerRole: 'QMD Foundation of the National Quantum Mission, at IIT Delhi',
        type: 'session',
        sessionId: 'session-2',
      },
      {
        time: '16:00 - 23:59',
        duration: 'Self-paced',
        title: 'Quizzes (Accessible via LMS)',
        speaker: 'Self',
        speakerRole: 'Accessible via LMS',
        type: 'quiz',
        sessionId: 'session-1',
      },
      {
        time: 'Evening (by 11:59 PM)',
        duration: 'By 11:59 PM',
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
        time: '10:00 - 12:00',
        duration: '120 min',
        title: 'Session 3: Qubit Connectivity & Architecture',
        speaker: 'Karthikganesh Durai',
        speakerRole: 'Associate Director - Business Analysis at NTT DATA',
        type: 'session',
        sessionId: 'session-3',
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
        time: '14:00 - 15:00',
        duration: '60 min',
        title: 'Session 4A: Quantum Sensing',
        speaker: 'Prof. Durga B Rao Dasari',
        speakerRole: 'Head of Defence System Engineering, SRM AP',
        type: 'session',
        sessionId: 'session-4',
      },
      {
        time: '15:00 - 16:00',
        duration: '60 min',
        title: 'Session 4B: Quantum Optics',
        speaker: 'Dr. Gangi Reddy Salla',
        speakerRole: 'Associate Professor, SRM AP',
        type: 'session',
        sessionId: 'session-4',
      },
      {
        time: 'Evening (by 11:59 PM)',
        duration: 'By 11:59 PM',
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
        time: 'Evening (by 11:59 PM)',
        duration: 'By 11:59 PM',
        title: 'Online Game: Essay Competition',
        speaker: 'Open to all participants',
        speakerRole: 'Accessible via LMS / Link',
        type: 'competition',
      },
    ],
  },
];
