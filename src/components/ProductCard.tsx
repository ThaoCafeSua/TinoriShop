"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShoppingCart, Heart, Zap, Check } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/hooks/useCart";
import { toast } from "@/hooks/useToast";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  salePrice?: number | null;
  image?: string;
  slug: string;
  hasVariants?: boolean;
  variants?: { price: number | null }[];
}

export default function ProductCard({
  id,
  name,
  price,
  salePrice,
  image,
  slug,
  hasVariants = false,
  variants = [],
}: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [animateHeart, setAnimateHeart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    if (!isFavorite) {
      setAnimateHeart(true);
      setTimeout(() => setAnimateHeart(false), 400);
    }
  };

  const { addItem, clearCart } = useCart();
  const router = useRouter();

  const firstVariantPrice = variants.find((v) => v.price != null)?.price;
  const displayPrice = firstVariantPrice || salePrice || price;
  const hasDiscount = !firstVariantPrice && salePrice && salePrice < price;
  const discountPercent = hasDiscount
    ? Math.round(((price - salePrice!) / price) * 100)
    : 0;

  const createCartItem = () => ({
    id: `${id}-default-${Date.now()}`,
    productId: id,
    name,
    price: displayPrice,
    image: image || "",
    quantity: 1,
  });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasVariants) {
      router.push(`/products/${id}`);
      return;
    }
    addItem(createCartItem());
    setAddedToCart(true);
    toast({
      title: "Đã thêm vào giỏ hàng!",
      description: `${name} x1`,
      variant: "success",
    });
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasVariants) {
      router.push(`/products/${id}`);
      return;
    }
    clearCart();
    addItem(createCartItem());
    router.push("/checkout");
  };

  return (
    <Link href={`/products/${id}`} className="group block h-full">
      <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 h-full flex flex-col">
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50">
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
          <button
            onClick={toggleFavorite}
            className={`absolute top-2 right-2 p-2 bg-white rounded-full shadow-md transition-all duration-300 hover:scale-110 active:scale-90 ${
              isFavorite ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            <Heart
              className={`h-4 w-4 transition-all duration-300 ${
                isFavorite
                  ? "fill-pink-500 text-pink-500"
                  : "text-pink-400 group-hover:text-pink-500"
              } ${animateHeart ? "animate-heart-pop" : ""}`}
            />
          </button>
        </div>
        <div className="p-3 flex flex-col flex-1">

          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2 leading-5">
            {name}
          </h3>
          <div className="mt-auto">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base font-bold text-pink-600">
                {formatPrice(displayPrice)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-gray-400 line-through">
                  {formatPrice(price)}
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
            <button
              onClick={handleAddToCart}
              className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
                addedToCart
                  ? "bg-green-500 text-white"
                  : "bg-pink-100 text-pink-700 hover:bg-pink-200"
              }`}
            >
              {addedToCart ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Đã thêm
                </>
              ) : (
                <>
                  <ShoppingCart className="h-3.5 w-3.5" />
                  {hasVariants ? "Tùy chọn" : "Giỏ hàng"}
                </>
              )}
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-xl text-xs font-semibold hover:from-pink-500 hover:to-rose-500 transition-all active:scale-95"
            >
              <Zap className="h-3.5 w-3.5" />
              Mua ngay
            </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
