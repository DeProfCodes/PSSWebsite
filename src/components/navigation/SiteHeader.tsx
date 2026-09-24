import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { PssLogo } from "@/components/brand/PssLogo";
import { Container } from "@/components/layout/Container";
import { HeaderFrame } from "@/components/navigation/HeaderFrame";
import { MobileNav } from "@/components/navigation/MobileNav";
import { NavLink } from "@/components/navigation/NavLink";
import { ButtonLink } from "@/components/ui/Button";
import { routes } from "@/config/routes";
import { headerCta, primaryNavigation } from "@/data/navigation";

/**
 * Global navigation (approved design): logo left, five links, one CTA.
 * Desktop from `lg`; below that a compact bar with the mobile menu.
 * The active page gets aria-current="page", styled as a cyan underline.
 */
export function SiteHeader() {
  return (
    <HeaderFrame>
      <Container width="wide" className="flex h-(--header-height) items-center justify-between gap-6">
        <Link href={routes.home} className="-m-1.5 shrink-0 rounded-md p-1.5">
          <PssLogo preload sizes="150px" className="h-7 lg:h-8" />
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1 xl:gap-2">
            {primaryNavigation.map((item) => (
              <li key={item.href}>
                {/* 40px link in a 72px bar: the underline sits 16px below it, on the header's bottom edge. */}
                <NavLink
                  href={item.href}
                  className="relative inline-flex h-10 items-center rounded-md px-3.5 text-[0.9375rem] font-medium text-muted-foreground transition-colors duration-200 after:absolute after:inset-x-3.5 after:-bottom-4 after:h-0.5 after:origin-center after:scale-x-0 after:rounded-full after:bg-brand-cyan after:transition-transform after:duration-300 hover:text-foreground hover:after:scale-x-50 hover:after:opacity-60 aria-[current=page]:text-foreground aria-[current=page]:after:scale-x-100 aria-[current=page]:after:opacity-100 xl:px-4 xl:after:inset-x-4"
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          {/* Visibility is set on a wrapper: the button's own `inline-flex` would override `hidden`. */}
          <div className="hidden lg:block">
            <ButtonLink href={headerCta.href} size="md" className="px-5">
              {headerCta.label}
              <ArrowRight aria-hidden="true" className="size-4" />
            </ButtonLink>
          </div>
          <MobileNav items={primaryNavigation} cta={headerCta} />
        </div>
      </Container>
    </HeaderFrame>
  );
}
