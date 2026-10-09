import { Elysia } from "elysia";

import { createApiError } from "../../../shared/http/api-error.ts";
import { createCsrfGuard } from "../../../shared/http/csrf.guard.ts";
import { createAuthGuard } from "../../auth/auth.guard.ts";
import { resolveCurrentSession } from "../../auth/session/session.service.ts";
import { InvalidAvatarFileError } from "./avatar.errors.ts";
import { UserAvatarUploadBodySchema } from "./avatar.schema.ts";
import { uploadUserAvatar } from "./avatar.service.ts";

export interface AvatarRouteDependencies {
  resolveCurrentSession: typeof resolveCurrentSession;
  uploadUserAvatar: typeof uploadUserAvatar;
}

export function createAvatarRoutes(
  overrides: Partial<AvatarRouteDependencies> = {},
) {
  const dependencies: AvatarRouteDependencies = {
    resolveCurrentSession,
    uploadUserAvatar,
    ...overrides,
  };

  return new Elysia({ name: "module.users.avatar", prefix: "/users" })
    .use(createCsrfGuard())
    .use(createAuthGuard({ resolveCurrentSession: dependencies.resolveCurrentSession }))
    .put(
      "/me/avatar",
      async ({ body, currentSession, set }) => {
        try {
          await dependencies.uploadUserAvatar(
            currentSession.user.id,
            body.avatar,
          );

          set.status = 204;
          set.headers["cache-control"] = "no-store";
        } catch (error: unknown) {
          if (error instanceof InvalidAvatarFileError) {
            set.status = 422;
            return createApiError("VALIDATION_ERROR", error.message);
          }

          throw error;
        }
      },
      { parse: "formdata", body: UserAvatarUploadBodySchema },
    );
}

export const avatarRoutes = createAvatarRoutes();
