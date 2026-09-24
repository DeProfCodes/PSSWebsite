import { clients } from "@/data/clients";
import { additionalWorkOrder, projects } from "@/data/projects";
import {
  fullPlatformContributors,
  platformLabels,
  sectorLabels,
  workFilterDefinitions,
  type WorkFilterKey,
} from "@/data/taxonomy";
import { resolveMediaSrc } from "@/lib/media";
import type { ImageAsset, Platform, Project, ProjectDeliverable } from "@/types/content";

/**
 * Portfolio queries. Pages and components read projects through these helpers,
 * never by filtering the raw array, so the publication rule lives in one place:
 * a project is published when it is not hidden. Every published project has a
 * case-study page, a real cover and real content (enforced below at build time).
 */

export function isPublishedProject(project: Project): boolean {
  return (project.visibility ?? "public") === "public";
}

/** Every project in the data, including hidden ones (redirects and tooling only). */
export function getAllProjects(): readonly Project[] {
  return projects;
}

export function getPublishedProjects(): Project[] {
  return projects.filter(isPublishedProject);
}

export function hasDetailPage(project: Project): boolean {
  return isPublishedProject(project);
}

export function getProjectsWithDetailPages(): Project[] {
  return projects.filter(hasDetailPage);
}

export function getProjectBySlug(slug: string): Project | undefined {
  return getPublishedProjects().find((project) => project.slug === slug);
}

export function getFlagshipProject(): Project | undefined {
  return getPublishedProjects().find((project) => project.flagship);
}

const byFeaturedOrder = (a: Project, b: Project) =>
  (a.featuredOrder ?? Number.MAX_SAFE_INTEGER) - (b.featuredOrder ?? Number.MAX_SAFE_INTEGER);

/** Curated Selected Work, in `featuredOrder` (the flagship is presented separately). */
export function getFeaturedProjects(limit?: number): Project[] {
  const featured = getPublishedProjects()
    .filter((project) => project.featured && !project.flagship)
    .sort(byFeaturedOrder);
  return limit ? featured.slice(0, limit) : featured;
}

/** Work page order: flagship → featured (in order) → additional work order → the rest. */
export function getWorkProjects(): Project[] {
  const published = getPublishedProjects();
  const flagship = published.filter((project) => project.flagship);
  const featured = published.filter((project) => project.featured && !project.flagship).sort(byFeaturedOrder);
  const rest = published.filter((project) => !project.flagship && !project.featured);
  const rank = (project: Project) => {
    const index = additionalWorkOrder.indexOf(project.slug);
    return index === -1 ? additionalWorkOrder.length + projects.indexOf(project) : index;
  };
  return [...flagship, ...featured, ...rest.sort((a, b) => rank(a) - rank(b))];
}

export function getPlatformLabel(platform: Platform): string {
  return platformLabels[platform];
}

/** Shipped on two or more of web, mobile, desktop, backend. */
export function isMultiPlatform(project: Project): boolean {
  return project.platforms.filter((platform) => fullPlatformContributors.includes(platform)).length >= 2;
}

export function getProjectIndustryLabel(project: Project): string | undefined {
  if (project.industry) return project.industry;
  const sector = project.sectors?.[0];
  return sector ? sectorLabels[sector] : undefined;
}

/** Customer-facing tags for cards: platforms only (no technology lists). */
export function getProjectTags(project: Project): string[] {
  return project.platforms.filter((platform) => platform !== "design" && platform !== "data").map(getPlatformLabel);
}

export function projectMatchesWorkFilter(project: Project, key: WorkFilterKey): boolean {
  switch (key) {
    case "all":
      return true;
    case "platforms":
      return isMultiPlatform(project);
    case "web":
    case "mobile":
      return project.platforms.includes(key);
    case "business-systems":
      return project.solutionTags?.includes("business-systems") ?? false;
    default:
      return project.sectors?.includes(key) ?? false;
  }
}

/** Filter keys a project belongs to — rendered as a data attribute for the client-side filter. */
export function getProjectFilterKeys(project: Project): WorkFilterKey[] {
  return workFilterDefinitions.map((definition) => definition.key).filter((key) => projectMatchesWorkFilter(project, key));
}

export interface WorkFilter {
  key: WorkFilterKey;
  label: string;
  count: number;
}

/** Filters backed by data: a filter appears only when it narrows the list (some, but not all, projects match). */
export function getWorkFilters(list: readonly Project[]): WorkFilter[] {
  return workFilterDefinitions
    .map((definition) => ({
      ...definition,
      count: list.filter((project) => projectMatchesWorkFilter(project, definition.key)).length,
    }))
    .filter((filter) => filter.key === "all" || (filter.count > 0 && filter.count < list.length));
}

/** Up to `limit` related case studies: shared sectors weigh most, then shared platforms. */
export function getRelatedProjects(project: Project, limit = 3): Project[] {
  const score = (candidate: Project) => {
    const sharedSectors = candidate.sectors?.filter((sector) => project.sectors?.includes(sector)).length ?? 0;
    const sharedPlatforms = candidate.platforms.filter((platform) => project.platforms.includes(platform)).length;
    const sameClient = candidate.clientId && candidate.clientId === project.clientId ? 1 : 0;
    return sharedSectors * 3 + sameClient * 2 + sharedPlatforms + (candidate.featured ? 1 : 0);
  };
  return getProjectsWithDetailPages()
    .filter((candidate) => candidate.slug !== project.slug)
    .map((candidate) => ({ candidate, score: score(candidate) }))
    .sort((a, b) => b.score - a.score || byFeaturedOrder(a.candidate, b.candidate))
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}

