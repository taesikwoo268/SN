import { z } from "zod";

const UserSearchCursorPayloadSchema = z
  .object({
    username: z.string().min(3).max(30).regex(/^[a-z0-9_]+$/),
    id: z.string().uuid(),
  })
  .strict();

export type UserSearchCursor = z.output<typeof UserSearchCursorPayloadSchema>;

export function encodeUserSearchCursor(cursor: UserSearchCursor): string {
  return Buffer.from(JSON.stringify(cursor)).toString("base64url");
}

export function decodeUserSearchCursor(value: string): UserSearchCursor | null {
  try {
    const decoded = Buffer.from(value, "base64url").toString("utf8");
    const result = UserSearchCursorPayloadSchema.safeParse(JSON.parse(decoded));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}
