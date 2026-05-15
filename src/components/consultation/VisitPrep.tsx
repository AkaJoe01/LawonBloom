import Image from 'next/image';

export default function VisitPrep(){
    return(
        <section className="max-w-6xl mx-auto px-6 py-16 md:py-32">
            <div className="grid grid-cols-1 gap-12 items-center md:grid-cols-2">

                {/* LEFT */}
                <div className="max-w-xl">
                    <h2 className="font-serif text-4xl md:text-[56px] leading-tight md:leading-[1.1] mb-6 md:mb-8">
                        Prepare for your Sanctuary Visit
                    </h2>
                    <p className="text-gray-600 leading-8 mb-8 md:mb-10">
                        We believe the journey to parenthood should be enveloped
                        in calm and clarity.
                    </p>
                    <div className="space-y-8">
                        <div>
                            <h3 className="uppercase tracking-[0.2em] text-sm mb-2 text-[#9c5c67]">
                                Emotional Blueprinting
                            </h3>
                            <p className="text-gray-600">
                                A dedicated concierge will support your consultation journey.
                            </p>
                        </div>
                        <div>
                            <h3 className="uppercase tracking-[0.2em] text-sm mb-2 text-[#9c5c67]">
                                Secure Records Transfer
                            </h3>
                            <p className="text-gray-600">
                                Upload past medical records through encrypted channels.
                            </p>
                        </div>
                    </div>
                </div>

                {/* RIGHT */}
                <div className="flex justify-center">
                    <div className="w-full max-w-xl rounded-3xl shadow-sm overflow-hidden">
                        <Image
                            src="/images/corridor.jpg"
                            alt="corridor"
                            width={400}
                            height={500}
                            className="w-full object-cover"
                        />
                    </div>
                </div>

            </div>
        </section>
    );
}