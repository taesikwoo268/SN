import { fileType } from "elysia";

import {
  IMAGE_MIME_TYPES,
  type ImageMimeType,
} from "../../media/image.types.ts";
import {
  deleteLocalMedia,
  saveLocalAvatar,
} from "../../media/local-media-storage.ts";
import { InvalidAvatarFileError } from "./avatar.errors.ts";
import { updateUserAvatarKeyById } from "./avatar.repository.ts";

function isImageMimeType(value: string): value is ImageMimeType {
  return IMAGE_MIME_TYPES.some((mimeType) => mimeType === value);
}

export async function uploadUserAvatar(
  userId: string,
  file: File,
): Promise<void> {
  if (!isImageMimeType(file.type)) {
    throw new InvalidAvatarFileError("Unsupported avatar type");
  }

  if (!(await fileType(file, file.type))) {
    throw new InvalidAvatarFileError(
      "Avatar content does not match its MIME type",
    );
  }

  const storedAvatar = await saveLocalAvatar(userId, file, file.type);

  try {
    const userExists = await updateUserAvatarKeyById(
      userId,
      storedAvatar.key,
    );

    if (!userExists) throw new Error("Authenticated user no longer exists");
  } catch (error: unknown) {
    try {
      await deleteLocalMedia(storedAvatar.key);
    } catch {
      // Preserve the original database error.
    }

    throw error;
  }
}
