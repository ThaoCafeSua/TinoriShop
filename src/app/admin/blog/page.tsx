"use client";

import { useEffect, useState, useRef } from "react";
import AdminNav from "@/components/AdminNav";
import { Button } from "@/components/ui/button";
import {
  Loader2, Plus, Pencil, Trash2, ImageIcon, X, Check, Newspaper
} from "lucide-react";
import { toast } from "@/hooks/useToast";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  image?: string | null;
  videoUrl?: string | null;
  active: boolean;
  createdAt: string;
}

const emptyForm = { title: "", content: "", image: "" as string | null, videoUrl: "" as string | null, active: true };

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/blog-posts");
      if (!res.ok) throw new Error("Lỗi tải tin tức");
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (post: BlogPost) => {
    setEditingId(post.id);
    setForm({ 
      title: post.title, 
      content: post.content, 
      image: post.image ?? "", 
      videoUrl: post.videoUrl ?? "",
      active: post.active 
    });
    setShowForm(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload-public", { method: "POST", body: fd });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setForm(f => ({ ...f, image: data.url }));
    } catch (err: any) {
      toast({ title: "Lỗi upload ảnh", description: err.message, variant: "destructive" });
    } finally {
      setUploadingImg(false);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast({ title: "Vui lòng nhập tiêu đề và nội dung", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const url = editingId ? `/api/blog-posts/${editingId}` : "/api/blog-posts";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Lỗi lưu tin tức");
      toast({ title: editingId ? "Đã cập nhật" : "Đã thêm tin tức" });
      setShowForm(false);
      fetchPosts();
    } catch (err: any) {
      toast({ title: "Lỗi", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const deletePost = async (id: string) => {
    if (!confirm("Xóa tin tức này?")) return;
    await fetch(`/api/blog-posts/${id}`, { method: "DELETE" });
    toast({ title: "Đã xóa" });
    fetchPosts();
  };

  const toggleActive = async (post: BlogPost) => {
    await fetch(`/api/blog-posts/${post.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...post, active: !post.active }),
    });
    fetchPosts();
  };

  return (
    <div className="lg:pl-64">
      <AdminNav />
      <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Quản lý Tin tức</h1>
            <p className="text-sm text-gray-500">Tin tức & sự kiện hiển thị trên trang chủ</p>
          </div>
          <Button onClick={openCreate} className="bg-pink-600 hover:bg-pink-700">
            <Plus className="h-4 w-4 mr-2" /> Thêm tin tức
          </Button>
        </div>

        {/* Form modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-5 border-b">
                <h2 className="font-bold text-lg text-gray-900">{editingId ? "Sửa tin tức" : "Thêm tin tức mới"}</h2>
                <button onClick={() => setShowForm(false)}><X className="h-5 w-5 text-gray-500 hover:text-gray-700" /></button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Tiêu đề <span className="text-red-500">*</span></label>
                  <input
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-pink-400 focus:ring-1 focus:ring-pink-400 outline-none"
                    placeholder="VD: Tinori ra mắt bộ sưu tập mới~"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Ảnh bìa</label>
                  <div className="flex gap-3 items-start">
                    {form.image && (
                      <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-pink-200 flex-shrink-0">
                        <img src={form.image} alt="preview" className="w-full h-full object-cover" />
                        <button onClick={() => setForm(f => ({ ...f, image: null }))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                    <div>
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                      <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploadingImg}>
                        {uploadingImg ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ImageIcon className="h-4 w-4 mr-2" />}
                        {form.image ? "Đổi ảnh" : "Tải ảnh lên"}
                      </Button>
                      <p className="text-xs text-gray-400 mt-1">Khuyến nghị: 1200×630px</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Video URL (YouTube/TikTok)</label>
                  <input
                    value={form.videoUrl || ""}
                    onChange={e => setForm(f => ({ ...f, videoUrl: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-pink-400 focus:ring-1 focus:ring-pink-400 outline-none"
                    placeholder="VD: https://www.youtube.com/watch?v=..."
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Dán link video từ YouTube hoặc TikTok để hiển thị trong bài viết.</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nội dung <span className="text-red-500">*</span></label>
                  <textarea
                    value={form.content}
                    onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                    rows={6}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:border-pink-400 focus:ring-1 focus:ring-pink-400 outline-none resize-none"
                    placeholder="Viết nội dung tin tức tại đây..."
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-sm font-semibold text-gray-700">Hiển thị:</label>
                  <button
                    onClick={() => setForm(f => ({ ...f, active: !f.active }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.active ? "bg-pink-500" : "bg-gray-300"}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.active ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                  <span className="text-sm text-gray-500">{form.active ? "Đang hiển thị" : "Đang ẩn"}</span>
                </div>
              </div>
              <div className="flex gap-3 p-5 border-t bg-gray-50 rounded-b-2xl">
                <Button onClick={handleSave} disabled={saving} className="bg-pink-600 hover:bg-pink-700">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                  {editingId ? "Cập nhật" : "Đăng tin"}
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Hủy</Button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-pink-600" /></div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <div className="text-gray-300 mb-4"><Newspaper className="h-12 w-12 mx-auto" /></div>
            <p className="text-gray-500 font-medium">Chưa có tin tức nào</p>
            <p className="text-gray-400 text-sm mt-1">Bấm "Thêm tin tức" để bắt đầu</p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <div key={post.id} className={`bg-white rounded-2xl shadow-sm border-2 p-4 flex gap-4 items-start transition-all ${post.active ? "border-pink-100" : "border-gray-100 opacity-60"}`}>
                {post.image ? (
                  <img src={post.image} alt={post.title} className="w-20 h-20 rounded-xl object-cover flex-shrink-0 border border-gray-100" />
                ) : (
                  <div className="w-20 h-20 bg-pink-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Newspaper className="h-8 w-8 text-pink-200" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-gray-800 leading-tight">{post.title}</h3>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${post.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {post.active ? "Hiển thị" : "Ẩn"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{post.content}</p>
                  <p className="text-xs text-gray-400 mt-2">{new Date(post.createdAt).toLocaleDateString("vi-VN")}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(post)} className="h-8 text-xs">
                    <Pencil className="h-3 w-3 mr-1" /> Sửa
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toggleActive(post)} className="h-8 text-xs">
                    {post.active ? "Ẩn" : "Hiện"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => deletePost(post.id)} className="h-8 text-xs text-red-500 border-red-200 hover:bg-red-50">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
