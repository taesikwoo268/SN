import { cors } from "@elysia/cors";

import { env } from "../../config/env.ts";

export function createCorsPlugin() {
  return cors({
    origin: env.FRONTEND_ORIGIN,

    methods: [
      "GET",
      "HEAD",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
    ],

    credentials: true,

    maxAge: 60 * 60,
  });
}