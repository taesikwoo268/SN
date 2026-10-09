import { z } from "zod";

export const LoginBodySchema = z
  .object({
    email: z.string().trim().toLowerCase().email().max(320),
    password: z.string().min(1).max(128),
  })
  .strict();

export type LoginData = z.output<typeof LoginBodySchema>;
