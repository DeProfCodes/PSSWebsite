import { ArrowUpRight } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";
import { FinalCta } from "@/components/sections/FinalCta";
import { CredibilityBand } from "@/components/sections/home/CredibilityBand";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { routes } from "@/config/routes";
import { aboutPage } from "@/data/about";
import { company } from "@/data/company";
import { pageSeo } from "@/data/seo";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: pageSeo.about.title,
  description: pageSeo.about.description,
  path: routes.about,
});

/** About — the company story first; the founder as supporting credibility. */
export default function AboutPage() {
  const { hero, story, beliefs, direction, founder } = aboutPage;
  const founderLinkedIn = company.founder.links.find((link) => link.platform === "linkedin");

  return (
    <>
      <PageHero eyebrow={hero.eyebrow} title={hero.headline} lead={hero.lead} />
      <CredibilityBand />

      {/* Story */}
      <section aria-labelledby="story-heading" className="bg-white py-24 sm:py-28 lg:py-36">
        <Container width="wide" className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="reveal lg:col-span-5">
            <Eyebrow>{story.eyebrow}</Eyebrow>
            <h2 id="story-heading" className="mt-6 text-display-3 text-foreground">
              {story.statement}
            </h2>
          </div>
          <div className="reveal space-y-6 text-lg leading-relaxed text-foreground/80 lg:col-span-6 lg:col-start-7 lg:pt-12">
            {story.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </div>
        </Container>
      </section>

      {/* What we believe */}
      <section aria-labelledby="beliefs-heading" className="theme-dark relative isolate overflow-hidden bg-ink-950 py-24 sm:py-28 lg:py-36">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(45%_55%_at_100%_0%,rgb(12_157_222/0.14),transparent_70%)]" />
        <Container width="wide">
          <SectionHeading id="beliefs-heading" eyebrow={beliefs.eyebrow} title={beliefs.title} className="reveal" />
          <ol className="mt-16 border-t border-border lg:mt-20">
            {beliefs.items.map((item, index) => (
              <li
                key={item.statement}
                className="reveal grid gap-4 border-b border-border py-9 sm:py-11 lg:grid-cols-12 lg:items-baseline lg:gap-10"
              >
                <span className="font-mono text-sm text-accent lg:col-span-1">{String(index + 1).padStart(2, "0")}</span>
                <p className="text-2xl leading-snug font-bold tracking-[-0.02em] text-foreground sm:text-3xl lg:col-span-6">
                  {item.statement}
                </p>
                <p className="leading-relaxed text-muted-foreground lg:col-span-5">{item.detail}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Direction */}
      <section aria-labelledby="direction-heading" className="bg-canvas-blue py-24 sm:py-28 lg:py-36">
        <Container width="wide" className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="reveal lg:col-span-5">
            <SectionHeading id="direction-heading" eyebrow={direction.eyebrow} title={direction.title} />
          </div>
          <div className="reveal space-y-6 text-lg leading-relaxed text-foreground/80 lg:col-span-6 lg:col-start-7 lg:pt-12">
            {direction.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </div>
        </Container>
      </section>

      {/* Founder */}
      <section aria-labelledby="founder-heading" className="bg-white py-24 sm:py-28">
        <Container width="wide">
          <div className="reveal">
            <div className="max-w-2xl">
              <Eyebrow>{founder.eyebrow}</Eyebrow>
              <h2 id="founder-heading" className="mt-5 text-display-3 text-foreground">
                {founder.title}
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-foreground/80">{founder.paragraph}</p>
              <p className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                <span className="font-semibold text-foreground">
                  {company.founder.name}
                  <span className="font-normal text-muted-foreground"> · {company.founder.role}</span>
                </span>
                {founderLinkedIn ? (
                  <a
                    href={founderLinkedIn.url}
                    rel="noopener"
                    className="inline-flex items-center gap-1.5 font-semibold text-accent hover:text-foreground"
                  >
                    LinkedIn <ArrowUpRight aria-hidden="true" className="size-4" />
                  </a>
                ) : null}
              </p>
            </div>
          </div>
        </Container>
      </section>

      <FinalCta />
    </>
  );
}
