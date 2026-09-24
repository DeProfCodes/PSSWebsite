import { Mail, MapPin, Phone } from "lucide-react";
import { Suspense } from "react";

import { ContactForm, ContactFormWithTopic } from "@/components/contact/ContactForm";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";
import { routes } from "@/config/routes";
import { contactDetails, getEmail } from "@/data/contact";
import { pageSeo } from "@/data/seo";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: pageSeo.contact.title,
  description: pageSeo.contact.description,
  path: routes.contact,
});

const nextSteps = [
  "We read your message and get back to you.",
  "We talk through what you need and any constraints.",
  "You get a clear recommendation for the next step.",
];

/** Contact — a short, welcoming form with direct details alongside. No map. */
export default function ContactPage() {
  const salesEmail = getEmail("sales");
  const generalEmail = getEmail("general");

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={{ lead: "Tell Us What", emphasis: "You're Building." }}
        lead="Whether you're starting something new or improving an existing system, tell us what you need and we'll help you work out the next step."
      />

      <section aria-label="Contact form and details" className="bg-canvas py-16 sm:py-20 lg:py-24">
        <Container width="wide" className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="relative rounded-[1.5rem] border border-foreground/8 bg-white p-6 shadow-[0_30px_70px_-45px_rgb(3_10_22/0.45)] sm:p-10 lg:col-span-7">
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground">Send us a message</h2>
            <p className="mt-2 mb-8 text-muted-foreground">A few details are enough to get started.</p>
            <Suspense fallback={<ContactForm />}>
              <ContactFormWithTopic />
            </Suspense>
          </div>

          <aside aria-label="Direct contact details" className="space-y-10 lg:col-span-5 lg:pt-4">
            <div>
              <h2 className="font-mono text-xs tracking-[0.2em] text-accent uppercase">Prefer to reach out directly?</h2>
              <ul className="mt-6 space-y-5">
                <li className="flex gap-4">
                  <Mail aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-accent" strokeWidth={1.75} />
                  <div className="min-w-0">
                    <a href={`mailto:${salesEmail}`} className="block text-[0.9375rem] font-semibold wrap-anywhere text-foreground hover:text-accent sm:text-base">
                      {salesEmail}
                    </a>
                    <a href={`mailto:${generalEmail}`} className="mt-1 block text-sm wrap-anywhere text-muted-foreground hover:text-accent">
                      {generalEmail}
                    </a>
                  </div>
                </li>
                <li className="flex gap-4">
                  <Phone aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-accent" strokeWidth={1.75} />
                  <a href={`tel:${contactDetails.phone.e164}`} className="font-semibold text-foreground hover:text-accent">
                    {contactDetails.phone.display}
                  </a>
                </li>
                <li className="flex gap-4">
                  <MapPin aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-accent" strokeWidth={1.75} />
                  <p className="text-foreground">
                    <span className="font-semibold">{contactDetails.address.countryName}</span>
                    <span className="block text-sm text-muted-foreground">We work with clients remotely.</span>
                  </p>
                </li>
              </ul>
            </div>

            <div className="border-t border-foreground/10 pt-10">
              <h2 className="font-mono text-xs tracking-[0.2em] text-accent uppercase">What happens next</h2>
              <ol className="mt-6 space-y-5">
                {nextSteps.map((step, index) => (
                  <li key={step} className="flex gap-4">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full border border-brand-deep/25 bg-white font-mono text-xs text-accent">
                      {index + 1}
                    </span>
                    <p className="pt-1 leading-relaxed text-foreground/85">{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </Container>
      </section>
    </>
  );
}
