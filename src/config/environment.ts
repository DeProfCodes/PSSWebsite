/**
 * Deployment environment helpers. Server-side only in practice: VERCEL_ENV is not
 * exposed to the browser.
 *
 * VERCEL_ENV is "production" | "preview" | "development" on Vercel and undefined
 * elsewhere. Outside Vercel we fall back to NODE_ENV so a local `next build &&
 * next start` behaves like production.
 */
export type DeploymentEnvironment = "production" | "preview" | "development";

export function getDeploymentEnvironment(): DeploymentEnvironment {
  const vercelEnv = process.env.VERCEL_ENV;
  if (vercelEnv === "production" || vercelEnv === "preview" || vercelEnv === "development") {
    return vercelEnv;
  }
  return process.env.NODE_ENV === "production" ? "production" : "development";
}

/**
 * Only production may be indexed. Preview deployments (*.vercel.app) serve
 * robots.txt "Disallow: /" and a noindex meta tag so they never compete with
 * the real site in search results.
 */
export function isIndexableDeployment(): boolean {
  return getDeploymentEnvironment() === "production";
}

const GA_MEASUREMENT_ID_PATTERN = /^G-[A-Z0-9]{4,20}$/;

/** The GA4 measurement ID, or undefined when analytics is not configured/invalid. */
export function getGaMeasurementId(): string | undefined {
  const id = process.env.NEXT_PUBLIC_GA_ID?.trim();
  return id && GA_MEASUREMENT_ID_PATTERN.test(id) ? id : undefined;
}
