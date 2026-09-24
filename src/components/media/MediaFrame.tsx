import Image from "next/image";
import type { CSSProperties } from "react";

import { imageAspect, resolveMediaSrc } from "@/lib/media";
import { cn } from "@/lib/utils";
import type { ImageAsset } from "@/types/content";

interface MediaFrameProps {
  image: ImageAsset;
  /** Always match the rendered width, e.g. "(min-width: 1024px) 50vw, 100vw". */
  sizes: string;
  /** Only for the single above-the-fold image of a page. */
  preload?: boolean;
  /** Fill the parent box instead of sizing by ratio (parent must be positioned and sized). */
  fill?: boolean;
  /** Frame ratio, e.g. "16 / 10". Defaults to the image's own ratio, so nothing is cropped. */
  aspect?: string;
  /** How the image fills a frame whose ratio differs from its own. */
  fit?: "cover" | "contain";
  className?: string;
  imageClassName?: string;
}

/**
 * The one component for project imagery: next/image (AVIF/WebP, lazy by
 * default) inside a frame that reserves its space. The file must exist — the
 * build fails otherwise (src/lib/media.ts).
 */
export function MediaFrame({
  image,
  sizes,
  preload = false,
  fill = false,
  aspect,
  fit = "cover",
  className,
  imageClassName,
}: MediaFrameProps) {
  const style: CSSProperties | undefined = fill ? undefined : { aspectRatio: aspect ?? imageAspect(image) };

  return (
    <div className={cn("relative overflow-hidden", fill && "size-full", className)} style={style}>
      <Image
        src={resolveMediaSrc(image.src)}
        alt={image.alt}
        fill
        sizes={sizes}
        preload={preload}
        className={cn(fit === "contain" ? "object-contain" : "object-cover object-top", imageClassName)}
      />
    </div>
  );
}
