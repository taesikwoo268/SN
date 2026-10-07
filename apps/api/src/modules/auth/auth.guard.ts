import { Elysia } from "elysia";

import { createApiError } from "../../shared/http/api-error.ts";
import {
  clearSessionCookie,
} from "./session-cookie.ts";
import {
  resolveCurrentSession,
} from "./auth.service.ts";

export interface AuthGuardDependencies {
  resolveCurrentSession:
    typeof resolveCurrentSession;
}

const defaultDependencies:
  AuthGuardDependencies = {
    resolveCurrentSession,
  };

export function createAuthGuard(
  overrides: Partial<
    AuthGuardDependencies
  > = {},
) {
  const dependencies = {
    ...defaultDependencies,
    ...overrides,
  };

  return new Elysia({
    name: "module.auth.guard",
  })
    .resolve(
      async ({ cookie, status }) => {
        const sessionCookie =
          cookie.session;

        if (!sessionCookie) {
          return status(
            401,
            createApiError(
              "UNAUTHORIZED",
              "Authentication required",
            ),
          );
        }

        const token = sessionCookie.value;

        if (typeof token !== "string") {
          return status(
            401,
            createApiError(
              "UNAUTHORIZED",
              "Authentication required",
            ),
          );
        }

        const currentSession =
          await dependencies
            .resolveCurrentSession(token);

        if (!currentSession) {
          clearSessionCookie(
            sessionCookie,
          );

          return status(
            401,
            createApiError(
              "UNAUTHORIZED",
              "Authentication required",
            ),
          );
        }

        return {
          currentSession,
          sessionCookie,
        };
      },
    )
    .as("scoped");
}