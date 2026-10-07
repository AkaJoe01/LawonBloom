# Privacy Policy — Lawonbloom Fertility Centre

**Version:** v2
**Effective:** 2026-10-06
**Regime:** NDPA 2023 / NDPR (Nigeria). This version supersedes all prior versions.

Enquiry consent records created on this site store `consentVersion = v2` together with a
consent timestamp. The consent checkbox on public forms links to this policy. Bump the
version stamp (and `CONSENT_VERSION` in `lib/validation/blog.ts`) whenever any section
below changes materially.

---

## 1. Blog & enquiry processing

Public forms on the blog (article enquiries, consultation requests) collect:

- **Name** (required)
- **Email** (required)
- **Phone** (optional)
- **Message / notes** (free text)
- **Consent timestamp and policy version** (captured, not typed)
- **Post context** — the slug of the article the enquiry was made from (optional)

**Purpose:** responding to your health enquiries and booking requests.
**Lawful basis:** your captured consent (the consent checkbox + timestamp persisted with
each record).

Enquiry bodies are never written to application logs, error-monitoring breadcrumbs, or
analytics. They are visible only to clinic staff in the admin enquiries screen.

## 2. Sub-processors

| Sub-processor | Purpose | DPA |
|---|---|---|
| [Neon](https://neon.com/privacy-policy) | PostgreSQL database hosting | https://neon.com/terms |
| [Vercel](https://vercel.com/legal/privacy-policy) | Application hosting/CDN | https://vercel.com/legal |
| [Vercel Blob](https://vercel.com/legal/privacy-policy) | Image/media storage | https://vercel.com/legal |
| [Resend](https://resend.com/legal/privacy-policy) | Transactional email delivery | https://resend.com/legal |
| [Upstash](https://upstash.com/legal/privacy-policy) | Rate limiting (Redis) | https://upstash.com/legal |
| [Sentry](https://sentry.io/privacy/) | Error monitoring (PII-scrubbed) | https://sentry.io/legal/privacy/ |

No other third parties receive personal data from this site. Personal data is never sold.

## 3. Retention

- **Enquiries:** retained for **24 months**, then hard-deleted by an automated cleanup.
- **User accounts (staff editors/admins):** retained indefinitely for attribution and
  provenance of published medical content; PII erased on a valid data-subject request
  (see §5) while post attribution is preserved as "Erased user".
- **Published posts and media:** retained for as long as they remain public.
- **Logs/monitoring:** application log lines carry no enquiry PII; monitoring retention
  follows the sub-processor defaults above.

## 4. Analytics position

This site runs **no analytics cookies, no tracking pixels, no profiling, and no
third-party advertising** in v1. Consequently **no cookie banner is required or shown**.
(Reserved for NDPA record-keeping.)

## 5. Data-subject request (DSR) process

1. Email the Data Protection Officer: **lawonbloomfertilitycentre@gmail.com** with the
   subject "DSR request".
2. Identity check (reply from the address on record, or provide an account identifier).
3. We respond within **30 calendar days** with one of:
   - **Export:** CSV of your enquiries (name, email, phone, message, timestamps, consent
     version) plus your account record if you hold one.
   - **Deletion:** enquiries erased; user PII anonymised (email erased, display name set
     to "Erased user", post attribution preserved); published medical content is not
     unlinked.
4. The action (who/when/what) is logged in the admin audit trail.

## 6. Clinic-care data (context)

Information you share as part of treatment at the physical clinic is processed under
your treatment consent and applicable health-records law, separate from this website.
Contact the Data Protection Officer at the address above for care-record requests.
