import Image from 'next/image';

export default function Location(){
    return(
        <section className="max-w-6xl mx-auto px-6 pb-32">
            <div className="relative rounded-[40px] overflow-hidden">

                {/* MAP IMAGE */}
                <Image
                    src="/images/map.jpg"
                    alt="Map"
                    width={1200}
                    height={500}
                    className="w-full min-h-[300px] object-cover md:h-125"
                    />

                    {/* CARD */}
                    <div className="relative mt-4 mx-4 md:absolute md:left-10 md:bottom-10 md:mt-0 md:mx-0 bg-surface-bright/80 backdrop-blur-xl rounded-[28px] p-8 max-w-sm shadow-lg">
                        <h3 className="font-display text-3xl text-foreground mb-6">
                            The Lawon Bloom Clinic
                        </h3>
                        <p className="text-on-surface-variant leading-7 mb-6">
                            Visit our clinic for personalized fertility care and support.
                        </p>
                        <button className="w-full border border-outline-variant rounded-full py-4 uppercase tracking-[0.15em] text-sm text-foreground hover:bg-primary hover:text-on-primary hover:border-primary transition">
                            Get Directions
                        </button>
                    </div>
            </div>
        </section>
    );
}
