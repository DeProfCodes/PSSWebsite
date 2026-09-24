/**
 * Site identity and SEO defaults.
 *
 * The canonical production origin is the www host, as decided in the project
 * brief. The legacy code used both www and non-www (audit §1.18); the apex
 * domain must 308-redirect to www at the Vercel domain level (docs/DEPLOYMENT.md).
 */
const PRODUCTION_ORIGIN = "https://www.proficientsoftwaresolutions.co.za";

function normaliseOrigin(value: string | undefined): string {
  const raw = value?.trim();
  if (!raw) return PRODUCTION_ORIGIN;
  return raw.replace(/\/+$/, "");
}

export const siteConfig = {
  name: "Proficient Software Solutions",
  shortName: "PSS",
  /** Origin used for canonical URLs, sitemap, Open Graph and JSON-LD. No trailing slash. */
  url: normaliseOrigin(process.env.NEXT_PUBLIC_SITE_URL),
  productionOrigin: PRODUCTION_ORIGIN,
  /** Open Graph locale. */
  locale: "en_ZA",
  /** <html lang>. */
  language: "en-ZA",
  /**
   * Default meta description — the legacy site's description (audit §3.1).
   * Page-specific descriptions override it; final SEO copy is still to be written.
   */
  description:
    "Proficient Software Solutions (Pty) Ltd is a South African software company delivering high-quality, professional software for businesses across industries.",
} as const;

/** Absolute URL for a site-relative path. */
export function absoluteUrl(path: string = "/"): string {
  return new URL(path, `${siteConfig.url}/`).toString();
}
