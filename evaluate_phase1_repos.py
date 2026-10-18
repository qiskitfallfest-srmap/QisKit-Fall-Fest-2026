#!/usr/bin/env python3
"""
SRMAP Qiskit Fall Fest 2026 — Phase 1 Automated Repository Evaluator
====================================================================
Evaluates ~130+ student GitHub repositories against the official 100-point
Phase 1 Master Guide rubric WITHOUT hitting GitHub REST API rate limits.

How it avoids rate limits:
  - Uses shallow git clones (`git clone --depth 1 --filter=blob:limit=1m`)
    across a parallel worker pool instead of unauthenticated GitHub REST API
    calls (which cap at 60 requests/hr).
  - Performs static AST/notebook inspection, JSON topology validation,
    execution output checks, and code-similarity hashing locally.

Usage:
  pip install pandas openpyxl
  python evaluate_phase1_repos.py --input submissions.xlsx --output Phase1_Leaderboard.xlsx --workers 8
"""

from __future__ import annotations

import argparse
import ast
import concurrent.futures
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

import pandas as pd


# ---------------------------------------------------------------------------
# Reference Constants from Qiskit Fall Fest 2026 Phase 1 Master Guide
# ---------------------------------------------------------------------------

PDF_DEFAULT_A_LINEAR = {(0, 1), (1, 2), (2, 3), (3, 4)}
PDF_DEFAULT_A_STAR = {(0, 1), (1, 2), (1, 3), (3, 4)}
PDF_DEFAULT_A_RING = {(0, 1), (1, 2), (2, 3), (3, 4), (4, 0), (0, 4)}

PDF_DEFAULT_B_HEAVY_HEX = {
    (0, 1), (1, 2), (1, 6), (2, 3), (2, 6), (2, 5),
    (3, 4), (4, 5), (5, 6), (6, 7), (6, 8), (8, 0), (0, 8)
}

PROBLEM_STATEMENT_PATTERNS: Dict[str, Tuple[str, List[str]]] = {
    "PS-C1": ("Track 1: Quantum Chemistry", [r"PS-C1", r"0\.74", r"Jordan-Wigner", r"UCCSD"]),
    "PS-C2": ("Track 1: Quantum Chemistry", [r"PS-C2", r"Potential Energy Surface", r"LiH"]),
    "PS-C3": ("Track 1: Quantum Chemistry", [r"PS-C3", r"Triatomic", r"H2O", r"H3\+"]),
    "PS-C-OI": ("Track 1: Quantum Chemistry", [r"PS-C-OI", r"Custom Chemistry"]),
    "PS-O1": ("Track 2: Quantum Optimization", [r"PS-O1", r"Max-Cut", r"erdos_renyi_graph"]),
    "PS-O2": ("Track 2: Quantum Optimization", [r"PS-O2", r"Portfolio Optimization", r"0\.12,\s*0\.18"]),
    "PS-O3": ("Track 2: Quantum Optimization", [r"PS-O3", r"Knapsack", r"10,\s*4,\s*7,\s*5,\s*8"]),
    "PS-O-OI": ("Track 2: Quantum Optimization", [r"PS-O-OI", r"Custom Optimization"]),
    "PS-S1": ("Track 3: Quantum Simulation", [r"PS-S1", r"TFIM", r"Transverse-Field Ising", r"ZZII"]),
    "PS-S2": ("Track 3: Quantum Simulation", [r"PS-S2", r"Trotterized Spin Dynamics", r"expm"]),
    "PS-S3": ("Track 3: Quantum Simulation", [r"PS-S3", r"Noise Accumulation in Trotter"]),
    "PS-S-OI": ("Track 3: Quantum Simulation", [r"PS-S-OI", r"Custom Simulation", r"Fermi-Hubbard"]),
    "PS-Q1": ("Track 4: Quantum Machine Learning", [r"PS-Q1", r"Variational Quantum Classifier", r"make_classification"]),
    "PS-Q2": ("Track 4: Quantum Machine Learning", [r"PS-Q2", r"Quantum Kernel", r"QSVM", r"make_moons"]),
    "PS-Q3": ("Track 4: Quantum Machine Learning", [r"PS-Q3", r"Noise-Resilient Classification", r"Mitiq", r"ZNE"]),
    "PS-Q-OI": ("Track 4: Quantum Machine Learning", [r"PS-Q-OI", r"Custom QML", r"QGAN"]),
    "PS-P1": ("Track 5: Post-Quantum Cryptography", [r"PS-P1", r"Hybrid Key Exchange", r"ML-KEM-768", r"Kyber"]),
    "PS-P2": ("Track 5: Post-Quantum Cryptography", [r"PS-P2", r"Cryptographic Inventory", r"Migration Scanner"]),
    "PS-P3": ("Track 5: Post-Quantum Cryptography", [r"PS-P3", r"ML-DSA", r"512.*768.*1024"]),
    "PS-P-OI": ("Track 5: Post-Quantum Cryptography", [r"PS-P-OI", r"Custom PQC"]),
}


