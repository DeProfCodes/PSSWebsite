import { image, legacyGallery, legacyImage, numberedFiles } from "@/lib/assets";
import type { ImageAsset, Project } from "@/types/content";

/**
 * Portfolio data.
 *
 * Launch rule (PSS, 2026-09-23): a project is public only when it has real
 * images in public/images/projects/ and real case-study content. Everything
 * else is `visibility: "hidden"`: kept in the data, never published (its legacy
 * URLs fall back to /projects). Public projects declare every image explicitly
 * with its real size; the build fails if a file is missing (src/lib/projects.ts).
 *
 * Legacy content: migrated from the legacy site.
 * Source: CURRENT_WEBSITE_AUDIT.md §5.1 (master list), §5.2 (card copy),
 * §5.3 (detail-page copy from Helpers/ProjectsHelper.cs), §5.4 and §6.8 (images).
 *
 * Conventions
 * - `shortDescription`: the legacy All Projects card copy (primary card).
 * - `description` / `features` / `technologies`: the legacy detail page. For
 *   projects that had both a Web and a Mobile page, the Web page is the project
 *   level and the Mobile page is a `deliverables` entry.
 * - Desktop and design cards that belonged to a project are `deliverables` with
 *   card copy only (they never had detail pages).
 * - Items with no detail-page copy keep `description: []` and get no page yet.
 * - Copy is verbatim; only unambiguous typos were corrected (listed in
 *   docs/CONTENT_MIGRATION.md). Technology labels are verbatim.
 * - Slugs are provisional until launch. After launch, never change a slug
 *   without adding a redirect.
 * - The legacy URL mapping (projectNameType → slug) is derived from `legacy`
 *   and documented in docs/LEGACY_REDIRECTS.md.
 */

type ProjectInput = Pick<Project, "id" | "slug" | "name" | "shortDescription" | "platforms"> &
  Partial<Omit<Project, "id" | "slug" | "name" | "shortDescription" | "platforms">>;

/**
 * Builds a Project with sensible empty defaults, so a new case study only needs
 * the fields that are actually known. Use it for all NEW projects (see
 * docs/CONTENT_MIGRATION.md → "Adding a project"). Never fill a field with
 * guessed content — leave it out instead.
 */
export function defineProject(input: ProjectInput): Project {
  return {
    description: [],
    features: [],
    technologies: [],
    deliverables: [],
    images: [],
    links: [],
    featured: false,
    reviewNotes: [],
    ...input,
  };
}

/** Consent disclaimer shown on the legacy portfolio page (verbatim, audit §3.6). */
export const portfolioDisclaimer =
  "Please note that all showcased projects are included with full consent from our clients for public demonstration. Several additional projects have been excluded from this portfolio in accordance with client confidentiality requests.";

const IMAGE_ROOT = "/images/projects";

function coverImage(slug: string, legacySource: string, alt: string, fileBase = "cover"): ImageAsset {
  const extension = legacySource.slice(legacySource.lastIndexOf(".") + 1).toLowerCase();
  return legacyImage(`${IMAGE_ROOT}/${slug}/${fileBase}.${extension}`, legacySource, alt);
}

function gallery(
  slug: string,
  prefix: string,
  legacyDir: string,
  files: string[],
  altPrefix: string,
): ImageAsset[] {
  const kind = prefix === "mobile" ? "mobile" : "desktop";
  return legacyGallery({ destinationDir: `${IMAGE_ROOT}/${slug}`, prefix, legacyDir, files, altPrefix, kind });
}

/**
 * Work-page order for public projects that are neither the flagship nor
 * featured (those come first, in `featuredOrder`). Unlisted projects follow in
 * array order.
 */
export const additionalWorkOrder: readonly string[] = ["cla-administration-tool", "catalyst-risk-tool", "metapos"];

const HIDDEN_NO_ASSETS = "Hidden for launch: no images in public/images/projects/ and no case-study facts yet.";
const zansi = (file: string) => `/images/projects/zansihustle/${file}`;
const sf = (file: string) => `/images/projects/smartfuture/${file}`;
const dr = (file: string) => `/images/projects/dailyrise/${file}`;

