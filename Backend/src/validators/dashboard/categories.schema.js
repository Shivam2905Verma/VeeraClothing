import { z } from "zod";

export const createCategorySchema = z.object({
  categoryName: z
    .string({ required_error: "Category name is required" })
    .trim()
    .min(2, "Category name must be at least 2 characters")
    .max(255, "Category name must be at most 255 characters"),
  measurementTypeIds: z
    .array(z.number().int().positive())
    .optional()
    .default([]),
});

export const updateCategorySchema = z.object({
  categoryName: z
    .string()
    .trim()
    .min(2, "Category name must be at least 2 characters")
    .max(255, "Category name must be at most 255 characters")
    .optional(),
  measurementTypeIds: z
    .array(z.number().int().positive())
    .optional(),
});
