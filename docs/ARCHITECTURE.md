# Architecture

This document explains the foundation's major decisions and the reasons behind them.
The legacy system is described in [`../CURRENT_WEBSITE_AUDIT.md`](../CURRENT_WEBSITE_AUDIT.md)
(cited below as "audit §x").

## 1. Goals and constraints

| Goal | Consequence |
|---|---|
| A public company/portfolio site where **SEO matters** | Next.js App Router with every page prerendered to HTML; complete per-page metadata |
| One visual language across the whole site | The approved hero direction (§9) was extended to every public page on 2026-09-23 (§17) |
| **Content must stay factual** | Content lives as typed data migrated from the audit or supplied by PSS. Unknown values stay `undefined`; open questions go in `reviewNotes` |
| The legacy site had many problems (three templates, three Bootstrap versions, JS errors, no SEO, credentials in git) | Minimal dependencies, strict TypeScript, zero-warning lint, secrets only in environment variables |
| Legacy page URLs must keep working | Permanent redirects (see [LEGACY_REDIRECTS](LEGACY_REDIRECTS.md)) |

## 2. Stack choices

- **Next.js 16 App Router.** Static generation gives crawlable HTML with
  per-page metadata. The audit (§15.4) flagged a client-only SPA as an SEO risk.
  File-based metadata routes cover robots, sitemap, manifest and icons.
- **Server Components by default.** Only five small components ship JavaScript
  to the browser:
  - `HeaderFrame`: scroll state for the sticky header.
  - `NavLink`: reads the current path for `aria-current`.
  - `MobileNav`: menu state, Escape, scroll lock.
  - `WorkFilters`: the Work-page filter bar (§6).
  - `ContactForm`: validation, submission and result states.

  Every section, the hero visual, the ecosystem map and the scroll reveals are
  server-rendered HTML/CSS/SVG with **no client JavaScript**. `error.tsx` is a
  client component because Next.js requires it.
- **Tailwind CSS 4.** Configuration is CSS-first. Colours, radius and widths are
  CSS variables mapped to utilities, so the approved design system replaces the
  values in one file (§9).
- **Dependencies are minimal and each is justified:**
  - `lucide-react`: icons, requested in the brief. Tree-shaken, SVG components, no icon font.
  - `nodemailer`: SMTP transport. It is the standard library for this, has no
    dependencies of its own and is server-only.
  - `server-only`: turns any accidental import of secret-reading code into a
    client component into a **build error**.
  - Not added: a UI kit, `clsx`/`tailwind-merge` (a 3-line `cn()` is enough),
    zod (validation is 60 lines of plain TypeScript shared by client and server),
    an animation library, a Resend SDK (plain `fetch`), `@next/third-parties`
    (GA is two `next/script` tags).
- **TypeScript 5.9 rather than 7.** TypeScript 7 (the native compiler) is
  published, but Next.js' TypeScript plugin and build-time type checking target
  the 5.x API. Revisit when Next.js supports it officially.
- **ESLint 9 rather than 10.** `eslint-config-next` 16.3.6 and its plugins are
  scaffolded against ESLint 9. npm shows a deprecation notice for ESLint 9;
  upgrade when the Next.js config supports 10.

## 3. Rendering model

| Route | Rendering |
|---|---|
| `/`, `/about`, `/services`, `/projects`, `/contact` | Static (prerendered at build) |
| `/projects/[slug]` | SSG through `generateStaticParams`. `dynamicParams = false`, so unknown slugs are a hard 404 with no on-demand rendering |
| `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest` | Static |
| `/api/contact` | Dynamic (Node.js runtime) |
| `/legacy/project-details` | Dynamic (reads the query string to choose a redirect target) |

The build prerenders 22 routes, including 7 case studies. Development, Preview
and Production render identical content. Nothing reads a database at request time.

## 4. Directory layout

`src/app` holds only routing concerns. Everything reusable sits beside it:

