export default function Location(){
    return(
        <section className="max-w-6xl mx-auto px-6 pb-32">
            <div className="relative rounded-[40px] overflow-hidden">

                <iframe
                    src="https://www.openstreetmap.org/export/embed.html?bbox=3.8973%2C7.4278%2C3.9073%2C7.4378&layer=mapnik&marker=7.4328%2C3.9023"
                    width="100%"
                    height="500"
                    className="w-full min-h-[300px] md:h-125"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    title="Lawonbloom Clinic Location"
                />

                <div className="relative mt-4 mx-4 md:absolute md:left-10 md:bottom-10 md:mt-0 md:mx-0 bg-surface-bright/80 backdrop-blur-xl rounded-[28px] p-8 max-w-sm shadow-lg">
                    <h3 className="font-display text-3xl text-foreground mb-6">
                        The Lawon Bloom Clinic
                    </h3>
                    <p className="text-on-surface-variant leading-7 mb-2">
                        NO. 6, CANON ODUSANWO STREET
                    </p>
                    <p className="text-on-surface-variant leading-7 mb-6">
                        OFF DEJI OYELESE STREET, OLD BODIJA AVENUE, IBADAN
                    </p>
                    <a
                        href="https://maps.google.com/maps?daddr=NO.+6+CANON+ODUSANWO+STREET+OFF+DEJI+OYELESE+STREET+OLD+BODIJA+AVENUE+IBADAN"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full text-center border border-outline-variant rounded-full py-4 uppercase tracking-[0.15em] text-sm text-foreground hover:bg-primary hover:text-on-primary hover:border-primary transition"
                    >
                        Get Directions
                    </a>
                </div>
            </div>
        </section>
    );
}
