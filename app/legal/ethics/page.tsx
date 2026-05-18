export const metadata = {
  title: "Clinical Ethics | Lawonbloom",
  description: "The ethical framework guiding every clinical decision at Lawonbloom Fertility Centre.",
};

const sections = [
  {
    title: "Our Ethical Foundation",
    content:
      "Lawonbloom Fertility Centre operates under a rigorous ethical framework that places patient welfare, autonomy, and dignity at the centre of every clinical decision. Our Ethics Committee, comprising medical professionals, legal advisors, and patient advocates, oversees adherence to the highest moral and professional standards in reproductive medicine.",
  },
  {
    title: "Patient Autonomy & Informed Choice",
    content:
      "We honour the profound responsibility of reproductive decision-making. Every patient receives comprehensive, unbiased information about their options, success rates, risks, and alternatives. We support your right to make informed choices free from coercion, and we respect decisions to decline or discontinue treatment at any stage.",
  },
  {
    title: "Equity & Access",
    content:
      "We are committed to providing equitable care regardless of age, race, sexual orientation, gender identity, marital status, or socioeconomic background. Our financial counselling team works to identify accessible treatment pathways, and we maintain partnerships with organizations dedicated to expanding fertility care access.",
  },
  {
    title: "Embryo Ethics",
    content:
      "We treat every embryo with profound respect as a potential life. Our policies governing embryo creation, culture, transfer, storage, and disposition are guided by the most current ethical guidelines from international reproductive medicine authorities. Patients receive detailed counselling to make informed decisions about their embryos.",
  },
  {
    title: "Genetic Integrity",
    content:
      "Our genetic testing protocols are designed to promote the health of future children while respecting the diversity of human life. We do not select embryos for non-medical traits. Genetic counselling is provided to ensure patients fully understand the implications of testing results.",
  },
  {
    title: "Transparency & Truthfulness",
    content:
      "Honesty is the cornerstone of the patient-provider relationship. We report outcomes transparently, including success rates, complications, and limitations. Our marketing materials reflect our genuine capabilities and never overstate potential results.",
  },
  {
    title: "Research & Innovation",
    content:
      "When conducting research to advance reproductive medicine, we obtain explicit informed consent, maintain rigorous oversight, and prioritize patient welfare above scientific objectives. Patients may decline research participation without any impact on their clinical care.",
  },
  {
    title: "Annual Ethics Review",
    content:
      "Our Ethics Committee convenes annually to review policies, address emerging ethical questions, and ensure our practices remain aligned with evolving medical, legal, and societal standards. Committee composition and meeting summaries are available upon request.",
  },
];

export default function EthicsPage() {
  return (
    <div className="bg-surface text-foreground">
      <section className="mx-auto max-w-4xl px-6 py-20 text-center md:py-32">
        <p className="section-label mb-6 text-primary">Legal</p>
        <h1 className="font-display text-5xl leading-[0.95] text-foreground sm:text-6xl md:text-7xl lg:text-[84px] lg:leading-[1.1] mb-8">
          Clinical Ethics
        </h1>
        <p className="mx-auto max-w-2xl text-on-surface-variant leading-7">
          Our moral compass — the unwavering ethical principles that guide every decision within our sanctuary.
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
            Submit an Ethics Inquiry
          </h3>
          <p className="text-on-surface-variant leading-7 mb-8">
            Our Ethics Committee welcomes questions and feedback from patients, staff, and the broader community.
          </p>
          <a
            href="mailto:ethics@lawonbloom.com"
            className="inline-flex items-center bg-primary text-on-primary px-8 py-4 rounded-full uppercase tracking-[0.15em] text-sm hover:opacity-90 transition"
          >
            Contact Ethics Committee
          </a>
        </div>
      </section>
    </div>
  );
}
