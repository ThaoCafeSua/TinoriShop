"use client";
import React from "react";
import Image from "next/image";

const FLOATING_ICONS_COUNT = 8;

const MagicEffects = () => {
  return (
    <>
      {/* Floating Icons - Static background pattern */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden" aria-hidden="true">
        {Array.from({ length: FLOATING_ICONS_COUNT }).map((_, i) => (
          <div
            key={i}
            className="absolute select-none"
            style={{
              left: `${8 + i * 12}%`,
              top: `${10 + (i % 3) * 25}%`,
              width: `${40 + (i % 3) * 20}px`,
              height: `${40 + (i % 3) * 20}px`,
              opacity: 1,
            }}
          >
            <Image
              src="/brand/floating-icons-transparent.png"
              alt="floating-icon"
              fill
              sizes="100px"
              className="object-contain"
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default React.memo(MagicEffects);
