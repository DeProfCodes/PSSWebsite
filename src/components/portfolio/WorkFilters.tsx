"use client";

import { useEffect, useSyncExternalStore } from "react";

import { legacyAnchorFilters, type WorkFilterKey } from "@/data/taxonomy";
import { cn } from "@/lib/utils";

interface FilterOption {
  key: WorkFilterKey;
  label: string;
  count: number;
}

const CHANGE_EVENT = "work-filter-change";

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener("hashchange", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener("hashchange", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

/** ?filter=… wins; otherwise a legacy #web / #mobile / … anchor; otherwise "all". */
function readFilterFromUrl(): string {
  const fromQuery = new URLSearchParams(window.location.search).get("filter");
  if (fromQuery) return fromQuery;
  const hash = window.location.hash.replace(/^#/, "").toLowerCase();
  return legacyAnchorFilters[hash] ?? "all";
}

/**
 * Work-page filter bar. Progressive enhancement: the server renders every
 * project; this only toggles `hidden` on items inside `#<gridId>` whose
 * `data-filters` lacks the active key. The active filter lives in the URL
 * (?filter=fintech), so filtered views are shareable and survive reloads.
 */
export function WorkFilters({ filters, gridId }: { filters: FilterOption[]; gridId: string }) {
  const requested = useSyncExternalStore(subscribe, readFilterFromUrl, () => "all");
  const active = filters.some((filter) => filter.key === requested) ? (requested as WorkFilterKey) : "all";
  const activeFilter = filters.find((filter) => filter.key === active);

  useEffect(() => {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    for (const item of grid.querySelectorAll<HTMLElement>("[data-filters]")) {
      const keys = (item.dataset.filters ?? "").split(" ");
      item.hidden = active !== "all" && !keys.includes(active);
    }
  }, [active, gridId]);

  function select(key: WorkFilterKey) {
    const url = new URL(window.location.href);
    if (key === "all") url.searchParams.delete("filter");
    else url.searchParams.set("filter", key);
    url.hash = "";
    window.history.replaceState(window.history.state, "", url);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }

  return (
    <div>
      <div
        role="group"
        aria-label="Filter projects"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
      >
        {filters.map((filter) => {
          const pressed = filter.key === active;
          return (
            <button
              key={filter.key}
              type="button"
              aria-pressed={pressed}
              onClick={() => select(filter.key)}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors duration-200",
                pressed
                  ? "border-ink-950 bg-ink-950 text-white"
                  : "border-foreground/12 bg-white text-muted-foreground hover:border-foreground/30 hover:text-foreground",
              )}
            >
              {filter.label}
              <span className={cn("font-mono text-xs", pressed ? "text-brand-cyan" : "text-foreground/40")}>
                {filter.count}
              </span>
            </button>
          );
        })}
      </div>
      <p aria-live="polite" className="sr-only">
        {activeFilter ? `Showing ${activeFilter.count} ${activeFilter.count === 1 ? "project" : "projects"}` : ""}
      </p>
    </div>
  );
}
