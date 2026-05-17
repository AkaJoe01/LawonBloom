const steps = [
  {
    phase: "Phase 1",
    title: "Ovarian Stimulation",
    text: "Personalized hormone protocols to encourage healthy follicle development, monitored with advanced imaging and hormonal tracking.",
    image: "/images/probe.jpg",
  },
  {
    phase: "Phase 2",
    title: "Egg Retrieval",
    text: "A minimally conscious procedure performed under gentle sedation, using ultrasound-guided precision to collect mature eggs.",
    image: "/images/setoscope.jpg",
  },
  {
    phase: "Phase 3",
    title: "Fertilization & Culture",
    text: "Eggs are fertilized in our class-100 cleanroom laboratory using ICSI or conventional insemination, then nurtured in time-lapse incubators.",
    image: "/images/microscope.jpg",
  },
  {
    phase: "Phase 4",
    title: "Embryo Transfer",
    text: "The healthiest embryo is gently placed into the uterine cavity in a procedure designed for comfort and precision.",
    image: "/images/scan_2.jpg",
  },
];

export default function ProcessSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-20 md:pb-32">
      <div className="mb-16 max-w-2xl md:mb-24">
        <h2 className="font-display text-4xl leading-[1] tracking-[-0.04em] text-foreground sm:text-5xl md:text-[56px] mb-8">
          The IVF Pathway
        </h2>
        <p className="text-on-surface-variant leading-8">
          Every stage of your journey is carefully orchestrated with clinical mastery and compassionate support.
        </p>
      </div>

      <div className="space-y-16 md:space-y-24">
        {steps.map((step, index) => (
          <div
            key={step.phase}
            className={`grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-16 ${
              index % 2 === 1 ? "md:direction-rtl" : ""
            }`}
          >
            <div className={index % 2 === 1 ? "md:order-2" : ""}>
              <p className="section-label mb-4 text-primary">{step.phase}</p>
              <h3 className="font-display text-3xl text-foreground mb-6 md:text-4xl">
                {step.title}
              </h3>
              <p className="text-on-surface-variant leading-8">{step.text}</p>
            </div>
            <div
              className={`relative aspect-[4/3] overflow-hidden rounded-[32px] ${
                index % 2 === 1 ? "md:order-1" : ""
              }`}
            >
              <img
                src={step.image}
                alt={step.title}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
