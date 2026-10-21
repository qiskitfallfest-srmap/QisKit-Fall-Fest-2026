#!/usr/bin/env python3
"""
Mailing & Export Utility for SRM University-AP Complimentary On-Campus Pass
Qiskit Fall Fest 2026 (SRM University-AP)

Target: All SRM University-AP students (allowed_emails and registrations)
Excludes: Faculty, official festival accounts, and protected organizers.

Usage:
  python tools/mail_srmap_free_pass_announcement.py --dry-run
  python tools/mail_srmap_free_pass_announcement.py --export-csv .tmp/srmap_free_pass_recipients.csv
  python tools/mail_srmap_free_pass_announcement.py --send --batch-size 50
"""

import os
import sys
import argparse
import csv
import smtplib
import time
import json
import re
import urllib.request
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Configuration
SMTP_HOST = os.environ.get("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.environ.get("SMTP_PORT", 587))
SMTP_USER = os.environ.get("SMTP_USER", "qiskitfallfest@srmap.edu.in")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "")

PORTAL_URL = "https://www.qffsrmap2026.com/learning"
SCHEDULE_URL = "https://www.qffsrmap2026.com/schedule"

EMAIL_SUBJECT = "Special Update: Free On-Campus Pass for SRM-AP Students | Qiskit Fall Fest 2026"

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "https://jpciyrodeppqpkwqblpk.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY", "sb_publishable_wjeOXSiT7E63DsDqTaL1cw_JBMTC3kj"
)

PROTECTED_EMAILS = {
    "sazzadali.b@srmap.edu.in",
    "gangireddy.s@srmap.edu.in",
    "varsha.s@srmap.edu.in",
    "qiskitfallfest@srmap.edu.in",
    "qiskitfallfest2026@gmail.com",
    "sahgyan9@gmail.com",
    "ramanujan.ks@srmap.edu.in",
    "meera.s@srmap.edu.in",
}

HTML_TEMPLATE = """<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 24px; }}
    .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }}
    .header {{ background: #6C151E; color: #ffffff; padding: 28px 24px; text-align: left; }}
    .header h1 {{ margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.01em; }}
    .header p {{ margin: 6px 0 0 0; font-size: 13px; color: #fecdd3; }}
    .content {{ padding: 24px; font-size: 14px; line-height: 1.6; color: #334155; }}
    .badge {{ display: inline-block; padding: 4px 10px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 4px; font-size: 12px; font-weight: 600; color: #065f46; margin-bottom: 16px; font-family: monospace; }}
    .inclusions {{ background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 18px; margin: 18px 0; }}
    .inclusions ul {{ margin: 6px 0 0 0; padding-left: 18px; }}
    .inclusions li {{ margin-bottom: 8px; }}
    .cta-button {{ display: inline-block; background: #6C151E; color: #ffffff !important; padding: 13px 26px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; margin: 16px 0 8px 0; text-align: center; }}
    .step-box {{ background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 16px; margin: 12px 0; }}
    .step-num {{ font-family: monospace; font-size: 11px; font-weight: 700; color: #6C151E; text-transform: uppercase; letter-spacing: 0.1em; }}
    .note-box {{ border-left: 3px solid #059669; background: #ecfdf5; padding: 14px 16px; margin: 18px 0; font-size: 13px; color: #065f46; border-radius: 0 4px 4px 0; }}
    .footer {{ border-top: 1px solid #e2e8f0; padding: 18px 24px; font-size: 12px; color: #64748b; background: #f8fafc; text-align: center; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Qiskit Fall Fest 2026</h1>
      <p>SRM University-AP · 26–30 October 2026 · On-Campus Festival</p>
    </div>
    
    <div class="content">
      <div class="badge">HOST UNIVERSITY PRIVILEGE · FREE ACCESS</div>
      <p>Hello {full_name},</p>
      
      <p>We are delighted to announce that for all <strong>SRM University-AP students</strong>, admission to the on-campus phase of <strong>IBM Qiskit Fall Fest 2026 (26–30 October 2026)</strong> is now <strong>100% complimentary</strong>. You do NOT need to pay the &#8377;99 general pass fee.</p>

      <div class="note-box">
        <strong>Free Pass Inclusions:</strong>
        Full 5-day campus entry to Keynote Sessions by IBM Quantum researchers, Hands-on Technical Workshops, the Industry Tech Expo, Quantum Reference Center Tour, The Great Quantum Debate, and open gaming competitions (QChess, QEscapes, Quantum Arcade).
      </div>

      <p>To ensure smooth entry at the campus registration desk, generate your digital gate pass and personalized QR badge online:</p>

      <div class="step-box">
        <div class="step-num">Step 1</div>
        <p style="margin: 4px 0 0 0;">Visit the official learning platform: <a href="{portal_url}" style="color: #6C151E; font-weight: 600;">{portal_url}</a></p>
      </div>

      <div class="step-box">
        <div class="step-num">Step 2</div>
        <p style="margin: 4px 0 0 0;">Sign in with your <strong>@srmap.edu.in</strong> Google account.</p>
      </div>

      <div class="step-box">
        <div class="step-num">Step 3</div>
        <p style="margin: 4px 0 0 0;">Navigate to the <strong>On-Campus Pass</strong> section and click <strong>&ldquo;Claim Free Campus Pass&rdquo;</strong>. Your QR badge is issued instantly with zero payment or receipt upload required.</p>
      </div>

      <center>
        <a href="{portal_url}" class="cta-button">Claim Your Free Campus Pass</a>
      </center>

      <p style="font-size: 12px; color: #64748b; margin-top: 20px;">
        <em>Note for students who previously paid:</em> If you already submitted a &#8377;99 payment on Easebuzz, our finance desk is processing your full refund to the original payment source. Your pass remains active and verified.
      </p>

      <p style="font-size: 12px; color: #64748b;">
        <em>Hackathon Phase 2 Finalists:</em> Shortlisted hackathon sprint teams require the &#8377;499 Flagship Pass (which includes dedicated hardware setup, sprint venue, and 5-day catered meals).
      </p>

      <p>We look forward to seeing you at the festival on Monday, 26 October!</p>
      
      <p style="margin-bottom: 0;">Warm regards,<br>
      <strong>Organizing Committee</strong><br>
      IBM Qiskit Fall Fest 2026<br>
      SRM University-AP</p>
    </div>
    
    <div class="footer">
      <p style="margin: 0;">Portal: <a href="{portal_url}" style="color: #6C151E;">{portal_url}</a> &middot; Schedule: <a href="{schedule_url}" style="color: #6C151E;">{schedule_url}</a></p>
      <p style="margin: 4px 0 0 0;">Questions? Contact the organizing team at <a href="mailto:qiskitfallfest@srmap.edu.in" style="color: #6C151E;">qiskitfallfest@srmap.edu.in</a></p>
    </div>
  </div>
</body>
</html>
"""

