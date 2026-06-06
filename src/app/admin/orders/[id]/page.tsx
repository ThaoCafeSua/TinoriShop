"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
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
  Copy,
  Home,
  Building2,
  Map,
} from "lucide-react";
import { toast } from "@/hooks/useToast";

type OrderStatus = "PENDING_DEPOSIT" | "PENDING_CONFIRM" | "CONFIRMED" | "SHIPPING" | "COMPLETED" | "CANCELLED";

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
  shippingFee: number;
  depositAmount: number;
  totalAmount: number;
  status: OrderStatus;
  depositStatus: string;
  depositPaidAt?: string | null;
  depositNote?: string | null;
  depositImage?: string | null;
  paymentMethod: string;
  shippingCode?: string | null;
  shippingLink?: string | null;
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
  const [shippingLink, setShippingLink] = useState("");
  const [depositNote, setDepositNote] = useState("");

  const [confirmingDeposit, setConfirmingDeposit] = useState(false);
  const [confirmingStatus, setConfirmingStatus] = useState<OrderStatus | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);

  const handleSendTrackingEmail = async () => {
    if (!shippingCode) {
      toast({ title: "Vui lòng nhập mã vận đơn", variant: "destructive" });
      return;
    }
    setSendingEmail(true);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          shippingCode, 
          shippingLink: shippingLink || `https://spx.vn/tracking?code=${shippingCode}`,
          sendTrackingEmail: true 
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setOrder((prev) => prev ? { ...prev, ...updated } : null);
        toast({ title: "Đã gửi email cho khách hàng! ", description: `Mã vận đơn: ${shippingCode}` });
      } else {
        const err = await res.json();
        toast({ title: err.error || "Gửi email thất bại", variant: "destructive" });
      }
    } catch {
      toast({ title: "Lỗi kết nối", variant: "destructive" });
    }
    setSendingEmail(false);
  };

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setOrder(data);
        setShippingCode(data.shippingCode || "");
        setShippingLink(data.shippingLink || "");
        setDepositNote(data.depositNote || "");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const copyText = (text: string, label?: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `Đã sao chép ${label || ""}!` });
  };

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
    setConfirmingDeposit(false);
  };

  const updateStatus = async (status: OrderStatus) => {
    if (status === "SHIPPING" && !shippingCode) {
      alert("Vui lòng nhập mã vận đơn trước khi chuyển sang Đang giao");
      setConfirmingStatus(null);
      return;
    }
    setUpdating(true);
    const res = await fetch(`/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        status, 
        shippingCode: shippingCode || undefined,
        shippingLink: shippingLink || undefined,
      }),
    });
    if (res.ok) {
      const updated = await res.json();
      setOrder((prev) => prev ? { ...prev, ...updated } : null);
    } else {
      const err = await res.json();
      alert(err.error || "Có lỗi xảy ra");
    }
    setUpdating(false);
    setConfirmingStatus(null);
  };

  const saveShippingInfo = async () => {
    setUpdating(true);
    const res = await fetch(`/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shippingCode, shippingLink }),
    });
    if (res.ok) {
      const updated = await res.json();
      setOrder((prev) => prev ? { ...prev, ...updated } : null);
    }
    setUpdating(false);
  };

  if (loading) {
    return (
      <div className="lg:pl-64 flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
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

  // Luồng trạng thái đúng logic:
  // PENDING_DEPOSIT → (Admin xác nhận cọc) → CONFIRMED → SHIPPING → COMPLETED
  // Bất kỳ lúc nào cũng có thể hủy (CANCELLED)
  const statusFlow: { status: OrderStatus; label: string; icon: React.ReactNode; show: boolean }[] = [
    { 
      status: "CONFIRMED", 
      label: "Xác nhận đơn", 
      icon: <CheckCircle className="h-4 w-4" />,
      // Chỉ hiện khi cọc đã xong nhưng chưa xác nhận đơn
      show: order.depositStatus === "PAID" && order.status !== "CONFIRMED" && order.status !== "SHIPPING" && order.status !== "COMPLETED" && order.status !== "CANCELLED",
    },
    { 
      status: "SHIPPING", 
      label: "Đang giao", 
      icon: <Truck className="h-4 w-4" />,
      // Chỉ hiện khi đã xác nhận đơn
      show: order.status === "CONFIRMED",
    },
    { 
      status: "COMPLETED", 
      label: "Hoàn tất", 
      icon: <Package className="h-4 w-4" />,
      // Chỉ hiện khi đang giao
      show: order.status === "SHIPPING",
    },
    { 
      status: "CANCELLED", 
      label: "Hủy đơn", 
      icon: <XCircle className="h-4 w-4" />,
      // Hiện khi chưa hoàn tất hoặc chưa hủy
      show: order.status !== "COMPLETED" && order.status !== "CANCELLED",
    },
  ];

  const visibleStatusButtons = statusFlow.filter(s => s.show);

  // Thông tin nhận hàng tách từng dòng
  const shippingInfoFields = [
    { icon: <User className="h-4 w-4 text-pink-600" />, label: "Người nhận", value: order.customerName, bgColor: "bg-pink-100" },
    { icon: <Phone className="h-4 w-4 text-green-600" />, label: "Số điện thoại", value: order.customerPhone, bgColor: "bg-green-100" },
    ...(order.customerEmail ? [{ icon: <Mail className="h-4 w-4 text-blue-600" />, label: "Email", value: order.customerEmail, bgColor: "bg-blue-100" }] : []),
    { icon: <Home className="h-4 w-4 text-orange-600" />, label: "Địa chỉ chi tiết", value: order.detailedAddress, bgColor: "bg-orange-100" },
    { icon: <Building2 className="h-4 w-4 text-purple-600" />, label: "Phường/Xã", value: order.ward, bgColor: "bg-purple-100" },
    { icon: <Map className="h-4 w-4 text-cyan-600" />, label: "Quận/Huyện", value: order.district, bgColor: "bg-cyan-100" },
    { icon: <MapPin className="h-4 w-4 text-red-600" />, label: "Tỉnh/Thành phố", value: order.province, bgColor: "bg-red-100" },
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
              {new Date(order.createdAt).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order items */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5 border-b">
                <h2 className="font-bold text-gray-900">Chi tiết sản phẩm</h2>
              </div>
              <div className="divide-y">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      {item.product.images[0] ? (
                        <img
                          src={item.product.images[0].url}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-pink-100 flex items-center justify-center text-xs text-pink-400 font-bold">No Image</div>
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
              <div className="p-4 bg-gray-50 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Tổng sản phẩm</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span>{order.shippingFee === 0 ? "Miễn phí" : formatPrice(order.shippingFee)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
                  <span>Tổng cộng</span>
                  <span className="text-pink-600">{formatPrice(order.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-xs">
                  <span>Đã đặt cọc</span>
                  <span className="text-green-600">-{formatPrice(order.depositAmount)}</span>
                </div>
                <div className="flex justify-between text-gray-800 font-semibold pt-1">
                  <span>Còn lại thu COD</span>
                  <span>{formatPrice(order.totalAmount - order.depositAmount)}</span>
                </div>
              </div>
            </div>

            {/* Deposit & Status management */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h2 className="font-bold text-gray-900 mb-4">Quản lý đơn hàng</h2>

              {/* Deposit confirmation */}
              {order.depositStatus !== "PAID" ? (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-yellow-800">
                      Chờ xác nhận cọc {formatPrice(order.depositAmount)}
                    </p>
                    <p className="text-xs font-medium text-yellow-700 bg-yellow-100 px-2 py-1 rounded-md">
                      {PAYMENT_METHOD_MAP[order.paymentMethod] || order.paymentMethod}
                    </p>
                  </div>
                  
                  <textarea
                    value={depositNote}
                    onChange={(e) => setDepositNote(e.target.value)}
                    placeholder="Ghi chú xác nhận cọc (tùy chọn)..."
                    className="w-full text-sm border border-yellow-300 bg-white rounded-lg p-3 mb-3 resize-none h-16 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => confirmingDeposit ? confirmDeposit() : setConfirmingDeposit(true)}
                      disabled={updating}
                      className={confirmingDeposit ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
                    >
                      {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                      {confirmingDeposit ? "Bấm lần nữa để xác nhận" : "Xác nhận đã nhận cọc"}
                    </Button>
                    {confirmingDeposit && (
                      <Button onClick={() => setConfirmingDeposit(false)} variant="outline" disabled={updating} className="border-gray-300">
                        Hủy
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start">
                  <div>
                    <p className="text-green-700 font-semibold flex items-center gap-1.5">
                      <CheckCircle className="h-4 w-4" /> Đã xác nhận cọc {formatPrice(order.depositAmount)}
                    </p>
                    {order.depositPaidAt && (
                      <p className="text-xs text-green-600 mt-1.5">
                        Xác nhận lúc: {new Date(order.depositPaidAt).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
                      </p>
                    )}
                    {order.depositNote && (
                      <p className="text-sm text-gray-700 mt-2 p-2 bg-white rounded border border-green-100">
                        <span className="font-semibold text-xs text-gray-500 block mb-0.5">Ghi chú:</span>
                        {order.depositNote}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Shipping info */}
              <div className="mb-6 bg-gray-50 p-4 rounded-xl border">
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-3">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Truck className="h-4 w-4 text-orange-600" />
                    Vận chuyển SPX Express
                  </h3>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Mã vận đơn <span className="text-red-500">*</span></label>
                    <input
                      value={shippingCode}
                      onChange={(e) => setShippingCode(e.target.value)}
                      placeholder="VD: SPXVN12345678"
                      className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Link Tracking SPX</label>
                    <input
                      value={shippingLink}
                      onChange={(e) => setShippingLink(e.target.value)}
                      placeholder="https://spx.vn/tracking?code=..."
                      className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 justify-end">
                  <Button onClick={saveShippingInfo} disabled={updating || (!shippingCode && !shippingLink)} variant="secondary" size="sm">
                    Lưu thông tin vận chuyển
                  </Button>
                  <Button 
                    onClick={handleSendTrackingEmail} 
                    disabled={sendingEmail || !shippingCode || !order.customerEmail} 
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {sendingEmail ? "Đang gửi..." : " Gửi email cho khách"}
                  </Button>
                </div>
                {!order.customerEmail && (
                  <p className="text-xs text-amber-500 mt-2 italic">️ Khách hàng chưa cung cấp email, không thể gửi thông báo.</p>
                )}
                <p className="text-xs text-gray-400 mt-2 italic">* Cần nhập mã vận đơn trước khi chuyển trạng thái sang &quot;Đang giao&quot;.</p>
              </div>

              {/* Status buttons */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Cập nhật trạng thái</p>
                {visibleStatusButtons.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">Đơn hàng đã hoàn tất hoặc đã hủy.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {visibleStatusButtons.map(({ status, label, icon }) => {
                      const isConfirming = confirmingStatus === status;
                      
                      return (
                        <Button
                          key={status}
                          onClick={() => isConfirming ? updateStatus(status) : setConfirmingStatus(status)}
                          disabled={updating}
                          variant={isConfirming ? "destructive" : "outline"}
                          size="sm"
                          className={status === "CANCELLED" && !isConfirming ? "border-red-300 text-red-600 hover:bg-red-50" : ""}
                        >
                          {icon}
                          {isConfirming ? "Xác nhận?" : label}
                        </Button>
                      );
                    })}
                    {confirmingStatus && (
                      <Button variant="ghost" size="sm" onClick={() => setConfirmingStatus(null)}>
                        Hủy thao tác
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="space-y-4">
            {/* Status */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h2 className="font-bold text-gray-900 mb-3">Tổng quan</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-sm text-gray-500">Trạng thái</span>
                  <OrderStatusBadge status={order.status} />
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-sm text-gray-500">Tiền cọc</span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    order.depositStatus === "PAID"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {order.depositStatus === "PAID" ? "Đã cọc" : "Chờ cọc"}
                  </span>
                </div>
                {order.shippingCode && (
                  <div className="flex flex-col gap-1 border-b pb-2">
                    <span className="text-sm text-gray-500">Mã vận đơn</span>
                    <span className="font-mono text-sm font-bold text-pink-600 bg-pink-50 p-2 rounded text-center">{order.shippingCode}</span>
                    {order.shippingLink && (
                      <a href={order.shippingLink} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline text-center">
                        Mở link tracking
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Customer info — tách riêng từng dòng + nút Copy */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h2 className="font-bold text-gray-900 mb-3">Thông tin nhận hàng</h2>
              <div className="space-y-3 text-sm">
                {shippingInfoFields.map((field) => (
                  <div key={field.label} className="flex items-center gap-3 group">
                    <div className={`w-8 h-8 rounded-full ${field.bgColor} flex items-center justify-center shrink-0`}>
                      {field.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide font-bold">{field.label}</p>
                      <p className="text-sm font-semibold text-gray-800 break-words">{field.value}</p>
                    </div>
                    <button
                      onClick={() => copyText(field.value, field.label)}
                      className="p-1.5 text-gray-300 hover:text-pink-500 hover:bg-pink-50 rounded-lg transition-colors"
                      title={`Copy ${field.label}`}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}

                {/* Nút copy toàn bộ địa chỉ */}
                <button
                  onClick={() => copyText(`${order.detailedAddress}, ${order.ward}, ${order.district}, ${order.province}`, "địa chỉ đầy đủ")}
                  className="w-full mt-2 text-sm font-bold text-pink-600 bg-pink-50 hover:bg-pink-100 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy toàn bộ địa chỉ
                </button>

                {order.note && (
                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-900">
                    <span className="font-bold block mb-1">Ghi chú của khách:</span>
                    {order.note}
                  </div>
                )}
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h2 className="font-bold text-gray-900 mb-3">Cọc qua</h2>
              <div className="flex items-center gap-2 text-sm text-gray-700 font-medium border p-3 rounded-xl">
                <CreditCard className="h-5 w-5 text-indigo-500" />
                <span>{PAYMENT_METHOD_MAP[order.paymentMethod] || order.paymentMethod}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
