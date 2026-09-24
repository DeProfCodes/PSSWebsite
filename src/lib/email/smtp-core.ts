import { createTransport } from "nodemailer";

import type { SmtpSettings } from "@/lib/server-env";

/**
 * SMTP connection rules and failure diagnosis, shared by the contact endpoint
 * (src/lib/email/smtp.ts) and the `npm run email:verify` check
 * (scripts/email-verify.mjs), so both connect in exactly the same way.
 *
 * Plain Node loads this file directly (native TypeScript type stripping), so it
 * has no `server-only` or runtime `@/` imports and uses only erasable
 * TypeScript syntax. It holds no secrets: callers pass the settings in.
 */

/** Fail fast: a dead mail server must not hold a serverless function open. */
export const SMTP_TIMEOUTS = {
  dnsTimeout: 5_000,
  connectionTimeout: 5_000,
  greetingTimeout: 5_000,
  socketTimeout: 10_000,
} as const;

/** Hard cap on one complete exchange (connect → TLS → AUTH → MAIL/RCPT → DATA). */
export const SMTP_DEADLINE_MS = 15_000;

/**
 * Standard submission rules, derived from the port:
 * - 465: implicit TLS from the first byte (`secure: true`).
 * - any other port (587, 25, …): plain connect, then a mandatory STARTTLS
 *   upgrade (`requireTLS`). A server that doesn't offer STARTTLS fails with
 *   ETLS before any credentials are sent — authentication never happens in
 *   plaintext.
 * Certificates are always validated against SMTP_HOST (Node's default). Never
 * disable validation (`rejectUnauthorized: false`) to work around a
 * configuration problem.
 */
export function getSmtpSecurity(port: number) {
  const secure = port === 465;
  return { secure, requireTLS: !secure, mode: secure ? "implicit TLS" : "STARTTLS (required)" } as const;
}

export function createSmtpTransport(settings: SmtpSettings) {
  const { secure, requireTLS } = getSmtpSecurity(settings.port);
  return createTransport({
    host: settings.host,
    port: settings.port,
    secure,
    requireTLS,
    auth: { user: settings.username, pass: settings.password },
    ...SMTP_TIMEOUTS,
  });
}

/** Rejects with an ETIMEDOUT error (command "DEADLINE") when `promise` takes longer than `ms`. */
export function withSmtpDeadline<T>(promise: Promise<T>, ms: number = SMTP_DEADLINE_MS): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(Object.assign(new Error(`SMTP exchange exceeded ${ms} ms`), { code: "ETIMEDOUT", command: "DEADLINE" }));
    }, ms);
  });
  return Promise.race([promise, deadline]).finally(() => clearTimeout(timer));
}

// ---------------------------------------------------------------------------
// Failure diagnosis
// ---------------------------------------------------------------------------

/** Where the exchange failed, in the order an SMTP session happens. */
export type SmtpFailureStage =
  | "dns"
  | "connection"
  | "timeout"
  | "tls"
  | "authentication"
  | "sender"
  | "recipient"
  | "message"
  | "protocol"
  | "unknown";

/** Safe to log: never contains credentials, message content or the environment. */
export interface SmtpFailureDiagnosis {
  stage: SmtpFailureStage;
  /** Nodemailer error code, e.g. "ETLS", "EAUTH". */
  code?: string;
  /** Underlying network/TLS condition when recognisable, e.g. "ENOTFOUND", "ERR_TLS_CERT_ALTNAME_INVALID". */
  cause?: string;
  /** SMTP step that failed: "CONN", "STARTTLS", "AUTH PLAIN", "MAIL FROM", "RCPT TO", "DATA"… */
  command?: string;
  /** SMTP reply code from the server, when it sent one. */
  responseCode?: number;
  /** The error message, single line, secrets removed, truncated. */
  message: string;
  /** What to check, in plain words. */
  hint: string;
}

// Nodemailer replaces the system error code (ENOTFOUND, ECONNREFUSED,
// ERR_TLS_*) with its own (EDNS, ESOCKET, ETLS), but keeps it in the message.
const CAUSES: ReadonlyArray<readonly [RegExp, string]> = [
  [/\bENOTFOUND\b/, "ENOTFOUND"],
  [/\bEAI_AGAIN\b/, "EAI_AGAIN"],
  [/\bECONNREFUSED\b/, "ECONNREFUSED"],
  [/\bEHOSTUNREACH\b/, "EHOSTUNREACH"],
  [/\bENETUNREACH\b/, "ENETUNREACH"],
  [/\bECONNRESET\b/, "ECONNRESET"],
  [/altnames/i, "ERR_TLS_CERT_ALTNAME_INVALID"],
  [/certificate has expired/i, "CERT_HAS_EXPIRED"],
  [/self[- ]signed certificate/i, "SELF_SIGNED_CERT_IN_CHAIN"],
  [/unable to (?:verify|get local issuer)/i, "UNABLE_TO_VERIFY_LEAF_SIGNATURE"],
  [/wrong version number|unknown protocol|packet length too long/i, "TLS_PROTOCOL_MISMATCH"],
];

const UNTRUSTED_CERTIFICATE = new Set(["CERT_HAS_EXPIRED", "SELF_SIGNED_CERT_IN_CHAIN", "UNABLE_TO_VERIFY_LEAF_SIGNATURE"]);
const CONNECTION_FAILURE = new Set(["ECONNREFUSED", "EHOSTUNREACH", "ENETUNREACH", "ECONNRESET"]);

