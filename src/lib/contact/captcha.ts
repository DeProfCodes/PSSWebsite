import "server-only";

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Verifies a Cloudflare Turnstile token. Only used when TURNSTILE_SECRET_KEY is
 * configured. Fails closed: network errors or timeouts count as a failed check.
 */
export async function verifyTurnstileToken({
  secret,
  token,
  remoteIp,
}: {
  secret: string;
  token: string;
  remoteIp?: string;
}): Promise<boolean> {
  if (!token) return false;

  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set("remoteip", remoteIp);

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      body,
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) return false;
    const result = (await response.json()) as { success?: boolean };
    return result.success === true;
  } catch {
    return false;
  }
}
