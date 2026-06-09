import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const { searchParams } = new URL(req.url);
  const phone = searchParams.get("phone");

  const session = await getServerSession(authOptions);
  const isAdmin = session && (session.user as any).role === "admin";

  if (!isAdmin && !phone) {
    return NextResponse.json({ error: "Không tìm thấy đơn hàng" }, { status: 403 });
  }

  const order = await prisma.order.findUnique({
    where: { code: code.toUpperCase() },
    include: {
      items: {
        include: {
          product: { include: { images: { where: { isPrimary: true }, take: 1 } } },
          variant: true,
        },
      },
    },
  });

  if (!order) return NextResponse.json({ error: "Không tìm thấy đơn hàng" }, { status: 403 });

  if (!isAdmin) {
    if (!order.customerPhone.endsWith(phone as string)) {
      return NextResponse.json({ error: "Không tìm thấy đơn hàng" }, { status: 403 });
    }
  }

  return NextResponse.json(order);
}
