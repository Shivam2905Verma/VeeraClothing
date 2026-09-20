import { z } from "zod";

export const createSpotlightSchema = z.object({
  tag: z
    .string()
    .trim()
    .min(1, "Tag cannot be empty")
    .max(100, "Tag must be at most 100 characters")
    .optional()
    .default("SPOTLIGHT"),
  title: z
    .string({ required_error: "Title is required" })
    .trim()
    .min(1, "Title is required")
    .max(255, "Title must be at most 255 characters"),
  link_url: z
    .string()
    .trim()
    .min(1, "Link URL cannot be empty")
    .max(500, "Link URL must be at most 500 characters")
    .optional()
    .default("/shopall"),
});

export const updateSpotlightSchema = z.object({
  tag: z
    .string()
    .trim()
    .min(1, "Tag cannot be empty")
    .max(100, "Tag must be at most 100 characters")
    .optional(),
  title: z
    .string()
    .trim()
    .min(1, "Title cannot be empty")
    .max(255, "Title must be at most 255 characters")
    .optional(),
  link_url: z
    .string()
    .trim()
    .min(1, "Link URL cannot be empty")
    .max(500, "Link URL must be at most 500 characters")
    .optional(),
});
