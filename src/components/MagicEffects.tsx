"use client";
import React, { useEffect, useRef } from "react";

const FLOATING_ICONS = ["🎀", "✨", "💖", "🌸", "⭐", "🎁", "💎", "🦋"];

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
      {/* Floating Icons - Pure CSS animation (no JS overhead) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden hidden md:block" aria-hidden="true">
        {FLOATING_ICONS.map((icon, i) => (
          <span
            key={i}
            className="absolute animate-float-icon text-2xl opacity-20 select-none"
            style={{
              left: `${8 + i * 12}%`,
              top: `${10 + (i % 3) * 25}%`,
              animationDelay: `${i * 1.2}s`,
              animationDuration: `${12 + (i % 4) * 3}s`,
            }}
          >
            {icon}
          </span>
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
