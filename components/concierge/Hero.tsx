import Link from "next/link";

export default function Hero() {
    return(
        <section className="max-w-6xl mx-auto px-6 pt-32 text-center">
            <p className="uppercase tracking-[0.3em] text-xs text-[#9c5c67] mb-6">
                Concierge Services
            </p>
            <h1 className="font-serif text-[64px] md:text-[96px] leading-[0.95] tracking-[-0.04em] mb-10">
                Elevated fertility care,
                personally curated.
            </h1>
            <p className="max-w-2xl mx-auto text-gray-600 leading-8 mb-12">
                Experience white-glove reproductive care designed around 
                discretion, comfort, and global accessibility.
            </p>
            <Link
                href="/concierge/contact"
                className="inline-flex items-center bg-[#9c5c67] text-white px-8 py-4 rounded-full uppercase tracking-[0.15em] text-sm hover:opacity-90 transition"
                >
                    Begin Your Journey →
                </Link>
        </section>
    );
}