import "server-only";

import { existsSync } from "node:fs";
import path from "node:path";

import type { ImageAsset } from "@/types/content";

/**
 * Build-time checks for /public images.
 *
 * Pages are statically generated, so this runs during `next build`. Every image
 * the site renders is declared with its exact path in the content data; if the
 * file is missing, the build fails with the path instead of shipping a broken
 * image or a placeholder.
 */

const PUBLIC_DIR = path.join(/* turbopackIgnore: true */ process.cwd(), "public");
const checked = new Set<string>();

/** Returns `src` after confirming the file exists under /public (throws otherwise). */
export function resolveMediaSrc(src: string): string {
  if (/^https?:\/\//.test(src) || checked.has(src)) return src;
  const relative = src.replace(/^\/+/, "");
  if (relative.includes("..") || !existsSync(path.join(PUBLIC_DIR, relative))) {
    throw new Error(`Image not found: public/${relative}. Fix the path in the content data or add the file.`);
  }
  checked.add(src);
  return src;
}

/** "16 / 9" for a 1600×900 image; the kind's default when the size is not recorded. */
export function imageAspect(image: Pick<ImageAsset, "width" | "height" | "kind">): string {
  if (image.width && image.height) return `${image.width} / ${image.height}`;
  return image.kind === "mobile" ? "9 / 16" : "16 / 9";
}
