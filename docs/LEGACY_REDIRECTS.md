# Legacy URL redirects

Every public URL of the legacy ASP.NET Core MVC site (audit §11.7, §16) must keep
working after cut-over, either as an equivalent route or as a **permanent
redirect**. This document is the complete map. It was verified against a
production build on 2026-09-23 (see §7).

## 1. Principles

- **Permanent redirects use 308**, the Next.js permanent status. Search engines
  treat 308 like 301 and it preserves the request method.
- **Matching is case-insensitive**, like the legacy site (`/home/aboutus` and
  `/HOME/SERVICES` both worked; audit §1.10). This is Next's default
  (`experimental.caseSensitiveRoutes: false`).
- **Query strings pass through** (e.g. `?utm_source=…`), except on project URLs,
  where the old query **is** the project identifier and is dropped from the
  clean target.
- **Fragments** (`#web` etc.) never reach the server. Browsers re-attach them
  after a redirect whose target has no fragment of its own.
- **Project mapping comes from the project data.** Legacy project URLs are
  resolved from `Project.legacy` in `src/data/projects.ts`, the same data that
  generates the pages, so the map cannot drift from the content.

Implementation:

| What | Where |
|---|---|
| Static page redirects | `next.config.ts` → `redirects()` |
| Project URLs (query-string based) | `next.config.ts` → `rewrites().beforeFiles` sends `/Projects/ProjectDetails` to `src/app/legacy/project-details/route.ts`, which calls `resolveLegacyProjectPath()` in `src/lib/legacy.ts` and returns a 308 |

## 2. Canonical host

| Request | Result |
|---|---|
| `https://proficientsoftwaresolutions.co.za/<anything>` | 308 → `https://www.proficientsoftwaresolutions.co.za/<anything>` (query kept) |

- This lives in `next.config.ts` (`canonicalHostRedirect`), so it is
  version-controlled and testable. A Vercel domain-level redirect of the apex to
  `www` is equivalent and may be used as well.
- A legacy path on the apex host takes two hops (host, then path). Both are
  permanent.
- The legacy code used both hosts (audit §1.18). `www` is the canonical host from
  the rebuild brief.

## 3. Page redirects

| Legacy URL | New URL | Notes |
|---|---|---|
| `/` | `/` | Unchanged |
| `/Home` | `/` | Legacy duplicate of home |
| `/Home/Index` | `/` | Legacy duplicate of home |
| `/Home/AboutUs` | `/about` | |
| `/Home/Services` | `/services` | Legacy in-page anchors `#about`/`#services` have no equivalent yet; the browser keeps them, harmlessly |
| `/Home/Contact` | `/contact` | GET. A **POST** also gets a 308 and is no longer processed. The only known caller was the legacy site's own form (audit §15.5); the new endpoint is `POST /api/contact` |
| `/Home/Error` | `/` | The legacy error handler never existed (returned 404) |
| `/Projects/AllProjects` | `/projects` | The browser keeps the anchor (`#web`, `#mobile`, …), and the Work page turns it into a filter (see §6) |
| `/Projects/CatalystFXDynamicsWeb` | `/projects` | Broken legacy action (500). Target as recommended in audit §15.7 |
| `/Portfolio`, `/Portfolio/*` | `/projects` | The 13 hidden legacy `/Portfolio/…` links all returned 404 (audit §5.2) |

### Deliberately **not** redirected

| URL | Why |
|---|---|
| `/Projects` (bare) | It returned 404 on the legacy site too, so no link equity is lost. A redirect `/Projects → /projects` is impossible because matching is case-insensitive: the rule would also match `/projects` and loop forever. Filesystem routes are case-sensitive, so `/Projects` stays a 404 |

## 4. Project detail URLs (22 legacy URLs)

Legacy form: `/Projects/ProjectDetails?projectNameType={Enum}&projectType={Web|Mobile}`.
Enum values come from the audit (§9.1, §11.7). The target is computed from the
project data, in this order:

1. **Merged into another case study** (`supersededBy`): the matching section of
   that case study while it is public. This applies to the three old Ovulae
   pages; Ovulae is hidden at launch, so they go to `/projects`.
2. **Hidden, unknown or without a page:** `/projects`.
3. **Mobile URL of a project whose mobile app is a secondary deliverable:** the
   page's `#mobile` section.
4. **Otherwise:** the project page.

If a project is hidden later, its URLs fall back to `/projects` automatically;
no redirect needs editing.

### Web (14)

| `projectNameType` | New URL |
|---|---|
| `CatalystFXD` | `/projects` (hidden) |
| `AFXTrust` | `/projects` (hidden) |
| `CLA` | `/projects/cla-administration-tool` |
| `IWT` | `/projects` (hidden) |
| `HlumisiF` | `/projects` (hidden) |
| `CPMA` | `/projects/cpma` |
| `MetaPOS` | `/projects/metapos` |
| `PNE` | `/projects` (hidden) |
| `WCG` | `/projects` (hidden) |
| `ABTech` | `/projects` (hidden) |
| `CRT` | `/projects/catalyst-risk-tool` |
| `LMS` | `/projects` (hidden) |
| `OvulaePortal` | `/projects` (merged into Ovulae, which is hidden) |
| `OvulaeWebsite` | `/projects` (merged into Ovulae, which is hidden) |

