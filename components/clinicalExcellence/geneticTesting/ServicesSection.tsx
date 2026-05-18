import { Dna, ShieldCheck, Search, Heart } from "lucide-react";

const services = [
  {
    title: "PGT-A (Aneuploidy)",
    description:
      "Screens embryos for chromosomal abnormalities, significantly improving implantation success and reducing miscarriage risk.",
    icon: Dna,
  },
  {
    title: "PGT-M (Monogenic)",
    description:
      "Identifies embryos free from specific inherited genetic disorders, offering peace of mind for families with known conditions.",
    icon: ShieldCheck,
  },
  {
    title: "PGT-SR (Structural)",
    description:
      "Detects structural chromosomal rearrangements that may impact embryo development and transfer success.",
    icon: Search,
  },
  {
    title: "Comprehensive Counseling",
    description:
      "Expert genetic counselors guide you through every result, ensuring informed, compassionate decision-making.",
    icon: Heart,
  },
];

export default function ServicesSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-20 md:pb-32">
      <div className="mb-16 max-w-2xl md:mb-24">
        <h2 className="font-display text-4xl leading-[1] tracking-[-0.04em] text-foreground sm:text-5xl md:text-[56px] mb-8">
          Precision Medicine for Your Embryo
        </h2>
        <p className="text-on-surface-variant leading-8">
          Our genetic testing suite provides the deepest possible insight into
          embryo health, mapping a healthy future for your family.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <div
              key={service.title}
              className="rounded-[32px] border border-outline-variant/30 bg-surface-bright/60 p-8 backdrop-blur-xl md:p-10"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-primary/30">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display text-2xl text-foreground mb-4">
                {service.title}
              </h3>
              <p className="text-on-surface-variant leading-7">
                {service.description}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-16 rounded-[32px] border border-outline-variant/30 bg-surface-container-low p-8 text-center md:p-12">
        <h3 className="font-display text-2xl text-foreground mb-4">
          Not Sure Which Test Is Right for You?
        </h3>
        <p className="mx-auto max-w-xl text-on-surface-variant leading-7 mb-8">
          Our genetic specialists will guide you through every option, tailoring
          a screening plan aligned with your unique medical history and family goals.
        </p>
        <a
          href="/concierge/contact"
          className="inline-flex items-center bg-primary text-on-primary px-8 py-4 rounded-full uppercase tracking-[0.15em] text-sm hover:opacity-90 transition"
        >
          Speak to a Specialist
        </a>
      </div>
    </section>
  );
}
