import { Container } from "@/components/layout/Container";
import { credibilityHighlights, type CredibilityItem } from "@/data/home";
import { cn } from "@/lib/utils";

function Headline({ item }: { item: CredibilityItem }) {
  if (!item.highlight || !item.headline.includes(item.highlight)) return <>{item.headline}</>;
  const [before, after] = item.headline.split(item.highlight, 2);
  return (
    <>
      {before}
      <span className="text-accent">{item.highlight}</span>
      {after}
    </>
  );
}

/**
 * Credibility band directly beneath the hero. Only verifiable, PSS-approved
 * facts (src/data/home.ts ← src/data/company.ts) — no satisfaction scores,
 * no placeholder partner logos.
 */
export function CredibilityBand() {
  return (
    <section aria-label="Company highlights" className="theme-dark border-y border-border bg-ink-900">
      <Container width="wide">
        <dl className="grid grid-cols-2 lg:grid-cols-4">
          {credibilityHighlights.map((item, index) => (
            <div
              key={item.id}
              className={cn(
                // Mobile/tablet: 2×2 grid. Desktop: one row with vertical dividers.
                "py-6 pr-4 sm:py-8 lg:pr-8",
                index % 2 === 1 && "border-l border-border pl-4 sm:pl-6 lg:pl-8",
                index >= 2 && "border-t border-border lg:border-t-0",
                index === 2 && "lg:border-l lg:pl-8",
                index === credibilityHighlights.length - 1 && "lg:pr-0",
              )}
            >
              <dt className="text-lg leading-snug font-bold tracking-tight text-foreground sm:text-xl xl:text-2xl">
                <Headline item={item} />
              </dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-balance text-muted-foreground">
                {/* Keep each "•" with the word before it, so lines break after a bullet, never before. */}
                {item.detail.replaceAll(" • ", " • ")}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
