-- Migration: 20261008000000_create_qiskit_coding_challenge.sql
-- Description: Provision tables, indexes, constraints, RLS policies, and seed data
--              for the Qiskit Coding Challenge / Evaluation Playground (9 Problems, 100 pts total).

-- ============================================================================
-- 1. TABLE: coding_challenges (Problem Master)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.coding_challenges (
    id TEXT PRIMARY KEY, -- e.g. 'P1', 'P2' ... 'P9'
    problem_code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    level TEXT NOT NULL DEFAULT 'L1' CHECK (level IN ('L1', 'L2', 'L3', 'L4')),
    points INTEGER NOT NULL DEFAULT 10,
    function_name TEXT NOT NULL,
    starter_code TEXT NOT NULL,
    description TEXT NOT NULL,
    constraints TEXT,
    time_limit_ms INTEGER NOT NULL DEFAULT 5000,
    memory_limit_mb INTEGER NOT NULL DEFAULT 512,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coding_challenges_code ON public.coding_challenges (problem_code);
CREATE INDEX IF NOT EXISTS idx_coding_challenges_enabled ON public.coding_challenges (enabled);

ALTER TABLE public.coding_challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon read coding_challenges" ON public.coding_challenges;
CREATE POLICY "Allow anon read coding_challenges"
ON public.coding_challenges
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow service write coding_challenges" ON public.coding_challenges;
CREATE POLICY "Allow service write coding_challenges"
ON public.coding_challenges
FOR ALL
USING (true)
WITH CHECK (true);

-- ============================================================================
-- 2. TABLE: coding_submissions (Submission Queue & Historical Records)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.coding_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL,
    challenge_id TEXT NOT NULL REFERENCES public.coding_challenges(id) ON DELETE CASCADE,
    source_code TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'completed', 'failed', 'timeout', 'system_error')),
    score INTEGER DEFAULT 0,
    max_score INTEGER DEFAULT 0,
    passed_tests INTEGER DEFAULT 0,
    total_tests INTEGER DEFAULT 0,
    execution_time_ms INTEGER DEFAULT 0,
    error_message TEXT,
    stdout TEXT,
    stderr TEXT,
    submitted_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_coding_submissions_email ON public.coding_submissions (lower(user_email));
CREATE INDEX IF NOT EXISTS idx_coding_submissions_challenge ON public.coding_submissions (challenge_id);
CREATE INDEX IF NOT EXISTS idx_coding_submissions_status ON public.coding_submissions (status);
CREATE INDEX IF NOT EXISTS idx_coding_submissions_submitted ON public.coding_submissions (submitted_at DESC);

ALTER TABLE public.coding_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon all coding_submissions" ON public.coding_submissions;
CREATE POLICY "Allow anon all coding_submissions"
ON public.coding_submissions
FOR ALL
USING (true)
WITH CHECK (true);

-- ============================================================================
-- 3. TABLE: coding_test_results (Public & Hidden Test Details)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.coding_test_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES public.coding_submissions(id) ON DELETE CASCADE,
    test_type TEXT NOT NULL CHECK (test_type IN ('public', 'hidden')),
    test_number INTEGER NOT NULL,
    test_name TEXT,
    passed BOOLEAN NOT NULL DEFAULT false,
    execution_time_ms INTEGER DEFAULT 0,
    error_message TEXT, -- Sanitized error (Never reveal hidden test inputs!)
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coding_test_results_submission ON public.coding_test_results (submission_id);
CREATE INDEX IF NOT EXISTS idx_coding_test_results_type ON public.coding_test_results (test_type);

ALTER TABLE public.coding_test_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon all coding_test_results" ON public.coding_test_results;
CREATE POLICY "Allow anon all coding_test_results"
ON public.coding_test_results
FOR ALL
USING (true)
WITH CHECK (true);

-- ============================================================================
-- 4. TABLE: coding_drafts (User Working Code Persistence)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.coding_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL,
    challenge_id TEXT NOT NULL REFERENCES public.coding_challenges(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_user_challenge_draft UNIQUE (user_email, challenge_id)
);

CREATE INDEX IF NOT EXISTS idx_coding_drafts_user_challenge ON public.coding_drafts (lower(user_email), challenge_id);

ALTER TABLE public.coding_drafts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon all coding_drafts" ON public.coding_drafts;
CREATE POLICY "Allow anon all coding_drafts"
ON public.coding_drafts
FOR ALL
USING (true)
WITH CHECK (true);

-- ============================================================================
-- 5. PLATFORM CONFIG: Competition Schedule & Limits
-- ============================================================================
INSERT INTO public.platform_config (key, value)
VALUES 
  ('qiskit_challenge_config', '{
    "enabled": true,
    "start_time": "2026-10-01T00:00:00+05:30",
    "end_time": "2026-10-15T23:59:59+05:30",
    "max_submissions_per_problem": 10,
    "run_rate_limit_per_min": 30,
    "duration_minutes": 180
  }'::jsonb)
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value, updated_at = now();

