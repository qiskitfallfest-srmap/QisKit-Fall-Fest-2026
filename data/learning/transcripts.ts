import { SessionTranscriptData } from './types';

export const SESSION_TRANSCRIPTS: Record<string, SessionTranscriptData> = {
  'session-3': {
    sessionId: 'session-3',
    streamUrl: 'https://www.youtube.com/live/no-MUQ50ihg',
    youtubeId: 'no-MUQ50ihg',
    totalBroadcastDuration: '2 Hours 15 Mins (Stream 00:11:56 – 02:25:00)',
    recordedDate: 'Day 2 · Friday, 9 October 2026 (Morning Broadcast)',
    overview:
      'Complete extracted transcript and technical notes for Session 3: Qubit Connectivity & Quantum Hardware Architectures by Mr. Karthikganesh Durai (Associate Director - Business Analysis, NTT DATA), including the hands-on Google Colab demonstrations of classical complex statevectors and the 2-Qubit Quantum Fourier Transform (QFT), followed by Dr. Varsha Sambhaje’s live virtual tour of India’s first Quantum Reference Facility and Dilution Refrigerator at SRM University-AP.',
    chapters: [
      {
        id: 's3-ch1',
        timestamp: '00:11:56',
        endTimestamp: '00:15:15',
        startSeconds: 716,
        title: 'Day 2 Opening & Speaker Introduction',
        speaker: 'Sandhya & Dr. Varsha Sambhaje',
        tag: 'Introduction',
        summary:
          'Recap of Day 1 foundations and formal introduction of Mr. Karthikganesh Durai (Associate Director, NTT DATA).',
      },
      {
        id: 's3-ch2',
        timestamp: '00:15:15',
        endTimestamp: '00:35:00',
        startSeconds: 915,
        title: 'Classical Transistors vs. Physical Qubit Realizations (SET, Spin IAM & Photon Polarity)',
        speaker: 'Karthikganesh Durai',
        tag: 'Physics & Hardware',
        summary:
          'How NPN/PNP/MOSFET transistors encode classical bits using 5V DC (~3,000–5,000 electrons) versus the 5 mature commercial qubit technologies, Single Electron Transistors (SET), electron spin as Intrinsic Angular Momentum (IAM), and photon polarization.',
      },
      {
        id: 's3-ch3',
        timestamp: '00:35:00',
        endTimestamp: '00:51:30',
        startSeconds: 2100,
        title: 'Live Colab Part 1: Complex Column Vectors, Bloch Sphere & Unitary Gate Matrices',
        speaker: 'Karthikganesh Durai',
        tag: 'Live Coding',
        summary:
          'Constructing qubits classically in Python using two-element complex lists ([1+0j, 0+0j], [0.707+0j, 0.707+0j]), visualizing directly with plot_bloch_multivector, and deriving 2x2 unitary gate matrices (Pauli-X).',
      },
      {
        id: 's3-ch4',
        timestamp: '00:51:30',
        endTimestamp: '01:08:27',
        startSeconds: 3090,
        title: 'Why Quantum Computers Are Exponentially Faster: 2^n Parallelism & Matrix Composition',
        speaker: 'Karthikganesh Durai',
        tag: 'Mathematical Foundations',
        summary:
          'Interactive discussion with student Gyan on 2^n superposition states, reverse-order unitary matrix composition (P · Y · H |ψ⟩), universal basis gates (X, H, CX), and Euler exponential phase representation r·e^(iθ).',
      },
      {
        id: 's3-ch5',
        timestamp: '01:08:27',
        endTimestamp: '01:20:30',
        startSeconds: 4107,
        title: 'Superconducting Qubits, Dilution Refrigerators (10 mK), Josephson Junctions & Quantum Volume',
        speaker: 'Karthikganesh Durai',
        tag: 'Architecture Deep-Dive',
        summary:
          'Industry hardware taxonomy (IBM, Google, Rigetti, IonQ, Quantinuum, Xanadu, QuEra, Atom Computing, D-Wave), dilution refrigerator cooling stages down to 0.01 K, Niobium/Aluminium Josephson junctions, Cooper pairs, physical-to-logical qubit ratio (4:1), and Quantum Volume.',
      },
      {
        id: 's3-ch6',
        timestamp: '01:20:30',
        endTimestamp: '01:38:55',
        startSeconds: 4830,
        title: 'Trapped Ions, Photonics, Neutral Atoms, D-Wave Ising Annealers & Roadmaps',
        speaker: 'Karthikganesh Durai',
        tag: 'Platform Comparison',
        summary:
          'Ca+/Yb+ linear Paul traps and fluorescence readout, photonic waveguides and ring resonators, neutral atom optical lattices (1,180+ qubits), D-Wave Ising Model (-1/+1 spins), topological braided anyons, and the 40,000 / 100,000 production qubit thresholds.',
      },
      {
        id: 's3-ch7',
        timestamp: '01:38:55',
        endTimestamp: '01:49:05',
        startSeconds: 5935,
        title: 'Live Colab Part 2: 2-Qubit Quantum Fourier Transform (QFT) in Qiskit',
        speaker: 'Karthikganesh Durai',
        tag: 'Live Coding',
        summary:
          'Step-by-step Qiskit implementation of the 2-qubit QFT circuit (H, CP(π/2), H, SWAP), DensityMatrix state extraction, and mapping computational basis states |00⟩, |01⟩, |10⟩, |11⟩ to phase states on the Bloch sphere.',
      },
      {
        id: 's3-ch8',
        timestamp: '02:04:55',
        endTimestamp: '02:15:25',
        startSeconds: 7495,
        title: 'Live Virtual Lab Tour: SRM University-AP Quantum Reference Facility',
        speaker: 'Dr. Varsha Sambhaje',
        tag: 'Lab Tour',
        summary:
          'Inside India’s first Quantum Reference Facility at SRM University-AP: inspecting the open Dilution Refrigerator temperature plates (50 K down to 10 mK), 3-qubit and 2-qubit processor mounts, 4 K quantum sensing tests, and the external 3He/4He Gas Handling System.',
      },
    ],
    sections: [
      {
        id: 's3-sec1',
        timestampRange: '00:15:15 – 00:35:00',
        startSeconds: 915,
        speaker: 'Karthikganesh Durai',
        speakerRole: 'Associate Director - Business Analysis, NTT DATA',
        title: '1. Classical Semiconductor Transistors vs. Physical Qubit Modalities',
        keyTakeaways: [
          'A classical bit is physically realized using semiconductor transistors (NPN, PNP, FET, MOSFET) made of Silicon or Germanium with three terminals: Emitter, Base, and Collector.',
          'Applying a 5V DC bias drives approximately 3,000 to 5,000 electrons from Emitter to Collector through the Base (electron flow = binary 1; absence of flow = binary 0).',
          'While scientists have explored over 20 experimental qubit platforms (NMR, Kane NMR, Diamond NV Centers, SQUIDs, Quantum Dots), the quantum industry relies on 5 mature technologies: Superconducting, Ion Trap, Photonics, Neutral Atom, and Quantum Annealers.',
          'In a Single Electron Transistor (SET) model, electron spin is formally Intrinsic Angular Momentum (IAM), possessing both magnitude (amplitude) and phase (angle). North Pole represents |0⟩, South Pole represents |1⟩, and a microwave field tilts the spin into superposition |ψ⟩.',
          'In photonic systems, Horizontal polarization (0 rad) maps to |0⟩, Vertical polarization (π/2 rad) maps to |1⟩, and a laser beam rotates the polarity to an intermediate angle to create superposition |ψ⟩.',
        ],
        paragraphs: [
          'Mr. Karthikganesh Durai begins by contrasting how classical and quantum computers store basic units of information at the hardware level. In classical digital electronics, every binary digit (0 or 1) is physically implemented using semiconductor transistors—such as NPN or PNP bipolar junction transistors, FETs, or MOSFETs—fabricated from Silicon or Germanium. Each transistor has three functional regions: the Emitter, the Base, and the Collector. When a 5V DC power supply is applied, roughly 3,000 to 5,000 electrons are energized to flow from the Emitter to the Collector through the Base, registering a logical 1, while cutting off the current registers a logical 0.',
          'In contrast, quantum computing does not rely on a single bulk semiconductor mechanism. Although researchers have demonstrated more than 20 physical qubit realizations—including Nuclear Magnetic Resonance (NMR), Kane Silicon NMR, Nitrogen-Vacancy (NV) centers in diamond, SQUIDs, and Quantum Dots—commercial quantum hardware has converged around five mature modalities: (1) Superconducting qubits, (2) Trapped Ion qubits, (3) Photonic qubits, (4) Neutral Atom qubits, and (5) Quantum Annealers.',
          'To build physical intuition, the speaker examines the Single Electron Transistor (SET). A single electron possesses spin, formally defined in physics as Intrinsic Angular Momentum (IAM). Because IAM has both a magnitude (amplitude) and a direction/phase (angle), it is naturally described as a mathematical vector. When the electron spin points to the North Pole, it encodes the basis state |0⟩ ("Zero Ket"); when it points to the South Pole, it encodes |1⟩ ("One Ket"). Applying a controlled microwave field tilts the spin axis to an intermediate orientation on the sphere, creating a quantum superposition state |ψ⟩ ("Psi Ket"). Because isolating and controlling a single free electron reliably is extremely challenging, commercial architectures instead trap ions, manipulate single photons, or condense Cooper pairs on superconducting chips.',
          'Similarly, in photonic quantum computing, a single photon’s polarization (polarity) serves as the physical qubit: Horizontal polarization (0° or 0 radians) represents |0⟩, Vertical polarization (90° or π/2 ≈ 3.14/2 radians) represents |1⟩, and applying a laser beam through optical waveplates shifts the polarization to an intermediate angle representing superposition |ψ⟩.',
        ],
      },
      {
        id: 's3-sec2',
        timestampRange: '00:35:00 – 01:08:27',
        startSeconds: 2100,
        speaker: 'Karthikganesh Durai',
        speakerRole: 'Associate Director - Business Analysis, NTT DATA',
        title: '2. Mathematical Definition of Qubits, Unitary Matrices & Exponential Speedup',
        keyTakeaways: [
          'Mathematically, a single qubit is defined as a two-element complex column vector: |0⟩ = [1+0i, 0+0i]^T and |1⟩ = [0+0i, 1+0i]^T.',
          'Qiskit’s plot_bloch_multivector accepts plain Python lists of complex numbers directly (e.g., c = [0.707+0j, 0.707+0j] where 0.707 = 1/√2 satisfies |α|² + |β|² = 1) without needing a QuantumCircuit object.',
          'Single-qubit quantum gates are 2x2 complex unitary matrices U that transform a qubit via matrix-vector multiplication (U|x⟩ = |b⟩).',
          'Quantum computers achieve exponential speedup through two core mechanisms: (1) Natively parallel representation of information (n qubits in superposition represent 2^n states simultaneously), and (2) Unitary operations via matrix composition (sequential gates H, Y, P compose in reverse order P · Y · H into a single 2x2 unitary matrix).',
          'While IBM Quantum exposes ~12 standard gates in Qiskit, three foundational gates are universally supported across almost all gate-based hardware platforms: X, H, and CX (CNOT).',
        ],
        paragraphs: [
          'Switching to Google Colab, Mr. Durai demonstrates that a qubit is mathematically nothing more than a two-element complex column vector. Using standard Python lists and complex literals (`a = [1+0j, 0+0j]` for |0⟩, `b = [0+0j, 1+0j]` for |1⟩, and `c = [0.707+0j, 0.707+0j]` for the equal superposition state |+⟩), he passes these plain Python lists directly into `qiskit.visualization.plot_bloch_multivector`. Because 1/√2 ≈ 0.70710678, the squared magnitudes sum to (0.707)² + (0.707)² = 0.5 + 0.5 = 1, satisfying the Born normalization condition |α|² + |β|² = 1. He also demonstrates Euler’s exponential phase notation r·e^(iθ) using `[np.exp((0+1j)*(3.14/2)), 0+0j]`, noting that passing a scalar complex number instead of a 2-element list raises an error.',
          'Next, he derives how quantum gates operate on qubits. Because a single qubit is a 2x1 complex column vector |x⟩, transforming it into a new state |b⟩ requires multiplying by a 2x2 complex unitary matrix U (U|x⟩ = |b⟩). Writing out the matrix [[0+0i, 1+0i], [1+0i, 0+0i]] multiplying [1+0i, 0+0i]^T yields [0+0i, 1+0i]^T, which is the exact linear-algebraic action of the Pauli-X bit-flip gate.',
          'In an interactive Q&A with student Gyan on why quantum computers are exponentially faster than classical computers, Mr. Durai formalizes two foundational pillars: First, natively parallel representation of information—whereas n classical bits hold only one n-bit string at a time, n qubits in superposition simultaneously represent 2^n states. Second, unitary operations via matrix composition—when a circuit applies a Hadamard gate (H), followed by a Pauli-Y gate (Y), followed by a Phase gate P(π/2), linear algebra evaluates the product in reverse order: P(π/2) · Y · H |ψ⟩. Because the product of any number of 2x2 unitary matrices collapses into a single 2x2 complex unitary matrix, the quantum processor evolves the entire superposition state coherently.',
        ],
        equations: [
          {
            label: 'Single-Qubit Superposition & Normalization',
            formula: '|ψ⟩ = α|0⟩ + β|1⟩,   |α|² + |β|² = 1   (α = β = 1/√2 ≈ 0.707)',
          },
          {
            label: 'Pauli-X Unitary Gate Transformation',
            formula: '[[0, 1], [1, 0]] · [1, 0]^T = [0, 1]^T   (X|0⟩ = |1⟩)',
          },
          {
            label: 'Reverse-Order Unitary Circuit Composition',
            formula: 'U_total |ψ⟩ = P(π/2) · Y · H |ψ⟩',
          },
        ],
        codeSnippet: {
          language: 'python',
          title: 'Classical Complex Vector Representation & Bloch Sphere Visualization (Colab)',
          code: `import cmath
import numpy as np
from qiskit.visualization import plot_bloch_multivector

# Classical 2-element complex vector representation of qubits
a = [1+0j, 0+0j]          # |0⟩ (North Pole)
b = [0+0j, 1+0j]          # |1⟩ (South Pole)
c = [0.707+0j, 0.707+0j]  # |+⟩ Equal Superposition (1/sqrt(2) ≈ 0.707)

plot_bloch_multivector(c)

# Exponential phase form r * e^(i*theta) with theta = pi/2
d = np.exp((0+1j) * (3.14 / 2))
state_exp = [d, 0+0j]
plot_bloch_multivector(state_exp)`,
        },
      },
      {
        id: 's3-sec3',
        timestampRange: '01:08:27 – 01:38:55',
        startSeconds: 4107,
        speaker: 'Karthikganesh Durai',
        speakerRole: 'Associate Director - Business Analysis, NTT DATA',
        title: '3. Deep-Dive into the 5 Quantum Hardware Architectures & Industry Ecosystem',
        keyTakeaways: [
          'Vendor Mapping: Superconducting (IBM, Google, Rigetti); Trapped Ion (IonQ, Honeywell/Quantinuum with CQC); Photonic (Xanadu); Neutral Atom (QuEra, Atom Computing); Quantum Annealer (D-Wave).',
          'Superconducting Qubits: Suspended inside a multi-stage Dilution Refrigerator reaching ~0.01 K (10 mK, colder than outer space at 1.5 K) at the bottom plate. Built from a Niobium (Nb) capacitor and an Aluminium (Al) Josephson Junction (non-linear inductor) where electrons pair into zero-resistance Cooper pairs.',
          'Physical vs. Logical Qubits & Quantum Volume: Approximately 4 physical qubits are needed to form 1 error-corrected logical qubit. Quantum Volume (QV) depends on both qubit count N and inverse error rate (1/error).',
          'Trapped Ion Qubits: Use Ca+ and Yb+ ions confined in a 4-electrode linear trap and manipulated by lasers. Readout uses fluorescence camera imaging (dark = |0⟩, bright fluorescence = |1⟩). High coherence, but ~1000x slower gate speeds than superconducting.',
          'Neutral Atom & Quantum Annealing: Neutral atom systems (Atom Computing 1,180 qubits; QuEra) combine both lasers and microwaves in an Ultra-High Vacuum (UHV) optical lattice. D-Wave (~5,000 qubits) solves the Ising Model using spin states -1 and +1 (not 0 and 1). Production quantum computing requires ~40,000 qubits (and 100,000 qubits for Shor’s algorithm).',
        ],
        paragraphs: [
          'In the hardware architecture deep-dive, Mr. Durai contrasts "Rooftop" chandelier systems (superconducting dilution refrigerators) with "Tabletop" room-temperature systems (photonic circuits). In a superconducting quantum computer (IBM, Google Sycamore/Willow, Rigetti), the multi-tiered gold chandelier is the Dilution Refrigerator that steps temperature down from room temperature to ~0.01 K (10 millikelvin) at the lowest stage—colder than outer space (~1.5 K)—where the QPU chip is mounted. Each superconducting transmon circuit combines a Niobium (Nb) capacitor with an Aluminium (Al) Josephson Junction acting as a non-linear inductor. At millikelvin temperatures, electrons form Bose-Einstein-like Cooper pairs that tunnel across the Josephson junction without resistance (upper Nb capacitor plate = |0⟩, lower Nb plate = |1⟩, coupled to a microwave readout resonator).',
          'Because physical superconducting qubits suffer from environmental decoherence and crosstalk, roughly 4 physical qubits are required to encode 1 fault-tolerant logical qubit (bridging the current NISQ era to future FTQC). Consequently, processor quality is measured by Quantum Volume (QV), which scales with both the number of qubits and the inverse error rate (1/error) rather than raw qubit count alone.',
          'In Trapped Ion architectures (IonQ, Quantinuum), Calcium (Ca+) or Ytterbium (Yb+) ions are levitated inside a 4-electrode linear Paul trap and addressed via precision laser pulses. Readout is performed via fluorescence detection on a high-sensitivity camera: if the ion remains dark (no photon emitted), it registers |0⟩; if it fluoresces brightly, it registers |1⟩, with spot brightness and position encoding amplitude and phase. While trapped ions exhibit superior coherence and connectivity, their gate operations are roughly 1,000 times slower than superconducting microwave gates.',
          'In Photonic architectures (Xanadu), a Single Photon Source (SPS) using a non-linear photonic crystal injects single photons through an optical coupler, modulator (phase shifter), optical waveguide, and optical ring resonator. In Neutral Atom architectures (QuEra, Atom Computing’s 1,180-qubit processor surpassing IBM Condor’s 1,121 qubits, and Oxford’s 6,000-qubit initiative), neutral atoms are trapped in an Ultra-High Vacuum (UHV) optical lattice and manipulated using a consolidated combination of both lasers and microwaves—also enabling Quantum Reservoir Computing (QRC).',
          'Finally, Quantum Annealers (D-Wave, ~5,000 qubits) are non-gate adiabatic processors based on the Ising Model, where magnetic dipole spins take values of -1 and +1 (rather than 0 and 1) to solve combinatorial optimization, differential equations, and linear systems. Meanwhile, Microsoft is pursuing Topological Qubits based on braiding non-Abelian Anyons. For industrial production workloads, a minimum threshold of ~40,000 qubits is needed, while breaking RSA via Shor’s algorithm requires ~100,000 (1 lakh) qubits. Until then, enterprises also utilize Quantum-Inspired platforms such as Microsoft Azure Quantum Inspired Optimizer, Toshiba SQBM+, and Fujitsu Digital Annealer.',
        ],
      },
      {
        id: 's3-sec4',
        timestampRange: '01:38:55 – 01:49:05',
        startSeconds: 5935,
        speaker: 'Karthikganesh Durai',
        speakerRole: 'Associate Director - Business Analysis, NTT DATA',
        title: '4. Live Qiskit Coding Demo: 2-Qubit Quantum Fourier Transform (QFT)',
        keyTakeaways: [
          'The 2-qubit QFT circuit applies: (1) Hadamard H on qr[1], (2) Controlled-Phase CP(π/2) with control qr[1] and target qr[0], (3) Hadamard H on qr[0], and (4) SWAP between qr[0] and qr[1].',
          'QFT maps computational basis states (|00⟩, |01⟩, |10⟩, |11⟩) on the Z-axis into distinct rotational phase states around the equator of the Bloch sphere.',
          'To visualize the transformed statevector on the Bloch sphere via plot_bloch_multivector, measurement gates must be omitted and the circuit passed into qiskit.quantum_info.DensityMatrix(qc).',
          'The output of QFT serves as the core phase-encoding engine that feeds directly into Quantum Phase Estimation (QPE), Shor’s factoring algorithm, and Grover’s amplitude estimation.',
        ],
        paragraphs: [
          'Returning to Google Colab, Mr. Durai codes a complete 2-qubit Quantum Fourier Transform (QFT) circuit from scratch using Qiskit. Starting with a 2-qubit `QuantumRegister(2)` and `ClassicalRegister(2)`, he demonstrates how to prepare different computational basis inputs (`|00⟩` with no X gates, `|01⟩` with `qc.x(qr[0])`, `|10⟩` with `qc.x(qr[1])`, and `|11⟩` with X on both qubits) before applying the 2-qubit QFT block.',
          'The 2-qubit QFT transformation consists of four sequential operations: first, a Hadamard gate `qc.h(qr[1])` on the second qubit; second, a Controlled-Phase gate `qc.cp(3.14/2, qr[1], qr[0])` controlled by `qr[1]` and targeting `qr[0]`; third, a Hadamard gate `qc.h(qr[0])` on the first qubit; and fourth, a `qc.swap(qr[0], qr[1])` gate to restore the natural frequency order of the output qubits.',
          'By extracting `matrix = DensityMatrix(qc)` (with classical measurement lines commented out so the quantum state does not collapse) and calling `plot_bloch_multivector(matrix)`, he shows live how each computational basis input `|00⟩, |01⟩, |10⟩, |11⟩` is mapped into a unique equatorial phase angle on the two Bloch spheres. He concludes by explaining how QFT feeds directly into Quantum Phase Estimation (QPE), Shor’s algorithm, and Grover’s algorithm.',
        ],
        codeSnippet: {
          language: 'python',
          title: '2-Qubit Quantum Fourier Transform (QFT) Live Implementation in Qiskit',
          code: `from qiskit import QuantumRegister, ClassicalRegister, QuantumCircuit
from qiskit.quantum_info import DensityMatrix
from qiskit.visualization import plot_bloch_multivector

qr = QuantumRegister(2, 'q')
cr = ClassicalRegister(2, 'c')
qc = QuantumCircuit(qr, cr)

# Optional: Prepare input basis state |00⟩, |01⟩, |10⟩, or |11⟩
qc.x(qr[0])
qc.x(qr[1])

# --- 2-Qubit Quantum Fourier Transform (QFT) ---
qc.h(qr[1])
qc.cp(3.14 / 2, qr[1], qr[0])  # Controlled-Phase (pi/2): control=q[1], target=q[0]
qc.h(qr[0])
qc.swap(qr[0], qr[1])

# Extract DensityMatrix and visualize Fourier-basis phase states
matrix = DensityMatrix(qc)
plot_bloch_multivector(matrix)`,
        },
      },
      {
        id: 's3-sec5',
        timestampRange: '02:04:55 – 02:15:25',
        startSeconds: 7495,
        speaker: 'Dr. Varsha Sambhaje',
        speakerRole: 'Faculty In-charge, Quantum Research Centre, SRM University-AP',
        title: '5. Live Virtual Tour: SRM University-AP Quantum Reference Facility & Dilution Refrigerator',
        keyTakeaways: [
          'SRM University-AP houses India’s first Quantum Reference Facility, inaugurated on April 14 (World Quantum Day) by Hon’ble Chief Minister Sri Nara Chandrababu Naidu.',
          'The open Dilution Refrigerator features stepped gold-plated thermal stages cooling progressively from 50 K → 40 K → 30–20 K → 20–10 K → <4 K → down to 10 mK at the bottom mixing chamber plate.',
          'The cryostat mounts two superconducting processor packages simultaneously—a 3-qubit setup and a 2-qubit setup (up to 5 qubits total)—alongside a 4 K stage used for quantum sensing antenna testing.',
          'An external closed-loop Gas Handling System circulates Helium-3 / Helium-4 (3He/4He) and Nitrogen (N2) gas through filtration traps to drive the millikelvin cooling cycle once vacuum cans are sealed.',
        ],
        paragraphs: [
          'Following the lecture and Q&A, Dr. Varsha Sambhaje takes participants on a live camera walkthrough inside the SRM University-AP Quantum Reference Facility—India’s first Quantum Reference Facility, inaugurated on April 14 by the Chief Minister of Andhra Pradesh, Sri Nara Chandrababu Naidu.',
          'With the outer vacuum cans removed, Dr. Varsha shows the internal gold-plated tiers of the Dilution Refrigerator. Starting from the top plate at 50 K, each descending stage steps the temperature down through 40 K, 30–20 K, 20–10 K, and below 4 K, reaching 10 millikelvin (10 mK) at the bottom plate where the superconducting qubits are mounted. She points out two separate qubit mounts at the base—one housing a 3-qubit processor and another housing a 2-qubit processor (supporting up to 5 qubits simultaneously)—as well as microwave coaxial lines and a 4 K experimental test bed currently being used by researchers to test a quantum sensing antenna.',
          'Finally, she walks over to the external Gas Handling System and control rack, explaining how Nitrogen (N2) gas filtration and the closed-loop Helium-3 / Helium-4 (3He/4He) circulation unit pump and condense the helium mixture once the cryostat shields are sealed to achieve and sustain 10 mK operation.',
        ],
      },
    ],
  },
  'session-4': {
    sessionId: 'session-4',
    streamUrl: 'https://www.youtube.com/live/no-MUQ50ihg',
    youtubeId: 'no-MUQ50ihg',
    totalBroadcastDuration: '2 Hours 15 Mins (Stream 04:09:06 – 06:20:00)',
    recordedDate: 'Day 2 · Friday, 9 October 2026 (Afternoon Broadcast)',
    overview:
      'Complete extracted transcript and technical study guide for Session 4A: Quantum Sensing by Prof. Durga B. Rao Dasari (Director of Quantum Software Division, QubitForce; formerly University of Stuttgart) and Session 4B: Quantum Photonic Technologies & Quantum Optics by Dr. Gangi Reddy Salla (Associate Professor & Founder of the Quantum Optics Lab, SRM University-AP), followed by Gyanendra’s live interactive circuit demonstration using Quirk and QuVis.',
    chapters: [
      {
        id: 's4-ch1',
        timestamp: '04:09:06',
        endTimestamp: '04:22:58',
        startSeconds: 14946,
        title: 'Session 4A.1: Single-Spin Probes, Nanodiamonds, Magnetometry & 1/ε Resource Scaling',
        speaker: 'Prof. Durga B. Rao Dasari',
        tag: 'Session 4A · Quantum Sensing',
        summary:
          'Single-electron/single-photon sensing limits, 200–500 nm nanodiamond fiber probes, femtotesla brain magnetometry (room-temperature NV centers vs. cryogenic SQUIDs), intracellular microkelvin thermometry, and classical (1/ε²) vs. quantum (1/ε) resource scaling.',
      },
      {
        id: 's4-ch2',
        timestamp: '04:22:58',
        endTimestamp: '04:27:56',
        startSeconds: 15778,
        title: 'Session 4A.2: Shot Noise, SQL (1/√N) vs. Heisenberg Limit (1/N), Fisher Information & Cramér-Rao Bound',
        speaker: 'Prof. Durga B. Rao Dasari',
        tag: 'Session 4A · Estimation Theory',
        summary:
          'Statistical variance σ, Signal-to-Noise Ratio (SNR), Standard Quantum Limit vs. Heisenberg scaling, Classical & Quantum Fisher Information (F = 1, N, N²), and the Cramér-Rao Bound Δθ ≥ 1/√F.',
      },
      {
        id: 's4-ch3',
        timestamp: '04:27:56',
        endTimestamp: '04:33:46',
        startSeconds: 16076,
        title: 'Session 4A.3: Sensing Protocols — Ramsey, Hahn Echo, Dynamical Decoupling & 4-Qubit GHZ Sensing',
        speaker: 'Prof. Durga B. Rao Dasari',
        tag: 'Session 4A · Sensing Circuits',
        summary:
          'Mapping spin pulses to Qiskit gates (π/2 ↔ H, π ↔ X), Ramsey DC sensing, Hahn Echo AC sensing (phase-flip refocussing at zero-crossing), multi-pulse frequency filter functions, and 4-qubit GHZ entangled phase amplification (cos(4φ) vs. cos⁴(φ)).',
      },
      {
        id: 's4-ch4',
        timestamp: '04:33:46',
        endTimestamp: '04:43:04',
        startSeconds: 16426,
        title: 'Session 4A.4: Diamond NV Centers, 13C Nuclear Spin Memory & Quantum Computational Sensing',
        speaker: 'Prof. Durga B. Rao Dasari',
        tag: 'Session 4A · NV Hardware',
        summary:
          'Deep defects in ~6 eV diamond as room-temperature "caged atoms", 532 nm green laser excitation and red fluorescence readout (bright m_s=0 vs. dark m_s=±1), 2–3 GHz microwaves, coupling 10–25 13C nuclear memory spins, and why the No-Cloning Theorem requires quantum computation before measurement.',
      },
      {
        id: 's4-ch5',
        timestamp: '04:43:04',
        endTimestamp: '05:25:00',
        startSeconds: 16984,
        title: 'Session 4B.1: Optics vs. Photonics vs. Quantum Photonics, 1935 EPR Paradox & Room-Temp Lab Design',
        speaker: 'Dr. Gangi Reddy Salla',
        tag: 'Session 4B · Quantum Photonics',
        summary:
          'Evolution from classical wave/ray optics to quantum photonics, Heisenberg uncertainty of conjugate variables (x/p, E/t, φ/OAM), the 1935 EPR paradox, low-decoherence room-temperature advantages (2–3 Cr INR lab cost), and simulating 150 m atmospheric turbulence on a 1.5 m optical bench.',
      },
      {
        id: 's4-ch6',
        timestamp: '05:25:00',
        endTimestamp: '05:42:10',
        startSeconds: 19500,
        title: 'Session 4B.2: Photonic Degrees of Freedom (OAM), SU(2) Waveplates, SPDC & HBT g^(2)(0) Anti-Bunching',
        speaker: 'Dr. Gangi Reddy Salla',
        tag: 'Session 4B · Single Photons',
        summary:
          'Encoding capacity across frequency (1 bit), polarization (2 bits), vector modes (4 bits), and OAM (infinite-dimensional Hilbert space); 3-waveplate SU(2) polarization control; 1550 nm telecom propagation; SPDC in χ^(2) PPKTP/BBO crystals; HBT g^(2)(0) = 0 dip; and deterministic NV-center single-photon sources.',
      },
      {
        id: 's4-ch7',
        timestamp: '05:42:10',
        endTimestamp: '06:04:15',
        startSeconds: 20530,
        title: 'Session 4B.3: Type-I vs. Type-II Entangled Rings, Bell’s Inequality, Optical Tweezers, SNSPDs & Teleportation',
        speaker: 'Dr. Gangi Reddy Salla',
        tag: 'Session 4B · Entanglement & QKD',
        summary:
          'Bell’s inequality (S ≤ 2 classical vs. S ≤ 2√2 ≈ 2.828 quantum), Type-I vs. Type-II BBO SPDC rings, optical tweezers and 6-beam 3D laser cooling to nanokelvin/picokelvin, SNSPD/SPAD single-photon detectors (dead time & dark counts), BB84 QKD, Quantum Teleportation, and Optical Vortices.',
      },
      {
        id: 's4-ch8',
        timestamp: '06:06:25',
        endTimestamp: '06:17:45',
        startSeconds: 21985,
        title: 'Bonus Live Demo: Interactive Quantum Circuit Simulation with Quirk & QuVis',
        speaker: 'Gyanendra',
        tag: 'Live Simulation',
        summary:
          'Hands-on walkthrough of Quirk (16-qubit browser simulator: Pauli-X, H+CNOT Bell state, SWAP, and 4-qubit QFT + Inverse QFT) and University of St Andrews QuVis 3D Mach-Zehnder interferometry visualizations.',
      },
    ],
    sections: [
      {
        id: 's4-sec1',
        timestampRange: '04:09:06 – 04:27:56',
        startSeconds: 14946,
        speaker: 'Prof. Durga B. Rao Dasari',
        speakerRole: 'Director of Quantum Software Division, QubitForce (Formerly University of Stuttgart)',
        title: '1. Session 4A (Part 1): Quantum Sensing Foundations, Magnetometry, Resource Scaling & Fisher Information',
        keyTakeaways: [
          'Quantum Sensing reduces the physical probe from billions of electrons/photons down to a single electron spin or single photon (e.g., a 200–500 nm nanodiamond on an optical fiber tip).',
          'While cryogenic SQUIDs achieve femtotesla (10^-15 T) magnetic sensitivity, their bulky thermal isolation prevents close proximity to living tissue. Solid-state NV centers in diamond operate at room temperature and can be placed within nanometers of biological cells.',
          'To estimate a parameter with precision error ε, classical resources scale as 1/ε² whereas quantum Heisenberg-limited resources scale as 1/ε (for ε = 10^-9, classical requires ~10^18 resources vs. ~10^9 quantum resources).',
          'For N independent probes, Quantum Fisher Information is F = N, yielding the Standard Quantum Limit Δφ ≥ 1/√N. For an N-qubit entangled GHZ state, Quantum Fisher Information scales quadratically as F = N², achieving the Heisenberg Limit Δφ ≥ 1/N via the Cramér-Rao Bound Δθ ≥ 1/√F(θ).',
        ],
        paragraphs: [
          'Prof. Durga B. Rao Dasari introduces Quantum Sensing as one of the four foundational pillars of quantum technology alongside Quantum Computing, Quantum Communication, and Quantum Simulation. Whereas classical electrical sensors require millions of electrons and classical laser measurements require 10^8 to 10^9 photons, a quantum sensor uses a single quantum system—such as a single electron spin trapped in a 200–500 nm nanodiamond at the tip of an optical fiber—to probe external physical fields via Linear Response Theory.',
          'Comparing magnetic sensors across spatial resolution and field sensitivity—from Earth’s millitesla (mT) field down to the picotesla (pT) and femtotesla (fT) magnetic fields generated by neural currents in the human brain—Prof. Dasari explains why solid-state Nitrogen-Vacancy (NV) centers in diamond revolutionize bio-magnetometry. Although Superconducting Quantum Interference Devices (SQUIDs) reach femtotesla sensitivity, they require bulky cryogenic enclosures that cannot be brought close to biological tissues (such as during brain surgery). Diamond NV sensors operate at ambient room temperature and can be positioned within nanometers of a living cell, simultaneously measuring magnetic fields (pT–fT) and intracellular temperature fluctuations in the 5th and 6th decimal places (microkelvin, 10^-6 K).',
          'From an information-theoretic perspective, estimating a parameter to an uncertainty (error) of ε requires measurement resources scaling as 1/ε² in classical averaging, but only 1/ε in quantum-enhanced sensing—a quadratic resource advantage analogous to Grover’s search algorithm. For example, achieving 9th-decimal precision (ε = 10^-9) demands (10^9)² = 10^18 classical measurements versus 10^9 quantum resources. This advantage is governed by the Cramér-Rao Bound, Δθ ≥ 1/√F(θ), where F(θ) is the Quantum Fisher Information quantifying how sharply measurement probabilities respond to small changes in θ. For N uncorrelated qubits, F = N (giving the Standard Quantum Limit, Δφ = 1/√N); for N maximally entangled qubits in a GHZ state, F = N² (achieving the Heisenberg Limit, Δφ = 1/N).',
        ],
        equations: [
          {
            label: 'Classical vs. Quantum Resource Scaling for Target Precision Error ε',
            formula: 'Resources_classical ∝ 1 / ε²     vs.     Resources_quantum ∝ 1 / ε',
          },
          {
            label: 'Cramér-Rao Bound, Standard Quantum Limit (SQL) & Heisenberg Limit (HL)',
            formula: 'Δφ ≥ 1 / √F(φ)   ⇒   SQL (F = N): Δφ = 1 / √N     |     Heisenberg (F = N²): Δφ = 1 / N',
          },
        ],
      },
      {
        id: 's4-sec2',
        timestampRange: '04:27:56 – 04:43:04',
        startSeconds: 16076,
        speaker: 'Prof. Durga B. Rao Dasari',
        speakerRole: 'Director of Quantum Software Division, QubitForce (Formerly University of Stuttgart)',
        title: '2. Session 4A (Part 2): Sensing Protocols (Ramsey, Hahn Echo, GHZ), Diamond NV Centers & Computational Sensing',
        keyTakeaways: [
          'Spin-Resonance to Qiskit Gate Mapping: A microwave π/2 pulse corresponds to a Hadamard (H) gate, while a π pulse corresponds to a Pauli-X (bit-flip) gate.',
          'Ramsey Interferometry (DC Sensing): Applies H → free evolution τ (accumulates phase φ on the XY-plane) → H → Z-basis measurement, yielding probability P(|1⟩) = (1 - cos φ)/2.',
          'Hahn Echo (AC Sensing) & Dynamical Decoupling: Inserts a π pulse (X gate) at the midpoint of an oscillating AC field so the positive and negative half-cycles add constructively instead of canceling. Multi-pulse π trains act as narrowband quantum frequency filter functions.',
          '4-Qubit GHZ Entangled Sensing: Preparing (|0000⟩ + |1111⟩)/√2 amplifies the accumulated phase 4-fold to 4φ, producing steep cos(4φ) fringes compared to the flat cos⁴(φ) response of 4 independent qubits.',
          'Diamond NV Centers & Quantum Computational Sensing: NV centers in diamond’s ~6 eV bandgap are excited by a 532 nm green laser and read out via red fluorescence (m_s = 0 is bright; m_s = ±1 is dark) with 2–3 GHz microwave control, coupling to 10–25 surrounding 13C nuclear memory spins. Because the No-Cloning Theorem forbids signal amplification, quantum algorithms and entanglement must act BEFORE measurement.',
        ],
        paragraphs: [
          'Prof. Dasari bridges experimental spin resonance with Qiskit quantum circuits by mapping microwave control pulses directly to quantum gates: a π/2 pulse acts as a Hadamard (H) gate (rotating |0⟩ from the Z-axis onto the equatorial XY-plane), while a π pulse acts as a Pauli-X gate (flipping the spin state by 180°). In Ramsey interferometry (used for static DC fields), the sensor starts in |0⟩, undergoes a π/2 (H) pulse to create (|0⟩ + |1⟩)/√2, precesses freely for time τ under the external magnetic field to accumulate relative phase φ, and then receives a second π/2 (H) pulse before Z-basis measurement. Without the second π/2 pulse, measuring directly from the XY-plane would always give 50/50 probabilities; the second π/2 pulse converts the phase φ into measurable population probabilities P = (1 ∓ cos φ)/2.',
          'When sensing an alternating (AC) sinusoidal field, a standard Ramsey sequence fails because the positive half-cycle (+φ) and negative half-cycle (-φ) cancel to zero. The Hahn Echo sequence resolves this by inserting a π pulse (Pauli-X gate) at the midpoint zero-crossing, flipping the phase sign so both half-cycles add constructively (+2φ). Extending this to a periodic train of multiple π pulses (Dynamical Decoupling) creates a sharp frequency filter function that isolates a single target frequency from a noisy multi-frequency environment. Furthermore, preparing a 4-qubit entangled GHZ state (|0000⟩ + |1111⟩)/√2 multiplies the accumulated phase by N = 4, producing rapid cos(4φ) interference fringes with a steep slope near φ = 0 compared to the flat cos⁴(φ) curve of four independent qubits.',
          'In hardware, a Nitrogen-Vacancy (NV) center is a deep lattice defect in wide-bandgap diamond (~6 eV) formed by a substitutional Nitrogen atom adjacent to a carbon Vacancy. Acting as a room-temperature "caged atom", it is optically initialized and read out by shining a 532 nm green laser and collecting red fluorescence: the m_s = 0 spin sublevel fluoresces brightly, whereas the m_s = ±1 sublevels are dimmer/dark due to an intersystem crossing pathway. Ground-state spin transitions sit at 2–3 GHz (2.87 GHz zero-field splitting) and split linearly with magnetic field (Zeeman effect). NV sensors have demonstrated picotesla/femtotesla magnetometry, 100 μV/cm electric field sensing, microkelvin thermometry, attonewton (10^-18 N) force detection, and single-spin NMR.',
          'Moreover, the central NV electron spin couples via hyperfine interactions to surrounding natural-abundance Carbon-13 (13C) nuclear spins (up to 10–25 controllable nuclear spins), which serve as long-lived quantum memory registers capable of running Quantum Fourier Transform (QFT) protocols for single-spin chemical shift resolution. Finally, Prof. Dasari contrasts the classical sensing pipeline (Transducer → Amplifier → ADC → Classical Computation AFTER measurement) with Quantum Computational Sensing: because the No-Cloning Theorem prohibits amplifying an unknown quantum state, quantum sensors replace amplification with entanglement and run quantum algorithms BEFORE measurement to extract targeted decisions in a single shot.',
        ],
        equations: [
          {
            label: 'Ramsey Interferometry Readout Probability',
            formula: 'P(|1⟩) = ½ (1 - cos φ) = sin²(φ/2),     P(|0⟩) = ½ (1 + cos φ) = cos²(φ/2)',
          },
          {
            label: '4-Qubit Independent vs. Entangled GHZ Phase Response',
            formula: 'P_indep(φ) ∝ cos⁴(φ)     vs.     P_GHZ(φ) = ½ (1 + cos(4φ)) = cos²(2φ)',
          },
        ],
      },
      {
        id: 's4-sec3',
        timestampRange: '04:43:04 – 05:42:10',
        startSeconds: 16984,
        speaker: 'Dr. Gangi Reddy Salla',
        speakerRole: 'Associate Professor, Physics & Founder of Quantum Optics Lab, SRM University-AP',
        title: '3. Session 4B (Part 1): Quantum Photonics, OAM Hilbert Spaces, SU(2) Control, SPDC & HBT Anti-Bunching',
        keyTakeaways: [
          'Distinction: Optics studies the fundamental science of light (wave & ray optics); Photonics combines light science with engineering technology; Quantum Photonics merges quantum mechanics with photonics to harness single photons and non-classical correlations.',
          'Photonic Degrees of Freedom: Frequency encodes 1 bit, Polarization encodes 2 bits, Vector spatial modes encode 4 bits, and Orbital Angular Momentum (OAM) provides an infinite-dimensional orthogonal basis (boosting data capacity 10–20x).',
          'Polarization Unitaries & Wavelengths: Any single-photon SU(2) polarization transformation requires 3 waveplates (2 Quarter-Wave Plates + 1 Half-Wave Plate), while two-photon SU(2)² control requires 6 waveplates. Telecom 1550 nm / 1560 nm wavelengths suffer far less atmospheric turbulence loss than 810 nm.',
          'Spontaneous Parametric Down-Conversion (SPDC): A non-centrosymmetric χ^(2) crystal (PPKTP, BBO) splits 1 pump photon into signal + idler photons conserving energy (ω_p = ω_s + ω_i, e.g., 405 nm → 810 nm) and momentum (k_p ≈ k_s + k_i) at ~1 pair per 10^10 pump photons.',
          'HBT Second-Order Correlation g^(2)(0): A Hanbury Brown–Twiss interferometer verifies single-photon purity via anti-bunching g^(2)(0) = 0 (< 0.5 experimentally), compared to g^(2)(0) = 1 for coherent laser light and g^(2)(0) > 1 for thermal light.',
        ],
        paragraphs: [
          'Dr. Gangi Reddy Salla opens Session 4B by distinguishing Optics (the fundamental science of wave optics—interference, diffraction, polarization—and geometrical ray optics when wavelength λ ≪ aperture size), Photonics (the engineering application of light via lasers, fibers, modulators, and detectors), and Quantum Photonics (applying quantum superposition, entanglement, and non-classical correlations to photonic hardware). Reviewing the 1935 Einstein-Podolsky-Rosen (EPR) paradox—where measuring the momentum of Particle 1 and position of Particle 2 from a decaying stationary source reveals non-local quantum correlations—he highlights why photonics is uniquely attractive: photons experience virtually zero decoherence at room temperature, a complete Quantum Photonics Lab can be built for 2–3 Crores INR (compared to 10–30 Crores INR for millikelvin superconducting setups), and 150 meters of free-space atmospheric turbulence can be simulated on a 1.5-meter optical bench using 5–6 folded mirror passes through a controlled fog/temperature glass chamber.',
          'Examining photonic degrees of freedom (DoFs), Dr. Salla explains that a photon can encode 1 bit in frequency, 2 bits in polarization, 4 bits in vector spatial modes, and an infinite-dimensional Hilbert space in Orbital Angular Momentum (OAM) spatial modes—multiplying optical communication capacity by 10 to 20 times. Realizing an arbitrary single-photon SU(2) polarization unitary requires a sequence of 3 waveplates (two Quarter-Wave Plates and one Half-Wave Plate), whereas two-photon SU(2)² polarization control requires 6 coupled waveplates. For free-space propagation (150 m to 1 km), 1550 nm / 1560 nm telecom infrared wavelengths experience significantly lower atmospheric scattering and turbulence distortion than visible or 810 nm wavelengths.',
          'To generate single and entangled photons, laboratories use Spontaneous Parametric Down-Conversion (SPDC) inside a second-order non-linear χ^(2) crystal lacking inversion symmetry, such as PPKTP or BBO. A high-energy pump photon splits into a "signal" and an "idler" photon satisfying energy conservation (ω_p = ω_s + ω_i, so a 405 nm pump yields two degenerate 810 nm photons, or a 780 nm pump yields 1560 nm telecom photons) and phase-matching momentum conservation (k_p ≈ k_s + k_i). Because SPDC efficiency is ~1 pair per 10^10 pump photons, PPKTP crystals are housed in temperature-stabilized ovens with optical isolators blocking back-reflections.',
          'Because SPDC pair emission times are probabilistic, detecting the idler photon on a trigger detector "heralds" the presence of the signal photon. To prove that a source emits true single photons rather than attenuated laser pulses, a Hanbury Brown–Twiss (HBT) interferometer splits the stream at a 50:50 beam splitter into two detectors to measure the zero-delay second-order intensity correlation g^(2)(0). Since a single photon cannot trigger both detectors simultaneously, it exhibits an anti-bunching dip of g^(2)(0) = 0 (experimentally < 0.5), whereas coherent laser light yields g^(2)(0) = 1 and chaotic thermal light yields g^(2)(0) > 1. For deterministic on-demand emission with fixed inter-photon intervals, an engineered single NV center in low-density diamond excited at 532 nm (emitting at 632 nm) and isolated via confocal microscopy acts as a true single-photon source.',
        ],
        equations: [
          {
            label: 'SPDC Energy & Phase-Matching Momentum Conservation',
            formula: 'ω_p = ω_s + ω_i   (λ_s,i = 2 λ_p for degenerate SPDC)     and     k_p ≈ k_s + k_i',
          },
          {
            label: 'Hanbury Brown–Twiss (HBT) Second-Order Correlation Classification',
            formula: 'Single Photon: g^(2)(0) = 0 (< 0.5)   |   Coherent Laser: g^(2)(0) = 1   |   Thermal Light: g^(2)(0) > 1',
          },
        ],
      },
      {
        id: 's4-sec4',
        timestampRange: '05:42:10 – 06:17:45',
        startSeconds: 20530,
        speaker: 'Dr. Gangi Reddy Salla & Gyanendra',
        speakerRole: 'Associate Professor & Technical Team Lead, SRM University-AP',
        title: '4. Session 4B (Part 2): Entangled SPDC Rings, Bell’s Inequality, Optical Tweezers, SNSPDs, Teleportation & Quirk Demo',
        keyTakeaways: [
          'Type-I vs. Type-II SPDC Entanglement: Type-I emits same-polarization pairs into 1 ring (requiring two orthogonally crossed BBO crystals pumped at 45° or a Sagnac loop to yield (|HH⟩ + |VV⟩)/√2). Type-II emits orthogonally polarized pairs into 2 intersecting rings, directly producing (|HV⟩ ± |VH⟩)/√2 at the two ring intersections.',
          'Bell’s Inequality (CHSH): Classical local hidden-variable theories satisfy S ≤ 2, whereas quantum entanglement violates Bell’s inequality up to the Tsirelson bound S = 2√2 ≈ 2.828.',
          'Optical Tweezers & 6-Beam Laser Cooling: Refraction momentum transfer (F = dp/dt) pulls dielectric particles toward the Gaussian beam intensity peak. Six counter-propagating laser beams (±x, ±y, ±z) cool and immobilize ions in 3D down to nanokelvin/picokelvin temperatures.',
          'Single-Photon Detectors & Dead Time: SNSPDs (superconducting nanowires forming a resistive hotspot upon absorbing a photon), TES, and SPADs cooled to -70°C to -80°C achieve >90% efficiency and <50 cps dark counts. Detector dead time = rise time + fall time + relaxation time (with fall time > rise time, ~10–20 ns).',
          'Quantum Teleportation, OAM Vortices & Quirk Simulator: In teleportation, Bob applies I (00), X (01), Z (10), or XZ (11) based on Alice’s 2 classical bits. Optical vortices carry helical wavefronts with a dark central phase singularity (I = 0). Gyanendra concludes with a live demo of the 16-qubit Quirk simulator (Bell state, SWAP, and QFT + Inverse QFT) and QuVis.',
        ],
        paragraphs: [
          'Continuing with entangled photon generation, Dr. Salla contrasts Type-I and Type-II phase matching in BBO crystals. In Type-I SPDC, signal and idler photons share the same polarization and emerge along a single emission cone/ring; generating the polarization-entangled Bell state (|HH⟩ + |VV⟩)/√2 requires stacking two thin BBO crystals with orthogonal optical axes pumped by a 45° diagonally polarized laser (or placing a crystal inside a Sagnac interferometer). In Type-II SPDC, signal and idler photons have orthogonal polarizations (H and V) and emerge along two intersecting cones; collecting photons at the two spatial intersection points directly yields the entangled state (|HV⟩ ± |VH⟩)/√2 without path distinguishability. Measuring polarization correlations across analyzer angles tests Bell’s CHSH inequality: classical correlations are bounded by S ≤ 2, whereas entangled photons violate the bound with 2 < S ≤ 2√2 ≈ 2.828.',
          'Next, Dr. Salla explains how light exerts mechanical force in Optical Tweezers and Laser Cooling. When a focused Gaussian laser beam refracts through a transparent micro-particle, the change in photon momentum (Δp = p_2 - p_1, F = dp/dt) produces a restoring gradient force that traps the particle at the high-intensity focal center. By surrounding an atom or ion with six counter-propagating laser beams along all three Cartesian axes (±x, ±y, ±z), radiation pressure damps thermal motion in 3D ((3/2)k_B T → 0), cooling the trapped ion to nanokelvin or picokelvin effective temperatures.',
          'For single-photon detection, Dr. Salla surveys Superconducting Nanowire Single-Photon Detectors (SNSPDs—where a single absorbed photon breaks Cooper pairs to create a localized resistive hotspot across a bias-current nanowire), Transition-Edge Sensors (TES), Single-Photon Avalanche Diodes (SPADs/APDs), and EMCCD/ICCD cameras. High-grade detectors achieve >90% quantum efficiency, <50 counts/sec dark counts (by cooling semiconductors to -70°C to -80°C or nanowires to cryogenic temperatures), and 10–20 ns dead time—defined as rise time + fall time + relaxation time, where the fall time is significantly longer than the rise time.',
          'He then reviews BB84 Quantum Key Distribution (where polarization basis mismatches and the No-Cloning Theorem expose any eavesdropper Eve) and Quantum Teleportation, where Alice performs a joint Bell-state measurement on the unknown state |ψ⟩ and her half of an entangled pair and sends 2 classical bits to Bob: `00` requires Identity (I), `01` requires Pauli-X (bit flip), `10` requires Pauli-Z (phase flip), and `11` requires both X and Z. Finally, he introduces Optical Vortices carrying Orbital Angular Momentum (OAM)—doughnut-shaped beams with helical wavefronts and a dark central intensity null (I = 0) generated via Computer-Generated Holograms (CGH / fork gratings), q-plates, Spiral Phase Plates (SPPs), and astigmatic cylindrical-lens mode converters.',
          'In the closing hands-on segment (06:06:25 – 06:17:45), Technical Team Lead Gyanendra demonstrates two interactive browser-based quantum tools: Quirk (algassert.com/quirk), a real-time 16-qubit drag-and-drop circuit simulator where he builds a Pauli-X inverter, a 2-qubit H + CNOT entangled Bell state, a SWAP circuit, and a 4-qubit QFT followed by an Inverse QFT that restores the phase-encoded qubits back to |0000⟩; and QuVis (University of St Andrews), showcasing 3D single-photon Mach-Zehnder interferometry.',
        ],
        equations: [
          {
            label: 'Bell’s CHSH Inequality: Classical Bound vs. Quantum Tsirelson Bound',
            formula: 'Classical Local Realism: S ≤ 2     |     Quantum Entanglement: 2 < S ≤ 2√2 ≈ 2.828',
          },
          {
            label: 'Type-I Crossed-Crystal vs. Type-II Intersecting-Ring SPDC Bell States',
            formula: '|Φ⁺⟩_Type-I = (|HH⟩ + |VV⟩) / √2     |     |Ψ±⟩_Type-II = (|HV⟩ ± |VH⟩) / √2',
          },
          {
            label: 'Single-Photon Detector Dead Time',
            formula: 'τ_dead = τ_rise + τ_fall + τ_relaxation     (where τ_fall > τ_rise, typically 10–20 ns)',
          },
        ],
      },
    ],
  },
};
