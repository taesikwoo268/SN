import { env } from "../../config/env.ts";

export function buildMediaUrl(
  key: string | null,
): string | null {
  if (!key) {
    return null;
  }

  const encodedKey = key
    .split("/")
    .map(encodeURIComponent)
    .join("/");

  return new URL(
    `/media/${encodedKey}`,
    env.API_ORIGIN,
  ).toString();
}