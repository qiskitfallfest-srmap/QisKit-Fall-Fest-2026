#!/usr/bin/env python3
"""
Export Hackathon Phase 1 Shortlisted Finalist Recipients
Qiskit Fall Fest 2026 (SRM University-AP)

Reads the approved 50 Auditorium Finalists spreadsheet:
`QFF_2026_Hackathon_50_Auditorium_Finalists.xlsx`

Extracts all 208 members across all 50 finalist teams (25 Internal + 25 External),
cleans their names and roles, and outputs a formatted CSV ready to paste into
the Google Sheet 'Hackathon_Finalists_Recipients' for Google Apps Script automated dispatch.

Output Columns:
Email, Full Name, Role, Team Name, Category, Desk, Track, Institution, Score, Finalist_Email_Status
"""

import os
import sys
import csv
import re
import openpyxl

PROTECTED_EMAILS = {
    "sazzadali.b@srmap.edu.in",
    "gangireddy.s@srmap.edu.in",
    "varsha.s@srmap.edu.in",
    "qiskitfallfest@srmap.edu.in",
    "qiskitfallfest2026@gmail.com",
}

EXCEL_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "QFF_2026_Hackathon_50_Auditorium_Finalists.xlsx")
DOWNLOADS_CSV = r"c:\Users\sahgy\Downloads\hackathon_finalists_recipients.csv"
TOOLS_CSV = os.path.join(os.path.dirname(__file__), "hackathon_finalists_recipients.csv")

def clean_name(raw: str) -> str:
    if not raw:
        return ""
    n = " ".join(raw.strip().split())
    # Remove leading roll numbers like AP23110010045, AP26110200112, etc.
    m = re.match(r"^([A-Z0-9_-]{8,15}\s+)(.*)$", n)
    if m and len(m.group(2).strip()) > 2:
        n = m.group(2).strip()
    # Remove trailing roll number patterns like "Debjit Saha | AP26110200112"
    n = re.sub(r"\s*\|\s*[A-Za-z0-9_-]+$", "", n).strip()
    # Remove G-XX AI&ML tags if needed, e.g. "Manti Dhana G-42 AI&ML"
    n = re.sub(r"\s+G-\d+\s+AI&ML", "", n, flags=re.IGNORECASE).strip()
    return n.title() if n.islower() or n.isupper() else n

def main():
    if not os.path.exists(EXCEL_FILE):
        sys.exit(f"Excel file not found at: {EXCEL_FILE}")

    print(f"Loading finalists from {EXCEL_FILE}...")
    wb = openpyxl.load_workbook(EXCEL_FILE, data_only=True)
    ws = wb["50 Auditorium Finalists"]

    rows = []
    seen_emails = set()
    team_count = 0

    for r in ws.iter_rows(min_row=2, values_only=True):
        desk = str(r[0] or "").strip()
        team_name = str(r[1] or "").strip()
        category = str(r[2] or "").strip()
        institution = str(r[3] or "").strip()
        score = str(r[5] or "").strip()
        lead_name = str(r[7] or "").strip()
        lead_email = str(r[8] or "").strip().lower()
        track = str(r[10] or "").strip()
        ps_id = str(r[11] or "").strip()
        roster = str(r[13] or "").strip()

        if not team_name or not desk:
            continue

        team_count += 1
        parts = [p.strip() for p in roster.split(";") if p.strip()]

        for p in parts:
            match = re.search(r"^(.*?)\s*<([^>]+)>", p)
            if match:
                raw_n = match.group(1).replace("(Leader)", "").strip()
                em = match.group(2).strip().lower()
                is_lead = "(Leader)" in p or em == lead_email
            else:
                raw_n = p.replace("(Leader)", "").strip()
                em = lead_email if "(Leader)" in p else ""
                is_lead = "(Leader)" in p

            if not em or "@" not in em:
                continue

            if em in PROTECTED_EMAILS or "sazzadali.b" in em or "gangireddy.s" in em:
                continue

            if em in seen_emails:
                print(f"[Warning] Duplicate email detected across roster: {em}")
                continue

            seen_emails.add(em)
            name = clean_name(raw_n) or "Innovator"
            role = "Team Leader" if is_lead else "Team Member"

            rows.append({
                "Email": em,
                "Full Name": name,
                "Role": role,
                "Team Name": team_name,
                "Category": category,
                "Desk": desk,
                "Track": track,
                "Institution": institution,
                "Score": score,
                "Finalist_Email_Status": ""
            })

    print(f"Processed {team_count} finalist teams.")
    print(f"Extracted {len(rows)} total participants ({sum(1 for r in rows if r['Role'] == 'Team Leader')} Leaders, {sum(1 for r in rows if r['Role'] == 'Team Member')} Teammates).")

    fieldnames = [
        "Email",
        "Full Name",
        "Role",
        "Team Name",
        "Category",
        "Desk",
        "Track",
        "Institution",
        "Score",
        "Finalist_Email_Status"
    ]

    # Write to Downloads
    with open(DOWNLOADS_CSV, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    # Write to tools/
    with open(TOOLS_CSV, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print("\n============================================================")
    print("SUCCESS: Hackathon Finalist Recipients Exported")
    print("============================================================")
    print(f"1. {DOWNLOADS_CSV}")
    print(f"2. {TOOLS_CSV}")
    print("============================================================")

if __name__ == "__main__":
    main()
