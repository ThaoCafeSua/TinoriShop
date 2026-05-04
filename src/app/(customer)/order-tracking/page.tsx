"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function OrderTrackingPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError("Vui lòng nhập mã đơn hàng");
      return;
    }
    setError("");
    setLoading(true);

    // Verify order exists
    try {
      const res = await fetch(`/api/orders/by-code/${code.trim()}`);
      if (!res.ok) {
        setError("Không tìm thấy đơn hàng với mã này");
        setLoading(false);
        return;
      }
      const order = await res.json();

      // Optionally verify phone
      if (phone && order.customerPhone !== phone.trim()) {
        setError("Số điện thoại không khớp với đơn hàng này");
        setLoading(false);
        return;
      }

      router.push(`/order/${code.trim()}`);
    } catch {
      setError("Có lỗi xảy ra, vui lòng thử lại");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="h-10 w-10 text-pink-600" />
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">Tra cứu đơn hàng</h1>
        <p className="text-gray-500">
          Nhập mã đơn hàng để kiểm tra trạng thái giao hàng
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="mb-1.5 block">
              Mã đơn hàng <span className="text-red-500">*</span>
            </Label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="TIN202405XXXX"
              className="font-mono"
            />
            <p className="text-xs text-gray-400 mt-1">
              Ví dụ: TIN202405A1B2 (xem trong email hoặc trang đặt hàng thành công)
            </p>
          </div>

          <div>
            <Label className="mb-1.5 block">
              Số điện thoại (tùy chọn, để xác minh)
            </Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="09x xxxx xxxx"
              type="tel"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? (
              <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <>
                <Search className="h-5 w-5" />
                Tra cứu ngay
              </>
            )}
          </Button>
        </form>
      </div>

      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <h3 className="font-semibold text-amber-800 mb-2">💡 Lưu ý</h3>
        <ul className="text-sm text-amber-700 space-y-1">
          <li>• Mã đơn hàng được gửi sau khi đặt hàng thành công</li>
          <li>• Đơn hàng chỉ được xử lý sau khi xác nhận đặt cọc</li>
          <li>• Cần hỗ trợ? Nhắn tin qua Facebook Tinori</li>
        </ul>
      </div>
    </div>
  );
}
