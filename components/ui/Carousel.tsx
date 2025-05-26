"use client";

import * as React from "react";
import { ArrowLeftIcon } from "../icons/ArrowLeft";
import { ArrowRightIcon } from "../icons/ArrowRight";
import Button from "./Button";

interface CarouselProps {
  children: React.ReactNode[];
}

export function Carousel({ children }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const totalSlides = React.Children.count(children);

  const scrollPrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const scrollNext = () => {
    setCurrentIndex((prev) => (prev < totalSlides - 1 ? prev + 1 : prev));
  };

  return (
    <div className="relative w-full overflow-hidden">
      <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
        {React.Children.map(children, (child, idx) => (
          <div className="flex-shrink-0 w-full">{child}</div>
        ))}
      </div>

      <Button
        onClick={scrollPrev}
        variant="outline"
        size="icon"
        icon={ArrowLeftIcon}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 rounded-full"
      />

      <Button
        onClick={scrollNext}
        variant="outline"
        size="icon"
        icon={ArrowRightIcon}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 rounded-full"
      />
    </div>
  );
}
