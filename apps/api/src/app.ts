import { Elysia } from "elysia";

import { healthRoutes } from "./modules/health/health.routes.ts";
import { createApiError } from "./shared/http/api-error.ts";

export const app = new Elysia({
  name: "social-network.api",
})
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
  .use(healthRoutes);

export type App = typeof app;