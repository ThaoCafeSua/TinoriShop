import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const post = await prisma.blogPost.findUnique({
    where: { id },
  });

  if (!post) return notFound();

  const getYoutubeEmbedUrl = (url: string) => {
    let videoId = "";
    if (url.includes("youtube.com/watch?v=")) {
      videoId = url.split("v=")[1]?.split("&")[0];
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0];
    } else if (url.includes("youtube.com/embed/")) {
      videoId = url.split("embed/")[1]?.split("?")[0];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  const youtubeUrl = post.videoUrl ? getYoutubeEmbedUrl(post.videoUrl) : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link href="/news" className="inline-flex items-center text-sm font-bold text-pink-600 hover:gap-2 transition-all mb-8">
        <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại danh sách
      </Link>

      <article className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        {post.image && (
          <div className="aspect-[21/9] w-full overflow-hidden">
            <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}
        
        <div className="p-8 md:p-12">
          <div className="flex items-center gap-4 text-xs font-bold text-gray-400 mb-6 uppercase tracking-widest">
            <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(post.createdAt).toLocaleDateString("vi-VN")}
            </span>
            <span className="bg-pink-50 text-pink-500 px-3 py-1.5 rounded-full">Tin tức</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-8 leading-tight">
            {post.title}
          </h1>

          {/* Video Player */}
          {post.videoUrl && (
            <div className="mb-10 rounded-3xl overflow-hidden shadow-lg border border-gray-100 bg-black aspect-video relative">
              {youtubeUrl ? (
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={youtubeUrl}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              ) : post.videoUrl.includes("tiktok.com") ? (
                <div className="flex justify-center items-center h-full text-white bg-gray-900 italic text-sm">
                  Video TikTok: <a href={post.videoUrl} target="_blank" className="underline ml-2 text-pink-400">Xem trên TikTok</a>
                </div>
              ) : (
                <video src={post.videoUrl} controls className="w-full h-full" />
              )}
            </div>
          )}

          <div className="prose prose-pink max-w-none">
            {post.content.split("\n").map((para, i) => (
              <p key={i} className="text-gray-600 leading-relaxed mb-4 text-lg">
                {para}
              </p>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-400 font-medium italic">Cảm ơn bạn đã đọc tin từ Tinori!</p>
            <Button variant="ghost" size="sm" className="text-pink-600 font-bold">
              <Share2 className="h-4 w-4 mr-2" /> Chia sẻ
            </Button>
          </div>
        </div>
      </article>

      {/* Related section placeholder */}
      <div className="mt-16 text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Bạn có muốn xem thêm sản phẩm mới?</h3>
        <Link href="/products">
          <Button size="lg" className="rounded-full px-8">Xem cửa hàng ngay</Button>
        </Link>
      </div>
    </div>
  );
}
