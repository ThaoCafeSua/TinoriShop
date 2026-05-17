import Link from "next/link";
import { ArrowRight, Star, Truck, Shield, RefreshCw, ChevronRight } from "lucide-react";

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  );
}

function ShopeeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 7h-3V5.5c0-1.93-1.57-3.5-3.5-3.5S9 3.57 9 5.5V7H6c-1.1 0-2 .9-2 2v9c0 1.66 1.34 3 3 3h10c1.66 0 3-1.34 3-3V9c0-1.1-.9-2-2-2zm-8.5-1.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5V7h-3V5.5zm8.5 12.5c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1V9h12v9z"/>
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12.525.02c1.31 0 2.57.34 3.68.95.07.04.14.08.2.13.06.04.13.09.19.14v3.91c-.9-.45-1.9-.71-2.97-.71-1.07 0-2.07.26-2.97.71V17.5c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4c.48 0 .94.09 1.36.25V9.66c-.44-.1-.9-.16-1.36-.16-3.87 0-7 3.13-7 7s3.13 7 7 7 7-3.13 7-7v-9.35c1.68 1.15 3.7 1.85 5.89 1.85V1c-2.48 0-4.66-1.15-6.09-2.95-.08-.1-.16-.21-.24-.31-.05-.07-.09-.15-.14-.22z"/>
    </svg>
  );
}

import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import VoucherCard from "@/components/VoucherCard";
import GlobalPopup from "@/components/GlobalPopup";
import BannerCarousel from "@/components/BannerCarousel";
import FeedbackCarousel from "@/components/FeedbackCarousel";

export const dynamic = "force-dynamic";

async function getFeaturedProducts() {
  try {
    return await prisma.product.findMany({
      where: { featured: true, active: true },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        _count: { select: { variants: true } },
        variants: { where: { active: true } },
      },
      take: 8,
      orderBy: { createdAt: "desc" },
    });
  } catch { return []; }
}

async function getLatestProducts() {
  try {
    return await prisma.product.findMany({
      where: { active: true },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        _count: { select: { variants: true } },
        variants: { where: { active: true } },
      },
      take: 8,
      orderBy: { createdAt: "desc" },
    });
  } catch { return []; }
}

async function getActiveBanners() {
  try {
    return await prisma.banner.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    });
  } catch { return []; }
}

async function getLatestPosts() {
  try {
    return await prisma.blogPost.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    });
  } catch { return []; }
}

