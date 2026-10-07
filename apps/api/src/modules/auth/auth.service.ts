import type { RegisterData, LoginData } from "./auth.schema.ts";
import {
  createAccount,
  deleteSessionById,
  findActiveSessionByTokenHash,
  findLoginRecordByEmail,
  insertSession,
} from "./auth.repository.ts";
import {
  generateSessionToken,
  hashSessionToken,
} from "./session-token.ts";
import { hashPassword, verifyPassword } from "./password.ts";
import { InvalidCredentialsError } from "../../shared/http/api-error.ts";
import { env } from "../../config/env.ts";

const SESSION_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

const DUMMY_PASSWORD_HASH =
  "$argon2id$v=19$m=19456,t=2,p=1$RW3XbVJXIWM+covqyOsKYI34/mzzNqNiQ5e9j4wqf30$dUgJLIBEXhx7z/fpvubpDnJwUncKMVZwXOGnojkaZ7c";

export async function registerUser(
  data: RegisterData,
) {
  const passwordHash = await hashPassword(
    data.password,
  );

  return createAccount({
    email: data.email,
    username: data.username,
    displayName: data.displayName,
    passwordHash,
  });
}

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


export async function authenticateUser(
  data: LoginData,
) {
  const loginRecord =
    await findLoginRecordByEmail(data.email);

  const passwordHash =
    loginRecord?.passwordHash ??
    DUMMY_PASSWORD_HASH;

  const passwordMatches = await verifyPassword(
    data.password,
    passwordHash,
  );

  if (!loginRecord || !passwordMatches) {
    throw new InvalidCredentialsError();
  }

  return {
    id: loginRecord.userId,
    username: loginRecord.username,
    displayName: loginRecord.displayName,
  };
}

export async function createUserSession(
  userId: string,
  userAgent: string | null,
): Promise<CreatedSession> {
  const token = generateSessionToken();
  const tokenHash = hashSessionToken(token);

  const expiresAt = new Date(
    Date.now() +
    env.SESSION_TTL_SECONDS * 1000,
  );

  const normalizedUserAgent = userAgent
    ? userAgent.slice(0, 512)
    : null;

  await insertSession({
    userId,
    tokenHash,
    expiresAt,
    userAgent: normalizedUserAgent,
  });

  return {
    token,
    expiresAt,
  };
}

export async function resolveCurrentSession(
  token: string,
): Promise<CurrentSession | null> {
  if (!SESSION_TOKEN_PATTERN.test(token)) {
    return null;
  }

  const tokenHash = hashSessionToken(token);

  const record =
    await findActiveSessionByTokenHash(
      tokenHash,
      new Date(),
    );

  if (!record) {
    return null;
  }

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

export async function revokeSession(
  sessionId: string,
): Promise<void> {
  await deleteSessionById(sessionId);
}

