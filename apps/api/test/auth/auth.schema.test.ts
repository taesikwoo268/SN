import {describe, expect, it} from 'bun:test';

import {RegisterBodySchema} from '../../src/modules/auth/auth.schema.ts';

describe('RegisterBodySchema', () => {
  it('should validate a valid registration body', () => {
    const validData = {
      email: "  Alice@Example.COM ",
      username: " Alice_123 ",
      displayName: "  Alice Nguyen  ",
      password: "correct horse battery staple",
    };

    const result = RegisterBodySchema.parse(validData);
    expect(result.email).toBe("alice@example.com");
    expect(result.username).toBe("alice_123");
    expect(result.displayName).toBe("Alice Nguyen");
    expect(result.password).toBe("correct horse battery staple");
  });

  it('should reject an invalid email', () => {
    const invalidData = {
      email: "  Alice@Example.COM ",
      username: " Alice_123 ",
      displayName: "  Alice Nguyen  ",
      password: "correct horse battery staple",
      role: 'admin',
    };

    const result = RegisterBodySchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject short passwords', () => {
    const invalidData = {
      email: "  Alice@Example.COM ",
      username: " Alice_123 ",
      displayName: "  Alice Nguyen  ",
      password: "correct",
    };

    const result = RegisterBodySchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
