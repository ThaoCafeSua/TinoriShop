"use client";

import { useState } from "react";
import { X, ZoomIn } from "lucide-react";

export default function FeedbackCarousel() {
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  const feedbacks = [
    { img: "/feedback/feedback-1.jpg", text: "Vibe xinh xắn, gói kĩ & quà tặng dễ thương" },
    { img: "/feedback/feedback-2.jpg", text: "Mãi iu shop, lần sau lại ghé ủng hộ tiếp" },
    { img: "/feedback/feedback-3.jpg", text: "Hàng chất lượng, đáng để chờ đợi" },
    { img: "/feedback/feedback-4.jpg", text: "Đóng gói siêu yêu, tinh tế tặng kèm card" },
    { img: "/feedback/feedback-5.jpg", text: "Shop siêu tận tâm và đáng yêu" },
  ];

  // Double items for seamless infinite scroll loop
  const marqueeItems = [...feedbacks, ...feedbacks];

  return (
    <>
      {/* ── Infinite Scrolling Marquee Feedback ── */}
      <div className="relative overflow-hidden w-full py-4 -mx-4 px-4">
        {/* Ambient Fade Gradients on edges for premium feel */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#fdf2f8] via-[#fdf2f8]/80 to-transparent z-10 pointer-events-none"></div>

        <div className="animate-marquee flex gap-6">
          {marqueeItems.map((item, idx) => (
            <div 
              key={idx} 
              onClick={() => setSelectedImg(item.img)}
              className="w-[260px] shrink-0 bg-white p-3 rounded-2xl border border-pink-100/60 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col group overflow-hidden cursor-pointer"
            >
              {/* Image Container with Hover zoom and overlay button */}
              <div className="relative overflow-hidden rounded-xl bg-gray-50 flex-1 flex items-center justify-center h-[340px]">
                <img 
                  src={item.img} 
                  alt={item.text} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                {/* Hover overlay with zoom icon */}
                <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="bg-white/90 p-3 rounded-full shadow-lg transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
                    <ZoomIn className="h-5 w-5 text-pink-600 animate-pulse" />
                  </div>
                </div>
              </div>
              <div className="mt-3 text-center border-t border-pink-50/50 pt-2.5">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Khách phản hồi</p>
                <p className="text-xs font-black text-gray-800 mt-0.5 line-clamp-1 group-hover:text-[#d53c83] transition-colors">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Premium Lightbox Modal for Feedback Zoom ── */}
      {selectedImg && (
        <div 
          className="fixed inset-0 bg-black/75 backdrop-blur-md z-[99999] flex items-center justify-center p-4 transition-opacity duration-300 animate-in fade-in"
          onClick={() => setSelectedImg(null)}
        >
          {/* Close button top right */}
          <button 
            onClick={() => setSelectedImg(null)}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all duration-200 hover:rotate-90 shadow-lg z-10"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Image Container with smooth zoom animation */}
          <div 
            className="relative max-w-4xl max-h-[90vh] w-full flex items-center justify-center animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={selectedImg} 
              alt="Feedback Details" 
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border-4 border-white/5 bg-white"
            />
          </div>
        </div>
      )}
    </>
  );
}
