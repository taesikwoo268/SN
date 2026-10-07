import { Elysia } from "elysia";

import {
    createAuthGuard,
} from "./auth.guard.ts";

import {
    clearSessionCookie,
} from "./session-cookie.ts";

import {
    resolveCurrentSession,
    revokeSession,
} from "./auth.service.ts";

import {
    LoginResponseSchema,
} from "./auth.schema.ts";

import {
    createCsrfGuard,
} from "../../shared/http/csrf.guard.ts";

export interface SessionRouteDependencies {
    resolveCurrentSession:
    typeof resolveCurrentSession;

    revokeSession:
    typeof revokeSession;
}

const defaultDependencies:
    SessionRouteDependencies = {
    resolveCurrentSession,
    revokeSession,
};

export function createSessionRoutes(
    overrides: Partial<
        SessionRouteDependencies
    > = {},
) {
    const dependencies = {
        ...defaultDependencies,
        ...overrides,
    };

    return new Elysia({
        name: "module.auth.session-routes",
        prefix: "/auth",
    })
        .use(createCsrfGuard())
        .use(
            createAuthGuard({
                resolveCurrentSession:
                    dependencies.resolveCurrentSession,
            }),
        )
        .get(
            "/me",
            ({ currentSession, set }) => {
                set.headers["cache-control"] =
                    "no-store";

                return LoginResponseSchema.parse({
                    data: {
                        user: currentSession.user,
                    },
                });
            },
        )
        .post(
            "/logout",
            async ({
                currentSession,
                sessionCookie,
                set,
            }) => {
                await dependencies.revokeSession(
                    currentSession.sessionId,
                );

                clearSessionCookie(
                    sessionCookie,
                );

                set.status = 204;
                set.headers["cache-control"] =
                    "no-store";
            },
        );
}

export const sessionRoutes =
    createSessionRoutes();