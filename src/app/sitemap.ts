import type { MetadataRoute } from "next";

import { routes, sitemapStaticRoutes } from "@/config/routes";
import { absoluteUrl } from "@/config/site";
import { getProjectsWithDetailPages } from "@/lib/projects";

/**
 * /sitemap.xml — static pages plus every generated project case study.
 * `lastModified` is intentionally omitted: there is no real modification date in
 * the content yet, and a fake one would mislead crawlers. Add it once content
 * carries an updated date (e.g. from a CMS).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries = sitemapStaticRoutes.map((path) => ({ url: absoluteUrl(path) }));
  const projectEntries = getProjectsWithDetailPages().map((project) => ({
    url: absoluteUrl(routes.project(project.slug)),
  }));

  return [...staticEntries, ...projectEntries];
}
