/**
 * Provider-agnostic email contract. Every transport (SMTP, Resend, …) implements
 * `EmailProvider`, so switching providers is a configuration change
 * (EMAIL_PROVIDER), not a code change in the contact endpoint.
 */
export interface EmailAddress {
  name?: string;
  address: string;
}

export interface EmailMessage {
  from: EmailAddress;
  to: string[];
  cc?: string[];
  /** Replies go to the enquirer, not to the sending mailbox. */
  replyTo?: EmailAddress;
  subject: string;
  text: string;
  html: string;
}

/**
 * Facts about a failed send, for server logs only. Providers must never put
 * credentials, message content or the environment in here.
 */
export type EmailFailureDetails = Record<string, string | number | boolean | undefined>;

export type EmailSendResult =
  | { ok: true; messageId?: string }
  | { ok: false; error: string; details?: EmailFailureDetails };

export interface EmailProvider {
  readonly name: string;
  send(message: EmailMessage): Promise<EmailSendResult>;
}

/** RFC 5322 display form: "Name" <address>. Assumes `name` has no CR/LF (sanitised upstream). */
export function formatAddress({ name, address }: EmailAddress): string {
  if (!name) return address;
  const escaped = name.replace(/["\\]/g, "\\$&");
  return `"${escaped}" <${address}>`;
}
