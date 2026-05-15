import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          code: `TNR${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000)}`,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          customerEmail: data.customerEmail,
          province: data.province || "N/A",
          district: data.district || "N/A",
          ward: data.ward || "N/A",
          detailedAddress: data.detailedAddress,
          note: data.note,
          subtotal: data.totalAmount - data.shippingFee,
          shippingFee: data.shippingFee,
          depositAmount: data.depositAmount,
          totalAmount: data.totalAmount,
          status: data.status,
          paymentMethod: data.paymentMethod,
          depositStatus: data.depositAmount === 0 ? "PAID" : "PENDING",
          items: {
            create: data.items.map((item: any) => ({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: { items: true },
      });

      // Deduct stock
      for (const item of data.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      return newOrder;
    });

    return NextResponse.json(order);
  } catch (error: any) {
    console.error("Admin create order error:", error);
    return NextResponse.json({ error: error.message || "Lỗi tạo đơn hàng" }, { status: 500 });
  }
}
