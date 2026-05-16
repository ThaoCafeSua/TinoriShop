"use client";
import React, { useEffect, useRef } from "react";
import Image from "next/image";

const FLOATING_ICONS_COUNT = 8;

const MagicEffects = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number>(0);
  const mouseX = useRef(0);
  const mouseY = useRef(0);

  useEffect(() => {
    // Only enable custom cursor on desktop with pointer device
    const isPointer = window.matchMedia("(pointer: fine)").matches;
    if (!isPointer) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.current = e.clientX;
      mouseY.current = e.clientY;
    };

    const animate = () => {
      if (cursorRef.current) {
        cursorRef.current.style.left = `${mouseX.current}px`;
        cursorRef.current.style.top = `${mouseY.current}px`;
      }
      if (dotRef.current) {
        dotRef.current.style.left = `${mouseX.current}px`;
        dotRef.current.style.top = `${mouseY.current}px`;
      }
      rafId.current = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    rafId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <>
      {/* Floating Icons - Pure CSS animation with user's transparent image */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        {Array.from({ length: FLOATING_ICONS_COUNT }).map((_, i) => (
          <div
            key={i}
            className="absolute select-none"
            style={{
              left: `${8 + i * 12}%`,
              top: `${10 + (i % 3) * 25}%`,
              width: `${40 + (i % 3) * 20}px`,
              height: `${40 + (i % 3) * 20}px`,
              opacity: 0.6,
            }}
          >
            <Image
              src="/brand/floating-icons-transparent.png"
              alt="floating-icon"
              fill
              sizes="(max-width: 768px) 0px, 100px"
              className="object-contain"
            />
          </div>
        ))}
      </div>

      {/* Custom Cursor - desktop only */}
      <div
        ref={cursorRef}
        className="custom-cursor hidden lg:block"
        style={{ transform: 'translate(-50%, -50%)' }}
      />
      <div
        ref={dotRef}
        className="custom-cursor-dot hidden lg:block"
        style={{ transform: 'translate(-50%, -50%)' }}
      />
    </>
  );
};

export default React.memo(MagicEffects);
