import { describe, it, expect } from 'bun:test';
import { hashPassword, verifyPassword } from '../../src/modules/auth/password.ts';

describe('Password Hashing and Verification', () => {
    it("hashes and verifies a password", async () => {
        const plainPassword = "correct horse battery staple";
        const hashedPassword = await hashPassword(plainPassword);

        expect(hashedPassword).not.toBe(plainPassword);
        expect(hashedPassword.startsWith("$argon2id$")).toBe(true);

        expect(await verifyPassword(plainPassword, hashedPassword)).toBe(true);
        expect(await verifyPassword("wrong password", hashedPassword)).toBe(false);
    });
});