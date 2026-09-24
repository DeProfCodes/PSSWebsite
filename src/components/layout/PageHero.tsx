import type { ReactNode } from "react";

import { Container } from "@/components/layout/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { HeadingContent, type HeadingText } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";

interface PageHeroProps {
  eyebrow?: string;
  title: HeadingText;
  lead?: ReactNode;
  /** Above the eyebrow, e.g. <Breadcrumbs />. */
  breadcrumbs?: ReactNode;
  /** Below the lead: CTAs, meta rows… */
  children?: ReactNode;
  /** Extra bottom space when the next element overlaps the hero (case-study cover). */
  overlap?: boolean;
  className?: string;
}

/**
 * Inner-page hero in the home hero's language: ink, bloom, technical grid,
 * large confident type. Pulled up under the transparent sticky header.
 */
export function PageHero({ eyebrow, title, lead, breadcrumbs, children, overlap = false, className }: PageHeroProps) {
  return (
    <section
      className={cn(
        "theme-dark relative isolate mt-[calc(var(--header-height)*-1)] overflow-hidden bg-ink-950 pt-(--header-height)",
        className,
      )}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(55%_70%_at_85%_20%,rgb(12_157_222/0.2),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(40%_50%_at_5%_100%,rgb(22_127_197/0.12),transparent_70%)]" />
        <div className="absolute inset-0 bg-tech-grid [mask-image:radial-gradient(ellipse_80%_75%_at_65%_30%,black_30%,transparent_80%)]" />
      </div>
      <Container width="wide" className={cn("pt-14 sm:pt-20 lg:pt-24", overlap ? "pb-44 sm:pb-56" : "pb-16 sm:pb-20 lg:pb-24")}>
        {breadcrumbs ? <div className="mb-8">{breadcrumbs}</div> : null}
        {eyebrow ? <Eyebrow className="mb-6">{eyebrow}</Eyebrow> : null}
        <h1 className="max-w-5xl text-[clamp(2.375rem,1.3rem+4.2vw,4.5rem)] leading-[1.04] font-extrabold tracking-[-0.03em] text-balance text-foreground">
          <HeadingContent text={title} />
        </h1>
        {lead ? (
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl sm:leading-relaxed">{lead}</p>
        ) : null}
        {children}
      </Container>
    </section>
  );
}
