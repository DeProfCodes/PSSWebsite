import { ArrowUpRight, Database } from "lucide-react";
import Link from "next/link";

import { MediaFrame } from "@/components/media/MediaFrame";
import { routes } from "@/config/routes";
import { getProjectBySlug, hasDetailPage } from "@/lib/projects";
import { cn } from "@/lib/utils";
import type { EcosystemNode, ImageAsset, ProjectEcosystem } from "@/types/content";

const glass =
  "rounded-panel border border-[rgb(140_200_255/0.16)] bg-[linear-gradient(150deg,rgb(255_255_255/0.08),rgb(255_255_255/0.02)_60%,rgb(49_191_255/0.04))] shadow-[inset_0_1px_0_0_rgb(255_255_255/0.08),0_30px_60px_-34px_rgb(0_0_0/0.9)] backdrop-blur-md";

/** Junction dot, matching the hero's connector nodes. */
function Junction({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn("absolute block size-2 -translate-x-1/2 -translate-y-1/2", className)}>
      <span className="absolute inset-0 rounded-full bg-brand-cyan/40 motion-safe:animate-node-pulse" />
      <span className="absolute inset-[2px] rounded-full bg-[#9be3ff] shadow-[0_0_10px_2px_rgb(49_191_255/0.6)]" />
    </span>
  );
}

/** Screenshot stage inside a node: desktop shots fill it, phone shots sit centred at their own ratio. */
function NodeMedia({ image }: { image: ImageAsset }) {
  const mobile = image.kind === "mobile";
  return (
    <div className="relative mb-5 aspect-[16/10] overflow-hidden rounded-xl border border-white/8 bg-ink-950/70">
      {mobile ? (
        <div
          className="absolute inset-y-3 left-1/2 -translate-x-1/2 overflow-hidden rounded-lg"
          style={{ aspectRatio: image.width && image.height ? `${image.width} / ${image.height}` : "9 / 16" }}
        >
          <MediaFrame image={image} fill sizes="160px" />
        </div>
      ) : (
        <MediaFrame image={image} fill sizes="(min-width: 1408px) 280px, (min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw" />
      )}
    </div>
  );
}

function NodeLink({ node }: { node: EcosystemNode }) {
  if (!node.projectSlug) return null;
  const project = getProjectBySlug(node.projectSlug);
  if (!project || !hasDetailPage(project)) return null;
  return (
    <Link
      href={routes.project(project.slug)}
      className="mt-4 inline-flex items-center gap-1.5 rounded-sm text-sm font-semibold text-accent hover:text-foreground"
    >
      Case study <ArrowUpRight aria-hidden="true" className="size-4" />
      <span className="sr-only">: {node.name}</span>
    </Link>
  );
}

interface EcosystemMapProps {
  ecosystem: ProjectEcosystem;
  /** Heading level for node names (h3 under a section h2). */
  headingLevel?: "h3" | "h4";
  /** Show product screenshots in the nodes (Home). The case study shows them full size instead. */
  showMedia?: boolean;
}

/**
 * A connected product ecosystem: hub → products (grouped by pillar) → shared
 * foundation. Desktop: connector bus lines like the hero. Mobile: a vertical spine.
 */
