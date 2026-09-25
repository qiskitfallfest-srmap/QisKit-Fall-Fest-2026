# Workflow: Updating and Synchronizing LLMs Manifests (`llms.txt`, `llms-full.txt`, and `public/docs/*.md`)

## Objective
Ensure that whenever festival dates, schedules, masterclass curricula, hackathon problem statements, rubrics, or venue assignments are modified, all downstream AI agent manifests (`public/llms.txt`, `public/llms-full.txt`, `public/docs/*.md`, and root `llms.txt`) are deterministically recompiled and validated without stale data or drift.

---

## The WAT Architecture Mapping

* **Layer 1: Workflow (This Document):** Standard operating procedure for agents when modifying festival content.
* **Layer 2: Agent (Decision-Maker):** Identifies changed content in planning or web documents, coordinates tool calls, and verifies compilation.
* **Layer 3: Tools (Deterministic Execution):**
  * `tools/generate_llms_manifests.py`: Compiles authoritative manifests and standalone markdown dossiers.
  * `tools/verify_llms_manifests.py`: Validates schema conformance (`llmstxt.org` v2), link formatting, and zero-emoji compliance.

---

## Step-by-Step Execution Protocol

Whenever an AI agent or human contributor updates any of the following files:
- `01 _ Technical Programs  Cell/Sessions/QFF_2026_Masterclass_Master_Course_Document_*.md`
- `02 _ Hackathon & Competitions Cell/Hackathon/QFF PS Executive Summary.md`
- `02 _ Hackathon & Competitions Cell/Hackathon/Events_and_Competitions_Guide_QFF_2026.md`
- `01 _ Technical Programs  Cell/Planning/QFF_Online+Offline_Event_Structure.md`
- `QisKit-Fall-Fest-2026/data/onlineSchedule.ts` or `offlineSchedule.ts`
- `QisKit-Fall-Fest-2026/data/faqs.ts`

### Step 1: Update the Source of Truth
Edit the primary document in its respective directory. Ensure any `.docx`/`.xlsx` changes have matching side-by-side `.md` files generated using `python tools/convert_documents.py`.

### Step 2: Regenerate All Manifests
Run the deterministic generator script from the repository root:
```powershell
python tools/generate_llms_manifests.py
```
This updates:
1. `QisKit-Fall-Fest-2026/public/llms.txt` (Standard v2 index)
2. `QisKit-Fall-Fest-2026/public/llms-full.txt` (Comprehensive full dossier)
3. `QisKit-Fall-Fest-2026/public/docs/masterclass-curriculum.md`
4. `QisKit-Fall-Fest-2026/public/docs/hackathon-challenge-framework.md`
5. `QisKit-Fall-Fest-2026/public/docs/event-portfolio-59.md`
6. `QisKit-Fall-Fest-2026/public/docs/faq.md`
7. `01 _ TECHNICAL & INNOVATION TRACK QFF/llms.txt` (Planning root manifest)

### Step 3: Run Deterministic Verification
Execute the verification linter:
```powershell
python tools/verify_llms_manifests.py
```
The script will assert:
- `llmstxt.org` v2 format conformance (H1, blockquote, valid H2 sections, valid markdown links).
- Presence of all required text sections in `llms-full.txt`.
- Zero raw Unicode emojis in any generated manifest file.
- Non-zero file lengths.

If any check fails, fix the underlying text generator in `tools/generate_llms_manifests.py` and re-run.

### Step 4: Record in Activity Log
Log the content update and manifest regeneration in Section 7 of `PROJECT_LEARNINGS.md`.

---

## Multi-Agent Governance Rule (GT-11)
No task or pull request involving changes to event schedules, rubrics, syllabi, or rules is considered complete until both `generate_llms_manifests.py` and `verify_llms_manifests.py` have executed cleanly with zero exit code.
