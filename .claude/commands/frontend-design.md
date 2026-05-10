# Frontend Design Pre-Flight

Run this checklist before writing any frontend code. Complete every step — do not skip.

## 1. Screenshot Current State
- Verify the dev server is running on port 3000. If not, start it: `node serve.mjs` in the background.
- Take a before screenshot: `node screenshot.mjs http://localhost:3000 before`
- Read the saved PNG with the Read tool so you can see exactly what the client currently sees.

## 2. Load Brand Assets
Open and review these files before touching any colors, fonts, or logos:
- `brand_assets/Updated Logo.png` — use this logo, never recreate it
- `brand_assets/` — check for any color guides or style references

**Koa Pro Detail brand values (from the existing site):**
- Primary brand color: `#3BBDF5` (bright blue) — used for accents, CTAs, highlights
- Background dark: `#070e18` — primary dark background
- Background mid: `#0d1b2a` — cards, elevated surfaces
- Text primary: `#ffffff`
- Text muted: `rgba(255,255,255,0.5)`
- Font pairing: display headings use tight tracking (`letter-spacing: -0.03em`), body uses `line-height: 1.7`

## 3. Design Standards Checklist
Answer each before writing code:

**Colors**
- [ ] Am I using `#3BBDF5` as the brand accent — not Tailwind indigo/blue defaults?
- [ ] Are backgrounds layered (`#070e18` base → `#0d1b2a` elevated → lighter floating)?

**Typography**
- [ ] Are large headings using tight tracking (`-0.02em` or tighter)?
- [ ] Is body copy at `line-height: 1.7` minimum?
- [ ] Are font sizes intentional — not just default `text-base`?

**Spacing**
- [ ] Am I using consistent spacing tokens — not random Tailwind steps?
- [ ] Is padding/gap consistent within a section?

**Images & Cards**
- [ ] Do all cards in a row have the same height?
- [ ] Are images using `object-fit: cover` and `object-position: center center`?
- [ ] Does every image card have `overflow: hidden` and `min-width: 0` (critical for grid)?
- [ ] Is there a gradient overlay on photo cards (`linear-gradient(to top, rgba(7,14,24,0.95) ...)`)?

**Interactive States**
- [ ] Does every clickable element have hover, focus-visible, and active states?
- [ ] Are transitions only on `transform` and `opacity` — never `transition-all`?

**Layout**
- [ ] Is the grid symmetric? (No orphaned single cards, no mismatched column counts between rows)
- [ ] Does the section look correct at 1440px, 960px, and 375px viewports?

## 4. Identify What's Changing
Write one sentence describing exactly what you are about to change and why. If you cannot state it clearly, do not start coding.

## 5. After Making Changes
- Screenshot again: `node screenshot.mjs http://localhost:3000 after`
- Read the after PNG and compare against the before PNG. Call out specific pixel-level differences.
- Fix any regressions before reporting done.
- Do a second screenshot pass after fixes. Only stop when the output looks right.
