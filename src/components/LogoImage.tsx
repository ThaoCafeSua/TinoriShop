"use client";

import Image from "next/image";
import { useState } from "react";

export default function LogoImage() {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <span className="text-[4rem] font-black text-[#9a7182] tracking-tight leading-none">
        Tinori
      </span>
    );
  }

  return (
    <div className="relative mx-auto h-48 md:h-80 w-full max-w-lg">
      <Image
        src="/brand/logo.jpg"
        alt="Tinori"
        fill
        sizes="(max-width: 768px) 100vw, 512px"
        priority
        className="object-contain"
        onError={() => setError(true)}
      />
    </div>
  );
}
