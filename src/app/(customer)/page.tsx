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
import LogoImage from "@/components/LogoImage";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import BannerCarousel from "@/components/BannerCarousel";
import VoucherCard from "@/components/VoucherCard";

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
    <div className="bg-kawaii-dots min-h-screen pb-10">
      {/* ── Hero: Logo + tagline + 2 buttons ── */}
      <section className="relative overflow-hidden border-b-4 border-pink-200 bg-white/80 backdrop-blur-sm rounded-b-[3rem] shadow-sm mb-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col items-center text-center" style={{ paddingTop: '20px', paddingBottom: '30px' }}>
          <div className="relative w-full animate-fade-in group">
            {/* Logo */}
            <div className="w-full">
              <LogoImage />
            </div>

            {/* Buttons Below Logo */}
            <div className="mt-[-20px] mb-4 flex flex-col sm:flex-row items-center justify-center gap-4 px-4 relative z-10">
              <Link href="/products">
                <Button
                  size="lg"
                  className="hover:scale-105 shadow-xl hover:shadow-2xl border-none font-bold transition-all duration-300 px-10"
                  style={{ backgroundColor: "#d53c83", color: "#ffffff" }}
                >
                  Mua sắm ngay <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <a href="https://www.facebook.com/tinori.official" target="_blank" rel="noopener noreferrer">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white hover:bg-[#f2d5e0]/20 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl font-bold"
                  style={{ color: "#d53c83", borderColor: "#d53c83", borderWidth: "2px" }}
                >
                  <FacebookIcon className="h-5 w-5" />
                  Theo dõi Facebook
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>



      {/* ── Features bar ── */}
      <section className="py-8 mx-4 my-8 kawaii-border bg-white/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: "Giao hàng toàn quốc", desc: "Nhanh chóng, an toàn" },
              { icon: Shield, title: "Quà tặng siu xinh", desc: "Mỗi đơn hàng 1 món quà" },
              { icon: RefreshCw, title: "Yên tâm lựa chọn", desc: "Luôn hỗ trợ cậu" },
              { icon: Star, title: "Ưu đãi mỗi ngày", desc: "Flash sale hàng ngày" },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Icon className="h-5 w-5" style={{ color: "#9a7182" }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: "#d53c83" }}>{feature.title}</p>
                    <p className="text-xs" style={{ color: "#d53c83", opacity: 0.8 }}>{feature.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Voucher Section ── */}
      {vouchers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8 relative">
          <div className="absolute top-4 right-10 text-pink-300 opacity-50 text-4xl animate-bounce">✨</div>
          <div className="flex flex-col items-center justify-center mb-8 text-center">
            <span className="text-pink-400 font-black tracking-widest text-xs uppercase mb-1">Ưu đãi siêu hot</span>
            <h2 className="text-3xl font-black text-[#d53c83] bg-pink-50 px-8 py-2 rounded-full border-2 border-pink-200 shadow-sm inline-block">Mã giảm giá</h2>
            <p className="text-gray-500 text-sm mt-3 font-medium">Áp mã khi thanh toán để nhận ưu đãi siêu hời nha~</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {vouchers.map((v) => (
              <VoucherCard key={v.id} voucher={v as any} />
            ))}
          </div>
        </section>
      )}



      {/* ── Featured Products ── */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12 relative">
          <div className="absolute top-10 left-10 text-pink-300 opacity-50 text-3xl animate-pulse">🌸</div>
          <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 bg-white/60 p-4 rounded-3xl border-2 border-pink-100">
            <div className="text-center sm:text-left flex-1">
              <span className="text-pink-400 font-black tracking-widest text-xs uppercase mb-1 block">Gợi ý cho bạn</span>
              <h2 className="text-3xl font-black text-[#d53c83]">Sản phẩm nổi bật</h2>
              <p className="text-gray-500 text-sm mt-1">Được các bạn yêu thích nhất đó!</p>
            </div>
            <Link href="/products?featured=true">
              <Button variant="outline" className="rounded-full border-pink-200 text-pink-600 hover:bg-pink-50 font-bold px-6">
                Xem thêm <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
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

      {/* ── Banner Carousel ── */}
      {banners.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 py-8">
          <div className="rounded-[2.5rem] overflow-hidden shadow-xl border-4 border-white">
            <BannerCarousel banners={banners} />
          </div>
        </section>
      )}

      {/* ── Latest Products ── */}
      <section className="max-w-7xl mx-auto px-4 py-12 relative">
        <div className="absolute -top-4 right-20 text-pink-300 opacity-50 text-4xl animate-bounce" style={{ animationDelay: '0.5s' }}>⭐</div>
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 bg-white/60 p-4 rounded-3xl border-2 border-pink-100">
          <div className="text-center sm:text-left flex-1">
            <span className="text-pink-400 font-black tracking-widest text-xs uppercase mb-1 block">Hàng mới về</span>
            <h2 className="text-3xl font-black text-[#d53c83]">Sản phẩm mới nhất</h2>
            <p className="text-gray-500 text-sm mt-1">Vừa cập nhật nóng hổi luôn nè~</p>
          </div>
          <Link href="/products">
            <Button variant="outline" className="rounded-full border-pink-200 text-pink-600 hover:bg-pink-50 font-bold px-6">
              Tất cả sản phẩm <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
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
            <p className="text-gray-500 mb-6">Theo dõi fanpage để không bỏ lỡ sản phẩm mới nhất</p>
            <a href="https://www.facebook.com/tinori.official" target="_blank" rel="noopener noreferrer">
              <Button><FacebookIcon className="h-5 w-5" /> Theo dõi Fanpage</Button>
            </a>
          </div>
        )}
      </section>

      {/* ── News / Blog Section ── */}
      {posts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16 relative">
          <div className="absolute top-10 right-1/4 text-pink-300 opacity-50 text-3xl animate-pulse">☁️</div>
          <div className="flex flex-col items-center justify-center mb-10 text-center">
            <span className="text-pink-400 font-black tracking-widest text-xs uppercase mb-1">Cập nhật mới nhất</span>
            <h2 className="text-3xl font-black text-[#d53c83] bg-white px-8 py-2 rounded-[2rem] border-4 border-pink-100 shadow-sm inline-block">Tin tức &amp; Sự kiện</h2>
            <p className="text-gray-500 text-sm mt-3 font-medium">Những điều xinh xắn mới nhất từ Tinori</p>
            <Link href="/news" className="mt-4">
              <Button variant="outline" className="rounded-full border-pink-200 text-pink-600 hover:bg-pink-50 font-bold px-6">
                Xem tất cả <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link key={post.id} href={`/news/${post.id}`} className="group bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-pink-100 hover:border-pink-300">
                {post.image ? (
                  <div className="aspect-video overflow-hidden relative">
                    <div className="absolute inset-0 bg-pink-200/20 group-hover:bg-transparent transition-colors z-10" />
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-kawaii-grid flex items-center justify-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-pink-400 font-bold shadow-sm border border-pink-100">News</div>
                  </div>
                )}
                <div className="p-5">
                  <p className="text-xs text-white bg-pink-400 inline-block px-3 py-1 rounded-full mb-3 font-bold shadow-sm">
                    {new Date(post.createdAt).toLocaleDateString("vi-VN", { day: "numeric", month: "long", year: "numeric" })}
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

      {/* ── Social CTA ── */}
      <section className="relative py-12 my-8 overflow-hidden">
        <div className="absolute inset-0 bg-[#f2d5e0]" />
        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-black mb-3 text-[#d53c83] tracking-tight">
            Ghé thăm "nhà" của Tinori
          </h2>
          <p className="text-[#9a7182] text-sm font-medium mb-8 max-w-xl mx-auto leading-relaxed">
            Đừng bỏ lỡ những món đồ xinh xắn và các chương trình ưu đãi độc quyền từ chúng mình nhé!
          </p>
          <div className="flex justify-center gap-6 md:gap-10">
            <a href="https://www.facebook.com/tinori.official" target="_blank" rel="noopener noreferrer" title="Facebook">
              <div className="w-14 h-14 bg-white text-[#1877F2] rounded-full shadow-md flex items-center justify-center hover:scale-110 hover:shadow-xl transition-all duration-300">
                <FacebookIcon className="h-7 w-7" />
              </div>
            </a>
            <a href="https://www.instagram.com/tinori.shop/" target="_blank" rel="noopener noreferrer" title="Instagram">
              <div className="w-14 h-14 bg-white text-[#ee2a7b] rounded-full shadow-md flex items-center justify-center hover:scale-110 hover:shadow-xl transition-all duration-300">
                <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </div>
            </a>
            <a href="https://shopee.vn/tinori?entryPoint=ShopBySearch&searchKeyword=tinori" target="_blank" rel="noopener noreferrer" title="Shopee">
              <div className="w-14 h-14 bg-white rounded-full shadow-md flex items-center justify-center hover:scale-110 hover:shadow-xl transition-all duration-300">
                <img src="https://static.vecteezy.com/system/resources/previews/011/618/138/non_2x/shopee-element-symbol-shopee-food-shopee-icon-free-vector.jpg" alt="Shopee" className="h-7 w-7 object-contain" />
              </div>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
