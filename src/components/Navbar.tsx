"use client";

import Link from "next/link";
import { Search, Store, Menu, X } from "lucide-react";
import { useState } from "react";
import CartDrawer from "@/components/CartDrawer";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-gradient-to-r from-rose-200 via-pink-200 to-rose-200 shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-pink-700">
            <div className="w-9 h-9 bg-pink-500/20 rounded-xl flex items-center justify-center">
              <Store className="h-5 w-5" />
            </div>
            <span className="text-xl font-black tracking-tight">TINORI</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-pink-800/80">
            <Link href="/" className="hover:text-pink-600 transition-colors">
              Trang chủ
            </Link>
            <Link href="/products" className="hover:text-pink-600 transition-colors">
              Sản phẩm
            </Link>
            <Link href="/order-tracking" className="hover:text-pink-600 transition-colors">
              Tra đơn hàng
            </Link>
            <a
              href="https://www.facebook.com/tinori.official"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-pink-600 transition-colors"
            >
              Facebook
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-pink-700 hover:text-pink-500 transition-colors"
            >
              <Search className="h-6 w-6" />
            </button>
            <CartDrawer />
            <button
              className="md:hidden p-2 text-pink-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="pb-3">
            <form
              action="/products"
              className="flex gap-2"
            >
              <input
                name="q"
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                className="flex-1 h-10 rounded-xl px-4 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-pink-300"
                autoFocus
              />
              <button
                type="submit"
                className="h-10 px-4 bg-pink-500 text-white rounded-xl hover:bg-pink-600 font-medium text-sm"
              >
                Tìm
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-rose-300 px-4 pb-4">
          <nav className="flex flex-col gap-2 text-sm font-medium">
            {[
              { href: "/", label: "Trang chủ" },
              { href: "/products", label: "Sản phẩm" },
              { href: "/order-tracking", label: "Tra đơn hàng" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-pink-800/90 hover:text-pink-700 hover:bg-white/30 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <a
              href="https://www.facebook.com/tinori.official"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 text-pink-800/90 hover:text-pink-700 hover:bg-white/30 rounded-lg transition-colors"
            >
              Facebook
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
