'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

export default function FilmStripCarousel() {
  return (
    <div className="relative w-full max-w-6xl mx-auto mt-8 overflow-hidden group">
      {/* Carousel */}
      <Swiper
        modules={[Autoplay]}
        slidesPerView={'auto'}
        spaceBetween={20}
        loop={true}
        speed={5000}
        autoplay={{
          delay: 0,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        freeMode={true}
        freeModeMomentum={false}
        className="flex items-center"
      >
        {/* Example slides */}
        {Array.from({ length: 10 }).map((_, idx) => (
          <SwiperSlide
            key={idx}
            className="!w-48 flex-shrink-0"
          >
            <img
              src={`https://source.unsplash.com/random/400x300?sig=${idx}`}
              alt={`Slide ${idx}`}
              className="w-full h-auto object-cover rounded-lg"
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Film frame overlay */}
      <img
        src="src\assets\CarouselFrame.jpg"
        alt="Film Frame"
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
    </div>
  );
}
