"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const slides = [
  {
    title: "A Decade of Dreaming",
    subtitle: "The Chen Family",
    image: "/images/family.jpg",
  },
  {
    title: "Beyond Borders",
    subtitle: "The Al Fassi Family",
    image: "/images/probe.jpg",
  },
  {
    title: "A Quiet Miracle",
    subtitle: "The Rivera Family",
    image: "/images/doctor.jpg",
  },
];

export default function Cinematic() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <div className="mb-12 flex flex-col gap-6 md:mb-16 md:flex-row md:items-center md:justify-between">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-4xl text-foreground md:text-5xl">Cinematic Journey</h2>
        </motion.div>

        <p className="max-w-xl text-on-surface-variant leading-7">
          Intimate reflections on the path to parenthood.
        </p>
      </div>

      <Swiper
        modules={[Navigation, Pagination]}
        navigation
        pagination={{ clickable: true }}
        loop
        spaceBetween={30}
        slidesPerView={1.1}
        breakpoints={{
          768: {
            slidesPerView: 2,
          },
        }}
        className="pb-4"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.title}>
            <div className="group relative h-80 overflow-hidden rounded-2xl shadow-lg md:h-105">
              <Image
                src={slide.image}
                alt={slide.subtitle}
                fill
                sizes="(max-width: 768px) 90vw, 50vw"
                className="object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white md:bottom-8 md:left-8">
                <p className="section-label mb-3 text-white/80">
                  {slide.subtitle}
                </p>
                <h3 className="font-display text-3xl md:text-4xl">{slide.title}</h3>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
