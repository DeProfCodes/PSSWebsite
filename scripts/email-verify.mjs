/**
 * npm run email:verify [-- --env-file=<path>]
 *
 * Checks the contact-form SMTP transport WITHOUT sending an email:
 *   configuration → DNS → TCP + TLS + AUTH (Nodemailer transporter.verify()).
 * It uses the same connection rules as the website (src/lib/email/smtp-core.ts).
 * Sender and recipient acceptance are only proven by a real send; the endpoint
 * logs a diagnosed "sender" / "recipient" stage if they are refused.
 *
 * Reads .env.local by default. Prints no secrets. Exit code 0 = ready, 1 = not.
 * Requires Node 22.18+ (runs the shared TypeScript module natively).
 */
import { lookup } from "node:dns/promises";
import { existsSync } from "node:fs";

import {
  createSmtpTransport,
  diagnoseSmtpError,
  getSmtpSecurity,
  withSmtpDeadline,
} from "../src/lib/email/smtp-core.ts";

const envFileArgument = process.argv.find((argument) => argument.startsWith("--env-file="));
const envFile = envFileArgument ? envFileArgument.slice("--env-file=".length) : ".env.local";
if (existsSync(envFile)) process.loadEnvFile(envFile);

const read = (name) => process.env[name]?.trim() || undefined;
const list = (name) => (read(name) ?? "").split(",").map((value) => value.trim()).filter(Boolean);
/** "c***@example.com" — enough to recognise the address without printing it in full. */
const mask = (address) => address.replace(/^(.)[^@]*@/, "$1***@");

const ok = (label, detail) => console.log(`  ✔ ${label.padEnd(18)} ${detail}`);
const info = (label, detail) => console.log(`    ${label.padEnd(18)} ${detail}`);
function fail(label, detail) {
  console.log(`  ✖ ${label.padEnd(18)} ${detail}`);
  process.exitCode = 1;
}

console.log("\nContact email transport check (no email is sent)\n");
info("env file", existsSync(envFile) ? envFile : `${envFile} (not found — using the process environment)`);

const provider = read("EMAIL_PROVIDER")?.toLowerCase();
info("EMAIL_PROVIDER", provider ?? "(not set)");
const from = read("CONTACT_EMAIL_FROM");
const to = list("CONTACT_EMAIL_TO");
const cc = list("CONTACT_EMAIL_CC");
info("From", from ? mask(from) : "(not set)");
info("To", to.length > 0 ? to.map(mask).join(", ") : "(not set)");
info("Cc", cc.length > 0 ? cc.map(mask).join(", ") : "(none)");

if (!from || to.length === 0) fail("configuration", "CONTACT_EMAIL_FROM and CONTACT_EMAIL_TO are required.");

if (provider !== "smtp") {
  if (provider === "resend") {
    info("Resend", read("RESEND_API_KEY") ? "RESEND_API_KEY is set (Resend is only verified by a real send)" : "RESEND_API_KEY is NOT set");
  } else {
    fail("configuration", 'EMAIL_PROVIDER is not "smtp"; nothing to verify.');
  }
} else {
  const host = read("SMTP_HOST");
  const port = Number(read("SMTP_PORT"));
  const username = read("SMTP_USERNAME");
  const password = read("SMTP_PASSWORD");

  if (!host || !Number.isInteger(port) || port < 1 || port > 65535 || !username || !password) {
    fail("configuration", "SMTP_HOST, SMTP_PORT (1–65535), SMTP_USERNAME and SMTP_PASSWORD are all required.");
  } else {
    const settings = { host, port, username, password };
    const security = getSmtpSecurity(port);
    info("SMTP", `${host}:${port} — ${security.mode}`);
    if (port !== 465 && port !== 587) {
      info("note", `Port ${port} is not a standard submission port (465 = implicit TLS, 587 = STARTTLS). Confirm it with the mail provider.`);
    }
    if (!/^[^@]+@/.test(username) || username.toLowerCase() !== from?.toLowerCase()) {
      info("note", "SMTP_USERNAME differs from CONTACT_EMAIL_FROM — the server must allow that mailbox to send as the From address.");
    }
    console.log("");

    let dnsOk = false;
    try {
      const addresses = await lookup(host, { all: true });
      ok("DNS", `${host} → ${addresses.map((entry) => entry.address).join(", ")}`);
      dnsOk = true;
    } catch (error) {
      fail("DNS", `${host} could not be resolved (${error.code ?? "error"}).`);
    }

    if (dnsOk) {
      const transport = createSmtpTransport(settings);
      const started = Date.now();
      try {
        await withSmtpDeadline(transport.verify());
        ok("TCP · TLS · AUTH", `verified in ${((Date.now() - started) / 1000).toFixed(1)} s — certificate valid, login accepted`);
        console.log("\n  Ready. The server accepts TLS connections and these credentials.\n");
      } catch (error) {
        const diagnosis = diagnoseSmtpError(error, settings);
        fail("verify", `failed at stage: ${diagnosis.stage.toUpperCase()}`);
        info("code", [diagnosis.code, diagnosis.cause].filter(Boolean).join(" / ") || "—");
        info("SMTP command", diagnosis.command ?? "—");
        info("SMTP reply", diagnosis.responseCode ? String(diagnosis.responseCode) : "—");
        info("message", diagnosis.message);
        info("what to check", diagnosis.hint);
        console.log("");
      } finally {
        transport.close();
      }
    }
  }
}
