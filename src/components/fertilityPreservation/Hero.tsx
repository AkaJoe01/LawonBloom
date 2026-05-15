import Image from "next/image";

export default function Hero(){
    return(
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">

            {/* IMAGES */}
            <Image
                src="/images/scan_1.jpg"
                alt="scan"
                fill
                priority
                className="object-cover opacity-20"
            />

                {/* OVERLAY */}
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]" />

                {/* CONTENT */ }
                <div className="relative z-10 max-w-3xl mx-auto px-6">
                    <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-[40px] p-12 md:p-20 text-center shadow-xl">
                        <p className="uppercase tracking-[0.3em] text-xs text-[@9c5c67] mb-8">
                            Fertility Preservation
                        </p>
                        <h1 className="font-serif text-[64px] md:text-[96px] leading-[0.95] tracking-[0.05em] mb-8">
                            Protecting Your 
                            <br />
                            Future.
                        </h1>
                        <p className="text-gray-600 leading-8 max-w-2xl mx-auto">
                            Time is the most precious lexury. Our elite egg and sperm
                            freezing protocols offer precision and peace of mind.
                        </p>
                    </div>
                </div>
        </section>
    );
}