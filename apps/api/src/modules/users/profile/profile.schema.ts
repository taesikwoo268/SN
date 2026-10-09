import { z } from "zod";

export const UserProfileParamsSchema = z.object({
  username: z.string().trim().toLowerCase().min(3).max(30).regex(/^[a-z0-9_]+$/),
});

export const PublicUserProfileSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  displayName: z.string(),
  bio: z.string().nullable(),
  avatarUrl: z.string().url().nullable(),
  createdAt: z.string().datetime(),
});

export const UserProfileResponseSchema = z.object({
  data: z.object({ user: PublicUserProfileSchema }),
});

export const UpdateUserProfileBodySchema = z
  .object({
    displayName: z.string().trim().min(1).max(100).optional(),
    bio: z
      .string()
      .trim()
      .max(500)
      .nullable()
      .optional()
      .transform((value) => (value === "" ? null : value)),
  })
  .strict()
  .refine(
    (data) => data.displayName !== undefined || data.bio !== undefined,
    { message: "At least one profile field is required" },
  );

export type UserProfileParams = z.output<typeof UserProfileParamsSchema>;
export type PublicUserProfile = z.output<typeof PublicUserProfileSchema>;
export type UpdateUserProfileData = z.output<typeof UpdateUserProfileBodySchema>;
