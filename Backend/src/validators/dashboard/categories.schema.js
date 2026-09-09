import { z } from "zod";

export const createCategorySchema = z.object({
  categoryName: z
    .string()
    .trim()
    .min(2, "Category name must be at least 2 characters"),
});

export const updateCategorySchema = z.object({
  categoryName: z
    .string()
    .trim()
    .min(2, "Category name must be at least 2 characters"),
});
