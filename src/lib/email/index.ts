import "server-only";

import { createLogProvider } from "@/lib/email/log";
import { createResendProvider } from "@/lib/email/resend";
import { createSmtpProvider } from "@/lib/email/smtp";
import type { EmailProvider } from "@/lib/email/types";
import {
  readContactEmailSettings,
  readResendApiKey,
  readSmtpSettings,
  type ContactEmailSettings,
} from "@/lib/server-env";

export type ContactEmailTransport =
  | { ok: true; provider: EmailProvider; settings: ContactEmailSettings }
  | { ok: false; reason: string };

/**
 * Resolves the configured email transport for contact enquiries.
 * To add another provider: implement EmailProvider in this folder, add its name
 * to EmailProviderName (server-env.ts) and a branch below.
 */
export function getContactEmailTransport(): ContactEmailTransport {
  const settings = readContactEmailSettings();
  if (!settings.ok) return settings;

  switch (settings.value.provider) {
    case "smtp": {
      const smtp = readSmtpSettings();
      if (!smtp.ok) return smtp;
      return { ok: true, provider: createSmtpProvider(smtp.value), settings: settings.value };
    }
    case "resend": {
      const apiKey = readResendApiKey();
      if (!apiKey.ok) return apiKey;
      return { ok: true, provider: createResendProvider(apiKey.value), settings: settings.value };
    }
    case "log":
      return { ok: true, provider: createLogProvider(), settings: settings.value };
  }
}
