# Image Asset Requirements

> **Status at launch (2026-09-24): partly superseded.** The launch build no longer
> uses the "slot" model described below. Each public project now declares its
> images explicitly, with exact paths and sizes, in `src/data/projects.ts`
> (folders such as `zansihustle/`, `smartfuture/`, `cla/`, `crt/`). A missing
> file fails the build, and **nothing renders a placeholder** in any
> environment. Projects without images are hidden rather than shown with slots.
> Frames follow each image's own ratio (cards and covers stay 16:10), and
> projects that only have phone or browser screenshots get a cover composed by
> the site from those screens.
>
> **Still useful below:** the capture recipes, ratios, formats, file-size caps and
> privacy guidance (§3) for images supplied in future. **No longer accurate:**
> slot file names and paths, the placeholder behaviour, the P0/P1 queue and the
> per-project lists of expected files. For what is live, see
> `docs/CONTENT_MIGRATION.md` §2.1.

This is the production specification for every image the new PSS website uses. It
was taken from the implementation as it stands on **2026-09-23**: components,
Tailwind classes, the `MediaFrame` image component, project data and the
case-study template. Nothing was redesigned, generated, copied or converted to
produce it.

All rendered sizes are **CSS pixels** measured from the actual layout classes.
Image sizes ("master", "source") are **image pixels**.

---

## Contents

