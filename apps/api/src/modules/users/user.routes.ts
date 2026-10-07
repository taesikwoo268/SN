import { Elysia } from "elysia";

import {
  createApiError,
} from "../../shared/http/api-error.ts";
import {
  UserProfileParamsSchema,
  UserProfileResponseSchema,
} from "./user.schema.ts";
import {
  getPublicUserProfile,
} from "./user.service.ts";

export interface UserRouteDependencies {
  getPublicUserProfile:
    typeof getPublicUserProfile;
}

const defaultDependencies:
  UserRouteDependencies = {
    getPublicUserProfile,
  };

export function createUserRoutes(
  overrides: Partial<
    UserRouteDependencies
  > = {},
) {
  const dependencies = {
    ...defaultDependencies,
    ...overrides,
  };

  return new Elysia({
    name: "module.users",
    prefix: "/users",
  }).get(
    "/:username",
    async ({ params, status }) => {
      const profile =
        await dependencies
          .getPublicUserProfile(
            params.username,
          );

      if (!profile) {
        return status(
          404,
          createApiError(
            "NOT_FOUND",
            "User not found",
          ),
        );
      }

      return UserProfileResponseSchema.parse({
        data: {
          user: {
            id: profile.id,
            username: profile.username,
            displayName:
              profile.displayName,
            bio: profile.bio,
            createdAt:
              profile.createdAt
                .toISOString(),
          },
        },
      });
    },
    {
      params: UserProfileParamsSchema,
    },
  );
}

export const userRoutes =
  createUserRoutes();