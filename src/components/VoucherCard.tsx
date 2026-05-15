"use client";

import { useSavedVouchers } from "@/hooks/useSavedVouchers";

interface VoucherProps {
  voucher: {
    id: string;
    code: string;
    discountType: string;
    discountValue: number;
    minOrderValue: number;
  };
}

export default function VoucherCard({ voucher: v }: VoucherProps) {
  const { saveVoucher, isSaved } = useSavedVouchers();
  const saved = isSaved(v.code);

  return (
    <div className="group relative bg-white rounded-lg overflow-hidden flex flex-col border border-pink-100 hover:border-pink-300 transition-colors shadow-[0_2px_8px_-3px_rgba(213,60,131,0.1)]">
      <div className="flex h-full">
        {/* Left Part: Discount Value */}
        <div className="w-16 flex-shrink-0 bg-[#fff5f8] flex flex-col items-center justify-center border-r border-dashed border-pink-200 p-2">
          <div className="text-sm font-black text-[#d53c83]">
            {v.discountType === "PERCENT" ? `${v.discountValue}%` : (v.discountValue / 1000) + 'k'}
          </div>
          <div className="text-[9px] font-bold text-[#9a7182] uppercase">Giảm</div>
        </div>
        
        {/* Right Part: Code & Min Order */}
        <div className="flex-1 p-3 flex flex-col justify-center min-w-0">
          <div className="font-mono font-bold text-xs text-[#d53c83] tracking-tight bg-white px-1.5 py-0.5 rounded border border-pink-100 truncate inline-block w-fit mb-1">
            {v.code}
          </div>
          <div className="text-[10px] text-gray-500 truncate mb-2">
            {v.minOrderValue > 0 ? `Đơn từ ${(v.minOrderValue / 1000)}k` : 'Mọi đơn hàng'}
          </div>
          
          <button 
            onClick={() => saveVoucher(v.code)}
            disabled={saved}
            className={`text-[10px] font-bold py-1 px-3 rounded-full self-start transition-all ${
              saved 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-pink-500 text-white hover:bg-pink-600 active:scale-95 shadow-sm'
            }`}
          >
            {saved ? 'Đã lưu' : 'Lưu mã'}
          </button>
        </div>

        {/* Decorative Half Circles */}
        <div className="absolute left-[60px] -top-1.5 w-3 h-3 bg-white border border-pink-100 rounded-full" />
        <div className="absolute left-[60px] -bottom-1.5 w-3 h-3 bg-white border border-pink-100 rounded-full" />
      </div>
    </div>
  );
}
