export const metadata = {
  title: "Điều khoản và Điều kiện mua hàng | Tinori",
  description: "Các điều khoản và điều kiện khi mua hàng tại Tinori Shop.",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-black text-gray-900 mb-8 text-center uppercase">Điều khoản và Điều kiện mua hàng</h1>
      
      <div className="bg-white rounded-2xl p-8 shadow-sm space-y-8 text-gray-700 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-[#d53c83] mb-3">1. Giá trị đơn hàng tối thiểu</h2>
          <p>Tinori chỉ tiếp nhận và xử lý các đơn hàng có giá trị từ <strong>200.000đ</strong> trở lên.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#d53c83] mb-3">2. Chính sách đặt cọc</h2>
          <p className="mb-2">Để hạn chế tình trạng đặt hàng nhưng không nhận hàng, khách hàng cần đặt cọc <strong>25.000đ</strong> cho mỗi đơn hàng.</p>
          <p className="mb-2">Khoản cọc sẽ được trừ trực tiếp vào tổng thanh toán khi đơn hàng được giao thành công.</p>
          <p>Trong các trường hợp khách không nhận hàng, không thể liên lạc hoặc đơn hàng bị hoàn về, khoản cọc sẽ <strong>không được hoàn lại</strong> và được sử dụng để hỗ trợ chi phí vận chuyển phát sinh.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#d53c83] mb-3">3. Hàng đặt trước</h2>
          <p className="mb-2">Một số sản phẩm trên website là hàng đặt trước với thời gian chuẩn bị dự kiến khoảng <strong>14 ngày</strong>.</p>
          <p>Nếu đơn hàng có cả hàng có sẵn và hàng đặt trước, toàn bộ đơn hàng sẽ được xử lý theo thời gian của sản phẩm đặt trước.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#d53c83] mb-3">4. Hủy đơn hàng</h2>
          <p>Khách hàng vui lòng cân nhắc kỹ trước khi đặt hàng, đặc biệt đối với các sản phẩm đặt trước. Tinori có quyền từ chối hoặc hạn chế hỗ trợ hoàn cọc đối với các đơn hàng hủy sau khi đã xác nhận xử lý.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#d53c83] mb-3">5. Đồng ý điều khoản</h2>
          <p>Khi đặt hàng trên website, khách hàng xác nhận đã <strong>đọc, hiểu và đồng ý</strong> với toàn bộ điều khoản mua hàng của Tinori.</p>
        </section>
      </div>
    </div>
  );
}
