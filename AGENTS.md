# AI Agent Directives & Source of Truth: Qiskit Fall Fest 2026 (SRM University-AP)

This file is automatically loaded by AI agents working in this workspace.

---

## 1. Canonical URLs & Endpoints (MANDATORY)

- **Official Learning Portal & Event Registration (Active Everywhere & On-Campus):**  
  👉 **`https://www.qffsrmap2026.com/learning`**  
  *All participants, emails, notifications, and AI instructions directing users to register, log in, take quizzes, watch lectures, or access challenges MUST use this URL. Confirmed working natively across campus Wi-Fi and external networks.*

- **Official Online Registration Form (Google Form):**  
  👉 **`https://docs.google.com/forms/d/e/1FAIpQLSfgl8b3sfDfXw38ay6Lwj1a6DUj0uD5oc3xQ24yaClRppvWrg/viewform`**  
  *Used for external festival registrations and primary unauthenticated hero CTA.*

- **Flagship Hackathon Workspace & Competition Arena:**  
  👉 **`https://www.qffsrmap2026.com/learning/hackathon`**  
  *Primary destination for welcome emails, returning attendee CTAs, team creation, and problem statements to eliminate initial cognitive overload from the full curriculum.*

- **Main Festival Landing Page:**  
  `https://www.qffsrmap2026.com/`  

- **Production Mirror (Internal Reference Only):**  
  `https://qis-kit-fall-fest-2026.vercel.app/` (Learning: `https://qis-kit-fall-fest-2026.vercel.app/learning`)

---

## 2. Participant Onboarding & Workflow

1. **Whitelisting & Access:**
   - 1,470 approved student emails are stored in Supabase `public.allowed_emails`.
   - Users sign in directly via Google OAuth / Magic Link on the portal at `https://www.qffsrmap2026.com/learning`.

2. **Fee Structure & Non-Misleading Copy (CRITICAL):**
   - **Online Phase is 100% FREE:** Registration, masterclasses, quizzes, the creative competitions (Reels, Poster, Essay), and Hackathon Phase 1 require zero payment.
   - **Optional Verified Certificate Fee (₹99):** An optional fee for the course completion certificate after finishing all 5 masterclasses and quizzes. Paid on the same Easebuzz form as the General Offline Pass, but it is a **separate payment**: one Easebuzz Transaction ID covers exactly one purchase (pass or certificate, enforced by a DB trigger). Hackathon participants may buy the certificate. The participant chooses delivery: collect in person at the valedictory ceremony, or receive by email. Never call it a "Registration Fee" or "Online Course Fee".
   - **On-Campus Passes (26–30 October 2026):** General Offline Pass from ₹99 (eligible campus activities, exhibitions, keynotes, workshops, debates, open games) and All-Access Flagship Pass at ₹499 (eligible flagship activities such as Hackathon Phase 2, QCTF, and Startup Pitch subject to qualification, lunch on all five days, two snack servings per day, priority workshop seating). Always state that a pass does not guarantee selection for competitive events. The full breakdown lives on `/about` (`components/about/AboutArticle.tsx`) and FAQ 17; keep them synchronized.
   - **FAQ #14 Integrity:** FAQ 14 is dedicated to Day 2/3 Poster & Essay submissions. Never override FAQ 14 with payment or fee blocks (fee cards belong under FAQ 17).

3. **Hackathon Team Size Standards:**
   - **Strict Team Size: 2 to 6 members** (1 Team Leader + 1 to 5 Teammates).
   - **Solo Participation is Prohibited:** Backend validation strictly rejects solo teams. Teams must have at least 1 invited teammate accept before the roster can be finalized.
   - Legacy mentions of `1–4 members` in schedules or docs are deprecated and must never be reintroduced.

4. **Masterclass Learning Track & Session Materials:**
   - 5 active curriculum sessions (`session-1`, `session-3`, `session-4`, `session-5`, `session-6`) with video lectures and concept check quizzes.
   - 3 creative tracks (Digital Poster, Reels, Technical Essay) submitted at `https://www.qffsrmap2026.com/learning`.
   - **Session Materials & Storage Scope:** Presentation decks are hosted directly via Supabase Storage bucket `media` under `session-materials/{session-id}/{filename}.pdf` (backed by RLS migration `20261012111500_allow_session_materials_uploads_in_media_bucket.sql`). Active official decks:
     - `session-4`: Dr. Gangi Reddy Salla (`media/session-materials/session-4/Quantum_Photonic_Technologies.pdf`).
     - `session-6`: Dr. Sazzad Ali Biswas (`media/session-materials/session-6/Quantum_Cybersecurity_Cryptography.pdf`).
   - **Session 6 Architecture & Sole Speaker Integrity:** Session 6 is delivered exclusively by **Dr. Sazzad Ali Biswas** as the sole speaker (`coSpeakers: []`).
   - **Don Norman Information Architecture:** Official PDF decks are surfaced as prominent hero action cards immediately beneath session descriptions on `/learning/session/{id}`, with transcript accordions collapsed by default to eliminate cognitive clutter while preserving on-demand expandability.
   - **Faculty & Speaker Email Isolation:** Dr. Sazzad Ali Biswas (`sazzadali.b@srmap.edu.in`) and university faculty must NEVER be included in student communication, reminder, or participant nudge email recipient lists.

