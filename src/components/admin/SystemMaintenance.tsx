"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, Clock, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/useToast";

export default function SystemMaintenance() {
  const [runningCron, setRunningCron] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);

  const runCron = async () => {
    setRunningCron(true);
    try {
      const res = await fetch("/api/cron/check-orders");
      const data = await res.json();
      if (res.ok) {
        toast({
          title: "Đã chạy Cron Job",
          description: `Đã nhắc ${data.reminded} đơn, hủy ${data.cancelled} đơn.`,
        });
      } else {
        throw new Error(data.error || "Lỗi khi chạy Cron");
      }
    } catch (err: any) {
      toast({ title: "Lỗi", description: err.message, variant: "destructive" });
    } finally {
      setRunningCron(false);
    }
  };

  const testEmail = async () => {
    const email = prompt("Nhập email để nhận test:");
    if (!email) return;

    setTestingEmail(true);
    try {
      const res = await fetch("/api/admin/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: "Đã gửi email test", description: "Vui lòng kiểm tra hộp thư (cả mục Spam)" });
      } else {
        throw new Error(data.error || "Lỗi khi gửi email");
      }
    } catch (err: any) {
      toast({ title: "Lỗi", description: err.message, variant: "destructive" });
    } finally {
      setTestingEmail(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-pink-100">
      <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
        <RefreshCw className="h-5 w-5 text-pink-600" />
        Hệ thống & Bảo trì
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-pink-50 rounded-xl border border-pink-100">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="h-5 w-5 text-pink-600" />
            <h3 className="font-bold text-gray-800">Kiểm tra đơn hàng (Cron)</h3>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Quét các đơn hàng chưa cọc để gửi email nhắc nhở (sau 1 tiếng) hoặc tự động hủy (sau 24 tiếng).
          </p>
          <Button 
            onClick={runCron} 
            disabled={runningCron}
            className="w-full bg-pink-600 hover:bg-pink-700"
          >
            {runningCron ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Chạy kiểm tra ngay
          </Button>
        </div>

        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
          <div className="flex items-center gap-3 mb-2">
            <Mail className="h-5 w-5 text-blue-600" />
            <h3 className="font-bold text-gray-800">Kiểm tra Email (SMTP)</h3>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Gửi một email thử nghiệm để đảm bảo cấu hình SMTP của bạn đang hoạt động bình thường.
          </p>
          <Button 
            onClick={testEmail} 
            disabled={testingEmail}
            variant="outline"
            className="w-full border-blue-300 text-blue-700 hover:bg-blue-100"
          >
            {testingEmail ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
            Gửi email thử nghiệm
          </Button>
        </div>
      </div>
    </div>
  );
}
