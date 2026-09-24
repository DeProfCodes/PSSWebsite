import type { ProjectLink } from "@/types/content";

/**
 * Typed GA4 conversion events.
 *
 * Rules:
 * - Only fire an event for something that actually happened (e.g. contact_submit
 *   only after /api/contact answered `ok: true`). Never fire on page load to
 *   "test" tracking.
 * - Parameter names use GA4's snake_case convention; values must be primitives.
 * - Safe to call anywhere on the client: it is a no-op when GA is not loaded
 *   (NEXT_PUBLIC_GA_ID unset, blocked by the visitor, or during SSR).
 *
 * Page views are sent by the GA4 config call and GA4 "Enhanced measurement →
 * Page changes based on browser history events" (enable it in the GA property),
 * which covers client-side navigations in the App Router.
 */
export interface AnalyticsEventParams {
  /** Enquiry successfully delivered by /api/contact. */
  contact_submit: {
    /** Which form was used, e.g. "contact_page". */
    form_id: string;
  };
  /** Visitor chose to book a consultation. */
  book_consultation: {
    /** Where the CTA was, e.g. "home_hero", "contact_page". */
    cta_location: string;
  };
  /** A project case study was viewed. */
  project_view: {
    project_slug: string;
    project_name: string;
  };
  /** Visitor followed a project's external link (live site, app store). */
  project_external_link: {
    project_slug: string;
    link_url: string;
    link_kind: ProjectLink["kind"];
  };
}

export type AnalyticsEventName = keyof AnalyticsEventParams;

export function trackEvent<Name extends AnalyticsEventName>(
  name: Name,
  params: AnalyticsEventParams[Name],
): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}
