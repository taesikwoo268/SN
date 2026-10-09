import {
  findPublicUserProfileByUsername,
  updateUserProfileById,
} from "./profile.repository.ts";
import type { UpdateUserProfileData } from "./profile.schema.ts";

export async function getPublicUserProfile(username: string) {
  return findPublicUserProfileByUsername(username);
}

export async function updateUserProfile(
  userId: string,
  data: UpdateUserProfileData,
) {
  const profile = await updateUserProfileById(userId, data);

  if (!profile) throw new Error("Authenticated user no longer exists");
  return profile;
}
