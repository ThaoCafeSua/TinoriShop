"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import Link from "next/link";
import { createPortal } from "react-dom";

export default function GlobalPopup() {
  const [popup, setPopup] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if we already closed it in this session to not annoy the user
    // if (sessionStorage.getItem("tinori_popup_closed")) return;

    fetch("/api/popup?t=" + Date.now())
      .then((res) => res.json())
      .then((data) => {
        if (data && data.active && data.image) {
          setPopup(data);
          // Small delay before showing for better UX
          setTimeout(() => setIsOpen(true), 500);
        }
      })
      .catch(() => {});
  }, []);

  if (!isOpen || !popup) return null;

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem("tinori_popup_closed", "true");
  };

  const Content = () => (
    <>
      <img 
        src={popup.image} 
        alt={popup.title || "Tinori Popup"} 
        className="w-full h-auto max-h-[70vh] object-contain bg-transparent"
      />
      {popup.title && (
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-pink-200/90 via-pink-100/60 to-transparent pt-12 pb-4 px-4 text-center">
          <h3 className="text-[#d53c83] font-black tracking-wide drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] text-lg">{popup.title}</h3>
        </div>
      )}
    </>
  );

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 animate-in fade-in duration-300">
      <div className="relative w-full max-w-sm sm:max-w-md mx-auto animate-in zoom-in-95 duration-500">
        <button 
          onClick={handleClose}
          className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="relative rounded-2xl overflow-hidden bg-transparent shadow-2xl">
          {popup.link ? (
            <Link href={popup.link} onClick={handleClose} className="block relative">
              <Content />
            </Link>
          ) : (
            <div className="relative">
              <Content />
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