async function getActiveVouchers() {
  try {
    const now = new Date();
    return await prisma.voucher.findMany({
      where: {
        active: true,
        startDate: { lte: now },
        OR: [
          { endDate: null },
          { endDate: { gte: now } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    });
  } catch { return []; }
}

export default async function HomePage() {
  const [featuredProducts, latestProducts, banners, posts, vouchers] = await Promise.all([
    getFeaturedProducts(),
    getLatestProducts(),
    getActiveBanners(),
    getLatestPosts(),
    getActiveVouchers(),
  ]);

  return (
    <div>
      <GlobalPopup />
      {/* ── Premium Hero Section ── */}
      <section className="relative pt-6 pb-20 bg-gradient-to-b from-[#fdf2f8] to-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="relative w-full animate-fade-in group rounded-3xl overflow-hidden shadow-2xl ring-1 ring-pink-100">
            {banners.length > 0 ? (
              <BannerCarousel banners={banners as any} />
            ) : (
              <img src="/brand/hero-banner.png" alt="Tinori Banner" className="w-full h-auto object-cover transform hover:scale-[1.02] transition-transform duration-1000" />
            )}
            
            {/* Glassmorphism Buttons Container */}
            <div className="absolute bottom-[4%] left-1/2 -translate-x-1/2 flex flex-col sm:flex-row items-center justify-center gap-3 w-[90%] sm:w-auto p-3 rounded-2xl bg-white/30 backdrop-blur-md border border-white/40 shadow-lg">
              <Link href="/products" className="w-full sm:w-auto">
                <Button size="lg" className="w-full shadow-lg hover:shadow-pink-300/50 hover:scale-105 font-bold transition-all rounded-xl" style={{ backgroundColor: "#d53c83", color: "#ffffff" }}>
                  Mua sắm ngay <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>

            </div>
          </div>

          {/* Brand Slogan Section */}
          <div className="mt-12 text-center animate-fade-in px-4">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight" style={{ color: '#d53c83', fontFamily: '"Sugo Display", sans-serif' }}>
              TINORI
            </h1>
            <p className="mt-3.5 text-lg md:text-2xl font-black text-gray-800 italic relative inline-block">
              "Nơi những điều xinh đẹp được nâng niu" 🎀
              <span className="absolute -bottom-1 left-0 w-full h-1 bg-[#f2d5e0] -z-10 rounded-full"></span>
            </p>
            <p className="mt-4 text-xs md:text-sm text-gray-500 max-w-2xl mx-auto leading-relaxed font-medium">
              Chào mừng cậu đến với thế giới phụ kiện, quà tặng Kawaii Nhật Bản ngọt ngào của Tinori! Mỗi món đồ nhỏ bé tại đây đều được chúng tớ lựa chọn với tất cả tình yêu thương, hi vọng sẽ mang lại niềm vui lấp lánh và nụ cười rạng rỡ cho cậu mỗi ngày. 💕
            </p>
          </div>
        </div>
      </section>

      {/* ── Elegant Responsive Brand Stats Bar ── */}
      <div className="max-w-md md:max-w-6xl mx-auto px-4 relative z-20 -mt-10 mb-16">
        <div className="bg-white rounded-3xl md:rounded-full shadow-lg border border-pink-100/40 p-6 md:py-3.5 md:px-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-0 items-center">
            {[
              {
                icon: FacebookIcon,
                title: "3k+ Follower",
                desc: "Facebook chính thức",
                color: "text-[#1877f2]"
              },
              {
                icon: ShopeeIcon,
                title: "1k Follower",
                desc: "Shopee Store chính hãng",
                color: "text-[#ff5722]"
              },
              {
                icon: Shield,
                title: "200+ Đơn Hàng",
                desc: "Đã giao thành công",
                color: "text-[#d53c83]"
              },
              {
                icon: Truck,
                title: "Giao Hàng 64 Tỉnh",
                desc: "Ship nhanh toàn quốc",
                color: "text-amber-600"
              },
              {
                icon: Star,
                title: "Voucher Giảm 50%",
                desc: "Ưu đãi khách mới",
                color: "text-emerald-600"
              }
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={i} 
                  className="flex items-center gap-3 pb-3.5 border-b border-pink-50/40 last:border-b-0 last:pb-0 md:pb-0 md:border-b-0 md:border-r md:border-pink-50/60 md:px-3 md:last:border-r-0 md:justify-center group"
                >
                  <div className="w-10 h-10 bg-pink-50/50 rounded-full flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-sm font-black text-gray-800 leading-tight md:text-xs lg:text-sm">
                      {stat.title}
                    </p>
                    <p className="text-[11px] text-gray-400 font-semibold mt-0.5 md:text-[10px]">
                      {stat.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Voucher Section ── */}
      {vouchers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center mb-10">
            <p className="text-[#d53c83] font-bold text-sm tracking-widest uppercase mb-2">HOT DEALS</p>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Mã Giảm Giá</h2>
            <div className="w-12 h-1 bg-[#d53c83] mx-auto mt-4 rounded-full opacity-60"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {vouchers.map((v) => (
              <VoucherCard key={v.id} voucher={v as any} />
            ))}
          </div>
        </section>
      )}


      {/* ── Featured Products ── */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center mb-10">
            <p className="text-[#d53c83] font-bold text-sm tracking-widest uppercase mb-2">TRENDING</p>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Sản Phẩm Nổi Bật</h2>
            <div className="w-12 h-1 bg-[#d53c83] mx-auto mt-4 rounded-full opacity-60"></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                salePrice={product.salePrice}
                image={product.images[0]?.url}
                slug={product.slug}
                hasVariants={product._count?.variants > 0}
                variants={product.variants}
                stock={product.stock}
              />
            ))}
          </div>
        </section>
      )}



      {/* ── Latest Products ── */}
      <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center mb-10 relative">
            <p className="text-[#d53c83] font-bold text-sm tracking-widest uppercase mb-2">NEW ARRIVALS</p>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Sản Phẩm Mới Nhất</h2>
            <div className="w-12 h-1 bg-[#d53c83] mx-auto mt-4 rounded-full opacity-60"></div>
            <div className="absolute right-0 bottom-0 hidden md:block">
              <Link href="/products">
                <Button variant="ghost" className="text-pink-500 hover:text-pink-600 hover:bg-pink-50 font-medium">
                  Tất cả sản phẩm <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        {latestProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {latestProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                salePrice={product.salePrice}
                image={product.images[0]?.url}
                slug={product.slug}
                hasVariants={product._count?.variants > 0}
                variants={product.variants}
                stock={product.stock}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl">
            <div className="text-pink-100 mb-4 font-black text-6xl">SHOP</div>
            <h3 className="text-xl font-bold mb-2" style={{ color: "#9a7182" }}>Sắp có sản phẩm mới!</h3>
          </div>
        )}
      </section>

      {/* ── Customer Chat Feedback Section ── */}
      <section className="max-w-7xl mx-auto px-4 py-12 bg-gradient-to-b from-white to-[#fdf2f8] rounded-3xl my-10 border border-pink-50/50 shadow-sm">
        <div className="text-center mb-10">
          <p className="text-[#d53c83] font-bold text-sm tracking-widest uppercase mb-2">FEEDBACK & LOVE</p>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center justify-center gap-2">
            Khách Yêu Nói Gì Về Tinori? <span className="animate-bounce">💬</span>
          </h2>
          <div className="w-16 h-1 bg-[#d53c83] mx-auto mt-4 rounded-full opacity-60"></div>
          <p className="text-xs text-gray-500 mt-3 max-w-md mx-auto leading-relaxed">
            Những tin nhắn siêu ngọt ngào là động lực to lớn nhất để Tinori hoàn thiện mỗi ngày. Cảm ơn cậu đã tin tưởng! 💕
          </p>
        </div>

        <FeedbackCarousel />
      </section>

      {/* ── News / Blog Section ── */}
      {posts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-10">
          <div className="text-center mb-10">
            <p className="text-[#d53c83] font-bold text-sm tracking-widest uppercase mb-2">TINORI'S DIARY</p>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Tin Tức & Sự Kiện</h2>
            <div className="w-12 h-1 bg-[#d53c83] mx-auto mt-4 rounded-full opacity-60"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map((post) => (
              <Link key={post.id} href={`/news/${post.id}`} className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-pink-50">
                {post.image ? (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-pink-50 to-rose-100 flex items-center justify-center">
                    <div className="w-16 h-16 bg-pink-200/50 rounded-full flex items-center justify-center text-pink-400 font-bold">News</div>
                  </div>
                )}
                <div className="p-4">
                  <p className="text-xs text-pink-400 mb-2 font-medium">
                    {new Date(post.createdAt).toLocaleDateString("vi-VN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Ho_Chi_Minh" })}
                  </p>
                  <h3 className="font-bold text-gray-800 mb-2 leading-tight line-clamp-2 group-hover:text-pink-600 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed">{post.content}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}


    </div>
  );
}
