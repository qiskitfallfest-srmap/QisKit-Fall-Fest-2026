"""
Problem P3: Repair Shop (10 Points)
Correct 1-2 seeded faults in a quantum circuit to match target state with fidelity >= 1 - 1e-9.
"""

import time
from typing import List
import numpy as np
from problems.base import BaseProblemJudge, TestResult
from validator import validate_v0_circuit

ALLOWED_GATES = {"h", "x", "y", "z", "s", "sdg", "t", "tdg", "sx", "rx", "ry", "rz", "cx", "cz", "swap"}

class P3Judge(BaseProblemJudge):
    problem_id = "P3"
    max_score = 10

    def _generate_cases(self):
        from qiskit import QuantumCircuit
        from qiskit.quantum_info import Statevector

        cases = []

        # Case 1: No fault (Public 1)
        qc1 = QuantumCircuit(3)
        qc1.h(0)
        qc1.cx(0, 1)
        qc1.cx(1, 2)
        cases.append(('public', 1, "Identity / No Fault Case", qc1.copy(), Statevector(qc1)))

        # Case 2: 1-Fault Reversed CX (Public 2)
        target2 = QuantumCircuit(3)
        target2.h(0)
        target2.cx(0, 1)
        target2.x(2)
        buggy2 = QuantumCircuit(3)
        buggy2.h(0)
        buggy2.cx(1, 0) # Fault: reversed CX
        buggy2.x(2)
        cases.append(('public', 2, "Reversed CX Fault", buggy2, Statevector(target2)))

        # Case 3: 1-Fault Inverted Rotation Sign (Public 3)
        target3 = QuantumCircuit(3)
        target3.rx(np.pi / 4, 0)
        target3.cz(0, 1)
        buggy3 = QuantumCircuit(3)
        buggy3.rx(-np.pi / 4, 0) # Fault: sign
        buggy3.cz(0, 1)
        cases.append(('public', 3, "Inverted Rotation Sign", buggy3, Statevector(target3)))

        # Hidden Cases
        # Hidden 1: Missing Gate
        target_h1 = QuantumCircuit(3)
        target_h1.h(0)
        target_h1.s(1)
        target_h1.cx(0, 2)
        buggy_h1 = QuantumCircuit(3)
        buggy_h1.h(0)
        buggy_h1.cx(0, 2) # Missing s(1)
        cases.append(('hidden', 1, "Hidden Missing Gate", buggy_h1, Statevector(target_h1)))

        # Hidden 2: S vs Sdg fault
        target_h2 = QuantumCircuit(3)
        target_h2.h(0)
        target_h2.s(0)
        buggy_h2 = QuantumCircuit(3)
        buggy_h2.h(0)
        buggy_h2.sdg(0)
        cases.append(('hidden', 2, "Hidden S/Sdg Phase Fault", buggy_h2, Statevector(target_h2)))

        # Hidden 3: 4-qubit 2-fault case
        target_h3 = QuantumCircuit(4)
        target_h3.h(0)
        target_h3.cx(0, 1)
        target_h3.cx(1, 2)
        target_h3.x(3)
        buggy_h3 = QuantumCircuit(4)
        buggy_h3.h(0)
        buggy_h3.cx(1, 0) # Fault 1
        buggy_h3.cx(1, 2)
        buggy_h3.z(3)    # Fault 2 (z instead of x)
        cases.append(('hidden', 3, "Hidden 2-Fault 4-Qubit", buggy_h3, Statevector(target_h3)))

        return cases

    def run_public_tests(self, user_module) -> List[TestResult]:
        func = getattr(user_module, 'repair_circuit', None)
        if not func:
            return [TestResult('public', 1, "Function Presence", False, 0, "Function 'repair_circuit' not defined.")]

        cases = [c for c in self._generate_cases() if c[0] == 'public']
        return self._run_test_list(func, cases)

    def run_hidden_tests(self, user_module) -> List[TestResult]:
        func = getattr(user_module, 'repair_circuit', None)
        if not func:
            return [TestResult('hidden', 1, "Function Presence", False, 0, "Function 'repair_circuit' not defined.")]

        cases = [c for c in self._generate_cases() if c[0] == 'hidden']
        return self._run_test_list(func, cases)

    def _run_test_list(self, func, cases) -> List[TestResult]:
        from qiskit.quantum_info import Statevector, state_fidelity

        results = []
        for test_type, num, name, buggy, target_sv in cases:
            start_t = time.perf_counter()
            try:
                repaired = func(buggy, target_sv)

                # V0 check
                ok, err = validate_v0_circuit(repaired, expected_qubits=buggy.num_qubits, expected_clbits=0, allow_synthesis=False)
                if not ok:
                    results.append(TestResult(test_type, num, name, False, int((time.perf_counter() - start_t) * 1000), err))
                    continue

                # Gate whitelist check
                for inst in repaired.data:
                    op = inst.operation.name.lower()
                    if op not in ALLOWED_GATES:
                        results.append(TestResult(test_type, num, name, False, int((time.perf_counter() - start_t) * 1000),
                                                  f"Gate '{inst.operation.name}' not in allowed gate set."))
                        break
                else:
                    # Size check
                    if repaired.size() > buggy.size() + 3:
                        results.append(TestResult(test_type, num, name, False, int((time.perf_counter() - start_t) * 1000),
                                                  f"Repaired circuit size ({repaired.size()}) exceeds buggy.size()+3 ({buggy.size()+3})."))
                        continue

                    # Fidelity check
                    rep_sv = Statevector(repaired)
                    fid = state_fidelity(rep_sv, target_sv)
                    if fid < 1 - 1e-9:
                        results.append(TestResult(test_type, num, name, False, int((time.perf_counter() - start_t) * 1000),
                                                  f"State fidelity ({fid:.6f}) below threshold 1 - 1e-9."))
                        continue

                    exec_time = int((time.perf_counter() - start_t) * 1000)
                    results.append(TestResult(test_type, num, name, True, exec_time, None))

            except Exception as e:
                exec_time = int((time.perf_counter() - start_t) * 1000)
                results.append(TestResult(test_type, num, name, False, exec_time, str(e)))

        return results
