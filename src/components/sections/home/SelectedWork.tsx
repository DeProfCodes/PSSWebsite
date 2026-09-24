import { Container } from "@/components/layout/Container";
import { ProjectCard } from "@/components/portfolio/ProjectCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TextLink } from "@/components/ui/TextLink";
import { routes } from "@/config/routes";
import { selectedWorkSection } from "@/data/home";
import { getFeaturedProjects } from "@/lib/projects";
import type { Project } from "@/types/content";

type Row = { kind: "feature"; project: Project; reverse: boolean } | { kind: "pair"; projects: Project[] };

/**
 * Editorial rhythm, built for 1–6 projects without gaps:
 * feature → pair → feature (reversed) → pair.
 */
function buildRows(projects: Project[]): Row[] {
  const rows: Row[] = [];
  let index = 0;
  let features = 0;
  while (index < projects.length) {
    const remaining = projects.length - index;
    const wantsFeature = rows.length % 2 === 0 || remaining === 1;
    const current = projects[index];
    if (wantsFeature && current) {
      rows.push({ kind: "feature", project: current, reverse: features % 2 === 1 });
      features += 1;
      index += 1;
    } else {
      rows.push({ kind: "pair", projects: projects.slice(index, index + 2) });
      index += 2;
    }
  }
  return rows;
}

/** Selected Work — quality over quantity (curated in src/data/projects.ts). */
export function SelectedWork() {
  const projects = getFeaturedProjects(selectedWorkSection.limit);
  if (projects.length === 0) return null;

  return (
    <section aria-labelledby="selected-work-heading" className="bg-canvas py-24 sm:py-28 lg:py-36">
      <Container width="wide">
        <div className="reveal flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            id="selected-work-heading"
            eyebrow={selectedWorkSection.eyebrow}
            title={selectedWorkSection.title}
            lead={selectedWorkSection.lead}
            className="max-w-3xl"
          />
          <TextLink href={routes.projects} className="shrink-0">
            {selectedWorkSection.allWorkCta}
          </TextLink>
        </div>

        <div className="mt-16 flex flex-col gap-20 lg:mt-20 lg:gap-28">
          {buildRows(projects).map((row) =>
            row.kind === "feature" ? (
              <ProjectCard
                key={row.project.id}
                project={row.project}
                layout="feature"
                reverse={row.reverse}
                className="reveal"
              />
            ) : (
              <div key={row.projects.map((project) => project.id).join("-")} className="grid gap-16 md:grid-cols-2 md:gap-10 lg:gap-14">
                {row.projects.map((project) => (
                  <ProjectCard key={project.id} project={project} className="reveal" />
                ))}
              </div>
            ),
          )}
        </div>
      </Container>
    </section>
  );
}
