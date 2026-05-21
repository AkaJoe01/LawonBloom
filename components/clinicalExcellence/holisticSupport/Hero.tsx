import Link from "next/link";

export default function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 text-center md:py-32">
      <p className="section-label mb-6 text-primary">
        Clinical Excellence
      </p>
      <h1 className="font-display text-5xl leading-[0.95] tracking-[-0.04em] text-foreground sm:text-6xl md:text-7xl lg:text-[96px] mb-10">
        Holistic
        <br />
        <span className="text-primary italic">Support</span>
      </h1>
      <p className="mx-auto max-w-2xl text-on-surface-variant leading-8 mb-12">
        Private therapeutic guidance and holistic therapies ensuring emotional
        harmony throughout your fertility journey.
      </p>
      <Link
        href="/journey/consultation"
        className="inline-flex items-center bg-primary text-on-primary px-8 py-4 rounded-full uppercase tracking-[0.15em] text-sm hover:opacity-90 transition"
      >
        Begin Your Journey
      </Link>
    </section>
  );
}
