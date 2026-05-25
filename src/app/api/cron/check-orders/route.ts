import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendDepositReminderEmail, sendOrderCancelledEmail } from "@/lib/email";

// API này được gọi định kỳ (mỗi phút) để:
// 1. Gửi email nhắc cọc sau 60 phút (1 tiếng)
// 2. Tự động hủy đơn sau 1440 phút (24 tiếng) nếu chưa có cọc
export async function GET() {
  const now = new Date();

  // Tìm đơn PENDING_DEPOSIT chưa bị hủy
  const pendingOrders = await prisma.order.findMany({
    where: {
      status: "PENDING_DEPOSIT",
      depositStatus: "PENDING",
    },
    include: {
      items: true,
    }
  });

  let reminded = 0;
  let cancelled = 0;

  for (const order of pendingOrders) {
    const createdAt = new Date(order.createdAt);
    const minutesPassed = (now.getTime() - createdAt.getTime()) / (1000 * 60);

    // Sau 24 tiếng (1440 phút) → hủy đơn nếu chưa có cọc
    if (minutesPassed >= 1440) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "CANCELLED",
          cancelledAt: now,
        },
      });

      // Hoàn trả tồn kho
      for (const item of order.items) {
        if (item.variantId) {
          await prisma.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } }
          });
        } else {
          await prisma.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } }
          });
        }
      }

      // Hoàn trả lượt dùng voucher
      if (order.voucherCode) {
        await prisma.voucher.updateMany({
          where: { code: order.voucherCode },
          data: { usedCount: { decrement: 1 } }
        });
      }

      // Gửi email hủy đơn
      if (order.customerEmail) {
        sendOrderCancelledEmail(order.customerEmail, order.code).catch(console.error);
      }
      cancelled++;
      continue;
    }

    // Sau 60 phút (1 tiếng) → gửi email nhắc cọc (chỉ gửi 1 lần)
    if (minutesPassed >= 60 && !order.reminderSentAt) {
      if (order.customerEmail) {
        sendDepositReminderEmail(order.customerEmail, order.code).catch(console.error);
      }

      await prisma.order.update({
        where: { id: order.id },
        data: { reminderSentAt: now },
      });
      reminded++;
    }
  }

  return NextResponse.json({
    success: true,
    processed: pendingOrders.length,
    reminded,
    cancelled,
    timestamp: now.toISOString(),
  });
}
