import { Elysia } from "elysia";

import { healthRoutes } from "./modules/health/health.routes.ts";
import { createApiError } from "./shared/http/api-error.ts";
import { authRoutes } from "./modules/auth/auth.routes.ts";
import { sessionRoutes } from "./modules/auth/session.routes.ts";
import { createCorsPlugin } from "./shared/http/cors.ts";
import {
  userRoutes,
} from "./modules/users/user.routes.ts";

export const app = new Elysia({
  name: "social-network.api",
})
  .use(createCorsPlugin())
  .onError(({ code, error, set }) => {
    switch (code) {
      case "VALIDATION": {
        set.status = 422;

        return createApiError(
          "VALIDATION_ERROR",
          "Request validation failed",
        );
      }

      case "PARSE": {
        set.status = 400;

        return createApiError(
          "BAD_REQUEST",
          "Request body could not be parsed",
        );
      }

      case "NOT_FOUND": {
        set.status = 404;

        return createApiError(
          "NOT_FOUND",
          "Resource not found",
        );
      }

      default: {
        console.error(error);

        set.status = 500;

        return createApiError(
          "INTERNAL_SERVER_ERROR",
          "An unexpected error occurred",
        );
      }
    }
  })
  .use(healthRoutes)
  .use(authRoutes)
  .use(sessionRoutes)
  .use(userRoutes);

export type App = typeof app;