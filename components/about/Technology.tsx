import Image from 'next/image';

export default function Technology() {
    return(
        <section id="technology" className="mx-auto max-w-360 px-6 py-20 lg:px-20 lg:py-28">
            <div className="mb-12 text-center">
                <h2 className="font-display text-3xl text-foreground sm:text-4xl lg:text-[3.3rem]">
                    Pioneering Technology
                </h2>
                <p className="mt-4 text-lg text-on-surface-variant">
                    Discover the state-of-the-art instruments that define our excellence.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">

                {/*BIG CARD */}
                <div className="relative h-100 md:col-span-2">
                    <Image 
                        src="/images/microscope.jpg" 
                        alt="Time-Lapse Incubators"
                        sizes="(max-width: 768px) 100vw, 66vw"
                        fill
                        className="rounded-4xl object-cover" 
                    />
                    <div className="absolute inset-0 rounded-4xl bg-linear-to-t from-surface-bright/80 to-transparent p-6 flex flex-col justify-end">
                        <h3 className="font-display text-2xl text-foreground">
                            Time-Lapse Incubators
                        </h3>
                        <p className="mt-2 text-sm text-on-surface-variant">
                            Continuous embryo monitoring with precision.
                        </p>
                    </div>
            </div>

            {/* RIGHT CARD */}
            <div className="flex flex-col gap-6">
                <div className="relative h-48">
                    <Image 
                        src="/images/probe.jpg"
                        alt="Laser Assisted Hatching"
                        sizes="(max-width: 768px) 100vw, 33vw"
                        fill
                        className="rounded-4xl object-cover"
                        />
                        <div className="absolute inset-0 rounded-4xl bg-linear-to-t from-surface-bright/80 to-transparent flex flex-col justify-end p-5">
                           <h4 className="font-display text-foreground">Laser Assisted Hatching</h4>
                        </div>
                </div>

                <div className="relative h-48">
                    <Image
                        src="/images/Surgery.jpg"
                        alt="Vault"
                        sizes="(max-width: 768px) 100vw, 33vw"
                        fill
                        className="rounded-4xl object-cover"
                        />
                        <div className="absolute inset-0 rounded-4xl bg-linear-to-t from-surface-bright/80 to-transparent flex flex-col justify-end p-5">
                           <h4 className="font-display text-foreground">Cryo-Storage Vault</h4>
                        </div>
                </div>
            </div>
            </div>
        </section>
    );
}