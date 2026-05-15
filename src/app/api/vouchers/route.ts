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

  const vouchers = await prisma.voucher.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(vouchers);
}

// POST: Admin tạo voucher mới
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { code, description, discountType, discountValue, minOrderValue, maxDiscount, usageLimit, active, startDate, endDate } = body;

  if (!code || !discountValue) {
    return NextResponse.json({ error: "Thiếu mã voucher hoặc giá trị giảm" }, { status: 400 });
  }

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
      discountValue: Number(discountValue),
      minOrderValue: Number(minOrderValue || 0),
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      usageLimit: Number(usageLimit || 100),
      active: active ?? true,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
    },
  });

  return NextResponse.json(voucher, { status: 201 });
}
