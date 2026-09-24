import type { Testimonial } from "@/types/content";

/**
 * Client testimonials.
 *
 * None exist yet: nothing was on the legacy site and no quotes have been
 * supplied, so the section is not rendered. Never write or paraphrase a quote.
 *
 * To publish one, add an entry with the client's exact wording, the author's
 * name (and optionally role), and set `approvedForPublication: true` only once
 * the client has approved it. The Home section appears automatically.
 */
export const testimonials: Testimonial[] = [];

export function isPublishableTestimonial(testimonial: Testimonial): boolean {
  return Boolean(testimonial.approvedForPublication && testimonial.quote && testimonial.authorName);
}

export function getPublishedTestimonials(): Testimonial[] {
  return testimonials.filter(isPublishableTestimonial);
}
