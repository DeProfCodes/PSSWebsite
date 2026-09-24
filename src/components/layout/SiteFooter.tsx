import Link from "next/link";

import { PssLogo } from "@/components/brand/PssLogo";
import { Container } from "@/components/layout/Container";
import { routes } from "@/config/routes";
import { company } from "@/data/company";
import { contactDetails, getEmail } from "@/data/contact";
import { footerColumns } from "@/data/navigation";
import { companySocialLinks } from "@/data/social";

const linkClass = "text-muted-foreground transition-colors hover:text-foreground";
const headingClass = "font-mono text-xs tracking-[0.2em] text-foreground/90 uppercase";

/** Site footer: dark ink, concise, no placeholder social accounts. */
export function SiteFooter() {
  const year = new Date().getFullYear();
  const email = getEmail("sales");

  return (
    <footer className="theme-dark border-t border-white/[0.08] bg-ink-950 text-sm">
      <Container width="wide" className="grid gap-12 py-16 sm:py-20 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4">
          <Link href={routes.home} className="-m-1.5 inline-block rounded-md p-1.5">
            <PssLogo sizes="140px" className="h-8" />
          </Link>
          <p className="mt-6 max-w-sm leading-relaxed text-muted-foreground">{company.positioning}</p>
          {companySocialLinks.length > 0 ? (
            <ul className="mt-6 flex flex-wrap gap-4" aria-label="Social media">
              {companySocialLinks.map((link) => (
                <li key={link.url}>
                  <a href={link.url} rel="me noopener" className={linkClass}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-10 lg:col-span-8 lg:grid-cols-[1fr_1.1fr_1.6fr] lg:gap-8">
          {footerColumns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className={headingClass}>{column.title}</h2>
              <ul className="mt-5 space-y-3">
                {column.items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className={linkClass}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="col-span-2 md:col-span-1">
            <h2 className={headingClass}>Get in touch</h2>
            <address className="mt-5 space-y-3 not-italic">
              <p>
                <a href={`tel:${contactDetails.phone.e164}`} className={linkClass}>
                  {contactDetails.phone.display}
                </a>
              </p>
              <p className="wrap-anywhere">
                <a href={`mailto:${email}`} className={linkClass}>
                  {email}
                </a>
              </p>
              <p className="text-muted-foreground">{contactDetails.address.countryName}</p>
            </address>
          </div>
        </div>
      </Container>

      <div className="border-t border-white/[0.06]">
        <Container width="wide" className="flex flex-col gap-2 py-6 text-muted-foreground sm:flex-row sm:justify-between">
          <p>
            © {year} {company.legalName}. All rights reserved.
          </p>
          <p>Custom software, built in South Africa.</p>
        </Container>
      </div>
    </footer>
  );
}
