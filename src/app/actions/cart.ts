"use strict";
"use server";

import { prisma } from "@/lib/prisma";

export async function validateCartItems(itemIds: { productId: string; variantId?: string }[]) {
  if (itemIds.length === 0) return [];

  const productIds = Array.from(new Set(itemIds.map(i => i.productId)));

  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
    },
    select: {
      id: true,
      active: true,
      price: true,
      salePrice: true,
      stock: true,
      variants: {
        select: {
          id: true,
          active: true,
          price: true,
          salePrice: true,
          stock: true,
        }
      }
    },
  });

  const productMap = new Map(products.map(p => [p.id, p]));

  return itemIds.map(item => {
    const p = productMap.get(item.productId);
    if (!p || !p.active) {
      return { ...item, valid: false };
    }

    if (item.variantId) {
      const v = p.variants.find(v => v.id === item.variantId);
      if (!v || !v.active) {
        return { ...item, valid: false };
      }
      return {
        ...item,
        valid: true,
        price: v.salePrice || v.price || p.salePrice || p.price,
        maxStock: v.stock,
      };
    }

    return {
      ...item,
      valid: true,
      price: p.salePrice || p.price,
      maxStock: p.stock,
    };
  });
}
