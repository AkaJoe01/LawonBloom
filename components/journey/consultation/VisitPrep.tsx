import Image from "next/image";

const prepItems = [
  {
    label: "Emotional Blueprinting",
    text: "A dedicated concierge will support your consultation journey from start to finish.",
  },
  {
    label: "Secure Records Transfer",
    text: "Upload past medical records through encrypted channels before your visit.",
  },
  {
    label: "Travel Coordination",
    text: "International clients receive seamless travel and accommodation assistance.",
  },
];

export default function VisitPrep() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-16 md:pb-32">
      <div className="grid items-center gap-12 md:grid-cols-2">
        <div className="max-w-xl">
          <h2 className="font-display text-4xl leading-tight text-foreground md:text-[56px] md:leading-[1.1]">
            Prepare for your Sanctuary Visit
          </h2>
          <p className="mt-4 text-on-surface-variant leading-8 md:mt-6">
            We believe the journey to parenthood should be enveloped in calm and clarity.
          </p>
          <div className="mt-8 space-y-8 md:mt-10">
            {prepItems.map((item) => (
              <div key={item.label}>
                <h3 className="section-label text-primary">{item.label}</h3>
                <p className="mt-2 text-on-surface-variant leading-7">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center">
          <div className="w-full max-w-xl overflow-hidden rounded-3xl">
            <Image
              src="/images/corridor.jpg"
              alt="Sanctuary corridor"
              width={600}
              height={700}
              className="w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
