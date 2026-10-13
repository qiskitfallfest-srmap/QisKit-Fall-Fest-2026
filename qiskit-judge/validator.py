"""
Quantum-Specific Circuit and Output Validators (V0 Harness).
Validates types, qubit/clbit counts, prohibited synthesis gates,
unbound parameters, instruction count caps, and QPY serialization.
"""

from typing import Tuple, Optional, Set
import io

BANNED_SYNTHESIS_GATES: Set[str] = {
    'initialize',
    'state_preparation',
    'statepreparation',
    'unitary',
    'unitarygate',
    'isometry',
}

BANNED_CONTROL_FLOW: Set[str] = {
    'if_else',
    'while_loop',
    'for_loop',
    'switch_case',
    'delay',
}

def validate_v0_circuit(
    qc,
    expected_qubits: Optional[int] = None,
    expected_clbits: Optional[int] = None,
    allow_synthesis: bool = False,
    allow_parameters: bool = False,
    max_instructions: int = 5000,
) -> Tuple[bool, Optional[str]]:
    """
    Enforces shared V0 checks across quantum circuit outputs.
    """
    # 1. Type check
    type_name = type(qc).__name__
    if type_name != 'QuantumCircuit':
        return False, f"Expected return type QuantumCircuit, received {type_name}."

    # 2. Qubit count check
    if expected_qubits is not None and qc.num_qubits != expected_qubits:
        return False, f"Expected circuit on {expected_qubits} qubits, received {qc.num_qubits} qubits."

    # 3. Classical bit count check
    if expected_clbits is not None and qc.num_clbits != expected_clbits:
        return False, f"Expected circuit with {expected_clbits} classical bits, received {qc.num_clbits} classical bits."

    # 4. Parameter check
    if not allow_parameters and getattr(qc, 'num_parameters', 0) > 0:
        param_names = [p.name for p in qc.parameters]
        return False, f"Circuit contains unbound parameter(s): {', '.join(param_names)}."

    # 5. Instruction count check
    inst_count = len(qc.data)
    if inst_count > max_instructions:
        return False, f"Circuit instruction count ({inst_count}) exceeds limit of {max_instructions}."

    # 6. Banned gate & control flow inspection
    for inst in qc.data:
        op_name = inst.operation.name.lower()
        if not allow_synthesis and op_name in BANNED_SYNTHESIS_GATES:
            return False, f"Use of banned state-synthesis gate '{inst.operation.name}' is prohibited."
        if op_name in BANNED_CONTROL_FLOW:
            return False, f"Use of prohibited instruction '{inst.operation.name}' is not allowed."

    # 7. QPY serialization test
    try:
        from qiskit import qpy
        buf = io.BytesIO()
        qpy.dump(qc, buf)
    except Exception as e:
        return False, f"Circuit failed standard QPY serialization check: {str(e)}"

    return True, None
