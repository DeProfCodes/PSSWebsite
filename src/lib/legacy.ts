import { routes } from "@/config/routes";
import { getAllProjects, getDeliverableAnchor, getProjectBySlug, hasDetailPage } from "@/lib/projects";
import type { Platform } from "@/types/content";

/**
 * Maps the legacy project-detail URL
 *   /Projects/ProjectDetails?projectNameType={Enum}&projectType={Web|Mobile}
 * to the new route, using each project's `legacy` reference (src/data/projects.ts).
 *
 * - Matching is case-insensitive, like ASP.NET enum model binding.
 * - A project merged into another case study (`supersededBy`) redirects to that
 *   case study's section (e.g. OvulaeApp → /projects/ovulae#app).
 * - When the requested variant is a secondary deliverable (e.g. the Mobile page
 *   of a project whose Web app is the primary content) the result points at that
 *   section: /projects/cpma#mobile.
 * - Hidden, unknown, missing or malformed values fall back to /projects.
 *
 * The full mapping table is in docs/LEGACY_REDIRECTS.md.
 */
const LEGACY_PROJECT_TYPES: Record<string, Platform> = {
  web: "web",
  mobile: "mobile",
};

export function resolveLegacyProjectPath(
  projectNameType: string | null | undefined,
  projectType: string | null | undefined,
): string {
  const nameKey = projectNameType?.trim().toLowerCase();
  if (!nameKey) return routes.projects;

  const project = getAllProjects().find(
    (candidate) => candidate.legacy?.projectNameType.toLowerCase() === nameKey,
  );
  if (!project) return routes.projects;

  if (project.supersededBy) {
    const target = getProjectBySlug(project.supersededBy.slug);
    if (!target || !hasDetailPage(target)) return routes.projects;
    const path = routes.project(target.slug);
    return project.supersededBy.anchor ? `${path}#${project.supersededBy.anchor}` : path;
  }

  if (!hasDetailPage(project)) return routes.projects;

  const path = routes.project(project.slug);
  const platform = LEGACY_PROJECT_TYPES[projectType?.trim().toLowerCase() ?? ""];
  const deliverable = platform ? project.deliverables.find((candidate) => candidate.platform === platform) : undefined;

  return deliverable ? `${path}#${getDeliverableAnchor(deliverable)}` : path;
}
