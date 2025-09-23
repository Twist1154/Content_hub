"use client"

import * as React from "react"
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';

type CarouselProps = {
  children: React.ReactNode;
  className?: string;
  opts?: any;
};

const Carousel = React.forwardRef<
  HTMLDivElement,
  CarouselProps
>(({ children, className, opts }, ref) => {
  return (
    // @ts-ignore
    <Swiper ref={ref} {...opts} className={className}>
      {children}
    </Swiper>
  );
});
Carousel.displayName = "Carousel";

const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => {
  // This component might not be directly needed with Swiper's structure
  // but we'll keep it for API consistency
  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  );
});
CarouselContent.displayName = "CarouselContent";

const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => {
  return (
    <SwiperSlide ref={ref} {...props}>
      {children}
    </SwiperSlide>
  );
});
CarouselItem.displayName = "CarouselItem";

const CarouselPrevious = () => {
  // This will be handled by Swiper's navigation options
  return null;
};

const CarouselNext = () => {
  // This will be handled by Swiper's navigation options
  return null;
};

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
};
