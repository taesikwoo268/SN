import { eq } from "drizzle-orm";

import { db } from "../../../db/client.ts";
import { users } from "../../../db/schema/index.ts";

export async function updateUserAvatarKeyById(
  userId: string,
  avatarKey: string,
): Promise<boolean> {
  const [record] = await db
    .update(users)
    .set({ avatarKey, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning({ id: users.id });

  return record !== undefined;
}
