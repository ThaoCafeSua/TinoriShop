"use client";

import Link from "next/link";
import { Heart, ArrowLeft, ShoppingBag } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";

export default function WishlistPage() {
  const { items } = useWishlist();

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 min-h-[60vh]">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/products" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="h-6 w-6 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-gray-900">Danh sách yêu thích</h1>
          <p className="text-gray-500">Những món đồ cậu đang "thầm thương trộm nhớ" ✨</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border-2 border-dashed border-pink-100">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <Heart className="w-full h-full text-pink-100" />
            <Heart className="absolute inset-0 w-12 h-12 m-auto text-pink-300 animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Danh sách trống trơn~</h2>
          <p className="text-gray-500 mb-8 max-w-xs mx-auto">
            Cậu chưa yêu thích sản phẩm nào. Hãy ghé thăm cửa hàng để tìm những món đồ xinh xắn nhé!
          </p>
          <Link href="/products">
            <Button className="bg-[#d53c83] hover:bg-[#d53c83]/90 rounded-2xl px-8 py-6 h-auto font-bold text-lg shadow-xl shadow-[#d53c83]/20 transition-all hover:scale-105">
              Ghé thăm cửa hàng ngay
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {items.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              salePrice={product.salePrice}
              image={product.image}
              slug={product.slug}
            />
          ))}
        </div>
      )}

      {items.length > 0 && (
        <div className="mt-12 p-6 bg-[#f2d5e0]/30 rounded-3xl border-2 border-white flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
              <ShoppingBag className="h-6 w-6 text-[#d53c83]" />
            </div>
            <p className="font-bold text-[#9a7182]">Cậu có {items.length} món đồ yêu thích</p>
          </div>
          <Link href="/products">
            <Button variant="outline" className="border-[#d53c83] text-[#d53c83] hover:bg-[#f2d5e0] rounded-xl font-bold">
              Tiếp tục xem thêm sản phẩm
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
