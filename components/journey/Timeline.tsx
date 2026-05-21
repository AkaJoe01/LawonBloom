import Image from "next/image";

export default function Timeline() {
    return (
        <section className="mx-auto max-w-360 px-6 py-20 lg:px-20 lg:py-28">

            {/* HERO */}
            <div className="mx-auto mb-20 max-w-2xl text-center">
                <p className="section-label mb-4 text-primary">
                    Your Path to Parenthood
                </p>
                <h1 className="font-display text-4xl leading-tight text-foreground sm:text-5xl lg:text-[3.3rem]">
                    The Journey of a Thousand Miracles
                </h1>
                <p className="mt-6 text-lg leading-8 text-on-surface-variant">
                    Every path is deeply personal. We guide you step-by-step toward the future you envision.
                </p>
            </div>

            {/* TIMELINE WRAPPER */}
            <div className="relative">
                {/* Vertical line - hidden on mobile */}
                <div className="hidden md:block absolute left-1/2 top-0 h-full w-px bg-outline-variant -translate-x-1/2" />

                {/* STEP 1 */}
                <div className="relative mb-16 grid items-center gap-8 md:mb-24 md:grid-cols-2 md:gap-12">
                    <div className="order-2 pr-0 text-left md:order-1 md:pr-16 md:text-right">
                        <p className="section-label mb-2 text-primary">
                            Step 01
                        </p>
                        <h3 className="font-display mb-4 text-2xl text-foreground">
                            The First Consultation
                        </h3>
                        <p className="text-on-surface-variant sm:text-base">
                            We begin with charts, conversations, and a personalized blueprint.
                        </p>
                    </div>

                    <div className="order-1 pl-0 md:order-2 md:pl-16">
                        <Image
                            src="/images/doctor.jpg"
                            alt="Consultation"
                            width={1200}
                            height={800}
                            className="cinematic-shadow w-full rounded-4xl object-cover"
                        />
                    </div>

                    {/* Dot - hidden on mobile */}
                    <div className="hidden md:block absolute left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-primary" />
                </div>

                {/* STEP 2 */}
                <div className="relative mb-16 grid items-center gap-8 md:mb-24 md:grid-cols-2 md:gap-12">
                    <div className="order-1 pl-0 md:order-2 md:col-start-2 md:pl-16">
                        <p className="section-label mb-2 text-primary">
                            Step 02
                        </p>
                        <h3 className="font-display mb-4 text-2xl text-foreground">
                            Precision & Clarity
                        </h3>
                        <p className="text-on-surface-variant sm:text-base">
                            Every nuance of your reproductive health is understood.
                        </p>
                    </div>

                    <div className="order-2 pr-0 md:order-1 md:col-start-1 md:pr-16">
                        <div className="glass-panel rounded-4xl p-6">
                            <ul className="space-y-3 text-on-surface-variant">
                                <li>✔ Genetic Screening</li>
                                <li>✔ Hormonal Profiling</li>
                                <li>✔ Advanced Imaging</li>
                            </ul>
                        </div>
                    </div>

                    {/* Dot - hidden on mobile */}
                    <div className="hidden md:block absolute left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-outline-variant" />
                </div>

                {/* STEP 3 */}
                <div className="relative mb-16 grid items-center gap-8 md:mb-24 md:grid-cols-2 md:gap-12">
                    <div className="order-2 pr-0 text-left md:order-1 md:pr-16 md:text-right">
                        <p className="section-label mb-2 text-primary">
                            Step 03
                        </p>
                        <h3 className="font-display mb-4 text-2xl text-foreground">
                            The Treatment Phase
                        </h3>
                        <p className="text-on-surface-variant sm:text-base">
                            Guided by science and nurtured by care, your treatment protocol is executed with precision.
                        </p>
                    </div>

                    <div className="order-1 pl-0 md:order-2 md:pl-16">
                        <Image
                            src="/images/blood.jpg"
                            alt="Treatment"
                            width={1200}
                            height={800}
                            className="cinematic-shadow w-full rounded-4xl object-cover"
                        />
                    </div>

                    {/* Dot - hidden on mobile */}
                    <div className="hidden md:block absolute left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-primary" />
                </div>
            </div>
        </section>
    );
}
