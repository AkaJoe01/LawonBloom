import Link from "next/link";

export default function Hero(){
    return(
        <section className="max-w-6xl mx-auto px-6 py-28">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

                {/** LEFT */}
                <div>
                    <p className="uppercase tracking-[0.3em] text-xs text-[#9c5c67] mb-8">
                        Clinical Excellence
                    </p>
                    <h1 className="font-serif text-[64px] md:text-[88px] leading-[0.95] tracking-[-0.05em] mb-10">
                        Intrauterine
                        <br />
                        Insemination
                    </h1>
                    <p className="text-gray-600 leading-8 max-w-xl mb-10">
                        A minimally invasive fertility protocol combining advanced 
                        clinical precision with compassionate care.
                    </p>
                    <Link 
                        href="/concierge/contact"
                        className="inline-flex items-center bg-[#9c5c67] text-white px-8 py-4 rounded-full uppercase tracking-[0.15em] text-sm hover:opacity-90 transition"
                        >
                            Schedule Consultation
                        </Link>
                </div>

                {/** RIGHT IMAGE */}
                <div className="relative">
                    <img
                         src="/public/images/microscope.jpg"
                         alt="microscope"
                         className="rounded-[32px] w-full object-cover"
                         />
                </div>
            </div>
        </section>
    );
}