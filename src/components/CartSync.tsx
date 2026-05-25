"use client";

import { useEffect } from "react";
import { useCart } from "@/hooks/useCart";
import { validateCartItems } from "@/app/actions/cart";

export default function CartSync() {
  const { items, syncItems } = useCart();

  useEffect(() => {
    const syncCart = async () => {
      if (items.length === 0) return;

      const itemsToValidate = items.map(item => ({
        productId: item.productId,
        variantId: item.variantId
      }));

      try {
        const validatedItems = await validateCartItems(itemsToValidate);
        
        let hasChanges = false;
        const newItems = [...items];

        for (const validItem of validatedItems) {
          const index = newItems.findIndex(
            i => i.productId === validItem.productId && i.variantId === validItem.variantId
          );
          
          if (index !== -1) {
            if (!validItem.valid) {
              // Item is no longer active, remove it
              newItems.splice(index, 1);
              hasChanges = true;
            } else if ('price' in validItem) {
              // Update price and maxStock if they have changed
              const item = newItems[index];
              if (item.price !== validItem.price || item.maxStock !== validItem.maxStock) {
                newItems[index] = {
                  ...item,
                  price: validItem.price as number,
                  maxStock: validItem.maxStock as number,
                  // Ensure quantity doesn't exceed new maxStock
                  quantity: Math.min(item.quantity, validItem.maxStock as number)
                };
                hasChanges = true;
              }
            }
          }
        }

        if (hasChanges) {
          syncItems(newItems);
        }
      } catch (error) {
        console.error("Failed to sync cart:", error);
      }
    };

    syncCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
