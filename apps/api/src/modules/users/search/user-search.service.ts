import { encodeUserSearchCursor } from "./user-search.cursor.ts";
import { searchUserRecords } from "./user-search.repository.ts";
import type { UserSearchData } from "./user-search.schema.ts";

export async function searchUsers(data: UserSearchData) {
  const records = await searchUserRecords({
    query: data.q,
    limit: data.limit + 1,
    cursor: data.cursor ?? null,
  });
  const hasNextPage = records.length > data.limit;
  const users = hasNextPage ? records.slice(0, data.limit) : records;
  const lastUser = users.at(-1);

  return {
    users,
    pageInfo: {
      hasNextPage,
      nextCursor: hasNextPage && lastUser
        ? encodeUserSearchCursor({
            username: lastUser.username.toLowerCase(),
            id: lastUser.id,
          })
        : null,
    },
  };
}
