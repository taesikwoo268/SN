import {
  describe,
  expect,
  it,
  mock,
} from "bun:test";
import { Elysia } from "elysia";
import { env } from "../../src/config/env.ts";

import {
  createAccountProfileRoutes,
} from "../../src/modules/users/profile/account-profile.routes.ts";
import {
  UserProfileResponseSchema,
  type UpdateUserProfileData,
} from "../../src/modules/users/profile/profile.schema.ts";
import type {
  resolveCurrentSession,
} from "../../src/modules/auth/session/session.service.ts";
import type {
  updateUserProfile,
} from "../../src/modules/users/profile/profile.service.ts";

const userId =
  "550e8400-e29b-41d4-a716-446655440000";

const session = {
  sessionId:
    "660e8400-e29b-41d4-a716-446655440000",
  expiresAt: new Date(
    "2026-11-01T00:00:00.000Z",
  ),
  user: {
    id: userId,
    username: "alice_123",
    displayName: "Alice Nguyen",
  },
};

function createUpdateRequest(
  body: Record<string, unknown>,
  options: {
    token?: string;
    origin?: string;
  } = {},
): Request {
  const headers = new Headers({
    "content-type": "application/json",
    origin:
      options.origin ??
      env.FRONTEND_ORIGIN,
  });

  if (options.token) {
    headers.set(
      "cookie",
      `session=${options.token}`,
    );
  }

  return new Request(
    "http://localhost/users/me",
    {
      method: "PATCH",
      headers,
      body: JSON.stringify(body),
    },
  );
}

describe("PATCH /users/me", () => {
  it("updates the authenticated user's profile", async () => {
    const resolveCurrentSessionMock:
      typeof resolveCurrentSession = mock(
        async (_token: string) => session,
      );

    const updateUserProfileMock:
      typeof updateUserProfile = mock(
        async (
          receivedUserId: string,
          data: UpdateUserProfileData,
        ) => {
          expect(receivedUserId).toBe(
            userId,
          );

          expect(data).toEqual({
            displayName: "Alice Tran",
            bio: null,
          });

          return {
            id: userId,
            username: "alice_123",
            displayName: "Alice Tran",
            bio: null,
            createdAt: new Date(
              "2026-10-01T00:00:00.000Z",
            ),
          };
        },
      );

    const app = new Elysia().use(
      createAccountProfileRoutes({
        resolveCurrentSession:
          resolveCurrentSessionMock,
        updateUserProfile:
          updateUserProfileMock,
      }),
    );

    const response = await app.handle(
      createUpdateRequest(
        {
          displayName: "  Alice Tran  ",
          bio: "   ",
        },
        {
          token: "valid-session-token",
        },
      ),
    );

    expect(response.status).toBe(200);

    const payload =
      UserProfileResponseSchema.parse(
        await response.json(),
      );

    expect(payload.data.user).toEqual({
      id: userId,
      username: "alice_123",
      displayName: "Alice Tran",
      bio: null,
      createdAt:
        "2026-10-01T00:00:00.000Z",
    });

    expect(
      updateUserProfileMock,
    ).toHaveBeenCalledTimes(1);

    expect(
      response.headers.get(
        "cache-control",
      ),
    ).toBe("no-store");
  });

  it("returns 401 without a session cookie", async () => {
    const resolveCurrentSessionMock:
      typeof resolveCurrentSession = mock(
        async (_token: string) => session,
      );

    const updateUserProfileMock:
      typeof updateUserProfile = mock(
        async (
          _userId: string,
          _data: UpdateUserProfileData,
        ) => {
          throw new Error(
            "Update must not run",
          );
        },
      );

    const app = new Elysia().use(
      createAccountProfileRoutes({
        resolveCurrentSession:
          resolveCurrentSessionMock,
        updateUserProfile:
          updateUserProfileMock,
      }),
    );

    const response = await app.handle(
      createUpdateRequest({
        displayName: "Alice Tran",
      }),
    );

    expect(response.status).toBe(401);

    expect(
      updateUserProfileMock,
    ).not.toHaveBeenCalled();
  });

  it("returns 422 for an empty body", async () => {
    const resolveCurrentSessionMock:
      typeof resolveCurrentSession = mock(
        async (_token: string) => session,
      );

    const updateUserProfileMock:
      typeof updateUserProfile = mock(
        async (
          _userId: string,
          _data: UpdateUserProfileData,
        ) => {
          throw new Error(
            "Update must not run",
          );
        },
      );

    const app = new Elysia()
      .onError(({ code, set }) => {
        if (code === "VALIDATION") {
          set.status = 422;

          return {
            error: {
              code: "VALIDATION_ERROR",
              message:
                "Request validation failed",
            },
          };
        }
      })
      .use(
        createAccountProfileRoutes({
          resolveCurrentSession:
            resolveCurrentSessionMock,
          updateUserProfile:
            updateUserProfileMock,
        }),
      );

    const response = await app.handle(
      createUpdateRequest(
        {},
        {
          token: "valid-session-token",
        },
      ),
    );

    expect(response.status).toBe(422);

    expect(
      updateUserProfileMock,
    ).not.toHaveBeenCalled();
  });

  it("returns 403 for an untrusted origin", async () => {
    const resolveCurrentSessionMock:
      typeof resolveCurrentSession = mock(
        async (_token: string) => session,
      );

    const updateUserProfileMock:
      typeof updateUserProfile = mock(
        async (
          _userId: string,
          _data: UpdateUserProfileData,
        ) => {
          throw new Error(
            "Update must not run",
          );
        },
      );

    const app = new Elysia().use(
      createAccountProfileRoutes({
        resolveCurrentSession:
          resolveCurrentSessionMock,
        updateUserProfile:
          updateUserProfileMock,
      }),
    );

    const response = await app.handle(
      createUpdateRequest(
        {
          displayName: "Hacked",
        },
        {
          token: "valid-session-token",
          origin:
            "https://evil.example",
        },
      ),
    );

    expect(response.status).toBe(403);

    expect(
      resolveCurrentSessionMock,
    ).not.toHaveBeenCalled();

    expect(
      updateUserProfileMock,
    ).not.toHaveBeenCalled();
  });
});
