import { Elysia } from "elysia";
import {
  createApiError,
  InvalidCredentialsError,
} from "../../shared/http/api-error.ts";
import { RegistrationConflictError } from "./auth.errors.ts";
import {
  LoginBodySchema,
  LoginResponseSchema,
  RegisterBodySchema,
  RegisterResponseSchema,
  SessionCookieSchema,
} from "./auth.schema.ts";
import {
  authenticateUser,
  createUserSession,
  registerUser,
} from "./auth.service.ts";
import {
  setSessionCookie,
} from "./session-cookie.ts";

export interface AuthRouteDependencies {
  registerUser: typeof registerUser;
  authenticateUser: typeof authenticateUser;
  createUserSession: typeof createUserSession;
  
}

export function createAuthRoutes(
  dependencies: Partial<AuthRouteDependencies> = {},
) {
  const register =
    dependencies.registerUser ?? registerUser;

  const authenticate =
    dependencies.authenticateUser ??
    authenticateUser;

  const createSession =
    dependencies.createUserSession ??
    createUserSession;

  return new Elysia({
    name: "module.auth",
    prefix: "/auth",
  }).post(
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
              createdAt:
                user.createdAt.toISOString(),
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
  )
    .post(
      "/login",
      async ({
        body,
        cookie,
        request,
        set,
      }) => {
        try {
          const user = await authenticate(body);

          const userAgent =
            request.headers.get("user-agent");

          const session = await createSession(
            user.id,
            userAgent,
          );

          setSessionCookie(
            cookie.session,
            session.token,
            session.expiresAt,
          );

          set.status = 200;
          set.headers["cache-control"] =
            "no-store";

          return LoginResponseSchema.parse({
            data: {
              user: {
                id: user.id,
                username: user.username,
                displayName: user.displayName,
              },
            },
          });
        } catch (error: unknown) {
          if (
            error instanceof
            InvalidCredentialsError
          ) {
            set.status = 401;

            return createApiError(
              "UNAUTHORIZED",
              "Invalid email or password",
            );
          }

          throw error;
        }
      },
      {
        body: LoginBodySchema,
        cookie: SessionCookieSchema,
      },
    );
}

export const authRoutes = createAuthRoutes();
