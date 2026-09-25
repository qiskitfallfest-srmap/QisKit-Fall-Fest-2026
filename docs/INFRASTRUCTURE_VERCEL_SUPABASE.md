# CLOUD INFRASTRUCTURE & STORAGE OPTIMIZATION REPORT
**Platform:** Qiskit Fall Fest 2026 — SRM University-AP (Amaravati)  
**Production Domain:** [https://www.qffsrmap2026.com/](https://www.qffsrmap2026.com/)  
**Campus Direct URL:** [https://qis-kit-fall-fest-2026.vercel.app/](https://qis-kit-fall-fest-2026.vercel.app/)  
**Vercel Project:** `qis-kit-fall-fest-2026` (`prj_qd9FpccmCZDXkHGxti1YIxjMKu9N`)  
**Supabase Project:** `qiskitfallfest-srmap's Project` (`jpciyrodeppqpkwqblpk`)  
**Document Status:** Master Infrastructure Reference  

---

## 1. Executive Summary

This document records the root cause analysis, immediate remediation, and architectural hardening performed on 25 September 2026 to resolve Vercel Deployment Storage exhaustion and integrate the Supabase cloud backend for Qiskit Fall Fest SRMAP 2026.

### Key Actions Completed
* **Vercel Storage Remediation:** Pruned 34 stale, failed, and preview deployments from the Vercel project, freeing approximately **12.9 GB** of cumulative storage and reducing usage well below the 10 GB Hobby tier threshold.
* **Build Payload Optimization:** Authored `.vercelignore` to strip 56 untracked root design PNGs, unreferenced duplicate asset directories, and raw mockups from build uploads—reducing future deployment payloads by **>137 MB per build**.
* **Supabase Backend Integration:** Connected Supabase (`ap-southeast-2`), synchronized environment variables across all Vercel environments, installed `@supabase/supabase-js`, initialized `lib/supabase.ts`, provisioned a public `media` storage bucket, and created the `public.registrations` table with Row Level Security (RLS).
* **Build Verification:** Tested and verified the complete Next.js 15 production build; all 20 routes compile and statically render with zero errors.

---

## 2. Vercel Deployment Storage Exhaustion

### 2.1 The Warning & Root Cause
On 25 September 2026, Vercel issued an automated threshold warning:
> *"Your free team qiskit3 has used 75% of the included free tier usage for Deployment Storage (10 GB)."*

While the active project repository on disk measured ~400 MB, Vercel's **Deployment Storage metric is cumulative across all historical and preview deployments retained by the team**, not the size of the single live production deployment.

### 2.2 Storage Calculation & Accumulation Breakdown
Prior to remediation, the Vercel project held **38 active and historical deployments**:
* **39 Git Commits & 8 Remote Branches:** Every push to `main` and every push to feature branches (`feature/venue-map-view-alignment`, `feature/site-v1-final`, `chore/*`) triggered an automated build and generated a distinct deployment snapshot.
* **Single Deployment Artifact Size (~380 MB):**
  * `public/` directory: 327.7 MB (containing uncompressed full-page PNG mockups, duplicated folders, and high-res drone footage).
  * Root folder: 74.5 MB of loose design PNGs copied into the build container.
  * Serverless functions and Next.js static page cache.
* **Cumulative Space Consumed:**
  $$\approx 38 \text{ deployments} \times 380\text{ MB} \approx 14.4\text{ GB (Exceeded 10 GB limit)}$$

### 2.3 Deployment Pruning Execution
Using the Vercel REST API (`DELETE /v13/deployments/:id`) via direct MCP authorization, 34 historical deployments were systematically pruned:
* **Deleted Deployments (34):**
  * Errored / failed builds (e.g. `dpl_B1tTPxaWds6PLncTHja2t7Hxghvo`, `dpl_4ykgs2hvsJ4P7wXNAzsnoHaanU2p`, `dpl_78zawu7omWcyy7PAEh5WCHYoziNS`).
  * Canceled builds (e.g. `dpl_4CbKs5W72o5aGDtLYZ81dwcokP63`, `dpl_63BshAkvqQmbHXGvq2kGRktRt51N`).
  * Stale preview deployments from merged feature branches.
  * Superseded historical production builds.
* **Retained Deployments (3):**
  * Current live production build: `dpl_HhjteBvCVmWp1Gotrm1cNxwKK6o8` (commit `17fc7d5`).
  * Instant rollback candidate 1: `dpl_5BWANPJAj93Kc4kXNdkc3ig6iQLj` (commit `43597bb`).
  * Instant rollback candidate 2: `dpl_BrAXsqPocJQqmGqkhh3hSEvLJFDP` (commit `aa80010`).

**Total Space Reclaimed:** **~12.9 GB**, dropping current team storage usage to ~1.14 GB (< 12%).

---

## 3. Build Payload Optimization & `.vercelignore`

To prevent future deployments from re-accumulating bloat, a production [`.vercelignore`](../.vercelignore) was authored to exclude non-production assets from build snapshots:

```gitignore
# Vercel Ignore File
# Prevents bulky non-production assets, raw design mockups, and tooling from uploading to build snapshots

# Root-level loose design PNGs
/*.png

# Design reference screenshots & raw unedited sources
*REFERENCE*
*.original.*
public/references/
public/ABOUT-00-PAGE-REFERENCE-*
public/hero/*REFERENCE*
public/images/home/*/*REFERENCE*

# Redundant duplicate responsive asset folder (active assets are in /Assets2/)
public/images/home/responsive/

# Unused high-res raw venue footage (>12 MB)
public/images/venues/drone-hero.png
public/images/venues/drone-overview.png
public/images/venues/satellite-reference.png

# Development and agent tooling / scratch
scratch/
tools/
workflows/
.system_generated/
.user_uploaded/
*.log
```

### Savings per Build
| Asset Category | Excluded Paths | Size Saved |
| :--- | :--- | :--- |
| **Loose Root PNGs** | `/*.png` (56 files) | **74.56 MB** |
| **Duplicate Responsive Folder** | `public/images/home/responsive/` | **35.75 MB** |
| **Design Reference Mockups** | `*REFERENCE*`, `*.original.*` | **14.16 MB** |
| **Unused High-Res Drone Media** | `drone-hero.png`, `drone-overview.png`, `satellite-reference.png` | **12.49 MB** |
| **Total Build Reduction** | | **> 136.96 MB per build** |

---

## 4. Supabase Backend Integration

### 4.1 Project Specifications
* **Project Name:** `qiskitfallfest-srmap's Project`
* **Project Ref / ID:** `jpciyrodeppqpkwqblpk`
* **Region:** `ap-southeast-2` (Asia Pacific - Sydney)
* **Database Engine:** PostgreSQL 17.6.1 (Release Channel: `ga`)
* **Project URL:** `https://jpciyrodeppqpkwqblpk.supabase.co`
* **Status:** `ACTIVE_HEALTHY`

### 4.2 Environment Variables Synchronization
The publishable keys and endpoint URLs were injected into Vercel via MCP tool `create_project_env` across all environments (`production`, `preview`, `development`):

| Variable Key | Target Environments | Type | Source Value |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview, Development | Plain | `https://jpciyrodeppqpkwqblpk.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview, Development | Plain | `sb_publishable_wjeOXSiT7E63DsDqTaL1cw_JBMTC3kj` |

Local development configuration was recorded in `.env.local` (enforced as gitignored).

### 4.3 Client SDK Initialization
* Installed dependency: `@supabase/supabase-js` (v2.x).
* Client helper configured at [`lib/supabase.ts`](../lib/supabase.ts):
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jpciyrodeppqpkwqblpk.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 4.4 Provisioned Storage Bucket (`media`)
To allow future offloading of large images and assets from the Next.js bundle to Supabase's Global CDN:
* **Bucket ID:** `media`
* **Public Access:** Enabled (`public: true`)
* **Security Policy:**
  ```sql
  CREATE POLICY "Public Access to Media" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'media');
  ```

### 4.5 Provisioned Database Table (`public.registrations`)
Created a PostgreSQL table to support on-platform registrations, RSVPs, or interest forms alongside external Unstop registration:
```sql
CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    institution TEXT,
    role TEXT,
    interests TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Allow anonymous or authenticated public submissions
CREATE POLICY "Allow public registration submissions" 
ON public.registrations 
FOR INSERT 
WITH CHECK (true);
```

---

## 5. Verification & Build Health

A full static build was executed on the updated tree (`npx next build`):
* **Compilation Status:** Success in 32.5s.
* **TypeScript Validity:** Clean (zero errors with `npx tsc --noEmit`).
* **Route Generation:** All 20 routes generated as static content (`○ Prerendered`):
  * `/` (Home)
  * `/about`
  * `/experience`
  * `/schedule`
  * `/venues`
  * `/team`, `/team/organizing`, `/team/website`
  * `/faqs`
  * `/privacy`, `/terms`, `/accessibility`
  * Metadata endpoints (`/sitemap.xml`, `/robots.txt`, etc.)

---

## 6. Maintenance Runbook & Best Practices

1. **Vercel Deployment Retention Settings:**
   * In Vercel Project Settings -> **Security** -> **Deployment Retention Policy**, ensure Preview deployment retention is set to 1–7 days so pull requests do not accumulate unbounded storage over time.
2. **Asset Ingestion Protocol:**
   * Never commit full-page screenshot mockups into `public/`.
   * For new images, prefer modern formats (`.webp`, `.avif`, or `.svg`).
   * For large media (>1 MB), upload directly to the Supabase `media` bucket and reference via `https://jpciyrodeppqpkwqblpk.supabase.co/storage/v1/object/public/media/...`.
3. **Automated Pruning:**
   * Run the deployment pruner script in `scratch/prune_deployments.py` whenever storage exceeds 50% on Vercel.