- `components/` is grouped by role (`layout`, `navigation`, `sections`, `ui`,
  `portfolio`, `media`, `contact`, `content`, `icons`, plus `seo` and
  `analytics`). Components stay small and readable, with no generic "SaaS
  template" abstractions.
- `data/` is content, typed by `types/content.ts`.
- `lib/` is behaviour: queries, mapping, SEO builders, contact pipeline and email transports.
- `config/` is site identity, the route map and deployment-environment helpers.

## 5. Content model

Types live in [`src/types/content.ts`](../src/types/content.ts): `Company`,
`Service`, `Project` (with `ProjectDeliverable`), `Client`, `Testimonial`,
`Technology`, `ContactDetails`, `NavigationItem`, `SocialLink`, plus shared
`ImageAsset`.

Key rules:

1. **The legacy content store is replaced.** The old site kept portfolio content
   in a 788-line C# `switch` and in Razor views (audit §1.2, §13.1 #19). It now
   exists once, in `src/data/*.ts`.
2. **No fabrication.** Optional fields (`challenge`, `solution`, `outcome`,
   `seoTitle`, `registrationNumber`, …) stay empty until real content exists.
3. **Projects and deliverables.** The legacy site had separate Web and Mobile
   pages per project (22 URLs for 17 projects). The new model has **one project
   per product**:
   - Project-level fields hold the primary deliverable, which is the legacy Web
     page where one existed.
   - Every other platform is a `ProjectDeliverable`, including desktop and design
     work that previously existed only as cards.
   - This allows one case study per product, and the "Full Platform" filter can
     be derived.
4. **The legacy link is kept.** `Project.legacy` stores the old `projectNameType`,
   the variants that existed, and the legacy "remarks". Those remarks were
   displayed inconsistently by a bug (audit §5.3), so they are kept verbatim for
   an editor and not rendered.
5. **`reviewNotes`** records human decisions still needed (naming, claims,
   copyright, broken URLs). They are never rendered.
6. **Integrity is checked at build time.** `src/lib/projects.ts` validates the
   data when it loads. The build fails on:
   - duplicate ids or slugs, or invalid slugs
   - unknown client references
   - a public project without platforms, card copy, an overview, an industry or a cover
   - a public project image without a recorded size, or whose file is missing from `/public`
   - deliverables on undeclared platforms
   - a featured or flagship project that is hidden, or more than one flagship
   - a `supersededBy` or ecosystem link to an unknown project
   - duplicate legacy keys, or a public legacy project losing its page
7. **Every public project has a case-study page**, because the build refuses a
   public project without real copy and a real cover. Hidden projects have none
   (404). Seven are public today.

### Launch rule: only real, asset-backed work is public (PSS, 2026-09-23)

A project is public only when it has real images in `public/images/projects/`
and real case-study copy. Everything else stays in the data with
`visibility: "hidden"`: not listed, no page (404), not in the sitemap or
structured data, and its legacy URLs fall back to `/projects`.

| | Projects |
|---|---|
| **Flagship** (`flagship`) | ZansiHustle: first on the Work page, and on Home as a connected product ecosystem (`ecosystem`: hub → grouped products → foundation) |
| **Selected Work on Home** (`featured`, `featuredOrder`) | SmartFuture, DailyRise, CPMA |
| **Also on the Work page** | CLA Administration Tool, Catalyst Risk Tool, MetaPOS (`additionalWorkOrder`) |
| **Hidden** | Ovulae (and its three legacy records), AltoCoins, HypeGrid, ZansiTech, TNXOne, iWatchAllTV (screens dominated by third-party film artwork), Catalyst FX Dynamics Website, ApexGO, PNE Finance, MindSharp LMS, AFX Trust, WCG App, AB Tech, Hlumis'imfundo, FPSL and five card-only items |

- `sectors` and `solutionTags` drive the Work filters (§6) and related projects.
- `tagline`: the one-line outcome shown under the case-study title and on cards.
- Optional case-study fields render only when filled with real facts: `scope`,
  `challenge`, `solution`, `outcome`, `results` (measured, with evidence),
  `technologies`, `websiteUrl` and `testimonialId`.
