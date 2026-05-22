import {
    Mail,
    MessageCircle,
    Globe,
} from "lucide-react";

export default function ConsultationForm() {
    return (
        <section className="max-w-6xl mx-auto px-6 pb-32">
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12">

                {/* FORM CARD */}
                <div className="bg-surface-bright/60 backdrop-blur-xl border border-outline-variant/30 rounded-4xl p-10 md:p-14 shadow-sm">
                    <h2 className="font-display text-4xl text-foreground mb-12">
                        Request a Consultation
                    </h2>

                    {/* INPUTS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div>
                            <label htmlFor="firstName" className="sr-only">First Name</label>
                            <input
                                id="firstName"
                                type="text"
                                placeholder="First Name"
                                required
                                className="w-full border-b border-outline-variant bg-transparent pb-4 text-foreground outline-none transition-colors focus:border-primary"
                            />
                        </div>
                        <div>
                            <label htmlFor="lastName" className="sr-only">Last Name</label>
                            <input
                                id="lastName"
                                type="text"
                                placeholder="Last Name"
                                required
                                className="w-full border-b border-outline-variant bg-transparent pb-4 text-foreground outline-none transition-colors focus:border-primary"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="sr-only">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                placeholder="Email Address"
                                required
                                className="w-full border-b border-outline-variant bg-transparent pb-4 text-foreground outline-none transition-colors focus:border-primary"
                            />
                        </div>
                        <div>
                            <label htmlFor="phone" className="sr-only">Phone Number</label>
                            <input
                                id="phone"
                                type="tel"
                                placeholder="Phone Number"
                                className="w-full border-b border-outline-variant bg-transparent pb-4 text-foreground outline-none transition-colors focus:border-primary"
                            />
                        </div>
                    </div>

                    {/* TAGS */}
                    <div className="mb-12">
                        <p className="text-sm text-on-surface-variant mb-4">
                            Area of Interest
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <button type="button" className="px-6 py-3 rounded-full bg-primary text-on-primary">
                                IVF & Fertility
                            </button>
                            <button type="button" className="px-6 py-3 rounded-full bg-primary text-on-primary">
                                Egg Freezing
                            </button>
                            <button type="button" className="px-6 py-3 rounded-full bg-primary text-on-primary">
                                Second Opinion
                            </button>
                        </div>
                    </div>

                    {/* MESSAGES */}
                    <div className="mb-12">
                        <label htmlFor="notes" className="sr-only">Message</label>
                        <textarea
                            id="notes"
                            placeholder="How can we assist in your journey?"
                            rows={5}
                            className="w-full border-b border-outline-variant bg-transparent text-foreground outline-none resize-none transition-colors focus:border-primary"
                        />
                    </div>

                    {/* BUTTON */}
                    <button type="submit" className="px-8 py-3.5 rounded-full bg-primary text-on-primary section-label hover:opacity-90 transition">
                        Request Appointment →
                    </button>
                </div>

                {/* RIGHT SIDE */}
                <div>
                    <h3 className="font-display text-4xl text-foreground mb-10">
                        Direct Access
                    </h3>
                    <div className="space-y-6">
                        {/* WHATSAPP */}
                        <div className="bg-surface-bright/60 border border-outline-variant/30 rounded-2xl p-6 flex items-center gap-5">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <MessageCircle className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="section-label text-on-surface-variant mb-2">
                                    Whatsapp Concierge
                                </p>
                                <p className="text-foreground">
                                    +2349132504126
                                </p>
                            </div>
                        </div>

                        {/* EMAIL */}
                        <div className="bg-surface-bright/60 border border-outline-variant/30 rounded-2xl p-6 flex items-center gap-5">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <Mail className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="section-label text-on-surface-variant mb-2">
                                    Private Email
                                </p>
                                <p className="text-foreground">
                                    lawonbloomf@gmail.com
                                </p>
                            </div>
                        </div>

                        {/* GLOBAL */}
                        <div className="bg-surface-bright/60 border border-outline-variant/30 rounded-[28px] p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <Globe className="w-5 h-5 text-primary shrink-0" />
                                <h4 className="font-display text-2xl text-foreground">
                                    Global Support
                                </h4>
                            </div>
                            <p className="text-on-surface-variant leading-8 mb-8">
                                International clients receive seamless travel
                                coordination and accommodation assistance.
                            </p>
                            <a href="/concierge" className="inline-flex section-label text-primary hover:text-primary/80 transition">
                                View Travel Services
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
