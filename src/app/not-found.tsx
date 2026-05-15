import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Home, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="min-h-[70vh] flex flex-col items-center justify-center px-4 bg-gray-50/50">
        <div className="text-center max-w-md w-full bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
          <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6 text-pink-500">
            <SearchX className="w-12 h-12" />
          </div>
          
          <h1 className="text-4xl font-black text-gray-900 mb-2">404</h1>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Không tìm thấy trang</h2>
          
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            Xin lỗi, trang bạn đang tìm kiếm không tồn tại, đã bị xóa hoặc tạm thời không thể truy cập.
          </p>
          
          <Link 
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-xl font-bold text-white shadow-lg shadow-pink-500/30 hover:scale-[1.02] active:scale-95 transition-all"
            style={{ backgroundColor: '#d53c83' }}
          >
            <Home className="w-5 h-5" />
            Về trang chủ
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
