#!/usr/bin/env python3
"""
tools/generate_llms_manifests.py

Authoritative generator for the Qiskit Fall Fest 2026 LLMs manifest ecosystem.
Adheres strictly to the llmstxt.org v2 specification and repository governance rules:
- Generates public/llms.txt (Standard curated index with markdown links and notes)
- Generates public/llms-full.txt (Consolidated single-request dossier for >=32k context LLMs)
- Generates public/docs/*.md (Clean, standalone Markdown files for direct HTTP agent ingestion)
- Generates companion root llms.txt for the planning repository
- Enforces zero raw emojis, clean typography, and strict UTF-8 encoding.
"""

import os
import sys
from pathlib import Path

# Ensure UTF-8 output on Windows console
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def get_paths():
    script_dir = Path(__file__).resolve().parent
    planning_repo = script_dir.parent
    
    # Path to web repo in Downloads
    web_repo = planning_repo.parent / "QisKit-Fall-Fest-2026"
    if not web_repo.exists():
        # Fallback if running from web repo
        web_repo = planning_repo
        planning_repo = planning_repo.parent / "01 _ TECHNICAL & INNOVATION TRACK QFF"
        
    return planning_repo, web_repo

def build_llms_txt() -> str:
    return """# Qiskit Fall Fest 2026 — SRM University-AP (Amaravati)

> Official Digital Summit Platform & AI Knowledge Manifest for Qiskit Fall Fest 2026 at SRM University-AP (Amaravati), organized in partnership with IBM Quantum and Aanutattva - The Singularity Lab under the global milestone theme "A Decade of Quantum on Cloud" (celebrating 10 years of cloud quantum computing).

The Qiskit Fall Fest 2026 at SRM University-AP is an international quantum computing festival featuring a 59-event technical portfolio, an intensive 10-session masterclass series, a 5-track hackathon centered on Algorithm-Architecture Co-Design, a hardware technology expo, keynotes, and a 24-26 hour onsite hackathon.

Official Website: https://www.qffsrmap2026.com/
Host Institution: SRM University-AP, Amaravati, Andhra Pradesh, India (Partner Plus Host)
Online Phase: 5 October 2026 to 13 October 2026
Campus Phase: 26 October 2026 to 30 October 2026
Registration Platform: Unstop (Official Public Launch: 25 September 2026)

## Full AI Manifests & Markdown Dossiers

- [Full Festival AI Dossier](https://www.qffsrmap2026.com/llms-full.txt): Complete, consolidated markdown dossier containing the masterclass syllabus, universal challenge framework, 100-point rubric, 59-event directory, campus venues, and FAQs for single-request ingestion.
- [Masterclass Curriculum v1.2](https://www.qffsrmap2026.com/docs/masterclass-curriculum.md): Comprehensive 10-session learning arc covering quantum fundamentals, hardware topologies, transpiler routing, variational tracks, PQC, and quantum utility.
- [Hackathon Universal Challenge Framework](https://www.qffsrmap2026.com/docs/hackathon-challenge-framework.md): Two-phase hackathon specification, Processors A/B/C/D architecture constraints, 100-point rubric, and 5 domain tracks.
- [Complete 59-Event Portfolio](https://www.qffsrmap2026.com/docs/event-portfolio-59.md): Exhaustive operational directory of all 38 offline campus events and 21 online virtual events.
- [Frequently Asked Questions (FAQ)](https://www.qffsrmap2026.com/docs/faq.md): Definitive answers regarding team eligibility, registration, travel, campus logistics, and certificates.

## Web Platform Routes

- [Summit Home](https://www.qffsrmap2026.com/): Official portal, keynote speaker announcements, event countdown, and partner showcases.
- [About the Festival](https://www.qffsrmap2026.com/about): Host institution profile, IBM Quantum collaboration, and decade milestone commemoration.
- [Experience & Event Tracks](https://www.qffsrmap2026.com/experience): Filterable directory of technical workshops, challenges, gaming sessions, and hackathon modules.
- [Interactive Schedule](https://www.qffsrmap2026.com/schedule): Chronological schedule for the Online Phase (5-13 Oct) and Campus Phase (26-30 Oct).
- [Campus Venues & Atlas](https://www.qffsrmap2026.com/venues): SRM-AP campus atlas, University Auditorium, Quantum Computing Labs, and seminar halls.
- [Organizing Team & Mentors](https://www.qffsrmap2026.com/team): Festival leadership, faculty patrons, track leads, and IBM Quantum advocates.
- [FAQ Portal](https://www.qffsrmap2026.com/faqs): Participant query resolution regarding accommodation, hackathon submissions, and rules.

## Masterclass Series: Algorithm-Architecture Co-Design (5-9 October 2026)

- [Session 1: Quantum Basics Workshop](https://www.qffsrmap2026.com/docs/masterclass-curriculum.md#session-1): Qubits, superposition, entanglement, single and two-qubit quantum gates, and statevector simulation.
- [Session 2: QISKIT 101 - Exploring Track](https://www.qffsrmap2026.com/docs/masterclass-curriculum.md#session-2): Hands-on circuit building, operator representation, and Qiskit Primitives V2 (SamplerV2 and EstimatorV2).
- [Session 3: Quantum Hardware Topologies](https://www.qffsrmap2026.com/docs/masterclass-curriculum.md#session-3): Physical qubit constraints, from 1D linear chains (Processor A) to IBM heavy-hex lattices (Processor B) and graph topologies (Processor C).
- [Session 4: Qiskit Transpiler Deep Dive](https://www.qffsrmap2026.com/docs/masterclass-curriculum.md#session-4): Transpiler pass managers, layout selection, routing algorithms, SWAP insertion overhead, and depth minimization.
- [Session 5: Hands-on Lab - Benchmarking Processors A & B](https://www.qffsrmap2026.com/docs/masterclass-curriculum.md#session-5): Empirical measurement of two-qubit (CX) gate count, circuit depth, and SWAP penalty on linear vs heavy-hex topologies.
- [Session 6: Variational Algorithms (VQE & QML)](https://www.qffsrmap2026.com/docs/masterclass-curriculum.md#session-6): Molecular ground state energy estimation with Qiskit Nature and parameterized quantum feature maps for machine learning.
- [Session 7: Variational Optimization (QAOA) & Simulation](https://www.qffsrmap2026.com/docs/masterclass-curriculum.md#session-7): Combinatorial optimization via QUBO/QAOA and Hamiltonian time-evolution with Trotterization for spin chains.
- [Session 8: Post-Quantum Cryptography & Cryptanalysis](https://www.qffsrmap2026.com/docs/masterclass-curriculum.md#session-8): Quantum threat models, reversible arithmetic circuits (carry-ripple adders, modular multipliers), and routing constraints.
- [Session 9: Lab - Processor C Analysis & Designing Processor D](https://www.qffsrmap2026.com/docs/masterclass-curriculum.md#session-9): Evaluation of experimental graph topologies and principles of designing custom 12-qubit coupling maps.
- [Session 10: The Road to Quantum Utility & Capstone Strategy](https://www.qffsrmap2026.com/docs/masterclass-curriculum.md#session-10): Quantum utility at 100+ qubits, error mitigation (ZNE, PEC), and hackathon final submission strategy.

## Hackathon Universal Challenge Framework (Phase 1: 5-13 October 2026)

- [Universal Challenge Framework Overview](https://www.qffsrmap2026.com/docs/hackathon-challenge-framework.md#framework): Multi-track hackathon for teams of 2 to 4 members focusing on co-designing quantum algorithms with hardware architectures.
- [Fixed Processor Specifications (A, B, C)](https://www.qffsrmap2026.com/docs/hackathon-challenge-framework.md#processors): Processor A (5-qubit linear Falcon/Yorktown), Processor B (7-qubit heavy-hex), and Processor C (8-10 qubit experimental graph).
- [Custom Processor D Innovation Task](https://www.qffsrmap2026.com/docs/hackathon-challenge-framework.md#processor-d): Up to 12 qubits, custom coupling map, bounded native gate errors, and rigorous architectural rationale resolving identified algorithm bottlenecks.
- [100-Point Evaluation Rubric](https://www.qffsrmap2026.com/docs/hackathon-challenge-framework.md#rubric): 40 points for Solution Correctness & Domain Performance; 30 points for Architectural Benchmarking (A/B/C); 30 points for Custom Processor D Innovation.
- [Submission Guidelines](https://www.qffsrmap2026.com/docs/hackathon-challenge-framework.md#submission): Reproducible GitHub or Hugging Face Space containing main.ipynb, processors/ coupling map JSONs, results/ artifacts, and README.md.

## Total Event Portfolio (59 Active Events)

- [Portfolio Architecture Summary](https://www.qffsrmap2026.com/docs/event-portfolio-59.md#summary): Breakdown of 38 offline physical campus events and 21 online virtual events.
- [Offline Campus Events (38)](https://www.qffsrmap2026.com/docs/event-portfolio-59.md#offline): Flagship 24-26h Onsite Hackathon Phase 2 (27-28 Oct), QCTF 8-hour competition (28 Oct), Hardware Quantum Tech Expo (29 Oct), Keynote Speeches (30 Oct), Qescapes, 6 Offline Challenges, 3 Workshops, and 24 Classroom Games.
- [Online Virtual Events (21)](https://www.qffsrmap2026.com/docs/event-portfolio-59.md#online): 10-Session Masterclass Series (5-9 Oct), Hackathon Phase 1 Sprint (5-13 Oct), Python Coding Challenge, ML Competition, Essay Competition, Digital Posters, Tech Reels, Quantum Code Golf, Quantum Entropy, Quantum Noise Forensics, and 10 Online Games.

## Companion Repositories & Planning

- [Planning & Governance Repository](https://github.com/sahgyan9/Qiskit-Fall-Fest-SRMAP-2026): Academic planning, masterclass curricula, problem statement dossiers, and multi-agent governance.
- [Web Platform Source Repository](https://github.com/qiskitfallfest-srmap/QisKit-Fall-Fest-2026): Production Next.js 15 web platform, Tailwind CSS, TypeScript schemas, and interactive schedule engine.

## Optional

- [IBM Quantum Platform](https://quantum.cloud.ibm.com/): Cloud access to utility-scale 127+ qubit superconducting quantum processors.
- [Qiskit Documentation](https://docs.quantum.ibm.com/): Official API references for Qiskit 1.2+, Primitives V2, and the Qiskit Transpiler Service.
- [Hyperbolic Futures Challenge Model](https://github.com/sahgyan9/Qiskit-Fall-Fest-SRMAP-2026): Architectural precedent for benchmarking quantum circuits across constrained device graphs.
- [A Decade of Quantum on Cloud Whitepaper](https://www.ibm.com/quantum): Historical retrospective on 10 years of cloud quantum computing (2016-2026).
"""

