"use client";

import { Download } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function ExportOrdersButton() {
  const searchParams = useSearchParams();

  const handleExport = () => {
    const params = new URLSearchParams(searchParams.toString());
    window.location.href = `/api/admin/orders/export?${params.toString()}`;
  };

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center justify-center gap-2 bg-green-600 text-white font-bold px-4 py-2 rounded-xl shadow-md hover:bg-green-700 transition-colors h-[40px]"
    >
      <Download className="h-4 w-4" /> Xuất CSV
    </button>
  );
}