@dataclass
class RepoEvaluation:
    row_id: int
    team_name: str
    repo_url: str
    clean_repo_url: str = ""
    clone_status: str = "Pending"
    detected_ps_id: str = "Unknown"
    detected_track: str = "Unknown"

    # Rubric Breakdown (Total = 100 pts)
    score_scientific_correctness: float = 0.0      # Max 30 pts
    score_architecture_analysis: float = 0.0       # Max 35 pts
    score_reproducibility_code: float = 0.0        # Max 20 pts
    score_documentation_visuals: float = 0.0       # Max 15 pts
    total_score: float = 0.0                       # Max 100 pts

    # Detailed Audit Signals
    has_main_notebook_or_py: bool = False
    notebook_cells_executed: bool = False
    has_readme: bool = False
    has_requirements: bool = False
    has_processor_a_json: bool = False
    has_processor_b_json: bool = False
    has_results_figures: int = 0
    has_results_tables: int = 0
    custom_topology_a: bool = False
    custom_topology_b: bool = False
    uses_transpiler_seed42: bool = False
    uses_synthetic_noise: bool = False
    has_classical_baseline: bool = False
    code_fingerprint: str = ""
    duplicate_of_team: str = ""
    shortlist_recommendation: str = "Review"
    audit_notes: List[str] = field(default_factory=list)


# ---------------------------------------------------------------------------
# URL Normalization & Cloning
# ---------------------------------------------------------------------------

GITHUB_URL_REGEX = re.compile(
    r"https?://(?:www\.)?github\.com/([A-Za-z0-9_.-]+)/([A-Za-z0-9_.-]+)",
    re.IGNORECASE,
)


def normalize_github_url(raw_text: Any) -> Optional[str]:
    """Extracts and normalizes a canonical https://github.com/<owner>/<repo> URL."""
    if not isinstance(raw_text, str):
        return None
    match = GITHUB_URL_REGEX.search(raw_text.strip())
    if not match:
        return None
    owner, repo = match.group(1), match.group(2)
    if repo.endswith(".git"):
        repo = repo[:-4]
    return f"https://github.com/{owner}/{repo}"


def shallow_clone_repo(clean_url: str, target_dir: Path, timeout_sec: int = 60) -> Tuple[bool, str]:
    """
    Clones only the latest commit (`--depth 1`) and skips large binary blobs (>1MB)
    so 129 repos clone rapidly with zero GitHub REST API rate-limit usage.
    """
    env = os.environ.copy()
    env["GIT_TERMINAL_PROMPT"] = "0"
    cmd = [
        "git", "clone",
        "--depth", "1",
        "--filter=blob:limit=1m",
        "--single-branch",
        clean_url + ".git",
        str(target_dir),
    ]
    try:
        proc = subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=timeout_sec,
            env=env,
        )
        if proc.returncode == 0:
            return True, "OK"
        err = (proc.stderr or proc.stdout or "").strip().splitlines()
        short_err = err[-1] if err else "Unknown git clone error"
        return False, f"Clone failed: {short_err[:120]}"
    except subprocess.TimeoutExpired:
        return False, "Clone timed out (>60s)"
    except Exception as exc:
        return False, f"Clone error: {exc}"


# ---------------------------------------------------------------------------
# Helper Parsers for Notebooks, Code, and Coupling Maps
# ---------------------------------------------------------------------------

