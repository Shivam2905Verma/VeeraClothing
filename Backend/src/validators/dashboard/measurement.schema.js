import { z } from "zod";

export const createMeasurementSchema = z.object({
  name: z
    .string({ required_error: "Measurement name is required" })
    .trim()
    .min(1, "Measurement name must be at least 1 character long")
    .max(255, "Measurement name must be at most 255 characters"),
  unit: z
    .string({ required_error: "Measurement unit is required" })
    .trim()
    .min(1, "Measurement unit is required")
    .max(50, "Measurement unit must be at most 50 characters"),
});

export const updateMeasurementSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Measurement name must be at least 1 character long")
    .max(255, "Measurement name must be at most 255 characters")
    .optional(),
  unit: z
    .string()
    .trim()
    .min(1, "Measurement unit cannot be empty")
    .max(50, "Measurement unit must be at most 50 characters")
    .optional(),
});
