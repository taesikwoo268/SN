import {
  buildMediaUrl,
} from "../../media/media-url.ts";
import type {
  PublicUserProfileRecord,
} from "./profile.repository.ts";
import type {
  PublicUserProfile,
} from "./profile.schema.ts";

export function presentPublicUserProfile(
  profile: PublicUserProfileRecord,
): PublicUserProfile {
  return {
    id: profile.id,
    username: profile.username,
    displayName: profile.displayName,
    bio: profile.bio,
    avatarUrl:
      buildMediaUrl(profile.avatarKey),
    createdAt:
      profile.createdAt.toISOString(),
  };
}