def extract_notebook_code_and_outputs(ipynb_path: Path) -> Tuple[str, str, int, int]:
    """
    Returns (code_text, markdown_text, code_cell_count, executed_cell_count)
    from a Jupyter notebook.
    """
    try:
        data = json.loads(ipynb_path.read_text(encoding="utf-8", errors="ignore"))
    except Exception:
        return "", "", 0, 0

    code_chunks: List[str] = []
    md_chunks: List[str] = []
    code_cells = 0
    executed_cells = 0

    for cell in data.get("cells", []):
        ctype = cell.get("cell_type", "")
        source = cell.get("source", [])
        text = "".join(source) if isinstance(source, list) else str(source)
        if ctype == "code":
            if text.strip():
                code_cells += 1
                code_chunks.append(text)
                if cell.get("execution_count") is not None or cell.get("outputs"):
                    executed_cells += 1
        elif ctype == "markdown":
            md_chunks.append(text)

    return "\n".join(code_chunks), "\n".join(md_chunks), code_cells, executed_cells


def extract_edges_from_json(json_path: Path) -> Tuple[Optional[int], Set[Tuple[int, int]]]:
    """Extracts (num_qubits, normalized_undirected_edges) from a processor JSON file."""
    try:
        data = json.loads(json_path.read_text(encoding="utf-8", errors="ignore"))
    except Exception:
        return None, set()

    num_qubits = data.get("num_qubits") or data.get("qubits") or data.get("n_qubits")
    raw_edges = (
        data.get("coupling_map")
        or data.get("coupling_edges")
        or data.get("edges")
        or data.get("connections")
        or []
    )
    edges: Set[Tuple[int, int]] = set()
    if isinstance(raw_edges, list):
        for item in raw_edges:
            if isinstance(item, (list, tuple)) and len(item) == 2:
                try:
                    u, v = int(item[0]), int(item[1])
                    edges.add((min(u, v), max(u, v)))
                except (ValueError, TypeError):
                    pass
    return (int(num_qubits) if isinstance(num_qubits, (int, float)) else None), edges


def normalize_edge_set(edges: Set[Tuple[int, int]]) -> Set[Tuple[int, int]]:
    return {(min(u, v), max(u, v)) for u, v in edges}


def detect_problem_statement(combined_text: str) -> Tuple[str, str]:
    """Detects the Problem Statement ID (e.g., PS-Q1) and Track name."""
    # First check explicit PS ID mention
    for ps_id, (track_name, _) in PROBLEM_STATEMENT_PATTERNS.items():
        if re.search(rf"\b{re.escape(ps_id)}\b", combined_text, re.IGNORECASE):
            return ps_id, track_name

    # Fallback: score keyword matches
    best_ps = "Unknown"
    best_track = "Unknown"
    best_hits = 0
    for ps_id, (track_name, patterns) in PROBLEM_STATEMENT_PATTERNS.items():
        hits = sum(1 for pat in patterns if re.search(pat, combined_text, re.IGNORECASE))
        if hits > best_hits:
            best_hits = hits
            best_ps = ps_id
            best_track = track_name

    return best_ps, best_track


# ---------------------------------------------------------------------------
# Core Rubric Scoring Engine (100 Points Total)
# ---------------------------------------------------------------------------