1. [At a glance](#1-at-a-glance)
2. [How images work in this build](#2-how-images-work-in-this-build)
3. [Production standards (read before capturing anything)](#3-production-standards)
4. [Slot specifications A–M](#4-slot-specifications)
5. [Home page](#5-home-page)
6. [Work page](#6-work-page)
7. [Case studies (`/projects/[slug]`)](#7-case-studies)
8. [About, Services, Contact, legal pages](#8-about-services-contact-and-legal-pages)
9. [PSS brand assets](#9-pss-brand-assets)
10. [Open Graph / social images](#10-open-graph--social-images)
11. [Client logos](#11-client-logos)
12. [Legacy assets](#12-legacy-assets)
13. [Folder convention](#13-folder-convention)
14. [Problems found](#14-problems-found)
15. [Image production queue](#15-image-production-queue)
16. [Minimum assets required for launch](#16-minimum-assets-required-for-launch)
17. [Ideal assets for full case studies](#17-ideal-assets-for-full-case-studies)

---

## 1. At a glance

**Two kinds of asset.** Everything in this document is one of these:

| Type | What it is | Where it is needed |
|---|---|---|
| **RAW** | A real screenshot captured at the specified size and ratio, then only cropped or scaled. It has no device frame, no background and no edits to the UI. The website draws the frame itself: rounded corners, a hairline border and a shadow. | Every screenshot slot: case-study galleries, platform sections, and all six ZansiHustle ecosystem slots |
| **DESIGNER COMPOSITE** | Real screenshots arranged by a designer on a designed background, for example a desktop screen with a phone beside it. | **Project covers** for the flagship and Home Selected Work projects, and the **default social image**. Nothing else |

**The findings that change the brief:**

- **The Home "flagship ecosystem visual" is not one image.** It is an HTML/CSS
  diagram (hub → four products → foundation) with **six separate RAW screenshot
  slots**. The connectors, labels and pillar names are drawn in code. The one
  place for a single composed ZansiHustle ecosystem image is the **ZansiHustle
  cover**. That cover appears on the Work page, at the top of the case study, and
  when the case study is shared on social media. See §5.2.
- **No separate mobile artwork is needed, and none is supported.** Each slot takes
  one file at every breakpoint; the code has no art direction.
- **Covers are 16:10 everywhere.** Cards and the case-study hero both show the
  whole file. (The hero originally cropped covers to 16:9; that was changed on
  2026-09-23, see §14.1.) See slot A.
- **Nothing is ever stretched.** Every frame uses `object-fit: cover` anchored
  top-centre. A file with the wrong ratio loses its sides if it is too wide, or
  its bottom if it is too tall.
- **Client logos, testimonial avatars and client marks are not rendered anywhere**
  in the current build. None are required. See §11.
- **Services, Contact and the legal pages have no image slots and don't need
  any.** About has one optional founder portrait.

**Ratios used by the site:**

| Use | Ratio | Master size |
|---|---|---|
| Project cover (cards) | 16:10 | 2560 × 1600 |
| Project cover (case-study hero) | 16:10, the whole file | (same file) |
| Desktop screenshot | 16:9 | 2560 × 1440 |
| Ecosystem product tile | 16:10 | 1280 × 800 |
| Ecosystem hub | 16:9 | 1920 × 1080 |
| Ecosystem foundation (admin) | 16:9 | 1600 × 900 |
| Phone screenshot | 9:16 | 1080 × 1920 |
| Founder portrait | 1:1 | 800 × 800 |
| Default social image | 1.91:1 | 1200 × 630 |

**Counts:**

| | Count |
|---|---|
| Distinct slot types (A–M in §4) | 13 |
| Project image slots declared in the data (17 public projects) | 141 |
| …of which the current template can actually render | 124 (17 never render; see §14.3) |
| Assets in this plan: P0 · P1 · P2 | 18 · 41 · 25 |

---

## 2. How images work in this build

- **One component.** Every product image goes through `MediaFrame`
  (`src/components/media/MediaFrame.tsx`). It renders `next/image` in `fill` mode
  with `object-cover object-top`. Next.js serves AVIF or WebP at quality 75 and
  at the width the layout needs. Images load lazily unless marked `preload`.
- **Files are found by name at build time** (`src/lib/media.ts`). To fill a slot,
  put a file at its path under `public/`. The extension is flexible: a slot
  declared as `cover.png` is satisfied by `cover.avif`, `.webp`, `.png`, `.jpg`
  or `.jpeg`.
  - The lookup order is: exact name, then `.avif`, `.webp`, `.png`, `.jpg`, `.jpeg`.
  - **Keep exactly one file per slot name.** If `cover.png` and `cover.webp` both
    exist, the first match wins without any warning.
  - An SVG is only matched when the data names the `.svg` file exactly.
- **You can test locally.** Run `npm run dev`, drop a file in and refresh. The
  development server re-checks files on every request.
- **Missing files never show as broken images.**
  - **Production:** a card without a cover shows a navy branded panel with the
    project name. Every other missing image is simply left out, and a gallery
    with no images doesn't render at all.
  - **Development and Vercel preview:** a dashed placeholder shows the expected
    file path.
  - Placeholder labels show the frame's real ratio and the master size for that
    ratio from §1 (corrected on 2026-09-23, §14.2). Where this document gives a
    smaller master for a slot (the ecosystem hub and foundation), either size
    works.
- **Visitors never download the source file**, because `next/image` re-encodes
  it. The one exception is the cover when a case study is shared on social
  media (§10). The file-size caps in §3.5 are therefore mainly about keeping the
  repository and build lean.
- **Draft projects are hidden in production.** SmartFuture, DailyRise, HypeGrid,
  AltoCoins, TNXOne and ZansiTech stay hidden until PSS supplies their facts, so
  their images only go live once the project is published. Preview deployments
  already show them.

---

## 3. Production standards

### 3.1 Content, consent and privacy (every asset)

- **Real, current software only.** No mock interfaces, no retouched UI and no
  features that don't exist. Composites may only contain real captures.
- **No real personal information.** This is a legal requirement under POPIA.
  - Hidden information includes names, phone numbers, email addresses, ID
    numbers, street addresses, account balances, order histories and driver or
    customer locations.
  - Capture from a staging or demo account with realistic seeded data, inside
    the real application.
  - Don't rely on blur or black bars: large redactions look unfinished.
  - Logistics (ZansiDispatch), admin, analytics and finance screens need the
    most care.
- **Client approval.** Every published screen needs the client's consent. Consent
  is still to be re-confirmed per project; see `docs/CONTENT_MIGRATION.md` §3.
- **Clean captures.** Before capturing, remove staging banners, cookie notices,
  browser extensions, debug toolbars, toasts, scrollbars and the mouse cursor.
- **Colour and metadata.** Use sRGB, 8-bit colour, and strip EXIF and other
  metadata.
- **Consistent theme.** Use one theme per product (light or dark, whichever the
  product actually ships with) across all of its screens.

### 3.2 Desktop screenshots (RAW)

- **Ratio: exactly 16:9.**
  - Don't use a maximised browser window. Its viewport is roughly 1.9–2.1:1, so
    4–12% would be cut from each side, usually the sidebar and the right-hand
    controls.
  - Don't use 16:10 for gallery screens. The frame is 16:9, so the bottom 10%
    would be cut.
- **Capture recipe (Chrome):**
  1. Open DevTools and switch on the device toolbar.
  2. Choose "Responsive" and set **1440 × 810** with **device pixel ratio 2**.
  3. From the ⋮ menu, choose **Capture screenshot**. This gives 2880 × 1620.
  4. Resize to **2560 × 1440**.

  If the product's desktop layout needs a wider viewport, use 1600 × 900 at
  DPR 2 instead (3200 × 1800), then resize to 2560 × 1440.
- **Why 1440 CSS px wide.** Gallery tiles are about 654 CSS px wide, so a
  1440-wide layout shows at about 45% scale and its text stays legible. A
  1920-wide layout drops to about 34% and the text becomes illegible.
- **Size.** The master is **2560 × 1440**; the minimum accepted is 1920 × 1080.
- **Viewport only.** Don't use full-page (scrolling) captures: the frames are a
  fixed 16:9 and anchored to the top, so the rest would be cut off.
- **No chrome.** No browser toolbar, OS window or device frame. The site draws
  the frame. The top of the screen (app header and navigation) is always
  visible; if anything is lost, it is the bottom edge.

### 3.3 Mobile screenshots (RAW)

- **Ratio: exactly 9:16** (1080 × 1920).
  - Modern phones capture at about 9:19.5–9:20 (for example 1170 × 2532 or
    1080 × 2400).
  - In the site's 9:16 frame, the bottom 18–20% of such a capture is cut off.
    That is usually the tab bar.
- **Capture recipes:**
  - **Web / PWA:** DevTools device toolbar at **360 × 640, DPR 3**, which gives
    1080 × 1920.
  - **Native Android:** an emulator with a **1080 × 1920 (16:9) hardware
    profile**, such as a Pixel 2-class device. Enable System UI demo mode for a
    clean status bar.
  - **Native iOS:** the **iPhone SE (3rd generation) simulator**, which gives
    750 × 1334 (9:16). Use it as-is.
  - **An existing tall screenshot:** crop it to 9:16 by hand and decide what to
    keep. For example, drop the status bar and top header to keep a bottom tab
    bar. Never stretch or squash.
- **Size.** The master is **1080 × 1920**; the minimum is 750 × 1334.
- **No device frames.** The site shows phone screens as rounded panels with a
  corner radius of 20–24 CSS px, about 60–90 px on a 1080-wide file.
  - Keep critical UI **at least 90 px** away from the two top corners.
  - A clean status bar is fine, but its corner icons may be clipped slightly.
- **Never put a portrait screenshot into a landscape slot.** Phones appear in a
  landscape composition only inside covers (slot A).

### 3.4 Designer composites (covers and the social image)

- **Input.** Use only RAW captures made to §3.2 and §3.3.
- **Visual language:** match the site.
  - **Background:** deep navy ink (`#030a16` → `#0d1f38`), or a deep tone taken
    from the product's own brand palette.
  - **Accents:** a restrained blue/cyan glow (`#167fc5`, `#0c9dde`, `#31bfff`).
    A faint technical grid is optional.
  - **Avoid:**
    - stock imagery, people, hands or desks
    - 3D device renders, isometric or perspective tilts
    - Bootstrap-style gradients or waves
    - anything that looks like a template
- **Layout.**
  - Screens are **front-on and flat**, with soft shadows only.
  - Device frames are minimal and neutral: a thin window or laptop frame with
    **no fake URL bar**, and a plain phone outline.
  - Use **the same frame style and the same device scale on every project**, so
    Selected Work reads as one set.
- **No baked-in text:** no headline, tagline, project name or PSS logo. The card
  and the page show the name and copy in HTML right beside the image. Text that
  is part of the real UI is fine.
- **One focal screen**, and at most **three devices**. The ZansiHustle cover is
  the exception and may use up to five screens.
  - The composite must still read at **356 × 222 CSS px** on a phone.
  - A phone should take up **at least 22% of the canvas width**, which is about
    80 CSS px on a mobile card.
- **Opaque.** No transparency anywhere.

### 3.5 Formats and file-size caps (source files in `public/`)

| Asset | Format | Cap |
|---|---|---|
| Cover 2560 × 1600 (slot A) | **JPG, quality 85–90.** WebP is fine once per-project social images exist (§10.3). **Never AVIF.** | 700 KB |
| Desktop screenshot 2560 × 1440 (F, H) | WebP q90 (lossless if text shows artefacts) | 450 KB |
| Phone screenshot 1080 × 1920 (D, G, I) | WebP q90 | 300 KB |
| Ecosystem hub 1920 × 1080 (B) | WebP q90 | 300 KB |
| Ecosystem tile 1280 × 800 (C) | WebP q90 | 200 KB |
| Ecosystem foundation 1600 × 900 (E) | WebP q90 | 250 KB |
| Founder portrait 800 × 800 (J) | WebP q85 or JPG | 150 KB |
| Default social image 1200 × 630 (K) | **PNG or JPG only.** The file convention rejects WebP. | 300 KB |
| `favicon.ico`, `icon.png`, `apple-icon.png` (L) | ICO / PNG | 15 KB / 50 KB / 20 KB |

Why covers are JPG: the case-study page uses the cover file itself as its social
preview image, and it is served unconverted (§10.2). JPG is the one format every
social scraper accepts. Next.js still delivers AVIF or WebP to visitors, so JPG
costs nothing on the page.

### 3.6 Naming and handover

- **Use the exact base names in this document**, because they are what the data
  expects. Everything is lowercase with hyphens and no spaces.
- **Layered masters** (PSD, Figma) must stay **outside `public/`**. Everything in
  `public/` is deployed and can be reached at a public URL.
- **Supply one line of alt text per image**, saying what the screen shows, for
  example "ZansiDispatch live delivery map with the active driver list". The
  data's current alt texts are generic placeholders such as "screenshot 2 of 6".

---

## 4. Slot specifications

**Reference viewports:**

| Name | Width | Notes |
|---|---|---|
| Desktop | 1440 | Identical at every width ≥ 1408 (container max 88rem minus 32 px gutters = 1344 CSS px of content) |
| Desktop-S | 1024 | Where the desktop grids start |
| Tablet | 768 | |
| Tablet-L | 1023 | The widest single-column layout. Several slots render *largest* here |
| Mobile | 390 | |

Sizes are measured inside the 1 px frame border. For a sharp result the file
needs about 2× the CSS size on desktop and tablet, and about 3× on phones. The
masters below meet that.

### A — Project cover

| Field | Specification |
|---|---|
| Pages · sections | Home › Selected Work · Work › grid · Case study › hero (top of the Overview section) and Related projects · the case-study social preview |
| Purpose | The one image that represents a project everywhere it is listed |
| Projects | Every public project (per-project list in §5.3, §6 and §7.3) |
| Path | `public/images/projects/<slug>/cover.jpg` |
| Desktop 1440 · 1024 | Feature card **762 × 476** · 538 × 336. Standard card **642 × 401** · 450 × 281. Related card 419 × 262 · 291 × 182. **Case-study hero 1342 × 839** · 958 × 599 |
| Tablet 768 · 1023 | Feature card 718 × 449 · **973 × 608** (the largest card render). Standard card 338 × 211 · 466 × 291 (717 × 448 at 767 px, one column). Related card 330 × 206 · 458 × 286. Hero 718 × 449 · 973 × 608 |
| Mobile 390 | Every card and the hero 356 × 222 |
| Aspect ratio | **16:10**, the whole file, everywhere it appears |
| Master | **2560 × 1600** (minimum 2000 × 1250) |
| Type | **DESIGNER COMPOSITE** for the flagship, the Home Selected Work projects and TNXOne. **RAW 16:10** is acceptable for secondary projects (capture at 1440 × 900 with DPR 2, then resize 2880 × 1800 → 2560 × 1600) |
| Format | JPG q85–90 (§3.5) |
| Fit · position | `cover` · top-centre |
| Transparency | **No.** Transparent pixels would show the navy hero at the top and white page at the bottom of the case-study frame |
| Next Image | Yes (already implemented) |
| Priority | `preload` on its case-study page (implemented) and on the Work page's first card (implemented). Lazy on Home, where Selected Work is below the fold |
| Responsive art | One file. No mobile variant is supported or needed |
| Max file size | 700 KB |

**Safe zones on the 2560 × 1600 master:**

```
┌─────────────────────────────────────────────── 2560 ─┐
│   80 px margin (hover zoom, rounded corners)         │
│  ┌───────────────────────────────────────────────┐   │
│  │                                               │   │
│  │   ESSENTIAL CONTENT  x 80–2480, y 80–1520     │   │
│  │                                               │   │
│  └───────────────────────────────────────────────┘   │
│   Devices may bleed off the bottom edge.             │  1600
└──────────────────────────────────────────────────────┘
```

- **Keep the 150 × 150 px corner squares free of detail.** On a 356 px phone
  card the 20 px corner radius clips about 6% at each corner.
- **Devices may be anchored to the bottom edge and bleed off it.** Nothing crops
  a 16:10 cover, so this is a composition choice, not a requirement.
- **No text overlays** are rendered on covers in production, so no text-safe
  area is needed. A "Draft" badge sits at the top left, but only on preview
  deployments.
- **On the case-study page, the cover straddles two backgrounds.** Its top 144
  CSS px (176 px at ≥ 640) sit over the navy hero and the rest over white. A
  dark cover background bridges the two cleanly.
- **Cards zoom to 102.5% on hover.** This is covered by the 80 px margin.

### B — Ecosystem hub (ZansiHustle core platform)

| Field | Specification |
|---|---|
| Pages · sections | Home › Flagship ecosystem · ZansiHustle case study › The ecosystem (the same component) |
| Purpose | Shows the core ZansiHustle marketplace inside the "Core platform" hub panel |
| Project | ZansiHustle |
| Path | `public/images/projects/zansihustle/ecosystem-hub.webp` |
| Desktop 1440 · 1024 | **540 × 304**, beside the hub title · 503 × 283 |
| Tablet 768 · 1023 | 652 × 367 (below the title) · **907 × 510** |
| Mobile 390 | 306 × 172 |
| Aspect ratio | 16:9 |
| Master | **1920 × 1080** (a downscale of a 2560 × 1440 RAW) |
| Type | RAW: the marketplace's main public screen, front page or browse view |
| Format · cap | WebP q90 · 300 KB |
| Fit · position | `cover` · top-centre |
| Transparency | No |
| Next Image | Yes |
| Priority | Lazy (below the fold) |
| Responsive art | One file |
| Notes | Can be the same capture as `desktop-01` (§7.3), exported twice under both names |

### C — Ecosystem product tile (desktop products)

| Field | Specification |
|---|---|
| Pages · sections | Home › Flagship ecosystem · ZansiHustle case study › The ecosystem |
| Purpose | One recognisable view of each connected product |
| Project · paths | ZansiHustle: `ecosystem-zansitech.webp`, `ecosystem-zansidispatch.webp`, `ecosystem-zansipulse.webp` in `public/images/projects/zansihustle/` |
| Desktop 1440 · 1024 | **280 × 175** (248 × 155 at 1280) · 184 × 115 |
| Tablet 768 · 1023 | 308 × 192 (2 × 2 grid) · **436 × 272** |
| Mobile 390 | 278 × 174 (single column with a spine) |
| Aspect ratio | **16:10.** The data calls the slot "desktop", but the tile stage is 16:10, so a 16:9 file would lose about 5% on each side |
| Master | **1280 × 800** |
| Type | **RAW, zoomed crop.** From a 2560 × 1440 RAW, crop the most characteristic **1280 × 800 region** at 1:1: for example the map and driver list, the main chart, or the product grid. Don't use the whole screen, because at 280 CSS px a full dashboard can't be read |
| Format · cap | WebP q90 · 200 KB |
| Fit · position | `cover` · top-centre |
| Transparency | No |
| Next Image | Yes |
| Priority | Lazy |
| Responsive art | One file |
| Notes | Order on desktop, left to right: Mobile App (slot D), ZansiTech, ZansiDispatch, ZansiPulse. Choose crops that look different from each other (colour, structure) so the four tiles read as four products |

### D — Ecosystem product tile (mobile app)

| Field | Specification |
|---|---|
| Pages · sections | Home › Flagship ecosystem · ZansiHustle case study › The ecosystem |
| Purpose | The ZansiHustle mobile app, shown as a phone screen centred inside a 16:10 tile |
| Project · path | ZansiHustle: `public/images/projects/zansihustle/ecosystem-mobile-app.webp` |
| Desktop 1440 · 1024 | Phone **85 × 151** · 51 × 91, inside a 280 × 175 or 184 × 115 dark stage |
| Tablet 768 · 1023 | 94 × 168 · 140 × 248 |
| Mobile 390 | 84 × 150 |
| Aspect ratio | 9:16 |
| Master | **1080 × 1920** |
| Type | RAW phone screenshot (§3.3). The code centres it on the dark stage, so no composite is needed |
| Format · cap | WebP q90 · 300 KB |
| Fit · position | `cover` · top-centre, with an 8 px corner radius |
| Transparency | No |
| Next Image | Yes (`sizes="160px"`) |
| Priority | Lazy |
| Responsive art | One file |
| Notes | At this size the phone works as an icon, and its detail can't be read. Choose a screen with a **strong, recognisable shape and colour**, such as a home screen with imagery or bold cards. Avoid login screens and text lists. It can be the same capture as `mobile-01` |

### E — Ecosystem foundation (Admin & Backend)

| Field | Specification |
|---|---|
| Pages · sections | Home › Flagship ecosystem · ZansiHustle case study › The ecosystem |
| Purpose | Centralised operations: the admin portal |
| Project · path | ZansiHustle: `public/images/projects/zansihustle/ecosystem-admin.webp` |
| Desktop (≥ 1024) | **318 × 179**, to the right of the foundation text |
| Tablet (640–1023) | 254 × 143 |
| Mobile 390 | 306 × 172, full width below the text. Up to about 555 × 312 on screens 600–639 px wide |
| Aspect ratio | 16:9 |
| Master | **1600 × 900** |
| Type | RAW: the admin overview. Choose a clearly structured dashboard (cards, charts) rather than dense tables. A zoomed 16:9 crop is fine |
| Format · cap | WebP q90 · 250 KB |
| Fit · position | `cover` · top-centre |
| Transparency | No |
| Next Image | Yes |
| Priority | Lazy |
| Responsive art | One file |
| Notes | Admin screens are the most likely to contain personal data (§3.1) |

### F — Case-study desktop screen (Selected screens gallery)

| Field | Specification |
|---|---|
| Pages · sections | Case study › "Selected screens · Inside the product" |
| Purpose | The real product at a readable size |
| Paths | New projects: `public/images/projects/<slug>/desktop-01.webp` … `desktop-03.webp`. Migrated projects: `…/<slug>/web-1.webp` … `web-N.webp` |
| Desktop 1440 · 1024 | First image of an odd-numbered set is **full width, 1342 × 755** · 958 × 539. The rest are **half width, 654 × 368** · 462 × 260 |
| Tablet 768 · 1023 | Full width 718 × 404 · 973 × 547. Half width 346 × 195 · 474 × 266 |
| Mobile 390 | 356 × 200, stacked |
| Aspect ratio | 16:9 |
| Master | **2560 × 1440** (minimum 1920 × 1080) |
| Type | RAW (§3.2) |
| Format · cap | WebP q90 · 450 KB |
| Fit · position | `cover` · top-centre (the top of the screen is always kept) |
| Transparency | No |
| Next Image | Yes |
| Priority | Lazy |
| Responsive art | One file |
| Notes | **Supply 3.** Three gives the layout's intended rhythm: one full-width screen, then two side by side. Make `-01` the strongest screen, because it is shown largest. An even count removes the full-width hero screen. See §14.5 on the first screen's current softness |

### G — Case-study mobile screen (Selected screens gallery)

| Field | Specification |
|---|---|
| Pages · sections | Case study › Selected screens (a phone row below the desktop screens) |
| Purpose | The mobile experience |
| Paths | `public/images/projects/<slug>/mobile-01.webp` … `mobile-03.webp` (ApexGO uses `mobile-1` … `mobile-4`) |
| Desktop 1440 · 1024 | **310 × 551**, four across · 214 × 380 |
| Tablet 768 · 1023 | 225 × 399 · 310 × 551, three across |
| Mobile 390 | 167 × 297, two across |
| Aspect ratio | 9:16 |
| Master | **1080 × 1920** (minimum 750 × 1334) |
| Type | RAW (§3.3). The site renders the rounded phone panel (24 px radius), so don't add a device frame |
| Format · cap | WebP q90 · 300 KB |
| Fit · position | `cover` · top-centre |
| Transparency | No |
| Next Image | Yes |
| Priority | Lazy |
| Responsive art | One file |
| Notes | The data has **3 slots**, but the desktop row holds 4, so three leaves an empty fourth column. **Recommended: supply 4** and add a `mobile-04` slot, which is a one-line data change in `standardGallery()` (not made). Four fills the desktop row and the 2 × 2 phone grid. Only supply mobile screens for products that really have a mobile app or a meaningful mobile UI |

### H — Platform section lead, desktop (deliverables)

| Field | Specification |
|---|---|
| Pages · sections | Case study › "Platform by platform · How it fits together". Each platform block shows copy beside **one** image |
| Purpose | The key screen of one platform, such as the Ovulae Portal or Website |
| Paths | `…/ovulae/portal-1.webp`, `…/ovulae/website-1.webp`, `…/catalyst-risk-tool/desktop-cover.webp`, and the optional `design-cover` files |
| Desktop 1440 · 1024 | **759 × 427** · 535 × 301 |
| Tablet 768 · 1023 | 718 × 404 · 973 × 547 |
| Mobile 390 | 356 × 200 |
| Aspect ratio | 16:9 |
| Master | 2560 × 1440 |
| Type | RAW |
| Format · cap | WebP q90 · 450 KB |
| Fit · position | `cover` · top-centre |
| Transparency | No |
| Next Image | Yes |
| Priority | Lazy |
| Responsive art | One file |
| Notes | **Only the first image of each platform block is shown** (§14.3). Supply exactly one per block |

### I — Platform section lead, mobile (deliverables)

| Field | Specification |
|---|---|
| Pages · sections | Case study › Platform by platform, when the block's first image is a phone screen |
| Purpose | The key screen of a mobile app (Ovulae App, CPMA Mobile App, MetaPOS POS app, CRT app) |
| Paths | `…/ovulae/mobile-1.webp`, `…/cpma/mobile-1.webp`, `…/metapos/mobile-1.webp`, `…/catalyst-risk-tool/mobile-1.webp` |
| Desktop (≥ 1024) | **382 × 679**, centred in the image column |
| Tablet · Mobile | 318 × 565 |
| Aspect ratio | 9:16 |
| Master | 1080 × 1920 |
| Type | RAW. The portrait screen is rendered as a phone panel by the code |
| Format · cap | WebP q90 · 300 KB |
| Fit · position | `cover` · top-centre, with a 20 px corner radius |
| Transparency | No |
| Next Image | Yes |
| Priority | Lazy |
| Responsive art | One file |
| Notes | **Do not supply the legacy `mobile-cover` files** (landscape phone composites) for CPMA, MetaPOS or CRT. While `mobile-cover` is missing, production automatically leads with `mobile-1` in portrait, which is the cleaner result and needs no designer work. See §7.4 |

### J — Founder portrait (optional)

| Field | Specification |
|---|---|
| Page · section | About › Leadership |
| Purpose | Supporting credibility beside the founder paragraph |
| Path | `public/images/people/proficient-mkansi.webp` |
| Desktop · Tablet (≥ 768) | **238 × 238** |
| Mobile | 190 × 190 |
| Aspect ratio | 1:1 |
| Master | 800 × 800 |
| Type | A real photograph, cropped square with the face in the upper third. Not a composite, not stock |
| Format · cap | WebP q85 or JPG · 150 KB |
| Fit · position | `cover` · top-centre. A 3:4 original would lose its bottom quarter automatically, so crop by hand instead |
| Transparency | No |
| Next Image | Yes (`sizes="240px"`) |
| Priority | Lazy |
| Responsive art | One file |
| Notes | **Optional.** In production the section is complete without it, because the portrait column disappears. Use it only if a current, professional portrait exists. The legacy `images/director3.webp` (1536 × 2048) needs PSS to confirm it is still current |

### K — Default social image

| Field | Specification |
|---|---|
| Where it shows | Link previews on LinkedIn, WhatsApp, Facebook and X |
| Path | `src/app/opengraph-image.png`, plus `src/app/opengraph-image.alt.txt` containing "Proficient Software Solutions" |
| Size | **1200 × 630** (1.91:1) |
| Type | DESIGNER COMPOSITE: the existing PSS logo, unmodified, on the site's navy with a restrained glow or grid. An optional short line of approved copy, such as the hero headline "Software That Moves Business Forward." No stats and no claims |
| Format · cap | PNG or JPG, sRGB · 300 KB (larger previews are commonly reported to be skipped by WhatsApp) |
| Safe zones | Keep everything inside the central **1080 × 510**. Keep the **logo inside the central 630 × 630 square**, because X's small card and some chat apps crop to a centred square, and the logo must carry the image on its own |
| Next Image | No (a metadata file convention) |
| Notes | ⚠ As implemented, this file would only appear on the **Home** page (§14.6). A small code change is needed before other pages use it |

### L — Favicon and app icons

| File | Size | Notes |
|---|---|---|
| `src/app/favicon.ico` | 16, 32 and 48 px in one ICO | Transparent. The mark must stay legible at 16 px |
| `src/app/icon.png` | 512 × 512 | Transparent. The mark fills about 80% of the width, optically centred |
| `src/app/apple-icon.png` | 180 × 180 | **Opaque `#030a16` background.** iOS turns transparency into black and adds its own rounded corners, so don't round them. The mark fills about 70% of the width |

- **The mark.** Derive it from the **existing logo artwork only**, cropped and
  never redrawn or recoloured. The wide logo can't work at 16–32 px.
  - The natural candidate is the `</>` glyph group on the left of `Logo.png`.
  - **PSS must approve the mark before anything is produced.**
  - Supply `icon.svg` too, but only if an official vector exists.
- **Wiring.** Next.js adds these files to every page automatically. None exist
  today, so browser tabs show a generic icon.

### M — PSS logo (existing: no new work)

`public/images/brand/Logo.png` is 1488 × 354, a transparent PNG with blue marks
only, so it works on both light and dark backgrounds. It is rendered through
`next/image`:

| Where | Rendered height × width |
|---|---|
| Header | 28 × 118 (mobile) · 32 × 135 (≥ 1024), preloaded |
| Footer | 32 × 135 |
| Home hero architecture panel | 36–44 × 151–185 |
| Contact-form notification email | 120 × 29, as a hosted absolute URL (not `next/image`) |
| Organization structured data | `logo` URL |

The source is at least 8× every display size. **Keep it unchanged.** An official
SVG of the same artwork would be a nice-to-have, never a redraw.

---

## 5. Home page

Section order, with imagery:

| Section | Images |
|---|---|
| Navigation | Logo (M) |
| Hero + architecture visual | **None**, apart from the logo in the centre panel. The visual is CSS/SVG and approved; no screenshots belong in the hero |
| Credibility band | None. It deliberately has no partner logos |
| **Flagship ecosystem (ZansiHustle)** | **B, C ×3, D, E: six RAW slots** (§5.2) |
| **Selected Work** | **Cover A per project** (§5.3) |
| What We Build · How We Work · Why PSS | None (lucide icons and typography) |
| Testimonials | None (§5.4) |
| Final CTA · Footer | Footer logo only |

### 5.1 Why the hero stays image-free

The approved direction (`docs/ARCHITECTURE.md` §9 and
`design-reference/home-hero-approved.png`) specifies **no mockups or screenshots
in the hero**. The headline text is the page's largest visible element. Product
proof starts in the flagship section directly below the credibility band.

### 5.2 ZansiHustle flagship ecosystem

**How it is built** (`src/components/sections/home/FlagshipEcosystem.tsx` and
`src/components/portfolio/EcosystemMap.tsx`):

```
DESKTOP ≥ 1024 (content width 1344)                     MOBILE < 640
┌──────────────── Core platform (glass hub, max 1024) ┐   ┌ hub ───────────────┐
│ "ZansiHustle"              │ [B] ecosystem-hub      │   │ text               │
│ role line                  │ 16:9 · 540 × 304       │   │ [B] 306 × 172      │
└──────────────────────┬─────────────────────────────-┘   └────────────────────┘
       ┌───────────┬───┴───────┬───────────┬───────────┐   ┊ spine
       │ [D] phone │ [C] 16:10 │ [C] 16:10 │ [C] 16:10 │   ├ [D] 278 × 174 stage
       │ 85 × 151  │ 280 × 175 │ 280 × 175 │ 280 × 175 │   ├ [C] ZansiTech
       │ Mobile App│ ZansiTech │ZansiDisp. │ ZansiPulse│   ├ [C] ZansiDispatch
       └─────┬─────┴─────┬─────┴─────┬─────┴─────┬─────┘   ├ [C] ZansiPulse
┌──────────────── Foundation ────────────────────────┐   ┌ foundation ────────┐
│ Admin & Backend text                [E] 318 × 179  │   │ [E] 306 × 172      │
└────────────────────────────────────────────────────┘   └────────────────────┘
```

**Your questions, answered from the code:**

| Question | Answer |
|---|---|
| Exact aspect ratio | There isn't one for the section as a whole. Its six slots are **B 16:9, C 16:10 (×3), D 9:16 and E 16:9** |
| Single composed graphic? | **No.** The connections, junction dots, pillar labels ("Marketplace", "Operations", "Intelligence", "Foundation"), product names and roles are live HTML/CSS. A composite has no slot here, and fitting one in would mean redesigning an approved section. **The single composed ecosystem image goes in the ZansiHustle cover** (§5.2.1) |
| Ideal source resolution | B 1920 × 1080 · C 1280 × 800 · D 1080 × 1920 · E 1600 × 900 |
| How much is visible on desktop | The whole map is about 1,000–1,100 CSS px tall. At 1440 × 900 the hub and the product row fit on one screen, and the foundation needs a short scroll. All six images are visible at once only on tall screens |
| How much is visible on mobile | Everything stacks: the hub card, then four product cards along a vertical spine, then the foundation, roughly 2,000 CSS px of scrolling. Every image is full width (278–306 CSS px) |
| Separate mobile version? | **No.** Each slot is one file, and the mobile layout rearranges the same six images |
| Transparent background advantageous? | **No.** Every image is clipped into a rounded, opaque stage on a glass panel. Transparency adds nothing and risks halos |
| Text-safe areas | **None needed.** No text is overlaid on any image. Headline, copy, labels and CTAs are all HTML outside the frames |
| When files are missing | Production drops the missing image and shows a text-only card, so nothing looks broken. Preview shows placeholders |

**Capture once, derive six.** Do one capture session of the ZansiHustle products
at 2560 × 1440 (desktop) and 1080 × 1920 (phone). Then derive:

| Slot | File | From |
|---|---|---|
| B | `ecosystem-hub.webp` | The marketplace's main screen, downscaled to 1920 × 1080 (it can double as `desktop-01`) |
| D | `ecosystem-mobile-app.webp` | The strongest mobile app screen, 1080 × 1920 (it can double as `mobile-01`) |
| C | `ecosystem-zansitech.webp` | A 1280 × 800 crop of the ZansiTech storefront, such as its product grid |
| C | `ecosystem-zansidispatch.webp` | A 1280 × 800 crop of ZansiDispatch's logistics view (anonymised, §3.1) |
| C | `ecosystem-zansipulse.webp` | A 1280 × 800 crop of ZansiPulse's main analytics view |
| E | `ecosystem-admin.webp` | The admin portal overview, downscaled to 1600 × 900 |

The same component appears on the ZansiHustle case study (section "The
ecosystem"), so these six files serve both pages.

#### 5.2.1 The ZansiHustle cover: the single ecosystem composite

This is where the "connected systems" composite belongs. It follows slot A
(2560 × 1600, 16:10), with these specifics:

- **Content:** the marketplace as the dominant screen, taking at least 55% of
  the canvas width so it reads on a 356 px phone card. Add the mobile app and two
  or three of ZansiDispatch, ZansiPulse, ZansiTech and admin at a smaller scale.
  Use at most five screens in total.
- **Tell "one family of products" through composition,** with one shared
  background and consistent frames. **Don't draw connector lines or labels.** The
  ecosystem map on the page already tells that story in code, and a second
  diagram baked into the image would duplicate it and date quickly.
- **Where it shows:**
  - Work page › first, feature-size card (762 × 476, preloaded)
  - ZansiHustle case-study hero (1342 × 839, preloaded)
  - Related-project cards on other case studies
  - The case study's social preview

  It is **not shown on Home**.

### 5.3 Selected Work covers

**Layout.** `src/components/sections/home/SelectedWork.tsx` shows up to **6**
featured projects in `featuredOrder`, excluding the flagship, in a fixed rhythm:
**feature → pair → feature (image on the right) → pair.** Every card uses the
same cover file (slot A) at 16:10.

- A feature card shows the image at 762 × 476, on the left or right of the text.
- A pair card shows it at 642 × 401, above the text.

The same file serves both, so feature or pair doesn't change the asset.

**Which projects need Home covers.** Drafts are hidden in production, so the Home
set depends on which projects are published at launch:

| Row | Layout | All six drafts published (target) | Production today (drafts hidden) |
|---|---|---|---|
| 1 | Feature, image left | **SmartFuture** | **Ovulae** |
| 2 | Pair | **DailyRise** · **HypeGrid** | **CPMA** · **MetaPOS** |
| 3 | Feature, image right | **Ovulae** | — |
| 4 | Pair | **CPMA** · **AltoCoins** | — |

- **Home covers required:** SmartFuture, DailyRise, HypeGrid, Ovulae, CPMA,
  AltoCoins, and **MetaPOS**.
  - MetaPOS (`featuredOrder` 7) is on Home until all six projects above it are
    published.
  - It needs a cover for its Work card and case study either way.
- **TNXOne is not `featured`,** so it appears only on the Work page. Putting it
  on Home would be a data change (`featured`, `featuredOrder`), and its cover
  spec would stay the same.

**Per-project cover guidance.** Only facts from the project data are used here.
For the four draft projects the platforms haven't been supplied yet.

| Project | Cover | Composition (all to slot A and §3.4) |
|---|---|---|
| SmartFuture | COMPOSITE | Desktop screen as the anchor. Add a phone only if the product has a mobile app (platforms not yet supplied) |
| DailyRise | COMPOSITE | As above |
| HypeGrid | COMPOSITE | As above |
| AltoCoins | COMPOSITE | As above. Finance-type screens need demo data (§3.1) |
| Ovulae | COMPOSITE | Web, mobile and backend: one or two **app** phone screens as the focal point, with the **Portal** dashboard behind. The legacy 6000 × 3375 composite is in the old style: rebuild it, don't migrate it |
| CPMA | COMPOSITE | Web and mobile: the case-management web dashboard with the mobile app beside it. Legacy screens (about 1918 × 990 desktop, 600 × 950 phone) are good enough as composite input once reviewed for personal data |
| MetaPOS | COMPOSITE | Web and mobile: the web dashboard (sales and stock) with the Android POS app screen. Real screenshots only, **no rendered POS hardware** |

- **Desktop and mobile UI in the same composition:** yes, for products that ship
  both. It is the only way one card image can show a multi-platform product. The
  card's platform chips ("Web", "Mobile") make the same point in text.
- **Crop behaviour:** none. Cards and the case-study hero are both 16:10, so the
  whole cover shows (see the slot A safe zones).

### 5.4 Testimonials

**No image assets.** Cards are text-only: quote, author name, role, company and
context (`src/components/sections/Testimonials.tsx`). The component has no logo,
avatar or company-mark slot. In production the section is hidden until at least
one approved, attributed quote exists. Don't create portraits or avatars.

### 5.5 Client logos on Home

**None are rendered.** The credibility band was built without partner logos on
purpose. See §11.

---

## 6. Work page

`src/app/projects/page.tsx`: the flagship comes first as a **feature card**
(762 × 476, preloaded), followed by every other public project as a **standard
card** (642 × 401) in a two-column grid. The files are the covers (slot A), the
same ones used on Home.

**Public projects in the data today:**

| Group | Projects | Cover |
|---|---|---|
| Flagship | ZansiHustle | COMPOSITE (§5.2.1) |
| Featured (Selected Work) | SmartFuture\*, DailyRise\*, HypeGrid\*, Ovulae, CPMA, AltoCoins\*, MetaPOS | COMPOSITE |
| Additional, new | TNXOne\*, ZansiTech\* | TNXOne: COMPOSITE (a strong project). ZansiTech: RAW 16:10 is acceptable |
| Additional, migrated | Catalyst Risk Tool, Catalyst FX Dynamics Website | RAW 16:10 is acceptable (§3.2 recipe at 1440 × 900) |
| Additional, migrated, **not in the curated list** | CLA Administration Tool, iWatchAllTV, ApexGO, PNE Finance, MindSharp LMS | **Decide before producing anything** (§14.14). Recommendation: hide them |

\* Draft: shown in production only once PSS supplies its facts.

A public project without a cover shows a navy branded panel with its name. That
isn't broken, but it reads as unfinished.

---

## 7. Case studies

### 7.1 The template and where images appear

`src/app/projects/[slug]/page.tsx`. In production every section renders only
when it has content.

| # | Section | Images | Slot |
|---|---|---|---|
| 1 | Hero (navy): breadcrumbs, industry, name, tagline, links, facts | None | — |
| 2 | Overview, with the cover straddling the hero edge | **Cover** (16:10), preloaded | A |
| 3 | The challenge / What we built (navy) | None | — |
| 4 | Platform by platform (only for projects with deliverables) | **One lead image per platform block** | H or I |
| 5 | Key capabilities | None | — |
| 6 | The ecosystem (ZansiHustle only) | The same six images as Home | B–E |
| 7 | Selected screens | **Desktop gallery, then phone gallery** | F, G |
| 8 | Outcome (navy) | None | — |
| 9 | Related projects | Covers of up to three other projects | A |
| — | Social preview | The cover file itself | A (§10.2) |

The template has **no** separate hero image slot, wide feature visual, per-project
logo slot, admin-specific slot or diagram slot beyond the ZansiHustle ecosystem.
Admin screens go in the desktop gallery (F).

### 7.2 Standard image set per case study

This is what to supply instead of arbitrary quantities.

| Project type | Set |
|---|---|
| **New project (single product)** | 1 cover + **3 desktop** screens + **3 mobile** screens, or 4 once the `mobile-04` slot is added (slot G), and only if it has a mobile UI |
| **ZansiHustle** | The standard set plus the **6 ecosystem images** |
| **Project with platform blocks** (Ovulae, CPMA, MetaPOS, CRT) | 1 cover + **exactly 1 lead image per platform block** + 3 desktop gallery screens where the project has a gallery |

**The three desktop screens should tell a short story.** Pick whichever of these
really exist:

1. The main overview or dashboard. It is shown full width, so pick the strongest.
2. The core workflow screen.
3. Management, administration or reporting.

For **mobile**, pick the home screen, the core task, a detail view, and account
or notifications.

### 7.3 Per-project shot list

All paths are under `public/images/projects/<slug>/`. **Pri** is the priority
from §15.

**ZansiHustle** (`zansihustle/`, flagship, published)

| File | Slot | Type | Pri | Show |
|---|---|---|---|---|
| `cover.jpg` | A | COMPOSITE | P0 | The ecosystem composite (§5.2.1) |
| `ecosystem-hub.webp` | B | RAW | P0 | The marketplace's main screen |
| `ecosystem-mobile-app.webp` | D | RAW | P0 | The strongest app screen |
| `ecosystem-zansitech.webp` | C | RAW crop | P0 | The ZansiTech storefront |
| `ecosystem-zansidispatch.webp` | C | RAW crop | P0 | The ZansiDispatch logistics view |
| `ecosystem-zansipulse.webp` | C | RAW crop | P0 | ZansiPulse analytics |
| `ecosystem-admin.webp` | E | RAW | P0 | The admin overview |
| `desktop-01.webp` … `desktop-03.webp` | F | RAW | P1 | Full-size views of the marketplace, ZansiDispatch and ZansiPulse or admin, so visitors can read what the ecosystem tiles only hint at |
| `mobile-01.webp` … `mobile-03.webp` | G | RAW | P1 | The mobile app |

**SmartFuture, DailyRise, HypeGrid, AltoCoins** (`smartfuture/`, `dailyrise/`,
`hypegrid/`, `altocoins/`; featured drafts)

| File | Slot | Type | Pri |
|---|---|---|---|
| `cover.jpg` | A | COMPOSITE | P0 |
| `desktop-01.webp` … `desktop-03.webp` | F | RAW | P1 |
| `mobile-01.webp` … `mobile-03.webp` | G | RAW | P1 (only if a mobile UI exists) |

**TNXOne, ZansiTech** (`tnxone/`, `zansitech/`; additional drafts): the same file
set at **P2**. The TNXOne cover is a COMPOSITE; the ZansiTech cover can be RAW
16:10.

**Ovulae** (`ovulae/`, featured, published)

The Ovulae case study has **no Selected screens gallery**: `images` is empty in
the data. Its screens appear only as platform-block leads, and only the first
image of each block renders (§14.3).

| File | Slot | Type | Pri | Show |
|---|---|---|---|---|
| `cover.jpg` | A | COMPOSITE | P0 | The app (phones) with the Portal (§5.3) |
| `mobile-1.webp` | I | RAW 9:16 | P1 | Ovulae App lead: the strongest tracking screen |
| `portal-1.webp` | H | RAW 16:9 | P1 | Ovulae Portal lead: a role dashboard |
| `website-1.webp` | H | RAW 16:9 | P1 | Ovulae Website lead: the home page, top of the viewport |

`mobile-2` … `mobile-7`, `portal-2` and `website-2` exist in the data but can't be
displayed by the current template.

**CPMA** (`cpma/`, featured, published)

| File | Slot | Type | Pri | Show |
|---|---|---|---|---|
| `cover.jpg` | A | COMPOSITE | P0 | Web dashboard with the mobile app |
| `web-1.webp` … `web-3.webp` | F | RAW | P1 | Case dashboard, case detail or timeline, and calendar or hearings, as they really exist |
| `mobile-1.webp` | I | RAW 9:16 | P1 | CPMA Mobile App lead |
| `mobile-cover` | — | — | **Do not supply** | See slot I |
| `web-4` … `web-6` | F | RAW | P3 | Optional extras (the slots exist) |

**MetaPOS** (`metapos/`, featured, published)

| File | Slot | Type | Pri | Show |
|---|---|---|---|---|
| `cover.jpg` | A | COMPOSITE | P0 | Web dashboard with the POS app |
| `web-1.webp` … `web-3.webp` | F | RAW | P1 | Sales summary, inventory analytics, and staff or configuration |
| `mobile-1.webp` | I | RAW 9:16 | P1 | POS app: checkout or cart |
| `mobile-cover` | — | — | **Do not supply** | |
| `design-cover.webp` | H | RAW 16:9 | P3 | Figma view of the MetaPOS UX design block, only if clean |
| `web-4` … `web-6` | F | RAW | P3 | Optional extras |

**Catalyst Risk Tool** (`catalyst-risk-tool/`, additional, published; keep only
if PSS keeps the Catalyst work)

| File | Slot | Type | Pri |
|---|---|---|---|
| `cover.jpg` | A | RAW 16:10 | P2 |
| `web-1.webp` … `web-3.webp` | F | RAW | P2 |
| `mobile-1.webp` | I | RAW 9:16 | P2 |
| `desktop-cover.webp` | H | RAW 16:9 (the legacy `img/apps/desktop/crt.png` is already 1920 × 1080) | P2 |

**Catalyst FX Dynamics Website** (`catalyst-fx-dynamics-website/`, additional,
published): `cover.jpg` (RAW 16:10) and `web-1` … `web-3`, all **P2**.
`design-cover` is P3.

**CLA Administration Tool, iWatchAllTV, ApexGO, PNE Finance, MindSharp LMS:** no
work until PSS decides (§14.14). If they are kept: a RAW 16:10 cover and 3
screens each, at P3.

### 7.4 Mobile screenshots: composite, or rendered by the site?

**Recommendation: raw portrait screenshots, rendered by the site, everywhere
except inside covers.** This is already implemented. It gives the cleanest
result with no duplicated design work:

- **Gallery (G):** the site renders each 9:16 screen as a rounded phone panel,
  two, three or four across.
- **Platform lead (I):** when a block's first image is a phone screen, the site
  shows it in portrait at up to 382 × 679 beside the copy. No landscape phone
  composite is needed.
- **Ecosystem (D):** the site centres the phone screen on a dark 16:10 stage.
- **Covers (A):** the **only** place a landscape composition with phones is
  needed, and it is made by the designer (§3.4).

Don't bake device frames into raw screens: they would be double-framed and the
wrong ratio. There are no CSS device bezels today, and none are needed. The
rounded panels already read as phone screens.

### 7.5 Desktop screenshots: which ratio?

**Use 16:9, captured to the viewport** (§3.2). Every desktop screenshot frame is
16:9: gallery, platform lead, hub and foundation. The exceptions are the 16:10
ecosystem tiles, which take their own crops, and the 16:10 covers.

| Option | Result in a 16:9 frame |
|---|---|
| Native browser window (≈ 1.9–2.1:1) | 4–12% cut from each side |
| 16:10 | The bottom 10% is cut |
| Recommended | **2560 × 1440**. Minimum width **1920 px** |

---

## 8. About, Services, Contact and legal pages

| Page | Images genuinely needed | Verdict |
|---|---|---|
| **About** | **Founder portrait (J), optional.** Story, beliefs and direction are typographic sections on CSS backgrounds. The credibility band is reused | No team photo, office photo or abstract brand graphic: the layout has no slot for them and doesn't need one. The legacy About banner, the vision, mission and future illustrations, and the stock photos are not needed |
| **Services** | **None.** Four chapter sections with lucide icons, copy and "What we deliver" lists | **Stronger without images.** Stock developer photos would contradict the approved direction ("no stock photography") |
| **Contact** | **None.** A form plus direct details. The page is deliberately built with **no map** | Don't reintroduce a map |
| Privacy · Terms · 404 · error | None | — |

---

## 9. PSS brand assets

| Asset | Needed? | Notes |
|---|---|---|
| `public/images/brand/Logo.png` | Exists: **no work** | Used in five places (slot M). Don't recreate or recolour it |
| Favicon, `icon.png`, `apple-icon.png` | **Yes, P0** | Slot L. Derived from existing artwork, with PSS approval of the mark |
| Default social image | **Yes, P0** | Slot K |
| Email-safe logo | **No** | The notification email already uses the hosted `Logo.png` at 120 × 29. It is transparent with blue marks on a white email, which is fine. A 240 × 57 copy would only save about 45 KB; P3 at most |
| Manifest icons | No | The manifest uses `display: browser` and needs no install icons |
| Vector logo (SVG) | Nice to have | Only an official one, never a redraw |

---

## 10. Open Graph / social images

### 10.1 Default website social image

- **What to make:** slot K, 1200 × 630, saved as `src/app/opengraph-image.png`.
- ⚠ **Current limitation (§14.6):**
  - Next.js applies a root `opengraph-image` only to pages that don't define
    their own Open Graph object.
  - Every page here defines one through `buildPageMetadata()`. As built, the file
    would only show on **Home**.
  - `/services`, `/about`, `/contact`, `/projects`, the legal pages and any case
    study without a cover would have **no preview image**.
  - A small code change is needed: a default image fallback in
    `src/lib/seo.ts`. It hasn't been made. The asset spec doesn't change.

### 10.2 Project social images: partly supported

- **Every case study already uses its cover as its social image**
  (`generateMetadata` passes `project.coverImage`). No separate asset is needed
  for this to work.
- **Consequences to design around:**
  - The image is **16:10**. LinkedIn and Facebook crop it to 1.91:1, removing
    about 8% at the top and the bottom. The slot A safe zone (80 px margins)
    keeps the essentials.
  - The **raw file** is served, not a resized copy, and without width/height
    tags. That is why covers are **JPG ≤ 700 KB** and **never AVIF** (§3.5).

### 10.3 Dedicated per-project social images (P3, needs a code change)

If PSS wants purpose-made previews, deliver `public/images/projects/<slug>/og.jpg`
for the flagship and the Home featured projects:

- **Size and format:** 1200 × 630, JPG, ≤ 300 KB.
- **Content:** derived from the cover (a re-layout, not a new design), with the
  project name in Plus Jakarta Sans ExtraBold at the bottom left and a small PSS
  logo. Text is appropriate here, because this image lives off-site.
- **Safe zones:** the same as slot K.

This only takes effect after code is written to prefer `og.jpg`. Until then, the
cover is used.

---

## 11. Client logos

**Container size and slot:**

- **None exist.** No page renders a client logo: no logo wall, no logos in the
  credibility band, testimonials or case-study facts. The case-study "Client"
  fact is text.
- **No client logo is required for launch.**
- **Monochrome treatment** is neither implemented nor currently expected.

**What is in `public/images/clients/` today.** It holds 27 files, all deployed
and publicly reachable:

| | Files |
|---|---|
| Featured-project clients | `ovulae.webp` (2048 × 2030) · `cpma-client.svg` · `MetaPOS-client.svg` (MetaPOS vs Anglojungle is unresolved) · `zansihustle.png` (5301 × 3481) · `dailyrise.png` (1285 × 1131) · `altocoins.png` (1177 × 1218) · `smartfuture.png` (**320 × 103, too small**) · `tnxone.png` (973 × 1084, 703 KB) · `catalyst-fx-dynamics.png` |
| Missing | **HypeGrid** |
| Logo wall only (legacy) | Kwikem, Corporate Voice (`cla.webp`), TAPS (×2, non-transparent JPEG), Top 1% Community (149 × 63), Gcwensa (82 × 100), WCG (×3), De Bet Masterz, P&E Finance, Creative Computer Repairs (347 × 44), Ritshuri Tech (213 × 102), Namibian Farmers Online |
| Should not be public | **`afx-trust.png`** (AFX Trust must not be featured), `Logo.jpg` (AB Tech; hidden project), `Logo Transparent.png` (iWatchAll; unconfirmed), `wopl-client.png` (no project) |

**If a logo slot is designed later**, prepare logos to this standard:

- **Source:** the official SVG first; otherwise a transparent PNG at least 600 px
  on the long side, **trimmed to the artwork** with no built-in padding (the
  layout adds the padding).
- **Different aspect ratios:** never distort. Render with `contain` inside a
  fixed box, and **balance by visual weight rather than width**. Typically give
  square or stacked marks (Ovulae, AltoCoins, DailyRise, TNXOne, WCG) about 70%
  of the box height, and wide wordmarks the full box width.
- **Background dependence:** several logos disappear on one background.
  - Dark ink that vanishes on navy: AltoCoins ("Alto"), ZansiHustle ("Zansi"),
    Corporate Voice, Namibian Farmers, Woplhost.
  - White that vanishes on light: DailyRise ("Daily").
  - Request official alternate versions rather than recolouring.
- **Baked backgrounds:** Catalyst FX Dynamics, AFX Trust, TAPS, Top 1% and
  Ritshuri are rectangles with a background built in. Request transparent
  versions. CSS monochrome filters would turn these into solid blocks.
- **Consent:** logo display still needs re-confirming per client.

---

## 12. Legacy assets

The legacy repository (`PSS-MainWebsite/wwwroot`) isn't on this machine. This
section is based on its inventory in `CURRENT_WEBSITE_AUDIT.md` §6.

### 12.1 Potentially worth bringing over (after the §3.1 review)

| Legacy file(s) | Use | Caveat |
|---|---|---|
| `img/apps/mobile/ovulae/1–7.png` (≈ 1260 × 2510) | Ovulae app lead (`ovulae/mobile-1`) and cover input | About 1:2, so crop to 9:16 by hand (otherwise about 11% of the bottom is lost). HEAVY: resize |
| `img/apps/web/ovulae/ovulae-portal-1/2.png`, `ovulae-web-1/2.png` (≈ 1919 × 1030 / 945) | Portal and website leads, cover input | Recapture at 16:9 if possible. Otherwise the sides are cut by about 2% and 6% |
| `img/apps/web/cpma/1–6.png` (≈ 1918 × 990), `img/apps/mobile/cpma/1–3.png` (600 × 950) | CPMA gallery, mobile lead and cover input | About 4% cut from each side. Phone screens are low resolution and wider than 9:16 (about 5.5% cut each side). Check for personal data |
| `img/apps/web/metapos/1–6.png`, `img/apps/mobile/metapos/1–3.png` | MetaPOS gallery, POS lead and cover input | As for CPMA. The older `images/portfolio/*metapos*` are superseded |
| `img/apps/web/crt/1–7.png`, `img/apps/mobile/crt/1–3.png`, `img/apps/desktop/crt.png` (1920 × 1080) | Catalyst Risk Tool, if kept | `desktop/crt.png` is already 16:9 |
| `img/apps/web/catalyst/1–6.png` | Catalyst FX Dynamics Website, if kept | `1.png` is 2.3 MB: resize |
| `img/apps/design/ovulae*.png`, `ovulae-figma.*` | Reference for the Ovulae cover | Design files. Use them only where they match the shipped app |
| `images/director3.webp` (1536 × 2048) | Founder portrait (J) | PSS to confirm it is current. Crop square |
| Client logos for featured projects | — | Already in `public/images/clients/` (§11) |
| `images/portfolio/data-*`, `desktop-chatApp.png` | **Keep in the legacy archive only** | The only evidence of the data-analytics and chat work. Not needed by any current slot |

### 12.2 Definitely do NOT migrate

| Legacy asset | Why |
|---|---|
| Card covers `img/apps/web/{…}.png` (1920 × 900, with browser frames baked in) | Old visual style. About 12.5% would be cut from each side in 16:10 cards. Replace them with new covers at the same paths |
| Phone composites `img/apps/mobile/{afx,apex,cpma,crt,fpsl,metapos}.png` | Old mock-up style, and unnecessary: leads use raw portrait screens (§7.4) |
| Ovulae composites `ovulae-app.jpg` / `portal-app.jpg` (6000 × 3375, 5–6 MB) | Old style and far too heavy. Rebuild the Ovulae cover |
| Everything AFX Trust (web, mobile and desktop screens; logo) | Not featured. Screens show an account name and balances |
| iWatchAllTV screenshots | They contain third-party film artwork (copyright) |
| Hidden projects' images (WCG, AB Tech, Hlumis'imfundo, FPSL, Gcwensa, Folder Locker, design concepts) | The projects are hidden |
| Figma, XD and Canva workspace shots in `img/apps/design/` | Process screenshots, not products. Optional P3 at most |
| Hero, banner and background images (`banner-img`, `learn-img`, `word-map`, `about.webp` with text baked in, `intro-bg` wave) | Old template language |
| Stock photography (`design-img2`, `developer`, `data-engineering`, `support`) | Unknown licence, and stock is against the approved direction |
| Illustrations (service set, feature icons, line icons, vision/mission/future, isometric category tiles) | Template assets, with no slot |
| `images/portfolio/app1–3`, `card1–3`, `web1–3` | NewBiz demo placeholders |
| `mainLOGO2.*`, `logo.webp`, `img/social.png`, `slog.*`, `preloader.webp` (2.3 MB), legacy `favicon.ico` (the ASP.NET default) | Retired or obsolete brand assets. The current logo is `Logo.png` |
| `images/tech/*` technology logos, API logos | No slot renders technology logos. If one ever does, use the official brand kits |
| `LinkedIn_icon.webp`, `img/apps.zip` (67 MB backup) | Not needed |

---

## 13. Folder convention

This matches the conventions already in the code (`src/lib/assets.ts` and
`src/data/*`):

```
public/images/
  brand/        Logo.png                       (existing, unchanged)
  people/       proficient-mkansi.webp         (optional)
  clients/      only logos with consent AND a slot that renders them (none today)
  projects/
    zansihustle/   cover.jpg, ecosystem-{hub,mobile-app,zansitech,zansidispatch,zansipulse,admin}.webp,
                   desktop-01…03.webp, mobile-01…03.webp
    smartfuture/   cover.jpg, desktop-01…03.webp, mobile-01…03.webp
    dailyrise/     (same)
    hypegrid/      (same)
    altocoins/     (same)
    tnxone/        (same)
    zansitech/     (same)
    ovulae/        cover.jpg, mobile-1.webp, portal-1.webp, website-1.webp
    cpma/          cover.jpg, web-1…3.webp, mobile-1.webp
    metapos/       cover.jpg, web-1…3.webp, mobile-1.webp
    catalyst-risk-tool/             cover.jpg, web-1…3.webp, mobile-1.webp, desktop-cover.webp
    catalyst-fx-dynamics-website/   cover.jpg, web-1…3.webp

src/app/        favicon.ico, icon.png, apple-icon.png,
                opengraph-image.png, opengraph-image.alt.txt
```

- **Folder names are project slugs.** New projects use `desktop-0N` and
  `mobile-0N`; migrated projects use `web-N` and `mobile-N`. Keep the names the
  data expects. Renaming them is a data change.
- **`public/images/services/` and `public/images/technologies/`** exist, but
  nothing renders from them. Leave them empty.
- **Design masters stay outside `public/`.**

---

## 14. Problems found

These were recorded during the audit. Items marked **Fixed** were corrected on
2026-09-23 after the audit; the rest are open.

1. **Fixed: a cover was shown at two ratios.** Cards were 16:10 but the
   case-study hero was 16:9. The hero is now 16:10 too, so every cover shows
   whole.
2. **Fixed: the placeholder labels gave the wrong ratio and size.** Labels now
   come from the frame's real ratio, with the §1 master size for that ratio
   (`describeFrame()` in `src/lib/media.ts`). The `wide` 21:9 kind is still
   unused.
3. **Only the first image of each platform block ever renders**
   (`DeliverableBlock`, page.tsx:134–177). Seventeen declared slots can never be
   shown. The Ovulae case study shows only its cover and three leads, with no
   Selected screens section.
4. **Fixed: preview and production differed for platform leads.** Preview now
   also leads with the first supplied file. It shows an empty slot (such as
   `mobile-cover`) only when none of the block's files exist.
5. **Fixed: some `sizes` values were wrong.** The full-width gallery screen,
   the ecosystem foundation, cards, ecosystem tiles and platform leads now
   declare their real rendered widths. At 1440 the browser picks the widths
   the layout needs (for example 640 w for the 540 px hub and 1920 w for the
   1342 px hero).
6. **A default social image would only reach Home.** Each page's `openGraph`
   object replaces the inherited one, and a metadata file only applies to its
   own folder (checked in `node_modules/next/dist/lib/metadata/resolve-metadata.js`
   and `next-app-loader`). `docs/ARCHITECTURE.md` §8 overstates this. The fix is
   a fallback image in `src/lib/seo.ts`.
7. **The X card type stays `summary` on Home** even with a file-based image,
   because `buildPageMetadata()` derives the card type only from images the page
   supplies. X then shows a small square crop.
8. **The case-study social image is the raw 16:10 cover:** not resized, no
   width/height tags, and in whatever format was supplied. An AVIF would break
   previews.
9. **There are no favicon or app icons at all,** and the manifest has no icons.
10. **Phone frames are 9:16, but modern phones are 9:19.5–9:20.**
    - Unprepared captures lose the bottom 18–20%.
    - Legacy Ovulae screens lose about 11%.
    - Legacy 600 × 950 screens are wider than 9:16 and low resolution.
11. **Legacy covers (1920 × 900, browser frames baked in)** would lose about 12.5%
    from each side in 16:10 cards. Legacy gallery shots (≈ 1918 × 990) lose about
    4% from each side in 16:9 frames.
12. **The ecosystem tiles are small:** 280 × 175 at 1440, 184 × 115 at 1024, and
    the phone is 51 × 91 at 1024. Full-screen captures can't be read there, so
    the zoomed crops in slot C are required.
13. **Client logo housekeeping:**
    - No logos render, yet 27 files are deployed, including AFX Trust.
    - The file names don't match the paths in `src/data/clients.ts` (for example
      `corporate-voice.webp` vs `cla.webp`).
    - The HypeGrid logo is missing, and SmartFuture's is 320 × 103.
    - The five new logos have no data entries, and SmartFuture and TNXOne aren't
      client records at all.
14. **Curation drift.**
    - The data still publishes **CLA Administration Tool, iWatchAllTV, ApexGO,
      PNE Finance and MindSharp LMS**, plus the two Catalyst projects, on the
      Work page. That is beyond the curated set.
    - iWatchAllTV screens contain third-party film artwork.
    - **TNXOne isn't featured,** while **MetaPOS** (featuredOrder 7) is on Home
      in production today.
    - These are data decisions for PSS, and they come before any image work on
      those projects.
15. **Fixed: the docs were out of date.** `docs/ARCHITECTURE.md` and
    `docs/CONTENT_MIGRATION.md` now describe `MediaFrame`, the build-time file
    lookup and the client logo files, and point here for image specs.
16. **The extension fallback can pick the wrong file.** The lookup takes the
    first match in the order `.avif` → `.webp` → `.png` → `.jpg`, so a leftover
    duplicate silently wins. SVG is excluded from the fallback.

---

## 15. Image production queue

The order is the one the designer should work in. Do the RAW capture sessions
first, because the composites are built from them.

**Type:** R = RAW, R-crop = RAW zoomed crop, C = DESIGNER COMPOSITE, D = derived
from existing brand artwork. All project paths are under `public/images/projects/`.

| Priority | Asset | Project | Intended Path | Ratio | Master Size | Format | Type | Qty |
|----------|-------|---------|---------------|-------|-------------|--------|------|-----|
| P0 | Ecosystem hub (marketplace) | ZansiHustle | `zansihustle/ecosystem-hub.webp` | 16:9 | 1920 × 1080 | WebP | R | 1 |
| P0 | Ecosystem tile: mobile app | ZansiHustle | `zansihustle/ecosystem-mobile-app.webp` | 9:16 | 1080 × 1920 | WebP | R | 1 |
| P0 | Ecosystem tile: ZansiTech | ZansiHustle | `zansihustle/ecosystem-zansitech.webp` | 16:10 | 1280 × 800 | WebP | R-crop | 1 |
| P0 | Ecosystem tile: ZansiDispatch | ZansiHustle | `zansihustle/ecosystem-zansidispatch.webp` | 16:10 | 1280 × 800 | WebP | R-crop | 1 |
| P0 | Ecosystem tile: ZansiPulse | ZansiHustle | `zansihustle/ecosystem-zansipulse.webp` | 16:10 | 1280 × 800 | WebP | R-crop | 1 |
| P0 | Ecosystem foundation (admin) | ZansiHustle | `zansihustle/ecosystem-admin.webp` | 16:9 | 1600 × 900 | WebP | R | 1 |
| P0 | Cover: ecosystem composite | ZansiHustle | `zansihustle/cover.jpg` | 16:10 | 2560 × 1600 | JPG | C | 1 |
| P0 | Cover (Home row 1, feature) | SmartFuture | `smartfuture/cover.jpg` | 16:10 | 2560 × 1600 | JPG | C | 1 |
| P0 | Cover (Home row 2) | DailyRise | `dailyrise/cover.jpg` | 16:10 | 2560 × 1600 | JPG | C | 1 |
| P0 | Cover (Home row 2) | HypeGrid | `hypegrid/cover.jpg` | 16:10 | 2560 × 1600 | JPG | C | 1 |
| P0 | Cover (Home row 3, feature) | Ovulae | `ovulae/cover.jpg` | 16:10 | 2560 × 1600 | JPG | C | 1 |
| P0 | Cover (Home row 4) | CPMA | `cpma/cover.jpg` | 16:10 | 2560 × 1600 | JPG | C | 1 |
| P0 | Cover (Home row 4) | AltoCoins | `altocoins/cover.jpg` | 16:10 | 2560 × 1600 | JPG | C | 1 |
| P0 | Cover (on Home until all drafts ship) | MetaPOS | `metapos/cover.jpg` | 16:10 | 2560 × 1600 | JPG | C | 1 |
| P0 | Default social image | Site | `src/app/opengraph-image.png` | 1.91:1 | 1200 × 630 | PNG | C | 1 |
| P0 | Favicon (start the mark approval early) | Site | `src/app/favicon.ico` | 1:1 | 16/32/48 | ICO | D | 1 |
| P0 | App icon | Site | `src/app/icon.png` | 1:1 | 512 × 512 | PNG | D | 1 |
| P0 | Apple touch icon | Site | `src/app/apple-icon.png` | 1:1 | 180 × 180 | PNG | D | 1 |
| P1 | Desktop screens | ZansiHustle | `zansihustle/desktop-01…03.webp` | 16:9 | 2560 × 1440 | WebP | R | 3 |
| P1 | Mobile screens | ZansiHustle | `zansihustle/mobile-01…03.webp` | 9:16 | 1080 × 1920 | WebP | R | 3 |
| P1 | App lead (phone) | Ovulae | `ovulae/mobile-1.webp` | 9:16 | 1080 × 1920 | WebP | R | 1 |
| P1 | Portal lead | Ovulae | `ovulae/portal-1.webp` | 16:9 | 2560 × 1440 | WebP | R | 1 |
| P1 | Website lead | Ovulae | `ovulae/website-1.webp` | 16:9 | 2560 × 1440 | WebP | R | 1 |
| P1 | Desktop screens | CPMA | `cpma/web-1…3.webp` | 16:9 | 2560 × 1440 | WebP | R | 3 |
| P1 | Mobile app lead | CPMA | `cpma/mobile-1.webp` | 9:16 | 1080 × 1920 | WebP | R | 1 |
| P1 | Desktop screens | MetaPOS | `metapos/web-1…3.webp` | 16:9 | 2560 × 1440 | WebP | R | 3 |
| P1 | POS app lead | MetaPOS | `metapos/mobile-1.webp` | 9:16 | 1080 × 1920 | WebP | R | 1 |
| P1 | Desktop screens | SmartFuture | `smartfuture/desktop-01…03.webp` | 16:9 | 2560 × 1440 | WebP | R | 3 |
| P1 | Mobile screens (if mobile UI) | SmartFuture | `smartfuture/mobile-01…03.webp` | 9:16 | 1080 × 1920 | WebP | R | 3 |
| P1 | Desktop screens | DailyRise | `dailyrise/desktop-01…03.webp` | 16:9 | 2560 × 1440 | WebP | R | 3 |
| P1 | Mobile screens (if mobile UI) | DailyRise | `dailyrise/mobile-01…03.webp` | 9:16 | 1080 × 1920 | WebP | R | 3 |
| P1 | Desktop screens | HypeGrid | `hypegrid/desktop-01…03.webp` | 16:9 | 2560 × 1440 | WebP | R | 3 |
| P1 | Mobile screens (if mobile UI) | HypeGrid | `hypegrid/mobile-01…03.webp` | 9:16 | 1080 × 1920 | WebP | R | 3 |
| P1 | Desktop screens | AltoCoins | `altocoins/desktop-01…03.webp` | 16:9 | 2560 × 1440 | WebP | R | 3 |
| P1 | Mobile screens (if mobile UI) | AltoCoins | `altocoins/mobile-01…03.webp` | 9:16 | 1080 × 1920 | WebP | R | 3 |
| P2 | Cover | TNXOne | `tnxone/cover.jpg` | 16:10 | 2560 × 1600 | JPG | C | 1 |
| P2 | Desktop and mobile screens | TNXOne | `tnxone/desktop-01…03`, `mobile-01…03` | 16:9 · 9:16 | 2560 × 1440 · 1080 × 1920 | WebP | R | 6 |
| P2 | Cover | ZansiTech | `zansitech/cover.jpg` | 16:10 | 2560 × 1600 | JPG | R | 1 |
| P2 | Desktop and mobile screens | ZansiTech | `zansitech/desktop-01…03`, `mobile-01…03` | 16:9 · 9:16 | 2560 × 1440 · 1080 × 1920 | WebP | R | 6 |
| P2 | Cover | Catalyst Risk Tool | `catalyst-risk-tool/cover.jpg` | 16:10 | 2560 × 1600 | JPG | R | 1 |
| P2 | Desktop screens, mobile lead, desktop-app lead | Catalyst Risk Tool | `catalyst-risk-tool/web-1…3`, `mobile-1`, `desktop-cover` | 16:9 · 9:16 · 16:9 | 2560 × 1440 · 1080 × 1920 | WebP | R | 5 |
| P2 | Cover | Catalyst FX Dynamics Website | `catalyst-fx-dynamics-website/cover.jpg` | 16:10 | 2560 × 1600 | JPG | R | 1 |
| P2 | Desktop screens | Catalyst FX Dynamics Website | `catalyst-fx-dynamics-website/web-1…3.webp` | 16:9 | 2560 × 1440 | WebP | R | 3 |
| P2 | Founder portrait (optional) | About | `public/images/people/proficient-mkansi.webp` | 1:1 | 800 × 800 | WebP | R (photo) | 1 |
| P3 | 4th mobile screen (needs a `mobile-04` slot) | Each new project | `<slug>/mobile-04.webp` | 9:16 | 1080 × 1920 | WebP | R | up to 7 |
| P3 | Per-project social image (needs a code change) | Flagship and featured | `<slug>/og.jpg` | 1.91:1 | 1200 × 630 | JPG | C | up to 9 |
| P3 | Extra gallery screens (the slots exist) | CPMA, MetaPOS | `web-4…6.webp` | 16:9 | 2560 × 1440 | WebP | R | up to 6 |
| P3 | Design-block leads (Figma), only if clean | MetaPOS, Catalyst FX Dynamics Website | `design-cover.webp` | 16:9 | 2560 × 1440 | WebP | R | 2 |
| P3 | Covers and 3 screens, **only if kept public** | CLA, iWatchAllTV, ApexGO, PNE Finance, MindSharp LMS | `<slug>/…` | 16:10 · 16:9 | as above | as above | R | 4 each |
| P3 | Official vector icon | Site | `src/app/icon.svg` | 1:1 | vector | SVG | D | 1 |
| P3 | Client logo set (only once a logo slot is designed) | Featured-project clients | `public/images/clients/<client>.svg` | native | ≥ 600 px long side | SVG/PNG | — | — |

**Totals:** P0 = **18** files · P1 = **41** (fewer if some products have no mobile
UI) · P2 = **25**.

---

## 16. Minimum assets required for launch

**Supplied so far (2026-09-23): 7 of the 18.** These are the ZansiHustle `cover.jpg`
and the six `ecosystem-*.webp` files. All seven match this spec on size, ratio,
format, colour space, transparency and file-size cap, and they render correctly
on Home, the Work page and the case study. Notes:

- `ecosystem-mobile-app.webp` has a phone frame and part of a second phone
  baked in, so it is a composite rather than the RAW screen slot D asks for. It
  still reads as a phone in the 85 × 151 tile; replace it with a RAW screen only
  if the double frame bothers you.
- The admin, ZansiDispatch and ZansiPulse images show personal names and
  amounts. **Confirm they are seeded demo data** (§3.1).
- `public/images/projects/ZansiHustle_Website_Assets_7.zip` duplicates the seven
  files. Everything in `public/` is deployed, so move the zip out of `public/`
  before launch.

The site can launch looking complete with **18 files**, all of P0, provided that:

- **(a)** Only projects whose facts are ready are published. Drafts are hidden
  automatically, and a draft's cover is only needed once it is published.
- **(b)** The Work page is trimmed to the curated set. Otherwise add one RAW
  16:10 cover for each extra public project; seven are public today (§14.14).

| # | Asset | Why it is launch-blocking |
|---|---|---|
| 1–6 | ZansiHustle ecosystem B, C ×3, D, E | Without them the flagship section is text-only, and it is the site's main product proof |
| 7 | ZansiHustle cover | The Work page's lead card and the case study both CTAs on Home lead to |
| 8–14 | Covers for every **published** Selected Work project: Ovulae, CPMA and MetaPOS now, plus SmartFuture, DailyRise, HypeGrid and AltoCoins as each is published | Otherwise Home shows navy name panels instead of work |
| 15 | Default social image | Link previews for the domain. It needs the §14.6 code change to reach pages other than Home |
| 16–18 | `favicon.ico`, `icon.png`, `apple-icon.png` | Browser tabs, bookmarks and the home-screen icon currently show a generic icon |

Case-study galleries are **not** launch-blocking. In production a section with no
images simply doesn't render, so a case study with only its cover still looks
intentional. **Strongly recommended** alongside launch: ZansiHustle
`desktop-01…03`. The flagship case study is where both Home CTAs lead.

---

## 17. Ideal assets for full case studies

Supply these after launch, project by project, to make the case studies
excellent:

| Project | Ideal set (beyond P0) |
|---|---|
| **ZansiHustle** | 3 desktop screens showing the products full size (marketplace, ZansiDispatch, and ZansiPulse or admin) · **4** mobile screens (with the `mobile-04` slot) · a dedicated `og.jpg` |
| **SmartFuture, DailyRise, HypeGrid, AltoCoins, TNXOne** | Cover + 3 desktop screens (overview → core workflow → management/reporting) + 4 mobile screens where a mobile UI exists + `og.jpg` |
| **Ovulae** | App, Portal and Website leads now. The ideal adds 3–4 more app screens (one per life-stage module), a second Portal role dashboard and a second website section. **These need a code change** to render deliverable galleries, or a data change to add project-level `images`. The Ovulae page is currently the thinnest featured case study (§14.3) |
| **CPMA** | 3 desktop screens (up to 5 for a 1 + 2 + 2 rhythm) + the mobile lead, recaptured at 16:9 and 9:16 where the system is still accessible, instead of the legacy 1918 × 990 and 600 × 950 captures |
| **MetaPOS** | 3 desktop screens + the POS lead, recaptured if possible. Optional design lead |
| **Catalyst Risk Tool / Catalyst FX Dynamics Website** (if kept) | RAW cover + 3 screens each, plus the CRT mobile and desktop-app leads |
| **All** | One line of alt text per image (§3.6) and a short caption list, so each screen's description can replace the generic placeholder alt text in the data |
