import { ArrowUpRight, Check } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";
import { MediaFrame } from "@/components/media/MediaFrame";
import { Breadcrumbs } from "@/components/navigation/Breadcrumbs";
import { EcosystemMap } from "@/components/portfolio/EcosystemMap";
import { ProjectCard } from "@/components/portfolio/ProjectCard";
import { FinalCta } from "@/components/sections/FinalCta";
import { JsonLd } from "@/components/seo/JsonLd";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { routes } from "@/config/routes";
import { getClientById } from "@/data/clients";
import { imageAspect } from "@/lib/media";
import {
  getDeliverableAnchor,
  getPlatformLabel,
  getProjectBySlug,
  getProjectIndustryLabel,
  getProjectsWithDetailPages,
  getRelatedProjects,
  getShareImage,
  hasDeliverableSection,
  hasDetailPage,
} from "@/lib/projects";
import { buildPageMetadata } from "@/lib/seo";
import { projectJsonLd } from "@/lib/structured-data";
import { cn } from "@/lib/utils";
import type { ImageAsset, Project, ProjectDeliverable } from "@/types/content";

/** Every case study is pre-rendered at build time; unknown or hidden slugs are a hard 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return getProjectsWithDetailPages().map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};

  const shareImage = getShareImage(project);
  return buildPageMetadata({
    title: project.seoTitle ?? `${project.name} — Case Study`,
    description: project.seoDescription ?? project.tagline ?? project.shortDescription,
    path: routes.project(project.slug),
    images: shareImage ? [shareImage] : [],
  });
}

/**
 * "What we delivered": the primary product (described in the overview) unless a
 * deliverable already covers its main platform, then each deliverable. Only
 * deliverables with their own section are linked.
 */
function deliveredItems(project: Project) {
  const primaryPlatform = project.platforms[0];
  const primaryCovered = project.deliverables.some((deliverable) => deliverable.platform === primaryPlatform);
  return [
    ...(primaryPlatform && !primaryCovered ? [{ name: project.name, platform: primaryPlatform, anchor: undefined }] : []),
    ...project.deliverables.map((deliverable) => ({
      name: deliverable.name,
      platform: deliverable.platform,
      anchor: hasDeliverableSection(deliverable) ? getDeliverableAnchor(deliverable) : undefined,
    })),
  ];
}

