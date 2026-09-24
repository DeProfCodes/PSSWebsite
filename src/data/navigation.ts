import { routes } from "@/config/routes";
import type { NavigationItem } from "@/types/content";

/**
 * Primary navigation (approved, 2026-09-23). Deliberately minimal: no
 * Industries/Technologies/Blog/Careers and no mega-menus unless added explicitly.
 * "Work" is the portfolio at /projects.
 */
export const primaryNavigation: NavigationItem[] = [
  { label: "Home", href: routes.home },
  { label: "Services", href: routes.services },
  { label: "Work", href: routes.projects },
  { label: "About", href: routes.about },
  { label: "Contact", href: routes.contact },
];

/** Header call to action — preselects "Book a consultation" on the contact form. */
export const headerCta: NavigationItem = { label: "Book a Consultation", href: `${routes.contact}?topic=consultation` };

export const footerColumns: Array<{ title: string; items: NavigationItem[] }> = [
  {
    title: "Company",
    items: [
      { label: "Home", href: routes.home },
      { label: "About", href: routes.about },
      { label: "Work", href: routes.projects },
      { label: "Contact", href: routes.contact },
    ],
  },
  {
    title: "Services",
    items: [
      { label: "Custom Software", href: `${routes.services}#custom-software` },
      { label: "Web Platforms", href: `${routes.services}#web-platforms` },
      { label: "Mobile Apps", href: `${routes.services}#mobile-apps` },
      { label: "Business Systems", href: `${routes.services}#business-systems` },
      { label: "APIs & Integrations", href: `${routes.services}#integrations` },
    ],
  },
];
