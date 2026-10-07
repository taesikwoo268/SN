import {
  findPublicUserProfileByUsername,
} from "./user.repository.ts";

export async function getPublicUserProfile(
  username: string,
) {
  return findPublicUserProfileByUsername(
    username,
  );
}