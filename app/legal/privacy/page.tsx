export const metadata = {
  title: "Privacy Registry | Lawonbloom",
  description: "Lawonbloom Fertility Centre's commitment to protecting your privacy and personal data.",
};

const sections = [
  {
    title: "Information We Collect",
    content:
      "We collect personal information necessary to provide you with exceptional fertility care. This includes your name, contact details, medical history, genetic information, insurance details, and any other data relevant to your treatment journey. All information is collected with your explicit consent and in accordance with applicable data protection regulations.",
  },
  {
    title: "How We Use Your Information",
    content:
      "Your personal data is used exclusively to deliver, coordinate, and improve your care at Lawonbloom. This includes scheduling consultations, processing medical records, communicating with your care team, and fulfilling regulatory obligations. We may also use anonymized data for clinical research to advance reproductive medicine.",
  },
  {
    title: "Data Protection & Security",
    content:
      "We employ industry-leading encryption, biometric access controls, and strict internal protocols to safeguard your information. Our systems are regularly audited and comply with GDPR, HIPAA, and all applicable data protection frameworks. Access to your data is limited to authorized personnel bound by confidentiality agreements.",
  },
  {
    title: "Your Rights",
    content:
      "You have the right to access, correct, or request deletion of your personal data at any time. You may withdraw consent for data processing, request a copy of your records, or lodge a complaint with your local data protection authority. To exercise these rights, contact our Data Protection Officer at lawonbloomf@gmail.com.",
  },
  {
    title: "Data Retention",
    content:
      "We retain your personal data for the duration of your care relationship with Lawonbloom and as required by regulatory obligations thereafter. Medical records are retained in accordance with applicable laws governing reproductive health documentation.",
  },
  {
    title: "Third-Party Sharing",
    content:
      "We do not sell your personal data. Information may be shared with trusted partners only when necessary for your care — such as laboratories, pharmacies, or insurance providers — and always under strict data processing agreements that ensure your information remains protected.",
  },
  {
    title: "Cookies & Analytics",
    content:
      "Our website uses essential cookies for functionality and optional analytics cookies to improve your experience. You can manage your cookie preferences at any time. We do not use tracking cookies for advertising purposes.",
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
            Questions About Your Data?
          </h3>
          <p className="text-on-surface-variant leading-7 mb-8">
            Our Data Protection Officer is available to address any concerns regarding your personal information.
          </p>
          <a
            href="mailto:lawonbloomf@gmail.com"
            className="inline-flex items-center bg-primary text-on-primary px-8 py-4 rounded-full uppercase tracking-[0.15em] text-sm hover:opacity-90 transition"
          >
            Contact DPO
          </a>
        </div>
      </section>
    </div>
  );
}
