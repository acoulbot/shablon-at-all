"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  link: string;
}

interface HeroSliderProps {
  slides: Slide[];
}

function resolveImageUrl(url: string): string {
  if (!url) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/api/")) return url;
  return `/api/static${url.startsWith("/") ? url : `/${url}`}`;
}

export default function HeroSlider({ slides }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const touchStart = useRef<number | null>(null);
  const touchEnd = useRef<number | null>(null);

  const goTo = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrent(index);
    setTimeout(() => setIsTransitioning(false), 600);
  }, [isTransitioning]);

  const next = useCallback(() => {
    goTo((current + 1) % slides.length);
  }, [current, slides.length, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length);
  }, [current, slides.length, goTo]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, slides.length]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchEnd.current = null;
    touchStart.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;
    const distance = touchStart.current - touchEnd.current;
    if (Math.abs(distance) > 50) {
      if (distance > 0) next();
      else prev();
    }
    touchStart.current = null;
    touchEnd.current = null;
  };

  if (slides.length === 0) {
    return (
      <div className="bg-gradient-to-br from-primary/10 to-accent/10 h-56 md:h-80 flex items-center justify-center">
        <p className="text-text-gray text-lg">Добавьте слайды в админ-панели</p>
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden group"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="relative aspect-[2/1] sm:aspect-[2.5/1] md:aspect-[3/1]">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-600 ease-in-out ${
              index === current
                ? "opacity-100 scale-100"
                : "opacity-0 scale-105 pointer-events-none"
            }`}
          >
            <Link href={slide.link || "#"}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolveImageUrl(slide.imageUrl)}
                alt={slide.title ? `${slide.title} — CloudStuff` : `Баннер ${index + 1} — CloudStuff`}
                className="absolute inset-0 w-full h-full object-cover"
                fetchPriority={index === 0 ? "high" : undefined}
                loading={index === 0 ? "eager" : "lazy"}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
              {(slide.title || slide.subtitle) && (
                <div className="absolute inset-0 flex items-center">
                  <div className="px-4 sm:px-8 md:px-16 max-w-2xl">
                    {slide.title && (
                      <h2 className={`text-white text-lg sm:text-2xl md:text-4xl font-bold mb-1 sm:mb-2 transition-all duration-700 ${
                        index === current ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                      }`}>
                        {slide.title}
                      </h2>
                    )}
                    {slide.subtitle && (
                      <p className={`text-white/80 text-sm sm:text-lg md:text-xl transition-all duration-700 delay-100 ${
                        index === current ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                      }`}>
                        {slide.subtitle}
                      </p>
                    )}
                    {slide.link && slide.link !== "#" && (
                      <span className={`inline-block mt-3 sm:mt-4 bg-primary hover:bg-primary-dark text-white font-semibold px-5 sm:px-6 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm transition-all duration-700 delay-200 ${
                        index === current ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                      }`}>
                        Подробнее
                      </span>
                    )}
                  </div>
                </div>
              )}
            </Link>
          </div>
        ))}
      </div>

      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Предыдущий слайд"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full p-2 sm:p-3 opacity-0 group-hover:opacity-100 transition-all"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={next}
            aria-label="Следующий слайд"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full p-2 sm:p-3 opacity-0 group-hover:opacity-100 transition-all"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goTo(index)}
                aria-label={`Слайд ${index + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  index === current
                    ? "w-6 sm:w-8 h-2.5 sm:h-3 bg-white"
                    : "w-2.5 sm:w-3 h-2.5 sm:h-3 bg-white/40 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
