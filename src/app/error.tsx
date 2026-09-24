"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { routes } from "@/config/routes";

/** Error boundary for all routes below the root layout (the legacy site showed a blank 500). */
export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="theme-dark relative isolate mt-[calc(var(--header-height)*-1)] min-h-[70vh] overflow-hidden bg-ink-950 pt-(--header-height)">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-tech-grid opacity-70" />
      <Container width="wide" className="py-24 sm:py-32">
        <p className="font-mono text-[0.8125rem] tracking-[0.2em] text-accent uppercase">Something went wrong</p>
        <h1 className="mt-6 text-display-2 text-foreground">We couldn&apos;t load this page.</h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
          Please try again. If it keeps happening,{" "}
          <Link href={routes.contact} className="font-semibold text-accent underline-offset-4 hover:underline">
            contact us
          </Link>
          .
        </p>
        <div className="mt-10">
          <Button size="xl" onClick={() => retry()}>
            Try again
          </Button>
        </div>
      </Container>
    </section>
  );
}
