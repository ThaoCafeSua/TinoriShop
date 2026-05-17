"use client";

import React, { useEffect, useState } from "react";

export default function HeartLoader() {
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Keep loader visible for 1.2 seconds, then start fading out
    const fadeTimeout = setTimeout(() => {
      setLoading(false);
    }, 1200);

    // Fully remove from DOM after the 500ms fade animation completes
    const removeTimeout = setTimeout(() => {
      setVisible(false);
    }, 1700);

    return () => {
      clearTimeout(fadeTimeout);
      clearTimeout(removeTimeout);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#fff8fa] transition-all duration-500 ease-out ${
        loading ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
      }`}
    >
      {/* Self-contained cute style animations */}
      <style>{`
        @keyframes heartbeat {
          0% { transform: scale(1); }
          14% { transform: scale(1.12); }
          28% { transform: scale(1); }
          42% { transform: scale(1.12); }
          70% { transform: scale(1); }
        }
        @keyframes rotate-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes float-heart-1 {
          0% { transform: translate(0, 0) scale(0); opacity: 0; }
          50% { opacity: 0.8; }
          100% { transform: translate(-30px, -60px) scale(1); opacity: 0; }
        }
        @keyframes float-heart-2 {
          0% { transform: translate(0, 0) scale(0); opacity: 0; }
          50% { opacity: 0.8; }
          100% { transform: translate(30px, -70px) scale(1.1); opacity: 0; }
        }
        @keyframes float-heart-3 {
          0% { transform: translate(0, 0) scale(0); opacity: 0; }
          50% { opacity: 0.8; }
          100% { transform: translate(-15px, -80px) scale(0.9); opacity: 0; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.85); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.2; }
          100% { transform: scale(1.3); opacity: 0; }
        }
        .animate-heartbeat {
          animation: heartbeat 1.4s infinite ease-in-out;
        }
        .animate-rotate-slow {
          animation: rotate-slow 8s infinite linear;
        }
        .animate-float-1 {
          animation: float-heart-1 2.5s infinite ease-out;
        }
        .animate-float-2 {
          animation: float-heart-2 2.8s infinite ease-out 0.4s;
        }
        .animate-float-3 {
          animation: float-heart-3 2.2s infinite ease-out 0.8s;
        }
        .animate-pulse-ring {
          animation: pulse-ring 2s infinite cubic-bezier(0.215, 0.610, 0.355, 1);
        }
      `}</style>

      {/* Main loading layout */}
      <div className="relative flex flex-col items-center">
        {/* Soft pulsing aura ring */}
        <div className="absolute w-24 h-24 bg-[#ffd5e5]/40 rounded-full animate-pulse-ring"></div>
        <div className="absolute w-24 h-24 bg-[#ffd5e5]/20 rounded-full animate-pulse-ring" style={{ animationDelay: "0.6s" }}></div>

        {/* Soft rotating outer dashed ring */}
        <div className="w-20 h-20 border-2 border-dashed border-[#ffd5e5] rounded-full animate-rotate-slow flex items-center justify-center"></div>

        {/* Heart icon container */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-heartbeat filter drop-shadow-[0_4px_10px_rgba(213,60,131,0.2)]">
            <svg
              className="w-10 h-10 text-[#d53c83]"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </div>
        </div>

        {/* Tiny bubbles/hearts floating out of the main heart */}
        <div className="absolute top-0 text-xs">
          <span className="absolute animate-float-1 text-[#ffd5e5]">💖</span>
          <span className="absolute animate-float-2 text-[#ff9ebb]">💕</span>
          <span className="absolute animate-float-3 text-[#d53c83]">🌸</span>
        </div>
      </div>

      {/* Loading message */}
      <div className="mt-8 text-center">
        <h3 className="text-sm font-black uppercase tracking-widest text-[#d53c83] opacity-80">
          Tinori Shop
        </h3>
        <p className="text-[10px] text-gray-400 font-bold tracking-wider mt-1 animate-pulse">
          Đang chuẩn bị điều xinh đẹp...
        </p>
      </div>
    </div>
  );
}
