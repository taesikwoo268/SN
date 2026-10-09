import { z } from "zod";

import { decodeUserSearchCursor } from "./user-search.cursor.ts";

const UserSearchCursorSchema = z
  .string()
  .min(1)
  .max(256)
  .transform((value, context) => {
    const cursor = decodeUserSearchCursor(value);

    if (!cursor) {
      context.addIssue({ code: "custom", message: "Invalid search cursor" });
      return z.NEVER;
    }

    return cursor;
  });

export const UserSearchQuerySchema = z
  .object({
    q: z.string().trim().min(1).max(100),
    limit: z.coerce.number().int().min(1).max(50).default(20),
    cursor: UserSearchCursorSchema.optional(),
  })
  .strict();

export const UserSearchItemSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  displayName: z.string(),
});

export const UserSearchResponseSchema = z.object({
  data: z.object({
    users: z.array(UserSearchItemSchema),
    pageInfo: z.object({
      hasNextPage: z.boolean(),
      nextCursor: z.string().nullable(),
    }),
  }),
});

export type UserSearchData = z.output<typeof UserSearchQuerySchema>;
