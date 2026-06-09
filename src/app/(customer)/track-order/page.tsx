"use client";

import { useState } from "react";
import { Search, Package, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice, ORDER_STATUS_MAP } from "@/lib/utils";
import Link from "next/link";

interface Order {
  id: string;
  code: string;
  status: string;
  createdAt: string;
  totalAmount: number;
  items: { product: { name: string }; quantity: number }[];
}

export default function TrackOrderPage() {
  const [orderCode, setOrderCode] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderCode.trim() || !phone.trim()) return;

    setLoading(true);
    setError("");
    setSearched(true);
    setOrder(null);

    try {
      const res = await fetch(`/api/orders/by-code/${encodeURIComponent(orderCode.trim())}?phone=${encodeURIComponent(phone.trim())}`);
      if (!res.ok) {
        throw new Error("Không tìm thấy đơn hàng nào");
      }
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setOrder(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-pink-600" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Tra cứu đơn hàng</h1>
          <p className="text-gray-500">Xem tình trạng vận chuyển và chi tiết đơn hàng của bạn</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Package className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  value={orderCode}
                  onChange={(e) => setOrderCode(e.target.value)}
                  placeholder="Mã đơn hàng (VD: TIN123456)"
                  className="w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition-all"
                  required
                />
              </div>
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Phone className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="4 số cuối điện thoại"
                  maxLength={4}
                  className="w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition-all"
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="py-3 px-6 h-auto text-base whitespace-nowrap">
                {loading ? "Đang tìm..." : "Tra cứu"}
              </Button>
            </div>
          </form>
          <p className="text-xs text-gray-400 mt-4 text-center">
            Bảo mật: Cần nhập đúng Mã đơn hàng và 4 số cuối điện thoại đặt hàng để tra cứu.
          </p>
        </div>

        {searched && (
          <div className="space-y-4">
            {error ? (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center font-medium">
                {error}
              </div>
            ) : order ? (
              <div className="bg-white rounded-2xl shadow-sm border p-5">
                <div className="flex justify-between items-start mb-4 pb-4 border-b">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Mã đơn hàng</p>
                    <p className="text-lg font-black text-pink-600">{order.code}</p>
                    <p className="text-xs text-gray-400 mt-1">Ngày đặt: {new Date(order.createdAt).toLocaleDateString("vi-VN")}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${ORDER_STATUS_MAP[order.status]?.color || "bg-gray-100 text-gray-800"}`}>
                    {ORDER_STATUS_MAP[order.status]?.label || order.status}
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Sản phẩm:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {order.items.map((item, idx) => (
                      <li key={idx} className="flex justify-between">
                        <span className="truncate pr-4">{item.product.name}</span>
                        <span className="font-medium whitespace-nowrap">x{item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-sm text-gray-500">Tổng tiền:</span>
                  <span className="font-black text-gray-900">{formatPrice(order.totalAmount)}</span>
                </div>
                
                <div className="mt-4 flex gap-2">
                  <Link href={`/order-success?code=${order.code}&phone=${phone}`} className="w-full">
                    <Button variant="outline" className="w-full text-pink-600 border-pink-200 hover:bg-pink-50">
                      Xem chi tiết
                    </Button>
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
