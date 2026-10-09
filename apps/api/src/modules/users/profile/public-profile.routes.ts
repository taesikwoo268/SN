import { Elysia } from "elysia";

import { createApiError } from "../../../shared/http/api-error.ts";
import {
  UserProfileParamsSchema,
  UserProfileResponseSchema,
} from "./profile.schema.ts";
import { getPublicUserProfile } from "./profile.service.ts";

export interface PublicProfileRouteDependencies {
  getPublicUserProfile: typeof getPublicUserProfile;
}

export function createPublicProfileRoutes(
  overrides: Partial<PublicProfileRouteDependencies> = {},
) {
  const getProfile = overrides.getPublicUserProfile ?? getPublicUserProfile;

  return new Elysia({ name: "module.users.public-profile", prefix: "/users" })
    .get(
      "/:username",
      async ({ params, status }) => {
        const profile = await getProfile(params.username);

        if (!profile) {
          return status(404, createApiError("NOT_FOUND", "User not found"));
        }

        return UserProfileResponseSchema.parse({
          data: {
            user: {
              id: profile.id,
              username: profile.username,
              displayName: profile.displayName,
              bio: profile.bio,
              createdAt: profile.createdAt.toISOString(),
            },
          },
        });
      },
      { params: UserProfileParamsSchema },
    );
}

export const publicProfileRoutes = createPublicProfileRoutes();
