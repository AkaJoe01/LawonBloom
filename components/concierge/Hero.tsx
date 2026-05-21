import Link from "next/link";

export default function Hero() {
    return(
        <section className="max-w-6xl mx-auto px-6 pt-32 text-center">
            <p className="section-label mb-6 text-primary">
                Concierge Services
            </p>
            <h1 className="font-display text-5xl leading-[0.95] tracking-[-0.04em] text-foreground sm:text-6xl md:text-7xl lg:text-[96px] mb-10">
                Elevated fertility care,
                personally curated.
            </h1>
            <p className="mx-auto max-w-2xl text-on-surface-variant leading-8 mb-12">
                Experience white-glove reproductive care designed around 
                discretion, comfort, and global accessibility.
            </p>
            <Link
                href="/concierge/contact"
                className="inline-flex items-center bg-primary text-on-primary px-8 py-4 rounded-full uppercase tracking-[0.15em] text-sm hover:opacity-90 transition"
                >
                    Begin Your Journey →
                </Link>
        </section>
    );
}