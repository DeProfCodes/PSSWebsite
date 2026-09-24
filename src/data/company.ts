import type { Company } from "@/types/content";

/**
 * Company facts. Sources: CURRENT_WEBSITE_AUDIT.md §3.3, §3.7 and PSS-supplied
 * direction (2026-09-23). Page copy for About lives in src/data/about.ts.
 */
export const company: Company = {
  legalName: "Proficient Software Solutions (Pty) Ltd",
  name: "Proficient Software Solutions",
  shortName: "PSS",
  // Only present inside the legacy logo artwork ("SOLUTIONS ENGINEERED FOR SUCCESS").
  tagline: "Solutions Engineered for Success",
  // Supplied by PSS for the footer (2026-09-23).
  positioning:
    "Proficient Software Solutions builds custom software, digital products and business systems for organisations ready to move forward.",
  foundedYear: 2017,
  countryCode: "ZA",
  description:
    "Proficient Software Solutions is a South African software company building custom web platforms, mobile applications, business systems and integrations.",
  founder: {
    name: "Proficient Mkansi",
    role: "Founder & Director",
    // No current portrait has been supplied, so the About page shows the founder as text only.
    links: [
      {
        platform: "linkedin",
        label: "Proficient Mkansi on LinkedIn",
        // Legacy link used http://; upgraded to https (same profile).
        url: "https://linkedin.com/in/proficient-mkansi-669b31147/",
      },
    ],
  },
  // Public figures. Deliberately conservative; approved by PSS on 2026-09-23.
  // Only a figure with `confirmed: true` is ever published.
  stats: [
    {
      id: "clients",
      value: 30,
      suffix: "+",
      label: "Clients",
      source:
        "Approved by PSS (2026-09-23) as a conservative figure. The legacy site claimed 33+ (audit §3.10).",
      confirmed: true,
    },
    {
      id: "completed-projects",
      value: 37,
      suffix: "+",
      label: "Projects Delivered",
      source: "Approved by PSS (2026-09-23); matches the legacy site's 37+ (audit §3.10).",
      confirmed: true,
    },
    {
      id: "active-projects",
      value: 4,
      label: "Active Projects",
      source: "Legacy Home hero badge + stats band (audit §3.10)",
      confirmed: false,
    },
  ],
  registrationNumber: undefined,
  vatNumber: undefined,
};

/** Display form of a confirmed stat, e.g. "30+". Throws for unknown or unconfirmed stats. */
export function formatConfirmedStat(id: string): string {
  const stat = company.stats.find((candidate) => candidate.id === id);
  if (!stat) throw new Error(`Unknown company stat "${id}".`);
  if (!stat.confirmed) throw new Error(`Company stat "${id}" is not confirmed for publication.`);
  return `${stat.value}${stat.suffix ?? ""}`;
}
