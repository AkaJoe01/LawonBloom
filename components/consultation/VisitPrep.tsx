export default function VisitPrep(){
    return(
        <section className="max-w-6xl mx-auto px-6 py-32">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">

                {/* LEFT */ }
                <div>
                    <h2 className="font-serif text-[56px] leading-[1.1] mb-8">
                        Prepare for your Sanctuary Visit
                    </h2>
                    <p className="text-gray-600 leading-8 mb-10">
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
                <div>
                    <img 
                        src="/images/corridor.jpg"
                        alt="corridor"
                        className="rounded-3xl shadow-sm"
                        />
                </div>

            </div>
        </section> 
    );
}