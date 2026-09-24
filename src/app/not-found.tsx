import { PageHero } from "@/components/layout/PageHero";
import { ButtonLink } from "@/components/ui/Button";
import { routes } from "@/config/routes";

/**
 * 404 page (the legacy site returned an empty body). Next.js adds
 * <meta name="robots" content="noindex"> automatically for 404 responses.
 */
export default function NotFound() {
  return (
    <PageHero
      eyebrow="404"
      title={{ lead: "This page", emphasis: "doesn't exist." }}
      lead="It may have moved when we rebuilt the site. Start from the home page, or see the work we've done."
      className="min-h-[70vh]"
    >
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href={routes.home} size="xl" className="w-full sm:w-auto">
          Go to the home page
        </ButtonLink>
        <ButtonLink
          href={routes.projects}
          variant="secondary"
          size="xl"
          className="w-full border-white/20 bg-white/[0.03] hover:border-white/40 sm:w-auto"
        >
          View our work
        </ButtonLink>
      </div>
    </PageHero>
  );
}