export function EcosystemMap({ ecosystem, headingLevel: NodeHeading = "h3", showMedia = true }: EcosystemMapProps) {
  const nodes = ecosystem.groups.flatMap((group) => group.nodes.map((node) => ({ node, group: group.label })));
  const columns = nodes.length;
  const centers = nodes.map((_, index) => ((index + 0.5) / columns) * 100);
  const hubImage = showMedia ? ecosystem.hub.image : undefined;
  const foundationImage = showMedia ? ecosystem.foundation?.image : undefined;

  return (
    <div className="relative">
      {/* Hub */}
      <div
        className={cn(
          glass,
          "relative mx-auto max-w-5xl p-6 sm:p-8",
          hubImage && "lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)] lg:items-center lg:gap-10",
          "shadow-[inset_0_1px_0_0_rgb(255_255_255/0.1),0_0_0_1px_rgb(49_191_255/0.18),0_0_80px_-20px_rgb(49_191_255/0.4)]",
        )}
      >
        <div>
          <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase">Core platform</p>
          <NodeHeading className="mt-3 text-3xl font-extrabold tracking-[-0.025em] text-foreground sm:text-4xl">
            {ecosystem.hub.name}
          </NodeHeading>
          <p className="mt-2 text-lg text-muted-foreground">{ecosystem.hub.role}</p>
        </div>
        {hubImage ? (
          <div className="mt-6 overflow-hidden rounded-xl border border-white/10 lg:mt-0">
            <MediaFrame image={hubImage} sizes="(min-width: 1024px) 560px, 90vw" />
          </div>
        ) : null}
      </div>

      {/* Hub → products connector (desktop) */}
      <div aria-hidden="true" className="relative hidden h-16 lg:block">
        <span className="absolute top-0 left-1/2 h-8 w-px -translate-x-1/2 bg-gradient-to-b from-brand-cyan/70 to-brand-cyan/35" />
        <span
          className="absolute top-8 h-px bg-brand-cyan/35"
          style={{ left: `${centers[0]}%`, right: `${100 - (centers.at(-1) ?? 100)}%` }}
        />
        <Junction className="top-8 left-1/2" />
        {centers.map((center) => (
          <span key={center} className="absolute top-8 h-8 w-px bg-brand-cyan/35" style={{ left: `${center}%` }} />
        ))}
      </div>

      {/* Products */}
      <ul
        className={cn(
          "relative mt-8 grid gap-4 sm:grid-cols-2 lg:mt-0",
          columns === 4 && "lg:grid-cols-4",
          columns === 3 && "lg:grid-cols-3",
          // Mobile spine
          "before:absolute before:top-2 before:bottom-2 before:left-3 before:w-px before:bg-brand-cyan/25 sm:before:hidden",
        )}
      >
        {nodes.map(({ node, group }) => (
          <li key={node.id} className="relative pl-9 sm:pl-0">
            <span aria-hidden="true" className="absolute top-8 left-3 sm:hidden">
              <Junction />
            </span>
            <div className={cn(glass, "h-full p-5")}>
              {showMedia && node.image ? <NodeMedia image={node.image} /> : null}
              <p className="font-mono text-xs tracking-[0.18em] text-accent/90 uppercase">{group}</p>
              <NodeHeading className="mt-2 text-lg font-bold tracking-tight text-foreground">{node.name}</NodeHeading>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{node.role}</p>
              <NodeLink node={node} />
            </div>
          </li>
        ))}
      </ul>

      {ecosystem.foundation ? (
        <>
          {/* Products → foundation connector (desktop) */}
          <div aria-hidden="true" className="relative hidden h-10 lg:block">
            {centers.map((center) => (
              <span key={center} className="absolute top-0 h-10 w-px bg-brand-cyan/30" style={{ left: `${center}%` }}>
                <Junction className="top-full left-1/2" />
              </span>
            ))}
          </div>

          {/* Foundation */}
          <div className={cn(glass, "mt-4 flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-7 lg:mt-0")}>
            <div className="flex items-start gap-4 sm:flex-1">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-cyan/10 text-brand-cyan ring-1 ring-brand-cyan/25">
                <Database aria-hidden="true" className="size-5" strokeWidth={1.75} />
              </span>
              <div>
                <p className="font-mono text-xs tracking-[0.18em] text-accent/90 uppercase">Foundation</p>
                <NodeHeading className="mt-1 text-lg font-bold tracking-tight text-foreground">
                  {ecosystem.foundation.name}
                </NodeHeading>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{ecosystem.foundation.role}</p>
              </div>
            </div>
            {foundationImage ? (
              <div className="w-full overflow-hidden rounded-xl border border-white/10 sm:w-64 lg:w-80">
                <MediaFrame image={foundationImage} sizes="(min-width: 1024px) 320px, (min-width: 640px) 256px, 100vw" />
              </div>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}
