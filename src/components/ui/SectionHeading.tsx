import type { ReactNode } from "react";

import { Eyebrow } from "@/components/ui/Eyebrow";
import { cn } from "@/lib/utils";

export type HeadingText = string | { lead: string; emphasis: string };

/** Renders a headline; the two-part form puts the emphasis on its own line. */
export function HeadingContent({ text }: { text: HeadingText }) {
  if (typeof text === "string") return <>{text}</>;
  return (
    <>
      <span className="block">{text.lead}</span>
      <span className="block text-emphasis">{text.emphasis}</span>
    </>
  );
}

interface SectionHeadingProps {
  id?: string;
  eyebrow?: string;
  title: HeadingText;
  lead?: ReactNode;
  as?: "h1" | "h2" | "h3";
  align?: "left" | "center";
  size?: "lg" | "md";
  className?: string;
}

/** Eyebrow + headline + lead, sized from the shared display scale. */
export function SectionHeading({
  id,
  eyebrow,
  title,
  lead,
  as: Heading = "h2",
  align = "left",
  size = "lg",
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn(align === "center" && "mx-auto text-center", className)}>
      {eyebrow ? <Eyebrow className={cn("mb-5", align === "center" && "justify-center")}>{eyebrow}</Eyebrow> : null}
      <Heading id={id} className={cn(size === "lg" ? "text-display-2" : "text-display-3", "text-foreground")}>
        <HeadingContent text={title} />
      </Heading>
      {lead ? (
        <p
          className={cn(
            "mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground",
            align === "center" && "mx-auto",
          )}
        >
          {lead}
        </p>
      ) : null}
    </div>
  );
}
