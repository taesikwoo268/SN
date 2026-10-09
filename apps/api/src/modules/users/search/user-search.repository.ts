import { and, asc, eq, gt, ilike, or, sql } from "drizzle-orm";

import { db } from "../../../db/client.ts";
import { users } from "../../../db/schema/index.ts";
import type { UserSearchCursor } from "./user-search.cursor.ts";

export interface UserSearchRecord {
  id: string;
  username: string;
  displayName: string;
}

export interface SearchUserRecordsInput {
  query: string;
  limit: number;
  cursor: UserSearchCursor | null;
}

export async function searchUserRecords(
  input: SearchUserRecordsInput,
): Promise<UserSearchRecord[]> {
  const escapedQuery = input.query.replace(/[\\%_]/gu, "\\$&");
  const pattern = `%${escapedQuery}%`;
  const normalizedUsername = sql<string>`lower(${users.username})`;
  const searchCondition = or(
    ilike(users.username, pattern),
    ilike(users.displayName, pattern),
  );
  const cursorCondition = input.cursor
    ? or(
        gt(normalizedUsername, input.cursor.username),
        and(
          eq(normalizedUsername, input.cursor.username),
          gt(users.id, input.cursor.id),
        ),
      )
    : undefined;

  return db
    .select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
    })
    .from(users)
    .where(and(searchCondition, cursorCondition))
    .orderBy(asc(normalizedUsername), asc(users.id))
    .limit(input.limit);
}
