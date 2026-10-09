export class InvalidAvatarFileError extends Error {
  constructor(message = "Avatar file content is invalid") {
    super(message);
    this.name = "InvalidAvatarFileError";
  }
}
