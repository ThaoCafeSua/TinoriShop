"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Package, Truck, CheckCircle, Clock, XCircle, Copy } from "lucide-react";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/useToast";

interface Order {
  id: string;
  code: string;
  customerName: string;
  customerPhone: string;
  province: string;
  district: string;
  ward: string;
  detailedAddress: string;
  subtotal: number;
  depositAmount: number;
  totalAmount: number;
  status: string;
  depositStatus: string;
  paymentMethod: string;
  shippingCode: string | null;
  createdAt: string;
  updatedAt: string;
  items: {
    id: string;
    quantity: number;
    price: number;
    product: { name: string; images: { url: string }[] };
    variant?: { name: string; value: string };
  }[];
}

const statusSteps = [
  { status: "PENDING_DEPOSIT", label: "Chờ cọc", icon: Clock },
  { status: "DEPOSIT_CONFIRMED", label: "Đã cọc", icon: CheckCircle },
  { status: "PROCESSING", label: "Đang xử lý", icon: Package },
  { status: "SHIPPING", label: "Đang giao", icon: Truck },
  { status: "DELIVERED", label: "Đã giao", icon: CheckCircle },
];

const statusOrder = statusSteps.map((s) => s.status);

export default function OrderTrackingPage() {
  const { code } = useParams<{ code: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/by-code/${code}`)
      .then((r) => r.json())
      .then((data) => {
        setOrder(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [code]);

  const currentStepIndex = order
    ? statusOrder.indexOf(order.status)
    : -1;

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin h-12 w-12 border-4 border-pink-500 border-t-transparent rounded-full mx-auto" />
        <p className="mt-4 text-gray-500">Đang tra cứu đơn hàng...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">😔</div>
        <h2 className="text-2xl font-black text-gray-700 mb-3">
          Không tìm thấy đơn hàng
        </h2>
        <p className="text-gray-500 mb-6">Mã đơn hàng &ldquo;{code}&rdquo; không tồn tại</p>
        <Link href="/order-tracking">
          <Button>Tra cứu lại</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black text-gray-900">Theo dõi đơn hàng</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-bold text-pink-700">{order.code}</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(order.code);
                toast({ title: "Đã sao chép mã đơn hàng" });
              }}
            >
              <Copy className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600" />
            </button>
          </div>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Status tracker */}
      {order.status !== "CANCELLED" ? (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-base font-bold text-gray-800 mb-5">Trạng thái đơn hàng</h2>
          <div className="relative">
            {/* Progress line */}
            <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-200">
              <div
                className="bg-gradient-to-b from-pink-500 to-rose-500 w-full transition-all duration-500"
                style={{
                  height: `${
                    currentStepIndex === 0
                      ? 0
                      : Math.min(100, (currentStepIndex / (statusSteps.length - 1)) * 100)
                  }%`,
                }}
              />
            </div>

            <div className="space-y-5">
              {statusSteps.map((step, i) => {
                const Icon = step.icon;
                const isCompleted = i <= currentStepIndex;
                const isCurrent = i === currentStepIndex;
                return (
                  <div key={step.status} className="flex items-center gap-4 relative">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-all ${
                        isCompleted
                          ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md"
                          : "bg-white border-2 border-gray-200 text-gray-300"
                      } ${isCurrent ? "ring-4 ring-pink-100 scale-110" : ""}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p
                        className={`text-sm font-semibold ${
                          isCompleted ? "text-gray-900" : "text-gray-400"
                        }`}
                      >
                        {step.label}
                      </p>
                      {isCurrent && (
                        <p className="text-xs text-pink-500">Trạng thái hiện tại</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6 flex items-center gap-4">
          <XCircle className="h-8 w-8 text-red-500 flex-shrink-0" />
          <div>
            <p className="font-bold text-red-700">Đơn hàng đã bị hủy</p>
            <p className="text-sm text-red-600">Liên hệ shop nếu có thắc mắc</p>
          </div>
        </div>
      )}

      {/* Deposit info */}
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
        <h2 className="text-base font-bold text-gray-800 mb-3">Thông tin đặt cọc</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Số tiền cọc</p>
            <p className="text-xl font-black text-pink-600">
              {formatPrice(order.depositAmount)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Trạng thái</p>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mt-1 ${
                order.depositStatus === "PAID"
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {order.depositStatus === "PAID" ? "✓ Đã xác nhận" : "⏳ Chờ xác nhận"}
            </span>
          </div>
        </div>
        {order.depositStatus === "PENDING" && (
          <div className="mt-3 p-3 bg-amber-50 rounded-xl">
            <p className="text-xs text-amber-700 font-medium">
              Vui lòng chuyển khoản 25.000đ với nội dung{" "}
              <strong>COC {order.code}</strong> để xác nhận đơn hàng
            </p>
          </div>
        )}
      </div>

      {/* Customer info */}
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
        <h2 className="text-base font-bold text-gray-800 mb-3">Thông tin giao hàng</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Người nhận:</span>
            <span className="font-semibold">{order.customerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Điện thoại:</span>
            <span className="font-semibold">{order.customerPhone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Địa chỉ:</span>
            <span className="font-semibold text-right max-w-[60%]">
              {order.detailedAddress}, {order.ward}, {order.district}, {order.province}
            </span>
          </div>
          {order.shippingCode && (
            <div className="flex justify-between">
              <span className="text-gray-500">Mã vận chuyển:</span>
              <span className="font-semibold text-pink-600">{order.shippingCode}</span>
            </div>
          )}
        </div>
      </div>

      {/* Order items */}
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
        <h2 className="text-base font-bold text-gray-800 mb-3">Sản phẩm đã đặt</h2>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-0">
              <div>
                <p className="text-sm font-semibold text-gray-800">{item.product.name}</p>
                {item.variant && (
                  <p className="text-xs text-gray-500">
                    {item.variant.name}: {item.variant.value}
                  </p>
                )}
                <p className="text-xs text-gray-500">Số lượng: {item.quantity}</p>
              </div>
              <span className="text-sm font-bold text-gray-800">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-between font-bold text-base mt-3 pt-3 border-t">
          <span>Tổng tiền hàng:</span>
          <span className="text-pink-600">{formatPrice(order.totalAmount)}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <Link href="/products" className="flex-1">
          <Button variant="outline" className="w-full">
            Tiếp tục mua sắm
          </Button>
        </Link>
        <a
          href="https://www.facebook.com/tinori.official"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1"
        >
          <Button className="w-full">Liên hệ hỗ trợ</Button>
        </a>
      </div>
    </div>
  );
}
