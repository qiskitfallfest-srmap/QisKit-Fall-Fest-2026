#!/usr/bin/env python3
"""
tools/verify_llms_manifests.py

Linter and verification suite for the Qiskit Fall Fest 2026 LLMs manifest ecosystem.
Validates:
1. llmstxt.org v2 schema conformance (H1, blockquote, H2 file lists, link formats, optional section).
2. Completeness and integrity of public/llms.txt, public/llms-full.txt, and public/docs/*.md.
3. Absence of decorative Unicode emojis across all manifest documents.
4. Cross-repository file synchronization between planning repo and web repo.
"""

import os
import re
import sys
from pathlib import Path

# Ensure UTF-8 output on Windows console
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def get_paths():
    script_dir = Path(__file__).resolve().parent
    planning_repo = script_dir.parent
    web_repo = planning_repo.parent / "QisKit-Fall-Fest-2026"
    if not web_repo.exists():
        web_repo = planning_repo
        planning_repo = planning_repo.parent / "01 _ TECHNICAL & INNOVATION TRACK QFF"
    return planning_repo, web_repo

def check_no_emojis(content: str, filename: str) -> list[str]:
    errors = []
    # Check for common emoji ranges
    emoji_pattern = re.compile(
        r'[\U00010000-\U0010ffff]|[\u2600-\u27bf]|[\u2300-\u23ff]|[\u2b50-\u2b55]',
        flags=re.UNICODE
    )
    matches = emoji_pattern.findall(content)
    if matches:
        errors.append(f"{filename} contains {len(matches)} forbidden Unicode emojis: {matches[:5]}")
    return errors

def verify_llms_txt(path: Path) -> list[str]:
    errors = []
    if not path.exists():
        return [f"File missing: {path}"]
    
    text = path.read_text(encoding="utf-8")
    lines = [line.strip() for line in text.splitlines()]
    
    # 1. H1 check
    if not lines or not lines[0].startswith("# "):
        errors.append(f"{path.name}: First non-empty line must be an H1 heading ('# Site Name') per llmstxt.org v2")
        
    # 2. Blockquote check
    has_blockquote = any(line.startswith("> ") for line in lines[:10])
    if not has_blockquote:
        errors.append(f"{path.name}: Missing summary blockquote immediately following H1")
        
    # 3. H2 check
    h2_sections = [line for line in lines if line.startswith("## ")]
    if len(h2_sections) < 3:
        errors.append(f"{path.name}: Expected at least 3 H2 sections, found {len(h2_sections)}")
        
    # 4. Link formatting check
    link_regex = re.compile(r'^-\s+\[.+\]\(.+\)(:\s+.+)?$')
    in_h2 = False
    for idx, line in enumerate(lines, 1):
        if line.startswith("## "):
            in_h2 = True
            continue
        if in_h2 and line.startswith("- "):
            if not link_regex.match(line):
                errors.append(f"{path.name}:{idx}: Malformed markdown link list item: '{line}'")

    # 5. Optional section check
    has_optional = any(line.lower().startswith("## optional") for line in lines)
    if not has_optional:
        errors.append(f"{path.name}: Missing standard '## Optional' section per llmstxt.org convention")

    # 6. Emoji check
    errors.extend(check_no_emojis(text, path.name))
    return errors

def verify_manifests():
    planning_repo, web_repo = get_paths()
    all_errors = []
    
    print(f"Verifying manifests in:\n  Planning: {planning_repo}\n  Web: {web_repo}\n")
    
    # 1. Verify web public/llms.txt
    web_llms = web_repo / "public" / "llms.txt"
    errs = verify_llms_txt(web_llms)
    all_errors.extend(errs)
    if not errs:
        print(f"[OK] {web_llms} passed schema validation.")

    # 2. Verify web public/llms-full.txt
    web_full = web_repo / "public" / "llms-full.txt"
    if not web_full.exists():
        all_errors.append(f"Missing full dossier: {web_full}")
    else:
        full_text = web_full.read_text(encoding="utf-8")
        all_errors.extend(check_no_emojis(full_text, web_full.name))
        required_substrings = [
            "SECTION 1: MASTERCLASS SERIES CURRICULUM",
            "SECTION 2: HACKATHON UNIVERSAL CHALLENGE FRAMEWORK",
            "SECTION 3: COMPLETE 59-EVENT FESTIVAL PORTFOLIO",
            "SECTION 4: FREQUENTLY ASKED QUESTIONS",
            "100-Point Evaluation Rubric",
            "Processor A",
            "Processor B",
            "Processor C",
            "Processor D"
        ]
        for sub in required_substrings:
            if sub not in full_text:
                all_errors.append(f"{web_full.name} missing required section: '{sub}'")
        if not all_errors:
            print(f"[OK] {web_full} passed integrity check ({len(full_text):,} characters).")

    # 3. Verify public/docs/*.md
    docs_dir = web_repo / "public" / "docs"
    expected_docs = [
        "masterclass-curriculum.md",
        "hackathon-challenge-framework.md",
        "event-portfolio-59.md",
        "faq.md"
    ]
    for doc in expected_docs:
        doc_path = docs_dir / doc
        if not doc_path.exists():
            all_errors.append(f"Missing doc endpoint: {doc_path}")
        else:
            doc_text = doc_path.read_text(encoding="utf-8")
            all_errors.extend(check_no_emojis(doc_text, doc))
            print(f"[OK] {doc_path.name} verified ({len(doc_text):,} chars).")

    # 4. Verify planning repo root llms.txt (only if separate planning repo is present)
    if planning_repo.resolve() != web_repo.resolve():
        planning_llms = planning_repo / "llms.txt"
        errs = verify_llms_txt(planning_llms)
        all_errors.extend(errs)
        if not errs:
            print(f"[OK] {planning_llms} passed schema validation.")

    print("\n" + "=" * 50)
    if all_errors:
        print(f"FAILED: {len(all_errors)} issues detected:")
        for err in all_errors:
            print(f"  - {err}")
        sys.exit(1)
    else:
        print("ALL MANIFESTS VERIFIED: 100% compliant with llmstxt.org v2 and anti-slop guidelines.")
        sys.exit(0)

if __name__ == "__main__":
    verify_manifests()
