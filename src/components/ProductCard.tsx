"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Heart } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  salePrice?: number | null;
  image?: string;
  slug: string;
  category?: string;
}

export default function ProductCard({
  id,
  name,
  price,
  salePrice,
  image,
  slug,
  category,
}: ProductCardProps) {
  const displayPrice = salePrice || price;
  const hasDiscount = salePrice && salePrice < price;
  const discountPercent = hasDiscount
    ? Math.round(((price - salePrice!) / price) * 100)
    : 0;

  return (
    <Link href={`/products/${id}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
              <div className="text-center text-gray-400">
                <ShoppingCart className="mx-auto h-12 w-12 mb-2 opacity-30" />
                <p className="text-xs">Chưa có ảnh</p>
              </div>
            </div>
          )}
          {hasDiscount && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
              -{discountPercent}%
            </div>
          )}
          <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-pink-50">
            <Heart className="h-4 w-4 text-pink-400" />
          </button>
        </div>
        <div className="p-3">
          {category && (
            <p className="text-xs text-purple-500 font-medium mb-1">{category}</p>
          )}
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2 leading-5">
            {name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-pink-600">
              {formatPrice(displayPrice)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
