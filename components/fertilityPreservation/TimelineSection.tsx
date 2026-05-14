import Image from "next/image";

export default function TimelineSection(){
    const items = [
        {
            title: "Career Ascension",
            text: "Preserve reproductive freedom while focusing on professional milestone.",
        },
        {
            title: "Medical Necessity",
            text: "Expedited fertility care before treatments impacting fertility.",
        },
        {
            title: "Personal Readiness",
            text: "Created future flexibility without the pressure of time constraints.",
        },
    ];

    return(
        <section className="max-w-6xl mx-auto px-6 pb-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

                {/* IMAGES */}
                <div className="relative">
                    <Image
                        src="/images/femaleDr.jpg"
                        alt="femaleDr"
                        width={400}
                        height={500}
                        className="rounded-[36px] w-full max-w-md"
                    />
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 border border-[#d6c7c0] rounded-full" />
                </div>

                {/* CONTENT */}
                <div>
                    <h2 className="font-serif text-[56px] leading-[1] tracking-[-0.04em] mb-10">
                        Defining 
                        <br />
                        Your Timeline.
                    </h2>
                    <p className="text-gray-600 leading-8 mb-14">
                        Preservation empowers future flexibility and reproductive confidence.
                    </p>
                    <div className="space-y-10">
                        {items.map((item, index) => (
                            <div key={index} className="flex gap-6">
                                <div className="mt-2 w-5 h-5 rounded-full border border-[#9c5c67] flex items-center justify-center">
                                    <div 
                                        className={`
                                            w-2 h-2 rounded-full
                                            ${index === 0 ? "bg-[#9c5c67]" : ""}
                                            `}
                                            />
                                </div>
                                <div>
                                    <h3 className="font-serif text-2xl mb-3">
                                        {item.title}
                                    </h3>
                                    <p className="text-gray-600 leading-7">
                                        {item.text}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}