import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GuideBlogPage() {
  return (
    <div className="min-h-screen bg-rose-50/30 py-12">
      <div className="max-w-3xl mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 leading-tight">
            Hướng dẫn đặt hàng & Quy định cọc tại Tinori Shop 🎀
          </h1>
          <p className="text-gray-500 text-lg">Những điều nhỏ xinh bạn cần biết trước khi rinh đồ về nhà~</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl shadow-sm p-6 md:p-10 space-y-10">
          
          {/* Section 1: Cách đặt hàng */}
          <section>
            <h2 className="text-2xl font-bold text-pink-600 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 text-sm font-black">1</span>
              Cách đặt hàng
            </h2>
            <div className="space-y-4 text-gray-600">
              <div className="flex gap-4 items-start">
                <div className="w-1.5 h-1.5 bg-pink-400 rounded-full mt-2 shrink-0"></div>
                <p>Chọn sản phẩm bạn yêu thích và thêm vào giỏ hàng.</p>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-1.5 h-1.5 bg-pink-400 rounded-full mt-2 shrink-0"></div>
                <p>Điền đầy đủ thông tin nhận hàng.</p>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-1.5 h-1.5 bg-pink-400 rounded-full mt-2 shrink-0"></div>
                <p>Hoàn tất đặt hàng và chuyển khoản cọc <strong>25.000đ</strong>.</p>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-1.5 h-1.5 bg-pink-400 rounded-full mt-2 shrink-0"></div>
                <p>Tinori xác nhận đơn và chuẩn bị gửi hàng cho bạn </p>
              </div>
            </div>
          </section>

          {/* Section 2: Về khoản cọc */}
          <section>
            <h2 className="text-2xl font-bold text-pink-600 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 text-sm font-black">2</span>
              Về khoản cọc 25.000đ
            </h2>
            <div className="bg-pink-50 rounded-2xl p-6 border border-pink-100 space-y-5">
              <p className="text-gray-700 leading-relaxed">
                Khoản cọc <strong>25.000đ</strong> được áp dụng để hạn chế tình trạng đặt đơn ảo hoặc đặt hàng nhưng không nhận hàng.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-xl">
                  <p className="font-bold text-gray-800 text-sm mb-2 flex items-center gap-2">
                    <span className="text-green-500 text-lg"></span>
                    Đơn giao thành công
                  </p>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    25.000đ sẽ được <strong>trừ trực tiếp</strong> vào tổng thanh toán khi nhận hàng nha 
                  </p>
                </div>
                <div className="bg-white p-5 rounded-xl">
                  <p className="font-bold text-gray-800 text-sm mb-2 flex items-center gap-2">
                    <span className="text-orange-500 text-lg"></span>
                    Giao hàng không thành công
                  </p>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Các trường hợp: không nhận hàng, không liên lạc được, đơn bị hoàn về — khoản cọc 25.000đ sẽ được dùng để hỗ trợ <strong>chi phí vận chuyển hoàn hàng</strong> cho Tinori.
                  </p>
                </div>
              </div>

              <p className="text-sm text-[#d53c83] font-semibold text-center pt-2">
                Vì vậy các cậu hãy chắc chắn trước khi đặt hàng giúp Tinori nha 
              </p>
            </div>
          </section>

          {/* Section 3: Lưu ý nhỏ */}
          <section>
            <h2 className="text-2xl font-bold text-pink-600 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 text-sm font-black">3</span>
              Lưu ý nhỏ
            </h2>
            <div className="space-y-3 text-gray-600">
              <div className="flex gap-4 items-start">
                <div className="w-1.5 h-1.5 bg-pink-400 rounded-full mt-2 shrink-0"></div>
                <p>Đơn hàng sẽ <strong>tự động hủy sau 24 giờ</strong> nếu shop chưa nhận được cọc.</p>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-1.5 h-1.5 bg-pink-400 rounded-full mt-2 shrink-0"></div>
                <p>Miễn phí vận chuyển cho đơn từ <strong>200.000đ</strong>.</p>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-1.5 h-1.5 bg-pink-400 rounded-full mt-2 shrink-0"></div>
                <p>Nếu cần hỗ trợ, hãy inbox fanpage Tinori nha </p>
              </div>
            </div>
          </section>

          {/* Footer CTA */}
          <div className="text-center pt-6 border-t border-pink-100">
            <p className="text-sm text-gray-500 mb-5">Cảm ơn bạn đã ghé qua ngôi nhà nhỏ của Tinori 🎀</p>
            <Link href="/products">
              <Button size="lg" className="bg-[#d53c83] hover:opacity-90 rounded-full px-8 font-bold shadow-lg shadow-pink-200">
                Bắt đầu mua sắm ngay ️
              </Button>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
