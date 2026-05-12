import {
    Mail,
    MessageCircle,
    Globe,
} from "lucide-react";

export default function ConsultationForm() {
    return (
        <section className="max-w-6xl mx-auto px-6 pb-32">
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12">

                {/* FORM CRAD */}
                <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-[32px] p-10 md:p-14 shadow-sm">
                    <h2 className="font-serif text-4xl mb-12">
                        Request a Consultation
                    </h2>

                    {/* INPUTS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <input
                            type="text"
                            placeholder="First Name"
                            className="border-b border-[#ddd] bg-transparent pb-4 outline-none"
                            />

                            <input
                            type="text"
                            placeholder="Last Name"
                            className="border-b border-[#ddd] bg-transparent pb-4 outline-none"
                            />

                             <input
                            type="email"
                            placeholder="Email Address"
                            className="border-b border-[#ddd] bg-transparent pb-4 outline-none"
                            />

                             <input
                            type="text"
                            placeholder="Phone Number"
                            className="border-b border-[#ddd] bg-transparent pb-4 outline-none"
                            />
                    </div>

                    {/* TAGS */ }
                    <div className="mb-12">
                        <p className="text-sm text-gray-500 mb-4">
                            Area of Interest
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <button className="px-6 py-3 rounded-full bg-[#9c5c67] text-white">
                                IVF & Fertility
                            </button>

                            <button className="px-6 py-3 rounded-full bg-[#9c5c67] text-white">
                                Egg & Freezing
                            </button>

                            <button className="px-6 py-3 rounded-full bg-[#9c5c67] text-white">
                                Second Opinion
                            </button>
                        </div>
                    </div>

                    {/* MESSAGES */ }
                    <textarea 
                        placeholder="How can we assist in your journey?"
                        rows={5}
                        className="w-full border-b border-[#ddd] bg-transparent outline-none resize-none mb-12"
                        />

                        {/* BUTTON */}
                        <button className="px-6 py-3 rounded-full bg-[#9c5c67] text-white">
                            Request Appointment →
                        </button> 
                </div>

                {/* RIGHT SIDE */ }
                <div>
                    <h3 className="font-serif text-4xl mb-10">
                        Direct Access
                    </h3>
                    <div className="space-y-6">

                        {/* WHATSAPP */}
                        <div className="bg-white/60 border border-white/40 rounded-2xl p-6 flex items-center gap-5">
                            <div className="w-12 h-12 rounded-full bg-[#f5e7ea] flex items-center justify-center">
                                <MessageCircle className="w-5 h-5 text-[#9c5c67]" />
                            </div>
                            <div>
                                <p className="uppercase text-xs tracking-[0.2em] text-gray-500 mb-2">
                                    Whatsapp Concierge
                                </p>
                                <p>
                                    +234 803 337 2153
                                </p>
                            </div>

                            {/* EMAIL */}
                            <div className="bg-white/60 border border-white/40 rounded-2xl p-6 flex items-center gap-5">
                                <div className="w-12 h-12 rounded-full bg-[#f5e7ea] flex items-center justify-center">
                                    <Mail className="w-5 h-5 text-[#9c5c67]" />
                                </div>
                                <div>
                                    <p className="uppercase text-xs tracking-[0.2em] text-gray-500 mb-2">
                                        Private Email
                                    </p>
                                    <p>
                                        lawonbloomfertility@gmail.com
                                    </p>
                                </div>
                            </div>

                            {/* GLOBAL */}
                            <div className="bg-white/60 border border-white/40 rounded-[28px] p-8">
                                <div className="flex items-center gap-4 mb-6">
                                    <Globe className="w-5 h-5 text-[#9c5c67]" />
                                    <h4 className="font-serif text-2xl">
                                        Global Support
                                    </h4>
                                </div>
                                <p className="text-gray-600 leading-8 mb-8">
                                    International clients receive seamless travel
                                    coordination and accomodation assistance.
                                </p>

                                <button className="uppercase text-sm tracking-[0.15em] text-[#9c5c67]">
                                    View Travel Services
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}