"""
Problem P2: Parity Probe (8 Points)
Build circuit on n data qubits (0..n-1), one ancilla at n, and 1 classical bit.
Measure parity of data register into clbit 0 without disturbing data state.
"""

import time
from typing import List
from problems.base import BaseProblemJudge, TestResult
from validator import validate_v0_circuit

class P2Judge(BaseProblemJudge):
    problem_id = "P2"
    max_score = 8

    def _test_circuit(self, func, n: int, test_type: str, test_number: int, name: str) -> TestResult:
        start_t = time.perf_counter()
        try:
            from qiskit import QuantumCircuit
            from qiskit.quantum_info import Statevector, Operator

            qc = func(n)

            # 1. V0 checks
            ok, err = validate_v0_circuit(qc, expected_qubits=n + 1, expected_clbits=1, allow_synthesis=False)
            if not ok:
                return TestResult(test_type, test_number, name, False, int((time.perf_counter() - start_t) * 1000), err)

            # 2. Verify measurements: only measure(n, 0) allowed
            measures = [inst for inst in qc.data if inst.operation.name == 'measure']
            if len(measures) != 1:
                return TestResult(test_type, test_number, name, False, int((time.perf_counter() - start_t) * 1000),
                                  f"Expected exactly 1 measurement, found {len(measures)}.")

            meas_qubit = qc.find_bit(measures[0].qubits[0]).index
            meas_clbit = qc.find_bit(measures[0].clbits[0]).index
            if meas_qubit != n or meas_clbit != 0:
                return TestResult(test_type, test_number, name, False, int((time.perf_counter() - start_t) * 1000),
                                  f"Measurement must be measure({n}, 0), found measure({meas_qubit}, {meas_clbit}).")

            # 3. Verify parity logic on computational basis states
            # Build subcircuit without measurement
            qc_unitary = qc.remove_final_measurements(inplace=False)

            # Test basis vectors: e.g. all 0s, all 1s, alternating
            test_patterns = [
                0,
                (1 << n) - 1,
                0b101010 & ((1 << n) - 1),
                0b010101 & ((1 << n) - 1),
                1,
            ]

            for val in test_patterns:
                # Prepare state |val> on data qubits, |0> on ancilla
                prep = QuantumCircuit(n + 1)
                for q in range(n):
                    if (val >> q) & 1:
                        prep.x(q)

                combined = prep.compose(qc_unitary)
                sv = Statevector(combined)
                probs = sv.probabilities_dict()

                expected_parity = bin(val).count('1') % 2
                # In Qiskit, ancilla qubit is qubit n (leftmost character in binary string of length n+1)
                for bitstr, p in probs.items():
                    if p > 1e-6:
                        anc_bit = int(bitstr[0])  # qubit n is at index 0 in little-endian reversed string
                        if anc_bit != expected_parity:
                            return TestResult(test_type, test_number, name, False, int((time.perf_counter() - start_t) * 1000),
                                              f"For data state {bin(val)}, expected parity {expected_parity}, measured {anc_bit}.")

            exec_time = int((time.perf_counter() - start_t) * 1000)
            return TestResult(test_type, test_number, name, True, exec_time, None)

        except Exception as e:
            exec_time = int((time.perf_counter() - start_t) * 1000)
            return TestResult(test_type, test_number, name, False, exec_time, str(e))

    def run_public_tests(self, user_module) -> List[TestResult]:
        func = getattr(user_module, 'parity_probe', None)
        if not func:
            return [TestResult('public', 1, "Function Presence", False, 0, "Function 'parity_probe' not defined.")]

        results = []
        for idx, n in enumerate([1, 2, 3], 1):
            name = f"Public Parity n={n}"
            results.append(self._test_circuit(func, n, 'public', idx, name))
        return results

    def run_hidden_tests(self, user_module) -> List[TestResult]:
        func = getattr(user_module, 'parity_probe', None)
        if not func:
            return [TestResult('hidden', 1, "Function Presence", False, 0, "Function 'parity_probe' not defined.")]

        results = []
        for idx, n in enumerate([4, 5, 6, 7], 1):
            name = f"Hidden Parity n={n}"
            results.append(self._test_circuit(func, n, 'hidden', idx, name))
        return results
