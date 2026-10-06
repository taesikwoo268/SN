const ARGON2_MEMORY_COST = 19_456;
const ARGON2_TIME_COST = 2;

export async function hashPassword (plainPassword: string): Promise<string> {
    return Bun.password.hash(plainPassword, {
        algorithm: "argon2id",
        memoryCost: ARGON2_MEMORY_COST,
        timeCost: ARGON2_TIME_COST,
    });
}

export async function verifyPassword (plainPassword: string, hashedPassword: string): Promise<boolean> {
    return Bun.password.verify(plainPassword, hashedPassword);
}