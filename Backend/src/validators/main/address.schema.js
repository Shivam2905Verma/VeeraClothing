import z from "zod";

export const registerAddressSchema = z.object({
  firstname: z.string().min(1, "First name is required"),
  lastname: z.string().min(1, "Last name is required"),
  country: z.string().optional().default("India (INR ₹)"),
  address_line_1: z
    .string()
    .min(3, "Address must be at least 3 characters long"),
  landmark: z.string().optional().nullable().or(z.literal("")),
  city: z.string().min(2, "City must be at least 2 characters long"),
  state: z.string().min(2, "State must be at least 2 characters long"),
  zip_code: z.string().min(6, "Zip code must be at least 6 characters long"),
  phone: z.string().min(10, "Phone must be at least 10 digits long"),
});


