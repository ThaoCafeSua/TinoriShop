import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice, ORDER_STATUS_MAP, PAYMENT_METHOD_MAP } from "@/lib/utils";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const where: any = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { code: { contains: search } },
      { customerName: { contains: search } },
      { customerPhone: { contains: search } },
    ];
  }
  if (startDate || endDate) {
    where.createdAt = {};
    let start = startDate ? new Date(startDate) : null;
    let end = endDate ? new Date(endDate) : null;
    if (start && end && start > end) {
      const temp = start;
      start = end;
      end = temp;
    }
    if (start) where.createdAt.gte = start;
    if (end) {
      end.setHours(23, 59, 59, 999);
      where.createdAt.lte = end;
    }
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      items: { include: { product: true, variant: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Convert to CSV
  const headers = [
    "Mã đơn", "Ngày đặt", "Trạng thái", "Tên khách hàng", "SĐT", "Email", 
    "Tỉnh/Thành phố", "Quận/Huyện", "Phường/Xã", "Địa chỉ", "Ghi chú",
    "Sản phẩm", "Tổng tiền", "Tiền cọc", "Trạng thái cọc", "Phương thức cọc", "Mã vận đơn"
  ];

  const rows = orders.map(order => {
    const itemsStr = order.items.map(item => `${item.product.name}${item.variant ? ` (${item.variant.value})` : ""} x${item.quantity}`).join("; ");
    const createdAt = new Date(order.createdAt).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }).replace(",", "");
    const statusLabel = ORDER_STATUS_MAP[order.status]?.label || order.status;
    const paymentLabel = PAYMENT_METHOD_MAP[order.paymentMethod] || order.paymentMethod;
    const depositStatus = order.depositStatus === "PAID" ? "Đã cọc" : "Chưa cọc";

    return [
      order.code,
      createdAt,
      statusLabel,
      order.customerName,
      `"${order.customerPhone}"`, // Prevent excel scientific notation
      order.customerEmail || "",
      order.province,
      order.district,
      order.ward,
      order.detailedAddress.replace(/,/g, " "),
      (order.note || "").replace(/,/g, " ").replace(/\n/g, " "),
      itemsStr,
      order.totalAmount,
      order.depositAmount,
      depositStatus,
      paymentLabel,
      order.shippingCode || ""
    ].map(col => `"${String(col).replace(/"/g, '""')}"`).join(",");
  });

  const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n"); // Add BOM for excel UTF-8

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="orders_${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
