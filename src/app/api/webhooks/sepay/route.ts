import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendDepositConfirmedEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Payload mẫu của SePay:
    // { gateway, transactionDate, accountNumber, code, content, transferType, transferAmount, ... }
    
    const { content, transferAmount, transferType } = data;
    
    // Chỉ xử lý giao dịch nhận tiền
    if (transferType === "out" || Number(transferAmount) <= 0) {
      return NextResponse.json({ success: true, message: "Bỏ qua giao dịch rút tiền" });
    }

    if (!content) {
      return NextResponse.json({ success: true, message: "Không có nội dung chuyển khoản" });
    }

    // Tìm mã đơn hàng bắt đầu bằng "TIN" trong nội dung
    const match = content.match(/TIN[A-Z0-9]+/i);
    if (!match) {
      return NextResponse.json({ success: true, message: "Không tìm thấy mã đơn hàng (TIN...)" });
    }

    const orderCode = match[0].toUpperCase();

    const order = await prisma.order.findUnique({
      where: { code: orderCode }
    });

    if (!order) {
      return NextResponse.json({ success: true, message: "Đơn hàng không tồn tại" });
    }

    if (order.status !== "PENDING_DEPOSIT" && order.status !== "CANCELLED") {
      return NextResponse.json({ success: true, message: "Đơn hàng đã được xử lý" });
    }

    if (Number(transferAmount) < order.depositAmount) {
      return NextResponse.json({ success: true, message: "Số tiền cọc không đủ" });
    }

    // Cập nhật trạng thái đơn hàng tự động
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "PENDING_CONFIRM", // Đã cọc -> Chuyển sang chờ shop xác nhận đơn
        depositStatus: "PAID",
        depositNote: content,
        cancelledAt: null // Xóa ngày hủy nếu có
      }
    });

    // Nếu đơn hàng từng bị hủy (do quá hạn), ta phải trừ lại tồn kho vì nó vừa được sống lại
    if (order.status === "CANCELLED") {
      const orderWithItems = await prisma.order.findUnique({ where: { id: order.id }, include: { items: true } });
      if (orderWithItems) {
        for (const item of orderWithItems.items) {
          if (item.variantId) {
            await prisma.productVariant.update({ where: { id: item.variantId }, data: { stock: { decrement: item.quantity } } });
          } else {
            await prisma.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } });
          }
        }
      }
    }

    if (order.customerEmail) {
      // Gửi email báo cọc thành công
      // Ở đây truyền tracking code và link rỗng vì chưa có mã vận đơn
      sendDepositConfirmedEmail(order.customerEmail, order.code, "Sẽ cập nhật sau", "").catch(console.error);
    }

    return NextResponse.json({ success: true, message: "Xác nhận cọc tự động thành công" });
  } catch (error) {
    console.error("SePay Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
