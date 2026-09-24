import type { Metadata } from "next";

import { siteConfig } from "@/config/site";
import { resolveMediaSrc } from "@/lib/media";
import type { ImageAsset } from "@/types/content";

interface PageMetadataInput {
  /** Page title; the root layout template appends the site name. Omit for the home page. */
  title?: string;
  description: string;
  /** Site-relative canonical path, e.g. "/projects/afx-trust". */
  path: string;
  /** Social preview images (files must exist; see src/lib/media.ts). */
  images?: ImageAsset[];
  /** Exclude this page from search engines. */
  noIndex?: boolean;
}

/**
 * Per-page metadata with canonical URL, Open Graph and Twitter/X card.
 *
 * Next.js merges metadata shallowly, so every page must supply its own
 * `openGraph`/`twitter` objects — this helper keeps them complete and consistent.
 * Relative URLs resolve against `metadataBase` (set in the root layout).
 */
export function buildPageMetadata({
  title,
  description,
  path,
  images = [],
  noIndex = false,
}: PageMetadataInput): Metadata {
  const socialTitle = title ?? siteConfig.name;
  const socialImages = images.map((image) => ({
    url: resolveMediaSrc(image.src),
    alt: image.alt,
    ...(image.width && image.height ? { width: image.width, height: image.height } : {}),
  }));

  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: path,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      title: socialTitle,
      description,
      ...(socialImages.length > 0 ? { images: socialImages } : {}),
    },
    twitter: {
      // No company X/Twitter account exists, so no site/creator handles are set.
      card: socialImages.length > 0 ? "summary_large_image" : "summary",
      title: socialTitle,
      description,
      ...(socialImages.length > 0 ? { images: socialImages.map((image) => image.url) } : {}),
    },
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
  };
}
