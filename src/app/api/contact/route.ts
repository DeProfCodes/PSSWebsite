import { handleContactRequest } from "@/lib/contact/handler";

/**
 * POST /api/contact — website enquiries.
 * Contract: src/types/contact.ts. Pipeline and configuration: src/lib/contact/handler.ts,
 * README.md → "Environment variables". Other methods receive 405 automatically.
 */
export const runtime = "nodejs"; // nodemailer needs Node.js APIs

// Headroom above the SMTP deadline (15 s, src/lib/email/smtp-core.ts), so a slow
// mail server ends in a logged, diagnosed failure rather than a platform timeout.
export const maxDuration = 30;

export async function POST(request: Request): Promise<Response> {
  return handleContactRequest(request);
}
