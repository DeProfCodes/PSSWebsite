import Image from "next/image";

import { Container } from "@/components/layout/Container";
import { clientLogos } from "@/data/client-logos";
import { resolveMediaSrc } from "@/lib/media";

/** Every logo gets roughly the same visual area, so wide wordmarks and square marks look balanced. */
const TARGET_AREA = 6000;
const MAX_WIDTH = 168;
const MAX_HEIGHT = 60;

function logoSize(width: number, height: number) {
  const ratio = width / height;
  let w = Math.sqrt(TARGET_AREA * ratio);
  let h = w / ratio;
  if (w > MAX_WIDTH) [w, h] = [MAX_WIDTH, MAX_WIDTH / ratio];
  if (h > MAX_HEIGHT) [w, h] = [MAX_HEIGHT * ratio, MAX_HEIGHT];
  return { width: Math.round(w), height: Math.round(h) };
}

/**
 * Real client logos (src/data/client-logos.ts), unmodified: quiet greyscale at
 * rest, full colour on hover. No links, no claims — just who we've built with.
 */
export function ClientLogos() {
  if (clientLogos.length === 0) return null;

  return (
    <section aria-labelledby="clients-heading" className="border-t border-foreground/6 bg-white py-20 sm:py-24">
      <Container width="wide">
        <h2 id="clients-heading" className="reveal text-center font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
          Trusted by businesses we&apos;ve built with
        </h2>
        <ul className="reveal mx-auto mt-12 flex max-w-5xl flex-wrap items-center justify-center gap-y-10 sm:gap-y-14 lg:mt-14">
          {clientLogos.map((logo) => {
            const size = logoSize(logo.width, logo.height);
            return (
              <li key={logo.name} className="flex h-16 w-1/2 items-center justify-center px-4 sm:w-1/4">
                <Image
                  src={resolveMediaSrc(logo.src)}
                  alt={logo.name}
                  width={size.width}
                  height={size.height}
                  sizes={`${size.width}px`}
                  style={{ width: size.width, height: "auto" }}
                  className="max-w-full object-contain opacity-60 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0 motion-reduce:transition-none"
                />
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
