import Image from "next/image";

export default function Specialists(){
    const doctors = [
        {
            name: "Dr. Olugbenga Oluseun Saanu",
            role: "Chief Fertility Specialist",
            image: "/images/maleDr.jpg"
        },
    ];

    return(
        <section className="max-w-6xl mx-auto px-6">
            <div className="bg-white/60 border border-[#ece5de] rounded-3xl p-10 md:p-16">

                {/* STEP 1*/}
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-gray-400 mb-16">
                    <div className="flex items-center gap-3 text-[#9c5c67]">
                        <div className="w-6 h-6 rounded-full bg-[#9c5c67] text-white flex items-center justify-center text-[10px]">
                            1
                        </div>
                        Select Consultation
                    </div>
                    <div>2. Date & Time</div>
                    <div>3. Your Details</div>
                </div>

                {/* TITLE */ }
                <h2 className="font-serif text-4xl mb-10">
                    Choose Your Specialist
                </h2>

                {/* DOCTORS */ }
                <div className="grid grid-cols-1 md:grid-cols-1 max-w-md mx-auto gap-8">
                    {doctors.map((doctor) => (
                        <div
                            key={doctor.name}
                            className="bg-[#faf7f4] rounded-2xl p-6 border border-[#ece5de]"
                        >
                            <Image
                                src={doctor.image}
                                alt={doctor.name}
                                width={400}
                                height={300}
                                className="w-full object-cover rounded-xl mb-6"
                            />
                            <h3 className="font-serif text-2xl mb-3">
                                {doctor.name}
                            </h3>
                            <p className="text-gray-500 mb-6">
                                {doctor.role}
                            </p>
                            <button className="w-full border border-[#b67682] text-[#9c5c67] rounded-full py-3 hover:bg-[#b67682] hover:text-white transition">
                                Select
                            </button>
                        </div>
                    ))}
                </div> 
            </div>
        </section>
    );
}