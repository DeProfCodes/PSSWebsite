import type { SocialLink } from "@/types/content";

/**
 * Company social accounts.
 *
 * Empty on purpose: the legacy site only had hidden placeholder icons linking to
 * "#" (audit §3.7). Add real, verified company profiles here — they flow into the
 * footer and into the Organization JSON-LD `sameAs` automatically.
 * (The founder's personal LinkedIn lives on company.founder.links.)
 */
export const companySocialLinks: SocialLink[] = [];
