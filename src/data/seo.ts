/**
 * Per-page titles and meta descriptions, kept in one place for SEO review.
 * Titles combine with the root template: "<title> | Proficient Software Solutions".
 * Factual only — no claims beyond the site's own content.
 */
export const pageSeo = {
  home: {
    title: "Proficient Software Solutions — Custom Software, Web & Mobile Development",
    description:
      "Proficient Software Solutions is a South African software company building custom web platforms, mobile apps, business systems and integrations for organisations ready to move forward.",
  },
  about: {
    title: "About",
    description:
      "Founded in South Africa in 2017, Proficient Software Solutions builds custom digital products, platforms and business systems — from idea and architecture to launch and ongoing improvement.",
  },
  services: {
    title: "Services",
    description:
      "Custom software, web platforms, mobile apps, business systems, backend and API development, integrations, product design, modernisation and support.",
  },
  projects: {
    title: "Selected Work",
    description:
      "Selected platforms, applications and business systems built by Proficient Software Solutions — marketplace, telecommunications, fintech, legal, retail and enterprise.",
  },
  contact: {
    title: "Contact",
    description:
      "Tell us what you're building. Contact Proficient Software Solutions about a new product, an existing system or a consultation.",
  },
} as const;
