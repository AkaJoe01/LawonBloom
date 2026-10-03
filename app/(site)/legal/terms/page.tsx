export const metadata = {
  title: "Terms of Care | Lawonbloom",
  description: "The terms and conditions governing the provision of care and services at Lawonbloom Fertility Centre.",
};

const sections = [
  {
    title: "Scope of Services",
    content:
      "Lawonbloom Fertility Centre provides reproductive health services including consultation, diagnostic testing, fertility treatments, genetic screening, and supportive therapies. All services are delivered in accordance with established medical protocols and regulatory standards governing reproductive medicine.",
  },
  {
    title: "Patient Responsibilities",
    content:
      "Patients agree to provide accurate and complete medical history information, follow prescribed treatment protocols, attend scheduled appointments, and communicate openly with their care team. Failure to adhere to treatment protocols may affect clinical outcomes and obligate financial responsibility for services rendered.",
  },
  {
    title: "Informed Consent",
    content:
      "Prior to any treatment, patients will receive detailed information about proposed procedures, potential risks, success rates, and alternatives. Written informed consent is required before proceeding with any medical intervention. Patients retain the right to withdraw consent at any stage of treatment.",
  },
  {
    title: "Financial Obligations",
    content:
      "Fees for services are communicated in advance through a detailed treatment cost estimate. Payment terms, insurance coordination, and refund policies are outlined in your financial agreement. Lawonbloom offers concierge billing support to navigate insurance claims and international payments.",
  },
  {
    title: "Confidentiality",
    content:
      "All patient information is protected under strict confidentiality protocols as detailed in our Privacy Registry. Information may be shared only with your explicit written consent or as required by applicable law.",
  },
  {
    title: "Cancellation & Rescheduling",
    content:
      "We require 48 hours' notice for cancellation or rescheduling of appointments. Late cancellations may incur a fee. Emergency situations are handled with compassion and flexibility.",
  },
  {
    title: "Limitation of Liability",
    content:
      "Lawonbloom employs best-in-class medical practices and technologies. However, fertility treatments involve inherent medical risks and uncertainties. Outcomes cannot be guaranteed. Our liability is limited as set forth in your treatment agreement and applicable law.",
  },
  {
    title: "Amendments",
    content:
      "We reserve the right to update these terms as our services evolve. Patients will be notified of material changes. Continued use of our services constitutes acceptance of the updated terms.",
  },
];

export default function TermsPage() {
  return (
    <div className="bg-surface text-foreground">
      <section className="mx-auto max-w-4xl px-6 py-20 text-center md:py-32">
        <p className="section-label mb-6 text-primary">Legal</p>
        <h1 className="font-display text-5xl leading-[0.95] text-foreground sm:text-6xl md:text-7xl lg:text-[84px] lg:leading-[1.1] mb-8">
          Terms of Care
        </h1>
        <p className="mx-auto max-w-2xl text-on-surface-variant leading-7">
          Clear, compassionate terms that govern our relationship — because trust is the foundation of every journey.
        </p>
        <p className="mt-4 text-sm text-on-surface-variant/60">
          Last updated: May 2026
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
        </div>

        <div className="mt-16 rounded-[32px] border border-outline-variant/30 bg-surface-container-low p-8 text-center md:p-12">
          <h3 className="font-display text-2xl text-foreground mb-4">
            Have Questions About Your Care Agreement?
          </h3>
          <p className="text-on-surface-variant leading-7 mb-8">
            Our patient advocacy team is here to clarify any terms and ensure your complete understanding.
          </p>
          <a
            href="/concierge/contact"
            className="inline-flex items-center bg-primary text-on-primary px-8 py-4 rounded-full uppercase tracking-[0.15em] text-sm hover:opacity-90 transition"
          >
            Contact Patient Advocacy
          </a>
        </div>
      </section>
    </div>
  );
}
