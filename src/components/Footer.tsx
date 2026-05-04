import Link from "next/link";
import { Store, ShoppingBag, Phone, Mail } from "lucide-react";

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-rose-300 to-rose-400 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Store className="h-6 w-6" />
              </div>
              <span className="text-2xl font-black">TINORI</span>
            </div>
            <p className="text-rose-100 text-sm leading-relaxed">
              Shop thời trang & phụ kiện online. Hàng chất lượng, giá hợp lý,
              giao hàng nhanh toàn quốc.
            </p>
            <div className="flex gap-3 mt-4">
              <a
                href="https://www.facebook.com/tinori.official"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
              >
                <FacebookIcon className="h-5 w-5" />
              </a>
              <a
                href="https://shopee.vn/tinori"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center hover:bg-orange-600 transition-colors"
              >
                <ShoppingBag className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Liên kết</h3>
            <ul className="space-y-2 text-sm text-rose-100">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  Tất cả sản phẩm
                </Link>
              </li>
              <li>
                <Link href="/order-tracking" className="hover:text-white transition-colors">
                  Tra cứu đơn hàng
                </Link>
              </li>
              <li>
                <a
                  href="https://shopee.vn/tinori"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Shopee của chúng tôi
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-4">Liên hệ</h3>
            <ul className="space-y-3 text-sm text-rose-100">
              <li className="flex items-center gap-2">
                <FacebookIcon className="h-4 w-4 text-blue-300 flex-shrink-0" />
                <a
                  href="https://www.facebook.com/tinori.official"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  facebook.com/tinori.official
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-green-300 flex-shrink-0" />
                <span>Liên hệ qua Facebook</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-pink-200 flex-shrink-0" />
                <span>Inbox fanpage để được hỗ trợ</span>
              </li>
            </ul>
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
              <p className="text-xs text-yellow-200 font-medium">
                💡 Cần đặt cọc 25.000đ để xác nhận đơn hàng
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-6 text-center text-sm text-rose-100">
          <p>© 2024 Tinori. Mọi quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
}
