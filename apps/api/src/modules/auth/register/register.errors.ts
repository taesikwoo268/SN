export class RegistrationConflictError extends Error {
  constructor(public readonly field: "email" | "username") {
    super(`Registration conflict: ${field}`);
    this.name = "RegistrationConflictError";
  }
}
