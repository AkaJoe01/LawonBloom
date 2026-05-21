import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
    return (
        <footer className="relative border-t border-outline-variant/30 bg-surface-bright px-6 py-20 lg:px-20 lg:py-28 overflow-hidden">
            <div className="elegant-divider absolute left-0 top-0 w-full" />
            <div className="grain-overlay opacity-50 pointer-events-none" />
            
            <div className="mx-auto max-w-360 relative z-10 grid grid-cols-1 gap-16 md:grid-cols-2 lg:grid-cols-12">
                
                {/* Brand & Contact */}
                <div className="lg:col-span-4 flex flex-col gap-8">
                    <div>
                        <Image src="/logo/logo.JPG" alt="Lawonbloom Logo" width={120} height={120} className="h-16 w-16 rounded-full object-cover shadow-sm" />
                        <p className="mt-4 max-w-sm text-base italic leading-7 text-on-surface-variant">
                            A sanctuary for reproductive health, combining clinical mastery with a profoundly private, concierge-level experience.
                        </p>
                    </div>
                    <div className="flex flex-col gap-4 text-sm text-on-surface-variant">
                        <a href="mailto:sanctuary@lawonbloom.com" className="flex items-center gap-3 hover:text-primary transition-colors">
                            <Mail className="w-4 h-4 text-primary/70 shrink-0" /> lawonbloomfertilitycentre@gmail.com
                        </a>
                        <a href="tel:+442071234567" className="flex items-center gap-3 hover:text-primary transition-colors">
                            <Phone className="w-4 h-4 text-primary/70 shrink-0" /> +234 803 337 2153
                        </a>
                        <div className="flex items-start gap-3">
                            <MapPin className="w-4 h-4 text-primary/70 shrink-0 mt-0.5" />
                            <span>Oyo State <br/>Nigeria, W1G 9PB</span>
                        </div>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="lg:col-span-2 lg:col-start-6">
                    <p className="font-label-caps text-primary mb-6">Explore</p>
                    <div className="flex flex-col gap-4">
                        <Link href="/about" className="text-base text-on-surface-variant hover:text-primary transition-colors">Our Story</Link>
                        <Link href="/sanctuary" className="text-base text-on-surface-variant hover:text-primary transition-colors">The Sanctuary</Link>
                        <Link href="/clinical-excellence" className="text-base text-on-surface-variant hover:text-primary transition-colors">Clinical Excellence</Link>
                        <Link href="/path" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Path to Parenthood</Link>
                        <Link href="/faq" className="text-base text-on-surface-variant hover:text-primary transition-colors">Patient FAQ</Link>
                    </div>
                </div>

                {/* Services */}
                <div className="lg:col-span-2">
                    <p className="font-label-caps text-primary mb-6">Specialties</p>
                    <div className="flex flex-col gap-4">
                        <Link href="/sanctuary/services#ivf" className="text-base text-on-surface-variant hover:text-primary transition-colors">In Vitro Fertilization</Link>
                        <Link href="/sanctuary/services#preservation" className="text-base text-on-surface-variant hover:text-primary transition-colors">Oocyte Preservation</Link>
                        <Link href="/clinical-excellence/genetic-testing" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Genetic Screening</Link>
                        <Link href="/sanctuary/services#holistic" className="text-base text-on-surface-variant hover:text-primary transition-colors">Surrogacy Concierge</Link>
                        <Link href="/sanctuary/services#holistic" className="text-base text-on-surface-variant hover:text-primary transition-colors">Holistic Support</Link>
                    </div>
                </div>

                {/* Newsletter */}
                <div className="lg:col-span-3">
                    <p className="font-label-caps text-primary mb-6">The Journal</p>
                    <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
                        Subscribe to receive quiet reflections on reproductive science, holistic wellness, and stories from our sanctuary.
                    </p>
                    <form className="relative group" action="#">
                        <input 
                            type="email" 
                            placeholder="Your email address" 
                            className="w-full glass-panel pl-6 pr-12 py-4 rounded-full text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50 placeholder:text-on-surface-variant/50 transition-all bg-surface/50"
                        />
                        <button type="submit" className="absolute inset-y-0 right-2 flex items-center justify-center text-primary/60 group-focus-within:text-primary transition-colors px-3 hover:text-surface-tint">
                            <Mail className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>

            <div className="mx-auto max-w-360 mt-20 pt-8 border-t border-outline-variant/20 flex flex-col lg:flex-row justify-between items-center gap-8 relative z-10">
                <div className="flex gap-6 order-2 lg:order-1">
                    <a href="#" className="text-on-surface-variant hover:text-primary transition-colors" aria-label="Instagram">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                    </a>
                    <a href="#" className="text-on-surface-variant hover:text-primary transition-colors" aria-label="LinkedIn">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                    </a>
                    <a href="#" className="text-on-surface-variant hover:text-primary transition-colors" aria-label="Twitter">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                    </a>
                </div>
                
                <p className="text-xs uppercase tracking-[0.18em] text-primary/60 text-center order-3 lg:order-2">
                    © {new Date().getFullYear()} Lawonbloom Fertility Centre. All rights reserved.
                </p>

                <div className="flex flex-wrap justify-center gap-6 text-[10px] uppercase tracking-[0.2em] text-on-surface-variant order-1 lg:order-3">
                    <a className="transition-colors hover:text-primary" href="/legal/privacy">Privacy Registry</a>
                    <a className="transition-colors hover:text-primary" href="/legal/terms">Terms of Care</a>
                    <a className="transition-colors hover:text-primary" href="/legal/ethics">Clinical Ethics</a>
                </div>
            </div>
        </footer>
    );
}