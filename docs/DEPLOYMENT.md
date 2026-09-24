# Deployment (Vercel) and domain cut-over

> **No DNS changes have been made.** This is the plan for when the approved
> site is ready to go live. Company email runs on the same domain. **A careless
> DNS change can stop email for the whole company.** Read §3 fully before
> touching anything.

## 1. Vercel project

1. Import the repository into Vercel. The framework (Next.js) is detected
   automatically. Build command `next build`, default output. Node.js 20.x or
   newer (the project is developed on 24.x).
2. Set the environment variables per environment
   (Project → Settings → Environment Variables):

| Variable | Production | Preview | Notes |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://www.proficientsoftwaresolutions.co.za` (or leave empty: that is the default) | same | Canonicals always point at production |
| `NEXT_PUBLIC_GA_ID` | GA4 ID (legacy: `G-VLLB11SKWE`) | **leave empty** | Keeps test traffic out of reports |
| `EMAIL_PROVIDER` | `smtp` or `resend` | `log`, or a test mailbox | `log` is refused in Production |
| `CONTACT_EMAIL_TO` | the primary PSS inbox | a test inbox | Comma-separated |
| `CONTACT_EMAIL_CC` | **`nproficientm@gmail.com`** (required by PSS) | a test inbox or empty | Comma-separated; every enquiry is copied. Production logs a warning if it is empty |
| `CONTACT_EMAIL_FROM` | an authorised sender (§3.5) | test sender | |
| `SMTP_*` / `RESEND_API_KEY` | per provider | per provider | Mark as **Sensitive** in Vercel |
| `TURNSTILE_SECRET_KEY` | **leave empty** | leave empty | The form does not render the widget; setting it would reject every enquiry |

3. Behaviour by environment is automatic:
   - **Production** (`VERCEL_ENV=production`) is indexable.
   - **Preview** deployments serve `robots.txt: Disallow: /` and `noindex`.
   - The content is identical everywhere: there are no draft or placeholder states.

## 2. Domains in Vercel

The canonical host is **`www.proficientsoftwaresolutions.co.za`**.

- Add **both** `www.proficientsoftwaresolutions.co.za` and
  `proficientsoftwaresolutions.co.za` to the project and attach both to
  **Production**.
- The apex→www 308 is already done inside the app (`next.config.ts`). Using
  Vercel's "Redirect to another domain" option for the apex as well is fine;
  the result is the same.
- Vercel shows the exact DNS records each domain needs (typically an `A` record
  for the apex and a `CNAME` for `www`). **Use the values Vercel displays for
  this project.** Do not copy values from elsewhere.
- Vercel issues TLS certificates automatically once DNS points at it and
  serves HSTS.

## 3. DNS cut-over **without breaking email**

### 3.1 What must survive

The domain's email must keep working throughout and after the move:

- `MX` records
- the `mail.proficientsoftwaresolutions.co.za` host (used as the SMTP server by the legacy site)
- SPF (`TXT` at the apex, `v=spf1 …`)
- DKIM (`TXT`/`CNAME` at `<selector>._domainkey`)
- DMARC (`TXT` at `_dmarc`)
- any other mail records: `autodiscover`, `autoconfig`, `SRV` records
  (`_autodiscover._tcp`, `_imaps._tcp`, `_submission._tcp`, …), `webmail`,
  `cpanel`, `smtp`, `imap`, `pop`
- verification `TXT` records (Google Search Console, Microsoft 365, etc.) and
  any `CAA` records

Where the domain's DNS is hosted, and whether the mail server shares a host with
the current website, are both **UNKNOWN** (audit §1.18, §15.6). Find out first.

### 3.2 Strong recommendation: do **not** move nameservers

Keep the nameservers where they are. Change **only** the two website records:

- the apex (`@`) `A` record(s) → the value Vercel shows
- `www` → the `CNAME` Vercel shows

Leave every other record alone.

