"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { productSchema, ProductFormData } from "@/lib/validations";
import { toast } from "@/hooks/useToast";
import Image from "next/image";

interface Variant {
  id?: string;
  name: string;
  value: string;
  type: string;
  stock: number;
  price?: number | null;
}

interface Category {
  id: string;
  name: string;
}

interface ProductFormProps {
  categories: Category[];
  product?: {
    id: string;
    name: string;
    description?: string | null;
    price: number;
    salePrice?: number | null;
    stock: number;
    featured: boolean;
    active: boolean;
    categoryId?: string | null;
    images: { id: string; url: string; isPrimary: boolean }[];
    variants: Variant[];
  };
}

export default function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!product;
  const [variants, setVariants] = useState<Variant[]>(product?.variants || []);
  const [images, setImages] = useState<{ url: string; isPrimary: boolean }[]>(
    product?.images || []
  );
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      price: product?.price || 0,
      salePrice: product?.salePrice || null,
      stock: product?.stock || 0,
      categoryId: product?.categoryId || null,
      featured: product?.featured || false,
      active: product?.active !== false,
    },
  });

  const addImage = () => {
    if (!imageUrl.trim()) return;
    setImages([
      ...images,
      { url: imageUrl.trim(), isPrimary: images.length === 0 },
    ]);
    setImageUrl("");
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
      updated[0].isPrimary = true;
    }
    setImages(updated);
  };

  const setPrimary = (index: number) => {
    setImages(images.map((img, i) => ({ ...img, isPrimary: i === index })));
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      { name: "Size", value: "", type: "Size", stock: 0 },
    ]);
  };

  const updateVariant = (index: number, field: keyof Variant, value: string | number) => {
    setVariants(variants.map((v, i) => (i === index ? { ...v, [field]: value } : v)));
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setImages([...images, { url: data.url, isPrimary: images.length === 0 }]);
      }
    } catch {
      toast({ title: "Lỗi tải ảnh", variant: "destructive" });
    }
    setUploading(false);
  };

  const onSubmit = async (data: ProductFormData) => {
    const payload = {
      ...data,
      images,
      variants,
    };

    try {
      const url = isEdit ? `/api/products/${product!.id}` : "/api/products";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Lỗi lưu sản phẩm");
      }

      toast({
        title: isEdit ? "Đã cập nhật sản phẩm" : "Đã thêm sản phẩm",
        variant: "success",
      });
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      toast({
        title: "Lỗi",
        description: err instanceof Error ? err.message : "Vui lòng thử lại",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic info */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-5">Thông tin cơ bản</h2>
        <div className="space-y-4">
          <div>
            <Label className="mb-1.5 block">
              Tên sản phẩm <span className="text-red-500">*</span>
            </Label>
            <Input {...register("name")} placeholder="Tên sản phẩm..." />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label className="mb-1.5 block">Mô tả</Label>
            <textarea
              {...register("description")}
              placeholder="Mô tả sản phẩm..."
              className="flex min-h-[120px] w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2 text-sm transition-colors placeholder:text-gray-400 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block">
                Giá gốc (VND) <span className="text-red-500">*</span>
              </Label>
              <Input
                {...register("price", { valueAsNumber: true })}
                type="number"
                placeholder="150000"
              />
              {errors.price && (
                <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>
              )}
            </div>
            <div>
              <Label className="mb-1.5 block">Giá sale (VND)</Label>
              <Input
                {...register("salePrice", { valueAsNumber: true })}
                type="number"
                placeholder="120000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-1.5 block">Tồn kho</Label>
              <Input
                {...register("stock", { valueAsNumber: true })}
                type="number"
                placeholder="100"
              />
            </div>
            <div>
              <Label className="mb-1.5 block">Danh mục</Label>
              <select
                {...register("categoryId")}
                className="flex h-11 w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2 text-sm focus:border-purple-400 focus:outline-none"
              >
                <option value="">Không có danh mục</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register("featured")}
                className="rounded accent-purple-600 w-4 h-4"
              />
              <span className="text-sm font-medium text-gray-700">Sản phẩm nổi bật</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register("active")}
                className="rounded accent-purple-600 w-4 h-4"
              />
              <span className="text-sm font-medium text-gray-700">Đang bán</span>
            </label>
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-5">Hình ảnh sản phẩm</h2>

        {/* Upload file */}
        <div className="mb-4">
          <label className="flex items-center justify-center gap-2 w-full h-24 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors">
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
            ) : (
              <>
                <Upload className="h-6 w-6 text-gray-400" />
                <span className="text-sm text-gray-500">Tải ảnh lên từ thiết bị</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>

        {/* Or URL */}
        <div className="flex gap-2 mb-4">
          <Input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Hoặc nhập URL ảnh..."
          />
          <Button type="button" onClick={addImage} variant="outline">
            <Plus className="h-4 w-4" />
            Thêm
          </Button>
        </div>

        {/* Image list */}
        {images.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {images.map((img, i) => (
              <div key={i} className="relative group">
                <div
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 ${
                    img.isPrimary ? "border-purple-500" : "border-gray-200"
                  }`}
                >
                  <Image src={img.url} alt="" fill className="object-cover" />
                  {img.isPrimary && (
                    <div className="absolute bottom-0 left-0 right-0 bg-purple-500/80 text-white text-xs py-0.5 text-center">
                      Ảnh chính
                    </div>
                  )}
                </div>
                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!img.isPrimary && (
                    <button
                      type="button"
                      onClick={() => setPrimary(i)}
                      className="bg-purple-500 text-white text-xs rounded-lg px-1.5 py-0.5"
                    >
                      Chính
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="bg-red-500 text-white rounded-lg p-1"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Variants */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Phân loại (Size, Màu sắc, ...)</h2>
          <Button type="button" onClick={addVariant} variant="outline" size="sm">
            <Plus className="h-4 w-4" />
            Thêm
          </Button>
        </div>

        {variants.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            Chưa có phân loại. Nhấn &quot;Thêm&quot; để thêm size/màu sắc.
          </p>
        ) : (
          <div className="space-y-3">
            {variants.map((variant, i) => (
              <div key={i} className="flex gap-2 items-center">
                <select
                  value={variant.type}
                  onChange={(e) => {
                    updateVariant(i, "type", e.target.value);
                    updateVariant(i, "name", e.target.value);
                  }}
                  className="h-10 rounded-xl border-2 border-gray-200 bg-white px-3 text-sm focus:border-purple-400 focus:outline-none w-28"
                >
                  <option value="Size">Size</option>
                  <option value="Màu sắc">Màu sắc</option>
                  <option value="Chất liệu">Chất liệu</option>
                  <option value="Loại">Loại</option>
                </select>
                <Input
                  value={variant.value}
                  onChange={(e) => updateVariant(i, "value", e.target.value)}
                  placeholder="S, M, L / Đỏ, Xanh..."
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={variant.stock}
                  onChange={(e) => updateVariant(i, "stock", parseInt(e.target.value) || 0)}
                  placeholder="Kho"
                  className="w-20"
                />
                <Input
                  type="number"
                  value={variant.price || ""}
                  onChange={(e) =>
                    updateVariant(i, "price", e.target.value ? parseFloat(e.target.value) : 0)
                  }
                  placeholder="Giá riêng"
                  className="w-28"
                />
                <button
                  type="button"
                  onClick={() => removeVariant(i)}
                  className="p-2 text-red-400 hover:text-red-600 flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="flex gap-3">
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Đang lưu...
            </>
          ) : (
            isEdit ? "Cập nhật sản phẩm" : "Thêm sản phẩm"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/products")}
        >
          Hủy
        </Button>
      </div>
    </form>
  );
}