def build_planning_llms_txt() -> str:
    return """# Qiskit Fall Fest 2026 — Planning & Governance Repository

> AI Agent Knowledge Manifest and Operational Blueprint for `sahgyan9/Qiskit-Fall-Fest-SRMAP-2026`. This repository houses the academic curricula, hackathon problem statements, operational ground truths, and multi-agent governance protocols for Qiskit Fall Fest 2026 at SRM University-AP.

Companion Web Repository: https://github.com/qiskitfallfest-srmap/QisKit-Fall-Fest-2026
Official Digital Summit Platform: https://www.qffsrmap2026.com/
Host Institution: SRM University-AP, Amaravati, Andhra Pradesh, India (Partner Plus Host)
Theme: A Decade of Quantum on Cloud (Celebrating 10 Years of Cloud Quantum Computing)

## Core Documentation & Working Files

- [PROJECT_LEARNINGS.md](file:///PROJECT_LEARNINGS.md): Master source of truth, organizer ground truths (GT-01 to GT-11), discrepancy resolutions, and chronological AI agent activity logs.
- [README.md](file:///README.md): Repository structure, cell organization, operational schedule, and multi-agent operating protocol.
- [Masterclass Course Document v1.2](file:///01%20_%20Technical%20Programs%20%20Cell/Sessions/QFF_2026_Masterclass_Master_Course_Document_v1.2.md): Central curriculum specification for the 10-session Algorithm-Architecture Co-Design masterclass.
- [Hackathon Problem Statement Executive Summary](file:///02%20_%20Hackathon%20&%20Competitions%20Cell/Hackathon/QFF%20PS%20Executive%20Summary.md): Universal Challenge Framework, Processors A/B/C/D specifications, and problem statements across 5 tracks.
- [Events and Competitions Guide](file:///02%20_%20Hackathon%20&%20Competitions%20Cell/Hackathon/Events_and_Competitions_Guide_QFF_2026.md): Operational guide covering 59 active events with rules, eligibility, scoring models, and venue allocations.
- [Online & Offline Event Classification](file:///01%20_%20Technical%20Programs%20%20Cell/Planning/QFF_Online+Offline_Event_Structure.md): Definitive breakdown of the 38 offline campus events and 21 online virtual events.
- [Website Task Tracker](file:///03%20_%20Website%20&%20Technology%20Cell/Todo/Website%20Todo.md): Current sprint deliverables for web platform, SEO, GEO, and Unstop integration.

## Cell Organization & Directory Layout

- [01 _ Technical Programs Cell](file:///01%20_%20Technical%20Programs%20%20Cell/): Masterclass courses, academic session syllabi, workshop slides, and speaker coordination.
- [02 _ Hackathon & Competitions Cell](file:///02%20_%20Hackathon%20&%20Competitions%20Cell/): Universal Challenge Framework, problem statements, judging rubrics, automated evaluation scripts, and submission trackers.
- [03 _ Website & Technology Cell](file:///03%20_%20Website%20&%20Technology%20Cell/): Website deliverables, UI specifications, Unstop API coordination, and technical documentation.
- [tools/](file:///tools/): Deterministic execution scripts (`convert_documents.py`, `generate_llms_manifests.py`, `verify_llms_manifests.py`).
- [workflows/](file:///workflows/): Standard operating procedures (`update_llms_manifests.md`).

## Mandatory AI Agent Operating Protocol

Every AI agent working in this repository must adhere to the following governance rules:
1. Caution Principle: Never invent facts. When details conflict across files, consult organizers or check `PROJECT_LEARNINGS.md`.
2. Standardized Context Efficiency: Always prioritize reading `.md` files side-by-side with binary `.docx`/`.xlsx` files. Run `tools/convert_documents.py` when new proprietary files are added.
3. Manifest Regeneration (GT-11): Whenever event details, rubrics, schedules, or curricula are updated, agents must run `python tools/generate_llms_manifests.py` and verify parity using `python tools/verify_llms_manifests.py`.
4. Anti-Slop & Direct Tone: Zero decorative Unicode emojis in code, commits, or UI. Default to clean, modern, crisp light themes.
5. Activity Logging: Record all significant modifications in Section 7 of `PROJECT_LEARNINGS.md`.

## Optional

- [Live Website Public Manifest](https://www.qffsrmap2026.com/llms.txt): Static index served on the production website.
- [Live Website Full AI Dossier](https://www.qffsrmap2026.com/llms-full.txt): Comprehensive bundle for external LLMs.
"""

