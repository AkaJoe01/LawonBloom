import Image from 'next/image';

export default function Sanctum() {
    return(
        <section className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
            <div>
                <h2 className="text-3xl font-serif mb-4">The Sanctum of Life</h2>
                <p className="text-gray-600 mb-6">Our laboratory is engineered to exceed ISO Class 5
                    cleanroom Standards, ensuring an impeccably controlled environment.
                </p>
                <ul className="space-y-3 text-gray-700">
                    <li>• HEPA Filtration Architecture</li>
                    <li>• Micro-Climate Thermal Control</li>
                    <li>• Anti-Vibration ISO Tables</li>
                </ul>
            </div>

            <div>
                <Image 
                src="/images/lab.jpg" 
                alt="Laboratory" 
                width={400}
                height={300}
                className="rounded-2xl shadow-md w-full h-auto"
                />
            </div>
        </section>
    );
}