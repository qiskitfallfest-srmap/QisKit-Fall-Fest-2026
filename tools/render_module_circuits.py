"""Render one representative circuit per in-class module as a PNG (Qiskit "iqp" style).

Used for the QFF 2026 in-class modules workshop deck.

Usage:
    python tools/render_module_circuits.py [out_dir]
"""

import sys
from math import pi, sqrt
from pathlib import Path

import matplotlib

matplotlib.use("Agg")

from qiskit import ClassicalRegister, QuantumCircuit, QuantumRegister  # noqa: E402
from qiskit.circuit.library import QFTGate, efficient_su2, grover_operator  # noqa: E402


def m01_bell():
    qc = QuantumCircuit(2, 2)
    qc.h(0)
    qc.cx(0, 1)
    qc.measure([0, 1], [0, 1])
    return qc


def m02_coin():
    qc = QuantumCircuit(1, 1)
    qc.sx(0)
    qc.barrier()
    qc.sx(0)
    qc.measure(0, 0)
    return qc


def m03_stern_gerlach():
    qc = QuantumCircuit(1, 1)
    qc.initialize([sqrt(0.6), sqrt(0.4)])
    qc.measure(0, 0)
    return qc


def m04_uncertainty():
    # prepares |+i> (the |+>_y state), then Estimator measures <X>, <Y>, <Z>
    qc = QuantumCircuit(1)
    qc.h(0)
    qc.s(0)
    return qc


def m05_chsh():
    qc = QuantumCircuit(2)
    qc.h(0)
    qc.cx(0, 1)
    qc.barrier()
    qc.ry(-2 * pi / 3, 1)
    qc.measure_all()
    return qc


def m06_deutsch_jozsa():
    n = 3
    oracle = QuantumCircuit(n + 1, name="U_f")
    for q in range(n):
        oracle.cx(q, n)  # balanced: f(x) = x0 xor x1 xor x2
    qc = QuantumCircuit(n + 1, n)
    qc.x(n)
    qc.h(range(n + 1))
    qc.barrier()
    qc.append(oracle.to_gate(label="U_f"), range(n + 1))
    qc.barrier()
    qc.h(range(n))
    qc.measure(range(n), range(n))
    return qc


def m07_grover():
    oracle = QuantumCircuit(3)
    # mark |101>
    oracle.x(1)
    oracle.h(2)
    oracle.ccx(0, 1, 2)
    oracle.h(2)
    oracle.x(1)
    g = grover_operator(oracle).to_gate(label="Grover")
    qc = QuantumCircuit(3)
    qc.h(range(3))
    qc.barrier()
    qc.append(g, range(3))
    qc.append(g, range(3))
    qc.measure_all()
    return qc


def m08_teleport():
    secret = QuantumRegister(1, "Q")
    alice = QuantumRegister(1, "A")
    bob = QuantumRegister(1, "B")
    cr = ClassicalRegister(3, "c")
    qc = QuantumCircuit(secret, alice, bob, cr)
    qc.ry(1.2, secret)
    qc.barrier()
    qc.h(alice)
    qc.cx(alice, bob)
    qc.barrier()
    qc.cx(secret, alice)
    qc.h(secret)
    qc.measure(secret, cr[0])
    qc.measure(alice, cr[1])
    with qc.if_test((cr[1], 1)):
        qc.x(bob)
    with qc.if_test((cr[0], 1)):
        qc.z(bob)
    qc.measure(bob, cr[2])
    return qc


def m09_bb84():
    # four key slots: Alice bits 1,0,1,1 in bases Z,X,X,Z; Bob measures in Z,X,Z,X
    qc = QuantumCircuit(4, 4)
    qc.x([0, 2, 3])
    qc.h([1, 2])
    qc.barrier(label="send")
    qc.h([1, 3])
    qc.measure(range(4), range(4))
    return qc


def m10_shor():
    n = 4
    mult2 = QuantumCircuit(n, name="2 mod 15")
    mult2.swap(2, 3)
    mult2.swap(1, 2)
    mult2.swap(0, 1)
    ctrl = QuantumRegister(n, "ctrl")
    tgt = QuantumRegister(n, "target")
    cr = ClassicalRegister(n, "c")
    qc = QuantumCircuit(ctrl, tgt, cr)
    qc.h(ctrl)
    qc.x(tgt[0])
    for j in range(n):
        power = 2**j
        u = QuantumCircuit(n, name=f"2^{power} mod 15")
        for _ in range(power % 4):  # 2 has order 4 mod 15
            u.compose(mult2, inplace=True)
        qc.append(u.to_gate(label=f"x 2^{power} mod 15").control(1), [ctrl[j], *tgt])
    qc.append(QFTGate(n).inverse(), ctrl)
    qc.measure(ctrl, cr)
    return qc


def m11_qft():
    qc = QuantumCircuit(3)
    qc.h(2)
    qc.cp(pi / 2, 1, 2)
    qc.cp(pi / 4, 0, 2)
    qc.h(1)
    qc.cp(pi / 2, 0, 1)
    qc.h(0)
    qc.swap(0, 2)
    return qc


def m12_vqe():
    return efficient_su2(2, reps=1).decompose()


CIRCUITS = {
    "m01_bell": m01_bell,
    "m02_coin": m02_coin,
    "m03_stern_gerlach": m03_stern_gerlach,
    "m04_uncertainty": m04_uncertainty,
    "m05_chsh": m05_chsh,
    "m06_deutsch_jozsa": m06_deutsch_jozsa,
    "m07_grover": m07_grover,
    "m08_teleport": m08_teleport,
    "m09_bb84": m09_bb84,
    "m10_shor": m10_shor,
    "m11_qft": m11_qft,
    "m12_vqe": m12_vqe,
}


def main() -> int:
    out = Path(sys.argv[1] if len(sys.argv) > 1 else "exports/in-class-modules/circuits")
    out.mkdir(parents=True, exist_ok=True)
    for name, build in CIRCUITS.items():
        fig = build().draw("mpl", style="iqp", fold=-1, scale=1.0)
        path = out / f"{name}.png"
        fig.savefig(path, dpi=200, bbox_inches="tight", facecolor="white")
        print("ok", path)
    return 0


if __name__ == "__main__":
    sys.exit(main())
