import z from "zod";

export const addToCartSchema = z.object({
  variant_id: z.number().min(1, "Variant ID is required"),
  quantity: z.number().min(1, "Quantity is required"),
});

export const updateCartItemQuantitySchema = z.object({
  cartItemId: z.number().min(1, "Cart item ID is required"),
  quantity: z.number().min(1, "Quantity is required"),
});
