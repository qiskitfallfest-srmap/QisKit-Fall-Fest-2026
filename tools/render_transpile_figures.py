"""Render the transpilation / depth-reduction figures for the in-class modules deck.

Each figure is generated from Qiskit objects (or a stated model), not copied from slides:
  layout.png      GHZ circuit + the layout the transpiler picks on a heavy-hex style coupling map
  depth_noise.png cumulative no-error probability per qubit vs. circuit layer (simple error model)
  boxes.png       a 4-qubit circuit segmented into boxes (Samplomatic-style)
  backprop.png    Z1Z0 pushed backwards through Clifford slices; barrier labels are computed
  aqc.png         schematic: a deep prefix replaced by a short approximate circuit

Usage:
    python tools/render_transpile_figures.py [out_dir]
"""

import sys
from math import pi
from pathlib import Path

import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
from matplotlib.patches import FancyBboxPatch, Rectangle  # noqa: E402
from qiskit import QuantumCircuit  # noqa: E402
from qiskit.quantum_info import Clifford, Pauli  # noqa: E402
from qiskit.transpiler import CouplingMap, generate_preset_pass_manager  # noqa: E402

BLUE = "#0f62fe"
PURPLE = "#8a3ffc"
GRAY = "#c6c6c6"
INK = "#161616"


def save(fig, path):
    fig.savefig(path, dpi=200, bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close(fig)
    print("ok", path)


def ghz(n=5):
    qc = QuantumCircuit(n)
    qc.h(0)
    for q in range(1, n):
        qc.cx(0, q)
    qc.measure_all()
    return qc


def heavy_hex_like():
    """15 physical qubits in 3 rows of 5, rows joined at alternating columns."""
    pos, edges = {}, []
    for r in range(3):
        for c in range(5):
            q = r * 5 + c
            pos[q] = (c, -r)
            if c < 4:
                edges.append((q, q + 1))
    for c in (0, 2, 4):
        edges.append((c, 5 + c))
    for c in (1, 3):
        edges.append((5 + c, 10 + c))
    return pos, edges


def fig_layout(out):
    pos, edges = heavy_hex_like()
    cmap = CouplingMap([list(e) for e in edges] + [[b, a] for a, b in edges])
    qc = ghz()
    pm = generate_preset_pass_manager(
        optimization_level=3, coupling_map=cmap, basis_gates=["cx", "rz", "sx", "x"], seed_transpiler=11
    )
    tqc = pm.run(qc)
    v2p = dict(enumerate(tqc.layout.initial_index_layout(filter_ancillas=True)))
    swaps = tqc.count_ops().get("swap", 0)

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5), gridspec_kw={"width_ratios": [1.05, 1]})
    fig.patch.set_facecolor("white")
    qc.draw("mpl", style="iqp", ax=ax1)
    ax1.set_title("Your circuit: virtual qubits q0–q4", fontsize=13, color=INK, loc="left")

    for a, b in edges:
        (x1, y1), (x2, y2) = pos[a], pos[b]
        used = a in v2p.values() and b in v2p.values()
        ax2.plot([x1, x2], [y1, y2], color=BLUE if used else GRAY, lw=5 if used else 3, zorder=1)
    p2v = {p: v for v, p in v2p.items()}
    for q, (x, y) in pos.items():
        on = q in p2v
        ax2.scatter(x, y, s=900, color=BLUE if on else "#e0e0e0", zorder=2, edgecolor="white", lw=2)
        ax2.text(x, y, str(q), ha="center", va="center", fontsize=11, color="white" if on else INK, zorder=3)
        if on:
            ax2.text(
                x + 0.27, y + 0.27, f"q{p2v[q]}", ha="left", va="bottom", fontsize=12, color=BLUE, weight="bold",
                bbox=dict(boxstyle="round,pad=0.15", fc="white", ec="none"), zorder=4,
            )
    ax2.set_xlim(-0.6, 4.6)
    ax2.set_ylim(-2.6, 0.9)
    ax2.set_aspect("equal")
    ax2.axis("off")
    ax2.set_title(f"Chip: physical qubits chosen by layout ({swaps} SWAPs needed)", fontsize=13, color=INK, loc="left")
    save(fig, out / "layout.png")


