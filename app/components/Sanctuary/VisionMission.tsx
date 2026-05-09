import Image from "next/image";

export default function VisionMission() {
    return(
        <section className="border-t border-[#8e1da]">
            <div className="max-w-6xl mx-auto px-6 py-24 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

                {/* IMAGES */}
                <div>
                    <Image
                        src="/images/lab.jpg"
                        alt="lab"
                        width={900}
                        height={600}
                        className="rounded-xl shadow-sm"
                    />
                </div>

                {/* TEXT */}
                <div>

                    {/* VISION */}
                    <div className="mb-16">
                        <h2 className="font-serif text-4xl text-[#9c5c67] mb-6">
                            Our Vision
                        </h2>
                        <p className="text-gray-600 leading-8">
                            To cultivate an environment where absolute medical precision meets profound human empathy
                        </p>
                    </div>

                    {/* LINE */}
                    <div className="w-20 h-[1px] bg-[#ddd] mb-16" />

                    {/* MISSION */}
                    <div>
                        <h2 className="font-serif text-4xl text-[#9c5c67] mb-6">
                            Our Mission
                        </h2>
                        <p className="text-gray-600 leading-8">
                            We are dedicated to providing the highest echelon of reproductive science with grace and discretion
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}