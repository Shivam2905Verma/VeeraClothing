import { z } from "zod";

export const updateOrderStatusSchema = z
  .object({
    order_status: z
      .enum(
        [
          "pending",
          "confirmed",
          "shipped",
          "delivered",
          "cancelled",
          "returned",
        ],
        {
          errorMap: () => ({
            message:
              "Invalid order status. Must be one of: pending, confirmed, shipped, delivered, cancelled, returned",
          }),
        },
      )
      .optional(),
    payment_status: z
      .enum(["pending", "paid", "failed", "refunded"], {
        errorMap: () => ({
          message:
            "Invalid payment status. Must be one of: pending, paid, failed, refunded",
        }),
      })
      .optional(),
  })
  .refine(
    (data) =>
      data.order_status !== undefined || data.payment_status !== undefined,
    {
      message: "At least one of order_status or payment_status must be provided",
    },
  );
