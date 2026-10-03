# Home Experience & Interaction Delivery

**Contributor:** Srihaas  
**Area:** Home Page UI/UX, Interaction Architecture, Theme & Responsive Polish  
**Branch:** `feature/home-navbar-interactions`  
**Date:** October 2026  

---

## 1. Overview & Scope

This release finalizes the complete Home-page experience for the **Qiskit Fall Fest 2026 — SRM University-AP × IBM Quantum** event portal. All primary sections have been polished for editorial aesthetics, liquid-glass visual consistency, precise interaction physics, and accessibility.

---

## 2. Key Implemented Changes by Section

### A. Event Highlights & Host/Ecosystem Cards
- **Single Travelling Edge-Light System**: Reused the original single perimeter-traveling light streak (`#B51F33` / `#EF7481` / `#FFD5DA` in light mode; `#C89236` / `#E8B85D` / `#FFE7A6` in dark mode) orbiting continuously on hover/focus-within after a 450ms delay.
- **Pure Border Geometry**: Used `-webkit-mask` composite technique with `@property --edge-angle` to keep the traveling beam strictly on the 2px border region, completely eliminating interior card washes, radial glows, and background tinting.
- **Unified Liquid-Glass Styling**: Restrained blur, subtle border contrast, and neutral hover physics (`translateY(-4px)` / `scale(1.003)` with neutral box-shadows).
- **Host & Ecosystem**: Refined rotating statement display with ghost dimension reservation to prevent layout shift; improved secondary narrative copy with inline semantic highlights.

### B. Countdown Section
- **Stable Typography**: Refined headline hierarchy to a stable editorial presentation with clean letter-spacing and line-height.
- **Dual-Phase Selector**: Preserved smooth Online Phase (8–10 OCT 2026) and On-Campus Phase (26–30 OCT 2026) switcher with target date computation.
- **Boundary Spacing**: Added ~10px breathing room between Host & Ecosystem and Countdown via Host bottom padding (`clamp(44px, calc(5.5vh + 10px), 86px)`), eliminating harsh seams or unwanted separator stripes.

### C. Hosted At Section
- **Institutional Branding**: Enhanced SRM University-AP Amaravati campus presentation with balanced typography, glassmorphism cards, and refined venue CTA.

### D. BE PART OF IT / Ready to Take Part?
- **Unobstructed Quantum Globe**: Completely removed the competing vertical right-side text block (`PEOPLE / IDEAS / TECHNOLOGY / A BRIGHTER / TOMORROW`), allowing the glowing quantum globe to serve as the clean visual hero across the right 60% of the canvas.
- **Top-Anchored Image Cropping**: Sized desktop section height to `clamp(640px, 72svh, 760px)` (`clamp(660px, 70svh, 780px)` on 1920px+; `clamp(600px, 70svh, 700px)` on laptop) with `object-position: 68% top`, ensuring the upper orbital artwork remains anchored while reducing vertical dead space below the CTA.
- **Editorial Serif Typography**: Replaced generic sans treatment with display serif (`var(--font-serif)`, Playfair Display) using a warm rose/gold gradient (`linear-gradient(108deg, #FFF8F4 0%, #F8E1DD 43%, #F5BBC2 72%, #F08A96 100%)`) with safe fallback color (`#FFF3EF`).
- **Fail-Safe Entrance**: Eliminated JavaScript/IntersectionObserver visibility dependencies on the heading so the title is unconditionally visible on page load, scrolls, and theme toggles.
- **Directional Satin-Light CTA**: Upgraded the Register Now button with a directional satin sweep (`transform: translateX(-140%)` to `translateX(145%)` over 620ms), `-2px` hover lift, and circular arrow chamber interaction.
- **Atmospheric Layering**: Added left-only atmospheric readability gradient and subtle halo behind the globe without dimming the artwork.

### E. Global Layout & Footer
- **Scroll & Overflow Stability**: Configured `overflow-x: clip` and `overflow-y: visible` across `body` and `ScrollSection` to prevent unwanted nested vertical scrollbars while preserving sticky navigation.
- **Interactive Footer**: Enhanced footer links, legal navigation, branding, social interactions, and dark/light mode balance.
- **Singularity Horizon UI**: Adjusted HUD typography, pill borders, and layout coordinates for quantum visual consistency.

---

## 3. Integration & Protected Assets
- **README.md**: Intentionally untouched and preserved in its exact upstream state.
- **Official Functionality**: All routing, registration URLs, and external links remain intact.
