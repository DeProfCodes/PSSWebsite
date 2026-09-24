import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { howWeWorkSection } from "@/data/home";
import { cn } from "@/lib/utils";

/**
 * Four-step process as a quiet engineering flow: a hairline connects the
 * steps horizontally on desktop and vertically on mobile.
 */
export function HowWeWork({ className }: { className?: string }) {
  const { steps } = howWeWorkSection;
  return (
    <section aria-labelledby="how-we-work-heading" className={cn("bg-canvas-blue py-24 sm:py-28 lg:py-32", className)}>
      <Container width="wide">
        <SectionHeading
          id="how-we-work-heading"
          eyebrow={howWeWorkSection.eyebrow}
          title={howWeWorkSection.title}
          lead={howWeWorkSection.lead}
          className="reveal max-w-3xl"
        />

        <ol className="reveal relative mt-16 grid gap-10 lg:mt-20 lg:grid-cols-4 lg:gap-8">
          {/* Connecting line: horizontal (desktop) through the markers, vertical (mobile) */}
          <span
            aria-hidden="true"
            className="absolute top-2 bottom-2 left-[1.375rem] w-px bg-gradient-to-b from-brand-deep/10 via-brand-deep/35 to-brand-deep/10 lg:top-[1.375rem] lg:right-0 lg:bottom-auto lg:left-0 lg:h-px lg:w-auto lg:bg-gradient-to-r"
          />
          {steps.map((step) => (
            <li key={step.number} className="relative grid grid-cols-[auto_1fr] gap-x-6 lg:block">
              <span className="relative z-10 grid size-11 place-items-center rounded-full border border-brand-deep/25 bg-white font-mono text-sm font-medium text-accent shadow-[0_6px_20px_-8px_rgb(11_114_199/0.45)]">
                {step.number}
              </span>
              <div className="lg:mt-8 lg:pr-6">
                <h3 className="text-xl font-bold tracking-tight text-foreground">{step.title}</h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
