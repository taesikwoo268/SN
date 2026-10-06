import { Elysia } from "elysia";

import { createApiError } from "../../shared/http/api-error.ts";
import { RegistrationConflictError } from "./auth.errors.ts";
import {
  RegisterBodySchema,
  RegisterResponseSchema,
} from "./auth.schema.ts";
import { registerUser } from "./auth.service.ts";

export interface AuthRouteDependencies {
  registerUser: typeof registerUser;
}

export function createAuthRoutes({
  registerUser,
}: AuthRouteDependencies) {
  return new Elysia({
    name: "module.auth",
    prefix: "/auth",
  }).post(
    "/register",
    async ({ body, set }) => {
      try {
        const user = await registerUser(body);

        set.status = 201;

        return RegisterResponseSchema.parse({
          data: {
            user: {
              id: user.id,
              username: user.username,
              displayName: user.displayName,
              createdAt: user.createdAt.toISOString(),
            },
          },
        });
      } catch (error: unknown) {
        if (
          error instanceof RegistrationConflictError
        ) {
          set.status = 409;

          const message =
            error.field === "email"
              ? "An account with this email already exists"
              : "This username is already in use";

          return createApiError(
            "CONFLICT",
            message,
          );
        }

        throw error;
      }
    },
    {
      body: RegisterBodySchema,
    },
  );
}

export const authRoutes = createAuthRoutes({
  registerUser,
});
