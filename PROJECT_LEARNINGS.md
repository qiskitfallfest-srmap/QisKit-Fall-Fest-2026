# PROJECT LEARNINGS & KNOWLEDGE BASE: QISKIT FALL FEST 2026 (WEB PLATFORM)
**Host Institution:** SRM University-AP (Amaravati)  
**Host Designation:** Partner Plus Host  
**Official Website:** [https://www.qffsrmap2026.com/](https://www.qffsrmap2026.com/)  
**Production Web Repository:** [https://github.com/qiskitfallfest-srmap/QisKit-Fall-Fest-2026](https://github.com/qiskitfallfest-srmap/QisKit-Fall-Fest-2026)  
**Companion Planning & Governance Repository:** [https://github.com/sahgyan9/Qiskit-Fall-Fest-SRMAP-2026](https://github.com/sahgyan9/Qiskit-Fall-Fest-SRMAP-2026)  
**Milestone Theme:** A Decade of Quantum on Cloud (Celebrating 10 Years of Cloud Quantum Computing)  
**Current Baseline Date:** 24 September 2026  
**Document Status:** Living Master Source of Truth for all Web Platform Developers and AI Agents  

---

## 1. AI Agent Operating Protocol & Governance (MANDATORY)

Every AI agent working in this codebase must strictly abide by the following operational directives:

1. **The Caution Principle (Never Assume — Always Ask):**
   - This repository houses the public face and digital summit platform of Qiskit Fall Fest 2026.
   - If an event time, speaker name, venue, registration rule, or date is unconfirmed, **never invent details or add placeholder copy**.
   - Cross-check against the companion Planning Repository (`01 _ TECHNICAL & INNOVATION TRACK QFF`) and prompt organizers when in doubt.
2. **Anti-Slop Standards & Engineering Restraint:**
   - **Zero Decorative Emojis:** Never place raw Unicode emojis in code, UI elements, buttons, cards, headers, status badges, toast notifications, error banners, logs, or commit messages (e.g., no emojis like `⚡`, `✨`, `🚀`, `💡`, `✅`, etc.). Use clean SVG icons (such as Lucide) or clean text labels.
   - **Clean Light-Theme Preference:** Default to a crisp, modern light theme (`#ffffff` / `#f8fafc`, subtle borders `#e2e8f0`, legible dark typography `#0f172a`, restrained accents) unless dark theme is explicitly requested. Avoid gratuitous glowing animations or neon halos.
   - **Concise, Functional UI Copy:** Action-oriented, direct labels (`Turn On`, `Refresh`, `Connected`, `Register on Unstop`). Zero corporate AI filler words (*"delve"*, *"tapestry"*, *"landscape"*, *"seamless"*, *"game-changer"*).
   - **Hardware Safety:** Passive monitoring only. Never initiate unsolicited hardware actuation or pulsing.
3. **Route & Architecture Guardrails:**
   - **External Registration Rule:** The "Join/Register" CTA is exclusively an external Unstop destination. Internal routes like `/join`, `/register`, or `/signup` are strictly prohibited.
   - **Component Scoping:** Shared primitives belong in `components/shared/` or `components/ui/`; page-specific compositions belong in `components/pages/[route]/` or `components/[feature]/`.
   - **Data Stores:** All schedules, venue mappings, and event metadata are centralized in `data/`. Do not hardcode static event data inside UI render loops.
4. **Continuous Learning & Logging:**
   - Every AI agent session that implements features, resolves bugs, or updates data **must log its actions** in [Section 6: Chronological Agent Activity Log](#6-chronological-agent-activity-log) before concluding.

---

## 2. Confirmed Source of Truth (Organizer Ground Truths)

The following operational ground truths were directly reviewed, clarified, and frozen with the festival organizers on **24 September 2026**:

| ID | Operational Area | Confirmed Ground Truth / Decision | Rationale & Practical Application |
| :--- | :--- | :--- | :--- |
| **GT-01** | **Repository Ecosystem** | **Dual Repository Architecture:**<br>1. *Planning & Governance:* `sahgyan9/Qiskit-Fall-Fest-SRMAP-2026`<br>2. *Production Web Platform:* `qiskitfallfest-srmap/QisKit-Fall-Fest-2026` | Planning repository holds master documents and rubrics; web platform houses the Next.js site deployed to `qffsrmap2026.com`. |
| **GT-02** | **Event 37 Mode** | **OFFLINE (Physical)**. Conducted in the **Auditorium for 8 hours**. | QCTF (Quantum Capture the Flag) is an on-campus offline competition, not an online CTF. |
| **GT-03** | **Infeasible Events** | **Event 11, Event 32, and Event 53 are officially INFEASIBLE.** | Event 11 (*Hardware Challenges*), Event 32 (*Quantum Go*), and Event 53 (*Quantum Magnetometry*) cannot be supported. |
| **GT-04** | **Event 11 Disposal** | **DROPPED entirely.** | Formally excised from the active portfolio to prevent laboratory resource overcommitments. |
| **GT-05** | **Online Phase Timeline** | **Staggered Two-Tier Structure:**<br>• **Oct 5–9:** Masterclass learning courses & workshops.<br>• **Oct 9–13:** Hackathon Phase 1 problem sprint + online games.<br>• **Oct 13 (11:59 PM IST):** Phase 1 final submission deadline.<br>• **Oct 14–16:** Technical Review Window.<br>• **Oct 17 (Night):** Finalist Announcement (~200 participants). | Masterclasses finish on Oct 9; participants then apply learnings to their hackathon problem statements until Oct 13 while playing casual online games. |
| **GT-06** | **Phase 2 Onsite Hackathon** | **Scheduled for 27–28 October 2026** (24–26 hours in Auditorium). | Slotted within the 26–30 Oct Offline Phase; avoids Day 1 (Oct 26 travel fatigue) and final day (Oct 30 evaluation & closing expo). |
| **GT-07** | **Event 21 Title & Format** | **`QTalk - Question – 2-Minute Quantum Talk`** | Emphasizes direct audience and participant Q&A with speakers. |
| **GT-08** | **Unstop Public Launch** | **Target Date: 25 September 2026.** | Public registration listings and external URLs will be wired once released. |
| **GT-09** | **Campus WiFi Issue** | **Active Investigation with ITKM.** | Team is coordinating directly with SRM ITKM regarding network access and SSL loading issues on campus WiFi. |
| **GT-10** | **Side-by-side Markdown Files** | **Standardized Markdown (`.md`) files** right next to proprietary source documents in planning repository. | Eliminates token waste and supports direct agent ingestion. |
| **GT-11** | **Dynamic LLMs Manifest Synchronization** | **Automated generation and verification of `llms.txt`, `llms-full.txt`, and `public/docs/*.md` via `tools/generate_llms_manifests.py` and `tools/verify_llms_manifests.py`.** | Mandates that whenever schedules, rubrics, curricula, or event cards are updated, agents must recompile and verify the LLM manifest suite. Guarantees zero hallucinations and zero token waste for external search engines and internal agents. |
| **GT-12** | **Technical SEO & Google Site Name Protocol** | **Brand Name strictly locked to `Qiskit Fall Fest SRMAP 2026` across JSON-LD `WebSite` schema, `og:site_name`, and `<title>` prefixes.** | Guarantees Google displays the exact brand name and favicon above the search snippet, preventing host domain hijack ("Vercel") or bare domain fallback. Follows `docs/TECHNICAL_SEO_STANDARDS.md`. |
| **GT-13** | **Official SRM University-AP Event Portal Association** | **Official Institutional Event Listing: `https://events.srmap.edu.in/event/qiskit-fall-fest-2026/`. Primary Web Platform: `https://www.qffsrmap2026.com/`.** | Excises erroneous legacy subdomain placeholders (`qiskitfallfest2026.srmap.edu.in`) and wires university-level endorsement into Organization & Event schemas. |
| **GT-14** | **Circular Alpha Matting for Brand Icons** | **Circular medallions and logos must never be bounded inside arbitrary solid black or colored square boxes.** | Mandates supersampled anti-aliased circular alpha masking to output 100% transparent PNGs/ICOs (`favicon.ico`, `icon.png`, `apple-icon.png`, `qff-srmap-logo-circular.png`). Guarantees Google Search renders a crisp circular icon. |
| **GT-15** | **Two-Tier Staggered Schedule Phrasing** | **Never publish a monolithic 25-day date span (e.g. `Oct 5–30`) on public cards, metadata, or share banners.** | Eliminates attendee fatigue and confusion regarding continuous attendance. Always formulate as: `Online: Oct 5–9 | Offline: Oct 26–30 (Amaravati)`. |

---

## 3. Total Event Classification (59 Active Events)

The active festival portfolio consists of **59 total events**:

```
59 Total Events
├── 38 Offline Events (Campus Phase: 26–30 Oct 2026)
│   ├── Hardware Quantum Tech Expo (1 Event in V/CV/SR)
│   ├── Keynote Speeches (1 Event in Auditorium)
│   ├── Hackathon Phase 2 (1 Event, 24–26h in Auditorium on 27–28 Oct)
│   ├── QCTF – Quantum Capture the Flag (1 Event, 8h in Auditorium)
│   ├── Qescapes (1 Event in CV - Classroom build)
│   ├── Offline Challenges (6 Events in Auditorium)
│   ├── Workshops & Challenges (3 Events in Auditorium)
│   └── Offline Games (24 Interactive Classroom Games)
└── 21 Online Events (Virtual Phase: 5–13 Oct 2026)
    ├── Masterclass Series & Qiskit 101 (10 Sessions / Modules: 5–9 Oct)
    ├── Hackathon Phase 1 Qualification Window (5–13 Oct, closes 11:59 PM IST)
    ├── Online Competitions (Python Coding, ML, Essay, Posters, Reels, Code Golf, Noise Forensics)
    ├── Online Games (10 Events: 9–13 Oct)
    └── Phase 1 Result Declaration (17 Oct, ~200 Qualified Participants)
```

---

## 4. Frontend Route Architecture & Navigation

The application uses the Next.js App Router:

| Route | Purpose | Key Components / Data |
| :--- | :--- | :--- |
| `/` | Summit Homepage | Hero, Decade of Quantum, Event Highlights, Ecosystem, Partners, Countdown |
| `/about` | Event Background & Host Story | SRM University-AP context, IBM partnership, mission pillars |
| `/experience` | Interactive Event Showcase | Categorized visual browser of the 59 festival events (`data/experience-events.ts`) |
| `/schedule` | Master Interactive Schedule | Split view: Online (5–9 Oct) and Offline (26–30 Oct) (`data/onlineSchedule.ts`, `data/offlineSchedule.ts`) |
| `/venues` | Campus Map & Locations | SRM-AP campus atlas and hall directories (`data/campus-locations.ts`) |
| `/team` | Leadership & Organization | Landing directory for organizers, faculty mentors, and advisory boards |
| `/team/website` | Website & Technology Cell | Contributor profile cards for engineering, design, and infrastructure leads |
| `/team/organizing`| Organizing Committee Hierarchy | Structural chart of student leads, faculty coordinators, and cell heads |
| `/faqs` | Frequently Asked Questions | Categorized accordion answers (`data/faqs.ts`) |

---

## 5. Dual Repository Directory Mapping

```
qiskitfallfest-srmap/QisKit-Fall-Fest-2026 (THIS REPO)
├── PROJECT_LEARNINGS.md                                      # Living knowledge base for web platform
├── README.md                                                 # Production documentation for web platform
├── tools/
│   └── convert_documents.py                                  # Document conversion utility
├── public/
│   ├── llms.txt                                              # AI search engine indexer manifest
│   └── robots.txt                                            # Web crawler configuration
├── app/                                                      # Next.js App Router pages and layouts
├── components/                                               # Reusable UI primitives and page components
├── config/                                                   # Global site metadata and navigation items
├── data/                                                     # Centralized schedules, locations, and FAQs
├── hooks/                                                    # Custom React hooks (scroll, media queries)
└── lib/                                                      # Utility functions and class mergers

sahgyan9/Qiskit-Fall-Fest-SRMAP-2026 (PLANNING REPO)
├── 01 _ Technical Programs  Cell/                            # Masterclass curriculum, syllabi, planning
├── 02 _ Hackathon & Competitions Cell/                       # Hackathon Phase 1/2 specs, problem statements, rubrics
└── 03 _ Website & Technology Cell/                           # UI deliverables, content guidelines, and task tracker
```

---

## 6. Chronological Agent Activity Log

| Date & Timestamp | Agent / Model | Action Performed | Key Files Modified / Created | Strategic Context & Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **2026-09-24 22:25** | Antigravity (Gemini 3.8 Flash) | Repository cloned & checked out | `c:\Users\sahgy\Downloads\QisKit-Fall-Fest-2026` | Cloned `qiskitfallfest-srmap/QisKit-Fall-Fest-2026` onto `main` branch. |
| **2026-09-24 22:25** | Antigravity (Gemini 3.8 Flash) | Anti-slop emoji sweep | `components/home/SectionScrollController.tsx` | Removed decorative star symbols from floating scroll controller indicator; verified zero raw emojis across codebase. |
| **2026-09-24 22:26** | Antigravity (Gemini 3.8 Flash) | Initialized web platform governance | `PROJECT_LEARNINGS.md` | Codified GT-01 through GT-09, 59-event breakdown, route architecture, external Unstop CTA rule, and dual-repo index. |
| **2026-09-25 07:46** | Antigravity (Gemini 3.8 Flash) | README accuracy update: clarified ecosystem scale vs host scope | `README.md`, `PROJECT_LEARNINGS.md` | Reconciled phrasing conflation regarding "200 global institutions"; clarified that the platform powers SRM University-AP's flagship edition within IBM Quantum's global 200+ host institution network rather than serving all 200 institutions directly. |
| **2026-09-25 07:57** | Antigravity (Gemini 3.8 Flash) | Comprehensive overhaul and expansion of LLMs manifest suite (llms.txt, llms-full.txt, public/docs/*.md) | `tools/generate_llms_manifests.py`, `tools/verify_llms_manifests.py`, `workflows/update_llms_manifests.md`, `public/llms.txt`, `public/llms-full.txt`, `public/docs/*.md`, `public/robots.txt`, `PROJECT_LEARNINGS.md` | Replaced 39-line stub with llmstxt.org v2 standard index and comprehensive 31k-char llms-full.txt dossier. Built deterministic generation and verification tooling in tools/, authored SOP workflow in workflows/, exported standalone markdown endpoints to public/docs/, updated robots.txt, and synchronized across both web and planning repositories. |
| **2026-09-25 08:33** | Antigravity (Gemini 3.8 Flash) | Comprehensive Technical SEO & Google Site Name optimization | `config/seo.ts`, `components/shared/JsonLd.tsx`, `app/layout.tsx`, `config/page-release.ts`, `app/*/page.tsx`, `app/robots.ts`, `app/sitemap.ts`, `public/robots.txt`, `public/manifest.json`, favicons & OG assets, `docs/TECHNICAL_SEO_STANDARDS.md`, `PROJECT_LEARNINGS.md` | Implemented full Google Site Name architecture (`Qiskit Fall Fest SRMAP 2026`), multi-size 48px+ favicons, JSON-LD schemas (WebSite, Organization, EventSeries, BreadcrumbList, FAQPage), automatic noindex guards on coming-soon pages, synchronized sitemaps and robots, redirected registration paths to official event portal, and authored master documentation for future AI agents. |

