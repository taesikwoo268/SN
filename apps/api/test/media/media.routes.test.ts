import {
  describe,
  expect,
  it,
  mock,
} from "bun:test";
import { Elysia } from "elysia";

import {
  createMediaRoutes,
} from "../../src/modules/media/media.routes.ts";
import type {
  findLocalMedia,
} from "../../src/modules/media/local-media-storage.ts";

const validKey =
  "avatars/" +
  "550e8400-e29b-41d4-a716-446655440000/" +
  "660e8400-e29b-41d4-a716-446655440000.png";

describe("GET /media/*", () => {
  it("returns media with immutable cache headers", async () => {
    const bytes = new Uint8Array([
      0x89,
      0x50,
      0x4e,
      0x47,
    ]);

    const findLocalMediaMock:
      typeof findLocalMedia = mock(
        async (key: string) => {
          expect(key).toBe(validKey);

          return new File(
            [bytes],
            "avatar.png",
            {
              type: "image/png",
            },
          );
        },
      );

    const app = new Elysia().use(
      createMediaRoutes({
        findLocalMedia:
          findLocalMediaMock,
      }),
    );

    const response = await app.handle(
      new Request(
        `http://localhost/media/${validKey}`,
      ),
    );

    expect(response.status).toBe(200);

    expect(
      response.headers.get(
        "content-type",
      ),
    ).toBe("image/png");

    expect(
      response.headers.get(
        "cache-control",
      ),
    ).toBe(
      "public, max-age=31536000, immutable",
    );

    expect(
      response.headers.get(
        "x-content-type-options",
      ),
    ).toBe("nosniff");

    expect(
      new Uint8Array(
        await response.arrayBuffer(),
      ),
    ).toEqual(bytes);
  });

  it("returns 404 when media does not exist", async () => {
    const findLocalMediaMock:
      typeof findLocalMedia = mock(
        async (_key: string) => null,
      );

    const app = new Elysia().use(
      createMediaRoutes({
        findLocalMedia:
          findLocalMediaMock,
      }),
    );

    const response = await app.handle(
      new Request(
        `http://localhost/media/${validKey}`,
      ),
    );

    expect(response.status).toBe(404);
  });

  it("rejects an invalid media key before accessing storage", async () => {
    const findLocalMediaMock:
      typeof findLocalMedia = mock(
        async (_key: string) => {
          throw new Error(
            "Storage must not run",
          );
        },
      );

    const app = new Elysia().use(
      createMediaRoutes({
        findLocalMedia:
          findLocalMediaMock,
      }),
    );

    const response = await app.handle(
      new Request(
        "http://localhost/media/avatars/not-a-uuid/file.png",
      ),
    );

    expect(response.status).toBe(404);

    expect(
      findLocalMediaMock,
    ).not.toHaveBeenCalled();
  });
});