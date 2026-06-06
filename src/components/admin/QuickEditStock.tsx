"use client";

import { useState } from "react";
import { Check, Edit2, Loader2, X } from "lucide-react";
import { toast } from "@/hooks/useToast";
import { useRouter } from "next/navigation";

export default function QuickEditStock({ id, initialStock }: { id: string, initialStock: number }) {
  const [isEditing, setIsEditing] = useState(false);
  const [stock, setStock] = useState(initialStock);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/products/quick-edit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, stock: Number(stock) })
      });
      if (res.ok) {
        toast({ title: "Cập nhật tồn kho thành công" });
        setIsEditing(false);
        router.refresh();
      } else {
        toast({ title: "Lỗi cập nhật", variant: "destructive" });
        setStock(initialStock);
      }
    } catch {
      toast({ title: "Lỗi hệ thống", variant: "destructive" });
      setStock(initialStock);
    } finally {
      setIsLoading(false);
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center justify-center gap-1">
        <input 
          type="number" 
          value={stock} 
          onChange={(e) => setStock(Number(e.target.value))}
          className="w-16 border rounded px-1 py-0.5 text-sm text-center outline-none focus:border-pink-500"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') { setIsEditing(false); setStock(initialStock); }
          }}
        />
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-pink-500" />
        ) : (
          <>
            <button onClick={handleSave} className="text-green-600 hover:bg-green-50 p-1 rounded"><Check className="h-4 w-4" /></button>
            <button onClick={() => { setIsEditing(false); setStock(initialStock); }} className="text-red-500 hover:bg-red-50 p-1 rounded"><X className="h-4 w-4" /></button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2 group cursor-pointer" onClick={() => setIsEditing(true)}>
      <span className={`text-sm font-semibold ${initialStock > 10 ? "text-green-600" : initialStock > 0 ? "text-yellow-600" : "text-red-600"}`}>
        {initialStock}
      </span>
      <button className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-pink-600">
        <Edit2 className="h-3 w-3" />
      </button>
    </div>
  );
}
