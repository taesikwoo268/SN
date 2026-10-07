import {
  describe,
  expect,
  it,
  mock,
} from "bun:test";
import { Elysia } from "elysia";
import { z } from "zod";

import {
  InvalidCredentialsError,
} from "../../src/shared/http/api-error.ts";
import { createAuthRoutes } from "../../src/modules/auth/auth.routes.ts";
import {
  LoginResponseSchema,
  type LoginData,
} from "../../src/modules/auth/auth.schema.ts";
import type {
  authenticateUser,
  createUserSession,
} from "../../src/modules/auth/auth.service.ts";

const ApiErrorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});

const validBody = {
  email: " Alice@Example.COM ",
  password: "correct horse battery staple",
};

function createLoginRequest(
  body: Record<string, unknown>,
): Request {
  return new Request(
    "http://localhost/auth/login",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "user-agent": "Test Browser/1.0",
      },
      body: JSON.stringify(body),
    },
  );
}

describe("POST /auth/login", () => {
  it("returns 200 and sets a session cookie", async () => {
    const expiresAt = new Date(
      "2026-11-01T00:00:00.000Z",
    );

    const authenticateUserMock:
      typeof authenticateUser = mock(
        async (_data: LoginData) => ({
          id: "550e8400-e29b-41d4-a716-446655440000",
          username: "alice_123",
          displayName: "Alice Nguyen",
        }),
      );

    const createUserSessionMock:
      typeof createUserSession = mock(
        async (
          _userId: string,
          _userAgent: string | null,
        ) => ({
          token: "test-session-token",
          expiresAt,
        }),
      );

    const testApp = new Elysia().use(
      createAuthRoutes({
        authenticateUser:
          authenticateUserMock,
        createUserSession:
          createUserSessionMock,
      }),
    );

    const response = await testApp.handle(
      createLoginRequest(validBody),
    );

    expect(response.status).toBe(200);

    const payload = LoginResponseSchema.parse(
      await response.json(),
    );

    expect(payload).toEqual({
      data: {
        user: {
          id: "550e8400-e29b-41d4-a716-446655440000",
          username: "alice_123",
          displayName: "Alice Nguyen",
        },
      },
    });

    expect(
      authenticateUserMock,
    ).toHaveBeenCalledWith({
      email: "alice@example.com",
      password:
        "correct horse battery staple",
    });

    expect(
      createUserSessionMock,
    ).toHaveBeenCalledWith(
      "550e8400-e29b-41d4-a716-446655440000",
      "Test Browser/1.0",
    );

    const setCookie =
      response.headers.get("set-cookie");

    expect(setCookie).not.toBeNull();
    expect(setCookie).toContain(
      "session=test-session-token",
    );
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain(
      "SameSite=Lax",
    );
    expect(setCookie).toContain("Path=/");

    // NODE_ENV=development nên cookie chưa có Secure.
    expect(setCookie).not.toContain("Secure");

    expect(
      response.headers.get("cache-control"),
    ).toBe("no-store");
  });

  it("returns 401 for invalid credentials", async () => {
    const authenticateUserMock:
      typeof authenticateUser = mock(
        async (_data: LoginData) => {
          throw new InvalidCredentialsError();
        },
      );

    const createUserSessionMock:
      typeof createUserSession = mock(
        async (
          _userId: string,
          _userAgent: string | null,
        ) => {
          throw new Error(
            "Session must not be created",
          );
        },
      );

    const testApp = new Elysia().use(
      createAuthRoutes({
        authenticateUser:
          authenticateUserMock,
        createUserSession:
          createUserSessionMock,
      }),
    );

    const response = await testApp.handle(
      createLoginRequest({
        email: "alice@example.com",
        password: "incorrect password",
      }),
    );

    expect(response.status).toBe(401);

    const payload =
      ApiErrorResponseSchema.parse(
        await response.json(),
      );

    expect(payload).toEqual({
      error: {
        code: "UNAUTHORIZED",
        message:
          "Invalid email or password",
      },
    });

    expect(
      createUserSessionMock,
    ).not.toHaveBeenCalled();

    expect(
      response.headers.get("set-cookie"),
    ).toBeNull();
  });

  it("returns 422 without calling services for invalid input", async () => {
    const authenticateUserMock:
      typeof authenticateUser = mock(
        async (_data: LoginData) => {
          throw new Error(
            "Authentication must not run",
          );
        },
      );

    const createUserSessionMock:
      typeof createUserSession = mock(
        async (
          _userId: string,
          _userAgent: string | null,
        ) => {
          throw new Error(
            "Session must not be created",
          );
        },
      );

    const testApp = new Elysia().use(
      createAuthRoutes({
        authenticateUser:
          authenticateUserMock,
        createUserSession:
          createUserSessionMock,
      }),
    );

    const response = await testApp.handle(
      createLoginRequest({
        email: "not-an-email",
        password: "",
      }),
    );

    expect(response.status).toBe(422);

    expect(
      authenticateUserMock,
    ).not.toHaveBeenCalled();

    expect(
      createUserSessionMock,
    ).not.toHaveBeenCalled();
  });
});