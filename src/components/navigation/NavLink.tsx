"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

interface NavLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  /** Called after the link is activated (e.g. to close the mobile menu). */
  onNavigate?: () => void;
}

/**
 * Navigation link that marks the current section with aria-current="page".
 * Style the active state with the `aria-[current=page]:` variant — no separate
 * "active" class is needed. Client component only because it reads the pathname.
 */
export function NavLink({ href, children, className, onNavigate }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link href={href} aria-current={isActive ? "page" : undefined} className={className} onClick={onNavigate}>
      {children}
    </Link>
  );
}
