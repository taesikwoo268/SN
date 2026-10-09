import {
  describe,
  expect,
  it,
  mock,
} from "bun:test";
import { Elysia } from "elysia";
import { z } from "zod";

import { createSessionRoutes } from "../../src/modules/auth/session/session.routes.ts";
import type {
  resolveCurrentSession,
  revokeSession,
} from "../../src/modules/auth/session/session.service.ts";

const ApiErrorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});

const currentSession = {
  sessionId:
    "660e8400-e29b-41d4-a716-446655440000",
  expiresAt: new Date(
    "2026-11-01T00:00:00.000Z",
  ),
  user: {
    id: "550e8400-e29b-41d4-a716-446655440000",
    username: "alice_123",
    displayName: "Alice Nguyen",
  },
};

function createSessionRequest(
  path: "/auth/me" | "/auth/logout",
  options: {
    method?: "GET" | "POST";
    token?: string;
  } = {},
): Request {
  const headers = new Headers();
  const method = options.method ?? "GET";

  if (options.token) {
    headers.set(
      "cookie",
      `session=${options.token}`,
    );
  }

  if (
    !["GET", "HEAD", "OPTIONS"].includes(
      method,
    )
  ) {
    headers.set(
      "origin",
      "http://localhost:3000",
    );
  }

  return new Request(
    `http://localhost${path}`,
    {
      method,
      headers,
    },
  );
}

describe("authenticated session routes", () => {
  it("GET /auth/me returns the current user", async () => {
    const resolveCurrentSessionMock:
      typeof resolveCurrentSession = mock(
        async (token: string) => {
          expect(token).toBe(
            "valid-session-token",
          );

          return currentSession;
        },
      );

    const revokeSessionMock:
      typeof revokeSession = mock(
        async (_sessionId: string) => { },
      );

    const app = new Elysia().use(
      createSessionRoutes({
        resolveCurrentSession:
          resolveCurrentSessionMock,
        revokeSession: revokeSessionMock,
      }),
    );

    const response = await app.handle(
      createSessionRequest("/auth/me", {
        token: "valid-session-token",
      }),
    );

    expect(response.status).toBe(200);

    expect(await response.json()).toEqual({
      data: {
        user: currentSession.user,
      },
    });

    expect(
      resolveCurrentSessionMock,
    ).toHaveBeenCalledTimes(1);

    expect(
      revokeSessionMock,
    ).not.toHaveBeenCalled();
  });

  it("GET /auth/me returns 401 when cookie is missing", async () => {
    const resolveCurrentSessionMock:
      typeof resolveCurrentSession = mock(
        async (_token: string) => {
          throw new Error(
            "Service must not be called",
          );
        },
      );

    const revokeSessionMock:
      typeof revokeSession = mock(
        async (_sessionId: string) => { },
      );

    const app = new Elysia().use(
      createSessionRoutes({
        resolveCurrentSession:
          resolveCurrentSessionMock,
        revokeSession: revokeSessionMock,
      }),
    );

    const response = await app.handle(
      createSessionRequest("/auth/me"),
    );

    expect(response.status).toBe(401);

    const payload =
      ApiErrorResponseSchema.parse(
        await response.json(),
      );

    expect(payload).toEqual({
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication required",
      },
    });

    expect(
      resolveCurrentSessionMock,
    ).not.toHaveBeenCalled();
  });

  it("GET /auth/me clears an invalid session cookie", async () => {
    const resolveCurrentSessionMock:
      typeof resolveCurrentSession = mock(
        async (_token: string) => null,
      );

    const revokeSessionMock:
      typeof revokeSession = mock(
        async (_sessionId: string) => { },
      );

    const app = new Elysia().use(
      createSessionRoutes({
        resolveCurrentSession:
          resolveCurrentSessionMock,
        revokeSession: revokeSessionMock,
      }),
    );

    const response = await app.handle(
      createSessionRequest("/auth/me", {
        token: "invalid-session-token",
      }),
    );

    expect(response.status).toBe(401);

    const setCookie =
      response.headers.get("set-cookie");

    expect(setCookie).not.toBeNull();
    expect(setCookie).toContain("session=");
    expect(setCookie).toContain("Max-Age=0");
    expect(setCookie).toContain("Path=/");
  });

  it("POST /auth/logout revokes the session and clears the cookie", async () => {
    const resolveCurrentSessionMock:
      typeof resolveCurrentSession = mock(
        async (_token: string) =>
          currentSession,
      );

    const revokeSessionMock:
      typeof revokeSession = mock(
        async (_sessionId: string) => { },
      );

    const app = new Elysia().use(
      createSessionRoutes({
        resolveCurrentSession:
          resolveCurrentSessionMock,
        revokeSession: revokeSessionMock,
      }),
    );

    const response = await app.handle(
      createSessionRequest("/auth/logout", {
        method: "POST",
        token: "valid-session-token",
      }),
    );

    expect(response.status).toBe(204);

    expect(
      revokeSessionMock,
    ).toHaveBeenCalledWith(
      currentSession.sessionId,
    );

    const setCookie =
      response.headers.get("set-cookie");

    expect(setCookie).not.toBeNull();
    expect(setCookie).toContain("session=");
    expect(setCookie).toContain("Max-Age=0");
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("Path=/");
  });
  it("POST /auth/logout returns 403 for an untrusted origin", async () => {
    const resolveCurrentSessionMock: typeof resolveCurrentSession = mock(
      async (_token: string) => currentSession,
    );

    const revokeSessionMock: typeof revokeSession = mock(
      async (_sessionId: string) => { },
    );

    const app = new Elysia().use(
      createSessionRoutes({
        resolveCurrentSession: resolveCurrentSessionMock,
        revokeSession: revokeSessionMock,
      }),
    );
    const request = new Request(
      "http://localhost/auth/logout",
      {
        method: "POST",
        headers: {
          cookie:
            "session=valid-session-token",
          origin: "https://evil.example",
        },
      },
    );
    const response = await app.handle(request);

    expect(response.status).toBe(403);

    expect(
      resolveCurrentSessionMock,
    ).not.toHaveBeenCalled();

    expect(
      revokeSessionMock,
    ).not.toHaveBeenCalled();
  });
});
