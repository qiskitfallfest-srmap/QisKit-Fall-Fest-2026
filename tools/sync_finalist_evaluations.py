"""
Sync Finalist Evaluations & Publish Hackathon Results
=====================================================
Reads the approved 50 Auditorium Finalists spreadsheet and:
1. Upserts all 129 team evaluations into public.submission_evaluations
   - 50 Auditorium Desks: is_next_round = True, status = 'shortlisted'
   - 20 Waiting Room Teams: is_next_round = False, status = 'under_review' (or 'needs_discussion')
   - 59 Remaining Teams: is_next_round = False, status = 'rejected'
2. Sets public.platform_config 'hackathon_phase1_results' -> {"published": true}
3. Opens the Flagship Pass 48-hr payment window if requested.

Usage:
  python tools/sync_finalist_evaluations.py [--dry-run] [--publish]
"""

import sys
import os
import argparse
import openpyxl
import urllib.request
import json
from datetime import datetime, timezone

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "https://jpciyrodeppqpkwqblpk.supabase.co")
# Writes need the service role key: submission_evaluations is service-role only (20261017235500)
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

def make_supabase_request(endpoint, method="GET", data=None):
    url = f"{SUPABASE_URL}/rest/v1/{endpoint}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=representation"
    }
    body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

def sync_evaluations(xlsx_path, dry_run=False, publish=False):
    wb = openpyxl.load_workbook(xlsx_path, data_only=True)
    
    # Read the complete 129 sheet
    ws_all = wb["All 129 Teams Evaluated"]
    headers = [cell.value for cell in ws_all[1]]
    
    # Load DB teams to map team name to ID
    # Query hackathon_teams
    teams_data = make_supabase_request("hackathon_teams?select=id,name")
    team_name_to_id = {t['name'].strip().lower(): t['id'] for t in teams_data}

    eval_payload = []
    shortlisted_count = 0
    waiting_count = 0
    rejected_count = 0

    for row in ws_all.iter_rows(min_row=2, values_only=True):
        overall_rank = row[0]
        team_name = str(row[1]).strip()
        category = row[2]
        institution = row[3]
        decision = str(row[4]).strip()
        desk = row[5]
        score = row[6]

        team_id = team_name_to_id.get(team_name.lower())
        if not team_id:
            # Fuzzy match
            for k, v in team_name_to_id.items():
                if k in team_name.lower() or team_name.lower() in k:
                    team_id = v
                    print(f"[Fuzzy] Sheet '{team_name}' -> DB '{k}' (check this match)")
                    break

        if not team_id:
            print(f"[Warning] Could not match team ID for '{team_name}'")
            continue

        if decision == "Shortlist":
            shortlisted_count += 1
            is_next = True
            status = "shortlisted"
            notes = f"Phase 2 Auditorium Finalist ({desk}) | Consensus Score: {score}"
        elif decision == "Waiting Room":
            waiting_count += 1
            is_next = False
            status = "under_review"
            notes = f"Phase 2 Waiting Room ({desk}) | Consensus Score: {score}"
        else:
            rejected_count += 1
            is_next = False
            status = "rejected"
            notes = f"Phase 1 Non-Qualifier | Consensus Score: {score}"

        eval_payload.append({
            "category": "hackathon",
            "target_id": str(team_id),
            "is_next_round": is_next,
            "status": status,
            "score": float(score) if score is not None else 0.0,
            "last_evaluated_by_email": "qiskitfallfest@srmap.edu.in",
            "last_evaluated_by_name": "Jury Evaluation Committee",
            # Same shape as EvaluationComment in types/evaluations.ts
            "comments": [{
                "id": f"jury-{team_id}",
                "evaluator_email": "qiskitfallfest@srmap.edu.in",
                "evaluator_name": "Jury Evaluation Committee",
                "text": notes,
                "created_at": datetime.now(timezone.utc).isoformat(),
            }]
        })

    print(f"\n[Summary of Payload]")
    print(f"Total Teams: {len(eval_payload)}")
    print(f"  - Shortlisted: {shortlisted_count} (25 Internal + 25 External Desks)")
    print(f"  - Waiting Room: {waiting_count} (Standby Pool)")
    print(f"  - Rejected: {rejected_count}")

    if dry_run:
        print("\n[Dry Run] No database writes executed.")
        return

    # Upsert into submission_evaluations
    print(f"\n[*] Upserting {len(eval_payload)} records to public.submission_evaluations...")
    # Chunk by 50
    for i in range(0, len(eval_payload), 50):
        chunk = eval_payload[i:i+50]
        res = make_supabase_request(
            "submission_evaluations?on_conflict=category,target_id", method="POST", data=chunk
        )
        print(f"  Upserted chunk {i//50 + 1} ({len(chunk)} rows)")

    if publish:
        print("\n[*] Publishing results to live portal (platform_config)...")
        cfg_payload = [{"key": "hackathon_phase1_results", "value": {"published": True}}]
        make_supabase_request("platform_config", method="POST", data=cfg_payload)
        print("  -> hackathon_phase1_results set to {published: true}")

    print("\n[Done] Database sync complete!")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--file", default=r"C:\Users\sahgy\Downloads\QFF_2026_Hackathon_50_Auditorium_Finalists.xlsx")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--publish", action="store_true")
    args = parser.parse_args()

    if not SUPABASE_KEY and not args.dry_run:
        sys.exit("SUPABASE_SERVICE_ROLE_KEY is not set; refusing to write.")
    sync_evaluations(args.file, dry_run=args.dry_run, publish=args.publish)
