"""
Problem P8: Noise-Scaled Extrapolation (ZNE) (15 Points)
Mitigate noise on expectation values using unitary folding and polynomial/richardson extrapolation.
"""

import time
from typing import List
import numpy as np
from problems.base import BaseProblemJudge, TestResult

class P8Judge(BaseProblemJudge):
    problem_id = "P8"
    max_score = 15

    def _test_zne(self, func, circuit, z_mask: str, ideal_val: float, noise_rate: float, test_type: str, test_number: int, name: str) -> TestResult:
        start_t = time.perf_counter()
        calls = [0]
        total_shots = [0]

        from qiskit.quantum_info import Statevector

        scales_recorded = []

        def mock_noisy_runner(qc_measured, shots: int):
            calls[0] += 1
            total_shots[0] += shots

            if calls[0] > 10:
                raise ValueError("Exceeded maximum of 10 runner calls.")
            if total_shots[0] > 40000:
                raise ValueError("Exceeded maximum total budget of 40,000 shots.")

            # Compute effective noise scale from circuit depth/size
            scale = max(1.0, len(qc_measured.data) / max(1, len(circuit.data)))
            scales_recorded.append(scale)
            # Model depolarizing decay: <Z>_noisy = <Z>_ideal * exp(-noise_rate * scale)
            noisy_exp = ideal_val * np.exp(-noise_rate * scale)

            # Sample empirical counts with binomial noise
            p_even = (1.0 + noisy_exp) / 2.0
            p_even = max(0.0, min(1.0, p_even))
            rng = np.random.default_rng(1234 + calls[0])
            n_even = rng.binomial(shots, p_even)
            n_odd = shots - n_even

            n_qubits = qc_measured.num_qubits
            even_bit = '0' * n_qubits
            odd_bit = '0' * (n_qubits - 1) + '1'

            return {even_bit: int(n_even), odd_bit: int(n_odd)}

        try:
            est = func(circuit, z_mask, mock_noisy_runner, 4000)

            if calls[0] < 2:
                return TestResult(test_type, test_number, name, False, int((time.perf_counter() - start_t) * 1000),
                                  f"ZNE requires calling noisy_runner at least twice with scaled/folded circuits. Only {calls[0]} call(s) made.")

            distinct_scales = len(set(round(s, 1) for s in scales_recorded))
            if distinct_scales < 2:
                return TestResult(test_type, test_number, name, False, int((time.perf_counter() - start_t) * 1000),
                                  "ZNE requires measuring at least 2 distinct noise scale factors (e.g. scale 1, scale 3).")

            # Evaluate performance
            error = abs(est - ideal_val)
            raw_noisy = ideal_val * np.exp(-noise_rate * 1.0)
            raw_error = abs(raw_noisy - ideal_val)

            # Threshold: mitigated error must improve on raw error and be within tolerance
            if error > 0.08 or (error >= raw_error and abs(raw_error) > 0.05):
                return TestResult(test_type, test_number, name, False, int((time.perf_counter() - start_t) * 1000),
                                  f"ZNE estimate {est:.4f} failed to extrapolate accurately (error: {error:.4f}, raw noisy error: {raw_error:.4f}).")

            exec_time = int((time.perf_counter() - start_t) * 1000)
            return TestResult(test_type, test_number, name, True, exec_time, None)

        except Exception as e:
            exec_time = int((time.perf_counter() - start_t) * 1000)
            return TestResult(test_type, test_number, name, False, exec_time, str(e))

    def run_public_tests(self, user_module) -> List[TestResult]:
        func = getattr(user_module, 'zne_expectation', None)
        if not func:
            return [TestResult('public', 1, "Function Presence", False, 0, "Function 'zne_expectation' not defined.")]

        from qiskit import QuantumCircuit

        results = []

        # Public 1: 2-Qubit Bell State |Φ+> with ZZ expectation (ideal = 1.0)
        qc_bell = QuantumCircuit(2)
        qc_bell.h(0)
        qc_bell.cx(0, 1)
        results.append(self._test_zne(func, qc_bell, "ZZ", ideal_val=1.0, noise_rate=0.15,
                                     test_type='public', test_number=1, name="Bell Pair ZZ Mitigation"))

        return results

    def run_hidden_tests(self, user_module) -> List[TestResult]:
        func = getattr(user_module, 'zne_expectation', None)
        if not func:
            return [TestResult('hidden', 1, "Function Presence", False, 0, "Function 'zne_expectation' not defined.")]

        from qiskit import QuantumCircuit

        results = []

        # Hidden 1: 3-Qubit GHZ State ZZZ expectation
        qc_ghz = QuantumCircuit(3)
        qc_ghz.h(0)
        qc_ghz.cx(0, 1)
        qc_ghz.cx(1, 2)
        results.append(self._test_zne(func, qc_ghz, "ZZZ", ideal_val=1.0, noise_rate=0.20,
                                     test_type='hidden', test_number=1, name="Hidden GHZ ZZZ Mitigation"))

        # Hidden 2: 1-Qubit X ground state expectation (ideal = 0.0)
        qc_1q = QuantumCircuit(1)
        qc_1q.rx(np.pi / 2, 0)
        results.append(self._test_zne(func, qc_1q, "Z", ideal_val=0.0, noise_rate=0.10,
                                     test_type='hidden', test_number=2, name="Hidden Z Expectation on |+i>"))

        return results
