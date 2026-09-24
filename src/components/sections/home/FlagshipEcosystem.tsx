import { ArrowRight } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { EcosystemMap } from "@/components/portfolio/EcosystemMap";
import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { HeadingContent } from "@/components/ui/SectionHeading";
import { TextLink } from "@/components/ui/TextLink";
import { routes } from "@/config/routes";
import { flagshipSection } from "@/data/home";
import { getFlagshipProject } from "@/lib/projects";

/**
 * Flagship case study (ZansiHustle): one business vision presented as a
 * connected product ecosystem rather than separate cards.
 */
export function FlagshipEcosystem() {
  const project = getFlagshipProject();
  if (!project?.ecosystem) return null;

  const caseStudy = routes.project(project.slug);

  return (
    <section aria-labelledby="flagship-heading" className="theme-dark relative isolate overflow-hidden bg-ink-950 py-24 sm:py-28 lg:py-36">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(60%_55%_at_50%_58%,rgb(12_157_222/0.16),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(40%_40%_at_90%_0%,rgb(22_127_197/0.16),transparent_70%)]" />
        <div className="absolute inset-0 bg-tech-grid [mask-image:radial-gradient(ellipse_70%_60%_at_50%_60%,black_20%,transparent_80%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-cyan/30 to-transparent" />
      </div>

      <Container width="wide">
        <div className="reveal grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-12">
          <div className="lg:col-span-8">
            <Eyebrow className="mb-6">{flagshipSection.eyebrow}</Eyebrow>
            <h2 id="flagship-heading" className="text-display-2 text-foreground">
              <HeadingContent text={flagshipSection.headline} />
            </h2>
          </div>
          <div className="lg:col-span-4">
            <p className="text-lg leading-relaxed text-muted-foreground">{project.description[0]}</p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-7 sm:gap-y-5">
              <ButtonLink href={`${caseStudy}#ecosystem`} size="lg">
                {flagshipSection.primaryCta}
                <ArrowRight aria-hidden="true" className="size-4" />
              </ButtonLink>
              <TextLink href={caseStudy}>{flagshipSection.secondaryCta}</TextLink>
            </div>
          </div>
        </div>

        <div className="reveal mt-16 lg:mt-24">
          <EcosystemMap ecosystem={project.ecosystem} />
        </div>
      </Container>
    </section>
  );
}
