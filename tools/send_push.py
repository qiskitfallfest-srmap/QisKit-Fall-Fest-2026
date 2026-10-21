#!/usr/bin/env python3
"""
Send a Web Push notification to participants who turned on notifications in the
portal (profile -> App and notifications).

Subscriptions live in Supabase `push_subscriptions` (one row per device). The
script is a dry run unless --send is passed.

Audience (pick one):
  --all                  every subscribed device
  --csv PATH             emails from a CSV with an `email` column
                         (e.g. tools/hackathon_finalists_recipients.csv)
  --emails a@x,b@y       an explicit list (use your own email to test)

Examples:
  python tools/send_push.py --emails qiskitfallfest@srmap.edu.in \
      --title "Test" --body "Push is working" --send
  python tools/send_push.py --csv tools/hackathon_finalists_recipients.csv \
      --title "Finals start in 30 minutes" --body "Report to the auditorium by 9:30 AM." \
      --url /learning/hackathon --tag finals-start --send

Env (read from the environment, falling back to .env.local):
  NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT

Rows the push service reports as gone (404/410) are deleted; other failures
increment failure_count.
"""

import argparse
import csv
import json
import os
import sys
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path

import requests

sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parent.parent


def load_env_local():
    path = ROOT / ".env.local"
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


load_env_local()

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "https://jpciyrodeppqpkwqblpk.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
VAPID_PRIVATE_KEY = os.environ.get("VAPID_PRIVATE_KEY", "")
VAPID_SUBJECT = os.environ.get("VAPID_SUBJECT", "mailto:qiskitfallfest@srmap.edu.in")

PAGE_SIZE = 1000


def rest_headers(extra=None):
    headers = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}
    if extra:
        headers.update(extra)
    return headers


def fetch_subscriptions():
    rows, offset = [], 0
    while True:
        res = requests.get(
            f"{SUPABASE_URL}/rest/v1/push_subscriptions",
            headers=rest_headers(),
            params={"select": "id,email,endpoint,p256dh,auth,failure_count", "order": "created_at", "limit": PAGE_SIZE, "offset": offset},
            timeout=30,
        )
        if res.status_code == 404:
            sys.exit("push_subscriptions table not found. Apply supabase/migrations/20261022120000_create_push_subscriptions.sql first.")
        res.raise_for_status()
        page = res.json()
        rows.extend(page)
        if len(page) < PAGE_SIZE:
            return rows
        offset += PAGE_SIZE


def read_csv_emails(path):
    with open(path, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        field = next((c for c in reader.fieldnames or [] if c.strip().lower() in ("email", "user_email", "email_address")), None)
        if not field:
            sys.exit(f"{path} has no email column (looked for email, user_email, email_address).")
        return {row[field].strip().lower() for row in reader if row.get(field, "").strip()}


def patch_row(row_id, body):
    requests.patch(
        f"{SUPABASE_URL}/rest/v1/push_subscriptions",
        headers=rest_headers({"Content-Type": "application/json", "Prefer": "return=minimal"}),
        params={"id": f"eq.{row_id}"},
        data=json.dumps(body),
        timeout=30,
    )


def delete_row(row_id):
    requests.delete(
        f"{SUPABASE_URL}/rest/v1/push_subscriptions",
        headers=rest_headers({"Prefer": "return=minimal"}),
        params={"id": f"eq.{row_id}"},
        timeout=30,
    )


def send_one(row, payload, ttl):
    from pywebpush import WebPushException, webpush

    try:
        webpush(
            subscription_info={"endpoint": row["endpoint"], "keys": {"p256dh": row["p256dh"], "auth": row["auth"]}},
            data=payload,
            vapid_private_key=VAPID_PRIVATE_KEY,
            vapid_claims={"sub": VAPID_SUBJECT},
            ttl=ttl,
            headers={"Urgency": "high"},
            timeout=20,
        )
        patch_row(row["id"], {"last_sent_at": datetime.now(timezone.utc).isoformat(), "failure_count": 0})
        return "sent"
    except WebPushException as exc:
        status = exc.response.status_code if exc.response is not None else None
        if status in (404, 410):
            delete_row(row["id"])
            return "expired"
        patch_row(row["id"], {"failure_count": (row.get("failure_count") or 0) + 1})
        print(f"  failed {row['email']}: HTTP {status} {str(exc)[:160]}")
        return "failed"
    except Exception as exc:  # network errors
        print(f"  failed {row['email']}: {str(exc)[:160]}")
        return "failed"


def main():
    parser = argparse.ArgumentParser(description="Send a Web Push notification to subscribed participants.")
    audience = parser.add_mutually_exclusive_group(required=True)
    audience.add_argument("--all", action="store_true", help="every subscribed device")
    audience.add_argument("--csv", help="CSV file with an email column")
    audience.add_argument("--emails", help="comma-separated emails")
    parser.add_argument("--title", required=True, help="notification title (keep under ~50 characters)")
    parser.add_argument("--body", required=True, help="notification text (keep under ~120 characters)")
    parser.add_argument("--url", default="/learning", help="path opened when the notification is tapped")
    parser.add_argument("--tag", help="replaces an earlier notification with the same tag on the device")
    parser.add_argument("--ttl", type=int, default=6 * 3600, help="seconds the push service keeps it for offline devices")
    parser.add_argument("--send", action="store_true", help="actually send (default is a dry run)")
    args = parser.parse_args()

    if not SUPABASE_KEY:
        sys.exit("SUPABASE_SERVICE_ROLE_KEY is not set.")
    if args.send and not VAPID_PRIVATE_KEY:
        sys.exit("VAPID_PRIVATE_KEY is not set; refusing to send.")
    if not args.url.startswith("/"):
        sys.exit("--url must be a path on the site, e.g. /learning/hackathon")

    rows = fetch_subscriptions()
    if args.csv:
        wanted = read_csv_emails(args.csv)
    elif args.emails:
        wanted = {e.strip().lower() for e in args.emails.split(",") if e.strip()}
    else:
        wanted = None
    if wanted is not None:
        rows = [r for r in rows if r["email"].strip().lower() in wanted]

    people = {r["email"].strip().lower() for r in rows}
    print(f"Audience: {len(people)} people on {len(rows)} devices")
    if wanted is not None:
        print(f"  {len(wanted) - len(people)} of {len(wanted)} listed emails have not turned on notifications")
    print(f"Title: {args.title}\nBody:  {args.body}\nOpens: {args.url}")

    if not args.send:
        print("\nDry run. Add --send to deliver.")
        return
    if not rows:
        return

    payload = json.dumps({"title": args.title, "body": args.body, "url": args.url, "tag": args.tag})
    with ThreadPoolExecutor(max_workers=16) as pool:
        results = list(pool.map(lambda r: send_one(r, payload, args.ttl), rows))

    print(
        f"\nSent {results.count('sent')}, expired and removed {results.count('expired')}, failed {results.count('failed')}"
    )


if __name__ == "__main__":
    main()
