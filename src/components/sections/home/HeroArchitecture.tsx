import { Blocks, Lightbulb, TrendingUp, Workflow, type LucideIcon } from "lucide-react";
import type { CSSProperties } from "react";

import { PssLogo } from "@/components/brand/PssLogo";
import { homeHero, type HeroArchitectureNode } from "@/data/home";
import { cn } from "@/lib/utils";

/**
 * Abstract "software architecture" visual for the home hero: the PSS platform at
 * the centre, four conceptual nodes connected into it. Pure HTML/CSS/SVG — no
 * mockups, screenshots or stock imagery.
 *
 * Layouts
 * - < sm: a simplified stack (centre panel + 2×2 nodes), no connectors.
 * - ≥ sm: an absolutely positioned composition inside a fixed-ratio stage.
 *   Node positions and connector paths share one percentage coordinate system,
 *   so they stay aligned at every stage size (the SVG uses
 *   preserveAspectRatio="none" with non-scaling strokes).
 *
 * Motion (motion-safe only): slow floating nodes, pulsing junctions, a light
 * travelling along each connector and a breathing glow.
 *
 * Purely decorative — hidden from assistive technology. The capabilities it
 * alludes to are stated in text elsewhere in the hero.
 */

const nodeIcons: Record<HeroArchitectureNode["icon"], LucideIcon> = {
  build: Blocks,
  integrate: Workflow,
  transform: Lightbulb,
  grow: TrendingUp,
};

/** Placement of each node on ≥ sm, in % of the stage. Order matches homeHero.architecture.nodes. */
const nodePlacement = [
  "sm:left-[1%] sm:top-[2%] sm:w-[35%]",
  "sm:left-[68%] sm:top-[9%] sm:w-[32%]",
  "sm:left-[3%] sm:top-[67%] sm:w-[31%]",
  "sm:left-[63%] sm:top-[69%] sm:w-[34%]",
] as const;

/** Connector paths (same % coordinate system). Each starts under a node and ends under the centre panel. */
const connectors = [
  "M18 22 V46 H31",
  "M75 28 V44 H66",
  "M17 74 V56 H31",
  "M81 76 V54 H66",
] as const;

/** Junction dots at connector corners, in %. */
const junctions = [
  { x: 18, y: 46 },
  { x: 75, y: 44 },
  { x: 17, y: 56 },
  { x: 81, y: 54 },
] as const;

const glassPanel =
  "rounded-panel border border-[rgb(140_200_255/0.16)] bg-[linear-gradient(150deg,rgb(255_255_255/0.09),rgb(255_255_255/0.02)_55%,rgb(49_191_255/0.04))] shadow-[inset_0_1px_0_0_rgb(255_255_255/0.10),0_30px_60px_-30px_rgb(0_0_0/0.9)] backdrop-blur-md";

export function HeroArchitecture() {
  const { nodes, centerCaption } = homeHero.architecture;

  return (
    <div aria-hidden="true" className="relative mx-auto w-full max-w-xl select-none lg:max-w-none">
      {/* Breathing glow behind the platform */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 size-[85%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(49_191_255/0.20),rgb(12_157_222/0.08)_40%,transparent_68%)] blur-2xl motion-safe:animate-glow" />

      {/* Stage. Depth comes from layering, glow and slow float — not a 3D tilt, which softens text at 1× DPR. */}
      <div className="relative grid grid-cols-2 gap-3 sm:block sm:aspect-[5/4] lg:aspect-square xl:aspect-[5/4]">
        {/* Connectors */}
        <svg
          className="absolute inset-0 hidden size-full overflow-visible sm:block"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          fill="none"
        >
          <defs>
            <linearGradient id="hero-connector" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#31bfff" stopOpacity="0.55" />
              <stop offset="1" stopColor="#0c9dde" stopOpacity="0.35" />
            </linearGradient>
          </defs>
          {connectors.map((d) => (
            <path key={d} d={d} stroke="url(#hero-connector)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          ))}
          {connectors.map((d, index) => (
            <path
              key={`${d}-flow`}
              d={d}
              pathLength={100}
              stroke="#7fd8ff"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="7 93"
              vectorEffect="non-scaling-stroke"
              className="opacity-0 motion-safe:animate-line-flow motion-safe:opacity-90"
              style={{ animationDelay: `${index * -1.75}s` }}
            />
          ))}
        </svg>

        {/* Junctions */}
        {junctions.map(({ x, y }, index) => (
          <span
            key={`${x}-${y}`}
            className="absolute hidden size-2 -translate-x-1/2 -translate-y-1/2 sm:block"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <span
              className="absolute inset-0 rounded-full bg-brand-cyan/40 motion-safe:animate-node-pulse"
              style={{ animationDelay: `${index * 0.9}s` }}
            />
            <span className="absolute inset-[2px] rounded-full bg-[#9be3ff] shadow-[0_0_10px_2px_rgb(49_191_255/0.7)]" />
          </span>
        ))}

        {/* Depth: empty glass layers behind the platform */}
        <div className={cn(glassPanel, "absolute hidden opacity-45 sm:block sm:top-[26%] sm:left-[37%] sm:h-[30%] sm:w-[36%]")} />
        <div className={cn(glassPanel, "absolute hidden opacity-30 sm:block sm:top-[45%] sm:left-[24%] sm:h-[26%] sm:w-[33%]")} />

        {/* The platform */}
        <div
          className={cn(
            glassPanel,
            "relative col-span-2 overflow-hidden px-6 py-7 text-center sm:absolute sm:top-[34%] sm:left-[29%] sm:w-[38%] sm:px-5 sm:py-6 xl:py-7",
            "shadow-[inset_0_1px_0_0_rgb(255_255_255/0.14),0_0_0_1px_rgb(49_191_255/0.22),0_0_70px_-12px_rgb(49_191_255/0.45),0_30px_60px_-30px_rgb(0_0_0/0.9)]",
          )}
        >
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgb(120_170_255/0.07)_1px,transparent_1px),linear-gradient(90deg,rgb(120_170_255/0.07)_1px,transparent_1px)] bg-[size:18px_18px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]" />
          <PssLogo
            decorative
            sizes="(min-width: 1280px) 200px, 170px"
            className="relative mx-auto h-9 sm:h-10 lg:h-9 xl:h-11"
          />
          <p className="relative mt-3 text-[0.8125rem] font-medium text-muted-foreground">{centerCaption}</p>
        </div>

        {/* Conceptual nodes */}
        {nodes.map((node, index) => {
          const Icon = nodeIcons[node.icon];
          const style: CSSProperties = { animationDelay: `${index * -2.25}s` };
          return (
            <div
              key={node.title}
              className={cn(glassPanel, "relative p-4 sm:absolute sm:p-5 lg:p-4 xl:p-5", nodePlacement[index], "motion-safe:animate-float-slow")}
              style={style}
            >
              <div className="flex items-start justify-between">
                <span className="grid size-9 place-items-center rounded-lg bg-brand-cyan/10 text-brand-cyan ring-1 ring-brand-cyan/25 sm:size-10 lg:size-9 xl:size-10">
                  <Icon className="size-[18px]" strokeWidth={1.75} />
                </span>
                <span className="font-mono text-[0.6875rem] text-white/35">{String(index + 1).padStart(2, "0")}</span>
              </div>
              <p className="mt-3 text-base font-semibold text-foreground sm:text-lg lg:text-base xl:text-lg">{node.title}</p>
              <p className="mt-0.5 text-sm text-muted-foreground lg:text-[0.8125rem] xl:text-sm">{node.caption}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
