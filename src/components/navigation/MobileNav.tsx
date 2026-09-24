"use client";

import { ArrowRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { MOBILE_MENU_ROOT_ID } from "@/components/navigation/constants";
import { NavLink } from "@/components/navigation/NavLink";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { NavigationItem } from "@/types/content";

const DESKTOP_QUERY = "(min-width: 64rem)"; // Tailwind `lg`

/**
 * Mobile navigation (below `lg`): a quiet two-line toggle and a full-height
 * navy sheet with large, well-spaced links and the primary CTA.
 *
 * The sheet is portalled out of the header (the scrolled header uses
 * backdrop-filter, which would otherwise become the containing block of a
 * `position: fixed` child) into a mount point placed right after the header, so
 * the next Tab stop after the toggle is the first menu link.
 *
 * Accessibility:
 * - Disclosure pattern: aria-expanded + aria-controls on the toggle.
 * - While open, page scroll is locked and <main>/<footer> are `inert`, so
 *   keyboard and screen-reader focus move from the toggle straight into the menu.
 * - Escape closes and returns focus to the toggle. Choosing a link, changing
 *   route or widening to desktop also closes it.
 */
export function MobileNav({ items, cta }: { items: NavigationItem[]; cta: NavigationItem }) {
  const pathname = usePathname();
  // "Open" only for the route it was opened on, so any navigation closes it.
  const [openOnPath, setOpenOnPath] = useState<string | null>(null);
  const open = openOnPath === pathname;
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  const close = () => setOpenOnPath(null);

  useEffect(() => {
    if (!open) return;

    const root = document.documentElement;
    const inertTargets = Array.from(document.querySelectorAll<HTMLElement>("main, footer"));
    const previousOverflow = root.style.overflow;

    root.dataset.menuOpen = "";
    root.style.overflow = "hidden";
    inertTargets.forEach((element) => element.setAttribute("inert", ""));

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenOnPath(null);
        toggleRef.current?.focus();
      }
    }
    const desktop = window.matchMedia(DESKTOP_QUERY);
    function handleViewportChange(event: MediaQueryListEvent) {
      if (event.matches) setOpenOnPath(null);
    }

    document.addEventListener("keydown", handleKeyDown);
    desktop.addEventListener("change", handleViewportChange);

    return () => {
      delete root.dataset.menuOpen;
      root.style.overflow = previousOverflow;
      inertTargets.forEach((element) => element.removeAttribute("inert"));
      document.removeEventListener("keydown", handleKeyDown);
      desktop.removeEventListener("change", handleViewportChange);
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        ref={toggleRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpenOnPath(open ? null : pathname)}
        className="relative inline-flex size-11 items-center justify-center rounded-full border border-white/12 bg-white/[0.04] text-foreground transition-colors hover:border-white/25 hover:bg-white/[0.08]"
      >
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        <span aria-hidden="true" className="relative block h-3 w-[18px]">
          <span
            className={cn(
              "absolute left-0 block h-[1.5px] w-full rounded-full bg-current transition-transform duration-200",
              open ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0",
            )}
          />
          <span
            className={cn(
              "absolute left-0 block h-[1.5px] rounded-full bg-current transition-[transform,width] duration-200",
              open ? "top-1/2 w-full -translate-y-1/2 -rotate-45" : "bottom-0 w-2/3",
            )}
          />
        </span>
      </button>

      {open
        ? createPortal(
            <div
              id={panelId}
              className="theme-dark fixed inset-x-0 top-(--header-height) bottom-0 z-40 overflow-y-auto bg-ink-950 motion-safe:animate-menu-in lg:hidden"
            >
              <nav
                aria-label="Primary"
                className="mx-auto flex min-h-full w-full max-w-wide flex-col px-4 pt-4 pb-8 sm:px-6"
              >
                <ul className="flex flex-col">
                  {items.map((item) => (
                    <li key={item.href} className="border-b border-white/[0.07]">
                      <NavLink
                        href={item.href}
                        onNavigate={close}
                        className="group flex items-center justify-between py-4 text-2xl font-semibold tracking-tight text-muted-foreground transition-colors hover:text-foreground aria-[current=page]:text-foreground"
                      >
                        {item.label}
                        <span
                          aria-hidden="true"
                          className="hidden size-1.5 rounded-full bg-brand-cyan group-aria-[current=page]:block"
                        />
                      </NavLink>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-10">
                  <ButtonLink href={cta.href} size="xl" className="w-full" onClick={close}>
                    {cta.label}
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </ButtonLink>
                </div>
              </nav>
            </div>,
            document.getElementById(MOBILE_MENU_ROOT_ID) ?? document.body,
          )
        : null}
    </div>
  );
}
