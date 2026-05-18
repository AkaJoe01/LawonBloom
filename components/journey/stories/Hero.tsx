import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-20 text-center md:py-35">
      {/* BACKGROUND IMAGE */}
      <div className="absolute inset-0">
        <Image
          src="/images/lab.jpg"
          alt="lab"
          fill
          className="object-cover opacity-20"
        />
      </div>

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-surface/80" />

      {/* CONTENT */}
      <div className="relative z-10 max-w-3xl">
        <p className="section-label mb-6 text-primary">
          The Miracle of Life
        </p>
        <h1 className="font-display text-5xl leading-tight tracking-[-0.04em] text-foreground sm:text-6xl md:text-7xl lg:text-[84px] lg:leading-23 mb-8">
          Journeys of Hope
        </h1>
        <p className="mx-auto max-w-2xl text-on-surface-variant leading-8">
          Every family&apos;s path is uniquely profound. Explore the emotional narrative and scientific triumphs of those who found sanctuary.
        </p>
      </div>
    </section>
  );
}