- `supersededBy` sends the old Ovulae URLs to the Ovulae case study; while it is
  hidden, they fall back to `/projects`.
- To publish a hidden project: add its images and copy, then remove
  `visibility: "hidden"`. The build checks it is complete.

### Images

- **Declared explicitly.** Every image a public project shows is listed in
  `src/data/projects.ts` with its exact path and intrinsic size
  (`image(path, width, height, alt)`), e.g. `/images/projects/dailyrise/cover.png`.
  Folder names are whatever exists on disk (`cla`, `crt`, …); there is no
  filename guessing.
- **A missing file fails the build** (`resolveMediaSrc()` in `src/lib/media.ts`,
  also run by the data integrity check), so a broken image or empty frame can't ship.
- **One component, real ratios.** `MediaFrame` renders `next/image` in a frame at
  the image's own ratio unless a layout sets one (16:10 cards and covers). Galleries
  use the first screen's ratio for the whole set, so rows line up.
- **Covers.** `coverImage` is a designed cover. Projects that only have real
  screens get a `coverStage` instead: `ProjectCover` places the screens side by
  side on a plain stage whose colour matches their backdrop (nothing cropped or
  redrawn). Case studies with a stage cover skip the hero image and show the
  screens in their sections.
- **Link previews** use `shareImage` (1200 px JPEG copies of the designed covers,
  95–125 KB) or else the cover / first screen.
- **Client logos** (Home) are listed in `src/data/client-logos.ts`, real files only.
- Capture and format guidance for future images: [IMAGE_ASSET_REQUIREMENTS](IMAGE_ASSET_REQUIREMENTS.md).

## 6. Work filters are derived, not hardcoded

The Work page (`/projects`) lists every published project. Filters come from
`workFilterDefinitions` in `src/data/taxonomy.ts`, matched against project data
by `projectMatchesWorkFilter()` in `src/lib/projects.ts`:

| Filter | Matches |
|---|---|
| All | Everything |
| Platforms | Projects on two or more of web, mobile, desktop or backend (`fullPlatformContributors`) |
| Web · Mobile | `platforms` |
| Business Systems | `solutionTags` contains `business-systems` |
| FinTech · Marketplace · Health · Telecommunications | `sectors` |

- A filter appears only when it narrows the list: at least one project matches,
  but not all of them. (Web currently matches all seven, so it is hidden.)
- Counts today: All 7 · Platforms 6 · Mobile 5 · Business Systems 6 · FinTech 2 ·
  Marketplace 1 · Telecommunications 1.
- **Progressive enhancement.** The server renders every card. `WorkFilters`
  only toggles `hidden` on cards whose `data-filters` lack the active key.
  Without JavaScript, all projects show.
- **The filter lives in the URL** (`?filter=fintech`), so filtered views can be
  shared and survive reloads. It uses `replaceState`, so it doesn't add history
  entries. An unknown value falls back to All.
- **Legacy anchors keep working.** `/Projects/AllProjects#web` → 308 →
  `/projects#web` selects Web; `#mobile` selects Mobile; `#desktop`, `#uxui`
  and `#api` show All (`legacyAnchorFilters`).

## 7. Routing and redirects

- Legacy page URLs get 308 redirects in `next.config.ts`. Matching is
  **case-insensitive**, which is Next's default and matches the legacy ASP.NET
  behaviour.
- Legacy project URLs carry the project in the query string. A `beforeFiles`
  rewrite sends them to a small route handler that looks up the slug **from the
  project data**, so the mapping has one source of truth, and returns a clean 308.
- The **canonical host** redirect (apex → `www`, 308) lives in `next.config.ts`,
  so it is version-controlled and testable.
- This website serves **only** the website: no proxies, no legacy data APIs.

Details: [LEGACY_REDIRECTS](LEGACY_REDIRECTS.md).

