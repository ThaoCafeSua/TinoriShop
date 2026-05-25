"use client";

import { useEffect, useState, useRef } from "react";
import AdminNav from "@/components/AdminNav";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash2, ExternalLink, ImageIcon, X, Check, Upload } from "lucide-react";
import { toast } from "@/hooks/useToast";
import { useSearchParams } from "next/navigation";
import Pagination from "@/components/admin/Pagination";
import { Suspense } from "react";

interface Banner {
  id: string;
  image: string;
  link?: string | null;
  active: boolean;
  order: number;
}

export default function AdminBannersPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-pink-500" /></div>}>
      <AdminBannersContent />
    </Suspense>
  );
}

function AdminBannersContent() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ image: "", link: "" });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const limit = 20;

  const fetchBanners = async () => {
    try {
      const res = await fetch("/api/banners");
      if (!res.ok) throw new Error("Lỗi tải banners");
      const data = await res.json();
      setBanners(Array.isArray(data) ? data : []);
    } catch {
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBanners(); }, []);

  const handleSaveBanner = async () => {
    const image = form.image.trim();
    const link = form.link.trim();

    if (!image) {
      toast({ title: "Vui lòng nhập link ảnh hoặc tải ảnh lên", variant: "destructive" });
      return;
    }

    if (link && !link.startsWith("http") && !link.startsWith("/")) {
      toast({ title: "Link liên kết không hợp lệ (phải bắt đầu bằng http hoặc /)", variant: "destructive" });
      return;
    }
    
    setSaving(true);
    try {
      await fetch("/api/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: form.image, link: form.link || null, order: banners.length }),
      });
      toast({ title: "Đã thêm banner" });
      setShowForm(false);
      setForm({ image: "", link: "" });
      fetchBanners();
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

  const toggleActive = async (banner: Banner) => {
    await fetch(`/api/banners/${banner.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...banner, active: !banner.active }),
    });
    fetchBanners();
  };

  const deleteBanner = async (id: string) => {
    if (!confirm("Xóa banner này?")) return;
    await fetch(`/api/banners/${id}`, { method: "DELETE" });
    toast({ title: "Đã xóa banner" });
    fetchBanners();
  };

  const totalPages = Math.ceil(banners.length / limit);
  const paginatedBanners = banners.slice((page - 1) * limit, page * limit);

  return (
    <div className="lg:pl-64">
      <AdminNav />
      <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Quản lý Banner</h1>
            <p className="text-sm text-gray-500">Ảnh vòng quay hiển thị trên trang chủ</p>
          </div>
          <div>
            <Button onClick={() => setShowForm(true)} className="bg-pink-600 hover:bg-pink-700">
              <Plus className="h-4 w-4 mr-2" />
              Thêm banner
            </Button>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b">
                <h2 className="font-bold text-lg text-gray-900">Thêm banner mới</h2>
                <button onClick={() => setShowForm(false)}><X className="h-5 w-5 text-gray-500 hover:text-gray-700" /></button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <div className="flex gap-2">
                    <input
                      value={form.image}
                      onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
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
                  <p className="text-xs text-gray-400 mt-1">Khuyến nghị: Tải ảnh lên hoặc dùng link từ Facebook, Imgur, v.v.</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Link chuyển hướng (Khi bấm vào banner)</label>
                  <input
                    value={form.link}
                    onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-pink-400 focus:ring-1 focus:ring-pink-400 outline-none"
                    placeholder="Tùy chọn. VD: https://tinori.vn/products"
                  />
                </div>
                
                {form.image && (
                  <div className="mt-4 aspect-video bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                     <img src={form.image} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} onLoad={(e) => (e.currentTarget.style.display = 'block')} />
                  </div>
                )}
              </div>
              <div className="flex gap-3 p-5 border-t bg-gray-50">
                <Button onClick={handleSaveBanner} disabled={saving} className="bg-pink-600 hover:bg-pink-700 w-full sm:w-auto">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                  Lưu banner
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)} className="w-full sm:w-auto">Hủy</Button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-pink-600" /></div>
        ) : banners.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Chưa có banner nào</p>
            <p className="text-gray-400 text-sm mt-1">Bấm "Thêm banner" để tải ảnh lên</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedBanners.map((banner) => (
              <div key={banner.id} className={`bg-white rounded-2xl shadow-sm overflow-hidden border-2 transition-all ${banner.active ? "border-pink-200" : "border-gray-200 opacity-60"}`}>
                <div className="relative aspect-video bg-gray-100">
                  <img src={banner.image} alt="Banner" className="w-full h-full object-cover" />
                  <div className={`absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded-full ${banner.active ? "bg-green-500 text-white" : "bg-gray-400 text-white"}`}>
                    {banner.active ? "Hiển thị" : "Ẩn"}
                  </div>
                </div>
                <div className="p-3 flex items-center justify-between gap-2">
                  <div className="text-xs text-gray-500 truncate flex-1">
                    {banner.link ? (
                      <a href={banner.link} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-500 hover:underline">
                        <ExternalLink className="h-3 w-3" /> {banner.link}
                      </a>
                    ) : "Không có link"}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => toggleActive(banner)} className="text-xs h-8">
                      {banner.active ? "Ẩn" : "Hiện"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => deleteBanner(banner.id)} className="text-xs h-8 text-red-500 border-red-200 hover:bg-red-50">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            </div>
            <Pagination totalPages={totalPages} />
          </div>
        )}
      </div>
    </div>
  );
}
