import { ArrowRight, Check } from "lucide-react";

import { ServiceIcon } from "@/components/icons/ServiceIcon";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";
import { FinalCta } from "@/components/sections/FinalCta";
import { HowWeWork } from "@/components/sections/HowWeWork";
import { ButtonLink } from "@/components/ui/Button";
import { routes } from "@/config/routes";
import { consultationHref } from "@/data/home";
import { pageSeo } from "@/data/seo";
import { serviceGroups } from "@/data/services";
import { buildPageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";
import type { ServiceGroup } from "@/types/content";

export const metadata = buildPageMetadata({
  title: pageSeo.services.title,
  description: pageSeo.services.description,
  path: routes.services,
});

/** Alternating surfaces so the page reads as distinct chapters, not a long list. */
const groupSurface: Record<ServiceGroup["id"], string> = {
  build: "bg-white",
  connect: "theme-dark bg-ink-950",
  improve: "bg-canvas-blue",
  design: "theme-dark bg-ink-900",
};

function ServiceGroupSection({ group, index }: { group: ServiceGroup; index: number }) {
  return (
    <section
      id={group.id}
      aria-labelledby={`${group.id}-heading`}
      className={cn("scroll-mt-[var(--header-height)] py-24 sm:py-28 lg:py-32", groupSurface[group.id])}
    >
      <Container width="wide" className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="reveal lg:col-span-4">
          <div className="lg:sticky lg:top-[calc(var(--header-height)+3rem)]">
            <p className="font-mono text-[0.8125rem] font-medium tracking-[0.2em] text-accent uppercase">
              {String(index + 1).padStart(2, "0")} — {group.label}
            </p>
            <h2 id={`${group.id}-heading`} className="mt-5 text-display-3 text-foreground">
              {group.title}
            </h2>
            <p className="mt-4 max-w-sm text-lg leading-relaxed text-muted-foreground">{group.intro}</p>
          </div>
        </div>

        <div className="lg:col-span-8">
          {group.services.map((service) => (
            <article
              key={service.id}
              id={service.slug}
              aria-labelledby={`${service.slug}-heading`}
              className="reveal scroll-mt-[calc(var(--header-height)+2rem)] border-t border-border py-10 first:border-t-0 first:pt-0 sm:py-12"
            >
              {/* Phones: icon beside the heading, summary full width. Larger: summary aligned under the heading. */}
              <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-5 sm:items-start">
                <span className="grid size-12 shrink-0 place-items-center rounded-xl border border-foreground/10 bg-foreground/[0.03] text-accent">
                  <ServiceIcon icon={service.icon} className="size-[22px]" />
                </span>
                <h3 id={`${service.slug}-heading`} className="text-2xl font-extrabold tracking-[-0.02em] text-foreground sm:text-[1.75rem]">
                  {service.name}
                </h3>
                <p className="col-span-2 mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:col-span-1 sm:col-start-2 sm:mt-3">
                  {service.summary}
                </p>
              </div>

              <div className="mt-8 grid gap-8 sm:grid-cols-2 sm:pl-[4.25rem]">
                <div>
                  <p className="font-mono text-xs tracking-[0.18em] text-accent uppercase">Useful for</p>
                  <p className="mt-3 leading-relaxed text-foreground/90">{service.usefulFor}</p>
                </div>
                <div>
                  <p className="font-mono text-xs tracking-[0.18em] text-accent uppercase">What we deliver</p>
                  <ul className="mt-3 space-y-2.5">
                    {service.deliverables.map((item) => (
                      <li key={item} className="flex gap-3 leading-snug text-foreground/90">
                        <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent" strokeWidth={2.25} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title={{ lead: "Software Services Built", emphasis: "Around What You Need." }}
        lead="From a first product release to the systems your business already depends on — we design, build, connect and support software end to end."
      >
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href={routes.contact} size="xl" className="w-full sm:w-auto">
            Start a Project
            <ArrowRight aria-hidden="true" className="size-[18px]" />
          </ButtonLink>
          <ButtonLink
            href={consultationHref}
            variant="secondary"
            size="xl"
            className="w-full border-white/20 bg-white/[0.03] hover:border-white/40 sm:w-auto"
          >
            Book a Consultation
          </ButtonLink>
        </div>

        <nav aria-label="Service groups" className="mt-14 border-t border-border pt-8">
          <ul className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
            {serviceGroups.map((group, index) => (
              <li key={group.id}>
                <a href={`#${group.id}`} className="group block rounded-md">
                  <span className="font-mono text-xs tracking-[0.2em] text-accent">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="mt-1 block text-lg font-bold text-foreground transition-colors group-hover:text-brand-cyan">
                    {group.label}
                  </span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">
                    {group.services.length} {group.services.length === 1 ? "service" : "services"}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </PageHero>

      {serviceGroups.map((group, index) => (
        <ServiceGroupSection key={group.id} group={group} index={index} />
      ))}

      <HowWeWork />
      <FinalCta />
    </>
  );
}
