# MASTER TECHNICAL SEO & GOOGLE SITE NAME STANDARDS
**Document Status:** Living Master Specification & Engineering Protocol  
**Applies to:** All Web Platforms, AI Agents, and Frontend Engineers across projects  
**Benchmark Case Study:** `Friendly Learning SRMAP` (`friendly-learning-srmap.vercel.app`)  
**Current Production Implementation:** `Qiskit Fall Fest SRMAP 2026` (`https://www.qffsrmap2026.com`)

---

## 1. Executive Summary & Root Cause Analysis

### The Google Search Results Phenomenon
When Google indexes web applications, the top line of each organic snippet displays a **Favicon**, followed by the **Site Name**, followed by the **URL breadcrumb**.

Empirical analysis of three production web properties created by the author reveals the exact algorithmic triggers Google uses:

| Web Property | Google Displayed Site Name | Result Evaluation | Root Cause Diagnosis |
| :--- | :--- | :--- | :--- |
| **`friendly-learning-srmap.vercel.app`** | **"Friendly Learning SRMAP"** *(with 4-tier deep sitelinks)* | **PERFECT (Benchmark)** | Served explicit JSON-LD `WebSite` / `WebApplication` schema, explicit `<meta property="og:site_name" content="Friendly Learning SRMAP" />`, brand-prefixed title tags, and pre-rendered static HTML that Googlebot parsed before JavaScript hydration. |
| **`village-calculator.vercel.app`** | **"Vercel"** | **HOST DOMAIN HIJACK (Critical Bug)** | Hosted on a shared `*.vercel.app` subdomain without an explicit `WebSite` JSON-LD schema or `og:site_name`. Lacking brand signals, Google's heuristic defaulted to attributing the parent domain identity (`Vercel`). |
| **`gyankumarsah.com.np`** | **"gyankumarsah.com.np"** | **BARE DOMAIN FALLBACK (Suboptimal)** | Custom top-level domain lacking explicit `WebSite` / `Person` JSON-LD schema with `name: "Gyan Kumar Sah"` and lacking `og:site_name`. Lacking algorithmic confidence that the title was the site name, Google safely fell back to the root hostname. |

---

## 2. The 10 Mandatory Technical SEO Commandments

Every AI agent and frontend developer must adhere to these ten non-negotiable standards when building, refactoring, or deploying any website:

### Commandment 1: Homepage JSON-LD `WebSite` Structured Data
Every homepage `<head>` must include a Schema.org `WebSite` block containing:
- `@type`: `"WebSite"`
- `name`: The exact, human-readable brand name (e.g. `"Qiskit Fall Fest SRMAP 2026"`).
- `alternateName`: An array containing acronyms and recognized variants (e.g. `["QFF SRMAP 2026", "Qiskit Fall Fest 2026", "QFF 2026"]`).
- `url`: The exact canonical homepage URL (e.g. `"https://www.qffsrmap2026.com/"`).

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Qiskit Fall Fest SRMAP 2026",
  "alternateName": ["QFF SRMAP 2026", "Qiskit Fall Fest 2026", "QFF 2026"],
  "url": "https://www.qffsrmap2026.com/"
}
</script>
```

### Commandment 2: Explicit OpenGraph Site Name (`og:site_name`)
Meta property `og:site_name` must be explicitly declared and match the `WebSite.name` character-for-character:
```html
<meta property="og:site_name" content="Qiskit Fall Fest SRMAP 2026" />
```

### Commandment 3: Brand-Prefixed Title Hierarchy
The global title template and default must place the brand name prominently:
- Default: `<title>[BRAND NAME] | [Institutional Anchor] - [Short Catchy Tagline]</title>`
- Template: `%s | [BRAND NAME]`
- Never use generic titles like `Home`, `Welcome`, or `React App`.

### Commandment 4: 48px+ Crisp Brand Favicon Protocol
Googlebot-Image strictly requires a square favicon whose dimensions are a multiple of 48px (e.g. 48x48, 96x96, 144x144, 192x192, 512x512). Without a valid, crawlable icon, Google will display a generic globe icon, degrading click-through rate (CTR):
- `/favicon.ico` (multi-size container: 16x16, 32x32, 48x48)
- `/icon-48.png` (48x48)
- `/icon-192.png` (192x192)
- `/icon.png` (512x512)
- `/apple-touch-icon.png` (180x180)
- `/manifest.json` referencing all icon sizes.

### Commandment 5: Single Canonical Domain Authority
Pick exactly one primary domain. Never allow multiple hostnames (`domain.com`, `www.domain.com`, `domain.vercel.app`, `subdomain.edu.in`) to serve the same content without 301 permanent redirects.
Every page must carry `<link rel="canonical" href="https://[PRIMARY-DOMAIN]/path" />`.

### Commandment 6: Pre-Rendered / Server-Side Crawlability (Zero Empty Shells)
Search engine bots (and social preview crawlers on WhatsApp, LinkedIn, X, Telegram) read the raw initial HTTP response. If an SPA renders an empty `<div id="root"></div>` and injects titles via client-side `useEffect`, crawlers see identical empty pages:
- In **Next.js**: Use Server Components or App Router static pre-rendering (SSG).
- In **Vite / React SPA**: Implement a build-time pre-renderer (such as `prerender.js` in `friendly-learning-srmap`) that bakes static HTML into `dist/`.

### Commandment 7: Noindex Guarding for Non-Live & Thin Pages
Unfinished, coming-soon, authentication, admin, and utility pages must carry:
```html
<meta name="robots" content="noindex, follow" />
```
Indexing placeholder cards ("Coming Soon") damages domain authority and prevents Google from generating sitelinks.

### Commandment 8: Hierarchical BreadcrumbList Structured Data
Every internal subpage must include Schema.org `BreadcrumbList` JSON-LD so Google Search displays clickable breadcrumb trails under search snippets:
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.qffsrmap2026.com/" },
    { "@type": "ListItem", "position": 2, "name": "Experience", "item": "https://www.qffsrmap2026.com/experience" }
  ]
}
```

