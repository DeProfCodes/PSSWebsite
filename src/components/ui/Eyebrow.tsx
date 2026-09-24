import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Mono section label with a short leading rule — the hero's eyebrow, reusable. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "flex items-center gap-3 font-mono text-[0.8125rem] font-medium tracking-[0.2em] text-accent uppercase",
        className,
      )}
    >
      <span aria-hidden="true" className="h-px w-8 shrink-0 bg-current opacity-60" />
      <span>{children}</span>
    </p>
  );
}
