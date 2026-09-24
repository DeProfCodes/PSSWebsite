import "server-only";

import { formatAddress, type EmailProvider } from "@/lib/email/types";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

/**
 * Resend transport (EMAIL_PROVIDER=resend) over its HTTP API — no SDK dependency.
 * The CONTACT_EMAIL_FROM domain must be verified in Resend.
 */
export function createResendProvider(apiKey: string): EmailProvider {
  return {
    name: "resend",
    async send(message) {
      try {
        const response = await fetch(RESEND_ENDPOINT, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: formatAddress(message.from),
            to: message.to,
            ...(message.cc && message.cc.length > 0 ? { cc: message.cc } : {}),
            subject: message.subject,
            text: message.text,
            html: message.html,
            ...(message.replyTo ? { reply_to: formatAddress(message.replyTo) } : {}),
          }),
          signal: AbortSignal.timeout(10_000),
        });

        if (!response.ok) {
          return { ok: false, error: `Resend responded with HTTP ${response.status}` };
        }
        const data = (await response.json().catch(() => ({}))) as { id?: string };
        return { ok: true, messageId: data.id };
      } catch (error) {
        return { ok: false, error: error instanceof Error ? error.message : "Unknown Resend error" };
      }
    },
  };
}
