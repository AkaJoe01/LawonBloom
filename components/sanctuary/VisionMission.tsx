import Image from "next/image";

export default function VisionMission() {
    return(
        <section className="border-t border-outline-variant/30">
            <div className="mx-auto max-w-360 grid grid-cols-1 gap-16 px-6 py-20 md:grid-cols-2 md:items-center lg:px-20 lg:py-28">

                {/* IMAGES */}
                <div>
                    <Image
                        src="/images/lab.jpg"
                        alt="lab"
                        width={900}
                        height={600}
                        className="cinematic-shadow rounded-4xl object-cover"
                    />
                </div>

                {/* TEXT */}
                <div>

                    {/* VISION */}
                    <div className="mb-16">
                        <h2 className="font-display text-3xl text-primary sm:text-4xl lg:text-[3.3rem]">
                            Our Vision
                        </h2>
                        <p className="mt-4 text-lg leading-8 text-on-surface-variant">
                            To cultivate an environment where absolute medical precision meets profound human empathy
                        </p>
                    </div>

                    {/* LINE */}
                    <div className="elegant-divider mb-16" />

                    {/* MISSION */}
                    <div>
                        <h2 className="font-display text-3xl text-primary sm:text-4xl lg:text-[3.3rem]">
                            Our Mission
                        </h2>
                        <p className="mt-4 text-lg leading-8 text-on-surface-variant">
                            We are dedicated to providing the highest echelon of reproductive science with grace and discretion
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}