export const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type ImageMimeType = (typeof IMAGE_MIME_TYPES)[number];
