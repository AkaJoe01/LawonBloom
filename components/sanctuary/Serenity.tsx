
export default function Serenity() {
    return(
       <section className="border-t border-[#e8e1da]">
        <div className="max-w-6xl mx-auto px-6 py-24">

            {/* TITLE */ }
            <div className="text-center mb-20">
                <h2 className="font-serif text-[48px] text-[#9c5c67] mb-4">
                    Scientific Serenity
                </h2>
                <p className="text-gray-500">
                    The pillars of our clinic approach.
                </p>
            </div>

            {/* CARD */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* CARD 1 */}
                <div className="bg-white/70 rounded-2xl p-10 shadow-sm">
                    <div className="text-3xl mb-6">⚗️</div>
                    <h3 className="font-serif text-2xl mb-4">Pioneering Precision</h3>
                    <p className="text-gray-600 leading-7">
                        Our laboratories utilize next-generation embryo technologies.
                    </p>
                </div>

                {/* CARD 2 */}
                <div className="bg-white/70 rounded-2xl p-10 shadow-sm">
                    <div className="text-3xl mb-6">🔬</div>
                    <h3 className="font-serif text-2xl mb-4">Advanced Research</h3>
                    <p className="text-gray-600 leading-7">
                        We are committed to advancing the field of reproductive medicine.
                    </p>
                </div>

                 {/* CARD 3 */}
                <div className="bg-white/70 rounded-2xl p-10 shadow-sm">
                    <div className="text-3xl mb-6">❤️</div>
                    <h3 className="font-serif text-2xl mb-4">Absolute Discretion</h3>
                    <p className="text-gray-600 leading-7">
                        Your journey is profoundly private and protected.
                    </p>
                </div>
            </div>
        </div>
       </section> 
    );
}