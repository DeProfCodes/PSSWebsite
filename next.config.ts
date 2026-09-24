import type { NextConfig } from "next";

/*
 * Routing notes (see docs/LEGACY_REDIRECTS.md):
 *
 * - Custom redirects/rewrites match case-INSENSITIVELY
 *   (`experimental.caseSensitiveRoutes` defaults to false). That is what we
 *   want: the legacy ASP.NET site accepted any casing (/home/aboutus, /HOME/SERVICES).
 *   Consequence: never add a legacy source that differs from a new route only by
 *   case (e.g. "/Projects" → "/projects") — it would redirect to itself forever.
 */

/** Canonical host: apex → www (308). Query strings are passed through. */
const canonicalHostRedirect = {
  source: "/:path*",
  has: [{ type: "host" as const, value: "proficientsoftwaresolutions\\.co\\.za" }],
  destination: "https://www.proficientsoftwaresolutions.co.za/:path*",
  permanent: true,
};

/** Permanent (308) redirects for legacy ASP.NET MVC URLs. Query strings are passed through. */
const legacyRedirects = [
  { source: "/Home", destination: "/" },
  { source: "/Home/Index", destination: "/" },
  { source: "/Home/AboutUs", destination: "/about" },
  { source: "/Home/Services", destination: "/services" },
  // GET only in practice. A POST here (the old form handler) also receives a 308 and
  // will no longer be processed — the new endpoint is POST /api/contact.
  { source: "/Home/Contact", destination: "/contact" },
  // The old configured error handler (it never existed; returned 404).
  { source: "/Home/Error", destination: "/" },
  // Fragments (#web, #mobile, #desktop, #api, #uxui) are kept by the browser.
  { source: "/Projects/AllProjects", destination: "/projects" },
  // Broken legacy action (returned 500).
  { source: "/Projects/CatalystFXDynamicsWeb", destination: "/projects" },
  // 13 hidden links on the old site pointed here; all returned 404.
  { source: "/Portfolio", destination: "/projects" },
  { source: "/Portfolio/:path+", destination: "/projects" },
].map((rule) => ({ ...rule, permanent: true }));

/** Baseline security headers. A Content-Security-Policy is deliberately deferred — see docs/ARCHITECTURE.md. */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,

  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75],
  },

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },

  async redirects() {
    return [canonicalHostRedirect, ...legacyRedirects];
  },

  async rewrites() {
    return {
      beforeFiles: [
        // Legacy project-detail URLs carry the project in the query string. A route
        // handler maps them to /projects/[slug] using the project data (single source
        // of truth) and answers with a clean 308 — see docs/LEGACY_REDIRECTS.md.
        { source: "/Projects/ProjectDetails", destination: "/legacy/project-details" },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
