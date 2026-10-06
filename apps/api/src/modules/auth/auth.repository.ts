import { SQL } from "bun";
import { DrizzleQueryError } from "drizzle-orm";

import { db } from "../../db/client.ts";
import {
    passwordCredentials,
    users,
} from "../../db/schema/index.ts";
import { RegistrationConflictError } from "./auth.errors.ts";

export interface CreateAccountRecord {
    email: string;
    username: string;
    displayName: string;
    passwordHash: string;
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