/** In-page anchor of a deliverable on its case study. */
export function getDeliverableAnchor(deliverable: ProjectDeliverable): string {
  return deliverable.anchor ?? deliverable.platform;
}

/** A deliverable gets its own case-study section when it has screens or a full description. */
export function hasDeliverableSection(deliverable: ProjectDeliverable): boolean {
  return deliverable.images.length > 0 || deliverable.description.length > 0;
}

/** The image used for link previews: the share JPEG, else the designed cover, else the first composed screen. */
export function getShareImage(project: Project): ImageAsset | undefined {
  return project.shareImage ?? project.coverImage ?? project.coverStage?.screens[0];
}

/** Every image a published project renders anywhere on the site. */
function projectImages(project: Project): ImageAsset[] {
  const ecosystem = project.ecosystem;
  return [
    ...(project.coverImage ? [project.coverImage] : []),
    ...(project.shareImage ? [project.shareImage] : []),
    ...(project.coverStage?.screens ?? []),
    ...project.images,
    ...project.deliverables.flatMap((deliverable) => deliverable.images),
    ...(ecosystem
      ? [ecosystem.hub, ...ecosystem.groups.flatMap((group) => group.nodes), ...(ecosystem.foundation ? [ecosystem.foundation] : [])]
          .flatMap((node) => (node.image ? [node.image] : []))
      : []),
  ];
}

// ---------------------------------------------------------------------------
// Data integrity — runs once when this module loads, so a bad edit fails the
// build instead of shipping a broken page or redirect.
// ---------------------------------------------------------------------------

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function assertProjectDataIntegrity(list: readonly Project[]): void {
  const problems: string[] = [];
  const ids = new Set<string>();
  const slugs = new Set(list.map((project) => project.slug));
  const seenSlugs = new Set<string>();
  const legacyKeys = new Set<string>();
  const clientIds = new Set(clients.map((client) => client.id));

  for (const project of list) {
    const label = `Project "${project.id}"`;
    if (ids.has(project.id)) problems.push(`Duplicate project id "${project.id}".`);
    ids.add(project.id);

    if (!SLUG_PATTERN.test(project.slug)) problems.push(`Invalid slug "${project.slug}".`);
    if (seenSlugs.has(project.slug)) problems.push(`Duplicate slug "${project.slug}".`);
    seenSlugs.add(project.slug);

    if (project.clientId && !clientIds.has(project.clientId)) {
      problems.push(`${label} references unknown client "${project.clientId}".`);
    }
    if (isPublishedProject(project)) {
      // A published project must be complete: real copy and a real cover, every image present on disk.
      if (project.platforms.length === 0) problems.push(`${label} is published but has no platforms.`);
      if (!project.shortDescription) problems.push(`${label} is published but has no short description.`);
      if (project.description.length === 0) problems.push(`${label} is published but has no overview.`);
      if (!project.industry) problems.push(`${label} is published but has no industry.`);
      if (!project.coverImage && !project.coverStage?.screens.length) {
        problems.push(`${label} is published but has no cover image or cover screens.`);
      }
      for (const image of projectImages(project)) {
        if (!image.width || !image.height) problems.push(`${label}: image ${image.src} has no recorded size.`);
        try {
          resolveMediaSrc(image.src);
        } catch {
          problems.push(`${label}: image ${image.src} does not exist in /public.`);
        }
      }
    }
    for (const deliverable of project.deliverables) {
      if (!project.platforms.includes(deliverable.platform)) {
        problems.push(`${label} has a ${deliverable.platform} deliverable but "${deliverable.platform}" is not in platforms.`);
      }
    }
    if ((project.featured || project.flagship) && !isPublishedProject(project)) {
      problems.push(`${label} is featured/flagship but hidden.`);
    }
    if (project.supersededBy && !slugs.has(project.supersededBy.slug)) {
      problems.push(`${label} is superseded by unknown project "${project.supersededBy.slug}".`);
    }
    for (const node of project.ecosystem?.groups.flatMap((group) => group.nodes) ?? []) {
      if (node.projectSlug && !slugs.has(node.projectSlug)) {
        problems.push(`${label} ecosystem node "${node.id}" links to unknown project "${node.projectSlug}".`);
      }
    }
    if (project.legacy) {
      const key = project.legacy.projectNameType.toLowerCase();
      if (legacyKeys.has(key)) problems.push(`Duplicate legacy projectNameType "${project.legacy.projectNameType}".`);
      legacyKeys.add(key);
    }
  }

  if (list.filter((project) => project.flagship).length > 1) problems.push("More than one flagship project.");

  if (problems.length > 0) {
    throw new Error(`Project data is inconsistent:\n- ${problems.join("\n- ")}`);
  }
}

assertProjectDataIntegrity(projects);
