import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { Filter, SlidersHorizontal } from "lucide-react";

interface SearchParams {
  category?: string;
  q?: string;
  sort?: string;
  featured?: string;
}

async function getProducts(searchParams: SearchParams) {
  try {
    const where: Record<string, unknown> = { active: true };

    if (searchParams.category) {
      where.category = { slug: searchParams.category };
    }
    if (searchParams.featured === "true") {
      where.featured = true;
    }
    if (searchParams.q) {
      where.name = { contains: searchParams.q };
    }

    const orderBy: Record<string, string> = {};
    if (searchParams.sort === "price_asc") orderBy.price = "asc";
    else if (searchParams.sort === "price_desc") orderBy.price = "desc";
    else orderBy.createdAt = "desc";

    return await prisma.product.findMany({
      where,
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        category: true,
      },
      orderBy,
      take: 48,
    });
  } catch {
    return [];
  }
}

async function getCategories() {
  try {
    return await prisma.category.findMany();
  } catch {
    return [];
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const [products, categories] = await Promise.all([
    getProducts(params),
    getCategories(),
  ]);

  const activeCategory = params.category;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">
          {params.q
            ? `Kết quả tìm kiếm: "${params.q}"`
            : params.category
            ? categories.find((c) => c.slug === params.category)?.name ||
              "Sản phẩm"
            : params.featured
            ? "Sản phẩm nổi bật"
            : "Tất cả sản phẩm"}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {products.length} sản phẩm
        </p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="hidden lg:block w-52 flex-shrink-0">
          <div className="bg-white rounded-2xl p-4 shadow-sm sticky top-20">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Danh mục
            </h3>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/products"
                  className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                    !activeCategory
                      ? "bg-purple-100 text-purple-700 font-semibold"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Tất cả sản phẩm
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/products?category=${cat.slug}`}
                    className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeCategory === cat.slug
                        ? "bg-purple-100 text-purple-700 font-semibold"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="flex-1">
          {/* Sort & Filter bar */}
          <div className="flex items-center justify-between mb-4 bg-white rounded-xl px-4 py-3 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <SlidersHorizontal className="h-4 w-4" />
              <span>Sắp xếp theo:</span>
            </div>
            <div className="flex gap-2">
              {[
                { value: "", label: "Mới nhất" },
                { value: "price_asc", label: "Giá tăng dần" },
                { value: "price_desc", label: "Giá giảm dần" },
              ].map((opt) => (
                <Link
                  key={opt.value}
                  href={{
                    pathname: "/products",
                    query: {
                      ...(activeCategory && { category: activeCategory }),
                      ...(params.q && { q: params.q }),
                      ...(opt.value && { sort: opt.value }),
                    },
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    (params.sort || "") === opt.value
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {opt.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile categories */}
          {categories.length > 0 && (
            <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
              <Link
                href="/products"
                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
                  !activeCategory
                    ? "bg-purple-600 text-white"
                    : "bg-white text-gray-600 shadow-sm"
                }`}
              >
                Tất cả
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
                    activeCategory === cat.slug
                      ? "bg-purple-600 text-white"
                      : "bg-white text-gray-600 shadow-sm"
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}

          {products.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                Không tìm thấy sản phẩm
              </h3>
              <p className="text-gray-500">
                Thử tìm kiếm với từ khóa khác hoặc xem tất cả sản phẩm
              </p>
              <Link href="/products">
                <button className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700">
                  Xem tất cả
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  salePrice={product.salePrice}
                  image={product.images[0]?.url}
                  slug={product.slug}
                  category={product.category?.name}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
