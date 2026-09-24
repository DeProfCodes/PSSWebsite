import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { ServiceIcon } from "@/components/icons/ServiceIcon";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TextLink } from "@/components/ui/TextLink";
import { routes } from "@/config/routes";
import { whatWeBuildSection } from "@/data/home";
import { homeCapabilities } from "@/data/services";

/** Capabilities as an editorial index: statement on the left, a linked list on the right. */
export function WhatWeBuild() {
  return (
    <section aria-labelledby="what-we-build-heading" className="theme-dark relative isolate overflow-hidden bg-ink-950 py-24 sm:py-28 lg:py-36">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(45%_60%_at_0%_30%,rgb(22_127_197/0.14),transparent_70%)]" />
      <Container width="wide" className="grid gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="reveal lg:col-span-5">
          <div className="lg:sticky lg:top-[calc(var(--header-height)+3rem)]">
            <SectionHeading id="what-we-build-heading" eyebrow={whatWeBuildSection.eyebrow} title={whatWeBuildSection.headline} />
            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">{whatWeBuildSection.statement}</p>
            <TextLink href={whatWeBuildSection.cta.href} className="mt-8">
              {whatWeBuildSection.cta.label}
            </TextLink>
          </div>
        </div>

        <ul className="reveal border-y border-border lg:col-span-7" role="list">
          {homeCapabilities.map((capability) => (
            <li key={capability.anchor} className="border-b border-border last:border-b-0">
              <Link
                href={`${routes.services}#${capability.anchor}`}
                className="group grid grid-cols-[auto_1fr_auto] items-start gap-5 rounded-lg px-1 py-6 transition-colors duration-300 hover:bg-white/[0.025] sm:gap-6 sm:px-3 sm:py-7"
              >
                <span className="grid size-11 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-brand-cyan transition-colors duration-300 group-hover:border-brand-cyan/40">
                  <ServiceIcon icon={capability.icon} className="size-5" />
                </span>
                <span>
                  <span className="block text-lg font-bold tracking-tight text-foreground sm:text-xl">{capability.name}</span>
                  <span className="mt-1 block leading-relaxed text-muted-foreground">{capability.line}</span>
                </span>
                <ArrowUpRight
                  aria-hidden="true"
                  className="mt-1 size-5 text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-cyan"
                />
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
