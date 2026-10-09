import { and, eq, gt } from "drizzle-orm";

import { db } from "../../../db/client.ts";
import { sessions, users } from "../../../db/schema/index.ts";

export interface CreateSessionRecord {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  userAgent: string | null;
}

export interface ActiveSessionRecord {
  sessionId: string;
  userId: string;
  username: string;
  displayName: string;
  expiresAt: Date;
}

export async function insertSession(input: CreateSessionRecord) {
  const [session] = await db
    .insert(sessions)
    .values(input)
    .returning({ id: sessions.id, expiresAt: sessions.expiresAt });

  if (!session) throw new Error("Session insert returned no data");
  return session;
}

export async function findActiveSessionByTokenHash(
  tokenHash: string,
  now: Date,
): Promise<ActiveSessionRecord | null> {
  const [record] = await db
    .select({
      sessionId: sessions.id,
      userId: users.id,
      username: users.username,
      displayName: users.displayName,
      expiresAt: sessions.expiresAt,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, now)))
    .limit(1);

  return record ?? null;
}

export async function deleteSessionById(sessionId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}
