import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { whyPssSection } from "@/data/home";
import { cn } from "@/lib/utils";

/** How the working relationship differs — editorial, no cards, no superlatives. */
export function WhyPss() {
  return (
    <section aria-labelledby="why-pss-heading" className="theme-dark relative isolate overflow-hidden bg-ink-900 py-24 sm:py-28 lg:py-36">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-tech-grid opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent_75%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(40%_50%_at_85%_10%,rgb(12_157_222/0.14),transparent_70%)]" />
      </div>
      <Container width="wide">
        <SectionHeading id="why-pss-heading" eyebrow={whyPssSection.eyebrow} title={whyPssSection.headline} className="reveal max-w-3xl" />

        <ul className="reveal mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:mt-20 lg:grid-cols-6">
          {whyPssSection.items.map((item, index) => (
            <li
              key={item.title}
              className={cn("border-t border-border pt-7", index < 3 ? "lg:col-span-2" : "lg:col-span-3")}
            >
              <p className="font-mono text-xs tracking-[0.2em] text-accent">/{String(index + 1).padStart(2, "0")}</p>
              <h3 className="mt-4 text-xl font-bold tracking-tight text-foreground sm:text-2xl">{item.title}</h3>
              <p className="mt-3 max-w-md leading-relaxed text-muted-foreground">{item.body}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
