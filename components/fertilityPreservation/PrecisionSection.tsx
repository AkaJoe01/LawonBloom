import Image from "next/image";
import {
    ShieldCheck,
    Activity,
    Snowflake,
} from "lucide-react";

export default function PrecisionSection(){
    return(
        <section className="mx-auto max-w-6xl px-6 py-20 md:py-32">

            {/* TOP TEXT */}
            <div className="mb-16 max-w-2xl md:mb-24">
                <h2 className="font-display text-4xl leading-[1] tracking-[-0.04em] text-foreground sm:text-5xl md:text-[56px] mb-8">
                    Absolute Precision.
                    <br />
                    <span className="italic text-primary">
                        Unwavering Security.
                    </span>
                </h2>
                <p className="text-on-surface-variant leading-8">
                    Advanced vitrification technology housed in continuously
                    monitored environments ensuring exceptional preservation.
                </p>
            </div>

            {/* GRID */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.5fr_0.7fr]">

                {/* LARGE CARD */}
                <div className="relative min-h-[400px] overflow-hidden rounded-[36px] md:min-h-[500px]">
                    <Image
                        src="/images/scan_2.jpg"
                        alt="largeGrid"
                        fill
                        priority
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute bottom-8 left-8 text-white max-w-md md:bottom-10 md:left-10">
                        <Snowflake className="mb-6 h-8 w-8" />
                        <h3 className="font-display text-3xl mb-6 md:text-4xl">
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
                    <div className="rounded-[32px] border border-outline-variant/30 bg-surface-bright/60 p-8 backdrop-blur-xl">
                        <ShieldCheck className="mb-6 h-8 w-8 text-primary" />
                        <h4 className="font-display text-2xl text-foreground mb-4">
                            Biometric Security
                        </h4>
                        <p className="text-on-surface-variant leading-7">
                            Multi-layered protection accessible only to senior embryologists.
                        </p>
                    </div>
                    <div className="rounded-[32px] bg-surface-container-low p-8">
                        <Activity className="mb-6 h-8 w-8 text-primary" />
                        <h4 className="font-display text-2xl text-foreground mb-4">
                            24/7 Monitoring
                        </h4>
                        <p className="text-on-surface-variant leading-7">
                            Real-time environmental tracking with micro-degree precision.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
