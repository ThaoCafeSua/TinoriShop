import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST: Khách hàng kiểm tra mã voucher
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { code, subtotal } = body;

  if (!code) {
    return NextResponse.json({ error: "Vui lòng nhập mã voucher" }, { status: 400 });
  }

  const voucher = await prisma.voucher.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (!voucher) {
    return NextResponse.json({ error: "Mã voucher không tồn tại" }, { status: 404 });
  }

  if (!voucher.active) {
    return NextResponse.json({ error: "Mã voucher đã hết hiệu lực" }, { status: 400 });
  }

  const now = new Date();
  if (voucher.startDate && now < voucher.startDate) {
    return NextResponse.json({ error: "Mã voucher chưa đến thời gian sử dụng" }, { status: 400 });
  }

  if (voucher.endDate && now > voucher.endDate) {
    return NextResponse.json({ error: "Mã voucher đã hết hạn" }, { status: 400 });
  }

  if (voucher.usedCount >= voucher.usageLimit) {
    return NextResponse.json({ error: "Mã voucher đã hết lượt sử dụng" }, { status: 400 });
  }

  if (subtotal && subtotal < voucher.minOrderValue) {
    return NextResponse.json({ 
      error: `Đơn hàng tối thiểu ${new Intl.NumberFormat("vi-VN").format(voucher.minOrderValue)}đ để sử dụng mã này` 
    }, { status: 400 });
  }

  // Tính giảm giá
  let discount = 0;
  if (voucher.discountType === "PERCENT") {
    discount = Math.round((subtotal || 0) * voucher.discountValue / 100);
    if (voucher.maxDiscount && discount > voucher.maxDiscount) {
      discount = voucher.maxDiscount;
    }
  } else {
    // FIXED
    discount = voucher.discountValue;
  }

  return NextResponse.json({
    valid: true,
    code: voucher.code,
    description: voucher.description,
    discountType: voucher.discountType,
    discountValue: voucher.discountValue,
    discount,
    maxDiscount: voucher.maxDiscount,
    minOrderValue: voucher.minOrderValue,
  });
}