def build_masterclass_markdown() -> str:
    return """# Qiskit Fall Fest 2026: Masterclass Series Curriculum (v1.2)

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
"""

def build_hackathon_framework_markdown() -> str:
    return """# Qiskit Fall Fest 2026: Hackathon Universal Challenge Framework

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
"""

def build_event_portfolio_markdown() -> str:
    return """# Qiskit Fall Fest 2026: Complete 59-Event Portfolio

**Total Active Events:** 59 Events (38 Offline Campus Events + 21 Online Virtual Events)  
**Host Institution:** SRM University-AP (Amaravati)  
**Host Designation:** Partner Plus Host  
**Online Phase:** 5 October 2026 to 13 October 2026  
**Campus Phase:** 26 October 2026 to 30 October 2026

---

## Portfolio Operational Summary

```
TOTAL ACTIVE PORTFOLIO: 59 EVENTS
├── OFFLINE CAMPUS PHASE (38 Events | 26-30 Oct 2026)
│   ├── Flagship 24-26h Onsite Hackathon Phase 2 (Auditorium, 27-28 Oct)
│   ├── QCTF: Quantum Capture the Flag (Auditorium, 8 Hours, 28 Oct)
│   ├── Hardware Quantum Tech Expo (Quantum Lab / Atrium, 29 Oct)
│   ├── Distinguished Keynote Lectures (Auditorium, 30 Oct)
│   ├── Qescapes: Quantum Escape Room Experience (Classroom Build)
│   ├── 6 Offline Challenges (Auditorium & Seminar Halls)
│   ├── 3 Practical In-Class Workshops & Implementation Tracks
│   └── 24 Classroom Interactive & Quantum-Inspired Games
└── ONLINE VIRTUAL PHASE (21 Events | 5-13 Oct 2026)
    ├── 10-Session Masterclass Series (5-9 Oct)
    ├── Hackathon Phase 1 Universal Challenge Sprint (5-13 Oct)
    ├── 9 Specialized Online Competitions & Technical Challenges
    └── 10 Staggered Online Interactive Community Games (9-13 Oct)
```

---

## Master Event Directory

| No. | Event Name | Delivery Mode | Venue / Platform | Scheduled Phase | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | Quantum Basics Workshop | Online | Zoom / Webex | 5 Oct 2026 | Masterclass Session 1: Foundational quantum mechanics, qubits, gates, and statevector simulation. |
| **2** | Hardware Quantum Tech Expo | Offline | Quantum Lab / Atrium | 29 Oct 2026 | Physical showcase of quantum hardware components, cryostat models, dilution systems, and educational rigs. |
| **3** | Hackathon Phase 1 | Online | GitHub / Unstop | 5-13 Oct 2026 | Universal Challenge Framework: Algorithm-Architecture Co-Design across 5 tracks. Submissions close 13 Oct. |
| **4** | Conclave / Debate: Quantum vs Classical | Offline | Auditorium | 28 Oct 2026 | Structured debate on quantum advantage timelines, NISQ limits, and quantum-classical hybrid architectures. |
| **5** | Essay Competition | Online | Unstop Portal | 5-13 Oct 2026 | Academic essay writing on quantum computing societal impact, cybersecurity threats, and the quantum economy. |
| **6** | Digital Poster Creation | Online | Unstop Portal | 5-13 Oct 2026 | Creative technical infographic and poster design competition communicating complex quantum principles. |
| **7** | Hardware Circuit Optimization Challenge | Offline | Quantum Lab | 27 Oct 2026 | Hands-on circuit depth and two-qubit gate minimization challenge on simulated hardware constraints. |
| **8** | Photo Booth - Quantum Image World | Offline | Student Center | 26-30 Oct 2026 | Interactive photography and visual engagement installation themed around quantum phenomena. |
| **9** | Tech Marathon | Offline | Auditorium | 27 Oct 2026 | Multi-stage continuous quantum problem solving and coding sprint for campus participants. |
| **10** | Python Coding Challenge in Qiskit | Online | Unstop / JupyterHub | 8 Oct 2026 | Timed algorithmic coding competition implementing quantum functions and circuit primitives. |
| **11** | *Hardware Challenges [DROPPED]* | Dropped | N/A | N/A | Formally dropped per GT-03 and GT-04 to preserve physical lab resources. |
| **12** | Play Activity | Offline | Classrooms | 26 Oct 2026 | Experiential physical mechanics game translating quantum superposition and measurement to group dynamics. |
| **13** | Tech Reels Competition | Online | Instagram / Unstop | 5-13 Oct 2026 | Short-form video competition communicating quantum principles in under 60 seconds. |
| **14** | ML Competition | Online | Kaggle / Unstop | 9-13 Oct 2026 | Quantum-classical hybrid machine learning challenge using variational quantum classifiers. |
| **15** | Quiz Hot Chair Competition | Offline | Seminar Hall 1 | 28 Oct 2026 | Rapid-fire buzzer quiz testing instantaneous recall of quantum physics, linear algebra, and Qiskit SDK. |
| **16** | Drama - Quantum on Stage | Offline | Auditorium | 29 Oct 2026 | Theatrical performance dramatizing historic milestones in quantum physics (Solvay Conference, EPR paradox). |
| **17** | Innovation Challenge | Hybrid | Auditorium / Zoom | 27 Oct 2026 | Pitch competition for novel commercial, industrial, or scientific use cases leveraging quantum algorithms. |
| **18** | Startup Challenge | Hybrid | Auditorium / Zoom | 29 Oct 2026 | Venture pitch competition presenting quantum tech startup business plans to an expert judging panel. |
| **19** | Real-Time App Dev for Persons with Disabilities | Hybrid | Auditorium / Online | 28 Oct 2026 | Assistive technology challenge engineering accessibility solutions using quantum optimization or sensors. |
| **20** | Quantum Gaming - QChess | Offline | Classrooms | 27 Oct 2026 | Chess played on a quantum board where pieces occupy superposition states and entangle upon interaction. |
| **21** | QTalk - Question - 2-Minute Quantum Talk | Offline | Seminar Hall 2 | 28 Oct 2026 | Technical lightning talk competition with 2-minute presentations followed by rapid audience question defense. |
| **22** | Keynote Speeches | Hybrid | Auditorium / Webcast| 30 Oct 2026 | Distinguished lectures by leading IBM Quantum scientists, university researchers, and industry pioneers. |
| **23** | Quantum Gaming - QTicTacToe | Offline | Classrooms | 26 Oct 2026 | Superposition-based tic-tac-toe where moves create entangled cycles collapsed by measurement. |
| **24** | Quantum Gaming - QLudo | Offline | Classrooms | 27 Oct 2026 | Board game integrating probabilistic quantum tunneling and measurement-induced token collapse. |
| **25** | QISKIT 101 - Exploring Track | Online | Webex / YouTube | 5 Oct 2026 | Masterclass Session 2: Hands-on introduction to Qiskit 1.2+, QuantumCircuit, and Primitives V2. |
| **26** | QISKIT 102 - Implementation Track | Offline | Quantum Lab | 27 Oct 2026 | Onsite lab covering transpile pipelines, hardware calibration, and physical execution workflows. |
| **27** | Sample then Diagonalize using Quantum SQD | Offline | Seminar Hall 1 | 28 Oct 2026 | Advanced workshop demonstrating Sample-based Quantum Diagonalization for fermionic systems. |
| **28** | Quantum Casino | Offline | Classrooms | 27 Oct 2026 | Gamified exploration of quantum probability distributions, random number generation, and game theory. |
| **29** | Quiddles | Offline | Classrooms | 26 Oct 2026 | Written lateral thinking riddles and mathematical puzzles grounded in quantum phenomena. |
| **30** | Hands-on In-Class Modules | Offline | Classrooms | 26-29 Oct 2026 | Faculty-led interactive tutorial modules on linear algebra and quantum programming. |
| **31** | Q-Charades | Offline | Classrooms | 26 Oct 2026 | Team guessing game where participants pantomime quantum physics and quantum computing concepts. |
| **32** | *Quantum Go [INFEASIBLE / ARCHIVED]* | Archived | N/A | N/A | Formally archived per GT-03 due to simulation and rule-engine complexity. |
| **33** | Guess the QTech | Offline | Classrooms | 27 Oct 2026 | Mystery tech identification game involving quantum hardware components and experimental diagrams. |
| **34** | Quantum Battleships | Offline | Classrooms | 28 Oct 2026 | Battleship game where ship locations exist in superposition until targeted and measured. |
| **35** | Quantum Solitaire | Offline | Classrooms | 28 Oct 2026 | Single-player logic puzzle involving reversible quantum logic gate synthesis. |
| **36** | Participant Lectures | Offline | Seminar Hall 2 | 29 Oct 2026 | Peer presentation track where student researchers present original findings and seminar projects. |
| **37** | QCTF - Quantum Capture the Flag | Offline | Auditorium | 28 Oct 2026 | 8-hour physical cybersecurity and quantum cryptography challenge conducted in the University Auditorium. |
| **38** | Artwork Competition | Offline | Art Gallery / Foyer | 27 Oct 2026 | Physical art exhibition showcasing quantum-inspired paintings, sculptures, and architectural models. |
| **39** | Quantum Checkers | Offline | Classrooms | 28 Oct 2026 | Checkers played with superposition pieces that split into multiple board paths. |
| **40** | Quantum Code Golf | Online | Online Judge | 10 Oct 2026 | Competitive programming challenge to synthesize target unitary matrices in the fewest possible characters/gates. |
| **41** | QEscapes | Offline | CV Classroom Build | 27-29 Oct 2026 | Physical quantum escape room where participants solve quantum circuit puzzles to unlock door codes. |
| **42** | Quantum Cryptography Challenge | Offline | Quantum Lab | 28 Oct 2026 | Practical lab decrypting BB84 protocol transmissions and identifying eavesdropping via error rate spikes. |
| **43** | Quantum Puzzle Race | Offline | Classrooms | 26 Oct 2026 | Timed puzzle sprint assembling quantum circuit diagrams and solving entanglement logic gates. |
| **44** | Entanglement Partners | Offline | Classrooms | 26 Oct 2026 | Interactive team coordination game modeling Bell state correlation constraints. |
| **45** | Schrodinger's Box | Offline | Classrooms | 27 Oct 2026 | Physical mystery box challenge testing inference of hidden quantum state vectors via projective queries. |
| **46** | Quantum Word Puzzles | Offline | Classrooms | 26 Oct 2026 | Crosswords and word searches testing quantum physics and quantum computer architecture terminology. |
| **47** | Quantum Skribble | Offline | Classrooms | 26 Oct 2026 | Real-time drawing and guessing game based on quantum algorithms, scientists, and physical hardware. |
| **48** | Quantum Algo Sprint | Offline | Classrooms | 29 Oct 2026 | Rapid pen-and-paper circuit design sprint solving algorithmic transformation puzzles. |
| **49** | Quantum Entropy Challenge | Online | Online Judge | 11 Oct 2026 | Online challenge analyzing quantum entropy, von Neumann entropy, and mixed state density matrices. |
| **50** | Quantum Noise Forensics | Online | JupyterHub | 12 Oct 2026 | Reverse-engineering error channels (depolarizing, amplitude damping, phase damping) from noisy circuit data. |
| **51** | Quantum Error Correction | Online | Webex | 6 Oct 2026 | Masterclass Module: Repetition codes, surface code stabilizers, and logical qubit concepts. |
| **52** | Quantum Error Detection with Paulice | Online | Webex | 6 Oct 2026 | Masterclass Module: Detecting quantum gate faults using Qiskit Paulice tools. |
| **53** | *Quantum Magnetometry [INFEASIBLE / ARCHIVED]* | Archived | N/A | N/A | Formally archived per GT-03 due to lab sensor requirements. |
| **54** | Quantum Teleportation Challenge | Online | JupyterHub | 9 Oct 2026 | Hands-on circuit simulation implementing state teleportation across distributed Bell pairs. |
| **55** | Quantum Singular Value Transformation | Online | Webex | 7 Oct 2026 | Masterclass Module: Theoretical foundations of QSVT as a unified framework for quantum algorithms. |
| **56** | Quantum Repeaters & Entanglement | Online | Webex | 7 Oct 2026 | Masterclass Module: Long-distance entanglement distribution, quantum memories, and repeater nodes. |
| **57** | Low-Level Control & Pulse Engineering | Online | Webex | 8 Oct 2026 | Masterclass Module: Qiskit Pulse microwave drive scheduling, DRAG correction, and qubit frequency tuning. |
| **58** | Quantum Resource Estimation | Online | Webex | 8 Oct 2026 | Masterclass Module: Fault-tolerant overhead calculation, T-gate counts, and physical qubit footprints. |
| **59** | Quantum Algorithms Beyond NISQ | Online | Webex | 9 Oct 2026 | Masterclass Module: High-depth algorithms, fault-tolerant Shor's algorithm, and post-NISQ applications. |
| **60** | Capstone: Hackathon Phase 2 Onsite | Offline | Auditorium | 27-28 Oct 2026 | Flagship 24-26 hour onsite hackathon for qualified Phase 1 finalists in the SRM-AP University Auditorium. |
"""

