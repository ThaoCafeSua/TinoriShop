"use client";

import { useEffect, useState } from "react";
import AdminNav from "@/components/AdminNav";
import { Button } from "@/components/ui/button";
import {
  Loader2, Plus, Pencil, Trash2, X, Check, Ticket, Copy
} from "lucide-react";
import { toast } from "@/hooks/useToast";
import { formatPrice } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import Pagination from "@/components/admin/Pagination";
import { Suspense } from "react";

interface Voucher {
  id: string;
  code: string;
  description?: string | null;
  discountType: string;
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number | null;
  usageLimit: number;
  usedCount: number;
  active: boolean;
  startDate: string;
  endDate?: string | null;
  createdAt: string;
}

const emptyForm = {
  code: "",
  description: "",
  discountType: "FIXED" as string,
  discountValue: "",
  minOrderValue: "0",
  maxDiscount: "",
  usageLimit: "100",
  active: true,
  startDate: new Date().toISOString().split("T")[0],
  endDate: "",
};

export default function AdminVouchersPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-pink-500" /></div>}>
      <AdminVouchersContent />
    </Suspense>
  );
}

function AdminVouchersContent() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const limit = 20;

  const fetchVouchers = async () => {
    try {
      const res = await fetch("/api/vouchers");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setVouchers(Array.isArray(data) ? data : []);
    } catch {
      setVouchers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVouchers(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (v: Voucher) => {
    setEditingId(v.id);
    setForm({
      code: v.code,
      description: v.description || "",
      discountType: v.discountType,
      discountValue: String(v.discountValue),
      minOrderValue: String(v.minOrderValue),
      maxDiscount: v.maxDiscount ? String(v.maxDiscount) : "",
      usageLimit: String(v.usageLimit),
      active: v.active,
      startDate: v.startDate ? new Date(v.startDate).toISOString().split("T")[0] : "",
      endDate: v.endDate ? new Date(v.endDate).toISOString().split("T")[0] : "",
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    // ── FRONTEND VALIDATION ──
    const code = form.code.trim();
    const discountValue = Number(form.discountValue);
    const minOrderValue = Number(form.minOrderValue || 0);
    const maxDiscount = form.maxDiscount ? Number(form.maxDiscount) : null;
    const usageLimit = Number(form.usageLimit || 0);
    const startDate = new Date(form.startDate);
    const endDate = form.endDate ? new Date(form.endDate) : null;

    if (!code) {
      toast({ title: "Vui lòng nhập mã voucher", variant: "destructive" });
      return;
    }

    if (!form.discountValue || discountValue <= 0) {
      toast({ title: "Giá trị giảm phải lớn hơn 0", variant: "destructive" });
      return;
    }

    if (form.discountType === "PERCENT" && discountValue > 100) {
      toast({ title: "Giảm giá theo % không thể vượt quá 100%", variant: "destructive" });
      return;
    }

    if (form.discountType === "PERCENT" && !maxDiscount) {
      toast({ title: "Vui lòng nhập giá trị giảm tối đa cho loại giảm giá %", variant: "destructive" });
      return;
    }

    if (minOrderValue < 0) {
      toast({ title: "Giá trị đơn tối thiểu không được âm", variant: "destructive" });
      return;
    }

    if (usageLimit < 0) {
      toast({ title: "Số lượt dùng không được âm", variant: "destructive" });
      return;
    }

    if (endDate && endDate < startDate) {
      toast({ title: "Ngày kết thúc phải sau ngày bắt đầu", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const url = editingId ? `/api/vouchers/${editingId}` : "/api/vouchers";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          code,
          discountValue,
          minOrderValue,
          maxDiscount,
          usageLimit,
          endDate: form.endDate || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Lỗi lưu voucher");
      }
      toast({ title: editingId ? "Đã cập nhật" : "Đã tạo voucher" });
      setShowForm(false);
      fetchVouchers();
    } catch (err: any) {
      toast({ title: "Lỗi", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const deleteVoucher = async (id: string) => {
    if (!confirm("Xóa voucher này?")) return;
    await fetch(`/api/vouchers/${id}`, { method: "DELETE" });
    toast({ title: "Đã xóa" });
    fetchVouchers();
  };

  const toggleActive = async (v: Voucher) => {
    await fetch(`/api/vouchers/${v.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !v.active }),
    });
    fetchVouchers();
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: `Đã sao chép mã ${code}` });
  };

  const totalPages = Math.ceil(vouchers.length / limit);
  const paginatedVouchers = vouchers.slice((page - 1) * limit, page * limit);

  return (
    <div className="lg:pl-64">
      <AdminNav />
      <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Quản lý Voucher</h1>
            <p className="text-sm text-gray-500">Tạo và quản lý mã giảm giá cho khách hàng</p>
          </div>
          <Button onClick={openCreate} className="bg-pink-600 hover:bg-pink-700">
            <Plus className="h-4 w-4 mr-2" /> Tạo voucher
          </Button>
        </div>

        {/* Form modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-5 border-b">
                <h2 className="font-bold text-lg text-gray-900">{editingId ? "Sửa voucher" : "Tạo voucher mới"}</h2>
                <button onClick={() => setShowForm(false)}><X className="h-5 w-5 text-gray-500 hover:text-gray-700" /></button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Mã voucher <span className="text-red-500">*</span></label>
                  <input
                    value={form.code}
                    onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-pink-400 focus:ring-1 focus:ring-pink-400 outline-none font-mono tracking-wider"
                    placeholder="VD: TINORI10K"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Mô tả (hiển thị cho khách)</label>
                  <input
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-pink-400 focus:ring-1 focus:ring-pink-400 outline-none"
                    placeholder="VD: Giảm 10K cho đơn từ 100K"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Loại giảm giá</label>
                    <select
                      value={form.discountType}
                      onChange={e => setForm(f => ({ ...f, discountType: e.target.value }))}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-pink-400 focus:ring-1 focus:ring-pink-400 outline-none"
                    >
                      <option value="FIXED">Giảm cố định (đ)</option>
                      <option value="PERCENT">Giảm theo % </option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Giá trị giảm <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      value={form.discountValue}
                      onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-pink-400 focus:ring-1 focus:ring-pink-400 outline-none"
                      placeholder={form.discountType === "PERCENT" ? "VD: 10" : "VD: 10000"}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Đơn tối thiểu (đ)</label>
                    <input
                      type="number"
                      value={form.minOrderValue}
                      onChange={e => setForm(f => ({ ...f, minOrderValue: e.target.value }))}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-pink-400 focus:ring-1 focus:ring-pink-400 outline-none"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Giảm tối đa (đ) {form.discountType === "PERCENT" && <span className="text-red-500">*</span>}</label>
                    <input
                      type="number"
                      value={form.maxDiscount}
                      onChange={e => setForm(f => ({ ...f, maxDiscount: e.target.value }))}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-pink-400 focus:ring-1 focus:ring-pink-400 outline-none"
                      placeholder="Không giới hạn"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Số lượt dùng</label>
                    <input
                      type="number"
                      value={form.usageLimit}
                      onChange={e => setForm(f => ({ ...f, usageLimit: e.target.value }))}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-pink-400 focus:ring-1 focus:ring-pink-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Bắt đầu</label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-pink-400 focus:ring-1 focus:ring-pink-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Kết thúc</label>
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-pink-400 focus:ring-1 focus:ring-pink-400 outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-sm font-semibold text-gray-700">Kích hoạt:</label>
                  <button
                    onClick={() => setForm(f => ({ ...f, active: !f.active }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.active ? "bg-pink-500" : "bg-gray-300"}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.active ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>
              </div>
              <div className="flex gap-3 p-5 border-t bg-gray-50 rounded-b-2xl">
                <Button onClick={handleSave} disabled={saving} className="bg-pink-600 hover:bg-pink-700">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                  {editingId ? "Cập nhật" : "Tạo voucher"}
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Hủy</Button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-pink-600" /></div>
        ) : vouchers.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <Ticket className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Chưa có voucher nào</p>
            <p className="text-gray-400 text-sm mt-1">Bấm &quot;Tạo voucher&quot; để bắt đầu</p>
          </div>
        ) : (
          <div className="space-y-3">
            {paginatedVouchers.map((v) => {
              const isExpired = v.endDate && new Date(v.endDate) < new Date();
              const isFull = v.usedCount >= v.usageLimit;
              return (
                <div key={v.id} className={`bg-white rounded-2xl shadow-sm border-2 p-4 flex flex-col sm:flex-row gap-4 items-start transition-all ${!v.active || isExpired || isFull ? "border-gray-100 opacity-60" : "border-pink-100"}`}>
                  {/* Left: ticket visual */}
                  <div className="bg-gradient-to-br from-pink-500 to-rose-600 text-white rounded-xl p-4 min-w-[140px] text-center flex-shrink-0">
                    <div className="text-2xl font-black">
                      {v.discountType === "PERCENT" ? `${v.discountValue}%` : formatPrice(v.discountValue)}
                    </div>
                    <div className="text-xs opacity-80 mt-1">GIẢM GIÁ</div>
                    <div className="mt-2 bg-white/20 rounded-lg px-2 py-1">
                      <span className="font-mono font-bold text-sm tracking-wider">{v.code}</span>
                    </div>
                  </div>

                  {/* Right: info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-bold text-gray-800">{v.description || v.code}</h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {v.minOrderValue > 0 && (
                            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">Đơn từ {formatPrice(v.minOrderValue)}</span>
                          )}
                          {v.maxDiscount && (
                            <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">Tối đa {formatPrice(v.maxDiscount)}</span>
                          )}
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${v.active && !isExpired && !isFull ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                            {isExpired ? "Hết hạn" : isFull ? "Hết lượt" : v.active ? "Đang hoạt động" : "Đã tắt"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Đã dùng: <strong className="text-pink-600">{v.usedCount}/{v.usageLimit}</strong></span>
                      {v.endDate && <span>Hết hạn: {new Date(v.endDate).toLocaleDateString("vi-VN")}</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    <Button size="sm" variant="outline" onClick={() => copyCode(v.code)} className="h-8 text-xs">
                      <Copy className="h-3 w-3 mr-1" /> Copy
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => openEdit(v)} className="h-8 text-xs">
                      <Pencil className="h-3 w-3 mr-1" /> Sửa
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => toggleActive(v)} className="h-8 text-xs">
                      {v.active ? "Tắt" : "Bật"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => deleteVoucher(v.id)} className="h-8 text-xs text-red-500 border-red-200 hover:bg-red-50">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
            <div className="pt-4">
              <Pagination totalPages={totalPages} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
