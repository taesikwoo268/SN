import { sql } from "drizzle-orm";

import { db } from "../../db/client.ts";
import { users } from "../../db/schema/index.ts";

export interface PublicUserProfileRecord {
  id: string;
  username: string;
  displayName: string;
  bio: string | null;
  createdAt: Date;
}

export async function findPublicUserProfileByUsername(
  username: string,
): Promise<PublicUserProfileRecord | null> {
  const [record] = await db
    .select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      bio: users.bio,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(
      sql`lower(${users.username}) = ${username}`,
    )
    .limit(1);

  return record ?? null;
}