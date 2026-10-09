import {
  describe,
  expect,
  it,
  mock,
} from "bun:test";
import { Elysia } from "elysia";

import {
  createAvatarRoutes,
} from "../../src/modules/users/avatar/avatar.routes.ts";
import type {
  resolveCurrentSession,
} from "../../src/modules/auth/session/session.service.ts";
import type {
  uploadUserAvatar,
} from "../../src/modules/users/avatar/avatar.service.ts";

const userId =
  "550e8400-e29b-41d4-a716-446655440000";

const currentSession = {
  sessionId:
    "660e8400-e29b-41d4-a716-446655440000",
  expiresAt: new Date(
    "2026-11-01T00:00:00.000Z",
  ),
  user: {
    id: userId,
    username: "alice_123",
    displayName: "Alice",
  },
};

function createAvatarRequest(
  file: File,
  options: {
    token?: string;
    origin?: string;
  } = {},
): Request {
  const formData = new FormData();

  formData.set("avatar", file);

  const headers = new Headers({
    origin:
      options.origin ??
      "http://localhost:3000",
  });

  if (options.token) {
    headers.set(
      "cookie",
      `session=${options.token}`,
    );
  }

  return new Request(
    "http://localhost/users/me/avatar",
    {
      method: "PUT",
      headers,
      body: formData,
    },
  );
}

describe("PUT /users/me/avatar", () => {
  it("uploads an avatar for the authenticated user", async () => {
    const resolveCurrentSessionMock:
      typeof resolveCurrentSession = mock(
        async () => currentSession,
      );

    const uploadUserAvatarMock:
      typeof uploadUserAvatar = mock(
        async (
          receivedUserId: string,
          file: File,
        ) => {
          expect(receivedUserId).toBe(
            userId,
          );

          expect(file.name).toBe(
            "avatar.png",
          );

          expect(file.type).toBe(
            "image/png",
          );
        },
      );

    const app = new Elysia().use(
      createAvatarRoutes({
        resolveCurrentSession:
          resolveCurrentSessionMock,
        uploadUserAvatar:
          uploadUserAvatarMock,
      }),
    );

    const pngBytes = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47,
      0x0d, 0x0a, 0x1a, 0x0a,
    ]);

    const response = await app.handle(
      createAvatarRequest(
        new File(
          [pngBytes],
          "avatar.png",
          {
            type: "image/png",
          },
        ),
        {
          token: "valid-session-token",
        },
      ),
    );

    expect(response.status).toBe(204);

    expect(
      uploadUserAvatarMock,
    ).toHaveBeenCalledTimes(1);
  });

  it("returns 401 without a session cookie", async () => {
    const resolveCurrentSessionMock:
      typeof resolveCurrentSession = mock(
        async () => currentSession,
      );

    const uploadUserAvatarMock:
      typeof uploadUserAvatar = mock(
        async () => {
          throw new Error(
            "Upload must not run",
          );
        },
      );

    const app = new Elysia().use(
      createAvatarRoutes({
        resolveCurrentSession:
          resolveCurrentSessionMock,
        uploadUserAvatar:
          uploadUserAvatarMock,
      }),
    );

    const response = await app.handle(
      createAvatarRequest(
        new File(
          [new Uint8Array([1])],
          "avatar.png",
          {
            type: "image/png",
          },
        ),
      ),
    );

    expect(response.status).toBe(401);

    expect(
      uploadUserAvatarMock,
    ).not.toHaveBeenCalled();
  });

  it("returns 403 for an untrusted origin", async () => {
    const resolveCurrentSessionMock:
      typeof resolveCurrentSession = mock(
        async () => currentSession,
      );

    const uploadUserAvatarMock:
      typeof uploadUserAvatar = mock(
        async () => {
          throw new Error(
            "Upload must not run",
          );
        },
      );

    const app = new Elysia().use(
      createAvatarRoutes({
        resolveCurrentSession:
          resolveCurrentSessionMock,
        uploadUserAvatar:
          uploadUserAvatarMock,
      }),
    );

    const response = await app.handle(
      createAvatarRequest(
        new File(
          [new Uint8Array([1])],
          "avatar.png",
          {
            type: "image/png",
          },
        ),
        {
          token: "valid-session-token",
          origin:
            "https://evil.example",
        },
      ),
    );

    expect(response.status).toBe(403);

    expect(
      uploadUserAvatarMock,
    ).not.toHaveBeenCalled();
  });
});
