import { Elysia } from "elysia";

import {
  UserSearchQuerySchema,
  UserSearchResponseSchema,
} from "./user-search.schema.ts";
import { searchUsers } from "./user-search.service.ts";

export interface UserSearchRouteDependencies {
  searchUsers: typeof searchUsers;
}

export function createUserSearchRoutes(
  overrides: Partial<UserSearchRouteDependencies> = {},
) {
  const search = overrides.searchUsers ?? searchUsers;

  return new Elysia({ name: "module.users.search", prefix: "/users" }).get(
    "/search",
    async ({ query }) => {
      const result = await search(query);
      return UserSearchResponseSchema.parse({ data: result });
    },
    { query: UserSearchQuerySchema },
  );
}

export const userSearchRoutes = createUserSearchRoutes();
