import { company } from "@/data/company";

/**
 * About page copy (company-first rewrite, 2026-09-23). Based on the direction
 * supplied by PSS; lightly edited for rhythm without changing meaning.
 * The legacy founder-centred story is kept below for reference only.
 */
export const aboutPage = {
  hero: {
    eyebrow: "About PSS",
    headline: { lead: "Software Built Around", emphasis: "Real Business Problems." },
    lead: "Proficient Software Solutions is a South African software company building custom digital products, platforms and business systems for organisations across industries.",
  },
  story: {
    eyebrow: "Our story",
    statement: "We build software that becomes useful infrastructure for the businesses behind it.",
    paragraphs: [
      `Proficient Software Solutions was founded in South Africa in ${company.foundedYear} with a simple goal: turn real business problems into reliable digital products.`,
      "What began with individual software projects has grown into end-to-end delivery across web applications, mobile products, backend systems, administration platforms and integrations.",
      "Today we work closely with businesses from the first idea and architecture through development, launch and ongoing improvement.",
      "Our goal is not simply to deliver code. It is to build software that keeps being useful long after it goes live.",
    ],
  },
  beliefs: {
    eyebrow: "What we believe",
    title: "Principles We Build By.",
    items: [
      { statement: "Software should solve something real.", detail: "Every feature should earn its place by making someone's work easier or a business stronger." },
      { statement: "Good technology simplifies operations.", detail: "The right system removes steps and friction — it should never add complexity for its own sake." },
      { statement: "Clients should understand what is being built, and why.", detail: "Decisions are explained in plain language, so you are never guessing where your project stands." },
      { statement: "Products should be designed to evolve.", detail: "We structure systems so new features, users and integrations can be added without starting again." },
      { statement: "Delivery doesn't end at launch.", detail: "Going live is a milestone. Support and improvement are part of the work." },
    ],
  },
  direction: {
    eyebrow: "Where we're going",
    title: "Building More Than Projects.",
    paragraphs: [
      "PSS is evolving from a project-based software company into a product and technology business, capable of delivering and supporting digital platforms across Africa and beyond.",
      "We continue to invest in product engineering, scalable architecture and software that creates long-term value for the organisations that use it.",
    ],
  },
  founder: {
    eyebrow: "Leadership",
    title: `Founded by ${company.founder.name}`,
    paragraph: `Proficient Software Solutions was established in ${company.foundedYear} by software engineer ${company.founder.name}, and has grown through years of hands-on product delivery and client partnerships.`,
  },
} as const;

/**
 * Legacy About copy (verbatim, audit §3.3) — reference only, NOT rendered.
 * PSS direction (2026-09-23): education and personal-journey details should
 * not dominate the company brand.
 */
export const legacyAboutCopy = {
  history: [
    'Proficient Software Solutions (Pty) Ltd is a proudly South African software development company founded in 2017 by Proficient Mkansi. The name "Proficient Software Solutions" (PSS) stems from our core philosophy: to build professional, high-quality software that makes a real difference in business outcomes.',
    "The journey began while Proficient was pursuing his BSc in Software Development at Rhodes University. After his first year, he began taking side jobs to sharpen his skills and deliver real-world solutions. This marked the early days of PSS — transforming passion into a brand and service offering.",
    "Proficient completed his degree in record time, graduating Cum Laude. While gaining corporate experience through employment, he continued to build the company, growing its portfolio through freelance projects and client partnerships.",
    "Today, PSS offers full-stack development and innovation-driven solutions across industries, powered by a team committed to excellence, professionalism, and long-term client success.",
  ],
  vision:
    "To become a trusted leader in smart, scalable software solutions across Africa — empowering businesses through technology, innovation, and reliability.",
  mission:
    "To deliver cutting-edge, user-focused software solutions that solve real-world challenges for businesses and individuals, driven by professionalism, creativity, and continuous learning.",
  futureOutlook:
    "As part of our long-term vision, we are expanding into proprietary software development with a focus on building powerful in-house applications tailored for key industries, including: Education, Retail, Corporate & Business Operations. Our mission is to evolve into a multi-product software house delivering impactful solutions across Africa and beyond.",
} as const;
