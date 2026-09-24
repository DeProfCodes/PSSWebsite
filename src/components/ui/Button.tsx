import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

/**
 * Button primitives, built only from design tokens so they work in light and
 * `.theme-dark` contexts alike. Use <Button> for actions and <ButtonLink> for
 * navigation — never a link that performs an action, or vice versa.
 */
const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-base font-semibold whitespace-nowrap transition-[background-color,border-color,color,box-shadow,transform] duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0";

const variantClasses = {
  /** Brand blue, AA contrast with white text. A restrained glow gives it energy on dark surfaces. */
  primary:
    "bg-primary text-primary-foreground shadow-[inset_0_1px_0_0_rgb(255_255_255/0.18),0_10px_30px_-12px_rgb(12_157_222/0.65)] hover:bg-primary-hover hover:shadow-[inset_0_1px_0_0_rgb(255_255_255/0.22),0_14px_36px_-12px_rgb(49_191_255/0.7)]",
  /** Quiet outline. On dark surfaces the tokens make it a glassy outline. */
  secondary: "border border-border bg-surface text-foreground hover:border-foreground/30 hover:bg-surface-elevated",
  ghost: "text-foreground hover:bg-surface",
} as const;

const sizeClasses = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-[0.9375rem]",
  xl: "h-13 px-7 text-base",
} as const;

export type ButtonVariant = keyof typeof variantClasses;
export type ButtonSize = keyof typeof sizeClasses;

interface StyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

export function buttonClassName({ variant = "primary", size = "md", className }: StyleProps = {}): string {
  return cn(baseClasses, variantClasses[variant], sizeClasses[size], className);
}

type ButtonProps = ComponentPropsWithoutRef<"button"> & StyleProps;

export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClassName({ variant, size, className })} {...props} />;
}

type ButtonLinkProps = ComponentPropsWithoutRef<typeof Link> & StyleProps;

export function ButtonLink({ variant, size, className, ...props }: ButtonLinkProps) {
  return <Link className={buttonClassName({ variant, size, className })} {...props} />;
}
