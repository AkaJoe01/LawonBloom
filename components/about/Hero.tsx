'use client';

import Image from 'next/image';
import { motion } from "framer-motion";

export default function Hero() {
    return (
        <section id="clinical-excellence" className="mx-auto max-w-360 grid gap-12 px-6 py-20 md:grid-cols-2 md:items-center lg:px-20 lg:py-28">
            <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            >
                <p className="section-label mb-4 text-primary">Clinical Excellence</p>
                <h1 className="font-display text-4xl leading-tight text-foreground sm:text-5xl lg:text-[3.3rem]">The Science of Tomorrow, Today.</h1>
                <p className="mt-6 max-w-md text-lg leading-8 text-on-surface-variant">Step into a realm where cutting-edge reproductive science meets serene, sanctuary-like care.</p>
            </motion.div>

            <div>
                <Image 
                src="/images/microscope.jpg" 
                alt="Laboratory microscope" 
                width={500}
                height={600}
                className="cinematic-shadow w-full rounded-4xl object-cover" 
                />
            </div>
        </section>
    );
}