### Mobile (8)

| `projectNameType` | New URL |
|---|---|
| `AFXTrust` | `/projects` (hidden) |
| `CRT` | `/projects/catalyst-risk-tool#mobile` |
| `CPMA` | `/projects/cpma#mobile` |
| `MetaPOS` | `/projects/metapos#mobile` |
| `OvulaePortal` | `/projects` (merged into Ovulae, which is hidden) |
| `Apex` | `/projects` (hidden) |
| `FPSL` | `/projects` (hidden) |
| `OvulaeApp` | `/projects` (merged into Ovulae, which is hidden) |

### Edge cases

| Request | Result | Why |
|---|---|---|
| `/Projects/ProjectDetails` (no query) | 308 → `/projects` | The legacy `sessionStorage` script left this bare URL in address bars and bookmarks (audit §9.2) |
| `?projectNameType=null&projectType=null` | 308 → `/projects` | What the legacy script produced for a bare URL |
| Unknown `projectNameType` | 308 → `/projects` | The legacy site returned an empty 200 (a soft 404) |
| Any casing of path, keys or values (`/projects/projectdetails?projectnametype=cpma&projecttype=mobile`) | Same target (`/projects/cpma#mobile`) | ASP.NET routing and enum binding were case-insensitive |
| Known project, unrecognised `projectType` | 308 → the project page | |
| Numeric enum values (`?projectNameType=3`) | 308 → `/projects` | The legacy site linked by name only; the enum ordinals are not in the audit |

> **Slugs are provisional until launch.** If a slug changes before launch, the
> redirect follows automatically, because it is read from the data. After launch,
> a slug change also needs a new redirect from the old slug.

## 5. Legacy asset URLs

These legacy asset URLs may be referenced from outside the site (link-preview
caches, e-mail signatures, bookmarks). Once the brand assets are approved and
migrated, keep them reachable, either by placing a copy at the same path under
`/public` or by adding a redirect to the new file:

| Legacy URL | Likely external use | Plan |
|---|---|---|
| `/img/social.png` | OG image in social caches (the legacy tag was broken, audit §11.2) | Redirect to the new OG image |
| `/images/mainLOGO2.webp` | Header logo; possibly linked from e-mail signatures | Keep a copy at this path, or redirect to the new logo |
| `/favicon.ico` | Browsers | Served by `src/app/favicon.ico` once the icon exists |
| `/images/mainLOGO2.png` | Legacy e-mail template (the file never existed) | No action needed |

Add these redirects only once the target files exist. A redirect to a missing
file is worse than a 404.

## 6. Legacy anchors on the Projects page

The legacy Projects dropdown linked to `/Projects/AllProjects#web`, `#mobile`,
`#desktop`, `#api` and `#uxui`. After the 308 the browser shows
`/projects#web`, etc. The Work page reads the anchor on load
(`legacyAnchorFilters` in `src/data/taxonomy.ts`):

| Anchor | Work page shows |
|---|---|
| `#web` | All (every public project is a web project, so there is no separate Web filter) |
| `#mobile` | the Mobile filter |
| `#desktop`, `#uxui`, `#api` | All (desktop, design and API work are no longer separate categories) |

A `?filter=` query takes precedence over an anchor. Choosing a filter replaces
the anchor with `?filter=…`.

## 7. Verification

Run on 2026-09-24 against `next build && next start`:

- page redirects: `/Home/Index` → `/`, `/Home/AboutUs` → `/about`,
  `/Home/Services` → `/services`, `/Home/Contact` → `/contact`,
  `/Projects/AllProjects` → `/projects`, `/Portfolio/x` → `/projects` (all 308)
- case variants (`/home/aboutus`, `/HOME/SERVICES`) and query pass-through
  (`/Home/AboutUs?utm_source=x` → `/about?utm_source=x`)
- every `projectNameType` in both `Web` and `Mobile` form → the targets above
  (the 22 real legacy URLs plus the 12 combinations the legacy site never had)
- the bare, `null`, unknown and lower-case variants → the edge-case targets
- `/projects#mobile` in a browser → the Mobile filter selected (5 projects); `#web` → All
- `/Projects` → 404, `/projects/<unknown>` → 404, every hidden project slug
  → 404

To re-check after changes:

```bash
npm run build && npm run start
curl -sI "http://localhost:3000/Projects/ProjectDetails?projectNameType=CPMA&projectType=Mobile" | grep -i location
# location: http://localhost:3000/projects/cpma#mobile
```

## 8. After launch

- **Search Console:**
  - Verify the `www` property.
  - Submit `/sitemap.xml`.
  - Watch the *Pages → Not found (404)* report for legacy URLs that were missed.
- **GA4:** compare landing pages before and after cut-over (same property).
  Legacy URLs that still receive traffic appear as referrers and landing pages
  until caches update.
- **Before cut-over, if possible:** export the legacy site's indexed URLs
  (Search Console → Pages, and GA4 → Landing pages). That list is **unknown**
  from the repository (audit §11.7). Check it against this map.
