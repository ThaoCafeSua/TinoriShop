import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star, Truck, Shield, RefreshCw, ChevronRight, Heart, Sparkles, Gift } from "lucide-react";

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
      <path d="M19 7h-3V5.5c0-1.93-1.57-3.5-3.5-3.5S9 3.57 9 5.5V7H6c-1.1 0-2 .9-2 2v9c0 1.66 1.34 3 3 3h10c1.66 0 3-1.34 3-3V9c0-1.1-.9-2-2-2zm-8.5-1.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5V7h-3V5.5zm8.5 12.5c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1V9h12v9z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M296 88v192c0 22-18 40-40 40s-40-18-40-40 18-40 40-40v-56c-53 0-96 43-96 96s43 96 96 96 96-43 96-96V198c25 15 54 24 85 24v-56c-44 0-82-28-95-68h-46z" fill="#00F2FE" transform="translate(-16, -16)"/>
      <path d="M296 88v192c0 22-18 40-40 40s-40-18-40-40 18-40 40-40v-56c-53 0-96 43-96 96s43 96 96 96 96-43 96-96V198c25 15 54 24 85 24v-56c-44 0-82-28-95-68h-46z" fill="#FE0050" transform="translate(16, 16)"/>
      <path d="M296 88v192c0 22-18 40-40 40s-40-18-40-40 18-40 40-40v-56c-53 0-96 43-96 96s43 96 96 96 96-43 96-96V198c25 15 54 24 85 24v-56c-44 0-82-28-95-68h-46z" fill="currentColor"/>
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
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
      where: { featured: true, active: true, productType: "STANDARD" },
      include: {
        images: { orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }], take: 2 },
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
      where: { active: true, productType: "STANDARD" },
      include: {
        images: { orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }], take: 2 },
        _count: { select: { variants: true } },
        variants: { where: { active: true } },
      },
      take: 8,
      orderBy: { createdAt: "desc" },
    });
  } catch { return []; }
}

