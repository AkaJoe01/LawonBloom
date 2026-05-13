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
                    className="w-full h-125 object-cover"
                    />

                    {/** CARD */}
                    <div className="absolute left-10 bottom-10 bg-white/80 backdrop-blur-xl rounded-[28px] p-8 max-w-sm shadow-lg">
                        <h3 className="font-serif text-3xl mb-6">
                            The Lawon Bloom Clinic
                        </h3>
                        <p className="text-gray-600">
                            Visit our clinic for personalized fertility care and support.
                        </p>
                        <button className="w-full border border-[#ddd] rounded-full py-4 uppercase tracking-[0.15em] text-sm hover:bg-[#9c5c67] hover:text-white transition">
                            Get Directions
                        </button>
                    </div>
            </div>
        </section>
    );
}