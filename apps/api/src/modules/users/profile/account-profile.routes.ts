import { Elysia } from "elysia";

import { createAuthGuard } from "../../auth/auth.guard.ts";
import { resolveCurrentSession } from "../../auth/session/session.service.ts";
import { createCsrfGuard } from "../../../shared/http/csrf.guard.ts";
import {
  UpdateUserProfileBodySchema,
  UserProfileResponseSchema,
} from "./profile.schema.ts";
import { updateUserProfile } from "./profile.service.ts";

export interface AccountProfileRouteDependencies {
  resolveCurrentSession: typeof resolveCurrentSession;
  updateUserProfile: typeof updateUserProfile;
}

export function createAccountProfileRoutes(
  overrides: Partial<AccountProfileRouteDependencies> = {},
) {
  const dependencies: AccountProfileRouteDependencies = {
    resolveCurrentSession,
    updateUserProfile,
    ...overrides,
  };

  return new Elysia({ name: "module.users.account-profile", prefix: "/users" })
    .use(createCsrfGuard())
    .use(createAuthGuard({ resolveCurrentSession: dependencies.resolveCurrentSession }))
    .patch(
      "/me",
      async ({ body, currentSession, set }) => {
        const profile = await dependencies.updateUserProfile(
          currentSession.user.id,
          body,
        );

        set.headers["cache-control"] = "no-store";

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
      { body: UpdateUserProfileBodySchema },
    );
}

export const accountProfileRoutes = createAccountProfileRoutes();
