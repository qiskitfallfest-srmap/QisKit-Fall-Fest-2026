"""
Problem P5: Any-Pauli Estimator (10 Points)
Two functions:
1. pauli_measurement_circuit(state_prep, pauli) -> QuantumCircuit (6 pts)
2. expectation_from_counts(counts, pauli) -> float (4 pts)
"""

import time
from typing import List
from problems.base import BaseProblemJudge, TestResult
from validator import validate_v0_circuit

class P5Judge(BaseProblemJudge):
    problem_id = "P5"
    max_score = 10

    def run_public_tests(self, user_module) -> List[TestResult]:
        from qiskit import QuantumCircuit
        from qiskit.quantum_info import Statevector

        circuit_fn = getattr(user_module, 'pauli_measurement_circuit', None)
        expect_fn = getattr(user_module, 'expectation_from_counts', None)

        results = []

        # Test 1: pauli_measurement_circuit with X basis rotation
        start_t = time.perf_counter()
        if not circuit_fn:
            results.append(TestResult('public', 1, "Function 'pauli_measurement_circuit' defined", False, 0, "Missing function."))
        else:
            try:
                qc = QuantumCircuit(1) # |0>
                meas_qc = circuit_fn(qc, "X")
                ok, err = validate_v0_circuit(meas_qc, expected_qubits=1, expected_clbits=1)
                if not ok:
                    results.append(TestResult('public', 1, "Circuit Basis Rotation for X", False, int((time.perf_counter() - start_t) * 1000), err))
                else:
                    results.append(TestResult('public', 1, "Circuit Basis Rotation for X", True, int((time.perf_counter() - start_t) * 1000), None))
            except Exception as e:
                results.append(TestResult('public', 1, "Circuit Basis Rotation for X", False, int((time.perf_counter() - start_t) * 1000), str(e)))

        # Test 2: expectation_from_counts for single qubit Z
        start_t = time.perf_counter()
        if not expect_fn:
            results.append(TestResult('public', 2, "Function 'expectation_from_counts' defined", False, 0, "Missing function."))
        else:
            try:
                counts = {"0": 750, "1": 250}
                val = expect_fn(counts, "Z")
                # Expected: (750 - 250) / 1000 = 0.5
                if abs(val - 0.5) < 1e-4:
                    results.append(TestResult('public', 2, "Expectation from Counts for Z", True, int((time.perf_counter() - start_t) * 1000), None))
                else:
                    results.append(TestResult('public', 2, "Expectation from Counts for Z", False, int((time.perf_counter() - start_t) * 1000),
                                              f"Expected 0.5, got {val}."))
            except Exception as e:
                results.append(TestResult('public', 2, "Expectation from Counts for Z", False, int((time.perf_counter() - start_t) * 1000), str(e)))

        # Test 3: All-Identity check
        start_t = time.perf_counter()
        if not expect_fn:
            results.append(TestResult('public', 3, "All-Identity Expectation", False, 0, "Missing function."))
        else:
            try:
                val = expect_fn({"01": 500, "10": 500}, "II")
                if abs(val - 1.0) < 1e-4:
                    results.append(TestResult('public', 3, "All-Identity Expectation", True, int((time.perf_counter() - start_t) * 1000), None))
                else:
                    results.append(TestResult('public', 3, "All-Identity Expectation", False, int((time.perf_counter() - start_t) * 1000),
                                              f"Expected 1.0 for all-I, got {val}."))
            except Exception as e:
                results.append(TestResult('public', 3, "All-Identity Expectation", False, int((time.perf_counter() - start_t) * 1000), str(e)))

        return results

    def run_hidden_tests(self, user_module) -> List[TestResult]:
        from qiskit import QuantumCircuit
        from qiskit.quantum_info import Statevector, Pauli

        circuit_fn = getattr(user_module, 'pauli_measurement_circuit', None)
        expect_fn = getattr(user_module, 'expectation_from_counts', None)

        results = []

        # Hidden 1: Y basis rotation test (requires Sdg then H)
        start_t = time.perf_counter()
        if circuit_fn:
            try:
                # |+i> state prep (H then S)
                qc = QuantumCircuit(1)
                qc.h(0)
                qc.s(0)
                meas_qc = circuit_fn(qc, "Y")
                ok, err = validate_v0_circuit(meas_qc, expected_qubits=1, expected_clbits=1)
                if not ok:
                    results.append(TestResult('hidden', 1, "Hidden Y Rotation", False, int((time.perf_counter() - start_t) * 1000), err))
                else:
                    sv = Statevector(meas_qc.remove_final_measurements(inplace=False))
                    # After Sdg then H on |+i>, should be in |0> with probability 1.0
                    p0 = sv.probabilities_dict().get('0', 0.0)
                    if abs(p0 - 1.0) < 1e-5:
                        results.append(TestResult('hidden', 1, "Hidden Y Rotation", True, int((time.perf_counter() - start_t) * 1000), None))
                    else:
                        results.append(TestResult('hidden', 1, "Hidden Y Rotation", False, int((time.perf_counter() - start_t) * 1000),
                                                  "Y measurement basis rotation incorrect."))
            except Exception as e:
                results.append(TestResult('hidden', 1, "Hidden Y Rotation", False, int((time.perf_counter() - start_t) * 1000), str(e)))
        else:
            results.append(TestResult('hidden', 1, "Hidden Y Rotation", False, 0, "Missing function."))

        # Hidden 2: 2-Qubit Pauli "XZ" (X on q1, Z on q0)
        start_t = time.perf_counter()
        if expect_fn:
            try:
                counts = {"00": 300, "01": 200, "10": 100, "11": 400}
                # support: q1 (X), q0 (Z). Parity is bits[-1] ^ bits[-2]
                # "00": p=0 (+300), "01": p=1 (-200), "10": p=1 (-100), "11": p=0 (+400) -> total +400/1000 = 0.4
                val = expect_fn(counts, "XZ")
                if abs(val - 0.4) < 1e-4:
                    results.append(TestResult('hidden', 2, "Hidden 2-Qubit Expectation XZ", True, int((time.perf_counter() - start_t) * 1000), None))
                else:
                    results.append(TestResult('hidden', 2, "Hidden 2-Qubit Expectation XZ", False, int((time.perf_counter() - start_t) * 1000), "Incorrect expectation calculation."))
            except Exception as e:
                results.append(TestResult('hidden', 2, "Hidden 2-Qubit Expectation XZ", False, int((time.perf_counter() - start_t) * 1000), str(e)))
        else:
            results.append(TestResult('hidden', 2, "Hidden 2-Qubit Expectation XZ", False, 0, "Missing function."))

        # Hidden 3: 3-Qubit "ZIZ" with isolated support
        start_t = time.perf_counter()
        if expect_fn:
            try:
                counts = {"000": 500, "101": 500}
                # support: q2, q0. "000": p=0 (+500), "101": p=0 (+500) -> 1.0
                val = expect_fn(counts, "ZIZ")
                if abs(val - 1.0) < 1e-4:
                    results.append(TestResult('hidden', 3, "Hidden 3-Qubit Expectation ZIZ", True, int((time.perf_counter() - start_t) * 1000), None))
                else:
                    results.append(TestResult('hidden', 3, "Hidden 3-Qubit Expectation ZIZ", False, int((time.perf_counter() - start_t) * 1000), "Incorrect parity masking."))
            except Exception as e:
                results.append(TestResult('hidden', 3, "Hidden 3-Qubit Expectation ZIZ", False, int((time.perf_counter() - start_t) * 1000), str(e)))
        else:
            results.append(TestResult('hidden', 3, "Hidden 3-Qubit Expectation ZIZ", False, 0, "Missing function."))

        return results

    def calculate_score(self, public_results: List[TestResult], hidden_results: List[TestResult]) -> int:
        all_res = public_results + hidden_results
        passed = sum(1 for r in all_res if r.passed)
        if not all_res:
            return 0
        return int(round((passed / len(all_res)) * self.max_score))
