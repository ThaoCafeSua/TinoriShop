import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET: Chi tiết voucher
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const voucher = await prisma.voucher.findUnique({ where: { id } });
  if (!voucher) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  return NextResponse.json(voucher);
}

// PUT: Admin cập nhật voucher
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { code, description, discountType, discountValue, minOrderValue, maxDiscount, usageLimit, active, startDate, endDate } = body;

  const updateData: any = {};
  if (code !== undefined) updateData.code = code.toUpperCase();
  if (description !== undefined) updateData.description = description || null;
  if (discountType !== undefined) updateData.discountType = discountType;
  if (discountValue !== undefined) updateData.discountValue = Number(discountValue);
  if (minOrderValue !== undefined) updateData.minOrderValue = Number(minOrderValue);
  if (maxDiscount !== undefined) updateData.maxDiscount = maxDiscount ? Number(maxDiscount) : null;
  if (usageLimit !== undefined) updateData.usageLimit = Number(usageLimit);
  if (active !== undefined) updateData.active = active;
  if (startDate !== undefined) updateData.startDate = new Date(startDate);
  if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;

  // Validation
  if (updateData.discountValue !== undefined && updateData.discountValue <= 0) {
    return NextResponse.json({ error: "Giá trị giảm phải > 0" }, { status: 400 });
  }
  if (updateData.discountType === "PERCENT" && updateData.discountValue > 100) {
    return NextResponse.json({ error: "Giảm % không quá 100" }, { status: 400 });
  }
  if (updateData.endDate && updateData.startDate && new Date(updateData.endDate) < new Date(updateData.startDate)) {
    return NextResponse.json({ error: "Ngày kết thúc phải sau ngày bắt đầu" }, { status: 400 });
  }

  const voucher = await prisma.voucher.update({ where: { id }, data: updateData });
  return NextResponse.json(voucher);
}

// DELETE: Admin xóa voucher
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await prisma.voucher.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
