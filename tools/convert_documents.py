#!/usr/bin/env python3
"""
tools/convert_documents.py

Batch converter for proprietary documents (.docx, .xlsx, .pptx, .pdf) to lightweight Markdown (.md)
using Microsoft's MarkItDown library.

Features:
- Injects provenance metadata header into each generated Markdown file.
- Generates .md files side-by-side with original source documents.
- Strict UTF-8 file reading and writing with Windows terminal compatibility.
- Skips temporary and virtual environment directories.
- Incremental update support (only converts if source is newer than target, or forced with --force).
"""

import argparse
import datetime
import os
import sys
from pathlib import Path

# Ensure UTF-8 output on Windows console
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

SUPPORTED_EXTENSIONS = {'.docx', '.xlsx', '.pptx', '.pdf'}
EXCLUDE_DIRS = {'.git', '.tmp', 'scratch', '__pycache__', '.venv', 'venv', 'node_modules', '.next'}

def build_metadata_header(source_path: Path, workspace_root: Path) -> str:
    rel_path = source_path.relative_to(workspace_root)
    file_stat = source_path.stat()
    file_size_bytes = file_stat.st_size
    mtime = datetime.datetime.fromtimestamp(file_stat.st_mtime).strftime('%Y-%m-%d %H:%M:%S')
    now = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    header = f"""<!--
SOURCE DOCUMENT METADATA
- Source Path: {rel_path}
- Source Size: {file_size_bytes:,} bytes
- Source Last Modified: {mtime}
- Markdown Converted At: {now}
- Converted By: Microsoft MarkItDown (tools/convert_documents.py)
- AI AGENT NOTICE: This is the standardized Markdown representation of the proprietary source file.
  AI agents MUST prioritize reading this file over binary format (.docx/.xlsx/.pdf) for token efficiency.
-->

"""
    return header

def convert_single_file(source_path: Path, workspace_root: Path, md_converter, force: bool = False) -> bool:
    target_path = source_path.with_suffix('.md')

    # Check if up-to-date
    if not force and target_path.exists():
        if target_path.stat().st_mtime >= source_path.stat().st_mtime:
            print(f"[SKIP] Up-to-date: {target_path.relative_to(workspace_root)}")
            return False

    print(f"[CONVERTING] {source_path.relative_to(workspace_root)} -> {target_path.name}...")
    try:
        result = md_converter.convert(str(source_path))
        content = result.text_content

        header = build_metadata_header(source_path, workspace_root)
        full_content = header + content

        with open(target_path, 'w', encoding='utf-8') as f:
            f.write(full_content)

        print(f"[SUCCESS] Wrote {len(full_content):,} chars to {target_path.relative_to(workspace_root)}")
        return True
    except Exception as e:
        print(f"[ERROR] Failed to convert {source_path.name}: {e}", file=sys.stderr)
        return False

def main():
    parser = argparse.ArgumentParser(description="Convert proprietary documents to Markdown side-by-side.")
    parser.add_argument("--root", type=str, default=".", help="Root directory to search (defaults to current dir)")
    parser.add_argument("--force", action="store_true", help="Force re-conversion of all documents even if up-to-date")
    args = parser.parse_args()

    workspace_root = Path(args.root).resolve()
    print(f"Scanning workspace: {workspace_root}")

    try:
        from markitdown import MarkItDown
        md_converter = MarkItDown()
    except ImportError:
        print("Error: 'markitdown' is not installed. Please install it with 'pip install \"markitdown[all]\"'", file=sys.stderr)
        sys.exit(1)

    candidate_files = []
    for root, dirs, files in os.walk(workspace_root):
        # Exclude directories in-place
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS and not d.startswith('.')]
        for f in files:
            p = Path(root) / f
            if p.suffix.lower() in SUPPORTED_EXTENSIONS and not p.name.startswith('~$'):
                candidate_files.append(p)

    candidate_files.sort()
    print(f"Found {len(candidate_files)} proprietary document(s) matching {SUPPORTED_EXTENSIONS}.\n")

    converted_count = 0
    skipped_count = 0
    error_count = 0

    for file_path in candidate_files:
        success = convert_single_file(file_path, workspace_root, md_converter, force=args.force)
        if success:
            converted_count += 1
        elif (file_path.with_suffix('.md')).exists():
            skipped_count += 1
        else:
            error_count += 1

    print("\nSummary:")
    print(f"  Converted: {converted_count}")
    print(f"  Skipped (up-to-date): {skipped_count}")
    print(f"  Failed: {error_count}")

if __name__ == '__main__':
    main()
