'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const heroSlides = [
  {
    id: 1,
    image: 'https://images.pexels.com/photos/1054218/pexels-photo-1054218.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
    title: 'Discover Amazing Experiences',
    subtitle: 'Explore the world with our premium services',
    description: 'Join thousands of satisfied customers who have transformed their lives through our innovative solutions.'
  },
  {
    id: 2,
    image: 'https://images.pexels.com/photos/1438761/pexels-photo-1438761.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
    title: 'Innovation Meets Excellence',
    subtitle: 'Leading the future of technology',
    description: 'Experience cutting-edge solutions designed to elevate your business and exceed your expectations.'
  },
  {
    id: 3,
    image: 'https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
    title: 'Your Success, Our Mission',
    subtitle: 'Empowering growth through partnership',
    description: 'Unlock your potential with our comprehensive suite of tools and dedicated support team.'
  },
  {
    id: 4,
    image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
    title: 'Transform Your Vision',
    subtitle: 'Into extraordinary reality',
    description: 'From concept to execution, we provide the expertise and resources to bring your ideas to life.'
  }
];

export default function HeroSlider() {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        navigation={{
          prevEl: '.swiper-button-prev-custom',
          nextEl: '.swiper-button-next-custom',
        }}
        pagination={{
          el: '.swiper-pagination-custom',
          clickable: true,
          bulletClass: 'swiper-pagination-bullet-custom',
          bulletActiveClass: 'swiper-pagination-bullet-active-custom',
        }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        loop={true}
        speed={1000}
        className="w-full h-full"
      >
        {heroSlides.map((slide) => (
          <SwiperSlide key={slide.id} className="relative">
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${slide.image})`,
              }}
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
            
            {/* Content */}
            <div className="relative z-10 flex items-center justify-center h-full px-4 sm:px-6 lg:px-8">
              <div className="text-center text-white max-w-4xl mx-auto">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                  <span className="block">{slide.title}</span>
                </h1>
                
                <p className="text-xl sm:text-2xl lg:text-3xl font-light mb-8 text-gray-200">
                  {slide.subtitle}
                </p>
                
                <p className="text-lg sm:text-xl mb-12 text-gray-300 max-w-2xl mx-auto leading-relaxed">
                  {slide.description}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button size="lg" className="transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                    Get Started
                  </Button>
                  <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-black transform hover:scale-105 transition-all duration-300">
                    Learn More
                  </Button>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation Buttons */}
      <button className="swiper-button-prev-custom absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 sm:p-4 transition-all duration-300 hover:scale-110">
        <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
      </button>
      
      <button className="swiper-button-next-custom absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 sm:p-4 transition-all duration-300 hover:scale-110">
        <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
      </button>

      {/* Custom Pagination */}
      <div className="swiper-pagination-custom absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3"></div>
    </div>
  );
}
