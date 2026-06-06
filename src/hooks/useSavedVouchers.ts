"use client";

import { useState, useEffect } from "react";
import { toast } from "@/hooks/useToast";

export function useSavedVouchers() {
  const [savedVouchers, setSavedVouchers] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("tinori_saved_vouchers");
      if (stored) {
        setSavedVouchers(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveVoucher = (code: string) => {
    if (savedVouchers.includes(code)) {
      toast({ title: "Mã giảm giá này đã được lưu từ trước!" });
      return;
    }
    const newSaved = [...savedVouchers, code];
    setSavedVouchers(newSaved);
    localStorage.setItem("tinori_saved_vouchers", JSON.stringify(newSaved));
    toast({ title: "Đã lưu mã giảm giá thành công! ", variant: "success" });
  };

  const isSaved = (code: string) => savedVouchers.includes(code);

  return { savedVouchers, saveVoucher, isSaved };
}
