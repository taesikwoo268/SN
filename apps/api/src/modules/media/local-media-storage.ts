import {
  dirname,
  isAbsolute,
  relative,
  resolve,
} from "node:path";
import { mkdir } from "node:fs/promises";

import { env } from "../../config/env.ts";
import type {
  ImageMimeType,
} from "./image.types.ts";

const extensionByMimeType: Record<
  ImageMimeType,
  string
> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export interface StoredAvatar {
  key: string;
  size: number;
  contentType: ImageMimeType;
}

function resolveMediaPath(
  key: string,
): string {
  const mediaRoot = resolve(
    env.MEDIA_ROOT,
  );

  const destination = resolve(
    mediaRoot,
    key,
  );

  const relativePath = relative(
    mediaRoot,
    destination,
  );

  if (
    relativePath.startsWith("..") ||
    isAbsolute(relativePath)
  ) {
    throw new Error(
      "Media key escapes storage root",
    );
  }

  return destination;
}

export async function saveLocalAvatar(
  userId: string,
  file: File,
  contentType: ImageMimeType,
): Promise<StoredAvatar> {
  const extension =
    extensionByMimeType[contentType];

  const key = [
    "avatars",
    userId,
    `${crypto.randomUUID()}.${extension}`,
  ].join("/");

  const destination =
    resolveMediaPath(key);

  await mkdir(
    dirname(destination),
    {
      recursive: true,
    },
  );

  await Bun.write(
    destination,
    file,
  );

  return {
    key,
    size: file.size,
    contentType,
  };
}

export async function deleteLocalMedia(
  key: string,
): Promise<void> {
  const path = resolveMediaPath(key);

  await Bun.file(path).delete();
}

export async function findLocalMedia(
  key: string,
): Promise<Blob | null> {
  try {
    const path = resolveMediaPath(key);
    const file = Bun.file(path);

    if (!(await file.exists())) {
      return null;
    }

    return file;
  } catch {
    return null;
  }
}
