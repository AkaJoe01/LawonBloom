import Image from "next/image";

export default function Timeline() {
    return (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-24">

            {/* HERO */}
            <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-24">
                <p className="text-xs sm:text-sm tracking-[0.3em] text-gray-500 uppercase mb-4">
                    Your Path to Parenthood
                </p>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[48px] leading-tight font-serif">
                    The Journey of a Thousand Miracles
                </h1>
                <p className="mt-4 sm:mt-6 text-gray-600 text-sm sm:text-base">
                    Every path is deeply personal. We guide you step-by-step toward the future you envision.
                </p>
            </div>

            {/* TIMELINE WRAPPER */}
            <div className="relative">
                {/* Vertical line - hidden on mobile */}
                <div className="hidden md:block absolute left-1/2 top-0 h-full w-px bg-gray-300 -translate-x-1/2" />

                {/* STEP 1 */}
                <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center mb-16 md:mb-24 relative">
                    <div className="md:text-right pr-0 md:pr-16 order-2 md:order-1">
                        <p className="text-xs text-gray-400 uppercase mb-2">
                            Step 01
                        </p>
                        <h3 className="text-lg sm:text-xl font-serif mb-4">
                            The First Consultation
                        </h3>
                        <p className="text-gray-600 text-sm sm:text-base">
                            We begin with charts, conversations, and a personalized blueprint.
                        </p>
                    </div>

                    <div className="pl-0 md:pl-16 order-1 md:order-2">
                        <Image
                            src="/images/doctor.jpg"
                            alt="Consultation"
                            width={1200}
                            height={800}
                            className="rounded-2xl shadow-md w-full object-cover"
                        />
                    </div>

                    {/* Dot - hidden on mobile */}
                    <div className="hidden md:block absolute left-1/2 w-3 h-3 bg-red-500 rounded-full -translate-x-1/2" />
                </div>

                {/* STEP 2 */}
                <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center mb-16 md:mb-24 relative">
                    <div className="md:col-start-2 pl-0 md:pl-16 order-1 md:order-2">
                        <p className="text-xs text-gray-400 uppercase mb-2">
                            Step 02
                        </p>
                        <h3 className="text-lg sm:text-xl font-serif mb-4">
                            Precision & Clarity
                        </h3>
                        <p className="text-gray-600 text-sm sm:text-base">
                            Every nuance of your reproductive health is understood.
                        </p>
                    </div>

                    <div className="md:col-start-1 pr-0 md:pr-16 order-2 md:order-1">
                        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
                            <ul className="space-y-3 sm:space-y-4 text-gray-600 text-sm sm:text-base">
                                <li>✔ Genetic Screening</li>
                                <li>✔ Hormonal Profiling</li>
                                <li>✔ Advanced Imaging</li>
                            </ul>
                        </div>
                    </div>

                    {/* Dot - hidden on mobile */}
                    <div className="hidden md:block absolute left-1/2 w-3 h-3 bg-gray-400 rounded-full -translate-x-1/2" />
                </div>

                {/* STEP 3 */}
                <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center mb-16 md:mb-24 relative">
                    <div className="md:text-right pr-0 md:pr-16 order-2 md:order-1">
                        <p className="text-xs text-gray-400 uppercase mb-2">
                            Step 03
                        </p>
                        <h3 className="text-lg sm:text-xl font-serif mb-4">
                            The Treatment Phase
                        </h3>
                        <p className="text-gray-600 text-sm sm:text-base">
                            Guided by science and nurtured by care, your treatment protocol is executed with precision.
                        </p>
                    </div>

                    <div className="pl-0 md:pl-16 order-1 md:order-2">
                        <Image
                            src="/images/blood.jpg"
                            alt="Treatment"
                            width={1200}
                            height={800}
                            className="rounded-2xl shadow-md w-full object-cover"
                        />
                    </div>

                    {/* Dot - hidden on mobile */}
                    <div className="hidden md:block absolute left-1/2 w-3 h-3 bg-red-500 rounded-full -translate-x-1/2" />
                </div>
            </div>
        </section>
    );
}
