# Qiskit Fall Fest 2026: Masterclass Series Curriculum (v1.2)

**Course Title:** Algorithm-Architecture Co-Design: From Basics to Quantum Utility  
**Dates:** 5 October 2026 to 9 October 2026 (Online Phase)  
**Host Institution:** SRM University-AP in partnership with IBM Quantum  
**Format:** 10 Progressive Online Sessions across 5 Days (~26.5 Hours Technical Time)  
**Certification:** Official IBM x SRMUAP Masterclass Certificate of Completion  
**Target Audience:** Undergraduate and postgraduate students, researchers, developers, and hackathon competitors.  
**Software Stack:** Python 3.10+, Qiskit 1.2+, Qiskit Aer, Qiskit Primitives V2 (EstimatorV2, SamplerV2).

---

## Pedagogical Architecture: The Co-Design Learning Arc

```
FOUNDATIONS (Day 1)
  -> QISKIT 101 & PRIMITIVES V2 (Day 1)
  -> HARDWARE TOPOLOGIES: LINEAR TO HEAVY-HEX (Day 2)
  -> TRANSPILER COMPILATION & SWAP ROUTING (Day 2)
  -> PRACTICAL BENCHMARKING LAB: PROCESSORS A & B (Day 3)
  -> VARIATIONAL ALGORITHMS: CHEMISTRY (VQE) & QML (Day 3)
  -> VARIATIONAL OPTIMIZATION (QAOA) & SIMULATION (Day 4)
  -> POST-QUANTUM CRYPTOGRAPHY & CRYPTANALYSIS (Day 4)
  -> LAB: PROCESSOR C ANALYSIS & CUSTOM PROCESSOR D DESIGN (Day 5)
  -> QUANTUM UTILITY & HACKATHON CAPSTONE STRATEGY (Day 5)
```

---

## Detailed Session Syllabi

### Session 1: Quantum Basics Workshop (Day 1, Morning)
- **Classification:** Foundations (Event 1)
- **Topics:** Postulates of quantum mechanics, state vectors, Bloch sphere representation, single-qubit gates (X, Y, Z, H, S, T, parameterized rotations Rx, Ry, Rz), two-qubit entangling gates (CX/CNOT, CZ), Bell states, quantum measurement, and circuit evaluation on statevector simulators.
- **Prerequisites:** Basic linear algebra (vectors, matrices, tensor products, eigenvalues).

### Session 2: QISKIT 101 - Exploring Track (Day 1, Afternoon)
- **Classification:** Hands-on Implementation (Event 25)
- **Topics:** Qiskit 1.2+ SDK architecture, QuantumCircuit construction, operator synthesis with SparsePauliOp, introduction to Qiskit Primitives V2 (SamplerV2 for quasi-probability distributions, EstimatorV2 for expectation values of observables), and batch execution on Aer simulator.
- **Prerequisites:** Python programming fundamentals.

### Session 3: Quantum Hardware Topologies: From Linear Chains to Heavy-Hex (Day 2, Morning)
- **Classification:** Architecture Layer
- **Topics:** Physical superconducting qubit hardware layout, cross-resonance gates, coupling graphs, connectivity trade-offs, Processor A (5-qubit linear Falcon layout), Processor B (7-qubit heavy-hex lattice), and Processor C (8-10 qubit experimental custom graph).
- **Prerequisites:** Sessions 1 and 2.

### Session 4: Qiskit Transpiler Deep Dive: Routing, Layout & SWAP Overhead (Day 2, Afternoon)
- **Classification:** Compilation & Routing Layer
- **Topics:** Transpiler pass managers, translation to native basis gates (ECR, CX, SX, X, Rz), initial layout algorithms (Trivial, Dense, SabreLayout), routing algorithms (BasicSwap, SabreSwap), SWAP gate insertion penalty, circuit depth inflation, and optimization levels 0 through 3.
- **Prerequisites:** Session 3.

### Session 5: Hands-on Lab: Benchmarking Processors A & B (Day 3, Morning)
- **Classification:** Rubric Component B Practical Lab
- **Topics:** Empirical benchmarking of 2-qubit to 5-qubit circuits across Processor A and Processor B. Measuring active qubit footprint, two-qubit gate count, depth expansion, and SWAP overhead. Formulating comparative architectural trade-off tables.
- **Prerequisites:** Session 4.

### Session 6: Variational Algorithms: Quantum Chemistry (VQE) & QML (Day 3, Afternoon)
- **Classification:** Applied Domain Tracks 1 & 4
- **Topics:** Variational Quantum Eigensolver (VQE) for molecular ground state computation (H2 and LiH), electronic structure Hamiltonians using Qiskit Nature, Jordan-Wigner transformation, ansatz architectures (UCCSD vs RealAmplitudes), classical optimizers (COBYLA, SPSA), and Quantum Machine Learning feature maps (ZZFeatureMap) for classification.
- **Prerequisites:** Sessions 2 and 5.

### Session 7: Variational Optimization (QAOA) & Hamiltonian Simulation (Day 4, Morning)
- **Classification:** Applied Domain Tracks 2 & 3
- **Topics:** Quantum Approximate Optimization Algorithm (QAOA) for combinatorial graph problems (Max-Cut, QUBO formulation), problem vs mixer Hamiltonians, Trotter-Suzuki product formulas for time-evolving Transverse-Field Ising Model (TFIM) spin systems, and Trotter error analysis.
- **Prerequisites:** Sessions 2 and 5.

### Session 8: Post-Quantum Cryptography & Quantum Cryptanalysis on Hardware (Day 4, Afternoon)
- **Classification:** Applied Domain Track 5
- **Topics:** Quantum algorithms threatening classical public-key cryptography (Shor's and Grover's algorithms), reversible arithmetic circuits (carry-ripple adders, modular multipliers, modular exponentiation), hardware routing constraints of deep arithmetic chains, and transition to NIST Post-Quantum Cryptography standards (ML-KEM, ML-DSA).
- **Prerequisites:** Sessions 4 and 5.

### Session 9: Masterclass Lab: Processor C Analysis & Designing Custom Processor D (Day 5, Morning)
- **Classification:** Rubric Component C Innovation Lab
- **Topics:** Benchmarking algorithms on Processor C (experimental graph topology). Identifying connectivity bottlenecks. Formulating custom 12-qubit Processor D topologies, generating valid coupling map JSON files, simulating under realistic noise models, and structuring the architectural justification report.
- **Prerequisites:** Sessions 5, 6, 7, and 8.

### Session 10: The Road to Quantum Utility & Hackathon Final Strategy (Day 5, Afternoon)
- **Classification:** Capstone & Flagship Closing (Event 60)
- **Topics:** Definition of quantum utility beyond brute-force classical simulation, Error Mitigation techniques (Zero-Noise Extrapolation, Probabilistic Error Cancellation, Dynamical Decoupling), submission review of the 100-point rubric, code reproducibility checklists, and Phase 1 sprint final guidance.
- **Prerequisites:** Complete Masterclass Series.
