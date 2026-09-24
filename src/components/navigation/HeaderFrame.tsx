"use client";

import { useSyncExternalStore, type ReactNode } from "react";

import { cn } from "@/lib/utils";

const SCROLL_THRESHOLD = 12;

function subscribeToScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

const getScrolled = () => window.scrollY > SCROLL_THRESHOLD;
const getServerScrolled = () => false;

/**
 * Sticky header shell. Every page opens with a dark hero (home hero or
 * PageHero), so the header floats transparent over it and becomes a
 * translucent blurred navy bar once the page scrolls. Colour/blur transition
 * only — nothing moves.
 */
export function HeaderFrame({ children }: { children: ReactNode }) {
  const scrolled = useSyncExternalStore(subscribeToScroll, getScrolled, getServerScrolled);

  return (
    <header
      data-scrolled={scrolled ? "" : undefined}
      className={cn(
        "theme-dark sticky top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-300 ease-out",
        // Hairline drawn inside the header box (a border would make the header 1px taller than
        // --header-height, leaving a 1px strip of page background above the hero it overlaps).
        "after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-white/[0.08]",
        scrolled ? "bg-ink-950/85 shadow-[0_12px_32px_-16px_rgb(0_0_0/0.7)] backdrop-blur-xl" : "bg-transparent",
        // While the mobile menu is open the bar must be opaque.
        "[html[data-menu-open]_&]:bg-ink-950",
      )}
    >
      {children}
    </header>
  );
}
