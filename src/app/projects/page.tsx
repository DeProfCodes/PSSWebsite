import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";
import { ProjectCard } from "@/components/portfolio/ProjectCard";
import { WorkFilters } from "@/components/portfolio/WorkFilters";
import { FinalCta } from "@/components/sections/FinalCta";
import { routes } from "@/config/routes";
import { pageSeo } from "@/data/seo";
import { getProjectFilterKeys, getWorkFilters, getWorkProjects } from "@/lib/projects";
import { buildPageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const metadata = buildPageMetadata({
  title: pageSeo.projects.title,
  description: pageSeo.projects.description,
  path: routes.projects,
});

const GRID_ID = "work-grid";

/** Work — a curated library of case studies (flagship → selected → additional). */
export default function WorkPage() {
  const projects = getWorkProjects();
  const filters = getWorkFilters(projects);

  return (
    <>
      <PageHero
        eyebrow="Work"
        title="Selected Work."
        lead="A look at some of the platforms, applications and business systems we've helped bring to life."
      />

      <section aria-label="Projects" className="bg-canvas py-16 sm:py-20 lg:py-24">
        <Container width="wide">
          {filters.length > 2 ? <WorkFilters filters={filters} gridId={GRID_ID} /> : null}

          <ul id={GRID_ID} className="mt-14 grid gap-x-10 gap-y-20 md:grid-cols-2 lg:gap-x-14 lg:gap-y-24">
            {projects.map((project, index) => {
              const feature = Boolean(project.flagship) || index === 0;
              return (
                <li
                  key={project.id}
                  data-filters={getProjectFilterKeys(project).join(" ")}
                  className={cn("reveal", feature && "md:col-span-2")}
                >
                  <ProjectCard
                    project={project}
                    layout={feature ? "feature" : "standard"}
                    headingLevel="h2"
                    preload={index === 0}
                  />
                </li>
              );
            })}
          </ul>

          <p className="mt-24 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Projects are shown with our clients&apos; permission. Some work isn&apos;t shown here for confidentiality
            reasons.
          </p>
        </Container>
      </section>

      <FinalCta />
    </>
  );
}
