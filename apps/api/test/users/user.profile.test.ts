import {
  describe,
  expect,
  it,
  mock,
} from "bun:test";
import { Elysia } from "elysia";
import { z } from "zod";

import { createPublicProfileRoutes } from "../../src/modules/users/profile/public-profile.routes.ts";
import type { getPublicUserProfile } from "../../src/modules/users/profile/profile.service.ts";

const UserProfileResponseSchema = z.object({
  data: z.object({
    user: z.object({
      id: z.string().uuid(),
      username: z.string(),
      displayName: z.string(),
      bio: z.string().nullable(),
      createdAt: z.string().datetime(),
    }),
  }),
});

const ApiErrorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});

const publicProfile = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  username: "alice_123",
  displayName: "Alice Nguyen",
  bio: "Fullstack developer",
  createdAt: new Date(
    "2026-10-01T08:30:00.000Z",
  ),
};

function createProfileRequest(
  username: string,
): Request {
  return new Request(
    `http://localhost/users/${username}`,
  );
}

describe("public user profile routes", () => {
  it("GET /users/:username returns a public profile", async () => {
    const getPublicUserProfileMock:
      typeof getPublicUserProfile = mock(
        async (username: string) => {
          expect(username).toBe("alice_123");

          return publicProfile;
        },
      );

    const app = new Elysia().use(
      createPublicProfileRoutes({
        getPublicUserProfile:
          getPublicUserProfileMock,
      }),
    );

    const response = await app.handle(
      createProfileRequest("alice_123"),
    );

    expect(response.status).toBe(200);

    const payload =
      UserProfileResponseSchema.parse(
        await response.json(),
      );

    expect(payload).toEqual({
      data: {
        user: {
          id: publicProfile.id,
          username: publicProfile.username,
          displayName:
            publicProfile.displayName,
          bio: publicProfile.bio,
          createdAt:
            publicProfile.createdAt
              .toISOString(),
        },
      },
    });

    expect(
      getPublicUserProfileMock,
    ).toHaveBeenCalledTimes(1);

    expect(
      getPublicUserProfileMock,
    ).toHaveBeenCalledWith(
      "alice_123",
    );
  });

  it("normalizes the username before calling the service", async () => {
    const getPublicUserProfileMock:
      typeof getPublicUserProfile = mock(
        async (_username: string) =>
          publicProfile,
      );

    const app = new Elysia().use(
      createPublicProfileRoutes({
        getPublicUserProfile:
          getPublicUserProfileMock,
      }),
    );

    const response = await app.handle(
      createProfileRequest("ALICE_123"),
    );

    expect(response.status).toBe(200);

    expect(
      getPublicUserProfileMock,
    ).toHaveBeenCalledWith(
      "alice_123",
    );
  });

  it("GET /users/:username returns 404 when the user does not exist", async () => {
    const getPublicUserProfileMock:
      typeof getPublicUserProfile = mock(
        async (_username: string) => null,
      );

    const app = new Elysia().use(
      createPublicProfileRoutes({
        getPublicUserProfile:
          getPublicUserProfileMock,
      }),
    );

    const response = await app.handle(
      createProfileRequest("missing_user"),
    );

    expect(response.status).toBe(404);

    const payload =
      ApiErrorResponseSchema.parse(
        await response.json(),
      );

    expect(payload).toEqual({
      error: {
        code: "NOT_FOUND",
        message: "User not found",
      },
    });

    expect(
      getPublicUserProfileMock,
    ).toHaveBeenCalledTimes(1);
  });

  it("GET /users/:username returns 422 for an invalid username", async () => {
    const getPublicUserProfileMock:
      typeof getPublicUserProfile = mock(
        async (_username: string) => {
          throw new Error(
            "Service must not be called",
          );
        },
      );

    const app = new Elysia().use(
      createPublicProfileRoutes({
        getPublicUserProfile:
          getPublicUserProfileMock,
      }),
    );

    const response = await app.handle(
      createProfileRequest("a!"),
    );

    expect(response.status).toBe(422);

    expect(
      getPublicUserProfileMock,
    ).not.toHaveBeenCalled();
  });

  it("does not expose private user fields", async () => {
    const profileWithPrivateFields = {
      ...publicProfile,
      email: "alice@example.com",
      passwordHash: "secret-password-hash",
    };

    const getPublicUserProfileMock:
      typeof getPublicUserProfile = mock(
        async (_username: string) =>
          profileWithPrivateFields,
      );

    const app = new Elysia().use(
      createPublicProfileRoutes({
        getPublicUserProfile:
          getPublicUserProfileMock,
      }),
    );

    const response = await app.handle(
      createProfileRequest("alice_123"),
    );

    expect(response.status).toBe(200);

    const payload =
      UserProfileResponseSchema.parse(
        await response.json(),
      );

    expect(payload.data.user).not.toHaveProperty(
      "email",
    );

    expect(payload.data.user).not.toHaveProperty(
      "passwordHash",
    );
  });
});
