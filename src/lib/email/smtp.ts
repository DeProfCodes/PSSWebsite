import "server-only";

import { createTransport } from "nodemailer";

import type { SmtpSettings } from "@/lib/server-env";
import type { EmailProvider } from "@/lib/email/types";

/**
 * SMTP transport (EMAIL_PROVIDER=smtp).
 *
 * TLS is mandatory: port 465 uses implicit TLS; any other port must upgrade with
 * STARTTLS (`requireTLS`) or the send fails. This deliberately fixes the legacy
 * site, which authenticated to its mail server without TLS (audit §1.13).
 */
export function createSmtpProvider(settings: SmtpSettings): EmailProvider {
  return {
    name: "smtp",
    async send(message) {
      const implicitTls = settings.port === 465;
      const transport = createTransport({
        host: settings.host,
        port: settings.port,
        secure: implicitTls,
        requireTLS: !implicitTls,
        auth: { user: settings.username, pass: settings.password },
        connectionTimeout: 10_000,
        greetingTimeout: 10_000,
        socketTimeout: 20_000,
      });

      try {
        const info = await transport.sendMail({
          from: { name: message.from.name ?? "", address: message.from.address },
          to: message.to,
          cc: message.cc && message.cc.length > 0 ? message.cc : undefined,
          replyTo: message.replyTo
            ? { name: message.replyTo.name ?? "", address: message.replyTo.address }
            : undefined,
          subject: message.subject,
          text: message.text,
          html: message.html,
        });
        return { ok: true, messageId: info.messageId };
      } catch (error) {
        // Never include credentials; nodemailer errors carry a code and server response.
        const code = (error as { code?: string }).code;
        const detail = error instanceof Error ? error.message : "Unknown SMTP error";
        return { ok: false, error: code ? `${code}: ${detail}` : detail };
      } finally {
        transport.close();
      }
    },
  };
}
