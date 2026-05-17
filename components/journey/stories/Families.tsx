"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { ArrowLeft } from "lucide-react";

const testimonials = [
  {
    author: "Sarah & James",
    location: "London, UK",
    quote:
      "The clinical excellence was apparent from day one, but it was the profound empathy and peace within the sanctuary that truly carried us through our darkest moments.",
    image: "/images/Profile.jpg",
  },
  {
    author: "Mia & Noah",
    location: "Dubai, UAE",
    quote:
      "Every detail felt personalized. The team supported our journey with compassion, expertise, and unwavering patience.",
    image: "/images/scan.jpg",
  },
  {
    author: "Avery & Leo",
    location: "New York, USA",
    quote:
      "The environment was calming, the science was outstanding, and the result was the dream we've waited for.",
    image: "/images/scan_1.jpg",
  },
];

export default function Families() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <div className="grid grid-cols-1 items-start gap-12 md:grid-cols-[1.1fr_0.9fr] md:gap-20">
        <div>
          <p className="section-label mb-6 text-primary">
            Written Archives
          </p>
          <h2 className="font-display text-4xl leading-[1.1] text-foreground sm:text-5xl md:text-[56px] mb-8">
            The Lawonbloom Families
          </h2>
          <p className="text-on-surface-variant leading-8 mb-10">
            Read the personal accounts of resilience, scientific precision, and the delicate balance of hope that defines our sanctuary.
          </p>
          <button className="inline-flex items-center gap-2 text-primary uppercase tracking-[0.2em] text-sm hover:text-primary/80 transition">
            Explore All Stories <ArrowLeft size={20} />
          </button>
        </div>

        <div className="rounded-2xl bg-surface-bright/70 p-8 shadow-sm backdrop-blur md:p-10">
          <Swiper
            modules={[Pagination, Autoplay]}
            pagination={{ clickable: true }}
            autoplay={{ delay: 6000, disableOnInteraction: false }}
            loop
            spaceBetween={24}
            slidesPerView={1}
          >
            {testimonials.map((testimonial) => (
              <SwiperSlide key={testimonial.author}>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.author}
                      width={64}
                      height={64}
                      className="rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-medium text-foreground">{testimonial.author}</h4>
                      <p className="font-medium text-on-surface-variant">{testimonial.location}</p>
                    </div>
                  </div>
                  <p className="text-on-surface-variant leading-8 italic">{testimonial.quote}</p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
} 
