/**
 * Every public route in one place. Components, the sitemap and navigation data
 * build links from here instead of hardcoding strings.
 */
export const routes = {
  home: "/",
  about: "/about",
  services: "/services",
  projects: "/projects",
  project: (slug: string) => `/projects/${slug}`,
  contact: "/contact",
} as const;

/** Static (non-parameterised) pages included in sitemap.xml. Project pages are added from data. */
export const sitemapStaticRoutes: readonly string[] = [
  routes.home,
  routes.about,
  routes.services,
  routes.projects,
  routes.contact,
];
