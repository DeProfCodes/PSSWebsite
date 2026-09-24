# Proficient Software Solutions — Current Website Audit

**Purpose:** a factual, source-verified description of the existing public website so that a designer/architect who has never seen it can understand it completely before the React + Tailwind CSS (Vercel) rebuild.

| | |
|---|---|
| Audit date | 2026-09-23 |
| Repository | `PSS-MainWebsite` (branch `master`, HEAD `67d5f05` "checkin", 2026-02-02) |
| Working tree state | `Views/Home/Index.cshtml` and `wwwroot/css/site.css` have **uncommitted** changes (a partial home-page refresh); `wwwroot/img/apps.zip` is untracked |
| Method | Full read of every controller, model, helper, view, custom CSS/JS file and the vendor-file headers; the current source was also served locally from the existing build (`bin/Debug/net8.0`, Razor runtime compilation) and rendered with headless Chrome at 1440 px and 500 px wide. **GET requests only** — the contact form was not submitted and the database-backed endpoints were not called. No files other than this report were created or changed. |
| Conventions | **FACT** = observed in code or in the local render. **RECOMMENDATION** = my suggestion, only in sections 13–15. **UNKNOWN** = could not be determined from the repository. |

> **Important for the reader — two versions of the Home page exist.**
> The *working tree* (uncommitted) Home page is a newer, partly redesigned version. The *committed* version (HEAD) is older and contains a large filterable portfolio grid. Whichever was last deployed is **UNKNOWN** (the live server could not be inspected from the repo). Both are documented: the working-tree version in §2.1 and §8, and the committed version in §2.1b.

> **Security note up front:** plaintext credentials (SMTP mailbox password, two SQL Server logins, and a commented-out Gmail app password) are hardcoded in files **tracked in git** (§1.14, §13). They are deliberately **not reproduced** in this report.

---

## Table of contents

1. Project / technical overview
2. Complete page inventory
3. All current website copy
4. Services currently offered
5. Portfolio / projects
6. Image / media asset inventory
7. Current brand / visual system
8. Current Home page — very detailed
9. Navigation / information architecture
10. Forms and conversion flows
11. SEO / meta / search setup
12. Responsive / mobile implementation
13. Technical debt / old frontend issues
14. What must be preserved
15. Migration considerations
16. Final executive summary

---

# 1. PROJECT / TECHNICAL OVERVIEW

## 1.1 Framework and version

- **FACT:** This is **ASP.NET Core 8 MVC**, not classic ASP.NET MVC on .NET Framework.
  - `PSS-MainWebsite.csproj`: `Sdk="Microsoft.NET.Sdk.Web"`, `<TargetFramework>net8.0</TargetFramework>`, nullable enabled, implicit usings, root namespace `PSS_MainWebsite`.
  - `Program.cs` uses the minimal-hosting model (`WebApplication.CreateBuilder`).
- **FACT:** `Program.cs:4` — `AddControllersWithViews().AddRazorRuntimeCompilation()`. Runtime compilation is on in **every** environment, including production. Views are compiled from `.cshtml` source at runtime.
- Production pipeline (`Program.cs`): `UseExceptionHandler("/Home/Error")` + `UseHsts()` (non-Development), `UseHttpsRedirection`, `UseStaticFiles`, `UseRouting`, `UseAuthorization`, one conventional route.

## 1.2 Solution / project structure

```
PSS-MainWebsite.sln                 (1 project)
PSS-MainWebsite.csproj
Program.cs
appsettings.json / appsettings.Development.json   (logging + AllowedHosts only; no connection strings, no settings)
.config/dotnet-tools.json            (dotnet-ef 8.0.3 tool — EF Core is NOT used anywhere)
.github/workflows/                   (empty folder — no CI)
Properties/launchSettings.json       (local ports 5249 / 7269, IIS Express 2724/44320)
Properties/PublishProfiles/*.pubxml  (NOT tracked in git; see 1.19)
Controllers/
  HomeController.cs                  Index, AboutUs, Services, Contact (GET + POST)
  ProjectsController.cs              AllProjects, ProjectDetails, CatalystFXDynamicsWeb (broken)
  ApexPredatorController.cs          3 data endpoints for a trading product (not a website page)
Helpers/
  ProjectsHelper.cs     (788 lines)  ALL portfolio-detail content, hardcoded in C# switch statements
  EmailTemplates.cs                  HTML/plain e-mail bodies for the contact form
  ApexDataHelper.cs                  string formatters for the Apex endpoints
  TypesParserHelper.cs               number/date parsing
  Enums/ProjectNameType.cs           17 project identifiers + display names + client names
  Enums/ProjectType.cs               None / Web / Mobile / Design
Models/        SupportMailViewModel (contact form), ErrorViewModel, ApexData, ApexGoAccess, ApexSymbolData
ViewModels/    ProjectDetailsViewModel
Services/      ApexPredatorData.cs   raw ADO.NET SQL queries
Views/
  _ViewStart.cshtml, _ViewImports.cshtml
  Shared/_Layout.cshtml (the only layout), _Layout.cshtml.css (unused), _ValidationScriptsPartial.cshtml (unused), Error.cshtml (unreachable)
  Home/Index, AboutUs, Services, Contact
  Projects/AllProjects, ProjectDetails, ProjectDetailsComponentWeb (partial), ProjectDetailsComponentMobile (partial)
wwwroot/                             ~194 MB total (img 142 MB incl. 67 MB apps.zip, lib 24 MB, images 11 MB, css 6.7 MB, fonts 5.6 MB, assets 3.8 MB, js 2.6 MB)
```

- **FACT — external build dependency:** the csproj references three DLLs by `HintPath` into a sibling folder outside this repo, pointing at **Debug** build outputs:
  - `..\..\..\Shared\PssSharedFunctions\obj\Debug\net8.0\PssSharedFunctions.dll` (enum display-name helpers)
  - `..\..\..\Shared\PssSharedServices\bin\Debug\net8.0\PssSharedModels.dll`
  - `..\..\..\Shared\PssSharedServices\bin\Debug\net8.0\PssSharedServices.dll` (the `EmailService` used by the contact form)
  - The project cannot be built on a machine that does not have that `Shared` folder at that relative path.
- NuGet packages: `Microsoft.AspNetCore.Mvc.Razor.RuntimeCompilation 8.0.3`, `Microsoft.Data.SqlClient 5.2.1`, `Newtonsoft.Json 13.0.3` (imported in `ApexPredatorController.cs` but not used).

## 1.3 Main frontend technologies

- Server-rendered Razor views, Bootstrap grid/components, jQuery, many jQuery-era plugins, and **three different purchased/free HTML templates pasted together**:

| Template | Evidence | Where it shows up |
|---|---|---|
| **"Bitrader"** by *thetork* (ThemeForest) — "Professional Multipurpose HTML Template for Your Crypto, Forex, Stocks & Day Trading Business" | header comment in `wwwroot/assets/css/style.css` (15,231 lines, 278 KB); SCSS source in `wwwroot/assets/sass/` | Header/nav, preloader, hidden light/dark switch, hidden scroll-to-top, base typography (Anek Telugu headings, Open Sans body), `custom.js` |
| **"Gtco"** by GetTemplates.co | header comment in `wwwroot/css/style.css`; `gtco-*` class names | Home "creative agency" section, stats band, features list, gradient pill buttons |
| **"NewBiz"** by BootstrapMade | header comment in `wwwroot/css/styleNewsBizFull.css`; `#intro`, `#clients`, `#portfolio`, `.section-header`, `#footer` | Services/Contact intro banners, Clients grid, footer, (old) portfolio grid |

- Plus fresh Bootstrap-5-utility markup (working-tree Home sections) and a lot of inline styles.
- `wwwroot/assets/site.css` contains rules for `#ApexSectionBanner`, `#CrtSectionBanner`, `#HomeSoftwareCRT` — copied from the sibling **Catalyst FX Dynamics** website. The About page even reuses `id="CrtSectionBanner"` and `alt="Catalyst Risk Tool Banner"`.

## 1.4 Bootstrap version(s)

**FACT — multiple Bootstrap versions are loaded on the same page** (identified from file headers):

| File | Version | Loaded where |
|---|---|---|
| `wwwroot/assets/css/bootstrap.min.css` | **5.3.0** | every page (layout) |
| `wwwroot/css/bootstrap.min.css` | **5.3.2** | every page (layout) |
| `wwwroot/lib/bootstrap/css/bootstrap.min.css` | **4.2.1** | Services and Contact pages only (injected in the body, *after* the 5.x CSS, so v4 rules win there) |
| `wwwroot/js/bootstrap.min.js` + `js/bootstrap.bundle.min.js` | 5.3.2 | every page |
| `wwwroot/lib/bootstrap/js/bootstrap.bundle.min.js` | **4.2.1** | every page (and again on Contact) |
| `wwwroot/assets/js/bootstrap.bundle.min.js` | 5.3.0 | every page (last one loaded) |
| `wwwroot/lib/bootstrap/dist/*` | 5.1.0 | not loaded (on disk only) |
| `wwwroot/lib/bootstrap-5.0.2-dist/*` | 5.0.2 | not loaded (on disk only) |
| `wwwroot/css/cdn/bootstrap-icons-1.11.3/` | Bootstrap Icons 1.11.3 | every page (used for the eye icon on project galleries) |
| `wwwroot/lib/bootstrap-icons/` | 2,085 individual SVGs (5.7 MB) | not loaded |

The markup targets **Bootstrap 5** (`data-bs-*`, `g-4`, `gap-3`, `me-2`, `fw-bold`), with Bootstrap 4 classes on the Contact form (`form-row`, `form-group`) and even Bootstrap 3 classes (`col-xs-6`, `media`, `mr-4`).

## 1.5 jQuery, plugins and libraries (with versions)

Loaded by `_Layout.cshtml` on **every** page (in this order): 

