/**
 * Content models for the public website.
 *
 * Rules for data that uses these types (see docs/CONTENT_MIGRATION.md):
 * - Only facts from CURRENT_WEBSITE_AUDIT.md or supplied by PSS.
 * - Unknown values stay `undefined` (optional fields) or empty arrays — never guessed.
 * - Anything that needs a human decision before launch goes in `reviewNotes`.
 */

// ---------------------------------------------------------------------------
// Media
// ---------------------------------------------------------------------------

/** What an image shows: a desktop-width screen/composite or a phone screen. */
export type MediaKind = "desktop" | "mobile";

export interface ImageAsset {
  /**
   * Exact path of a file under /public, e.g. "/images/projects/dailyrise/cover.png".
   * Rendering a missing file fails the build (src/lib/media.ts), so a broken
   * image can never ship.
   */
  src: string;
  /** Meaningful description of the image. Use "" only for purely decorative images. */
  alt: string;
  /** Intrinsic size in pixels. Frames use the real ratio, so nothing is stretched or badly cropped. */
  width?: number;
  height?: number;
  kind?: MediaKind;
  /** Source file in the legacy repo's wwwroot — migration tracking only. */
  legacySource?: string;
}

/**
 * A project cover composed by the site from real screenshots, for projects
 * that have screens but no designed cover image: the screens sit side by side
 * on a plain stage (`background` matches the screenshots' own backdrop).
 */
export interface CoverStage {
  screens: ImageAsset[];
  background: string;
}

// ---------------------------------------------------------------------------
// Shared
// ---------------------------------------------------------------------------

export type SocialPlatform =
  | "linkedin"
  | "facebook"
  | "instagram"
  | "x"
  | "youtube"
  | "github"
  | "tiktok";

export interface SocialLink {
  platform: SocialPlatform;
  label: string;
  url: string;
}

export interface NavigationItem {
  label: string;
  href: string;
  description?: string;
  children?: NavigationItem[];
  external?: boolean;
}

// ---------------------------------------------------------------------------
// Company & contact
// ---------------------------------------------------------------------------

export interface Person {
  name: string;
  role: string;
  bio?: string[];
  image?: ImageAsset;
  links: SocialLink[];
}

/** A numeric claim. Only confirmed stats are ever published. */
export interface CompanyStat {
  id: string;
  value: number;
  suffix?: string;
  label: string;
  source: string;
  confirmed: boolean;
}

export interface Company {
  legalName: string;
  name: string;
  shortName: string;
  tagline: string;
  /** One-sentence positioning used in the footer and metadata. */
  positioning: string;
  foundedYear: number;
  countryCode: string;
  /** Default site description (meta description). */
  description: string;
  founder: Person;
  stats: CompanyStat[];
  /** Not supplied yet — needed for legal pages / footer. */
  registrationNumber?: string;
  vatNumber?: string;
}

export interface PostalAddress {
  lines: string[];
  streetAddress: string;
  suburb?: string;
  locality: string;
  postalCode: string;
  countryName: string;
  countryCode: string;
}

export interface PhoneNumber {
  display: string;
  e164: string;
}

export interface EmailContact {
  address: string;
  purpose: "general" | "sales";
  label: string;
}

export interface ContactDetails {
  address: PostalAddress;
  phone: PhoneNumber;
  emails: EmailContact[];
  businessHours?: string;
  responseTimePromise?: string;
  consultationOffer?: string;
  mapQuery?: string;
}

// ---------------------------------------------------------------------------
// Services & technology
// ---------------------------------------------------------------------------

export type ServiceIcon =
  | "code"
  | "web"
  | "mobile"
  | "systems"
  | "rocket"
  | "server"
  | "plug"
  | "design"
  | "wrench"
  | "refresh"
  | "support";

export interface Service {
  id: string;
  /** In-page anchor on /services. */
  slug: string;
  name: string;
  icon: ServiceIcon;
  /** What it is (1–2 sentences). */
  summary: string;
  /** Who it is useful for. */
  usefulFor: string;
  /** What PSS can deliver — only capabilities evidenced by real work. */
  deliverables: string[];
}

export interface ServiceGroup {
  id: "build" | "connect" | "improve" | "design";
  label: string;
  title: string;
  intro: string;
  services: Service[];
}

export type TechnologyCategory =
  | "language"
  | "framework"
  | "mobile"
  | "database"
  | "cloud-devops"
  | "design"
  | "data"
  | "tooling"
  | "api";

export interface Technology {
  id: string;
  name: string;
  category: TechnologyCategory;
  logo?: ImageAsset;
}

// ---------------------------------------------------------------------------
// Clients & testimonials
// ---------------------------------------------------------------------------

export interface Client {
  id: string;
  name: string;
  aliases?: string[];
  logo?: ImageAsset;
  websiteUrl?: string;
  showInLogoWall: boolean;
  reviewNotes?: string[];
}

