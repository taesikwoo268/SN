import { SQL } from "bun";
import { drizzle } from "drizzle-orm/bun-sql";

import { env } from "../config/env.ts";

export const sqlClient = new SQL(env.DATABASE_URL);

export const db = drizzle({
  client: sqlClient,
});