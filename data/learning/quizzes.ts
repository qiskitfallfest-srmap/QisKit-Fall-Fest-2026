import { SessionQuiz } from './types';

export const SESSION_QUIZZES: Record<string, SessionQuiz> = {
  'session-1': {
    sessionId: 'session-1',
    title: 'Session 1 Concept Check: Introduction to Qiskit, Quantum Computing & Quantum Material',
    passingScore: 75,
    questions: [
      {
        id: 's1-q1',
        question:
          'A qubit is prepared as |ψ⟩ = α|0⟩ + β|1⟩. A student reports |α|² = 0.7 and |β|² = 0.7. What is the fundamental issue with this description?',
        options: [
          'The amplitudes must both be real numbers',
          'The state violates normalization because the probabilities sum to 1.4',
          'A qubit can only have one nonzero amplitude',
          'Measurement probabilities are determined directly by α + β',
        ],
        correctIndex: 1,
        explanation:
          'By the normalization postulate of quantum mechanics, the sum of measurement outcome probabilities must equal 1 (|α|² + |β|² = 1). Here, 0.7 + 0.7 = 1.4, which violates normalization.',
      },
      {
        id: 's1-q2',
        question:
          'Two pure single-qubit states have identical θ on the Bloch sphere but different φ. Which physical/geometric interpretation is most appropriate?',
        options: [
          'They have different polar angles but identical azimuthal angles',
          'They occupy different azimuthal positions while retaining the same polar position',
          'Their normalization condition changes',
          'One state must be mixed rather than pure',
        ],
        correctIndex: 1,
        explanation:
          'On the Bloch sphere, θ represents the polar angle (determining measurement probability in the computational Z-basis), while φ represents the azimuthal angle (representing the relative phase between |0⟩ and |1⟩).',
      },
      {
        id: 's1-q3',
        question:
          'A quantum gate U satisfies U†U = I. A student argues that U can nevertheless increase the norm of a normalized state because it changes the state\'s amplitudes. What is the flaw in the argument?',
        options: [
          'Changing amplitudes is impossible under a quantum gate',
          'Unitary transformations can change amplitudes but must preserve the state\'s total norm',
          'Only measurement operations preserve norm',
          'U†U = I only applies to classical matrices',
        ],
        correctIndex: 1,
        explanation:
          'Unitary operators preserve the inner product and Euclidean norm of state vectors (⟨ψ|U†U|ψ⟩ = ⟨ψ|I|ψ⟩ = 1). While individual amplitude values change, the total probability norm remains strictly 1.',
      },
      {
        id: 's1-q4',
        question:
          'A single-qubit state lies on the equator of the Bloch sphere. Which additional information is still needed to distinguish different states on that equator?',
        options: [
          'The azimuthal angle φ',
          'The normalization constant must be chosen again',
          'A second qubit must be introduced',
          'The T1 relaxation time',
        ],
        correctIndex: 0,
        explanation:
          'On the equator of the Bloch sphere, the polar angle is fixed at θ = π/2 (equal magnitude amplitudes 1/√2). Individual equatorial states (such as |+⟩, |-⟩, |+i⟩, |-i⟩) are distinguished purely by their azimuthal phase angle φ.',
      },
      {
        id: 's1-q5',
        question:
          'An ideal Bell-pair experiment produces only 00 and 11 outcomes across many shots. Which interpretation is stronger than simply saying \'the bits are equal\'?',
        options: [
          'The result demonstrates the correlated measurement behavior expected from an entangled Bell state',
          'The result proves the qubits were never in superposition',
          'The result proves the hardware has zero noise',
          'The result shows that each qubit was measured independently',
        ],
        correctIndex: 0,
        explanation:
          'In the maximally entangled Bell state (|00⟩ + |11⟩)/√2, measuring either individual qubit yields an intrinsically random 0 or 1, yet the two measurement outcomes are 100% correlated across shots due to quantum entanglement.',
      },
      {
        id: 's1-q6',
        question:
          'A real Bell-state experiment produces mostly 00 and 11 but also a small number of 01 and 10 outcomes. Which conclusion best matches the workshop\'s hardware discussion?',
        options: [
          'The Bell-state circuit must be mathematically invalid',
          'Physical noise can disturb an ideal correlation pattern during QPU execution',
          'Entanglement is impossible on superconducting processors',
          'The Bloch sphere predicts the exact hardware error distribution',
        ],
        correctIndex: 1,
        explanation:
          'On physical quantum hardware (QPUs), decoherence (T1 relaxation, T2 dephasing), gate infidelities, and readout errors introduce physical noise that causes non-ideal outcomes such as 01 and 10.',
      },
      {
        id: 's1-q7',
        question:
          'Why does the workshop use repeated shots when examining a quantum circuit\'s measurement output rather than relying on one measurement?',
        options: [
          'Repeated shots reveal the empirical distribution of possible measurement outcomes',
          'Repeated shots convert a quantum state into a deterministic state',
          'Repeated shots remove the need for quantum gates',
          'Repeated shots guarantee every possible outcome appears',
        ],
        correctIndex: 0,
        explanation:
          'Because quantum measurement is fundamentally probabilistic according to the Born rule, sampling the circuit over many shots is required to reconstruct the empirical probability distribution of measurement outcomes.',
      },
      {
        id: 's1-q8',
        question:
          'The workshop replaces an older execution style based on execute() and Aer.get_backend() with Qiskit 1.0 primitives. What conceptual advantage is most relevant to the lecture\'s modern workflow?',
        options: [
          'Primitives provide standardized interfaces for common execution tasks such as sampling',
          'Primitives eliminate the need to understand quantum circuits',
          'Primitives guarantee noise-free physical execution',
          'Primitives convert every quantum algorithm into a classical algorithm',
        ],
        correctIndex: 0,
        explanation:
          'Qiskit Primitives (Sampler and Estimator) provide standardized, workload-optimized interfaces that abstract hardware execution, transpilation passes, and error mitigation for sampling bitstrings and computing expectation values.',
      },
      {
        id: 's1-q9',
        question:
          'A logical circuit is correct, but its two-qubit interaction is not directly supported between the physical qubits selected by the target IBM processor. What is the most appropriate response?',
        options: [
          'Modify the mathematical definition of the qubit',
          'Use transpilation to map and route the logical circuit onto the hardware topology',
          'Measure both qubits before applying the interaction',
          'Increase the number of shots',
        ],
        correctIndex: 1,
        explanation:
          'Physical QPUs have limited coupling graphs (e.g. heavy-hex). The Qiskit transpiler maps logical qubits to physical qubits and routes non-adjacent interactions by inserting SWAP gates.',
      },
      {
        id: 's1-q10',
        question:
          'Why can inserting a SWAP gate be necessary even when the original logical circuit contains no SWAP operation?',
        options: [
          'The hardware may require routing logical qubits through connected physical locations',
          'SWAP gates are automatically required after every measurement',
          'SWAP gates increase the number of logical qubits',
          'SWAP gates eliminate T1 relaxation',
        ],
        correctIndex: 0,
        explanation:
          'When two qubits involved in a two-qubit gate (like CNOT) are not directly connected in the hardware coupling map, the router must insert SWAP gates to move qubit states along physical links until they are adjacent.',
      },
      {
        id: 's1-q11',
        question:
          'A circuit contains a gate that is mathematically valid but not part of the target processor\'s supported native gate set. What must happen before execution?',
        options: [
          'The gate must be decomposed or translated into hardware-supported operations',
          'The gate can be executed unchanged because mathematical validity is sufficient',
          'The qubit must be measured before the gate is applied',
          'The circuit must be replaced by a classical program',
        ],
        correctIndex: 0,
        explanation:
          'Physical hardware can only execute calibrated pulses for a specific native basis gate set (e.g. ECR/CZ, SX, X, Rz). Non-native gates must be decomposed into equivalent sequences of native basis gates during transpilation.',
      },
      {
        id: 's1-q12',
        question:
          'Which chain best captures the hardware-aware workflow emphasized in the workshop?',
        options: [
          'Logical circuit → transpilation → routing/native operations → QPU execution',
          'QPU execution → logical circuit → transpilation → measurement',
          'Measurement → Bloch sphere → routing → logical circuit',
          'Classical database → oracle → QPU → normalization',
        ],
        correctIndex: 0,
        explanation:
          'The standard Qiskit workflow starts with formulating the abstract logical circuit, transpiling it to adapt to target hardware coupling and basis gates, and finally dispatching it to the physical QPU for execution.',
      },
      {
        id: 's1-q13',
        question:
          'Which pairing correctly connects a physical effect with the hardware quantity discussed in the workshop?',
        options: [
          'Energy relaxation → T1',
          'Energy relaxation → T2',
          'Phase dephasing → T1',
          'Readout error → T1 only',
        ],
        correctIndex: 0,
        explanation:
          'T1 is the longitudinal relaxation time (energy decay from |1⟩ to |0⟩), whereas T2 is the transverse dephasing time representing the loss of quantum phase coherence.',
      },
      {
        id: 's1-q14',
        question:
          'A Bell-state circuit has excellent gate execution, but the classical results still contain incorrect bit values because the measurement process is imperfect. Which mitigation target is most directly relevant?',
        options: [
          'Readout error',
          'Logical qubit count',
          'Bloch-sphere latitude',
          'Grover iteration count',
        ],
        correctIndex: 0,
        explanation:
          'Measurement (readout) errors occur when classical classification of resonator signals misidentifies a |0⟩ as a |1⟩ or vice versa. Readout error mitigation directly targets this imperfection.',
      },
      {
        id: 's1-q15',
        question:
          'Why is Zero Noise Extrapolation useful on a noisy QPU even though it does not make the underlying processor physically noiseless?',
        options: [
          'It uses results obtained under different effective noise levels to estimate a zero-noise result',
          'It permanently removes all hardware noise from future jobs',
          'It replaces transpilation with classical simulation',
          'It guarantees that every measurement becomes 00 or 11',
        ],
        correctIndex: 0,
        explanation:
          'Zero Noise Extrapolation (ZNE) intentionally amplifies noise by known scaling factors (e.g., via digital gate folding), records the output at each level, and fits a curve extrapolating back to the theoretical zero-noise limit.',
      },
      {
        id: 's1-q16',
        question:
          'A student says Grover\'s algorithm is faster simply because a quantum computer can \'check all N items simultaneously.\' Which response best captures the mechanism emphasized in the workshop?',
        options: [
          'Grover amplifies the marked state\'s probability through repeated oracle and diffuser operations',
          'Grover sorts the database before searching',
          'Grover measures every database item in one shot',
          'Grover removes the need for a marked state',
        ],
        correctIndex: 0,
        explanation:
          'Quantum parallelism alone does not yield a speedup because measurement collapses the superposition randomly. Grover\'s algorithm uses constructive interference via repeated oracle and diffuser iterations to amplify the marked state\'s probability amplitude.',
      },
      {
        id: 's1-q17',
        question:
          'For an unstructured search space of 1 billion items, why is approximately 31,600 significant in the context of Grover\'s algorithm?',
        options: [
          'It is approximately the square root of the search-space size',
          'It is the number of qubits required to store the database directly',
          'It is the classical worst-case number of searches',
          'It is the number of possible Bell states',
        ],
        correctIndex: 0,
        explanation:
          'Grover\'s algorithm provides a quadratic speedup requiring O(√N) iterations. For N = 1,000,000,000, √N ≈ 31,622.77, so approximately 31,600 query evaluations are needed.',
      },
      {
        id: 's1-q18',
        question:
          'In Grover\'s algorithm, the oracle flips the phase of the marked state. Why is that phase flip useful if measurement probabilities depend on squared amplitudes?',
        options: [
          'The phase change becomes useful when followed by interference from the diffuser',
          'The phase flip directly measures the marked state',
          'The phase flip permanently removes all unmarked states',
          'The phase flip changes the number of qubits',
        ],
        correctIndex: 0,
        explanation:
          'A negative phase flip alone does not alter measurement probability (| -α |² = | α |²). However, the inversion-about-the-average (diffuser) converts that phase difference into constructive amplitude interference for the marked state.',
      },
      {
        id: 's1-q19',
        question:
          'Why does the diffuser complement the oracle in Grover\'s algorithm rather than simply repeating the oracle many times?',
        options: [
          'The diffuser changes the amplitude distribution so probability concentrates toward the marked state',
          'The diffuser physically relocates the marked qubit',
          'The diffuser converts the quantum state into classical bits',
          'The diffuser eliminates the need for an oracle',
        ],
        correctIndex: 0,
        explanation:
          'Applying the oracle twice cancels out (O² = I). The diffuser performs an inversion about the mean amplitude, which leverages the oracle\'s negative sign to boost the marked state amplitude above the mean.',
      },
      {
        id: 's1-q20',
        question:
          'Which statement best summarizes the conceptual progression from Sections A–D of the workshop?',
        options: [
          'Quantum states are mathematically represented, manipulated by gates, implemented as circuits, adapted to hardware, and finally affected by real-device noise',
          'Quantum computing moves directly from Bloch spheres to classical databases without hardware considerations',
          'Quantum algorithms are independent of the physical processor on which they run',
          'Noise appears only because quantum states cannot be represented mathematically',
        ],
        correctIndex: 0,
        explanation:
          'The workshop structured learning from quantum state vectors and Bloch representations to unitary gates, multi-qubit circuit implementation, physical hardware transpilation constraints, and real-device noise/mitigation.',
      },
    ],
  },
  'session-3': {
    sessionId: 'session-3',
    title: 'Session 3 Concept Check: Qubit Connectivity, Quantum Architectures & Lab Tour',
    passingScore: 75,
    questions: [
      {
        id: 's3-q1',
        question:
          'According to Mr. Karthikganesh Durai’s comparison of classical and quantum hardware, how is a classical binary digit (bit) physically realized in standard digital electronics?',
        options: [
          'By isolating a single free electron in a vacuum trap and measuring its intrinsic angular momentum',
          'By applying a 5V DC bias across a three-terminal semiconductor transistor (Emitter, Base, Collector) to drive a flow of roughly 3,000 to 5,000 electrons',
          'By passing a polarized laser beam through a non-linear crystal to split horizontal and vertical photons',
          'By cooling a Josephson junction to millikelvin temperatures to induce Cooper pair tunneling',
        ],
        correctIndex: 1,
        explanation:
          'In the lecture, a classical bit is explained as a semiconductor transistor (NPN, PNP, FET, MOSFET) made of Silicon or Germanium with three terminals—Emitter, Base, and Collector—where applying 5V DC drives ~3,000 to 5,000 electrons from Emitter to Collector through the Base to represent binary 1 (and no flow for 0).',
      },
      {
        id: 's3-q2',
        question:
          'While scientists have explored over 20 physical platforms to build qubits (including NMR, Diamond NV centers, SQUIDs, and Quantum Dots), which five technologies were highlighted as the mature commercial quantum hardware modalities?',
        options: [
          'Superconducting, Ion Trap, Photonics, Neutral Atom, and Quantum Annealers',
          'CMOS Transistors, Topological Majorana, NMR, Graphene Ribbons, and Optical Fibers',
          'SQUID, Kane Silicon NMR, Single Electron Transistors, Spintronics, and Cold Bosons',
          'Superconducting, Ferroelectric RAM, Magnetic Tunnel Junctions, Photonics, and Quantum Dots',
        ],
        correctIndex: 0,
        explanation:
          'The speaker emphasized the five mature commercial quantum technologies: Superconducting (IBM, Google, Rigetti), Ion Trap (IonQ, Quantinuum), Photonics (Xanadu), Neutral Atom (QuEra, Atom Computing), and Quantum Annealers (D-Wave).',
      },
      {
        id: 's3-q3',
        question:
          'In the Single Electron Transistor (SET) conceptual model discussed in Session 3, what does "IAM" stand for in relation to electron spin, and what stimulus tilts it into superposition |ψ⟩?',
        options: [
          'Induced Atomic Magnetization; tilted using a 5V DC voltage',
          'Isotropic Amplitude Modulation; tilted using an acoustic surface wave',
          'Intrinsic Angular Momentum; tilted from the North (|0⟩) or South (|1⟩) pole using a microwave field',
          'Interferometric Angular Matrix; tilted using room-temperature thermal annealing',
        ],
        correctIndex: 2,
        explanation:
          'Electron spin is formally Intrinsic Angular Momentum (IAM), which possesses both magnitude (amplitude) and phase (angle). North Pole maps to |0⟩, South Pole maps to |1⟩, and applying a microwave field tilts the spin into an intermediate superposition state |ψ⟩.',
      },
      {
        id: 's3-q4',
        question:
          'When using photon polarity (polarization) to represent a physical qubit, how are the basis states |0⟩, |1⟩, and superposition |ψ⟩ mapped?',
        options: [
          'Vertical polarization (π/2 rad) represents |0⟩, circular polarization (2π rad) represents |1⟩, and a magnetic field creates superposition',
          'Photon frequency represents |0⟩, photon wavelength represents |1⟩, and a glass prism creates superposition',
          'Horizontal polarization represents |1⟩, vertical polarization represents |0⟩, and a 5V DC bias creates superposition',
          'Horizontal polarization (0 rad) represents |0⟩, vertical polarization (π/2 rad) represents |1⟩, and a laser beam rotates the polarity to an intermediate angle for superposition |ψ⟩',
        ],
        correctIndex: 3,
        explanation:
          'In the OneNote walkthrough, Horizontal polarization (0° or 0 radians) maps to |0⟩, Vertical polarization (90° or π/2 ≈ 3.14/2 radians) maps to |1⟩, and applying a laser beam rotates the polarity to an intermediate angle representing superposition |ψ⟩.',
      },
      {
        id: 's3-q5',
        question:
          'How did Mr. Karthikganesh Durai mathematically define a single qubit, and what happened in Google Colab when the plain Python list `c = [0.707+0j, 0.707+0j]` was passed directly into `plot_bloch_multivector(c)`?',
        options: [
          'A qubit is a two-element complex column vector; `plot_bloch_multivector(c)` plotted the equal superposition state |+⟩ on the Bloch sphere because 0.707 ≈ 1/√2 satisfies |α|² + |β|² = 1',
          'A qubit is a 2x2 orthogonal matrix; `plot_bloch_multivector(c)` raised a TypeError because a QuantumCircuit object is mandatory',
          'A qubit is a scalar float; `plot_bloch_multivector(c)` plotted the state at the South Pole |1⟩',
          'A qubit is a four-element binary tuple; `plot_bloch_multivector(c)` returned an identity matrix',
        ],
        correctIndex: 0,
        explanation:
          'Mathematically, a qubit is a two-element complex column vector. In Colab, `c = [0.707+0j, 0.707+0j]` (where 0.707 ≈ 1/√2 so (0.707)² + (0.707)² ≈ 1) was passed directly into `plot_bloch_multivector(c)` without a QuantumCircuit, plotting the |+⟩ equal superposition state on the Bloch sphere.',
      },
      {
        id: 's3-q6',
        question:
          'Suppose a single-qubit circuit applies a Hadamard gate (H) first, followed by a Pauli-Y gate (Y), and finally a Phase gate P(π/2). How does linear algebra evaluate this gate sequence on state |ψ⟩, and what are the two core reasons quantum computers achieve exponential speedup?',
        options: [
          'It adds the matrices (H + Y + P); speedup comes from higher gigahertz clock rates and smaller silicon gates',
          'It multiplies the 2x2 unitary matrices in reverse order (P(π/2) · Y · H |ψ⟩) into a single composed 2x2 unitary matrix; speedup comes from (1) natively parallel 2^n state representation via superposition and (2) unitary operations via matrix composition',
          'It multiplies the matrices left-to-right (H · Y · P) after measuring each gate; speedup comes from 5V DC electron flow',
          'It tensor-products the three gates into an 8x8 matrix; speedup comes from eliminating complex numbers',
        ],
        correctIndex: 1,
        explanation:
          'Sequential single-qubit gates H, Y, and P(π/2) multiply the column vector in reverse order: P(π/2) · Y · H |ψ⟩, collapsing into a single 2x2 complex unitary matrix. Combined with natively parallel representation of 2^n states in superposition, this underpins quantum speedup.',
      },
      {
        id: 's3-q7',
        question:
          'While IBM Quantum exposes around 12 standard gates in Qiskit, which three foundational gates did the speaker emphasize are universally available across almost all gate-based quantum hardware platforms?',
        options: [
          'T, T-dagger, and S-dagger gates',
          'SWAP, Toffoli (CCX), and Fredkin (CSWAP) gates',
          'X gate, Hadamard (H) gate, and Controlled-NOT (CX) gate',
          'Rx, Ry, and Rz continuous rotation gates only',
        ],
        correctIndex: 2,
        explanation:
          'Across superconducting, ion-trap, photonic, and neutral-atom gate-based platforms, almost every quantum computer universally supports the Pauli-X gate, the Hadamard (H) gate, and the Controlled-NOT (CX) gate.',
      },
      {
        id: 's3-q8',
        question:
          'In the Quantum Hardware ecosystem overview, which pairing accurately matches each quantum hardware modality with its leading industry companies?',
        options: [
          'IBM and Google: Photonics; Xanadu: Superconducting; D-Wave: Ion Traps; Rigetti: Neutral Atoms',
          'IonQ: Superconducting; Quantinuum: Quantum Annealing; QuEra: Photonics; D-Wave: Neutral Atoms',
          'All commercial vendors (IBM, IonQ, Xanadu, QuEra, D-Wave) exclusively build Superconducting transmon processors',
          'Superconducting: IBM, Google, Rigetti; Ion Trap: IonQ, Quantinuum (Honeywell + CQC); Photonic: Xanadu; Neutral Atom: QuEra, Atom Computing; Quantum Annealer: D-Wave',
        ],
        correctIndex: 3,
        explanation:
          'The speaker mapped the five mature modalities directly to their flagship vendors: Superconducting (IBM, Google, Rigetti), Ion Trap (IonQ, Honeywell/Quantinuum formed with Cambridge Quantum Computing), Photonics (Xanadu), Neutral Atom (QuEra, Atom Computing), and Quantum Annealing (D-Wave).',
      },
      {
        id: 's3-q9',
        question:
          'In a superconducting quantum computer, what is the large gold chandelier-like structure, where is the Quantum Processing Unit (QPU) located, and what temperature is maintained at that stage?',
        options: [
          'It is a Dilution Refrigerator; the QPU sits at the bottom-most plate cooled to approximately 0.01 Kelvin (10 mK), which is colder than outer space (~1.5 K)',
          'It is the QPU itself; the dilution refrigerator is a microchip at the top plate kept at 300 Kelvin',
          'It is a high-power laser amplifier operating at 77 Kelvin liquid nitrogen temperature',
          'It is an ultra-high vacuum optical lattice chamber heated to 400 Kelvin',
        ],
        correctIndex: 0,
        explanation:
          'The multi-stage gold chandelier is the Dilution Refrigerator that progressively cools down from room temperature to ~0.01 K (10 millikelvin) at the bottom mixing chamber plate where the QPU chip is mounted.',
      },
      {
        id: 's3-q10',
        question:
          'Which metallic materials and electronic components form a superconducting transmon qubit circuit, and what quantum phenomenon occurs at millikelvin temperatures?',
        options: [
          'Copper resistor and silicon diode; holes recombine across a p-n junction',
          'Niobium (Nb) capacitor and Aluminium (Al) Josephson Junction (non-linear inductor); electrons bind into Cooper pairs that tunnel with zero resistance',
          'Gold waveguide and calcium ion trap; photons undergo spontaneous emission',
          'Iron core transformer and tungsten filament; electrons boil off thermionically',
        ],
        correctIndex: 1,
        explanation:
          'Superconducting qubits use a Niobium (Nb) capacitor (where the upper Nb layer encodes |0⟩ and lower Nb layer encodes |1⟩) and an Aluminium (Al) Josephson Junction acting as a non-linear inductor. At ~0.01 K, electrons form Cooper pairs that tunnel without electrical resistance.',
      },
      {
        id: 's3-q11',
        question:
          'According to the lecture, approximately how many physical qubits are needed to form one error-corrected logical qubit, and what two factors determine a processor’s Quantum Volume (QV)?',
        options: [
          '2 physical qubits per logical qubit; QV depends only on clock speed and cryostat height',
          '100 physical qubits per logical qubit; QV depends only on laser wavelength',
          'Approximately 4 physical qubits per 1 logical qubit; QV depends on both the number of qubits (N) and the inverse error rate (1 / error)',
          '1 physical qubit per 4 logical qubits; QV depends only on classical RAM size',
        ],
        correctIndex: 2,
        explanation:
          'Around 4 physical qubits are combined to create 1 error-corrected logical qubit. Because raw qubit count is meaningless if noise is high, Quantum Volume (QV) evaluates both qubit count N and 1/error.',
      },
      {
        id: 's3-q12',
        question:
          'In Trapped Ion quantum computers (such as IonQ and Quantinuum), which atomic ions are trapped, how are qubit states read out, and how does their gate speed compare to superconducting qubits?',
        options: [
          'Helium and Neon ions; read out via microwave resonators; 1000x faster than superconducting qubits',
          'Uranium and Plutonium ions; read out via Geiger counters; identical speed to superconducting qubits',
          'Silicon and Germanium ions; read out via 5V DC current; 10x faster than photonic qubits',
          'Calcium (Ca+) and Ytterbium (Yb+) ions in a 4-electrode linear trap; read out via camera fluorescence (dark = |0⟩, bright fluorescence = |1⟩); ~1000x slower than superconducting qubits',
        ],
        correctIndex: 3,
        explanation:
          'Trapped-ion processors confine Ca+ or Yb+ ions in a 4-electrode linear Paul trap and manipulate them with lasers. Camera readout detects dark (|0⟩) vs. bright fluorescence (|1⟩). While coherence is high, gate operations are roughly 1,000 times slower than superconducting systems.',
      },
      {
        id: 's3-q13',
        question:
          'What is the correct signal path in a Photonic quantum processor, and why did the speaker describe Neutral Atom quantum computing as a "consolidated technology"?',
        options: [
          'Photonic path: Single Photon Source (SPS) → Optical Coupler → Modulator → Optical Waveguide → Optical Ring Resonator; Neutral Atom is consolidated because it uses BOTH lasers and microwaves to control atoms in an Ultra-High Vacuum (UHV) optical lattice',
          'Photonic path: Josephson Junction → Coaxial Cable → Cryostat; Neutral Atom uses only 5V DC currents',
          'Photonic path: Paul Trap → Fluorescence Camera; Neutral Atom uses only liquid helium cooling without lasers',
          'Photonic path: Ising Spin → Annealing Coil; Neutral Atom uses only X-ray beams',
        ],
        correctIndex: 0,
        explanation:
          'Photonic processors generate single photons via a non-linear crystal Single Photon Source (SPS) and route them through a coupler, modulator, optical waveguide, and optical ring resonator. Neutral Atom systems (e.g., Atom Computing’s 1,180-qubit processor) are called a "consolidated technology" because they combine both lasers (used in ion traps/photonics) and microwaves (used in superconducting) inside an Ultra-High Vacuum (UHV) optical lattice.',
      },
      {
        id: 's3-q14',
        question:
          'Unlike gate-based quantum computers that use basis states 0 and 1, what mathematical model and binary spin values are used by D-Wave’s ~5,000-qubit Quantum Annealer, and what particles do Topological qubits braid?',
        options: [
          'Bose-Einstein model with spin values 0 and 2; Topological qubits braid protons',
          'Ising Model with magnetic dipole spin values -1 and +1 for combinatorial optimization, differential equations, and linear solvers; Topological qubits braid Anyons',
          'Fermi-Dirac model with spin values +1/2 and +3/2; Topological qubits braid neutrinos',
          'Classical Boolean model with 5V and 0V; Topological qubits braid photons',
        ],
        correctIndex: 1,
        explanation:
          'D-Wave quantum annealers (~5,000 qubits) implement the Ising Model using spin states -1 and +1 (rather than 0 and 1) to solve optimization, differential equation, and linear solver problems. Topological quantum computing (e.g., Microsoft) relies on braiding non-Abelian Anyons.',
      },
      {
        id: 's3-q15',
        question:
          'What minimum qubit counts did Mr. Durai specify for (1) general industrial production quantum systems and (2) running Shor’s algorithm at scale, and which platforms represent "Quantum-Inspired" classical optimizers?',
        options: [
          '100 qubits for production and 500 qubits for Shor’s algorithm; IBM Condor and Google Willow',
          '1,000 qubits for production and 2,000 qubits for Shor’s algorithm; IonQ Forte and Xanadu Borealis',
          '40,000 qubits for general production systems and 100,000 (1 lakh) qubits for Shor’s algorithm; Microsoft Azure Quantum Inspired Optimizer, Toshiba SQBM+, and Fujitsu Digital Annealer',
          '1 million qubits for production and 10 million for Shor’s algorithm; Raspberry Pi and Arduino',
        ],
        correctIndex: 2,
        explanation:
          'The speaker stated that general production systems require at least 40,000 qubits, while Shor’s algorithm requires 100,000 (1 lakh) qubits. He also highlighted three commercial Quantum-Inspired platforms: Microsoft Azure Quantum Inspired Optimizer, Toshiba SQBM+, and Fujitsu Digital Annealer.',
      },
      {
        id: 's3-q16',
        question:
          'In the live Google Colab coding demonstration of the 2-Qubit Quantum Fourier Transform (QFT), what exact sequence of Qiskit gates was applied to transform the 2-qubit register `qr`?',
        options: [
          '`qc.x(qr[0])` → `qc.cx(qr[0], qr[1])` → `qc.z(qr[1])` → `qc.measure_all()`',
          '`qc.h(qr[0])` → `qc.cx(qr[0], qr[1])` → `qc.cx(qr[1], qr[0])` → `qc.h(qr[1])`',
          '`qc.ry(3.14/2, qr[0])` → `qc.cz(qr[0], qr[1])` → `qc.rx(3.14/2, qr[1])`',
          '`qc.h(qr[1])` → `qc.cp(3.14/2, qr[1], qr[0])` → `qc.h(qr[0])` → `qc.swap(qr[0], qr[1])`',
        ],
        correctIndex: 3,
        explanation:
          'In the live 2-qubit QFT Colab demo, the speaker applied: (1) Hadamard on qr[1] (`qc.h(qr[1])`), (2) Controlled-Phase of π/2 with control qr[1] and target qr[0] (`qc.cp(3.14/2, qr[1], qr[0])`), (3) Hadamard on qr[0] (`qc.h(qr[0])`), and (4) SWAP between qr[0] and qr[1] (`qc.swap(qr[0], qr[1])`).',
      },
      {
        id: 's3-q17',
        question:
          'In the 2-Qubit QFT Colab demo, how does QFT transform the computational basis states (|00⟩, |01⟩, |10⟩, |11⟩), and how was the state extracted for `plot_bloch_multivector`?',
        options: [
          'It transforms computational basis states on the Z-axis into rotational phase states on the equator of the Bloch sphere; extracted via `DensityMatrix(qc)` with measurement gates omitted',
          'It collapses all superposition states to |00⟩; extracted using `AerSimulator().run(qc, shots=1024)`',
          'It bit-flips |00⟩ to |11⟩ along the Z-axis; extracted using `ClassicalRegister` bitstrings',
          'It deletes the relative phase of both qubits; extracted using `PassManager`',
        ],
        correctIndex: 0,
        explanation:
          'QFT maps computational basis states (|00⟩, |01⟩, |10⟩, |11⟩) into distinct equatorial phase states on the Bloch sphere (feeding into Quantum Phase Estimation, Shor’s, and Grover’s algorithms). To visualize the uncollapsed state, measurement gates were commented out and `matrix = DensityMatrix(qc)` was passed to `plot_bloch_multivector(matrix)`.',
      },
      {
        id: 's3-q18',
        question:
          'During Dr. Varsha Sambhaje’s live virtual tour of the SRM University-AP Quantum Reference Facility, what milestone does this laboratory represent and what is the temperature progression down the open Dilution Refrigerator plates?',
        options: [
          'It is a classical supercomputing center cooled only to 77 K with liquid nitrogen',
          'It is India’s first Quantum Reference Facility (inaugurated April 14 by CM Sri Nara Chandrababu Naidu); its stepped plates cool progressively from 50 K → 40 K → 30–20 K → 20–10 K → <4 K → down to 10 mK at the bottom qubit stage',
          'It is an optical telescope facility operating at 300 K room temperature',
          'It is a 5,000-qubit D-Wave annealing facility operating at 4.2 K',
        ],
        correctIndex: 1,
        explanation:
          'Dr. Varsha showcased India’s first Quantum Reference Facility at SRM University-AP, walking through the open Dilution Refrigerator’s stepped gold plates from 50 K at the top down through 40 K, 30–20 K, 20–10 K, <4 K, and finally 10 mK at the bottom plate.',
      },
      {
        id: 's3-q19',
        question:
          'How many superconducting qubits can be mounted simultaneously at the base of the SRM University-AP Dilution Refrigerator, and what experiment was actively running at the 4 K stage during the live tour?',
        options: [
          '100 qubits on a single mount; a Shor’s factorization test was running at 50 K',
          '50 qubits across five mounts; a laser cooling experiment was running at 10 mK',
          'Up to 5 qubits simultaneously across two mounts (a 3-qubit setup and a 2-qubit setup); researchers were testing a quantum sensing antenna at the 4 K stage',
          '1 qubit only; no experiments were connected to the cryostat',
        ],
        correctIndex: 2,
        explanation:
          'During the tour, Dr. Varsha pointed out the two processor mounts at the bottom of the cryostat—a 3-qubit mount and a 2-qubit mount (5 qubits total)—and showed the active 4 K test bed where a researcher was testing a quantum sensing antenna.',
      },
      {
        id: 's3-q20',
        question:
          'What is the role of the external Gas Handling System shown by Dr. Varsha in the SRM University-AP Quantum Reference Lab?',
        options: [
          'It burns hydrogen and oxygen gas to generate electricity for the campus',
          'It pumps SF6 insulating gas into high-voltage transformers',
          'It vents helium gas into the atmosphere after a single open-loop pass',
          'It circulates a closed-loop Helium-3 / Helium-4 (3He/4He) mixture with Nitrogen (N2) gas filtration to drive the dilution cooling cycle down to 10 mK once the vacuum cans are sealed',
        ],
        correctIndex: 3,
        explanation:
          'Dr. Varsha showed the external Gas Handling System and control rack, which filters and circulates the closed-loop Helium-3 / Helium-4 mixture alongside Nitrogen (N2) cold traps to reach 10 mK once the cryostat cans are closed.',
      },
    ],
  },
  'session-4': {
    sessionId: 'session-4',
    title: 'Session 4 Concept Check: Quantum Sensing & Quantum Optics',
    passingScore: 75,
    questions: [
      {
        id: 's4-q1',
        question:
          'In Prof. Durga B. Rao Dasari’s lecture (Session 4A), why are solid-state Nitrogen-Vacancy (NV) centers in diamond advantageous over Superconducting Quantum Interference Devices (SQUIDs) for biological and nanoscale magnetometry?',
        options: [
          'NV centers achieve millitesla sensitivity whereas SQUIDs are limited to microtesla fields',
          'NV centers operate at room temperature and can be placed on 200–500 nm nanodiamond fiber tips within nanometers of biological tissues, whereas SQUIDs require bulky cryogenic isolation that prevents close proximity',
          'SQUIDs cannot measure static DC magnetic fields and only respond to optical frequencies',
          'NV centers do not experience any shot noise even in a single measurement shot',
        ],
        correctIndex: 1,
        explanation:
          'While SQUIDs achieve femtotesla (10^-15 T) sensitivity, their bulky cryogenic cooling enclosures prevent bringing them close to living tissue (e.g., during brain surgery or intracellular sensing). Diamond NV centers operate at room temperature and can be integrated onto 200–500 nm fiber tips right next to biological cells.',
      },
      {
        id: 's4-q2',
        question:
          'To estimate a physical parameter with a target precision error of ε, how do the required measurement resources scale in classical sensing versus optimal quantum-enhanced (Heisenberg) sensing?',
        options: [
          'Classical resources scale as 1/ε², whereas quantum-enhanced resources scale as 1/ε (for example, ε = 10^-9 requires ~10^18 classical resources vs. ~10^9 quantum resources)',
          'Classical resources scale as 1/ε, whereas quantum resources scale as log(1/ε)',
          'Classical resources scale as exp(1/ε), whereas quantum resources scale as 1/ε²',
          'Both scale as 1/ε², but quantum sensors use higher laser power',
        ],
        correctIndex: 0,
        explanation:
          'Prof. Dasari explained that classical averaging requires resources scaling as 1/ε² (Standard Quantum Limit), whereas quantum-enhanced sensing scales as 1/ε (Heisenberg scaling)—giving a quadratic resource reduction analogous to Grover’s search algorithm.',
      },
      {
        id: 's4-q3',
        question:
          'How does the Cramér-Rao Bound relate phase uncertainty Δφ to Quantum Fisher Information F, and how does F scale for N independent qubits versus an N-qubit maximally entangled GHZ state?',
        options: [
          'Δφ ≥ F; Independent: F = 1, GHZ: F = √N',
          'Δφ ≥ 1/F²; Independent: F = N², GHZ: F = 2^N',
          'Δφ ≥ 1/√F; Independent qubits: F = N giving Δφ ≥ 1/√N (SQL); Entangled GHZ state: F = N² giving Δφ ≥ 1/N (Heisenberg Limit)',
          'Δφ = F · N; Independent and GHZ states have identical Fisher Information',
        ],
        correctIndex: 2,
        explanation:
          'By the Cramér-Rao Bound, Δφ ≥ 1/√F. For N uncorrelated qubits, Quantum Fisher Information adds linearly (F = N), yielding the Standard Quantum Limit Δφ ≥ 1/√N. For an N-qubit entangled GHZ state, Quantum Fisher Information scales quadratically (F = N²), achieving the Heisenberg Limit Δφ ≥ 1/N.',
      },
      {
        id: 's4-q4',
        question:
          'When mapping spin-resonance sensing protocols to Qiskit quantum circuits, which gates correspond to the microwave π/2 and π pulses, and why is a second π/2 pulse required at the end of a Ramsey sequence (π/2 — τ — π/2)?',
        options: [
          'π/2 ↔ Pauli-Z, π ↔ Hadamard; the second π/2 pulse erases the phase to reset the spin',
          'π/2 ↔ CNOT, π ↔ Toffoli; the second π/2 pulse cools the diamond lattice',
          'π/2 ↔ T gate, π ↔ S gate; the second π/2 pulse amplifies the microwave power',
          'π/2 ↔ Hadamard (H) gate, π ↔ Pauli-X gate; the second π/2 (H) pulse converts the relative phase φ accumulated on the equatorial XY-plane into measurable Z-basis population probabilities P = (1 ± cos φ)/2',
        ],
        correctIndex: 3,
        explanation:
          'A π/2 pulse rotates the spin from the Z-axis onto the XY-plane (Hadamard gate H), while a π pulse flips the spin by 180° (Pauli-X gate). Because states on the XY-plane always yield 50/50 Z-measurement outcomes, the final π/2 (H) pulse rotates the accumulated phase φ back onto the Z-axis so it can be read out as population probability P = (1 ∓ cos φ)/2.',
      },
      {
        id: 's4-q5',
        question:
          'Why does a standard Ramsey sequence fail to measure an alternating (AC) sinusoidal magnetic field over a full period, and how do the Hahn Echo and multi-pulse Dynamical Decoupling sequences solve this?',
        options: [
          'In Ramsey, positive (+φ) and negative (-φ) AC half-cycles cancel to zero; Hahn Echo inserts a π pulse (X gate) at the midpoint zero-crossing so both half-cycles add constructively, and multi-pulse π trains act as a narrowband frequency filter function',
          'Ramsey pulses are too slow for AC fields; Hahn Echo replaces microwave pulses with continuous X-ray illumination',
          'AC fields destroy the diamond crystal unless a SWAP gate is applied',
          'Ramsey only works on 4-qubit GHZ states, whereas Hahn Echo requires no microwave pulses',
        ],
        correctIndex: 0,
        explanation:
          'Over a full AC cycle, the positive and negative half-cycles accumulate opposite phases (+φ and -φ) that cancel out in Ramsey interferometry. Applying a π pulse (X gate) at the midpoint flips the spin phase so the second half-cycle adds constructively (+2φ). Repeating timed π pulses (Dynamical Decoupling) forms a narrowband frequency filter that isolates a target frequency from multi-frequency noise.',
      },
      {
        id: 's4-q6',
        question:
          'In Prof. Dasari’s 4-qubit sensing comparison, how does preparing a 4-qubit entangled GHZ state (|0000⟩ + |1111⟩)/√2 alter the interference fringes compared to using 4 independent qubits?',
        options: [
          'Independent qubits oscillate as cos(4φ), whereas the GHZ state oscillates slowly as cos(φ/4)',
          'Independent qubits yield a flat joint probability ~cos⁴(φ) near φ = 0, whereas the 4-qubit GHZ state amplifies the phase 4-fold to produce steep cos(4φ) fringes that oscillate 4x faster',
          'Both produce identical cos(φ) fringes with no change in slope',
          'The GHZ state eliminates phase accumulation completely',
        ],
        correctIndex: 1,
        explanation:
          'For 4 independent qubits, the joint probability is the product of single-qubit probabilities (~cos⁴(φ)), which is flat and insensitive near φ = 0. In a 4-qubit GHZ state, each qubit in |1111⟩ picks up e^(iφ) for a collective phase of 4φ, giving P = (1 + cos(4φ))/2 with 4x faster oscillations and a steep slope near φ = 0.',
      },
      {
        id: 's4-q7',
        question:
          'How is a Diamond Nitrogen-Vacancy (NV) center optically initialized and read out at room temperature, and what microwave frequency drives its ground-state spin transitions?',
        options: [
          'Excited with UV light and read out via blue cherenkov radiation; driven at 100 MHz radio frequencies',
          'Excited with 1550 nm infrared light and read out via electrical resistance; driven at 60 Hz',
          'Excited with a 532 nm green laser and read out via red fluorescence (where m_s = 0 is bright and m_s = ±1 is dark/dimmer); driven by 2–3 GHz (2.87 GHz) microwaves',
          'Excited with microwaves and read out via green laser emission only below 10 mK',
        ],
        correctIndex: 2,
        explanation:
          'An NV center is a deep defect inside diamond’s ~6 eV bandgap ("caged atom"). Pumped with a 532 nm green laser, it emits red fluorescence whose intensity is spin-dependent: the m_s = 0 state is bright while m_s = ±1 states are dark/dimmer. Its ground-state spin triplet splits at 2–3 GHz (2.87 GHz zero-field splitting) and shifts linearly with magnetic field via the Zeeman effect.',
      },
      {
        id: 's4-q8',
        question:
          'In Quantum Memory-Assisted Sensing with diamond NV centers, what serves as the auxiliary quantum memory register around the NV electron spin, and why must Quantum Computational Sensing occur BEFORE measurement?',
        options: [
          'Free conduction electrons serve as memory; computation happens after the analog-to-digital converter',
          'Boron acceptors serve as memory; classical amplifiers boost the quantum state before readout',
          ' superconducting resonators serve as memory; the No-Cloning Theorem requires classical amplification first',
          '10 to 25 surrounding isotopic Carbon-13 (13C) nuclear spins coupled via hyperfine interactions serve as quantum memory (enabling QFT for single-spin chemical shifts); because the No-Cloning Theorem forbids amplifying unknown quantum states, entanglement and quantum algorithms must act BEFORE measurement',
        ],
        correctIndex: 3,
        explanation:
          'Natural-abundance 13C nuclear spins in the diamond lattice couple to the NV electron spin via hyperfine splitting (up to 10–25 controllable nuclear memory spins) to run QFT and resolve single-spin chemical shifts. Furthermore, because the No-Cloning Theorem forbids deterministic amplification of unknown quantum states, quantum sensors replace classical amplifiers with entanglement and execute quantum algorithms BEFORE measurement.',
      },
      {
        id: 's4-q9',
        question:
          'According to Dr. Gangi Reddy Salla (Session 4B), what practical advantages do photonic quantum systems offer for laboratory implementation and free-space atmospheric experiments?',
        options: [
          'Photons have negligible decoherence at room temperature, a complete Quantum Photonics Lab costs ~2–3 Crores INR (vs. 10–30 Crores INR for superconducting setups), and ~150 m of atmospheric turbulence can be simulated on a 1.5 m optical bench using folded mirror passes through a fog/temperature glass chamber',
          'Photonic qubits require 10 mK dilution refrigerators costing 30 Crores INR and decohere within picoseconds in air',
          'Visible 405 nm light suffers zero atmospheric turbulence compared to 1550 nm infrared light',
          'Photonic systems cannot be used for free-space communication beyond 1 millimeter',
        ],
        correctIndex: 0,
        explanation:
          'Dr. Salla emphasized that photons weakly interact with the environment at room temperature, making a Quantum Photonics Lab achievable in 2–3 Crores INR (versus 10–30 Crores INR for cryogenic superconducting systems), and showed how ~150 m of free-space propagation can be folded onto a 1.5 m table through a controlled turbulence chamber.',
      },
      {
        id: 's4-q10',
        question:
          'When encoding quantum information across different degrees of freedom (DoFs) of a single photon, how many bits are carried by Frequency, Polarization, and Vector modes versus Orbital Angular Momentum (OAM) spatial modes?',
        options: [
          'Frequency: 10 bits; Polarization: 8 bits; Vector modes: 2 bits; OAM: 1 bit',
          'Frequency: 1 bit (2 states); Polarization: 2 bits; Vector modes: 4 bits; OAM spatial modes: an infinite-dimensional orthogonal basis that boosts data transmission capacity by 10–20x',
          'All photonic degrees of freedom are strictly limited to 1 bit (2 orthogonal states)',
          'OAM modes can only exist inside superconducting coaxial cables',
        ],
        correctIndex: 1,
        explanation:
          'Dr. Salla explained that while frequency (1 bit), polarization (2 bits), and vector modes (4 bits) span finite state spaces, Orbital Angular Momentum (OAM) spatial modes form a countably infinite orthogonal basis (l = ±1, ±2, ..., ±∞), increasing communication capacity by 10 to 20 times.',
      },
      {
        id: 's4-q11',
        question:
          'How many optical waveplates are required to implement an arbitrary polarization unitary transformation for a single photon [SU(2)] versus two photons [SU(2)²], and why is 1550 nm / 1560 nm preferred over 810 nm for free-space quantum links?',
        options: [
          '1 waveplate for SU(2) and 2 waveplates for SU(2)²; 810 nm is preferred because it is visible to the human eye',
          '10 waveplates for SU(2) and 20 waveplates for SU(2)²; 405 nm is preferred due to high Rayleigh scattering',
          '3 waveplates (2 Quarter-Wave Plates + 1 Half-Wave Plate) for single-photon SU(2) and 6 coupled waveplates for two-photon SU(2)²; 1550 nm / 1560 nm telecom infrared suffers significantly less atmospheric turbulence distortion than 810 nm',
          'Waveplates cannot alter photon polarization; only magnetic coils can rotate polarization',
        ],
        correctIndex: 2,
        explanation:
          'Any single-photon SU(2) polarization unitary is realized using 3 waveplates (two QWPs and one HWP), while two-photon SU(2)² control requires 6 waveplates. Telecom 1550 nm / 1560 nm infrared light experiences much lower atmospheric turbulence and scattering loss over 150 m–1000 m free-space links than 810 nm.',
      },
      {
        id: 's4-q12',
        question:
          'In Spontaneous Parametric Down-Conversion (SPDC), what crystal property and conservation laws govern the splitting of a pump photon into signal and idler photons, and what is the typical pair conversion efficiency?',
        options: [
          'Centrosymmetric silicon crystal; violates energy conservation; 100% conversion efficiency',
          'Metallic gold mirror; doubles photon frequency; 1 pair per 10 pump photons',
          'Amorphous glass fiber; requires cryogenic cooling to 10 mK; 1 pair per 1,000 pump photons',
          'Non-centrosymmetric χ^(2) non-linear crystal (e.g., PPKTP or BBO) stabilized in a temperature oven; conserves energy (ω_p = ω_s + ω_i, e.g., 405 nm → 810 nm or 780 nm → 1560 nm) and momentum (k_p ≈ k_s + k_i), producing ~1 photon pair per 10^10 pump photons',
        ],
        correctIndex: 3,
        explanation:
          'SPDC uses a second-order non-linear χ^(2) crystal lacking inversion symmetry (PPKTP, BBO) kept in a temperature-controlled oven. One pump photon splits into signal and idler photons conserving energy (ω_p = ω_s + ω_i) and phase-matching momentum (k_p ≈ k_s + k_i), with an efficiency of roughly 1 pair per 10^10 pump photons.',
      },
      {
        id: 's4-q13',
        question:
          'In a Hanbury Brown–Twiss (HBT) interferometer, what zero-delay second-order correlation values g^(2)(0) distinguish a true single-photon source, a coherent laser beam, and a thermal light source?',
        options: [
          'Single-photon source: g^(2)(0) = 0 (< 0.5 experimentally, showing photon anti-bunching); Coherent laser light: g^(2)(0) = 1; Thermal light: g^(2)(0) > 1',
          'Single-photon source: g^(2)(0) = 2; Coherent laser light: g^(2)(0) = 0; Thermal light: g^(2)(0) = 1',
          'All light sources have g^(2)(0) = 1 regardless of photon statistics',
          'Single-photon source: g^(2)(0) = 10; Coherent laser light: g^(2)(0) = 5; Thermal light: g^(2)(0) = 0',
        ],
        correctIndex: 0,
        explanation:
          'A single photon incident on a 50:50 beam splitter cannot trigger both output detectors simultaneously, yielding an anti-bunching dip of g^(2)(0) = 0 (experimentally verified when g^(2)(0) < 0.5). Coherent Poissonian laser light gives g^(2)(0) = 1, while bunched thermal light gives g^(2)(0) > 1.',
      },
      {
        id: 's4-q14',
        question:
          'How does a deterministic single-photon source based on a single Nitrogen-Vacancy (NV) center in diamond differ from a heralded SPDC single-photon source?',
        options: [
          'SPDC emits photons at fixed clock intervals, whereas NV centers emit pairs of photons randomly',
          'An isolated NV center in engineered low-density diamond (addressed via confocal microscopy, absorbing at 532 nm and emitting at 632 nm) emits single photons deterministically with fixed inter-photon time intervals, whereas SPDC pair generation is probabilistic in time',
          'NV-center single-photon sources require high-density natural diamond with millions of overlapping defects',
          'SPDC only works at 0 Kelvin, whereas NV centers only work with X-ray pumping',
        ],
        correctIndex: 1,
        explanation:
          'Because SPDC is a probabilistic parametric process, the time interval between successive photon pairs is random. A single isolated NV center in engineered low-density diamond (selected with a confocal microscope) absorbs a 532 nm photon, relaxes over a fixed lifetime, and deterministically emits a single 632 nm red photon at regular intervals.',
      },
      {
        id: 's4-q15',
        question:
          'How do Type-I and Type-II SPDC in BBO crystals differ in their emission ring geometry and generation of polarization-entangled Bell states?',
        options: [
          'Type-I produces 4 rings with orthogonal polarizations; Type-II produces 1 ring with parallel polarizations',
          'Neither Type-I nor Type-II SPDC can produce entangled photons without a dilution refrigerator',
          'Type-I emits same-polarization photons into a single ring (requiring two orthogonally crossed BBO crystals pumped at 45° or a Sagnac loop to yield (|HH⟩ + |VV⟩)/√2), whereas Type-II emits orthogonally polarized photons into two intersecting rings that directly yield (|HV⟩ ± |VH⟩)/√2 at the two ring intersections',
          'Type-I only emits microwave photons, whereas Type-II only emits gamma rays',
        ],
        correctIndex: 2,
        explanation:
          'In Type-I SPDC, signal and idler photons have identical polarization (1 ring), so generating (|HH⟩ + |VV⟩)/√2 requires two crossed BBO crystals pumped diagonally at 45° (or a Sagnac interferometer). In Type-II SPDC, signal and idler photons have orthogonal polarizations (H and V) emitted into two intersecting rings, directly producing (|HV⟩ ± |VH⟩)/√2 at the two intersection regions.',
      },
      {
        id: 's4-q16',
        question:
          'What is the classical local-realistic bound versus the maximum quantum mechanical (Tsirelson) violation for Bell’s CHSH inequality parameter S?',
        options: [
          'Classical: S ≤ 1; Quantum: S ≤ 2',
          'Classical: S ≤ 4; Quantum: S ≤ 8',
          'Classical: S = 0; Quantum: S = 1',
          'Classical: S ≤ 2; Quantum entanglement: 2 < S ≤ 2√2 ≈ 2.828',
        ],
        correctIndex: 3,
        explanation:
          'Any classical local hidden-variable description satisfies Bell’s inequality S ≤ 2. Quantum mechanical entanglement violates this inequality in the regime 2 < S ≤ 2√2 (≈ 2.828), providing definitive experimental proof of non-local quantum correlations.',
      },
      {
        id: 's4-q17',
        question:
          'What physical mechanism enables Optical Tweezers to trap dielectric micro-particles and 6-beam laser setups to cool trapped ions to nanokelvin/picokelvin temperatures?',
        options: [
          'Refraction of a focused Gaussian laser beam bends photon paths, causing a momentum change (Δp = p₂ - p₁, F = dp/dt) that pulls the particle to the high-intensity beam center; 6 counter-propagating lasers (±x, ±y, ±z) damp atomic motion in 3D so kinetic energy (3/2)k_B T → 0',
          'Laser beams melt the particle so it sticks to the glass microscope slide',
          'Gravity pulls the ions upward against a 5V DC electric plate',
          'Liquid helium is sprayed directly through the optical fiber onto the particle',
        ],
        correctIndex: 0,
        explanation:
          'Photons carry momentum p. When a Gaussian beam refracts through a transparent particle, conservation of momentum (F = dp/dt) produces a restoring gradient force toward the intensity maximum. Surrounding an ion with 6 counter-propagating laser beams along ±x, ±y, ±z immobilizes its 3D motion, reducing its effective temperature to nanokelvin/picokelvin.',
      },
      {
        id: 's4-q18',
        question:
          'How does a Superconducting Nanowire Single-Photon Detector (SNSPD) detect an individual photon, and how is detector "dead time" defined across single-photon detectors?',
        options: [
          'It uses a mechanical pendulum that swings when hit by a photon; dead time is the battery recharge time',
          'An absorbed single photon locally breaks Cooper pairs to create a resistive hotspot in a current-biased superconducting nanowire (generating a voltage pulse); dead time is rise time + fall time + relaxation time (where fall time > rise time, typically ~10–20 ns)',
          'It heats a room-temperature copper wire by 100°C; dead time is 10 seconds per photon',
          'It amplifies the photon using a laser cavity before detection; dead time is zero',
        ],
        correctIndex: 1,
        explanation:
          'In an SNSPD, absorbing a single photon creates a localized resistive hotspot across a superconducting nanowire biased just below its critical current, producing a measurable voltage spike. Detector dead time—the window during which a second photon cannot be registered—equals rise time + fall time + relaxation time (with fall time > rise time, ~10–20 ns).',
      },
      {
        id: 's4-q19',
        question:
          'In the Quantum Teleportation protocol covered by Dr. Salla, which unitary correction gate must Bob apply to his qubit for each of Alice’s 2-bit classical Bell-measurement outcomes (`00`, `01`, `10`, `11`), and what characterizes an Optical Vortex beam carrying Orbital Angular Momentum (OAM)?',
        options: [
          '`00` → H, `01` → S, `10` → T, `11` → SWAP; Optical vortices have maximum intensity at the beam center',
          '`00` → X, `01` → Y, `10` → Z, `11` → I; Optical vortices have flat planar wavefronts',
          '`00` → Identity (I), `01` → Pauli-X (bit-flip), `10` → Pauli-Z (phase-flip), `11` → both Pauli-X and Pauli-Z; Optical vortices have helical wavefronts with a dark central intensity null (I = 0 phase singularity) generated via CGH fork holograms, q-plates, or spiral phase plates',
          'Bob does not need Alice’s classical bits; Optical vortices are generated only by incandescent bulbs',
        ],
        correctIndex: 2,
        explanation:
          'In Quantum Teleportation, Bob reconstructs |ψ⟩ by applying I for `00`, X for `01`, Z for `10`, and XZ for `11`. Optical vortex (OAM) beams feature a helical phase exp(i·l·φ) with a central phase singularity where intensity vanishes (dark doughnut core, I = 0), generated via Computer-Generated Holograms (CGH), q-plates, or Spiral Phase Plates (SPPs).',
      },
      {
        id: 's4-q20',
        question:
          'During Gyanendra’s live interactive circuit demonstration at the end of Session 4B, what is the maximum qubit capacity of the browser-based Quirk simulator (`algassert.com/quirk`), and what happened when an Inverse QFT (`QFT†`) block was placed immediately after a 4-qubit QFT block?',
        options: [
          'Quirk supports up to 2 qubits; placing QFT† after QFT destroyed the circuit',
          'Quirk supports up to 1,000 qubits; placing QFT† after QFT doubled the phase angle',
          'Quirk requires a paid cloud GPU subscription; QFT† is not available in Quirk',
          'Quirk supports up to 16 qubits in real time; placing Inverse QFT (`QFT†`) after the 4-qubit QFT reversed the Fourier phase encoding and restored all qubits back to their original |0⟩ basis states',
        ],
        correctIndex: 3,
        explanation:
          'Gyanendra demonstrated that Quirk simulates up to 16 qubits interactively in the browser. After showing Pauli-X, a 2-qubit H + CNOT Bell state, and SWAP gates, he applied a 4-qubit QFT (mapping basis states into rotating phase states) followed by an Inverse QFT (`QFT†`), which inverted the transformation and restored all four qubits to |0⟩.',
      },
    ],
  },
  'session-5': {
    "sessionId": "session-5",
    "title": "Session 5 Concept Check: Quantum Machine Learning (QML, QA-PIN & PyTorch QNNs)",
    "passingScore": 75,
    "questions": [
      {
        "id": "s5-q1",
        "question": "In Jay Shah\u2019s introductory formulation of quantum machine learning, what was Richard Feynman\u2019s famous 1981 insight that initiated the field of quantum computation?",
        "options": [
          "\"Nature isn't classical, dammit, and if you want to make a simulation of nature, you'd better make it quantum mechanical!\"",
          "\"Quantum computers will replace all classical CPUs by the year 2000.\"",
          "\"Artificial intelligence requires infinite qubits to compute backpropagation.\"",
          "\"Entanglement is only an illusion created by classical measurement error.\""
        ],
        "correctIndex": 0,
        "explanation": "Richard Feynman stated in his 1981 keynote that simulating nature requires quantum mechanical computers because classical computers face an exponential simulation overhead for quantum systems."
      },
      {
        "id": "s5-q2",
        "question": "Jay Shah outlined four quantum computational modalities. Which modality relies on adiabatic evolution to find the lowest energy ground state of an Ising spin Hamiltonian?",
        "options": [
          "Continuous-Variable Quantum Computing (Photonic qumodes)",
          "Quantum Annealing (e.g., D-Wave systems)",
          "Discrete Gate-Model Quantum Computing",
          "Quantum-Inspired Classical Tensor Networks"
        ],
        "correctIndex": 1,
        "explanation": "Quantum Annealing maps optimization problems to the ground state of an Ising spin Hamiltonian and adiabatically evolves the system to find the global energy minimum."
      },
      {
        "id": "s5-q3",
        "question": "According to the taxonomy presented in the lecture, what is the precise distinction between QML (Quantum Machine Learning) and QDL (Quantum Deep Learning)?",
        "options": [
          "QML is executed on classical GPUs, whereas QDL is executed exclusively on paper",
          "QML requires 1,000+ qubits, whereas QDL only uses 2 qubits",
          "QML encompasses general hybrid algorithms like Quantum SVM and Quantum PCA, whereas QDL specifically involves deep parameterized quantum circuits (PQCs) arranged in layered neural architectures",
          "QML cannot compute gradients, whereas QDL uses classical backpropagation without parameter-shift rules"
        ],
        "correctIndex": 2,
        "explanation": "QML is the broad umbrella covering all hybrid algorithms (QSVM, Quantum Kernels, QPCA), while QDL specifically denotes deep parameterized variational circuits arranged in stacked neural network layers."
      },
      {
        "id": "s5-q4",
        "question": "In a standard Quantum Neural Network (QNN) layer pipeline, what are the three sequential operations that transform classical data into an output prediction?",
        "options": [
          "Measurement \u2192 Classical Optimizer \u2192 Feature Map",
          "Transpilation \u2192 Error Mitigation \u2192 Dilution Cooling",
          "Ansatz \u2192 Post-Selection \u2192 Parameter Shift",
          "Quantum Feature Map (Data Encoding) \u2192 Parameterized Ansatz (Trainable Unitary) \u2192 Observable Measurement (Expectation Value)"
        ],
        "correctIndex": 3,
        "explanation": "A QNN layer operates in three stages: (1) Encoding classical features into a quantum state via a Feature Map, (2) Applying trainable rotations via a Parameterized Ansatz, and (3) Measuring observable expectation values."
      },
      {
        "id": "s5-q5",
        "question": "What fundamental capability distinguishes Qiskit\u2019s ZZFeatureMap from a standard ZFeatureMap?",
        "options": [
          "ZZFeatureMap includes two-qubit entangling phase gates R_zz(2(\u03c0 - x_i)(\u03c0 - x_j)) between pairs of qubits, creating non-linear quantum correlations that cannot be efficiently simulated classically",
          "ZZFeatureMap uses half the number of qubits as ZFeatureMap",
          "ZZFeatureMap only supports single-qubit Pauli-X rotations",
          "ZZFeatureMap completely eliminates circuit depth"
        ],
        "correctIndex": 0,
        "explanation": "ZZFeatureMap applies Hadamard gates followed by single-qubit Rz rotations and two-qubit Rzz entangling phase gates parameterized by pairwise data products (\u03c0 - x_i)(\u03c0 - x_j), embedding data in an intractable non-linear Hilbert space."
      },
      {
        "id": "s5-q6",
        "question": "During the lecture, what nuanced insight did Jay Shah share regarding the debate around entanglement in quantum feature maps?",
        "options": [
          "Entanglement always guarantees exponential quantum advantage on all datasets",
          "Entanglement increases expressibility but can also lead to barren plateaus and trainability bottlenecks; sometimes unentangled feature maps generalize better for specific structured problems",
          "Entanglement cannot be simulated on classical computers under any circumstances",
          "Entanglement only occurs when using superconducting qubits, not photonic systems"
        ],
        "correctIndex": 1,
        "explanation": "Jay Shah highlighted that while entanglement expands the reachable Hilbert space volume (expressibility), excessive entanglement often induces barren plateaus where gradients vanish, so simpler unentangled maps can offer superior generalization."
      },
      {
        "id": "s5-q7",
        "question": "In Quantum Natural Language Processing (QNLP) as introduced in the session, what is the structural difference between Type 1 and Type 2 QNLP architectures?",
        "options": [
          "Type 1 operates on text, while Type 2 operates on audio signals",
          "Type 1 uses 100 qubits, while Type 2 uses 1 qubit",
          "Type 1 embeds classical NLP embeddings (word2vec) into quantum circuits, whereas Type 2 uses native compositional distributional models (DisCoCat) where grammatical structures directly map to quantum tensor networks",
          "Type 1 compiles only in Python 2, whereas Type 2 compiles in Python 3"
        ],
        "correctIndex": 2,
        "explanation": "Type 1 QNLP feeds classical vector embeddings into quantum circuits as feature vectors, whereas Type 2 QNLP (DisCoCat / lambeq) maps grammatical syntax trees directly to quantum circuit tensor networks."
      },
      {
        "id": "s5-q8",
        "question": "In Quantum Convolutional Neural Networks (QCNN), what quantum operation serves as the analog to classical pooling (downsampling)?",
        "options": [
          "Applying global Hadamard gates across all qubits",
          "Adding ancilla qubits to double the Hilbert space",
          "Transpiling with optimization level 0",
          "Measuring or tracing out a subset of qubits conditioned on two-qubit unitary operations, reducing system dimensionality"
        ],
        "correctIndex": 3,
        "explanation": "In QCNNs, quantum pooling applies two-qubit controlled gates and then measures or traces out one of the qubits, reducing the active qubit register size while preserving feature representations."
      },
      {
        "id": "s5-q9",
        "question": "In Physics-Informed Neural Networks (PINNs) and Jay Shah's QA-PIN framework, how is the total loss function constructed to train the model?",
        "options": [
          "L_total = w_data * L_data + w_pde * L_pde + w_bc * L_bc + w_ic * L_ic (combining empirical data error, differential equation residual, boundary conditions, and initial conditions)",
          "L_total = Accuracy * Qubit Count",
          "L_total is computed by minimizing classical CPU temperature",
          "L_total only penalizes the number of CNOT gates in the circuit"
        ],
        "correctIndex": 0,
        "explanation": "PINNs integrate physical governing laws into optimization by summing the residual loss of the partial differential equation (PDE), initial condition (IC) errors, boundary condition (BC) errors, and labeled data errors."
      },
      {
        "id": "s5-q10",
        "question": "In Jay Shah\u2019s Quantum-Aware Physics-Informed Neural Network (QA-PIN) formulation, by what exact formula is the number of trainable parameters in an ansatz layer reduced compared to a classical dense layer?",
        "options": [
          "Parameter reduction is always a flat 50%",
          "A classical layer of N_in x N_out weights is compressed into an ansatz with L x n parameters (where L is the number of layers and n = ceil(log2 N) is the number of qubits)",
          "Parameters scale as 2^n rather than polynomial n",
          "QA-PIN eliminates all parameters and uses zero weights"
        ],
        "correctIndex": 1,
        "explanation": "QA-PIN replaces large dense weight matrices with parameterized quantum circuit layers requiring only L x n rotation angles (where n is the number of qubits, logarithmic in feature dimension), drastically compressing model weights."
      },
      {
        "id": "s5-q11",
        "question": "In the 1D viscous Burgers' equation benchmark (\u2202u/\u2202t + u \u2202u/\u2202x = \u03bd \u2202\u00b2u/\u2202x\u00b2) presented in the QA-PIN paper, what weight reduction and performance did the quantum-aware architecture achieve?",
        "options": [
          "99% weight reduction with 50% accuracy loss",
          "0% weight reduction with identical training time",
          "Over 20% reduction in trainable parameters while maintaining comparable or superior L2 relative error against classical PINNs",
          "It required 128 physical QPUs running simultaneously"
        ],
        "correctIndex": 2,
        "explanation": "On the non-linear 1D Burgers' equation, QA-PIN achieved more than a 20% reduction in parameter count while achieving equivalent or superior L2 error convergence compared to standard classical PINNs."
      },
      {
        "id": "s5-q12",
        "question": "In the Ice Nucleation inverse problem benchmark presented by Jay Shah, what physical parameter was estimated, and what parameter compression was demonstrated?",
        "options": [
          "Speed of light in vacuum; 5% compression",
          "Gravitational constant G; 10% compression",
          "Electron charge e; 15% compression",
          "Thomson's chemical coefficient (\u03bc) governing ice crystal growth kinetics, achieved with a 32% reduction in neural network parameters"
        ],
        "correctIndex": 3,
        "explanation": "In the inverse ice nucleation study, QA-PIN successfully estimated Thomson's kinetic coefficient \u03bc while reducing total trainable neural network parameters by 32%."
      },
      {
        "id": "s5-q13",
        "question": "How does the parameter-shift rule calculate analytical gradients \u2202\u27e8O\u27e9/\u2202\u03b8_i of a parameterized quantum circuit on real hardware without numerical finite-difference errors?",
        "options": [
          "\u2202\u27e8O\u27e9/\u2202\u03b8_i = (\u27e8O\u27e9_(\u03b8_i + \u03c0/2) - \u27e8O\u27e9_(\u03b8_i - \u03c0/2)) / 2 (evaluating the circuit expectation at two shifted parameter values \u00b1 \u03c0/2)",
          "By taking the symbolic derivative of the Python bytecode",
          "By running backpropagation directly inside the dilution refrigerator",
          "By setting the learning rate to zero"
        ],
        "correctIndex": 0,
        "explanation": "The parameter-shift rule yields exact analytical gradients on physical quantum processors by executing two circuit evaluations shifted by \u00b1\u03c0/2: d\u27e8O\u27e9/d\u03b8 = [\u27e8O\u27e9(\u03b8 + \u03c0/2) - \u27e8O\u27e9(\u03b8 - \u03c0/2)] / 2."
      },
      {
        "id": "s5-q14",
        "question": "In the hands-on code demonstration, which class from qiskit_machine_learning.connectors was used to seamlessly bridge a Qiskit QNN into a standard PyTorch nn.Module?",
        "options": [
          "QiskitPyTorchBridge",
          "TorchConnector",
          "QuantumLinearLayer",
          "EstimatorTorchAdapter"
        ],
        "correctIndex": 1,
        "explanation": "Qiskit Machine Learning provides TorchConnector, which wraps an EstimatorQNN or SamplerQNN into a PyTorch-compatible module with automatic backward gradient calculation."
      },
      {
        "id": "s5-q15",
        "question": "In the PennyLane hands-on demonstration, how is a quantum circuit converted into a trainable PyTorch neural network layer?",
        "options": [
          "qml.convert_to_keras()",
          "qml.numpy.tensor()",
          "Wrapping the qml.qnode inside qml.qnn.TorchLayer(qnode, weight_shapes)",
          "By exporting the circuit to an ONNX file"
        ],
        "correctIndex": 2,
        "explanation": "PennyLane's qml.qnn.TorchLayer accepts a QNode and a dictionary of weight tensor shapes, creating a native PyTorch layer that integrates into torch.nn.Sequential pipelines."
      },
      {
        "id": "s5-q16",
        "question": "In the live classification demonstration on the make_moons non-linear dataset, why was a quantum neural network able to separate the two interleaving half-circles?",
        "options": [
          "The dataset was pre-sorted in alphabetical order",
          "Classical neural networks cannot solve 2D datasets",
          "The learning rate was set to 1.0",
          "The quantum feature map embedded the 2D non-linear coordinates into a higher-dimensional Hilbert space where the two moons became linearly separable"
        ],
        "correctIndex": 3,
        "explanation": "The quantum feature map maps 2D Cartesian coordinates non-linearly into the multi-qubit Bloch state space, allowing a linear hyperplane (ansatz + measurement) to separate non-linear decision boundaries."
      },
      {
        "id": "s5-q17",
        "question": "In Jay Shah\u2019s open-source library QRL-QAI (Quantum Reinforcement Learning for Quantum Artificial Intelligence), what custom OpenAI Gym environment was showcased?",
        "options": [
          "BlochSphere-v0 (where an agent learns optimal pulse/gate sequences to navigate a qubit state vector to a target point on the Bloch sphere)",
          "CartPole-QPU",
          "MountainCar-Quantum",
          "Atari-Qiskit"
        ],
        "correctIndex": 0,
        "explanation": "QRL-QAI features the BlochSphere-v0 environment, where reinforcement learning agents take discrete or continuous rotation actions to control single and multi-qubit states toward a target state."
      },
      {
        "id": "s5-q18",
        "question": "How does Barren Plateau phenomenon manifest mathematically in deep parameterized quantum circuits?",
        "options": [
          "The loss function increases towards infinity",
          "The variance of the gradient vanishes exponentially with the number of qubits n: Var[\u2202_\u03b8 C] \u2208 O(2^-n), flattening the training landscape",
          "The quantum circuit outputs negative probabilities",
          "The classical optimizer terminates due to memory exhaustion"
        ],
        "correctIndex": 1,
        "explanation": "McClean et al. (2018) proved that for random deep Haar-distributed parameterized quantum circuits, the gradient variance decreases exponentially with qubit count: Var[\u2202C/\u2202\u03b8] ~ O(2^-n)."
      },
      {
        "id": "s5-q19",
        "question": "What strategy was recommended during the lecture to mitigate barren plateaus in variational quantum algorithms?",
        "options": [
          "Adding 50 additional layers of random CNOT gates",
          "Using single-precision floating point numbers",
          "Using shallow circuit depths, local observables (measuring 1 or 2 qubits rather than global Z^\u2297n), and identity/pre-trained parameter initialization",
          "Replacing all Hadamard gates with Pauli-X gates"
        ],
        "correctIndex": 2,
        "explanation": "Cerezo et al. showed that local cost functions (measuring local observables rather than global operators) together with shallow architectures and identity initialization prevent gradient vanishing."
      },
      {
        "id": "s5-q20",
        "question": "What is the primary advantage of Quantum Kernel methods (such as QSVC) over Variational Quantum Classifiers (VQC) with iterative classical optimization?",
        "options": [
          "Quantum kernels run with zero execution time",
          "Quantum kernels do not require any quantum gates",
          "Quantum kernels only work on classical tabular data",
          "The optimization problem for QSVC is convex (guaranteeing a global optimum via quadratic programming without local minima or barren plateaus during training)"
        ],
        "correctIndex": 3,
        "explanation": "Because QSVC computes a kernel Gram matrix K(x_i, x_j) and solves standard convex quadratic programming, it avoids the non-convex optimization landscapes, local minima, and barren plateaus inherent to VQC training."
      }
    ]
  },
  'session-6': {
    "sessionId": "session-6",
    "title": "Session 6 Concept Check: Quantum Cyber Security, Cryptography & Hackathon Launch",
    "passingScore": 75,
    "questions": [
      {
        "id": "s6-q1",
        "question": "In the RSA key generation algorithm with distinct primes p and q, why must the public encryption exponent e be selected such that gcd(e, phi(n)) = 1?",
        "options": [
          "To ensure that a unique modular multiplicative inverse d = e^(-1) mod phi(n) exists via the Extended Euclidean Algorithm",
          "To prevent trial-division factoring algorithms from discovering p and q",
          "To guarantee that the resulting ciphertext is always strictly larger than the modulus n",
          "To eliminate quadratic search speedups achievable via Grover's algorithm"
        ],
        "correctIndex": 0,
        "explanation": "The condition gcd(e, phi(n)) = 1 is necessary and sufficient for e to have a unique modular multiplicative inverse d modulo phi(n), satisfying e * d = 1 (mod phi(n))."
      },
      {
        "id": "s6-q2",
        "question": "In the mathematical proof of RSA decryption correctness, which number-theoretic theorem directly guarantees that m^(1 + k*phi(n)) = m (mod n) for all messages m coprime to n?",
        "options": [
          "Wilson's Theorem",
          "Euler's Totient Theorem (a^phi(n) = 1 mod n)",
          "Lagrange's Four-Square Theorem",
          "Goldbach's Conjecture"
        ],
        "correctIndex": 1,
        "explanation": "Euler's Totient Theorem states that if gcd(m, n) = 1, then m^phi(n) = 1 (mod n). Therefore, m^(e*d) = m^(1 + k*phi(n)) = m * (m^phi(n))^k = m * (1)^k = m (mod n)."
      },
      {
        "id": "s6-q3",
        "question": "In the BB84 QKD protocol, if an eavesdropper (Eve) mounts an intercept-resend attack, what is the expected error rate introduced on bits where Alice and Bob used matching bases, and what is the typical QBER abort threshold?",
        "options": [
          "50% introduced error rate; abort threshold of 25%",
          "10% introduced error rate; abort threshold of 5%",
          "25% introduced error rate; abort threshold of ~11% (Shor-Preskill security bound)",
          "0% introduced error rate; abort threshold of 1%"
        ],
        "correctIndex": 2,
        "explanation": "When Eve measures in the wrong basis (50% probability) and resends to Bob, Bob has a 50% chance of measuring the incorrect bit when using Alice's basis, yielding a 25% error rate (0.5 * 0.5 = 0.25). The theoretical threshold for secret key distillation is ~11%."
      },
      {
        "id": "s6-q4",
        "question": "Compared to RSA-2048 or RSA-3072, why is Elliptic Curve Cryptography (e.g., secp256r1 / NIST P-256) widely preferred in resource-constrained classical computing environments?",
        "options": [
          "ECC is mathematically proven to be completely immune to Shor's quantum algorithm",
          "ECC does not require modular arithmetic or field operations",
          "ECC private keys can be derived directly from public keys without discrete log calculations",
          "ECC provides equivalent cryptographic security (128 bits) with dramatically smaller key sizes (256 bits vs 3072 bits), reducing memory footprint and network overhead"
        ],
        "correctIndex": 3,
        "explanation": "Because solving the ECDLP on generic curves requires O(sqrt(q)) operations via Pollard's rho algorithm (compared to subexponential GNFS for RSA), a 256-bit elliptic curve key matches the security of a 3072-bit RSA key, vastly improving bandwidth and computational efficiency."
      },
      {
        "id": "s6-q5",
        "question": "In public-key cryptography, what mathematically characterizes a 'trapdoor one-way function'?",
        "options": [
          "A function that is computationally easy to evaluate in the forward direction, but computationally infeasible to invert unless auxiliary private information (the trapdoor) is known",
          "A hash function that maps arbitrary-length inputs to fixed-length bitstrings with zero mathematical probability of collisions",
          "A symmetric block cipher where the encryption key and decryption key are identical and derived via linear feedback shift registers",
          "A reversible quantum logic gate that collapses its superposition state whenever non-orthogonal measurements are executed"
        ],
        "correctIndex": 0,
        "explanation": "A trapdoor one-way function can be computed in polynomial time in the forward direction by anyone with the public key, but cannot be inverted in polynomial time unless the private trapdoor information is available."
      },
      {
        "id": "s6-q6",
        "question": "How is the Chinese Remainder Theorem (CRT) typically applied to optimize RSA private key decryption operations?",
        "options": [
          "It eliminates the necessity of generating large prime numbers p and q",
          "It allows decryption exponentiations to be computed modulo p and modulo q independently, accelerating private key computation by approximately 4x",
          "It enables the public modulus n to be kept confidential from eavesdroppers",
          "It prevents quantum computers from using phase estimation on the ciphertext"
        ],
        "correctIndex": 1,
        "explanation": "By computing m_p = c^(d mod p-1) mod p and m_q = c^(d mod q-1) mod q and recombining via CRT, the bit lengths of the operands are halved, speeding up modular exponentiation by roughly a factor of 4."
      },
      {
        "id": "s6-q7",
        "question": "Under the NIST Post-Quantum Cryptography standards (FIPS 203 and FIPS 204), which underlying mathematical family forms the foundation of both ML-KEM (CRYSTALS-Kyber) and ML-DSA (CRYSTALS-Dilithium)?",
        "options": [
          "Supersingular elliptic curve isogenies (SIKE)",
          "Multivariate quadratic polynomial systems (Rainbow)",
          "Structured Euclidean lattices (Module Learning With Errors / M-LWE and Module Short Integer Solution / M-SIS)",
          "Error-correcting Goppa codes (Classic McEliece)"
        ],
        "correctIndex": 2,
        "explanation": "Both ML-KEM (FIPS 203) and ML-DSA (FIPS 204) are lattice-based cryptographic algorithms built upon hardness problems over module lattices, specifically Module-LWE and Module-SIS."
      },
      {
        "id": "s6-q8",
        "question": "In the modular arithmetic demonstration presented in the lecture with modulus n = 15 and base a = 7, what is the order (period) r such that 7^r = 1 (mod 15)?",
        "options": [
          "r = 1 (7^1 = 7 mod 15)",
          "r = 2 (7^2 = 49 = 4 mod 15)",
          "r = 3 (7^3 = 343 = 13 mod 15)",
          "r = 4 (7^4 = 2401 = 160 * 15 + 1 = 1 mod 15)"
        ],
        "correctIndex": 3,
        "explanation": "Computing powers of 7 modulo 15: 7^1 = 7, 7^2 = 49 = 4, 7^3 = 28 = 13, 7^4 = 91 = 1 (mod 15). The smallest positive integer r where 7^r = 1 (mod 15) is r = 4."
      },
      {
        "id": "s6-q9",
        "question": "In the Diffie-Hellman key exchange over a finite cyclic group G of prime order q generated by g, which computational problem prevents an eavesdropper from computing the shared secret g^(ab) from public values g^a and g^b?",
        "options": [
          "The Computational Diffie-Hellman (CDH) problem and the Discrete Logarithm Problem (DLP)",
          "The Integer Factorization Problem of composite modulus n = pq",
          "The Shortest Vector Problem (SVP) in high-dimensional Euclidean lattices",
          "The NP-completeness of evaluating modular exponentiation with repeated squaring"
        ],
        "correctIndex": 0,
        "explanation": "Diffie-Hellman security relies on the Computational Diffie-Hellman (CDH) problem and the hardness of the Discrete Logarithm Problem (DLP) in the cyclic group, where finding a from g^a is computationally infeasible."
      },
      {
        "id": "s6-q10",
        "question": "In Elliptic Curve Cryptography (ECC), an elliptic curve over a finite field F_p (p > 3) is given in short Weierstrass form as y^2 = x^3 + ax + b. What condition must coefficients a and b satisfy to ensure the curve is non-singular?",
        "options": [
          "a^2 + b^2 != 0",
          "4a^3 + 27b^2 != 0",
          "a + b = 1 mod p",
          "gcd(a, b) = 1"
        ],
        "correctIndex": 1,
        "explanation": "The discriminant of the cubic x^3 + ax + b is proportional to Delta = -16(4a^3 + 27b^2). The condition 4a^3 + 27b^2 != 0 guarantees that the polynomial has no repeated roots, ensuring the curve contains no self-intersections or cusps."
      },
      {
        "id": "s6-q11",
        "question": "Which standardized NIST Post-Quantum digital signature scheme (FIPS 205) does NOT rely on lattice assumptions, but instead derives its security strictly from the collision and preimage resistance of cryptographic hash functions?",
        "options": [
          "ML-DSA (CRYSTALS-Dilithium)",
          "FN-DSA (Falcon)",
          "SLH-DSA (SPHINCS+)",
          "LMS (Leighton-Micali Signatures)"
        ],
        "correctIndex": 2,
        "explanation": "SLH-DSA (FIPS 205, based on SPHINCS+) is a stateless hash-based digital signature scheme whose security relies entirely on the established cryptographic security properties of underlying hash functions (e.g., SHA-256 or SHAKE-256)."
      },
      {
        "id": "s6-q12",
        "question": "According to national cybersecurity roadmaps (e.g., NSA CNSA 2.0 guidelines), what deployment strategy is recommended during the transition period before legacy classical cryptography is fully retired?",
        "options": [
          "Abandoning public-key cryptography and relying exclusively on physical air-gapping",
          "Restricting all consumer network communications exclusively to satellite-based QKD links",
          "Replacing all digital signature verification with pre-shared one-time pads",
          "Implementing hybrid cryptosystems that combine classical algorithms (e.g., ECDH/RSA) with post-quantum algorithms (e.g., ML-KEM) so that communications remain protected if either scheme holds"
        ],
        "correctIndex": 3,
        "explanation": "CNSA 2.0 and NIST recommend hybrid key exchange mechanisms combining an established classical algorithm with an approved post-quantum algorithm (e.g., X25519 + ML-KEM-768). This defends against future quantum decryption while safeguarding against unforeseen vulnerabilities in newly standardized PQC schemes."
      },
      {
        "id": "s6-q13",
        "question": "How does Shor's quantum algorithm achieve an exponential speedup over classical algorithms when solving integer factorization and discrete logarithms?",
        "options": [
          "By mapping the problem to period finding of a modular function and evaluating the period in polynomial time O((log n)^3) using the Quantum Fourier Transform (QFT)",
          "By evaluating all candidate factors in parallel via unstructured database search in O(sqrt(N)) oracle queries",
          "By cloning the quantum superposition of private keys to circumvent the classical bit-length constraint",
          "By replacing modular arithmetic operations with linear quantum teleportation circuits"
        ],
        "correctIndex": 0,
        "explanation": "Shor's algorithm reduces integer factorization to order (period) finding of f(x) = a^x mod N. The Quantum Fourier Transform extracts this global period in polynomial time O((log n)^3), delivering an exponential speedup over the best classical algorithms."
      },
      {
        "id": "s6-q14",
        "question": "In the BB84 Quantum Key Distribution protocol, Alice prepares single photons by encoding bit values randomly across which two mutually unbiased conjugate polarization bases?",
        "options": [
          "Circular basis {|L>, |R>} and Elliptical basis {|E1>, |E2>}",
          "Rectilinear basis (+ with 0 deg, 90 deg) and Diagonal basis (x with 45 deg, 135 deg)",
          "Bell entangled state basis and GHZ tripartite basis",
          "Longitudinal spin basis and Transverse orbital angular momentum basis"
        ],
        "correctIndex": 1,
        "explanation": "BB84 uses two conjugate, non-orthogonal polarization bases: the rectilinear basis (+) with orthogonal states |0 deg> and |90 deg>, and the diagonal basis (x) with orthogonal states |45 deg> and |135 deg>."
      },
      {
        "id": "s6-q15",
        "question": "In the Abelian group formed by the points on an elliptic curve E(F_p), what serves as the group identity element?",
        "options": [
          "The origin coordinate (0, 0)",
          "The point (1, 1)",
          "The point at infinity O (ideal point in projective coordinates)",
          "The curve inflection coordinate (a, b)"
        ],
        "correctIndex": 2,
        "explanation": "The identity element of an elliptic curve group is the point at infinity O. For any curve point P, P + O = P, and P + (-P) = O, where -P is the reflection of P across the x-axis."
      },
      {
        "id": "s6-q16",
        "question": "In the lecturer's detailed RSA key generation example with prime factors p = 11 and q = 13, what are the values of the modulus n and the totient phi(n)?",
        "options": [
          "n = 120 and phi(n) = 143",
          "n = 143 and phi(n) = 142",
          "n = 130 and phi(n) = 110",
          "n = 143 and phi(n) = 120"
        ],
        "correctIndex": 3,
        "explanation": "The modulus is n = p * q = 11 * 13 = 143. The Euler totient is phi(n) = (p - 1) * (q - 1) = (11 - 1) * (13 - 1) = 10 * 12 = 120."
      },
      {
        "id": "s6-q17",
        "question": "What is the primary impact of Grover's quantum search algorithm on symmetric ciphers (e.g., AES), and what is the standard countermeasure?",
        "options": [
          "It provides a quadratic speedup reducing effective key security from k bits to k/2 bits; the countermeasure is doubling key sizes from AES-128 to AES-256",
          "It provides an exponential speedup completely breaking all symmetric ciphers; the countermeasure is replacing AES with asymmetric lattice cryptography",
          "It identifies modular inverses in polynomial time; the countermeasure is replacing block ciphers with stream ciphers",
          "It passively reconstructs secret keys from ciphertext; the countermeasure is implementing optical QKD links"
        ],
        "correctIndex": 0,
        "explanation": "Grover's algorithm searches unstructured spaces of size 2^k in O(2^(k/2)) operations, halving effective symmetric security. Doubling key lengths (e.g., moving from AES-128 to AES-256) preserves 128 bits of post-quantum security."
      },
      {
        "id": "s6-q18",
        "question": "Which fundamental quantum principle ensures that an eavesdropper (Eve) cannot duplicate intercepted flying qubits in a QKD transmission without creating detectable errors?",
        "options": [
          "The Quantum Zeno Effect",
          "The No-Cloning Theorem",
          "The Pauli Exclusion Principle",
          "The Adiabatic Quantum Theorem"
        ],
        "correctIndex": 1,
        "explanation": "The No-Cloning Theorem proves that an arbitrary unknown quantum state cannot be copied perfectly. Any attempt by Eve to measure and duplicate the photon disturbs its quantum state, introducing detectable errors in Bob's measurements."
      },
      {
        "id": "s6-q19",
        "question": "Using Fermat's Little Theorem, what is the exact value of 3^6 mod 7?",
        "options": [
          "3",
          "6",
          "1",
          "0"
        ],
        "correctIndex": 2,
        "explanation": "Since 7 is a prime and gcd(3, 7) = 1, Fermat's Little Theorem states a^(p-1) = 1 (mod p). Here p = 7, so 3^(7-1) = 3^6 = 729 = (104 * 7) + 1 = 1 (mod 7)."
      },
      {
        "id": "s6-q20",
        "question": "In Shor's algorithm, once an even period r is determined such that a^r = 1 (mod N) and a^(r/2) != -1 (mod N), how are non-trivial factors of composite integer N extracted?",
        "options": [
          "By calculating the modular quotient (a^r - 1) / N",
          "By evaluating the discrete logarithm log_a(N) over field F_N",
          "By executing Grover search over the interval [1, r]",
          "By computing greatest common divisors gcd(a^(r/2) - 1, N) and gcd(a^(r/2) + 1, N) via Euclid's algorithm"
        ],
        "correctIndex": 3,
        "explanation": "Since a^r - 1 = (a^(r/2) - 1)(a^(r/2) + 1) = 0 (mod N), N divides (a^(r/2) - 1)(a^(r/2) + 1). As long as a^(r/2) != +-1 (mod N), computing gcd(a^(r/2) - 1, N) and gcd(a^(r/2) + 1, N) using the classical Euclidean algorithm yields non-trivial factors of N."
      }
    ]
  },
};
