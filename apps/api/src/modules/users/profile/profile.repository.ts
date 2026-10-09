import { eq, sql } from "drizzle-orm";

import { db } from "../../../db/client.ts";
import { users } from "../../../db/schema/index.ts";

export interface PublicUserProfileRecord {
  id: string;
  username: string;
  displayName: string;
  bio: string | null;
  createdAt: Date;
}

export interface UpdateUserProfileRecord {
  displayName?: string | undefined;
  bio?: string | null | undefined;
}

const publicProfileSelection = {
  id: users.id,
  username: users.username,
  displayName: users.displayName,
  bio: users.bio,
  createdAt: users.createdAt,
};

export async function findPublicUserProfileByUsername(
  username: string,
): Promise<PublicUserProfileRecord | null> {
  const [record] = await db
    .select(publicProfileSelection)
    .from(users)
    .where(sql`lower(${users.username}) = ${username}`)
    .limit(1);

  return record ?? null;
}

export async function updateUserProfileById(
  userId: string,
  input: UpdateUserProfileRecord,
): Promise<PublicUserProfileRecord | null> {
  const [record] = await db
    .update(users)
    .set({
      displayName: input.displayName,
      bio: input.bio,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning(publicProfileSelection);

  return record ?? null;
}
