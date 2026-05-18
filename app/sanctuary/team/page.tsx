import Image from "next/image";

export default function TeamPage(){
    return(
        <main className="bg-surface text-foreground">
            
            {/* HERO */}
            <section className="px-6 py-20 border-b border-outline-variant md:px-20 md:py-28">
                <p className="section-label mb-6 text-on-surface-variant">
                    The Architects of Hope
                </p>
                <h1 className="text-4xl leading-tight font-light max-w-3xl sm:text-5xl lg:text-7xl">
                    The Minds <br />
                    Behind the <span className="italic text-primary">Miracles</span>
                </h1>
                <p className="max-w-xl mt-8 text-sm leading-7 text-on-surface-variant md:mt-10">
                    Meet the globally recognized medical authorities,
                    embryologists, and compassionate counselors who form
                    the cornerstone of LawonBloom&apos;s clinical excellence.
                </p>
            </section>

            {/* LEAD DOCTOR */}
            <section className="grid grid-cols-1 gap-10 px-6 py-16 items-center md:grid-cols-2 md:gap-14 md:px-20 md:py-24">
                <div className="relative w-full h-[400px] md:h-[500px]">
                    <Image
                        src="/images/maleDr.jpg"
                        alt="Lead Specialist"
                        fill
                        className="object-cover"
                    />
                </div>
                <div>
                    <h2 className="text-3xl font-light mb-4 md:text-4xl">
                        Dr. Olugbenga Oluseun Saanu
                    </h2>
                    <p className="section-label text-primary mb-8 md:mb-10">
                        Chief Medical Director & Lead Fertility Specialist
                    </p>
                    <p className="text-on-surface-variant leading-8 mb-8 md:mb-10">
                        A visionary reproductive medicine expert with decades of
                        dedicated global experience, Dr. Saanu combines advanced 
                        medical innovation with compassionate patient care.
                    </p>
                    <div className="space-y-8">
                        <div>
                            <p className="section-label text-on-surface-variant">
                                Specialist Recognition
                            </p>
                            <h3 className="text-xl font-light mt-2 md:text-2xl">
                                Royal College of Obstetricians &
                                Gynecologists.
                            </h3>
                        </div>
                        <div>
                            <p className="section-label text-on-surface-variant">
                                Authority
                            </p>
                            <h3 className="text-xl font-light mt-2 md:text-2xl">
                                Pioneer in Advanced ART Protocols
                            </h3>
                        </div>
                    </div>
                </div>
            </section>

            {/* TEAM GRID */}
            <section className="px-6 py-16 border-t border-outline-variant md:px-20 md:py-24">
                <div className="mb-16 text-center md:mb-20">
                    <h2 className="text-4xl font-light mb-6 md:text-5xl">
                        The Elite Care Cadre
                    </h2>
                    <p className="mx-auto max-w-2xl text-on-surface-variant">
                        Our multidisciplinary team of embryologists,
                        specialized nurses, and clinical counselors work
                        in synchronized harmony.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-10 md:grid-cols-3">

                    {/* CARD 1 */}
                    <div>
                        <div className="relative mb-6 h-[350px] w-full md:h-[400px]">
                            <Image
                                src="/images/nurse.jpg"
                                alt="nurse"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <h3 className="text-xl font-light md:text-2xl">
                            Nurse Elena Rostova
                        </h3>
                        <p className="section-label mt-2 text-on-surface-variant">
                            Fertility nurse
                        </p>
                    </div>

                    {/* CARD 2 */}
                    <div>
                        <div className="relative mb-6 h-[350px] w-full md:h-[400px]">
                            <Image
                                src="/images/Doc_1.jpg"
                                alt="Doctor"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <h3 className="text-xl font-light md:text-2xl">
                            Serah Jenkins
                        </h3>
                        <p className="section-label mt-2 text-on-surface-variant">
                            Director of Patient Wellness
                        </p>
                    </div>

                    {/* CARD 3 */}
                    <div>
                        <div className="relative mb-6 h-[350px] w-full md:h-[400px]">
                            <Image
                                src="/images/marcus.jpg"
                                alt="marcus"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <h3 className="text-xl font-light md:text-2xl">
                            Dr. Marcus Thorne
                        </h3>
                        <p className="section-label mt-2 text-on-surface-variant">
                            Reproductive Geneticist
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}
