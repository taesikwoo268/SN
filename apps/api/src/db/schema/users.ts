import { sql } from "drizzle-orm";
import {
  check,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    username: varchar("username", {
      length: 30,
    }).notNull(),

    displayName: varchar("display_name", {
      length: 100,
    }).notNull(),

    bio: text("bio"),

    avatarKey: text("avatar_key"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "date",
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("users_username_unique").on(
      sql`lower(${table.username})`,
    ),

    check(
      "users_username_format_check",
      sql`${table.username} ~ '^[a-zA-Z0-9_]{3,30}$'`,
    ),
  ],
);