### Commandment 9: Dynamic, Filtered Sitemaps
Sitemaps (`sitemap.xml`) must:
- Reference only live, 200 OK pages (exclude 404, redirects, and `noindex` pages).
- Assign calibrated priorities (`1.0` for homepage, `0.9` for key event tracks, `0.8` for core directories).
- Include `lastModified` timestamps and `changeFrequency`.
- Be declared explicitly in `robots.txt` (`Sitemap: https://[PRIMARY-DOMAIN]/sitemap.xml`).

### Commandment 10: Entity-Specific Semantic Schemas
Enhance pages with rich entity structured data:
- Homepage: `Organization` (with logo, official URLs, social links) and `EventSeries`.
- FAQs: `FAQPage` (with questions and accepted answers to earn accordion rich snippets).
- Venues: `Place` (with streetAddress, locality, postalCode).
- Schedule / Tracks: `Event` / `EducationEvent` (with startDate, endDate, location, offers).

### Commandment 11: Circular Alpha Matting for Brand Favicons & Medallions
Never ship circular badges or logos trapped inside solid black or colored square boxes:
- Raw assets frequently arrive with black `#000000` padding in the corners.
- Google Search and mobile browser tabs display favicons in circular or free-floating contexts. A black bounding box creates an amateurish, jarring box outline.
- Always apply 4x supersampled anti-aliased circular alpha masking using PIL to convert all exterior pixels into 100% transparent alpha.
- In OpenGraph preview cards (1200x630), let circular medallions float directly on the brand canvas with a soft radial drop shadow and an accent rim (e.g. gold `#B08D57`), never inside a heavy rounded rectangle box.

### Commandment 12: Anti-Fatigue Phrasing for Multi-Tier Schedules
Never publish an overwhelming monolithic date range (such as "October 5–30, 2026") on share cards or snippet descriptions when an event is staggered:
- A 25-day monolithic span misleads prospective attendees into assuming an exhausting daily commitment.
- Always present the clear operational phases: `Online: Oct 5–9 | Offline: Oct 26–30 (Amaravati)`.
- This immediately communicates virtual masterclasses followed by an intensive weekend campus hackathon.

---

## 3. Reference Implementation: Next.js 15 App Router

### `config/seo.ts` (Master SEO Engine)
```ts
export const SITE_CONFIG = {
  brandName: 'Qiskit Fall Fest SRMAP 2026',
  alternateNames: ['QFF SRMAP 2026', 'Qiskit Fall Fest 2026', 'QFF 2026'],
  primaryDomain: 'https://www.qffsrmap2026.com',
  officialEventUrl: 'https://events.srmap.edu.in/event/qiskit-fall-fest-2026/',
  description: '...',
  locale: 'en_US',
};

export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_CONFIG.brandName,
    alternateName: SITE_CONFIG.alternateNames,
    url: SITE_CONFIG.primaryDomain,
  };
}
```

### `app/layout.tsx` (Global Signals & Layout)
```tsx
export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.primaryDomain),
  title: {
    default: `${SITE_CONFIG.brandName} | SRM University-AP - A Decade of Quantum on Cloud`,
    template: `%s | ${SITE_CONFIG.brandName}`,
  },
  description: SITE_CONFIG.description,
  alternates: { canonical: '/' },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    siteName: SITE_CONFIG.brandName,
    title: `${SITE_CONFIG.brandName} | SRM University-AP`,
    url: SITE_CONFIG.primaryDomain,
    type: 'website',
    images: [{ url: `${SITE_CONFIG.primaryDomain}/og-image.png`, width: 1200, height: 630 }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <JsonLd id="schema-website" schema={generateWebSiteSchema()} />
        <JsonLd id="schema-organization" schema={generateOrganizationSchema()} />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

---

## 4. Google Search Console & Verification Checklist

When deploying changes or connecting a site to Google Search Console:
1. **Verification File:** Ensure the Google verification token (e.g. `google[token].html`) is in `public/` and serves with HTTP 200.
2. **Inspect robots.txt:** Verify `https://[PRIMARY-DOMAIN]/robots.txt` contains:
   ```txt
   User-agent: *
   Allow: /
   Disallow: /api/
   Sitemap: https://[PRIMARY-DOMAIN]/sitemap.xml
   ```
3. **Inspect sitemap.xml:** Ensure `https://[PRIMARY-DOMAIN]/sitemap.xml` responds with clean XML listing only production-ready live routes.
4. **Rich Results Test:** Test the homepage on the [Google Rich Results Test](https://search.google.com/test/rich-results) to confirm valid `WebSite` and `Organization` schemas with zero syntax errors.
5. **URL Inspection:** In Google Search Console, submit `https://[PRIMARY-DOMAIN]/` for manual re-indexing.
