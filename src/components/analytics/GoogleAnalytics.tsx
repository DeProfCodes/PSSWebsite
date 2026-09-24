import Script from "next/script";

/**
 * GA4 (gtag.js). Rendered exactly once, from the root layout, and only when
 * NEXT_PUBLIC_GA_ID holds a valid measurement ID (validated in
 * src/config/environment.ts — which also makes the interpolation below safe).
 * Loaded after hydration so it never blocks rendering.
 * Conversion events: src/lib/analytics.ts.
 */
export function GoogleAnalytics({ measurementId }: { measurementId: string }) {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){window.dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', '${measurementId}');`}
      </Script>
    </>
  );
}
