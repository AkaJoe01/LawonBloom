import Image from 'next/image';

export default function Sanctum() {
    return(
        <section id="sanctum" className="mx-auto max-w-360 grid gap-12 px-6 py-20 md:grid-cols-2 md:items-center lg:px-20 lg:py-28">
            <div>
                <h2 className="font-display text-3xl text-foreground sm:text-4xl lg:text-[3.3rem]">The Sanctum of Life</h2>
                <p className="mt-4 text-lg leading-8 text-on-surface-variant">Our laboratory is engineered to exceed ISO Class 5
                    cleanroom Standards, ensuring an impeccably controlled environment.
                </p>
                <ul className="mt-6 space-y-3 text-on-surface-variant">
                    <li>• HEPA Filtration Architecture</li>
                    <li>• Micro-Climate Thermal Control</li>
                    <li>• Anti-Vibration ISO Tables</li>
                </ul>
            </div>

            <div>
                <Image 
                src="/images/lab.jpg" 
                alt="Laboratory" 
                width={500}
                height={400}
                className="cinematic-shadow w-full rounded-4xl object-cover"
                />
            </div>
        </section>
    );
}