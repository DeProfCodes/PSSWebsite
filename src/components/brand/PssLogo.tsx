import Image from "next/image";

import { cn } from "@/lib/utils";

/** The supplied PSS logo (public/images/brand/Logo.png, 1488×354, transparent). Never recreated or recoloured. */
const LOGO = { src: "/images/brand/Logo.png", width: 1488, height: 354 } as const;

interface PssLogoProps {
  className?: string;
  /** Rendered width in CSS pixels at the largest breakpoint — drives the srcset choice. */
  sizes?: string;
  /** Preload when the logo is above the fold (the header). */
  preload?: boolean;
  /** Empty alt when the logo sits next to the company name or inside decorative art. */
  decorative?: boolean;
}

/** Set the rendered size with a height class (e.g. `h-8`); width follows the aspect ratio. */
export function PssLogo({ className, sizes = "160px", preload = false, decorative = false }: PssLogoProps) {
  return (
    <Image
      src={LOGO.src}
      alt={decorative ? "" : "Proficient Software Solutions"}
      width={LOGO.width}
      height={LOGO.height}
      sizes={sizes}
      preload={preload}
      className={cn("w-auto", className)}
    />
  );
}