## 8. SEO

| Concern | Implementation |
|---|---|
| Global metadata | `src/app/layout.tsx`: `metadataBase`, title template `%s \| Proficient Software Solutions`, default description, Open Graph and Twitter defaults |
| Per-page metadata | `buildPageMetadata()` (`src/lib/seo.ts`) returns title, description, canonical, a complete Open Graph block and a Twitter/X card. Next.js merges metadata shallowly, so every page supplies complete objects |
| Canonicals | Absolute, on the `www` host, one per page. The root layout deliberately sets none, because an inherited canonical would point every page at `/` |
| Copy | `src/data/seo.ts` holds provisional, factual titles and descriptions in one reviewable place |
| robots.txt | Production allows crawling (except `/api/`) and advertises the sitemap. Every non-production deployment serves `Disallow: /` and the root layout emits `noindex` |
| sitemap.xml | 5 static routes plus the 7 public case studies. `lastModified` is omitted until real dates exist, since a fake one would mislead crawlers |
| Social images | Only images that exist are emitted. A case study uses its cover, and its Twitter card switches to `summary_large_image` automatically. **There is no site-wide default yet:** a root `src/app/opengraph-image.png` would only reach Home, because every page sets its own Open Graph object. A fallback in `buildPageMetadata()` is needed with that asset (IMAGE_ASSET_REQUIREMENTS §14.6) |
| Icons | `src/app/favicon.ico` (16/32/48), `icon.png` (512) and `apple-icon.png` (180, navy background), cropped from the `</>` part of the supplied logo artwork without redrawing or recolouring. Next.js wires them into every page |
| Headings | Exactly one `<h1>` per page (verified), sections use `<h2>`, and the footer uses small `<h2>` group labels. `PageHero` (inner pages) and `HomeHero` own the `<h1>` |
| Crawlable links | Project cards are real `<a href>` links. The legacy site used `onclick` handlers (audit §9.2) |

### Structured data (JSON-LD)

- A site-wide graph with **`Organization`** (legal name, logo, founding date,
  address, phone, emails, sales `ContactPoint`, founder `Person` with LinkedIn
  `sameAs`) and **`WebSite`**.
- On each case study, a **`CreativeWork`** (created by the Organization) and a
  **`BreadcrumbList`**.
- **Why not SoftwareCompany or ProfessionalService?** `SoftwareCompany` is not a
  schema.org type. `ProfessionalService` is deprecated by schema.org because it
  was confused with `Service`. `Organization` is the valid, accurate type.
- **Add `LocalBusiness` only if** the business confirms that 35 Lima St is a
  customer-facing office.
- **Add `sameAs`** by listing real company social profiles in
  `src/data/social.ts`. They flow in automatically.

## 9. Visual system (approved direction, 2026-09-23)

The approved direction is premium **dark navy surfaces first**, with blue/cyan
used as controlled energy. It is deliberately not the legacy look:

- no Bootstrap blue gradients, waves, stock photography or template illustrations
- no mockups or screenshots in the hero

The reference image is `design-reference/home-hero-approved.png`. It is a
direction, not a spec: its placeholder claims and partner logos are not used.

### Design tokens (`src/app/globals.css`)

| Group | Tokens | Notes |
|---|---|---|
| Brand | `--brand-deep #167fc5`, `--brand-azure #0c9dde`, `--brand-cyan #31bfff` | **Sampled from the supplied logo** (`public/images/brand/Logo.png`) |
| Ink (dark surfaces) | `--ink-950 #030a16` … `--ink-700 #16304f` | Near-black navy scale |
| Semantic | `--background --foreground --surface --surface-elevated --primary --primary-hover --primary-foreground --accent --accent-foreground --muted --muted-foreground --border --ring --danger --success` | What components use |
| Shape | `--radius` (10px), `--radius-panel` (18px) | `rounded-base`, `rounded-panel` |
| Layout | `--container-content` 80rem, `--container-narrow` 48rem, `--container-wide` 88rem, `--header-height` 64px / 72px (≥ lg) | Header, hero and band use `wide` so their edges align |
| Motion | `--animate-float-slow`, `--animate-node-pulse`, `--animate-glow`, `--animate-line-flow`, `--animate-menu-in` | Slow and restrained. Always applied with `motion-safe:` |

