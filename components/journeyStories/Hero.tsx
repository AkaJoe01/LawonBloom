import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 py-[140px] text-center overflow-hidden">
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
      <div className="absolute inset-0 bg-[#f5f2ee]/80" />

      {/* CONTENT */}
      <div className="relative z-10 max-w-3xl">
        <p className="uppercase tracking-[0.3em] text-xs text-[#9c5c67] mb-6">
          The Miracle of Life
        </p>
        <h1 className="font-serif text-[84px] leading-[92px] tracking-[-0.4em] mb-8">
          Journeys of Hope
        </h1>
        <p className="text-gray-600 leading-8 max-w-2xl mx-auto">
          Every family&apos;s path is uniquely profound. Explore the emotional narrative and scientific triumphs of those who found sanctuary.
        </p>
      </div>
    </section>
  );
}