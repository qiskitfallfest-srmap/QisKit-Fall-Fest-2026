#!/usr/bin/env python3
"""
Morning "Your day at QFF" email for participants who saved sessions on /schedule.

One email per participant per day, listing only the sessions they saved for that day
(schedule_agenda in Supabase). Participants with nothing saved for the day get no
email. Session details come from data/offlineSchedule.ts, so a time or venue change
there is reflected in the next digest.

Dry run unless --send is passed. Addresses already mailed for a date are logged in
.tmp/daily_agenda_sent_<date>.txt and skipped on a re-run, so an interrupted send can
simply be started again.

Usage:
  python tools/mail_daily_agenda.py                          # dry run for today (IST)
  python tools/mail_daily_agenda.py --date 2026-10-26        # dry run for a given day
  python tools/mail_daily_agenda.py --emails you@srmap.edu.in --send   # test to yourself
  python tools/mail_daily_agenda.py --send                   # send today's digest

Env (read from the environment, falling back to .env.local):
  NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SMTP_USER, SMTP_PASSWORD
  (SMTP_HOST / SMTP_PORT default to Gmail).

Gmail / Workspace accounts cap sending at about 2,000 messages per day; this tool sends
at most one message per participant per run.
"""

import argparse
import html
import json
import os
import smtplib
import subprocess
import sys
import time
from datetime import datetime, timedelta, timezone
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path

import requests

sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parent.parent
IST = timezone(timedelta(hours=5, minutes=30))
SITE_URL = "https://www.qffsrmap2026.com"
PAGE_SIZE = 1000


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
SMTP_HOST = os.environ.get("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.environ.get("SMTP_PORT", 587))
SMTP_USER = os.environ.get("SMTP_USER", "qiskitfallfest@srmap.edu.in")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "")


def load_schedule():
    """Reads data/offlineSchedule.ts through Node so Python and the site share one source."""
    script = "import('./data/offlineSchedule.ts').then(m => process.stdout.write(JSON.stringify(m.offlineSchedule)))"
    result = subprocess.run(
        ["node", "--experimental-strip-types", "--no-warnings", "-e", script],
        cwd=ROOT,
        capture_output=True,
        text=True,
        encoding="utf-8",
    )
    if result.returncode != 0:
        sys.exit(f"Could not load data/offlineSchedule.ts (Node 22.6+ required):\n{result.stderr}")
    return json.loads(result.stdout)


def clock_minutes(label):
    hm, meridiem = label.strip().split(" ")
    hours, minutes = (int(x) for x in hm.split(":"))
    return (hours % 12 + (12 if meridiem.upper() == "PM" else 0)) * 60 + minutes


def fetch_agenda(session_ids):
    rows, offset = [], 0
    id_filter = "in.(" + ",".join(session_ids) + ")"
    while True:
        res = requests.get(
            f"{SUPABASE_URL}/rest/v1/schedule_agenda",
            headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"},
            params={"select": "email,session_id", "session_id": id_filter, "order": "email", "limit": PAGE_SIZE, "offset": offset},
            timeout=30,
        )
        if res.status_code == 404:
            sys.exit("schedule_agenda table not found. Apply supabase/migrations/20261023120000_create_schedule_agenda.sql first.")
        res.raise_for_status()
        page = res.json()
        rows.extend(page)
        if len(page) < PAGE_SIZE:
            return rows
        offset += PAGE_SIZE


def render(day, sessions):
    items = "".join(
        f"""
        <tr>
          <td style="padding:10px 12px 10px 0;vertical-align:top;font-family:monospace;font-size:13px;color:#6C151E;white-space:nowrap;">{html.escape(s['time'])}</td>
          <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;">
            <div style="font-size:14px;font-weight:600;color:#0f172a;">{html.escape(s['title'])}</div>
            <div style="font-size:12px;color:#64748b;margin-top:2px;">Until {html.escape(s['end'])} &middot; {html.escape(s['location'])}</div>
          </td>
        </tr>"""
        for s in sessions
    )
    count = len(sessions)
    return f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:24px;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
    <div style="background:#6C151E;color:#ffffff;padding:24px;">
      <div style="font-size:12px;color:#fecdd3;letter-spacing:0.08em;text-transform:uppercase;">{html.escape(day['label'])} &middot; {html.escape(day['weekday'])}, {html.escape(day['date'])}</div>
      <h1 style="margin:6px 0 0 0;font-size:20px;">Your day at Qiskit Fall Fest</h1>
    </div>
    <div style="padding:24px;font-size:14px;line-height:1.6;color:#334155;">
      <p style="margin-top:0;">You saved {count} session{'s' if count != 1 else ''} for today. All times are IST.</p>
      <table role="presentation" style="width:100%;border-collapse:collapse;">{items}</table>
      <p style="margin:24px 0 8px 0;">
        <a href="{SITE_URL}/schedule" style="display:inline-block;background:#6C151E;color:#ffffff;padding:12px 22px;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;">Open the full schedule</a>
      </p>
      <p style="font-size:13px;color:#64748b;">Carry your pass QR from the Learning Portal for entry. Timings can change on the day; the schedule page always has the latest.</p>
    </div>
    <div style="border-top:1px solid #e2e8f0;padding:16px 24px;font-size:12px;color:#64748b;background:#f8fafc;text-align:center;">
      You are receiving this because you saved sessions on the Qiskit Fall Fest schedule. Remove them from My agenda to stop these emails.
    </div>
  </div>
