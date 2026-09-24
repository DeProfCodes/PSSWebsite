import type { ImageAsset, MediaKind } from "@/types/content";

/**
 * Helpers for declaring images in content data. Nothing here touches the file
 * system, so they are safe to use anywhere; src/lib/media.ts checks at build
 * time that every rendered file exists.
 */

/** An image file in /public, with its intrinsic size (so frames use its real ratio). */
export function image(src: string, width: number, height: number, alt: string, kind?: MediaKind): ImageAsset {
  return { src, width, height, alt, kind: kind ?? (height > width ? "mobile" : "desktop") };
}

/** A file that still lives only in the legacy repository (PSS-MainWebsite/wwwroot). Hidden projects only. */
export function legacyImage(
  src: string,
  legacySource: string,
  alt: string,
  kind: MediaKind = "desktop",
): ImageAsset {
  return { src, legacySource, alt, kind };
}

/** ["1.png", "2.png", …] — the legacy galleries use numbered files. */
export function numberedFiles(count: number, extension = "png"): string[] {
  return Array.from({ length: count }, (_, index) => `${index + 1}.${extension}`);
}

interface LegacyGalleryOptions {
  destinationDir: string;
  prefix: string;
  legacyDir: string;
  files: string[];
  altPrefix: string;
  kind?: MediaKind;
}

export function legacyGallery({
  destinationDir,
  prefix,
  legacyDir,
  files,
  altPrefix,
  kind = "desktop",
}: LegacyGalleryOptions): ImageAsset[] {
  return files.map((file, index) => {
    const extension = file.slice(file.lastIndexOf(".") + 1).toLowerCase();
    return legacyImage(
      `${destinationDir}/${prefix}-${index + 1}.${extension}`,
      `${legacyDir}/${file}`,
      `${altPrefix}, screen ${index + 1}`,
      kind,
    );
  });
}
