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
        <section className="mx-auto max-w-6xl px-6 pb-20 md:pb-32">
            <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-20">

                {/* IMAGES */}
                <div className="relative">
                    <Image
                        src="/images/femaleDr.jpg"
                        alt="femaleDr"
                        width={400}
                        height={500}
                        className="w-full max-w-md rounded-[36px] object-cover"
                    />
                    <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full border border-outline-variant md:-bottom-10 md:-right-10 md:h-40 md:w-40" />
                </div>

                {/* CONTENT */}
                <div>
                    <h2 className="font-display text-4xl leading-[1] tracking-[-0.04em] text-foreground sm:text-5xl md:text-[56px] mb-10">
                        Defining 
                        <br />
                        Your Timeline.
                    </h2>
                    <p className="text-on-surface-variant leading-8 mb-14">
                        Preservation empowers future flexibility and reproductive confidence.
                    </p>
                    <div className="space-y-10">
                        {items.map((item, index) => (
                            <div key={index} className="flex gap-6">
                                <div className="mt-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-primary">
                                    <div 
                                        className={`
                                            h-2 w-2 rounded-full
                                            ${index === 0 ? "bg-primary" : ""}
                                        `}
                                    />
                                </div>
                                <div>
                                    <h3 className="font-display text-2xl text-foreground mb-3">
                                        {item.title}
                                    </h3>
                                    <p className="text-on-surface-variant leading-7">
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
