"""
Problem P6: Shift-Rule Gradient (11 Points)
Evaluate gradient of parameterized circuit with respect to each parameter using parameter-shift rule.
"""

import time
from typing import List
import numpy as np
from problems.base import BaseProblemJudge, TestResult

class P6Judge(BaseProblemJudge):
    problem_id = "P6"
    max_score = 11

    def _test_gradient(self, func, circuit, values, ref_grad, test_type: str, test_number: int, name: str) -> TestResult:
        start_t = time.perf_counter()
        call_count = [0]

        from qiskit.quantum_info import Statevector, Pauli

        def mock_evaluator(bound_qc):
            call_count[0] += 1
            if getattr(bound_qc, 'num_parameters', 0) > 0:
                raise ValueError("Evaluator called on unbound circuit!")
            # Measure Z expectation on qubit 0 as default objective (rightmost character in Qiskit convention)
            sv = Statevector(bound_qc)
            z_op = Pauli('I' * (bound_qc.num_qubits - 1) + 'Z')
            return float(np.real(sv.expectation_value(z_op)))

        try:
            user_grad = func(circuit, values, mock_evaluator)

            # Cap on calls: at most 2 calls per parameterized-gate occurrence
            max_calls = len(circuit.data) * 2 + 5
            min_calls = 2 * len(values)
            if call_count[0] < min_calls:
                return TestResult(test_type, test_number, name, False, int((time.perf_counter() - start_t) * 1000),
                                  f"Evaluator called {call_count[0]} times, expected at least {min_calls} calls for parameter-shift rule.")
            if call_count[0] > max_calls:
                return TestResult(test_type, test_number, name, False, int((time.perf_counter() - start_t) * 1000),
                                  f"Evaluator called {call_count[0]} times, exceeding limit of {max_calls}.")

            user_grad = np.asarray(user_grad, dtype=float)
            ref_grad = np.asarray(ref_grad, dtype=float)

            if user_grad.shape != ref_grad.shape:
                return TestResult(test_type, test_number, name, False, int((time.perf_counter() - start_t) * 1000),
                                  f"Output gradient shape {user_grad.shape} does not match {ref_grad.shape}.")

            diff = np.max(np.abs(user_grad - ref_grad))
            if diff > 5e-5:
                return TestResult(test_type, test_number, name, False, int((time.perf_counter() - start_t) * 1000),
                                  f"Gradient error {diff:.6e} exceeds tolerance 5e-5.")

            exec_time = int((time.perf_counter() - start_t) * 1000)
            return TestResult(test_type, test_number, name, True, exec_time, None)

        except Exception as e:
            exec_time = int((time.perf_counter() - start_t) * 1000)
            return TestResult(test_type, test_number, name, False, exec_time, str(e))

    def run_public_tests(self, user_module) -> List[TestResult]:
        func = getattr(user_module, 'param_shift_gradient', None)
        if not func:
            return [TestResult('public', 1, "Function Presence", False, 0, "Function 'param_shift_gradient' not defined.")]

        from qiskit import QuantumCircuit
        from qiskit.circuit import Parameter

        results = []

        # Public 1: Single Parameter RX
        theta = Parameter('θ')
        qc1 = QuantumCircuit(1)
        qc1.rx(theta, 0)
        # For |0>, RX(θ)|0> has <Z> = cos(θ). d/dθ <Z> = -sin(θ)
        val = np.pi / 4
        ref1 = np.array([-np.sin(val)])
        results.append(self._test_gradient(func, qc1, [val], ref1, 'public', 1, "Single Parameter RX"))

        # Public 2: Two Parameters RY and RZ
        t1 = Parameter('θ1')
        t2 = Parameter('θ2')
        qc2 = QuantumCircuit(1)
        qc2.ry(t1, 0)
        qc2.rz(t2, 0)
        # <Z> = cos(θ1) (independent of RZ). Grad = [-sin(t1), 0.0]
        v1, v2 = 0.6, 1.2
        ref2 = np.array([-np.sin(v1), 0.0])
        results.append(self._test_gradient(func, qc2, [v1, v2], ref2, 'public', 2, "Two Parameters (RY, RZ)"))

        return results

    def run_hidden_tests(self, user_module) -> List[TestResult]:
        func = getattr(user_module, 'param_shift_gradient', None)
        if not func:
            return [TestResult('hidden', 1, "Function Presence", False, 0, "Function 'param_shift_gradient' not defined.")]

        from qiskit import QuantumCircuit
        from qiskit.circuit import Parameter

        results = []

        # Hidden 1: Repeated parameter
        theta = Parameter('θ')
        qc_rep = QuantumCircuit(1)
        qc_rep.rx(theta, 0)
        qc_rep.rx(theta, 0) # Total rotation 2*θ
        val = np.pi / 6
        ref_rep = np.array([-2 * np.sin(2 * val)])
        results.append(self._test_gradient(func, qc_rep, [val], ref_rep, 'hidden', 1, "Hidden Repeated Parameter"))

        # Hidden 2: Multi-qubit circuit with RZZ
        t = Parameter('θ')
        qc_2q = QuantumCircuit(2)
        qc_2q.h(0)
        qc_2q.rzz(t, 0, 1)
        # E(Z0) is 0 because H(0) sets <Z0>=0 and RZZ commutes with Z0. Grad = [0.0]
        results.append(self._test_gradient(func, qc_2q, [0.8], np.array([0.0]), 'hidden', 2, "Hidden 2-Qubit RZZ"))

        return results
