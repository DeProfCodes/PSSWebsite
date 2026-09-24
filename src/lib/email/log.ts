import "server-only";

import type { EmailProvider } from "@/lib/email/types";

/**
 * Development-only transport (EMAIL_PROVIDER=log): sends nothing and logs a
 * redacted summary, so the contact flow can be exercised end to end without
 * delivering real email. Refused in production by readContactEmailSettings().
 */
export function createLogProvider(): EmailProvider {
  return {
    name: "log",
    async send(message) {
      console.info("[email:log] Email NOT sent (EMAIL_PROVIDER=log). Summary:", {
        to: message.to,
        cc: message.cc ?? [],
        hasReplyTo: Boolean(message.replyTo),
        subjectLength: message.subject.length,
        textLength: message.text.length,
      });
      return { ok: true, messageId: "log-only" };
    },
  };
}