</body></html>"""


def main():
    parser = argparse.ArgumentParser(description="Send each participant their saved sessions for the day.")
    parser.add_argument("--date", default=datetime.now(IST).strftime("%Y-%m-%d"), help="Festival day, YYYY-MM-DD (default: today in IST)")
    parser.add_argument("--emails", help="Comma-separated list to restrict sending to (for tests)")
    parser.add_argument("--send", action="store_true", help="Actually send (default is a dry run)")
    parser.add_argument("--delay", type=float, default=1.5, help="Seconds between emails")
    args = parser.parse_args()

    schedule = load_schedule()
    day = next((d for d in schedule if d["fullDate"] == args.date), None)
    if not day:
        sys.exit(f"{args.date} is not a festival day ({', '.join(d['fullDate'] for d in schedule)}).")
    sessions_by_id = {s["id"]: s for s in day["sessions"] if s["track"] != "Break"}

    if not SUPABASE_KEY:
        sys.exit("SUPABASE_SERVICE_ROLE_KEY is not set.")
    rows = fetch_agenda(list(sessions_by_id))

    per_email = {}
    for row in rows:
        per_email.setdefault(row["email"].strip().lower(), []).append(sessions_by_id[row["session_id"]])
    if args.emails:
        only = {e.strip().lower() for e in args.emails.split(",") if e.strip()}
        per_email = {e: s for e, s in per_email.items() if e in only}

    log_path = ROOT / ".tmp" / f"daily_agenda_sent_{args.date}.txt"
    already = set(log_path.read_text(encoding="utf-8").split()) if log_path.exists() else set()
    pending = {e: s for e, s in per_email.items() if e not in already}

    print(f"{day['label']} ({args.date}): {len(per_email)} participants with saved sessions, "
          f"{len(per_email) - len(pending)} already mailed, {len(pending)} to send.")
    for email, sessions in list(pending.items())[:5]:
        print(f"  {email}: " + "; ".join(f"{s['time']} {s['title']}" for s in sorted(sessions, key=lambda s: clock_minutes(s["time"]))))

    if not args.send:
        print("Dry run. Pass --send to deliver.")
        return
    if not SMTP_PASSWORD:
        sys.exit("SMTP_PASSWORD is not set.")
    if not pending:
        return

    log_path.parent.mkdir(exist_ok=True)
    subject = f"Your day at Qiskit Fall Fest: {day['weekday']}, {day['date']}"
    server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
    server.starttls()
    server.login(SMTP_USER, SMTP_PASSWORD)
    sent = failed = 0
    try:
        with log_path.open("a", encoding="utf-8") as log:
            for email, sessions in pending.items():
                msg = MIMEMultipart("alternative")
                msg["Subject"] = subject
                msg["From"] = f"Qiskit Fall Fest 2026 <{SMTP_USER}>"
                msg["To"] = email
                msg.attach(MIMEText(render(day, sorted(sessions, key=lambda s: clock_minutes(s["time"]))), "html", "utf-8"))
                try:
                    server.sendmail(SMTP_USER, [email], msg.as_string())
                    log.write(email + "\n")
                    log.flush()
                    sent += 1
                    print(f"  sent {email}")
                except smtplib.SMTPException as exc:
                    failed += 1
                    print(f"  FAILED {email}: {exc}")
                time.sleep(args.delay)
    finally:
        server.quit()
    print(f"Done: {sent} sent, {failed} failed.")


if __name__ == "__main__":
    main()
