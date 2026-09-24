import "server-only";

import { siteConfig } from "@/config/site";
import { verifyTurnstileToken } from "@/lib/contact/captcha";
import { buildEnquiryEmail } from "@/lib/contact/email-content";
import { contactRateLimiter } from "@/lib/contact/rate-limit";
import { HONEYPOT_FIELD, validateContactSubmission } from "@/lib/contact/validation";
import { getContactEmailTransport } from "@/lib/email";
import { readTurnstileSecret } from "@/lib/server-env";
import type {
  ContactErrorCode,
  ContactErrorResponse,
  ContactFieldErrors,
  ContactSuccessResponse,
} from "@/types/contact";

/**
 * POST /api/contact pipeline:
 *   content-type → same-origin → size → JSON → rate limit → honeypot →
 *   validation/sanitisation → captcha (optional) → transport → send
 *
 * The visitor only ever sees success when the provider accepted the message.
 * Configuration problems and provider errors are logged server-side without
 * the visitor's message content.
 */

const MAX_BODY_BYTES = 16 * 1024;

const SUCCESS_MESSAGE =
  "Your message has been sent to our team and will be attended to shortly.";

function json(body: ContactSuccessResponse | ContactErrorResponse, status: number, headers?: HeadersInit) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });
}

function success() {
  return json({ ok: true, message: SUCCESS_MESSAGE }, 200);
}

function failure(
  status: number,
  error: ContactErrorCode,
  message: string,
  extras: { fieldErrors?: ContactFieldErrors; headers?: HeadersInit } = {},
) {
  return json(
    { ok: false, error, message, ...(extras.fieldErrors ? { fieldErrors: extras.fieldErrors } : {}) },
    status,
    extras.headers,
  );
}

/** Browsers always send Origin on POST; reject submissions coming from another site. */
function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/** Vercel sets these headers itself; elsewhere they are client-controlled and only best-effort. */
function getClientIp(request: Request): string | undefined {
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function handleContactRequest(request: Request): Promise<Response> {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.startsWith("application/json")) {
    return failure(415, "unsupported_media_type", "Please send the enquiry as JSON.");
  }

  if (!isSameOrigin(request)) {
    return failure(403, "forbidden_origin", "Submissions from other websites are not accepted.");
  }

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return failure(413, "payload_too_large", "Your message is too long.");
  }
  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
    return failure(413, "payload_too_large", "Your message is too long.");
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return failure(400, "invalid_json", "The request could not be read.");
  }
  if (!isRecord(body)) {
    return failure(400, "invalid_json", "The request could not be read.");
  }

  const clientIp = getClientIp(request);
  const rateLimit = await contactRateLimiter.check(clientIp ?? "unknown");
  if (!rateLimit.allowed) {
    return failure(429, "rate_limited", "Too many messages in a short time. Please try again later.", {
      headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
    });
  }

  // Honeypot filled → almost certainly a bot. Answer like a success so the bot
  // learns nothing, but send nothing.
  const honeypot = body[HONEYPOT_FIELD];
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    console.info("[contact] Honeypot triggered — submission discarded.");
    return success();
  }

  const validation = validateContactSubmission(body);
  if (!validation.success) {
    return failure(422, "validation_failed", "Please correct the highlighted fields.", {
      fieldErrors: validation.fieldErrors,
    });
  }

  const turnstileSecret = readTurnstileSecret();
  if (turnstileSecret) {
    const token = typeof body.turnstileToken === "string" ? body.turnstileToken : "";
    const passed = await verifyTurnstileToken({ secret: turnstileSecret, token, remoteIp: clientIp });
    if (!passed) {
      return failure(400, "captcha_failed", "We could not verify that you are human. Please try again.");
    }
  }

  const transport = getContactEmailTransport();
  if (!transport.ok) {
    console.error(`[contact] Email delivery is not configured: ${transport.reason}`);
    return failure(
      503,
      "not_configured",
      "Our contact form is temporarily unavailable. Please email or call us directly.",
    );
  }

  if (transport.settings.cc.length === 0 && process.env.VERCEL_ENV === "production") {
    console.warn("[contact] CONTACT_EMAIL_CC is not set — this enquiry is not being copied.");
  }

  const content = buildEnquiryEmail(validation.data, { receivedAt: new Date(), siteUrl: siteConfig.url });
  const result = await transport.provider.send({
    from: { name: `${siteConfig.name} Website`, address: transport.settings.from },
    to: transport.settings.to,
    cc: transport.settings.cc,
    replyTo: { name: validation.data.name, address: validation.data.email },
    ...content,
  });

  if (!result.ok) {
    console.error(`[contact] Delivery via ${transport.provider.name} failed: ${result.error}`);
    return failure(
      502,
      "delivery_failed",
      "We couldn't send your message right now. Please try again, or email or call us directly.",
    );
  }

  return success();
}
