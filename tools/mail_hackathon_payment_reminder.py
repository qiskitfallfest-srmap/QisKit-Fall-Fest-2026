#!/usr/bin/env python3
"""
Mailing Utility for Flagship Hackathon Phase 2 Payment Reminder
Target: 27 Accepted Teams + Unpaid/Rejected members on Confirmed Teams (99 recipients)
Extended Deadline: Thursday, 22 October 2026, 11:59 PM IST
"""

import os
import sys
import argparse
import csv
import smtplib
import time
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

import sys
sys.stdout.reconfigure(encoding='utf-8')

SMTP_HOST = os.environ.get("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.environ.get("SMTP_PORT", 587))
SMTP_USER = os.environ.get("SMTP_USER", "qiskitfallfest@srmap.edu.in")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "")

PORTAL_URL = "https://www.qffsrmap2026.com/learning#campus-pass"
ARENA_URL = "https://www.qffsrmap2026.com/learning/hackathon"
WHATSAPP_URL = "https://chat.whatsapp.com/HoLFUpcm46L0qDE6VBdboW"

SUBJECT_LEAD = "Urgent: Team {team_name} Phase 2 Payment Window Extended to 22 Oct (11:59 PM IST)"
SUBJECT_MEMBER = "Action Required: Your INR 499 Flagship Pass for Team {team_name} | Qiskit Fall Fest 2026"

