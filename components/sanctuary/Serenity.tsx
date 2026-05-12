
export default function Serenity() {
    return(
       <section className="border-t border-outline-variant/30">
        <div className="mx-auto max-w-360 px-6 py-20 lg:px-20 lg:py-28">

            {/* TITLE */ }
            <div className="mb-20 text-center">
                <h2 className="font-display text-4xl text-primary sm:text-5xl lg:text-[3.3rem]">
                    Scientific Serenity
                </h2>
                <p className="mt-4 text-lg text-on-surface-variant">
                    The pillars of our clinic approach.
                </p>
            </div>

            {/* CARD */}
            <div className="grid gap-8 md:grid-cols-3">

                {/* CARD 1 */}
                <div className="glass-panel rounded-4xl p-10">
                    <div className="mb-6 text-4xl">⚗️</div>
                    <h3 className="font-display mb-4 text-2xl text-foreground">Pioneering Precision</h3>
                    <p className="leading-8 text-on-surface-variant">
                        Our laboratories utilize next-generation embryo technologies.
                    </p>
                </div>

                {/* CARD 2 */}
                <div className="glass-panel rounded-4xl p-10">
                    <div className="mb-6 text-4xl">🔬</div>
                    <h3 className="font-display mb-4 text-2xl text-foreground">Advanced Research</h3>
                    <p className="leading-8 text-on-surface-variant">
                        We are committed to advancing the field of reproductive medicine.
                    </p>
                </div>

                 {/* CARD 3 */}
                <div className="glass-panel rounded-4xl p-10">
                    <div className="mb-6 text-4xl">❤️</div>
                    <h3 className="font-display mb-4 text-2xl text-foreground">Absolute Discretion</h3>
                    <p className="leading-8 text-on-surface-variant">
                        Your journey is profoundly private and protected.
                    </p>
                </div>
            </div>
        </div>
       </section> 
    );
}