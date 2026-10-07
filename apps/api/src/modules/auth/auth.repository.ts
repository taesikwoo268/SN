import { SQL } from "bun";
import {
    DrizzleQueryError,
    and,
    eq,
    gt,
} from "drizzle-orm";

import { db } from "../../db/client.ts";
import {
    passwordCredentials,
    sessions,
    users,
} from "../../db/schema/index.ts";
import { RegistrationConflictError } from "./auth.errors.ts";

// RECORD
export interface CreateAccountRecord {
    email: string;
    username: string;
    displayName: string;
    passwordHash: string;
}

export interface LoginRecord {
    userId: string;
    username: string;
    displayName: string;
    passwordHash: string;
}

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

export async function createAccount(
    input: CreateAccountRecord,
) {
    try {
        return await db.transaction(
            async (transaction) => {
                const [user] = await transaction
                    .insert(users)
                    .values({
                        username: input.username,
                        displayName: input.displayName,
                    })
                    .returning({
                        id: users.id,
                        username: users.username,
                        displayName: users.displayName,
                        createdAt: users.createdAt,
                    });

                if (!user) {
                    throw new Error(
                        "User insert returned no data",
                    );
                }

                await transaction
                    .insert(passwordCredentials)
                    .values({
                        userId: user.id,
                        email: input.email,
                        passwordHash: input.passwordHash,
                    });

                return user;
            },
        );
    } catch (error: unknown) {
        const postgresError = getPostgresError(error);

        if (postgresError?.errno === "23505") {
            switch (postgresError.constraint) {
                case "users_username_unique":
                    throw new RegistrationConflictError(
                        "username",
                    );

                case "password_credentials_email_unique":
                    throw new RegistrationConflictError(
                        "email",
                    );
            }
        }
        throw error;
    }
}

export async function findLoginRecordByEmail(
    email: string,
): Promise<LoginRecord | null> {
    const [record] = await db
        .select({
            userId: users.id,
            username: users.username,
            displayName: users.displayName,
            passwordHash:
                passwordCredentials.passwordHash,
        })
        .from(passwordCredentials)
        .innerJoin(
            users,
            eq(passwordCredentials.userId, users.id),
        )
        .where(
            eq(passwordCredentials.email, email),
        )
        .limit(1);

    return record ?? null;
}

export async function insertSession(
    input: CreateSessionRecord,
) {
    const [session] = await db
        .insert(sessions)
        .values({
            userId: input.userId,
            tokenHash: input.tokenHash,
            expiresAt: input.expiresAt,
            userAgent: input.userAgent,
        })
        .returning({
            id: sessions.id,
            expiresAt: sessions.expiresAt,
        });

    if (!session) {
        throw new Error(
            "Session insert returned no data",
        );
    }

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
        .innerJoin(
            users,
            eq(sessions.userId, users.id),
        )
        .where(
            and(
                eq(sessions.tokenHash, tokenHash),
                gt(sessions.expiresAt, now),
            ),
        )
        .limit(1);

    return record ?? null;
}

export async function deleteSessionById(
    sessionId: string,
): Promise<void> {
    await db
        .delete(sessions)
        .where(eq(sessions.id, sessionId));
}

function getPostgresError(
    error: unknown,
): SQL.PostgresError | null {
    if (error instanceof SQL.PostgresError) {
        return error;
    }

    if (
        error instanceof DrizzleQueryError &&
        error.cause instanceof SQL.PostgresError
    ) {
        return error.cause;
    }

    return null;
}