def build_faq_markdown() -> str:
    return """# Qiskit Fall Fest 2026: Frequently Asked Questions (FAQ)

**Host Institution:** SRM University-AP (Amaravati)  
**Host Designation:** Partner Plus Host  
**Official Website:** https://www.qffsrmap2026.com/  
**Registration:** Unstop  

---

## 1. General & Registration

### What is Qiskit Fall Fest 2026 at SRM University-AP?
Qiskit Fall Fest is a global celebration of quantum computing sponsored by IBM Quantum. SRM University-AP has been recognized as a premier **Partner Plus Host**, organizing a two-phase technical festival commemorating "A Decade of Quantum on Cloud" with 59 active events, an intensive 10-session masterclass, and an onsite 24-26 hour hackathon.

### Who is eligible to participate?
Undergraduate and postgraduate students, researchers, PhD scholars, and developers across computer science, electrical engineering, physics, mathematics, and chemistry. Both beginners and experienced developers are welcome.

### How do I register?
Official registrations are hosted on **Unstop** (launching 25 September 2026). Links to individual event tracks and the masterclass are available on the festival website: https://www.qffsrmap2026.com/

### Is there a registration fee?
Participation in Qiskit Fall Fest 2026 sessions, workshops, and hackathons is completely free of charge.

---

## 2. Masterclass Series (5-9 October 2026)

### Do I need prior quantum computing experience?
No. The Masterclass Series begins with Quantum Basics (Session 1) and Qiskit 101 (Session 2) before advancing through hardware topologies, transpiler compilation, variational algorithms, and custom processor co-design.

### Will I receive a certificate?
Yes. Participants who attend the masterclass sessions and complete the hands-on lab modules will receive an official **IBM x SRMUAP Masterclass Certificate of Completion**.

### Can I participate in the Masterclass individually?
Yes. Masterclass registration and participation is individual, even if you plan to compete in the hackathon as a team.

---

## 3. Flagship Hackathon (Phase 1 & Phase 2)

### What is the team size?
Hackathon teams must consist of **2 to 4 members**. Solo participation is not permitted for the hackathon.

### How does Phase 1 work?
Phase 1 is an online sprint from **5 to 13 October 2026**. Teams select one of five domain tracks (Chemistry, Optimization, Simulation, QML, PQC) and benchmark their algorithm across three fixed quantum backends (Processors A, B, and C). Teams then propose a custom 12-qubit Processor D that resolves identified communication bottlenecks. Submissions close on **13 October at 11:59 PM IST**.

### What are the submission deliverables?
Teams must provide a public GitHub or Hugging Face Space repository containing:
1. `README.md` with methodology and reproduction steps.
2. `main.ipynb` (or `.py`) with runnable code using Qiskit 1.2+ and Primitives V2.
3. `processors/` directory containing coupling maps (`processor_A.json`, `processor_B.json`, `processor_C.json`, `processor_D.json`).
4. `results/` directory with benchmark figures and comparative tables.

### How are submissions evaluated?
Submissions are evaluated on a **100-point rubric**:
- **40 Points:** Core Problem Implementation & Solution Correctness
- **30 Points:** Architecture Analysis & Benchmarking across Processors A, B, and C
- **30 Points:** Custom Processor D Innovation, bottleneck resolution, and engineering rationale

### When are finalists announced?
Phase 1 finalists (~200 participants / top 10-12 teams per track) will be announced on the night of **17 October 2026**.

### What is Phase 2?
Phase 2 is a **24-26 hour onsite hackathon** conducted in the University Auditorium at SRM University-AP on **27-28 October 2026**, where qualified finalists tackle an advanced scaling challenge in person.

---

## 4. Campus Phase & Logistics (26-30 October 2026)

### Where is the festival hosted?
SRM University-AP Campus, Neerukonda, Mangalagiri Mandal, Guntur District, Mangalagiri, Andhra Pradesh 522502, India.

### What are the key campus venues?
- **University Auditorium:** Keynote lectures, Opening/Closing ceremonies, 24-26h Hackathon, QCTF, and major challenges.
- **Quantum Computing Lab / Complex:** Hardware Quantum Tech Expo and hands-on laboratory tracks.
- **Seminar Halls 1 & 2:** Specialized technical talks, paper presentations, and conclave debates.
- **Classrooms (V, CV, SR Venues):** Classroom games, puzzle competitions, and Qescapes escape room.

### What about Wi-Fi access on campus?
The festival organizers are coordinating directly with SRM ITKM to ensure high-speed Wi-Fi and whitelisting of essential development domains (GitHub, Hugging Face, IBM Quantum Cloud endpoints).
"""

