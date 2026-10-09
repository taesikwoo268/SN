import { z } from "zod";

import { IMAGE_MIME_TYPES } from "../../media/image.types.ts";

export const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;

export const UserAvatarUploadBodySchema = z.object({
  avatar: z
    .file()
    .min(1, "Avatar file is empty")
    .max(MAX_AVATAR_SIZE_BYTES, "Avatar must not exceed 5 MB")
    .mime([...IMAGE_MIME_TYPES], "Avatar must be JPEG, PNG, or WebP"),
});

export type UserAvatarUploadBody = z.output<typeof UserAvatarUploadBodySchema>;
