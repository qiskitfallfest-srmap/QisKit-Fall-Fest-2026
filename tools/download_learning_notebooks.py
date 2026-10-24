"""Download IBM Quantum Learning module notebooks from the Qiskit/documentation repo.

The pages at quantum.cloud.ibm.com/learning/en/modules/<group>/<slug> are rendered
from learning/modules/<group>/<slug>.ipynb in github.com/Qiskit/documentation.

Usage:
    python tools/download_learning_notebooks.py [out_dir]
"""

import json
import sys
import urllib.request
from pathlib import Path

RAW = "https://raw.githubusercontent.com/Qiskit/documentation/main/learning/modules"

MODULES = [
    ("quantum-mechanics", "get-started-with-qiskit"),
    ("quantum-mechanics", "superposition-with-qiskit"),
    ("quantum-mechanics", "stern-gerlach-measurements-with-qiskit"),
    ("quantum-mechanics", "exploring-uncertainty-with-qiskit"),
    ("quantum-mechanics", "bells-inequality-with-qiskit"),
    ("computer-science", "deutsch-jozsa"),
    ("computer-science", "grovers"),
    ("computer-science", "quantum-teleportation"),
    ("computer-science", "quantum-key-distribution"),
    ("computer-science", "shors-algorithm"),
    ("computer-science", "qft"),
    ("computer-science", "vqe"),
]


def main() -> int:
    out = Path(sys.argv[1] if len(sys.argv) > 1 else "exports/in-class-modules/notebooks")
    failures = 0
    for i, (group, slug) in enumerate(MODULES, start=1):
        url = f"{RAW}/{group}/{slug}.ipynb"
        dest = out / group / f"{i:02d}_{slug}.ipynb"
        dest.parent.mkdir(parents=True, exist_ok=True)
        try:
            with urllib.request.urlopen(url, timeout=60) as resp:
                data = resp.read()
            nb = json.loads(data)  # validate it is a notebook before saving
            dest.write_bytes(data)
            print(f"ok   {dest}  ({len(nb.get('cells', []))} cells, {len(data) // 1024} KB)")
        except Exception as exc:
            failures += 1
            print(f"FAIL {url}: {exc}")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
