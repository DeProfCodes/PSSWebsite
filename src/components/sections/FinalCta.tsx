import { ArrowRight } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { HeadingContent } from "@/components/ui/SectionHeading";
import { contactDetails, getEmail } from "@/data/contact";
import { finalCtaSection } from "@/data/home";

/**
 * Closing call to action, shared by every page. Visually reconnects to the
 * hero: the same ink, grid and restrained bloom.
 */
export function FinalCta() {
  const email = getEmail("sales");
  return (
    <section aria-labelledby="final-cta-heading" className="theme-dark relative isolate overflow-hidden bg-ink-950 py-24 sm:py-32 lg:py-40">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(50%_65%_at_50%_100%,rgb(12_157_222/0.24),transparent_70%)]" />
        <div className="absolute inset-0 bg-tech-grid [mask-image:radial-gradient(ellipse_60%_70%_at_50%_70%,black_25%,transparent_80%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-cyan/25 to-transparent" />
        <div className="absolute bottom-0 left-1/2 h-40 w-px -translate-x-1/2 bg-gradient-to-t from-brand-cyan/45 to-transparent" />
      </div>

      <Container width="narrow" className="reveal text-center">
        <Eyebrow className="justify-center">{finalCtaSection.eyebrow}</Eyebrow>
        <h2 id="final-cta-heading" className="mt-6 text-display-2 text-foreground">
          <HeadingContent text={finalCtaSection.headline} />
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
          {finalCtaSection.body}
        </p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href={finalCtaSection.primaryCta.href} size="xl" className="w-full sm:w-auto">
            {finalCtaSection.primaryCta.label}
            <ArrowRight aria-hidden="true" className="size-[18px]" />
          </ButtonLink>
          <ButtonLink
            href={finalCtaSection.secondaryCta.href}
            variant="secondary"
            size="xl"
            className="w-full border-white/20 bg-white/[0.03] hover:border-white/40 sm:w-auto"
          >
            {finalCtaSection.secondaryCta.label}
          </ButtonLink>
        </div>
        <p className="mt-10 flex flex-col items-center gap-1 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-2">
          <span>Prefer email or a call?</span>
          <a href={`mailto:${email}`} className="font-medium text-foreground underline-offset-4 hover:underline">
            {email}
          </a>
          <span aria-hidden="true" className="hidden px-1 text-white/25 sm:inline">
            ·
          </span>
          <a href={`tel:${contactDetails.phone.e164}`} className="font-medium whitespace-nowrap text-foreground underline-offset-4 hover:underline">
            {contactDetails.phone.display}
          </a>
        </p>
      </Container>
    </section>
  );
}