def evaluate_cloned_repository(repo_dir: Path, eval_obj: RepoEvaluation) -> RepoEvaluation:
    all_files = [
        p for p in repo_dir.rglob("*")
        if p.is_file() and ".git" not in p.parts and "node_modules" not in p.parts and ".venv" not in p.parts
    ]
    rel_paths = {str(p.relative_to(repo_dir)).replace("\\", "/"): p for p in all_files}
    lower_map = {k.lower(): (k, v) for k, v in rel_paths.items()}

    # -----------------------------------------------------------------------
    # 1. Reproducibility & Code Quality (Max 20 pts)
    # -----------------------------------------------------------------------
    repro_score = 0.0

    # Check main.ipynb or main.py (up to 6 pts)
    ipynb_files = [p for k, p in rel_paths.items() if k.endswith(".ipynb")]
    py_files = [p for k, p in rel_paths.items() if k.endswith(".py")]
    has_root_main = any(
        k.lower() in ("main.ipynb", "main.py") or k.lower().endswith("/main.ipynb") or k.lower().endswith("/main.py")
        for k in rel_paths
    )
    if has_root_main:
        eval_obj.has_main_notebook_or_py = True
        repro_score += 6.0
    elif ipynb_files or py_files:
        eval_obj.has_main_notebook_or_py = True
        repro_score += 4.0
        eval_obj.audit_notes.append("Has Python/notebook files, but not named main.ipynb/main.py.")
    else:
        eval_obj.audit_notes.append("CRITICAL: No .ipynb or .py code files found.")

    # Check README.md (up to 3 pts in Repro + up to 9 pts in Docs)
    readme_text = ""
    for k_low, (_, p) in lower_map.items():
        if k_low.endswith("readme.md"):
            eval_obj.has_readme = True
            readme_text = p.read_text(encoding="utf-8", errors="ignore")
            break
    if eval_obj.has_readme and len(readme_text.strip()) > 200:
        repro_score += 3.0
    else:
        eval_obj.audit_notes.append("Missing or very short README.md.")

    # Check requirements.txt (up to 4 pts)
    req_text = ""
    for k_low, (_, p) in lower_map.items():
        if k_low.endswith("requirements.txt") or k_low.endswith("pyproject.toml") or k_low.endswith("environment.yml"):
            eval_obj.has_requirements = True
            req_text = p.read_text(encoding="utf-8", errors="ignore")
            break
    if eval_obj.has_requirements:
        repro_score += 2.5
        if re.search(r"(==|>=|~=|qiskit|cryptography)", req_text, re.IGNORECASE):
            repro_score += 1.5
        else:
            eval_obj.audit_notes.append("requirements.txt present but versions are not pinned.")
    else:
        eval_obj.audit_notes.append("Missing requirements.txt.")

    # Check processors/processor_A.json & processor_B.json (up to 4 pts)
    proc_a_path: Optional[Path] = None
    proc_b_path: Optional[Path] = None
    for k_low, (_, p) in lower_map.items():
        if "processor_a" in k_low and k_low.endswith(".json"):
            proc_a_path = p
            eval_obj.has_processor_a_json = True
        elif "processor_b" in k_low and k_low.endswith(".json"):
            proc_b_path = p
            eval_obj.has_processor_b_json = True

    if eval_obj.has_processor_a_json and eval_obj.has_processor_b_json:
        repro_score += 4.0
    elif eval_obj.has_processor_a_json or eval_obj.has_processor_b_json:
        repro_score += 2.0
        eval_obj.audit_notes.append("Only one processor JSON found.")
    else:
        eval_obj.audit_notes.append("Missing processors/processor_A.json and processor_B.json.")

    # Check results/ artifacts (up to 3 pts in Repro)
    fig_files = [
        k for k in rel_paths
        if k.lower().endswith((".png", ".jpg", ".jpeg", ".svg", ".pdf"))
        and ("result" in k.lower() or "fig" in k.lower() or "plot" in k.lower() or "output" in k.lower())
    ]
    if not fig_files:
        fig_files = [k for k in rel_paths if k.lower().endswith((".png", ".jpg", ".svg"))]

    table_files = [
        k for k in rel_paths
        if k.lower().endswith((".csv", ".tsv", ".xlsx"))
        or ("result" in k.lower() and k.lower().endswith(".json"))
    ]
    eval_obj.has_results_figures = len(fig_files)
    eval_obj.has_results_tables = len(table_files)

    if eval_obj.has_results_figures > 0 and eval_obj.has_results_tables > 0:
        repro_score += 3.0
    elif eval_obj.has_results_figures > 0 or eval_obj.has_results_tables > 0:
        repro_score += 1.5
        eval_obj.audit_notes.append("Partial results/ exports (missing either CSV tables or PNG figures).")
    else:
        eval_obj.audit_notes.append("No exported figures (.png) or tables (.csv) found.")

    eval_obj.score_reproducibility_code = round(min(20.0, repro_score), 1)

    # -----------------------------------------------------------------------
    # Collect All Source Code & Notebook Content
    # -----------------------------------------------------------------------
    all_code_parts: List[str] = []
    all_md_parts: List[str] = [readme_text]
    total_nb_code_cells = 0
    total_nb_exec_cells = 0

    for nb in ipynb_files:
        c_txt, m_txt, c_cnt, e_cnt = extract_notebook_code_and_outputs(nb)
        all_code_parts.append(c_txt)
        all_md_parts.append(m_txt)
        total_nb_code_cells += c_cnt
        total_nb_exec_cells += e_cnt

    for pyf in py_files:
        try:
            all_code_parts.append(pyf.read_text(encoding="utf-8", errors="ignore"))
        except Exception:
            pass

    for k_low, (_, p) in lower_map.items():
        if k_low.endswith(".md") and not k_low.endswith("readme.md"):
            try:
                all_md_parts.append(p.read_text(encoding="utf-8", errors="ignore"))
            except Exception:
                pass

    full_code = "\n".join(all_code_parts)
    full_docs = "\n".join(all_md_parts)
    combined_corpus = full_code + "\n" + full_docs

    if total_nb_code_cells > 0 and total_nb_exec_cells > 0:
        eval_obj.notebook_cells_executed = True
    elif not ipynb_files and eval_obj.has_results_figures > 0:
        eval_obj.notebook_cells_executed = True

    # Compute normalized code fingerprint (ignoring whitespace/comments) for plagiarism detection
    stripped_code = re.sub(r"\s+", "", full_code)
    if len(stripped_code) > 100:
        eval_obj.code_fingerprint = hashlib.sha256(stripped_code.encode("utf-8", errors="ignore")).hexdigest()[:16]

    # Detect Problem Statement & Track
    ps_id, track_name = detect_problem_statement(combined_corpus)
    eval_obj.detected_ps_id = ps_id
    eval_obj.detected_track = track_name
    is_pqc_track = ps_id.startswith("PS-P")

    # -----------------------------------------------------------------------
    # 2. Processor A vs. B Architectural Analysis & Creativity (Max 35 pts)
    # -----------------------------------------------------------------------
    arch_score = 0.0

    # A) Coupling Map Validation & Creativity (up to 12 pts)
    nq_a, edges_a = extract_edges_from_json(proc_a_path) if proc_a_path else (None, set())
    nq_b, edges_b = extract_edges_from_json(proc_b_path) if proc_b_path else (None, set())

    if edges_a:
        arch_score += 3.0
        if edges_a not in (
            normalize_edge_set(PDF_DEFAULT_A_LINEAR),
            normalize_edge_set(PDF_DEFAULT_A_STAR),
            normalize_edge_set(PDF_DEFAULT_A_RING),
        ):
            eval_obj.custom_topology_a = True
            arch_score += 2.5
        else:
            arch_score += 1.0
            eval_obj.audit_notes.append("Processor A uses a standard PDF example topology rather than a custom graph.")
    elif re.search(r"CouplingMap", full_code):
        arch_score += 2.5

    if edges_b:
        arch_score += 3.5
        if edges_b != normalize_edge_set(PDF_DEFAULT_B_HEAVY_HEX):
            eval_obj.custom_topology_b = True
            arch_score += 3.0
        else:
            arch_score += 1.0
            eval_obj.audit_notes.append("Processor B uses the exact 12-edge heavy-hex example from Page 2 of the PDF.")
    elif re.search(r"CouplingMap", full_code):
        arch_score += 2.5

    # B) Transpilation Baseline Compliance (up to 8 pts)
    has_transpile = bool(re.search(r"\btranspile\s*\(|generate_preset_pass_manager", full_code))
    has_basis = bool(re.search(r"['\"]rz['\"].*['\"]sx['\"].*['\"]cx['\"]", combined_corpus, re.DOTALL))
    has_seed42 = bool(re.search(r"seed_transpiler\s*=\s*42|seed\s*['\"]?\s*[:=]\s*42", combined_corpus))
    has_shots4096 = bool(re.search(r"4096", combined_corpus))

    if has_transpile:
        arch_score += 3.0
    if has_basis:
        arch_score += 2.0
    if has_seed42 and has_shots4096:
        eval_obj.uses_transpiler_seed42 = True
        arch_score += 3.0
    elif has_seed42 or has_shots4096:
        arch_score += 1.5

    # C) Synthetic Noise Model Implementation (up to 8 pts)
    has_noise_model = bool(re.search(r"NoiseModel|depolarizing_error|ReadoutError", full_code))
    has_noise_rates = bool(re.search(r"0\.001", combined_corpus) and re.search(r"0\.005", combined_corpus))
    if has_noise_model and has_noise_rates:
        eval_obj.uses_synthetic_noise = True
        arch_score += 8.0
    elif has_noise_model:
        eval_obj.uses_synthetic_noise = True
        arch_score += 5.0
    elif is_pqc_track and re.search(r"psutil|cpu_affinity|Platform\s*A|Platform\s*B", combined_corpus, re.IGNORECASE):
        # Credit Track 5 PQC teams that benchmarked constrained vs unconstrained CPU platforms
        arch_score += 6.0
        eval_obj.audit_notes.append("Track 5 PQC: Benchmarked Platform A vs Platform B CPU environments.")
    else:
        eval_obj.audit_notes.append("Missing Qiskit Aer synthetic noise model (0.1% 1q, 0.5% CX, 1% readout).")

    # D) Quantitative A vs B Comparison Metrics (up to 7 pts)
    metric_hits = sum(
        1 for kw in [r"depth", r"\bcx\b|two_qubit|2-qubit", r"swap", r"fidelity|accuracy|energy|cut|latency"]
        if re.search(kw, combined_corpus, re.IGNORECASE)
    )
    arch_score += min(7.0, metric_hits * 1.75)

    eval_obj.score_architecture_analysis = round(min(35.0, arch_score), 1)

    # -----------------------------------------------------------------------
    # 3. Scientific & Algorithmic Correctness (Max 30 pts)
    # -----------------------------------------------------------------------
    sci_score = 0.0

    # Check real Qiskit / PQC implementation (up to 12 pts)
    if re.search(r"from\s+qiskit|import\s+qiskit", full_code):
        sci_score += 8.0
        if re.search(r"AerSimulator|StatevectorEstimator|StatevectorSampler|VQE|QAOA|VQC|FidelityQuantumKernel", full_code):
            sci_score += 4.0
    elif is_pqc_track and re.search(r"cryptography|oqs|kyber|ml_kem|mlkem|ast\.", full_code, re.IGNORECASE):
        sci_score += 12.0
    else:
        eval_obj.audit_notes.append("WARNING: Minimal or missing Qiskit / cryptographic algorithm code.")

    # Check Classical / Exact Reference Verification (up to 10 pts)
    classical_markers = [
        r"NumPyMinimumEigensolver", r"linalg\.eigh", r"linalg\.expm", r"eigvalsh",
        r"SVC\s*\(", r"RandomForest", r"LogisticRegression", r"brute_force",
        r"exact", r"classical", r"ECDH", r"SECP256R1", r"-1\.137"
    ]
    c_hits = sum(1 for m in classical_markers if re.search(m, full_code, re.IGNORECASE))
    if c_hits >= 2:
        eval_obj.has_classical_baseline = True
        sci_score += 10.0
    elif c_hits == 1:
        eval_obj.has_classical_baseline = True
        sci_score += 6.0
    else:
        eval_obj.audit_notes.append("No clear classical/exact verification baseline found in code.")

    # Check execution & non-trivial results (up to 8 pts)
    if eval_obj.notebook_cells_executed:
        sci_score += 5.0
    elif ipynb_files:
        eval_obj.audit_notes.append("Notebook cells appear unexecuted (no saved cell outputs).")

    if eval_obj.has_results_tables > 0 or eval_obj.has_results_figures > 0:
        sci_score += 3.0

    eval_obj.score_scientific_correctness = round(min(30.0, sci_score), 1)

    # -----------------------------------------------------------------------
    # 4. Documentation & Visualizations (Max 15 pts)
    # -----------------------------------------------------------------------
    doc_score = 0.0
    if eval_obj.has_readme:
        if len(readme_text) > 1200:
            doc_score += 5.0
        elif len(readme_text) > 400:
            doc_score += 3.0
        else:
            doc_score += 1.0

        # Check for Markdown comparison table in README
        if "|" in readme_text and "---" in readme_text:
            doc_score += 3.0
        else:
            eval_obj.audit_notes.append("README lacks a Markdown comparison table.")

        # Check for Problem Statement & architectural explanation
        if eval_obj.detected_ps_id != "Unknown":
            doc_score += 2.0

    # Visualizations (up to 5 pts)
    if eval_obj.has_results_figures >= 2:
        doc_score += 5.0
    elif eval_obj.has_results_figures == 1:
        doc_score += 3.0

    eval_obj.score_documentation_visuals = round(min(15.0, doc_score), 1)

    # -----------------------------------------------------------------------
    # Final Score & Shortlist Tier
    # -----------------------------------------------------------------------
    eval_obj.total_score = round(
        eval_obj.score_scientific_correctness
        + eval_obj.score_architecture_analysis
        + eval_obj.score_reproducibility_code
        + eval_obj.score_documentation_visuals,
        1,
    )

    if eval_obj.total_score >= 82.0:
        eval_obj.shortlist_recommendation = "Strong Qualifier (Phase 2 Finalist)"
    elif eval_obj.total_score >= 65.0:
        eval_obj.shortlist_recommendation = "Borderline / Waitlist"
    else:
        eval_obj.shortlist_recommendation = "Do Not Advance"

    return eval_obj


