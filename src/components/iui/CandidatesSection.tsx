const cards = [
    {
        title: "Ideal Candidates",
        text: "IUI is recommended for unexplained infertility, ovulation irregularities, or donor sperm pathways.",
        large: true,
    },
    {
        title: "Unexplained Fertility",
        text: "Gentle targeted interventions for unexplained infertility cases.",
    },
    {
        title: "Donor Sperm",
        text: "A seamless supportive process for donor insemination pathways.",
    },
];

export default function CandidatesSection(){
    return(
        <section className="mx-auto max-w-6xl px-6 py-20 md:py-32">

            {/* HEADER */}
            <div className="mb-16 max-w-3xl md:mb-20">
                <h2 className="font-display text-4xl leading-[1] tracking-[-0.04em] text-foreground sm:text-5xl md:text-[56px] mb-8">
                    Is IUI Your
                    <br />
                    Next Step?
                </h2>
                <p className="text-on-surface-variant leading-8">
                    We evaluate each individual journey carefully to determine
                    whether IUI is the optimal fertility pathway.
                </p>
            </div>

            {/* GRID */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.5fr_0.7fr]">

                {/* LARGE CARD */}
                <div className="min-h-[320px] rounded-[36px] border border-outline-variant/30 bg-surface-bright/60 p-10 backdrop-blur-xl">
                    <h3 className="font-display text-3xl text-foreground mb-8 md:text-4xl">
                        {cards[0].title}
                    </h3>
                    <p className="max-w-xl text-on-surface-variant leading-8">
                        {cards[0].text}
                    </p>
                </div>

                {/* SMALL CARDS */}
                <div className="flex flex-col gap-8">
                    {cards.slice(1).map((card) => (
                        <div
                            key={card.title}
                            className="rounded-[32px] bg-surface-container-low p-8"
                        >
                            <h3 className="font-display text-2xl text-foreground mb-6">
                                {card.title}
                            </h3>
                            <p className="text-on-surface-variant leading-7">
                                {card.text}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
