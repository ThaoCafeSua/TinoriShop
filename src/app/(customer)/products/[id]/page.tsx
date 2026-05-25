"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/utils";
import { toast } from "@/hooks/useToast";
import ProductCard from "@/components/ProductCard";

interface ProductVariant {
  id: string;
  name: string;
  value: string;
  type: string;
  stock: number;
  price?: number;
  salePrice?: number | null;
  active?: boolean;
  image?: string | null;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  stock: number;
  fulfillmentType?: string;
  images: { id: string; url: string; isPrimary: boolean }[];
  variants: ProductVariant[];
  slug: string;
  relatedProducts?: {
    id: string;
    name: string;
    price: number;
    salePrice?: number | null;
    slug: string;
    images: { url: string; isPrimary: boolean }[];
    variants?: any[];
    fulfillmentType?: string;
  }[];
}

const reviewTemplates = [
  { name: "n*****1", comment: "Sản phẩm siêu dễ thương luôn ạ! Đóng gói cực kỳ cẩn thận, shop còn tặng thêm quà siêu xinh nữa. Sẽ tiếp tục ủng hộ shop lâu dài ạaa~ 💕", date: "12-05-2026" },
  { name: "t*****h", comment: "Đồ đẹp và giao hàng nhanh lắm mọi người ơi, đóng gói siêu cẩn thận luôn, 10 điểm không có nhưng luôn nheee 😍", date: "10-05-2026" },
  { name: "m*****a", comment: "Hàng giao siêu tốc, phụ kiện xinh xỉu luôn á, đóng gói chắc chắn lắm nha. Iu shop quá đi à 🎀", date: "09-05-2026" },
  { name: "h*****n", comment: "Chất lượng sản phẩm tuyệt vời lắm ạ, xinh hơn cả trong ảnh luôn. Shop tư vấn siêu dễ thương nữa!", date: "08-05-2026" },
  { name: "k*****y", comment: "Giao đúng mẫu, đúng số lượng, đóng gói siêu cute. Giá cả lại rất học sinh sinh viên nữa ạ 💗", date: "07-05-2026" },
  { name: "p*****o", comment: "Đồ siêu xinh xắn, shop đóng gói cẩn thận có bọc bong bóng khí đầy đủ luôn. Sẽ mua lại lần sau nhaaa 🧸", date: "05-05-2026" },
  { name: "a*****e", comment: "Nhận hàng mà ưng quá chừng luôn á! Giao hàng siêu nhanh, mới đặt hôm qua hôm nay đã có rùi ✨", date: "02-05-2026" },
];

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // Simple helper to get stable pseudo-random numbers based on string id
  const getSeedRandom = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  };

  const seed = product ? getSeedRandom(product.id) : 0;
  const fakeSold = (seed % 1800) + 120; // 120 to 1919
  const fakeRating = parseFloat((4.9 + (seed % 2) * 0.1).toFixed(1)); // 4.9 or 5.0
  const fakeReviews = (seed % 150) + 15; // 15 to 164

  const formatSold = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
    return num.toString();
  };

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addItem, clearCart } = useCart();
  const router = useRouter();


  const attributeNames = product?.variants[0]?.type?.split(' - ') || [];
  const selectedValuesString = attributeNames.map((name: string) => selectedVariants[name] || "").join(' - ');
  const matchedVariant = product?.variants.find((v: ProductVariant) => v.value === selectedValuesString && v.active !== false);

  // Partial match for image if matchedVariant is undefined
  let variantImage = matchedVariant?.image;
  if (!variantImage && Object.keys(selectedVariants).length > 0) {
    const partialMatch = product?.variants.find(v => {
      if (!v.active || !v.image) return false;
      const parts = v.value.split(' - ');
      return Object.entries(selectedVariants).every(([key, val]) => {
        const attrIndex = attributeNames.indexOf(key);
        return attrIndex !== -1 && parts[attrIndex] === val;
      });
    });
    if (partialMatch) {
      variantImage = partialMatch.image;
    }
  }

  const displayImages = product ? [...product.images] : [];
  if (variantImage && !displayImages.some((img) => img.url === variantImage)) {
    displayImages.unshift({ id: "variant-image", url: variantImage, isPrimary: false } as any);
  }

  useEffect(() => {
    if (variantImage) {
      const index = displayImages.findIndex((img) => img.url === variantImage);
      if (index !== -1 && index !== selectedImage) {
        setSelectedImage(index);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variantImage]);



  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        const primaryIndex = data.images?.findIndex((img: any) => img.isPrimary);
        if (primaryIndex > 0) {
          setSelectedImage(primaryIndex);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const attributeGroups = attributeNames.map((name: string, index: number) => {
    const values = Array.from(new Set(product?.variants.filter(v => v.active !== false).map(v => {
      const parts = v.value.split(' - ');
      if (index === attributeNames.length - 1 && parts.length > attributeNames.length) {
        return parts.slice(index).join(' - ');
      }
      return parts[index];
    }).filter(Boolean)));
    return { name, values };
  }).filter((g: { name: string; values: string[] }) => g.name);

  const productReviews = product ? (() => {
    const reviews = [];
    const count = 3 + (seed % 3); // 3 to 5 reviews
    for (let i = 0; i < count; i++) {
      const idx = (seed + i) % reviewTemplates.length;
      // Stable rating for review (4 or 5 stars, mostly 5)
      const reviewerRating = (seed + i) % 6 === 0 ? 4 : 5;
      
      const variantDesc = attributeNames.length > 0 && attributeGroups[0]?.values.length
        ? `${attributeNames[0]}: ${attributeGroups[0].values[(seed + i) % attributeGroups[0].values.length]}`
        : "Mặc định";

      reviews.push({
        ...reviewTemplates[idx],
        rating: reviewerRating,
        variant: variantDesc
      });
    }
    return reviews;
  })() : [];

  const currentStock = matchedVariant ? matchedVariant.stock : (product && product.variants.length > 0 ? product.variants.filter(v => v.active !== false).reduce((acc, v) => acc + v.stock, 0) : (product?.stock || 0));

  // Sync quantity with current stock
  useEffect(() => {
    if (currentStock > 0 && quantity > currentStock) {
      setQuantity(currentStock);
    }
  }, [currentStock, quantity]);

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
  const baseHasDiscount = product.salePrice && product.salePrice < product.price;

  const currentDisplayPrice = matchedVariant?.salePrice || matchedVariant?.price || displayPrice;
  const currentOriginalPrice = matchedVariant?.price || product.price;
  const hasDiscount = matchedVariant 
    ? (matchedVariant.salePrice && matchedVariant.salePrice < matchedVariant.price!)
    : baseHasDiscount;
  const discountPercent = hasDiscount
    ? Math.round(((currentOriginalPrice - currentDisplayPrice) / currentOriginalPrice) * 100)
    : 0;
  
  const displayImage = matchedVariant?.image || product.images[selectedImage]?.url;

  const handleAddToCart = () => {
    if (attributeNames.length > 0) {
      const missingVariant = attributeNames.find((name: string) => !selectedVariants[name]);
      if (missingVariant) {
        toast({
          title: "Vui lòng chọn thuộc tính",
          description: `Bạn chưa chọn ${missingVariant}`,
          variant: "destructive",
        });
        return;
      }
    }

    if (currentStock <= 0) {
      toast({
        title: "Hết hàng",
        description: "Sản phẩm này đã hết hàng",
        variant: "destructive",
      });
      return;
    }

    const cartItem = {
      id: `${product.id}-${matchedVariant?.id || "default"}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      price: currentDisplayPrice,
      image: displayImage || product.images[0]?.url || "",
      quantity,
      variantId: matchedVariant?.id,
      variantName: attributeNames.join(" - ") || undefined,
      variantValue: matchedVariant?.value || undefined,
      maxStock: currentStock,
    };

    addItem(cartItem);
    setAddedToCart(true);
    toast({
      title: "Đã thêm vào giỏ hàng!",
      description: `${product.name.length > 30 ? product.name.substring(0, 30) + '...' : product.name} x${quantity}`,
      variant: "success",
    });
    setTimeout(() => setAddedToCart(false), 2000);
  };
  
  const handleBuyNow = () => {
    if (attributeNames.length > 0) {
      const missingVariant = attributeNames.find((name: string) => !selectedVariants[name]);
      if (missingVariant) {
        toast({
          title: "Vui lòng chọn thuộc tính",
          description: `Bạn chưa chọn ${missingVariant}`,
          variant: "destructive",
        });
        return;
      }
    }

    if (currentStock <= 0) {
      toast({
        title: "Hết hàng",
        description: "Sản phẩm này đã hết hàng",
        variant: "destructive",
      });
      return;
    }

    const cartItem = {
      id: `${product.id}-${matchedVariant?.id || "default"}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      price: currentDisplayPrice,
      image: displayImage || product.images[0]?.url || "",
      quantity,
      variantId: matchedVariant?.id,
      variantName: attributeNames.join(" - ") || undefined,
      variantValue: matchedVariant?.value || undefined,
      maxStock: currentStock,
    };

    clearCart(); // Ensure only this product is checked out
    addItem(cartItem);
    router.push("/checkout");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-pink-600">
          Trang chủ
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-pink-600">
          Sản phẩm
        </Link>

        <span>/</span>
        <span className="text-gray-700 font-medium line-clamp-1">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Images */}
        <div className="min-w-0">
          <div className="relative w-full aspect-square rounded-2xl bg-gray-50 mb-3 overflow-hidden">
            {displayImages.length > 0 ? (
              <>
                <Image
                  src={displayImages[selectedImage]?.url || displayImages[0].url}
                  alt={`${product.name} - ${selectedImage + 1}`}
                  fill
                  priority
                  className="object-cover transition-opacity duration-300"
                  key={displayImages[selectedImage]?.url || displayImages[0].url}
                />
                {hasDiscount && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-xl z-10">
                    -{discountPercent}%
                  </div>
                )}
              </>
            ) : (
              <div className="relative min-w-full aspect-square flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50 text-gray-400">
                <ShoppingCart className="h-20 w-20 opacity-20" />
              </div>
            )}
          </div>
          {displayImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {displayImages.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(i)}
                  className={`relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-colors ${
                    selectedImage === i
                      ? "border-pink-500"
                      : "border-transparent"
                  }`}
                >
                  <Image src={img.url} alt="" fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div>

          <h1 className="text-2xl font-black text-gray-900 mb-3">{product.name}</h1>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl font-black text-pink-600">
              {formatPrice(currentDisplayPrice)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(currentOriginalPrice)}
                </span>
                <span className="bg-red-100 text-red-600 text-sm font-bold px-2 py-1 rounded-lg">
                  -{discountPercent}%
                </span>
              </>
            )}
          </div>

          {/* Stars & Sold count */}
          <div className="flex items-center gap-2 mb-4 text-sm text-gray-500 font-medium">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => {
                const isFilled = i < Math.floor(fakeRating);
                return (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      isFilled ? "text-amber-400 fill-amber-400" : "text-gray-200"
                    }`}
                  />
                );
              })}
              <span className="text-sm font-black text-gray-700 ml-1">{fakeRating}</span>
            </div>
            <span className="text-gray-300">|</span>
            <span className="underline hover:text-pink-600 cursor-pointer">{fakeReviews} đánh giá</span>
            <span className="text-gray-300">|</span>
            <span>Đã bán <span className="font-semibold text-gray-800">{formatSold(fakeSold)}</span></span>
          </div>

          {/* Variants */}
          {attributeGroups.map((group: { name: string; values: string[] }) => (
            <div key={group.name} className="mb-4">
              <p className="text-sm font-bold text-gray-700 mb-2">{group.name}:</p>
              <div className="flex flex-wrap gap-2">
                {group.values.map((value: string) => {
                  const isSelected = selectedVariants[group.name] === value;
                  return (
                    <button
                      key={value}
                      onClick={() =>
                        setSelectedVariants((prev) => ({ ...prev, [group.name]: value }))
                      }
                      className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                        isSelected
                          ? "border-pink-500 bg-pink-50 text-pink-700"
                          : "border-gray-200 text-gray-600 hover:border-pink-300"
                      }`}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Pre-order notice */}
          {product.fulfillmentType === "preorder" && (
            <div className="bg-pink-50/80 border border-pink-200/50 rounded-2xl p-4 mb-5 flex items-start gap-3 shadow-sm">
              <div className="bg-pink-100 text-pink-600 p-2 rounded-xl">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-black text-pink-700">
                  Hàng đặt trước
                </p>
                <p className="text-xs text-pink-600/90 mt-1 font-medium leading-relaxed">
                  Sản phẩm này cần khoảng 14 ngày chuẩn bị trước khi gửi.
                </p>
              </div>
            </div>
          )}

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
                  onClick={() => setQuantity(prev => Math.min(currentStock, prev + 1))}
                  className="p-3 hover:bg-gray-50"
                  disabled={quantity >= currentStock}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <span className="text-sm text-gray-500">
                Còn {currentStock} sản phẩm
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
            <Button
              onClick={handleBuyNow}
              className="flex-1 font-bold shadow-lg"
              size="lg"
              disabled={product.stock === 0}
              style={{ backgroundColor: '#d53c83', color: '#ffffff' }}
            >
              Mua ngay
            </Button>
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
                  <Icon className="h-5 w-5 text-pink-600" />
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

      {/* Customer Reviews Section */}
      <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm border border-pink-50">
        <h2 className="text-xl font-black text-gray-900 mb-6">Đánh giá sản phẩm</h2>
        
        {/* Rating Overview Box */}
        <div className="bg-[#fdf2f8] rounded-2xl p-6 border border-pink-100 flex flex-col md:flex-row items-center gap-6 mb-8">
          <div className="text-center md:border-r border-pink-100 md:pr-10">
            <p className="text-4xl font-black text-[#d53c83]">{fakeRating}</p>
            <div className="flex items-center gap-0.5 justify-center mt-2">
              {[...Array(5)].map((_, i) => {
                const isFilled = i < Math.floor(fakeRating);
                return (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${isFilled ? "text-amber-400 fill-amber-400" : "text-gray-200"}`}
                  />
                );
              })}
            </div>
            <p className="text-xs text-gray-500 mt-2">trên 5 sao ({fakeReviews} đánh giá)</p>
          </div>
          
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {["Tất cả", `5 Sao (${Math.round(fakeReviews * 0.85)})`, `4 Sao (${Math.round(fakeReviews * 0.15)})`, "Có hình ảnh/video"].map((filter, idx) => (
                <button
                  key={idx}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    idx === 0
                      ? "bg-[#d53c83] text-white border-transparent"
                      : "bg-white border-gray-100 text-gray-700 hover:border-pink-200 hover:bg-pink-50/30"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-6 divide-y divide-pink-50">
          {productReviews.map((review, idx) => (
            <div key={idx} className={`${idx > 0 ? "pt-6" : ""} flex gap-4`}>
              {/* User Avatar */}
              <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-600 font-black text-sm flex items-center justify-center flex-shrink-0">
                {review.name[0].toUpperCase()}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-gray-800">{review.name}</p>
                  <span className="text-[11px] text-gray-400 font-medium">{review.date}</span>
                </div>
                
                {/* Star rating for review */}
                <div className="flex items-center gap-0.5 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${i < review.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"}`}
                    />
                  ))}
                </div>
                
                {/* Variation details */}
                <p className="text-[11px] text-gray-400 mt-1 font-medium">Phân loại hàng: {review.variant}</p>
                
                {/* Comment text */}
                <p className="text-xs text-gray-600 mt-2.5 leading-relaxed font-medium">
                  {review.comment}
                </p>
                
                {/* Micro animation response from shop */}
                <div className="mt-3 bg-pink-50/50 border border-pink-100/30 rounded-xl p-3.5 text-xs text-gray-600">
                  <p className="font-bold text-[#d53c83] flex items-center gap-1">
                    <span>🎀 Phản Hồi Của Người Bán</span>
                  </p>
                  <p className="mt-1 leading-relaxed text-[11px]">
                    Tinori cảm ơn cậu iu rất nhiều vì đã tin tưởng lựa chọn và dành tặng đánh giá siêu ngọt ngào này cho tụi tớ ạ! Chúc cậu luôn rạng rỡ và tràn ngập niềm vui bên món quà nhỏ này nhaaa. Mãi iu cậu! 💕
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Products */}
      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-black text-gray-900 mb-6 text-center">Gợi ý cho bạn</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {product.relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                price={p.price}
                salePrice={p.salePrice}
                slug={p.slug}
                image={p.images?.find((img: any) => img.isPrimary)?.url || p.images[0]?.url}
                hasVariants={p.variants && p.variants.length > 0}
                variants={p.variants}
                fulfillmentType={p.fulfillmentType}
              />
            ))}
          </div>
        </div>
      )}

      {/* Back button */}
      <div className="mt-12 text-center">
        <Link href="/products">
          <Button variant="outline" className="rounded-full px-8 border-pink-200 text-pink-600 hover:bg-pink-50 hover:text-pink-700">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách
          </Button>
        </Link>
      </div>
    </div>
  );
}
