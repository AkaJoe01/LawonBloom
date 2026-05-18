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
        <section className="mx-auto max-w-6xl px-6 pb-20 md:pb-32">
            <div className="grid grid-cols-1 gap-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">

                {/* LEFT */}
                <div>
                    <h2 className="font-display text-4xl leading-[1] tracking-[-0.04em] text-foreground sm:text-5xl md:text-[56px] mb-8">
                        The Sequence
                        <br />
                        of Care
                    </h2>
                    <p className="text-on-surface-variant leading-8">
                        A synchronized evidence-based fertility pathway designed
                        with precision and compassion.
                    </p>
                </div>

                {/* RIGHT TIMELINE */}
                <div className="relative border-l border-outline-variant pl-8 space-y-16 md:pl-12">
                    {steps.map((step, index) => (
                        <div key={index} className="relative">
                            {/* DOT */}
                            <div className="absolute -left-[41px] top-2 flex h-5 w-5 items-center justify-center rounded-full border border-primary bg-surface md:-left-[57px]">
                                <div className="h-2 w-2 rounded-full bg-primary" />
                            </div>
                            <p className="section-label mb-4 text-primary">
                                {step.phase}
                            </p>
                            <h3 className="font-display text-2xl text-foreground mb-6 md:text-3xl">
                                {step.title}
                            </h3>
                            <p className="text-on-surface-variant leading-8">
                                {step.text}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