function secretsOf(settings: SmtpSettings): string[] {
  const { username, password } = settings;
  const base64 = (value: string) => Buffer.from(value, "utf8").toString("base64");
  // Plain and base64 forms, as used by AUTH PLAIN / AUTH LOGIN.
  return [password, base64(password), base64(`\u0000${username}\u0000${password}`)].filter((secret) => secret.length >= 3);
}

function redact(text: string, secrets: string[]): string {
  let result = text.replace(/\s+/g, " ").trim();
  for (const secret of secrets) result = result.split(secret).join("[redacted]");
  return result.length > 300 ? `${result.slice(0, 299)}…` : result;
}

function stringField(source: object, key: string): string | undefined {
  const value = (source as Record<string, unknown>)[key];
  return typeof value === "string" ? value : undefined;
}

export function diagnoseSmtpError(error: unknown, settings: SmtpSettings): SmtpFailureDiagnosis {
  const source = typeof error === "object" && error !== null ? error : {};
  const rawMessage = stringField(source, "message") ?? String(error);
  const code = stringField(source, "code");
  const command = stringField(source, "command");
  const responseCodeValue = (source as Record<string, unknown>).responseCode;
  const responseCode = typeof responseCodeValue === "number" ? responseCodeValue : undefined;
  const cause = CAUSES.find(([pattern]) => pattern.test(`${code ?? ""} ${rawMessage}`))?.[1];

  const { secure } = getSmtpSecurity(settings.port);
  const where = `${settings.host}:${settings.port}`;
  const reply = responseCode ? ` (server replied ${responseCode})` : "";
  const facts = { code, cause, command, responseCode, message: redact(rawMessage, secretsOf(settings)) };
  const result = (stage: SmtpFailureStage, hint: string): SmtpFailureDiagnosis => ({ stage, ...facts, hint });

  if (code === "EDNS" || cause === "ENOTFOUND" || cause === "EAI_AGAIN") {
    return result("dns", `DNS lookup for "${settings.host}" failed. Check SMTP_HOST against the outgoing-mail server name supplied by the mail provider.`);
  }
  if (cause === "ERR_TLS_CERT_ALTNAME_INVALID") {
    return result(
      "tls",
      `The TLS certificate on ${where} is not issued for "${settings.host}". Set SMTP_HOST to the server name the certificate covers (the mail provider's own SMTP host name). Do not disable certificate validation.`,
    );
  }
  if (cause && UNTRUSTED_CERTIFICATE.has(cause)) {
    return result("tls", `The TLS certificate on ${where} is not trusted (${cause}). The mail provider must fix it; do not disable certificate validation.`);
  }
  if (cause === "TLS_PROTOCOL_MISMATCH") {
    return result(
      "tls",
      secure
        ? `Port ${settings.port} did not answer with TLS. Check that SMTP_PORT is the provider's SSL/TLS port (normally 465).`
        : `TLS negotiation failed on ${where}. Check that SMTP_PORT is the provider's STARTTLS port (normally 587).`,
    );
  }
  if (code === "ETLS") {
    return result(
      "tls",
      command === "STARTTLS"
        ? `${where} does not offer STARTTLS${reply}: this port only speaks plaintext SMTP, so no credentials were sent. Use the provider's TLS submission port — 465 (implicit TLS) or 587 (STARTTLS).`
        : `TLS could not be established with ${where}. Check SMTP_PORT (465 = implicit TLS, 587 = STARTTLS).`,
    );
  }
  if (code === "ETIMEDOUT") {
    if (command === "DEADLINE") {
      return result("timeout", `The whole SMTP exchange took longer than ${SMTP_DEADLINE_MS / 1000} s and was abandoned. The server is too slow or unreachable from here.`);
    }
    if (/greeting/i.test(rawMessage)) {
      return result(
        "timeout",
        `Connected to ${where}, but no SMTP greeting arrived within ${SMTP_TIMEOUTS.greetingTimeout / 1000} s. The port may expect implicit TLS (use 465), or the server is not an SMTP server.`,
      );
    }
    return result(
      "timeout",
      `No response from ${where} in time. The host may be unreachable from this network, or the port blocked (some mail hosts block cloud and data-centre IP ranges).`,
    );
  }
  if ((cause && CONNECTION_FAILURE.has(cause)) || code === "ESOCKET" || code === "ECONNECTION") {
    return result(
      "connection",
      `The TCP connection to ${where} failed${cause ? ` (${cause})` : ""}. Nothing accepted SMTP on this port from here — check SMTP_PORT, or whether the provider blocks this network.`,
    );
  }
  if (code === "EAUTH" || code === "ENOAUTH") {
    return result(
      "authentication",
      `The server rejected the login${reply}. Check SMTP_USERNAME / SMTP_PASSWORD and that SMTP sending is enabled for the mailbox.`,
    );
  }
  if (code === "EENVELOPE") {
    return command === "MAIL FROM"
      ? result("sender", `The server refused CONTACT_EMAIL_FROM as the sender${reply}. It must be the authenticated mailbox, or an address that mailbox may send as.`)
      : result("recipient", `The server refused the recipient(s) in CONTACT_EMAIL_TO / CONTACT_EMAIL_CC${reply}.`);
  }
  if (code === "EMESSAGE" || command === "DATA" || (responseCode !== undefined && responseCode >= 500)) {
    return result("message", `The server refused the message itself${reply} after accepting the sender and recipients (content, size or sending-policy rejection).`);
  }
  if (code === "EPROTOCOL") {
    return result("protocol", `Unexpected SMTP response from ${where}${reply}.`);
  }
  return result("unknown", `Unexpected SMTP failure talking to ${where}.`);
}
