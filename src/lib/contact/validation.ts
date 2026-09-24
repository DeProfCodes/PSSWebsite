import type { ContactFieldErrors, ContactSubmission, ContactTopic } from "@/types/contact";

/**
 * Contact form validation and sanitisation.
 *
 * Framework-free and side-effect-free so the SAME rules run in the browser
 * (instant feedback in the form) and on the server (authoritative).
 */

export const CONTACT_LIMITS = {
  name: { max: 100 },
  company: { max: 120 },
  email: { max: 254 },
  phone: { max: 32 },
  message: { min: 10, max: 5000 },
} as const;

export const CONTACT_TOPICS: readonly ContactTopic[] = [
  "new-project",
  "improve-existing",
  "consultation",
  "support",
  "other",
];

/**
 * Honeypot field name. The form renders it visually hidden; humans leave it
 * empty. Reserved — do not use "website" as a real form field.
 */
export const HONEYPOT_FIELD = "website";

function stripUnsafeCharacters(value: string): string {
  let result = "";
  for (const character of value) {
    const code = character.codePointAt(0) ?? 0;
    const isAllowedWhitespace = code === 0x09 || code === 0x0a || code === 0x0d;
    const isControl = code < 0x20 || (code >= 0x7f && code <= 0x9f);
    const isBidiOverride = (code >= 0x202a && code <= 0x202e) || (code >= 0x2066 && code <= 0x2069);
    if ((isControl && !isAllowedWhitespace) || isBidiOverride) continue;
    result += character;
  }
  return result;
}

/** For values that may end up in email headers: no line breaks. */
export function sanitizeSingleLine(value: unknown): string {
  if (typeof value !== "string") return "";
  return stripUnsafeCharacters(value).replace(/\s+/g, " ").trim();
}

/** For the message body: normalised line endings, no runs of blank lines. */
export function sanitizeMultiLine(value: unknown): string {
  if (typeof value !== "string") return "";
  return stripUnsafeCharacters(value.replace(/\r\n?/g, "\n"))
    .replace(/[^\S\n]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const EMAIL_PATTERN = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:".]{2,}$/;
const PHONE_PATTERN = /^\+?[0-9 ()-]{7,}$/;

export function isValidEmail(value: string): boolean {
  return value.length <= CONTACT_LIMITS.email.max && EMAIL_PATTERN.test(value);
}

function isContactTopic(value: string): value is ContactTopic {
  return (CONTACT_TOPICS as readonly string[]).includes(value);
}

export type ContactValidationResult =
  | { success: true; data: ContactSubmission }
  | { success: false; fieldErrors: ContactFieldErrors };

export function validateContactSubmission(input: Record<string, unknown>): ContactValidationResult {
  const name = sanitizeSingleLine(input.name);
  const company = sanitizeSingleLine(input.company);
  const email = sanitizeSingleLine(input.email);
  const phone = sanitizeSingleLine(input.phone);
  const topic = sanitizeSingleLine(input.topic);
  const message = sanitizeMultiLine(input.message);

  const fieldErrors: ContactFieldErrors = {};

  if (!name) fieldErrors.name = "Please enter your name.";
  else if (name.length > CONTACT_LIMITS.name.max) fieldErrors.name = "Please shorten your name.";

  if (company.length > CONTACT_LIMITS.company.max) fieldErrors.company = "Please shorten the company name.";

  if (!isValidEmail(email)) fieldErrors.email = "Please enter a valid email address.";

  if (phone && (phone.length > CONTACT_LIMITS.phone.max || !PHONE_PATTERN.test(phone))) {
    fieldErrors.phone = "Please enter a valid phone number, or leave it blank.";
  }

  if (!isContactTopic(topic)) fieldErrors.topic = "Please choose what you need.";

  if (!message) fieldErrors.message = "Please tell us a little about your project.";
  else if (message.length < CONTACT_LIMITS.message.min) {
    fieldErrors.message = `Please write at least ${CONTACT_LIMITS.message.min} characters.`;
  } else if (message.length > CONTACT_LIMITS.message.max) {
    fieldErrors.message = `Please keep your message under ${CONTACT_LIMITS.message.max.toLocaleString("en-ZA")} characters.`;
  }

  if (Object.keys(fieldErrors).length > 0 || !isContactTopic(topic)) {
    return { success: false, fieldErrors };
  }

  return {
    success: true,
    data: {
      name,
      email,
      topic,
      message,
      ...(company ? { company } : {}),
      ...(phone ? { phone } : {}),
    },
  };
}
