"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DollarSign } from "lucide-react";
import { toast } from "@/hooks/useToast";
import { useRouter } from "next/navigation";

export default function TestSePayButton({ orderCode, depositAmount }: { orderCode: string, depositAmount: number }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleTest = async () => {
    if (!confirm(`Giả lập SePay nhận ${depositAmount.toLocaleString()}đ cho đơn ${orderCode}?`)) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/webhooks/sepay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `TIN${orderCode.slice(3)}`, // ensure it matches TIN regex
          transferAmount: depositAmount,
          transferType: "in",
        }),
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        toast({
          title: "Giả lập thành công",
          description: "Webhook SePay đã gọi, đơn hàng đã được cập nhật.",
        });
        router.refresh();
      } else {
        throw new Error(data.message || "Lỗi giả lập");
      }
    } catch (err: any) {
      toast({
        title: "Lỗi giả lập",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleTest}
      disabled={loading}
      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors group relative"
      title="Giả lập tiền về (SePay)"
    >
      <DollarSign className={`h-4 w-4 ${loading ? "opacity-50" : ""}`} />
      <span className="absolute hidden group-hover:block w-max bg-gray-800 text-white text-xs px-2 py-1 rounded -top-8 left-1/2 -translate-x-1/2">
        Giả lập SePay
      </span>
    </button>
  );
}
