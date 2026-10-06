// validate và normalize
import { z } from "zod";

export const RegisterBodySchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email()
      .max(320),

    username: z
      .string()
      .trim()
      .toLowerCase()
      .min(3)
      .max(30)
      .regex(
        /^[a-z0-9_]+$/,
        "Username may only contain lowercase letters, numbers, and underscores",
      ),

    displayName: z
      .string()
      .trim()
      .min(1)
      .max(100),

    password: z
      .string()
      .min(12)
      .max(128),
  })
  .strict();

export type RegisterBodyInput = z.input<
  typeof RegisterBodySchema
>;

export type RegisterData = z.output<
  typeof RegisterBodySchema
>;

export const RegisteredUserSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  displayName: z.string(),
  createdAt: z.string().datetime(),
});

export const RegisterResponseSchema = z.object({
  data: z.object({
    user: RegisteredUserSchema,
  }),
});