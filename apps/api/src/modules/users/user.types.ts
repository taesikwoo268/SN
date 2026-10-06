export interface User {
  id: string;
  username: string;
  displayName: string;
  bio: string | null;
  avatarKey: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicUser {
  id: string;
  username: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
}