-- ============================================================================
-- 6. SEED DATA: 9 Problems (100 Points Total)
-- ============================================================================
INSERT INTO public.coding_challenges (
    id, problem_code, title, level, points, function_name, starter_code, description, constraints, time_limit_ms, memory_limit_mb
) VALUES
(
    'P1',
    'P1',
    'Ket Reader',
    'L1',
    6,
    'prepare_ket',
    'from qiskit import QuantumCircuit

def prepare_ket(ket: str) -> QuantumCircuit:
    """
    Given a basis state written in textbook notation |q0 q1 ... qn-1>,
    where the leftmost character is qubit 0, return a circuit that
    prepares exactly that state from |0...0>.
    """
    # Write your code here
    pass
',
    'Given a basis state written in textbook notation |q₀q₁…qₙ₋₁⟩, where the leftmost character is qubit 0, return a circuit that prepares exactly that state from |0…0⟩.

Example: prepare_ket("10") means q0=1, q1=0; therefore Qiskit’s probability key is "01".',
    'Input: 1 ≤ n ≤ 12, characters only ''0'' or ''1''.
Return exactly n qubits, no classical bits, and no measurements.
Circuit size must be ≤ 3n.
Do not use initialize, StatePreparation, UnitaryGate, or Isometry.',
    5000,
    512
),
(
    'P2',
    'P2',
    'Parity Probe',
    'L1',
    8,
    'parity_probe',
    'from qiskit import QuantumCircuit

def parity_probe(n: int) -> QuantumCircuit:
    """
    Build a circuit on n data qubits (0..n-1), one ancilla at qubit n,
    and one classical bit. The circuit must measure the parity of the
    data register into the classical bit without disturbing the data state.
    """
    # Write your code here
    pass
',
    'Build a circuit on n data qubits (0..n−1), one ancilla at qubit n, and one classical bit. The circuit must measure the parity of the data register into the classical bit without disturbing the data state.

Example: n=2, |11⟩ gives 0; |10⟩ gives 1.',
    'Return n+1 qubits and 1 classical bit.
The only measurement must be the final measure(n, 0).
Preserves superposition on the data qubits without introducing unwanted relative phases.',
    5000,
    512
),
(
    'P3',
    'P3',
    'Repair Shop',
    'L2',
    10,
    'repair_circuit',
    'from qiskit import QuantumCircuit

def repair_circuit(buggy: QuantumCircuit, target) -> QuantumCircuit:
    """
    You receive a circuit intended to prepare a target state but containing
    1-2 seeded faults. Return a corrected circuit.
    """
    # Write your code here
    pass
',
    'You receive a circuit intended to prepare a target state but containing 1–2 seeded faults. Return a corrected circuit.

Faults can include swapped CX direction, wrong qubit, rotation sign, missing gate, or S↔Sdg / X↔Z.',
    'Input n=3..5, ≤30 gates, no measurements.
Allowed output gates: h, x, y, z, s, sdg, t, tdg, sx, rx, ry, rz, cx, cz, swap.
State-synthesis gates (initialize, StatePreparation, UnitaryGate, Isometry) are banned.
Output size ≤ buggy.size() + 3.
Fidelity with target state must be ≥ 1 - 1e-9.',
    7000,
    512
),
(
    'P4',
    'P4',
    'Floating-Ancilla Bernstein–Vazirani',
    'L2',
    10,
    'bernstein_vazirani',
    'from qiskit import QuantumCircuit

def bernstein_vazirani(oracle: QuantumCircuit, n: int, anc: int) -> QuantumCircuit:
    """
    Given an oracle implementing f(x) = s·x ⊕ b on n data qubits plus
    one output qubit located at index anc, recover s with one oracle call.
    """
    # Write your code here
    pass
',
    'Given an oracle implementing f(x)=s·x⊕b on n data qubits plus one output qubit located at index anc, recover s with one oracle call.

The data qubits are the remaining qubit indices in increasing order. Hidden tests vary ancilla position, s, b, and n.',
    'Return n+1 qubits and n classical bits.
Clbit k stores data bit k.
The oracle must be appended exactly once, as supplied.',
    5000,
    512
),
(
    'P5',
    'P5',
    'Any-Pauli Estimator',
    'L2',
    10,
    'pauli_measurement_circuit',
    'from qiskit import QuantumCircuit

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
',
    'Implement two functions:
1. pauli_measurement_circuit(state_prep, pauli) -> QuantumCircuit
2. expectation_from_counts(counts, pauli) -> float

Pauli labels use Qiskit convention: rightmost character acts on qubit 0. Counts are length-n strings with clbit 0 on the right. For the circuit, append basis rotations and measure every qubit i into clbit i. X uses H; Y uses Sdg then H; Z/I need no basis rotation.
The estimator is E[(-1)^(parity of measured bits on the Pauli support)]. All-I returns 1.0.',
    'Grade the two functions independently (6 + 4 points).
X uses H; Y uses Sdg then H; Z and I require no basis rotation.
All-I returns 1.0.',
    6000,
    512
),
(
    'P6',
    'P6',
    'Shift-Rule Gradient',
    'L2',
    11,
    'param_shift_gradient',
    'import numpy as np
from qiskit import QuantumCircuit

def param_shift_gradient(circuit: QuantumCircuit, values: list, evaluate) -> np.ndarray:
    """
    Given a parameterized circuit and a black-box evaluator returning an
    expectation value for a bound circuit, return the gradient with respect
    to each parameter using the parameter-shift rule.
    """
    # Write your code here
    pass
',
    'Given a parameterized circuit and a black-box evaluator returning an expectation value for a bound circuit, return the gradient with respect to each parameter.

There are 1–8 parameters, in Qiskit default order. Parameterized gates are rx, ry, rz, or rzz with angles a·θ+b. Parameters may be reused. Do not call evaluate on an unbound circuit.',
    'Use at most two evaluator calls per parameterized-gate occurrence.
Expected derivative for each occurrence is a·(E+ - E-)/2, accumulated for repeated parameters.
Accuracy tolerance: 5e-6.',
    8000,
    512
),
(
    'P7',
    'P7',
    'Directed-Coupling Router',
    'L3',
    12,
    'route_to_coupling',
    'from qiskit import QuantumCircuit

def route_to_coupling(circuit: QuantumCircuit, coupling: list) -> QuantumCircuit:
    """
    Rewrite circuit so that it uses only {cx, rz, sx, x}, every CX follows
    the directed coupling map, and the overall unitary is unchanged.
    """
    # Write your code here
    pass
',
    'Rewrite a circuit so that it uses only {cx, rz, sx, x}, every CX follows the directed coupling map, and the overall unitary is unchanged.',
    'Input n=4..7, ≤40 gates from h, x, s, t, rz, cx, cz, swap.
Coupling is directed, connected when directions are ignored.
No ancillas. Output must have no residual qubit permutation.
Validation checks Operator equivalence up to global phase and directed CX compliance.',
    10000,
    512
),
(
    'P8',
    'P8',
    'Noise-Scaled Extrapolation',
    'L3',
    15,
    'zne_expectation',
    'import numpy as np
from qiskit import QuantumCircuit

def zne_expectation(circuit: QuantumCircuit, z_mask: str, run, shots: int) -> float:
    """
    Estimate the ideal expectation of a Z/I Pauli mask from a noisy backend
    using unitary folding and extrapolation.
    """
    # Write your code here
    pass
',
    'Estimate the ideal expectation of a Z/I Pauli mask from a noisy backend using unitary folding and extrapolation.

Input n≤4, gates in rz, sx, x, cx, no measurements. z_mask uses I/Z with rightmost character acting on q0. run(qc_with_measurements, shots) returns counts. The judge uses a deterministic noisy simulator.',
    'At most 10 run calls and 40,000 total shots.
Participants must append measurements.
Pass condition: |estimate - ideal| ≤ τ and mitigated error ≤ half raw error when raw noise error > 0.06.',
    10000,
    512
),
(
    'P9',
    'P9',
    'Weighted-MaxCut QAOA',
    'L4',
    18,
    'qaoa_maxcut',
    'from qiskit import QuantumCircuit

def qaoa_maxcut(n: int, edges: list, p: int) -> QuantumCircuit:
    """
    Build a fully bound QAOA circuit for weighted MaxCut.
    Input: n=2..10, weighted edges (u, v, w), p in {1, 2}.
    Return n qubits and n classical bits, no free parameters,
    q_i measured into c_i.
    """
    # Write your code here
    pass
',
    'Build a fully bound QAOA circuit for weighted MaxCut.

Required structure: H on every qubit; for each of p layers, one RZZ per edge with angle 2γ_k w_e and one common γ_k for the layer, followed by RX on every qubit with common angle 2β_k. No other gates.',
    'Input: n=2..10, weighted edges (u,v,w), p∈{1,2}.
Return n qubits and n classical bits, no free parameters, q_i measured into c_i.
Exact structural form and no free parameters enforced.
Continuous score evaluated against Statevector expected cut value.',
    12000,
    512
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    level = EXCLUDED.level,
    points = EXCLUDED.points,
    function_name = EXCLUDED.function_name,
    starter_code = EXCLUDED.starter_code,
    description = EXCLUDED.description,
    constraints = EXCLUDED.constraints,
    time_limit_ms = EXCLUDED.time_limit_ms,
    memory_limit_mb = EXCLUDED.memory_limit_mb,
    updated_at = now();
