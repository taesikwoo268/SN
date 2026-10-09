import { eq } from "drizzle-orm";

import { db } from "../../../db/client.ts";
import { passwordCredentials, users } from "../../../db/schema/index.ts";

export interface LoginRecord {
  userId: string;
  username: string;
  displayName: string;
  passwordHash: string;
}

export async function findLoginRecordByEmail(
  email: string,
): Promise<LoginRecord | null> {
  const [record] = await db
    .select({
      userId: users.id,
      username: users.username,
      displayName: users.displayName,
      passwordHash: passwordCredentials.passwordHash,
    })
    .from(passwordCredentials)
    .innerJoin(users, eq(passwordCredentials.userId, users.id))
    .where(eq(passwordCredentials.email, email))
    .limit(1);

  return record ?? null;
}
