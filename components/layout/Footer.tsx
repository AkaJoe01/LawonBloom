export default function Footer() {
    return (
        <footer className="relative border-t border-outline-variant/30 bg-surface-bright px-6 py-16 lg:px-20 lg:py-24">
            <div className="elegant-divider absolute left-0 top-0 w-full" />
            <div className="mx-auto flex max-w-360 flex-col items-center justify-between gap-10 text-center md:flex-row md:text-left">
                <div>
                    <p className="font-display text-3xl tracking-[0.22em] text-primary uppercase">Lawonbloom</p>
                    <p className="mt-3 max-w-xs text-sm italic leading-6 text-on-surface-variant">The sanctuary of new beginnings.</p>
                </div>

                <div className="flex flex-wrap justify-center gap-6 text-sm uppercase tracking-[0.18em] text-on-surface-variant">
                    <a className="transition-colors hover:text-primary" href="/about">
                        Privacy Registry
                    </a>
                    <a className="transition-colors hover:text-primary" href="/journey">
                        Terms of Care
                    </a>
                    <a className="transition-colors hover:text-primary" href="/sanctuary">
                        Global Access
                    </a>
                    <a className="transition-colors hover:text-primary" href="/journey/stories">
                        Media Sanctuary
                    </a>
                </div>

                <p className="text-sm uppercase tracking-[0.18em] text-primary/60">© 2026 Lawonbloom Fertility Centre. All rights reserved.</p>
            </div>
        </footer>
    );
}