import type { Platform, Sector } from "@/types/content";

/**
 * Portfolio taxonomy. Filters are defined here and shown on the Work page only
 * when public project data backs them (src/lib/projects.ts → getWorkFilters).
 */

export const platformLabels: Record<Platform, string> = {
  web: "Web",
  mobile: "Mobile",
  desktop: "Desktop",
  backend: "Backend & APIs",
  design: "Design",
  data: "Data",
};

export const sectorLabels: Record<Sector, string> = {
  fintech: "FinTech",
  marketplace: "Marketplace",
  ecommerce: "Ecommerce",
  health: "Health",
  telecommunications: "Telecommunications",
  legal: "Legal",
  retail: "Retail",
  education: "Education",
  media: "Media",
  enterprise: "Enterprise",
  sports: "Sports",
};

/** Platforms that count towards a "Platforms" (multi-platform) project. */
export const fullPlatformContributors: readonly Platform[] = ["web", "mobile", "desktop", "backend"];

export type WorkFilterKey =
  | "all"
  | "platforms"
  | "web"
  | "mobile"
  | "business-systems"
  | "fintech"
  | "marketplace"
  | "health"
  | "telecommunications";

export interface WorkFilterDefinition {
  key: WorkFilterKey;
  label: string;
}

/**
 * Work-page filters, in display order (PSS brief, 2026-09-23). Old technical
 * categories (Desktop, Designs, APIs) are deliberately not primary filters.
 */
export const workFilterDefinitions: readonly WorkFilterDefinition[] = [
  { key: "all", label: "All" },
  { key: "platforms", label: "Platforms" },
  { key: "web", label: "Web" },
  { key: "mobile", label: "Mobile" },
  { key: "business-systems", label: "Business Systems" },
  { key: "fintech", label: "FinTech" },
  { key: "marketplace", label: "Marketplace" },
  { key: "health", label: "Health" },
  { key: "telecommunications", label: "Telecommunications" },
];

/**
 * Legacy in-page anchors from /Projects/AllProjects#… (kept by the browser
 * through the 308) mapped to Work-page filters.
 */
export const legacyAnchorFilters: Readonly<Record<string, WorkFilterKey>> = {
  web: "web",
  mobile: "mobile",
  desktop: "all",
  uxui: "all",
  api: "all",
};