async function getGiftBoxes() {
  try {
    return await prisma.product.findMany({
      where: { active: true, productType: "GIFT_BOX" },
      include: {
        images: { orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }], take: 2 },
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
  const [featuredProducts, latestProducts, giftBoxes, banners, posts, dbVouchers] = await Promise.all([
    getFeaturedProducts(),
    getLatestProducts(),
    getGiftBoxes(),
    getActiveBanners(),
    getLatestPosts(),
    getActiveVouchers(),
  ]);

  const vouchers = [
    {
      id: "hardcoded-freeship",
      code: "FREESHIP",
      discountType: "FREESHIP",
      discountValue: 30000,
      minOrderValue: 200000,
    },
    ...dbVouchers
  ];

  return (
    <div>
      <GlobalPopup />
      {/* ── Premium Hero Section ── */}
      <section className="relative pt-6 pb-20 bg-gradient-to-b from-[#fdf2f8] to-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="relative w-full animate-fade-in group rounded-3xl overflow-hidden ring-1 ring-pink-100/60">
            {banners.length > 0 ? (
              <BannerCarousel banners={banners as any} />
            ) : (
              <Image src="/brand/hero-banner.png" alt="Tinori Banner" width={1200} height={400} className="w-full h-auto object-cover transform hover:scale-[1.02] transition-transform duration-1000" />
            )}

            {/* Glassmorphism Buttons Container */}
            <div className="absolute bottom-[4%] left-1/2 -translate-x-1/2 flex flex-col sm:flex-row items-center justify-center gap-3 w-[90%] sm:w-auto p-3 rounded-2xl bg-white/30 backdrop-blur-md border border-white/40">
              <Link href="/products" className="w-full sm:w-auto">
                <Button size="lg" className="w-full hover:scale-105 font-bold transition-all rounded-xl" style={{ backgroundColor: "#d53c83", color: "#ffffff" }}>
                  Mua sắm ngay <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>

            </div>
          </div>


        </div>
      </section>

      {/* ── Shopping Journey Split ── */}
      <section className="max-w-5xl mx-auto px-4 -mt-6 mb-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Sản phẩm lẻ */}
          <Link href="/products" className="group relative overflow-hidden rounded-2xl h-[180px] sm:h-[200px] block">
            <div className="absolute inset-0 bg-gradient-to-br from-[#fff1f2] via-[#ffe4e6] to-[#fecdd3] transition-transform duration-700 group-hover:scale-105"></div>
            <div className="absolute inset-0 bg-[url('/brand/pattern-dots.png')] opacity-[0.04]"></div>
            <div className="relative h-full flex flex-col items-center justify-center text-center p-6">
              <h3 className="text-xl sm:text-2xl font-black text-[#9f1239] mb-1">Dành Riêng Cho Cậu</h3>
              <p className="text-xs sm:text-sm text-[#be123c] font-medium opacity-80">Những món phụ kiện nhỏ xinh xắn đang chờ bạn</p>
              <span className="mt-4 inline-block px-6 py-2 bg-white/60 backdrop-blur-sm text-[#9f1239] text-xs font-bold rounded-full shadow-sm group-hover:bg-white transition-colors">Ghé xem ngay</span>
            </div>
          </Link>
          {/* Gift Box */}
          <Link href="/products?type=gift-box" className="group relative overflow-hidden rounded-2xl h-[180px] sm:h-[200px] block">
            <div className="absolute inset-0 bg-gradient-to-br from-[#fdf2f8] via-[#fce7f3] to-[#fbcfe8] transition-transform duration-700 group-hover:scale-105"></div>
            <div className="absolute inset-0 bg-[url('/brand/pattern-dots.png')] opacity-[0.04]"></div>
            <div className="relative h-full flex flex-col items-center justify-center text-center p-6">
              <h3 className="text-xl sm:text-2xl font-black text-[#be185d] mb-1">Trao Gửi Yêu Thương</h3>
              <p className="text-xs sm:text-sm text-[#db2777] font-medium opacity-80">Hộp quà ngọt ngào gói ghém trọn vẹn tình cảm</p>
              <span className="mt-4 inline-block px-6 py-2 bg-white/60 backdrop-blur-sm text-[#be185d] text-xs font-bold rounded-full shadow-sm group-hover:bg-white transition-colors">Chọn quà nha</span>
            </div>
          </Link>
        </div>
      </section>

      {/* ── Elegant Responsive Brand Stats Bar ── */}
      <div className="max-w-md md:max-w-6xl mx-auto px-4 relative z-20 mb-12">
        <div className="bg-white rounded-3xl md:rounded-full border border-pink-100/80 p-6 md:py-3.5 md:px-4">
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
                desc: "200+ Đơn giao thành công",
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

      {/* ── Brand Trust & About Section ── */}
      <section className="max-w-7xl mx-auto px-4 pt-4 pb-12 md:pt-6 md:pb-16">
        <div className="text-center mb-12">
          <p className="text-[#d53c83] font-bold text-sm tracking-widest uppercase mb-2">TIỆM QUÀ TINORI</p>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center justify-center gap-2">
            Góc Xinh Xắn & Tràn Đầy Yêu Thương
          </h2>
          <div className="w-16 h-1 bg-[#d53c83] mx-auto mt-4 rounded-full opacity-60"></div>
          <p className="text-xs text-gray-500 mt-3 max-w-md mx-auto leading-relaxed">
            Nơi nâng niu những điều nhỏ bé lấp lánh để trao tặng niềm vui ngọt ngào nhất tới cậu mỗi ngày!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Cột 1: Ảnh Tiệm Decor Xinh Xắn */}
          <div className="relative rounded-3xl overflow-hidden shadow-md group min-h-[320px] lg:min-h-auto">
            <Image
              src="/brand/birthday.png"
              alt="Happy Birthday Tinori"
              width={600}
              height={800}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/10 to-transparent flex items-end p-6">
              <div>
                <span className="bg-[#d53c83] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                  Happy Birthday
                </span>
                <h3 className="text-[#d53c83] font-black text-lg mt-2 drop-shadow-sm">
                  Quà tặng Sinh nhật
                </h3>
              </div>
            </div>
          </div>

          {/* Cột 2: Cam kết ngọt ngào từ Trái Tim */}
          <div className="bg-[#fdf2f8]/70 border border-pink-100/50 rounded-3xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <div>
              <h3 className="text-lg font-black text-[#d53c83] mb-4">
                Girl Box Tinori
              </h3>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="w-8 h-8 bg-pink-100/60 rounded-full flex items-center justify-center shrink-0">
                    <Gift className="h-4 w-4 text-[#d53c83]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-gray-800 uppercase tracking-wider">Được Chọn Lựa Bằng Yêu Thương</h4>
                    <p className="text-[11px] text-gray-500 font-semibold leading-relaxed mt-0.5">
                      Những món quà nhỏ đều là tâm huyết mà Tinori gửi gắm trong từng hộp quà.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="w-8 h-8 bg-pink-100/60 rounded-full flex items-center justify-center shrink-0">
                    <Star className="h-4 w-4 text-[#d53c83]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-gray-800 uppercase tracking-wider">Dành Cho Người Quan Trọng</h4>
                    <p className="text-[11px] text-gray-500 font-semibold leading-relaxed mt-0.5">
                      Phù hợp cho những dịp đặc biệt và những người mà bạn luôn trân quý.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="w-8 h-8 bg-pink-100/60 rounded-full flex items-center justify-center shrink-0">
                    <Heart className="h-4 w-4 text-[#d53c83]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-gray-800 uppercase tracking-wider">Gửi Đi Một Chút Thân Thương</h4>
                    <p className="text-[11px] text-gray-500 font-semibold leading-relaxed mt-0.5">
                      Trao gửi những lời yêu thương, sự quan tâm và niềm vui qua từng món quà nhỏ.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="w-8 h-8 bg-pink-100/60 rounded-full flex items-center justify-center shrink-0">
                    <Truck className="h-4 w-4 text-[#d53c83]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-gray-800 uppercase tracking-wider">Ship nhanh & Chu đáo</h4>
                    <p className="text-[11px] text-gray-500 font-semibold leading-relaxed mt-0.5">
                      Hỗ trợ giao hàng hỏa tốc Hà Nội, đóng gói cẩn thận để món quà đến tay người nhận thật trọn vẹn.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="mt-6 border-t border-pink-100/50 pt-4 text-center">
              <span className="text-[10px] font-black text-[#d53c83]/80 uppercase tracking-wider bg-white px-4 py-1.5 rounded-full border border-pink-100/40 shadow-sm">
                ĐẶT CẢ TÌNH YÊU TRONG MỖI HỘP QUÀ
              </span>
            </div>
          </div>

          {/* Cột 3: Liên kết Mạng Xã Hội */}
          <div className="bg-gradient-to-tr from-white to-[#fff1f2] border border-pink-100/50 rounded-3xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <div>
              <h3 className="text-lg font-black text-[#d53c83] mb-4">
                Kết Nối Cộng Đồng
              </h3>
              <p className="text-[11px] text-gray-500 font-semibold leading-relaxed mb-6">
                Theo dõi Tinori trên các nền tảng mạng xã hội để cập nhật sản phẩm mới, bộ sưu tập dễ thương và những ưu đãi mới nhất nhé!
              </p>

              <div className="space-y-2">
                <a
                  href="https://www.facebook.com/tinori.official"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-white hover:bg-pink-50/50 rounded-2xl border border-pink-100/30 transition-all group shadow-sm hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#1877f2]/10 rounded-full flex items-center justify-center shrink-0">
                      <FacebookIcon className="h-5 w-5 text-[#1877f2]" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-xs font-black text-gray-800">Facebook Page</h4>
                      <p className="text-[10px] text-gray-400 font-bold">3k+ Follower • Ghé trang của shop</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-pink-300 group-hover:text-[#d53c83] transition-colors" />
                </a>

                <a
                  href="https://shopee.vn/tinori?entryPoint=ShopBySearch&searchKeyword=tinori"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-white hover:bg-pink-50/50 rounded-2xl border border-pink-100/30 transition-all group shadow-sm hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#ff5722]/10 rounded-full flex items-center justify-center shrink-0">
                      <ShopeeIcon className="h-5 w-5 text-[#ff5722]" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-xs font-black text-gray-800">Shopee Store</h4>
                      <p className="text-[10px] text-gray-400 font-bold">1k Follower • 200+ Đơn thành công</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-pink-300 group-hover:text-[#d53c83] transition-colors" />
                </a>

                <a
                  href="https://www.instagram.com/tinori.shop/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-white hover:bg-pink-50/50 rounded-2xl border border-pink-100/30 transition-all group shadow-sm hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#e1306c]/10 rounded-full flex items-center justify-center shrink-0">
                      <InstagramIcon className="h-5 w-5 text-[#e1306c]" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-xs font-black text-gray-800">Instagram Shop</h4>
                      <p className="text-[10px] text-gray-400 font-bold">Hình ảnh & Vibe ngọt ngào</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-pink-300 group-hover:text-[#d53c83] transition-colors" />
                </a>

                <a
                  href="https://www.tiktok.com/@tinori.shop"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-white hover:bg-pink-50/50 rounded-2xl border border-pink-100/30 transition-all group shadow-sm hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-black/5 rounded-full flex items-center justify-center shrink-0">
                      <TikTokIcon className="h-5 w-5 text-gray-900" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-xs font-black text-gray-800">TikTok Shop</h4>
                      <p className="text-[10px] text-gray-400 font-bold">Video phụ kiện dễ thương</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-pink-300 group-hover:text-[#d53c83] transition-colors" />
                </a>
              </div>
            </div>

            <div className="mt-6 text-center text-[10px] text-pink-400 font-bold tracking-widest">
              @TINORISHOP_2026
            </div>
          </div>
        </div>
      </section>

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
                hoverImage={product.images[1]?.url}
                slug={product.slug}
                hasVariants={product._count?.variants > 0}
                variants={product.variants}
                stock={product.stock}
                fulfillmentType={product.fulfillmentType}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Gift Box Section ── */}
      {giftBoxes.length > 0 && (
        <section className="py-8 my-4">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-10">
              <p className="text-[#d53c83] font-bold text-sm tracking-widest uppercase mb-2">GIFT COLLECTION</p>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                Hộp Quà Yêu Thương
              </h2>
              <div className="w-16 h-1 bg-[#d53c83] mx-auto mt-4 rounded-full opacity-60"></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {giftBoxes.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  salePrice={product.salePrice}
                  image={product.images[0]?.url}
                  hoverImage={product.images[1]?.url}
                  slug={product.slug}
                  hasVariants={product._count?.variants > 0}
                  variants={product.variants}
                  stock={product.stock}
                  fulfillmentType={product.fulfillmentType}
                />
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/products?type=gift-box">
                <Button variant="ghost" className="text-[#d53c83] hover:text-pink-600 hover:bg-pink-50/80 font-bold text-sm px-6 py-2.5 rounded-full border border-pink-200/60">
                  Xem tất cả Gift Box <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}



      {/* ── Latest Products ── */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <p className="text-[#d53c83] font-bold text-sm tracking-widest uppercase mb-2">NEW ARRIVALS</p>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Sản Phẩm Mới Nhất</h2>
          <div className="w-12 h-1 bg-[#d53c83] mx-auto mt-4 rounded-full opacity-60"></div>
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
                hoverImage={product.images[1]?.url}
                slug={product.slug}
                hasVariants={product._count?.variants > 0}
                variants={product.variants}
                stock={product.stock}
                fulfillmentType={product.fulfillmentType}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl">
            <div className="text-pink-100 mb-4 font-black text-6xl">SHOP</div>
            <h3 className="text-xl font-bold mb-2" style={{ color: "#9a7182" }}>Sắp có sản phẩm mới!</h3>
          </div>
        )}

        {latestProducts.length > 0 && (
          <div className="text-center mt-8">
            <Link href="/products">
              <Button variant="ghost" className="text-[#d53c83] hover:text-pink-600 hover:bg-pink-50/80 font-bold text-sm px-6 py-2.5 rounded-full border border-pink-200/60">
                Xem tất cả sản phẩm <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        )}
      </section>

      {/* ── Customer Chat Feedback Section ── */}
      <section className="max-w-7xl mx-auto px-4 py-12 bg-gradient-to-b from-white to-[#fdf2f8] rounded-3xl my-10 border border-pink-50/50 shadow-sm">
        <div className="text-center mb-10">
          <p className="text-[#d53c83] font-bold text-sm tracking-widest uppercase mb-2">FEEDBACK & LOVE</p>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center justify-center gap-2">
            Khách Yêu Nói Gì Về Tinori? <span className="animate-bounce"></span>
          </h2>
          <div className="w-16 h-1 bg-[#d53c83] mx-auto mt-4 rounded-full opacity-60"></div>
          <p className="text-xs text-gray-500 mt-3 max-w-md mx-auto leading-relaxed">
            Những tin nhắn siêu ngọt ngào là động lực to lớn nhất để Tinori hoàn thiện mỗi ngày. Cảm ơn cậu đã tin tưởng! 
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
                    <Image
                      src={post.image}
                      alt={post.title}
                      width={400}
                      height={300}
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
