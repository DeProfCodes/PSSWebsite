# Content migration

This tracks what has moved from the legacy site
([`CURRENT_WEBSITE_AUDIT.md`](../CURRENT_WEBSITE_AUDIT.md)) and the PSS briefs
into typed data, what is public at launch, and which decisions remain.

**Ground rule:** data holds only facts from the audit, supplied by PSS, or
visible in the supplied product screenshots. Missing values stay empty, and
anything without real content is not rendered. Open questions go into
`reviewNotes` (projects/clients, never rendered) or into this document.

> ⚠️ **Credentials.** The legacy repository has plaintext credentials in its git
> history (SMTP mailbox password, two SQL Server logins, a Gmail app password;
> audit §1.14, §13.1). **None were copied here, and all of them must be rotated
> separately.** See [DEPLOYMENT.md → Credential rotation](DEPLOYMENT.md#6-credential-rotation).

---

## 1. Summary

| Content | Status | Where | Source |
|---|---|---|---|
| Company identity, positioning line, founder (name, role, LinkedIn) | ✅ Live | `src/data/company.ts` | audit §3.3, §3.7 · PSS |
| Public figures: **Since 2017, 30+ clients, 37+ projects delivered, End-to-End Delivery** | ✅ Live (approved by PSS 2026-09-23) | `src/data/company.ts`, `src/data/home.ts` | PSS |
| "4 active projects" | Not published (unconfirmed) | `src/data/company.ts` | audit §3.10 |
| Home copy | ✅ Live | `src/data/home.ts` | PSS brief |
| About (company-first; founder as text, no portrait supplied) | ✅ Live | `src/data/about.ts` | PSS brief · audit §3.3 |
| Services: 11 services in four groups | ✅ Live | `src/data/services.ts` | PSS brief |
| Contact details and topics | ✅ Live | `src/data/contact.ts` | audit §3.7 · PSS |
| Projects: **7 public**, the rest hidden (§2) | ✅ Live | `src/data/projects.ts` | audit §5 · PSS · product screenshots |
| Client logos: 8 real logos on Home | ✅ Live | `src/data/client-logos.ts` | `public/images/clients/` |
| Testimonials | None exist; section not rendered | `src/data/testimonials.ts` (empty) | — |
| Company social profiles | None exist; none rendered | `src/data/social.ts` (empty) | audit §3.7 |
| Privacy policy, terms of use | **Not written; pages removed for launch** (§3) | — | audit §3.8 |
| Brand logo | ✅ `public/images/brand/Logo.png`; favicon and app icons cropped from it | header, footer, hero, email, icons | PSS |

---

## 2. Portfolio

### 2.1 Launch rule and public set

**A project is public only when it has real images in `public/images/projects/`
and real case-study copy.** Everything else keeps its data with
`visibility: "hidden"` (no page, not listed, legacy URLs → `/projects`).

| Slug | Name | Images (`public/images/projects/`) | Where it appears |
|---|---|---|---|
| `zansihustle` | ZansiHustle | `zansihustle/`: cover, ecosystem, mobile, zansi-tech, dispatch, pulse, admin | **Flagship**: Home ecosystem section, first on Work |
| `smartfuture` | SmartFuture | `smartfuture/`: cover, desktop-1…3, mobile-1…3 | Home Selected Work (1), Work |
| `dailyrise` | DailyRise | `dailyrise/`: cover, desktop-1…3 | Home Selected Work (2), Work |
| `cpma` | CPMA | `cpma/`: mobile-1…3 | Home Selected Work (3), Work |
| `cla-administration-tool` | CLA Administration Tool | `cla/`: web-1…6 | Work |
| `catalyst-risk-tool` | Catalyst Risk Tool (CRT) | `crt/`: mobile-1…3 | Work |
| `metapos` | MetaPOS | `metapos/`: mobile-1…3 | Work |

`share.jpg` in the ZansiHustle, SmartFuture and DailyRise folders are 1200 px
JPEG copies of the covers, used only for link previews.
`zansihustle/cover.jpg` (an earlier cover) is not used.

**Hidden:** Ovulae and its three legacy records (no images), iWatchAllTV
(screenshots exist in `iwt/` but are dominated by third-party film artwork and
broadcaster logos), AltoCoins, HypeGrid, ZansiTech, TNXOne, Catalyst FX
Dynamics Website, ApexGO, PNE Finance, MindSharp LMS, AFX Trust, WCG App, AB
Tech Mentorship Programme, Hlumis'imfundo Website, FPSL, Gcwensa, Folder Locker
and three design concepts.

**Work filters today:** All 7 · Platforms 6 · Mobile 5 · Business Systems 6 ·
FinTech 2 · Marketplace 1 · Telecommunications 1.

### 2.2 Where the copy comes from

| Project | Source |
|---|---|
| ZansiHustle | Summary, ecosystem structure and roles supplied by PSS. The five product sections describe only what the supplied screens show |
| SmartFuture, DailyRise | Written from what the supplied screens show (UI labels, flows and settings). No client quotes, figures, year, technologies or links, because none were supplied |
| CPMA, MetaPOS, CRT, CLA | Legacy detail-page copy, verbatim except for the typo fixes below. CPMA and MetaPOS also have a challenge / what we built / outcome that restates the legacy copy with no new claims |

External links: MetaPOS links to its live site. The legacy CRT URL no longer
resolves and the CLA URL now redirects to a Corporate Voice blog post, so
neither is linked.

### 2.3 Copy corrections made during migration

Only unambiguous typos were corrected. All other migrated copy is verbatim.

| Where | Legacy | Now |
|---|---|---|
| Ovulae Portal, paragraph 2 | `commissions.Admins` | `commissions. Admins` |
| CPMA features + technologies | `Twillio` | `Twilio` |
| iWatchAllTV, paragraph 1 | `IWatchAllTV` | `iWatchAllTV` |
| Technology names | `JAVA`, `Jquery`, `Restful API`, `Github` | `Java`, `jQuery`, `RESTful API`, `GitHub` |
| Founder LinkedIn | `http://linkedin.com/in/…` | `https://linkedin.com/in/…` (same profile) |

### 2.4 Publishing a project later

1. Add its images under `public/images/projects/<folder>/`.
2. In `src/data/projects.ts`, declare them with `image(path, width, height, alt)`:
   a `coverImage` (a designed 16:10 cover) or a `coverStage` (real screens
   composed by the site), plus `images` for the case-study gallery.
3. Fill in the real facts: `shortDescription`, `tagline`, `industry`, `sectors`,
   `platforms`, `description`, and whatever else is known.
4. Remove `visibility: "hidden"`. Set `featured` / `featuredOrder` to put it on Home.

`npm run build` refuses a public project that lacks a cover, copy or industry,
or whose image files are missing.

### 2.5 Portfolio items never migrated

| Item | Why |
|---|---|
| iChat App (desktop) | Only a tile title and image on the legacy HEAD home page (audit §5.4) |
| Data-analytics dashboards (Power BI, Looker, Tableau) | Tool-named tiles with images only (audit §6.9) |

---

## 3. Decisions and confirmations

### Before or soon after launch

- [ ] **Privacy policy (POPIA).** The contact form collects names, emails and
  phone numbers, and GA4 (if enabled) sets analytics cookies. The placeholder
  pages were removed rather than publishing unreviewed legal text. Add a
  reviewed policy (and terms, if wanted) as soon as possible; the footer can
  link to it again.
- [ ] Analytics **consent** approach (banner / Consent Mode) under POPIA, if GA4 is enabled.
- [ ] Re-confirm **client consent** for the projects and logos shown. The legacy
  site stated consent for its portfolio; the Work page repeats that statement in
  short form.
- [ ] Confirm the ZansiHustle, SmartFuture and DailyRise screens show demo or
  seeded data (they show names, emails and amounts).

### Content that can be improved later (not blocking)

- Confirm or extend the SmartFuture and DailyRise copy (year, technologies,
  links, outcomes); the build shows whatever is added.
- MetaPOS: the logo wall shows MetaPOS while the legacy code names the client
  Anglojungle.
- Company registration and VAT numbers; real company social profiles.
- Is 35 Lima St, Sharonlea a customer-facing office? (Pages show "South Africa";
  the `Organization` structured data carries the audit's postal address.)
- Testimonials: add approved quotes to `src/data/testimonials.ts`; the Home section appears automatically.

---

## 4. Legacy marketing copy not structured (on purpose)

Preserved verbatim in the audit and replaced by the new copy:

- Home hero (both versions), "Why South African Businesses Choose Us", the
  "Creative Software Development Agency" paragraph, features list, "Ready to
  Transform Your Business?" CTA: audit §3.2
- Footer marketing paragraph: audit §3.1
- Contact page intro and legacy validation messages: audit §3.5
- Legacy meta tags: audit §3.1, §11

---

## 5. Assets

| Asset | Status |
|---|---|
| `public/images/brand/Logo.png` | In use (header, footer, hero, email, structured data) |
| `src/app/favicon.ico`, `icon.png`, `apple-icon.png` | Cropped from the `</>` part of `Logo.png` (no redrawing or recolouring) |
| `public/images/projects/*` | 7 folders in use (§2.1); `iwt/` present but unused; `zansihustle/cover.jpg` unused |
| `public/images/clients/*` | 27 files; 8 shown (`src/data/client-logos.ts`) |
| Default social image for non-project pages | None; pages without a project image have no preview image |

Everything in `public/` is deployed and publicly reachable, including unused files.

### 5.1 Legacy asset URLs that may be linked from outside

`/img/social.png` (OG caches), `/images/mainLOGO2.webp` (possibly e-mail
signatures) and `/favicon.ico` (now served). See
[LEGACY_REDIRECTS.md → Asset URLs](LEGACY_REDIRECTS.md#5-legacy-asset-urls).
