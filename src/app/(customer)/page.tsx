import Link from "next/link";
import { ArrowRight, Star, Truck, Shield, RefreshCw } from "lucide-react";

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

async function getFeaturedProducts() {
  try {
    return await prisma.product.findMany({
      where: { featured: true, active: true },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        _count: { select: { variants: true } },
      },
      take: 8,
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}



async function getLatestProducts() {
  try {
    return await prisma.product.findMany({
      where: { active: true },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        _count: { select: { variants: true } },
      },
      take: 8,
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [featuredProducts, latestProducts] = await Promise.all([
    getFeaturedProducts(),
    getLatestProducts(),
  ]);

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative bg-white text-gray-900 border-b border-gray-100 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-300 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-20 flex flex-col items-center text-center">
          {/* <div className="inline-flex items-center gap-2 bg-white/30 rounded-full px-4 py-2 text-sm font-medium mb-6">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            Shop thời trang uy tín #1
          </div> */}
          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
            TINORI<br />
            {/* <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-500">
              Phụ Kiện
            </span> */}
            {/* <br /> */}
            {/* <span className="text-3xl md:text-5xl">TINORI</span> */}
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-md">
            Cảm ơn cậu đã ghé thăm — nơi những điều xinh đẹp được nâng niu.
            Mỗi sản phẩm là một tâm huyết nhỏ xinh mình gửi gắm.
            Chúc cậu tìm được món quà dành riêng cho mình nhé ✨
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/products">
              <Button
                size="lg"
                className="bg-pink-600 text-white hover:bg-pink-700 shadow-lg shadow-pink-100"
              >
                Mua sắm ngay
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <a
              href="https://www.facebook.com/tinori.official"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                variant="outline"
                className="border-gray-200 text-gray-700 hover:bg-gray-50 bg-white"
              >
                <FacebookIcon className="h-5 w-5" />
                Theo dõi Facebook
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-8 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                icon: Truck,
                title: "Giao hàng toàn quốc",
                desc: "Nhanh chóng, an toàn",
                color: "text-pink-600",
                bg: "bg-pink-50",
              },
              {
                icon: Shield,
                title: "Bảo đảm chất lượng",
                desc: "Hàng chính hãng 100%",
                color: "text-green-600",
                bg: "bg-green-50",
              },
              {
                icon: RefreshCw,
                title: "Đổi trả dễ dàng",
                desc: "Trong 7 ngày",
                color: "text-blue-600",
                bg: "bg-blue-50",
              },
              {
                icon: Star,
                title: "Ưu đãi mỗi ngày",
                desc: "Flash sale hàng ngày",
                color: "text-yellow-600",
                bg: "bg-yellow-50",
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 ${feature.bg} rounded-xl flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon className={`h-5 w-5 ${feature.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{feature.title}</p>
                    <p className="text-xs text-gray-500">{feature.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>



      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-gray-900">Sản phẩm nổi bật</h2>
              <p className="text-gray-500 text-sm">Được yêu thích nhất</p>
            </div>
            <Link href="/products?featured=true">
              <Button variant="outline" size="sm">
                Xem thêm <ArrowRight className="h-4 w-4" />
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
              />
            ))}
          </div>
        </section>
      )}

      {/* Latest Products */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-gray-900">Sản phẩm mới nhất</h2>
            <p className="text-gray-500 text-sm">Vừa cập nhật</p>
          </div>
          <Link href="/products">
            <Button variant="outline" size="sm">
              Tất cả sản phẩm <ArrowRight className="h-4 w-4" />
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
                category={product.category?.name}
                hasVariants={product._count?.variants > 0}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl">
            <div className="text-6xl mb-4">🛍️</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              Sắp có sản phẩm mới!
            </h3>
            <p className="text-gray-500 mb-6">
              Theo dõi fanpage để không bỏ lỡ sản phẩm mới nhất
            </p>
            <a
              href="https://www.facebook.com/tinori.official"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button>
                <FacebookIcon className="h-5 w-5" />
                Theo dõi Fanpage
              </Button>
            </a>
          </div>
        )}
      </section>

      {/* CTA Banner */}
      <section className="bg-gradient-to-r from-pink-400 to-rose-400 text-white py-12 my-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black mb-4">
            Theo dõi Tinori trên Facebook
          </h2>
          <p className="text-white/80 mb-6">
            Cập nhật sản phẩm mới, ưu đãi độc quyền và flash sale mỗi ngày
          </p>
          <a
            href="https://www.facebook.com/tinori.official"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="bg-white text-pink-700 hover:bg-pink-50" size="lg">
              <FacebookIcon className="h-5 w-5" />
              Theo dõi ngay
            </Button>
          </a>
        </div>
      </section>
    </div>
  );
}