/** A client testimonial. Published only with the client's approval of the exact wording. */
export interface Testimonial {
  id: string;
  /** Company name as it should appear under the quote. */
  company: string;
  clientId?: string;
  projectSlug?: string;
  /** Short context shown under the company, e.g. "Marketplace platform". */
  context?: string;
  quote?: string;
  authorName?: string;
  authorRole?: string;
  /** Written permission to publish this exact quote and attribution. */
  approvedForPublication: boolean;
}

// ---------------------------------------------------------------------------
// Portfolio
// ---------------------------------------------------------------------------

/** Technical surface a project delivered. */
export type Platform = "web" | "mobile" | "desktop" | "backend" | "design" | "data";

/** Industry / market. Drives sector filters on the Work page. */
export type Sector =
  | "fintech"
  | "marketplace"
  | "ecommerce"
  | "health"
  | "telecommunications"
  | "legal"
  | "retail"
  | "education"
  | "media"
  | "enterprise"
  | "sports";

/** Solution type tags that are not derivable from platforms. */
export type SolutionTag = "business-systems";

export type ProjectStatus = "live" | "in-development" | "concept";

/**
 * - "public" (default): listed on the site and in the sitemap. Requires real
 *   content and a real cover (checked at build time in src/lib/projects.ts).
 * - "hidden": kept in the data (history, redirects) but never published.
 */
export type ProjectVisibility = "public" | "hidden";

export interface ProjectLink {
  label: string;
  url: string;
  kind: "website" | "play-store" | "app-store" | "other";
}

/** A measured outcome — only with evidence the client agrees to publish. */
export interface ProjectResult {
  label: string;
  value: string;
  source?: string;
}

export interface ProjectDeliverable {
  platform: Platform;
  name: string;
  /** In-page anchor on the case study (defaults to the platform). */
  anchor?: string;
  summary?: string;
  description: string[];
  features: string[];
  technologies: string[];
  images: ImageAsset[];
  coverImage?: ImageAsset;
  websiteUrl?: string;
}

/** A part of a connected product ecosystem (e.g. ZansiDispatch within ZansiHustle). */
export interface EcosystemNode {
  id: string;
  name: string;
  role: string;
  image?: ImageAsset;
  /** Case study of this part, when it has its own public page. */
  projectSlug?: string;
}

export interface ProjectEcosystem {
  hub: EcosystemNode;
  groups: Array<{ id: string; label: string; nodes: EcosystemNode[] }>;
  foundation?: EcosystemNode;
}

export interface LegacyProjectReference {
  projectNameType: string;
  projectTypes: Array<"Web" | "Mobile">;
  remarks?: {
    webList?: string;
    mobileList?: string;
  };
}

export interface Project {
  /** Stable internal identifier. */
  id: string;
  /** URL segment for /projects/[slug]. Permanent once published. */
  slug: string;
  name: string;
  aliases?: string[];
  clientId?: string;
  inHouse?: boolean;
  /** Industry label shown on cards, e.g. "Health". */
  industry?: string;
  sectors?: Sector[];
  solutionTags?: SolutionTag[];
  /** Category label from the legacy detail page. */
  category?: string;
  /**
   * One strong sentence from the business/product perspective — used on cards
   * and as the case-study hero line. No technology lists.
   */
  tagline?: string;
  /** Legacy card copy (verbatim). */
  shortDescription: string;
  /** Overview paragraphs. Empty = no case-study page. */
  description: string[];
  challenge?: string;
  solution?: string;
  outcome?: string;
  features: string[];
  technologies: string[];
  platforms: Platform[];
  deliverables: ProjectDeliverable[];
  ecosystem?: ProjectEcosystem;
  /** Supporting screens for the case study (desktop screens first, then phone screens). */
  images: ImageAsset[];
  /** A designed cover image… */
  coverImage?: ImageAsset;
  /** …or a cover the site composes from real screens. */
  coverStage?: CoverStage;
  /** Link-preview image (a compressed JPEG of the cover); falls back to the cover. */
  shareImage?: ImageAsset;
  websiteUrl?: string;
  links: ProjectLink[];
  date?: string;
  /** The single flagship case study presented on its own on the home page. */
  flagship?: boolean;
  /** Part of the curated Selected Work. */
  featured: boolean;
  featuredOrder?: number;
  visibility?: ProjectVisibility;
  /** Hidden project whose content now lives in another case study (legacy URLs follow it). */
  supersededBy?: { slug: string; anchor?: string };
  status?: ProjectStatus;
  scope?: string[];
  results?: ProjectResult[];
  testimonialId?: string;
  seoTitle?: string;
  seoDescription?: string;
  legacy?: LegacyProjectReference;
  /** Open questions / TODOs. Never rendered. */
  reviewNotes: string[];
}
