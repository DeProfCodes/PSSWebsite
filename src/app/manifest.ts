import type { MetadataRoute } from "next";

import { company } from "@/data/company";

/**
 * /manifest.webmanifest. Browser icons come from the Next.js file conventions
 * in src/app (favicon.ico, icon.png, apple-icon.png — cropped from the supplied
 * logo artwork, unmodified).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: company.name,
    short_name: company.shortName,
    description: company.description,
    start_url: "/",
    display: "browser",
  };
}
