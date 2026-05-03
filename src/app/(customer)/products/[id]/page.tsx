"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCart,
  ChevronLeft,
  Share2,
  Star,
  Truck,
  Shield,
  MessageCircle,
  Plus,
  Minus,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/utils";
import { toast } from "@/hooks/useToast";

interface ProductVariant {
  id: string;
  name: string;
  value: string;
  type: string;
  stock: number;
  price?: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  stock: number;
  images: { id: string; url: string; isPrimary: boolean }[];
  variants: ProductVariant[];
  category?: { name: string; slug: string };
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 animate-pulse">
          <div className="aspect-square bg-gray-200 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-6 bg-gray-200 rounded w-1/4" />
            <div className="h-24 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">😢</div>
        <h2 className="text-2xl font-bold text-gray-700 mb-4">
          Không tìm thấy sản phẩm
        </h2>
        <Link href="/products">
          <Button>Quay lại danh sách</Button>
        </Link>
      </div>
    );
  }

  const displayPrice =
    product.salePrice && product.salePrice < product.price
      ? product.salePrice
      : product.price;
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0;

  // Group variants by type
  const variantGroups: Record<string, ProductVariant[]> = {};
  product.variants.forEach((v) => {
    if (!variantGroups[v.type]) variantGroups[v.type] = [];
    variantGroups[v.type].push(v);
  });

  const handleAddToCart = () => {
    // Get selected variant
    const variantTypes = Object.keys(variantGroups);
    const selectedVariant =
      variantTypes.length > 0
        ? product.variants.find((v) => selectedVariants[v.type] === v.id)
        : undefined;

    const cartItem = {
      id: `${product.id}-${selectedVariant?.id || "default"}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      price: selectedVariant?.price || displayPrice,
      image: product.images[0]?.url || "",
      quantity,
      variantId: selectedVariant?.id,
      variantName: selectedVariant?.name,
      variantValue: selectedVariant?.value,
    };

    addItem(cartItem);
    setAddedToCart(true);
    toast({
      title: "Đã thêm vào giỏ hàng!",
      description: `${product.name} x${quantity}`,
      variant: "success",
    });
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-purple-600">
          Trang chủ
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-purple-600">
          Sản phẩm
        </Link>
        {product.category && (
          <>
            <span>/</span>
            <Link
              href={`/products?category=${product.category.slug}`}
              className="hover:text-purple-600"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-gray-700 font-medium line-clamp-1">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-3">
            {product.images[selectedImage] ? (
              <Image
                src={product.images[selectedImage].url}
                alt={product.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-purple-50 to-pink-50 text-gray-400">
                <ShoppingCart className="h-20 w-20 opacity-20" />
              </div>
            )}
            {hasDiscount && (
              <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-xl">
                -{discountPercent}%
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(i)}
                  className={`relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-colors ${
                    selectedImage === i
                      ? "border-purple-500"
                      : "border-transparent"
                  }`}
                >
                  <Image src={img.url} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div>
          {product.category && (
            <Badge className="mb-2">{product.category.name}</Badge>
          )}
          <h1 className="text-2xl font-black text-gray-900 mb-3">{product.name}</h1>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl font-black text-pink-600">
              {formatPrice(displayPrice)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(product.price)}
                </span>
                <span className="bg-red-100 text-red-600 text-sm font-bold px-2 py-1 rounded-lg">
                  -{discountPercent}%
                </span>
              </>
            )}
          </div>

          {/* Stars */}
          <div className="flex items-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="h-4 w-4 text-yellow-400 fill-yellow-400"
              />
            ))}
            <span className="text-sm text-gray-500 ml-1">5.0</span>
          </div>

          {/* Variants */}
          {Object.entries(variantGroups).map(([type, variants]) => (
            <div key={type} className="mb-4">
              <p className="text-sm font-bold text-gray-700 mb-2">{type}:</p>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() =>
                      setSelectedVariants((prev) => ({ ...prev, [type]: v.id }))
                    }
                    className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                      selectedVariants[type] === v.id
                        ? "border-purple-500 bg-purple-50 text-purple-700"
                        : "border-gray-200 text-gray-600 hover:border-purple-300"
                    } ${v.stock === 0 ? "opacity-40 cursor-not-allowed" : ""}`}
                    disabled={v.stock === 0}
                  >
                    {v.value}
                    {v.stock === 0 && " (Hết)"}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Quantity */}
          <div className="mb-5">
            <p className="text-sm font-bold text-gray-700 mb-2">Số lượng:</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-gray-50"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-5 py-3 font-bold text-lg min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <span className="text-sm text-gray-500">
                Còn {product.stock} sản phẩm
              </span>
            </div>
          </div>

          {/* Deposit notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
            <p className="text-sm font-semibold text-amber-800">
              💳 Cần đặt cọc 25.000đ khi đặt hàng
            </p>
            <p className="text-xs text-amber-600 mt-1">
              Sau khi xác nhận cọc, đơn hàng sẽ được xử lý ngay
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleAddToCart}
              className="flex-1"
              size="lg"
              variant={addedToCart ? "success" : "default"}
              disabled={product.stock === 0}
            >
              {addedToCart ? (
                <>
                  <Check className="h-5 w-5" />
                  Đã thêm!
                </>
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5" />
                  {product.stock === 0 ? "Hết hàng" : "Thêm vào giỏ"}
                </>
              )}
            </Button>
            <Link href="/checkout" className="flex-1">
              <Button size="lg" variant="outline" className="w-full">
                Mua ngay
              </Button>
            </Link>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            {[
              { icon: Truck, text: "Giao toàn quốc" },
              { icon: Shield, text: "Bảo đảm chất lượng" },
              { icon: MessageCircle, text: "Hỗ trợ 24/7" },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="flex flex-col items-center gap-1 p-3 bg-gray-50 rounded-xl"
                >
                  <Icon className="h-5 w-5 text-purple-600" />
                  <span className="text-xs text-gray-600 text-center">{f.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div className="mt-10 bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-black text-gray-900 mb-4">Mô tả sản phẩm</h2>
          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
            {product.description}
          </div>
        </div>
      )}

      {/* Back button */}
      <div className="mt-8">
        <Link href="/products">
          <Button variant="outline">
            <ChevronLeft className="h-4 w-4" />
            Quay lại danh sách
          </Button>
        </Link>
      </div>
    </div>
  );
}
