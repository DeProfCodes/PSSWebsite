import type { Metadata } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";

import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SkipLink } from "@/components/layout/SkipLink";
import { MOBILE_MENU_ROOT_ID } from "@/components/navigation/constants";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { JsonLd } from "@/components/seo/JsonLd";
import { getGaMeasurementId, isIndexableDeployment } from "@/config/environment";
import { siteConfig } from "@/config/site";
import { siteJsonLd } from "@/lib/structured-data";

import "./globals.css";

/*
 * Typography (see docs/ARCHITECTURE.md §9):
 * - Plus Jakarta Sans — the single primary family (UI, headings, body). Variable font.
 * - JetBrains Mono — accent only: eyebrows and small technical labels. Not preloaded.
 * Both are self-hosted by next/font at build time (no request to Google at runtime)
 * with metric-matched fallbacks to avoid layout shift.
 */
const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  preload: false,
});

/*
 * Global metadata. Pages add their own title/description/canonical/Open Graph
 * via buildPageMetadata() (src/lib/seo.ts). No canonical is set here on purpose:
 * an inherited canonical would point every page at the home page.
 *
 * Icons: drop favicon.ico, icon.png (512×512) and apple-icon.png (180×180) into
 * src/app/ once the approved brand assets exist — Next.js wires them up
 * automatically. A default opengraph-image.png (1200×630) can go there too.
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  creator: siteConfig.name,
  publisher: siteConfig.name,
  formatDetection: { telephone: false, email: false, address: false },
  // Preview/development deployments are never indexed.
  robots: isIndexableDeployment() ? { index: true, follow: true } : { index: false, follow: false },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    title: siteConfig.name,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary",
    title: siteConfig.name,
    description: siteConfig.description,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const gaMeasurementId = getGaMeasurementId();

  return (
    <html lang={siteConfig.language} className={`${sans.variable} ${mono.variable}`}>
      <body className="flex min-h-dvh flex-col bg-background text-foreground antialiased">
        <SkipLink />
        <SiteHeader />
        <div id={MOBILE_MENU_ROOT_ID} />
        <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
          {children}
        </main>
        <SiteFooter />
        <JsonLd data={siteJsonLd()} />
        {gaMeasurementId ? <GoogleAnalytics measurementId={gaMeasurementId} /> : null}
      </body>
    </html>
  );
}
