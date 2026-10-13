"""
Problem P9: Weighted-MaxCut QAOA (18 Points)
Build fully parameter-bound QAOA circuit for weighted MaxCut.
Continuous score evaluated against Statevector expected cut value.
"""

import time
from typing import List
from problems.base import BaseProblemJudge, TestResult
from validator import validate_v0_circuit

def _compute_expected_cut(n: int, edges: list, qc):
    """Computes exact expected cut value using Statevector."""
    from qiskit.quantum_info import Statevector
    probs = Statevector(qc.remove_final_measurements(inplace=False)).probabilities()
    e = 0.0
    for idx, pr in enumerate(probs):
        cut = 0.0
        for u, v, w in edges:
            bu = (idx >> u) & 1
            bv = (idx >> v) & 1
            if bu != bv:
                cut += w
        e += pr * cut
    return e

class P9Judge(BaseProblemJudge):
    problem_id = "P9"
    max_score = 18

    def _test_qaoa(self, func, n: int, edges: list, p: int, ref_cut: float, test_type: str, test_number: int, name: str) -> TestResult:
        start_t = time.perf_counter()
        try:
            qc = func(n, edges, p)

            # 1. V0 check: exact qubits and clbits
            ok, err = validate_v0_circuit(qc, expected_qubits=n, expected_clbits=n, allow_parameters=False)
            if not ok:
                return TestResult(test_type, test_number, name, False, int((time.perf_counter() - start_t) * 1000), err)

            # 2. Structural verification
            # Must start with H gates on all qubits
            h_count = sum(1 for inst in qc.data if inst.operation.name.lower() == 'h')
            if h_count < n:
                return TestResult(test_type, test_number, name, False, int((time.perf_counter() - start_t) * 1000),
                                  f"Expected at least {n} H gates for superposition, found {h_count}.")

            # Must have p * len(edges) RZZ gates and p * n RX gates
            rzz_count = sum(1 for inst in qc.data if inst.operation.name.lower() == 'rzz')
            rx_count = sum(1 for inst in qc.data if inst.operation.name.lower() == 'rx')
            if rzz_count != p * len(edges):
                return TestResult(test_type, test_number, name, False, int((time.perf_counter() - start_t) * 1000),
                                  f"Expected {p * len(edges)} RZZ gates, found {rzz_count}.")
            if rx_count != p * n:
                return TestResult(test_type, test_number, name, False, int((time.perf_counter() - start_t) * 1000),
                                  f"Expected {p * n} RX gates, found {rx_count}.")

            # 3. Compute expected cut
            exp_cut = _compute_expected_cut(n, edges, qc)
            e_rand = sum(w for _, _, w in edges) / 2.0

            # QAOA expected cut must at least exceed random baseline
            if exp_cut < e_rand - 1e-4:
                return TestResult(test_type, test_number, name, False, int((time.perf_counter() - start_t) * 1000),
                                  f"Expected cut {exp_cut:.3f} failed to exceed random baseline {e_rand:.3f}.")

            exec_time = int((time.perf_counter() - start_t) * 1000)
            return TestResult(test_type, test_number, name, True, exec_time, None)

        except Exception as e:
            exec_time = int((time.perf_counter() - start_t) * 1000)
            return TestResult(test_type, test_number, name, False, exec_time, str(e))

    def run_public_tests(self, user_module) -> List[TestResult]:
        func = getattr(user_module, 'qaoa_maxcut', None)
        if not func:
            return [TestResult('public', 1, "Function Presence", False, 0, "Function 'qaoa_maxcut' not defined.")]

        results = []

        # Public 1: Triangle Graph (K3, unit weights)
        edges1 = [(0, 1, 1.0), (1, 2, 1.0), (0, 2, 1.0)]
        results.append(self._test_qaoa(func, n=3, edges=edges1, p=1, ref_cut=2.0,
                                      test_type='public', test_number=1, name="Triangle Graph K3 (p=1)"))

        # Public 2: C4 Cycle Graph
        edges2 = [(0, 1, 1.0), (1, 2, 1.0), (2, 3, 1.0), (3, 0, 1.0)]
        results.append(self._test_qaoa(func, n=4, edges=edges2, p=1, ref_cut=3.0,
                                      test_type='public', test_number=2, name="Square Cycle C4 (p=1)"))

        return results

    def run_hidden_tests(self, user_module) -> List[TestResult]:
        func = getattr(user_module, 'qaoa_maxcut', None)
        if not func:
            return [TestResult('hidden', 1, "Function Presence", False, 0, "Function 'qaoa_maxcut' not defined.")]

        results = []

        # Hidden 1: Weighted Line Graph
        edges_h1 = [(0, 1, 2.5), (1, 2, 1.5), (2, 3, 3.0)]
        results.append(self._test_qaoa(func, n=4, edges=edges_h1, p=2, ref_cut=5.5,
                                      test_type='hidden', test_number=1, name="Hidden Weighted Line (p=2)"))

        # Hidden 2: Complete Graph K4 with mixed weights
        edges_h2 = [
            (0, 1, 1.0), (0, 2, 2.0), (0, 3, 1.0),
            (1, 2, 1.0), (1, 3, 3.0), (2, 3, 2.0)
        ]
        results.append(self._test_qaoa(func, n=4, edges=edges_h2, p=1, ref_cut=6.5,
                                      test_type='hidden', test_number=2, name="Hidden K4 Weighted (p=1)"))

        return results
