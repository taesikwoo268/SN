import { z } from "zod";

export const AuthenticatedUserSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  displayName: z.string(),
});

export const AuthenticatedUserResponseSchema = z.object({
  data: z.object({ user: AuthenticatedUserSchema }),
});