export const projects: Project[] = [
  // ===========================================================================
  // FLAGSHIP
  // ===========================================================================
  defineProject({
    id: "zansihustle",
    slug: "zansihustle",
    name: "ZansiHustle",
    clientId: "zansihustle",
    flagship: true,
    industry: "Marketplace",
    sectors: ["marketplace"],
    solutionTags: ["business-systems"],
    category: "Marketplace and services platform",
    // Supplied by PSS (2026-09-23): ecosystem structure, component roles and the summary below.
    tagline:
      "A marketplace and services platform connected to logistics, analytics, ecommerce and central operations.",
    shortDescription: "Marketplace and services platform",
    description: [
      "PSS helped build the technology behind ZansiHustle — connecting marketplace, operations, logistics, intelligence and ecommerce experiences into a growing digital ecosystem.",
    ],
    platforms: ["web", "mobile", "backend"],
    ecosystem: {
      hub: {
        id: "zansihustle",
        name: "ZansiHustle",
        role: "Marketplace and services platform",
        image: image(zansi("ecosystem.png"), 1586, 992, "The ZansiHustle marketplace with its mobile app and operations tools"),
      },
      groups: [
        {
          id: "marketplace",
          label: "Marketplace",
          nodes: [
            {
              id: "mobile-app",
              name: "ZansiHustle Mobile App",
              role: "Book services, find products and discover shops",
              image: image(zansi("mobile.png"), 941, 1672, "ZansiHustle mobile app home screen"),
            },
            {
              id: "zansitech",
              name: "ZansiTech",
              role: "Technology ecommerce experience",
              projectSlug: "zansitech",
              image: image(zansi("zansi-tech.png"), 1586, 992, "ZansiTech technology storefront"),
            },
          ],
        },
        {
          id: "operations",
          label: "Operations",
          nodes: [
            {
              id: "zansidispatch",
              name: "ZansiDispatch",
              role: "Logistics and operational control",
              image: image(zansi("dispatch.png"), 1586, 992, "ZansiDispatch logistics command centre"),
            },
          ],
        },
        {
          id: "intelligence",
          label: "Intelligence",
          nodes: [
            {
              id: "zansipulse",
              name: "ZansiPulse",
              role: "Marketplace intelligence and analytics",
              image: image(zansi("pulse.png"), 1584, 993, "ZansiPulse marketplace intelligence dashboard"),
            },
          ],
        },
      ],
      foundation: {
        id: "admin",
        name: "Admin & Backend",
        role: "Centralised operations and platform management",
        image: image(zansi("admin.png"), 1672, 941, "ZansiHustle admin portal, payments and finance"),
      },
    },
    // One section per product on the case study. Copy describes only what the product screens show.
    deliverables: [
      {
        platform: "mobile",
        anchor: "mobile-app",
        name: "ZansiHustle Mobile App",
        description: [
          "The customer app: book a service, plan an event, browse shops and buy products, with local providers and their prices listed by area.",
        ],
        features: [],
        technologies: [],
        images: [image(zansi("mobile.png"), 941, 1672, "ZansiHustle mobile app home screen with bookable services")],
      },
      {
        platform: "web",
        anchor: "zansitech",
        name: "ZansiTech",
        description: [
          "A technology storefront inside the ecosystem: phones, computers, TV, audio, wearables, gaming, networking and smart-home products, with flash sales, order tracking and repairs and services.",
        ],
        features: [],
        technologies: [],
        images: [image(zansi("zansi-tech.png"), 1586, 992, "ZansiTech storefront with product categories and a flash sale")],
      },
      {
        platform: "web",
        anchor: "zansidispatch",
        name: "ZansiDispatch",
        description: [
          "The logistics command centre for the marketplace: shipments from quote and booking through pickup, transit and delivery, dispatch exceptions that need attention, and quoted fees reconciled against actual courier costs.",
        ],
        features: [],
        technologies: [],
        images: [image(zansi("dispatch.png"), 1586, 992, "ZansiDispatch shipment pipeline and dispatch exceptions")],
      },
      {
        platform: "web",
        anchor: "zansipulse",
        name: "ZansiPulse",
        description: [
          "Live marketplace intelligence: views, searches and favourites, top regions, listings and sellers, and an AI-powered intelligence brief that surfaces trends and demand gaps.",
        ],
        features: [],
        technologies: [],
        images: [image(zansi("pulse.png"), 1584, 993, "ZansiPulse overview with marketplace metrics and the intelligence brief")],
      },
      {
        platform: "backend",
        anchor: "admin",
        name: "Admin & Backend",
        description: [
          "Central operations for the whole platform: orders, payments and finance (transaction ledger, payout queue and revenue reconciliation), products and services, sellers, shops and stores, affiliates, rewards and campaigns.",
        ],
        features: [],
        technologies: [],
        images: [image(zansi("admin.png"), 1672, 941, "ZansiHustle admin portal showing the payments and finance ledger")],
      },
    ],
    coverImage: image(zansi("cover.png"), 1672, 941, "ZansiHustle marketplace, mobile app, ZansiTech, ZansiDispatch, ZansiPulse and admin portal"),
    shareImage: image(zansi("share.jpg"), 1200, 675, "ZansiHustle marketplace and its connected products"),
    reviewNotes: [
      "public/images/projects/zansihustle/cover.jpg (an earlier cover) is not used.",
    ],
  }),

  // ===========================================================================
  // SELECTED WORK
  // Copy for SmartFuture and DailyRise describes only what the supplied product
  // screens show. Year, technologies and links were not supplied, so they are omitted.
  // ===========================================================================
  defineProject({
    id: "smartfuture",
    slug: "smartfuture",
    name: "SmartFuture",
    clientId: "smartfuture",
    industry: "Telecommunications",
    sectors: ["telecommunications"],
    solutionTags: ["business-systems"],
    tagline: "The website, customer app and operations dashboard behind a fibre internet provider.",
    shortDescription: "Website, customer app and operations dashboard for a fibre internet provider.",
    description: [
      "SmartFuture is a fibre internet provider. The platform covers the whole customer journey: a public website with an address-based coverage check and fibre packages, a mobile app for ordering and managing services, and an operations dashboard for the team.",
      "Orders placed in the app arrive in the dashboard, where staff follow installations, coverage requests, payments and support tickets, with an audit log of account activity.",
    ],
    features: [
      "Address-based coverage check",
      "Fibre package catalogue and ordering",
      "In-app payment with PayFast or Paystack",
      "Installation tracking",
      "Billing, invoices and preferred billing day",
      "Support and network status",
      "Operations dashboard with audit logs",
    ],
    platforms: ["web", "mobile"],
    coverImage: image(sf("cover.png"), 1586, 992, "SmartFuture website, customer app and operations dashboard"),
    shareImage: image(sf("share.jpg"), 1200, 751, "SmartFuture website, customer app and operations dashboard"),
    images: [
      image(sf("desktop-1.png"), 1672, 941, "SmartFuture website home page with the coverage check"),
      image(sf("desktop-2.png"), 1672, 941, "SmartFuture fibre packages and monthly prices"),
      image(sf("desktop-3.png"), 1672, 941, "SmartFuture operations dashboard with orders and audit activity"),
      image(sf("mobile-1.png"), 941, 1672, "SmartFuture app dashboard with active package, balance and quick actions"),
      image(sf("mobile-2.png"), 941, 1672, "SmartFuture app package list"),
      image(sf("mobile-3.png"), 941, 1672, "SmartFuture app checkout with PayFast and Paystack"),
    ],
    featured: true,
    featuredOrder: 1,
  }),
  defineProject({
    id: "dailyrise",
    slug: "dailyrise",
    name: "DailyRise",
    clientId: "dailyrise",
    industry: "FinTech",
    sectors: ["fintech"],
    solutionTags: ["business-systems"],
    tagline: "The administration and financial operations console behind the DailyRise platform.",
    shortDescription: "Administration and financial operations console for a plan-based platform.",
    description: [
      "DailyRise runs on a web platform with a full administration console behind it. Administrators manage users, admin accounts and role-based permissions, configure plans and referral settings, and follow daily claims, deposits and withdrawals.",
      "The financial operations centre brings deposits, active principal, growth allocated, referral earnings, withdrawals and treasury balance into one view, with liabilities kept in separate categories and trends over time.",
    ],
    features: [
      "Users, admin accounts and role-based permissions",
      "Plan and referral configuration",
      "Deposit and withdrawal management",
      "Daily claims tracking",
      "Liability breakdown by category",
      "Transaction history and reporting",
    ],
    platforms: ["web", "backend"],
    coverImage: image(dr("cover.png"), 1586, 992, "DailyRise financial operations console"),
    shareImage: image(dr("share.jpg"), 1200, 751, "DailyRise financial operations console"),
    images: [
      image(dr("desktop-1.png"), 1586, 992, "DailyRise financial operations overview"),
      image(dr("desktop-2.png"), 1586, 992, "DailyRise liability breakdown and treasury balance"),
      image(dr("desktop-3.png"), 1586, 992, "DailyRise finance trends over time"),
    ],
    featured: true,
    featuredOrder: 2,
  }),
  defineProject({
    id: "hypegrid",
    slug: "hypegrid",
    name: "HypeGrid",
    clientId: "hypegrid",
    shortDescription: "",
    visibility: "hidden",
    platforms: [],
    reviewNotes: [HIDDEN_NO_ASSETS],
  }),

  // ===========================================================================
  // HIDDEN — Ovulae (combined from the three legacy records; no images in public/images/projects/)
  // ===========================================================================
  defineProject({
    id: "ovulae",
    slug: "ovulae",
    name: "Ovulae",
    clientId: "ovulae",
    industry: "Health",
    sectors: ["health"],
    solutionTags: ["business-systems"],
    category: "Women's health platform",
    tagline:
      "A women's health platform spanning a mobile app for users, a portal for partners and clinicians, and the brand's public website.",
    // Legacy home page "Featured Projects" card (verbatim, audit §3.2).
    shortDescription: "Complete health tracking platform with mobile app, portal, and website",
    description: [
      "Ovulae is a women's health companion app covering Period tracking, Ovulation insights, Pregnancy guidance, and Menopause support. Built with .NET MAUI, it delivers a smooth native experience with privacy-first data handling and optional expert support.",
      "Alongside the app, the Ovulae Portal gives affiliates, doctors and admins a secure, role-based platform for referral management, clinical content workflows and operational oversight, while the Ovulae Website is the public-facing hub for the brand.",
    ],
    // Challenge / solution / outcome restate the legacy copy below; no new claims or figures.
    challenge:
      "Ovulae needed to support women through four very different life stages — period, ovulation, pregnancy and menopause — while giving affiliates, doctors and administrators their own tools for referrals, clinical content and payouts.",
    solution:
      "One connected platform: a native mobile app for users, a role-based portal for affiliates, doctors and admins, and a public website that explains the product and leads to the app stores.",
    outcome:
      "Users, partners and the Ovulae team work within one ecosystem — with subscriptions, referrals and clinical content managed in one place instead of separate tools.",
    features: [
      "Period, Ovulation, Pregnancy & Menopause tracking",
      "Clinically reviewed guidance & tips",
      "Role-based dashboards (Affiliate / Doctor / Admin)",
      "Real-time referral & commission tracking",
      "Secure subscription payments (Paystack)",
      "Deep links for referrals (Branch.io)",
    ],
    technologies: [
      ".NET MAUI (Android/iOS)",
      ".NET 9 Web API",
      "ASP.NET Core 9 (MVC)",
      "EF Core",
      "SQL Server",
      "SignalR",
      "PWA",
      "Paystack",
      "Branch.io",
    ],
    platforms: ["web", "mobile", "backend"],
    deliverables: [
      {
        platform: "mobile",
        anchor: "app",
        name: "Ovulae App",
        summary:
          "Ovulae is a women's health companion app covering Period tracking, Ovulation insights, Pregnancy guidance, and Menopause support.",
        description: [
          "Users configure goals and preferences, receive smart reminders, and access medically reviewed guidance. Deep linking supports referrals, while Paystack-powered flows handle subscriptions. Background jobs schedule helpful, non-spammy notifications.",
        ],
        features: [
          "Period, Ovulation, Pregnancy & Menopause tracking",
          "Smart notifications with daily caps",
          "Secure subscription payments (Paystack)",
          "Native .NET MAUI performance",
        ],
        technologies: [".NET MAUI (Android/iOS)", ".NET 9 Web API", "EF Core", "Background Jobs", "Branch.io (Deep Links)"],
        images: gallery("ovulae", "mobile", "img/apps/mobile/ovulae", numberedFiles(7), "Ovulae app"),
      },
      {
        platform: "web",
        anchor: "portal",
        name: "Ovulae Portal",
        summary:
          "The Ovulae Portal is a secure web platform for affiliates, doctors, and admins. It consolidates referral management, clinical content workflows, and operational oversight into one place.",
        description: [
          "Role-based access enables tailored dashboards: affiliates track clicks, signups, and commissions. Admins oversee user metrics, payouts, and compliance. SignalR keeps live stats in sync.",
          "The portal also works as a Progressive Web App, giving affiliates and medical professionals a mobile-optimised control centre with an offline-friendly shell.",
        ],
        features: [
          "Role-based dashboards (Affiliate / Doctor / Admin)",
          "Content management & doctor review workflows",
          "Analytics & payout management",
          "PWA: app-like performance on desktop/mobile",
        ],
        technologies: ["ASP.NET Core 9 (MVC)", "PWA (Service Worker, Web Manifest)", "REST APIs", "EF Core", "SQL Server", "SignalR"],
        images: gallery(
          "ovulae",
          "portal",
          "img/apps/web/ovulae",
          ["ovulae-portal-1.png", "ovulae-portal-2.png"],
          "Ovulae Portal",
        ),
        websiteUrl: "https://portal.ovulae.com",
      },
      {
        platform: "web",
        anchor: "website",
        name: "Ovulae Website",
        summary:
          "The Ovulae Website is the public-facing hub for the brand—showcasing features, pricing, and educational value across Period, Ovulation, Pregnancy, and Menopause modules.",
        description: [
          "It's designed for clarity, trust, and conversions, with clean messaging and clear call-to-actions, and links directly to the app stores.",
        ],
        features: ["Clear product storytelling for all four modules", "Fast, SEO-friendly pages with analytics", "Lead capture & contact flows"],
        technologies: ["ASP.NET Core 9 MVC", "Razor Views", "SEO", "Analytics"],
        images: gallery("ovulae", "website", "img/apps/web/ovulae", ["ovulae-web-1.png", "ovulae-web-2.png"], "Ovulae website"),
        websiteUrl: "https://www.ovulae.com",
      },
    ],
    coverImage: legacyImage(
      "/images/projects/ovulae/cover.jpg",
      "img/apps/mobile/ovulae/ovulae-app.jpg",
      "The Ovulae women's health app",
    ),
    images: [],
    websiteUrl: "https://www.ovulae.com",
    links: [
      {
        kind: "play-store",
        label: "Google Play",
        url: "https://play.google.com/store/apps/details?id=com.ovulae.org.ovulaeapp&hl=en",
      },
    ],
    date: "2025",
    visibility: "hidden",
    reviewNotes: [
      "Combined from the legacy Ovulae Portal, Ovulae Website and Ovulae App records (now hidden; their legacy URLs redirect here).",
      "The overview's second paragraph and the portal PWA paragraph were condensed from the legacy copy — confirm.",
      "Legacy cover is 6000×3375 / 5.9 MB — resize before use.",
    ],
  }),

  // ===========================================================================
  // HIDDEN — new project without images or facts yet
  // ===========================================================================
  defineProject({
    id: "altocoins",
    slug: "altocoins",
    name: "AltoCoins",
    clientId: "altocoins",
    shortDescription: "",
    visibility: "hidden",
    platforms: [],
    reviewNotes: [HIDDEN_NO_ASSETS],
  }),

  // ===========================================================================
  // HIDDEN — new projects without images or facts yet
  // ===========================================================================
  defineProject({
    id: "zansitech",
    slug: "zansitech",
    name: "ZansiTech",
    clientId: "zansihustle",
    industry: "Ecommerce",
    sectors: ["ecommerce"],
    // Role supplied by PSS as part of the ZansiHustle ecosystem (shown inside the ZansiHustle case study).
    shortDescription: "Technology ecommerce experience",
    visibility: "hidden",
    platforms: [],
    reviewNotes: [HIDDEN_NO_ASSETS],
  }),
  defineProject({
    id: "tnxone",
    slug: "tnxone",
    name: "TNXOne",
    shortDescription: "",
    visibility: "hidden",
    platforms: [],
    reviewNotes: [HIDDEN_NO_ASSETS],
  }),

  // ===========================================================================
  // EXISTING WORK (migrated from the legacy site)
  // ===========================================================================
  {
    id: "ovulae-portal",
    slug: "ovulae-portal",
    visibility: "hidden",
    supersededBy: { slug: "ovulae", anchor: "portal" },
    name: "Ovulae Portal",
    clientId: "ovulae",
    category: "Affiliate, Medical & Admin Portal (PWA + Web)",
    industry: "Healthcare",
    shortDescription:
      "The Ovulae Portal is a secure web platform for affiliates, doctors, and admins. It consolidates referral management, clinical content workflows, and operational oversight into one place.",
    description: [
      "The Ovulae Portal is a secure web platform for affiliates, doctors, and admins. It consolidates referral management, clinical content workflows, and operational oversight into one place. The PWA experience ensures fast, app-like performance across desktop and mobile.",
      "Role-based access enables tailored dashboards: affiliates track clicks, signups, and commissions. Admins oversee user metrics, payouts, and compliance. SignalR keeps live stats in sync.",
    ],
    features: [
      "Role-based dashboards (Affiliate / Doctor / Admin)",
      "Real-time referral & commission tracking (SignalR)",
      "Content management & doctor review workflows",
      "PWA: app-like performance on desktop/mobile",
      "Secure auth with granular permissions",
      "Analytics & payout management",
    ],
    technologies: [
      "ASP.NET Core 9 (MVC)",
      "PWA (Service Worker, Web Manifest)",
      "REST APIs",
      "EF Core",
      "SQL Server",
      "Role-based Auth",
      "SignalR (live updates)",
    ],
    platforms: ["web", "mobile"],
    deliverables: [
      {
        platform: "mobile",
        name: "Ovulae Portal",
        summary:
          "The Ovulae Portal (PWA) provides a mobile-optimized control center for affiliates and medical professionals to manage referrals, content, and user support on the go—mirroring web features with an app-like feel.",
        description: [
          "The Ovulae Portal (PWA) provides a mobile-optimized control center for affiliates and medical professionals to manage referrals, content, and user support on the go—mirroring web features with an app-like feel.",
          "Affiliates monitor performance and payouts; doctors manage content and feedback. The PWA works offline for basic screens and reconnects gracefully, ensuring continuity during spotty connectivity.",
        ],
        features: [
          "Affiliate performance on the go",
          "Mobile-first dashboards (PWA)",
          "Doctor content review & approvals",
          "Offline-friendly shell for basic screens",
          "Secure login & role-scoped actions",
          "Live stats & payout previews",
        ],
        technologies: [
          "ASP.NET Core 9 (PWA)",
          "Service Worker",
          "Web Manifest",
          "REST APIs",
          "EF Core",
          "SQL Server",
        ],
        coverImage: coverImage(
          "ovulae-portal",
          "img/apps/mobile/ovulae/portal-app.jpg",
          "Ovulae Portal PWA on mobile devices",
          "mobile-cover",
        ),
        images: gallery(
          "ovulae-portal",
          "mobile",
          "img/apps/mobile/ovulae",
          ["1p.png", "2p.png", "3p.png", "4p.png"],
          "Ovulae Portal PWA",
        ),
      },
    ],
    coverImage: coverImage(
      "ovulae-portal",
      "img/apps/web/ovulae/ovulae-portal-1.png",
      "Ovulae Portal web application",
    ),
    images: gallery(
      "ovulae-portal",
      "web",
      "img/apps/web/ovulae",
      ["ovulae-portal-1.png", "ovulae-portal-2.png"],
      "Ovulae Portal web application",
    ),
    websiteUrl: "https://portal.ovulae.com",
    links: [],
    date: "2025",
    featured: false,
    legacy: {
      projectNameType: "OvulaePortal",
      projectTypes: ["Web", "Mobile"],
      remarks: {
        webList: "A lightweight, mobile-first control center that keeps partners productive anywhere.",
        mobileList: "Unified operations for affiliates, doctors, and admins—with PWA speed and reliability.",
      },
    },
    reviewNotes: [
      "Legacy Home featured this as \"Ovulae Women's Health Platform — Complete health tracking platform with mobile app, portal, and website\" (badge: Healthcare). Decide whether Ovulae Portal, Website and App become one combined case study.",
      "Mobile cover image is 6000×3375 / 5.3 MB — resize before use.",
    ],
  },
  {
    id: "ovulae-website",
    slug: "ovulae-website",
    visibility: "hidden",
    supersededBy: { slug: "ovulae", anchor: "website" },
    name: "Ovulae Website",
    clientId: "ovulae",
    category: "Marketing Website & Brand Hub",
    shortDescription:
      "The Ovulae Website is the public-facing hub for the brand—showcasing features, pricing, and educational value across Period, Ovulation, Pregnancy, and Menopause modules.",
    description: [
      "The Ovulae Website is the public-facing hub for the brand—showcasing features, pricing, and educational value across Period, Ovulation, Pregnancy, and Menopause modules. It's designed for clarity, trust, and conversions, with clean messaging and clear call-to-actions.",
    ],
    features: [
      "Clear product storytelling for all four modules",
      "Fast, SEO-friendly pages with analytics",
      "Direct links to App Store / Play / AppGallery",
      "Lead capture & contact flows",
      "Brand-consistent UI and trust signals",
      "Scalable hosting with CDN-ready assets",
    ],
    technologies: [
      "ASP.NET Core 9 MVC",
      "BootstrapCSS",
      "Razor Views",
      "SEO",
      "CDN assets",
      "Contact/Lead capture",
      "Analytics",
    ],
    platforms: ["web"],
    deliverables: [],
    coverImage: coverImage("ovulae-website", "img/apps/web/ovulae/ovulae-web-1.png", "Ovulae website"),
    images: gallery(
      "ovulae-website",
      "web",
      "img/apps/web/ovulae",
      ["ovulae-web-1.png", "ovulae-web-2.png"],
      "Ovulae website",
    ),
    websiteUrl: "https://www.ovulae.com",
    links: [],
    date: "2025",
    featured: false,
    legacy: {
      projectNameType: "OvulaeWebsite",
      projectTypes: ["Web"],
      remarks: {
        mobileList: "The brand's front door—optimized for clarity, credibility, and conversions.",
      },
    },
    reviewNotes: ["The legacy detail page had only one description paragraph."],
  },
  {
    id: "ovulae-app",
    slug: "ovulae-app",
    visibility: "hidden",
    supersededBy: { slug: "ovulae", anchor: "app" },
    name: "Ovulae App",
    clientId: "ovulae",
    category: "Women's Health: Period, Ovulation, Pregnancy & Menopause",
    shortDescription:
      "Ovulae is a women's health companion app covering Period tracking, Ovulation insights, Pregnancy guidance, and Menopause support.",
    description: [
      "Ovulae is a women's health companion app covering Period tracking, Ovulation insights, Pregnancy guidance, and Menopause support. Built with .NET MAUI, it delivers a smooth native experience with privacy-first data handling and optional expert support.",
      "Users configure goals and preferences, receive smart reminders, and access medically reviewed guidance. Deep linking supports referrals, while Paystack-powered flows handle subscriptions. Background jobs schedule helpful, non-spammy notifications.",
    ],
    features: [
      "Period, Ovulation, Pregnancy & Menopause tracking",
      "Clinically reviewed guidance & tips",
      "Deep links for referrals (Branch.io)",
      "Smart notifications with daily caps",
      "Secure subscription payments (Paystack)",
      "Native .NET MAUI performance",
    ],
    technologies: [
      ".NET MAUI (Android/iOS)",
      ".NET 9 Web API",
      "EF Core",
      "Local Notifications",
      "Background Jobs",
      "Branch.io (Deep Links)",
      "Paystack integration",
    ],
    platforms: ["mobile"],
    deliverables: [],
    coverImage: coverImage(
      "ovulae-app",
      "img/apps/mobile/ovulae/ovulae-app.jpg",
      "Ovulae app on mobile devices",
    ),
    images: gallery(
      "ovulae-app",
      "mobile",
      "img/apps/mobile/ovulae",
      numberedFiles(7),
      "Ovulae app",
    ),
    links: [
      {
        kind: "play-store",
        label: "Google Play",
        url: "https://play.google.com/store/apps/details?id=com.ovulae.org.ovulaeapp&hl=en",
      },
    ],
    date: "2025",
    featured: false,
    legacy: {
      projectNameType: "OvulaeApp",
      projectTypes: ["Mobile"],
      remarks: {
        webList: "A privacy-first women's health companion available across major app stores.",
      },
    },
    reviewNotes: [
      'The legacy remark says "available across major app stores" but only a Google Play link is recorded — confirm App Store / AppGallery listings.',
      "Cover image is 6000×3375 / 5.9 MB and phone screens are ~1260×2510 (0.75–1.4 MB each) — resize before use.",
      "Unused Ovulae design files exist (img/apps/design/ovulae*.png, ovulae-figma.*) — candidate design deliverable.",
    ],
  },

  // ---------------------------------------------------------------------------
  // AFX Trust
  // ---------------------------------------------------------------------------
  {
    id: "afx-trust",
    slug: "afx-trust",
    visibility: "hidden",
    name: "AFX Trust",
    clientId: "afx-trust",
    category: "Investment Platform Design & Integration",
    industry: "Finance",
    shortDescription:
      "A corporate investment website built for AFX Trust to showcase their 2% weekly return model, trust elements, investor testimonials, and investment calculator. The site is fast, professional, and conversion-driven.",
    description: [
      "AFX Trust's website was built to serve as a secure, investor-friendly portal for clients engaging in structured financial investment plans. The platform guides users through personalized investment plan selection, account creation, funding via integrated payment gateways, and provides real-time ROI breakdowns. The admin side includes powerful tools to monitor users, manage investments, and approve transactions.",
      "The site includes investment calculators, admin dashboards, and fully automated Paystack payment processing for seamless investor onboarding. Additional features include bonus logic, payout scheduling, and reinvestment automation, all accessible via mobile or desktop.",
    ],
    features: [
      "Secure investment onboarding",
      "Admin dashboard for investor management",
      "Paystack payment integration",
      "Realtime return calculation",
      "Support for reinvestment plans",
      "Fully mobile-compatible",
    ],
    technologies: [
      "HTML5",
      "Bootstrap 5",
      "CSS",
      "TailwindCSS",
      "ASP.NET 8 MVC",
      "JavaScript",
      "SQL Server",
      "RestAPIs",
      "PWA Integration",
    ],
    platforms: ["web", "mobile", "desktop"],
    deliverables: [
      {
        platform: "mobile",
        name: "AFX Trust Mobile App",
        summary:
          "A secure and user-friendly mobile investment platform developed for AFX Trust, available on both Android and iOS. The app allows users to manage investments, track performance, and access personalized financial insights—all in one place.",
        description: [
          "The AFX Trust mobile app, designed as a Progressive Web App (PWA), empowers users to manage their investments, view earnings, and reinvest—all from their mobile device. Built with ASP.NET MVC and enhanced with service workers and web manifests, it offers offline access, push notifications, and full responsiveness. The mobile experience mirrors the web with secure plan creation, payment integration, and real-time investment performance tracking.",
          "The app includes mobile-optimized investment plan setup, automated bonus calculations, and reinvestment logic. With offline capabilities and push notifications, users are kept informed of updates and earnings without needing constant access.",
        ],
        features: [
          "Offline-first Progressive Web App",
          "Secure investment plan creation",
          "Push notifications with payout updates",
          "Bonus & reinvestment automation",
          "Responsive UI on all device sizes",
          "Built using ASP.NET MVC and REST APIs",
        ],
        technologies: [
          "ASP.NET MVC",
          "PWA (Service Worker, Manifest)",
          "REST APIs",
          "Mobile-Responsive UI",
        ],
        coverImage: coverImage(
          "afx-trust",
          "img/apps/mobile/afx.png",
          "AFX Trust mobile app",
          "mobile-cover",
        ),
        images: gallery("afx-trust", "mobile", "img/apps/mobile/afx", numberedFiles(3), "AFX Trust mobile app"),
      },
      {
        platform: "desktop",
        name: "AFX Trust Desktop App",
        summary:
          "A professional-grade desktop platform developed for AFX Trust, designed to manage user portfolios, track investment performance, and generate detailed financial reports. Built for speed, security, and scalability, this tool complements the mobile experience with advanced features tailored for back-office operations. Fully compatible with Windows, macOS, and Linux.",
        description: [],
        features: [],
        technologies: [],
        coverImage: coverImage(
          "afx-trust",
          "img/apps/desktop/afx.png",
          "AFX Trust desktop application",
          "desktop-cover",
        ),
        images: [],
      },
    ],
    coverImage: coverImage("afx-trust", "img/apps/web/afx.png", "AFX Trust website"),
    images: gallery("afx-trust", "web", "img/apps/web/afx", numberedFiles(6), "AFX Trust website"),
    websiteUrl: "https://www.afxtrust.com",
    links: [],
    date: "2025",
    // Removed from featured/priority presentation (PSS decision, 2026-09-23). May be
    // withdrawn from the public portfolio later: set `visibility: "hidden"`.
    featured: false,
    legacy: {
      projectNameType: "AFXTrust",
      projectTypes: ["Web", "Mobile"],
      remarks: {
        webList:
          "Successfully modernized investor access with automated plans, secure finance tools, and user-first engagement.",
        mobileList:
          "The PWA model enabled fast deployment across devices, delivering a seamless and secure investment experience.",
      },
    },
    reviewNotes: [
      "PSS decision (2026-09-23): not featured / not a priority project; may be removed from the public portfolio later.",
      "Legacy Home featured this as \"AFX Trust Investment Platform — Full-stack investment platform with web, mobile, and desktop applications\" (badge: Finance).",
      "Card copy promotes the client's \"2% weekly return model\" — an investment-return claim; review before republishing.",
      "Dashboard screenshots show a logged-in account name and balances (audit §6.8) — review/redact before reuse.",
    ],
  },

  // ---------------------------------------------------------------------------
  // Corporate Voice
  // ---------------------------------------------------------------------------
  {
    id: "cla-administration-tool",
    slug: "cla-administration-tool",
    industry: "Enterprise",
    sectors: ["enterprise"],
    solutionTags: ["business-systems"],
    tagline:
      "A central admin platform for managing and deploying modular desktop software across client organisations.",
    name: "CLA Administration Tool",
    clientId: "corporate-voice",
    category: "Enterprise Administration Tool",
    shortDescription:
      "A centralized web platform built for CLA to manage and deploy their suite of modular software solutions to clients. Supports client onboarding, license tracking, and control of leased modules.",
    description: [
      "CLA Administration Tool was developed for Corporate Voice to centralize the management of modular desktop software components. The web app acts as a command center for scheduling popups, surveys, and real-time messages pushed to remote client desktops running Windows. It offers deep integration with backend logs and uses SignalR for live activity syncing.",
      "The admin tool enables scheduling of events, syncing of data, and secure communication with deployed desktop modules. Through a dynamic interface, users can manage clients, broadcast software updates, and oversee usage statistics of individual modules like popups and surveys.",
    ],
    features: [
      "Control modular apps remotely",
      "Schedule content and popups",
      "Use SignalR for live updates",
      "Integrated desktop sync APIs",
      "Detailed admin audit logs",
      "Multi-role user control",
    ],
    technologies: [
      "ASP.NET MVC",
      "JavaScript",
      "jQuery",
      "SQL Server",
      "SignalR",
      "Desktop integration endpoints",
    ],
    platforms: ["web", "design"],
    deliverables: [
      {
        platform: "design",
        name: "CLA Admin Tool",
        summary:
          "Administrative dashboard concept designed in Canva for CLA operations. The design showcases clear navigation, data visualization, and task management features tailored for internal business use.",
        description: [],
        features: [],
        technologies: ["Canva"],
        images: [],
      },
    ],
    coverStage: {
      background: "var(--ink-900)",
      screens: [image("/images/projects/cla/web-1.png", 1919, 991, "CLA Administration Tool ticker module")],
    },
    images: [
      image("/images/projects/cla/web-1.png", 1919, 991, "Ticker module: filter and manage tickers sent to client desktops"),
      image("/images/projects/cla/web-2.png", 1916, 987, "Adding a new ticker with a live preview"),
      image("/images/projects/cla/web-3.png", 1918, 944, "Popup report with a response summary"),
      image("/images/projects/cla/web-4.png", 1914, 989, "Screensaver module with a scheduling timeline"),
      image("/images/projects/cla/web-5.png", 1918, 942, "Adding a new popup with title and body text"),
      image("/images/projects/cla/web-6.png", 1918, 943, "Active users report"),
    ],
    links: [],
    date: "2024",
    featured: false,
    legacy: {
      projectNameType: "CLA",
      projectTypes: ["Web"],
      remarks: {
        webList: "The admin portal unified all modular software management with zero-deployment control.",
      },
    },
    reviewNotes: [],
  },

  // ---------------------------------------------------------------------------
  // Streama Solutions
  // ---------------------------------------------------------------------------
  {
    id: "iwatchalltv",
    slug: "iwatchalltv",
    // Hidden for launch although screenshots exist (public/images/projects/iwt/): they are dominated by
    // third-party film artwork and broadcaster logos.
    visibility: "hidden",
    industry: "Media & Streaming",
    sectors: ["media"],
    tagline:
      "A subscription management platform for a streaming service — plans, payments, viewing credentials and linked devices in one place.",
    name: "iWatchAllTV",
    clientId: "streama-solutions",
    category: "Streaming Subscription & Account Management",
    shortDescription:
      "A subscription management web app for a streaming service offering access to a variety of online channels. Designed for user control, payment integration, and smart content discovery.",
    description: [
      "The iWatchAllTV platform was designed to educate users about available content subscriptions, manage user authentication, and facilitate access to streaming services across TV, desktop, and mobile apps. The system offers login details provisioning, self-service subscription management, and device-agnostic compatibility.",
      "It supports subscription plans, streaming credentials, and mobile-friendly UI with payment confirmations and account provisioning. Users can view active packages, manage linked devices, and receive renewal reminders through the dashboard.",
    ],
    features: [
      "React single-page application",
      "User subscription and payment system",
      "Stream credential generation",
      "Streaming guide with instructions",
      "Customer self-management interface",
      "Mobile-optimized user experience",
    ],
    technologies: [
      "React.js",
      "TailwindCSS",
      ".NET Web API",
      "Entity Framework",
      "MSSQL",
      "Payment Gateway Integration",
    ],
    platforms: ["web"],
    deliverables: [],
    coverImage: coverImage("iwatchalltv", "img/apps/web/iwt.png", "iWatchAllTV web application"),
    images: gallery("iwatchalltv", "web", "img/apps/web/iwt", numberedFiles(5), "iWatchAllTV web application"),
    links: [],
    date: "2024",
    featured: false,
    legacy: {
      projectNameType: "IWT",
      projectTypes: ["Web"],
      remarks: {
        webList: "Streamlined cross-platform subscription management from mobile to TV apps.",
      },
    },
    reviewNotes: [
      "Screenshots show film promotional imagery (third-party copyright) — replace or crop before reuse (audit §6.8).",
      "Several images are 2.4–3.0 MB — optimise before use.",
      "No public URL recorded.",
    ],
  },

  // ---------------------------------------------------------------------------
  // Hlumis'imfundo Foundation
  // ---------------------------------------------------------------------------
  {
    id: "hlumisimfundo-website",
    slug: "hlumisimfundo-website",
    visibility: "hidden",
    industry: "Education",
    sectors: ["education"],
    name: "Hlumis'imfundo Website",
    clientId: "hlumisimfundo-foundation",
    category: "Education & Mentorship Showcase Website",
    shortDescription:
      "Official platform for Hlumi's Imfundo NPC, a mentorship, leadership, and tutoring initiative serving Grades 8–12. The site supports volunteer management, program visibility, and communication for learners and educators.",
    description: [
      "Hlumis'imfundo is a tutoring and mentorship programme website designed to communicate the initiative's mission to empower learners. It introduces the founding team, outlines their mentorship methods, features upcoming events, and provides a streamlined contact form for parent inquiries and sponsorship partnerships.",
      "The system helps communicate value to parents while offering structured information about mentors, events, and registration. Event listings are linked with calendar reminders, while the contact section promotes trust through testimonials and clean UI.",
    ],
    features: [],
    technologies: ["HTML", "PHP", "CSS", "JavaScript", "PHPMyAdmin"],
    platforms: ["web"],
    deliverables: [],
    coverImage: coverImage("hlumisimfundo-website", "img/apps/web/hff.png", "Hlumis'imfundo website"),
    images: gallery(
      "hlumisimfundo-website",
      "web",
      "img/apps/web/hlumisiF",
      numberedFiles(5),
      "Hlumis'imfundo website",
    ),
    websiteUrl: "https://www.hlumisimfundo.co.za",
    links: [],
    date: "2024",
    featured: false,
    legacy: {
      projectNameType: "HlumisiF",
      projectTypes: ["Web"],
      remarks: {
        webList: "Empowered local tutoring brand to present itself professionally to parents and funders.",
      },
    },
    reviewNotes: [
      "Official spelling of the organisation's name to be confirmed (see the client record).",
      "The legacy page recorded no key features.",
      "Some screenshots are 1.3–1.7 MB — optimise before use.",
    ],
  },

  // ---------------------------------------------------------------------------
  // Catalyst FX Dynamics
  // ---------------------------------------------------------------------------
  {
    id: "catalyst-fx-dynamics-website",
    slug: "catalyst-fx-dynamics-website",
    visibility: "hidden",
    industry: "FinTech",
    sectors: ["fintech"],
    tagline:
      "The corporate website for a trading-technology company, with product pages, tutorials and software downloads.",
    name: "Catalyst FX Dynamics Website",
    clientId: "catalyst-fx-dynamics",
    category: "Web Design & Deployment",
    shortDescription:
      "A professional fintech website built for Catalyst FX Dynamics, designed to showcase trading tools, company mission, and enable software access with sleek user experience and responsive layout.",
    description: [
      "I designed and developed a modern, responsive corporate website for Catalyst FX Dynamics—an innovative fintech company specializing in algorithmic trading solutions and risk analysis tools. The platform features custom sections for showcasing products like Apex Predator AI and CRT, each with technical documentation, embedded tutorial videos, and clear call-to-actions to increase client engagement and drive downloads.",
      "The website provides in-depth overviews of trading software, download portals, and educational walkthroughs via embedded videos. Each product page includes screenshots, technical specs, and real-world applications to assist both novice and experienced traders.",
    ],
    features: [
      "Clean, responsive design with intuitive navigation",
      "Dedicated product pages for each trading software",
      "Embedded YouTube tutorials",
      "Downloadable Android trading assistant",
      "Optimized SEO structure",
      "Fast-loading and accessible across devices",
    ],
    technologies: [
      "HTML5",
      "Bootstrap 5",
      "CSS",
      "ASP.NET (back-end)",
      "Static hosting with form handler integration",
    ],
    platforms: ["web", "design"],
    deliverables: [
      {
        platform: "design",
        name: "Catalyst FX Dynamics Website Design (Figma)",
        summary:
          "Figma design for the Catalyst FX Dynamics website, featuring a modern and professional layout optimized for showcasing financial services, client testimonials, and educational resources about trading and investments.",
        description: [],
        features: [],
        technologies: ["Figma"],
        coverImage: coverImage(
          "catalyst-fx-dynamics-website",
          "img/apps/design/cfd.png",
          "Catalyst FX Dynamics website design in Figma",
          "design-cover",
        ),
        images: [],
      },
    ],
    coverImage: coverImage(
      "catalyst-fx-dynamics-website",
      "img/apps/web/cfd.png",
      "Catalyst FX Dynamics website",
    ),
    images: gallery(
      "catalyst-fx-dynamics-website",
      "web",
      "img/apps/web/catalyst",
      numberedFiles(6),
      "Catalyst FX Dynamics website",
    ),
    websiteUrl: "https://www.catalystfxdynamics.com",
    links: [],
    date: "2019",
    featured: false,
    legacy: {
      projectNameType: "CatalystFXD",
      projectTypes: ["Web"],
      remarks: {
        webList: "A clean corporate site to amplify trust and deliver digital-first trading insight.",
      },
    },
    reviewNotes: [
      'The first paragraph is written in the first person ("I designed and developed") — rewrite in the company voice.',
      "Dated 2019, but the copy references CRT (dated 2025) — confirm the date or present it as ongoing work.",
      "Gallery image 1 is 2.3 MB — optimise before use.",
    ],
  },
  {
    id: "catalyst-risk-tool",
    slug: "catalyst-risk-tool",
    industry: "FinTech",
    sectors: ["fintech"],
    tagline: "A risk management tool that helps traders size positions and plan trades — on web, mobile and desktop.",
    name: "Catalyst Risk Tool (CRT)",
    aliases: ["CRT"],
    clientId: "catalyst-fx-dynamics",
    category: "Risk Management Web App for Traders",
    shortDescription:
      "A comprehensive risk management web app designed for traders and investors. CRT helps users calculate trade risk, optimize position sizing, and manage capital efficiently. It offers customizable parameters, real-time projections, and is built for both beginner and experienced traders.",
    description: [
      "CRT—Catalyst Risk Tool—is a specialized trading utility built to help investors calculate trade size, understand potential losses, and apply smart strategies through risk-adjusted logic. It features input customization for stop-loss, leverage, equity settings, and offers clear breakdowns of risk-to-reward ratios.",
      "It includes parameters for leverage, SL/TP ratio settings, equity monitoring, and smart alerts to support active trade planning. Users can simulate different risk outcomes and refine their strategy before executing trades.",
    ],
    features: [
      "Custom trade risk calculations",
      "Leverage planner",
      "Smart alerts & validation",
      "Dark/light UI themes",
      "Mobile + Web PWA support",
      "Professional UX",
    ],
    technologies: [
      "ASP.NET MVC",
      "Bootstrap",
      "JavaScript",
      "Dynamic Risk Logic",
      "Realtime Projections",
    ],
    platforms: ["web", "mobile", "desktop"],
    deliverables: [
      {
        platform: "mobile",
        name: "CRT App – Catalyst Risk Tool",
        summary:
          "A mobile risk management companion for traders, available on both Android and iOS. The CRT App helps users calculate trade risks, determine position sizing, and make informed investment decisions with ease—perfect for on-the-go financial control.",
        description: [
          "CRT's mobile version brings advanced risk management directly to traders' fingertips. Built as a PWA using ASP.NET MVC, the app includes service worker support, dynamic risk calculations, offline capability, and push alerts for price and equity triggers. Traders can evaluate SL/TP ratios, simulate trades, and adjust sizing — all on the go.",
          "CRT mobile supports parameter configuration, dark/light themes, and real-time alerts even when offline. It syncs seamlessly with web settings and allows users to test risk setups on a small screen with precision.",
        ],
        features: [
          "Mobile risk calculator",
          "SL/TP input simulator",
          "Offline support via service worker",
          "Risk-to-reward visual outputs",
          "Dark/light modes",
          "Real-time sync with web dashboard",
        ],
        technologies: [
          "ASP.NET MVC",
          "JavaScript",
          "PWA Support",
          "SignalR",
          "Real-time Risk Engine",
        ],
        images: [
          image("/images/projects/crt/mobile-1.png", 600, 950, "CRT registration screen"),
          image("/images/projects/crt/mobile-2.png", 600, 950, "CRT risk calculator with lot size and risk gauge"),
          image("/images/projects/crt/mobile-3.png", 600, 950, "CRT instrument groups: forex, synthetics, stocks and crypto"),
        ],
      },
      {
        platform: "desktop",
        name: "Catalyst Risk Tool (CRT) Desktop App",
        summary:
          "A cross-platform desktop application designed to help traders and investors calculate, manage, and optimize their trading risk with precision. The CRT Desktop App offers advanced analytics, customizable strategies, and a clean interface—ideal for both beginner and experienced market participants. Fully compatible with Windows, macOS, and Linux.",
        description: [],
        features: [],
        technologies: [],
        images: [],
      },
    ],
    coverStage: {
      background: "#ecfff4",
      screens: [
        image("/images/projects/crt/mobile-1.png", 600, 950, "CRT registration screen"),
        image("/images/projects/crt/mobile-2.png", 600, 950, "CRT risk calculator with lot size and risk gauge"),
        image("/images/projects/crt/mobile-3.png", 600, 950, "CRT instrument groups: forex, synthetics, stocks and crypto"),
      ],
    },
    images: [],
    links: [],
    date: "2025",
    featured: false,
    legacy: {
      projectNameType: "CRT",
      projectTypes: ["Web", "Mobile"],
      remarks: {
        webList: "CRT reshaped how individual traders approach capital preservation and planning.",
        mobileList: "Designed with real-time risk logic, CRT's mobile version empowers traders on the move.",
      },
    },
    reviewNotes: [],
  },
  {
    id: "apexgo",
    slug: "apexgo",
    visibility: "hidden",
    industry: "FinTech",
    sectors: ["fintech"],
    tagline: "A mobile trading assistant that brings AI-generated market signals and trade setups to traders' phones.",
    name: "ApexGO",
    aliases: ["Apex Predator AI"],
    clientId: "catalyst-fx-dynamics",
    category: "Financial Markets, Forex & Crypto",
    shortDescription:
      "A sophisticated AI-powered trading assistant designed to analyze market trends, deliver real-time insights, and enhance decision-making for traders. Available across both desktop and mobile platforms, Apex helps users trade with precision and consistency—without emotional bias.",
    description: [
      "ApexGO is a mobile trading assistant derived from Apex Predator AI. Built using Xamarin for Android, it allows users to view live market signals, monitor alerts, and access strategies. While the APK is currently offered via direct download on the Catalyst FX Dynamics website, work is ongoing to deliver a native iOS version.",
      "The app simplifies trade signals with a clean interface showing buy/sell indicators, setup screenshots, and entry/exit strategies. Users are notified instantly when new setups become available.",
    ],
    features: [
      "Live AI trading alerts",
      "Manual APK download option",
      "Setup screenshots and strategies",
      "Simple buy/sell UI",
      "Lightweight for low-end devices",
      "Planned iOS release",
    ],
    technologies: [
      "Xamarin (Android)",
      "REST API Integration",
      "Manual APK Distribution",
      "Realtime Signal Alerts",
    ],
    platforms: ["mobile", "desktop", "design"],
    deliverables: [
      {
        platform: "desktop",
        name: "Apex Predator AI – Desktop Version",
        summary:
          "The desktop edition of Apex Predator AI, built to seamlessly integrate with MetaTrader 5 on both Windows and macOS. This powerful trading assistant delivers real-time market analysis, signal generation, and decision support for forex and synthetic indices, helping traders maximize performance with precision and confidence.",
        description: [],
        features: [],
        technologies: ["MetaTrader 5"],
        coverImage: coverImage(
          "apexgo",
          "img/apps/desktop/apex.png",
          "Apex Predator AI desktop version for MetaTrader 5",
          "desktop-cover",
        ),
        images: [],
      },
      {
        platform: "design",
        name: "ApexGO – Mobile App (Figma Design)",
        summary:
          "Modern mobile UI/UX design for the ApexGO app, built in Figma to support seamless signal delivery, user engagement, and trading insights. The design emphasizes usability, clarity, and performance across both Android and iOS platforms.",
        description: [],
        features: [],
        technologies: ["Figma"],
        coverImage: coverImage(
          "apexgo",
          "img/apps/design/apex.png",
          "ApexGO mobile app design in Figma",
          "design-cover",
        ),
        images: [],
      },
    ],
    coverImage: coverImage("apexgo", "img/apps/mobile/apex.png", "ApexGO mobile app"),
    images: gallery("apexgo", "mobile", "img/apps/mobile/apex", numberedFiles(4), "ApexGO mobile app"),
    links: [],
    date: "2020",
    featured: false,
    legacy: {
      projectNameType: "Apex",
      projectTypes: ["Mobile"],
      remarks: {
        mobileList: "A lightweight, signal-rich app that delivers AI insights straight to traders' pockets.",
      },
    },
    reviewNotes: [
      "The legacy URL was broken (https://www.catalystfxdynamics/Products/Apex — missing \".com\") and has not been carried over. Confirm the correct product URL.",
      'Naming: "ApexGO" (mobile app) vs "Apex Predator AI" (product family / desktop) — confirm how the product is presented and named.',
    ],
  },

  // ---------------------------------------------------------------------------
  // CP Moloto Advisory
  // ---------------------------------------------------------------------------
  {
    id: "cpma",
    slug: "cpma",
    industry: "Legal",
    sectors: ["legal"],
    solutionTags: ["business-systems"],
    tagline: "A legal case management platform connecting attorneys, clients and administrators across web and mobile.",
    // Challenge / solution / outcome restate the legacy copy below; no new claims or figures.
    challenge:
      "Legal matters involve many parties, deadlines and documents. CP Moloto Advisory needed one place to assign attorneys, follow every stage of a case and keep clients informed.",
    solution:
      "A case management web platform and a companion mobile app, integrated with Trello for case flow, Monday.com for team updates, Zendesk for client requests and Twilio for calls.",
    outcome:
      "Case work, communication and hearing schedules moved into one secure system that attorneys and clients can use from anywhere.",
    name: "CPMA",
    clientId: "cp-moloto-advisory",
    category: "Legal Case Management Platform",
    shortDescription:
      "A legal case management platform for CP Moloto Advisory. Includes client onboarding, attorney assignment, and integrations with Trello, Zendesk, and Monday.com.",
    description: [
      "CPMA is a complete legal case management platform for CP Moloto Advisory. The platform simplifies the flow of legal operations by assigning attorneys, automating communication between parties, logging each stage of legal processes, and integrating external services like Trello and Monday.com for workflow clarity. Built-in VOIP enables direct calls from the app.",
      "The system includes live chat support, VOIP integration, and a powerful calendar for hearing schedules, all tied together in one solution. It integrates Trello to handle case flows, Monday.com for team updates, and Zendesk for tracking client requests.",
    ],
    features: [
      "Attorney-client case assignment",
      "Live chat (Zendesk)",
      "VoIP calls (Twilio)",
      "Calendar API integration",
      "Modular dashboard views",
      "Trello & Monday.com workflows",
      "Onboarding and document storage",
    ],
    technologies: [
      "ASP.NET Core",
      "Blazor",
      "JavaScript",
      "Android (Java)",
      "SignalR",
      "Trello/Zendesk/Monday.com APIs",
      "Twilio VoIP Integration",
    ],
    platforms: ["web", "mobile"],
    deliverables: [
      {
        platform: "mobile",
        name: "CPMA Mobile App",
        summary:
          "The CPMA Mobile App extends legal case management to mobile devices, enabling attorneys, clients, and administrators to track cases, schedule hearings, and communicate securely on the go. With built-in calendar sync, file uploads, and case notifications, it ensures seamless legal workflow beyond the desktop.",
        description: [
          "The CPMA Mobile App extends legal case management to Android and iOS using Xamarin.Forms. Lawyers and clients can securely exchange documents, view case timelines, and receive notifications. The app features deep integration with the main web dashboard and supports cross-platform updates through a unified API layer.",
          "Lawyers and clients can chat, upload files, review case milestones, and receive hearing notifications. Authentication is secure and supports both biometric and PIN-based logins.",
        ],
        features: [
          "Cross-platform (Xamarin.Forms)",
          "Biometric and PIN login",
          "Secure chat with case documents",
          "Notifications for hearings",
          "Case status tracking",
          "Works with CPMA Web Dashboard",
        ],
        technologies: [
          "Xamarin.Forms",
          "C#",
          ".NET Core APIs",
          "Azure Notification Hub",
          "Secure Auth",
        ],
        images: [
          image("/images/projects/cpma/mobile-1.png", 600, 950, "CPMA sign-in screen"),
          image("/images/projects/cpma/mobile-2.png", 600, 950, "CPMA client dashboard"),
          image("/images/projects/cpma/mobile-3.png", 600, 950, "CPMA menu with client management and calendar"),
        ],
      },
    ],
    coverStage: {
      background: "#ebf6e5",
      screens: [
        image("/images/projects/cpma/mobile-1.png", 600, 950, "CPMA sign-in screen"),
        image("/images/projects/cpma/mobile-2.png", 600, 950, "CPMA client dashboard"),
        image("/images/projects/cpma/mobile-3.png", 600, 950, "CPMA menu with client management and calendar"),
      ],
    },
    images: [],
    links: [],
    date: "2019",
    featured: true,
    featuredOrder: 3,
    legacy: {
      projectNameType: "CPMA",
      projectTypes: ["Web", "Mobile"],
      remarks: {
        webList:
          "Brought law-firm client operations online—securely and efficiently—with real-time communications.",
        mobileList: "Cross-platform legal app enhances client-attorney communication from anywhere.",
      },
    },
    reviewNotes: [
      "The legacy \"URL\" was a development/staging host (cpmaserverdev.azurewebsites.net) and has not been carried over. Confirm a public URL or leave it out.",
      'Legacy spelling "Twillio" corrected to "Twilio".',
    ],
  },

  // ---------------------------------------------------------------------------
  // MetaPOS (client per legacy code: Anglojungle)
  // ---------------------------------------------------------------------------
  {
    id: "metapos",
    slug: "metapos",
    industry: "Retail",
    sectors: ["retail"],
    solutionTags: ["business-systems"],
    tagline:
      "A point-of-sale system for retailers — Android POS devices in store, synced to a web dashboard for sales, stock and staff.",
    // Challenge / solution / outcome restate the legacy copy below; no new claims or figures.
    challenge:
      "Retailers needed to sell quickly at the counter, keep trading when the connection drops, and still see sales and stock across locations.",
    solution:
      "Native Android apps for phones and POS terminals with barcode scanning and offline sales, synced to a cloud backend and a web dashboard for owners and managers.",
    outcome:
      "In-store transactions and management reporting are connected, so owners can follow sales, stock and staff activity without being on site.",
    name: "MetaPOS",
    clientId: "anglojungle",
    category: "Retail Analytics & Management Dashboard",
    shortDescription:
      "Point-of-sale system for mobile and web, used by local retailers for inventory, transactions, and barcode-based sales tracking.",
    description: [
      "MetaPOS Dashboard serves as the web-based analytics and control panel for MetaPOS retail operations. It allows business owners and managers to view daily reports, sales summaries, inventory analytics, and manage staff logins. The dashboard complements the point-of-sale mobile app and centralizes operations requiring secure access.",
      "Its role is to provide real-time sales summaries, stock analysis, system configuration, and performance metrics. Admins can fine-tune promotions, view staff shifts, and use analytics to make informed decisions based on live data from POS devices.",
    ],
    features: [
      "Retail analytics overview",
      "View sales and transactions",
      "Create staff logins",
      "Connects with POS app",
      "Secure API endpoints",
      "Separation of daily ops and admin tools",
    ],
    technologies: [
      "ASP.NET MVC",
      "Bootstrap 5",
      "SQL Server",
      "Web APIs",
      "JWT Auth",
      "App Syncing",
    ],
    platforms: ["web", "mobile", "design"],
    deliverables: [
      {
        platform: "mobile",
        name: "MetaPOS – Point of Sale System",
        summary:
          "MetaPOS is a versatile point of sale system built for retail environments. Compatible with Android phones and POS devices, the app enables seamless transactions—POS terminals can scan barcodes for sales, while mobile users can tap items to add to cart. Ideal for modern, mobile-first retail operations.",
        description: [
          "MetaPOS runs on Android tablets and POS devices using native Java and Kotlin. The app handles inventory, customer checkouts, printing, and staff management. It syncs in real-time with a cloud backend (CakePHP and .NET APIs) and is hosted across Google Cloud and AWS for performance and reliability.",
          "Sales transactions sync automatically, even from remote POS locations. Offline-first support ensures sales are stored locally when network is unavailable. Admin users can access shift reports and update product catalogs remotely.",
        ],
        features: [
          "Inventory + sales tracking",
          "Runs on Android POS devices",
          "Works offline with sync to cloud",
          "Daily staff reporting",
          "Built with Java/Kotlin",
          "Multi-location support",
        ],
        technologies: [
          "Java",
          "Kotlin",
          "CakePHP APIs",
          "C# .NET APIs",
          "GCP & AWS Hosting",
          "SQLite Sync",
        ],
        images: [
          image("/images/projects/metapos/mobile-1.png", 600, 950, "MetaPOS sign-in screen"),
          image("/images/projects/metapos/mobile-2.png", 600, 950, "MetaPOS product catalogue with cart"),
          image("/images/projects/metapos/mobile-3.png", 600, 950, "MetaPOS stock statistics with stock adjustments"),
        ],
      },
      {
        platform: "design",
        name: "MetaPOS UX Design",
        summary:
          "Modern and responsive UX design for MetaPOS, built using Figma. Tailored for both mobile and POS terminal environments, this interface focuses on retail transaction efficiency, barcode flow, and user-friendly item navigation.",
        description: [],
        features: [],
        technologies: ["Figma"],
        images: [],
      },
    ],
    coverStage: {
      background: "#bd7098",
      screens: [
        image("/images/projects/metapos/mobile-1.png", 600, 950, "MetaPOS sign-in screen"),
        image("/images/projects/metapos/mobile-2.png", 600, 950, "MetaPOS product catalogue with cart"),
        image("/images/projects/metapos/mobile-3.png", 600, 950, "MetaPOS stock statistics with stock adjustments"),
      ],
    },
    images: [],
    websiteUrl: "https://www.metapos.co.za",
    links: [],
    date: "2021",
    featured: false,
    legacy: {
      projectNameType: "MetaPOS",
      projectTypes: ["Web", "Mobile"],
      remarks: {
        webList: "Connected real-time POS transactions with analytics for informed decisions.",
        mobileList: "A robust Android POS app optimized for offline sales and cloud-synced analytics.",
      },
    },
    reviewNotes: [
      "Client per legacy code is Anglojungle while the logo wall shows a MetaPOS logo — confirm.",
      "Older screenshots also exist in images/portfolio/ (app-metapos*.png, web-metapos.png).",
    ],
  },

  // ---------------------------------------------------------------------------
  // P&E Finance
  // ---------------------------------------------------------------------------
  {
    id: "pne-finance",
    slug: "pne-finance",
    visibility: "hidden",
    industry: "FinTech",
    sectors: ["fintech"],
    solutionTags: ["business-systems"],
    tagline:
      "A purchase order financing portal that takes applications from submission and document upload through review to funding.",
    name: "PNE Finance",
    aliases: ["P&E Finance", "PNE Web App"],
    clientId: "pne-finance",
    category: "Purchase Order Financing Portal",
    shortDescription:
      "Finance application platform for P&E Finance to manage customer funding, document uploads, and admin assessments.",
    description: [
      "PNE App was developed to systemize the Purchase Order Financing process. From application form completion and document upload to real-time feedback and fund disbursement notifications, the site enables clients to apply for funding with fewer delays and increased transparency. Admins can approve, request revisions, or escalate cases.",
      "It features a clean application form, review workflow, and mobile integration to enable businesses to apply for funding easily. Email and SMS confirmations ensure that clients receive updates on funding decisions instantly.",
    ],
    features: [
      "Digital PO Financing submission",
      "Document upload",
      "Status tracking and funding updates",
      "Admin reviewer dashboard",
      "SMS and email notifications",
      "Web + Android sync",
    ],
    technologies: ["ASP.NET MVC", "Bootstrap", "SQL Server", "JavaScript", "REST APIs", "Android SDK"],
    platforms: ["web"],
    deliverables: [],
    coverImage: coverImage("pne-finance", "img/apps/web/pne.png", "PNE Finance web application"),
    images: gallery("pne-finance", "web", "img/apps/web/pne", numberedFiles(6), "PNE Finance web application"),
    links: [],
    date: "2021",
    featured: false,
    legacy: {
      projectNameType: "PNE",
      projectTypes: ["Web"],
      remarks: {
        webList: "Digitized funding applications for speed, transparency, and traceability.",
      },
    },
    reviewNotes: [
      'Legacy content uses "PNE Finance", "P&E Finance" and "PNE Web App" — confirm naming.',
      "Features mention Web + Android sync but no Android deliverable is recorded — confirm scope.",
    ],
  },

  // ---------------------------------------------------------------------------
  // Wealth Creators Group
  // ---------------------------------------------------------------------------
  {
    id: "wcg-app",
    slug: "wcg-app",
    visibility: "hidden",
    industry: "FinTech",
    sectors: ["fintech"],
    name: "WCG App",
    clientId: "wealth-creators-group",
    category: "Investment Platform with Admin Oversight",
    shortDescription:
      "Investment platform with user dashboards, deposit approvals, and daily return tracking. Built for Wealth Creators Group.",
    description: [
      "Wealth Creators Group (WCG) platform was developed to digitize their investment process—from marketing to user engagement, investment registration, ROI visibility, and scheduled withdrawal handling. The system supports admin approvals and includes automated returns calculation to promote user retention.",
      "The platform also manages user deposits, approvals, and offers return breakdowns, with withdrawals restricted to Tuesdays. Admins can view logs, initiate bonuses, and manage investor documents securely.",
    ],
    features: [
      "Marketing pages for investors",
      "Login portal for investment tracking",
      "Deposit and withdrawal rules",
      "Admin approval workflows",
      "Dockerized build for deployments",
      "Scalable with CI/CD support",
    ],
    technologies: [
      "ASP.NET Core",
      "Docker",
      "CI/CD pipelines",
      "JavaScript",
      "SQL Server",
      "DevOps Tooling",
    ],
    platforms: ["web"],
    deliverables: [],
    coverImage: coverImage("wcg-app", "img/apps/web/wcg.png", "WCG investment platform"),
    images: gallery("wcg-app", "web", "img/apps/web/wcg", numberedFiles(5), "WCG investment platform"),
    links: [],
    date: "2022",
    featured: false,
    legacy: {
      projectNameType: "WCG",
      projectTypes: ["Web"],
      remarks: {
        webList: "Offered an all-in-one investor platform with scalable, managed deployments.",
      },
    },
    reviewNotes: ["Gallery image 1 is 1.4 MB — optimise before use."],
  },

  // ---------------------------------------------------------------------------
  // AB Tech Mentorship
  // ---------------------------------------------------------------------------
  {
    id: "ab-tech-mentorship-programme",
    slug: "ab-tech-mentorship-programme",
    visibility: "hidden",
    industry: "Education",
    sectors: ["education"],
    name: "AB Tech Mentorship Programme",
    clientId: "ab-tech-mentorship",
    category: "Professional Mentorship & Career Development",
    shortDescription:
      "A biographical showcase of a renowned speaker dedicated to inspiring and guiding young professionals and senior students as they transition into the workforce. The programme emphasizes career development, soft skills, and workplace readiness through motivational talks and structured mentorship.",
    description: [
      "AB Tech Mentorship's website serves as a comprehensive biographical platform for its founder and programme, highlighting milestones, inspirational talks, and soft skills workshops. It presents professional development resources tailored for students and job seekers, guiding them from academic spaces into the workforce.",
      "The site offers biographical profiles, upcoming event listings, and structured programme outlines to inspire youth and professionals. It acts as a source of motivation and insight for career preparation, especially targeting undergraduates and new graduates.",
    ],
    features: [
      "Mentor biography showcase",
      "Career-readiness articles",
      "Responsive programme layout",
      "Event highlights",
      "Social proof sections",
      "Youth-focused UX",
    ],
    technologies: [
      "HTML5",
      "TailwindCSS",
      "JavaScript",
      "Bootstrap 5",
      "Google Analytics",
      "SEO optimization",
    ],
    platforms: ["web"],
    deliverables: [],
    coverImage: coverImage(
      "ab-tech-mentorship-programme",
      "img/apps/web/abt.png",
      "AB Tech Mentorship Programme website",
    ),
    images: gallery(
      "ab-tech-mentorship-programme",
      "web",
      "img/apps/web/abtech",
      numberedFiles(5),
      "AB Tech Mentorship Programme website",
    ),
    links: [],
    date: "2024",
    featured: false,
    legacy: {
      projectNameType: "ABTech",
      projectTypes: ["Web"],
      remarks: {
        webList: "Built to inspire the next generation of professionals with structured career content.",
      },
    },
    reviewNotes: ["No public URL recorded."],
  },

  // ---------------------------------------------------------------------------
  // In-house products
  // ---------------------------------------------------------------------------
  {
    id: "mindsharp-lms",
    slug: "mindsharp-lms",
    visibility: "hidden",
    industry: "Education",
    sectors: ["education"],
    tagline:
      "An in-house learning platform in development, with course delivery, progress tracking and branding for each institution.",
    name: "MindSharp LMS",
    aliases: ["Proficient LMS", "Learning Management System"],
    inHouse: true,
    category: "Multi-Tenant Learning Management System, Education",
    shortDescription:
      "In-house education platform in development, offering custom branding and rich features for learners of all levels.",
    description: [
      "Proficient LMS is an internal project aimed at building a full-scale educational platform designed for learners across levels. It features course delivery, tracking, student portals, branded themes per institution, and is built for scalability. This project reflects our team's passion for learning and academic excellence.",
      "The LMS project was inspired by a personal commitment to education—aiming to provide academic tools to learners of every level. The backend offers detailed student analytics while the front end provides a distraction-free learning environment with gamified elements.",
    ],
    features: [
      "Course builder for admins",
      "Quizzes and feedback modules",
      "Student progress tracking",
      "Custom branding for each school",
      "Multilingual support",
      "Planned Android/iOS mobile app",
    ],
    technologies: [
      "Blazor Server",
      "Entity Framework",
      "ASP.NET Core",
      "JavaScript",
      "SignalR",
      "Responsive UI",
    ],
    platforms: ["web"],
    deliverables: [],
    coverImage: coverImage("mindsharp-lms", "img/apps/web/lms.png", "MindSharp LMS web application"),
    images: gallery("mindsharp-lms", "web", "img/apps/web", ["lms.png"], "MindSharp LMS web application"),
    links: [],
    date: "2025",
    featured: false,
    status: "in-development",
    legacy: {
      projectNameType: "LMS",
      projectTypes: ["Web"],
      remarks: {
        webList: "A purpose-driven education platform designed to scale with every student's potential.",
      },
    },
    reviewNotes: [
      'Three names in legacy content: "MindSharp LMS", "Proficient LMS", "Learning Management System" — confirm the product name.',
      "Only one screenshot exists (the legacy gallery also rendered an empty slide).",
    ],
  },
  {
    id: "fpsl",
    slug: "fpsl",
    visibility: "hidden",
    industry: "Sports",
    sectors: ["sports"],
    name: "FPSL – Fantasy Premier Soccer League SA",
    aliases: ["FPSL"],
    inHouse: true,
    category: "Sports, Soccer & Entertainment",
    shortDescription:
      "A locally developed fantasy football mobile app designed for South African soccer fans. Inspired by the global success of FPL, FPSL allows users to create teams, compete in private and public leagues, and track player performance across the South African Premier Division.",
    description: [
      "Fantasy Premier Soccer League SA (FPSL) is a mobile-first cross-platform fantasy football app built with Xamarin. Currently under development, the app will allow users to draft players, manage squads, track stats, and compete for prizes based on real-world football performance. It's designed for scalability and real-time sync with live matches.",
      "Players will draft teams, join leagues, and receive live scores as the matches unfold. Admin panels and scoring algorithms are integrated with server APIs for fair play enforcement.",
    ],
    features: [
      "Fantasy football team creation",
      "Live match stats integration",
      "League and prize management",
      "Built in Xamarin for scalability",
      "Real-time scoring updates",
      "Admin control panel",
    ],
    technologies: [
      "Xamarin C#",
      "RESTful API",
      "Fantasy Scoring Engine",
      "SignalR (Live Data Sync)",
    ],
    platforms: ["mobile", "design"],
    deliverables: [
      {
        platform: "design",
        name: "FPSL Mobile App (Figma Design)",
        summary:
          "Modern Figma UI/UX design for the Fantasy Premier Soccer League (FPSL), a mobile app concept created for the South African football league. The app allows users to draft teams, track live player stats, view weekly rankings, and engage with fellow fans through mini-leagues and leaderboards.",
        description: [],
        features: [],
        technologies: ["Figma"],
        coverImage: coverImage("fpsl", "img/apps/design/fpsl.png", "FPSL mobile app design in Figma", "design-cover"),
        images: [],
      },
    ],
    coverImage: coverImage("fpsl", "img/apps/mobile/fpsl.png", "FPSL fantasy football mobile app"),
    images: gallery("fpsl", "mobile", "img/apps/mobile/fpsl", numberedFiles(3), "FPSL fantasy football mobile app"),
    links: [],
    date: "2024",
    featured: false,
    status: "in-development",
    legacy: {
      projectNameType: "FPSL",
      projectTypes: ["Mobile"],
      remarks: {
        mobileList: "Built for football fans, FPSL is South Africa's first real-time fantasy league mobile app.",
      },
    },
    reviewNotes: [
      "The \"South Africa's first real-time fantasy league\" claim (an unrendered legacy remark) must be verified before any use.",
      "Card copy uses the present tense while the detail copy says the app is under development — align.",
    ],
  },

  // ---------------------------------------------------------------------------
  // Card-only portfolio items (no legacy detail page → no /projects/[slug] page yet)
  // ---------------------------------------------------------------------------
  {
    id: "gcwensa-automation-tool",
    slug: "gcwensa-automation-tool",
    visibility: "hidden",
    name: "Gcwensa Automation Tool",
    aliases: ["Gcwensa Data Tools", "Gcwensa App"],
    clientId: "gcwensa",
    shortDescription:
      "Desktop app for data processing: SQLite to MSSQL conversion, raw Apache file ingestion, and Excel report generation.",
    description: [],
    features: [],
    technologies: [],
    platforms: ["desktop"],
    deliverables: [],
    coverImage: coverImage(
      "gcwensa-automation-tool",
      "img/apps/desktop/gcwensa.png",
      "Gcwensa Data Tools desktop application",
    ),
    images: [],
    links: [],
    featured: false,
    reviewNotes: [
      "Card only — write case-study copy to give it a detail page.",
      "An older screenshot exists: images/portfolio/desktop-gcwensa.png.",
    ],
  },
  {
    id: "folder-locker",
    slug: "folder-locker",
    visibility: "hidden",
    name: "Folder Locker",
    shortDescription:
      "A secure desktop utility designed to protect sensitive files and folders with encryption and password protection. Folder Locker ensures privacy for personal and business data with an intuitive interface and strong security protocols. Compatible with Windows, macOS, and Linux.",
    description: [],
    features: [],
    technologies: [],
    platforms: ["desktop"],
    deliverables: [],
    coverImage: coverImage("folder-locker", "img/apps/desktop/fl.png", "Folder Locker desktop application"),
    images: [],
    links: [],
    featured: false,
    reviewNotes: [
      "Card only — client/ownership not recorded.",
      "An older screenshot exists: images/portfolio/desktop-folderLocker.png.",
    ],
  },
  {
    id: "task-planner-ux-design",
    slug: "task-planner-ux-design",
    visibility: "hidden",
    name: "Task Planner UX Design",
    aliases: ["Smart Task Planner App", "Task Planner"],
    shortDescription:
      "Comprehensive Figma-based UX design for a modern Task Planner application. The design emphasizes productivity, intuitive task flow, scheduling efficiency, and cross-platform compatibility across web and mobile interfaces.",
    description: [],
    features: [],
    technologies: ["Figma"],
    platforms: ["design"],
    deliverables: [],
    coverImage: coverImage(
      "task-planner-ux-design",
      "img/apps/design/task planner.png",
      "Task Planner app UX design",
    ),
    images: [],
    links: [],
    featured: false,
    reviewNotes: [
      "The card says Figma, but the legacy HEAD Home grid filed this image under Canva — confirm the tool.",
      "The HEAD Home grid also showed it as an app tile (images/portfolio/app-smartCalendar.png).",
      "Card only — client/ownership not recorded.",
    ],
  },
  {
    id: "self-checkout-app-design",
    slug: "self-checkout-app-design",
    visibility: "hidden",
    name: "Self-Checkout Mobile App (Figma Design)",
    aliases: ["eStore App"],
    shortDescription:
      "Figma UI/UX design for a modern Self-Checkout mobile application, allowing users to scan items, manage their cart, and complete secure payments from their device. Designed for retail stores seeking to streamline the checkout process and reduce queue times.",
    description: [],
    features: [],
    technologies: ["Figma"],
    platforms: ["design"],
    deliverables: [],
    coverImage: coverImage(
      "self-checkout-app-design",
      "img/apps/design/SelfCheckout.png",
      "Self-checkout mobile app design in Figma",
    ),
    images: [],
    links: [],
    featured: false,
    reviewNotes: [
      'The legacy HEAD Home grid showed this as the "eStore App" tile (images/portfolio/app-selfcheckout.png).',
      "Card only — client/ownership not recorded.",
    ],
  },
  {
    id: "new-shoe-brand-website-design",
    slug: "new-shoe-brand-website-design",
    visibility: "hidden",
    name: "New Shoe Brand Website Design (Adobe XD)",
    shortDescription:
      "Adobe XD design for the new shoe brand website, featuring a stylish and user-friendly layout tailored to showcase various shoe collections, brand story, and interactive elements for an engaging user experience.",
    description: [],
    features: [],
    technologies: ["Adobe XD"],
    platforms: ["design"],
    deliverables: [],
    coverImage: coverImage(
      "new-shoe-brand-website-design",
      "img/apps/design/shoeBrand.png",
      "Shoe brand website design in Adobe XD",
    ),
    images: [],
    links: [],
    featured: false,
    reviewNotes: ["Card only — client not named."],
  },
];
