import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET: Lấy danh sách voucher (admin) hoặc voucher active (khách)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const activeOnly = searchParams.get("active");

  const where: any = {};
  if (activeOnly === "true") {
    where.active = true;
    where.OR = [
      { endDate: null },
      { endDate: { gte: new Date() } },
    ];
    where.startDate = { lte: new Date() };
  }

  let vouchers = await prisma.voucher.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  if (activeOnly === "true") {
    vouchers = vouchers.filter(v => v.usageLimit === 0 || v.usedCount < v.usageLimit);
  }

  return NextResponse.json(vouchers);
}

// POST: Admin tạo voucher mới
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { code, description, discountType, discountValue, minOrderValue, maxDiscount, usageLimit, active, startDate, endDate } = body;

  if (!code || !discountValue) {
    return NextResponse.json({ error: "Thiếu mã voucher hoặc giá trị giảm" }, { status: 400 });
  }

  const numDiscountValue = Number(discountValue);
  const numMinOrderValue = Number(minOrderValue || 0);
  const numMaxDiscount = maxDiscount ? Number(maxDiscount) : null;
  const numUsageLimit = Number(usageLimit || 0);
  const startD = startDate ? new Date(startDate) : new Date();
  const endD = endDate ? new Date(endDate) : null;

  if (numDiscountValue <= 0) return NextResponse.json({ error: "Giá trị giảm phải > 0" }, { status: 400 });
  if (discountType === "PERCENT" && numDiscountValue > 100) return NextResponse.json({ error: "Giảm % không quá 100" }, { status: 400 });
  if (discountType === "PERCENT" && !numMaxDiscount) return NextResponse.json({ error: "Giảm % yêu cầu giá trị giảm tối đa" }, { status: 400 });
  if (endD && endD < startD) return NextResponse.json({ error: "Ngày kết thúc phải sau ngày bắt đầu" }, { status: 400 });

  // Check trùng mã
  const existing = await prisma.voucher.findUnique({ where: { code: code.toUpperCase() } });
  if (existing) {
    return NextResponse.json({ error: "Mã voucher đã tồn tại" }, { status: 400 });
  }

  const voucher = await prisma.voucher.create({
    data: {
      code: code.toUpperCase(),
      description: description || null,
      discountType: discountType || "FIXED",
      discountValue: numDiscountValue,
      minOrderValue: numMinOrderValue,
      maxDiscount: numMaxDiscount,
      usageLimit: numUsageLimit,
      active: active ?? true,
      startDate: startD,
      endDate: endD,
    },
  });

  return NextResponse.json(voucher, { status: 201 });
}