5. **Hackathon & Coding Challenges:**
   - Hackathon Phase 1 team submissions and repo registration: accessed via `https://www.qffsrmap2026.com/learning/hackathon`.
   - 9 Qiskit browser-based coding challenges (P1 to P9) open until October 15, 2026.

---

## 3. Engineering Tone & Anti-Slop Rules

- **Zero Decorative Emojis** in UI buttons, status badges, headers, or git commits.
- **Clean light-theme default** (`#ffffff` / `#f8fafc`, `#e2e8f0` borders, `#0f172a` text).
- **Concise, direct tone** without AI cheerleading or filler words.
- Consult `PROJECT_LEARNINGS.md` for complete ground truths (GT-01 through GT-25).

---

## 4. Active Deadlines & Don Norman UX Standards (Source of Truth)

1. **Active Deadlines & Instant Registration:**
   - **Final Festival Registration Deadline:** Officially extended to **Saturday, 17 October 2026, 11:59 PM IST** with instant on-site self-registration.
   - **Creative Competitions (Day 1 Tech Reels, Day 2 Digital Poster, Day 3 Technical Essay):** Submissions open until **Saturday, 17 October 2026, 11:59 PM IST**.
   - **Hackathon Phase 1 Online Window:** Submissions close **Saturday, 17 October 2026, 11:59 PM IST**.
   - **Qiskit Coding Challenges (P1 to P9):** Browser challenges open until **15 October 2026**.

2. **Instant On-Site Registration Architecture (GT-28):**
   - Eliminate all manual approval friction. Any visitor signing in with Google can complete a 30-second on-page profile in `AuthGate.tsx` and receive immediate whitelisted access via `POST /api/auth/register`.
   - Primary site CTAs (Navbar "Join Free" and Hero "Enter Learning Hub") route directly to `https://www.qffsrmap2026.com/learning`.

3. **Don Norman Communication Architecture (MANDATORY):**
   - **Never rely solely on ephemeral toasts** for environmental constraints or deadlines. A toast provides brief entrance feedback, but persistent environmental visibility ("knowledge in the world") is required.
   - When communicating deadline status or temporal changes, maintain:
     - Persistent in-page dashboard banners (`DeadlineExtensionBanner.tsx`).
     - Point-of-action visual signifiers on submission cards and guidelines.
     - Synchronized sidebar status badges.
     - Contextual alert badges on the Public Schedule (`ExploreSchedule.tsx`).
     - Global non-intrusive entrance toasts (`DeadlineToast.tsx`) with localStorage dismissal.
   - Single source of truth must remain 100% synchronized across all schedule, FAQ, curriculum, and competition data files.

---

## 5. Dual-Channel Registration Sync, Google Apps Script Relay & Dynamic Hero (GT-31 & GT-32)

1. **Dual Registration Channels & Synchronized Whitelist (GT-31):**
   - **Channel 1 (Google Form):** External registrations submit to the official form. Google Apps Script (`tools/google_form_webhook.gs`) runs `onFormSubmit`, dispatches the branded HTML pass email via `GmailApp.sendEmail()`, and makes an authenticated HTTP POST to `POST /api/webhooks/google-form` (`x-sync-secret`), which inserts the participant into Supabase `public.registrations`, upserts `public.allowed_emails` (both primary and college email), and primes the Upstash Redis cache `whitelist:${email}`.
   - **Channel 2 (On-Site Self-Registration):** Direct on-site registrations in `AuthGate.tsx` invoke `POST /api/auth/register`. After saving to Supabase and Redis, the route asynchronously triggers the Google Apps Script Web App relay (`GOOGLE_APPS_SCRIPT_WEBAPP_URL`) with a 6-second timeout. Apps Script executes `doPost(e)` to dispatch the exact same branded pass email and automatically logs the registrant into a dedicated `Website_Registrations` sheet tab.
   - **Environment Variables:**
     - `GOOGLE_APPS_SCRIPT_WEBAPP_URL`: Production Web App endpoint (`https://script.google.com/macros/s/AKfycbyD8WBeKCBveUaNrzeYCjdo8p9JzkHKSEEP1UElmM-imWaKZIePqaKbaLx3Yak5W_E31g/exec`).
     - `GOOGLE_FORM_SYNC_SECRET`: Shared webhook secret (`qff-srmap-2026-sync-secret`).

2. **Welcome Pass Email Routing & Don Norman Cognitive Restraint:**
   - The primary CTA button and links in the welcome pass email route directly to:
     👉 **`https://www.qffsrmap2026.com/learning/hackathon`**
   - Directing newly confirmed registrants into the Hackathon Workspace provides an immediate, actionable goal (team formation, roster, problem statements) rather than overwhelming them with the full 5-session curriculum syllabus on `/learning`. Secondary tracks remain 1 click away via header and sidebar navigation.

