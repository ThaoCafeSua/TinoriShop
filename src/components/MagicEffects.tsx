"use client";
import React, { useEffect, useRef } from "react";

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
