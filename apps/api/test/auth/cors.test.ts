import {
  describe,
  expect,
  it,
} from "bun:test";
import { Elysia } from "elysia";

import {
  createCorsPlugin,
} from "../../src/shared/http/cors.ts";

function createTestApp() {
  return new Elysia()
    .use(createCorsPlugin())
    .get("/resource", () => ({
      status: "ok",
    }));
}

describe("CORS", () => {
  it("allows the configured frontend origin", async () => {
    const app = createTestApp();

    const response = await app.handle(
      new Request(
        "http://localhost/resource",
        {
          headers: {
            origin:
              "http://localhost:3100",
          },
        },
      ),
    );

    expect(response.status).toBe(200);

    expect(
      response.headers.get(
        "access-control-allow-origin",
      ),
    ).toBe("http://localhost:3100");

    expect(
      response.headers.get(
        "access-control-allow-credentials",
      ),
    ).toBe("true");
  });

  it("does not allow an unknown origin", async () => {
    const app = createTestApp();

    const response = await app.handle(
      new Request(
        "http://localhost/resource",
        {
          headers: {
            origin:
              "https://evil.example",
          },
        },
      ),
    );

    expect(
      response.headers.get(
        "access-control-allow-origin",
      ),
    ).toBeNull();
  });
});