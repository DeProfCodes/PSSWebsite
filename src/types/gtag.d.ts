// Globals installed by the GA4 snippet in src/components/analytics/GoogleAnalytics.tsx.
export {};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}
