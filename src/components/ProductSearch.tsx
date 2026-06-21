"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils"; // Assuming there is a formatPrice, I'll need to check

export default function ProductSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setSuggestions(data.slice(0, 5)); // Take top 5
        setIsOpen(true);
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchSuggestions();
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(false);
    if (query.trim()) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("q", query);
      params.delete("page"); // Reset pagination
      router.push(`/products?${params.toString()}`);
    } else {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("q");
      params.delete("page");
      router.push(`/products?${params.toString()}`);
    }
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setIsOpen(false);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto mb-8 z-40" ref={wrapperRef}>
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400 group-focus-within:text-pink-500 transition-colors" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (query.trim()) setIsOpen(true); }}
          className="block w-full pl-11 pr-12 py-3.5 bg-white border-2 border-gray-100 rounded-2xl text-sm placeholder-gray-400 focus:outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-50 transition-all shadow-sm"
          placeholder="Tìm kiếm sản phẩm, hộp quà tặng..."
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-4 flex items-center"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
          </button>
        )}
      </form>

      {/* Dropdown Suggestions */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden py-2 animate-in fade-in slide-in-from-top-4 duration-200">
          {isLoading ? (
            <div className="flex items-center justify-center py-6 text-gray-400">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : suggestions.length > 0 ? (
            <div>
              {suggestions.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-pink-50 transition-colors"
                >
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-100">
                    {product.images?.[0]?.url ? (
                      <Image
                        src={product.images[0].url}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {product.name}
                    </h4>
                    <p className="text-sm font-bold text-pink-600 mt-0.5">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.salePrice || product.price)}
                    </p>
                  </div>
                </Link>
              ))}
              <div className="border-t border-gray-100 mt-2">
                <button
                  onClick={handleSubmit}
                  className="w-full text-center py-3 text-sm font-medium text-pink-600 hover:text-pink-700 hover:bg-pink-50 transition-colors"
                >
                  Xem tất cả kết quả cho "{query}"
                </button>
              </div>
            </div>
          ) : (
            <div className="py-6 px-4 text-center text-sm text-gray-500">
              Không tìm thấy sản phẩm nào phù hợp với "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