def supabase_get(endpoint):
    sep = "&" if "?" in endpoint else "?"
    url = f"{SUPABASE_URL}/rest/v1/{endpoint}{sep}limit=10000"
    req = urllib.request.Request(
        url,
        headers={
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        },
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

def clean_name(name):
    if not name:
        return "Student"
    name = str(name).strip()
    # Strip roll number pipes e.g. "Lasya | AP251100..."
    if "|" in name:
        name = name.split("|")[0].strip()
    return name or "Student"

def get_srmap_recipients():
    allowed = supabase_get("allowed_emails?select=email,full_name")
    regs = supabase_get("registrations?select=email,name,institution")

    recipients = {}

    for row in allowed:
        email = (row.get("email") or "").strip().lower()
        if not email or not email.endswith("@srmap.edu.in"):
            continue
        if email in PROTECTED_EMAILS:
            continue
        name = clean_name(row.get("full_name"))
        recipients[email] = name

    for row in regs:
        email = (row.get("email") or "").strip().lower()
        inst = (row.get("institution") or "").strip()
        is_srm = email.endswith("@srmap.edu.in") or re.search(r"\bsrm\s*(university)?[\s-]*a\.?p\b|\bsrmap\b", inst, re.IGNORECASE)
        if not is_srm:
            continue
        if email in PROTECTED_EMAILS:
            continue
        if email not in recipients:
            recipients[email] = clean_name(row.get("name"))

    return recipients

def main():
    parser = argparse.ArgumentParser(description="Mailing utility for SRM-AP Free Pass Announcement.")
    parser.add_argument("--dry-run", action="store_true", help="Preview recipients without sending")
    parser.add_argument("--send", action="store_true", help="Send live emails")
    parser.add_argument("--batch-size", type=int, default=50, help="Batch size for sending")
    parser.add_argument("--export-csv", type=str, help="Export recipients to CSV file")

    args = parser.parse_args()

    recipients = get_srmap_recipients()
    print(f"Total SRM-AP Recipients Qualified: {len(recipients)}")

    if args.export_csv:
        os.makedirs(os.path.dirname(os.path.abspath(args.export_csv)), exist_ok=True)
        with open(args.export_csv, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(["Email", "Full Name"])
            for em, nm in sorted(recipients.items()):
                writer.writerow([em, nm])
        print(f"Exported {len(recipients)} recipients to {args.export_csv}")
        return

    if args.dry_run or not args.send:
        print("\n--- SAMPLE RECIPIENTS (First 10) ---")
        for i, (em, nm) in enumerate(list(recipients.items())[:10], 1):
            print(f"{i:2d}. {nm} <{em}>")
        print("\nRun with --send to dispatch or --export-csv <path> to save CSV.")
        return

    if not SMTP_PASSWORD:
        print("ERROR: SMTP_PASSWORD environment variable is not set. Cannot dispatch emails.")
        sys.exit(1)

    print(f"Connecting to SMTP {SMTP_HOST}:{SMTP_PORT} as {SMTP_USER}...")
    server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
    server.starttls()
    server.login(SMTP_USER, SMTP_PASSWORD)

    sent = 0
    failed = 0

    for em, nm in recipients.items():
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = EMAIL_SUBJECT
            msg["From"] = f"IBM Qiskit Fall Fest 2026 <{SMTP_USER}>"
            msg["To"] = em

            html = HTML_TEMPLATE.format(
                full_name=nm,
                portal_url=PORTAL_URL,
                schedule_url=SCHEDULE_URL,
            )
            msg.attach(MIMEText(html, "html"))

            server.send_message(msg)
            sent += 1
            print(f"[{sent}/{len(recipients)}] Sent: {em}")

            if sent % args.batch_size == 0:
                print("Pausing 3s between batches...")
                time.sleep(3)

        except Exception as e:
            failed += 1
            print(f"FAILED: {em} -> {e}")

    server.quit()
    print(f"\nDispatch complete: {sent} sent, {failed} failed.")

if __name__ == "__main__":
    main()