Moving the nameservers (to Vercel DNS or anywhere else) replaces the **whole
zone**. Every mail record would have to be recreated perfectly first. Only
consider it with a complete, verified copy of the zone, and never casually.

### 3.3 Traps to check **before** changing the apex record

Shared hosting often ties mail to the apex address. Check each case below:

| Check | Why it matters | Fix *before* cut-over |
|---|---|---|
| **MX points at the apex itself** (e.g. `MX 10 proficientsoftwaresolutions.co.za`) | Changing the apex `A` record would send incoming mail to Vercel, which does not accept it. **Email breaks** | Point MX at a dedicated mail hostname (e.g. `mail.…`) whose `A` record holds the **current** mail server IP. Wait for the old TTL to expire |
| **`mail` is a `CNAME` to the apex** (or to `www`) | The mail host would follow the website to Vercel | Replace the `CNAME` with an `A` record to the current mail server IP |
| **`webmail`, `smtp`, `imap`, `pop`, `autodiscover` are `CNAME`s to the apex** | Same problem | Same fix |
| **SPF uses `a`** (e.g. `v=spf1 a mx …`) | `a` authorises the apex's IP. After the change that is Vercel's IP, not the mail server's | Replace `a` with `ip4:<current mail server IP>` or an explicit `include:`, keeping the rest unchanged |
| **`CAA` records exist** | They may block Vercel's certificate authority | Add the CA Vercel requires (per Vercel's docs at the time) |
| **The apex `A` record is shared with other services** (FTP, control panel) | Those would move too | Give them their own hostnames first |

### 3.4 Procedure

**T−3 days:**

1. **Export the complete DNS zone** and store it with the project records. Also
   take screenshots of the DNS panel.
2. Record the current answers so there is a baseline to compare against later:
   ```bash
   nslookup -type=MX  proficientsoftwaresolutions.co.za
   nslookup -type=TXT proficientsoftwaresolutions.co.za
   nslookup -type=TXT _dmarc.proficientsoftwaresolutions.co.za
   nslookup mail.proficientsoftwaresolutions.co.za
   nslookup proficientsoftwaresolutions.co.za
   nslookup www.proficientsoftwaresolutions.co.za
   ```
   (Or `dig … +short` on macOS/Linux. Check DKIM with the selector in use:
   `nslookup -type=TXT <selector>._domainkey.proficientsoftwaresolutions.co.za`.)
3. Work through §3.3 and apply any fixes. Re-test email in **both directions**.
4. Lower the TTL of the apex and `www` records (e.g. to 300 s) and wait at least
   the old TTL.

**Pre-flight, on the Vercel production deployment URL:**

5. All the checks in §4 pass, including a real contact-form submission arriving
   in the primary inbox **and** the CC address.

**Cut-over:**

6. Change **only** the apex `A` record and the `www` record to the Vercel values.
7. Wait for Vercel to show both domains as valid and to issue certificates.

**Immediately after:**

8. Re-run the step 2 lookups:
   - MX, TXT (SPF), DMARC, DKIM and `mail.` must be **identical** to the baseline.
   - The apex and `www` now point at Vercel.
9. Send an email **to** the company from an outside account, and **from** the
   company to an outside account. Check the received headers for `spf=pass`,
   `dkim=pass` and `dmarc=pass`.
10. Run §4 again on the real domain.

**Rollback:** restore the previous apex/`www` values from the zone export. Keep
the legacy site running until the new site has been stable for a while.

### 3.5 Sending contact-form email

