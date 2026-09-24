import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { testimonialsSection } from "@/data/home";
import { getPublishedTestimonials } from "@/data/testimonials";
import { cn } from "@/lib/utils";
import type { Testimonial } from "@/types/content";

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <figure className="flex h-full flex-col justify-between rounded-[1.25rem] border border-foreground/8 bg-white p-7 shadow-[0_24px_50px_-36px_rgb(3_10_22/0.35)] sm:p-8">
      <blockquote className="text-lg leading-relaxed text-foreground">
        <span aria-hidden="true" className="mb-6 block h-0.5 w-10 rounded-full bg-accent" />
        <p>{testimonial.quote}</p>
      </blockquote>
      <figcaption className="mt-8 border-t border-foreground/8 pt-5">
        <span className="block font-bold text-foreground">{testimonial.authorName}</span>
        <span className="block text-sm text-muted-foreground">
          {[testimonial.authorRole, testimonial.company].filter(Boolean).join(", ")}
        </span>
        {testimonial.context ? (
          <span className="mt-2 block font-mono text-[0.6875rem] tracking-[0.16em] text-accent uppercase">
            {testimonial.context}
          </span>
        ) : null}
      </figcaption>
    </figure>
  );
}

/**
 * Client testimonials: three per view on desktop, scroll-snap for more.
 * Renders nothing until an approved, attributed quote exists (none today).
 */
export function Testimonials({ className }: { className?: string }) {
  const testimonials = getPublishedTestimonials();
  if (testimonials.length === 0) return null;
  const scrollable = testimonials.length > 3;

  return (
    <section aria-labelledby="testimonials-heading" className={cn("bg-white py-24 sm:py-28 lg:py-32", className)}>
      <Container width="wide">
        <SectionHeading
          id="testimonials-heading"
          eyebrow={testimonialsSection.eyebrow}
          title={testimonialsSection.title}
          className="reveal"
        />
        <ul
          className={cn(
            "reveal mt-14 flex gap-6 lg:gap-8",
            scrollable
              ? "-mx-4 snap-x snap-mandatory overflow-x-auto scroll-px-4 px-4 pb-4 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:-mx-8 lg:scroll-px-8 lg:px-8"
              : "flex-col md:flex-row",
          )}
          {...(scrollable ? { tabIndex: 0, "aria-label": "Client testimonials (scrolls horizontally)" } : {})}
        >
          {testimonials.map((testimonial) => (
            <li
              key={testimonial.id}
              className={cn(
                scrollable
                  ? "w-[85%] shrink-0 snap-start sm:w-[60%] lg:w-[calc((100%-4rem)/3)]"
                  : "md:flex-1",
              )}
            >
              <TestimonialCard testimonial={testimonial} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
