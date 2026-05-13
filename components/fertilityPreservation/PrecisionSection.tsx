import Image from "next/image";
import {
    ShieldCheck,
    Activity,
    Snowflake,
} from "lucide-react";

export default function PrecisionSection(){
    return(
        <section className="max-w-6xl mx-auto px-6 py-32">

            {/* TOP TEXT */}
            <div className="max-w-2xl mb-24">
                <h2 className="font-serif text-[56px] leading-[1] tracking-[-0.04em] mb-8">
                    Absolute Precision.
                    <br />
                    <span className="italic text-[#9c5c67]">
                        Unwavering Security.
                    </span>
                </h2>
                <p className="text-gray-600 leading-8">
                    Advanced vitrification technology housed in continuously
                    monitored environments ensuring exceptional preservation.
                </p>
            </div>

            {/* GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_0.7fr] gap-8">

                {/* LARGE CARD */}
                <div className="relative rounded-[36px] overflow-hidden min-h-[500px]">
                    <Image
                        src="/images/scan_2.jpg"
                        alt="largeGrid"
                        fill
                        priority
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute bottom-10 left-10 text-white max-w-md">
                        <Snowflake className="w-8 h-8 mb-6" />
                        <h3 className="font-serif text-4xl mb-6">
                            Rapid Vitrification
                        </h3>
                        <p className="leading-8 text-white/90">
                            Flash-freezing protocols prevent ice crystal formation
                            and preserve cellular integrity.
                        </p>
                    </div>
                </div>

                {/* SIDE CARDS */}
                <div className="flex flex-col gap-8">
                    <div className="bg-white/60 backdrop-blur-xl rounded-[32px] p-8 border border-white/40">
                        <ShieldCheck className="w-8 h-8 text-[#9c5c67] mb-6" />
                        <h4 className="font-serif text-2xl mb-4">
                            Biometric Security
                        </h4>
                        <p className="text-gray-600 leading-7">
                            Multi-layered protection accessible only to senior embryologists.
                        </p>
                    </div>
                    <div className="bg-[#f1ece71] rounded-[32px] p-8">
                        <Activity className="w-8 h-8 text-[#9c5c67] mb-6" />
                        <h4 className="font-serif text-2xl mb-4">
                            24/7 Monitoring
                        </h4>
                        <p className="text-gray-600 leading-7">
                            Real-time environmental tracking with micro-degree precision.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}