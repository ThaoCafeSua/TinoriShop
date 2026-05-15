"use client";

import { useEffect, useState, useRef } from "react";
import AdminNav from "@/components/AdminNav";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash2, GripVertical, ExternalLink, ImageIcon } from "lucide-react";
import { toast } from "@/hooks/useToast";

interface Banner {
  id: string;
  image: string;
  link?: string | null;
  active: boolean;
  order: number;
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload-public", { method: "POST", body: form });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const link = prompt("Nhập link khi bấm vào banner (tùy chọn, để trống nếu không cần):");

      await fetch("/api/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: data.url, link: link || null, order: banners.length }),
      });
      toast({ title: "Đã thêm banner" });
      fetchBanners();
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
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            <Button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="bg-pink-600 hover:bg-pink-700">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Thêm banner
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-pink-600" /></div>
        ) : banners.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Chưa có banner nào</p>
            <p className="text-gray-400 text-sm mt-1">Bấm "Thêm banner" để tải ảnh lên</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {banners.map((banner) => (
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
        )}
      </div>
    </div>
  );
}
