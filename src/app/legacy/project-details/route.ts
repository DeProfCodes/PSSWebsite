import { NextResponse, type NextRequest } from "next/server";

import { resolveLegacyProjectPath } from "@/lib/legacy";

/**
 * Target of the rewrite for legacy /Projects/ProjectDetails URLs (next.config.ts).
 * Answers with a permanent 308 to the clean project URL — without the old query
 * string — or to /projects when the project is unknown. See docs/LEGACY_REDIRECTS.md.
 */

/** ASP.NET model binding ignored query-key casing, so this does too. */
function getQueryValue(request: NextRequest, name: string): string | null {
  const wanted = name.toLowerCase();
  for (const [key, value] of request.nextUrl.searchParams) {
    if (key.toLowerCase() === wanted) return value;
  }
  return null;
}

function redirectLegacyProject(request: NextRequest): NextResponse {
  const target = resolveLegacyProjectPath(
    getQueryValue(request, "projectNameType"),
    getQueryValue(request, "projectType"),
  );
  return NextResponse.redirect(new URL(target, request.nextUrl.origin), 308);
}

export const GET = redirectLegacyProject;
export const HEAD = redirectLegacyProject;
