import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { note } = body;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) return NextResponse.json({ error: "Không tìm thấy đơn hàng" }, { status: 404 });

  if (order.status !== "PENDING_DEPOSIT") {
    return NextResponse.json({ error: "Chỉ có thể xác nhận cọc cho đơn hàng đang chờ cọc" }, { status: 400 });
  }

  if (order.depositStatus === "PAID") {
    return NextResponse.json({ error: "Đơn hàng đã được xác nhận cọc trước đó" }, { status: 400 });
  }

  const updated = await prisma.order.update({
    where: { id },
    data: {
      depositStatus: "PAID",
      depositPaidAt: new Date(),
      depositNote: note || null,
      status: "CONFIRMED",
    },
  });

  if (order.customerEmail) {
    import("@/lib/email").then(({ sendDepositConfirmedEmail }) => {
      sendDepositConfirmedEmail(order.customerEmail!, order.code, order.customerName).catch(console.error);
    }).catch(console.error);
  }

  return NextResponse.json(updated);
}