| # | Script | Version / note |
|---|---|---|
| 1 | `https://unpkg.com/isotope-layout@3/...` | Home only (working tree) — no target element exists, logs "Bad element for Isotope" |
| 2 | `/js/jquery-3.3.1.slim.min.js` | jQuery **3.3.1 slim** |
| 3 | `/js/popper.min.js` | Popper 1.x (2018) |
| 4–5 | `/js/bootstrap.min.js`, `/js/bootstrap.bundle.min.js` | Bootstrap 5.3.2 (twice) |
| 6 | `/owl-carousel/owl.carousel.min.js` | Owl Carousel 2.3.4 (no carousel exists) |
| 7 | `/lib/jquery/jquery.min.js` | jQuery **3.3.1** full (replaces #2) |
| 8 | `/lib/jquery/jquery-migrate.min.js` | jQuery Migrate 3.0.0 |
| 9 | `/lib/bootstrap/js/bootstrap.bundle.min.js` | Bootstrap **4.2.1** |
| 10 | `/lib/isotope/isotope.pkgd.min.js` | Isotope 3.0.5 |
| 11 | `/lib/lightbox/js/lightbox.min.js` | Lightbox2 2.10.0 |
| 12 | `/lib/easing/easing.min.js` | jQuery Easing |
| 13 | `/lib/waypoints/waypoints.min.js` | Waypoints |
| 14 | `/lib/counterup/counterup.min.js` | Counter-Up (unused) |
| 15 | `/lib/owlcarousel/owl.carousel.min.js` | Owl 2.3.4 (second copy) |
| 16 | `/js/main.js` | Gtco template script (owl init, isotope) |
| 17 | `/js/main2.js` | NewBiz template script — **throws `WOW is not defined` on every page except Contact** because `wow.min.js` is not in the layout; everything after that line in the file never runs |
| 18 | `/lib/jquery/dist/jquery.js` | jQuery **3.6.0** (third jQuery, non-minified 288 KB; becomes the final `$`) |
| 19 | `/assets/js/bootstrap.bundle.min.js` | Bootstrap 5.3.0 |
| 20 | `/assets/js/all.min.js` | **Font Awesome 6.3.0 SVG+JS, 1.47 MB** (replaces `<i>` tags with SVGs) |
| 21 | `/assets/js/swiper-bundle.min.js` | Swiper 8.4.7 (no sliders exist) |
| 22 | `/assets/js/aos.js` | AOS (no `data-aos` attributes exist) |
| 23 | `/assets/js/fslightbox.js` | FsLightbox (unused) |
| 24 | `/assets/js/purecounter_vanilla.js` | PureCounter 1.5.0 (unused) |
| 25 | `/assets/js/custom.js` | Bitrader template script (preloader, menu toggle, sliders) |
| 26 | Google tag `G-VLLB11SKWE` | GA4 |

Extra per page:
- **Contact** (`Views/Home/Contact.cshtml:124-140`): jQuery 3.3.1 + Migrate again, Bootstrap 4.2.1 again, easing, `mobile-nav.js`, **WOW 1.3.0**, waypoints, counterup, owl, isotope, lightbox, **SweetAlert** from `https://unpkg.com/sweetalert/dist/sweetalert.min.js` (unpinned version), `main.js` again, `site.js` (empty). Total **39 script tags**.
- **Project details partials** (`ProjectDetailsComponentWeb.cshtml:121-122`, `...Mobile.cshtml:137-138`): jQuery 3.3.1 and Bootstrap 5.3.2 bundle again.
- **Services / Contact**: Google Fonts (Open Sans + Montserrat), Bootstrap 4.2.1 CSS, Font Awesome 4.7, animate.css 3.5.2, Ionicons 2.0.0, Owl CSS, Lightbox CSS, NewBiz CSS — all as `<link>` tags inside `<body>`.

Icon fonts present simultaneously: Font Awesome **4.6.3** (`css/font-awesome.css`), **4.7.0** (`lib/font-awesome`), **6.3.0** (`assets/css/all.min.css` + `assets/js/all.min.js`), **Ionicons 2.0.0**, **Bootstrap Icons 1.11.3**.

## 1.6 CSS architecture

- **FACT:** no build step, no bundler, no Sass compilation pipeline (no `package.json`, no `bundleconfig.json`, no WebOptimizer). `wwwroot/assets/sass/` holds the Bitrader SCSS source but nothing compiles it; `assets/css/style.css` is the pre-compiled template output.
- **FACT:** the layout emits **29 `<link rel="stylesheet">` tags** on normal pages and **39** on Services/Contact, including duplicates. Order in `_Layout.cshtml:36-74`:
  1. `assets/css/bootstrap.min.css` (5.3.0) → `aos.css` → `assets/css/all.min.css` (FA6) → `css/clientStyles.css` → `css/site.css` → `assets/site.css` → `swiper-bundle.min.css` → `css/style.css` (Gtco) → `css/newsBizStyle.css` → `lib/font-awesome` (FA4.7) → `animate.min.css` → `ionicons` → `owl.carousel` → `lightbox` → `css/site.css` (**2nd time**) → `css/sharedStyle.css` → `css/font-awesome.css` (FA4.6.3) → `owl-carousel/...` (2nd owl) → `css/bootstrap.min.css` (5.3.2) → bootstrap-icons → FA4.7 / animate / ionicons / owl / lightbox (**all again**) → `css/style.css?v=…` → `css/newsBizStyle.css?v=…` → `css/site.css?v=…` (**3rd time**) → `assets/css/style.css?v=…` (Bitrader, last = highest precedence).
- **FACT:** `?v=@cacheBust` uses `DateTime.UtcNow.Ticks` (`_Layout.cshtml:2`), so those four stylesheet URLs change on **every request** and are never cached by browsers or CDNs.
- Custom/project CSS files (the only non-template CSS):

| File | Lines | Content |
|---|---|---|
| `wwwroot/css/site.css` | 453 | Main project overrides: header colour, logo size, active link, project cards, project-detail carousel, theme button, hero (new), service cards, breakpoints |
| `wwwroot/css/newsBizStyle.css` | 432 | Extract of NewBiz: clients grid, portfolio grid, footer |
| `wwwroot/css/sharedStyle.css` | 335 | Utility classes (`.hidden`, `.fs-dynamic-*` font sizes, alignment helpers) |
| `wwwroot/css/clientStyles.css` | 89 | Carousel "gold" styles, `.nav-links:hover {color: gold}` (legacy from trading site) |
| `wwwroot/assets/site.css` | 241 | Copied from Catalyst FX site: **`body {background:#000; color:#fff}`**, gold links, Apex/CRT banner IDs, scrollbar colours |
| `wwwroot/css/layout.css`, `css/importStyle.css` | — | **not referenced** anywhere |
| `Views/Shared/_Layout.cshtml.css` | 48 | ASP.NET CSS-isolation file; the generated `*.styles.css` bundle is **not linked**, so it has no effect |

- Heavy use of `!important` and inline `style="…"` attributes in views (hero gradient, icon circles, About cards, project cards, contact form box, etc.).

## 1.7 JavaScript architecture

- Global scripts only; no modules, no bundler, no framework. Page-specific JS is inline `<script>` at the bottom of views:
  - `Index.cshtml:552-580` Isotope init (dead) + `OpenProjectDetails(name, type)` → `window.location = /Projects/ProjectDetails?projectNameType=…&projectType=…`
  - `AllProjects.cshtml:663-670` same `OpenProjectDetails` function (duplicated)
  - `ProjectDetails.cshtml:32-53` URL rewriting via `sessionStorage` (see §9/§11)
  - `ProjectDetailsComponent*.cshtml` carousel/modal wiring
  - `Contact.cshtml:143-224` form validation + AJAX submit
  - `_Layout.cshtml:226-322` `ToggleMobileDropDown` (targets a non-existent `#my-nav`), active-nav highlighting from `ViewData["BodyId"]`, commented-out scroll-spy
- `custom.js` (Bitrader): preloader fade after 1 s; theme switcher (hidden); submenu toggles for widths < 1200 px; header-bar (hamburger) toggle; AOS/Swiper/PureCounter initialisation; scroll-to-top (button hidden by inline style).
- **Runtime errors (FACT from code reading):** `main2.js` → `ReferenceError: WOW is not defined` on all pages except Contact; `custom.js` menu handler → `TypeError` (null `.style`) when a top-level nav link without a submenu is tapped below 1200 px; Home → Isotope "Bad element" error.

## 1.8 Razor layouts

- One layout: `Views/Shared/_Layout.cshtml` (set by `_ViewStart.cshtml`; some views also set `Layout = "_Layout"` explicitly).
- No `@RenderSection` calls — page scripts/styles are dumped inline into the body.
- `ViewData["Title"]` → `<title>`; `ViewData["BodyId"]` → `<body id>` and drives which nav link gets `.active-link`.
- `<body class="home-4">` (Bitrader demo class) on every page.

## 1.9 Partial views / components

| File | Used? | Notes |
|---|---|---|
| `Views/Projects/ProjectDetailsComponentWeb.cshtml` | Yes | Rendered by `ProjectDetails.cshtml` when `ProjectType == Web` |
| `Views/Projects/ProjectDetailsComponentMobile.cshtml` | Yes | When `ProjectType == Mobile`; contains duplicate element IDs |
| `Views/Shared/_ValidationScriptsPartial.cshtml` | No | jQuery Validation never used |
| `Views/Shared/Error.cshtml` | No | No `Error` action exists (see 1.10) |

Header, footer, project cards, client logos, tech logos, etc. are **not** componentised; they are repeated markup.

## 1.10 Routing

- Single conventional route `{controller=Home}/{action=Index}/{id?}` (`Program.cs:23-25`). No attribute routing, no custom routes, no redirects, no rewrite rules, no `web.config` in the repo.
- Routes are **case-insensitive** (e.g. `/home/aboutus` and `/HOME/SERVICES` return 200).
- `/`, `/Home` and `/Home/Index` all return the same Home page (duplicate URLs).
- `/Home/Error` → **404** (no action), so the production exception handler has nothing to render; unhandled errors return an **empty 500** (verified with `/Projects/CatalystFXDynamicsWeb`).
- No custom 404 page (`UseStatusCodePages` not configured) → unknown URLs return an empty 404 body.

## 1.11 APIs / backend dependencies

| Endpoint | Method | What it does | Used by the website? |
|---|---|---|---|
| `POST /Home/Contact` | POST (form-urlencoded via jQuery AJAX) | Sends two e-mails (see 1.13) | Yes — Contact page |
| `/ApexPredator/GetAllApexPredatorData` | GET (`[HttpGet]`) | `SELECT * FROM ApexPredatorMainStore` → custom CSV-ish string (`symbol,POSITION,open,SL,TP1,TP2,buys,sells,dd/MM/yyyy HH:mm:ss,current#…`) | **No** — not linked from any page |
| `/ApexPredator/GetAllApexGoAccess` | any verb | `SELECT * FROM ApexGOAccess` → `AccessId,Username,DeviceName,DeviceAccessId,LicenseExpiry#…` | **No** |
| `/ApexPredator/GetAllApexSymbolData` | any verb | `SELECT * FROM ApexSymbolData` → `Id|Symbol|JsonData|LastUpdate#…` | **No** |

- **FACT:** the Apex endpoints were added in commit `fb5cab6` ("HiJack project and add a resource link for my indicator", 2024-08-08) and updated through Nov 2024. They serve data to the **Apex Predator / ApexGO trading products** (a trading "indicator" per the commit message). The consumers live outside this repo — **UNKNOWN** which apps/devices call them, but breaking these URLs would likely break those products.
- **FACT:** these endpoints are **unauthenticated** and `GetAllApexGoAccess` returns usernames, device names/IDs and licence expiry dates to anyone who requests it.
- The `ApexPredatorController` lives in namespace `StreamingSolutionApp.Controllers`; models use `CatalystFXDynamics.Models` / `StreamingSolutionApp.Models` — code copied from other projects.

## 1.12 Forms and how they submit

Only one form exists: **Contact** (`Views/Home/Contact.cshtml:75-97`). It is not a real `<form>` submit — the button is `type="button"` calling `ContactUs()`, which validates in jQuery and posts via `$.ajax` to `@Url.Action("Contact","Home")` → `POST /Home/Contact`. No anti-forgery token, no CAPTCHA/honeypot, no server-side validation attributes. Full detail in §10.

## 1.13 Email / contact functionality

- `HomeController.cs:14` creates `EmailService("clients@proficientsoftwaresolutions.co.za", <password>, "mail.proficientsoftwaresolutions.co.za", 8889)`.
- `ProjectsController.cs:15` creates a second instance (port **25**) that is **never used**.
- The shared `EmailService` (`Shared/PssSharedServices/Services/Email/EmailService.cs`, outside this repo) uses `System.Net.Mail.SmtpClient`; **`EnableSsl` is only true when the host is `smtp.gmail.com`**, so this site authenticates to its SMTP server on port 8889 **without TLS**.
- `SendEmail` **catches every exception and returns a result object**; `HomeController.Contact` ignores that result and **always returns `200 OK`** (`HomeController.cs:45-52`). The visitor always sees "Your message sent", even if delivery failed.
- Two messages are sent per enquiry (`HomeController.cs:45-46`):
  1. To `sales@proficientsoftwaresolutions.co.za`, subject `Enquiry : {FullName}`
  2. To `pss.softwares25@gmail.com`, subject `Enquirey - From {FullName}` (typo in source)
- Body: `EmailTemplates.SupportEmailTemplateInternal` (HTML table with From Name / Subject / Email / Message inside a branded 600 px e-mail shell, dark navy `#021623` bands, founder signature) + a plain-text alternative. **User input is inserted into the HTML without encoding.** No **Reply-To** is set, so replying goes to `clients@…`, not to the enquirer.
- **No auto-reply/confirmation e-mail is sent to the visitor.** (`EmailTemplates.EnquiryEmailTemplate` exists but is unused and still titled "iWatchAllTV Information".)
- The branded template references `https://proficientsoftwaresolutions.co.za/images/mainLOGO2.png`, which does **not** exist (only `.webp`), but the variant actually used (`…NoSPAM`) omits the logo.
- Commented-out code (`HomeController.cs:49-50`) shows a previous Gmail-based sender, including a Gmail app password.

## 1.14 Database dependencies

- **FACT:** `Services/ApexPredatorData.cs:17-18` holds two hardcoded SQL Server connection strings (servers `SQL5110.site4now.net` and `SQL5111.site4now.net`, databases `db_a92ee7_iwatchalltv` and `db_a92ee7_apexpredator`, with user IDs and passwords in plaintext). Only the `apexpredator` database is actually queried.
- Raw ADO.NET (`SqlConnection` / `SELECT *`), no ORM, no migrations, no connection pooling config, no `appsettings` usage.
- **The public website pages themselves do not use a database.** All page content, including the portfolio, is hardcoded in Razor views and `Helpers/ProjectsHelper.cs`.

## 1.15 Authentication

- None. `UseAuthorization()` is present but no authentication scheme, no `[Authorize]`, no login, no admin area, no CMS.

## 1.16 Analytics / tracking

- **Google Analytics 4**, measurement ID **`G-VLLB11SKWE`** via `gtag.js` (`_Layout.cshtml:324-332`), on every page.
- No Google Tag Manager container, no Meta/LinkedIn pixels, no Hotjar, no conversion events (the contact form does not fire a GA event), no cookie/consent banner.

## 1.17 Google Maps and other third-party integrations

| Integration | Where | Detail |
|---|---|---|
| Google Maps **embed iframe** (no API key) | Contact page | Pin at "35 Lima St, Sharonlea, Randburg, 2158"; `loading="lazy"`, 100 % × 412 px |
| Google Fonts | Bitrader CSS `@import` (Anek Telugu + Open Sans) on all pages; `<link>` Open Sans + Montserrat on Services/Contact | |
| unpkg.com | Isotope (Home), SweetAlert (Contact) | unpinned CDN scripts |
| LinkedIn | About page link to founder profile | |
| External project links | Project detail pages | client sites, Play Store, Azure dev URL (§5) |

## 1.18 Hosting / deployment assumptions visible in the project

- **Publish profiles** (`Properties/PublishProfiles/`, **not tracked in git**; `.pubxml.user` files contain encrypted passwords):
  - Web Deploy → `https://win8238.site4now.net:8172/msdeploy.axd?site=deprofcodes-002-site4`, IIS app `deprofcodes-002-site4`, user `deprofcodes-002`, launch URL `http://deprofcodes-002-site4.atempurl.com/`
  - FTP → `ftp://win8238.site4now.net:21`
  - Folder → `bin\Release\net8.0\publish\`
  - Last used (`PSS-MainWebsite.csproj.user`): "deprofcodes-002-site4 - Web Deploy".
- `site4now.net` / `atempurl.com` is the Windows/IIS shared hosting platform used by SmarterASP.NET-style hosts; the SQL servers are on the same platform. Framework-dependent deploy (`SelfContained=false`).
- Canonical public domain referenced in code: **`https://proficientsoftwaresolutions.co.za`** (OG tags, e-mail templates) and **`https://www.proficientsoftwaresolutions.co.za`** (e-mail signature) — www vs non-www is inconsistent.
- The mail server `mail.proficientsoftwaresolutions.co.za` is on the same domain (**UNKNOWN** whether it is on the same host as the website — this matters for DNS changes, see §15).
- No Dockerfile, no CI/CD (empty `.github/workflows`), no environment-based configuration.

---

# 2. COMPLETE PAGE INVENTORY

## 2.0 Shared page chrome (present on every page)

### Preloader
- Full-screen overlay (Bitrader `.preloader`) showing `img/preloader.webp` — an **animated** 151-frame circular cyan-gradient badge with the PSS logo (**2.3 MB**). `custom.js` fades it out 1 s after DOMContentLoaded (so every page shows a ~1.5 s loading screen).

### Header / navbar (`_Layout.cshtml:90-141`)
- Fixed to the top from page load (`header-section header-section--style4 header-fixed`), full width, **light blue background `#e6f2fb`**, subtle bottom shadow.
- **Left:** PSS logo `images/mainLOGO2.webp` (the navy-to-cyan gradient "PSS" wordmark with the tagline "SOLUTIONS ENGINEERED FOR SUCCESS"), 110 px wide, links to `/`.
- **Centre/right:** horizontal menu, Open Sans ~16 px, near-black text:
  - Home (`/#`) · About (`/Home/AboutUs`) · Services (`/Home/Services`) · **Projects ▾** (`/Projects/AllProjects`) · Contact Us (`/Home/Contact`)
  - Projects dropdown (hover, white panel, 220 px, rounded, shadow; hovered items turn **gold** — a Bitrader leftover): All · Web Apps (`#web`) · Mobile Apps (`#mobile`) · Desktop Apps (`#desktop`) · APIs (`#api`) · UX/UI Design (`#uxui`)
- Current page link: **bold, `#007bff` blue**. Hover: `#009cdd`.
- **No header CTA button**, no phone number, no social icons.
- **< 992 px:** menu hidden; a 3-bar hamburger (`#009cdd` bars) appears at the right; tapping toggles a drop-down list under the header.
- Hidden elements also in the header area: a light/dark theme switch (`display:none`) whose icon path `assets/images/icon/moon.svg` doesn't exist.

### Footer (`_Layout.cshtml:149-203`) — NewBiz footer
- Two bands: upper **`#004a99`** (padding 60 px), lower **`#00428a`** with centred copyright.
- Three columns (desktop):
  1. **"PROFICIENT SOFTWARE SOLUTIONS"** (uppercase, letter-spaced, white) + a long marketing paragraph (§3.1).
  2. **"USEFUL LINKS"**: Home, Services, About, Projects (underlined white links). *Contact is not listed.*
  3. **"CONTACT US"**: 35 Lima St / Sharonlea, Randburg, 2158 / South Africa; Phone: +27 73 794 2244; Email: Proficient@proficientsoftwaresolutions.co.za | sales@proficientsoftwaresolutions.co.za (plain text — **not** `mailto:`/`tel:` links).
- Social icons block exists (Twitter, Facebook, Instagram, Google+, LinkedIn) but is `display:none` and every link is `href="#"`.
- Copyright line: "© Copyright **Proficient Software Solutions**. All Rights Reserved" (no year, no legal links).
- Footer typography differs by page: Montserrat on Services/Contact (Google Font loaded there), fallback sans-serif elsewhere.

---

## 2.1 Home (working-tree version)

- **PAGE NAME:** Home — `<title>PSS - Welcome</title>`
- **ROUTE / URL:** `/` (also `/Home`, `/Home/Index`)
- **VIEW FILE:** `Views/Home/Index.cshtml` (uncommitted changes)
- **CONTROLLER / ACTION:** `HomeController.Index`

A long single-column marketing page. Blue gradient hero, then alternating white / very-light-grey bands. Full section-by-section reconstruction is in **§8**. Section order:

1. Header
2. Hero (blue gradient, headline + 2 CTAs + 2 trust bullets, illustration with "4 Active Projects" badge)
3. "Why South African Businesses Choose Us" — 3 icon cards
4. "We are a Creative Software Development Agency & Innovation Experts" — photo in blob mask + paragraph + "Learn More"
5. "Our Core Services" — 4 service cards
6. Stats band — 4 / 37 / 33 on a blue-cyan blob with world-map texture
7. "Our Top Clients" — 16-logo grid
8. Features list — 6 small icon + text items
9. "Featured Projects" — 2 case-study cards + "View All Projects"
10. "Ready to Transform Your Business?" — Call / Email / Book a Call boxes
11. Footer

## 2.1b Home (committed HEAD version — possibly what is live; UNKNOWN)

Same controller/view path. Differences vs working tree:

1. **Hero** (`gtco-banner-area`, flat `#009cdd` background, `margin-top:70px`): H1 "We promise to bring the best **solution** for your business." (white, Lato Light 48 px with "solution" in Lato Medium); paragraph "Committing to deliver optimal business solutions, we ensure excellence and success in every endeavor."; single gradient pill CTA **"CONTACT US ›"** → `/Home/Contact`; right column: the same `banner-img.webp` illustration (hidden below 768 px).
2. *(No "Why South African Businesses" section.)*
3. Creative Agency section — identical.
4. **"Explore The Services We Offer For You"** (Gtco features layout): left column heading + paragraph + "ALL SERVICES ›" pill; right column two staggered columns of rounded white cards with rotated oval icon backgrounds: **Design**, **Data Analytics**, **Software Development**, **IT Support** (copy in §3.2).
5. Stats band — identical.
6. Clients — identical.
7. Features list — identical.
8. **"Our Portfolio"** (NewBiz `#portfolio`): pill filter bar **All · Web · App · Desktop · Data Analytics · Design** (Isotope filtering) and a 3-column grid of **37 image tiles**; hovering a tile darkens it (`#003166`) and shows the title, category and two round blue buttons — **eye** (Lightbox2 full-size preview) and **open** (→ project details page or `/Projects/AllProjects#…`). Tile list in §5.4.
9. *(No Featured Projects, no "Ready to Transform" section.)*
10. Footer.

---

## 2.2 About

- **PAGE NAME:** About — `<title>About PSS</title>`
- **ROUTE / URL:** `/Home/AboutUs`
- **VIEW FILE:** `Views/Home/AboutUs.cshtml`
- **CONTROLLER / ACTION:** `HomeController.AboutUs`

1. **Header.**
2. **Banner image** — full-width `img/about.webp` (1920×1080 photo of a diverse team in an office looking at monitors, with the words **"ABOUT US"** and a translucent PSS logo **baked into the image**). No live text; `alt="Catalyst Risk Tool Banner"` (wrong).
3. **About section** — pale grey-blue to white diagonal gradient background.
   - Centred **H1:** "About **Proficient Software Solutions**" ("About" navy `#021623`, company name `#009cdd`), Anek Telugu, bold.
   - Two columns (stack on < 992 px):
     - **Left:** founder portrait `images/director3.webp` (Proficient Mkansi in a navy suit and patterned tie, dark blue backdrop), rounded 8 px, with a white fade gradient over the right 40 % so it blends into the page.
     - **Right:** four paragraphs of company history (§3.3), then signature block "**Proficient Mkansi** / Founder & Lead Developer", then "Connect with the Director:" and a **cyan gradient pill button "LINKEDIN PROFILE"** with the LinkedIn logo, opening `http://linkedin.com/in/proficient-mkansi-669b31147/` in a new tab.
4. Horizontal rule.
5. **Three cards** (equal height, white-to-pale-blue gradient, drop shadow, rounded, **4 px `#009cdd` left border**), each with a 140 px flat blue/black line illustration on top and a centred bold title:
   - **Our Vision** (`img/vision.png` — person climbing bar chart towards a target)
   - **Our Mission** (`img/mission.png` — team around a "MISSION" board)
   - **Future Outlook** (`img/future.png` — road with location pins) + a small square-bullet list: Education, Retail, Corporate & Business Operations.
6. **Footer.**

## 2.3 Services

- **PAGE NAME:** Services — `<title>PSS Services</title>`
- **ROUTE / URL:** `/Home/Services`
- **VIEW FILE:** `Views/Home/Services.cshtml`
- **CONTROLLER / ACTION:** `HomeController.Services`

(Loads Bootstrap 4.2.1 CSS + NewBiz CSS + Montserrat on top of the global CSS, so it looks more like the NewBiz template than the Home page.)

1. **Header.**
2. **Intro banner** (`#intro`) — deep royal-blue background image with lighter diagonal wave shapes and a curved white bottom edge (`images/intro-bg.webp`); 200 px top / 120 px bottom padding. Left-aligned white **H2** (Montserrat bold): "Discover tailored solutions for your business with our diverse range of services." Two pill buttons: **"Our Services"** (solid blue) → `#about`, **"Our Tech"** (white outline) → `#services`. Right half is empty (the template's illustration slot `.intro-img` is empty).
3. **"Services"** (`#about`) — centred H3 "Services" + an intro paragraph, then four **alternating image/text rows** (image left/text right, then swapped), each image a large stock photo:
   - **Application Design** — `images/design-img2.webp` (overhead photo of a team with wireframes/sticky notes)
   - **Software Development** — `images/developer.webp` (developers smiling at monitors with code)
   - **Data Engineering** — `images/data-engineering.webp`
   - **IT Support** — `images/support.webp`
   Headings are Montserrat H4, body 18 px grey. The rows carry WOW.js `fadeInUp` classes, but WOW.js is not loaded on this page, so nothing animates.
4. **"Our Technologies"** (`#services`, background `#ecf5ff`) — centred H3 + paragraph, then a grid of **28 technology logos** (~7 per row on desktop) each with a grey label beneath (list in §3.4).
5. **Footer.**

## 2.4 Contact

- **PAGE NAME:** Contact — `<title>Contact Us</title>`
- **ROUTE / URL:** `/Home/Contact` (GET page; POST handler on same URL)
- **VIEW FILE:** `Views/Home/Contact.cshtml`
- **CONTROLLER / ACTION:** `HomeController.Contact` (GET) and `HomeController.Contact(SupportMailViewModel)` (POST)

1. **Header.**
2. **Intro banner** — same blue wave banner as Services, shorter content: white H2 "Contact our team and get fast response". No buttons.
3. **Contact section** (`#contact`, Bootstrap container):
   - Centred H3 "Contact Us" + intro paragraph (§3.5), thin rule.
   - **Two columns** (stack on < 992 px):
     - **Left:** Google Maps embed (full column width, 412 px tall, 1 px silver border) centred on 35 Lima St, Sharonlea, Randburg.
     - **Right:** a box with a 1 px silver border and 20 px padding: centred bold H3 "Send us a message"; fields in a Bootstrap 4 layout — **Your Name** | **Your Email** (side by side), **Subject** (full width), **Message** (6-row textarea); red validation text under each; centred blue **"Send Message"** button.
   - Hidden `#sendmessage` / `#errormessage` template divs (never shown).
4. **Loader modal** (hidden until submit): dark translucent rounded box with the preloader animation and "Sending your email..." in blue.
5. SweetAlert pop-ups for success/failure (§10).
6. NewBiz "back to top" round blue button (appears after scrolling 100 px — only on this page).
7. **Footer.**

## 2.5 All Projects (portfolio)

- **PAGE NAME:** Projects — `<title>Projects</title>`
- **ROUTE / URL:** `/Projects/AllProjects` (in-page anchors `#web`, `#mobile`, `#desktop`, `#uxui`, `#api`)
- **VIEW FILE:** `Views/Projects/AllProjects.cshtml`
- **CONTROLLER / ACTION:** `ProjectsController.AllProjects`

1. **Header.**
2. **Category selector band** — very light blue `#e9f5fb` full-width band (`margin-top:70px` to clear the fixed header). Centred H4 "Select Category" in `#0c9dde`. Five small square tiles with a 1 px `#0c9dde` border, 80 px isometric colourful illustrations and a blue label; hover lifts the tile. Clicking smooth-scrolls to the section:
   - **Web Apps** (`img/service-software.png`) · **Mobile Apps** (`img/service-mobile.png`) · **PC Apps** (`img/service-desktop.png`) · **APIs** (`img/service-api.png`) · **Designs** (`img/service-ux.png`)
3. **H1 "Our Project Portfolio"** (centred, large, bold navy) + grey consent disclaimer (§3.6).
4. **Web Applications** (`#web`) — blue centred H3, rule, then **14 cards in 2 columns**: screenshot on top (object-fit contain, often with a pale background), bold **navy** project name, 16 px description, centred cyan gradient pill **"VIEW PROJECT"** (or "VIEW PROFILE" for AB Tech) → project details page.
5. **Mobile Applications** (`#mobile`, grey top border) — **8 cards**: each image is a 1920×1080 composite of 2–3 phone mock-ups on a branded background.
6. **Desktop Applications** (`#desktop`) — **5 cards** (4 half-width + 1 full-width "Apex Predator AI – Desktop Version" with image max 700 px). **No buttons** (their links to `/Portfolio/...` are hidden with `.hidden` and would 404).
7. **UX/UI Designs** (`#uxui`) — **8 cards** showing Figma/Adobe XD/Canva workspace screenshots (dark UI with colourful splash background and tool logo). No buttons (hidden `/Portfolio/...` links).
8. **APIs** (`#api`) — centred H3 + one sentence, then a row of 4 logos: Monday.com, API-Football, **Twilio**, Deriv. **Only Twilio displays** — the other three `<img>` point to `.png` files that don't exist (the `.webp` versions do), so broken-image alt text shows.
9. **Footer.**

## 2.6 Project Details (Web variant)

- **PAGE NAME:** `{Project Name}` — e.g. `<title>AFX Trust App</title>`
- **ROUTE / URL:** `/Projects/ProjectDetails?projectNameType={Enum}&projectType=Web` — the query string is then **removed from the address bar by JavaScript** (§9)
- **VIEW FILE:** `Views/Projects/ProjectDetails.cshtml` + partial `ProjectDetailsComponentWeb.cshtml`
- **CONTROLLER / ACTION:** `ProjectsController.ProjectDetails(ProjectNameType, ProjectType)`; data from `Helpers/ProjectsHelper.GetProjectDetails`

1. **Header.**
2. **Title band** — `#e9f5fb` band; centred H2 "Project: {Name}" in `#0c9dde`; cyan gradient pill "‹ BACK TO ALL PROJECTS".
3. **Gallery** — H3 "Gallery: Images"; full-container-width **Bootstrap carousel** (auto-advance every 12 s) of 2–7 desktop screenshots with **30 px rounded corners**; large **red** chevron prev/next controls; hovering a slide darkens it and shows a white "eye" button that opens the image in a near-full-screen modal with a red "Close" button. Hidden "Images / Video" toggle buttons (the video `/videos/catalyst-demo.mp4` does not exist).
4. **Project info** (full width, black text): H1 project name; **Category:**; **Client:**; **Project Date:**; **URL:** (only if present, blue link, new tab); **Technologies Used:**; rule; two descriptive paragraphs; "Key Features:" + navy square-bullet list; a remarks paragraph (**always empty for Web projects** because of a logic bug in `ProjectsHelper.GetProjectRemarks`, line 725).
5. **Footer.**

## 2.7 Project Details (Mobile variant)

Same route with `projectType=Mobile`; partial `ProjectDetailsComponentMobile.cshtml`.

1. Header · 2. Title band (same).
3. H3 "Gallery: Images" + **one large composite hero image** (`OneImageSrc`, e.g. `img/apps/mobile/apex.png`: three phones on black).
4. Two columns: **left (1/3)** carousel of individual 600×950 phone screenshots (with preview modal); **right (2/3)** the same info block as the Web variant. Remarks show for some mobile projects, not for Apex/FPSL (§5).
5. Footer.

## 2.8 Error page (unreachable)

- `Views/Shared/Error.cshtml` is the default ASP.NET template ("Error. An error occurred while processing your request." + Development-mode explanation). **No controller action renders it.** Users see blank 404/500 responses instead.

## 2.9 Non-page endpoints (not user-facing)

- `POST /Home/Contact` (form handler), `/ApexPredator/*` (3 data endpoints), `/Projects/CatalystFXDynamicsWeb` (action exists, **view missing → 500**).

---

# 3. ALL CURRENT WEBSITE COPY

Copied **verbatim** from source (including original spelling/typos). Portfolio detail copy is in §5.3.

## 3.1 Global (layout, meta, footer)

**Meta (every page, `_Layout.cshtml:14-29`):**
- application-name / og:title: "Proficient Software Solutions – Empowering businesses with smart, scalable software tailored for real-world impact"
- description / og:description: "Proficient Software Solutions (Pty) Ltd is a South African software company delivering high-quality, professional software for businesses across industries."
- keywords: "Proficient Software Solutions, Custom Software Development, Full-Stack Development, South Africa, PSS"
- author: "Proficient Mkansi"
- og:site_name: "Proficient Software Solutions"

**Brand tagline (in logo artwork only, not live text):** "SOLUTIONS ENGINEERED FOR SUCCESS"

**Navigation:** Home · About · Services · Projects (All · Web Apps · Mobile Apps · Desktop Apps · APIs · UX/UI Design) · Contact Us

**Footer:**
> **Proficient Software Solutions**
> Transform your vision into reality with Proficient Software Solutions – Where Innovation Meets Precision. Our expert team harnesses the latest technologies to craft bespoke solutions, driving your business towards unparalleled success. Elevate your digital experience, optimize operations, and stay ahead in the competitive landscape. Discover the power of Proficient Software Solutions – Your Strategic Technology Partner.

> **Useful Links:** Home · Services · About · Projects

> **Contact Us**
> 35 Lima St
> Sharonlea, Randburg, 2158
> South Africa
> **Phone:** +27 73 794 2244
> **Email:** Proficient@proficientsoftwaresolutions.co.za | sales@proficientsoftwaresolutions.co.za

> © Copyright **Proficient Software Solutions**. All Rights Reserved

## 3.2 Home page

### Working-tree version
- **Hero H1:** "Transform Your Business With **Smart Software Solutions**" (bold part in yellow)
- **Hero lead:** "We deliver custom software that drives growth, optimizes operations, and gives you a competitive edge."
- **Buttons:** "Start Your Project" · "View Our Work"
- **Trust bullets:** "Trusted by 33+ Businesses" · "37+ Successful Projects Delivered"
- **Image badge:** "4 Active Projects"
- **H3:** "Why South African Businesses Choose Us"
  - "We understand local business challenges and deliver solutions that work in the South African market."
  - **Fast Delivery** — "Get working solutions in weeks, not months. We follow agile methodologies to deliver value quickly."
  - **Cost-Effective** — "Local rates without compromising quality. Get premium software at South African prices."
  - **Ongoing Support** — "We're here after launch. Get free support and maintenance to keep your software running smoothly."
- **H2:** "We are a Creative Software Development Agency & Innovation Experts"
  - "At our core, we are a dynamic Creative Software Development Agency and Innovation Experts, dedicated to crafting cutting-edge solutions that transcend conventional boundaries. With a passion for creativity and a commitment to innovation, we bring a fresh perspective to every project we undertake. Our team of skilled professionals excels in turning ideas into reality, leveraging the latest technologies to deliver bespoke software solutions. At the intersection of creativity and technical expertise, we thrive on transforming challenges into opportunities. Join us on a journey where innovation meets excellence, and together, we shape the future of software development."
  - Link: "Learn More ›"
- **H2:** "Our Core Services" — "End-to-end software solutions tailored to your business needs"
  - **UI/UX Design** — "Beautiful, user-friendly interfaces for web and mobile applications" — "Learn More →"
  - **Custom Development** — "Web, mobile, and desktop applications built with modern technologies" — "Learn More →"
  - **Data Analytics** — "Turn data into actionable insights with powerful analytics tools" — "Learn More →"
  - **IT Support** — "Reliable technical support to keep your systems running smoothly" — "Learn More →"
- **Stats:** "4" Active Projects · "37" Completed Projects · "33" Happy Clients
- **H3:** "Our Top Clients" — "Our happy clients are the heart of our success. Discover how we've empowered businesses, building lasting partnerships and ensuring satisfaction."
- **Features list:**
  - **Quality Results** — "Experience excellence in every aspect. Our commitment to quality ensures robust, efficient software, delivering superior results that exceed expectations and drive lasting success."
  - **Real-time Analytics** — "Integrate data analytics tools for real-time insights, enabling informed decision-making and proactive business strategies."
  - **Cross-Platform Compatibility** — "Develop software that works seamlessly across multiple platforms, including web, mobile, and desktop, ensuring a consistent experience for users."
  - **Customization Options** — "Offer flexibility with customizable features, allowing users to tailor the software to their unique needs and preferences."
  - **Free Support** — "Enjoy peace of mind with complimentary support, ensuring your software's optimal performance and seamless functionality, hassle-free."
  - **Integration with Third-Party Tools** — "Ensure compatibility by integrating with popular third-party tools and services, fostering a connected and collaborative digital ecosystem."
- **H2:** "Featured Projects" — "See how we've helped businesses like yours succeed"
  - Badge "Healthcare" — **Ovulae Women's Health Platform** — "Complete health tracking platform with mobile app, portal, and website" — "View Case Study →"
  - Badge "Finance" — **AFX Trust Investment Platform** — "Full-stack investment platform with web, mobile, and desktop applications" — "View Case Study →"
  - Button: "View All Projects"
- **H2:** "Ready to Transform Your Business?" — "Let's discuss your project and create a custom solution that drives results"
  - **Call Us** — "+27 73 794 2244" — "Mon-Fri, 8AM-5PM"
  - **Email Us** — "sales@proficientsoftwaresolutions.co.za" — "Response within 24 hours"
  - **Book a Call** — "Free 30-minute consultation" — button "Schedule Now"

### Committed (HEAD) version — copy that only exists there
- **Hero H1:** "We promise to bring the best **solution** for your business."
- **Hero text:** "Committing to deliver optimal business solutions, we ensure excellence and success in every endeavor."
- **CTA:** "Contact Us ›"
- **H2:** "Explore The Services We Offer For You"
  - "We boast a diverse and highly skilled team with expertise spanning various domains. Following an Agile approach, we adapt flexibly to evolving project needs. Our experts excel in software engineering, design, project management, and quality assurance, ensuring a comprehensive solution for our clients. Committed to staying at the forefront of industry trends, we deliver forward-thinking and dynamic results that exceed expectations"
  - Link: "All Services ›"
  - **Design** — "We design everything including mobile, web, desktop application and more."
  - **Data Analytics** — "Maximize business potential with our data engineers, ensuring robust, secure, and actionable data solutions"
  - **Software Development** — "We develop all types of softwares using modern technologies"
  - **IT Support** — "Seamless operations and rapid issue resolution – our IT support engineers keep your business thriving."
- **H3:** "Our Portfolio" — filters: "All", "Web", "App", "Desktop", "Data Analytics", "Design" (tile titles in §5.4)

## 3.3 About page (company description, founder, vision/mission)

- **H1:** "About Proficient Software Solutions"
- "Proficient Software Solutions (Pty) Ltd is a proudly South African software development company founded in 2017 by **Proficient Mkansi**. The name "Proficient Software Solutions" (PSS) stems from our core philosophy: to build **professional, high-quality software** that makes a real difference in business outcomes."
- "The journey began while Proficient was pursuing his BSc in Software Development at **Rhodes University**. After his first year, he began taking side jobs to sharpen his skills and deliver real-world solutions. This marked the early days of PSS — transforming passion into a brand and service offering."
- "Proficient completed his degree in record time, graduating **Cum Laude**. While gaining corporate experience through employment, he continued to build the company, growing its portfolio through freelance projects and client partnerships."
- "Today, PSS offers full-stack development and innovation-driven solutions across industries, powered by a team committed to **excellence, professionalism, and long-term client success**."
- "**Proficient Mkansi** — Founder & Lead Developer"
- "Connect with the Director:" — "LinkedIn Profile"
- **Our Vision** — "To become a trusted leader in smart, scalable software solutions across Africa — empowering businesses through technology, innovation, and reliability."
- **Our Mission** — "To deliver cutting-edge, user-focused software solutions that solve real-world challenges for businesses and individuals, driven by professionalism, creativity, and continuous learning."
- **Future Outlook** — "As part of our long-term vision, we are expanding into proprietary software development with a focus on building powerful in-house applications tailored for key industries, including:" • Education • Retail • Corporate & Business Operations — "Our mission is to evolve into a multi-product software house delivering impactful solutions across Africa and beyond."

## 3.4 Services page

- **Intro H2:** "Discover tailored solutions for your business with our diverse range of services." — buttons "Our Services", "Our Tech"
- **H3 "Services":** "Embark on a journey of comprehensive services designed to meet the unique needs of your business. Our team of seasoned experts is well-versed in various fields, offering consultancy services or seamlessly integrating into your existing teams. Whether spearheading full-scale projects or providing specialized support to ongoing endeavors, our collaborative approach ensures a tailored and effective solution, fostering success in every aspect of your business."
- **Application Design**
  - "At the core of our innovative approach is a dedicated design team that works seamlessly with our analysts and clients, forming a collaborative trio. This synergy ensures a meticulous understanding of design requirements, guaranteeing top-tier quality. Our versatile designers craft visually captivating solutions for a spectrum of needs, spanning applications (mobile, web, desktop), logos, posters, business cards, email templates, and more."
  - "With a commitment to excellence, our design team transforms ideas into visually stunning realities. Whether creating a user-friendly interface for applications or designing impactful branding materials, our designers are adept at capturing the essence of your vision. By intricately weaving creativity into every aspect, we elevate your brand and user experience to new heights."
- **Software Development**
  - "Our skilled software development team, guided by agile methodology, operates as a cohesive unit to deliver top-quality software products efficiently. With a focus on collaboration and adaptability, we harness our collective expertise to meet project objectives promptly."
  - "Specializing in all types of applications – mobile, web, and desktop – our team ensures seamless integration across platforms, catering to diverse user needs with precision and proficiency."
  - "From mobile apps that redefine user experiences to robust web platforms and versatile desktop applications, our team's dedication to excellence ensures that every project is executed with finesse, delivering solutions that exceed expectations"
- **Data Engineering**
  - "Our analytical data team is at the forefront of deriving meaningful business insights through cutting-edge data engineering. With a keen understanding of modern tools and technologies, we leverage our expertise to expose valuable data that drives informed decision-making for the benefit of the business. Whether it's identifying trends, predicting outcomes, or optimizing operations, our data team operates seamlessly to draw actionable conclusions from complex datasets."
  - "Our analytical data team thrives on flexibility, offering on-site collaborations with clients or taking charge of projects remotely. Whether at your location or entrusted with your project, our dedicated data experts ensure insightful analysis and strategic data-driven solutions for your business."
- **IT Support**
  - "Our friendly IT Support team, the backbone of our operations, extends support to all our applications, ensuring seamless functionality. Committed to excellence, they foster positive relationships with our clients, providing responsive and reliable assistance for a seamless user experience."
  - "With a customer-centric approach, our IT Support team prioritizes client needs, promptly addressing any issues that may arise. Their proactive stance ensures that immediate concerns receive swift attention, minimizing disruptions and optimizing the efficiency of your operations."
- **H3 "Our Technologies":** "Empowering innovation through cutting-edge technologies, we leverage a robust toolkit to deliver state-of-the-art solutions for your business needs. Our commitment to staying at the forefront of technological advancements ensures that we harness the full potential of modern tools and frameworks, driving excellence in every project we undertake."
- **Technology list (28, in display order, with labels as written):** C#, ASP.NET, Xamarin, Android, PHP, JAVA, Python, HTML, JavaScript, CSS, Bootstrap, Jquery, Angular, React, Restful API, MS SQL, Docker, Google Cloud, Azure DevOps, Git, Github, Figma, Adobe XD, Canva, Tableau, Power BI, Looker, Trello

## 3.5 Contact page

- **Intro H2:** "Contact our team and get fast response"
- **H3 "Contact Us":** "Get in touch with us! Your journey towards innovative solutions begins here. Whether you have a project in mind, need assistance, or just want to explore how we can elevate your business, our team is ready to connect and collaborate. Reach out today, and let's embark on a path of success together."
- **Form heading:** "Send us a message" — placeholders "Your Name", "Your Email", "Subject", "Message" — button "Send Message"
- Validation: "Please enter your name" · "Please enter a valid email address" · "Please enter subject" · "Please enter your message"
- Modal: "Sending your email..."
- Success alert: title "Your message sent", text "Your message has been sent to our support team and will be attended to shortly."
- Failure alert: title "Failed", text "Something went wrong, try again!"
- Hidden (never shown): "Your message has been sent. Thank you!"

## 3.6 Projects pages

- **Category band:** "Select Category" — "Web Apps", "Mobile Apps", "PC Apps", "APIs", "Designs"
- **H1:** "Our Project Portfolio"
- **Disclaimer:** "Please note that all showcased projects are included with full consent from our clients for public demonstration. Several additional projects have been excluded from this portfolio in accordance with client confidentiality requests."
- Section headings: "Web Applications", "Mobile Applications", "Desktop Applications", "UX/UI Designs", "APIs"
- **APIs text:** "We excel in developing custom APIs using REST APIs tailored to meet specific project requirements. Below are some public APIs we have integrated into our systems:"
- Card buttons: "View Project" / "View Profile"; detail page: "Project: {name}", "Back To All Projects", "Gallery: Images", labels "Category:", "Client:", "Project Date:", "URL:", "Technologies Used:", "Key Features:"
- All card descriptions: §5.2. All detail-page copy: §5.3.

## 3.7 Contact information, social, location (consolidated)

| Item | Value | Where shown |
|---|---|---|
| Legal name | Proficient Software Solutions (Pty) Ltd | About, meta description, e-mail signature |
| Short name | PSS | Titles, logo |
| Founded | 2017 | About |
| Founder | Proficient Mkansi — "Founder & Lead Developer" (also "the Director") | About, meta author, e-mail signature |
| Education claim | BSc in Software Development, Rhodes University, Cum Laude, "in record time" | About |
| Address | 35 Lima St, Sharonlea, Randburg, 2158, South Africa | Footer, Contact map |
| Phone | +27 73 794 2244 | Footer, Home CTA, e-mail signature |
| Hours | Mon-Fri, 8AM-5PM | Home CTA (working tree only) |
| Public e-mails | Proficient@proficientsoftwaresolutions.co.za · sales@proficientsoftwaresolutions.co.za | Footer; sales@ also on Home CTA |
| Internal e-mails (code only) | clients@proficientsoftwaresolutions.co.za (SMTP sender) · pss.softwares25@gmail.com (second recipient) | `HomeController.cs` |
| Response promise | "Response within 24 hours" | Home CTA |
| Consultation offer | "Free 30-minute consultation" | Home CTA |
| Website | proficientsoftwaresolutions.co.za / www.proficientsoftwaresolutions.co.za | OG tags, e-mail |
| Founder LinkedIn | http://linkedin.com/in/proficient-mkansi-669b31147/ | About |
| Company social media | **None real** — hidden placeholders (Twitter, Facebook, Instagram, Google+, LinkedIn) all `href="#"` | Footer (hidden) |

## 3.8 Legal text

- **None.** No privacy policy, terms of use, cookie policy, POPIA notice, disclaimer page, company registration number or VAT number. Only the copyright line and the portfolio-consent disclaimer (§3.6).

## 3.9 Testimonials

- **None on the site.** (Template CSS for testimonial carousels exists but is unused.)

## 3.10 Statistics / numbers claimed

| Claim | Where |
|---|---|
| 33+ businesses / 33 happy clients | Home hero, stats band |
| 37+ / 37 completed projects | Home hero, stats band |
| 4 active projects | Home hero badge, stats band |
| Founded 2017 | About |
| Free 30-minute consultation; response within 24 hours; Mon-Fri 8AM-5PM | Home CTA |
| "Get working solutions in weeks, not months" | Home |
| AFX Trust "2% weekly return model" | Projects card (client product claim) |
| FPSL "South Africa's first real-time fantasy league mobile app" | `ProjectsHelper` (dead mobile-remarks branch, not rendered) |

## 3.11 Team information

- Only the founder is named or pictured. Copy refers to a "design team", "software development team", "analytical data team", "IT Support team" and "a team committed to excellence" but no other people are shown.

## 3.12 Other claims about the company

- "proudly South African", "Creative Software Development Agency & Innovation Experts", "Your Strategic Technology Partner", "Where Innovation Meets Precision", "Local rates without compromising quality", "premium software at South African prices", free support/maintenance after launch, agile methodology, consultancy / team augmentation ("seamlessly integrating into your existing teams"), on-site or remote data work, ambition to become "a trusted leader … across Africa" and "a multi-product software house".

---

# 4. SERVICES CURRENTLY OFFERED

## 4.1 Service inventory

| # | Service (as named) | Description (source wording, abridged) | Where it appears | Route | Image / icon | CTA |
|---|---|---|---|---|---|---|
| 1 | **UI/UX Design** (Home) / **Application Design** (Services) / **Design** (HEAD Home) | Interfaces for web & mobile; design team + analysts + clients; apps (mobile, web, desktop), **logos, posters, business cards, email templates**, branding | Home "Our Core Services"; Services page row 1; HEAD Home services card | `/`, `/Home/Services` | `images/design.webp` (illustrated monitor with design tools, 512²); `images/design-img2.webp` (stock photo) | "Learn More →" → `/Home/Services` |
| 2 | **Custom Development** (Home) / **Software Development** (Services, HEAD) | Web, mobile and desktop apps, agile team, cross-platform integration | Home; Services row 2; HEAD Home | `/`, `/Home/Services` | `images/backend.webp` (monitor with code + database icon); `images/developer.webp` (photo) | "Learn More →" |
| 3 | **Data Analytics** (Home) / **Data Engineering** (Services) | Insights from data, trends, predictions; on-site or remote; tools Tableau, Power BI, Looker | Home; Services row 3; HEAD Home; Home feature "Real-time Analytics" | `/`, `/Home/Services` | `images/analysis.webp` (dashboard + magnifier); `images/data-engineering.webp` | "Learn More →" |
| 4 | **IT Support** | Support for all PSS applications; responsive, proactive | Home; Services row 4; HEAD Home | `/`, `/Home/Services` | `images/customer-service.webp` (headset agent); `images/support.webp` | "Learn More →" |
| 5 | **Web applications** | Portfolio category (14 cards) | Projects `#web`, nav dropdown | `/Projects/AllProjects#web` | `img/service-software.png` | "View Project" |
| 6 | **Mobile applications** (Android/iOS, Xamarin, .NET MAUI, PWA, Java/Kotlin) | Portfolio category (8) | Projects `#mobile` | `…#mobile` | `img/service-mobile.png` | "View Project" |
| 7 | **Desktop / PC applications** (Windows/macOS/Linux, MetaTrader 5) | Portfolio category (5) | Projects `#desktop` | `…#desktop` | `img/service-desktop.png` | none |
| 8 | **Custom REST APIs & third-party API integration** | "We excel in developing custom APIs…"; Monday.com, API-Football, Twilio, Deriv | Projects `#api`; Home feature "Integration with Third-Party Tools" | `…#api` | `img/service-api.png`; API logos | none |
| 9 | **UX/UI design (Figma, Adobe XD, Canva)** | Portfolio category (8) | Projects `#uxui` | `…#uxui` | `img/service-ux.png` | none |
| 10 | **Consultancy / team augmentation** | "offering consultancy services or seamlessly integrating into your existing teams" | Services intro paragraph only | `/Home/Services` | — | — |
| 11 | **Ongoing / free support & maintenance** | "Get free support and maintenance"; "complimentary support" | Home (2 places) | `/` | headphones icon; `free-support.webp` | — |
| 12 | **Free 30-minute consultation** | "Book a Call" | Home CTA | `/` → `/Home/Contact` | FA calendar icon | "Schedule Now" (goes to generic contact form — no booking tool) |
| 13 | **Branding / graphic design** (logos, posters, business cards, e-mail templates) | Mentioned inside Application Design | Services | `/Home/Services` | — | — |
| 14 | **Proprietary products** (in-house apps for Education, Retail, Corporate) | Future Outlook; portfolio lists MindSharp/Proficient LMS, FPSL, Apex products | About; Projects | `/Home/AboutUs` | `img/future.png` | — |

## 4.2 Duplicates and overlaps

- **Three names for design** ("UI/UX Design", "Application Design", "Design") and a separate "UX/UI Designs" portfolio category; the Services page adds branding/print design that Home never mentions.
- **Two names for development** ("Custom Development" vs "Software Development"); web/mobile/desktop are services on Home but only portfolio categories elsewhere.
- **"Data Analytics" (Home) vs "Data Engineering" (Services)** describe the same offer with different names. The working-tree site has **no data-analytics portfolio evidence** at all (the Power BI / Looker / Tableau tiles existed only in the HEAD Home portfolio).
- **Support** appears as "IT Support" (service), "Ongoing Support" (Why choose us), "Free Support" (features list) — three overlapping claims.
- **APIs** appear as a portfolio category and as the "Integration with Third-Party Tools" feature, but not as a named service.
- Every "Learn More" goes to the same `/Home/Services` page — there are **no individual service pages**.

---

# 5. PORTFOLIO / PROJECTS

## 5.1 Master list (every client/project/product shown anywhere)

Legend — **AP** = All Projects page card · **PD** = has a Project Details page · **HF** = working-tree Home "Featured Projects" · **HP** = HEAD Home portfolio tile · **CL** = client logo on Home.

| # | Project | Client (per code) | Type(s) | Date | Shown in | Enum / detail URL |
|---|---|---|---|---|---|---|
| 1 | Ovulae Portal | Ovulae | Web + Mobile (PWA) | 2025 | AP (web+mobile), PD (both), HF, HP (web+app), CL | `OvulaePortal` + `Web` / `Mobile` |
| 2 | Ovulae Website | Ovulae | Web | 2025 | AP, PD, HP, CL | `OvulaeWebsite` + `Web` |
| 3 | Ovulae App | Ovulae | Mobile (.NET MAUI) | 2025 | AP, PD, HP, CL | `OvulaeApp` + `Mobile` |
| 4 | AFX Trust (website/app) | AFX Trust | Web + Mobile (PWA) + Desktop | 2025 | AP (web, mobile, desktop), PD (web+mobile), HF, HP, CL | `AFXTrust` + `Web`/`Mobile` |
| 5 | CLA Administration Tool | Corporate Voice ("CLA") | Web + Canva design | 2024 | AP (web + design), PD, HP, CL | `CLA` + `Web` |
| 6 | iWatchAllTV | Streama Solutions | Web (React) | 2024 | AP, PD, HP | `IWT` + `Web` |
| 7 | Hlumis'imfundo website | Hlumis'imfundo Foundation / "Hlumi's Imfundo NPC" | Web (PHP) | 2024 | AP, PD | `HlumisiF` + `Web` |
| 8 | Catalyst FX Dynamics website | Catalyst FX Dynamics | Web + Figma design | 2019 | AP (web + design), PD, CL | `CatalystFXD` + `Web` |
| 9 | CPMA App | CP Moloto Advisory | Web + Mobile | 2019 | AP (web+mobile), PD (both), HP, CL | `CPMA` + `Web`/`Mobile` |
| 10 | MetaPOS | Anglojungle | Web dashboard + Android POS + Figma design | 2021 | AP (web, mobile, design), PD (both), HP, CL | `MetaPOS` + `Web`/`Mobile` |
| 11 | PNE / P&E Finance | PNE Finance | Web | 2021 | AP, PD, HP, CL | `PNE` + `Web` |
| 12 | WCG App | Wealth Creators Group | Web | 2022 | AP, PD, HP, CL | `WCG` + `Web` |
| 13 | MindSharp / Proficient LMS | Proficient Software Solutions (in-house) | Web (Blazor) | 2025 | AP, PD | `LMS` + `Web` |
| 14 | AB Tech Mentorship Programme | AB Tech Mentorship | Web | 2024 | AP, PD, HP | `ABTech` + `Web` |
| 15 | Catalyst Risk Tool (CRT) | Catalyst FX Dynamics | Web + Mobile + Desktop | 2025 | AP (all three), PD (web+mobile), HP | `CRT` + `Web`/`Mobile` |
| 16 | ApexGO / Apex Predator AI | Catalyst FX Dynamics | Mobile (Xamarin) + Desktop (MT5) + Figma | 2020 | AP (mobile, desktop, design), PD (mobile), HP | `Apex` + `Mobile` |
| 17 | FPSL – Fantasy Premier Soccer League SA | Proficient Software Solutions (in-house) | Mobile (Xamarin) + Figma | 2024 | AP (mobile + design), PD, HP | `FPSL` + `Mobile` |
| 18 | Gcwensa Automation Tool / Data Tools | Gcwensa | Desktop | — | AP, HP, CL | none |
| 19 | Folder Locker | — | Desktop | — | AP, HP | none |
| 20 | Task Planner (UX design / "Smart Task Planner App") | — | Design (+ app tile in HEAD) | — | AP (design), HP | none |
| 21 | Self-Checkout mobile app / "eStore App" | — | Design (+ app tile in HEAD) | — | AP (design), HP | none |
| 22 | New Shoe Brand website design | — | Adobe XD design | — | AP, HP | none |
| 23 | iChat App | — | Desktop | — | **HP only** | none |
| 24 | Data analytics dashboards (Microsoft Power BI, Looker, Tableau) | — | Data Analytics | — | **HP only** | none |
| 25 | Integrated public APIs: Monday.com, API-Football, Twilio, Deriv | — | API | — | AP `#api` | none |

**Clients shown only as logos (no project on site):** Kwikem, TAPS Technologies, Top 1% Community, De Bet Masterz, Creative Computer Repairs, Ritshuri Tech, Namibian Farmers Online.
**Logo files present but not displayed:** AB Tech Mentorship (`images/clients/Logo.jpg`), iWatchAll (`images/clients/Logo Transparent.png`), Woplhost (`images/clients/wopl-client.png`).

**Naming inconsistencies to resolve (FACT, not corrected):** "Hlumis'imfudo Site" (enum display name), "Hlumis'imfundo Foundation", "Hlumus'Imfundo Website", "Hlumi's Imfundo NPC", URL `hlumisimfundo.co.za`; "PNE Finance" vs "P&E Finance"; "Proficient LMS" vs "MindSharp LMS" vs "Learning Management System"; "ApexGO" vs "Apex Predator AI"; "Twillio" (sic).

## 5.2 All Projects page cards (verbatim descriptions + images)

### Web Applications (`#web`)
| Card title | Card image | Description (verbatim) |
|---|---|---|
| Ovulae Portal | `img/apps/web/ovulae/ovulae-portal-1.png` | The Ovulae Portal is a secure web platform for affiliates, doctors, and admins. It consolidates referral management, clinical content workflows, and operational oversight into one place. |
| AFX Trust Website | `img/apps/web/afx.png` | A corporate investment website built for AFX Trust to showcase their 2% weekly return model, trust elements, investor testimonials, and investment calculator. The site is fast, professional, and conversion-driven. |
| CLA Administration Tool | `img/apps/web/cla.png` | A centralized web platform built for CLA to manage and deploy their suite of modular software solutions to clients. Supports client onboarding, license tracking, and control of leased modules. |
| Ovulae Website | `img/apps/web/ovulae/ovulae-web-1.png` | The Ovulae Website is the public-facing hub for the brand—showcasing features, pricing, and educational value across Period, Ovulation, Pregnancy, and Menopause modules. |
| Hlumus'Imfundo Website | `img/apps/web/hff.png` | Official platform for Hlumi's Imfundo NPC, a mentorship, leadership, and tutoring initiative serving Grades 8–12. The site supports volunteer management, program visibility, and communication for learners and educators. |
| iWatchAllTV App | `img/apps/web/iwt.png` | A subscription management web app for a streaming service offering access to a variety of online channels. Designed for user control, payment integration, and smart content discovery. |
| Catalyst FX Dynamics | `img/apps/web/cfd.png` | A professional fintech website built for Catalyst FX Dynamics, designed to showcase trading tools, company mission, and enable software access with sleek user experience and responsive layout. |
| CPMA App | `img/apps/web/cpma.png` | A legal case management platform for CP Moloto Advisory. Includes client onboarding, attorney assignment, and integrations with Trello, Zendesk, and Monday.com. |
| MetaPOS | `img/apps/web/metapos.png` | Point-of-sale system for mobile and web, used by local retailers for inventory, transactions, and barcode-based sales tracking. |
| PNE Finance | `img/apps/web/pne.png` | Finance application platform for P&E Finance to manage customer funding, document uploads, and admin assessments. |
| WCG App | `img/apps/web/wcg.png` | Investment platform with user dashboards, deposit approvals, and daily return tracking. Built for Wealth Creators Group. |
| Learning Management System | `img/apps/web/lms.png` | In-house education platform in development, offering custom branding and rich features for learners of all levels. |
| AB Tech Mentorship Programme | `img/apps/web/abt.png` | A biographical showcase of a renowned speaker dedicated to inspiring and guiding young professionals and senior students as they transition into the workforce. The programme emphasizes career development, soft skills, and workplace readiness through motivational talks and structured mentorship. |
| Catalyst Risk Tool (CRT) | `img/apps/web/crt.png` | A comprehensive risk management web app designed for traders and investors. CRT helps users calculate trade risk, optimize position sizing, and manage capital efficiently. It offers customizable parameters, real-time projections, and is built for both beginner and experienced traders. |

### Mobile Applications (`#mobile`)
| Card title | Card image | Description (verbatim) |
|---|---|---|
| Ovulae App | `img/apps/mobile/ovulae/ovulae-app.jpg` (6000×3375, 5.9 MB) | Ovulae is a women's health companion app covering Period tracking, Ovulation insights, Pregnancy guidance, and Menopause support. |
| AFX Trust Mobile App | `img/apps/mobile/afx.png` | A secure and user-friendly mobile investment platform developed for AFX Trust, available on both Android and iOS. The app allows users to manage investments, track performance, and access personalized financial insights—all in one place. |
| MetaPOS – Point of Sale System | `img/apps/mobile/metapos.png` | MetaPOS is a versatile point of sale system built for retail environments. Compatible with Android phones and POS devices, the app enables seamless transactions—POS terminals can scan barcodes for sales, while mobile users can tap items to add to cart. Ideal for modern, mobile-first retail operations. |
| Ovulae Portal | `img/apps/mobile/ovulae/portal-app.jpg` (6000×3375, 5.3 MB) | The Ovulae Portal (PWA) provides a mobile-optimized control center for affiliates and medical professionals to manage referrals, content, and user support on the go—mirroring web features with an app-like feel. |
| FPSL – Fantasy Premier Soccer League | `img/apps/mobile/fpsl.png` | A locally developed fantasy football mobile app designed for South African soccer fans. Inspired by the global success of FPL, FPSL allows users to create teams, compete in private and public leagues, and track player performance across the South African Premier Division. |
| CRT App – Catalyst Risk Tool | `img/apps/mobile/crt.png` | A mobile risk management companion for traders, available on both Android and iOS. The CRT App helps users calculate trade risks, determine position sizing, and make informed investment decisions with ease—perfect for on-the-go financial control. |
| CPMA Mobile App | `img/apps/mobile/cpma.png` | The CPMA Mobile App extends legal case management to mobile devices, enabling attorneys, clients, and administrators to track cases, schedule hearings, and communicate securely on the go. With built-in calendar sync, file uploads, and case notifications, it ensures seamless legal workflow beyond the desktop. |
| Apex Predator AI Software | `img/apps/mobile/apex.png` | A sophisticated AI-powered trading assistant designed to analyze market trends, deliver real-time insights, and enhance decision-making for traders. Available across both desktop and mobile platforms, Apex helps users trade with precision and consistency—without emotional bias. |

### Desktop Applications (`#desktop`) — no detail pages
| Card title | Image | Description (verbatim) |
|---|---|---|
| Gcwensa Automation Tool | `img/apps/desktop/gcwensa.png` ("Gcwensa Data Tools" window) | Desktop app for data processing: SQLite to MSSQL conversion, raw Apache file ingestion, and Excel report generation. |
| AFX Trust Desktop App | `img/apps/desktop/afx.png` | A professional-grade desktop platform developed for AFX Trust, designed to manage user portfolios, track investment performance, and generate detailed financial reports. Built for speed, security, and scalability, this tool complements the mobile experience with advanced features tailored for back-office operations. Fully compatible with Windows, macOS, and Linux. |
| Catalyst Risk Tool (CRT) Desktop App | `img/apps/desktop/crt.png` | A cross-platform desktop application designed to help traders and investors calculate, manage, and optimize their trading risk with precision. The CRT Desktop App offers advanced analytics, customizable strategies, and a clean interface—ideal for both beginner and experienced market participants. Fully compatible with Windows, macOS, and Linux. |
| Folder Locker | `img/apps/desktop/fl.png` | A secure desktop utility designed to protect sensitive files and folders with encryption and password protection. Folder Locker ensures privacy for personal and business data with an intuitive interface and strong security protocols. Compatible with Windows, macOS, and Linux. |
| Apex Predator AI – Desktop Version | `img/apps/desktop/apex.png` | The desktop edition of Apex Predator AI, built to seamlessly integrate with MetaTrader 5 on both Windows and macOS. This powerful trading assistant delivers real-time market analysis, signal generation, and decision support for forex and synthetic indices, helping traders maximize performance with precision and confidence. |

### UX/UI Designs (`#uxui`) — no detail pages
| Card title | Image | Description (verbatim) |
|---|---|---|
| MetaPOS UX Design | `img/apps/design/metapos.png` | Modern and responsive UX design for MetaPOS, built using Figma. Tailored for both mobile and POS terminal environments, this interface focuses on retail transaction efficiency, barcode flow, and user-friendly item navigation. |
| Task Planner UX Design | `img/apps/design/task planner.png` | Comprehensive Figma-based UX design for a modern Task Planner application. The design emphasizes productivity, intuitive task flow, scheduling efficiency, and cross-platform compatibility across web and mobile interfaces. |
| CLA Admin Tool | `img/apps/design/CLA Admin.png` | Administrative dashboard concept designed in Canva for CLA operations. The design showcases clear navigation, data visualization, and task management features tailored for internal business use. |
| ApexGO – Mobile App (Figma Design) | `img/apps/design/apex.png` | Modern mobile UI/UX design for the ApexGO app, built in Figma to support seamless signal delivery, user engagement, and trading insights. The design emphasizes usability, clarity, and performance across both Android and iOS platforms. |
| FPSL Mobile App (Figma Design) | `img/apps/design/fpsl.png` | Modern Figma UI/UX design for the Fantasy Premier Soccer League (FPSL), a mobile app concept created for the South African football league. The app allows users to draft teams, track live player stats, view weekly rankings, and engage with fellow fans through mini-leagues and leaderboards. |
| Self-Checkout Mobile App (Figma Design) | `img/apps/design/SelfCheckout.png` | Figma UI/UX design for a modern Self-Checkout mobile application, allowing users to scan items, manage their cart, and complete secure payments from their device. Designed for retail stores seeking to streamline the checkout process and reduce queue times. |
| Catalyst FX Dynamics Website Design (Figma) | `img/apps/design/cfd.png` | Figma design for the Catalyst FX Dynamics website, featuring a modern and professional layout optimized for showcasing financial services, client testimonials, and educational resources about trading and investments. |
| New Shoe Brand Website Design (Adobe XD) | `img/apps/design/shoeBrand.png` | Adobe XD design for the new shoe brand website, featuring a stylish and user-friendly layout tailored to showcase various shoe collections, brand story, and interactive elements for an engaging user experience. |

Hidden (dead) links on desktop/design cards: `/Portfolio/ApexPredatorAI`, `/Portfolio/AFXTrustDesktop`, `/Portfolio/CRTDesktop`, `/Portfolio/FolderLocker`, `/Portfolio/ApexPredatorDesktop`, `/Portfolio/MetaPOSDesign`, `/Portfolio/TaskPlannerDesign`, `/Portfolio/CLAAdminDesign`, `/Portfolio/ApexGODesign`, `/Portfolio/FPSLMobileDesign`, `/Portfolio/SelfCheckoutDesign`, `/Portfolio/CatalystFXDynamicsDesign`, `/Portfolio/NewShoeBrandDesign` — **all 404** (no `Portfolio` controller).

## 5.3 Project Details content (verbatim from `Helpers/ProjectsHelper.cs` + `Helpers/Enums/ProjectNameType.cs`)

Fields shown on each detail page: Name (enum `Display.Name`), Client (enum `Display.ShortName`), Category, Project Date, URL, Technologies Used, Paragraph 1, Paragraph 2, Key Features, Remarks.

> **Remarks bug (FACT):** `GetProjectRemarks` (line 725) tests `projectType != ProjectType.Web`, so **Web pages never show remarks**, and **Mobile pages show the "web" remark list** (the separate mobile remark list is dead code). Both lists are captured below as they exist in code; "Displayed?" says what users actually see.

### Catalyst FX Dynamics – Web (`CatalystFXD`, Web)
- Client: Catalyst FX Dynamics · Category: Web Design & Deployment · Date: 2019 · URL: https://www.catalystfxdynamics.com
- Tech: HTML5, Bootstrap 5, CSS, ASP.NET (back-end), Static hosting with form handler integration
- P1: "I designed and developed a modern, responsive corporate website for Catalyst FX Dynamics—an innovative fintech company specializing in algorithmic trading solutions and risk analysis tools. The platform features custom sections for showcasing products like Apex Predator AI and CRT, each with technical documentation, embedded tutorial videos, and clear call-to-actions to increase client engagement and drive downloads." *(note: first-person "I")*
- P2: "The website provides in-depth overviews of trading software, download portals, and educational walkthroughs via embedded videos. Each product page includes screenshots, technical specs, and real-world applications to assist both novice and experienced traders."
- Features: Clean, responsive design with intuitive navigation · Dedicated product pages for each trading software · Embedded YouTube tutorials · Downloadable Android trading assistant · Optimized SEO structure · Fast-loading and accessible across devices
- Remark (not displayed): "A clean corporate site to amplify trust and deliver digital-first trading insight."
- Gallery: `img/apps/web/catalyst/1–6.png`

### AFX Trust App (`AFXTrust`)
- Client: AFX Trust · Category: Investment Platform Design & Integration · Date: 2025 · URL (web & mobile): https://www.afxtrust.com
- **Web** tech: HTML5, Bootstrap 5, CSS, TailwindCSS, ASP.NET 8 MVC, JavaScript, SQL Server, RestAPIs, PWA Integration
- Web P1: "AFX Trust's website was built to serve as a secure, investor-friendly portal for clients engaging in structured financial investment plans. The platform guides users through personalized investment plan selection, account creation, funding via integrated payment gateways, and provides real-time ROI breakdowns. The admin side includes powerful tools to monitor users, manage investments, and approve transactions."
- Web P2: "The site includes investment calculators, admin dashboards, and fully automated Paystack payment processing for seamless investor onboarding. Additional features include bonus logic, payout scheduling, and reinvestment automation, all accessible via mobile or desktop."
- Web features: Secure investment onboarding · Admin dashboard for investor management · Paystack payment integration · Realtime return calculation · Support for reinvestment plans · Fully mobile-compatible
- **Mobile** tech: ASP.NET MVC, PWA (Service Worker, Manifest), REST APIs, Mobile-Responsive UI
- Mobile P1: "The AFX Trust mobile app, designed as a Progressive Web App (PWA), empowers users to manage their investments, view earnings, and reinvest—all from their mobile device. Built with ASP.NET MVC and enhanced with service workers and web manifests, it offers offline access, push notifications, and full responsiveness. The mobile experience mirrors the web with secure plan creation, payment integration, and real-time investment performance tracking."
- Mobile P2: "The app includes mobile-optimized investment plan setup, automated bonus calculations, and reinvestment logic. With offline capabilities and push notifications, users are kept informed of updates and earnings without needing constant access."
- Mobile features: Offline-first Progressive Web App · Secure investment plan creation · Push notifications with payout updates · Bonus & reinvestment automation · Responsive UI on all device sizes · Built using ASP.NET MVC and REST APIs
- Remark displayed on Mobile: "Successfully modernized investor access with automated plans, secure finance tools, and user-first engagement." · Dead mobile remark: "The PWA model enabled fast deployment across devices, delivering a seamless and secure investment experience."
- Gallery: web `img/apps/web/afx/1–6.png`; mobile hero `img/apps/mobile/afx.png`, screens `img/apps/mobile/afx/1–3.png`

### CLA Administration Tool (`CLA`, Web)
- Client: Corporate Voice · Category: Enterprise Administration Tool · Date: 2024 · URL: https://corporatevoice.co.za/cla
- Tech: ASP.NET MVC, JavaScript, jQuery, SQL Server, SignalR, Desktop integration endpoints
- P1: "CLA Administration Tool was developed for Corporate Voice to centralize the management of modular desktop software components. The web app acts as a command center for scheduling popups, surveys, and real-time messages pushed to remote client desktops running Windows. It offers deep integration with backend logs and uses SignalR for live activity syncing."
- P2: "The admin tool enables scheduling of events, syncing of data, and secure communication with deployed desktop modules. Through a dynamic interface, users can manage clients, broadcast software updates, and oversee usage statistics of individual modules like popups and surveys."
- Features: Control modular apps remotely · Schedule content and popups · Use SignalR for live updates · Integrated desktop sync APIs · Detailed admin audit logs · Multi-role user control
- Remark (not displayed): "The admin portal unified all modular software management with zero-deployment control."
- Gallery: `img/apps/web/cla/1–6.png`

### iWatchAllTV (`IWT`, Web)
- Client: Streama Solutions · Category: Streaming Subscription & Account Management · Date: 2024 · URL: none
- Tech: React.js, TailwindCSS, .NET Web API, Entity Framework, MSSQL, Payment Gateway Integration
- P1: "The IWatchAllTV platform was designed to educate users about available content subscriptions, manage user authentication, and facilitate access to streaming services across TV, desktop, and mobile apps. The system offers login details provisioning, self-service subscription management, and device-agnostic compatibility."
- P2: "It supports subscription plans, streaming credentials, and mobile-friendly UI with payment confirmations and account provisioning. Users can view active packages, manage linked devices, and receive renewal reminders through the dashboard."
- Features: React single-page application · User subscription and payment system · Stream credential generation · Streaming guide with instructions · Customer self-management interface · Mobile-optimized user experience
- Remark (not displayed): "Streamlined cross-platform subscription management from mobile to TV apps."
- Gallery: `img/apps/web/iwt/1–5.png`

### Hlumis'imfundo (`HlumisiF`, Web)
- Name: "Hlumis'imfudo Site" · Client: Hlumis'imfundo Foundation · Category: Education & Mentorship Showcase Website · Date: 2024 · URL: https://www.hlumisimfundo.co.za
- Tech: HTML, PHP, CSS, JavaScript, PHPMyAdmin
- P1: "Hlumis'imfundo is a tutoring and mentorship programme website designed to communicate the initiative's mission to empower learners. It introduces the founding team, outlines their mentorship methods, features upcoming events, and provides a streamlined contact form for parent inquiries and sponsorship partnerships."
- P2: "The system helps communicate value to parents while offering structured information about mentors, events, and registration. Event listings are linked with calendar reminders, while the contact section promotes trust through testimonials and clean UI."
- Features: none (empty list → "Key Features" hidden)
- Remark (not displayed): "Empowered local tutoring brand to present itself professionally to parents and funders."
- Gallery: `img/apps/web/hlumisiF/1–5.png`

### CPMA App (`CPMA`)
- Client: CP Moloto Advisory · Category: Legal Case Management Platform · Date: 2019 · URL (web & mobile): https://cpmaserverdev.azurewebsites.net *(a dev/staging Azure URL)*
- **Web** tech: ASP.NET Core, Blazor, JavaScript, Android (Java), SignalR, Trello/Zendesk/Monday.com APIs, Twillio VoIP Integration
- Web P1: "CPMA is a complete legal case management platform for CP Moloto Advisory. The platform simplifies the flow of legal operations by assigning attorneys, automating communication between parties, logging each stage of legal processes, and integrating external services like Trello and Monday.com for workflow clarity. Built-in VOIP enables direct calls from the app."
- Web P2: "The system includes live chat support, VOIP integration, and a powerful calendar for hearing schedules, all tied together in one solution. It integrates Trello to handle case flows, Monday.com for team updates, and Zendesk for tracking client requests."
- Web features: Attorney-client case assignment · Live chat (Zendesk) · VoIP calls (Twillio) · Calendar API integration · Modular dashboard views · Trello & Monday.com workflows · Onboarding and document storage
- **Mobile** tech: Xamarin.Forms, C#, .NET Core APIs, Azure Notification Hub, Secure Auth
- Mobile P1: "The CPMA Mobile App extends legal case management to Android and iOS using Xamarin.Forms. Lawyers and clients can securely exchange documents, view case timelines, and receive notifications. The app features deep integration with the main web dashboard and supports cross-platform updates through a unified API layer."
- Mobile P2: "Lawyers and clients can chat, upload files, review case milestones, and receive hearing notifications. Authentication is secure and supports both biometric and PIN-based logins."
- Mobile features: Cross-platform (Xamarin.Forms) · Biometric and PIN login · Secure chat with case documents · Notifications for hearings · Case status tracking · Works with CPMA Web Dashboard
- Remark displayed on Mobile: "Brought law-firm client operations online—securely and efficiently—with real-time communications." · Dead mobile remark: "Cross-platform legal app enhances client-attorney communication from anywhere."
- Gallery: web `img/apps/web/cpma/1–6.png`; mobile hero `img/apps/mobile/cpma.png`, screens `img/apps/mobile/cpma/1–3.png`

### MetaPOS (`MetaPOS`)
- Client: Anglojungle · Category: Retail Analytics & Management Dashboard · Date: 2021 · URL: web https://www.metapos.co.za; mobile none
- **Web** tech: ASP.NET MVC, Bootstrap 5, SQL Server, Web APIs, JWT Auth, App Syncing
- Web P1: "MetaPOS Dashboard serves as the web-based analytics and control panel for MetaPOS retail operations. It allows business owners and managers to view daily reports, sales summaries, inventory analytics, and manage staff logins. The dashboard complements the point-of-sale mobile app and centralizes operations requiring secure access."
- Web P2: "Its role is to provide real-time sales summaries, stock analysis, system configuration, and performance metrics. Admins can fine-tune promotions, view staff shifts, and use analytics to make informed decisions based on live data from POS devices."
- Web features: Retail analytics overview · View sales and transactions · Create staff logins · Connects with POS app · Secure API endpoints · Separation of daily ops and admin tools
- **Mobile** tech: Java, Kotlin, CakePHP APIs, C# .NET APIs, GCP & AWS Hosting, SQLite Sync
- Mobile P1: "MetaPOS runs on Android tablets and POS devices using native Java and Kotlin. The app handles inventory, customer checkouts, printing, and staff management. It syncs in real-time with a cloud backend (CakePHP and .NET APIs) and is hosted across Google Cloud and AWS for performance and reliability."
- Mobile P2: "Sales transactions sync automatically, even from remote POS locations. Offline-first support ensures sales are stored locally when network is unavailable. Admin users can access shift reports and update product catalogs remotely."
- Mobile features: Inventory + sales tracking · Runs on Android POS devices · Works offline with sync to cloud · Daily staff reporting · Built with Java/Kotlin · Multi-location support
- Remark displayed on Mobile: "Connected real-time POS transactions with analytics for informed decisions." · Dead mobile remark: "A robust Android POS app optimized for offline sales and cloud-synced analytics."
- Gallery: web `img/apps/web/metapos/1–6.png`; mobile hero `img/apps/mobile/metapos.png`, screens `img/apps/mobile/metapos/1–3.png`

### PNE Web App (`PNE`, Web)
- Client: PNE Finance · Category: Purchase Order Financing Portal · Date: 2021 · URL: none
- Tech: ASP.NET MVC, Bootstrap, SQL Server, JavaScript, REST APIs, Android SDK
- P1: "PNE App was developed to systemize the Purchase Order Financing process. From application form completion and document upload to real-time feedback and fund disbursement notifications, the site enables clients to apply for funding with fewer delays and increased transparency. Admins can approve, request revisions, or escalate cases."
- P2: "It features a clean application form, review workflow, and mobile integration to enable businesses to apply for funding easily. Email and SMS confirmations ensure that clients receive updates on funding decisions instantly."
- Features: Digital PO Financing submission · Document upload · Status tracking and funding updates · Admin reviewer dashboard · SMS and email notifications · Web + Android sync
- Remark (not displayed): "Digitized funding applications for speed, transparency, and traceability."
- Gallery: `img/apps/web/pne/1–6.png`

### WCG App (`WCG`, Web)
- Client: Wealth Creators Group · Category: Investment Platform with Admin Oversight · Date: 2022 · URL: none
- Tech: ASP.NET Core, Docker, CI/CD pipelines, JavaScript, SQL Server, DevOps Tooling
- P1: "Wealth Creators Group (WCG) platform was developed to digitize their investment process—from marketing to user engagement, investment registration, ROI visibility, and scheduled withdrawal handling. The system supports admin approvals and includes automated returns calculation to promote user retention."
- P2: "The platform also manages user deposits, approvals, and offers return breakdowns, with withdrawals restricted to Tuesdays. Admins can view logs, initiate bonuses, and manage investor documents securely."
- Features: Marketing pages for investors · Login portal for investment tracking · Deposit and withdrawal rules · Admin approval workflows · Dockerized build for deployments · Scalable with CI/CD support
- Remark (not displayed): "Offered an all-in-one investor platform with scalable, managed deployments."
- Gallery: `img/apps/web/wcg/1–5.png`

### ABTech (`ABTech`, Web)
- Client: AB Tech Mentorship · Category: Professional Mentorship & Career Development · Date: 2024 · URL: none
- Tech: HTML5, TailwindCSS, JavaScript, Bootstrap 5, Google Analytics, SEO optimization
- P1: "AB Tech Mentorship's website serves as a comprehensive biographical platform for its founder and programme, highlighting milestones, inspirational talks, and soft skills workshops. It presents professional development resources tailored for students and job seekers, guiding them from academic spaces into the workforce."
- P2: "The site offers biographical profiles, upcoming event listings, and structured programme outlines to inspire youth and professionals. It acts as a source of motivation and insight for career preparation, especially targeting undergraduates and new graduates."
- Features: Mentor biography showcase · Career-readiness articles · Responsive programme layout · Event highlights · Social proof sections · Youth-focused UX
- Remark (not displayed): "Built to inspire the next generation of professionals with structured career content."
- Gallery: `img/apps/web/abtech/1–5.png`

### Catalyst Risk Tool (`CRT`)
- Client: Catalyst FX Dynamics · Category: Risk Management Web App for Traders · Date: 2025 · URL (web & mobile): https://www.catalystrisktool.com
- **Web** tech: ASP.NET MVC, Bootstrap, JavaScript, Dynamic Risk Logic, Realtime Projections
- Web P1: "CRT—Catalyst Risk Tool—is a specialized trading utility built to help investors calculate trade size, understand potential losses, and apply smart strategies through risk-adjusted logic. It features input customization for stop-loss, leverage, equity settings, and offers clear breakdowns of risk-to-reward ratios."
- Web P2: "It includes parameters for leverage, SL/TP ratio settings, equity monitoring, and smart alerts to support active trade planning. Users can simulate different risk outcomes and refine their strategy before executing trades."
- Web features: Custom trade risk calculations · Leverage planner · Smart alerts & validation · Dark/light UI themes · Mobile + Web PWA support · Professional UX
- **Mobile** tech: ASP.NET MVC, JavaScript, PWA Support, SignalR, Real-time Risk Engine
- Mobile P1: "CRT's mobile version brings advanced risk management directly to traders' fingertips. Built as a PWA using ASP.NET MVC, the app includes service worker support, dynamic risk calculations, offline capability, and push alerts for price and equity triggers. Traders can evaluate SL/TP ratios, simulate trades, and adjust sizing — all on the go."
- Mobile P2: "CRT mobile supports parameter configuration, dark/light themes, and real-time alerts even when offline. It syncs seamlessly with web settings and allows users to test risk setups on a small screen with precision."
- Mobile features: Mobile risk calculator · SL/TP input simulator · Offline support via service worker · Risk-to-reward visual outputs · Dark/light modes · Real-time sync with web dashboard
- Remark displayed on Mobile: "CRT reshaped how individual traders approach capital preservation and planning." · Dead mobile remark: "Designed with real-time risk logic, CRT's mobile version empowers traders on the move."
- Gallery: web `img/apps/web/crt/1–7.png`; mobile hero `img/apps/mobile/crt.png`, screens `img/apps/mobile/crt/1–3.png`

### MindSharp / Proficient LMS (`LMS`, Web)
- Name: "MindSharp LMS" · Client: Proficient Software Solutions · Category: Multi-Tenant Learning Management System, Education · Date: 2025 · URL: none
- Tech: Blazor Server, Entity Framework, ASP.NET Core, JavaScript, SignalR, Responsive UI
- P1: "Proficient LMS is an internal project aimed at building a full-scale educational platform designed for learners across levels. It features course delivery, tracking, student portals, branded themes per institution, and is built for scalability. This project reflects our team's passion for learning and academic excellence."
- P2: "The LMS project was inspired by a personal commitment to education—aiming to provide academic tools to learners of every level. The backend offers detailed student analytics while the front end provides a distraction-free learning environment with gamified elements."
- Features: Course builder for admins · Quizzes and feedback modules · Student progress tracking · Custom branding for each school · Multilingual support · Planned Android/iOS mobile app
- Remark (not displayed): "A purpose-driven education platform designed to scale with every student's potential."
- Gallery: single image `img/apps/web/lms.png` (plus an empty string entry from `"lms.png##".Split` → a **broken second slide**)

### FPSL – Fantasy Premier Soccer League SA (`FPSL`, Mobile)
- Client: Proficient Software Solutions · Category: Sports, Soccer & Entertainment · Date: 2024 · URL: none
- Tech: Xamarin C#, RESTful API, Fantasy Scoring Engine, SignalR (Live Data Sync)
- P1: "Fantasy Premier Soccer League SA (FPSL) is a mobile-first cross-platform fantasy football app built with Xamarin. Currently under development, the app will allow users to draft players, manage squads, track stats, and compete for prizes based on real-world football performance. It's designed for scalability and real-time sync with live matches."
- P2: "Players will draft teams, join leagues, and receive live scores as the matches unfold. Admin panels and scoring algorithms are integrated with server APIs for fair play enforcement."
- Features: Fantasy football team creation · Live match stats integration · League and prize management · Built in Xamarin for scalability · Real-time scoring updates · Admin control panel
- Remark: none displayed · Dead mobile remark: "Built for football fans, FPSL is South Africa's first real-time fantasy league mobile app."
- Gallery: hero `img/apps/mobile/fpsl.png`, screens `img/apps/mobile/fpsl/1–3.png`

### ApexGO (`Apex`, Mobile)
- Client: Catalyst FX Dynamics · Category: Financial Markets, Forex & Crypto · Date: 2020 · URL: **https://www.catalystfxdynamics/Products/Apex** *(broken — missing ".com")*
- Tech: Xamarin (Android), REST API Integration, Manual APK Distribution, Realtime Signal Alerts
- P1: "ApexGO is a mobile trading assistant derived from Apex Predator AI. Built using Xamarin for Android, it allows users to view live market signals, monitor alerts, and access strategies. While the APK is currently offered via direct download on the Catalyst FX Dynamics website, work is ongoing to deliver a native iOS version."
- P2: "The app simplifies trade signals with a clean interface showing buy/sell indicators, setup screenshots, and entry/exit strategies. Users are notified instantly when new setups become available."
- Features: Live AI trading alerts · Manual APK download option · Setup screenshots and strategies · Simple buy/sell UI · Lightweight for low-end devices · Planned iOS release
- Remark: none displayed · Dead mobile remark: "A lightweight, signal-rich app that delivers AI insights straight to traders' pockets."
- Gallery: hero `img/apps/mobile/apex.png`, screens `img/apps/mobile/apex/1–4.png`

### Ovulae Portal (`OvulaePortal`)
- Client: Ovulae · Category: Affiliate, Medical & Admin Portal (PWA + Web) · Date: 2025 · URL (web & mobile): https://portal.ovulae.com
- **Web** tech: ASP.NET Core 9 (MVC), PWA (Service Worker, Web Manifest), REST APIs, EF Core, SQL Server, Role-based Auth, SignalR (live updates)
- Web P1: "The Ovulae Portal is a secure web platform for affiliates, doctors, and admins. It consolidates referral management, clinical content workflows, and operational oversight into one place. The PWA experience ensures fast, app-like performance across desktop and mobile."
- Web P2: "Role-based access enables tailored dashboards: affiliates track clicks, signups, and commissions.Admins oversee user metrics, payouts, and compliance. SignalR keeps live stats in sync." *(missing space after "commissions." in source)*
- Web features: Role-based dashboards (Affiliate / Doctor / Admin) · Real-time referral & commission tracking (SignalR) · Content management & doctor review workflows · PWA: app-like performance on desktop/mobile · Secure auth with granular permissions · Analytics & payout management
- **Mobile** tech: ASP.NET Core 9 (PWA), Service Worker, Web Manifest, REST APIs, EF Core, SQL Server
- Mobile P1: "The Ovulae Portal (PWA) provides a mobile-optimized control center for affiliates and medical professionals to manage referrals, content, and user support on the go—mirroring web features with an app-like feel."
- Mobile P2: "Affiliates monitor performance and payouts; doctors manage content and feedback. The PWA works offline for basic screens and reconnects gracefully, ensuring continuity during spotty connectivity."
- Mobile features: Affiliate performance on the go · Mobile-first dashboards (PWA) · Doctor content review & approvals · Offline-friendly shell for basic screens · Secure login & role-scoped actions · Live stats & payout previews
- Remark displayed on Mobile: "A lightweight, mobile-first control center that keeps partners productive anywhere." · Dead mobile remark: "Unified operations for affiliates, doctors, and admins—with PWA speed and reliability."
- Gallery: web `img/apps/web/ovulae/ovulae-portal-1.png`, `ovulae-portal-2.png`; mobile hero `img/apps/mobile/ovulae/portal-app.jpg`, screens `img/apps/mobile/ovulae/1p–4p.png`

### Ovulae Website (`OvulaeWebsite`, Web)
- Client: Ovulae · Category: Marketing Website & Brand Hub · Date: 2025 · URL: https://www.ovulae.com
- Tech: ASP.NET Core 9 MVC, BootstrapCSS, Razor Views, SEO, CDN assets, Contact/Lead capture, Analytics
- P1: "The Ovulae Website is the public-facing hub for the brand—showcasing features, pricing, and educational value across Period, Ovulation, Pregnancy, and Menopause modules. It's designed for clarity, trust, and conversions, with clean messaging and clear call-to-actions."
- P2: *(none)*
- Features: Clear product storytelling for all four modules · Fast, SEO-friendly pages with analytics · Direct links to App Store / Play / AppGallery · Lead capture & contact flows · Brand-consistent UI and trust signals · Scalable hosting with CDN-ready assets
- Remark: none displayed · Dead remark (in mobile list): "The brand's front door—optimized for clarity, credibility, and conversions."
- Gallery: `img/apps/web/ovulae/ovulae-web-1.png`, `ovulae-web-2.png`

### Ovulae App (`OvulaeApp`, Mobile)
- Client: Ovulae · Category: Women's Health: Period, Ovulation, Pregnancy & Menopause · Date: 2025 · URL: https://play.google.com/store/apps/details?id=com.ovulae.org.ovulaeapp&hl=en
- Tech: .NET MAUI (Android/iOS), .NET 9 Web API, EF Core, Local Notifications, Background Jobs, Branch.io (Deep Links), Paystack integration
- P1: "Ovulae is a women's health companion app covering Period tracking, Ovulation insights, Pregnancy guidance, and Menopause support. Built with .NET MAUI, it delivers a smooth native experience with privacy-first data handling and optional expert support."
- P2: "Users configure goals and preferences, receive smart reminders, and access medically reviewed guidance. Deep linking supports referrals, while Paystack-powered flows handle subscriptions. Background jobs schedule helpful, non-spammy notifications."
- Features: Period, Ovulation, Pregnancy & Menopause tracking · Clinically reviewed guidance & tips · Deep links for referrals (Branch.io) · Smart notifications with daily caps · Secure subscription payments (Paystack) · Native .NET MAUI performance
- Remark displayed: "A privacy-first women's health companion available across major app stores."
- Gallery: hero `img/apps/mobile/ovulae/ovulae-app.jpg`, screens `img/apps/mobile/ovulae/1–7.png`

## 5.4 Committed (HEAD) Home portfolio grid — 37 tiles

| Filter | Tile title (as written) → image | Tile link |
|---|---|---|
| Web | Ovulae Portal → `img/apps/web/ovulae/ovulae-portal-1.png`; CLA Admin Tool → `img/apps/web/cla/4.png`; AFX Trust → `img/apps/web/afx/4.png`; CPMA App → `img/apps/web/cpma/3.png`; WCG App → `img/apps/web/wcg/3.png`; IWatchAllTV App → `img/apps/web/iwt/2.png`; PNE Finance App → `img/apps/web/pne/4.png`; CRT Web App → `img/apps/web/crt/6.png`; Ovulae Website → `img/apps/web/ovulae/ovulae-web-1.png`; Metapos Web App → `img/apps/web/metapos/1.png`; AB-Tech Site → `img/apps/web/abtech/2.png` | Project details (Web) |
| App | Ovulae App → `…/mobile/ovulae/ovulae-app.jpg`; AFX Trust App → `…/mobile/afx.png`; CRT App → `…/mobile/crt.png`; Ovulae Portal → `…/mobile/ovulae/portal-app.jpg`; MetaPOS App → `…/mobile/metapos.png`; ApexGO App → `…/mobile/apex.png`; CPMA App → `…/mobile/cpma.png`; FPSL App → `…/mobile/fpsl.png`; **Task Planner** → `images/portfolio/app-smartCalendar.png`; **eStore App** → `images/portfolio/app-selfcheckout.png` | Project details (Mobile) / All Projects |
| Desktop | **iChat App** → `images/portfolio/desktop-chatApp.png`; CRT App → `img/apps/desktop/crt.png`; Apex MT5 → `img/apps/desktop/apex.png`; Gcwensa App → `images/portfolio/desktop-gcwensa.png`; Folder Locker → `images/portfolio/desktop-folderLocker.png` | `/Projects/AllProjects#desktop` |
| Data Analytics | **Microsoft Power BI** → `images/portfolio/data-powerBI.png`; **Looker** → `images/portfolio/data-looker.png`; **Tableau** → `images/portfolio/data-1.png` | `/Projects/AllProjects` |
| Design | Figma → `img/apps/design/apex.png`, `cfd.png`, `metapos.png`, `SelfCheckout.png`, `fpsl.png`; Adobe XD → `shoeBrand.png`; Canva → `CLA Admin.png`, `task planner.png` | `/Projects/AllProjects#uxui` |

Items that exist **only** in the HEAD grid: iChat App, eStore App, Task Planner (as an app), and the three data-analytics dashboards.

---

# 6. IMAGE / MEDIA ASSET INVENTORY

All paths are relative to `wwwroot/`. Dimensions were read from the files. **No byte-identical duplicate images were found (MD5 check)**; near-duplicates are flagged. Flags: **KEEP** = worth preserving · **LOW-RES** · **HEAVY** (>1 MB) · **UNUSED** (not referenced by any view, helper, or custom CSS/JS) · **BROKEN-REF** · **OBSOLETE**.

## 6.1 PSS logos and brand assets

| File | Size | Dimensions | Used for | Flags |
|---|---|---|---|---|
| `images/mainLOGO2.webp` | 50 KB | 405×208 (lossless) | Header logo — gradient "PSS" + tagline "SOLUTIONS ENGINEERED FOR SUCCESS" | **KEEP** (best available logo; no SVG/vector exists in the repo) |
| `images/logo.webp` | 165 KB | 1200×630 | `<link rel="icon">` and `apple-touch-icon` — "PSS" wordmark **without** tagline on white | KEEP as source; wrong shape/size for a favicon |
| `img/social.png` | 248 KB | 1200×630 | `og:image` (but the tag outputs the unresolved path `~/img/social.png`, so it never works) — PSS logo + tagline on pale blue | **KEEP** (correct OG size) |
| `img/preloader.webp` | **2.3 MB** | 1092×1080, **animated, 151 frames** | Preloader on every page, contact "sending" modal, and `rel="shortcut icon"` | HEAVY; circular cyan badge with PSS logo — keep as a brand reference only |
| `images/slog.png` / `images/slog.webp` | 12 KB / 5 KB | 404×31 | — tagline strip only | UNUSED; near-duplicate pair |
| `favicon.ico` | 5 KB | 16×16 | Served at `/favicon.ico` | **OBSOLETE** — default ASP.NET template icon, not PSS branding |
| `images/mainLOGO2.png` | — | — | Referenced by e-mail template | **Missing file** (BROKEN-REF) |

## 6.2 Hero, banner and background images

| File | Size | Dimensions | Used on | Notes |
|---|---|---|---|---|
| `images/banner-img.webp` | 30 KB | 583×478 | Home hero (both versions) | Flat illustration: three people at a desk with laptops and a chart board, clock/chat icons. KEEP (low-res for a hero on retina) |
| `images/learn-img.webp` | 49 KB | 886×591 | Home "Creative Agency" (inside SVG blob mask) | Stock photo: team meeting at a whiteboard with sticky notes. Referenced with a **relative path** — breaks on `/Home` and `/Home/Index` |
| `images/word-map.png` | 139 KB | 1836×912 | Home stats band texture | Faint dotted world map. Relative path — same breakage |
| `img/about.webp` | 126 KB | 1920×1080 | About banner | Office team photo **with "ABOUT US" text and PSS logo baked in** — not reusable as a clean photo |
| `images/intro-bg.webp` | 12 KB | 1920×900 | Services/Contact banner (via NewBiz CSS) | Blue diagonal wave background (template asset) |

## 6.3 Illustrations and icons

| Group | Files | Dimensions | Used on | Flags |
|---|---|---|---|---|
| Service illustrations | `images/design.webp`, `backend.webp`, `analysis.webp`, `customer-service.webp` | 512×512 | Home "Our Core Services" (80 px) | KEEP (consistent flat-illustration set) |
| Tiny feature icons | `images/quality-results.webp` (34×31), `analytics.webp` (36×36), `affordable-pricing.webp` (34×34), `easy-to-use.webp` (36×36), `free-support.webp` (30×36), `effectively-increase.png` (30×36) | ≤36 px | Home features list | **LOW-RES** (blurry on high-DPI); template icons |
| `images/affordable-pricing.png` | 34×34 | — | — | UNUSED near-duplicate of the `.webp` |
| Line icons | `images/graphics-design.webp`, `marketing.webp`, `seo.webp`, `web-design.webp` | 78×80 | — | UNUSED (template leftovers) |
| About illustrations | `img/vision.png` (983×987), `img/mission.png` (1044×1042), `img/future.png` (900×1080) | — | About cards | KEEP |
| Portfolio category tiles | `img/service-software.png` (437×382), `service-mobile.png` (331×385), `service-desktop.png` (455×396), `service-api.png` (502×354), `service-ux.png` (473×381) | — | All Projects category band | KEEP (colourful isometric set) |
| Font/icon libraries | Font Awesome 4.6.3/4.7/6.3.0, Ionicons 2, Bootstrap Icons 1.11.3 | — | Everywhere | Replace in rebuild |

## 6.4 Stock photography

| File | Dimensions | Used on | Flags |
|---|---|---|---|
| `images/design-img2.webp` | 956×667 | Services — Application Design | Stock (overhead team with wireframes). Licence **UNKNOWN** |
| `images/developer.webp` | 1440×960 | Services — Software Development | Stock |
| `images/data-engineering.webp` | 768×513 | Services — Data Engineering | Stock; smallish |
| `images/support.webp` | 2048×1365 | Services — IT Support | Stock |
| `images/learn-img.webp` | 886×591 | Home | Stock |
| `images/portfolio/app1–3.jpg`, `card1–3.jpg`, `web1–3.jpg` | 579–1302 px | — | **UNUSED**, OBSOLETE NewBiz demo placeholders (phone on desk, "Thank you" card, etc.) |

## 6.5 Team / people

| File | Size | Dimensions | Used | Flags |
|---|---|---|---|---|
| `images/director3.webp` | 215 KB | 1536×2048 | About — founder portrait (Proficient Mkansi) | **KEEP** (only team photo) |
| `images/LinkedIn_icon.webp` | 12 KB | 2048×2048 | About — 24 px LinkedIn icon | Oversized for its use |

## 6.6 Client logos (`images/clients/`)

| File | Dimensions | Company (as shown in image) | Used on Home? | Flags |
|---|---|---|---|---|
| `ovulae.webp` | 2048×2030 | Ovulae (purple lotus) | Yes | KEEP |
| `afx-trust.png` | 1265×383 | AFX Trust — "Grow Smarter. Invest Simply." (dark background) | Yes | KEEP |
| `catalyst-fx-dynamics.png` | 1000×232 | Catalyst FX Dynamics (black/gold) | Yes | KEEP |
| `cla.webp` | 1920×547 | Corporate Voice — "Creating engaged employees" | Yes | KEEP |
| `kwikem.png` | 692×146 | Kwikem | Yes | KEEP |
| `taps-client2.jpeg` | 522×213 | TAPS Technologies — "Your Business is Our Business" (black) | Yes | KEEP (JPEG, not transparent) |
| `taps-client.jpeg` | 720×365 | TAPS Technologies | No | UNUSED near-duplicate |
| `cpma-client.svg` | vector | CPMA — CP Moloto Advisory | Yes | KEEP |
| `MetaPOS-client.svg` | vector | MetaPOS | Yes | KEEP |
| `Client-top1Percent.png` | 149×63 | Top 1% Community | Yes | LOW-RES |
| `Gcwensa-Logo.png` | 82×100 | Gcwensa | Yes | **LOW-RES** |
| `WCG_Logo-full3.png` | 384×318 | Wealth Creators Group | Yes | KEEP |
| `WCG_Logo-full.png` / `WCG_Logo-full2.png` | 326×320 / 582×429 | Wealth Creators Group | No | UNUSED near-duplicates |
| `DeBetMasters-client.png` | 563×443 | De Bet Masterz — "Bet with ease" | Yes | KEEP |
| `pnefinance-client.png` | 345×145 | P & E Finance | Yes | KEEP |
| `CCR-Client.png` | 347×44 | Creative Computer Repairs | Yes | LOW-RES (very short) |
| `ritshuriTech-client.png` | 213×102 | Ritshuri Tech — "Innovation and Excellence" | Yes | LOW-RES |
| `client-namibia.png` | 1567×1051 | Namibian Farmers Online | Yes | KEEP |
| `Logo.jpg` | 823×439 | AB Tech Mentorship Programme | No | UNUSED (portfolio client without logo on site) |
| `Logo Transparent.png` | 516×247 | iWatchAll | No | UNUSED |
| `wopl-client.png` | 172×62 | Woplhost | No | UNUSED |

## 6.7 Technology and API logos

- `images/tech/` (used on Services): `c.svg`, `dotnet.png`, `xamarin.svg`, `android-studio.svg`, `php.png`, `java.svg`, `python.png`, `html5.svg`, `js.png`, `css.png`, `bootstrap.svg`, `jquery.svg`, `angular.svg`, `react.png`, `rest-api.svg`, `ms-sql.svg`, `docker.svg`, `gcp.png`, `azureDevOps.png`, `git.svg`, `github.svg`, `figma.png`, `adobeXD.png`, `canva.svg`, `tableau.png`, `power BI.png` (space in filename), `looker.png`, `trello.png`.
- UNUSED in `images/tech/`: `ms-azure.svg`, `postgre.svg`, `restapi.png`, `restapi.webp`.
- API logos: `images/twilio.svg` (used); `images/monday-api.webp` (337×84), `images/api-football.webp` (181×46), `images/derivAPI.webp` (135×33) exist but the page requests `.png` → **BROKEN-REF**.
- Recommendation-neutral fact: most third-party logos should come from official brand kits in the rebuild.

## 6.8 Portfolio screenshots — current set (`img/apps/`, ~75 MB, 157 files) — **KEEP**

| Folder | Content | Typical size |
|---|---|---|
| `img/apps/web/{abt,afx,cfd,cla,cpma,crt,hff,iwt,lms,metapos,pne,wcg}.png` | **Card cover images** (browser-frame screenshots) | 1920×900 |
| `img/apps/web/{abtech,afx,catalyst,cla,cpma,crt,hlumisiF,iwt,metapos,pne,wcg}/N.png` | Detail-page galleries (5–7 each) | ~1918×990 |
| `img/apps/web/ovulae/ovulae-portal-1/2.png`, `ovulae-web-1/2.png` | Ovulae galleries/covers | ~1919×1030 / 1919×945 |
| `img/apps/mobile/{afx,apex,cpma,crt,fpsl,metapos}.png` | Composite phone mock-up covers | 1920×1080 (700 KB–1 MB each) |
| `img/apps/mobile/{afx,apex,cpma,crt,fpsl,metapos}/N.png` | Individual phone screens | 600×950 |
| `img/apps/mobile/ovulae/1–7.png`, `1p–4p.png` | Ovulae app / portal phone screens | ~1260×2510 (0.75–1.4 MB each) — HEAVY |
| `img/apps/mobile/ovulae/ovulae-app.jpg`, `portal-app.jpg` | Ovulae composite covers | **6000×3375, 5.9 MB and 5.3 MB** — HEAVY (used as card images) |
| `img/apps/desktop/{afx,apex,crt,fl,gcwensa}.png` | Desktop app screenshots | 1920×1080 |
| `img/apps/design/{apex,cfd,CLA Admin,fpsl,metapos,SelfCheckout,shoeBrand,task planner}.png` | Figma/XD/Canva workspace shots | 1920×1080 (spaces in two filenames) |
| `img/apps/design/ovulae.png`, `ovulae-2.png`, `ovulae-3.png`, `ovulae-figma.png` (3200×2400), `ovulae-figma.jpg` (6000×3375, 3.1 MB) | Ovulae design work | **UNUSED — good unused material** |

Other HEAVY files: `img/apps/web/iwt/1.png` (3.0 MB), `img/apps/web/iwt.png` (2.4 MB), `img/apps/web/catalyst/1.png` (2.3 MB), `img/apps/web/hlumisiF/1.png` (1.7 MB), `img/apps/web/hlumisiF/4.png` (1.3 MB), `img/apps/web/wcg/1.png` (1.4 MB).

**Content flags (FACT, for review before reuse):**
- iWatchAllTV screenshots (`img/apps/web/iwt.png`, `iwt/*`) show film promotional imagery (a well-known action-film cast) — third-party copyright.
- AFX Trust dashboard screenshots show a logged-in account name ("DeProf Codes") and balances.
- Client logos/screens: the site states consent was obtained; no evidence either way is in the repo.

## 6.9 Portfolio screenshots — older set (`images/portfolio/`)

`app-metapos.png`, `app-metapos2.png`, `app-selfcheckout.png`, `app-smartCalendar.png`, `data-1.png`, `data-2.avif`, `data-looker.png`, `data-powerBI.png`, `design-adobeXD0/1.png`, `design-canva0/1.png`, `design-figma0/1.png`, `desktop-chatApp.png`, `desktop-folderLocker.png`, `desktop-gcwensa.png`, `web-cpma.png`, `web-metapos.png`, `web-pne.png`, `web-wcg.png`.
- **All UNUSED in the working tree.** Several were used by the HEAD Home portfolio (data dashboards, iChat, Gcwensa, Folder Locker, Task Planner, eStore). They are older versions of shots now in `img/apps/`. **The Power BI / Looker / Tableau dashboards and iChat are the only visual evidence of the data-analytics and chat-app work — preserve.**

## 6.10 Videos

- **None in the repo.** `/videos/catalyst-demo.mp4` is referenced by both project-detail partials (hidden) and does not exist. `wwwroot/owl-carousel/assets/owl.video.play.png` is a library asset.

## 6.11 Miscellaneous

- `img/apps.zip` — **67 MB, untracked**, 159-file archive mirroring `img/apps/` (a backup; not referenced).
- `fonts/` — Lato (Black/Bold/Light/Medium/Regular/Semibold) and Open Sans (Bold/Regular/Semibold) **TTF only**, plus Font Awesome 4 webfonts.
- `owl-carousel/assets/ajax-loader.gif` — library asset.
- Total `wwwroot` ≈ 194 MB, of which vendor libraries and unused files are a large share.

---

# 7. CURRENT BRAND / VISUAL SYSTEM

Based strictly on the code and assets. There is **no formal design system**: colours and type come from three templates plus overrides, so the same role often has several values.

## 7.1 Colours (exact values from CSS / inline styles)

| Role | Value(s) | Where |
|---|---|---|
| **Primary PSS blue** | **`#009cdd`** | Hero gradient start, icon circles, nav hover, hamburger bars, About accents & card borders, scrollbar thumb, `.counter-number` |
| Primary variants | `#0c9dde` (project headings, `.text-theme`, category borders), `#0066cc` (hero gradient end), `#007bff` (active nav link, Bootstrap 4 primary, NewBiz links/buttons), `#0d6efd` (Bootstrap 5 `.btn-primary`/`.bg-primary`/`.text-primary`), `#0077cc`, `#1b6ec2` (unused isolation CSS) | various |
| Cyan gradient (buttons) | `#06c6f9 → #38eaf9` (0°) | `.theme-btn`, Gtco "Learn More" pills, LinkedIn button, "View Project" |
| Blue→cyan gradient (graphics) | `rgb(29,62,222)` `#1d3ede` → `rgb(1,230,248)` `#01e6f8` | Stats blob, SVG blob behind photo |
| Accent yellow | `#ffcc00` (hero headline highlight); Bootstrap warning `#ffc107` (hero "Start Your Project" button, "4 Active Projects" badge, check icons) | Home hero only |
| Dark navy | `#021623` (About H1, e-mail template bands); `#0C263A` (template heading colour); `navy` (project names, feature lists) | |
| Footer | `#004a99` (top band), `#00428a` (bottom band), text `#eee` / `#ecf5ff`, link hover `#74b5fc` | |
| Light backgrounds | `#e6f2fb` (header, portfolio tiles, scrollbar track, email modal), `#e9f5fb` (projects title bands), `#ecf5ff` (clients/tech sections), `#f8f9fa` (Bootstrap `bg-light` sections), `#f2f6fa`/`#f0faff`/`#eef5f9` (About gradients), `#f7f8f8` (e-mail body) | |
| Borders | `#d6eaff` (client grid), `#e9ecef` (service cards), `silver` (contact boxes) | |
| Text | `#444`, `#555`, `#666666`, `#6B777F` (template body), `#556877`, `#283d50` (NewBiz headers), Bootstrap `text-muted` `#6c757d` | |
| Legacy trading-site colours still in CSS | `gold` (Bitrader `--brand-color`; dropdown item hover; `.nav-links:hover` in clientStyles), `lime`, `#f0a500`, `deepskyblue`, `#000` body in `assets/site.css` (overridden by `body{background:white !important}`) | |
| Misc | Carousel arrows **`red`**; portfolio hover overlay `#003166`; SweetAlert defaults | |

The logo itself is a navy-to-bright-blue/cyan gradient "PSS" (raster only; exact hex values are **UNKNOWN** — no vector/brand guide in the repo).

## 7.2 Fonts

| Font | Source | Used for |
|---|---|---|
| **Anek Telugu** (100–800) | Google Fonts `@import` in `assets/css/style.css` | All `h1–h6` by default (template rule) — the most visible heading face |
| **Open Sans** (300–800) | Google Fonts `@import`; also self-hosted TTFs (`OpenSans-Regular/Semibold/Bold`) | Body text, nav, buttons |
| **Montserrat** (300–700) | Google Fonts `<link>` **only on Services and Contact** | NewBiz headings, intro banners, footer headings (fallback font on other pages → footer looks different per page) |
| **Lato** (Light/Regular/Medium/Semibold/Bold/Black) | Self-hosted TTF | Gtco sections: stats numbers (Lato-Bold 60 px), features-list titles (Lato-Semibold 22 px), old hero (Lato-Light 48 px) |
| **Barlow** | not loaded | Declared in e-mail templates |
| Icon fonts | FA 4.6.3, FA 4.7, FA 6.3 (SVG+JS), Ionicons 2, Bootstrap Icons | Icons |

## 7.3 Typography hierarchy (as rendered)

- Hero H1 (Home, working tree): Bootstrap `display-4` (≈3.5rem / 56 px), bold, white, Anek Telugu; 2rem on ≤ 768 px.
- Section H2 (e.g. "Our Core Services", "Featured Projects"): Bootstrap default ≈ 2rem, bold, dark navy.
- Some section titles are H3 styled large (`fs-dynamic-large-3` = 30 px; "Our Top Clients" in NewBiz style 36 px weight 500, `#283d50`).
- Card titles: H5 bold.
- Custom size utilities in `css/sharedStyle.css` (all `!important`): `fs-dynamic-small` 12 px, `-normal` 14, `-medium-1` 16, `-medium-2` 18, `-large-1` 20, `-large-2` 25, `-large-3` 30 px; at ≤ 415 px: 10/12/13/15/16/18/20 px.
- Body: 16 px Open Sans (template), 18 px `#666` for Gtco paragraphs, 13 px Montserrat in footer.
- Heading levels are used for size, not structure (e.g. H5 inside cards, H4 for page intro, H2 before H1 on project pages).

## 7.4 Buttons

1. **Cyan gradient pill** — `#06c6f9→#38eaf9`, radius 50 px, white uppercase Open Sans Semibold 18 px, padding 5×30 px; hover opacity 0.8 with black text. ("Learn More", "View Project", "Back To All Projects", "LinkedIn Profile", old hero "Contact Us"). In Gtco sections the arrow icon sits in a white 32 px circle.
2. **Bootstrap `btn-warning btn-lg`** — solid yellow, bold dark text, rocket icon ("Start Your Project").
3. **Bootstrap `btn-outline-light btn-lg`** — white outline on blue ("View Our Work").
4. **Bootstrap `btn-primary`** — `#0d6efd` rectangle, 6 px radius ("View All Projects" lg with briefcase icon, "Schedule Now" sm, "Send Message").
5. **NewBiz intro pills** — solid blue "Our Services", white-outline "Our Tech" (Services page).
6. **Text links with arrow** — "Learn More →", "View Case Study →" (blue, bold, small).
7. **Category tiles** (All Projects) — bordered square with image + label, hover lift.

## 7.5 Cards

- **Why-choose-us cards:** white, no border, `shadow-sm`, centred, 70 px `#009cdd` circle icon.
- **Service cards:** white, 1 px `#e9ecef` border, square corners, centred 80 px illustration; hover `translateY(-5px)` + `0 10px 30px rgba(0,0,0,.1)`.
- **Featured project cards:** `shadow-sm`, no border, 200 px image (`object-fit: cover` inline but overridden to `contain` globally by `.card-img-top{object-fit:contain !important}`), coloured badge, H5, text, link.
- **All Projects cards:** `shadow-sm`, full-height, image top (contain), navy title, centred gradient pill.
- **About cards:** `shadow`, `rounded-3`, pale gradient, 4 px `#009cdd` left border.
- **Client logo cells:** square white cells in a bordered grid (160 px tall), logo zooms ×1.2 on hover.
- **HEAD service cards (Gtco):** white, radius 20 px, `0 15px 40px rgba(0,0,0,.08)`, rotated pastel oval icon background.

## 7.6 Border radius

50 px pills · 50 % circles (icons) · Bootstrap `rounded-3` (0.5 rem) and `rounded-pill` · 8 px (About portrait) · 20 px (Gtco cards) · **30 px** (project-detail screenshots) · 10 px (e-mail modal) · 6 px (NewBiz portfolio tiles) · 0 (service cards, client grid).

## 7.7 Shadows

`shadow-sm`, `shadow`, `shadow-lg` (hero image) · `0 10px 30px rgba(0,0,0,.1)` (hover) · `0 10px 50px rgba(0,0,0,.1)` (feature icons) · `0 15px 40px rgba(0,0,0,.08)` (Gtco) · header `0 5px 10px -5px rgba(0,0,0,.3)` · clients section **inset** `0 0 12px rgba(0,0,0,.1)`.

## 7.8 Background treatments

- Blue 135° gradient hero with a translucent white SVG wave at the bottom.
- Organic "blob" SVG shapes (Gtco): photo clipped into a rounded irregular quadrilateral with a faint gradient blob behind; the stats band is a large blue→cyan blob with a dotted world-map texture.
- NewBiz blue wave banner image with a curved bottom edge (Services/Contact).
- Flat pale blue bands (`#e9f5fb`, `#ecf5ff`) and Bootstrap `bg-light` alternating sections.
- About: soft diagonal white/grey-blue gradient.

## 7.9 Navigation styling

Light-blue fixed bar, logo left, plain dark text links, blue bold active state, white rounded dropdown panel with shadow (gold hover), cyan hamburger on mobile. No CTA button, no border or divider beyond a soft shadow.

## 7.10 Footer styling

Two-tone royal blue, white text, uppercase letter-spaced company name, underlined links, plain-text contact details, centred copyright bar. No logo, no social icons (hidden), no newsletter, no legal links.

## 7.11 Icon style

Mixed: Font Awesome solid glyphs (rocket, eye, check-circle, bolt, headphones, phone, envelope, calendar, briefcase, arrows); Ionicons (old portfolio); Bootstrap Icons (eye); colourful flat illustrations (service icons, About, category tiles); tiny template PNG/WebP icons (features list). Two Home icons render as a **"?" placeholder** because the class names don't exist (`fa-clock-o` is FA4-only syntax and `fa-rand` doesn't exist in any version) and FA6's SVG script replaces unknown icons.

## 7.12 Image treatment

Screenshots in browser frames or phone mock-ups on branded backgrounds; `object-fit: contain` (leaving pale letterbox space); 30 px rounded screenshots on detail pages; stock photos without overlays (except the About banner with baked-in text); one portrait with a fade-to-white gradient.

## 7.13 General visual personality

Friendly, corporate-tech, blue-and-cyan, light and airy with rounded pills and blobs — but **visibly assembled from three templates**: Gtco's organic blobs and gradient pills, NewBiz's boxed grids and wave banners, Bitrader's header/typography, and fresh Bootstrap-default sections. Result: inconsistent fonts between pages, several button styles, mixed icon families, and sections that don't share spacing or alignment rules. The yellow accent appears only in the new hero.

---

# 8. CURRENT HOME PAGE — VERY DETAILED

Reconstruction of the **working-tree** `Views/Home/Index.cshtml` as rendered at 1440 px (desktop) and 500 px (mobile). Content sits in a centred Bootstrap container (≈1320 px wide at a 1440 px viewport).

### 8.0 On load
Full-screen preloader with the animated PSS badge for ~1.5 s, then fades.

### 8.1 Header / navbar
- 76 px tall, fixed, `#e6f2fb`. Logo (110 px wide) at the far left of the container. Menu centred-right: **Home** (blue, bold — active), About, Services, Projects ▾, Contact Us. No CTA.
- Mobile (< 992 px): logo left, cyan hamburger right.

### 8.2 Hero
- Full-bleed band, `linear-gradient(135deg, #009cdd 0%, #0066cc 100%)`, 100 px vertical padding, a translucent white wave SVG across the lower part.
- **Left column (50 %)**, vertically centred:
  - **H1** (≈56 px, bold, white, three lines): "Transform Your Business With" + **"Smart Software Solutions"** in yellow `#ffcc00`.
  - Lead paragraph (white, ~20 px): "We deliver custom software that drives growth, optimizes operations, and gives you a competitive edge."
  - Two large buttons side by side: **yellow "🚀 Start Your Project"** → `/Home/Contact`; **white-outline "👁 View Our Work"** → `/Projects/AllProjects`.
  - Two trust lines with yellow check-circle icons: "Trusted by 33+ Businesses", "37+ Successful Projects Delivered".
- **Right column (50 %)**: `banner-img.webp` illustration (team at a desk, presenter at a chart board) inside a rounded card with a large shadow; a yellow rounded-pill badge "⚡ 4 Active Projects" overlaps its top-left corner.
- Mobile: columns stack (text, then image); hero gets 40 px top margin, H1 drops to 2rem, buttons shrink.

### 8.3 "Why South African Businesses Choose Us"
- `bg-light` band. Centred H3 + muted subtitle.
- Three equal white cards with soft shadow, centred: 70 px `#009cdd` circle icon, bold H5, muted paragraph.
  - Fast Delivery (**icon broken — shows "?"**) · Cost-Effective (**icon broken — shows "?"**) · Ongoing Support (headphones).
- Mobile: cards stack.

### 8.4 "We are a Creative Software Development Agency & Innovation Experts" (`id="services"`)
- White. Left 7/12: stock photo of a team meeting clipped into an organic rounded shape with a faint cyan blob behind it. Right 5/12: H2 (Lato/Anek, ~30 px, three lines), a 170-word paragraph (grey, 16 px), and a cyan gradient pill **"LEARN MORE ›"** → `/Home/AboutUs`.
- Mobile: image above text.

### 8.5 "Our Core Services" (`#services-preview`)
- White. Centred H2 + subtitle "End-to-end software solutions tailored to your business needs".
- **Four cards in a row** (2×2 at 768–991 px, stacked below 768 px): bordered white boxes, 80 px flat illustration, bold H5, small muted description, blue bold "Learn More →" (all → `/Home/Services`). Hover: card lifts with shadow.

### 8.6 Stats band
- A large irregular blob (SVG, blue `#1d3ede` → cyan `#01e6f8`, with a dotted world map) spanning the container, 150 px bottom margin.
- Three columns of white text: big numbers (Lato Bold 60 px) **4**, **37**, **33** with labels "Active Projects", "Completed Projects", "Happy Clients". Numbers are static (no count-up). The first label is visibly larger than the other two (inconsistent classes).
- Mobile: the SVG shrinks; numbers drop to 24 px (≤ 767 px) and 18 px (≤ 600 px); two labels stay 16 px (13 px at ≤ 415 px) but the first label, which lacks the size class, drops to **8 px** at ≤ 500 px.

### 8.7 "Our Top Clients" (`#clients`)
- Pale blue `#ecf5ff` band with an inset shadow. Centred H3 + one-line paragraph.
- A grid of **16 logos, 4 per row** (3 per row at 768–991 px, **1 per row below 768 px**), each in a 160 px white cell with thin blue-grey borders forming a table-like grid; logos zoom on hover. Order: Ovulae · AFX Trust · Catalyst FX Dynamics · Corporate Voice · Kwikem · TAPS Technologies · CPMA · MetaPOS · Top 1% Community · Gcwensa · Wealth Creators Group · De Bet Masterz · P&E Finance · Creative Computer Repairs · Ritshuri Tech · Namibian Farmers Online.
- No links, no alt text on logos.

### 8.8 Features list
- White. **Six items in a 3×2 grid** (2 columns at 768–991 px, 1 below): each has a 60 px white circle with shadow holding a tiny coloured icon, a H5 title (Lato Semibold 22 px), and a grey paragraph: Quality Results · Real-time Analytics · Cross-Platform Compatibility · Customization Options · Free Support · Integration with Third-Party Tools.

### 8.9 "Featured Projects" (`#our-work`)
- `bg-light`. Centred H2 + subtitle.
- **Two cards side by side** (stack on mobile): screenshot (200 px tall, letterboxed), coloured badge (blue "Healthcare" / green "Finance"), bold title, one-line description, blue "View Case Study →" (JS `onclick` — no `href`, not crawlable).
  1. Ovulae Women's Health Platform → Ovulae Portal (Web) details page
  2. AFX Trust Investment Platform → AFX Trust (Web) details page
- Centred Bootstrap blue button **"💼 View All Projects"** → `/Projects/AllProjects`.

### 8.10 "Ready to Transform Your Business?" (contact CTA)
- White band (the markup asks for white text but has no background; the template's dark heading colour wins, so the heading renders dark and the paragraph grey).
- H2 + lead paragraph, then **three white boxes** in a row (no visible borders on a white page): phone icon **Call Us** "+27 73 794 2244" "Mon-Fri, 8AM-5PM"; envelope **Email Us** "sales@proficientsoftwaresolutions.co.za" "Response within 24 hours" (**address is clipped** at desktop width); calendar **Book a Call** "Free 30-minute consultation" + small blue **"Schedule Now"** → `/Home/Contact`.
- Phone and e-mail are plain text (not clickable).

### 8.11 Footer
As §2.0.

### 8.12 What is *not* on the Home page
No testimonials, no process/how-we-work section, no pricing, no FAQ, no blog/news, no team section, no awards/certifications, no newsletter, no contact form, no map, no social links.

### 8.13 Hidden/behavioural details
- Home nav link is `/#`. The "services" anchor id is on the agency section, not on the services section.
- Isotope from unpkg is loaded and errors (no grid); `main2.js` errors (no WOW). Neither is visible to users.
- The committed HEAD version of this page is described in §2.1b.

---

# 9. NAVIGATION / INFORMATION ARCHITECTURE

## 9.1 Current hierarchy

```
Home  /                                   (also /Home, /Home/Index)
├── About                /Home/AboutUs
├── Services             /Home/Services   (single page; in-page #about, #services)
├── Projects             /Projects/AllProjects
│   ├── All              /Projects/AllProjects
│   ├── Web Apps         /Projects/AllProjects#web
│   ├── Mobile Apps      /Projects/AllProjects#mobile
│   ├── Desktop Apps     /Projects/AllProjects#desktop
│   ├── APIs             /Projects/AllProjects#api
│   ├── UX/UI Design     /Projects/AllProjects#uxui
│   └── (Project Details) /Projects/ProjectDetails?projectNameType={X}&projectType={Web|Mobile}
│        Web:    CatalystFXD, AFXTrust, CLA, IWT, HlumisiF, CPMA, MetaPOS, PNE, WCG, ABTech, CRT, LMS, OvulaePortal, OvulaeWebsite
│        Mobile: AFXTrust, CRT, CPMA, Apex, FPSL, MetaPOS, OvulaeApp, OvulaePortal
└── Contact Us           /Home/Contact    (GET page + POST /Home/Contact)

Not in navigation (non-page):
  /ApexPredator/GetAllApexPredatorData
  /ApexPredator/GetAllApexGoAccess
  /ApexPredator/GetAllApexSymbolData
```

Footer "Useful Links": Home, Services, About, Projects (no Contact).

## 9.2 Findings

**Difficult to discover**
- Project detail pages are reachable only through JS `onclick` handlers (no `href`), so they are invisible to crawlers, can't be opened in a new tab, and aren't keyboard-focusable.
- Services has no sub-pages; each service's details are only on one long page.
- The founder/LinkedIn and Vision/Mission content are only on About.

**Redundant / duplicated**
- `/`, `/Home`, `/Home/Index` serve identical content (no canonical).
- Each project with web + mobile versions has two near-identical detail pages.
- "Featured Projects" (Home) and the All Projects page repeat the same cards with different wording.

**Dead or broken links / resources**
- 13 hidden `/Portfolio/*` links on desktop/design cards → 404.
- `/Projects/CatalystFXDynamicsWeb` → 500 (action with no view).
- `/Projects` → 404 (no `Index` action).
- `/Home/Error` → 404 (so real errors show blank pages).
- ApexGO project URL `https://www.catalystfxdynamics/Products/Apex` (missing `.com`).
- CPMA project URL is a dev Azure host (`cpmaserverdev.azurewebsites.net`).
- API logos (`monday-api.png`, `api-football.png`, `derivAPI.png`) → 404.
- `/videos/catalyst-demo.mp4`, `assets/images/icon/moon.svg`, `images/mainLOGO2.png` (e-mail) → 404.
- Relative image paths (`images/learn-img.webp`, `images/word-map.png`) → 404 when Home is opened at `/Home` or `/Home/Index`.
- LMS detail carousel has an empty second slide.
- Footer social icons → `#` (hidden).
- "Schedule Now" / "Book a Call" promises booking but goes to the generic contact form.

**Routes that appear unused**
- The three `/ApexPredator/*` endpoints are not used by the website (but probably used by external trading products — see §1.11).
- `Error.cshtml`, `_ValidationScriptsPartial.cshtml`, `EmailTemplates.EnquiryEmailTemplate`, `ProjectsController`'s e-mail service, `ProjectType.Design`.

**Redirects**
- **No server-side redirects exist.** HTTPS redirection only.
- **Client-side URL rewriting:** `ProjectDetails.cshtml:34-52` stores the project in `sessionStorage` and uses `history.replaceState` to strip the query string, leaving `/Projects/ProjectDetails` in the address bar. If that bare URL is shared/bookmarked/opened in a new session, the server renders an empty page and JS then redirects to `?projectNameType=null&projectType=null` (an empty project page). Invalid enum values also return **200 with empty content** (soft 404).
- `ProjectsController.ProjectDetails` redirects to `/Projects/AllProjects` only if an exception is thrown (which in practice doesn't happen).

---

# 10. FORMS AND CONVERSION FLOWS

## 10.1 Contact form (the only form)

| Aspect | Implementation (FACT) |
|---|---|
| Page | `/Home/Contact` (`Views/Home/Contact.cshtml`) |
| Purpose | General enquiry / "Send us a message" |
| Fields | `#name` text "Your Name"; `#email` type=email "Your Email"; `#subject` text "Subject"; `#message` textarea (6 rows) "Message". **No `name` attributes**, no labels (placeholders only), no phone, company, budget, service type or consent fields. |
| Client validation | `ValidateEnquireForm()` — each field non-empty; e-mail must match `/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/` (rejects valid TLDs longer than 3 characters, e.g. `.online`, `.agency`, and `+` addresses). Messages shown in red spans. |
| Server validation | **None** (no data annotations, no `ModelState` check). |
| Submission | Button `type="button"` → `ContactUs()` → shows loader modal → `$.ajax({type:"POST", url:"/Home/Contact", data:{Email, FullName, Subject, Message}})` (form-urlencoded). |
| Anti-spam / security | No anti-forgery token, no CAPTCHA, no honeypot, no rate limiting. Inputs are inserted unencoded into the HTML e-mail. `console.log` prints the form contents. |
| Backend action | `HomeController.Contact(SupportMailViewModel)` (`HomeController.cs:38-59`) |
| Email behaviour | Two SMTP sends via `mail.proficientsoftwaresolutions.co.za:8889` (no TLS) from `clients@…`: to `sales@proficientsoftwaresolutions.co.za` (subject "Enquiry : {name}") and to `pss.softwares25@gmail.com` (subject "Enquirey - From {name}"). HTML body = branded template with an enquiry-details table; plain-text alternative. No Reply-To. **No confirmation e-mail to the visitor.** |
| DB / API behaviour | None — nothing stored; if SMTP fails the enquiry is lost. |
| Success behaviour | Hide modal → SweetAlert (success icon) "Your message sent" / "Your message has been sent to our support team and will be attended to shortly." **Form fields are not cleared.** |
| Failure behaviour | Only if the HTTP request itself fails (e.g. a 500): SweetAlert "Failed" / "Something went wrong, try again!". Because `SendEmail` swallows errors and the action always returns `Ok()`, **SMTP failures are reported to the visitor as success**. The `NotFound()` branch is effectively unreachable. |
| Analytics | No GA event on submit. |

## 10.2 Other CTAs (no forms)

| CTA | Page | Destination |
|---|---|---|
| "Start Your Project" | Home hero | `/Home/Contact` |
| "View Our Work" | Home hero | `/Projects/AllProjects` |
| "Learn More ›" | Home agency section | `/Home/AboutUs` |
| "Learn More →" ×4 | Home services | `/Home/Services` |
| "View Case Study →" ×2 | Home featured | project details (JS) |
| "View All Projects" | Home | `/Projects/AllProjects` |
| "Schedule Now" (Book a Call — "Free 30-minute consultation") | Home | `/Home/Contact` (no scheduling tool) |
| Phone "+27 73 794 2244" / e-mail sales@ | Home, footer | **not clickable** (no `tel:`/`mailto:`) |
| "LinkedIn Profile" | About | founder's LinkedIn |
| "Our Services" / "Our Tech" | Services intro | in-page anchors |
| "View Project" / "View Profile" | All Projects | project details (JS) |
| Category tiles | All Projects | in-page smooth scroll |
| External project "URL:" links | Project details | client sites / Play Store |
| (HEAD only) "Contact Us ›", "All Services ›" | old Home | `/Home/Contact`, `/Home/Services` |

**Not present:** request-a-quote form, consultation booking (Calendly etc.), newsletter signup, careers/application form, live chat, WhatsApp button, downloadable brochure.

---

# 11. SEO / META / SEARCH SETUP

## 11.1 Page titles (from `ViewData["Title"]`)

| URL | `<title>` |
|---|---|
| `/` | PSS - Welcome |
| `/Home/AboutUs` | About PSS |
| `/Home/Services` | PSS Services |
| `/Home/Contact` | Contact Us |
| `/Projects/AllProjects` | Projects |
| `/Projects/ProjectDetails?…` | the project name only, e.g. "AFX Trust App", "CPMA App", "ApexGO", "Hlumis'imfudo Site", "MindSharp LMS" |

No brand suffix on most titles; no keywords such as "software development company South Africa / Johannesburg / Randburg".

## 11.2 Meta tags

- **Identical on every page** (set in the layout): `description`, `keywords`, `author`, `application-name`, `og:title`, `og:site_name`, `og:url`, `og:description`, `og:type=website`, `og:image`.
- `og:url` is always the homepage, even on inner pages.
- **`og:image` is broken:** rendered HTML is `content="~/img/social.png"` — Razor does not resolve `~` inside `<meta content>`, and OG images must be absolute URLs. Link previews therefore have no image (the correct 1200×630 image exists at `/img/social.png`).
- **No Twitter/X card tags.**
- **No `<link rel="canonical">`** on any page.
- `<meta charset>` comes *after* `<title>` (minor).
- `lang="en"` set on `<html>`.

## 11.3 robots.txt / sitemap / structured data

- `/robots.txt` → **404** (none).
- `/sitemap.xml` → **404** (none).
- **No structured data** (no JSON-LD `Organization`, `LocalBusiness`, `WebSite`, `BreadcrumbList`, etc.).
- No `hreflang`, no Google Search Console verification tag in the repo (verification may exist via DNS — UNKNOWN).

## 11.4 Favicons

- `<link rel="icon" href="/images/logo.webp">` (1200×630, non-square, 165 KB)
- `<link rel="apple-touch-icon" href="/images/logo.webp">` (same)
- `<link rel="shortcut icon" href="/img/preloader.webp" type="image/x-icon">` (2.3 MB animated WebP labelled as x-icon)
- `/favicon.ico` = default ASP.NET template icon (16×16) — what browsers request by default.
- No `site.webmanifest`, no 32/192/512 px PNG icons, no theme-color.

## 11.5 Heading hierarchy (rendered)

| Page | H1 | Notes |
|---|---|---|
| Home | "Transform Your Business With Smart Software Solutions" (1 × H1) | Many H5 card titles; section titles mix H2 and H3 |
| About | "About Proficient Software Solutions" | Good |
| Services | **none** | Page title is an H2; sections are H3/H4 |
| Contact | **none** | H2 + H3s |
| All Projects | "Our Project Portfolio" | Section H3s |
| Project details | project name | Appears **after** an H2 "Project: …" and an H3 "Gallery: Images" |
| Footer | — | "Proficient Software Solutions" is an H3 on every page |

## 11.6 Other SEO-relevant facts

- Project detail pages are linked only via JavaScript, their query string is removed by JavaScript, and invalid values return 200 → they are unlikely to be indexed reliably.
- Many `<img>` tags have empty or wrong `alt` (all 16 client logos `alt=""`; features icons `alt=""`; About banner alt "Catalyst Risk Tool Banner"; broken API logos).
- Duplicate URLs (`/`, `/Home`, `/Home/Index`) without canonical; routes are case-insensitive (any casing returns 200).
- Performance signals that hurt Core Web Vitals: ~29–39 CSS files and 26–39 scripts per page, render-blocking CSS, 1.47 MB Font Awesome JS, 2.3 MB animated preloader on every page, a forced 1 s preloader delay, 5–6 MB JPEG card images on All Projects, uncacheable `?v=<ticks>` stylesheet URLs.
- GA4 is present (useful for measuring migration impact).

## 11.7 URLs that should be preserved (or 301-redirected) in the migration

| Current URL | Status now |
|---|---|
| `/` | 200 |
| `/Home` , `/Home/Index` | 200 (duplicates of `/`) |
| `/Home/AboutUs` | 200 |
| `/Home/Services` | 200 |
| `/Home/Contact` | 200 (and POST handler) |
| `/Projects/AllProjects` (+ `#web`, `#mobile`, `#desktop`, `#api`, `#uxui`) | 200 |
| `/Projects/ProjectDetails?projectNameType={CatalystFXD, AFXTrust, CLA, IWT, HlumisiF, CPMA, MetaPOS, PNE, WCG, ABTech, CRT, LMS, OvulaePortal, OvulaeWebsite}&projectType=Web` | 200 (14) |
| `/Projects/ProjectDetails?projectNameType={AFXTrust, CRT, CPMA, Apex, FPSL, MetaPOS, OvulaeApp, OvulaePortal}&projectType=Mobile` | 200 (8) |
| `/Projects/ProjectDetails` (bare, after JS rewrite) | 200 (empty) |
| `/img/social.png`, `/images/mainLOGO2.webp`, `/favicon.ico` | 200 — may be referenced externally (OG caches, e-mail signatures) |
| `/ApexPredator/GetAllApexPredatorData`, `/ApexPredator/GetAllApexGoAccess`, `/ApexPredator/GetAllApexSymbolData` | 200 — **API contract for external products; must keep working** |

Also consider lower-case variants (`/home/aboutus` etc.), since the current server accepts any casing and inbound links may use them. Which URLs Google has actually indexed is **UNKNOWN** — check Search Console / GA4 landing-page reports before cut-over.

---

# 12. RESPONSIVE / MOBILE IMPLEMENTATION

## 12.1 Breakpoints in use

- **Bootstrap 5 grid:** 576 / 768 / 992 / 1200 / 1400 px (`col-md-*`, `col-lg-*`, `d-lg-none`, `mt-lg-0`, `order-lg-*`).
- **Bitrader template:** mobile menu at **≤ 991 px**; hundreds of `min-width` rules.
- **Custom `css/site.css`:** `max-width` 1160, 768, 600, 575, 500, 435, 400 px.
- **`css/sharedStyle.css`:** 415 px (shrinks all `fs-dynamic-*` sizes).
- **Gtco `css/style.css`:** 1400, 1299, 1199, 991, 767, 650, 600, 500, 385 px.
- **NewBiz:** 991, 768 px; **`assets/site.css`:** 1200, 991, 767, 575, 360 px.
- **`custom.js`:** submenu toggling below **1200 px** (JS threshold differs from the 992 px CSS threshold).

## 12.2 Behaviour by device class

**Desktop (≥ 1200 px)** — layouts as described in §2/§8: 2-column hero, 3–4-column card rows, 4-column client grid, horizontal nav with hover dropdown.

**Tablet (768–991 px)** — hamburger menu replaces the nav; hero and agency sections stack (they use `col-lg`); service cards 2×2; clients 3 per row; features 2 per row; project cards stay 2 per row (`col-md-6`); About and Services rows stack.

**Mobile (< 768 px)** — everything single-column; hero gets 40 px top margin, H1 2rem, smaller buttons; clients **one logo per row** (16 × 160 px = a very long scroll) because `col-xs-6` is a Bootstrap 3 class that does nothing in Bootstrap 5; project-detail phone screenshots forced to fixed heights (500/450/350 px); project titles shrink to 30/25/20/18 px.

## 12.3 Navigation behaviour on mobile

- Hamburger (`.header-bar`, `d-lg-none`) toggles `.menu.active`, which scales the menu panel open below the header (`transform: scaleY`), max-height 400 px, scrollable.
- The mobile panel's background is `rgba(var(--wh-color), 0.99)` where `--wh-color` is `#fff` — **invalid CSS**, so the panel is likely transparent over page content (not verified on a device).
- Tapping "Projects" below 1200 px toggles the submenu *and* still navigates to All Projects (no `preventDefault`). Tapping any top-level link without a submenu throws a JS `TypeError` (harmless to navigation).
- Layout's `ToggleMobileDropDown()` targets `#my-nav`, which doesn't exist (dead code).

## 12.4 Areas likely to break / weak on mobile (FACT unless marked)

- Stats band: SVG blob with `min-width:330px`; first label shrinks to 8 px.
- Client grid: one per row; logos with small native sizes (Gcwensa 82×100, CCR 347×44) look tiny or blurry.
- "Email Us" box: long address overflows its box at several widths (clipped at 1440 px already).
- Project-detail carousels rely on **hover** to reveal the preview button (touch users see no affordance).
- Product cards: whole-card images are 1920 px+ (5–6 MB for Ovulae) — slow on mobile data.
- Preloader adds ≥ 1 s delay on every navigation.
- Services/Contact load Bootstrap 4 CSS over Bootstrap 5 — spacing/grid inconsistencies between pages.
- Contact e-mail regex rejects some valid addresses; placeholders instead of labels.
- Google Map iframe fixed 412 px height.
- Headless 390 px render was inconclusive (Chrome window minimum); the 500 px render showed no horizontal overflow on Home.

## 12.5 Desktop-only assumptions

- Hover dropdown on desktop nav; hover-only portfolio overlays (HEAD Home) and carousel preview buttons; hover zoom on client logos; `scrollToTop` button permanently hidden; tooltips via `title` attributes.

---

# 13. TECHNICAL DEBT / OLD FRONTEND ISSUES

## 13.1 FACTS

**Security / operational**
1. Plaintext credentials in tracked source: SMTP password (`HomeController.cs:14`, `ProjectsController.cs:15`), two SQL Server logins (`Services/ApexPredatorData.cs:17-18`), a Gmail app password in a comment (`HomeController.cs:49`). They are in git history.
2. SMTP on port 8889 without TLS.
3. Unauthenticated `/ApexPredator/*` endpoints expose licence/usernames/device IDs.
4. Contact form: no anti-forgery token, no CAPTCHA/rate limit, unencoded user input in HTML e-mail, errors swallowed and reported as success.
5. Build depends on DLLs from a sibling folder's Debug output (not in repo).
6. No error page (`/Home/Error` missing) and no 404 page.
7. No CI/CD; manual Web Deploy/FTP publishing.

**Frontend stack**
8. Three templates mixed (Bitrader, Gtco, NewBiz) + Bootstrap-default sections.
9. Bootstrap **4.2.1, 5.3.0 and 5.3.2** CSS/JS loaded together (plus 5.0.2 and 5.1.0 on disk); Bootstrap 3 classes in markup.
10. jQuery 3.3.1 slim + 3.3.1 + 3.6.0 + Migrate on every page (plus again on Contact and project pages).
11. Five icon systems (FA 4.6.3, 4.7, 6.3 SVG-JS 1.47 MB, Ionicons 2, Bootstrap Icons).
12. Loaded but unused: Swiper, AOS, PureCounter, FsLightbox, Owl Carousel (×2), Isotope (×2 + CDN), Lightbox2, Counter-Up, Waypoints, Easing (most of them on every page).
13. 29–39 stylesheet tags per page with the same files linked 2–3 times; `?v=<ticks>` makes four of them uncacheable.
14. `main2.js` throws on every page except Contact (WOW missing); Isotope error on Home; `custom.js` TypeError on mobile nav.
15. Unreferenced files: `css/layout.css`, `css/importStyle.css`, `_Layout.cshtml.css`, `lib/bootstrap-icons/` (2,085 SVGs), `lib/bootstrap-5.0.2-dist`, `lib/bootstrap/dist`, `lib/jquery-validation*`, `_ValidationScriptsPartial`, `Error.cshtml`, ~60 unused images (§6), 67 MB `apps.zip`.
16. Template leftovers: hidden dark-mode switch, hidden scroll-to-top, hidden social links, `body.home-4`, gold/lime trading colours, Apex/CRT CSS copied from the Catalyst FX site, wrong alt text/IDs from that site.
17. Extensive inline styles and `!important`.
18. Scripts and stylesheets injected mid-body in views (no `@section`).

**Content / data**
19. All portfolio content hardcoded in a 788-line C# `switch` file (`ProjectsHelper.cs`) + duplicated summary copy in `AllProjects.cshtml` + a third version on the Home page; no CMS or data file.
20. Logic bugs: remarks never shown for Web projects; LMS empty slide; broken ApexGO URL; dev URL for CPMA; "?" icons; broken API logos; missing video; `Enquirey` subject typo; `Hlumis'imfudo` typo.
21. Project pages rely on `sessionStorage` + `history.replaceState` instead of real URLs.
22. Duplicate element IDs in the mobile project partial; `<a>` elements used as buttons without `href`; `<li><li>` nesting error in the nav (`_Layout.cshtml:121-122`).
23. Images: no responsive `srcset`, no lazy loading (except the map), no width/height attributes, multi-MB originals served directly, spaces in filenames.
24. Accessibility: empty alts, placeholder-only form fields, non-focusable click targets, hover-only affordances, low-contrast grey text on pale backgrounds in places.
25. No legal pages (privacy/POPIA, terms), no cookie consent despite GA4.
26. Uncommitted Home redesign in the working tree — production state vs repo state is unclear.

## 13.2 RECOMMENDATIONS (for the rebuild — not design decisions)

- **Rotate every credential listed in 13.1 #1 now**, independent of the rebuild (they are in git history); move secrets to environment variables/secret storage.
- Treat the rebuild as content-migration + frontend replacement; do not port any template CSS/JS.
- Move portfolio/service/client data into structured content (JSON/MDX/headless CMS) with one canonical copy per project, slugs, and per-project SEO fields.
- Replace the contact flow with a validated, spam-protected endpoint that reports real delivery status, sets Reply-To, optionally sends an auto-reply, and fires a GA4 conversion event.
- Establish real URLs for every project page and 301 all legacy URLs (§15).
- Produce proper brand assets (SVG logo, square favicon set, OG image) — only raster logos exist today.
- Optimise all images (AVIF/WebP at multiple widths); remove the 2.3 MB preloader.
- Add robots.txt, sitemap.xml, canonical tags, per-page titles/descriptions, Organization/LocalBusiness JSON-LD, and legal pages.

---

# 14. WHAT MUST BE PRESERVED IN THE NEW REACT WEBSITE

**Business details**
- Legal name *Proficient Software Solutions (Pty) Ltd*; short name *PSS*; tagline *"Solutions Engineered for Success"*; founded 2017; founder *Proficient Mkansi — Founder & Lead Developer*, Rhodes University BSc (Cum Laude) story; South African positioning ("proudly South African", local rates).
- Address 35 Lima St, Sharonlea, Randburg, 2158, South Africa; phone +27 73 794 2244; hours Mon–Fri 8AM–5PM; e-mails Proficient@ and sales@proficientsoftwaresolutions.co.za; founder LinkedIn URL.
- Claims/stats: 33+ clients, 37+ projects, 4 active projects (confirm they're current); free 30-minute consultation; response within 24 hours; free post-launch support.
- Vision, Mission, Future Outlook statements.

**Content**
- All service descriptions (§3.4) and the technology list (28 items).
- The full portfolio: 17 detail-page projects × web/mobile variants with all fields (§5.3), plus desktop, design, API and HEAD-only items (§5.2, §5.4), and the consent disclaimer.
- Client list (16 logos) and the three unused client logos (AB Tech, iWatchAll, Woplhost) for possible use.

**Assets**
- `images/mainLOGO2.webp`, `images/logo.webp`, `img/social.png`, `img/preloader.webp` (as brand reference), `images/director3.webp`, all client logos, `img/apps/**` screenshots (incl. unused Ovulae design files), `images/portfolio/data-*` and `desktop-chatApp.png`, About/category illustrations, service illustrations.

**Functionality**
- Contact enquiry delivery to **sales@** (and, if still wanted, the Gmail copy) — ideally with better reliability.
- Google Maps location (or equivalent).
- GA4 property **G-VLLB11SKWE** (keep the same ID to preserve analytics continuity).
- Project detail pages (gallery with enlarge/preview, metadata, external links).
- In-page portfolio category navigation (Web / Mobile / Desktop / APIs / Designs) — the nav dropdown links to these.

**URLs / SEO**
- Every URL in §11.7, via equivalent routes or 301 redirects.
- Current titles/descriptions as a baseline; the OG image (fixed); domain `proficientsoftwaresolutions.co.za` (decide www vs non-www and redirect the other).

**Integrations / backend**
- The three `/ApexPredator/*` endpoints and their exact response formats, if any external product still calls them.
- The mail server/MX records for `proficientsoftwaresolutions.co.za` (must survive DNS changes).

---

# 15. MIGRATION CONSIDERATIONS

Target: **ASP.NET Core 8 MVC + Bootstrap → React + Tailwind CSS on Vercel**.

## 15.1 Purely frontend (can move to static React)

- All five page types' content, layout and imagery: Home, About, Services, Contact page UI, All Projects, Project Details. None of them read from a database — their "data" is Razor markup and `ProjectsHelper.cs` constants, which can be converted to static JSON/TS/MDX.
- Portfolio galleries, carousels, modals, category filters, navigation, footer.
- GA4 snippet, Google Maps embed, LinkedIn link.
- Static assets (after optimisation).

## 15.2 Functionality that still needs a backend

| Function | Why | Options (RECOMMENDATION) |
|---|---|---|
| Contact form e-mail | Needs SMTP/API credentials that must stay server-side | A Vercel Serverless/Edge Function (e.g. `/api/contact`) using a transactional e-mail provider or the existing SMTP mailbox via env vars; add CAPTCHA/Turnstile + honeypot + rate limiting; return real success/failure |
| `/ApexPredator/*` data endpoints | Query a SQL Server on site4now; consumed by external trading apps/indicator | Keep them on a .NET backend (the existing app stripped down, or a small ASP.NET Core minimal API) on the current host or an `api.` subdomain. Vercel functions *could* query SQL Server, but the hosting provider may restrict remote SQL connections and it adds latency; not a static-site concern |
| Error/404 pages | — | Handled by the frontend framework |

## 15.3 Can forms/API stay separate?

Yes. The only coupling between pages and backend is `POST /Home/Contact` (form-urlencoded fields `FullName`, `Email`, `Subject`, `Message`, response = HTTP 200 with empty body). The Apex endpoints are entirely independent of the website UI. Both can live behind a separate API origin with CORS, or on Vercel functions for the contact form only.

## 15.4 What cannot simply be moved into a static React/Vercel frontend

- Anything holding secrets (SMTP, SQL credentials).
- SQL Server access for the Apex endpoints.
- Case-insensitive legacy routes and query-string-based project URLs — need explicit redirect rules (Vercel `redirects` with `has: [{type: "query", key: "projectNameType", value: "…"}]`, or middleware for case-insensitive matching).
- Server-side HTML for SEO: a client-only React SPA would render content via JS; **RECOMMENDATION:** use static generation/pre-rendering (e.g. Next.js SSG, or Vite + a pre-render step) so every page and project ships as HTML with its own title/meta.

## 15.5 APIs/endpoints to retain

- `POST /Home/Contact` — only if anything else posts to it (UNKNOWN; the site's own form is the only known caller). Otherwise replace with a new endpoint and redirect/deprecate.
- `GET /ApexPredator/GetAllApexPredatorData`, `/ApexPredator/GetAllApexGoAccess`, `/ApexPredator/GetAllApexSymbolData` — **retain at the same host and path** unless every consumer is updated. If the main domain's DNS moves to Vercel, these paths must be proxied (Vercel `rewrites` to the .NET host) or the consumers must be pointed to a new API hostname.

## 15.6 DNS / hosting / routing considerations

- Current web hosting: IIS on `win8238.site4now.net` (site `deprofcodes-002-site4`), inferred from publish profiles; actual DNS records are **UNKNOWN**.
- **E-mail risk:** `mail.proficientsoftwaresolutions.co.za` and the MX records must not change when the apex/`www` records are pointed at Vercel. If the domain's nameservers are moved to Vercel, all mail-related records (MX, SPF/TXT, DKIM, autodiscover, the `mail` host) must be recreated first.
- Choose a canonical host (`www` vs apex) and 301 the other; today code uses both.
- HTTPS/HSTS: Vercel provides certificates; the current app sends HSTS (30 days default) — keep HTTPS on both hosts during cut-over.
- `.co.za` domain registrar/DNS provider — UNKNOWN.

## 15.7 Suggested redirect map (RECOMMENDATION — target paths are placeholders, not a design decision)

| Legacy | New (example) |
|---|---|
| `/Home`, `/Home/Index` | `/` |
| `/Home/AboutUs` | `/about` |
| `/Home/Services` | `/services` |
| `/Home/Contact` (GET) | `/contact` |
| `/Projects/AllProjects` | `/projects` (keep `#web` etc. or map to category pages) |
| `/Projects/ProjectDetails?projectNameType=X&projectType=Web` | `/projects/{slug}` (22 combinations, §11.7) |
| `/Projects/ProjectDetails` (bare) | `/projects` |
| `/Projects`, `/Projects/CatalystFXDynamicsWeb`, `/Portfolio/*` | `/projects` |
| lower/upper-case variants | same targets (case-insensitive matching) |

## 15.8 Recommended separation (RECOMMENDATION)

```
proficientsoftwaresolutions.co.za  (Vercel)
  React + Tailwind, statically generated pages, content from JSON/MDX/CMS
  /api/contact  → serverless function (email provider / SMTP via env vars, CAPTCHA, rate limit)
  rewrites: /ApexPredator/* → legacy .NET API host (until consumers migrate)

api.proficientsoftwaresolutions.co.za  (existing .NET host or a small new service)
  /ApexPredator/*  (add auth / API key, rotated SQL credentials, config via environment)

mail.proficientsoftwaresolutions.co.za + MX  (unchanged)
```

## 15.9 Migration risks checklist

- Losing enquiries during/after cut-over (test the new contact path end-to-end, including spam folders).
- Breaking the Apex trading products by moving DNS without proxying `/ApexPredator/*`.
- Breaking e-mail by moving nameservers.
- SEO loss from unmapped URLs, missing HTML (CSR), or changed titles.
- Publishing the wrong Home copy (working tree vs HEAD).
- Credentials remain valid in git history unless rotated.
- Heavy images and third-party-copyright screenshots copied unreviewed.

---

# 16. FINAL EXECUTIVE SUMMARY

## CURRENT WEBSITE IN ONE PARAGRAPH

The Proficient Software Solutions site is a small (six page types) ASP.NET Core 8 MVC brochure-and-portfolio website for a Randburg, South Africa software company founded in 2017 by Proficient Mkansi. It presents four core services (design, custom development, data analytics/engineering, IT support), a large portfolio of ~25 web, mobile, desktop, design and API projects for clients such as Ovulae, AFX Trust, Catalyst FX Dynamics, Corporate Voice, CP Moloto Advisory and MetaPOS, a founder-led About page, and a single contact form that e-mails enquiries. All content is hardcoded (Razor views plus a 788-line C# helper for project details); there is no CMS or site database. Visually it is a blue/cyan, light, rounded corporate look assembled from three third-party HTML templates plus newer Bootstrap sections, loading three Bootstrap versions, three jQuery copies and five icon libraries on every page. The same app also hosts three unauthenticated data endpoints for the company's Apex trading products and contains hardcoded credentials.

## CURRENT STRENGTHS

- Substantial, specific portfolio content: 17 detailed case studies with categories, dates, tech stacks, features and 150+ real screenshots.
- A clear, credible founder story and Vision/Mission statements.
- Recognisable brand mark (gradient "PSS" + "Solutions Engineered for Success") and a consistent blue palette.
- A strong list of 16 client logos.
- Working contact form with branded internal e-mail, Google Map, GA4 in place.
- Straightforward IA (Home, About, Services, Projects, Contact) that users understand.

## CURRENT WEAKNESSES

- Mixed templates → inconsistent typography, buttons, spacing and icons between pages.
- Very heavy, error-prone frontend (dozens of duplicate CSS/JS files, conflicting library versions, JS errors on every page, multi-MB images, forced preloader).
- SEO gaps: no sitemap/robots/canonical/structured data, identical meta on every page, broken OG image, JS-only project URLs, missing H1s.
- Contact flow can silently lose enquiries; no spam protection; no confirmation to the visitor; phone/e-mail not clickable; "Book a Call" isn't a booking.
- Broken assets/links (API logos, "?" icons, ApexGO URL, hidden `/Portfolio/*` links, missing error/404 pages).
- No testimonials, no legal pages, no real social presence, only one team member shown.
- Security issues: credentials in source/git history, unauthenticated data endpoints, SMTP without TLS.

## CONTENT WORTH KEEPING

- Company facts, contact details, founder bio, Vision/Mission/Future Outlook (§3.3, §3.7).
- Service descriptions and technology list (§3.4).
- All portfolio entries and their detail copy (§5.2–5.4), including HEAD-only items (data-analytics dashboards, iChat, Task Planner, eStore).
- Client logos list (§6.6).
- Stats/claims (verify currency): 33+ clients, 37+ projects, 4 active, free consultation, 24-hour response.
- Home hero messaging and "Why South African Businesses Choose Us" points (working tree).

## FUNCTIONALITY WORTH KEEPING

- Contact enquiry → sales@ (+ copy) e-mail, rebuilt reliably.
- Location map.
- GA4 (`G-VLLB11SKWE`).
- Portfolio category navigation and project detail galleries with enlarge/preview.
- External links to live client products / Play Store.
- `/ApexPredator/*` endpoints (on a backend, not in the new frontend).

## TECHNOLOGY THAT CAN BE RETIRED

Razor views and layout; Bootstrap 3/4/5 (all copies); jQuery (3 copies) + Migrate; Popper 1; Owl Carousel; Isotope; Lightbox2; WOW.js; animate.css; Waypoints; Counter-Up; jQuery Easing; Swiper; AOS; FsLightbox; PureCounter; SweetAlert; Font Awesome 4.6/4.7/6; Ionicons; Bootstrap Icons (as a font); self-hosted Lato/Open Sans TTFs; the Bitrader/Gtco/NewBiz CSS and SCSS; `mobile-nav.js`; `custom.js`, `main.js`, `main2.js`; Razor runtime compilation; the `?v=<ticks>` cache-buster; `ProjectsHelper.cs` as a content store; unused `lib/` folders; `img/apps.zip`; `images/portfolio/*` template placeholders.

## IMPORTANT MIGRATION RISKS

1. Breaking the Apex trading products if `/ApexPredator/*` stops resolving at the same host/path.
2. Breaking company e-mail (MX / `mail.` host) during DNS changes.
3. Losing enquiries if the new contact endpoint isn't tested; secrets must move server-side.
4. SEO loss from unredirected legacy URLs (esp. 22 query-string project URLs) or a client-only SPA.
5. Uncertainty about which Home version is live (working tree vs HEAD).
6. Exposed credentials in git history must be rotated regardless.
7. Reusing screenshots with third-party copyrighted imagery or personal account data.
8. External build dependency on the `Shared` DLL folder if the .NET API is kept.

## COMPLETE LIST OF PUBLIC ROUTES

| Route | Method | Type | Local status |
|---|---|---|---|
| `/` | GET | Page — Home | 200 |
| `/Home`, `/Home/Index` | GET | Page — Home (duplicate) | 200 |
| `/Home/AboutUs` | GET | Page — About | 200 |
| `/Home/Services` | GET | Page — Services | 200 |
| `/Home/Contact` | GET | Page — Contact | 200 |
| `/Home/Contact` | POST | Contact form handler | (not called in audit) |
| `/Projects/AllProjects` | GET | Page — Portfolio | 200 |
| `/Projects/ProjectDetails?projectNameType={14 values}&projectType=Web` | GET | Page — Project (web) | 200 |
| `/Projects/ProjectDetails?projectNameType={8 values}&projectType=Mobile` | GET | Page — Project (mobile) | 200 |
| `/Projects/ProjectDetails` (no/invalid params) | GET | Empty page (soft 404) | 200 |
| `/Projects/CatalystFXDynamicsWeb` | GET | Broken action | **500** |
| `/Projects` | GET | — | 404 |
| `/Home/Error` | GET | — (configured as error handler, missing) | 404 |
| `/Portfolio/*` (13 hidden links) | GET | — | 404 |
| `/ApexPredator/GetAllApexPredatorData` | GET | Data API (trading) | not called in audit |
| `/ApexPredator/GetAllApexGoAccess` | any | Data API (trading) | not called in audit |
| `/ApexPredator/GetAllApexSymbolData` | any | Data API (trading) | not called in audit |
| `/robots.txt`, `/sitemap.xml` | GET | — | 404 |
| Static files under `/css`, `/js`, `/lib`, `/assets`, `/images`, `/img`, `/fonts`, `/owl-carousel`, `/favicon.ico` | GET | Static | 200 |

## COMPLETE LIST OF IMPORTANT ASSETS

**Brand:** `images/mainLOGO2.webp` · `images/logo.webp` · `img/social.png` · `img/preloader.webp` (reference) · `images/slog.webp` (tagline strip)
**People:** `images/director3.webp`
**Hero/illustration:** `images/banner-img.webp` · `images/learn-img.webp` · `images/word-map.png` · `img/about.webp` · `images/intro-bg.webp`
**Service & category illustrations:** `images/design.webp` · `images/backend.webp` · `images/analysis.webp` · `images/customer-service.webp` · `img/vision.png` · `img/mission.png` · `img/future.png` · `img/service-software.png` · `img/service-mobile.png` · `img/service-desktop.png` · `img/service-api.png` · `img/service-ux.png`
**Stock photos (licence unknown):** `images/design-img2.webp` · `images/developer.webp` · `images/data-engineering.webp` · `images/support.webp`
**Client logos:** `images/clients/ovulae.webp` · `afx-trust.png` · `catalyst-fx-dynamics.png` · `cla.webp` · `kwikem.png` · `taps-client2.jpeg` · `cpma-client.svg` · `MetaPOS-client.svg` · `Client-top1Percent.png` · `Gcwensa-Logo.png` · `WCG_Logo-full3.png` · `DeBetMasters-client.png` · `pnefinance-client.png` · `CCR-Client.png` · `ritshuriTech-client.png` · `client-namibia.png` (+ unused `Logo.jpg` AB Tech, `Logo Transparent.png` iWatchAll, `wopl-client.png` Woplhost)
**Tech/API logos:** `images/tech/*` (28 used) · `images/twilio.svg` · `images/monday-api.webp` · `images/api-football.webp` · `images/derivAPI.webp`
**Portfolio — current:** `img/apps/web/**` (covers + galleries for 14 web projects) · `img/apps/mobile/**` (covers + screens for 8 mobile projects) · `img/apps/desktop/*` (5) · `img/apps/design/*` (8 used + 5 unused Ovulae design files)
**Portfolio — older/HEAD-only:** `images/portfolio/data-powerBI.png` · `data-looker.png` · `data-1.png` · `data-2.avif` · `desktop-chatApp.png` · `desktop-folderLocker.png` · `desktop-gcwensa.png` · `app-smartCalendar.png` · `app-selfcheckout.png` · `app-metapos*.png` · `design-*.png` · `web-*.png`
**Backup:** `img/apps.zip` (untracked mirror of `img/apps/`)

---

*End of audit. No application code, configuration, or assets were modified in producing this report.*

