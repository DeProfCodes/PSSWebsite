# Proficient Software Solutions — Website

Public website for **Proficient Software Solutions (Pty) Ltd**
(canonical: <https://www.proficientsoftwaresolutions.co.za>).

This repository replaces the legacy ASP.NET Core MVC site. The routing, content
model, SEO, contact endpoint, analytics and legacy redirects are in place.

**Status: production-ready launch build.** The approved visual direction
(`design-reference/home-hero-approved.png`) covers every page: Home, Services,
Work, seven case studies, About, Contact, 404 and the footer.

**Launch rule: only real content is public.** A project is public only when it
has real images in `public/images/projects/` and real case-study copy; the
others stay in the data as `visibility: "hidden"`. There are no draft, TODO or
image-placeholder states anywhere: sections without real content are not
rendered, and the build fails if a referenced image file is missing. Public
projects today: ZansiHustle (flagship), SmartFuture, DailyRise, CPMA, CLA
Administration Tool, Catalyst Risk Tool and MetaPOS
([`docs/CONTENT_MIGRATION.md`](docs/CONTENT_MIGRATION.md) §2).

The legacy site is described in [`CURRENT_WEBSITE_AUDIT.md`](CURRENT_WEBSITE_AUDIT.md)
(the factual source for all migrated content).

---

## Stack

| | Version | Notes |
|---|---|---|
| [Next.js](https://nextjs.org) (App Router, Turbopack) | 16.3.6 | Static generation by default; Server Components by default |
| React / React DOM | 19.3.0 | |
| TypeScript | 5.9.3 | `strict` + `noUncheckedIndexedAccess` |
| Tailwind CSS | 4.3.x | CSS-first config; design tokens in `src/app/globals.css` |
| ESLint | 9.x + `eslint-config-next` 16.3.6 | Core Web Vitals + TypeScript rules |
| lucide-react | 1.47.0 | Icons |
| nodemailer | 10.0.10 | SMTP transport for the contact endpoint (server-only) |
| server-only | 0.0.1 | Build-time guard that keeps secrets out of client bundles |
| Fonts (via `next/font`) | Plus Jakarta Sans + JetBrains Mono | Self-hosted at build time. Rationale: `docs/ARCHITECTURE.md` §9 |

That is the complete runtime dependency list. There is no UI framework, no
Bootstrap, no jQuery, no icon fonts and no animation library.
See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the reasoning.

Requires **Node.js ≥ 20.9** (developed and verified on Node 24.13).

---

## Getting started

```bash
npm install
cp .env.example .env.local   # optional for local work; every variable is optional in development
npm run dev                  # http://localhost:3000
```

With no environment variables set, the site runs fully. Analytics stays off
and `/api/contact` answers `503 not_configured`. To exercise the contact endpoint
locally without sending email, set `EMAIL_PROVIDER=log` plus `CONTACT_EMAIL_TO`
and `CONTACT_EMAIL_FROM` (optionally `CONTACT_EMAIL_CC`).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server (Turbopack) |
| `npm run build` | Production build (prerenders all pages and project case studies) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint, **zero warnings allowed** |
| `npm run typecheck` | Generates Next.js route types (`next typegen`), then `tsc --noEmit` |
| `npm run validate` | lint → typecheck → build (run before every push) |
| `npm run email:verify` | Checks the contact-form SMTP settings from `.env.local` — DNS, TCP, TLS and login — **without sending an email**; prints the failing stage and what to fix. Needs Node 22.18+ |

---

## Environment variables

The template is [`.env.example`](.env.example) (names only, never values).
Real values go in `.env.local` for local work (git-ignored) or in
**Vercel → Project → Settings → Environment Variables**.
`NEXT_PUBLIC_*` values are compiled into browser JavaScript, so they must never
hold secrets. All other variables are server-only.

| Variable | Scope | Required | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | public | no | Canonical origin for canonical links, sitemap, OG and JSON-LD. Default `https://www.proficientsoftwaresolutions.co.za` |
| `NEXT_PUBLIC_GA_ID` | public | no | GA4 measurement ID. Set it **only in Production**. Legacy property: `G-VLLB11SKWE` |
| `EMAIL_PROVIDER` | server | for contact form | `smtp` \| `resend` \| `log` (`log` is development only and refused in Production) |
| `CONTACT_EMAIL_TO` | server | for contact form | Primary PSS inbox (comma-separated list allowed) |
| `CONTACT_EMAIL_CC` | server | Production | Copied on every enquiry (comma-separated). Production value: `nproficientm@gmail.com` |
| `CONTACT_EMAIL_FROM` | server | for contact form | Sender address (must be authorised by the provider via SPF/DKIM) |
| `SMTP_HOST` `SMTP_PORT` `SMTP_USERNAME` `SMTP_PASSWORD` | server | if `smtp` | SMTP mailbox. Use the provider's published outgoing-mail host and port; the host must match the server's TLS certificate. TLS is mandatory: 465 = implicit TLS, 587 = STARTTLS; plaintext-only ports are refused. Check with `npm run email:verify` |
| `RESEND_API_KEY` | server | if `resend` | Resend API key |
| `TURNSTILE_SECRET_KEY` | server | **leave empty** | Would require a Turnstile token on every enquiry, and the form does not render the widget |

Vercel also provides `VERCEL_ENV`. Only `production` deployments are
indexable; Preview deployments serve `Disallow: /` and `noindex`. The content
is identical in both.

---

## Directory structure

```
.
├── CURRENT_WEBSITE_AUDIT.md      Forensic audit of the legacy site (content source of truth)
├── design-reference/             Approved visual references (direction, not specs)
├── docs/                         Architecture, migration, redirects, deployment
├── next.config.ts                Legacy + canonical-host redirects, images, security headers
├── public/
│   └── images/                   Organised asset destinations
│       ├── brand/Logo.png        The current PSS logo (supplied; never recreated)
│       ├── projects/<folder>/        Project images, declared with exact paths in src/data/projects.ts
│       ├── clients/                  Client logos (the ones shown are listed in src/data/client-logos.ts)
│       └── people/  services/  technologies/
└── src/
    ├── app/                      Routes (App Router)
    │   ├── layout.tsx            Root layout: global metadata, header/footer shells, JSON-LD, GA
    │   ├── page.tsx              Home
    │   ├── about/ services/ contact/
    │   ├── favicon.ico icon.png apple-icon.png   Cropped from the supplied logo artwork, unmodified
    │   ├── projects/             Portfolio index + [slug] case studies (SSG)
    │   ├── api/contact/          POST /api/contact
    │   ├── legacy/project-details/  Maps legacy query-string project URLs → 308
    │   ├── robots.ts  sitemap.ts  manifest.ts  not-found.tsx  error.tsx
    │   └── globals.css           Tailwind + design tokens (brand, ink, semantic, .theme-dark, motion)
    ├── components/
    │   ├── analytics/            GA4 loader
    │   ├── brand/                PssLogo
    │   ├── contact/              ContactForm
    │   ├── icons/                ServiceIcon
    │   ├── layout/               Container, PageHero, SiteFooter, SkipLink
    │   ├── media/                MediaFrame (every product image)
    │   ├── navigation/           SiteHeader, HeaderFrame, NavLink, MobileNav, Breadcrumbs
    │   ├── portfolio/            ProjectCard, ProjectCover, EcosystemMap, WorkFilters
    │   ├── sections/             FinalCta, HowWeWork, Testimonials;
    │   │                         home/ (HomeHero, HeroArchitecture, CredibilityBand, FlagshipEcosystem,
    │   │                                SelectedWork, WhatWeBuild, WhyPss, ClientLogos)
    │   ├── seo/                  JsonLd
    │   └── ui/                   Button/ButtonLink, Eyebrow, SectionHeading, TextLink
    ├── config/                   site identity, route map, deployment environment
    ├── data/                     Typed content: company, about, contact, home, services, technologies,
    │                             clients, projects, testimonials, navigation, social, seo, taxonomy
    ├── lib/                      projects queries, media lookup, legacy mapping, SEO, JSON-LD, analytics,
    │   ├── contact/              validation, rate limit, captcha, email content, request handler
    │   └── email/                provider interface + SMTP / Resend / log transports
    └── types/                    Content models, contact API contract, gtag globals
```

## Where to change things

| To change… | Edit |
|---|---|
| Company facts, founder, public figures (30+ clients, 37+ projects) | `src/data/company.ts` |
| Home copy (every section) | `src/data/home.ts` |
| About page copy | `src/data/about.ts` |
| Services (11, in four groups) | `src/data/services.ts` |
| Testimonials (publish only approved quotes) | `src/data/testimonials.ts` |
| Navigation items and the header CTA | `src/data/navigation.ts` |
| Address, phone, emails | `src/data/contact.ts` |
| A project / case study, flagship, Selected Work order | `src/data/projects.ts` (`defineProject()`; the build fails if the data is inconsistent) |
| Project images | Add the file under `public/images/projects/<folder>/` and declare it with `image(path, width, height, alt)` in `src/data/projects.ts` |
| Client logos on Home | `src/data/client-logos.ts` (real files in `public/images/clients/` only) |
| Publish or hide a project | `visibility` in `src/data/projects.ts` (a public project must have a cover and copy; the build checks) |
| Work filters and legacy anchors | `src/data/taxonomy.ts` |
| Page titles and meta descriptions | `src/data/seo.ts` |
| Colours, radius, widths, fonts | `src/app/globals.css` (tokens) and `src/app/layout.tsx` (fonts) |
| Legacy redirects | `next.config.ts` and [`docs/LEGACY_REDIRECTS.md`](docs/LEGACY_REDIRECTS.md) |

---

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md): decisions and why they were made
- [`docs/CONTENT_MIGRATION.md`](docs/CONTENT_MIGRATION.md): what was migrated, missing facts per project, decisions needing approval
- [`docs/IMAGE_ASSET_REQUIREMENTS.md`](docs/IMAGE_ASSET_REQUIREMENTS.md): capture and format guidance for future project images
- [`docs/LEGACY_REDIRECTS.md`](docs/LEGACY_REDIRECTS.md): every legacy URL and where it goes
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md): Vercel setup, DNS cut-over **without breaking email**, launch checklist

## Security

- This repository contains **no credentials**. `.env*` files are git-ignored,
  except the names-only `.env.example`.
- The legacy repository has plaintext SMTP, SQL Server and Gmail credentials in its
  git history. **All of them must be rotated separately.** This rebuild does not
  rotate them. See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md#6-credential-rotation).
- `CURRENT_WEBSITE_AUDIT.md` contains no secrets, but it does name hosting hosts,
  database names and internal mailboxes. Keep this repository **private**, or move
  the audit out before making it public.
