import { z } from "zod";

// If you define z.number(), Zod will throw an error if it receives the string "42". With z.coerce.number() Uses Number(input) to convert strings to numbers.
export const createProductSchema = z.object({
  name: z.string().trim().min(2, "Product name must be at least 2 characters"),
  description: z.string().trim().optional(),
  category_id: z.coerce.number().int().positive("Invalid category ID"),
  variants: z.preprocess(
    (val) => {
      if (typeof val === "string") {
        try {
          return JSON.parse(val);
        } catch {
          return null; // Triggers the Zod error if JSON is broken
        }
      }
      return val;
    },
    z
      .array(
        z.object({
          color: z.string().trim().min(1, "Color is required"),
          price: z.coerce.number().positive("Price must be greater than 0"),
          stock: z.coerce.number().int().nonnegative().default(0),
        }),
      )
      .min(1, "At least one variant is required"),
  ),
});

export const createVariantSchema = z.object({
  variants: z.array(
    z.object({
      product_id: z.coerce.number().int().positive("Invalid product ID"),
      color: z.string().trim().min(1, "Color is required"),
      price: z.coerce.number().positive("Price must be greater than 0"),
      stock: z.coerce.number().int().nonnegative().default(0),
    }),
  ),
});

export const updateProductSchema = z.object({
  name: z.string().trim().min(2, "Product name must be at least 2 characters"),
  description: z.string().trim().optional(),
  category_id: z.coerce.number().int().positive("Invalid category ID"),
});

export const updateVariantSchema = z.object({
  color: z.string().trim().min(1, "Color is required"),
  price: z.coerce.number().positive("Price must be greater than 0"),
  stock: z.coerce.number().int().nonnegative().default(0),
});
