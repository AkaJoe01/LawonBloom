import Image from "next/image";
import Link from "next/link";

export default function Hero(){
    return(
        <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">

                {/* LEFT */}
                <div>
                    <p className="section-label mb-8 text-primary">
                        Clinical Excellence
                    </p>
                    <h1 className="font-display text-5xl leading-[0.95] tracking-[-0.05em] text-foreground sm:text-6xl md:text-7xl lg:text-[88px] mb-10">
                        Intrauterine
                        <br />
                        Insemination
                    </h1>
                    <p className="max-w-xl text-on-surface-variant leading-8 mb-10">
                        A minimally invasive fertility protocol combining advanced 
                        clinical precision with compassionate care.
                    </p>
                    <Link 
                        href="/concierge/contact"
                        className="inline-flex items-center bg-primary text-on-primary px-8 py-4 rounded-full uppercase tracking-[0.15em] text-sm hover:opacity-90 transition"
                    >
                        Schedule Consultation
                    </Link>
                </div>

                {/* RIGHT IMAGE */}
                <div className="relative">
                    <Image
                        src="/images/microscope.jpg"
                        alt="microscope"
                        width={600}
                        height={500}
                        className="w-full rounded-[32px] object-cover"
                    />
                </div>
            </div>
        </section>
    );
}
