import { z } from "zod";

import { tokensSchema } from "@/lib/api";

/** The signed-in user, as `GET /me` and `POST /auth/login` return it. Unknown keys are stripped. */
export const sessionUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  role: z.enum(["admin", "editor", "viewer"]),
});

export const loginResultSchema = tokensSchema.extend({
  user: sessionUserSchema,
});

/** Login form. Server errors (wrong password) are handled separately from these field rules. */
export const loginSchema = z.object({
  email: z.email("Enter a valid email address.").trim().toLowerCase(),
  password: z.string().min(1, "Enter your password."),
});

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(100),
  email: z.email("Enter a valid email address.").trim().toLowerCase(),
});

export type SessionUser = z.infer<typeof sessionUserSchema>;
export type LoginInput = z.input<typeof loginSchema>;
export type LoginValues = z.output<typeof loginSchema>;
export type ProfileValues = z.output<typeof profileSchema>;
