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
  SESSION_TTL_SECONDS: z.coerce
  .number()
  .int()
  .positive()
  .max(60 * 60 * 24 * 90)
  .default(60 * 60 * 24 * 30),
  FRONTEND_ORIGIN: z
  .string()
  .url()
  .transform(
    (value) => new URL(value).origin,
  )
  .default("http://localhost:3000"),
  MEDIA_ROOT: z
  .string()
  .min(1)
  .default("./storage"),
  API_ORIGIN: z
  .string()
  .url()
  .transform(
    (value) => new URL(value).origin,
  )
  .default("http://localhost:3100"),
});

export type Environment = z.infer<typeof EnvironmentSchema>;

export const env: Environment = EnvironmentSchema.parse({
  NODE_ENV: Bun.env.NODE_ENV,
  HOST: Bun.env.HOST,
  PORT: Bun.env.PORT,
  LOG_LEVEL: Bun.env.LOG_LEVEL,
  DATABASE_URL: Bun.env.DATABASE_URL,
  SESSION_TTL_SECONDS: Bun.env.SESSION_TTL_SECONDS,
  FRONTEND_ORIGIN: Bun.env.FRONTEND_ORIGIN,
  MEDIA_ROOT: Bun.env.MEDIA_ROOT,
  API_ORIGIN: Bun.env.API_ORIGIN,
});