function HeroFacts({ project }: { project: Project }) {
  const client = getClientById(project.clientId);
  const facts = [
    { label: "Client", value: project.inHouse ? "In-house product" : client?.name },
    { label: "Industry", value: getProjectIndustryLabel(project) },
    { label: "Platforms", value: project.platforms.map(getPlatformLabel).join(", ") || undefined },
    { label: "Year", value: project.date },
  ].filter((fact): fact is { label: string; value: string } => Boolean(fact.value));

  if (facts.length === 0) return null;
  return (
    <dl className="mt-12 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-border pt-8 lg:grid-cols-4">
      {facts.map((fact) => (
        <div key={fact.label}>
          <dt className="font-mono text-xs tracking-[0.18em] text-accent uppercase">{fact.label}</dt>
          <dd className="mt-2 text-base font-semibold text-foreground">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function ExternalLinks({ project }: { project: Project }) {
  const links = [
    ...(project.websiteUrl ? [{ label: "Visit website", url: project.websiteUrl }] : []),
    ...project.links.map((link) => ({ label: `View on ${link.label}`, url: link.url })),
  ];
  if (links.length === 0) return null;
  return (
    <div className="mt-8 flex flex-wrap gap-3">
      {links.map((link) => (
        <a
          key={link.url}
          href={link.url}
          rel="noopener"
          className="inline-flex h-11 items-center gap-2 rounded-base border border-white/20 bg-white/[0.03] px-5 text-sm font-semibold text-foreground transition-colors hover:border-white/40"
        >
          {link.label}
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </a>
      ))}
    </div>
  );
}

const screenShadow = "shadow-[0_24px_60px_-34px_rgb(3_10_22/0.45)]";

/** Phone screens in a row at their real ratio. */
function PhoneRow({ images, className }: { images: ImageAsset[]; className?: string }) {
  return (
    <ul className={cn("grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6", className)}>
      {images.map((image) => (
        <li key={image.src}>
          <MediaFrame
            image={image}
            sizes="(min-width: 1024px) 260px, (min-width: 640px) 30vw, 45vw"
            className={cn("rounded-[1.25rem] border border-foreground/10 bg-canvas", screenShadow)}
          />
        </li>
      ))}
    </ul>
  );
}

function DeliverableBlock({ deliverable, reverse }: { deliverable: ProjectDeliverable; reverse: boolean }) {
  const anchor = getDeliverableAnchor(deliverable);
  const phones = deliverable.images.filter((image) => image.kind === "mobile");
  const screens = deliverable.images.filter((image) => image.kind !== "mobile");
  const singlePhone = phones.length === 1 ? phones[0] : undefined;
  const hasMedia = deliverable.images.length > 0;
  const paragraphs = deliverable.description.length > 0 ? deliverable.description : deliverable.summary ? [deliverable.summary] : [];

  return (
    <article
      id={anchor}
      aria-labelledby={`${anchor}-heading`}
      className={cn("reveal scroll-mt-[calc(var(--header-height)+2rem)] grid items-center gap-10", hasMedia && "lg:grid-cols-12 lg:gap-14")}
    >
      <div className={cn(hasMedia && "lg:col-span-5", hasMedia && reverse && "lg:order-last")}>
        <p className="font-mono text-xs tracking-[0.18em] text-accent uppercase">{getPlatformLabel(deliverable.platform)}</p>
        <h3 id={`${anchor}-heading`} className="mt-3 text-display-3 text-foreground">
          {deliverable.name}
        </h3>
        {paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 48)} className="mt-4 leading-relaxed text-muted-foreground">
            {paragraph}
          </p>
        ))}
        {deliverable.technologies.length > 0 ? (
          <ul className="mt-6 flex flex-wrap gap-2" aria-label={`${deliverable.name} technologies`}>
            {deliverable.technologies.map((technology) => (
              <li key={technology} className="rounded-md bg-canvas px-2.5 py-1 font-mono text-xs text-foreground/75">
                {technology}
              </li>
            ))}
          </ul>
        ) : null}
        {deliverable.features.length > 0 ? (
          <ul className="mt-6 space-y-2.5">
            {deliverable.features.map((feature) => (
              <li key={feature} className="flex gap-3 text-foreground/90">
                <Check aria-hidden="true" className="mt-1 size-4 shrink-0 text-accent" strokeWidth={2.25} />
                {feature}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      {hasMedia ? (
        <div className="space-y-6 lg:col-span-7">
          {screens.map((image) => (
            <MediaFrame
              key={image.src}
              image={image}
              sizes="(min-width: 1408px) 760px, (min-width: 1024px) 55vw, 100vw"
              className={cn("rounded-[1.25rem] border border-foreground/10", screenShadow)}
            />
          ))}
          {singlePhone ? (
            <div className="mx-auto w-full max-w-xs">
              <MediaFrame
                image={singlePhone}
                sizes="320px"
                className={cn("rounded-[1.5rem] border border-foreground/10 bg-canvas", screenShadow)}
              />
            </div>
          ) : phones.length > 1 ? (
            <PhoneRow images={phones} />
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

function ScreensGallery({ images }: { images: ImageAsset[] }) {
  const desktop = images.filter((image) => image.kind !== "mobile");
  const mobile = images.filter((image) => image.kind === "mobile");
  // One frame ratio for the whole set (the first screen's), so rows line up.
  const firstDesktop = desktop[0];
  const frame = firstDesktop ? imageAspect(firstDesktop) : undefined;

  return (
    <div className="space-y-12">
      {desktop.length > 0 ? (
        <ul className="grid gap-6 md:grid-cols-2 lg:gap-8">
          {desktop.map((image, index) => {
            // An odd-numbered set opens with one full-width screen.
            const fullWidth = desktop.length % 2 === 1 && index === 0;
            return (
              <li key={image.src} className={cn(fullWidth && "md:col-span-2")}>
                <MediaFrame
                  image={image}
                  aspect={frame}
                  sizes={fullWidth ? "(min-width: 1408px) 1344px, 100vw" : "(min-width: 1408px) 660px, (min-width: 768px) 50vw, 100vw"}
                  className={cn("rounded-[1.25rem] border border-foreground/10", screenShadow)}
                  imageClassName="object-left-top"
                />
              </li>
            );
          })}
        </ul>
      ) : null}
      {mobile.length > 0 ? <PhoneRow images={mobile} className="mx-auto max-w-4xl" /> : null}
    </div>
  );
}

/**
 * Case study. Every section renders only when its content exists, so a page is
 * as long as its real material. No invented outcomes, technologies or links.
 */
export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project || !hasDetailPage(project)) notFound();

  const cover = project.coverImage;
  const technologies = project.technologies;
  const deliverableSections = project.deliverables.filter(hasDeliverableSection);
  const related = getRelatedProjects(project);

  return (
    <>
      <JsonLd data={projectJsonLd(project)} />

      <PageHero
        eyebrow={getProjectIndustryLabel(project) ?? "Case study"}
        title={project.name}
        lead={project.tagline ?? project.shortDescription}
        overlap={Boolean(cover)}
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: "Home", href: routes.home },
              { label: "Work", href: routes.projects },
              { label: project.name },
            ]}
          />
        }
      >
        <ExternalLinks project={project} />
        <HeroFacts project={project} />
      </PageHero>

      {/* Overview (+ cover straddling the hero edge) */}
      <section aria-labelledby="overview-heading" className="bg-white pb-24 sm:pb-28 lg:pb-32">
        <Container width="wide">
          {cover ? (
            <div className="relative z-10 -mt-36 overflow-hidden rounded-[1.5rem] border border-white/10 shadow-[0_40px_90px_-40px_rgb(3_10_22/0.7)] sm:-mt-44">
              <MediaFrame image={cover} aspect="16 / 10" sizes="(min-width: 1408px) 1344px, 100vw" preload />
            </div>
          ) : null}

          <div className={cn("grid gap-14 lg:grid-cols-12 lg:gap-16", cover ? "mt-20 lg:mt-28" : "pt-20 lg:pt-28")}>
            <div className="reveal lg:col-span-7">
              <Eyebrow>Overview</Eyebrow>
              <h2 id="overview-heading" className="sr-only">
                Overview
              </h2>
              <div className="mt-6 space-y-5 text-lg leading-relaxed text-foreground/85">
                {project.description.map((paragraph) => (
                  <p key={paragraph.slice(0, 48)}>{paragraph}</p>
                ))}
              </div>
            </div>

            <aside aria-label="Project details" className="reveal space-y-10 lg:col-span-4 lg:col-start-9">
              {project.deliverables.length > 0 ? (
                <div>
                  <p className="font-mono text-xs tracking-[0.18em] text-accent uppercase">What we delivered</p>
                  <ul className="mt-4 divide-y divide-foreground/8 border-y border-foreground/8">
                    {deliveredItems(project).map((item) => (
                      <li key={`${item.name}-${item.platform}`} className="flex items-center justify-between gap-4 py-3">
                        {item.anchor ? (
                          <a href={`#${item.anchor}`} className="font-semibold text-foreground hover:text-accent">
                            {item.name}
                          </a>
                        ) : (
                          <span className="font-semibold text-foreground">{item.name}</span>
                        )}
                        <span className="shrink-0 text-sm text-muted-foreground">{getPlatformLabel(item.platform)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {project.scope && project.scope.length > 0 ? (
                <div>
                  <p className="font-mono text-xs tracking-[0.18em] text-accent uppercase">Scope</p>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {project.scope.map((item) => (
                      <li key={item} className="rounded-full border border-foreground/12 px-3 py-1 text-sm text-foreground/85">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {technologies.length > 0 ? (
                <div>
                  <p className="font-mono text-xs tracking-[0.18em] text-accent uppercase">Technology</p>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {technologies.map((technology) => (
                      <li key={technology} className="rounded-md bg-canvas px-2.5 py-1 font-mono text-xs text-foreground/80">
                        {technology}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </aside>
          </div>
        </Container>
      </section>

      {/* Challenge & what we built */}
      {project.challenge || project.solution ? (
        <section aria-labelledby="challenge-heading" className="theme-dark bg-ink-900 py-24 sm:py-28 lg:py-32">
          <Container width="wide" className="reveal grid gap-14 lg:grid-cols-2 lg:gap-20">
            <h2 id="challenge-heading" className="sr-only">
              {project.challenge && project.solution ? "The challenge and what we built" : project.challenge ? "The challenge" : "What we built"}
            </h2>
            {project.challenge ? (
              <div>
                <Eyebrow>The challenge</Eyebrow>
                <p className="mt-6 text-2xl leading-snug font-semibold tracking-tight text-foreground sm:text-[1.75rem]">
                  {project.challenge}
                </p>
              </div>
            ) : null}
            {project.solution ? (
              <div>
                <Eyebrow>What we built</Eyebrow>
                <p className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl sm:leading-relaxed">{project.solution}</p>
              </div>
            ) : null}
          </Container>
        </section>
      ) : null}

      {/* Ecosystem (structure only; each product is shown full size below) */}
      {project.ecosystem ? (
        <section id="ecosystem" aria-labelledby="ecosystem-heading" className="theme-dark relative isolate scroll-mt-[var(--header-height)] overflow-hidden bg-ink-950 py-24 sm:py-28 lg:py-32">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[radial-gradient(60%_55%_at_50%_55%,rgb(12_157_222/0.16),transparent_70%)]" />
            <div className="absolute inset-0 bg-tech-grid [mask-image:radial-gradient(ellipse_70%_60%_at_50%_55%,black_20%,transparent_80%)]" />
          </div>
          <Container width="wide">
            <SectionHeading
              id="ecosystem-heading"
              eyebrow="The ecosystem"
              title="One platform, many connected products."
              className="reveal max-w-3xl"
              size="md"
            />
            <div className="reveal mt-14 lg:mt-20">
              <EcosystemMap ecosystem={project.ecosystem} showMedia={false} />
            </div>
          </Container>
        </section>
      ) : null}

      {/* Platform by platform / product by product */}
      {deliverableSections.length > 0 ? (
        <section aria-labelledby="deliverables-heading" className="bg-white py-24 sm:py-28 lg:py-32">
          <Container width="wide">
            <SectionHeading
              id="deliverables-heading"
              eyebrow={project.ecosystem ? "Product by product" : "Platform by platform"}
              title={project.ecosystem ? "Inside the ecosystem." : "How it fits together."}
              className="reveal max-w-3xl"
              size="md"
            />
            <div className="mt-16 space-y-20 lg:mt-20 lg:space-y-28">
              {deliverableSections.map((deliverable, index) => (
                <DeliverableBlock key={getDeliverableAnchor(deliverable)} deliverable={deliverable} reverse={index % 2 === 1} />
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {/* Key capabilities */}
      {project.features.length > 0 ? (
        <section aria-labelledby="capabilities-heading" className="bg-canvas-blue py-24 sm:py-28 lg:py-32">
          <Container width="wide">
            <SectionHeading id="capabilities-heading" eyebrow="Key capabilities" title="What it does." className="reveal" size="md" />
            <ul className="reveal mt-12 grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
              {project.features.map((feature) => (
                <li key={feature} className="flex gap-4 border-t border-foreground/10 pt-5 text-lg leading-snug text-foreground">
                  <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent" />
                  {feature}
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      {/* Selected screens */}
      {project.images.length > 0 ? (
        <section aria-labelledby="screens-heading" className="bg-canvas py-24 sm:py-28 lg:py-32">
          <Container width="wide">
            <SectionHeading id="screens-heading" eyebrow="Selected screens" title="Inside the product." className="reveal" size="md" />
            <div className="reveal mt-12 lg:mt-16">
              <ScreensGallery images={project.images} />
            </div>
          </Container>
        </section>
      ) : null}

      {/* Outcome */}
      {project.outcome || (project.results && project.results.length > 0) ? (
        <section aria-labelledby="outcome-heading" className="theme-dark bg-ink-900 py-24 sm:py-28 lg:py-32">
          <Container width="wide" className="reveal grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <Eyebrow>Outcome</Eyebrow>
              <h2 id="outcome-heading" className="mt-5 text-display-3 text-foreground">
                The value it delivers.
              </h2>
            </div>
            <div className="lg:col-span-7 lg:col-start-6">
              {project.outcome ? (
                <p className="text-2xl leading-snug font-semibold tracking-tight text-foreground sm:text-[1.75rem]">{project.outcome}</p>
              ) : null}
              {project.results && project.results.length > 0 ? (
                <dl className="mt-10 grid gap-8 border-t border-border pt-8 sm:grid-cols-3">
                  {project.results.map((result) => (
                    <div key={result.label}>
                      <dt className="text-sm text-muted-foreground">{result.label}</dt>
                      <dd className="mt-1 text-3xl font-extrabold tracking-tight text-accent">{result.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </div>
          </Container>
        </section>
      ) : null}

      {/* Related */}
      {related.length > 0 ? (
        <section aria-labelledby="related-heading" className="bg-white py-24 sm:py-28 lg:py-32">
          <Container width="wide">
            <SectionHeading id="related-heading" eyebrow="More work" title="Related projects." className="reveal" size="md" />
            <ul className="mt-14 grid gap-14 md:grid-cols-2 lg:grid-cols-3 lg:gap-10">
              {related.map((item) => (
                <li key={item.id} className="reveal">
                  <ProjectCard project={item} sizes="(min-width: 1408px) 420px, (min-width: 1024px) 31vw, (min-width: 768px) 50vw, 100vw" />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}

      <FinalCta />
    </>
  );
}
