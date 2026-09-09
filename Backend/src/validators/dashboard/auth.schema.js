import z from "zod";

export const loginSchema = z.object({
  userId: z.string().min(3, "User ID must be at least 3 characters long"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});
