/**
 * Request/response contract for POST /api/contact.
 * Shared by the server route and the contact form.
 */

/** "What do you need?" options. Labels live in src/data/contact.ts. */
export type ContactTopic = "new-project" | "improve-existing" | "consultation" | "support" | "other";

export type ContactField = "name" | "company" | "email" | "phone" | "topic" | "message";

/** JSON body the client sends. */
export interface ContactRequestBody {
  name: string;
  company?: string;
  email: string;
  phone?: string;
  topic: ContactTopic;
  message: string;
  /** Honeypot — rendered hidden in the form; humans leave it empty. */
  website?: string;
  /** Cloudflare Turnstile token — required only when TURNSTILE_SECRET_KEY is configured. */
  turnstileToken?: string;
}

/** A validated, sanitised submission. */
export interface ContactSubmission {
  name: string;
  company?: string;
  email: string;
  phone?: string;
  topic: ContactTopic;
  message: string;
}

export type ContactFieldErrors = Partial<Record<ContactField, string>>;

export type ContactErrorCode =
  | "unsupported_media_type"
  | "forbidden_origin"
  | "payload_too_large"
  | "invalid_json"
  | "rate_limited"
  | "validation_failed"
  | "captcha_failed"
  | "not_configured"
  | "delivery_failed";

export interface ContactSuccessResponse {
  ok: true;
  message: string;
}

export interface ContactErrorResponse {
  ok: false;
  error: ContactErrorCode;
  message: string;
  fieldErrors?: ContactFieldErrors;
}

export type ContactResponse = ContactSuccessResponse | ContactErrorResponse;
