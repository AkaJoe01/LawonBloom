import { Heart, Shield, Users, Scale } from "lucide-react";

const services = [
  {
    title: "Surrogate Matching",
    description:
      "A meticulous screening and matching process that aligns medical profiles, values, and expectations for a harmonious partnership.",
    icon: Users,
  },
  {
    title: "Legal Navigation",
    description:
      "Expert guidance through the legal framework of surrogacy agreements, parental rights, and jurisdictional requirements.",
    icon: Scale,
  },
  {
    title: "Medical Coordination",
    description:
      "Seamless orchestration of IVF cycles, embryo transfers, and prenatal care between all clinical partners.",
    icon: Shield,
  },
  {
    title: "Emotional Support",
    description:
      "Dedicated counseling and concierge support for both intended parents and surrogates throughout the entire journey.",
    icon: Heart,
  },
];

export default function ServicesSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-20 md:pb-32">
      <div className="mb-16 max-w-2xl md:mb-24">
        <h2 className="font-display text-4xl leading-[1] tracking-[-0.04em] text-foreground sm:text-5xl md:text-[56px] mb-8">
          Every Detail,{" "}
          <span className="text-primary italic">Orchestrated</span>
        </h2>
        <p className="text-on-surface-variant leading-8">
          From surrogate matching to postnatal care, our concierge model
          ensures nothing is left to chance.
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
          Ready to Explore Surrogacy?
        </h3>
        <p className="mx-auto max-w-xl text-on-surface-variant leading-7 mb-8">
          Schedule a private consultation with our surrogacy concierge team to
          discuss your unique path to parenthood.
        </p>
        <a
          href="/journey/consultation"
          className="inline-flex items-center bg-primary text-on-primary px-8 py-4 rounded-full uppercase tracking-[0.15em] text-sm hover:opacity-90 transition"
        >
          Book a Consultation
        </a>
      </div>
    </section>
  );
}
