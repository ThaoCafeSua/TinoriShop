import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { Filter, SlidersHorizontal } from "lucide-react";

export const dynamic = "force-dynamic";

interface SearchParams {
  category?: string;
  q?: string;
  sort?: string;
  featured?: string;
  type?: string;
  page?: string;
  availability?: string;
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
    if (searchParams.type === "gift-box") {
      where.productType = "GIFT_BOX";
    } else if (!searchParams.type || searchParams.type === "san-pham") {
      where.productType = "STANDARD";
    }
    if (searchParams.q) {
      where.name = { contains: searchParams.q };
    }

    if (searchParams.availability === "in_stock") {
      where.fulfillmentType = "in_stock";
    } else if (searchParams.availability === "preorder") {
      where.fulfillmentType = "preorder";
    }

    const orderBy: Record<string, string> = {};
    if (searchParams.sort === "price_asc") orderBy.price = "asc";
    else if (searchParams.sort === "price_desc") orderBy.price = "desc";
    else orderBy.createdAt = "desc";

    const page = Number(searchParams.page) || 1;
    const limit = 16;
    const skip = (page - 1) * limit;

    const totalCount = await prisma.product.count({ where });

    const products = await prisma.product.findMany({
      where,
      include: {
        images: { orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }], take: 2 },
        category: true,
        _count: { select: { variants: true } },
        variants: {
          where: { active: true },
        },
      },
      orderBy,
      skip,
      take: limit,
    });

    return { products, totalCount, totalPages: Math.ceil(totalCount / limit) };
  } catch {
    return { products: [], totalCount: 0, totalPages: 0 };
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
  const { products, totalCount, totalPages } = await getProducts(params);
  const currentPage = Number(params.page) || 1;

  const activeCategory = params.category;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">
          {params.q
            ? `Kết quả tìm kiếm: "${params.q}"`
            : params.featured
            ? "Sản phẩm nổi bật"
            : params.type === "gift-box"
            ? "Hộp Quà Tặng"
            : "Tất cả sản phẩm"}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {totalCount} sản phẩm
        </p>
      </div>

      {/* Product Type Tabs */}
      {!params.q && !params.featured && (
        <div className="flex gap-2 mb-6">
          <Link
            href={{ query: { type: "san-pham" } }}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
              !params.type || params.type === "san-pham"
                ? "bg-[#d53c83] text-white shadow-md shadow-pink-200"
                : "bg-white text-gray-500 border border-gray-200 hover:border-pink-200 hover:text-[#d53c83]"
            }`}
          >
            Sản phẩm
          </Link>
          <Link
            href={{ query: { type: "gift-box" } }}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
              params.type === "gift-box"
                ? "bg-[#d53c83] text-white shadow-md shadow-pink-200"
                : "bg-white text-gray-500 border border-gray-200 hover:border-pink-200 hover:text-[#d53c83]"
            }`}
          >
            Hộp Quà Tặng
          </Link>
        </div>
      )}

      <div className="flex gap-6">


        <div className="flex-1 min-w-0">
          {/* Sort & Filter bar */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 bg-white rounded-xl px-4 py-3 shadow-sm gap-3">
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-hide">
              <span className="text-sm text-gray-600 whitespace-nowrap font-medium mr-1">Tình trạng:</span>
              {[
                { value: "", label: "Tất cả" },
                { value: "in_stock", label: "Hàng sẵn" },
                { value: "preorder", label: "Đặt trước" },
              ].map((opt) => (
                <Link
                  key={opt.value}
                  href={{
                    query: {
                      ...params,
                      availability: opt.value,
                      page: undefined, // reset page
                    },
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    (params.availability || "") === opt.value
                      ? "bg-[#d53c83] text-white shadow-sm"
                      : "bg-pink-50 text-pink-600 hover:bg-pink-100"
                  }`}
                >
                  {opt.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-hide">
              <SlidersHorizontal className="h-4 w-4 text-gray-500 shrink-0" />
              <span className="text-sm text-gray-600 whitespace-nowrap hidden md:inline">Sắp xếp:</span>
              {[
                { value: "", label: "Mới nhất" },
                { value: "price_asc", label: "Giá tăng dần" },
                { value: "price_desc", label: "Giá giảm dần" },
              ].map((opt) => (
                <Link
                  key={opt.value}
                  href={{
                    query: {
                      ...params,
                      sort: opt.value,
                    },
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    (params.sort || "") === opt.value
                      ? "bg-gray-800 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {opt.label}
                </Link>
              ))}
            </div>
          </div>



          {products.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl">
              <div className="text-6xl mb-4"></div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                Không tìm thấy sản phẩm
              </h3>
              <p className="text-gray-500">
                Thử tìm kiếm với từ khóa khác hoặc xem tất cả sản phẩm
              </p>
              <Link href="/products">
                <button className="mt-4 px-6 py-2 bg-pink-500 text-white rounded-xl font-medium hover:bg-pink-600">
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
                  hoverImage={product.images[1]?.url}
                  slug={product.slug}
                  hasVariants={product._count?.variants > 0}
                  variants={product.variants}
                  stock={product.stock}
                  fulfillmentType={product.fulfillmentType}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 gap-2">
              {Array.from({ length: totalPages }).map((_, i) => {
                const page = i + 1;
                return (
                  <Link
                    key={page}
                    href={{
                      query: { ...params, page: page.toString() },
                    }}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${
                      currentPage === page
                        ? "bg-[#d53c83] text-white shadow-md shadow-pink-200"
                        : "bg-white text-gray-600 border border-gray-200 hover:border-pink-200 hover:text-[#d53c83]"
                    }`}
                  >
                    {page}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
