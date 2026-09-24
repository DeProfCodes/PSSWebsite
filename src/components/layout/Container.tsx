import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

const widthClasses = {
  content: "max-w-content",
  narrow: "max-w-narrow",
  wide: "max-w-wide",
} as const;

type ContainerProps = ComponentPropsWithoutRef<"div"> & {
  /** Maps to the --container-* tokens in globals.css. */
  width?: keyof typeof widthClasses;
};

/** Horizontally centred content column with responsive side gutters. */
export function Container({ width = "content", className, ...props }: ContainerProps) {
  return <div className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", widthClasses[width], className)} {...props} />;
}
