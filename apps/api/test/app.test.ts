import { describe, expect, it } from "bun:test";
import { z } from "zod";

import { app } from "../src/app.ts";

const HealthResponseSchema = z.object({
  status: z.literal("ok"),
  runtime: z.literal("bun"),
  environment: z.enum(["development", "test", "production"]),
  logLevel: z.enum(["debug", "info", "warn", "error"]),
});

describe("GET /health", () => {
  it("returns the health status", async () => {
    const request = new Request("http://localhost/health");

    const response = await app.handle(request);

    expect(response.status).toBe(200);

    const body = HealthResponseSchema.parse(await response.json());

    expect(body.status).toBe("ok");
    expect(body.runtime).toBe("bun");
  });
});