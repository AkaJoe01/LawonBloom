import Image from "next/image";

export default function Hero(){
    return(
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden">

            {/* IMAGES */}
            <Image
                src="/images/scan_1.jpg"
                alt="scan"
                fill
                priority
                className="object-cover opacity-20"
            />

            {/* OVERLAY */}
            <div className="absolute inset-0 bg-surface-bright/40 backdrop-blur-[2px]" />

            {/* CONTENT */}
            <div className="relative z-10 mx-auto max-w-3xl px-6">
                <div className="rounded-[40px] border border-outline-variant/30 bg-surface-bright/60 p-8 text-center shadow-xl backdrop-blur-xl md:p-20">
                    <p className="section-label mb-8 text-primary">
                        Fertility Preservation
                    </p>
                    <h1 className="font-display text-5xl leading-[0.95] tracking-[0.05em] text-foreground sm:text-6xl md:text-7xl lg:text-[96px] mb-8">
                        Protecting Your 
                        <br />
                        Future.
                    </h1>
                    <p className="mx-auto max-w-2xl text-on-surface-variant leading-8">
                        Time is the most precious luxury. Our elite egg and sperm
                        freezing protocols offer precision and peace of mind.
                    </p>
                </div>
            </div>
        </section>
    );
}
