export default function TeamPage(){
    return(
        <main className="bg-[#f5f2ee] text-[#2e2e27]">
            
            {/* HERO */}
            <section className="px-8 md:px-20 py-28 border-b border-[#ddd]">
                <p className="uppercase tracking-[0.2em] text-xs mb-6 text-[#8b7d75]">
                    The Architects of Hope
                </p>
                <h1 className="text-5xl md:text-7xl leading-tight font-light max-w-3xl">
                    The Minds <br />
                    Behind the <span className="italic text-[#9d6f6f]">Miracles</span>
                </h1>
                <p className="max-w-xl mt-10 text-sm leading-7 text-[#6f6965]">
                    Meet the globally recognized medical authorities,
                    embryologists, and compassionate counselors who form
                    the cornerstone of LawonBloom&apos;s clinical excellence.
                </p>
            </section>

            {/* LEAD DOCTOR */}
            <section className="grid md:grid-cols-2 gap-14 px-8 md:px-20 py-24 items-center">
                <div className="relative w-full h-[500px]">
                    <img 
                        src="/public/images/maleDr.jpg"
                        alt="Lead Specialist"
                        className="object-cover"
                        />
                </div>
                <div>
                    <h2 className="text-4xl font-light mb-4">
                        Dr. Olugbenga Oluseun Saanu
                    </h2>
                    <p className="uppercase tracking-[0.15em] text-xs text-[#9d6f6f] mb-10">
                        Chief Medical Director & Lead Fertility Specialist
                    </p>
                    <p className="text-[#6f6965] leading-8 mb-10">
                        A visionary reproductive medicine expert with decades of
                        dedicated global experience, Dr. Saanu combines advanced 
                        medical innovation with compassionate patient care.
                    </p>
                    <div className="space-y-8">
                        <div>
                            <p className="uppercase text-xs tracking-[0.15em] text-[#8b7d75]">
                                Specialist Recognition
                            </p>
                            <h3 className="text-2xl font-light mt-2">
                                Royal College of Obstetricians &
                                Gynecologists.
                            </h3>
                        </div>
                        <div>
                            <p className="uppercase text-xs tracking-[0.15em] text-[#8b7d75]">
                                Authority
                            </p>
                            <h3 className="text-2xl font-light mt-2">
                                Pioneer in Advanced ART Protocols
                            </h3>
                        </div>
                    </div>
                </div>
            </section>

            {/* TEAM GRID */}
            <section className="px-8 md:px-20 py-24 border-t border-[#ddd]">
                <div className="text-center mb-20">
                    <h2 className="text-5xl font-light mb-6">
                        The Elite Care Cadre
                    </h2>
                    <p className="max-w-2xl mx-auto text-[#6f6965]">
                        Our multidisciplinary team of embryologists,
                        specialized nurses, and clinical counselors work
                        in synchronized harmony.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-10">

                    {/* CARD 1 */ }
                    <div>
                        <div className="relative h-[400px] w-full mb-6">
                            <img
                                src="/public/images/nurse.jpg"
                                alt="nurse"
                                className="object-cover"
                                />
                        </div>
                        <h3 className="text-2xl font-light">
                            Nurse Elena Rostova
                        </h3>
                        <p className="uppercase text-xs tracking-[0.15em] mt-2 text-[#8b7d75]">
                            Fertility nurse
                        </p>
                    </div>

                    {/* CARD 2 */ }
                    <div>
                        <div className="relative h-[400px] w-full mb-6">
                            <img
                                src="/public/images/Doc_1"
                                alt="Doctor"
                                className="object-cover"
                                />
                        </div>
                        <h3 className="text-2xl font-light">
                            Serah Jenkins
                        </h3>
                        <p className="uppercase text-xs tracking-[0.15em] mt-2 text-[#8b7d75]">
                            Director of Patient  Wellness
                        </p>
                    </div>

                    {/* CARD 3 */}
                    <div>
                        <div className="relative h-[400px] w-full mb-6">
                            <img
                                src="/public/images/marcus.jpg"
                                alt="marcus"
                                className="object-cover"
                                />
                        </div>
                        <h3 className="text-2xl font-light">
                            Dr. Marcus Thorne
                        </h3>
                        <p className="uppercase text-xs tracking-[0.15em] mt-2 text-[#8b7d75]">
                            Reproductive Geneticist
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}