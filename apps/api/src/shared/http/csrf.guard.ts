import { Elysia } from "elysia";

import { env } from "../../config/env.ts";
import {
  createApiError,
} from "./api-error.ts";

const SAFE_METHODS = new Set([
  "GET",
  "HEAD",
  "OPTIONS",
]);

export function createCsrfGuard(
  allowedOrigin: string =
    env.FRONTEND_ORIGIN,
) {
  return new Elysia({
    name: "shared.http.csrf-guard",
  })
    .onBeforeHandle(
      ({ request, status }) => {
        if (
          SAFE_METHODS.has(request.method)
        ) {
          return;
        }

        const requestOrigin =
          request.headers.get("origin");

        if (
          requestOrigin !== allowedOrigin
        ) {
          return status(
            403,
            createApiError(
              "FORBIDDEN",
              "Request origin is not allowed",
            ),
          );
        }
      },
    )
    .as("scoped");
}