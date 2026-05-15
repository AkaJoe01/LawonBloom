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
        <section className="max-w-6xl mx-auto px-6 py-32">

            {/** HEADER */}
            <div className="max-w-3xl mb-20">
                <h2 className="font-serif text-[56px] leading-none tracking-[-0.04em] mb-8">
                    Is IUI Your
                    <br />
                    Next Step?
                </h2>
                <p className="text-gray-600 leading-8">
                    We evaluate each individual journey carefully to determine
                    whether IUI is the optimal fertility pathway.
                </p>
            </div>

            {/** GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_0.7fr] gap-8">

                {/** LARGE CARD */}
                <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-[36px] p-10 min-h-[320px">
                    <h3 className="font-serif text-4xl mb-8">
                        {cards[0].title}
                    </h3>
                    <p className="text-gray-600 leading-8 max-w-xl">
                        {cards[0].text}
                    </p>
                </div>

                {/** SMALL CARDS */}
                <div className="flex flex-col gap-8">

                    {cards.slice(1).map((card) => (
                        <div
                            key={card.title}
                            className="bg-[#f1ece7] rounded-4xl p-8"
                            >
                                <h3 className="font-serif tetxt-2xl mb-6">
                                    {card.title}
                                </h3>
                                <p className="text-gray-600 leading-7">
                                    {card.text}
                                </p>
                            </div>
                    ))}
                </div>
            </div>
        </section>
    );
}