import { z } from "zod";

const EnvironmentSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  HOST: z.string().min(1).default("localhost"),

  PORT: z.coerce
    .number()
    .int()
    .min(1)
    .max(65_535)
    .default(3000),

  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  DATABASE_URL: z.string().url(),
});

export type Environment = z.infer<typeof EnvironmentSchema>;

export const env: Environment = EnvironmentSchema.parse({
  NODE_ENV: Bun.env.NODE_ENV,
  HOST: Bun.env.HOST,
  PORT: Bun.env.PORT,
  LOG_LEVEL: Bun.env.LOG_LEVEL,
  DATABASE_URL: Bun.env.DATABASE_URL,
});