# ---------------------------------------------------------------------------
# Batch Processing Pipeline
# ---------------------------------------------------------------------------

def evaluate_single_submission(
    row_id: int,
    team_name: str,
    raw_url: str,
    work_root: Path,
) -> RepoEvaluation:
    ev = RepoEvaluation(row_id=row_id, team_name=team_name, repo_url=str(raw_url))
    clean_url = normalize_github_url(raw_url)
    if not clean_url:
        ev.clone_status = "Invalid GitHub URL"
        ev.shortlist_recommendation = "Invalid URL"
        ev.audit_notes.append(f"Could not parse valid GitHub repository URL from: {raw_url}")
        return ev

    ev.clean_repo_url = clean_url
    target_dir = work_root / f"repo_{row_id:03d}"
    ok, status_msg = shallow_clone_repo(clean_url, target_dir)
    ev.clone_status = status_msg
    if not ok:
        ev.shortlist_recommendation = "Inaccessible / Private Repo"
        ev.audit_notes.append(status_msg)
        return ev

    try:
        ev = evaluate_cloned_repository(target_dir, ev)
    except Exception as exc:
        ev.audit_notes.append(f"Evaluation exception: {exc}")
    finally:
        # Remove cloned folder immediately after evaluation to keep disk usage tiny
        shutil.rmtree(target_dir, ignore_errors=True)

    return ev


