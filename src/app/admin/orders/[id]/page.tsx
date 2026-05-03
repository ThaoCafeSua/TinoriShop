"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import AdminNav from "@/components/AdminNav";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import { Button } from "@/components/ui/button";
import { formatPrice, ORDER_STATUS_MAP, PAYMENT_METHOD_MAP } from "@/lib/utils";
import {
  ArrowLeft,
  CheckCircle,
  Package,
  Truck,
  XCircle,
  Loader2,
  MapPin,
  Phone,
  User,
  Mail,
  CreditCard,
} from "lucide-react";

type OrderStatus = "PENDING_DEPOSIT" | "DEPOSIT_CONFIRMED" | "PROCESSING" | "SHIPPING" | "DELIVERED" | "CANCELLED";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    images: { url: string }[];
  };
  variant?: {
    name: string;
    value: string;
  } | null;
}

interface Order {
  id: string;
  code: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  province: string;
  district: string;
  ward: string;
  detailedAddress: string;
  note?: string | null;
  subtotal: number;
  depositAmount: number;
  totalAmount: number;
  status: OrderStatus;
  depositStatus: string;
  depositPaidAt?: string | null;
  depositNote?: string | null;
  paymentMethod: string;
  shippingCode?: string | null;
  createdAt: string;
  items: OrderItem[];
}

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [shippingCode, setShippingCode] = useState("");
  const [depositNote, setDepositNote] = useState("");

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setOrder(data);
        setShippingCode(data.shippingCode || "");
        setDepositNote(data.depositNote || "");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const confirmDeposit = async () => {
    setUpdating(true);
    const res = await fetch(`/api/orders/${id}/confirm-deposit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: depositNote }),
    });
    if (res.ok) {
      const updated = await res.json();
      setOrder((prev) => prev ? { ...prev, ...updated } : null);
    }
    setUpdating(false);
  };

  const updateStatus = async (status: OrderStatus) => {
    setUpdating(true);
    const res = await fetch(`/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, shippingCode: shippingCode || undefined }),
    });
    if (res.ok) {
      const updated = await res.json();
      setOrder((prev) => prev ? { ...prev, ...updated } : null);
    }
    setUpdating(false);
  };

  const saveShippingCode = async () => {
    setUpdating(true);
    await fetch(`/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shippingCode }),
    });
    setUpdating(false);
  };

  if (loading) {
    return (
      <div className="lg:pl-64 flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="lg:pl-64 p-8 text-center">
        <p className="text-gray-500">Không tìm thấy đơn hàng</p>
        <Link href="/admin/orders"><Button className="mt-4">Quay lại</Button></Link>
      </div>
    );
  }

  const statusFlow: { status: OrderStatus; label: string; icon: React.ReactNode; requiresDeposit?: boolean }[] = [
    { status: "PROCESSING", label: "Xử lý đơn", icon: <Package className="h-4 w-4" />, requiresDeposit: true },
    { status: "SHIPPING", label: "Đang giao", icon: <Truck className="h-4 w-4" /> },
    { status: "DELIVERED", label: "Đã giao", icon: <CheckCircle className="h-4 w-4" /> },
    { status: "CANCELLED", label: "Hủy đơn", icon: <XCircle className="h-4 w-4" /> },
  ];

  return (
    <div className="lg:pl-64">
      <AdminNav />
      <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin/orders">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-black text-gray-900">Đơn hàng #{order.code}</h1>
            <p className="text-xs text-gray-500">
              {new Date(order.createdAt).toLocaleString("vi-VN")}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order items */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5 border-b">
                <h2 className="font-bold text-gray-900">Sản phẩm đặt hàng</h2>
              </div>
              <div className="divide-y">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      {item.product.images[0] ? (
                        <Image
                          src={item.product.images[0].url}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-purple-100 flex items-center justify-center text-2xl">📦</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{item.product.name}</p>
                      {item.variant && (
                        <p className="text-xs text-gray-500">
                          {item.variant.name}: {item.variant.value}
                        </p>
                      )}
                      <p className="text-sm text-gray-500">x{item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">{formatPrice(item.price * item.quantity)}</p>
                      <p className="text-xs text-gray-400">{formatPrice(item.price)}/cái</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-gray-50 space-y-1">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tạm tính</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-lg">
                  <span>Tổng cộng</span>
                  <span className="text-pink-600">{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Deposit & Status management */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h2 className="font-bold text-gray-900 mb-4">Quản lý đơn hàng</h2>

              {/* Deposit confirmation */}
              {order.depositStatus !== "PAID" ? (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl mb-4">
                  <p className="font-semibold text-yellow-800 mb-3">
                    ⏳ Chờ xác nhận cọc 25.000đ
                  </p>
                  <p className="text-xs text-yellow-700 mb-3">
                    PT: {PAYMENT_METHOD_MAP[order.paymentMethod] || order.paymentMethod}
                  </p>
                  <textarea
                    value={depositNote}
                    onChange={(e) => setDepositNote(e.target.value)}
                    placeholder="Ghi chú xác nhận cọc (tùy chọn)..."
                    className="w-full text-sm border rounded-lg p-2 mb-3 resize-none h-16"
                  />
                  <Button
                    onClick={confirmDeposit}
                    disabled={updating}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                    Xác nhận đã nhận cọc
                  </Button>
                </div>
              ) : (
                <div className="p-3 bg-green-50 border border-green-200 rounded-xl mb-4">
                  <p className="text-green-700 font-semibold text-sm">
                    ✓ Đã xác nhận cọc
                    {order.depositPaidAt && (
                      <span className="font-normal text-xs ml-1">
                        ({new Date(order.depositPaidAt).toLocaleString("vi-VN")})
                      </span>
                    )}
                  </p>
                  {order.depositNote && (
                    <p className="text-xs text-green-600 mt-1">{order.depositNote}</p>
                  )}
                </div>
              )}

              {/* Shipping code */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Mã vận đơn SPX
                </label>
                <div className="flex gap-2">
                  <input
                    value={shippingCode}
                    onChange={(e) => setShippingCode(e.target.value)}
                    placeholder="Nhập mã vận đơn..."
                    className="flex-1 text-sm border-2 border-gray-200 rounded-xl px-3 py-2 focus:border-purple-400 focus:outline-none"
                  />
                  <Button onClick={saveShippingCode} disabled={updating} variant="outline" size="sm">
                    Lưu
                  </Button>
                </div>
              </div>

              {/* Status buttons */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Cập nhật trạng thái</p>
                <div className="flex flex-wrap gap-2">
                  {statusFlow.map(({ status, label, icon, requiresDeposit }) => {
                    const disabled = (requiresDeposit && order.depositStatus !== "PAID") || updating || order.status === status;
                    return (
                      <Button
                        key={status}
                        onClick={() => updateStatus(status)}
                        disabled={disabled}
                        variant={order.status === status ? "default" : "outline"}
                        size="sm"
                        className={status === "CANCELLED" ? "border-red-300 text-red-600 hover:bg-red-50" : ""}
                        title={requiresDeposit && order.depositStatus !== "PAID" ? "Cần xác nhận cọc trước" : ""}
                      >
                        {icon}
                        {label}
                      </Button>
                    );
                  })}
                </div>
                {order.depositStatus !== "PAID" && (
                  <p className="text-xs text-yellow-600 mt-2">
                    * Cần xác nhận cọc trước khi chuyển sang &quot;Đang xử lý&quot;
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="space-y-4">
            {/* Status */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h2 className="font-bold text-gray-900 mb-3">Trạng thái</h2>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Đơn hàng</span>
                  <OrderStatusBadge status={order.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Tiền cọc</span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    order.depositStatus === "PAID"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {order.depositStatus === "PAID" ? "✓ Đã cọc" : "⏳ Chờ cọc"}
                  </span>
                </div>
                {order.shippingCode && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Mã vận đơn</span>
                    <span className="font-mono text-xs font-bold text-orange-600">{order.shippingCode}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Customer info */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h2 className="font-bold text-gray-900 mb-3">Thông tin khách</h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="h-4 w-4 flex-shrink-0 text-purple-400" />
                  <span className="font-semibold text-gray-800">{order.customerName}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="h-4 w-4 flex-shrink-0 text-green-400" />
                  <a href={`tel:${order.customerPhone}`} className="hover:text-purple-600">
                    {order.customerPhone}
                  </a>
                </div>
                {order.customerEmail && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4 flex-shrink-0 text-blue-400" />
                    <span>{order.customerEmail}</span>
                  </div>
                )}
                <div className="flex items-start gap-2 text-gray-600">
                  <MapPin className="h-4 w-4 flex-shrink-0 text-red-400 mt-0.5" />
                  <span>
                    {order.detailedAddress}, {order.ward}, {order.district}, {order.province}
                  </span>
                </div>
                {order.note && (
                  <div className="p-2 bg-gray-50 rounded-lg text-xs text-gray-600">
                    <span className="font-semibold">Ghi chú:</span> {order.note}
                  </div>
                )}
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h2 className="font-bold text-gray-900 mb-3">Thanh toán</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CreditCard className="h-4 w-4 text-blue-400" />
                <span>{PAYMENT_METHOD_MAP[order.paymentMethod] || order.paymentMethod}</span>
              </div>
              <div className="mt-2 p-3 bg-purple-50 rounded-xl">
                <p className="text-xs text-purple-600 font-medium">Tiền cọc: 25.000đ</p>
                <p className="text-xs text-gray-500 mt-1">
                  Nội dung: COC {order.code}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
