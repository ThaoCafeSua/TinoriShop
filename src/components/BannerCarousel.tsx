"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Banner {
  id: string;
  image: string;
  link?: string | null;
  active: boolean;
}

export default function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent((c) => (c + 1) % banners.length), [banners.length]);
  const prev = () => setCurrent((c) => (c - 1 + banners.length) % banners.length);

  // Auto-advance every 4 seconds
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [next, banners.length]);

  if (!banners.length) return null;

  const banner = banners[current];

  const content = (
    <div className="relative w-full overflow-hidden">
      {/* Only render current and adjacent banners for performance */}
      {banners.map((b, i) => {
        const isVisible = i === current;
        const isAdjacent = i === (current + 1) % banners.length || i === (current - 1 + banners.length) % banners.length;
        if (!isVisible && !isAdjacent) return null;
        return (
          <Image
            key={b.id}
            src={b.image}
            alt={`Banner ${i + 1}`}
            width={1200}
            height={400}
            className={`w-full h-auto block transition-opacity duration-700 ${isVisible ? "opacity-100 relative" : "opacity-0 absolute inset-0"}`}
            style={{ maxHeight: "none" }}
            priority={isVisible}
          />
        );
      })}

      {/* Nav arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={(e) => { e.preventDefault(); prev(); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full shadow flex items-center justify-center transition-all hover:scale-110"
          >
            <ChevronLeft className="h-5 w-5 text-pink-600" />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); next(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full shadow flex items-center justify-center transition-all hover:scale-110"
          >
            <ChevronRight className="h-5 w-5 text-pink-600" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.preventDefault(); setCurrent(i); }}
                className={`rounded-full transition-all ${i === current ? "w-5 h-2 bg-pink-500" : "w-2 h-2 bg-white/70 hover:bg-white"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );

  return banner.link ? (
    <a href={banner.link} target="_blank" rel="noopener noreferrer">
      {content}
    </a>
  ) : content;
}