def build_llms_full_txt() -> str:
    masterclass = build_masterclass_markdown()
    hackathon = build_hackathon_framework_markdown()
    portfolio = build_event_portfolio_markdown()
    faq = build_faq_markdown()
    
    return f"""# Qiskit Fall Fest 2026 — SRM University-AP (Amaravati)
# Comprehensive AI Knowledge Dossier & Master Manifest

> Official Complete AI Reference Dossier for Qiskit Fall Fest 2026 at SRM University-AP (Amaravati). This single consolidated document embeds the full masterclass curriculum, universal challenge framework, 100-point judging rubric, complete 59-event breakdown, campus logistics, and frequently asked questions for high-context language models and autonomous agents.

Official Platform: https://www.qffsrmap2026.com/
Planning Repository: https://github.com/sahgyan9/Qiskit-Fall-Fest-SRMAP-2026
Web Platform Repository: https://github.com/qiskitfallfest-srmap/QisKit-Fall-Fest-2026
Host Designation: Partner Plus Host (SRM University-AP in partnership with IBM Quantum and Aanutattva - The Singularity Lab)
Theme: A Decade of Quantum on Cloud (10 Years of Cloud Quantum Computing, 2016-2026)
Online Phase: 5 October 2026 to 13 October 2026
Campus Phase: 26 October 2026 to 30 October 2026
Registration Platform: Unstop (Launching 25 September 2026)

---

# SECTION 1: MASTERCLASS SERIES CURRICULUM (v1.2)

{masterclass}

---

# SECTION 2: HACKATHON UNIVERSAL CHALLENGE FRAMEWORK

{hackathon}

---

# SECTION 3: COMPLETE 59-EVENT FESTIVAL PORTFOLIO

{portfolio}

---

# SECTION 4: FREQUENTLY ASKED QUESTIONS (FAQ) & CAMPUS GUIDE

{faq}
"""