3. **Homepage Dynamic Session-Aware Hero Architecture (GT-32):**
   - In `components/home/HomeHero.tsx`, client session is passively checked using `getClientSession()` from `@/lib/session-client`.
   - **Unauthenticated / Guest State:**
     - Primary Button: **`Register For Online Events`** → Opens official Google Form in a new tab (`target="_blank" rel="noopener noreferrer"`).
     - Secondary Button: **`Enter Hackathon Arena`** → Routes to `/learning/hackathon`.
   - **Authenticated / Registered State:**
     - The "Register For Online Events" button is automatically hidden.
     - Replaced by a single high-prominence CTA: **`Welcome back, [First Name] · Enter Hackathon Arena`** (or **`Enter Hackathon Arena`**) routing straight to `/learning/hackathon`.

---

## 6. On-Campus General Offline Pass & Gate Verification Desk (GT-34)

1. **Database Schema & Migration:**
   - **Table:** `public.festival_pass_claims`
   - **Migration File:** `supabase/migrations/20261017193500_create_festival_pass_claims.sql`
   - **Columns:**
     - `id`: UUID PRIMARY KEY DEFAULT `gen_random_uuid()`
     - `user_email`: TEXT NOT NULL (indexed)
     - `user_name`: TEXT NOT NULL
     - `pass_tier`: TEXT NOT NULL DEFAULT `'general_offline'` CHECK (`pass_tier IN ('general_offline', 'flagship_offline')`)
     - `transaction_reference`: TEXT NOT NULL UNIQUE (Easebuzz Transaction ID, e.g. `E26101518BKHN3`)
     - `bank_reference`: TEXT (optional secondary bank UTR / reference)
     - `receipt_url`: TEXT NOT NULL (Supabase storage URL under `media/pass-receipts/`)
     - `amount_inr`: NUMERIC(10, 2) NOT NULL DEFAULT `99.00`
     - `status`: TEXT NOT NULL DEFAULT `'claimed_provisional'` CHECK (`status IN ('claimed_provisional', 'verified', 'rejected')`)
     - `institution`: TEXT
     - `contact_phone`: TEXT
     - `admin_notes`: TEXT
     - `checked_in`: BOOLEAN DEFAULT false
     - `checked_in_at`: TIMESTAMPTZ
     - `checked_in_by`: TEXT (staff administrator email)
     - `qr_code_token`: TEXT NOT NULL UNIQUE (`qff26_[16-byte-hex]`)
     - `created_at` / `updated_at`: TIMESTAMPTZ DEFAULT `now()`

2. **Storage Bucket & Security Policies:**
   - Receipts are uploaded to Supabase Storage bucket `media` under folder `pass-receipts/*`.
   - RLS policies restrict participants to viewing only their own passes (`user_email = auth.jwt() ->> 'email'`).
   - Service role (`supabaseAdmin`) maintains full operational authority across API routes.

3. **Strict Hackathon Isolation & Fee Integrity:**
   - **Online Phase is 100% Free:** Registration, sessions, quizzes, creative challenges, and Hackathon Phase 1 require zero payment.
   - **₹99 General Offline Pass:** Grants general admission to campus exhibitions, keynotes, workshops, debates, and open games (Oct 26–30).
   - **₹499 All-Access Flagship Pass:** Reserved exclusively for Hackathon Phase 2 finalists and qualified flagship tracks (includes full 5-day meals and refreshments).
   - **Hackathon Guardrail:** Active hackathon leaders and accepted team members are strictly prohibited from purchasing or claiming the ₹99 pass (`app/api/pass/claim/route.ts` and `components/learning/OnCampusPassCard.tsx`). Finalist teams will be guided directly to the Flagship pass flow upon Phase 1 shortlisting.

4. **Gate Verification Desk & Admin Console:**
   - **Desk URL:** `/verify-pass` (`app/verify-pass/page.tsx`). Supports high-speed camera QR code barcode scanning, pass lookup, and idempotent gate check-in (`POST /api/pass/verify`).
   - **Admin Management:** `/learning/admin` → "Payments: Pass & Certificate" tab (`components/learning/AdminPaymentsManager.tsx`, API `app/api/admin/payments/route.ts`). One review queue for both ₹99 purchases: receipt preview, cross-purchase and duplicate-transaction flags, course progress for certificates, approve / reject (reason required, shown to the participant) / reopen. Approving a certificate mints it. A "To deliver" queue tracks ceremony hand-over or email dispatch (`delivered_at`).

5. **Certificate Payment Flow (GT-35):**
   - Participant: `components/learning/CertificateModal.tsx` → Easebuzz → upload receipt to `media/certificate-receipts/*` → `POST /api/learning/certificate/submit-payment` (txn ID, receipt URL, optional bank ref, `deliveryMode` = `ceremony` | `email`).
   - Table `public.certificate_payment_submissions`, extended by migration `supabase/migrations/20261017220000_certificate_payments_via_easebuzz.sql` (receipt, delivery, reviewer columns; cross-table transaction trigger; storage insert policy).
   - Shared constants (gateway URL, fees, txn validation, receipt upload): `lib/payments.ts`.



