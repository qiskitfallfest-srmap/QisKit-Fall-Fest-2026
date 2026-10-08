export interface PublicTest {
  id: string;
  name: string;
  description: string;
  inputSummary: string;
  expectedSummary: string;
}

export interface CodingChallenge {
  id: string;
  problemCode: string;
  title: string;
  level: 'L1' | 'L2' | 'L3' | 'L4';
  levelLabel: string;
  points: number;
  functionName: string;
  starterCode: string;
  description: string;
  constraints: string;
  timeLimitMs: number;
  memoryLimitMb: number;
  publicTests: PublicTest[];
}

export const QISKIT_CHALLENGES: CodingChallenge[] = [
  {
    id: 'P1',
    problemCode: 'P1',
    title: 'Ket Reader',
    level: 'L1',
    levelLabel: 'Foundations',
    points: 6,
    functionName: 'prepare_ket',
    starterCode: `from qiskit import QuantumCircuit

def prepare_ket(ket: str) -> QuantumCircuit:
    """
    Given a basis state written in textbook notation |q0 q1 ... qn-1>,
    where the leftmost character is qubit 0, return a circuit that
    prepares exactly that state from |0...0>.
    """
    # Write your code here
    pass
`,
    description: `Given a basis state written in textbook notation $|q_0 q_1 \\dots q_{n-1}\\rangle$, where the leftmost character is qubit 0, return a circuit that prepares exactly that state from $|0 \\dots 0\\rangle$.

**Example:**
\`prepare_ket("10")\` means $q_0 = 1$, $q_1 = 0$; therefore Qiskit's probability key is \`"01"\` (little-endian: qubit 0 on the far right).`,
    constraints: `• Input: 1 ≤ n ≤ 12, characters only '0' or '1'.
• Return exactly n qubits, no classical bits, and no measurements.
• Circuit size must be ≤ 3n.
• Do not use initialize, StatePreparation, UnitaryGate, or Isometry.`,
    timeLimitMs: 5000,
    memoryLimitMb: 512,
    publicTests: [
      {
        id: 'p1_test1',
        name: 'Single Qubit Zero',
        description: 'Prepare ground state |0⟩',
        inputSummary: 'ket = "0"',
        expectedSummary: 'P(|0⟩) = 1.0',
      },
      {
        id: 'p1_test2',
        name: 'Single Qubit One',
        description: 'Prepare excited state |1⟩',
        inputSummary: 'ket = "1"',
        expectedSummary: 'P(|1⟩) = 1.0',
      },
      {
        id: 'p1_test3',
        name: 'Two Qubits (10)',
        description: 'Prepare state |10⟩ (q0=1, q1=0)',
        inputSummary: 'ket = "10"',
        expectedSummary: 'Qiskit key "01" has probability 1.0',
      },
      {
        id: 'p1_test4',
        name: 'Three Qubits (101)',
        description: 'Prepare state |101⟩ (q0=1, q1=0, q2=1)',
        inputSummary: 'ket = "101"',
        expectedSummary: 'Qiskit key "101" has probability 1.0',
      },
    ],
  },
  {
    id: 'P2',
    problemCode: 'P2',
    title: 'Parity Probe',
    level: 'L1',
    levelLabel: 'Foundations',
    points: 8,
    functionName: 'parity_probe',
    starterCode: `from qiskit import QuantumCircuit

def parity_probe(n: int) -> QuantumCircuit:
    """
    Build a circuit on n data qubits (0..n-1), one ancilla at qubit n,
    and one classical bit. The circuit must measure the parity of the
    data register into the classical bit without disturbing the data state.
    """
    # Write your code here
    pass
`,
    description: `Build a circuit on $n$ data qubits ($0 \\dots n-1$), one ancilla at qubit $n$, and one classical bit. The circuit must measure the parity of the data register into the classical bit without disturbing the data state.

**Example:**
For $n = 2$:
$|11\\rangle \\to$ parity 0
$|10\\rangle \\to$ parity 1`,
    constraints: `• Return n+1 qubits and 1 classical bit.
• The only measurement must be the final measure(n, 0).
• Superposition on data qubits must be preserved without stray phases.`,
    timeLimitMs: 5000,
    memoryLimitMb: 512,
    publicTests: [
      {
        id: 'p2_test1',
        name: 'Single Bit Parity',
        description: 'Data register n=1',
        inputSummary: 'n = 1',
        expectedSummary: 'Parity of single bit measured correctly',
      },
      {
        id: 'p2_test2',
        name: 'Two Bits Parity',
        description: 'Data register n=2 across computational basis',
        inputSummary: 'n = 2',
        expectedSummary: '|00⟩->0, |01⟩->1, |10⟩->1, |11⟩->0',
      },
      {
        id: 'p2_test3',
        name: 'Preserves Superposition',
        description: 'Data register in (|00⟩ + |11⟩)/√2',
        inputSummary: 'n = 2 Bell input',
        expectedSummary: 'Data state undamaged after parity check',
      },
    ],
  },
  {
    id: 'P3',
    problemCode: 'P3',
    title: 'Repair Shop',
    level: 'L2',
    levelLabel: 'Algorithms',
    points: 10,
    functionName: 'repair_circuit',
    starterCode: `from qiskit import QuantumCircuit

def repair_circuit(buggy: QuantumCircuit, target) -> QuantumCircuit:
    """
    You receive a circuit intended to prepare a target state but containing
    1-2 seeded faults. Return a corrected circuit.
    """
    # Write your code here
    pass
`,
    description: `You receive a circuit intended to prepare a target state but containing 1–2 seeded faults. Return a corrected circuit.

Faults can include:
- Swapped CX control/target direction
- Wrong target qubit
- Inverted rotation angle sign
- Missing gate
- Inverted phase gate ($S \\leftrightarrow S^\\dagger$ or $X \\leftrightarrow Z$)`,
    constraints: `• Input: n = 3..5 qubits, ≤ 30 gates, no measurements.
• Allowed output gates: h, x, y, z, s, sdg, t, tdg, sx, rx, ry, rz, cx, cz, swap.
• State-synthesis gates (initialize, StatePreparation, UnitaryGate, Isometry) are strictly banned.
• Output size ≤ buggy.size() + 3.
• Statevector fidelity ≥ 1 - 1e-9.`,
    timeLimitMs: 7000,
    memoryLimitMb: 512,
    publicTests: [
      {
        id: 'p3_test1',
        name: 'No Fault Baseline',
        description: 'Verify circuit already matching target',
        inputSummary: 'Identity bug-free 3-qubit circuit',
        expectedSummary: 'Fidelity = 1.0',
      },
      {
        id: 'p3_test2',
        name: 'Single CX Direction Swap',
        description: 'CX(0, 1) accidentally inverted to CX(1, 0)',
        inputSummary: '3-qubit circuit with 1 reversed CX',
        expectedSummary: 'Corrected CX restores fidelity ≥ 1 - 1e-9',
      },
      {
        id: 'p3_test3',
        name: 'Missing Single Phase Gate',
        description: 'Circuit missing an S gate on qubit 2',
        inputSummary: '4-qubit circuit with missing S gate',
        expectedSummary: 'Fidelity restored ≥ 1 - 1e-9',
      },
    ],
  },
  {
    id: 'P4',
    problemCode: 'P4',
    title: 'Floating-Ancilla Bernstein–Vazirani',
    level: 'L2',
    levelLabel: 'Algorithms',
    points: 10,
    functionName: 'bernstein_vazirani',
    starterCode: `from qiskit import QuantumCircuit

def bernstein_vazirani(oracle: QuantumCircuit, n: int, anc: int) -> QuantumCircuit:
    """
    Given an oracle implementing f(x) = s·x ⊕ b on n data qubits plus
    one output qubit located at index anc, recover s with one oracle call.
    """
    # Write your code here
    pass
`,
    description: `Given an oracle implementing $f(x) = s \\cdot x \\oplus b$ on $n$ data qubits plus one output qubit located at arbitrary index \`anc\`, recover the hidden bitstring $s$ with exactly one oracle call.

The data qubits are the remaining qubit indices in strictly increasing order. Hidden tests vary ancilla position (\`anc = 0\`, middle, or $n$), secret string $s$, bias $b \\in \\{0, 1\\}$, and $n$.`,
    constraints: `• Return n+1 qubits and n classical bits.
• Clbit k must store recovered data bit k.
• The oracle must be appended exactly once, as supplied.`,
    timeLimitMs: 5000,
    memoryLimitMb: 512,
    publicTests: [
      {
        id: 'p4_test1',
        name: 'Last Qubit Ancilla (Standard)',
        description: 'n=2, anc=2, secret s="10", b=0',
        inputSummary: 'n = 2, anc = 2, s = "10"',
        expectedSummary: 'P(measured s = "10") = 1.0',
      },
      {
        id: 'p4_test2',
        name: 'First Qubit Ancilla with Bias',
        description: 'n=3, anc=0, secret s="110", b=1',
        inputSummary: 'n = 3, anc = 0, s = "110", b = 1',
        expectedSummary: 'P(measured s = "110") = 1.0',
      },
      {
        id: 'p4_test3',
        name: 'Middle Qubit Ancilla',
        description: 'n=3, anc=1, secret s="011", b=0',
        inputSummary: 'n = 3, anc = 1, s = "011", b = 0',
        expectedSummary: 'P(measured s = "011") = 1.0',
      },
    ],
  },
  {
    id: 'P5',
    problemCode: 'P5',
    title: 'Any-Pauli Estimator',
    level: 'L2',
    levelLabel: 'Algorithms',
    points: 10,
    functionName: 'pauli_measurement_circuit',
    starterCode: `from qiskit import QuantumCircuit

def pauli_measurement_circuit(state_prep: QuantumCircuit, pauli: str) -> QuantumCircuit:
    """
    Append basis rotations and measure every qubit i into clbit i.
    Pauli labels use Qiskit convention: rightmost character acts on qubit 0.
    """
    # Write your code here
    pass

def expectation_from_counts(counts: dict, pauli: str) -> float:
    """
    Estimate expectation value from measurement counts dictionary.
    Counts are length-n strings with clbit 0 on the right.
    """
    # Write your code here
    pass
`,
    description: `Implement two complementary functions:
1. \`pauli_measurement_circuit(state_prep, pauli) -> QuantumCircuit\`
2. \`expectation_from_counts(counts, pauli) -> float\`

Pauli labels use Qiskit convention: **rightmost character acts on qubit 0**.
Counts are length-$n$ bitstrings with clbit 0 on the right.

For the measurement circuit:
- Append basis rotations and measure every qubit $i$ into clbit $i$.
- **X** uses $H$
- **Y** uses $S^\\dagger$ then $H$
- **Z / I** require no basis rotation

The estimator computes:
$$\\mathbb{E}\\left[(-1)^{\\text{parity of measured bits on the Pauli support}}\\right]$$
All-identity string (e.g. \`"III"\`) always returns \`1.0\`.`,
    constraints: `• Grade the two functions independently (6 pts circuit + 4 pts estimator).
• Support strings of X, Y, Z, I up to length 6.
• Accurate parity arithmetic on count keys.`,
    timeLimitMs: 6000,
    memoryLimitMb: 512,
    publicTests: [
      {
        id: 'p5_test1',
        name: 'Single Qubit Z on |0⟩',
        description: 'Expectation of Z on ground state',
        inputSummary: 'pauli = "Z", counts = {"0": 1000}',
        expectedSummary: '⟨Z⟩ = +1.0',
      },
      {
        id: 'p5_test2',
        name: 'Single Qubit X on |+⟩',
        description: 'Circuit basis change with H',
        inputSummary: 'state_prep = H(|0⟩), pauli = "X"',
        expectedSummary: '⟨X⟩ = +1.0',
      },
      {
        id: 'p5_test3',
        name: 'Two Qubit All-Identity',
        description: 'Identity expectation without rotation',
        inputSummary: 'pauli = "II", any counts',
        expectedSummary: '⟨II⟩ = 1.0',
      },
    ],
  },
  {
    id: 'P6',
    problemCode: 'P6',
    title: 'Shift-Rule Gradient',
    level: 'L2',
    levelLabel: 'Algorithms',
    points: 11,
    functionName: 'param_shift_gradient',
    starterCode: `import numpy as np
from qiskit import QuantumCircuit

def param_shift_gradient(circuit: QuantumCircuit, values: list, evaluate) -> np.ndarray:
    """
    Given a parameterized circuit and a black-box evaluator returning an
    expectation value for a bound circuit, return the gradient with respect
    to each parameter using the parameter-shift rule.
    """
    # Write your code here
    pass
`,
    description: `Given a parameterized circuit and a black-box evaluator returning an expectation value for a bound circuit, return the gradient vector with respect to each parameter.

$$\\frac{\\partial \\langle H \\rangle}{\\partial \\theta} = \\frac{\\langle H \\rangle_{\\theta + \\frac{\\pi}{2}} - \\langle H \\rangle_{\\theta - \\frac{\\pi}{2}}}{2}$$

Parameterized gates are \`rx\`, \`ry\`, \`rz\`, or \`rzz\` with angles $a \\cdot \\theta + b$. Parameters may be reused across multiple gates. Do not call \`evaluate\` on an unbound circuit.`,
    constraints: `• 1–8 parameters, in circuit.parameters order.
• At most two evaluator calls per parameterized-gate occurrence.
• Accumulate gradient correctly when a parameter appears multiple times.
• Gradient numerical tolerance: 5e-6.`,
    timeLimitMs: 8000,
    memoryLimitMb: 512,
    publicTests: [
      {
        id: 'p6_test1',
        name: 'Single Parameter RX',
        description: 'd/dθ ⟨Z⟩ for RX(θ)|0⟩ at θ=π/4',
        inputSummary: '1 parameter, θ = π/4',
        expectedSummary: 'grad ≈ [-0.7071]',
      },
      {
        id: 'p6_test2',
        name: 'Two Parameters RY and RZ',
        description: 'RY(θ0) then RZ(θ1)',
        inputSummary: 'values = [0.5, 1.2]',
        expectedSummary: 'Analytic gradient verified within 5e-6',
      },
    ],
  },
  {
    id: 'P7',
    problemCode: 'P7',
    title: 'Directed-Coupling Router',
    level: 'L3',
    levelLabel: 'Transpilation',
    points: 12,
    functionName: 'route_to_coupling',
    starterCode: `from qiskit import QuantumCircuit

def route_to_coupling(circuit: QuantumCircuit, coupling: list) -> QuantumCircuit:
    """
    Rewrite circuit so that it uses only {cx, rz, sx, x}, every CX follows
    the directed coupling map, and the overall unitary is unchanged.
    """
    # Write your code here
    pass
`,
    description: `Rewrite an input circuit so that:
1. It uses only basis gates: \`{'cx', 'rz', 'sx', 'x'}\`
2. Every two-qubit gate is a \`cx\` whose directed edge $(u, v)$ belongs strictly to the directed coupling list \`coupling\`
3. The overall unitary operator is preserved (up to global phase) with **zero residual qubit permutations** (initial layout matches final layout).`,
    constraints: `• Input: n = 4..7 qubits, ≤ 40 gates from {h, x, s, t, rz, cx, cz, swap}.
• Coupling is directed; connected when directions are ignored.
• No ancilla qubits allowed.
• Scoring: 6 pts correctness (Operator equivalence + valid edges) + 6 pts transpilation quality (CX count ratio vs reference).`,
    timeLimitMs: 10000,
    memoryLimitMb: 512,
    publicTests: [
      {
        id: 'p7_test1',
        name: 'Linear 4-Qubit Chain with CX(0, 2)',
        description: 'Route CX across non-adjacent nodes',
        inputSummary: 'coupling = [(0,1), (1,2), (2,3)]',
        expectedSummary: 'Operator matches, all CX in coupling map',
      },
      {
        id: 'p7_test2',
        name: 'Reversed Directed Edge',
        description: 'Circuit requires CX(1, 0) but coupling only has (0, 1)',
        inputSummary: 'CX reversed using Hadamard reversal',
        expectedSummary: 'Operator matches, valid directed CX',
      },
    ],
  },
  {
    id: 'P8',
    problemCode: 'P8',
    title: 'Noise-Scaled Extrapolation (ZNE)',
    level: 'L3',
    levelLabel: 'Error Mitigation',
    points: 15,
    functionName: 'zne_expectation',
    starterCode: `import numpy as np
from qiskit import QuantumCircuit

def zne_expectation(circuit: QuantumCircuit, z_mask: str, run, shots: int) -> float:
    """
    Estimate the ideal expectation of a Z/I Pauli mask from a noisy backend
    using unitary folding and extrapolation.
    """
    # Write your code here
    pass
`,
    description: `Estimate the ideal zero-noise expectation value of a $Z/I$ Pauli mask from a noisy quantum backend using **Zero-Noise Extrapolation (ZNE)** with unitary folding ($G \\to G(G^\\dagger G)^k$).

The rightmost character of \`z_mask\` acts on qubit 0.
The callback \`run(qc_with_measurements, shots) -> dict\` executes your measured circuit on a noisy simulator.`,
    constraints: `• Input: n ≤ 4 qubits, gates in {rz, sx, x, cx}, no initial measurements.
• Maximum 10 \`run\` calls and 40,000 total shots across calls.
• Pass condition: |estimate - ideal| ≤ τ and mitigated error ≤ 0.5 × raw error when raw noise error > 0.06.`,
    timeLimitMs: 10000,
    memoryLimitMb: 512,
    publicTests: [
      {
        id: 'p8_test1',
        name: '2-Qubit Bell State ZZ Expectation',
        description: 'Test global folding at scale factors 1, 3, 5 with polynomial extrapolation',
        inputSummary: 'circuit = Bell pair, z_mask = "ZZ"',
        expectedSummary: 'Mitigated expectation closer to +1.0 than noisy raw',
      },
    ],
  },
  {
    id: 'P9',
    problemCode: 'P9',
    title: 'Weighted-MaxCut QAOA',
    level: 'L4',
    levelLabel: 'Quantum Optimization',
    points: 18,
    functionName: 'qaoa_maxcut',
    starterCode: `from qiskit import QuantumCircuit

def qaoa_maxcut(n: int, edges: list, p: int) -> QuantumCircuit:
    """
    Build a fully bound QAOA circuit for weighted MaxCut.
    Input: n=2..10, weighted edges (u, v, w), p in {1, 2}.
    Return n qubits and n classical bits, no free parameters,
    q_i measured into c_i.
    """
    # Write your code here
    pass
`,
    description: `Construct a fully parameter-bound Quantum Approximate Optimization Algorithm (QAOA) circuit for weighted MaxCut on an arbitrary graph.

**Required circuit structure:**
1. Initial state: $H$ on every qubit $0 \\dots n-1$.
2. For each layer $k = 0 \\dots p-1$:
   - Cost unitary: one \`rzz(2 * gamma_k * w, u, v)\` for every weighted edge $(u, v, w)$ with layer parameter $\\gamma_k$.
   - Mixer unitary: one \`rx(2 * beta_k, q)\` for every qubit $q$ with layer parameter $\\beta_k$.
3. Measurement: every qubit $q_i$ measured into classical bit $c_i$.
4. **No free or unbound parameters!** All angles must be optimized numeric floats.`,
    constraints: `• Input: n = 2..10, weighted edges (u, v, w), p ∈ {1, 2}.
• Return n qubits and n classical bits.
• Strict structural validation (exact gate sequence and counts).
• Continuous score based on expected cut: clamp((E - E_rand) / (0.97 * E_ref - E_rand), 0, 1) * 18 pts.`,
    timeLimitMs: 12000,
    memoryLimitMb: 512,
    publicTests: [
      {
        id: 'p9_test1',
        name: '3-Node Triangle Graph (p=1)',
        description: 'Complete K3 graph with unit weights',
        inputSummary: 'n=3, edges=[(0,1,1),(1,2,1),(0,2,1)], p=1',
        expectedSummary: 'Expected cut > random baseline (1.5) with bound angles',
      },
      {
        id: 'p9_test2',
        name: '4-Node Bipartite Graph (p=1)',
        description: 'C4 cycle graph with unit weights',
        inputSummary: 'n=4, edges=[(0,1,1),(1,2,1),(2,3,1),(3,0,1)], p=1',
        expectedSummary: 'Expected cut approaches max cut (4.0)',
      },
    ],
  },
];
