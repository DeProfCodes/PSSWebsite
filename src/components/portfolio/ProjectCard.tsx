import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { ProjectCover } from "@/components/portfolio/ProjectCover";
import { routes } from "@/config/routes";
import { getProjectIndustryLabel, getProjectTags } from "@/lib/projects";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/content";

interface ProjectCardProps {
  project: Project;
  /** "feature": large image beside the text (stacks on small screens). "standard": image above text. */
  layout?: "feature" | "standard";
  /** Feature layout only: image on the right. */
  reverse?: boolean;
  headingLevel?: "h2" | "h3";
  /** The rendered image width — keeps next/image's srcset honest. */
  sizes?: string;
  preload?: boolean;
  className?: string;
}

/**
 * Editorial project card: image, industry, name, one sentence, platform tags,
 * "View Case Study". Business-first — technologies live in the case study.
 * The title link is stretched over the whole card (one tab stop, one link).
 */
export function ProjectCard({
  project,
  layout = "standard",
  reverse = false,
  headingLevel: Heading = "h3",
  sizes,
  preload = false,
  className,
}: ProjectCardProps) {
  const industry = getProjectIndustryLabel(project);
  const tags = getProjectTags(project);
  const sentence = project.tagline ?? (project.shortDescription || undefined);
  const feature = layout === "feature";

  return (
    <article
      className={cn(
        "group relative rounded-[1.5rem] has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-8 has-[a:focus-visible]:outline-ring",
        feature ? "grid items-center gap-8 lg:grid-cols-12 lg:gap-12" : "flex flex-col",
        className,
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-[1.25rem] border border-foreground/10 bg-ink-900 shadow-[0_24px_60px_-32px_rgb(3_10_22/0.45)] transition-shadow duration-500 group-hover:shadow-[0_32px_70px_-30px_rgb(3_10_22/0.55)]",
          feature && "lg:col-span-7",
          feature && reverse && "lg:order-last",
        )}
      >
        <div className="transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.025]">
          <ProjectCover
            project={project}
            sizes={
              sizes ??
              (feature
                ? "(min-width: 1408px) 762px, (min-width: 1024px) 58vw, 100vw"
                : "(min-width: 1408px) 642px, (min-width: 768px) 50vw, 100vw")
            }
            preload={preload}
          />
        </div>
      </div>

      <div className={cn("flex flex-col", feature ? "lg:col-span-5" : "mt-6")}>
        {industry ? (
          <p className="font-mono text-xs font-medium tracking-[0.18em] text-accent uppercase">{industry}</p>
        ) : null}
        <Heading
          className={cn(
            "mt-3 font-extrabold tracking-[-0.025em] text-foreground",
            feature ? "text-3xl sm:text-4xl" : "text-2xl",
          )}
        >
          <Link
            href={routes.project(project.slug)}
            className="rounded-sm outline-none after:absolute after:inset-0 after:rounded-[1.5rem]"
          >
            {project.name}
          </Link>
        </Heading>
        {sentence ? (
          <p className={cn("mt-3 leading-relaxed text-muted-foreground", feature ? "text-lg" : "text-base")}>
            {sentence}
          </p>
        ) : null}

        <div className={cn("flex flex-wrap items-center gap-x-6 gap-y-4", feature ? "mt-8" : "mt-5")}>
          {tags.length > 0 ? (
            <ul className="flex flex-wrap gap-2" aria-label="Platforms">
              {tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-foreground/12 px-3 py-1 text-xs font-medium text-muted-foreground"
                >
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}
          <span
            aria-hidden="true"
            className="inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors group-hover:text-foreground"
          >
            View Case Study
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </article>
  );
}
