export interface ProblemExample {
  id: number;
  input: string;
  output: string;
  explanation?: string;
}

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
  difficulty: 'Easy' | 'Medium' | 'Hard';
  level: 'L1' | 'L2' | 'L3' | 'L4';
  levelLabel: string;
  points: number;
  tags: string[];
  functionName: string;
  starterCode: string;
  description: string;
  examples: ProblemExample[];
  constraints: string[];
  timeLimitMs: number;
  memoryLimitMb: number;
  publicTests: PublicTest[];
}

export const QISKIT_CHALLENGES: CodingChallenge[] = [
  {
    id: 'P1',
    problemCode: 'P1',
    title: 'Ket Reader',
    difficulty: 'Easy',
    level: 'L1',
    levelLabel: 'Foundations',
    points: 6,
    tags: ['Quantum Circuits', 'Basis Preparation', 'Endianness', 'Qiskit'],
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
    description: `Given a binary string \`ket\` of length n representing a basis state written in standard textbook notation:

$$|q₀ q₁ … qₙ₋₁⟩$$

where the **leftmost character is qubit 0**, return a \`QuantumCircuit\` that prepares exactly that state starting from the all-zero state |0 … 0⟩.

> **Note on Endianness:**
> Qiskit represents measurement bitstrings in **little-endian order** (qubit 0 is the rightmost bit). For example, if q₀ = 1 and q₁ = 0, the textbook state is |10⟩, but Qiskit's probability key is \`"01"\`.`,
    examples: [
      {
        id: 1,
        input: 'ket = "10"',
        output: 'QuantumCircuit(2)',
        explanation: 'Qubit 0 is in state |1> and qubit 1 is in state |0>. Applying an X gate on qubit 0 transforms |00> into |10> (Qiskit measurement key "01").',
      },
      {
        id: 2,
        input: 'ket = "101"',
        output: 'QuantumCircuit(3)',
        explanation: 'Qubits 0 and 2 are in state |1>, and qubit 1 is in state |0>. Applying X gates to qubits 0 and 2 prepares |101> (Qiskit measurement key "101").',
      },
      {
        id: 3,
        input: 'ket = "0"',
        output: 'QuantumCircuit(1)',
        explanation: 'Qubit 0 is already in state |0>, so an empty 1-qubit circuit without gates is sufficient.',
      },
    ],
    constraints: [
      '1 <= len(ket) <= 12',
      'ket consists only of characters \'0\' and \'1\'.',
      'The returned circuit must have exactly len(ket) qubits and 0 classical bits.',
      'Do not append measurement gates.',
      'Circuit total gate count must be <= 3 * len(ket).',
      'State-synthesis gates (initialize, StatePreparation, UnitaryGate, Isometry) are strictly prohibited.',
    ],
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
    difficulty: 'Easy',
    level: 'L1',
    levelLabel: 'Foundations',
    points: 8,
    tags: ['Entanglement', 'Parity Measurement', 'Ancilla Qubit', 'CX Gates'],
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
    description: `Build a quantum circuit on n data qubits (0 … n-1), one ancilla qubit located at index n, and one classical bit.

The circuit must measure the parity of the data register into the classical bit:
$$parity(x) = (∑ xᵢ) mod 2$$

**Requirements:**
1. The measurement must not disturb the superposition or relative phases of the data state.
2. The only allowed measurement in the circuit is the final \`measure(n, 0)\`.`,
    examples: [
      {
        id: 1,
        input: 'n = 2',
        output: 'QuantumCircuit(3, 1)',
        explanation: 'For input |11> on qubits 0 and 1, parity is (1+1) mod 2 = 0. Ancilla measures 0. For |10>, parity is 1. Ancilla measures 1.',
      },
      {
        id: 2,
        input: 'n = 3',
        output: 'QuantumCircuit(4, 1)',
        explanation: '3 data qubits (0, 1, 2) plus 1 ancilla at qubit 3. Measures parity of 3 bits into clbit 0.',
      },
    ],
    constraints: [
      '1 <= n <= 8',
      'The returned circuit must have exactly n + 1 qubits and 1 classical bit.',
      'The only measurement instruction must be measure(n, 0).',
      'Superposition on the data qubits must be preserved without introducing unwanted relative phases.',
    ],
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
    difficulty: 'Medium',
    level: 'L2',
    levelLabel: 'Algorithms',
    points: 10,
    tags: ['Circuit Debugging', 'Fidelity', 'State Matching', 'Gate Mutations'],
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
    description: `You are given a \`buggy\` circuit intended to prepare a \`target\` statevector, but it contains **1 to 2 seeded faults**.

Return a repaired \`QuantumCircuit\` such that the state fidelity between the output state and the target state satisfies:
$$F(ψ_repaired, ψ_target) ≥ 1 - 10⁻⁹$$

**Possible Faults:**
- Swapped CX control and target direction
- Wrong qubit index on a single gate
- Inverted rotation angle sign
- Missing single gate
- Phase gate swap (S ↔ S† or X ↔ Z)`,
    examples: [
      {
        id: 1,
        input: 'buggy = Circuit with CX(1, 0) instead of CX(0, 1)',
        output: 'Repaired QuantumCircuit',
        explanation: 'Swapping the CX control/target back to (0, 1) restores fidelity 1.0 with the target state.',
      },
    ],
    constraints: [
      'Input n = 3..5 qubits, <= 30 gates, no measurements.',
      'Allowed output gates: h, x, y, z, s, sdg, t, tdg, sx, rx, ry, rz, cx, cz, swap.',
      'State-synthesis gates (initialize, StatePreparation, UnitaryGate, Isometry) are strictly banned.',
      'Repaired circuit size must be <= buggy.size() + 3.',
      'Statevector fidelity with target must be >= 1 - 1e-9.',
    ],
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
    difficulty: 'Medium',
    level: 'L2',
    levelLabel: 'Algorithms',
    points: 10,
    tags: ['Bernstein-Vazirani', 'Oracle Algorithms', 'Phase Kickback'],
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
    description: `Given a black-box oracle gate implementing an affine boolean function:
$$f(x) = (s · x) ⊕ b$$

acting on n data qubits plus one output ancilla qubit located at an **arbitrary index** \`anc\`, construct a quantum circuit that recovers the secret bitstring s with **exactly one query** to the oracle.

The data qubits are all remaining qubit indices {0, 1, …, n} \\ {anc} in strictly increasing order.`,
    examples: [
      {
        id: 1,
        input: 'n = 2, anc = 2, oracle = f(x) with s = "10", b = 0',
        output: 'QuantumCircuit(3, 2)',
        explanation: 'Ancilla is at index 2 (standard last qubit). Classical bits 0 and 1 measure the data qubits to retrieve s = "10".',
      },
      {
        id: 2,
        input: 'n = 3, anc = 0, oracle = f(x) with s = "110", b = 1',
        output: 'QuantumCircuit(4, 3)',
        explanation: 'Ancilla is at index 0 (first qubit). Data qubits are at indices 1, 2, 3.',
      },
    ],
    constraints: [
      'Return circuit on n + 1 qubits and n classical bits.',
      'Classical bit k must store recovered data bit k.',
      'The oracle must be appended exactly once, as supplied.',
      'Hidden tests vary ancilla position (anc = 0, middle, or n), secret s, bias b, and register size n.',
    ],
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
    difficulty: 'Medium',
    level: 'L2',
    levelLabel: 'Algorithms',
    points: 10,
    tags: ['Pauli Operators', 'Basis Rotation', 'Expectation Values', 'Statistics'],
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
    description: `Implement two independent functions to measure and estimate the expectation value ⟨P⟩ of an arbitrary Pauli string P ∈ {I, X, Y, Z}ⁿ:

1. **\`pauli_measurement_circuit(state_prep, pauli)\`**:
   - Appends single-qubit basis change rotations:
     - **X**: apply H
     - **Y**: apply S† followed by H
     - **Z / I**: no basis rotation
   - Measures every qubit i into classical bit i.

2. **\`expectation_from_counts(counts, pauli)\`**:
   - Computes:
     $$⟨P⟩ = E[(-1)^{parity of measured bits on support}]$$
   - All-identity string (e.g. \`"II"\`) returns \`1.0\`.`,
    examples: [
      {
        id: 1,
        input: 'state_prep = |0>, pauli = "Z", counts = {"0": 1000}',
        output: '1.0',
        explanation: 'Z on |0> has eigenvalue +1. All 1000 counts measure bit 0 (even parity -> +1).',
      },
      {
        id: 2,
        input: 'counts = {"0": 500, "1": 500}, pauli = "Z"',
        output: '0.0',
        explanation: 'Equal distribution of 0 (+1) and 1 (-1) gives expectation (500 - 500)/1000 = 0.0.',
      },
    ],
    constraints: [
      'Graded independently: 6 points for circuit, 4 points for expectation estimator.',
      'Pauli convention: rightmost character acts on qubit 0.',
      'Supports Pauli strings up to length 6.',
    ],
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
    difficulty: 'Medium',
    level: 'L2',
    levelLabel: 'Algorithms',
    points: 11,
    tags: ['VQE', 'Parameter-Shift Rule', 'Gradients', 'Variational Circuits'],
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
    description: `Given a parameterized circuit U(θ) and a black-box evaluator \`evaluate(bound_circuit) -> float\` returning an expectation value ⟨H⟩, return the gradient vector with respect to each parameter using the **parameter-shift rule**:

$$∂⟨H⟩/∂θ_k = (⟨H⟩(θ_k + π/2) - ⟨H⟩(θ_k - π/2)) / 2$$

Parameterized gates are \`rx\`, \`ry\`, \`rz\`, or \`rzz\` with angles a · θ + b. Parameters may appear across multiple gates.`,
    examples: [
      {
        id: 1,
        input: 'circuit with RX(θ), evaluate = <Z>, values = [π/4]',
        output: 'array([-0.7071])',
        explanation: 'For RX(θ)|0>, <Z> = cos(θ). The analytical derivative d/dθ cos(θ) = -sin(θ). At θ=π/4, -sin(π/4) ≈ -0.7071.',
      },
    ],
    constraints: [
      '1 <= num_parameters <= 8, ordered by circuit.parameters.',
      'At most 2 evaluator calls per parameterized-gate occurrence.',
      'Do not call evaluate on an unbound circuit.',
      'Numerical tolerance: 5e-6.',
    ],
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
    difficulty: 'Hard',
    level: 'L3',
    levelLabel: 'Transpilation',
    points: 12,
    tags: ['Transpilation', 'Coupling Map', 'SWAP Routing', 'Operator Equivalence'],
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
    description: `Rewrite an input circuit to comply with hardware topology constraints:

1. **Basis Gates**: Output must use only gates from {cx, rz, sx, x}.
2. **Directed Coupling**: Every \`cx(u, v)\` instruction must satisfy (u, v) ∈ coupling.
3. **Equivalence**: The unitary operator must be preserved (up to global phase).
4. **Layout**: Zero residual qubit permutations (qubit i corresponds to physical qubit i).`,
    examples: [
      {
        id: 1,
        input: 'circuit with CX(0, 2), coupling = [(0, 1), (1, 2), (2, 3)]',
        output: 'Routed QuantumCircuit using SWAP gates',
        explanation: 'Qubit 0 and 2 are not directly coupled. Routing inserts SWAP gates to map the interaction onto physical edge (1, 2).',
      },
    ],
    constraints: [
      'Input n = 4..7 qubits, <= 40 gates.',
      'Coupling map is directed and connected.',
      'No ancilla qubits permitted.',
      'Scoring: 6 points correctness (Operator equivalence + valid edges) + 6 points transpilation quality.',
    ],
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
    difficulty: 'Hard',
    level: 'L3',
    levelLabel: 'Error Mitigation',
    points: 15,
    tags: ['Error Mitigation', 'Zero-Noise Extrapolation', 'Unitary Folding', 'Noise Models'],
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
    description: `Estimate the ideal zero-noise expectation value of a Z / I Pauli mask from a noisy quantum simulator using **Zero-Noise Extrapolation (ZNE)**.

**Methodology:**
1. Scale circuit noise via **unitary folding**:
   $$G ⟶ G (G† G)ᵏ   [noise scales λ = 1, 3, 5, …]$$
2. Add Z measurements and call \`run(qc_measured, shots)\`.
3. Fit a polynomial / Richardson extrapolation to infer the zero-noise limit λ ⟶ 0.`,
    examples: [
      {
        id: 1,
        input: 'circuit = Bell pair |Φ+>, z_mask = "ZZ"',
        output: '0.985 (approx +1.0 ideal)',
        explanation: 'Noisy backend gives raw <ZZ> = 0.85. Extrapolating scale factors 1, 3, 5 reconstructs ideal value ~1.0.',
      },
    ],
    constraints: [
      'Input n <= 4 qubits, gates in {rz, sx, x, cx}, no initial measurements.',
      'Maximum 10 run calls and 40,000 total shots across calls.',
      'Pass condition: |estimate - ideal| <= τ and mitigated error <= 0.5 * raw error when raw error > 0.06.',
    ],
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
    difficulty: 'Hard',
    level: 'L4',
    levelLabel: 'Quantum Optimization',
    points: 18,
    tags: ['QAOA', 'MaxCut', 'Combinatorial Optimization', 'Variational Quantum'],
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
    description: `Construct a fully parameter-bound **QAOA** (Quantum Approximate Optimization Algorithm) circuit for weighted MaxCut.

**Required Circuit Structure:**
1. **Initial State:** Apply H on all qubits 0 … n-1.
2. **For each layer k = 0 … p-1:**
   - **Cost Unitary:** One \`rzz(2 * γ_k * w, u, v)\` for every weighted edge (u, v, w) with layer angle γ_k.
   - **Mixer Unitary:** One \`rx(2 * β_k, q)\` on every qubit q with layer angle β_k.
3. **Measurement:** Measure each qubit qᵢ into classical bit cᵢ.
4. **No Free Parameters:** All angles must be bound numerical floats.`,
    examples: [
      {
        id: 1,
        input: 'n = 3, edges = [(0, 1, 1.0), (1, 2, 1.0), (0, 2, 1.0)], p = 1',
        output: 'QuantumCircuit(3, 3)',
        explanation: 'Triangle graph K3. QAOA circuit optimizes angles to sample partitions with maximum cut weight > random baseline 1.5.',
      },
    ],
    constraints: [
      'Input: n = 2..10, weighted edges (u, v, w), p in {1, 2}.',
      'Return exactly n qubits and n classical bits.',
      'Strict structural check: exact gate sequence and counts verified.',
      'Continuous score based on expected cut: clamp((E - E_rand) / (0.97 * E_ref - E_rand), 0, 1) * 18 pts.',
    ],
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
