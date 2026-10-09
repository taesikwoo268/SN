import { Elysia } from "elysia";

import { createApiError, InvalidCredentialsError } from "../../../shared/http/api-error.ts";
import { AuthenticatedUserResponseSchema } from "../authenticated-user.schema.ts";
import { setSessionCookie } from "../session/session-cookie.ts";
import { SessionCookieSchema } from "../session/session.schema.ts";
import { createUserSession } from "../session/session.service.ts";
import { LoginBodySchema } from "./login.schema.ts";
import { authenticateUser } from "./login.service.ts";

export interface LoginRouteDependencies {
  authenticateUser: typeof authenticateUser;
  createUserSession: typeof createUserSession;
}

export function createLoginRoutes(
  overrides: Partial<LoginRouteDependencies> = {},
) {
  const authenticate = overrides.authenticateUser ?? authenticateUser;
  const createSession = overrides.createUserSession ?? createUserSession;

  return new Elysia({ name: "module.auth.login", prefix: "/auth" }).post(
    "/login",
    async ({ body, cookie, request, set }) => {
      try {
        const user = await authenticate(body);
        const session = await createSession(
          user.id,
          request.headers.get("user-agent"),
        );

        setSessionCookie(cookie.session, session.token, session.expiresAt);
        set.status = 200;
        set.headers["cache-control"] = "no-store";

        return AuthenticatedUserResponseSchema.parse({ data: { user } });
      } catch (error: unknown) {
        if (error instanceof InvalidCredentialsError) {
          set.status = 401;
          return createApiError("UNAUTHORIZED", "Invalid email or password");
        }

        throw error;
      }
    },
    { body: LoginBodySchema, cookie: SessionCookieSchema },
  );
}

export const loginRoutes = createLoginRoutes();
