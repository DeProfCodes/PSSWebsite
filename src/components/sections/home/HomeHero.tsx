import {
  ArrowRight,
  Building2,
  Globe,
  LifeBuoy,
  Network,
  PenTool,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import { Fragment } from "react";

import { Container } from "@/components/layout/Container";
import { HeroArchitecture } from "@/components/sections/home/HeroArchitecture";
import { ButtonLink } from "@/components/ui/Button";
import { homeHero, type HeroCapability } from "@/data/home";

const capabilityIcons: Record<HeroCapability["icon"], LucideIcon> = {
  web: Globe,
  mobile: Smartphone,
  systems: Building2,
  integrations: Network,
  design: PenTool,
  support: LifeBuoy,
};

/** Layered dark backdrop: deep navy, two restrained blooms, a fading technical grid. */
function HeroBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-ink-950">
      <div className="absolute inset-0 bg-[radial-gradient(55%_60%_at_78%_38%,rgb(12_157_222/0.20),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(45%_50%_at_8%_95%,rgb(22_127_197/0.14),transparent_70%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgb(120_170_255/0.06)_1px,transparent_1px),linear-gradient(90deg,rgb(120_170_255/0.06)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_80%_70%_at_62%_40%,black_30%,transparent_78%)]" />
      {/* Hairline beam behind the architecture visual */}
      <div className="absolute top-0 bottom-0 left-[72%] hidden w-px bg-[linear-gradient(to_bottom,transparent,rgb(49_191_255/0.22)_35%,rgb(49_191_255/0.08)_70%,transparent)] lg:block" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(to_bottom,transparent,var(--ink-950))]" />
    </div>
  );
}

/**
 * Home hero (approved direction, 2026-09-23). Sits under the sticky header:
 * the section is pulled up by the header height so the transparent header
 * floats over it. Content: src/data/home.ts.
 */
export function HomeHero() {
  const { eyebrow, headline, description, primaryCta, secondaryCta, capabilities, capabilitiesLabel } = homeHero;

  return (
    <section
      aria-labelledby="hero-heading"
      className="theme-dark relative isolate mt-[calc(var(--header-height)*-1)] overflow-hidden pt-(--header-height)"
    >
      <HeroBackdrop />

      <Container width="wide">
        <div className="grid items-center gap-12 pt-12 pb-4 sm:gap-14 sm:pt-16 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)] lg:gap-8 lg:pt-20 xl:gap-14 xl:pt-24">
          {/* Container query: the headline is sized from this column's width, so its two lines never re-wrap. */}
          <div className="@container">
            <p className="flex flex-wrap items-center gap-x-2 gap-y-2 font-mono text-[0.8125rem] font-medium tracking-[0.12em] text-accent uppercase sm:gap-x-3 sm:tracking-[0.28em]">
              <span aria-hidden="true" className="hidden h-px w-8 bg-accent/60 sm:block" />
              {eyebrow.map((word, index) => (
                <Fragment key={word}>
                  {index > 0 ? (
                    <>
                      <span aria-hidden="true" className="text-white/25">
                        /
                      </span>
                      <span className="sr-only">, </span>
                    </>
                  ) : null}
                  <span>{word}</span>
                </Fragment>
              ))}
            </p>

            <h1
              id="hero-heading"
              className="mt-6 text-[clamp(2.25rem,9.6cqi,5rem)] leading-[1.04] font-extrabold tracking-[-0.025em]"
            >
              <span className="block">{headline.lead}</span>
              <span className="block bg-[linear-gradient(95deg,var(--brand-cyan)_0%,var(--brand-azure)_55%,#2f8fe4_100%)] bg-clip-text pb-[0.06em] text-transparent forced-colors:bg-none forced-colors:text-[CanvasText]">
                {headline.emphasis}
              </span>
            </h1>

            <p className="mt-6 max-w-[34rem] text-lg leading-relaxed text-muted-foreground sm:text-xl sm:leading-relaxed">
              {description}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <ButtonLink href={primaryCta.href} size="xl" className="w-full sm:w-auto">
                {primaryCta.label}
                <ArrowRight aria-hidden="true" className="size-[18px]" />
              </ButtonLink>
              <ButtonLink
                href={secondaryCta.href}
                variant="secondary"
                size="xl"
                className="w-full border-white/20 bg-white/[0.03] hover:border-white/40 sm:w-auto"
              >
                {secondaryCta.label}
              </ButtonLink>
            </div>
          </div>

          <HeroArchitecture />
        </div>

        <div className="mt-12 border-t border-border pt-7 pb-10 sm:mt-14 lg:mt-12 lg:pb-12">
          <h2 className="sr-only">{capabilitiesLabel}</h2>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3 lg:grid-cols-6 lg:gap-x-6">
            {capabilities.map((capability) => {
              const Icon = capabilityIcons[capability.icon];
              return (
                <li key={capability.label} className="flex items-center gap-3 text-sm font-medium text-foreground/85">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-brand-cyan">
                    <Icon aria-hidden="true" className="size-[18px]" strokeWidth={1.75} />
                  </span>
                  {capability.label}
                </li>
              );
            })}
          </ul>
        </div>
      </Container>
    </section>
  );
}