**Dark context.** Adding `.theme-dark` to a section re-points the same
semantic tokens: background, foreground, muted text, border, accent (cyan) and
focus ring (light cyan). Components therefore have no dark variants: a
`Button variant="secondary"` or `text-muted-foreground` simply adapts.

**Page rhythm.** Pages alternate surfaces so long pages read as chapters:
navy `.theme-dark` sections (`bg-ink-950` / `bg-ink-900`) with white,
`bg-canvas` (`#f6f8fb`) and `bg-canvas-blue` (`#edf3fa`) light sections. Every
inner page opens with the same navy `PageHero` and closes with the same
`FinalCta` and footer.

**Shared utilities** (`@utility` in `globals.css`): `text-display-2` and
`text-display-3` (section headline scale), `text-emphasis` (the accent line of
a headline: solid accent on light, the cyan → azure gradient on dark, system
colour in forced-colours mode) and `bg-tech-grid` (the faint engineering grid).

**Scroll reveal.** Elements with `.reveal` fade and rise into place using a CSS
scroll-driven animation (`animation-timeline: view()`). It needs no
JavaScript, applies only where the browser supports it and the visitor hasn't
asked for reduced motion, and otherwise leaves content fully visible.

**Contrast (WCAG 2.2 AA), checked:**

| Pair | Ratio |
|---|---|
| White on `--primary` `#0b72c7` | 4.9:1 |
| White on `--primary-hover` | 4.5:1 |
| Dark muted text on `--ink-950` | 9.4:1 |
| Light muted text on white | 6.6:1 |

The logo's own `#167fc5` would give only 4.3:1 with white text, which is why
the primary button uses the slightly deeper `#0b72c7`. The large gradient
headline text (cyan → azure) sits far above the 3:1 needed for large text.

### Typography

- **Plus Jakarta Sans** is the single primary family for UI, headings and body.
  - It is clean and technical without being cold.
  - Its heavy weights (700–800) are strong enough to carry a confident headline.
  - Its lowercase is excellent and highly readable at body sizes.
  - It is a variable font, so one file covers every weight.
  - It sits close to the geometric grotesk in the approved reference, without
    decorative or "futuristic" traits.
- **JetBrains Mono** is an accent only: eyebrows and tiny technical labels (such
  as the hero node indices). It gives an engineering signature in small doses. It
  is not preloaded, because it is never used for large or critical text.
- Both are loaded with `next/font/google`:
  - self-hosted at build time, with no runtime request to Google
  - `display: swap` with metric-matched fallbacks, so there is no layout shift
  - exposed as `--font-sans` and `--font-mono`
- Hero headline sizing: `clamp(2.25rem, 9.6cqi, 5rem)`, measured against its own
  column with a container query. It stays exactly two lines ("Software That
  Moves / Business Forward.") at every width from 430 px up, and three lines on
  small phones.

### Breakpoints

These are Tailwind's defaults, used mobile-first (sm 640, md 768, lg 1024,
xl 1280). The desktop header and the side-by-side hero start at `lg`. Legacy
Bootstrap breakpoints were not copied.

## 10. Components

- **Brand:** `PssLogo` renders the supplied logo file unmodified, through
  `next/image` (sized by a height class, with a responsive srcset).
