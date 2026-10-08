"""
Problem P7: Directed-Coupling Router (12 Points)
Transpile circuit to basis {cx, rz, sx, x} matching directed coupling map without residual qubit permutation.
Scoring: 6 pts correctness + 6 pts quality (CX count ratio vs reference).
"""

import time
from typing import List
from problems.base import BaseProblemJudge, TestResult
from validator import validate_v0_circuit

ALLOWED_BASIS = {'cx', 'rz', 'sx', 'x'}

class P7Judge(BaseProblemJudge):
    problem_id = "P7"
    max_score = 12

    def _test_routing(self, func, circuit, coupling, ref_cx_count, test_type: str, test_number: int, name: str) -> TestResult:
        start_t = time.perf_counter()
        try:
            from qiskit.quantum_info import Operator

            out_qc = func(circuit, coupling)

            # 1. V0 check
            ok, err = validate_v0_circuit(out_qc, expected_qubits=circuit.num_qubits, expected_clbits=0, allow_synthesis=False)
            if not ok:
                return TestResult(test_type, test_number, name, False, int((time.perf_counter() - start_t) * 1000), err)

            # 2. Gate set check
            for inst in out_qc.data:
                name_op = inst.operation.name.lower()
                if name_op not in ALLOWED_BASIS:
                    return TestResult(test_type, test_number, name, False, int((time.perf_counter() - start_t) * 1000),
                                      f"Gate '{inst.operation.name}' not in allowed basis {ALLOWED_BASIS}.")

            # 3. Directed coupling check
            coupling_set = set(tuple(e) for e in coupling)
            cx_count = 0
            for inst in out_qc.data:
                if inst.operation.name.lower() == 'cx':
                    cx_count += 1
                    u = out_qc.find_bit(inst.qubits[0]).index
                    v = out_qc.find_bit(inst.qubits[1]).index
                    if (u, v) not in coupling_set:
                        return TestResult(test_type, test_number, name, False, int((time.perf_counter() - start_t) * 1000),
                                          f"CX({u}, {v}) violates directed coupling map.")

            # 4. Operator equivalence check
            op_in = Operator(circuit)
            op_out = Operator(out_qc)
            if not op_in.equiv(op_out):
                return TestResult(test_type, test_number, name, False, int((time.perf_counter() - start_t) * 1000),
                                  "Routed circuit is not unitarily equivalent to original circuit.")

            # Quality check
            ratio = cx_count / max(1, ref_cx_count)
            if ratio > 2.0:
                return TestResult(test_type, test_number, name, False, int((time.perf_counter() - start_t) * 1000),
                                  f"Excessive CX count: {cx_count} (ref: {ref_cx_count}, ratio: {ratio:.2f}).")

            exec_time = int((time.perf_counter() - start_t) * 1000)
            return TestResult(test_type, test_number, name, True, exec_time, None)

        except Exception as e:
            exec_time = int((time.perf_counter() - start_t) * 1000)
            return TestResult(test_type, test_number, name, False, exec_time, str(e))

    def run_public_tests(self, user_module) -> List[TestResult]:
        func = getattr(user_module, 'route_to_coupling', None)
        if not func:
            return [TestResult('public', 1, "Function Presence", False, 0, "Function 'route_to_coupling' not defined.")]

        from qiskit import QuantumCircuit

        results = []

        # Public 1: Linear 4-qubit chain with distant CX(0, 2)
        qc1 = QuantumCircuit(4)
        qc1.h(0)
        qc1.cx(0, 2) # Needs SWAP routing
        coupling1 = [(0, 1), (1, 2), (2, 3), (1, 0), (2, 1), (3, 2)]
        results.append(self._test_routing(func, qc1, coupling1, ref_cx_count=7, test_type='public', test_number=1, name="4-Qubit Distant CX"))

        return results

    def run_hidden_tests(self, user_module) -> List[TestResult]:
        func = getattr(user_module, 'route_to_coupling', None)
        if not func:
            return [TestResult('hidden', 1, "Function Presence", False, 0, "Function 'route_to_coupling' not defined.")]

        from qiskit import QuantumCircuit

        results = []

        # Hidden 1: Directed constraint (reversal needed)
        qc_dir = QuantumCircuit(2)
        qc_dir.cx(1, 0)
        coupling_dir = [(0, 1)] # Only 0->1 allowed; requires H-H reversal around CX
        results.append(self._test_routing(func, qc_dir, coupling_dir, ref_cx_count=1, test_type='hidden', test_number=1, name="Hidden Directed Edge Reversal"))

        # Hidden 2: 5-Qubit Star Architecture
        qc_star = QuantumCircuit(5)
        qc_star.h(1)
        qc_star.cx(1, 2)
        qc_star.cx(3, 4)
        coupling_star = [(0, 1), (0, 2), (0, 3), (0, 4), (1, 0), (2, 0), (3, 0), (4, 0)]
        results.append(self._test_routing(func, qc_star, coupling_star, ref_cx_count=10, test_type='hidden', test_number=2, name="Hidden 5-Qubit Star Routing"))

        return results