def render_email(recipient):
    name = recipient["name"]
    team_name = recipient["team_name"]
    role = recipient["role"]
    category = recipient.get("reminder_category") or recipient.get("reminder_type")
    email = recipient["email"]
    deadline = recipient.get("deadline_ist", "22 Oct 2026, 11:59 PM IST")

    if category == "team_lead":
        role_badge = "Team Leader Responsibility"
        role_title = "Coordinate Team Receipts & Finalize Confirmed Desk"
        role_color = "#7c1415"
        role_bg = "#fdf5f5"
        role_border = "#e8b8bb"
        role_html = f"""
        <p style="margin: 0 0 10px 0; font-size: 13.5px; color: #4a1d20; line-height: 1.65;">
          Your team <strong>{team_name}</strong>'s payment window has been extended to <strong>{deadline}</strong>.
        </p>
        <p style="margin: 0 0 10px 0; font-size: 13.5px; color: #4a1d20; line-height: 1.65;">
          <strong>Next Action:</strong> Ensure all your teammates sign into <a href="{PORTAL_URL}" style="color: #7c1415; font-weight: bold;">qffsrmap2026.com/learning#campus-pass</a> and submit their &#8377;499 Flagship Pass receipt.
        </p>
        <p style="margin: 0; font-size: 13px; color: #4a1d20; line-height: 1.6;">
          <strong>Leader Final Step:</strong> You will submit your own pass receipt last, which locks in your team's confirmed auditorium desk for the 24-hour sprint.
        </p>
        """
        subject = SUBJECT_LEAD.format(team_name=team_name)
    elif category == "paid_member_waiting_for_team":
        role_badge = "Teammate · Payment Received"
        role_title = "Your Receipt is Submitted · Nudge Your Teammates"
        role_color = "#1e7e45"
        role_bg = "#f0f7f3"
        role_border = "#c2e0cf"
        role_html = f"""
        <p style="margin: 0 0 10px 0; font-size: 13.5px; color: #2c4033; line-height: 1.65;">
          We have received your &#8377;499 Flagship Pass receipt for <strong>Team {team_name}</strong>. Thank you!
        </p>
        <p style="margin: 0; font-size: 13px; color: #2c4033; line-height: 1.6;">
          Your team's payment window is open until <strong>{deadline}</strong>. Please remind your remaining teammates to submit their receipts so your team leader can complete the final confirmation.
        </p>
        """
        subject = f"Receipt Confirmed: Team {team_name} Phase 2 Sprint | Qiskit Fall Fest 2026"
    elif category == "confirmed_team_unpaid_member":
        role_badge = "Action Required · Newly Added Finalist"
        role_title = "Submit Your ₹499 Flagship Pass Receipt"
        role_color = "#b97e3e"
        role_bg = "#fdf6ed"
        role_border = "#f0d5b5"
        role_html = f"""
        <p style="margin: 0 0 10px 0; font-size: 13.5px; color: #4f3d2a; line-height: 1.65;">
          You were recently added to <strong>Team {team_name}</strong> for the onsite finals! Your team desk is confirmed, but your individual attendee pass is pending.
        </p>
        <p style="margin: 0; font-size: 13px; color: #4f3d2a; line-height: 1.6;">
          Please sign in to <a href="{PORTAL_URL}" style="color: #7c1415; font-weight: bold;">qffsrmap2026.com/learning#campus-pass</a> before <strong>{deadline}</strong> to pay &#8377;499 on Easebuzz (Diamond Pass) and upload your receipt to generate your entry QR code.
        </p>
        """
        subject = SUBJECT_MEMBER.format(team_name=team_name)
    else:  # unpaid_member
        role_badge = "Action Required · Team Member"
        role_title = "Submit Your ₹499 Flagship Pass on the Portal"
        role_color = "#b97e3e"
        role_bg = "#fdf6ed"
        role_border = "#f0d5b5"
        role_html = f"""
        <p style="margin: 0 0 10px 0; font-size: 13.5px; color: #4f3d2a; line-height: 1.65;">
          Your team <strong>{team_name}</strong> is an official finalist for Phase 2 at SRM University-AP!
        </p>
        <p style="margin: 0 0 10px 0; font-size: 13.5px; color: #4f3d2a; line-height: 1.65;">
          Your payment window has been extended to <strong>{deadline}</strong>. Each team member must pay &#8377;499 individually on Easebuzz and submit their receipt on the portal.
        </p>
        <p style="margin: 0; font-size: 13px; color: #4f3d2a; line-height: 1.6;">
          Log into <a href="{PORTAL_URL}" style="color: #7c1415; font-weight: bold;">qffsrmap2026.com/learning#campus-pass</a> using your registered Google account (<strong>{email}</strong>) to complete payment.
        </p>
        """
        subject = SUBJECT_MEMBER.format(team_name=team_name)

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body {{ margin: 0; padding: 24px 12px; background-color: #f5efea; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #231f20; line-height: 1.65; }}
    .container {{ max-width: 660px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e4dacb; border-radius: 12px; overflow: hidden; }}
    .banner {{ background-color: #7c1415; padding: 12px 24px; text-align: center; color: #fdf8f0; font-family: "Georgia", serif; font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase; font-weight: bold; }}
    .content {{ padding: 32px 32px 36px 32px; }}
    .role-box {{ background-color: {role_bg}; border: 1px solid {role_border}; border-left: 4px solid {role_color}; border-radius: 8px; padding: 18px 20px; margin: 0 0 24px 0; }}
    .badge {{ font-size: 11px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; color: {role_color}; margin-bottom: 4px; }}
    .role-heading {{ font-size: 15px; font-weight: bold; color: {role_color}; margin-bottom: 8px; }}
    .inclusions {{ background-color: #fbf7ef; border-left: 4px solid #7c1415; border-radius: 0 6px 6px 0; padding: 16px 20px; margin: 0 0 24px 0; font-size: 13.5px; color: #4f443b; }}
    .inclusions ul {{ margin: 8px 0 8px 18px; padding: 0; }}
    .inclusions li {{ margin-bottom: 6px; }}
    .cta-btn {{ display: inline-block; background-color: #7c1415; color: #ffffff !important; padding: 12px 26px; font-size: 14px; font-weight: bold; text-decoration: none; border-radius: 6px; }}
    .whatsapp-box {{ background-color: #fbf7ef; border: 1px solid #e1d3bf; border-radius: 8px; padding: 18px; margin: 0 0 24px 0; }}
    .footer {{ background-color: #faf7f2; border-top: 1px solid #ebd9c2; padding: 20px 32px; text-align: center; font-size: 12px; color: #857a73; }}
  </style>
</head>
<body>
  <div class="container">
    <div style="background-color:#faf7f2; text-align:center;">
      <img src="https://www.qffsrmap2026.com/brand/qiskit-fall-fest-banner.png" alt="IBM Qiskit Fall Fest 2026" width="660" style="display:block;width:100%;max-width:660px;height:auto;border:0;">
    </div>
    <div class="banner">
      IBM PARTNER PLUS · SRM UNIVERSITY-AP · FLAGSHIP HACKATHON ARENA
    </div>
    <div class="content">
      <p style="margin: 0 0 14px 0; font-size: 16px; font-weight: bold; color: #231f20;">
        Dear {name} ({role.title()} · Team: {team_name}),
      </p>

      <div class="role-box">
        <div class="badge">{role_badge}</div>
        <div class="role-heading">{role_title}</div>
        {role_html}
      </div>

      <div class="inclusions">
        <strong style="color: #7c1415; font-size: 14px;">All-Access Flagship Pass Privileges (&#8377;499 per member):</strong>
        <ul>
          <li><strong>24-Hour Physical Sprint:</strong> Auditorium X-Lab on <strong>28 &amp; 29 October</strong> with dedicated seating and live IBM mentoring.</li>
          <li><strong>Quantum Capture The Flag (QCTF):</strong> Full entry to the flagship cybersecurity competition on <strong>27 October</strong>.</li>
          <li><strong>Quantum Startup Pitch Fest:</strong> Pitch your working prototype to venture investors and incubation leaders.</li>
          <li><strong>5-Day Catered Dining:</strong> Catered lunches and twice-daily refreshments across all five days (26–30 October).</li>
          <li><strong>Daily Campus Entry:</strong> 9:00 AM – 11:00 AM registration desks at SRM University-AP.</li>
          <li><strong>Do NOT purchase the &#8377;99 General Pass:</strong> The &#8377;99 pass is strictly for non-hackathon visitors and excludes sprint seating, QCTF, Pitch Fest, and meals.</li>
        </ul>
      </div>

      <div style="text-align: center; margin: 24px 0 28px 0;">
        <a href="{PORTAL_URL}" class="cta-btn" target="_blank">
          Open Flagship Pass Portal &rarr;
        </a>
      </div>

      <div class="whatsapp-box">
        <h4 style="margin: 0 0 6px 0; font-size: 14.5px; color: #7c1415; font-weight: bold;">Finalists WhatsApp Community</h4>
        <p style="margin: 0 0 12px 0; font-size: 13px; color: #4f443b; line-height: 1.5;">
          Join our coordination community for PG accommodation guidance near campus (approx. &#8377;500/night), arrival directions, and desk seating charts:
        </p>
        <a href="{WHATSAPP_URL}" target="_blank" style="display:inline-block; background-color:#2a6a43; color:#ffffff; padding:9px 18px; font-size:13px; font-weight:bold; text-decoration:none; border-radius:5px;">
          Join Finalists WhatsApp &rarr;
        </a>
      </div>

      <p style="margin: 0 0 16px 0; font-size: 14px; color: #3d3635; line-height: 1.6;">
        We look forward to seeing <strong>Team {team_name}</strong> build on campus and present your solutions to our IBM and industry panel on 28–29 October.
      </p>

      <div style="border-left: 3px solid #7c1415; padding-left: 12px; margin-top: 20px;">
        <p style="margin: 0; font-size: 13.5px; color: #231f20; line-height: 1.5;">
          Best regards,<br>
          <strong>Hackathon Technical Committee &amp; Organizing Board</strong><br>
          Partner Plus IBM Qiskit Fall Fest 2026<br>
          School of Engineering and Sciences, SRM University-AP
        </p>
      </div>
    </div>

    <div class="footer">
      Hackathon Arena: <a href="{ARENA_URL}" target="_blank" style="color: #7c1415; text-decoration: underline;">qffsrmap2026.com/learning/hackathon</a> &nbsp;·&nbsp;
      Pass Portal: <a href="{PORTAL_URL}" target="_blank" style="color: #7c1415; text-decoration: underline;">qffsrmap2026.com/learning#campus-pass</a><br>
      SRM University-AP, Neerukonda, Mangalagiri Mandal, Andhra Pradesh 522240
    </div>
  </div>
</body>
</html>"""

    return subject, html

def main():
    parser = argparse.ArgumentParser(description="Dispatch Flagship Pass payment reminder.")
    parser.add_argument("--csv", default="tools/payment_reminder_recipients.csv", help="Recipients CSV file")
    parser.add_argument("--test", metavar="EMAIL", help="Send a single test email to the specified address")
    parser.add_argument("--send", action="store_true", help="Send to all recipients in CSV")
    parser.add_argument("--dry-run", action="store_true", help="Dry run without sending")
    args = parser.parse_args()

    if not os.path.exists(args.csv):
        print(f"Error: CSV file not found: {args.csv}")
        sys.exit(1)

    recipients = []
    with open(args.csv, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        recipients = list(reader)

    print(f"Loaded {len(recipients)} recipients from {args.csv}")

    if args.dry_run:
        print("\n--- DRY RUN PREVIEW (First 3 recipients) ---")
        for r in recipients[:3]:
            sub, html = render_email(r)
            rem_type = r.get('reminder_category') or r.get('reminder_type')
            print(f"To: {r['email']} | Name: {r['name']} | Role: {r['role']} | Team: {r['team_name']} | Type: {rem_type}")
            print(f"Subject: {sub}")
            print("-" * 50)
        return

    if args.test:
        test_email = args.test.strip()
        sample = recipients[0] if recipients else {
            "name": "Gyan Kumar Sah (Test)",
            "email": test_email,
            "role": "leader",
            "team_name": "IgniteNova",
            "reminder_type": "team_lead",
            "deadline_ist": "22 Oct 2026, 11:59 PM IST"
        }
        sub, html = render_email(sample)
        print(f"Dispatching single test email to: {test_email}")
        print(f"Subject: {sub}")

        if not SMTP_PASSWORD:
            print("Notice: SMTP_PASSWORD environment variable is not set. Looking up in .env.local...")
            # Try reading SMTP_PASSWORD from .env.local
            try:
                with open(".env.local", "r", encoding="utf-8") as f:
                    for line in f:
                        if line.startswith("SMTP_PASSWORD="):
                            globals()["SMTP_PASSWORD"] = line.strip().split("=", 1)[1].strip("'\"")
                            break
            except Exception as e:
                print(f"Could not load .env.local: {e}")

        if not globals()["SMTP_PASSWORD"]:
            print("ERROR: SMTP_PASSWORD is not set. Please set SMTP_PASSWORD in environment or use Google Apps Script.")
            sys.exit(1)

        msg = MIMEMultipart("alternative")
        msg["Subject"] = sub
        msg["From"] = f"Qiskit Fall Fest 2026 <{SMTP_USER}>"
        msg["To"] = test_email
        msg.attach(MIMEText(html, "html"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, globals()["SMTP_PASSWORD"])
            server.sendmail(SMTP_USER, test_email, msg.as_string())
        print(f"Successfully sent test email to {test_email}!")
        return

    if not args.send:
        print("Please specify --dry-run, --test <email>, or --send")
        return

if __name__ == "__main__":
    main()
