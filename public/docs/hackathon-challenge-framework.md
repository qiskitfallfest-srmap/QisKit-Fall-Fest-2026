# Qiskit Fall Fest 2026: Hackathon Universal Challenge Framework

**Event Designation:** QFF 2026 Flagship Hackathon (Phase 1 Online Sprint & Phase 2 Onsite Finals)  
**Theme:** Algorithm-Architecture Co-Design  
**Phase 1 Dates:** 5 October 2026 to 13 October 2026 (Submissions close 13 October, 11:59 PM IST)  
**Phase 1 Finalist Announcement:** 17 October 2026 (~200 participants / top 10-12 teams per track)  
**Phase 2 Onsite Finals:** 27 October 2026 to 28 October 2026 (24-26 Hours in SRM-AP University Auditorium)  
**Team Composition:** 2 to 4 members per team.

---

## 1. Challenge Overview

In Phase 1, teams select one of five specialized domain tracks and implement an algorithmic quantum solution. Rather than evaluating algorithms in an idealized mathematical vacuum, teams must benchmark their solution across **three fixed quantum processor models (A, B, and C)**, analyze how hardware connectivity, native gate sets, and routing constraints affect circuit depth and fidelity, and finally **design a custom 12-qubit Processor D** that directly resolves their algorithm's specific hardware bottlenecks.

---

## 2. Fixed Processor Specifications

Every submission must benchmark its algorithm across three standardized backends:

| Parameter | Processor A | Processor B | Processor C |
| :--- | :--- | :--- | :--- |
| **Architecture Name** | 5-Qubit Linear Chain | 7-Qubit Heavy-Hex | 8-10 Qubit Experimental Graph |
| **Reference Architecture**| IBM Falcon / Yorktown | IBM Contemporary Quantum System | Custom Hyperbolic / 2D Graph |
| **Qubit Count** | 5 physical qubits | 7 physical qubits | 8 to 10 physical qubits |
| **Topology** | 1D nearest-neighbor line | Heavy-hex lattice unit cell | Provided custom graph file |
| **Native Basis Gates** | CX, Rz, SX, X | CX, Rz, SX, X | CX, Rz, SX, X |
| **Two-Qubit Error Rate** | ~0.5% (Nominal) | ~0.5% (Nominal) | ~0.5% (Nominal) |
| **Primary Bottleneck** | High SWAP overhead for distant qubits | Constrained degree-2/3 routing | Non-trivial graph embedding |

---

## 3. Custom Processor D Innovation Task

After evaluating Processors A, B, and C, teams must design and propose **Processor D**:
- **Qubit Constraint:** Maximum 12 physical qubits.
- **Connectivity:** Any graph topology (planar or non-planar) explicitly justified by the algorithmic communication graph.
- **Native Gate Set:** Native two-qubit CX gates and arbitrary single-qubit rotations.
- **Error Bounds:** Nominal gate error rates bounded by the baseline specifications of Processors A, B, and C.
- **Deliverables:** A machine-readable coupling map (`processor_D.json`) and a technical engineering justification explaining how Processor D eliminates SWAP bottlenecks and minimizes circuit depth for the selected problem.

---

## 4. The 100-Point Evaluation Rubric

Submissions are scored on a rigorous 100-point scale:

### Component A: Core Problem Implementation (40 Points)
- Correctness and validity of the mathematical and quantum formulation.
- Proper utilization of Qiskit SDK 1.2+ and Primitives V2 (SamplerV2 / EstimatorV2).
- Convergence of variational algorithms (VQE/QAOA) or precision of Trotterized Hamiltonian evolution.
- Numerical accuracy relative to known classical analytical or exact diagonalization references.

### Component B: Architecture Analysis & Benchmarking (30 Points)
- Rigorous empirical evaluation across Processors A, B, and C.
- Measurement of two-qubit (CX) gate count, circuit depth, and SWAP gate insertion penalty.
- Clear comparative data visualizations and architectural trade-off discussions.
- Sound analysis explaining why different physical topologies perform better or worse.

### Component C: Custom Processor D Innovation & Validation (30 Points)
- Architectural creativity and technical validity of the custom 12-qubit coupling map.
- Concrete demonstration of performance improvement (reduced CX count, shallower depth, fewer SWAPs).
- Quality, completeness, and clarity of the engineering rationale.

---

## 5. Domain Tracks & Problem Statements

### Track 1: Quantum Chemistry (VQE)
- **PS-C1: Molecular Ground State Energy (H2):** Compute the ground-state energy of the H2 molecule in a minimal basis using VQE and analyze SWAP overhead across processors.
- **PS-C2: Diatomic Potential Energy Surface:** Map out the potential energy curve of H2 or LiH across bond distances (0.5 to 2.5 A) and track circuit scaling.
- **PS-C3: Hardware-Efficient Chemistry:** Target triatomic molecules (H2O, HeH+) with active-space reduction, qubit tapering, and compact ansatze under 8 qubits.
- **Open Innovation (Chemistry):** Custom proposal for molecular properties, dipole moments, or transition states.

### Track 2: Quantum Optimization (QAOA)
- **PS-O1: Max-Cut on Weighted Graphs:** Formulate Max-Cut on a 6-vertex weighted graph, construct QAOA circuits (p=1, 2), and measure SWAP overhead on linear vs heavy-hex topologies.
- **PS-O2: Constrained Portfolio Optimization:** Formulate a risk-return investment objective as a QUBO with budget penalty constraints.
- **PS-O3: Vehicle Routing & Traveling Salesperson:** Formulate small-scale routing instances and benchmark routing overhead.
- **Open Innovation (Optimization):** Custom combinatorial or scheduling optimization problem.

### Track 3: Quantum Simulation (Hamiltonian Dynamics)
- **PS-S1: Transverse-Field Ising Model (TFIM):** Simulate quantum spin chain dynamics using Trotterized unitary evolution and track magnetization.
- **PS-S2: Non-Equilibrium Quantum Quenches:** Simulate dynamical phase transitions under sudden parameter quenches.
- **PS-S3: Noise-Resilient Trotterization:** Evaluate Trotter step scaling under realistic device noise models.
- **Open Innovation (Simulation):** Custom many-body physics, lattice gauge theory, or topological matter simulation.

### Track 4: Quantum Machine Learning (QML)
- **Problem Statement:** Implement quantum kernel methods or Variational Quantum Classifiers (VQC) with parameterized feature maps (ZZFeatureMap) on benchmark datasets, measuring kernel evaluation costs across coupling graphs.

### Track 5: Post-Quantum Cryptography & Quantum Arithmetic (PQC)
- **Problem Statement:** Synthesize reversible quantum arithmetic circuits (modular addition, modular multiplication) and analyze the hardware routing bottlenecks of deep carry chains.

---

## 6. Submission Requirements

Teams must submit a link to a public GitHub or Hugging Face Space repository containing:
1. `README.md`: Clear documentation with team members, track choice, reproduction steps, and executive summary.
2. `requirements.txt` or `environment.yml`: Explicit software dependency pins.
3. `main.ipynb` (or `main.py`): Clean, documented, end-to-end executable code producing all reported metrics and figures.
4. `processors/`: Directory containing `processor_A.json`, `processor_B.json`, `processor_C.json`, and `processor_D.json`.
5. `results/`: Output plots, benchmark comparison tables, and execution logs.
