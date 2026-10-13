# Qiskit Fall Fest 2026 — SRM University-AP × IBM
## Technical Foundation

### Route Architecture
The application utilizes the Next.js App Router with the following primary routes established:
- `/` - Home
- `/about` - About
- `/experience` - Experience
- `/schedule` - Schedule
- `/venues` - Venues
- `/team` - Team (Landing Page)
- `/team/website` - Website Team
- `/team/organizing` - Organizing Team
- `/faqs` - FAQs

### Navigation Model
- **Global Navbar:** Navigates between primary routes only. The currently active page must not appear as a destination link.
- **Home/Logo:** Consistently available as a return-to-home destination.
- **Contextual/In-Page Navigation:** Separate from the global navbar.
- **Registration Destination:** The "Join Free" and "Register" CTAs route directly to `/learning` with instant on-site self-registration.

### Ownership & Architecture
- **Shared Components:** Reusable components (e.g., Navbar, Footer, UI primitives) belong in `/components/shared`.
- **Page-Specific Components:** Components unique to a page's composition belong in `/components/pages/[route]`.
- **Team Hierarchy:** `/team` serves as the landing page; `/team/website` contains the Website Team member cards; `/team/organizing` contains the organizing hierarchy (tree/flowchart). Roles are defined by approved content, not invented.
- **Data/Docs:** Structured data goes to `/data`; documentation goes to `/docs`; visual/event references to `/public/references`.

### Future Document Behavior
Documents such as the Privacy Policy, Terms, and Accessibility statements are future destinations and are not part of the core event site implementation right now.

### Responsive, Performance & Security Expectations
- **Responsive Design:** Composition-based (Mobile first codebase, desktop-first precision). Responsive behavior must adapt layout thoughtfully, not merely scale.
- **Performance:** Optimized images, route-level code splitting, minimal client-side JS (avoid unnecessary 'use client').
- **Security:** No hardcoded API keys, no client-side secrets. Authentication is backed by Supabase with server-validated session cookies and Redis-cached authorizations.

### Current Implementation Scope
- Initial Next.js App Router foundation created with React, TypeScript, Tailwind CSS, ESLint, and Prettier configurations.
- Minimal placeholder pages established to verify routing. No visual design applied yet.
