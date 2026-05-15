import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NewsListPage() {
  const posts = await prisma.blogPost.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-gray-900 mb-2">Tin tức & Sự kiện</h1>
        <p className="text-gray-500">Cập nhật những thông tin mới nhất từ Tinori</p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm">
          <p className="text-gray-500">Chưa có tin tức nào mới nhất.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link 
              key={post.id} 
              href={`/news/${post.id}`}
              className="group bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="aspect-video overflow-hidden bg-pink-50 relative">
                {post.image ? (
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-pink-200 font-bold">TINORI</div>
                )}
              </div>
              <div className="p-6">
                <p className="text-xs text-pink-500 font-bold mb-2 uppercase tracking-wider">
                  {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                </p>
                <h2 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-pink-600 transition-colors line-clamp-2">
                  {post.title}
                </h2>
                <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed mb-4">
                  {post.content}
                </p>
                <div className="flex items-center text-sm font-bold text-pink-600">
                  Xem chi tiết <ChevronRight className="h-4 w-4 ml-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
