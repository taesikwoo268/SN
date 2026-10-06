export type RegistrationConflictField =
  | "email"
  | "username";

export class RegistrationConflictError extends Error {
  constructor(
    public readonly field: RegistrationConflictField,
  ) {
    super(`${field} is already in use`);
    this.name = "RegistrationConflictError";
  }
}