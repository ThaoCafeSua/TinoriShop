"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Copy, ExternalLink, MessageCircle, Truck, AlertCircle, XCircle, User, Phone, Mail, MapPin, Home, Building2, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { toast } from "@/hooks/useToast";

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
  subtotal: number;
  shippingFee: number;
  depositAmount: number;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  shippingCode?: string | null;
  shippingLink?: string | null;
  depositImage?: string | null;
  createdAt: string;
  items: {
    id: string;
    quantity: number;
    price: number;
    product: { name: string; fulfillmentType?: string };
    variant?: { name: string; value: string } | null;
  }[];
}

const BANK_INFO = {
  bankId: "ICB",
  bankName: "VietinBank",
  accountNo: "100877579446",
  accountName: "TRAN THI THANH THAO",
  amount: 25000,
};

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const fetchOrder = useCallback(() => {
    if (!code) { setLoading(false); return; }
    fetch(`/api/orders/by-code/${code}`)
      .then((r) => r.json())
      .then((data) => { 
        setOrder(data); 
        setLoading(false);
        if (data.status === "PENDING_DEPOSIT") {
          calculateTimeLeft(data.createdAt);
        }
      })
      .catch(() => setLoading(false));
  }, [code]);

  const calculateTimeLeft = (createdAt: string) => {
    const created = new Date(createdAt).getTime();
    const deadline = created + 24 * 60 * 60 * 1000;
    const now = new Date().getTime();
    const diff = Math.max(0, Math.floor((deadline - now) / 1000));
    setTimeLeft(diff);
  };

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // Silent auto-reload mỗi 15s để tự động cập nhật giao diện khi Admin/SePay xác nhận
  useEffect(() => {
    if (!order || order.status !== "PENDING_DEPOSIT") return;
    const interval = setInterval(() => {
      fetchOrder();
    }, 15000);
    return () => clearInterval(interval);
  }, [order?.status, fetchOrder]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const copyText = (text: string, label?: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `Đã sao chép ${label || ""}! ✓` });
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin h-12 w-12 border-4 border-pink-500 border-t-transparent rounded-full mx-auto" />
        <p className="mt-4 text-gray-500">Đang tải thông tin đơn hàng...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Không tìm thấy đơn hàng</p>
        <Link href="/"><Button className="mt-4">Về trang chủ</Button></Link>
      </div>
    );
  }

  const depositNote = `Dat coc ma don hang ${code}`;
  const vietQRUrl = `https://img.vietqr.io/image/${BANK_INFO.bankId}-${BANK_INFO.accountNo}-compact2.png?amount=${BANK_INFO.amount}&addInfo=${encodeURIComponent(depositNote)}&accountName=${encodeURIComponent(BANK_INFO.accountName)}`;

  const isPendingDeposit = order.status === "PENDING_DEPOSIT";
  const isCancelled = order.status === "CANCELLED";
  const isConfirmed = order.status === "CONFIRMED" || order.status === "SHIPPING" || order.status === "COMPLETED";

  // Thông tin nhận hàng — tách rõ từng mục để copy
  const shippingInfoFields = [
    { icon: <User className="h-4 w-4 text-pink-600" />, label: "Người nhận", value: order.customerName, bgColor: "bg-pink-100" },
    { icon: <Phone className="h-4 w-4 text-green-600" />, label: "Số điện thoại", value: order.customerPhone, bgColor: "bg-green-100" },
    ...(order.customerEmail ? [{ icon: <Mail className="h-4 w-4 text-blue-600" />, label: "Email", value: order.customerEmail, bgColor: "bg-blue-100" }] : []),
    { icon: <Home className="h-4 w-4 text-orange-600" />, label: "Địa chỉ chi tiết", value: order.detailedAddress, bgColor: "bg-orange-100" },
    { icon: <Building2 className="h-4 w-4 text-purple-600" />, label: "Phường/Xã", value: order.ward, bgColor: "bg-purple-100" },
    { icon: <Map className="h-4 w-4 text-cyan-600" />, label: "Quận/Huyện", value: order.district, bgColor: "bg-cyan-100" },
    { icon: <MapPin className="h-4 w-4 text-red-600" />, label: "Tỉnh/Thành phố", value: order.province, bgColor: "bg-red-100" },
  ];

  const hasPreorder = order.items.some(item => item.product.fulfillmentType === "preorder");
  const hasInStock = order.items.some(item => item.product.fulfillmentType !== "preorder");
  const isMixed = hasPreorder && hasInStock;

  const handleMessengerClick = () => {
    const msg = `Chào Tinori ♡\nMình vừa đặt đơn #${order.code} nha.`;
    navigator.clipboard.writeText(msg);
    toast({ title: "Đã sao chép tin nhắn! Bạn dán (paste) vào Messenger nha ♡" });
    window.open("https://m.me/tinori.official", "_blank");
  };

  return (
    <div className="relative min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-8 relative z-10">
        <div className="text-center mb-8">
          {isCancelled ? (
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-12 w-12 text-red-500" />
            </div>
          ) : isConfirmed ? (
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
          ) : (
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
          )}
          <h1 className="text-2xl font-black text-gray-900 mb-2">
            {isCancelled ? "Đơn hàng đã bị hủy" : isConfirmed ? "Đơn hàng đã được xác nhận! 🎉" : "Đặt hàng thành công! 🎉"}
          </h1>
          {isPendingDeposit && (
            <p className="text-gray-500">Cảm ơn bạn đã tin tưởng Tinori. Vui lòng hoàn tất đặt cọc để xác nhận đơn hàng.</p>
          )}
          {isConfirmed && (
            <p className="text-green-600 font-medium">Shop đã xác nhận cọc và đang xử lý đơn hàng! 💕</p>
          )}
        </div>

        {isPendingDeposit && timeLeft !== null && (
          <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 animate-pulse border ${timeLeft < 300 ? 'bg-red-50 border-red-200 text-red-700' : 'bg-orange-50 border-orange-200 text-orange-700'}`}>
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold">
                Thời gian giữ đơn còn lại: <span className="text-lg font-black">{formatTime(timeLeft)}</span>
              </p>
              <p className="text-xs opacity-80">⏰ Đơn hàng sẽ tự động hủy nếu không nhận được cọc trong <strong>24 giờ</strong></p>
            </div>
          </div>
        )}

      {/* Mã đơn hàng */}
      <div className="bg-gradient-to-r from-rose-50 to-pink-50 border-2 border-pink-200 rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-pink-600 font-medium mb-1">Mã đơn hàng</p>
            <p className="text-2xl font-black text-pink-800">{code}</p>
          </div>
          <button
            onClick={() => copyText(code || "", "mã đơn")}
            className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-xl text-sm font-medium hover:bg-pink-700 transition-colors"
          >
            <Copy className="h-4 w-4" />
            Sao chép
          </button>
        </div>
      </div>

      {/* Shipping tracking */}
      {order.shippingCode && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-black text-orange-900 mb-2 flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Đơn hàng đang được giao
          </h2>
          <div className="bg-white p-4 rounded-xl border border-orange-100 flex flex-col gap-2 items-start">
            <div>
              <p className="text-sm text-gray-500">Mã vận đơn (SPX)</p>
              <p className="text-xl font-bold text-orange-600">{order.shippingCode}</p>
            </div>
            {order.shippingLink && (
              <a href={order.shippingLink} target="_blank" rel="noreferrer" className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1 mt-1">
                Theo dõi hành trình <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Thanh toán cọc */}
      {isPendingDeposit && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-black text-gray-900 mb-4">Thanh toán đặt cọc {formatPrice(BANK_INFO.amount)}</h2>
          <div>
              <div className="flex flex-col items-center mb-4">
                <img
                  src={vietQRUrl}
                  alt="QR Code chuyển khoản"
                  className="w-56 h-56 object-contain rounded-xl border-2 border-gray-100"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                <p className="text-xs text-gray-500 mt-2">Quét mã QR để chuyển khoản nhanh</p>
                <p className="text-sm text-pink-600 font-semibold mt-1">
                  📝 Ghi chú: <span className="font-black">Đặt cọc mã đơn hàng {code}</span>
                </p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 space-y-2 mb-4">
                {[
                  { label: "Ngân hàng", value: BANK_INFO.bankName },
                  { label: "Số tài khoản", value: BANK_INFO.accountNo, copy: true },
                  { label: "Tên tài khoản", value: BANK_INFO.accountName },
                  { label: "Số tiền", value: formatPrice(BANK_INFO.amount) },
                  { label: "Nội dung CK", value: `Dat coc ma don hang ${code}`, copy: true },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{item.label}:</span>
                    <div className="flex items-center gap-1">
                       <span className="text-sm font-bold text-gray-800">{item.value}</span>
                      {item.copy && (
                        <button onClick={() => copyText(item.value || "", item.label)} className="text-blue-500 hover:text-blue-700">
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
          </div>
        </div>
      )}

      {isPendingDeposit && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-black text-gray-900 mb-4">Các bước tiếp theo</h2>
          <div className="space-y-4">
            {[
              { step: "1", title: "Chuyển khoản đặt cọc", desc: `Chuyển 25.000đ với nội dung "Đặt cọc mã đơn hàng ${code}"`, color: "bg-pink-100 text-pink-700" },
              { step: "2", title: "Admin xác nhận cọc", desc: "Shop sẽ kiểm tra và xác nhận đơn", color: "bg-blue-100 text-blue-700" },
              { step: "3", title: "Đóng gói và giao hàng", desc: hasPreorder ? "Hàng có sẵn: 2-5 ngày, Hàng đặt trước: 7-14 ngày" : "Hàng có sẵn thời gian giao 2-5 ngày", color: "bg-green-100 text-green-700" },
            ].map((s) => (
              <div key={s.step} className="flex gap-3">
                <div className={`w-8 h-8 rounded-full ${s.color} flex items-center justify-center font-bold text-sm flex-shrink-0`}>
                  {s.step}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{s.title}</p>
                  <p className="text-xs text-gray-500">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Thông tin nhận hàng — tách rõ từng dòng + nút copy */}
      {order && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-black text-gray-900 mb-4">Thông tin nhận hàng</h2>
          <div className="space-y-3">
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
                  className="p-1.5 text-gray-300 hover:text-pink-500 hover:bg-pink-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 sm:opacity-100"
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
          </div>
        </div>
      )}

      {/* Chi tiết đơn hàng */}
      {order && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-black text-gray-900 mb-4">Chi tiết đơn hàng</h2>
          <div className="space-y-2 text-sm">
            <div className="border-b pb-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between py-1">
                  <span className="text-gray-600 pr-4">
                    {item.product.name}{item.variant && ` (${item.variant.value})`} x{item.quantity}
                  </span>
                  <span className="font-semibold whitespace-nowrap">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="space-y-1 pt-2">
              <div className="flex justify-between text-gray-500">
                <span>Tạm tính:</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Phí vận chuyển:</span>
                <span>{order.shippingFee === 0 ? "Miễn phí" : formatPrice(order.shippingFee)}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-1">
                <span>Tổng cộng:</span>
                <span className="text-pink-600">{formatPrice(order.totalAmount)}</span>
              </div>
              {!isCancelled && (
                <>
                  <div className="flex justify-between text-green-600 text-xs mt-1">
                    <span>Đã cọc:</span>
                    <span>-{formatPrice(order.depositAmount)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-800 text-base border-t border-dashed mt-2 pt-2">
                    <span>Số tiền cần trả khi nhận hàng (COD):</span>
                    <span>{formatPrice(order.totalAmount - order.depositAmount)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Messenger Order Button */}
      <div className="bg-pink-50 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center shrink-0">
            <MessageCircle className="h-5 w-5 text-pink-600" />
          </div>
          <h2 className="text-lg font-black text-pink-900">Gửi đơn qua Messenger</h2>
        </div>
        
        {hasPreorder && (
          <div className="mb-4 bg-white/60 p-3 rounded-xl border border-pink-100 text-sm text-pink-800 flex gap-2">
            <AlertCircle className="h-5 w-5 shrink-0 text-pink-500" />
            <p>
              {isMixed 
                ? "Đơn hàng có kèm sản phẩm đặt trước nên toàn bộ đơn sẽ cần khoảng 14 ngày xử lý nha ♡" 
                : "Hàng đặt trước cần khoảng 14 ngày xử lý ♡"}<br />
              Cậu có thể nhắn Tinori để được cập nhật nhanh hơn.
            </p>
          </div>
        )}
        {!hasPreorder && (
          <p className="text-sm text-pink-700 mb-4">
            Khách yêu có thể nhắn mã đơn cho shop để shop xác nhận và ưu tiên chuẩn bị hàng nhanh hơn nha ♡
          </p>
        )}

        <Button 
          onClick={handleMessengerClick}
          className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold h-12 rounded-xl text-base shadow-md shadow-pink-200 transition-all mb-2"
        >
          Nhắn Tinori xác nhận đơn ♡
        </Button>
        <p className="text-xs text-center text-pink-600 font-medium">
          *Hệ thống sẽ tự động copy mã đơn. Bạn chỉ cần dán (paste) tin nhắn vào khung chat Messenger nhé ♡
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Link href="/products" className="w-full">
          <Button variant="outline" className="w-full">Tiếp tục mua sắm</Button>
        </Link>
      </div>
    </div>
  </div>
);
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin h-12 w-12 border-4 border-pink-500 border-t-transparent rounded-full mx-auto" />
        <p className="mt-4 text-gray-500">Đang tải...</p>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
