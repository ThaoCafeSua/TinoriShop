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

  // Validate đơn tối thiểu 200k
  const MIN_ORDER_AMOUNT = 200000;

  // 1. Tính toán lại subtotal dựa trên giá gốc từ DB (Bảo mật giá)
  let calculatedSubtotal = 0;
  const verifiedItems = [];

  for (const item of items) {
    const product = await prisma.product.findUnique({ 
      where: { id: item.productId },
      include: { variants: true }
    });
    
    if (!product || !product.active) {
      return NextResponse.json({ error: `Sản phẩm ${item.productId} không tồn tại hoặc đã ngừng bán` }, { status: 400 });
    }

    let unitPrice = product.salePrice || product.price;

    // Nếu có variant, lấy giá của variant
    if (item.variantId) {
      const variant = product.variants.find(v => v.id === item.variantId);
      if (!variant) {
        return NextResponse.json({ error: "Phân loại sản phẩm không hợp lệ" }, { status: 400 });
      }
      if (variant.stock < Number(item.quantity)) {
        return NextResponse.json({ error: `Sản phẩm ${product.name} (${variant.value}) chỉ còn ${variant.stock} sản phẩm` }, { status: 400 });
      }
      // Ưu tiên: Giá khuyến mãi variant -> Giá gốc variant -> Giá sản phẩm
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
      price: unitPrice, // Dùng giá đã xác minh
    });
  }

  if (calculatedSubtotal < MIN_ORDER_AMOUNT) {
    return NextResponse.json({ error: `Đơn hàng tối thiểu ${MIN_ORDER_AMOUNT.toLocaleString('vi-VN')}đ. Vui lòng thêm sản phẩm.` }, { status: 400 });
  }

  // 2. Xử lý voucher
  let voucherDiscount = 0;
  let appliedVoucherCode: string | null = null;

  if (voucherCode) {
    const voucher = await prisma.voucher.findUnique({
      where: { code: voucherCode.toUpperCase() },
    });

    if (voucher && voucher.active) {
      const now = new Date();
      const isValid =
        (!voucher.startDate || now >= voucher.startDate) &&
        (!voucher.endDate || now <= voucher.endDate) &&
        voucher.usedCount < voucher.usageLimit &&
        calculatedSubtotal >= voucher.minOrderValue;

      if (isValid) {
        if (voucher.discountType === "PERCENT") {
          voucherDiscount = Math.round(calculatedSubtotal * voucher.discountValue / 100);
          if (voucher.maxDiscount && voucherDiscount > voucher.maxDiscount) {
            voucherDiscount = voucher.maxDiscount;
          }
        } else {
          voucherDiscount = voucher.discountValue;
        }

        appliedVoucherCode = voucher.code;

        // Tăng usedCount
        await prisma.voucher.update({
          where: { id: voucher.id },
          data: { usedCount: { increment: 1 } },
        });
      }
    }
  }

  const code = generateOrderCode();
  
  // 3. Tính phí vận chuyển dựa trên subtotal đã xác minh
  const shippingFee = calculateShippingFee(calculatedSubtotal, false);
  const finalTotal = calculatedSubtotal + shippingFee - voucherDiscount;

  const order = await prisma.order.create({
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
      depositAmount: 25000,
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

  // 4. Trừ tồn kho
  for (const item of verifiedItems) {
    if (item.variantId) {
      await prisma.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } }
      });
    } else {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } }
      });
    }
  }

  // Gửi email xác nhận đơn hàng cho khách
  if (customerEmail) {
    sendOrderConfirmationEmail(customerEmail.trim(), code, customerName.trim()).catch(console.error);
  }

  // Thông báo cho Admin
  sendNewOrderAdminEmail(code, customerName.trim(), finalTotal).catch(console.error);

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    console.error("Checkout API error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
