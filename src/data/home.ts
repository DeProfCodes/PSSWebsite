import { routes } from "@/config/routes";
import { company, formatConfirmedStat } from "@/data/company";

/**
 * Home page content (approved direction, 2026-09-23). Copy follows the PSS
 * brief, lightly tightened. Numbers come from `company.stats` (confirmed only).
 * Icons are referenced by key and mapped to lucide-react in the components.
 */

export interface HeroCapability {
  label: string;
  icon: "web" | "mobile" | "systems" | "integrations" | "design" | "support";
}

export interface HeroArchitectureNode {
  title: string;
  caption: string;
  icon: "build" | "integrate" | "transform" | "grow";
}

export interface CredibilityItem {
  id: string;
  headline: string;
  highlight?: string;
  detail: string;
}

/** Contact page link that preselects "Book a consultation" in the form. */
export const consultationHref = `${routes.contact}?topic=consultation`;

export const homeHero = {
  eyebrow: ["Ideas", "Engineering", "Real Impact"],
  headline: {
    lead: "Software That Moves",
    emphasis: "Business Forward.",
  },
  description:
    "We build modern web applications, mobile apps, platforms, portals, APIs and business systems for ambitious businesses ready to do more.",
  primaryCta: { label: "Start Your Project", href: routes.contact },
  secondaryCta: { label: "View Our Work", href: routes.projects },
  capabilitiesLabel: "What we build",
  capabilities: [
    { label: "Web Applications", icon: "web" },
    { label: "Mobile Apps", icon: "mobile" },
    { label: "Business Systems", icon: "systems" },
    { label: "APIs & Integrations", icon: "integrations" },
    { label: "UI/UX Design", icon: "design" },
    { label: "Ongoing Support", icon: "support" },
  ] satisfies HeroCapability[],
  architecture: {
    centerCaption: company.name,
    nodes: [
      { title: "Build", caption: "Scalable solutions", icon: "build" },
      { title: "Integrate", caption: "Connected systems", icon: "integrate" },
      { title: "Transform", caption: "Ideas into impact", icon: "transform" },
      { title: "Grow", caption: "Software that evolves", icon: "grow" },
    ] satisfies HeroArchitectureNode[],
  },
} as const;

const clients = formatConfirmedStat("clients");
const projectsDelivered = formatConfirmedStat("completed-projects");

export const credibilityHighlights: CredibilityItem[] = [
  { id: "since", headline: `Since ${company.foundedYear}`, highlight: String(company.foundedYear), detail: "Building real-world software" },
  { id: "clients", headline: `${clients} Clients`, highlight: clients, detail: "Across multiple industries" },
  {
    id: "projects",
    headline: `${projectsDelivered} Projects Delivered`,
    highlight: projectsDelivered,
    detail: "Web, mobile and business systems",
  },
  { id: "delivery", headline: "End-to-End Delivery", detail: "Design • Development • Integration • Support" },
];

export const flagshipSection = {
  eyebrow: "Flagship platform",
  headline: { lead: "One Business Vision.", emphasis: "An Entire Software Ecosystem." },
  primaryCta: "Explore the Ecosystem",
  secondaryCta: "View Case Study",
} as const;

export const selectedWorkSection = {
  eyebrow: "Selected work",
  title: "Platforms and products we've helped bring to life.",
  lead: "A few of the systems we've designed and built — chosen for depth, not volume.",
  allWorkCta: "View all work",
  limit: 6,
} as const;

export const whatWeBuildSection = {
  eyebrow: "What we build",
  headline: { lead: "Built Around Your Business.", emphasis: "Not Around a Template." },
  statement:
    "Every business runs differently. We design and build software around your customers, your operations and the way your team actually works — then connect it to the systems you already use.",
  cta: { label: "Explore our services", href: routes.services },
} as const;

export const howWeWorkSection = {
  eyebrow: "How we work",
  title: "You'll always know where your project stands.",
  lead: "A clear, collaborative process — from the first conversation to launch and beyond.",
  steps: [
    { number: "01", title: "Understand", body: "We learn the business, the users, the problem and the constraints." },
    { number: "02", title: "Design", body: "We shape the experience, the architecture and the product direction." },
    { number: "03", title: "Build", body: "We develop, integrate and test the solution iteratively." },
    { number: "04", title: "Launch & Improve", body: "We deploy, support and keep improving the product." },
  ],
} as const;

export const whyPssSection = {
  eyebrow: "Why PSS",
  headline: { lead: "More Than Development.", emphasis: "We Take Ownership." },
  items: [
    {
      title: "End-to-end capability",
      body: "Frontend, mobile, backend, databases, integrations and deployment — one team across the whole product.",
    },
    {
      title: "Direct communication",
      body: "You work closely with the people actually responsible for delivering your project.",
    },
    {
      title: "Built for change",
      body: "We structure systems to evolve as your business grows, instead of being rebuilt every few years.",
    },
    {
      title: "Long-term partnership",
      body: "We stay involved beyond launch when support and improvements are needed.",
    },
    {
      title: "Practical engineering",
      body: "Technology choices are driven by the problem — not by whatever framework is trending.",
    },
  ],
} as const;

export const testimonialsSection = {
  eyebrow: "Client perspective",
  title: "In our clients' words.",
} as const;

export const finalCtaSection = {
  eyebrow: "Start a conversation",
  headline: { lead: "Have a Product to Build", emphasis: "or a System to Improve?" },
  body: "Tell us what you're working on. We'll help you understand the best way to build it.",
  primaryCta: { label: "Start a Project", href: `${routes.contact}?topic=new-project` },
  secondaryCta: { label: "Book a Consultation", href: consultationHref },
} as const;