- **`EMAIL_PROVIDER=smtp` with an existing company mailbox:**
  - Mail is sent by the existing mail server, so **no DNS change** is needed.
  - Use a dedicated mailbox and a **new** password. The legacy one is compromised (§6).
  - `SMTP_HOST` and `SMTP_PORT` must be the provider's published **outgoing-mail
    (SMTP) settings**. TLS is enforced and certificates are always validated:
    - `465` = implicit TLS (`secure`), `587` = STARTTLS (required).
    - A plaintext-only port is refused before the password is sent.
    - `SMTP_HOST` must be a name on the server's certificate.
  - **Current mailbox host (checked 2026-09-24):** the company mailbox is on
    SmarterASP.NET. Use **`SMTP_HOST=mail5019.site4now.net`** and
    **`SMTP_PORT=465`** (587 also works).
    - The certificate is issued for `*.site4now.net`.
    - `mail.proficientsoftwaresolutions.co.za` points at the same server, but it
      fails certificate validation on 465 and 587.
    - Port `8889` on that host is **plaintext only**: it answers
      `503 TLS is not allowed` to STARTTLS.
    - Using the provider host name also means the contact form doesn't depend on
      the domain's DNS during the cut-over (§3).
  - Check the settings with `npm run email:verify` (DNS, TCP, TLS and login;
    sends nothing).
- **Diagnosing a failed send.** The visitor only sees a generic message. The
  Vercel function log has one line per failure:
  ```
  [contact] Email delivery failed: {"provider":"smtp","host":…,"port":…,"secure":…,
    "stage":"dns|connection|timeout|tls|authentication|sender|recipient|message",
    "code":…,"command":…,"responseCode":…,"message":…,"hint":…}
  ```
  It never contains credentials or the enquiry's content. A `connection` or
  `timeout` stage from Vercel, when `npm run email:verify` passes locally, means
  the mail server isn't reachable from Vercel's network. In that case switch to
  `EMAIL_PROVIDER=resend` rather than working around it.
- **`EMAIL_PROVIDER=resend`** (or another provider):
  - Add only the records the provider asks for (DKIM, and possibly a return-path/SPF on a subdomain).
  - A domain may have **only one SPF record**. Merge the provider's `include:`
    into the existing record rather than adding a second one.
  - Check DMARC alignment before relying on it.

## 4. Launch checklist

- [ ] `npm run validate` passes (lint, typecheck, build)
- [ ] Production environment variables set (§1; `.env.example` lists the required ones)
- [ ] Privacy policy published and linked, if possible before launch ([CONTENT_MIGRATION.md §3](CONTENT_MIGRATION.md#3-decisions-and-confirmations))
- [ ] Contact form: real submission delivered to the primary inbox and CC, Reply-To works, failure path tested
- [ ] GA4 receiving data from Production only; enhanced measurement (history changes) on; consent approach decided
- [ ] `/robots.txt` allows crawling and `/sitemap.xml` lists every page on the production domain
- [ ] Every URL in [LEGACY_REDIRECTS.md](LEGACY_REDIRECTS.md) spot-checked on the production URL
- [ ] DNS procedure §3 followed; email verified both ways
- [ ] Search Console: `www` property verified, sitemap submitted
- [ ] Old credentials rotated (§6)

## 5. After launch

- Watch Search Console (coverage, 404s, Core Web Vitals) and GA4 landing pages
  for 4–6 weeks.
- Decommission the legacy website once the new site has been stable for a while.

## 6. Credential rotation

The legacy repository (`PSS-MainWebsite`) contains **plaintext credentials in its
git history** (audit §1.13, §1.14, §13.1):

- the SMTP mailbox password (`clients@…` on `mail.proficientsoftwaresolutions.co.za`)
- two SQL Server logins (on the legacy hosting platform)
- a Gmail app password (in commented-out code)

**Every one must be rotated separately, now**, whatever the rebuild's timeline.
Anyone with access to that repository or its history has them. None were copied
into this repository, and the rebuild does not rotate them.

After rotating:

- Store new values only in each system's secret settings (Vercel environment
  variables, hosting control panel).
- Consider purging the history of the legacy repository, or archiving it privately.
- Revoke the Gmail app password in the Google account's security settings.
- Also review the Web Deploy / FTP publishing credentials of the legacy hosting
  account (encrypted in local `.pubxml.user` files, audit §1.18).
