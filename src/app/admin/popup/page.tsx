"use client";

import { useEffect, useState, useRef } from "react";
import AdminNav from "@/components/AdminNav";
import { Button } from "@/components/ui/button";
import { Loader2, Check, X, Upload } from "lucide-react";
import { toast } from "@/hooks/useToast";

export default function AdminPopupPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    image: "",
    link: "",
    active: false,
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/popup")
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setForm({
            title: data.title || "",
            image: data.image || "",
            link: data.link || "",
            active: data.active || false,
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (form.active && !form.image) {
      toast({ title: "Vui lòng nhập link ảnh để hiển thị popup", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/popup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Lỗi lưu cấu hình");
      toast({ title: "Đã lưu cài đặt Popup thành công" });
    } catch (err: any) {
      toast({ title: "Lỗi", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setForm(f => ({ ...f, image: data.url }));
        toast({ title: "Đã tải ảnh lên" });
      } else {
        throw new Error(data.error || "Lỗi tải ảnh");
      }
    } catch (err: any) {
      toast({ title: "Lỗi", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="lg:pl-64">
      <AdminNav />
      <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-gray-900">Quản lý Popup</h1>
          <p className="text-sm text-gray-500">Hiển thị thông báo, sự kiện nổi bật khi khách hàng vừa vào trang</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-pink-600" /></div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-w-2xl">
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div>
                  <h3 className="font-bold text-gray-800">Trạng thái Popup</h3>
                  <p className="text-xs text-gray-500">Bật để hiển thị popup trên trang chủ của khách hàng</p>
                </div>
                <button
                  onClick={() => setForm((f) => ({ ...f, active: !f.active }))}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${form.active ? "bg-pink-500" : "bg-gray-300"}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${form.active ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tiêu đề (Tùy chọn)</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-pink-400 focus:ring-1 focus:ring-pink-400 outline-none"
                  placeholder="VD: Khuyến mãi tết 2026!"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Ảnh Popup <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  <input
                    value={form.image}
                    onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                    className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-pink-400 focus:ring-1 focus:ring-pink-400 outline-none"
                    placeholder="Dán link ảnh (https://...) hoặc tải lên"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="rounded-xl px-3 border-gray-300"
                  >
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-gray-400 mt-1">Khuyên dùng tỷ lệ 4:5 hoặc 1:1. Có thể tải lên hoặc dùng link ảnh.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Link liên kết (Khi bấm vào ảnh)</label>
                <input
                  value={form.link}
                  onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-pink-400 focus:ring-1 focus:ring-pink-400 outline-none"
                  placeholder="VD: https://tinori.vercel.app/products/xyz"
                />
              </div>

              {form.image && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Xem trước ảnh Popup</label>
                  <div className="w-full max-w-sm mx-auto aspect-[4/5] bg-gray-100 rounded-2xl overflow-hidden border-2 border-dashed border-gray-300 relative group">
                    <img src={form.image} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} onLoad={(e) => (e.currentTarget.style.display = 'block')} />
                    {!form.image && <div className="absolute inset-0 flex items-center justify-center text-gray-400"><X className="h-8 w-8" /></div>}
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 border-t bg-gray-50 flex gap-3">
              <Button onClick={handleSave} disabled={saving} className="bg-pink-600 hover:bg-pink-700">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                Lưu cài đặt
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
