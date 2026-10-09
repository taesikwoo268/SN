import { env } from "../../../config/env.ts";
import {
  deleteSessionById,
  findActiveSessionByTokenHash,
  insertSession,
} from "./session.repository.ts";
import { generateSessionToken, hashSessionToken } from "./session-token.ts";

const SESSION_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

export interface CreatedSession {
  token: string;
  expiresAt: Date;
}

export interface CurrentSession {
  sessionId: string;
  expiresAt: Date;
  user: {
    id: string;
    username: string;
    displayName: string;
  };
}

export async function createUserSession(
  userId: string,
  userAgent: string | null,
): Promise<CreatedSession> {
  const token = generateSessionToken();
  const expiresAt = new Date(
    Date.now() + env.SESSION_TTL_SECONDS * 1000,
  );

  await insertSession({
    userId,
    tokenHash: hashSessionToken(token),
    expiresAt,
    userAgent: userAgent ? userAgent.slice(0, 512) : null,
  });

  return { token, expiresAt };
}

export async function resolveCurrentSession(
  token: string,
): Promise<CurrentSession | null> {
  if (!SESSION_TOKEN_PATTERN.test(token)) return null;

  const record = await findActiveSessionByTokenHash(
    hashSessionToken(token),
    new Date(),
  );

  if (!record) return null;

  return {
    sessionId: record.sessionId,
    expiresAt: record.expiresAt,
    user: {
      id: record.userId,
      username: record.username,
      displayName: record.displayName,
    },
  };
}

export async function revokeSession(sessionId: string): Promise<void> {
  await deleteSessionById(sessionId);
}
