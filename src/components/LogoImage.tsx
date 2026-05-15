"use client";

import Image from "next/image";
import { useState } from "react";

export default function LogoImage() {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div
        style={{
          fontFamily: "sans-serif",
          fontSize: "4rem",
          fontWeight: 900,
          color: "#9a7182",
          letterSpacing: "-2px",
          lineHeight: 1,
        }}
      >
        Tinori
      </div>
    );
  }

  return (
    <div className="relative mx-auto h-48 md:h-80 w-full max-w-lg group">
      <div className="absolute -top-4 -right-4 bg-white p-2 rounded-full shadow-lg z-10 animate-bounce group-hover:scale-125 transition-transform">
        <span className="text-2xl">🎀</span>
      </div>
      <div className="absolute -bottom-4 -left-4 bg-white p-2 rounded-full shadow-lg z-10 animate-pulse group-hover:scale-125 transition-transform">
        <span className="text-2xl">💗</span>
      </div>
      <Image
        src="/brand/logo.jpg"
        alt="Tinori"
        fill
        sizes="(max-width: 768px) 100vw, 512px"
        priority
        className="object-contain drop-shadow-2xl"
        onError={() => setError(true)}
      />
    </div>
  );
}
