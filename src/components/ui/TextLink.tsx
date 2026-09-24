import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Understated text link with a travelling arrow. */
export function TextLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2 rounded-sm text-[0.9375rem] font-semibold whitespace-nowrap text-accent transition-colors hover:text-foreground",
        className,
      )}
    >
      {children}
      <ArrowRight aria-hidden="true" className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
    </Link>
  );
}