def main():
    planning_repo, web_repo = get_paths()
    print(f"Planning Repository Root: {planning_repo}")
    print(f"Web Platform Repository Root: {web_repo}")
    
    # 1. Generate web repo public/llms.txt
    web_public = web_repo / "public"
    web_docs = web_public / "docs"
    web_docs.mkdir(parents=True, exist_ok=True)
    
    llms_txt_path = web_public / "llms.txt"
    llms_txt_content = build_llms_txt()
    with open(llms_txt_path, "w", encoding="utf-8") as f:
        f.write(llms_txt_content)
    print(f"Wrote {llms_txt_path} ({len(llms_txt_content):,} chars)")
    
    # 2. Generate web repo public/llms-full.txt
    llms_full_path = web_public / "llms-full.txt"
    llms_full_content = build_llms_full_txt()
    with open(llms_full_path, "w", encoding="utf-8") as f:
        f.write(llms_full_content)
    print(f"Wrote {llms_full_path} ({len(llms_full_content):,} chars)")
    
    # 3. Generate standalone markdown documents under public/docs/
    doc_files = {
        web_docs / "masterclass-curriculum.md": build_masterclass_markdown(),
        web_docs / "hackathon-challenge-framework.md": build_hackathon_framework_markdown(),
        web_docs / "event-portfolio-59.md": build_event_portfolio_markdown(),
        web_docs / "faq.md": build_faq_markdown(),
    }
    for doc_path, doc_content in doc_files.items():
        with open(doc_path, "w", encoding="utf-8") as f:
            f.write(doc_content)
        print(f"Wrote {doc_path} ({len(doc_content):,} chars)")
        
    # 4. Generate planning repo root llms.txt
    planning_llms_path = planning_repo / "llms.txt"
    planning_llms_content = build_planning_llms_txt()
    with open(planning_llms_path, "w", encoding="utf-8") as f:
        f.write(planning_llms_content)
    print(f"Wrote {planning_llms_path} ({len(planning_llms_content):,} chars)")
    
    # 5. Mirror tools and workflows to web repo if present
    web_tools = web_repo / "tools"
    web_tools.mkdir(parents=True, exist_ok=True)
    web_tool_dest = web_tools / "generate_llms_manifests.py"
    with open(web_tool_dest, "w", encoding="utf-8") as f:
        with open(__file__, "r", encoding="utf-8") as src:
            f.write(src.read())
    print(f"Mirrored generator tool to {web_tool_dest}")

    print("Generation completed successfully.")

if __name__ == "__main__":
    main()