def fig_depth_noise(out, n_qubits=40, n_layers=60, seed=3):
    rng = np.random.default_rng(seed)
    # per-qubit error per layer, log-uniform between 0.02% and 2%
    eps = np.exp(rng.uniform(np.log(2e-4), np.log(2e-2), n_qubits))
    layers = np.arange(1, n_layers + 1)
    survive = (1 - eps[:, None]) ** layers[None, :]

    fig, ax = plt.subplots(figsize=(12, 6))
    fig.patch.set_facecolor("#1f2427")
    ax.set_facecolor("#1f2427")
    im = ax.imshow(survive, aspect="auto", cmap="viridis", vmin=0, vmax=1, interpolation="nearest")
    # whole register error-free probability = product over qubits; mark where it drops below 50%
    register = np.prod(survive, axis=0)
    cut = int(np.argmax(register < 0.5))
    ax.axvline(cut, color="#ff8389", lw=2)
    ax.text(
        cut + 1, 1, f"layer {cut + 1}: P(whole register error-free) < 50%", color="#ffd7d9", fontsize=13,
        va="top", bbox=dict(boxstyle="round,pad=0.3", fc="#1f2427", ec="#ff8389"),
    )
    ax.set_xlabel("Time (circuit layer)", color="#f4f4f4", fontsize=13)
    ax.set_ylabel("Space (qubit)", color="#f4f4f4", fontsize=13)
    ax.tick_params(colors="#c6c6c6")
    for s in ax.spines.values():
        s.set_visible(False)
    cb = fig.colorbar(im, ax=ax, fraction=0.03, pad=0.02)
    cb.set_label("P(no error so far)", color="#f4f4f4")
    cb.ax.tick_params(colors="#c6c6c6")
    save(fig, out / "depth_noise.png")


def fig_boxes(out):
    qc = QuantumCircuit(4, 4)
    for _ in range(2):
        with qc.box():
            for q in range(4):
                qc.rx(pi / 16, q)
                qc.sdg(q)
            qc.cz(0, 1)
            qc.cz(2, 3)
        with qc.box():
            qc.sdg(1)
            qc.sdg(2)
            qc.cz(1, 2)
    with qc.box():
        qc.measure(range(4), range(4))
    fig = qc.draw("mpl", style="iqp", fold=-1)
    save(fig, out / "boxes.png")


def fig_backprop(out):
    # slices of a 2-qubit Clifford circuit
    def layer(qubits):
        s = QuantumCircuit(2)
        for q in qubits:
            s.rz(pi / 2, q)
            s.sx(q)
            s.rz(pi / 2, q)
        return s

    def cz():
        s = QuantumCircuit(2)
        s.cz(0, 1)
        return s

    slices = [layer([0, 1]), cz(), layer([0, 1]), cz(), layer([0])]

    # Heisenberg picture: O_before = U^dagger O_after U, starting from Z1 Z0 at the end
    obs = [Pauli("ZZ")]
    for s in reversed(slices):
        obs.append(obs[-1].evolve(Clifford(s), frame="h"))
    obs = obs[::-1]  # obs[i] = observable just before slice i; obs[-1] = Z1Z0 at the end

    def label(p):
        p = Pauli((p.z, p.x))  # drop the phase for display
        lab = p.to_label()
        return f"{lab[0]}1{lab[1]}0"

    qc = QuantumCircuit(2)
    for i, s in enumerate(slices):
        qc.barrier(label=label(obs[i]))
        qc.compose(s, inplace=True)
    qc.barrier(label=label(obs[-1]))
    fig = qc.draw("mpl", style="iqp", fold=-1, plot_barriers=True)
    save(fig, out / "backprop.png")


def fig_aqc(out):
    fig, ax = plt.subplots(figsize=(13, 5.2))
    fig.patch.set_facecolor("white")
    ax.axis("off")

    def row(y, blocks, label):
        ax.text(-0.3, y + 0.55, label, ha="right", va="center", fontsize=13, color=INK, weight="bold")
        for w in range(3):
            ax.plot([0, 11], [y + 0.15 + 0.4 * w] * 2, color=INK, lw=1.2, zorder=1)
        for x, kind in blocks:
            if kind == "aqc":
                ax.add_patch(FancyBboxPatch((x, y), 1.6, 1.1, boxstyle="round,pad=0.02", fc=PURPLE, ec=PURPLE, zorder=2))
                ax.text(x + 0.8, y + 0.55, "AQC", ha="center", va="center", color="white", fontsize=12, weight="bold")
            else:
                ax.add_patch(Rectangle((x, y), 0.55, 1.1, fc="white", ec=INK, lw=1.4, zorder=2))

    deep = [(0.4 + i * 1.3, "gate") for i in range(8)]
    row(2.2, deep, "Original\n8 layers")
    ax.add_patch(Rectangle((0.2, 2.05), 6.4, 1.4, fc=PURPLE, alpha=0.18, ec=PURPLE, ls="--", zorder=0))
    ax.text(3.4, 3.65, "simulated classically with a tensor network", ha="center", fontsize=12, color=PURPLE)
    ax.annotate("", xy=(1.2, 1.35), xytext=(3.4, 1.95), arrowprops=dict(arrowstyle="-|>", color=PURPLE, lw=2))
    row(0, [(0.4, "aqc")] + [(0.4 + 1.9 + i * 1.3, "gate") for i in range(3)], "After AQC\n4 layers")
    ax.set_xlim(-2.2, 11.2)
    ax.set_ylim(-0.4, 4.1)
    save(fig, out / "aqc.png")


def main() -> int:
    out = Path(sys.argv[1] if len(sys.argv) > 1 else "exports/in-class-modules/figures")
    out.mkdir(parents=True, exist_ok=True)
    fig_layout(out)
    fig_depth_noise(out)
    fig_boxes(out)
    fig_backprop(out)
    fig_aqc(out)
    return 0


if __name__ == "__main__":
    sys.exit(main())
