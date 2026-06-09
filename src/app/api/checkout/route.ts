import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOrderCode, calculateShippingFee } from "@/lib/utils";
import { vnPhoneRegex } from "@/lib/validations";
import { sendOrderConfirmationEmail, sendNewOrderAdminEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerName,
      customerPhone,
      customerEmail,
      provinceCode,
      provinceName,
      districtCode,
      districtName,
      wardCode,
      wardName,
      detailedAddress,
      note,
      paymentMethod,
      items,
      totalAmount,
      voucherCode,
    } = body;

    if (!customerName || !customerPhone || !provinceName || !districtName || !wardName || !detailedAddress) {
      return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }

    if (!vnPhoneRegex.test(customerPhone)) {
      return NextResponse.json({ error: "Số điện thoại không hợp lệ" }, { status: 400 });
    }

    if (!provinceCode || !districtCode || !wardCode) {
      return NextResponse.json({ error: "Vui lòng chọn đầy đủ địa chỉ tỉnh/huyện/xã" }, { status: 400 });
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Giỏ hàng trống" }, { status: 400 });
    }

    const MIN_ORDER_AMOUNT = 200000;
    let calculatedSubtotal = 0;
    const verifiedItems: any[] = [];

    // Pre-check products and calculate subtotal
    for (const item of items) {
      const product = await prisma.product.findUnique({ 
        where: { id: item.productId },
        include: { variants: true }
      });
      
      if (!product || !product.active) {
        return NextResponse.json({ error: `Sản phẩm ${item.productId} không tồn tại hoặc đã ngừng bán` }, { status: 400 });
      }

      let unitPrice = product.salePrice || product.price;

      if (item.variantId) {
        const variant = product.variants.find(v => v.id === item.variantId);
        if (!variant) {
          return NextResponse.json({ error: "Phân loại sản phẩm không hợp lệ" }, { status: 400 });
        }
        if (variant.stock < Number(item.quantity)) {
          return NextResponse.json({ error: `Sản phẩm ${product.name} (${variant.value}) chỉ còn ${variant.stock} sản phẩm` }, { status: 400 });
        }
        unitPrice = variant.salePrice || variant.price || unitPrice;
      } else {
        if (product.stock < Number(item.quantity)) {
          return NextResponse.json({ error: `Sản phẩm ${product.name} chỉ còn ${product.stock} sản phẩm` }, { status: 400 });
        }
      }

      calculatedSubtotal += unitPrice * Number(item.quantity);
      
      verifiedItems.push({
        productId: item.productId,
        variantId: item.variantId || null,
        quantity: Number(item.quantity),
        price: unitPrice,
      });
    }

    if (calculatedSubtotal < MIN_ORDER_AMOUNT) {
      return NextResponse.json({ error: `Đơn hàng tối thiểu ${MIN_ORDER_AMOUNT.toLocaleString('vi-VN')}đ. Vui lòng thêm sản phẩm.` }, { status: 400 });
    }

    // Execute transaction for stock decrement, voucher update, and order creation
    const order = await prisma.$transaction(async (tx) => {
      // 1. Trừ tồn kho (với điều kiện kiểm tra >= quantity)
      for (const item of verifiedItems) {
        if (item.variantId) {
          const updated = await tx.productVariant.updateMany({
            where: { id: item.variantId, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } }
          });
          if (updated.count === 0) {
            throw new Error(`Sản phẩm phân loại ID ${item.variantId} không đủ số lượng.`);
          }
        } else {
          const updated = await tx.product.updateMany({
            where: { id: item.productId, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } }
          });
          if (updated.count === 0) {
            throw new Error(`Sản phẩm ID ${item.productId} không đủ số lượng.`);
          }
        }
      }

      // 2. Xử lý voucher
      let voucherDiscount = 0;
      let appliedVoucherCode: string | null = null;

      if (voucherCode) {
        if (voucherCode.toUpperCase() === "FREESHIP") {
          if (calculatedSubtotal >= 200000) {
            voucherDiscount = 30000;
            appliedVoucherCode = "FREESHIP";
          }
        } else {
          const voucher = await tx.voucher.findUnique({
            where: { code: voucherCode.toUpperCase() },
          });

          if (!voucher || !voucher.active) {
            throw new Error("Mã giảm giá không tồn tại hoặc đã bị vô hiệu hóa.");
          }

          const now = new Date();
          const isValid =
            (!voucher.startDate || now >= voucher.startDate) &&
            (!voucher.endDate || now <= voucher.endDate) &&
            voucher.usedCount < voucher.usageLimit &&
            calculatedSubtotal >= voucher.minOrderValue;

          if (!isValid) {
            throw new Error("Mã giảm giá không đủ điều kiện áp dụng (hết hạn, hết lượt dùng, hoặc không đủ giá trị đơn tối thiểu).");
          }

          if (voucher.discountType === "PERCENT") {
            voucherDiscount = Math.round(calculatedSubtotal * voucher.discountValue / 100);
            if (voucher.maxDiscount && voucherDiscount > voucher.maxDiscount) {
              voucherDiscount = voucher.maxDiscount;
            }
          } else {
            voucherDiscount = voucher.discountValue;
          }

          if (voucherDiscount > calculatedSubtotal) {
            voucherDiscount = calculatedSubtotal;
          }

          appliedVoucherCode = voucher.code;

          const updatedVoucher = await tx.voucher.updateMany({
            where: { id: voucher.id, usedCount: { lt: voucher.usageLimit } },
            data: { usedCount: { increment: 1 } },
          });
          
          if (updatedVoucher.count === 0) {
            throw new Error("Mã giảm giá vừa hết lượt sử dụng.");
          }
        }
      }

      const code = generateOrderCode();
      const shippingFee = calculateShippingFee(calculatedSubtotal, false);
      const finalTotal = Math.max(0, calculatedSubtotal + shippingFee - voucherDiscount);
      const depositAmount = finalTotal <= 25000 ? finalTotal : 25000;

      // 3. Tạo đơn hàng
      return await tx.order.create({
        data: {
          code,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail?.trim() || null,
          province: provinceName,
          district: districtName,
          ward: wardName,
          detailedAddress: detailedAddress.trim(),
          note: note?.trim() || null,
          subtotal: calculatedSubtotal,
          shippingFee,
          depositAmount,
          totalAmount: finalTotal,
          voucherCode: appliedVoucherCode,
          voucherDiscount,
          paymentMethod: paymentMethod || "BANK_TRANSFER",
          status: "PENDING_DEPOSIT",
          depositStatus: "PENDING",
          items: {
            create: verifiedItems,
          },
        },
        include: {
          items: { include: { product: true } },
        },
      });
    });

    if (customerEmail) {
      sendOrderConfirmationEmail(customerEmail.trim(), order.code, customerName.trim()).catch(console.error);
    }
    sendNewOrderAdminEmail(order.code, customerName.trim(), order.totalAmount).catch(console.error);

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    console.error("Checkout API error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 400 });
  }
}
