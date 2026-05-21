import { Heart, Brain, Leaf, Sparkles } from "lucide-react";

const services = [
  {
    title: "Wellness Counseling",
    description:
      "Private therapeutic sessions with licensed reproductive mental health specialists, tailored to your emotional needs at every stage of treatment.",
    icon: Heart,
  },
  {
    title: "Mindfulness & Meditation",
    description:
      "Guided meditation and mindfulness protocols scientifically shown to reduce stress and improve treatment outcomes.",
    icon: Brain,
  },
  {
    title: "Nutritional Therapy",
    description:
      "Personalized nutritional counseling designed to optimize hormonal balance and create the ideal environment for conception.",
    icon: Leaf,
  },
  {
    title: "Holistic Therapies",
    description:
      "Acupuncture, gentle yoga, and other evidence-based holistic treatments seamlessly integrated with your clinical timeline.",
    icon: Sparkles,
  },
];

export default function ServicesSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-20 md:pb-32">
      <div className="mb-16 max-w-2xl md:mb-24">
        <h2 className="font-display text-4xl leading-[1] tracking-[-0.04em] text-foreground sm:text-5xl md:text-[56px] mb-8">
          Nurturing Mind,{" "}
          <span className="text-primary italic">Body & Spirit</span>
        </h2>
        <p className="text-on-surface-variant leading-8">
          We believe the body responds best to treatment when the mind is at
          peace. Our integrated holistic programs are designed to support you
          completely.
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
          Ready to Feel Supported?
        </h3>
        <p className="mx-auto max-w-xl text-on-surface-variant leading-7 mb-8">
          Our wellness concierge team is here to guide you toward complete
          emotional and physical wellbeing.
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
