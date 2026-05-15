"use client";
import React, { useEffect, useRef } from "react";

const MagicEffects = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number>(0);
  const mouseX = useRef(0);
  const mouseY = useRef(0);

  useEffect(() => {
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

  // Static icon positions - no state needed
  const icons = [
    { top: '10%', left: '5%', size: '80px', delay: '0s', duration: '6s' },
    { top: '25%', left: '80%', size: '70px', delay: '2s', duration: '8s' },
    { top: '60%', left: '15%', size: '90px', delay: '1s', duration: '10s' },
    { top: '45%', left: '50%', size: '60px', delay: '3s', duration: '7s' },
    { top: '80%', left: '70%', size: '75px', delay: '0.5s', duration: '9s' },
    { top: '15%', left: '40%', size: '65px', delay: '4s', duration: '11s' },
    { top: '70%', left: '90%', size: '85px', delay: '1.5s', duration: '8.5s' },
    { top: '5%', left: '60%', size: '70px', delay: '2.5s', duration: '7.5s' },
  ];

  return (
    <>
      {/* Custom Cursor - using refs instead of state to avoid re-renders */}
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

      {/* Floating Icons */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {icons.map((icon, index) => (
          <div
            key={index}
            className="absolute animate-float opacity-40"
            style={{
              top: icon.top,
              left: icon.left,
              width: icon.size,
              height: icon.size,
              backgroundImage: 'url("/brand/floating-icons.png")',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              animationDelay: icon.delay,
              animationDuration: icon.duration,
              mixBlendMode: "multiply",
              willChange: "transform",
            }}
          />
        ))}
      </div>
    </>
  );
};

export default React.memo(MagicEffects);
