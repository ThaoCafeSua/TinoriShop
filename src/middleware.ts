import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const method = req.method;

    // Các routes công khai luôn được phép truy cập
    const isPublicGet = method === "GET" && (
      [
        "/api/products", 
        "/api/categories", 
        "/api/banners", 
        "/api/blog-posts", 
        "/api/vouchers", 
        "/api/popup",
        "/api/orders/track",
        "/api/orders/by-code"
      ].some(path => pathname.startsWith(path)) ||
      /^\/api\/orders\/[a-zA-Z0-9-]+$/.test(pathname)
    );

    const isPublicPost = method === "POST" && [
      "/api/checkout", 
      "/api/track-visit", 
      "/api/webhooks", 
      "/api/vouchers/check"
    ].some(path => pathname.startsWith(path));

    // Đặc biệt kiểm tra upload deposit và webhook (public post)
    // Các api này cần phải public hoặc có cơ chế auth riêng
    if (isPublicGet || isPublicPost) {
      return NextResponse.next();
    }

    // Các API còn lại bắt buộc phải là admin
    if (pathname.startsWith("/api")) {
      if (req.nextauth.token?.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => true, // Cho phép request đi qua hàm middleware để tự xử lý logic
    },
  }
);

export const config = {
  matcher: ["/api/:path*"]
};
