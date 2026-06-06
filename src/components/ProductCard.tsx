"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShoppingCart, Zap, Check, X, Star } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/hooks/useCart";

import { toast } from "@/hooks/useToast";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  salePrice?: number | null;
  image?: string;
  hoverImage?: string;
  slug: string;
  hasVariants?: boolean;
  variants?: any[];
  stock?: number;
  fulfillmentType?: string;
}

export default function ProductCard({
  id,
  name,
  price,
  salePrice,
  image,
  hoverImage,
  slug,
  hasVariants = false,
  variants = [],
  stock,
  fulfillmentType,
}: ProductCardProps) {

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Simple helper to get stable pseudo-random numbers based on string id
  const getSeedRandom = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  };

  const seed = getSeedRandom(id);
  const fakeSold = (seed % 1800) + 120; // 120 to 1919
  const fakeRating = (4.9 + (seed % 2) * 0.1).toFixed(1); // 4.9 or 5.0
  const fakeReviews = (seed % 150) + 15; // 15 to 164

  const formatSold = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
    return num.toString();
  };

  const isFavorite = false;
  const [animateHeart, setAnimateHeart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const [selectorType, setSelectorType] = useState<"cart" | "buy_now">("cart");
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  const { addItem, clearCart } = useCart();
  const router = useRouter();

  // Extract attributes from combination variants (Shopee style)
  const attributeNames = variants[0]?.type?.split(' - ') || [];
  const attributeGroups = attributeNames.map((name: string, index: number) => {
    const values = Array.from(new Set(variants.filter(v => v.active !== false).map(v => {
      const parts = v.value.split(' - ');
      if (index === attributeNames.length - 1 && parts.length > attributeNames.length) {
        return parts.slice(index).join(' - ');
      }
      return parts[index];
    }).filter(Boolean)));
    return { name, values };
  }).filter((g: { name: string; values: string[] }) => g.name);

  // Find matched variant based on selection
  const selectedValuesString = attributeNames.map((name: string) => selectedVariants[name] || "").join(' - ');
  const matchedVariant = variants.find((v: any) => v.value === selectedValuesString && v.active !== false);

  const displayPrice = matchedVariant?.salePrice || matchedVariant?.price || salePrice || price;
  const hasDiscount = salePrice && salePrice < price;
  const discountPercent = hasDiscount
    ? Math.round(((price - salePrice!) / price) * 100)
    : 0;



  const [flying, setFlying] = useState<{ x: number, y: number, img: string } | null>(null);

  const triggerFlyToCart = (e: React.MouseEvent, imgUrl: string) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    // Giả định vị trí giỏ hàng ở góc trên bên phải (thường là vậy)
    const targetX = window.innerWidth - 80 - x;
    const targetY = -y + 40;

    setFlying({ x, y, img: imgUrl });
    
    // Set CSS variables for the animation
    const root = document.documentElement;
    root.style.setProperty('--target-x', `${targetX}px`);
    root.style.setProperty('--target-y', `${targetY}px`);

    setTimeout(() => setFlying(null), 800);
  };

  const handleConfirmSelection = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const missingVariant = attributeNames.find((name: string) => !selectedVariants[name]);
    if (missingVariant) {
      toast({
        title: `Vui lòng chọn ${missingVariant}`,
        variant: "destructive",
      });
      return;
    }

    if (matchedVariant && matchedVariant.stock <= 0) {
      toast({ title: "Hết hàng", variant: "destructive" });
      return;
    }

    const cartItem = {
      id: `${id}-${matchedVariant?.id || "default"}-${Date.now()}`,
      productId: id,
      name,
      price: displayPrice,
      image: matchedVariant?.image || image || "",
      quantity: 1,
      variantId: matchedVariant?.id,
      variantName: attributeNames.join(" - ") || undefined,
      variantValue: matchedVariant?.value || undefined,
      maxStock: matchedVariant?.stock ?? stock,
    };

    if (selectorType === "buy_now") {
      addItem(cartItem);
      router.push("/checkout");
    } else {
      addItem(cartItem);
      setAddedToCart(true);
      setShowSelector(false);
      triggerFlyToCart(e, cartItem.image);
      toast({
        title: "Đã thêm vào giỏ hàng! ",
        description: `${name.length > 30 ? name.substring(0, 30) + '...' : name} x1 - Shop iu cậu quá đi~`,
        variant: "success",
      });
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (hasVariants) {
      setSelectorType("cart");
      setShowSelector(true);
      return;
    }

    const cartItem = {
      id: `${id}-default-${Date.now()}`,
      productId: id,
      name,
      price: displayPrice,
      image: image || "",
      quantity: 1,
      maxStock: stock,
    };

    addItem(cartItem);
    setAddedToCart(true);
    triggerFlyToCart(e, cartItem.image);
    toast({
      title: "Đã thêm vào giỏ hàng! ",
      description: `${name.length > 30 ? name.substring(0, 30) + '...' : name} x1 - Shop iu cậu quá đi~`,
      variant: "success",
    });
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (hasVariants) {
      if (matchedVariant) {
        const cartItem = {
          id: `${id}-${matchedVariant.id}-${Date.now()}`,
          productId: id,
          name,
          price: displayPrice,
          image: matchedVariant.image || image || "",
          quantity: 1,
          variantId: matchedVariant.id,
          maxStock: matchedVariant.stock ?? stock,
        };
        addItem(cartItem);
        router.push("/checkout");
      } else {
        setSelectorType("buy_now");
        setShowSelector(true);
      }
      return;
    }

    const cartItem = {
      id: `${id}-default-${Date.now()}`,
      productId: id,
      name,
      price: displayPrice,
      image: image || "",
      quantity: 1,
      maxStock: stock,
    };

    addItem(cartItem);
    router.push("/checkout");
  };

  return (
    <div className="group block h-full relative">
      {/* Fly to Cart Animation Ghost */}
      {flying && (
        <div 
          className="animate-fly-to-cart rounded-full overflow-hidden border-2 border-pink-500 shadow-xl"
          style={{ 
            left: `${flying.x}px`, 
            top: `${flying.y}px`,
            width: '60px',
            height: '60px'
          }}
        >
          <img src={flying.img} alt="flying" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2 h-full flex flex-col border border-transparent hover:border-pink-100">
        <Link href={`/products/${slug || id}`} className="block relative aspect-square overflow-hidden bg-gray-50">
          {image ? (
              <>
                <Image
                  src={matchedVariant?.image || image}
                  alt={name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className={`object-cover transition-all duration-500 ease-in-out ${
                    hoverImage ? 'group-hover:opacity-0' : 'group-hover:scale-110'
                  }`}
                />
                {hoverImage && (
                  <Image
                    src={hoverImage}
                    alt={`${name} - ảnh 2`}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out"
                  />
                )}
              </>
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50 text-gray-400">
                <ShoppingCart className="mx-auto h-12 w-12 mb-2 opacity-30" />
                <p className="text-xs">Chưa có ảnh</p>
              </div>
            )}
            
            {/* Discount Badge */}
            {hasDiscount && (
              <div className="absolute top-3 left-3 bg-[#d53c83] text-white text-[11px] font-black px-2 py-1 rounded-full shadow-lg z-10 animate-pulse">
                -{discountPercent}%
              </div>
            )}

            {/* Preorder Badge */}
            {fulfillmentType === "preorder" && (
              <div className="absolute bottom-3 right-3 bg-[#d53c83] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md z-10 flex items-center gap-1">
                Hàng đặt trước
              </div>
            )}



            {/* Hover Actions Overlay Removed for cleaner UI */}


        </Link>

        <div className="p-4 flex flex-col flex-1">
          <Link href={`/products/${slug || id}`} className="block">
            <h3 className="text-sm font-bold text-gray-800 line-clamp-2 mb-1.5 leading-snug group-hover:text-[#d53c83] transition-colors">
              {name}
            </h3>
          </Link>
          
          {/* Stars and Sold count */}
            <div className="flex items-center gap-1 text-[11px] text-gray-400 mb-2 font-medium">
              <div className="flex items-center text-amber-400">
                <Star className="h-3 w-3 fill-current" />
                <span className="ml-0.5 font-bold text-gray-700">{fakeRating}</span>
              </div>
              <span>({fakeReviews})</span>
              <span className="text-gray-200">|</span>
              <span>Đã bán {formatSold(fakeSold)}</span>
            </div>

            <div className="mt-auto">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-lg font-black text-[#d53c83]">
                  {formatPrice(displayPrice)}
                </span>
                {hasDiscount && (
                  <span className="text-xs text-gray-400 line-through font-medium">
                    {formatPrice(price)}
                  </span>
                )}
              </div>

              {/* Action buttons - always visible */}
              <div className="mt-3 flex gap-2">
                <button
                  onClick={handleAddToCart}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all bg-pink-50 text-pink-600 hover:bg-pink-100"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Thêm vào giỏ
                </button>
              </div>
            </div>
          </div>

          {/* Quick Variant Selector Overlay */}
          {showSelector && (
            <div 
              className="absolute inset-0 bg-white/95 backdrop-blur-md z-30 p-4 flex flex-col animate-in fade-in zoom-in-95 duration-200"
              onClick={(e) => e.preventDefault()}
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-bold text-gray-800">Chọn phân loại</span>
                <button onClick={() => setShowSelector(false)} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar">
                {attributeGroups.map((group: { name: string; values: string[] }) => (
                  <div key={group.name}>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">{group.name}</p>
                    <div className="flex flex-wrap gap-2">
                      {group.values.map((value: string) => {
                        const isSelected = selectedVariants[group.name] === value;
                        return (
                          <button
                            key={value}
                            onClick={(e) => {
                              e.preventDefault();
                              setSelectedVariants(prev => ({ ...prev, [group.name]: value }));
                            }}
                            className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all duration-200 ${
                              isSelected
                                ? "border-[#d53c83] bg-[#f2d5e0] text-[#d53c83] shadow-sm"
                                : "border-gray-200 text-gray-600 hover:border-[#f2d5e0] hover:bg-gray-50"
                            }`}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={handleConfirmSelection}
                className="w-full mt-4 py-3 text-white rounded-2xl text-xs font-black shadow-xl shadow-[#d53c83]/30 hover:scale-[1.02] active:scale-95 transition-all"
                style={{ backgroundColor: '#d53c83' }}
              >
                XÁC NHẬN & {selectorType === "buy_now" ? "MUA NGAY" : "THÊM VÀO GIỎ"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>

  );
}
