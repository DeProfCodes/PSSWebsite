import "server-only";

import { isValidEmail } from "@/lib/contact/validation";

/**
 * Server-only environment access. Importing this module from a Client Component
 * fails the build ("server-only"), so secrets can never reach the browser bundle.
 *
 * Readers return a result instead of throwing so the contact endpoint can answer
 * "not configured" cleanly while the reason is logged server-side only.
 */

type EnvResult<T> = { ok: true; value: T } | { ok: false; reason: string };

function read(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

export type EmailProviderName = "smtp" | "resend" | "log";

export interface ContactEmailSettings {
  provider: EmailProviderName;
  /** Plain sender address (the display name is added by the endpoint). */
  from: string;
  /** Primary PSS inbox(es). */
  to: string[];
  /** Copied on every enquiry (CONTACT_EMAIL_CC). May be empty. */
  cc: string[];
}

function readAddressList(name: string): string[] {
  return (read(name) ?? "")
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean);
}

export function readContactEmailSettings(): EnvResult<ContactEmailSettings> {
  const provider = read("EMAIL_PROVIDER")?.toLowerCase();
  if (!provider) return { ok: false, reason: "EMAIL_PROVIDER is not set" };
  if (provider !== "smtp" && provider !== "resend" && provider !== "log") {
    return { ok: false, reason: `EMAIL_PROVIDER "${provider}" is not supported (smtp | resend | log)` };
  }
  if (provider === "log" && process.env.VERCEL_ENV === "production") {
    return { ok: false, reason: 'EMAIL_PROVIDER "log" is refused in the production environment' };
  }

  const from = read("CONTACT_EMAIL_FROM");
  if (!from || !isValidEmail(from)) {
    return { ok: false, reason: "CONTACT_EMAIL_FROM is missing or not a plain email address" };
  }

  const to = readAddressList("CONTACT_EMAIL_TO");
  if (to.length === 0 || !to.every(isValidEmail)) {
    return { ok: false, reason: "CONTACT_EMAIL_TO is missing or contains an invalid address" };
  }

  // A malformed CC list is a configuration error, not something to drop silently:
  // PSS requires every enquiry to be copied.
  const cc = readAddressList("CONTACT_EMAIL_CC").filter(
    (address) => !to.some((recipient) => recipient.toLowerCase() === address.toLowerCase()),
  );
  if (!cc.every(isValidEmail)) {
    return { ok: false, reason: "CONTACT_EMAIL_CC contains an invalid address" };
  }

  return { ok: true, value: { provider, from, to, cc } };
}

export interface SmtpSettings {
  host: string;
  port: number;
  username: string;
  password: string;
}

export function readSmtpSettings(): EnvResult<SmtpSettings> {
  const host = read("SMTP_HOST");
  const port = Number(read("SMTP_PORT"));
  const username = read("SMTP_USERNAME");
  const password = read("SMTP_PASSWORD");

  if (!host) return { ok: false, reason: "SMTP_HOST is not set" };
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    return { ok: false, reason: "SMTP_PORT is missing or invalid" };
  }
  if (!username || !password) return { ok: false, reason: "SMTP_USERNAME / SMTP_PASSWORD are not set" };

  return { ok: true, value: { host, port, username, password } };
}

export function readResendApiKey(): EnvResult<string> {
  const apiKey = read("RESEND_API_KEY");
  return apiKey ? { ok: true, value: apiKey } : { ok: false, reason: "RESEND_API_KEY is not set" };
}

/** Optional. When present, the contact endpoint requires a valid Turnstile token. */
export function readTurnstileSecret(): string | undefined {
  return read("TURNSTILE_SECRET_KEY");
}