def detect_columns(df: pd.DataFrame) -> Tuple[str, Optional[str]]:
    """Auto-detects the GitHub URL column and optional Team Name column in an Excel/CSV dataframe."""
    url_col = None
    team_col = None

    for col in df.columns:
        col_low = str(col).lower()
        if any(k in col_low for k in ("github", "repo", "url", "link", "submission")):
            sample_vals = df[col].dropna().astype(str).tolist()[:15]
            if any("github.com" in v.lower() for v in sample_vals):
                url_col = col
                break

    if url_col is None:
        for col in df.columns:
            sample_vals = df[col].dropna().astype(str).tolist()[:20]
            if any("github.com" in v.lower() for v in sample_vals):
                url_col = col
                break

    for col in df.columns:
        col_low = str(col).lower()
        if col != url_col and any(k in col_low for k in ("team", "name", "leader", "group", "participant")):
            team_col = col
            break

    if url_col is None:
        raise ValueError(f"Could not find a column containing github.com URLs. Columns found: {list(df.columns)}")

    return url_col, team_col


def run_batch_evaluation(input_path: Path, output_path: Path, max_workers: int = 8) -> None:
    if input_path.suffix.lower() in (".xlsx", ".xls"):
        df = pd.read_excel(input_path)
    else:
        df = pd.read_csv(input_path)

    url_col, team_col = detect_columns(df)
    print(f"[*] Loaded {len(df)} rows from '{input_path.name}'")
    print(f"[*] Detected GitHub URL column: '{url_col}' | Team column: '{team_col or 'Row Index'}'")

    tasks = []
    for idx, row in df.iterrows():
        raw_url = row[url_col]
        team_name = str(row[team_col]).strip() if team_col and pd.notna(row[team_col]) else f"Team_{idx + 1}"
        tasks.append((idx + 1, team_name, raw_url))

    results: List[RepoEvaluation] = []
    with tempfile.TemporaryDirectory(prefix="qff2026_eval_") as tmp_root:
        work_root = Path(tmp_root)
        with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as pool:
            future_map = {
                pool.submit(evaluate_single_submission, r_id, t_name, r_url, work_root): (r_id, t_name)
                for r_id, t_name, r_url in tasks
            }
            completed = 0
            for fut in concurrent.futures.as_completed(future_map):
                completed += 1
                ev = fut.result()
                results.append(ev)
                print(
                    f"[{completed:03d}/{len(tasks):03d}] {ev.team_name[:25]:<25} | "
                    f"{ev.detected_ps_id:<7} | Score: {ev.total_score:5.1f}/100 | {ev.clone_status}"
                )

    # Check for duplicate repositories / plagiarized code fingerprints
    seen_urls: Dict[str, str] = {}
    seen_hashes: Dict[str, str] = {}
    results.sort(key=lambda x: x.row_id)

    for ev in results:
        if ev.clean_repo_url:
            if ev.clean_repo_url.lower() in seen_urls:
                orig = seen_urls[ev.clean_repo_url.lower()]
                ev.duplicate_of_team = f"Same URL as {orig}"
                ev.audit_notes.append(f"DUPLICATE REPO URL: Also submitted by {orig}.")
            else:
                seen_urls[ev.clean_repo_url.lower()] = ev.team_name

        if ev.code_fingerprint:
            if ev.code_fingerprint in seen_hashes:
                orig = seen_hashes[ev.code_fingerprint]
                if orig != ev.team_name:
                    ev.duplicate_of_team = f"Identical code to {orig}"
                    ev.audit_notes.append(f"PLAGIARISM WARNING: Identical source code hash as {orig}.")
            else:
                seen_hashes[ev.code_fingerprint] = ev.team_name

    # Build Output DataFrames
    rows_out = []
    for ev in results:
        d = asdict(ev)
        d["audit_notes"] = " | ".join(ev.audit_notes) if ev.audit_notes else "Clean submission — all checks passed."
        rows_out.append(d)

    out_df = pd.DataFrame(rows_out)
    ranked_df = out_df.sort_values(by=["total_score", "score_architecture_analysis"], ascending=[False, False]).reset_index(drop=True)
    ranked_df.insert(0, "rank", ranked_df.index + 1)

    track_summary_df = (
        ranked_df.groupby(["detected_track", "detected_ps_id"], as_index=False)
        .agg(
            submissions=("row_id", "count"),
            avg_score=("total_score", "mean"),
            max_score=("total_score", "max"),
            qualifiers=("shortlist_recommendation", lambda s: (s == "Strong Qualifier (Phase 2 Finalist)").sum()),
        )
        .sort_values(by=["detected_track", "submissions"], ascending=[True, False])
    )

    with pd.ExcelWriter(output_path, engine="openpyxl") as writer:
        ranked_df.to_excel(writer, sheet_name="Leaderboard_Ranked", index=False)
        track_summary_df.to_excel(writer, sheet_name="Track_Summary", index=False)
        out_df.to_excel(writer, sheet_name="Original_Order_Audit", index=False)

    print(f"\n[+] Evaluation complete! Saved ranked leaderboard to: {output_path}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Evaluate Qiskit Fall Fest 2026 Phase 1 Repositories")
    parser.add_argument("--input", "-i", required=True, help="Path to input Excel (.xlsx) or CSV file with GitHub links")
    parser.add_argument("--output", "-o", default="Phase1_Evaluated_Leaderboard.xlsx", help="Output Excel workbook path")
    parser.add_argument("--workers", "-w", type=int, default=8, help="Number of parallel git clone workers (default: 8)")
    args = parser.parse_args()

    run_batch_evaluation(Path(args.input), Path(args.output), max_workers=args.workers)


if __name__ == "__main__":
    main()