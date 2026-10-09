"""
Problem P4: Floating-Ancilla Bernstein–Vazirani (10 Points)
Recover hidden bitstring s from f(x) = s·x ⊕ b where ancilla is located at arbitrary index anc.
"""

import time
from typing import List
from problems.base import BaseProblemJudge, TestResult
from validator import validate_v0_circuit

def make_bv_oracle(n: int, anc: int, s: str, b: int):
    """Creates a standard BV oracle on n+1 qubits."""
    from qiskit import QuantumCircuit
    oracle = QuantumCircuit(n + 1, name="BV_Oracle")
    data_qubits = [q for q in range(n + 1) if q != anc]

    # Bias b
    if b == 1:
        oracle.x(anc)

    # s · x: if s[k] == '1', CX(data_k, anc)
    for k, bit in enumerate(s):
        if bit == '1':
            oracle.cx(data_qubits[k], anc)

    return oracle.to_gate(label=f"U_f(s={s},b={b})")

class P4Judge(BaseProblemJudge):
    problem_id = "P4"
    max_score = 10

    PUBLIC_CASES = [
        {"n": 2, "anc": 2, "s": "10", "b": 0, "name": "Standard Ancilla (Last) n=2"},
        {"n": 3, "anc": 0, "s": "110", "b": 1, "name": "First Qubit Ancilla n=3 with Bias"},
        {"n": 3, "anc": 1, "s": "011", "b": 0, "name": "Middle Qubit Ancilla n=3"},
    ]

    HIDDEN_CASES = [
        {"n": 4, "anc": 0, "s": "1011", "b": 0, "name": "Hidden n=4 Anc=0"},
        {"n": 4, "anc": 2, "s": "0110", "b": 1, "name": "Hidden n=4 Anc=2 with Bias"},
        {"n": 4, "anc": 4, "s": "1111", "b": 0, "name": "Hidden n=4 Anc=4"},
        {"n": 5, "anc": 3, "s": "10011", "b": 1, "name": "Hidden n=5 Anc=3 with Bias"},
        {"n": 5, "anc": 0, "s": "00001", "b": 0, "name": "Hidden n=5 Anc=0 Single Bit"},
    ]

    def _run_case(self, func, case: dict, test_type: str, test_number: int) -> TestResult:
        start_t = time.perf_counter()
        try:
            from qiskit.quantum_info import Statevector

            n = case["n"]
            anc = case["anc"]
            s = case["s"]
            b = case["b"]
            name = case["name"]

            oracle_gate = make_bv_oracle(n, anc, s, b)
            qc = func(oracle_gate, n, anc)

            # 1. V0 check
            ok, err = validate_v0_circuit(qc, expected_qubits=n + 1, expected_clbits=n, allow_synthesis=False)
            if not ok:
                return TestResult(test_type, test_number, name, False, int((time.perf_counter() - start_t) * 1000), err)

            # 2. Check oracle inclusion: must contain oracle gate
            oracle_count = sum(1 for inst in qc.data if 'BV_Oracle' in (inst.operation.name or '') or 'U_f' in (inst.operation.label or ''))
            if oracle_count != 1:
                return TestResult(test_type, test_number, name, False, int((time.perf_counter() - start_t) * 1000),
                                  f"Expected exactly 1 oracle instruction call, found {oracle_count}.")

            # 3. Simulate state before measurement
            qc_no_meas = qc.remove_final_measurements(inplace=False)
            sv = Statevector(qc_no_meas)
            probs = sv.probabilities_dict()

            # Data qubits measured to classical bits
            # Check measurement connections: clbit k should measure data qubit k
            data_qubits = [q for q in range(n + 1) if q != anc]
            meas_map = {}
            for inst in qc.data:
                if inst.operation.name == 'measure':
                    q_idx = qc.find_bit(inst.qubits[0]).index
                    c_idx = qc.find_bit(inst.clbits[0]).index
                    meas_map[c_idx] = q_idx

            for k in range(n):
                if meas_map.get(k) != data_qubits[k]:
                    return TestResult(test_type, test_number, name, False, int((time.perf_counter() - start_t) * 1000),
                                      f"Clbit {k} does not measure expected data qubit {data_qubits[k]}.")

            exec_time = int((time.perf_counter() - start_t) * 1000)
            return TestResult(test_type, test_number, name, True, exec_time, None)

        except Exception as e:
            exec_time = int((time.perf_counter() - start_t) * 1000)
            return TestResult(test_type, test_number, case["name"], False, exec_time, str(e))

    def run_public_tests(self, user_module) -> List[TestResult]:
        func = getattr(user_module, 'bernstein_vazirani', None)
        if not func:
            return [TestResult('public', 1, "Function Presence", False, 0, "Function 'bernstein_vazirani' not defined.")]

        results = []
        for idx, case in enumerate(self.PUBLIC_CASES, 1):
            results.append(self._run_case(func, case, 'public', idx))
        return results

    def run_hidden_tests(self, user_module) -> List[TestResult]:
        func = getattr(user_module, 'bernstein_vazirani', None)
        if not func:
            return [TestResult('hidden', 1, "Function Presence", False, 0, "Function 'bernstein_vazirani' not defined.")]

        results = []
        for idx, case in enumerate(self.HIDDEN_CASES, 1):
            results.append(self._run_case(func, case, 'hidden', idx))
        return results
