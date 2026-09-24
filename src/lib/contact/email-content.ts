import { getTopicLabel } from "@/data/contact";
import type { ContactSubmission } from "@/types/contact";

/**
 * Internal notification email for a website enquiry.
 *
 * Deliberately simple and robust: table layout with inline styles (the only
 * reliable approach across email clients), fluid up to 600 px, light background
 * so it reads well in every client, and a plain-text alternative. Branding is
 * limited to the current PSS logo and name — a full transactional-email design
 * will follow the new brand system later. The legacy template is not reused.
 *
 * All visitor input is HTML-escaped (the legacy site inserted it raw).
 */

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => HTML_ESCAPES[character] ?? character);
}

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

/** Submission time in the business's time zone, e.g. "Tuesday, 23 September 2026 at 15:04 SAST". */
function formatSubmissionTime(date: Date): string {
  const formatted = new Intl.DateTimeFormat("en-ZA", {
    timeZone: "Africa/Johannesburg",
    dateStyle: "full",
    timeStyle: "short",
  }).format(date);
  return `${formatted} SAST`;
}

export interface EnquiryEmailContent {
  subject: string;
  text: string;
  html: string;
}

interface EnquiryEmailOptions {
  receivedAt: Date;
  /** Production origin — used for the hosted logo and the footer link. */
  siteUrl: string;
}

const BRAND_NAME = "Proficient Software Solutions";
/** Hosted on the website itself. Until the site is live on its domain, clients show the alt text. */
const LOGO_PATH = "/images/brand/Logo.png";

export function buildEnquiryEmail(
  submission: ContactSubmission,
  { receivedAt, siteUrl }: EnquiryEmailOptions,
): EnquiryEmailContent {
  const topic = getTopicLabel(submission.topic);
  const from = submission.company ? `${submission.name} (${submission.company})` : submission.name;
  const subject = truncate(`Website enquiry: ${topic} — ${from}`, 200);
  const submittedAt = formatSubmissionTime(receivedAt);
  const logoUrl = new URL(LOGO_PATH, `${siteUrl}/`).toString();
  const siteHost = new URL(siteUrl).host;

  const text = [
    `New website enquiry — ${BRAND_NAME}`,
    "",
    `Name:      ${submission.name}`,
    ...(submission.company ? [`Company:   ${submission.company}`] : []),
    `Email:     ${submission.email}`,
    ...(submission.phone ? [`Phone:     ${submission.phone}`] : []),
    `Needs:     ${topic}`,
    `Submitted: ${submittedAt}`,
    "",
    "Message:",
    submission.message,
    "",
    "—",
    `Reply to this email to respond directly to ${submission.name}.`,
    `Sent from the contact form on ${siteHost}.`,
  ].join("\n");

  const label = "font-size:12px;line-height:18px;color:#5b6b80;text-transform:uppercase;letter-spacing:0.06em;padding:0 0 4px 0;";
  const value = "font-size:15px;line-height:22px;color:#0b1424;padding:0 0 16px 0;word-break:break-word;";
  const field = (name: string, content: string) =>
    `<tr><td style="${label}">${name}</td></tr><tr><td style="${value}">${content}</td></tr>`;

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:#eef2f7;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(truncate(`${from}: ${topic}`, 120))}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#eef2f7;">
  <tr>
    <td align="center" style="padding:24px 12px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background-color:#ffffff;border-radius:12px;border:1px solid #dbe3ee;font-family:Arial,Helvetica,sans-serif;">
        <tr>
          <td style="padding:24px 28px 20px 28px;border-bottom:1px solid #e6ebf2;">
            <img src="${escapeHtml(logoUrl)}" width="120" height="29" alt="${BRAND_NAME}" style="display:block;border:0;outline:none;text-decoration:none;height:auto;max-width:120px;font-size:16px;font-weight:bold;color:#0b72c7;">
          </td>
        </tr>
        <tr>
          <td style="padding:24px 28px 8px 28px;">
            <p style="margin:0 0 4px 0;font-size:20px;line-height:28px;font-weight:bold;color:#0b1424;">New website enquiry</p>
            <p style="margin:0 0 24px 0;font-size:14px;line-height:20px;color:#5b6b80;">${escapeHtml(submittedAt)}</p>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
              ${field("Name", escapeHtml(submission.name))}
              ${submission.company ? field("Company", escapeHtml(submission.company)) : ""}
              ${field("Email", `<a href="mailto:${escapeHtml(submission.email)}" style="color:#0b72c7;text-decoration:underline;">${escapeHtml(submission.email)}</a>`)}
              ${submission.phone ? field("Phone", `<a href="tel:${escapeHtml(submission.phone.replace(/[^+0-9]/g, ""))}" style="color:#0b72c7;text-decoration:underline;">${escapeHtml(submission.phone)}</a>`) : ""}
              ${field("What they need", escapeHtml(topic))}
              <tr><td style="${label}">Message</td></tr>
              <tr>
                <td style="font-size:15px;line-height:23px;color:#0b1424;padding:12px 14px;background-color:#f4f7fb;border-radius:8px;white-space:pre-wrap;word-break:break-word;">${escapeHtml(submission.message)}</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 28px 24px 28px;">
            <p style="margin:0;font-size:13px;line-height:20px;color:#5b6b80;">Reply to this email to respond directly to ${escapeHtml(submission.name)}. Sent from the contact form on ${escapeHtml(siteHost)}.</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  return { subject, text, html };
}
