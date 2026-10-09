import { Elysia } from "elysia";
import { z } from "zod";

import {
  createApiError,
} from "../../shared/http/api-error.ts";
import {
  findLocalMedia,
} from "./local-media-storage.ts";

const AvatarMediaKeySchema = z
  .string()
  .regex(
    /^avatars\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.(jpg|png|webp)$/i,
  );

export interface MediaRouteDependencies {
  findLocalMedia:
    typeof findLocalMedia;
}

export function createMediaRoutes(
  overrides: Partial<
    MediaRouteDependencies
  > = {},
) {
  const findMedia =
    overrides.findLocalMedia ??
    findLocalMedia;

  return new Elysia({
    name: "module.media",
  }).get(
    "/media/*",
    async ({ params, status }) => {
      const parsedKey =
        AvatarMediaKeySchema.safeParse(
          params["*"],
        );

      if (!parsedKey.success) {
        return status(
          404,
          createApiError(
            "NOT_FOUND",
            "Media not found",
          ),
        );
      }

      const media = await findMedia(
        parsedKey.data,
      );

      if (!media) {
        return status(
          404,
          createApiError(
            "NOT_FOUND",
            "Media not found",
          ),
        );
      }

      return new Response(media, {
        headers: {
          "content-type":
            media.type ||
            "application/octet-stream",

          "content-length":
            media.size.toString(),

          "cache-control":
            "public, max-age=31536000, immutable",

          "x-content-type-options":
            "nosniff",
        },
      });
    },
  );
}

export const mediaRoutes =
  createMediaRoutes();