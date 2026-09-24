import { MediaFrame } from "@/components/media/MediaFrame";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/content";

/** Stage ratio (16:10). Desktop screens get padding; phone screenshots already carry their own
 * backdrop margin (the stage colour matches it), so they may use the full width without gaps. */
const STAGE_RATIO = 16 / 10;
const LAYOUT = {
  desktop: { usableWidth: 88, maxHeight: 84, gap: 3 },
  phones: { usableWidth: 100, maxHeight: 96, gap: 0 },
} as const;

interface ProjectCoverProps {
  project: Project;
  /** Rendered width of the whole cover, for next/image. */
  sizes: string;
  preload?: boolean;
}

/**
 * A project's 16:10 cover: its designed cover image, or — for projects that
 * have real screens but no designed cover — those screens side by side on a
 * plain stage whose colour matches their own backdrop. Nothing is cropped or
 * redrawn.
 */
export function ProjectCover({ project, sizes, preload = false }: ProjectCoverProps) {
  if (project.coverImage) {
    return <MediaFrame image={project.coverImage} aspect="16 / 10" sizes={sizes} preload={preload} />;
  }

  const stage = project.coverStage;
  if (!stage || stage.screens.length === 0) return null;

  const count = stage.screens.length;
  const phones = stage.screens.every((screen) => screen.kind === "mobile");
  const layout = phones ? LAYOUT.phones : LAYOUT.desktop;

  return (
    <div
      className="relative flex aspect-[16/10] items-center justify-center overflow-hidden"
      style={{ background: stage.background, gap: `${layout.gap}%` }}
    >
      {stage.screens.map((screen) => {
        const ratio = screen.width && screen.height ? screen.width / screen.height : phones ? 9 / 16 : 16 / 9;
        // Widest each screen can be while all of them fit the stage width and height.
        const byWidth = (layout.usableWidth - layout.gap * (count - 1)) / count;
        const byHeight = (layout.maxHeight / 100) * (1 / STAGE_RATIO) * ratio * 100;
        const width = Math.min(byWidth, byHeight);
        return (
          <div key={screen.src} className="relative" style={{ width: `${width}%`, aspectRatio: String(ratio) }}>
            <MediaFrame
              image={screen}
              fill
              fit="contain"
              sizes={phones ? "(min-width: 1024px) 220px, 30vw" : sizes}
              preload={preload}
              className={cn(!phones && "rounded-lg shadow-[0_24px_50px_-24px_rgb(0_0_0/0.7)] ring-1 ring-white/10")}
            />
          </div>
        );
      })}
    </div>
  );
}
