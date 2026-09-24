import type { MetadataRoute } from "next";

import { isIndexableDeployment } from "@/config/environment";
import { absoluteUrl } from "@/config/site";

/**
 * /robots.txt — production allows crawling and advertises the sitemap;
 * every other deployment (Vercel previews) disallows everything.
 */
export default function robots(): MetadataRoute.Robots {
  if (!isIndexableDeployment()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/"] },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
