import { z } from "zod";

export const SessionCookieSchema = z.object({
  session: z.string().optional(),
});
