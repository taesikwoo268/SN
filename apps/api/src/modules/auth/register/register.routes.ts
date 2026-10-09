import { Elysia } from "elysia";

import { createApiError } from "../../../shared/http/api-error.ts";
import { RegistrationConflictError } from "./register.errors.ts";
import { RegisterBodySchema, RegisterResponseSchema } from "./register.schema.ts";
import { registerUser } from "./register.service.ts";

export interface RegisterRouteDependencies {
  registerUser: typeof registerUser;
}

export function createRegisterRoutes(
  overrides: Partial<RegisterRouteDependencies> = {},
) {
  const register = overrides.registerUser ?? registerUser;

  return new Elysia({ name: "module.auth.register", prefix: "/auth" }).post(
    "/register",
    async ({ body, set }) => {
      try {
        const user = await register(body);
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
        if (error instanceof RegistrationConflictError) {
          set.status = 409;
          const message = error.field === "email"
            ? "An account with this email already exists"
            : "This username is already in use";
          return createApiError("CONFLICT", message);
        }

        throw error;
      }
    },
    { body: RegisterBodySchema },
  );
}

export const registerRoutes = createRegisterRoutes();
