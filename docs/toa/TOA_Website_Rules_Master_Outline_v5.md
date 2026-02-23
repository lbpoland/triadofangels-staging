# Triad of Angels — Website Rules & Master Outline (v5.0)

**Canonical domain:** www.triadofangels.com  
**Hosting:** GitHub Pages (static hosting) + custom domain  
**Site Type:** Static-first, premium cinematic studio platform (Music + Publishing + Games + Apps + Store)

---

## 1) Prime Directive
The site must be:
- Fast
- Accessible
- Stable
- Secure-by-default
- Searchable
- Scalable
- Brand-consistent
- Truthful

**Reality rule:** Any secure feature (accounts, payments, private delivery, leaderboards) must use external providers. Never fake security client-side.

---

## 2) Authority Order
1. This Rules & Master Outline
2. Latest TOA_SITE_MANIFEST__*.json
3. Latest TOA_SITE_BUNDLE__*.md
4. Newer individual files uploaded in-session
5. Live/local behavior and screenshots (QA truth only)

---

## 3) GitHub Pages Constraints (Architecture Law)
- No server-side logic
- No secrets
- No secure private file delivery
- Everything in repo is public

Therefore:
- Pre-rendered static pages are the premium path for SEO + social reliability
- JS enhancement is allowed, but core discovery should not depend on JS where possible
- Payments/auth/leaderboards require external services + privacy disclosures

---

## 4) Full Coverage Audit Rule (No More “Minimum Page” Confusion)
### 4.1 Core Release Gate is a floor, not the full audit
Core regression pages:
- Home, Music, Album, Track, Publishing, Store/Merch, Contact, Privacy

### 4.2 Full Coverage is mandatory for audits
Every audit must cover:
- all HTML pages/routes in the bundle
- all CSS files
- all JS files/modules
- all global systems (nav/theme/search/schema/embeds)
- major asset categories (hero, covers, OG/Twitter, icons)
- list anything not audited + reason

---

## 5) Quality Gates (Definition of Done)
A change is not done unless:
- Core Release Gate pages pass QA
- no regressions are introduced elsewhere
- atomic delivery rules are followed

### 5.1 Performance
Targets (Lighthouse Mobile + Desktop):
- Performance 95–100 (100 where practical)
- Accessibility 100
- SEO 100
- Best Practices 95–100

Core Web Vitals goals:
- LCP <= 2.5s (mobile)
- INP <= 200ms
- CLS <= 0.1

### 5.2 Accessibility
Required:
- skip link on every page
- one main landmark
- visible focus
- keyboard nav
- reduced motion support
- forced-colors support
- accessible labels for icon/buttons
- sensible touch targets on mobile

### 5.3 SEO / Social / Schema
Required on every indexable page:
- unique title
- unique meta description
- canonical absolute URL
- OG tags
- Twitter tags
- valid truthful JSON-LD
- sitemap/robots aligned

### 5.4 Stability
Required:
- zero console errors on key pages
- no broken internal links
- no clipping/overflow bugs in nav/dropdowns/carousels
- friendly invalid-state handling for album/track routes

### 5.5 Security / Privacy / CSP
Required:
- no unsafe HTML injection
- no inline event handlers
- CSP-compatible patterns
- external services minimized and disclosed
- truthful copy about hosting limitations

---

## 6) HTML Standards
Required on every page:
- doctype + lang + viewport
- skip link as first focusable element
- one <main id="main-content">
- one H1 with logical heading structure
- accessible nav landmark
- unique head metadata (title/description/canonical/OG/Twitter)
- truthful page-specific schema where applicable

Dynamic album/track routes may exist temporarily, but premium target is pre-rendered static item pages.

---

## 7) CSS Standards
- Global CSS owns tokens + shared primitives only
- Page CSS owns page-specific styling
- No duplicated patterns without refactor plan
- Dark/light parity required
- Responsive behavior required across phone/tablet/desktop
- No clipped menus/rails
- No hover-only critical actions

---

## 8) JS Standards
- Modular ESM
- Shared utilities separated from page modules
- No unsafe DOM injection
- No inline handlers
- Keyboard + ARIA support for all custom interactive components
- Respect reduced motion
- Avoid scroll/layout jank

---

## 9) Global Systems Doctrine
Must explicitly support and be audited:
- Navigation (desktop + mobile + dropdowns)
- Theme system (dark/light + persistence)
- Carousels / rails (touch + keyboard + labels)
- Search page/system
- Schema/metadata per page type
- 404 page
- Footer/social icon accessibility

---

## 10) Asset Optimization Doctrine
Targets (mobile):
- JS <= 100 KB compressed
- CSS <= 80 KB compressed
- Largest first-view image <= 250 KB
- total page weight ~<= 1 MB where feasible

Rules:
- Prefer WebP (AVIF optional)
- Responsive hero/covers
- width/height or aspect-ratio set
- lazy-load below-the-fold images
- hero remains eager and optimized
- maintain OG/Twitter image set per page type

---

## 11) Device + Browser + Theme QA Doctrine
Every milestone must verify:
### Viewports
- small phone
- S24-class large phone
- tablet portrait
- tablet landscape
- laptop
- desktop

### Browsers
- Chromium
- Firefox
- Safari/iOS-class behavior
- Samsung Internet (recommended)

### Modes
- light
- dark
- reduced motion
- forced-colors

### Systems
- nav/dropdowns
- theme toggle
- carousels/rails
- hero sections
- album/track pages
- footer icons
- search
- embeds
- contact/trust pages

---

## 12) Trust / Privacy / Legal Doctrine
Required trust pages:
- Privacy
- Terms
- Contact
- Accessibility Statement (target required)
- Cookie policy/consent (required if tracking is active)

GitHub Pages cannot securely process forms alone.
Any external form, checkout, auth, analytics, or leaderboard service must be disclosed.

---

## 13) Platform Doctrines (Publishing / Games / Store / Apps)
### Publishing
Premium library taxonomy and item pages with truthful external links.

### Store / Merch
Static catalog hub linking to real commerce destinations (or hosted checkout front-end). No fake secure purchase claims.

### Games
Browser game platform is fully possible on a static site using HTML/CSS/JS, SVG, Canvas, WebAudio, localStorage/IndexedDB, and optional external leaderboard services.
Each game needs:
- landing/details
- controls/help
- performance budget
- accessibility plan

### Apps
Apps hub with structured cards, platform links, metadata, and scalable templates.

---

## 14) Governance / Workflow / Session Contract
Patch sessions must output:
1) ZIP of completed files
2) individual file downloads (preferred)
3) work checklist
4) QA checklist
5) continuation prompt

**Atomic delivery law:** A file is only complete if it is attached in the same response.

Local test/bundle loop (authoritative):
python .\toa_bundle.py --profile chatgpt --clean-lighthouse archive
from:
C:\Users\lbpol\Downloads\website-new\triadofangels
