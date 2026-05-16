import Link from "next/link";
import { ArrowRight, Star, Truck, Shield, RefreshCw, ChevronRight } from "lucide-react";

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
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
        </div>
      </section>

      {/* ── Floating Features Bar ── */}
      <div className="max-w-5xl mx-auto px-4 relative z-20 -mt-14 mb-16">
        <div className="bg-white rounded-3xl shadow-xl border border-pink-50 p-6 md:p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: "Giao hàng toàn quốc", desc: "Nhanh chóng, an toàn" },
              { icon: Shield, title: "Quà tặng siu xinh", desc: "Mỗi đơn hàng 1 món quà" },
              { icon: RefreshCw, title: "Yên tâm lựa chọn", desc: "Luôn hỗ trợ cậu" },
              { icon: Star, title: "Ưu đãi mỗi ngày", desc: "Flash sale hàng ngày" },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="flex flex-col items-center text-center gap-3 group">
                  <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-pink-100 transition-all duration-300">
                    <Icon className="h-6 w-6 text-[#d53c83]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{feature.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{feature.desc}</p>
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
