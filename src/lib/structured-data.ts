import { routes } from "@/config/routes";
import { absoluteUrl, siteConfig } from "@/config/site";
import { company } from "@/data/company";
import { contactDetails, getEmail } from "@/data/contact";
import { companySocialLinks } from "@/data/social";
import { resolveMediaSrc } from "@/lib/media";
import type { Project } from "@/types/content";

/**
 * schema.org JSON-LD builders.
 *
 * Type choices (see docs/ARCHITECTURE.md → "Structured data"):
 * - "SoftwareCompany" is not a schema.org type, so it is not used.
 * - "ProfessionalService" is deprecated by schema.org, so it is not used.
 * - The company is an `Organization` with its postal address and contact point.
 *   `LocalBusiness` should only be added once it is confirmed that the Randburg
 *   address is a customer-facing office.
 * - Portfolio projects are `CreativeWork`s created by the organisation.
 */

const ORGANIZATION_ID = `${siteConfig.url}/#organization`;
const WEBSITE_ID = `${siteConfig.url}/#website`;

type JsonLdObject = Record<string, unknown>;

export function organizationJsonLd(): JsonLdObject {
  const { address, phone } = contactDetails;
  const sameAs = companySocialLinks.map((link) => link.url);

  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: company.name,
    legalName: company.legalName,
    alternateName: company.shortName,
    url: absoluteUrl(routes.home),
    description: company.description,
    slogan: company.tagline,
    foundingDate: String(company.foundedYear),
    email: getEmail("general"),
    telephone: phone.e164,
    address: {
      "@type": "PostalAddress",
      streetAddress: address.suburb ? `${address.streetAddress}, ${address.suburb}` : address.streetAddress,
      addressLocality: address.locality,
      postalCode: address.postalCode,
      addressCountry: address.countryCode,
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "sales",
        email: getEmail("sales"),
        telephone: phone.e164,
      },
    ],
    founder: {
      "@type": "Person",
      name: company.founder.name,
      jobTitle: company.founder.role,
      sameAs: company.founder.links.map((link) => link.url),
    },
    logo: absoluteUrl("/images/brand/Logo.png"),
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

export function websiteJsonLd(): JsonLdObject {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: absoluteUrl(routes.home),
    name: siteConfig.name,
    inLanguage: siteConfig.language,
    publisher: { "@id": ORGANIZATION_ID },
  };
}

/** Site-wide graph rendered once in the root layout. */
export function siteJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@graph": [organizationJsonLd(), websiteJsonLd()],
  };
}

export function projectJsonLd(project: Project): JsonLdObject {
  const url = absoluteUrl(routes.project(project.slug));
  const shareImage = project.shareImage ?? project.coverImage ?? project.coverStage?.screens[0];
  const image = shareImage ? absoluteUrl(resolveMediaSrc(shareImage.src)) : undefined;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        "@id": `${url}#project`,
        name: project.name,
        description: project.seoDescription ?? project.tagline ?? project.shortDescription,
        url,
        creator: { "@id": ORGANIZATION_ID },
        isPartOf: { "@id": WEBSITE_ID },
        ...(project.date ? { dateCreated: project.date } : {}),
        ...(project.technologies.length > 0 ? { keywords: project.technologies.join(", ") } : {}),
        ...(image ? { image } : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl(routes.home) },
          { "@type": "ListItem", position: 2, name: "Work", item: absoluteUrl(routes.projects) },
          { "@type": "ListItem", position: 3, name: project.name, item: url },
        ],
      },
    ],
  };
}
