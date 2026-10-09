import {
  describe,
  expect,
  it,
  mock,
} from "bun:test";
import { Elysia } from "elysia";

import {
  createUserSearchRoutes,
} from "../../src/modules/users/search/user-search.routes.ts";
import {
  UserSearchResponseSchema,
  type UserSearchData,
} from "../../src/modules/users/search/user-search.schema.ts";
import {
  encodeUserSearchCursor,
} from "../../src/modules/users/search/user-search.cursor.ts";
import type {
  searchUsers,
} from "../../src/modules/users/search/user-search.service.ts";

const firstUserId =
  "550e8400-e29b-41d4-a716-446655440000";
const secondUserId =
  "660e8400-e29b-41d4-a716-446655440000";

function createValidationApp(
  searchUsersMock: typeof searchUsers,
) {
  return new Elysia()
    .onError(({ code, set }) => {
      if (code === "VALIDATION") {
        set.status = 422;

        return {
          error: {
            code: "VALIDATION_ERROR",
            message:
              "Request validation failed",
          },
        };
      }
    })
    .use(
      createUserSearchRoutes({
        searchUsers: searchUsersMock,
      }),
    );
}

describe("GET /users/search", () => {
  it("normalizes query options and returns a page", async () => {
    const nextCursor =
      encodeUserSearchCursor({
        username: "alina",
        id: secondUserId,
      });

    const searchUsersMock:
      typeof searchUsers = mock(
        async (data: UserSearchData) => {
          expect(data).toEqual({
            q: "Ali",
            limit: 2,
          });

          return {
            users: [
              {
                id: firstUserId,
                username: "alice",
                displayName: "Alice",
              },
              {
                id: secondUserId,
                username: "alina",
                displayName: "Alina",
              },
            ],
            pageInfo: {
              hasNextPage: true,
              nextCursor,
            },
          };
        },
      );

    const app = new Elysia().use(
      createUserSearchRoutes({
        searchUsers: searchUsersMock,
      }),
    );

    const response = await app.handle(
      new Request(
        "http://localhost/users/search?q=%20Ali%20&limit=2",
      ),
    );

    expect(response.status).toBe(200);

    const payload =
      UserSearchResponseSchema.parse(
        await response.json(),
      );

    expect(payload.data.users).toHaveLength(2);
    expect(payload.data.pageInfo).toEqual({
      hasNextPage: true,
      nextCursor,
    });
  });

  it("decodes a valid cursor before calling the service", async () => {
    const cursor = encodeUserSearchCursor({
      username: "alice",
      id: firstUserId,
    });

    const searchUsersMock:
      typeof searchUsers = mock(
        async (data: UserSearchData) => {
          expect(data.cursor).toEqual({
            username: "alice",
            id: firstUserId,
          });

          return {
            users: [],
            pageInfo: {
              hasNextPage: false,
              nextCursor: null,
            },
          };
        },
      );

    const app = new Elysia().use(
      createUserSearchRoutes({
        searchUsers: searchUsersMock,
      }),
    );

    const response = await app.handle(
      new Request(
        `http://localhost/users/search?q=ali&cursor=${cursor}`,
      ),
    );

    expect(response.status).toBe(200);
    expect(searchUsersMock).toHaveBeenCalledTimes(1);
  });

  it("returns 422 for an invalid cursor", async () => {
    const searchUsersMock:
      typeof searchUsers = mock(
        async (_data: UserSearchData) => {
          throw new Error(
            "Search must not run",
          );
        },
      );

    const response = await createValidationApp(
      searchUsersMock,
    ).handle(
      new Request(
        "http://localhost/users/search?q=ali&cursor=invalid",
      ),
    );

    expect(response.status).toBe(422);
    expect(searchUsersMock).not.toHaveBeenCalled();
  });

  it("returns 422 when q is missing", async () => {
    const searchUsersMock:
      typeof searchUsers = mock(
        async (_data: UserSearchData) => {
          throw new Error(
            "Search must not run",
          );
        },
      );

    const response = await createValidationApp(
      searchUsersMock,
    ).handle(
      new Request(
        "http://localhost/users/search",
      ),
    );

    expect(response.status).toBe(422);
    expect(searchUsersMock).not.toHaveBeenCalled();
  });
});
