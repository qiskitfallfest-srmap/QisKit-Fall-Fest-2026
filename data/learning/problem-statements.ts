import { ProblemStatement, VerticalType } from './types';

export const PROBLEM_STATEMENTS: ProblemStatement[] = [
  // ----------------------------------------------------
  // VERTICAL 1: QUANTUM CHEMISTRY
  // ----------------------------------------------------
  {
    id: 'PS-C1',
    vertical: 'Quantum Chemistry',
    title: 'PS-C1: H₂ Ground-State Energy Estimation',
    subtitle: 'Variational Quantum Eigensolver in Minimal STO-3G Basis',
    description:
      'This problem introduces quantum chemistry through the task of estimating the ground-state energy of the H₂ molecule. Teams will formulate the molecular problem for a quantum computer and use a variational quantum approach such as VQE to search for a low-energy state. The challenge is not simply to obtain a number, but to understand how the quantum circuit represents the chemistry problem and how accurately it reproduces a reference result. Participants will also examine the cost of their circuit on different processor architectures. The problem provides a focused entry point into quantum simulation, chemistry, and hardware-aware algorithm design.',
    objective:
      'Compute the electronic ground-state energy of the hydrogen molecule (H2) at equilibrium bond distance (R = 0.735 Å) using the Variational Quantum Eigensolver (VQE). Measure how transpilation onto constrained topologies inflates circuit depth and degrades convergence.',
    mathematicalFormulation:
      'Second-quantized electronic Hamiltonian H = ∑_{pq} h_{pq} a^†_p a_q + 1/2 ∑_{pqrs} g_{pqrs} a^†_p a^†_r a_s a_q mapped via Jordan-Wigner transformation to a 4-qubit Pauli operator H = c_0 I + ∑ c_i Z_i + ∑ c_{ij} Z_i Z_j + ∑ c_{ijkl} X_i X_j Y_k Y_l.',
    quantumFormulation:
      'Construct a parameterized trial state |ψ(θ)⟩ using the Unitary Coupled Cluster Singles and Doubles (UCCSD) or RealAmplitudes ansatz. Evaluate expectation values ⟨ψ(θ)|H|ψ(θ)⟩ using Qiskit EstimatorV2. Optimize parameters θ with COBYLA / SPSA.',
    hardwareSpecs: {
      processorA: 'Processor A (5-Qubit Linear Chain): Evaluates routing penalty where qubit 0 and 3 cannot interact directly without intermediate SWAPs.',
      processorB: 'Processor B (7-Qubit Heavy-Hex): Evaluates unit cell routing with degree-2/3 constraints.',
      processorC: 'Processor C (8–10 Qubit Experimental Graph): Custom non-planar embedding.',
    },
    processorDTask:
      'Design a custom 12-qubit Processor D coupling map (`processor_D.json`) that provides direct coupling edges for the dominant two-electron excitation terms in the H2 Hamiltonian, minimizing SWAP overhead to zero for minimal basis chemistry.',
    deliverables: [
      'Complete Jupyter notebook implementing VQE with Qiskit 1.2+ and EstimatorV2.',
      'Convergence plot showing energy versus iteration compared against FCI (Full Configuration Interaction) exact ground energy (-1.1373 Hartree).',
      'Benchmark comparison table across Processors A, B, and C (CX gate count, circuit depth, and SWAP penalty).',
      'Processor D coupling map JSON (`processor_D.json`) and engineering justification document.',
    ],
    evaluationRubric: {
      componentA: 'Mathematical formulation, Pauli operator decomposition, and VQE convergence accuracy within chemical accuracy (1.6 mHartree) (40 Points).',
      componentB: 'Rigorous empirical transpilation metrics across Processors A, B, and C with SWAP insertion analysis (30 Points).',
      componentC: 'Custom 12-qubit Processor D design validity, reduction in CX count/depth, and technical rationale (30 Points).',
    },
  },
  {
    id: 'PS-C2',
    vertical: 'Quantum Chemistry',
    title: 'PS-C2: Diatomic Potential Energy Curve Scanning',
    subtitle: 'Full Dissociation Curve of H₂ or LiH Across Bond Distances',
    description:
      'Instead of studying a molecule at only one geometry, this problem asks teams to investigate how the energy of a diatomic molecule changes as its bond length is varied. Participants build a quantum workflow that repeatedly solves the molecular problem for different geometries and uses those results to construct a potential-energy curve. The task therefore combines parameter scanning, variational optimization, and interpretation of molecular behaviour. Teams should examine whether the quantum method remains reliable across the different configurations. The challenge also highlights how circuit depth, connectivity, and hardware-related effects can influence the quality of the calculated curve.',
    objective:
      'Map the complete potential energy surface (PES) for the dissociation of H2 (or LiH) across internuclear distances from 0.5 Å to 2.5 Å in increments of 0.1 Å. Characterize where classical Hartree-Fock breaks down and how quantum circuit depth scales along the curve.',
    mathematicalFormulation:
      'Compute the ground-state energy E(R) as a parametric function of nuclear separation distance R, incorporating nuclear repulsion energy V_{nn}(R) = Z_A Z_B / R.',
    quantumFormulation:
      'Formulate active space orbital selection using Qiskit Nature. Apply two-qubit reduction (parity mapping + Z2 symmetry tapering) to compress the representation, and evaluate variational convergence across all points.',
    hardwareSpecs: {
      processorA: 'Processor A (5-Qubit Linear Chain): Measures SWAP routing overhead across varying ansatz parameter profiles.',
      processorB: 'Processor B (7-Qubit Heavy-Hex): Measures transpilation stability across the full bond scan.',
      processorC: 'Processor C (8–10 Qubit Experimental Graph): Evaluates multi-qubit mapping.',
    },
    processorDTask:
      'Propose a custom 12-qubit Processor D architecture with balanced degree allocation to maintain consistent shallow depth across both equilibrium and dissociated bond geometries.',
    deliverables: [
      'Jupyter notebook executing automated bond distance loop and PES plot.',
      'Comparison against classical exact diagonalization (PySCF or classical FCI reference).',
      'Hardware benchmarking metrics across Processors A, B, and C.',
      'Custom Processor D JSON specification and architecture justification.',
    ],
    evaluationRubric: {
      componentA: 'Accuracy of the computed potential energy curve, smooth dissociation behavior, and correct identification of equilibrium bond length (40 Points).',
      componentB: 'Circuit depth and two-qubit gate analysis across bond distances on Processors A, B, and C (30 Points).',
      componentC: 'Custom Processor D topology rationale and demonstrable depth reduction (30 Points).',
    },
  },
  {
    id: 'PS-C3',
    vertical: 'Quantum Chemistry',
    title: 'PS-C3: Hardware-Efficient Water Molecule (H₂O)',
    subtitle: 'Compact Active Space & Qubit Tapering for Triatomic Systems',
    description:
      'This problem moves from the simple H₂ example toward the more demanding H₂O molecule while keeping the computation within near-term quantum resources. Teams must reduce and encode the chemistry problem appropriately and construct a hardware-efficient variational circuit. The focus is on finding a practical balance between representing the molecular system accurately and keeping the circuit executable on constrained quantum processors. Participants can investigate choices such as active-space reduction and ansatz design. The challenge demonstrates why quantum chemistry algorithms must be designed together with the limitations of the underlying hardware.',
    objective:
      'Simulate the electronic ground state of the water molecule (H2O) by applying active space reduction (freeze-core approximation) and qubit tapering to compress the fermionic space into a compact representation runnable under 8 qubits.',
    mathematicalFormulation:
      'Full STO-3G water requires 14 spin-orbitals (14 qubits). Apply frozen core approximation (freezing Oxygen 1s core electrons) and tapers out Z2 symmetries to reduce active space to 6–8 qubits.',
    quantumFormulation:
      'Implement Hardware-Efficient Ansatze (HEA) with alternating Ry and CZ layers. Compare HEA convergence against chemistry-inspired ansatze (UCCSD) under shot noise.',
    hardwareSpecs: {
      processorA: 'Processor A (5-Qubit Linear Chain): Evaluates routing constraints when active space is reduced to 4-5 qubits.',
      processorB: 'Processor B (7-Qubit Heavy-Hex): Evaluates 6-7 qubit tapered Hamiltonian execution.',
      processorC: 'Processor C (8–10 Qubit Experimental Graph): Evaluates full untapered active space baseline.',
    },
    processorDTask:
      'Design a 12-qubit Processor D layout with star or cluster interconnects tailored to the triangular geometry and multi-center electron integrals of the H2O molecule.',
    deliverables: [
      'Active space transformation and symmetry reduction script in Qiskit Nature.',
      'Convergence metrics and energy discrepancy relative to CASCI reference.',
      'Benchmarking data tables on Processors A, B, and C.',
      'Processor D coupling graph (`processor_D.json`) and engineering documentation.',
    ],
    evaluationRubric: {
      componentA: 'Soundness of active-space reduction, symmetry tapering, and VQE convergence within 5 mHartree of reference (40 Points).',
      componentB: 'Transpilation analysis comparing HEA vs UCCSD depth across Processors A, B, and C (30 Points).',
      componentC: 'Processor D architectural innovation for triatomic molecular systems (30 Points).',
    },
  },
  {
    id: 'PS-C-OPEN',
    vertical: 'Quantum Chemistry',
    title: 'Open Innovation: Quantum Molecular Science',
    subtitle: 'Novel Proposals in Excited States, Reaction Barriers, or Solvation',
    description:
      'Design your own quantum-chemistry problem that can be investigated at a realistic small scale. Possible directions include studying another molecule, an excited state, or a different molecular property. The important part is to define a meaningful scientific question and explain what quantity your quantum computation is intended to estimate or predict. Your approach should make clear why a quantum formulation is interesting for the selected problem and how you would evaluate the result. The problem should remain concrete and reproducible rather than being only a broad research proposal.',
    objective:
      'Design and validate a novel quantum computational chemistry pipeline targeting excited electronic states (Variational Quantum Deflation - VQD), transition state barriers, or solvated molecular systems.',
    mathematicalFormulation:
      'Clearly specify the molecular system, basis set, second-quantized Hamiltonian, and mathematical formalism for the target chemical property.',
    quantumFormulation:
      'Formulate and execute quantum algorithms using Qiskit 1.2+ SDK, incorporating error mitigation or specialized ansatz structures.',
    hardwareSpecs: {
      processorA: 'Benchmark solution on Processor A (5-qubit linear).',
      processorB: 'Benchmark solution on Processor B (7-qubit heavy-hex).',
      processorC: 'Benchmark solution on Processor C (8–10 qubit experimental graph).',
    },
    processorDTask:
      'Propose a custom 12-qubit Processor D coupling graph specifically optimized for your custom molecular problem statement.',
    deliverables: [
      'Documented executable notebook with complete problem description and literature citations.',
      'Numerical results and classical benchmark comparisons.',
      'Transpilation data across Processors A, B, and C.',
      'Processor D JSON file and architectural justification report.',
    ],
    evaluationRubric: {
      componentA: 'Originality, scientific validity, and execution rigor of the custom chemistry proposal (40 Points).',
      componentB: 'Comprehensive hardware transpilation benchmarking across standard processors (30 Points).',
      componentC: 'Custom Processor D topology design quality and optimization metrics (30 Points).',
    },
  },

  // ----------------------------------------------------
  // VERTICAL 2: QUANTUM OPTIMIZATION
  // ----------------------------------------------------
  {
    id: 'PS-O1',
    vertical: 'Quantum Optimization',
    title: 'PS-O1: Max-Cut on Weighted Graphs',
    subtitle: 'QAOA Circuit Construction & SWAP Bottleneck Analysis',
    description:
      'Max-Cut is a standard graph-optimization problem in which the goal is to divide the vertices of a graph into two groups so that the total weight of edges crossing between the groups is maximized. Teams will formulate the problem for a quantum optimization algorithm such as QAOA and search for a high-quality cut. The challenge also asks participants to look beyond the final objective value and understand the cost of implementing the algorithm on different processor connectivities. This makes Max-Cut a useful test of both quantum optimization and algorithm–architecture co-design.',
    objective:
      'Formulate the Maximum Cut (Max-Cut) problem on a non-trivial 6-vertex weighted graph. Implement the Quantum Approximate Optimization Algorithm (QAOA) with depth p=1 and p=2, and analyze the severe SWAP routing overhead on planar vs non-planar graphs.',
    mathematicalFormulation:
      'Cost Hamiltonian H_C = ∑_{(i,j) ∈ E} w_{ij} (I - Z_i Z_j) / 2 and standard transverse mixer Hamiltonian H_M = ∑_{i=1}^n X_i.',
    quantumFormulation:
      'Alternating unitary evolution |γ, β⟩ = ∏_{k=1}^p [e^{-i β_k H_M} e^{-i γ_k H_C}] |+⟩^{\\otimes n}. Optimize (γ, β) classically using SamplerV2 to sample cut bitstrings and calculate approximation ratio α = C(x) / C_{max}.',
    hardwareSpecs: {
      processorA: 'Processor A (5-Qubit Linear Chain): Evaluates extreme SWAP penalties where non-adjacent edges must be routed sequentially.',
      processorB: 'Processor B (7-Qubit Heavy-Hex): Evaluates unit-cell mapping for 6-vertex problem graphs.',
      processorC: 'Processor C (8–10 Qubit Experimental Graph): Benchmarks higher connectivity.',
    },
    processorDTask:
      'Design a custom 12-qubit Processor D coupling map whose topology is homeomorphic to the communication graph of the problem, eliminating SWAP gates entirely for QAOA layers.',
    deliverables: [
      'QAOA implementation notebook with graph definition, circuit synthesis, and parameter optimization.',
      'Approximation ratio α curve across p=1 and p=2 layers.',
      'Transpiled circuit depth, CX counts, and SWAP penalty tables for Processors A, B, and C.',
      '`processor_D.json` coupling map and written hardware analysis.',
    ],
    evaluationRubric: {
      componentA: 'Correct QAOA circuit synthesis, cost Hamiltonian mapping, and optimization convergence to near-optimal cuts (40 Points).',
      componentB: 'Measurement of two-qubit gate explosion across Processors A, B, and C (30 Points).',
      componentC: 'Processor D graph design that directly mirrors problem connectivity to minimize depth (30 Points).',
    },
  },
  {
    id: 'PS-O2',
    vertical: 'Quantum Optimization',
    title: 'PS-O2: Constrained Portfolio Selection',
    subtitle: 'Quadratic Unconstrained Binary Optimization (QUBO) with Budget Penalties',
    description:
      'This problem translates a small investment portfolio-selection task into a quantum optimization problem. Teams must balance competing considerations such as expected return, risk, and constraints on which assets can be selected. The mathematical formulation needs to be converted into a form suitable for a quantum optimization method, such as a QUBO-based approach. Participants then evaluate how well the quantum method finds a useful portfolio compared with an appropriate reference or baseline. The challenge connects quantum optimization with a practical finance use case while exposing the difficulties of encoding real-world constraints into quantum circuits.',
    objective:
      'Formulate a multi-asset Markowitz mean-variance portfolio selection problem as a QUBO. Map asset selection and capital allocation constraints into penalty terms, and solve using QAOA.',
    mathematicalFormulation:
      'Objective: min w^T Σ w - q μ^T w + λ (∑ w_i - K)², where Σ is covariance matrix, μ is expected returns, q is risk tolerance, and λ is penalty multiplier enforcing budget constraint K.',
    quantumFormulation:
      'Convert binary asset indicator variables x_i ∈ {0, 1} to Pauli operators via x_i = (I - Z_i)/2. Synthesize all-to-all quadratic interaction terms and evaluate ground-state expectation values.',
    hardwareSpecs: {
      processorA: 'Processor A (5-Qubit Linear Chain): Measures SWAP scaling for dense covariance matrix interactions.',
      processorB: 'Processor B (7-Qubit Heavy-Hex): Evaluates sparse embedding of complete interaction graphs.',
      processorC: 'Processor C (8–10 Qubit Experimental Graph): Benchmarks higher density allocation.',
    },
    processorDTask:
      'Design a custom 12-qubit Processor D coupling map with a central hub or dense sub-graph to support dense financial covariance interaction terms.',
    deliverables: [
      'Portfolio QUBO formulation and parameter optimization notebook with real or synthetic stock asset data.',
      'Efficient frontier and Sharpe ratio comparison against classical quadratic programming solver.',
      'Detailed transpilation metrics across Processors A, B, and C.',
      'Custom Processor D JSON specification and architectural report.',
    ],
    evaluationRubric: {
      componentA: 'QUBO formulation soundness, penalty weight tuning, and valid portfolio selection (40 Points).',
      componentB: 'Comprehensive hardware routing and SWAP analysis across Processors A, B, and C (30 Points).',
      componentC: 'Processor D custom topology addressing dense all-to-all covariance terms (30 Points).',
    },
  },
  {
    id: 'PS-O3',
    vertical: 'Quantum Optimization',
    title: 'PS-O3: Combinatorial 0-1 Knapsack Problem',
    subtitle: 'Slack Variable Hamiltonian Mapping & Constraint Verification',
    description:
      'The Knapsack problem asks you to select items that provide the highest possible value while staying within a limited weight or resource budget. Although the problem is easy to state, its combinatorial nature makes it a useful benchmark for quantum optimization. Teams must formulate the objective and constraints in a form that can be handled by a quantum optimization method, including appropriate treatment of the inequality constraint. They will then examine the quality of the solution and the resources required by the resulting circuit. The challenge introduces more involved constraint encoding and penalty design than a simple unconstrained optimization problem.',
    objective:
      'Implement the NP-hard 0-1 Knapsack problem on a quantum processor using QAOA. Encode inequality capacity constraints using logarithmic slack bit decomposition and benchmark circuit compilation complexity.',
    mathematicalFormulation:
      'Maximize ∑ v_i x_i subject to ∑ w_i x_i ≤ W. Introduce integer slack variable S ∈ [0, W] represented in binary: S = ∑_{k=0}^M 2^k y_k to convert inequality into an equality constraint (∑ w_i x_i + S - W) = 0.',
    quantumFormulation:
      'Construct the penalty Hamiltonian H_P = A (∑ w_i x_i + ∑ 2^k y_k - W)² - B ∑ v_i x_i with penalty multiplier A > B. Implement QAOA circuits and analyze the large number of auxiliary slack qubits.',
    hardwareSpecs: {
      processorA: 'Processor A (5-Qubit Linear Chain): Evaluates small knapsack instances (2 items + 2 slack bits).',
      processorB: 'Processor B (7-Qubit Heavy-Hex): Evaluates 3-item knapsack instances.',
      processorC: 'Processor C (8–10 Qubit Experimental Graph): Evaluates 4-item knapsack instances.',
    },
    processorDTask:
      'Design a 12-qubit Processor D coupling map that segregates slack qubits from item decision qubits to minimize cross-register SWAP overhead.',
    deliverables: [
      'Notebook detailing knapsack Hamiltonian synthesis, slack variable expansion, and QAOA execution.',
      'Constraint violation analysis showing probability of sampling valid vs invalid weight configurations.',
      'Transpilation benchmarking tables for Processors A, B, and C.',
      'Processor D coupling map and design justification report.',
    ],
    evaluationRubric: {
      componentA: 'Mathematical formulation of slack bits, penalty Hamiltonian tuning, and knapsack solution validity (40 Points).',
      componentB: 'Transpilation and gate expansion benchmark across Processors A, B, and C (30 Points).',
      componentC: 'Processor D architectural innovation for slack-constrained combinatorial problems (30 Points).',
    },
  },
  {
    id: 'PS-O-OPEN',
    vertical: 'Quantum Optimization',
    title: 'Open Innovation: Quantum Combinatorial Optimization',
    subtitle: 'Industrial Scheduling, Vehicle Routing, or Network Flow',
    description:
      'Create your own optimization problem that can be meaningfully expressed and solved using a quantum optimization approach. Suitable directions include scheduling, routing, logistics, resource allocation, clustering, or another combinatorial problem. Your challenge should define a clear objective together with the important constraints that a valid solution must satisfy. You should then explain how the problem can be mapped into a quantum-compatible formulation such as a QUBO. The emphasis is on strong problem modelling: participants should demonstrate that the quantum formulation faithfully represents the original real-world problem.',
    objective:
      'Propose and implement a custom industrial combinatorial optimization problem (such as Job Shop Scheduling, Traveling Salesperson, Maximum Independent Set, or Traffic Routing) using QAOA or Quantum Annealing simulation.',
    mathematicalFormulation:
      'Clearly specify the graph or scheduling optimization problem, decision variables, objective cost, and constraint penalties.',
    quantumFormulation:
      'Map the problem to an Ising Hamiltonian and execute QAOA with circuit optimization using Qiskit 1.2+ SDK.',
    hardwareSpecs: {
      processorA: 'Benchmark on Processor A (5-qubit linear).',
      processorB: 'Benchmark on Processor B (7-qubit heavy-hex).',
      processorC: 'Benchmark on Processor C (8–10 qubit experimental graph).',
    },
    processorDTask:
      'Propose a custom 12-qubit Processor D coupling graph tailored specifically to your chosen optimization problem topology.',
    deliverables: [
      'Documented executable notebook with problem definition and classical baseline comparison.',
      'Transpilation data across Processors A, B, and C.',
      'Custom Processor D JSON specification and architectural report.',
    ],
    evaluationRubric: {
      componentA: 'Originality, mathematical rigor, and validity of the optimization problem formulation (40 Points).',
      componentB: 'Transpilation analysis across standard hardware processors (30 Points).',
      componentC: 'Quality of custom Processor D design and depth reduction metrics (30 Points).',
    },
  },

  // ----------------------------------------------------
  // VERTICAL 3: QUANTUM SIMULATION
  // ----------------------------------------------------
  {
    id: 'PS-S1',
    vertical: 'Quantum Simulation',
    title: 'PS-S1: Transverse-Field Ising Model (TFIM) Ground State',
    subtitle: 'Quantum Phase Transitions & Spin Correlation Observables',
    description:
      'This problem explores a fundamental many-body physics model: the transverse-field Ising chain. Teams will construct the corresponding Hamiltonian and use a quantum algorithm such as VQE to estimate properties of its ground state. The task can include quantities such as ground-state energy and magnetization, providing a way to compare the quantum calculation with an exact or classical reference for small systems. Participants will also study how the structure of the Hamiltonian maps onto the available quantum circuit. The challenge demonstrates how quantum computers can be used to represent and investigate interacting physical systems.',
    objective:
      'Simulate a 1D chain of interacting quantum spins under the Transverse-Field Ising Model. Characterize the quantum phase transition between the ferromagnetic and paramagnetic phases at critical transverse field strength.',
    mathematicalFormulation:
      'Hamiltonian H = -J ∑_{i=1}^{N-1} Z_i Z_{i+1} - h ∑_{i=1}^N X_i, where J is spin exchange coupling and h is the external transverse magnetic field.',
    quantumFormulation:
      'Synthesize variational or adiabatic ground-state preparation circuits. Measure average magnetization ⟨M_z⟩ = (1/N) ∑ ⟨Z_i⟩ and two-point spin correlation functions ⟨Z_i Z_{i+r}⟩ as a function of field ratio h/J.',
    hardwareSpecs: {
      processorA: 'Processor A (5-Qubit Linear Chain): Represents a native 1D physical match with zero SWAP overhead for nearest-neighbor terms.',
      processorB: 'Processor B (7-Qubit Heavy-Hex): Evaluates embedding a 1D chain into a 2D heavy-hex lattice.',
      processorC: 'Processor C (8–10 Qubit Experimental Graph): Evaluates higher qubit count spin simulation.',
    },
    processorDTask:
      'Design a custom 12-qubit Processor D coupling map featuring periodic boundary conditions (ring topology) or ladder connectivity to simulate closed spin chains with minimal depth.',
    deliverables: [
      'Notebook simulating TFIM ground state and plotting magnetization curve showing phase transition.',
      'Verification against exact Jordan-Wigner classical diagonalization for 1D spin chains.',
      'Transpilation metrics across Processors A, B, and C.',
      'Custom Processor D JSON file and hardware justification.',
    ],
    evaluationRubric: {
      componentA: 'Theoretical validity of the TFIM formulation, accurate phase transition detection, and correlation measurement (40 Points).',
      componentB: 'Transpilation comparison highlighting the natural advantage of linear vs heavy-hex topologies for 1D models (30 Points).',
      componentC: 'Custom Processor D ring/ladder architecture design and verification (30 Points).',
    },
  },
  {
    id: 'PS-S2',
    vertical: 'Quantum Simulation',
    title: 'PS-S2: Real-Time Non-Equilibrium Quantum Dynamics',
    subtitle: 'Trotterized Unitary Time Evolution & Dynamical Phase Transitions',
    description:
      'Rather than finding only a ground state, this problem asks teams to simulate how a quantum spin system changes over time. Participants construct a time-evolution circuit, for example using a Trotterized approximation, and track one or more physical observables as the system evolves. The challenge therefore introduces non-equilibrium quantum simulation and the practical difficulty of representing repeated time steps with finite-depth circuits. Teams should examine the trade-off between simulation accuracy and circuit cost. The effect of connectivity and additional hardware operations provides another important dimension of the problem.',
    objective:
      'Simulate the out-of-equilibrium unitary time evolution |ψ(t)⟩ = e^{-i H t} |ψ(0)⟩ following a sudden quantum quench in a spin system. Track the propagation of quantum information (entanglement light cone).',
    mathematicalFormulation:
      'Decompose the time evolution operator U(t) = e^{-i H t} into M discrete Trotter time steps Δt = t/M using the first-order Trotter-Suzuki product formula: e^{-i (H_Z + H_X) Δt} ≈ (e^{-i H_Z Δt} e^{-i H_X Δt})^M.',
    quantumFormulation:
      'Implement parameterized Rzz and Rx gate layers for each Trotter step. Measure the Loschmidt echo L(t) = |⟨ψ(0)|ψ(t)⟩|² and half-chain entanglement entropy across time.',
    hardwareSpecs: {
      processorA: 'Processor A (5-Qubit Linear Chain): Measures depth accumulation across multiple Trotter steps.',
      processorB: 'Processor B (7-Qubit Heavy-Hex): Evaluates routing overhead for extended time steps.',
      processorC: 'Processor C (8–10 Qubit Experimental Graph): Measures multi-qubit quench propagation.',
    },
    processorDTask:
      'Design a 12-qubit Processor D coupling map that minimizes the circuit depth of simultaneous two-qubit Trotter blocks through parallel edge activation.',
    deliverables: [
      'Notebook executing multi-step Trotterization and tracking time-dependent observables.',
      'Light-cone information spreading plot or Loschmidt echo verification.',
      'Transpilation comparison table for Processors A, B, and C across Trotter steps M=1..5.',
      'Processor D coupling map and technical report.',
    ],
    evaluationRubric: {
      componentA: 'Correct Trotter decomposition, stability of numerical evolution, and observable tracking (40 Points).',
      componentB: 'Detailed circuit depth scaling analysis as Trotter steps increase across Processors A, B, and C (30 Points).',
      componentC: 'Processor D parallel connectivity design minimizing depth per Trotter step (30 Points).',
    },
  },
  {
    id: 'PS-S3',
    vertical: 'Quantum Simulation',
    title: 'PS-S3: Trotter Error vs Realistic Device Noise Trade-offs',
    subtitle: 'Algorithmic Discretization Error vs Physical Decoherence',
    description:
      'This problem focuses on a central NISQ-era question: how much does hardware noise degrade a quantum simulation as the circuit becomes deeper? Teams start with a Trotterized time-evolution simulation and compare its behaviour under ideal and noisy execution. They investigate how errors accumulate as more operations and time steps are introduced and how processor connectivity can add further overhead. The goal is to understand the trade-off between a more accurate digital simulation and the noise introduced by a larger circuit. The resulting analysis should connect physical simulation accuracy with realistic hardware limitations.',
    objective:
      'Investigate the fundamental tension in quantum simulation: increasing Trotter steps reduces mathematical discretization error (O(Δt²)) but increases physical circuit depth, exposing the state to decoherence and gate noise.',
    mathematicalFormulation:
      'Analyze the bound on total simulation error: ε_{total} ≤ ε_{Trotter}(M) + ε_{hardware}(D(M)), where D(M) is the two-qubit gate depth as a function of Trotter steps M.',
    quantumFormulation:
      'Simulate unitary dynamics with both ideal statevector execution and noisy Aer simulation incorporating depolarizing and thermal relaxation noise models.',
    hardwareSpecs: {
      processorA: 'Processor A (5-Qubit Linear Chain): Evaluates sweet-spot Trotter step count under linear routing.',
      processorB: 'Processor B (7-Qubit Heavy-Hex): Evaluates noise accumulation under heavy-hex routing.',
      processorC: 'Processor C (8–10 Qubit Experimental Graph): Benchmarks higher connectivity.',
    },
    processorDTask:
      'Design a 12-qubit Processor D coupling map specifically optimized to shift the optimal Trotter step threshold to deeper circuits by reducing SWAP gate insertion.',
    deliverables: [
      'Simulation notebook with noise model configuration and observable fidelity curves.',
      'Trotter error versus hardware noise trade-off plot identifying the empirical optimal step count M*.',
      'Transpilation benchmarking tables for Processors A, B, and C.',
      'Processor D JSON file and architectural rationale.',
    ],
    evaluationRubric: {
      componentA: 'Sound mathematical treatment of Trotter error bounds and realistic noise model configuration (40 Points).',
      componentB: 'Empirical identification of optimal depth M* across Processors A, B, and C (30 Points).',
      componentC: 'Processor D architectural innovation mitigating noise accumulation (30 Points).',
    },
  },
  {
    id: 'PS-S-OPEN',
    vertical: 'Quantum Simulation',
    title: 'Open Innovation: Quantum Many-Body Simulation',
    subtitle: 'Lattice Gauge Theories, Topological Matter, or Floquet Systems',
    description:
      'Propose a small but meaningful quantum-simulation problem of your own. You could investigate a molecular system, a many-body model, a field-inspired system, or another physical process that can be represented through a suitable Hamiltonian or quantum evolution model. Clearly define the physical quantity or behaviour you want to study and the system you will simulate. Your proposal should explain how the problem can be encoded into a quantum circuit and how the result can be validated. The aim is to demonstrate both physical modelling and practical quantum-simulation design.',
    objective:
      'Formulate and execute a novel simulation of an advanced quantum physics model (such as the Fermi-Hubbard model, Kitaev honeycomb lattice, Z2 lattice gauge theory, or periodically driven Floquet systems).',
    mathematicalFormulation:
      'Provide the mathematical Hamiltonian, conservation laws, symmetry groups, and physical phenomena of interest.',
    quantumFormulation:
      'Synthesize efficient quantum circuits using Qiskit 1.2+ SDK with validation against exact diagonalization references.',
    hardwareSpecs: {
      processorA: 'Benchmark on Processor A (5-qubit linear).',
      processorB: 'Benchmark on Processor B (7-qubit heavy-hex).',
      processorC: 'Benchmark on Processor C (8–10 qubit experimental graph).',
    },
    processorDTask:
      'Propose a custom 12-qubit Processor D coupling graph tailored specifically to your chosen physical lattice model.',
    deliverables: [
      'Executable notebook with scientific justification and comparison with analytical solutions.',
      'Hardware benchmarking data across Processors A, B, and C.',
      'Processor D coupling map and architectural justification report.',
    ],
    evaluationRubric: {
      componentA: 'Scientific depth, formulation validity, and reproducibility of the many-body simulation (40 Points).',
      componentB: 'Comprehensive hardware transpilation benchmarking across standard processors (30 Points).',
      componentC: 'Processor D custom design quality and depth reduction metrics (30 Points).',
    },
  },

  // ----------------------------------------------------
  // VERTICAL 4: QUANTUM MACHINE LEARNING
  // ----------------------------------------------------
  {
    id: 'PS-Q1',
    vertical: 'Quantum Machine Learning',
    title: 'PS-Q1: Biomedical Signal Classifier',
    subtitle: 'Variational Quantum Classification for Arrhythmia & Biosignals',
    description:
      'This problem explores a near-term application of hybrid quantum–classical machine learning using biomedical signals. Teams work with a classification task such as distinguishing different types or conditions in a suitable ECG, EEG, or related signal dataset. Classical preprocessing and feature extraction can be combined with a variational quantum circuit that acts as part of the learning model. Participants should evaluate how effectively the hybrid approach learns the classification task and compare it with a classical machine-learning baseline. The challenge connects signal processing, machine learning, and quantum circuit design in a practical diagnostic-support setting.',
    objective:
      'Construct a Variational Quantum Classifier (VQC) to classify biomedical signals (such as MIT-BIH ECG heartbeat arrhythmia or EEG seizure detection) into diagnostic categories using parameterized quantum circuits.',
    mathematicalFormulation:
      'Preprocess multi-channel biosignal data using wavelet transforms or PCA to reduce feature dimensionality to 4–6 salient features. Map features into Hilbert space via angle/amplitude encoding.',
    quantumFormulation:
      'Construct a trainable ansatz |ψ(x, θ)⟩ = W(θ) U(x) |0⟩^{\\otimes n}. Compute binary or multi-class predictions via Pauli-Z expectation values evaluated with EstimatorV2. Train using cross-entropy loss and gradient descent.',
    hardwareSpecs: {
      processorA: 'Processor A (5-Qubit Linear Chain): Benchmarks classifier training runtime under linear SWAP overhead.',
      processorB: 'Processor B (7-Qubit Heavy-Hex): Evaluates 6-feature classifier embedding.',
      processorC: 'Processor C (8–10 Qubit Experimental Graph): Evaluates multi-channel biosignal input.',
    },
    processorDTask:
      'Design a 12-qubit Processor D coupling map with low-diameter connectivity that minimizes ansatz depth per training epoch.',
    deliverables: [
      'End-to-end classification notebook including data preprocessing, circuit training, and confusion matrix.',
      'Validation accuracy, F1-score, and ROC curve compared against a classical SVM/Random Forest baseline.',
      'Transpilation metrics across Processors A, B, and C.',
      'Custom Processor D JSON specification and architectural report.',
    ],
    evaluationRubric: {
      componentA: 'Data preprocessing rigor, VQC model convergence, and competitive classification accuracy (40 Points).',
      componentB: 'Transpilation and two-qubit gate depth analysis across Processors A, B, and C (30 Points).',
      componentC: 'Processor D architectural design enabling efficient entangling layers for QML (30 Points).',
    },
  },
  {
    id: 'PS-Q2',
    vertical: 'Quantum Machine Learning',
    title: 'PS-Q2: High-Dimensional Quantum Kernel Classifier',
    subtitle: 'ZZFeatureMap Support Vector Machine (QSVC) on Benchmark Data',
    description:
      'Quantum kernels provide a way to use quantum circuits to construct feature representations that can then be used by classical learning algorithms. In this problem, teams develop a quantum feature map and use it to build a kernel-based classifier, such as a quantum-kernel SVM. The central question is whether the chosen quantum representation provides useful classification performance for the selected dataset. A tuned classical baseline is important so that the comparison is meaningful rather than assuming a quantum advantage. Participants therefore investigate both statistical performance and the computational cost of constructing and evaluating the quantum kernel.',
    objective:
      'Implement a Quantum Support Vector Classifier (QSVC) using non-linear quantum kernels generated by ZZFeatureMaps. Evaluate kernel matrix computation overhead and investigate quantum advantage over classical RBF kernels.',
    mathematicalFormulation:
      'Evaluate the kernel matrix K_{ij} = |⟨0| U^†(x_j) U(x_i) |0⟩|² for all training pairs (x_i, x_j). Train a classical dual formulation SVM: max_α ∑ α_i - 1/2 ∑ α_i α_j y_i y_j K_{ij}.',
    quantumFormulation:
      'Construct ZZFeatureMap circuits with repetition depth d=2. Measure transition probabilities with SamplerV2 to populate Gram matrices.',
    hardwareSpecs: {
      processorA: 'Processor A (5-Qubit Linear Chain): Evaluates quadratic SWAP penalty for all-to-all entangling blocks in ZZFeatureMap.',
      processorB: 'Processor B (7-Qubit Heavy-Hex): Measures routing efficiency on heavy-hex lattices.',
      processorC: 'Processor C (8–10 Qubit Experimental Graph): Evaluates multi-feature kernel mapping.',
    },
    processorDTask:
      'Design a custom 12-qubit Processor D coupling map that natively matches the pairwise interaction graph of the chosen feature map, eliminating SWAP gates.',
    deliverables: [
      'Notebook computing the quantum kernel Gram matrix and training a QSVC model.',
      'Classification accuracy and geometric margin comparison between quantum kernel and classical Gaussian RBF kernel.',
      'Transpilation depth and two-qubit gate benchmark on Processors A, B, and C.',
      'Processor D coupling map and written justification.',
    ],
    evaluationRubric: {
      componentA: 'Mathematical correctness of quantum kernel calculation, proper train/test split, and kernel alignment metrics (40 Points).',
      componentB: 'Comprehensive benchmarking of ZZFeatureMap routing overhead across Processors A, B, and C (30 Points).',
      componentC: 'Processor D custom design reducing kernel evaluation circuit depth (30 Points).',
    },
  },
  {
    id: 'PS-Q3',
    vertical: 'Quantum Machine Learning',
    title: 'PS-Q3: Noise-Resilient Quantum Classifier with Error Mitigation',
    subtitle: 'Zero-Noise Extrapolation (ZNE) & Readout Mitigation in QML',
    description:
      'This problem investigates what happens when a quantum machine-learning model is exposed to realistic device noise. Teams develop a variational quantum classifier and first establish its behaviour under ideal or controlled conditions before studying the degradation caused by noise. They then explore techniques such as error mitigation or other noise-aware strategies to recover classification performance. The challenge is to quantify the relationship between circuit structure, noise, and prediction accuracy rather than simply reporting a final score. It provides a practical introduction to one of the major difficulties faced by near-term quantum machine learning.',
    objective:
      'Build a robust variational quantum classifier that maintains high classification accuracy in the presence of realistic device gate noise. Implement Zero-Noise Extrapolation (ZNE) and readout error mitigation to protect model predictions.',
    mathematicalFormulation:
      'Model device noise with Pauli depolarizing channels and amplitude damping. Apply pulse stretching or unitary folding to scale noise factor λ ∈ {1, 3, 5}, extrapolating to the zero-noise limit λ → 0.',
    quantumFormulation:
      'Integrate Qiskit Runtime primitives error mitigation options (ZNE and Twirled Readout Error Extrapolation - TREX) into the classifier inference pipeline.',
    hardwareSpecs: {
      processorA: 'Processor A (5-Qubit Linear Chain): Evaluates accuracy degradation under linear SWAP chains.',
      processorB: 'Processor B (7-Qubit Heavy-Hex): Evaluates mitigation efficacy on heavy-hex layouts.',
      processorC: 'Processor C (8–10 Qubit Experimental Graph): Measures scaling across complex topologies.',
    },
    processorDTask:
      'Design a custom 12-qubit Processor D coupling map that minimizes critical circuit depth to stay within device coherence limits.',
    deliverables: [
      'Classification notebook demonstrating unmitigated vs mitigated model inference accuracy under noise.',
      'Zero-noise extrapolation curve and performance recovery verification.',
      'Transpilation metrics for Processors A, B, and C.',
      'Processor D coupling map JSON and technical report.',
    ],
    evaluationRubric: {
      componentA: 'Demonstrated improvement in noisy classification accuracy using error mitigation techniques (40 Points).',
      componentB: 'Hardware transpilation and SWAP overhead analysis on Processors A, B, and C (30 Points).',
      componentC: 'Custom Processor D topology designed to minimize noise accumulation (30 Points).',
    },
  },
  {
    id: 'PS-Q-OPEN',
    vertical: 'Quantum Machine Learning',
    title: 'Open Innovation: Quantum Machine Learning Frontiers',
    subtitle: 'Quantum GANs, Quantum Autoencoders, or Graph Neural Networks',
    description:
      'Develop your own quantum machine-learning problem around a clearly defined dataset and learning objective. Possible directions include classification, regression, generative modelling, materials-property prediction, or another data-driven application where a quantum model can be meaningfully tested. You should identify the features, target task, quantum model, and evaluation method. A suitable classical baseline should also be included so that the contribution of the quantum component can be assessed fairly. The emphasis is on designing a complete and testable QML experiment rather than simply applying a quantum circuit to a dataset.',
    objective:
      'Develop and validate an advanced QML architecture such as a Quantum Generative Adversarial Network (Q-GAN), Quantum Convolutional Neural Network (QCNN), or Quantum Autoencoder for state compression.',
    mathematicalFormulation:
      'Clearly define the learning objective, loss function, gradient derivation (e.g. parameter-shift rule), and data representation.',
    quantumFormulation:
      'Implement the model in Qiskit 1.2+ using Primitives V2 and demonstrate training stability and convergence.',
    hardwareSpecs: {
      processorA: 'Benchmark on Processor A (5-qubit linear).',
      processorB: 'Benchmark on Processor B (7-qubit heavy-hex).',
      processorC: 'Benchmark on Processor C (8–10 qubit experimental graph).',
    },
    processorDTask:
      'Propose a custom 12-qubit Processor D coupling graph specifically optimized for your generative or convolutional QML architecture.',
    deliverables: [
      'Executable notebook with model architecture, training loop, and convergence plots.',
      'Hardware benchmarking data across Processors A, B, and C.',
      'Processor D coupling map and architectural justification report.',
    ],
    evaluationRubric: {
      componentA: 'Originality, theoretical rigor, and convergence demonstration of the custom QML architecture (40 Points).',
      componentB: 'Transpilation analysis across standard hardware processors (30 Points).',
      componentC: 'Quality of custom Processor D design and depth reduction metrics (30 Points).',
    },
  },

  // ----------------------------------------------------
  // VERTICAL 5: POST-QUANTUM CRYPTOGRAPHY
  // ----------------------------------------------------
  {
    id: 'PS-P1',
    vertical: 'Post-Quantum Cryptography',
    title: 'PS-P1: Quantum-Safe Secure Communication Channel',
    subtitle: 'Hybrid Classical-Post-Quantum Ephemeral Key Exchange',
    description:
      'This problem addresses the practical migration from classical public-key cryptography to post-quantum cryptography. Teams design a secure communication workflow in which vulnerable RSA/ECC-style key establishment or authentication mechanisms are replaced with quantum-safe primitives such as ML-KEM and ML-DSA. The goal is to demonstrate how a modern secure channel can be constructed while considering the practical overhead introduced by the new algorithms. Participants should examine the protocol flow as well as measurable performance characteristics. The challenge provides an applied introduction to how real systems may need to change in preparation for future quantum threats.',
    objective:
      'Architect a quantum-resistant cryptographic key exchange channel combining classical Elliptic Curve Diffie-Hellman (ECDH) with the NIST FIPS 203 ML-KEM (Kyber) standard. Implement simulated quantum cryptanalysis attacks against the classical component.',
    mathematicalFormulation:
      'Hybrid shared secret derivation K = KDF(SS_{ECDH} || SS_{ML-KEM}). Demonstrate that compromise of the classical discrete logarithm via Shor’s algorithm leaves the hybrid key secure due to the hardness of Learning With Errors (LWE).',
    quantumFormulation:
      'Construct a toy quantum period-finding circuit in Qiskit simulating the core Shor step that threatens ECDH, and analyze why lattice-based problems do not possess periodic structure exploitable by the QFT.',
    hardwareSpecs: {
      processorA: 'Processor A (5-Qubit Linear Chain): Evaluates routing overhead for modular arithmetic components.',
      processorB: 'Processor B (7-Qubit Heavy-Hex): Evaluates quantum circuit compilation.',
      processorC: 'Processor C (8–10 Qubit Experimental Graph): Benchmarks higher qubit counts.',
    },
    processorDTask:
      'Design a 12-qubit Processor D coupling map optimized for reversible modular arithmetic and carry propagation.',
    deliverables: [
      'End-to-end Python/Qiskit implementation of the hybrid key exchange protocol with verification tests.',
      'Circuit implementation of order finding on toy modulus illustrating classical vulnerability.',
      'Transpilation benchmarking tables across Processors A, B, and C.',
      'Processor D coupling map and technical security justification report.',
    ],
    evaluationRubric: {
      componentA: 'Cryptographic correctness of the hybrid protocol, security analysis against quantum threats, and toy Shor circuit (40 Points).',
      componentB: 'Transpilation and SWAP overhead analysis of reversible arithmetic blocks across Processors A, B, and C (30 Points).',
      componentC: 'Custom Processor D design accelerating reversible arithmetic (30 Points).',
    },
  },
  {
    id: 'PS-P2',
    vertical: 'Post-Quantum Cryptography',
    title: 'PS-P2: Enterprise Cryptographic Inventory & Migration Framework',
    subtitle: 'NIST PQC Migration Readiness & Quantum Vulnerability Scoring',
    description:
      'Before an organization can migrate to post-quantum cryptography, it needs to know where classical cryptography is being used. In this problem, teams build a tool that analyses a software project or synthetic codebase and identifies cryptographic algorithms, libraries, protocols, and usage locations that may require attention. The tool should help assess the risk associated with those dependencies and recommend appropriate migration actions or quantum-safe alternatives. The challenge therefore combines static analysis with security risk assessment. It focuses on the practical first step of turning a large and potentially complex software environment into an actionable PQC migration plan.',
    objective:
      'Develop an automated cryptographic asset discovery and vulnerability assessment framework. Scan network certificates, TLS configurations, and codebases to classify algorithms by quantum risk and generate a structured migration roadmap to ML-KEM and ML-DSA.',
    mathematicalFormulation:
      'Formulate a quantitative Quantum Risk Score QRS = f(Data Shelf Life, Migration Horizon, Security Margin, Key Size). Calculate time-to-quantum-compromise (Mosca’s Theorem: X + Y > Z).',
    quantumFormulation:
      'Model the quantum resource estimation (physical qubits, T-gate count, surface code cycles) required to break each discovered classical key size (RSA-2048, ECDSA P-256) on realistic fault-tolerant architectures.',
    hardwareSpecs: {
      processorA: 'Processor A (5-Qubit Linear Chain): Benchmarks resource estimation mapping.',
      processorB: 'Processor B (7-Qubit Heavy-Hex): Evaluates fault-tolerant tile allocation.',
      processorC: 'Processor C (8–10 Qubit Experimental Graph): Evaluates non-trivial routing topologies.',
    },
    processorDTask:
      'Propose a custom 12-qubit Processor D coupling map designed as a fault-tolerant logical patch emulator with low routing latency for syndrome extraction.',
    deliverables: [
      'Executable Python discovery and risk-scoring tool with sample enterprise certificate and key inputs.',
      'Structured migration roadmap prioritizing assets and detailing transition to FIPS 203 (ML-KEM) and FIPS 204 (ML-DSA).',
      'Transpilation analysis across Processors A, B, and C.',
      'Processor D JSON coupling map and engineering justification.',
    ],
    evaluationRubric: {
      componentA: 'Practical utility, scoring accuracy, and completeness of the enterprise cryptographic migration roadmap (40 Points).',
      componentB: 'Resource estimation modeling and hardware routing analysis across Processors A, B, and C (30 Points).',
      componentC: 'Custom Processor D architectural innovation for cryptographic workloads (30 Points).',
    },
  },
  {
    id: 'PS-P3',
    vertical: 'Post-Quantum Cryptography',
    title: 'PS-P3: Reversible Quantum Arithmetic & Carry-Chain Bottlenecks',
    subtitle: 'Hardware Routing Benchmark of Quantum Modular Adders & Multipliers',
    description:
      'Post-quantum algorithms provide stronger protection against future quantum attacks, but they also introduce practical performance trade-offs. This problem asks teams to benchmark PQC algorithms and compare their behaviour with relevant classical alternatives under different resource conditions. Measurements can consider execution time, memory requirements, key and message sizes, and other system-level costs. The comparison should reveal how the algorithms behave across environments such as server, edge, and constrained IoT-style platforms. The challenge is therefore about producing a careful systems-level measurement rather than simply identifying which cryptographic algorithm is fastest.',
    objective:
      'Synthesize and benchmark reversible quantum arithmetic circuits (Cuccaro carry-ripple adders, modular multipliers) that form the core computational engine of Shor’s algorithm. Quantify how sequential carry chains inflate SWAP overhead on planar topologies.',
    mathematicalFormulation:
      'Implement reversible in-place addition |a⟩ |b⟩ → |a⟩ |a + b \\pmod{2^n}⟩ using Toffoli (CCX), CNOT, and Pauli-X gates with minimal ancilla footprint.',
    quantumFormulation:
      'Compile multi-bit quantum adders and modular exponentiation circuits onto physical backends. Measure the dramatic difference in SWAP insertion penalty between linear, heavy-hex, and tree topologies.',
    hardwareSpecs: {
      processorA: 'Processor A (5-Qubit Linear Chain): Evaluates extreme SWAP penalties for linear carry chains.',
      processorB: 'Processor B (7-Qubit Heavy-Hex): Evaluates carry propagation on degree-2/3 unit cells.',
      processorC: 'Processor C (8–10 Qubit Experimental Graph): Evaluates multi-bit modular multiplier circuits.',
    },
    processorDTask:
      'Design a custom 12-qubit Processor D coupling map featuring a dedicated carry-lookahead backbone that reduces carry propagation depth from O(n) to O(log n).',
    deliverables: [
      'Notebook synthesizing reversible quantum adders and modular multiplication circuits in Qiskit.',
      'Empirical scaling plot showing CX count and circuit depth versus bit length n.',
      'Detailed transpilation metrics across Processors A, B, and C.',
      'Processor D JSON specification and carry-lookahead architecture report.',
    ],
    evaluationRubric: {
      componentA: 'Functional correctness of reversible arithmetic circuits, zero state corruption, and proper uncomputation of ancillae (40 Points).',
      componentB: 'Transpilation analysis demonstrating the routing bottleneck of deep carry chains across Processors A, B, and C (30 Points).',
      componentC: 'Processor D carry-lookahead architectural innovation demonstrating measurable depth reduction (30 Points).',
    },
  },
  {
    id: 'PS-P-OPEN',
    vertical: 'Post-Quantum Cryptography',
    title: 'Open Innovation: Post-Quantum Cryptographic Systems',
    subtitle: 'Lattice Cryptanalysis, Fault Resistance, or Quantum Hash Functions',
    description:
      'Create a practical problem related to the deployment, analysis, or migration of post-quantum cryptography. Possible directions include a hybrid TLS 1.3 handshake, a timing side-channel audit and hardening exercise, or a harvest-now-decrypt-later migration-risk model for a synthetic organization. Your proposal should define the system being studied, the relevant threat model, and the cryptographic algorithms involved. It should also explain why a classical-only approach is no longer sufficient for the scenario. The final problem should result in a concrete technical implementation or measurable analysis rather than only a theoretical discussion.',
    objective:
      'Propose and evaluate an advanced post-quantum cryptographic mechanism (such as quantum random number generation, lattice basis reduction analysis via quantum algorithms, side-channel analysis of PQC implementations, or quantum-safe zero-knowledge proofs).',
    mathematicalFormulation:
      'Specify the underlying cryptographic hardness assumption, protocol flows, and mathematical security proof.',
    quantumFormulation:
      'Construct and simulate validation circuits using Qiskit 1.2+ SDK.',
    hardwareSpecs: {
      processorA: 'Benchmark on Processor A (5-qubit linear).',
      processorB: 'Benchmark on Processor B (7-qubit heavy-hex).',
      processorC: 'Benchmark on Processor C (8–10 qubit experimental graph).',
    },
    processorDTask:
      'Propose a custom 12-qubit Processor D coupling graph tailored specifically to your chosen cryptographic primitive.',
    deliverables: [
      'Documented executable notebook with protocol implementation, test vectors, and security analysis.',
      'Hardware benchmarking data across Processors A, B, and C.',
      'Processor D coupling map and architectural justification report.',
    ],
    evaluationRubric: {
      componentA: 'Novelty, cryptographic soundness, and experimental execution of the custom PQC proposal (40 Points).',
      componentB: 'Transpilation analysis across standard hardware processors (30 Points).',
      componentC: 'Quality of custom Processor D design and depth reduction metrics (30 Points).',
    },
  },
];
