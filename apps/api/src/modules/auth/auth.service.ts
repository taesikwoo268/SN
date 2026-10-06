import type { RegisterData } from "./auth.schema.ts";
import { createAccount } from "./auth.repository.ts";
import { hashPassword } from "./password.ts";

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