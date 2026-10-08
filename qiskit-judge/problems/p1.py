"""
Problem P1: Ket Reader (6 Points)
Given textbook ket |q0 q1 ... qn-1>, return QuantumCircuit preparing that state from |0...0>.
"""

import time
from typing import List
from problems.base import BaseProblemJudge, TestResult
from validator import validate_v0_circuit

class P1Judge(BaseProblemJudge):
    problem_id = "P1"
    max_score = 6

    PUBLIC_CASES = ["0", "1", "10", "101"]
    HIDDEN_CASES = [
        "00",
        "11",
        "000",
        "111",
        "010",
        "1010",
        "0101",
        "110011",
        "101010",
        "01101001",
        "111100001111",
        "000000000001",
    ]

    def _evaluate_case(self, func, ket: str, test_type: str, test_number: int, name: str) -> TestResult:
        start_t = time.perf_counter()
        try:
            from qiskit.quantum_info import Statevector

            qc = func(ket)
            n = len(ket)

            # 1. V0 check
            ok, err = validate_v0_circuit(qc, expected_qubits=n, expected_clbits=0, allow_synthesis=False)
            if not ok:
                return TestResult(test_type, test_number, name, False, int((time.perf_counter() - start_t) * 1000), err)

            # 2. Gate count constraint
            if qc.size() > 3 * n:
                return TestResult(test_type, test_number, name, False, int((time.perf_counter() - start_t) * 1000),
                                  f"Circuit size ({qc.size()}) exceeds 3*n limit ({3*n}).")

            # 3. Statevector simulation
            sv = Statevector(qc)
            probs = sv.probabilities_dict()

            # Textbook |q0 q1 ... qn-1> maps to Qiskit key ket[::-1]
            expected_key = ket[::-1]
            prob = probs.get(expected_key, 0.0)

            if abs(prob - 1.0) > 1e-7:
                return TestResult(test_type, test_number, name, False, int((time.perf_counter() - start_t) * 1000),
                                  f"Expected state |{ket}⟩ (Qiskit key '{expected_key}') with probability 1.0, got {prob:.4f}.")

            exec_time = int((time.perf_counter() - start_t) * 1000)
            return TestResult(test_type, test_number, name, True, exec_time, None)

        except Exception as e:
            exec_time = int((time.perf_counter() - start_t) * 1000)
            return TestResult(test_type, test_number, name, False, exec_time, str(e))

    def run_public_tests(self, user_module) -> List[TestResult]:
        func = getattr(user_module, 'prepare_ket', None)
        if not func:
            return [TestResult('public', 1, "Function Presence", False, 0, "Function 'prepare_ket' not defined.")]

        results = []
        for idx, ket in enumerate(self.PUBLIC_CASES, 1):
            name = f"Public Ket |{ket}⟩"
            res = self._evaluate_case(func, ket, 'public', idx, name)
            results.append(res)
        return results

    def run_hidden_tests(self, user_module) -> List[TestResult]:
        func = getattr(user_module, 'prepare_ket', None)
        if not func:
            return [TestResult('hidden', 1, "Function Presence", False, 0, "Function 'prepare_ket' not defined.")]

        results = []
        for idx, ket in enumerate(self.HIDDEN_CASES, 1):
            name = f"Hidden Ket #{idx}"
            res = self._evaluate_case(func, ket, 'hidden', idx, name)
            results.append(res)
        return results
