import "server-only";

import { createSmtpTransport, diagnoseSmtpError, getSmtpSecurity, withSmtpDeadline } from "@/lib/email/smtp-core";
import type { EmailProvider } from "@/lib/email/types";
import type { SmtpSettings } from "@/lib/server-env";

/**
 * SMTP transport (EMAIL_PROVIDER=smtp).
 *
 * TLS is mandatory: port 465 uses implicit TLS; any other port must upgrade with
 * STARTTLS or the send fails before authentication. This deliberately fixes the
 * legacy site, which authenticated to its mail server without TLS (audit §1.13).
 * Connection rules, timeouts and failure diagnosis live in smtp-core.ts (shared
 * with `npm run email:verify`).
 *
 * Success is returned only once the server has accepted the message (its reply
 * to DATA). Failures return a secret-free diagnosis for the server log.
 */
export function createSmtpProvider(settings: SmtpSettings): EmailProvider {
  return {
    name: "smtp",
    async send(message) {
      const transport = createSmtpTransport(settings);
      try {
        const info = await withSmtpDeadline(
          transport.sendMail({
            from: { name: message.from.name ?? "", address: message.from.address },
            to: message.to,
            cc: message.cc && message.cc.length > 0 ? message.cc : undefined,
            replyTo: message.replyTo
              ? { name: message.replyTo.name ?? "", address: message.replyTo.address }
              : undefined,
            subject: message.subject,
            text: message.text,
            html: message.html,
          }),
        );
        if (info.rejected.length > 0) {
          // Accepted for at least one recipient, so the enquiry reached PSS — but say who was refused.
          console.warn(`[email:smtp] Server refused some recipients: ${JSON.stringify({ rejected: info.rejected })}`);
        }
        return { ok: true, messageId: info.messageId };
      } catch (error) {
        const diagnosis = diagnoseSmtpError(error, settings);
        return {
          ok: false,
          error: `${diagnosis.stage}: ${diagnosis.message}`,
          details: {
            host: settings.host,
            port: settings.port,
            secure: getSmtpSecurity(settings.port).secure,
            ...diagnosis,
          },
        };
      } finally {
        transport.close();
      }
    },
  };
}
