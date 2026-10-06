export const metadata = {
  alternates: { canonical: "/legal/privacy" },
  title: "Privacy Registry | Lawonbloom",
  description: "Lawonbloom Fertility Centre's commitment to protecting your privacy and personal data.",
};

const subProcessors = [
  { name: "Neon", purpose: "PostgreSQL database hosting" },
  { name: "Vercel", purpose: "Application hosting and CDN" },
  { name: "Vercel Blob", purpose: "Image and media storage" },
  { name: "Resend", purpose: "Transactional email delivery" },
  { name: "Upstash", purpose: "Rate limiting (Redis)" },
  { name: "Sentry", purpose: "Error monitoring (PII-scrubbed)" },
];

const sections: { title: string; content: string }[] = [
  {
    title: "Blog & Enquiry Processing",
    content:
      "Public forms on our blog collect your name, email, optional phone number, the message you write, a consent timestamp with the policy version, and the article you were reading when you enquired. We use this information solely to respond to your health enquiries. The lawful basis is your captured consent. Enquiry messages are never written to application logs, error monitoring, or analytics — they are visible only to clinic staff.",
  },
  {
    title: "Data Retention",
    content:
      "Blog enquiries are retained for 24 months and then deleted automatically. Staff accounts are kept indefinitely for attribution and provenance of published medical content, with personal data erased on a valid request while post attribution is preserved. Published posts and media are retained while they remain public.",
  },
  {
    title: "Analytics & Cookies",
    content:
      "This site uses no analytics cookies, no tracking pixels, no profiling, and no advertising trackers. For this reason no cookie banner is shown. Only the session cookies required for staff sign-in exist, and they are never used for analytics.",
  },
  {
    title: "Your Rights",
    content:
      "Under the NDPA 2023 / NDPR you may request access to, correction of, or deletion of your personal data, and you may withdraw consent at any time. Submit a request to our Data Protection Officer and we will respond within 30 days with either a data export (your enquiries and account record) or a deletion (enquiry records erased, personal identifiers anonymised while published attribution is preserved).",
  },
  {
    title: "Clinic-Care Information",
    content:
      "Information you share as part of treatment at the physical clinic is processed under your treatment consent and applicable health-records law, separately from this website. Contact our Data Protection Officer for care-record requests.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="bg-surface text-foreground">
      <section className="mx-auto max-w-4xl px-6 py-20 text-center md:py-32">
        <p className="section-label mb-6 text-primary">Legal</p>
        <h1 className="font-display text-5xl leading-[0.95] text-foreground sm:text-6xl md:text-7xl lg:text-[84px] lg:leading-[1.1] mb-8">
          Privacy Registry
        </h1>
        <p className="mx-auto max-w-2xl text-on-surface-variant leading-7">
          Your privacy is the bedrock of our sanctuary. We handle your personal information with the same precision and care as your treatment.
        </p>
        <p className="mt-4 text-sm text-on-surface-variant">
          Policy version v2 &middot; Last updated: October 2026 &middot; Governed by the NDPA 2023 and NDPR
        </p>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-20 md:pb-32">
        <div className="space-y-12">
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="font-display text-2xl text-foreground mb-4 md:text-3xl">
                {section.title}
              </h2>
              <p className="text-on-surface-variant leading-8">{section.content}</p>
            </div>
          ))}

          <div>
            <h2 className="font-display text-2xl text-foreground mb-4 md:text-3xl">
              Sub-processors Table
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/40 text-on-surface-variant">
                    <th scope="col" className="py-3 pr-6 font-semibold">Sub-processor</th>
                    <th scope="col" className="py-3 font-semibold">Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  {subProcessors.map((entry) => (
                    <tr key={entry.name} className="border-b border-outline-variant/20">
                      <td className="py-3 pr-6 text-foreground">{entry.name}</td>
                      <td className="py-3 text-on-surface-variant">{entry.purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-16 rounded-[32px] border border-outline-variant/30 bg-surface-container-low p-8 text-center md:p-12">
          <h3 className="font-display text-2xl text-foreground mb-4">
            Questions About Your Data?
          </h3>
          <p className="text-on-surface-variant leading-7 mb-8">
            Our Data Protection Officer is available to address any concerns regarding your personal information.
          </p>
          <a
            href="mailto:lawonbloomfertilitycentre@gmail.com"
            className="inline-flex items-center bg-primary text-on-primary px-8 py-4 rounded-full uppercase tracking-[0.15em] text-sm hover:opacity-90 transition"
          >
            Contact DPO
          </a>
        </div>
      </section>
    </div>
  );
}