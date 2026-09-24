import "server-only";

/**
 * Rate limiting for the contact endpoint.
 *
 * The in-memory limiter below is a best-effort first line of defence: on Vercel
 * each function instance has its own memory, so limits are per instance and
 * reset on cold starts. For a hard guarantee, swap in a shared store
 * (e.g. Upstash Redis / Vercel KV) that implements the same `RateLimiter`
 * interface, and/or add a Vercel Firewall rate-limit rule for /api/contact.
 * See docs/ARCHITECTURE.md → "Contact endpoint".
 */
export interface RateLimitResult {
  allowed: boolean;
  /** Seconds until the window resets (0 when allowed). */
  retryAfterSeconds: number;
}

export interface RateLimiter {
  check(key: string): Promise<RateLimitResult>;
}

interface WindowState {
  count: number;
  resetAt: number;
}

const MAX_TRACKED_KEYS = 10_000;

export function createMemoryRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }): RateLimiter {
  const windows = new Map<string, WindowState>();

  function prune(now: number): void {
    for (const [key, state] of windows) {
      if (state.resetAt <= now) windows.delete(key);
    }
  }

  return {
    async check(key) {
      const now = Date.now();
      if (windows.size > MAX_TRACKED_KEYS) prune(now);

      const state = windows.get(key);
      if (!state || state.resetAt <= now) {
        windows.set(key, { count: 1, resetAt: now + windowMs });
        return { allowed: true, retryAfterSeconds: 0 };
      }

      state.count += 1;
      if (state.count > limit) {
        return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((state.resetAt - now) / 1000)) };
      }
      return { allowed: true, retryAfterSeconds: 0 };
    },
  };
}

/** 5 submissions per client IP per 10 minutes. */
export const contactRateLimiter: RateLimiter = createMemoryRateLimiter({
  limit: 5,
  windowMs: 10 * 60 * 1000,
});
