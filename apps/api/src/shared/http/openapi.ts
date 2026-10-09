import {
  openapi,
} from "@elysia/openapi";
import { z } from "zod";

export function createOpenApiPlugin() {
  return openapi({
    path: "/docs",
    specPath: "/docs/json",

    mapJsonSchema: {
      zod: (schema: z.ZodSchema) =>
        z.toJSONSchema(schema, {
          target: "openapi-3.0",
          io: "input",

          // Một số schema hiện có transform().
          unrepresentable: "any",
        }),
    },

    documentation: {
      info: {
        title:
          "Social Network API",
        description:
          "Social network backend built with Bun, Elysia, Zod and Drizzle ORM.",
        version: "0.1.0",
      },

      servers: [
        {
          url:
            "http://localhost:3100",
          description:
            "Local development API",
        },
      ],

      tags: [
        {
          name: "Health",
          description:
            "Application health checks",
        },
        {
          name: "Auth",
          description:
            "Registration, login and session management",
        },
        {
          name: "Users",
          description:
            "User profiles and discovery",
        },
        {
          name: "Media",
          description:
            "Avatar and media operations",
        },
      ],

      components: {
        securitySchemes: {
          sessionCookie: {
            type: "apiKey",
            in: "cookie",
            name: "session",
            description:
              "HttpOnly session cookie returned by POST /auth/login",
          },
        },
      },
    },
  });
}