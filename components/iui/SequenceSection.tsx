const steps = [
    {
        phase: "Phase 1",
        title: "Monitoring & Stimulation",
        text: "Ovulation cycles are monitored precisely using advanced imaging and hormonal tracking.",
    },

    {
        phase: "Phase 2",
        title: "Sample Preparation",
        text: "Sperm samples undergo laboratory refinement before insemination.",
    },

    {
        phase: "Phase 3",
        title: "The Procedure",
        text: "Prepared sperm is introduced carefully into the uterine cavity during ovulation.",
    },
];

export default function SequenceSection(){
    return(
        <section className="max-w-6xl mx-auto px-6 pb-32">
            <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-24">

                {/** LEFT */}
                <div>
                    <h2 className="font-serif text-[56px] leading-[1] tracking-[-0.4em] mb-8">
                        The Sequence
                        <br />
                        of Care
                    </h2>
                    <p className="text-gray-600 leading-8">
                        A synchronized evidence-based fertility pathway designed
                        with precision and compassion.
                    </p>
                </div>

                {/** RIGHT TIMELINE */}
                <div className="relative border-1 border-[#d8ccc6] pl-12 space-y-16">
                    {steps.map((step, index) => (
                        <div key={index} className="relative">

                            {/** DOT */}
                            <div className="absolute -left-[57px] top-2 w-5 h-5 rounded-full border border-[#9c5c67] bg-[#f5f2ee] flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-[#9c5c67]" />
                            </div>
                            <p className="uppercase tracking-[0.25em] text-xs text-[#9c5c67] mb-4">
                                {step.phase}
                            </p>
                            <h3 className="font-serif text-3xl mb-6">
                                {step.title}
                            </h3>
                            <p ckassName="text-gray-600 leading-8">
                                {step.text}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}