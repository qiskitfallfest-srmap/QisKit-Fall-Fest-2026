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
    title: 'Session 3 Concept Check: Qubit Connectivity & Architecture',
    passingScore: 75,
    questions: [
      {
        id: 's3-q1',
        question:
          'Why does a 1D linear nearest-neighbor architecture incur high SWAP overhead for long-range two-qubit interactions?',
        options: [
          'Because linear processors do not support single-qubit gates',
          'Two-qubit gates can only execute between adjacent physical qubits, requiring O(N) SWAP gates to bring distant qubits together',
          'Linear processors have 0% gate fidelity',
          'The transpiler disables optimization on linear chains',
        ],
        correctIndex: 1,
        explanation:
          'In a linear chain, physical connectivity is strictly degree-2. Interacting non-adjacent qubits requires inserting sequences of SWAP gates, inflating two-qubit gate count and circuit depth.',
      },
      {
        id: 's3-q2',
        question:
          'What key advantage does the heavy-hex lattice topology offer in superconducting quantum systems compared to high-degree square lattices?',
        options: [
          'It completely eliminates all two-qubit gate errors',
          'It reduces frequency collisions and parasitic crosstalk by limiting vertex degree to 2 and 3',
          'It guarantees zero SWAP insertions for arbitrary graphs',
          'It allows infinite coherence times (T1 = ∞)',
        ],
        correctIndex: 1,
        explanation:
          'Heavy-hex topology limits connectivity to degree-2 and degree-3 vertices, which substantially suppresses parasitic ZZ crosstalk and microwave frequency collisions across multi-qubit chips.',
      },
      {
        id: 's3-q3',
        question:
          'How many native CNOT (CX) gates are typically required to implement a single SWAP gate on superconducting architectures?',
        options: ['1 CX gate', '2 CX gates', '3 CX gates', '4 CX gates'],
        correctIndex: 2,
        explanation:
          'A SWAP gate decomposes into 3 alternating CNOT gates (CX_01, CX_10, CX_01), tripling the two-qubit gate error penalty for every routing step.',
      },
      {
        id: 's3-q4',
        question:
          'Which Qiskit transpiler routing algorithm uses a heuristic look-ahead mechanism to minimize SWAP insertions?',
        options: ['TrivialRouting', 'SabreSwap', 'LinearSweep', 'UnitarySynthesis'],
        correctIndex: 1,
        explanation:
          'SabreSwap (SWAP-based Bounded-depth Heuristic) evaluates a look-ahead window of future circuit gates to choose routing SWAPs that minimize overall circuit depth.',
      },
      {
        id: 's3-q5',
        question: 'What is the primary role of the PassManager in Qiskit?',
        options: [
          'To execute the final circuit on cloud hardware',
          'To authenticate the user’s IBM Quantum credentials',
          'To define a custom sequence of transpilation passes for circuit optimization and hardware routing',
          'To manage quantum state vectors in memory',
        ],
        correctIndex: 2,
        explanation: 'The PassManager orchestrates a pipeline of transpiler passes (like layout, routing, translation, and optimization) to tailor a logical circuit to a specific backend topology.',
      },
      {
        id: 's3-q6',
        question: 'Which of these best describes T1 relaxation time in superconducting qubits?',
        options: [
          'The time it takes for a qubit to lose its phase coherence without losing energy',
          'The characteristic time for a qubit in the excited |1⟩ state to decay to the ground |0⟩ state via energy loss',
          'The execution time of a single CNOT gate',
          'The time taken to cool the cryostat',
        ],
        correctIndex: 1,
        explanation: 'T1 (longitudinal relaxation time) measures amplitude damping—the time scale over which a qubit loses energy to its environment and decays from |1⟩ to |0⟩.',
      }
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
          'What fundamental precision limit scales as 1/√N with N photons/particles, known as the Standard Quantum Limit (SQL)?',
        options: [
          'The Heisenberg limit',
          'The Shot-noise limit',
          'The Planck limit',
          'The Nyquist rate',
        ],
        correctIndex: 1,
        explanation:
          'Classical and uncorrelated quantum measurements are bounded by the shot-noise limit scaling as 1/√N. Entangled quantum states (e.g. squeezed or NOON states) can surpass this up to the Heisenberg limit (1/N).',
      },
      {
        id: 's4-q2',
        question:
          'Why are Nitrogen-Vacancy (NV) centers in diamond exceptionally well-suited for nanoscale quantum sensing?',
        options: [
          'They cannot sense magnetic fields',
          'They possess optically addressable electronic spin states with long coherence times even at room temperature',
          'They can only operate at absolute zero (0 Kelvin)',
          'They emit classical radio frequencies only',
        ],
        correctIndex: 1,
        explanation:
          'NV centers in diamond have atomic-scale spatial resolution and long spin coherence times ($T_2$) at ambient room temperature, allowing optical spin initialization and readout (ODMR) for magnetic and thermal sensing.',
      },
      {
        id: 's4-q3',
        question:
          'In quantum phase estimation for optical sensing, how does entanglement improve phase uncertainty Δφ?',
        options: [
          'By scaling Δφ down to O(1/N) (Heisenberg scaling)',
          'By increasing the circuit error rate',
          'By converting phase into classical heat',
          'It provides no improvement over classical methods',
        ],
        correctIndex: 0,
        explanation:
          'Using entangled N-particle states (like NOON states (|N,0⟩ + |0,N⟩)/√2), the phase sensitivity scales with the ultimate physical bound: Δφ ~ 1/N, an N-fold precision improvement over independent particles.',
      },
      {
        id: 's4-q4',
        question:
          'What technique is commonly used to optically initialize and read out NV center spin states?',
        options: [
          'Optically Detected Magnetic Resonance (ODMR)',
          'Classical Fourier Transform',
          'Cathode Ray Emission',
          'Gas Chromatography',
        ],
        correctIndex: 0,
        explanation:
          'Optically Detected Magnetic Resonance (ODMR) uses green laser excitation (532 nm) and microwave frequency sweeps to detect fluorescence changes between ms=0 and ms=±1 spin states.',
      },
      {
        id: 's4-q5',
        question: 'What is the Standard Quantum Limit (SQL) for phase estimation when using N independent, unentangled particles?',
        options: [
          'Δφ ~ 1/N',
          'Δφ ~ 1/N²',
          'Δφ ~ 1/√N',
          'Δφ ~ e^(-N)',
        ],
        correctIndex: 2,
        explanation: 'Without entanglement, N independent probes provide a statistical precision scaling of 1/√N (the shot-noise limit or SQL), as dictated by classical probability.',
      },
      {
        id: 's4-q6',
        question: 'Which technique is used in Ramsey interferometry to measure small static magnetic fields?',
        options: [
          'Mapping the accumulated quantum phase (acquired over time t) into measurable population differences',
          'Measuring the physical temperature change of the diamond',
          'Using a classical hall-effect sensor',
          'Executing Shor’s algorithm',
        ],
        correctIndex: 0,
        explanation: 'In a Ramsey sequence (π/2 - wait - π/2), the qubit accumulates a relative phase proportional to the magnetic field during the free precession time, which the second π/2 pulse converts into a measurable Z-basis probability.',
      }
    ],
  },
  'session-5': {
    sessionId: 'session-5',
    title: 'Session 5 Concept Check: Quantum Machine Learning',
    passingScore: 75,
    questions: [
      {
        id: 's5-q1',
        question:
          'What is the primary role of a quantum feature map (such as ZZFeatureMap) in quantum classification?',
        options: [
          'To compress the dataset into a single bit',
          'To non-linearly embed classical feature vectors into high-dimensional quantum Hilbert space states |Φ(x)⟩',
          'To eliminate the need for classical data preprocessing',
          'To convert quantum circuits into convolutional neural networks',
        ],
        correctIndex: 1,
        explanation:
          'A quantum feature map applies unitary transformations parameterized by input data $x$, projecting classical inputs non-linearly into high-dimensional Hilbert space where complex patterns become linearly separable.',
      },
      {
        id: 's5-q2',
        question:
          'What phenomenon causes the variance of gradients in random deep parameterized quantum circuits to vanish exponentially with the number of qubits?',
        options: [
          'Overfitting',
          'Barren plateaus',
          'Exploding gradients',
          'Aliasing',
        ],
        correctIndex: 1,
        explanation:
          'Barren plateaus occur when the gradients of cost functions vanish exponentially in $N$ ($Var[∂C/∂θ] ~ O(2^{-N})$), making gradient-based training impossible without local cost functions or structured initializations.',
      },
      {
        id: 's5-q3',
        question:
          'In a Quantum Support Vector Classifier (QSVC), how is the quantum kernel matrix element K(x_i, x_j) computed?',
        options: [
          'By taking the classical dot product x_i · x_j',
          'By evaluating the fidelity overlap |⟨Φ(x_i)|Φ(x_j)⟩|² using a quantum circuit',
          'By training a deep neural network on a GPU',
          'By counting the number of CNOT gates in the circuit',
        ],
        correctIndex: 1,
        explanation:
          'The quantum kernel evaluates the transition probability / fidelity between quantum feature states: $K(x_i, x_j) = |⟨0|U^†(x_j) U(x_i)|0⟩|² = |⟨Φ(x_j)|Φ(x_i)⟩|²$.',
      },
      {
        id: 's5-q4',
        question:
          'How does hardware connectivity affect the evaluation of ZZFeatureMap entangling blocks?',
        options: [
          'Coupling topology has no effect on two-qubit gates',
          'Non-adjacent qubit entanglers require SWAP routing passes that increase circuit depth and introduce noise into kernel evaluations',
          'It speeds up execution linearly',
          'It automatically cures barren plateaus',
        ],
        correctIndex: 1,
        explanation:
          'The entangling layer of ZZFeatureMaps includes RZZ interactions. On constrained topologies (like linear or heavy-hex), non-local RZZ terms require SWAP routing, inflating depth and fidelity errors.',
      },
      {
        id: 's5-q5',
        question: 'What is the role of the parameterized ansatz in a Variational Quantum Classifier (VQC)?',
        options: [
          'To act as a fixed random feature map',
          'To apply trainable rotation and entanglement gates whose parameters are optimized to separate classes',
          'To permanently store the training dataset',
          'To execute Shor’s algorithm',
        ],
        correctIndex: 1,
        explanation: 'The ansatz serves as the trainable part of the model (akin to neural network weights). The classical optimizer iteratively updates its rotation angles to minimize the classification loss.',
      },
      {
        id: 's5-q6',
        question: 'How does a Quantum Support Vector Machine (QSVM) utilize a quantum computer?',
        options: [
          'By training the classical SVM weights entirely on quantum hardware',
          'By using a quantum circuit to compute the inner product (kernel) between data points mapped to a quantum Hilbert space',
          'By replacing the classical CPU with a QPU for all OS tasks',
          'By using Grover’s algorithm to search for the best hyperparameter',
        ],
        correctIndex: 1,
        explanation: 'A QSVM delegates only the kernel matrix evaluation K(x_i, x_j) to the quantum computer, passing the resulting matrix back to a standard classical SVM optimizer.',
      }
    ],
  },
  'session-6': {
    sessionId: 'session-6',
    title: 'Session 6 Concept Check: Quantum Cyber Security / Cryptography',
    passingScore: 75,
    questions: [
      {
        id: 's6-q1',
        question:
          'Which mathematical problem underlying RSA encryption does Shor’s algorithm solve in polynomial time on a fault-tolerant quantum computer?',
        options: [
          'Integer factorization via quantum order finding',
          'Symmetric block cipher substitution',
          'SHA-256 hash collision generation',
          'Graph coloring',
        ],
        correctIndex: 0,
        explanation:
          'Shor’s algorithm computes the period $r$ of $a^x \\pmod N$ in $O((\\log N)^3)$ time using the Quantum Fourier Transform (QFT), efficiently breaking RSA integer factorization.',
      },
      {
        id: 's6-q2',
        question:
          'What is the primary architectural bottleneck when compiling Shor’s modular arithmetic on physical hardware?',
        options: [
          'Lack of single-qubit Pauli-X gates',
          'Deep reversible carry chains in modular addition and exponentiation requiring long routing SWAP sequences',
          'Classical computers cannot compile Python code',
          'Qiskit does not support modular math',
        ],
        correctIndex: 1,
        explanation:
          'Reversible modular addition and multiplication circuits require sequential carry propagation chains across all bits, creating tight dependencies and massive SWAP overhead on constrained planar topologies.',
      },
      {
        id: 's6-q3',
        question:
          'Which post-quantum cryptographic algorithm was standardized by NIST in 2024 as FIPS 203 for general key encapsulation (ML-KEM)?',
        options: ['CRYSTALS-Kyber', 'RSA-4096', 'ECDSA P-384', 'DES'],
        correctIndex: 0,
        explanation:
          'NIST standardized CRYSTALS-Kyber as ML-KEM (Module-Lattice Key Encapsulation Mechanism) in FIPS 203 as the premier post-quantum key establishment standard.',
      },
      {
        id: 's6-q4',
        question:
          'By what factor does Grover’s algorithm speed up brute-force attacks against symmetric encryption (AES-256)?',
        options: [
          'Exponential speedup (solves in seconds)',
          'Quadratic speedup (reducing 256-bit effective security to 128-bit)',
          'Polynomial speedup of degree 10',
          'No speedup whatsoever',
        ],
        correctIndex: 1,
        explanation:
          'Grover’s quantum search provides a quadratic speedup ($O(\\sqrt{N})$), effectively halving the key length security level (e.g. AES-256 offers 128 bits of quantum security).',
      },
      {
        id: 's6-q5',
        question: 'What principle guarantees the security of Quantum Key Distribution (QKD) protocols like BB84?',
        options: [
          'The computational difficulty of factoring large primes',
          'The no-cloning theorem and the fact that measurement disturbs a quantum state, revealing any eavesdropper',
          'The speed of light',
          'Symmetric block encryption',
        ],
        correctIndex: 1,
        explanation: 'Unlike classical cryptography which relies on unproven mathematical hardness, QKD relies on quantum physics: an eavesdropper cannot copy unknown quantum states (no-cloning) and intercepting them introduces detectable errors.',
      },
      {
        id: 's6-q6',
        question: 'Which approach to post-quantum cryptography is based on the difficulty of finding the shortest vector in a high-dimensional grid?',
        options: [
          'Isogeny-based cryptography',
          'Hash-based signatures',
          'Lattice-based cryptography',
          'Multivariate polynomials',
        ],
        correctIndex: 2,
        explanation: 'Lattice-based cryptography (including NIST winners like CRYSTALS-Kyber/Dilithium) relies on the Shortest Vector Problem (SVP) and Learning With Errors (LWE), which are believed to be hard even for quantum computers.',
      }
    ],
  },
};
