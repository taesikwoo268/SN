import { Elysia } from "elysia";

import { env } from "../../config/env.ts";

export const healthRoutes = new Elysia({
  name: "module.health",
}).get("/health", () => ({
  status: "ok" as const,
  runtime: "bun" as const,
  environment: env.NODE_ENV,
  logLevel: env.LOG_LEVEL,
}));