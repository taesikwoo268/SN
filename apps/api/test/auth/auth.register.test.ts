import { describe, expect, it, mock } from "bun:test";
import { Elysia } from "elysia";
import { z } from "zod";

import { RegistrationConflictError } from "../../src/modules/auth/auth.errors.ts";
import { createAuthRoutes } from "../../src/modules/auth/auth.routes.ts";
import {
  RegisterResponseSchema,
  type RegisterData,
} from "../../src/modules/auth/auth.schema.ts";
import type { registerUser } from "../../src/modules/auth/auth.service.ts";

const ApiErrorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});

const validBody = {
  email: "  Alice@Example.COM ",
  username: " Alice_123 ",
  displayName: "  Alice Nguyen  ",
  password: "correct horse battery staple",
};

function createRegisterRequest(
  body: Record<string, unknown>,
): Request {
  return new Request(
    "http://localhost/auth/register",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );
}

describe("POST /auth/register", () => {
  it("returns 201 and the public user", async () => {
    const registeredAt = new Date(
      "2026-01-01T00:00:00.000Z",
    );

    const registerUserMock: typeof registerUser = mock(
      async (_data: RegisterData) => ({
        id: "550e8400-e29b-41d4-a716-446655440000",
        username: "alice_123",
        displayName: "Alice Nguyen",
        createdAt: registeredAt,
      }),
    );

    const testApp = new Elysia().use(
      createAuthRoutes({
        registerUser: registerUserMock,
      }),
    );

    const response = await testApp.handle(
      createRegisterRequest(validBody),
    );

    expect(response.status).toBe(201);

    const payload = RegisterResponseSchema.parse(
      await response.json(),
    );

    expect(payload.data.user).toEqual({
      id: "550e8400-e29b-41d4-a716-446655440000",
      username: "alice_123",
      displayName: "Alice Nguyen",
      createdAt: registeredAt.toISOString(),
    });

    expect(registerUserMock).toHaveBeenCalledWith({
      email: "alice@example.com",
      username: "alice_123",
      displayName: "Alice Nguyen",
      password: "correct horse battery staple",
    });
  });

  it("returns 409 for a duplicate email", async () => {
    const registerUserMock: typeof registerUser = mock(
      async (_data: RegisterData) => {
        throw new RegistrationConflictError("email");
      },
    );

    const testApp = new Elysia().use(
      createAuthRoutes({
        registerUser: registerUserMock,
      }),
    );

    const response = await testApp.handle(
      createRegisterRequest(validBody),
    );

    expect(response.status).toBe(409);

    const payload = ApiErrorResponseSchema.parse(
      await response.json(),
    );

    expect(payload).toEqual({
      error: {
        code: "CONFLICT",
        message:
          "An account with this email already exists",
      },
    });
  });

  it("returns 422 without calling the service for invalid input", async () => {
    const registerUserMock: typeof registerUser = mock(
      async (_data: RegisterData) => {
        throw new Error("Service should not be called");
      },
    );

    const testApp = new Elysia().use(
      createAuthRoutes({
        registerUser: registerUserMock,
      }),
    );

    const response = await testApp.handle(
      createRegisterRequest({
        ...validBody,
        password: "short",
      }),
    );

    expect(response.status).toBe(422);
    expect(registerUserMock).not.toHaveBeenCalled();
  });
});
