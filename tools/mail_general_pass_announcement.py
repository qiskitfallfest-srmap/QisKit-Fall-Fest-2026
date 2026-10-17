#!/usr/bin/env python3
"""
Mailing Utility for On-Campus General Offline Pass (₹99)
Qiskit Fall Fest 2026 (SRM University-AP)

Target: Non-Hackathon Registered Students & Learners
Excludes all Hackathon team members, leaders, and protected faculty emails.

Usage:
  python tools/mail_general_pass_announcement.py --dry-run
  python tools/mail_general_pass_announcement.py --send --batch-size 50
"""

import os
import sys
import argparse
import csv
import smtplib
import time
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Configuration
SMTP_HOST = os.environ.get("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.environ.get("SMTP_PORT", 587))
SMTP_USER = os.environ.get("SMTP_USER", "qiskitfallfest@srmap.edu.in")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "")

PORTAL_URL = "https://www.qffsrmap2026.com/learning"
GATEWAY_URL = "https://forms.easebuzz.in/register/SRMAPIA9oJ/QiskitFallFestSRMAP2026"

EMAIL_SUBJECT = "Qiskit Fall Fest 2026: On-Campus Attendance Pass (26–30 Oct) | SRM University-AP"

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
    .badge {{ display: inline-block; padding: 4px 10px; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 16px; font-family: monospace; }}
    .inclusions {{ background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 18px; margin: 18px 0; }}
    .inclusions ul {{ margin: 6px 0 0 0; padding-left: 18px; }}
    .inclusions li {{ margin-bottom: 8px; }}
    .cta-button {{ display: inline-block; background: #6C151E; color: #ffffff !important; padding: 13px 26px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; margin: 16px 0 8px 0; text-align: center; }}
    .step-box {{ background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 16px; margin: 12px 0; }}
    .step-num {{ font-family: monospace; font-size: 11px; font-weight: 700; color: #6C151E; text-transform: uppercase; letter-spacing: 0.1em; }}
    .note-box {{ border-left: 3px solid #d97706; background: #fffbeb; padding: 14px 16px; margin: 18px 0; font-size: 13px; color: #92400e; border-radius: 0 4px 4px 0; }}
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
      <div class="badge">OFFLINE PASS REGISTRATION</div>
      <p>Hello {full_name},</p>
      
      <p>The online masterclasses and learning tracks for Qiskit Fall Fest 2026 are concluding. The physical on-campus festival begins <strong>Monday, 26 October through Friday, 30 October 2026</strong> at SRM University-AP.</p>

      <p>To attend keynote sessions, hands-on masterclass workshops, the Industry Tech Expo, and student networking arenas on campus, attendees can now obtain their <strong>General Offline Pass (&#8377;99)</strong>.</p>

      <div class="inclusions">
        <strong>What the General Offline Pass (&#8377;99) Includes:</strong>
        <ul>
          <li><strong>5-Day Campus Entry:</strong> Access to all open venue tracks at SRM University-AP (26–30 October 2026).</li>
          <li><strong>IBM Quantum Keynotes:</strong> Distinguished research and industry lectures.</li>
          <li><strong>Hands-On Workshops:</strong> Specialized in-person technical masterclass sessions.</li>
          <li><strong>Industry Tech Expo &amp; Startup Pitch:</strong> Connect with technology leaders and emerging startups.</li>
          <li><strong>Interactive Gaming Arena:</strong> QChess, QEscapes, The Great Quantum Debate, and Quantum Arcade.</li>
          <li><strong>Official Attendance Certificate:</strong> Co-certified on-campus certificate of participation.</li>
        </ul>
      </div>

      <h3 style="font-size: 15px; color: #0f172a; margin: 20px 0 10px 0;">How to Get Your Digital Gate Pass:</h3>

      <div class="step-box">
        <span class="step-num">Step 1: Pay on Official University Gateway</span>
        <p style="margin: 6px 0 10px 0; font-size: 13px; color: #475569;">
          Complete the &#8377;99 fee on the central SRM University-AP Easebuzz portal. After payment, Easebuzz displays your official receipt and sends a copy to your email.
        </p>
        <div>
          <a href="{gateway_url}" class="cta-button" target="_blank">
            Pay &#8377;99 on University Gateway &rarr;
          </a>
        </div>
      </div>

      <div class="step-box">
        <span class="step-num">Step 2: Upload Receipt &amp; Claim QR Gate Badge</span>
        <p style="margin: 6px 0 0 0; font-size: 13px; color: #475569;">
          Log into your learning portal dashboard at <a href="{portal_url}" style="color: #6C151E; font-weight: 600;">qffsrmap2026.com/learning</a>, upload your Easebuzz receipt (PDF or screenshot), and enter your Easebuzz Transaction ID (shown on line 4 of your receipt, e.g. E26101518BKHN3). Your <strong>Digital Gate Pass with Security QR Code</strong> will be generated immediately for download to your phone.
        </p>
      </div>

      <div class="note-box">
        <strong>Scope Notice:</strong>
        <p style="margin: 4px 0 0 0; line-height: 1.5;">
          This pass provides comprehensive access to general festival events and workshops. It does not include catering/lunch packages or entry into the competitive Hackathon Phase 2 sprint (which requires Phase 1 qualification). Outstation attendees requiring PG accommodation assistance near campus (approx. &#8377;500/night) can coordinate directly in the WhatsApp Community.
        </p>
      </div>

      <p style="margin-top: 24px;">
        Best regards,<br>
        <strong>Qiskit Fall Fest 2026 Organizing Committee</strong><br>
        Department of Physics &amp; School of Engineering and Sciences<br>
        SRM University-AP
      </p>
    </div>

    <div class="footer">
      Official Learning Portal: <a href="{portal_url}" style="color: #6C151E;">www.qffsrmap2026.com/learning</a><br>
      Questions? Reach out directly via the official WhatsApp Community or reply to this email.
    </div>
  </div>
</body>
</html>"""

def main():
    parser = argparse.ArgumentParser(description="Dispatch On-Campus Pass announcement to non-hackathon cohort.")
    parser.add_argument("--csv", default="tools/non_hackathon_pass_recipients.csv", help="Recipients CSV file path")
    parser.add_argument("--dry-run", action="store_true", default=False, help="Preview without sending")
    parser.add_argument("--send", action="store_true", default=False, help="Execute actual SMTP dispatch")
    parser.add_argument("--batch-size", type=int, default=50, help="Emails per batch")
    parser.add_argument("--delay", type=float, default=1.5, help="Delay in seconds between emails")
    args = parser.parse_args()

    if not os.path.exists(args.csv):
        print(f"Error: CSV file not found at {args.csv}")
        print("Run `python tools/export_non_hackathon_pass_recipients.py` first.")
        sys.exit(1)

    recipients = []
    with open(args.csv, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row.get("email"):
                recipients.append(row)

    print(f"Loaded {len(recipients)} non-hackathon recipients from {args.csv}")

    if not args.send:
        print("\n[DRY RUN MODE] - No emails will be sent.")
        print(f"Subject: {EMAIL_SUBJECT}")
        if recipients:
            sample = recipients[0]
            print(f"\nSample Recipient: {sample['full_name']} <{sample['email']}>")
            print("To execute dispatch, pass `--send` with valid SMTP environment variables.")
        return

    if not SMTP_PASSWORD:
        print("Error: SMTP_PASSWORD environment variable is not set. Please export SMTP_PASSWORD.")
        sys.exit(1)

    print(f"\nStarting SMTP dispatch via {SMTP_HOST}:{SMTP_PORT} as {SMTP_USER}...")
    server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
    server.starttls()
    server.login(SMTP_USER, SMTP_PASSWORD)

    sent_count = 0
    failed = []

    for i, r in enumerate(recipients, 1):
        email = r["email"].strip()
        name = r.get("full_name") or email.split("@")[0].title()

        msg = MIMEMultipart("alternative")
        msg["Subject"] = EMAIL_SUBJECT
        msg["From"] = f"Qiskit Fall Fest 2026 <{SMTP_USER}>"
        msg["To"] = email

        html_body = HTML_TEMPLATE.format(
            full_name=name,
            portal_url=PORTAL_URL,
            gateway_url=GATEWAY_URL,
        )
        msg.attach(MIMEText(html_body, "html"))

        try:
            server.sendmail(SMTP_USER, email, msg.as_string())
            sent_count += 1
            print(f"[{i}/{len(recipients)}] Sent to: {email}")
            time.sleep(args.delay)
        except Exception as e:
            print(f"[{i}/{len(recipients)}] FAILED to {email}: {e}")
            failed.append((email, str(e)))

        if i % args.batch_size == 0 and i < len(recipients):
            print(f"Batch checkpoint ({i} processed). Pausing for 10 seconds...")
            time.sleep(10)

    server.quit()
    print(f"\nDispatch complete! Successfully sent: {sent_count}, Failed: {len(failed)}")
    if failed:
        print("Failed recipients:", failed)

if __name__ == "__main__":
    main()
