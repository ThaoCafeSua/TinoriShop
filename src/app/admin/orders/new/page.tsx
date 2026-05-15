"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Minus, Trash2, Search, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/useToast";
import { formatPrice } from "@/lib/utils";

interface ProductVariant {
  id: string;
  name: string;
  value: string;
  price: number | null;
  salePrice: number | null;
  stock: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  salePrice: number | null;
  stock: number;
  image: string;
  variants: ProductVariant[];
}

interface CartItem {
  id: string; // unique cart item id
  productId: string;
  variantId?: string;
  name: string;
  variantName?: string;
  price: number;
  quantity: number;
  image: string;
  stock: number;
}

export default function AdminCreateOrderPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [search, setSearch] = useState("");
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    detailedAddress: "",
    province: "N/A",
    district: "N/A",
    ward: "N/A",
    note: "Đơn tạo bởi Admin",
  });
  const [shippingFee, setShippingFee] = useState(30000);
  const [depositAmount, setDepositAmount] = useState(0); // Admin có thể set cọc 0đ
  const [status, setStatus] = useState("PROCESSING");
  const [paymentMethod, setPaymentMethod] = useState("CASH_ON_DELIVERY");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/products?limit=100") // Lấy tối đa 100 sp để POS
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || data);
      })
      .finally(() => setLoadingProducts(false));
  }, []);

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const addToCart = (product: Product, variant?: ProductVariant) => {
    const price = variant ? (variant.salePrice || variant.price || product.salePrice || product.price) : (product.salePrice || product.price);
    const stock = variant ? variant.stock : product.stock;
    const variantName = variant ? `${variant.name}: ${variant.value}` : undefined;
    const cartItemId = variant ? variant.id : product.id;

    if (stock <= 0) {
      toast({ title: "Sản phẩm đã hết hàng", variant: "destructive" });
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === cartItemId);
      if (existing) {
        if (existing.quantity >= stock) {
          toast({ title: "Vượt quá số lượng tồn kho", variant: "destructive" });
          return prev;
        }
        return prev.map(item => item.id === cartItemId ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, {
        id: cartItemId,
        productId: product.id,
        variantId: variant?.id,
        name: product.name,
        variantName,
        price,
        quantity: 1,
        image: product.image,
        stock
      }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.quantity + delta;
        if (newQ > item.stock) {
          toast({ title: "Vượt quá tồn kho", variant: "destructive" });
          return item;
        }
        if (newQ < 1) return item;
        return { ...item, quantity: newQ };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + shippingFee;

  const handleSubmit = async () => {
    if (cart.length === 0) {
      toast({ title: "Giỏ hàng trống", variant: "destructive" });
      return;
    }
    if (!customerInfo.customerName || !customerInfo.customerPhone) {
      toast({ title: "Vui lòng nhập tên và SĐT khách hàng", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...customerInfo,
        items: cart.map(item => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.price
        })),
        shippingFee,
        totalAmount: total,
        depositAmount,
        status,
        paymentMethod,
        isAdminCreated: true // flag if API supports it
      };

      const res = await fetch("/api/admin/orders/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lỗi tạo đơn hàng");
      
      toast({ title: "Tạo đơn hàng thành công!", variant: "success" });
      router.push("/admin/orders");
    } catch (err: any) {
      toast({ title: "Lỗi", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="lg:pl-64 flex h-screen overflow-hidden bg-gray-50">
      <AdminNav />
      
      <div className="flex-1 flex flex-col h-full md:flex-row pt-16 lg:pt-0">
        {/* Left Panel: Products List */}
        <div className="flex-1 flex flex-col h-full border-r bg-white p-4">
          <div className="mb-4">
            <h1 className="text-xl font-bold mb-4">Danh sách Sản phẩm</h1>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input 
                type="text"
                placeholder="Tìm sản phẩm..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {loadingProducts ? (
              <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-pink-500" /></div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredProducts.map(product => (
                  <div key={product.id} className="border rounded-xl p-3 hover:border-pink-300 transition-colors flex flex-col">
                    <div className="aspect-square bg-gray-100 rounded-lg mb-2 overflow-hidden">
                      {product.image ? (
                        <img src={product.image} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full bg-pink-50" />
                      )}
                    </div>
                    <h3 className="text-sm font-bold line-clamp-2 mb-1 flex-1">{product.name}</h3>
                    
                    {product.variants && product.variants.length > 0 ? (
                      <div className="space-y-1 mt-2">
                        {product.variants.map(v => (
                          <button
                            key={v.id}
                            onClick={() => addToCart(product, v)}
                            className="w-full text-left text-[11px] p-1.5 rounded bg-gray-50 hover:bg-pink-50 flex justify-between items-center"
                          >
                            <span className="truncate pr-1">{v.value}</span>
                            <span className="font-semibold text-pink-600 shrink-0">{formatPrice(v.salePrice || v.price || product.salePrice || product.price)}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-auto flex justify-between items-center pt-2">
                        <span className="font-bold text-pink-600 text-sm">{formatPrice(product.salePrice || product.price)}</span>
                        <Button size="sm" className="h-7 text-xs px-2" onClick={() => addToCart(product)}>Thêm</Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Cart & Customer Info */}
        <div className="w-full md:w-[400px] xl:w-[450px] bg-white flex flex-col h-full">
          <div className="p-4 border-b font-bold text-lg bg-pink-50/50">Chi tiết đơn hàng</div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
            {/* Cart Items */}
            <div>
              <h3 className="font-semibold text-sm mb-3 text-gray-500 uppercase tracking-wider">Giỏ hàng</h3>
              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed rounded-xl">Chưa có sản phẩm</div>
              ) : (
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.id} className="flex gap-3 border-b pb-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden shrink-0">
                        {item.image && <img src={item.image} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{item.name}</p>
                        {item.variantName && <p className="text-xs text-gray-500">{item.variantName}</p>}
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-pink-600 font-semibold text-sm">{formatPrice(item.price)}</span>
                          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-0.5 border">
                            <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center hover:bg-white rounded"><Minus className="w-3 h-3" /></button>
                            <span className="text-xs font-medium w-4 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center hover:bg-white rounded"><Plus className="w-3 h-3" /></button>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="self-start text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Customer Info Form */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wider">Khách hàng</h3>
              <input
                placeholder="Tên khách hàng *"
                value={customerInfo.customerName}
                onChange={e => setCustomerInfo(f => ({ ...f, customerName: e.target.value }))}
                className="w-full border px-3 py-2 rounded-lg text-sm"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="Số điện thoại *"
                  value={customerInfo.customerPhone}
                  onChange={e => setCustomerInfo(f => ({ ...f, customerPhone: e.target.value }))}
                  className="w-full border px-3 py-2 rounded-lg text-sm"
                />
                <input
                  placeholder="Email (Tùy chọn)"
                  value={customerInfo.customerEmail}
                  onChange={e => setCustomerInfo(f => ({ ...f, customerEmail: e.target.value }))}
                  className="w-full border px-3 py-2 rounded-lg text-sm"
                />
              </div>
              <textarea
                placeholder="Địa chỉ giao hàng đầy đủ..."
                value={customerInfo.detailedAddress}
                onChange={e => setCustomerInfo(f => ({ ...f, detailedAddress: e.target.value }))}
                className="w-full border px-3 py-2 rounded-lg text-sm min-h-[60px]"
              />
              <textarea
                placeholder="Ghi chú đơn hàng..."
                value={customerInfo.note}
                onChange={e => setCustomerInfo(f => ({ ...f, note: e.target.value }))}
                className="w-full border px-3 py-2 rounded-lg text-sm min-h-[60px]"
              />
            </div>

            {/* Order Settings */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Phí ship (đ):</span>
                <input 
                  type="number" 
                  value={shippingFee} 
                  onChange={e => setShippingFee(Number(e.target.value))}
                  className="border w-24 px-2 py-1 text-sm rounded-md text-right"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Tiền cọc (đ):</span>
                <input 
                  type="number" 
                  value={depositAmount} 
                  onChange={e => setDepositAmount(Number(e.target.value))}
                  className="border w-24 px-2 py-1 text-sm rounded-md text-right"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Trạng thái:</span>
                <select 
                  value={status} 
                  onChange={e => setStatus(e.target.value)}
                  className="border text-sm rounded-md px-2 py-1 outline-none"
                >
                  <option value="PROCESSING">Đang xử lý (Đã cọc)</option>
                  <option value="PENDING_DEPOSIT">Chờ cọc</option>
                  <option value="SHIPPING">Đang giao hàng</option>
                  <option value="COMPLETED">Hoàn thành</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 border-t shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-gray-500">Tạm tính</span>
              <span className="font-semibold">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between mb-4 text-sm">
              <span className="text-gray-500">Phí vận chuyển</span>
              <span className="font-semibold">{formatPrice(shippingFee)}</span>
            </div>
            <div className="flex justify-between mb-6">
              <span className="font-bold text-lg">Tổng cộng</span>
              <span className="font-black text-2xl text-pink-600">{formatPrice(total)}</span>
            </div>
            <Button 
              className="w-full h-12 text-base font-bold bg-pink-600 hover:bg-pink-700" 
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <CheckCircle className="w-5 h-5 mr-2" />}
              TẠO ĐƠN HÀNG
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
