import Image from 'next/image';

export default function Technology() {
    return(
        <section id="technology" className="max-w-7xl mx-auto px-6 py-20">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-serif">
                    Pioneering Technology
                </h2>
                <p className="text-gray-600 mt-2">
                    Discover the state-of-the-art instruments that define our excellence.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">

                {/*BIG CARD */}
                <div className="md:col-span-2 relative h-[400px]">
                    <Image 
                        src="/images/microscope.jpg" 
                        alt="Time-Lapse Incubators"
                        sizes="(max-width: 768px) 100vw, 66vw"
                        fill
                        className="rounded-2xl object-cover" 
                    />
                    <div className="absolute bottom-0 w-full
                    p-6 bg-gradient-to-t from-black/60 
                    to-transparent text-white rounded-2xl">
                        <h3 className="text-xl font-semibold">
                            Time-Lapse Incubators
                        </h3>
                        <p className="text-sm mt-2">
                            Continuous embryo monitoring with precision.
                        </p>
                    </div>
            </div>

            {/* RIGHT CARD */}
            <div className="flex flex-col gap-6">
                <div className="relative h-[188px]">
                    <Image 
                        src="/images/probe.jpg"
                        alt="Laser Assisted Hatching"
                        sizes="(max-width: 768px) 100vw, 33vw"
                        fill
                        className="rounded-2xl object-cover"
                        />
                        <div className="absolute bottom-0 p-4 bg-white/80 rounded-b-2xl w-full">
                           <h4 className="font-medium text-gray-800">Laser Assisted Hatching</h4>
                        </div>
                </div>

                <div className="relative h-[188px]">
                    <Image
                        src="/images/Surgery.jpg"
                        alt="Vault"
                        sizes="(max-width: 768px) 100vw, 33vw"
                        fill
                        className="rounded-2xl object-cover"
                        />
                        <div className="absolute bottom-0 p-4 bg-white/80 rounded-b-2xl w-full">
                           <h4 className="font-medium text-gray-800">Cryo-Storage Vault</h4>
                        </div>
                </div>
            </div>
            </div>
        </section>
    );
}