- **Layout:** `Container` (width tokens + gutters), `PageHero` (the
  navy inner-page opening: breadcrumbs, eyebrow, the single `<h1>`, lead, slot
  for facts; it can let the next section's image overlap its bottom edge),
  `SiteFooter` (navy: logo, positioning line, Company / Services / Get in touch /
  Legal), `SkipLink`.
- **Navigation:**
  - `SiteHeader` (server): logo, the five links (Home, Services, Work, About,
    Contact), and "Book a Consultation" (`/contact?topic=consultation`).
  - `HeaderFrame` (client): sticky. Transparent with a hairline over every
    page's navy opening, then a translucent blurred navy bar once scrolled. Uses
    `useSyncExternalStore` on scroll, so there is no effect-driven state.
  - `NavLink`: `aria-current`, rendered as a cyan underline on the header edge.
  - `MobileNav` (client, below `lg`), which uses a portal into
    `#mobile-menu-root` because the blurred header would otherwise trap a
    `position: fixed` child:
    - a two-line toggle that morphs into a close mark, and a full-height navy
      sheet with large links and the CTA
    - scroll lock, with `<main>`/`<footer>` made `inert`
    - closes on Escape (focus returns to the toggle), on route change and on
      resize to desktop
  - `Breadcrumbs`.
- **Home sections** (`components/sections/home/`), in page order:
  - `HomeHero` and `HeroArchitecture`: the approved hero. A layered navy
    backdrop, headline with gradient emphasis, two CTAs, a six-item capability
    row, and the decorative (`aria-hidden`) glass "platform" visual with SVG
    connectors. On phones it simplifies to a centre panel plus a 2×2 grid.
  - `CredibilityBand`: four verifiable facts, also reused on About.
  - `FlagshipEcosystem`: ZansiHustle as one business vision, rendered by
    `EcosystemMap`.
  - `SelectedWork`: featured projects in a fixed rhythm (feature → pair →
    feature with the image on the right → pair).
  - `WhatWeBuild` (capabilities linking to Services anchors) and `WhyPss`
    (five commitments).
- **Shared sections** (`components/sections/`): `HowWeWork` (four steps; Home
  and Services), `Testimonials` (only approved quotes; TODO cards in preview),
  `FinalCta` (Start a Project / Book a Consultation plus direct email and phone).
- **Portfolio:**
  - `ProjectCard`: `feature` (image beside text) or `standard` (image above),
    16:10 cover, industry eyebrow, tagline, platform chips and one stretched link
    to the case study.
  - `EcosystemMap`: hub → grouped products → foundation, joined by connector
    lines and junction dots in the hero's style on desktop, and by a vertical
    spine on phones. Every label is live text.
  - `WorkFilters` (client, §6).
- **Media:** `MediaFrame` (§5, "Images").
- **Contact:** `ContactForm` (client) and `ContactFormWithTopic`, which reads
  `?topic=` inside `<Suspense>` so the page stays static.
- **Home trust:** `ClientLogos`: real client logos, balanced by visual area,
  greyscale at rest and full colour on hover.
- **Covers:** `ProjectCover` (§5, "Images").
- **UI:** `Button`/`ButtonLink` (sizes sm/md/lg/xl; primary with a restrained
  glow), `Eyebrow`, `SectionHeading`, `TextLink`, and `ServiceIcon`
  (`components/icons/`, lucide icons keyed by service).

## 11. Contact endpoint (`POST /api/contact`)

The contract is in `src/types/contact.ts` and the pipeline in `src/lib/contact/handler.ts`:

```
content-type = JSON → same-origin check → ≤16 KB → parse → rate limit (per IP)
→ honeypot → validate + sanitise → Turnstile (if configured) → transport → send
```

- **Real outcomes only.** Success is returned only when the provider accepted
  the message. The legacy site reported success even when SMTP failed (audit §1.13).

  | Status | Meaning |
  |---|---|
  | 200 | Accepted by the provider |
  | 422 | Invalid fields, with per-field messages |
  | 400 | Malformed request or failed captcha |
  | 403 | Cross-site origin |
  | 413 | Body over 16 KB |
  | 415 | Not JSON |
  | 429 | Rate limited, with a `Retry-After` header |
  | 502 | The provider failed |
  | 503 | Email is not configured |

- **Sanitisation:**
  - Control characters and bidirectional-override characters are stripped.
  - Single-line fields (name, company, email, phone) can't contain line breaks, which blocks header injection.
  - Visitor input is HTML-escaped in the email. The legacy site inserted it raw.
- **Recipients.**
  - **To:** the primary PSS inbox (`CONTACT_EMAIL_TO`).
  - **CC:** every address in `CONTACT_EMAIL_CC`. One or more addresses,
    comma-separated and validated. Duplicates of a To address are dropped.
    Production must include `nproficientm@gmail.com`, per PSS. A production
    deployment without a CC logs a warning.
  - **Reply-To:** the enquirer.
  - **From:** our own authorised address.
- **Email body** (`src/lib/contact/email-content.ts`). A new, clean template;
  the legacy one is not reused:
  - responsive table layout, fluid up to 600 px, with inline styles
  - the current PSS logo (hosted at `/images/brand/Logo.png`; until the domain is
    live, clients show the alt text) and the name
  - the enquirer's name, company, email, phone, what they need (topic) and project details
  - the submission time in SAST
  - a plain-text alternative

  A branded transactional-email design will follow the new brand system later.
- **Spam:**
  - A honeypot field (`website`). A filled honeypot gets a normal-looking 200,
    so bots learn nothing, and nothing is sent.
  - Optional Cloudflare Turnstile, enforced only when `TURNSTILE_SECRET_KEY` is set.
- **Rate limiting.** The limit is 5 per IP per 10 minutes, behind a `RateLimiter`
  interface. The default in-memory store is per serverless instance. For a hard
  limit, swap in a shared store (Upstash/Vercel KV) or add a Vercel Firewall rule.
- **Providers.** There is an `EmailProvider` interface with `smtp` (nodemailer,
  TLS enforced), `resend` (HTTP API) and `log` (development only, refused in
  Production). Choosing a provider is a configuration change. Adding one is a new
  file plus a `switch` branch.
- **Secrets** are read only in `src/lib/server-env.ts`, which imports `server-only`.
- **Fields:** name, company (optional), email, phone (optional), topic ("What do
  you need?": new project, improve existing software, consultation, support,
  other) and project details (at least 10 characters). `?topic=` preselects the
  topic, so "Book a Consultation" links arrive with it chosen.
- **Shared validation.** `validateContactSubmission()` has no server
  dependencies. The form runs it before sending and shows the same per-field
  errors the server would return.
- **Not yet implemented** (a product decision): an auto-reply to the visitor, and
  storing enquiries so none are lost if email fails.

## 12. Analytics

- GA4 loads once, from the root layout, and **only** when `NEXT_PUBLIC_GA_ID` is
  a valid measurement ID. Set it only for the Production environment.
- Scripts load `afterInteractive`, so they never block rendering.
- Page views come from `gtag('config')`. Client-side navigations are covered by
  GA4's *Enhanced measurement → page changes based on browser history events*;
  make sure that is on in the property.
- `trackEvent()` (`src/lib/analytics.ts`) is typed for `contact_submit`,
  `book_consultation`, `project_view` and `project_external_link`. Only the
  contact form fires events so far: `contact_submit` after a successful send,
  plus `book_consultation` when the topic is a consultation.
- **Open decision:** POPIA consent. The legacy site loaded GA with no notice. A
  consent banner / Consent Mode needs a business and legal decision.

## 13. Accessibility baseline

- Semantic landmarks (`header`, `nav` with labels, `main`, `footer`), a skip
  link, and one `<h1>` per page with ordered headings.
- A visible `:focus-visible` ring from a token. It switches to light cyan on dark
  sections automatically.
- The mobile menu is keyboard-operable:
  - `aria-expanded` and `aria-controls` on the toggle
  - the next Tab stop after the toggle is the first menu link
  - Escape closes and returns focus
  - the page behind is `inert` while open
- Desktop nav: 40 px link targets with `aria-current="page"`. The mobile toggle
  is a 44 px target.
- The hero architecture visual is `aria-hidden` (decorative). The capabilities
  are real text in a list with a visually hidden heading.
- The eyebrow separators are hidden from screen readers.
- The credibility band is a `<dl>`.
- The gradient headline falls back to system text colour in forced-colours
  (Windows High Contrast) mode.
- Real `tel:` and `mailto:` links, which were plain text on the legacy site.
  Real links instead of `onclick` elements.
- `ImageAsset.alt` is required by type. The migrated gallery alt text is
  generic and must be rewritten per screenshot once images are migrated.
- A global `prefers-reduced-motion: reduce` override, and every hero animation
  uses `motion-safe:`. With reduced motion the visual is completely still, and
  the moving connector packets are not rendered at all.
- The contact form has visible labels, marks optional fields in text,
  sets `aria-invalid` and `aria-describedby` per field, moves focus to the first
  invalid field, and moves focus to the result message after sending.
- Work filters are buttons with `aria-pressed` inside a labelled group, and a
  live region announces "Showing N projects".
- Scroll reveals never hide content without support: they apply only inside
  `@supports (animation-timeline: view())` and `prefers-reduced-motion:
  no-preference`.

## 14. Performance

- Almost everything is static HTML. Client JavaScript is limited to the header,
  the Work filters and the contact form.
- The Home hero uses no images except the logo. The visual is CSS/SVG. The LCP
  element is the headline text, rendered in the first HTML response. The logo is
  `preload`ed in the header and served via `next/image` at about 2× its displayed
  size (a few KB rather than the 55 KB source).
- Animations only touch `transform`, `opacity` and `stroke-dashoffset`, on a
  handful of elements. `backdrop-filter` is limited to the five glass panels and
  the scrolled header.
- Fonts are self-hosted variable fonts. Only the primary family is preloaded.
- There is no preloader. The legacy site forced a ~1.5 s one on every page.
- `next/image` is configured for AVIF then WebP, with an explicit `qualities`
  list (required by Next 16).
- `MediaFrame` requires a `sizes` value that matches the rendered width, and
  reserves space with a fixed aspect ratio, so layout doesn't shift.
- Images are lazy by default. Only the case-study cover and the Work page's
  first card use `preload` (`priority` is deprecated in Next 16).
- Source files stay within the caps in IMAGE_ASSET_REQUIREMENTS §3.5. Visitors
  get re-encoded AVIF/WebP at the rendered width, never the source file.

## 15. Security

- No credentials in the repository. `.env*` is ignored except `.env.example`.
  The secret scan is clean.
- Baseline response headers apply to every page:
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `X-Frame-Options: DENY`
  - a restrictive `Permissions-Policy`
  - no `X-Powered-By`
- **A Content-Security-Policy is deferred.** GA, a possible Turnstile widget, a
  possible map embed and Next's inline scripts need a nonce- or hash-based policy.
  Design it with the final third-party list.
- HSTS is provided by Vercel on its domains.

## 16. Known framework notes

- `next start` (self-hosted) logs `Error: Internal: NoFallbackError` when an
  unknown `/projects/<slug>` is requested. That is framework-internal logging
  for `dynamicParams = false`, and the response is a correct 404. This is kept
  deliberately: allowing on-demand rendering would let any random slug trigger a
  render.
- Next 16 renamed `reset` to `retry` in `error.tsx` and deprecated `priority` on
  images. Route prop types (`PageProps`, `LayoutProps`) are generated by
  `next typegen`, which `npm run typecheck` runs first.

## 17. Status

**Production-ready launch build (2026-09-24).** Every page uses the approved
direction: Home (hero, credibility band, ZansiHustle ecosystem, Selected Work,
What We Build, How We Work, Why PSS, client logos, final CTA), Services, Work,
seven case studies, About, Contact, 404, error page and footer. Only real content
is rendered; testimonials appear automatically once an approved quote is added.

**Removed for launch** because they had no real content: the Privacy and Terms
pages (they only said the text was being finalised) and the testimonial slots.
